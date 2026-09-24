import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1280, height: 600 },
  acceptDownloads: true,
});
const page = await context.newPage();
const results = [],
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = (name, passed) => {
  results.push({ name, passed: !!passed });
  if (!passed) throw Error(name);
  console.log("PASS", name);
};
const saved = async () => {
  await page.waitForTimeout(800);
  await page.getByText("All changes saved", { exact: true }).waitFor();
};
const editName = async (name) => {
  await page.getByLabel("Workspace name", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
};
let failLoad = true,
  failSave = false,
  puts = 0,
  delaySave = false,
  releaseFirst,
  firstStarted;
const started = new Promise((resolve) => {
  firstStarted = resolve;
});
await page.route("**/api/workspace", async (route) => {
  const method = route.request().method();
  if (method === "GET" && failLoad)
    return route.fulfill({
      status: 503,
      json: { error: "Temporary load failure" },
    });
  if (method === "PUT") {
    puts++;
    if (failSave)
      return route.fulfill({
        status: 503,
        json: { error: "Temporary save failure" },
      });
    if (delaySave) {
      delaySave = false;
      const response = await route.fetch();
      firstStarted();
      await new Promise((resolve) => {
        releaseFirst = resolve;
      });
      return route.fulfill({ response });
    }
  }
  return route.continue();
});
try {
  const anonymous = await page.request.get(
    "http://localhost:5173/api/workspace",
    {
      headers: {
        "oai-authenticated-user-id": "spoof",
        "oai-authenticated-user-email": "spoof@example.com",
      },
    },
  );
  check(
    "Anonymous identity-header spoofing is denied by local dispatcher",
    anonymous.status() === 401,
  );
  check(
    "Unauthorized response is not cacheable",
    anonymous.headers()["cache-control"].includes("no-store"),
  );
  await page.goto("http://localhost:5173/auth");
  await page.getByRole("link", { name: "Continue with ChatGPT" }).click();
  await page
    .getByRole("heading", { name: "Your workspace could not be loaded" })
    .waitFor();
  check(
    "Failed initial load gates the editable workspace",
    !(await page
      .getByRole("heading", { name: "What will you build next?" })
      .isVisible()),
  );
  check("Failed load never writes demo data", puts === 0);
  failLoad = false;
  await page
    .getByRole("button", { name: "Retry loading", exact: true })
    .click();
  await saved();
  check("Load retry retrieves saved data without a write", puts === 0);
  const original = await (
    await page.request.get("http://localhost:5173/api/workspace")
  ).json();
  await page.goto("http://localhost:5173/#settings");
  await page.getByLabel("Workspace name", { exact: true }).waitFor();
  failSave = true;
  await editName("Recovery check");
  await page.getByText("Not saved", { exact: true }).waitFor();
  check(
    "Failed save keeps the user edit visible",
    (await page.getByLabel("Workspace name", { exact: true }).inputValue()) ===
      "Recovery check",
  );
  check(
    "Unsaved workspace requests an exit warning",
    await page.evaluate(() => {
      const e = new Event("beforeunload", { cancelable: true });
      return !window.dispatchEvent(e);
    }),
  );
  failSave = false;
  await page.getByRole("button", { name: "Retry save", exact: true }).click();
  await saved();
  check(
    "Save retry persists the pending edit",
    (
      await (
        await page.request.get("http://localhost:5173/api/workspace")
      ).json()
    ).state.settings.name === "Recovery check",
  );
  delaySave = true;
  await editName("First pending edit");
  await started;
  await editName("Newest pending edit");
  releaseFirst();
  await page.waitForTimeout(200);
  check(
    "Old save acknowledgement cannot mark newer edits saved",
    !(await page.getByText("All changes saved", { exact: true }).isVisible()),
  );
  await saved();
  check(
    "Serial save queue preserves the newest edit",
    (
      await (
        await page.request.get("http://localhost:5173/api/workspace")
      ).json()
    ).state.settings.name === "Newest pending edit",
  );
  const concurrent = await (
    await page.request.get("http://localhost:5173/api/workspace")
  ).json();
  concurrent.state.settings.name = "Another tab";
  await page.request.put("http://localhost:5173/api/workspace", {
    data: concurrent,
  });
  await editName("Unsaved local edit");
  await page.getByRole("button", { name: "Export unsaved changes" }).waitFor();
  check(
    "Revision conflict blocks automatic overwrites",
    await page.getByText("Not saved", { exact: true }).isVisible(),
  );
  await page.goto("http://localhost:5173/#project/support-copilot/build");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export unsaved changes" }).click();
  const backup = JSON.parse(
    await fs.readFile(await (await download).path(), "utf8"),
  );
  check(
    "Conflict export includes the whole workspace even inside a project",
    backup.settings.name === "Unsaved local edit" &&
      backup.projects.length >= 3,
  );
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Reload workspace", exact: true })
    .click();
  await saved();
  check(
    "Conflict reload respects the newer server state",
    (
      await (
        await page.request.get("http://localhost:5173/api/workspace")
      ).json()
    ).state.settings.name === "Another tab",
  );
  await page.goto("http://localhost:5173/#settings");
  await page.getByLabel("Workspace name", { exact: true }).waitFor();
  await editName(original.state.settings.name);
  await saved();
  await page.goto("http://localhost:5173/#overview");
  await page
    .getByRole("heading", { name: "What will you build next?" })
    .waitFor();
  for (const height of [600, 768, 900]) {
    await page.setViewportSize({ width: 1280, height });
    const nav = page.getByRole("navigation", { name: "Workspace navigation" });
    const rect = await nav.boundingBox();
    const footer = await page.locator(".studio-sidebar-footer").boundingBox();
    check(
      `Sidebar navigation retains useful height at ${height}px`,
      rect.height >= height - 335 && footer.height <= 160,
    );
    for (const label of [
      "Getting started",
      "Projects",
      "Project portability",
    ]) {
      const button = nav
        .getByRole("button", { name: label, exact: false })
        .first();
      await button.scrollIntoViewIfNeeded();
      const b = await button.boundingBox();
      check(
        `${label} reachable at ${height}px`,
        b.y >= rect.y - 1 && b.y + b.height <= rect.y + rect.height + 1,
      );
    }
    await nav.evaluate((e) => {
      e.scrollTop = 0;
    });
    if (height === 600)
      await page.screenshot({ path: "work/qa/sidebar-600.png" });
  }
  await page.setViewportSize({ width: 390, height: 640 });
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  const mobile = page.getByRole("dialog", { name: "Sidebar" });
  await mobile.waitFor();
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await fs.writeFile(
    "work/qa/sidebar-accessibility.json",
    JSON.stringify(scan.violations, null, 2),
  );
  console.log(
    JSON.stringify(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ),
  );
  check(
    "Open mobile sidebar has no automated accessibility violations",
    scan.violations.length === 0,
  );
  await page.screenshot({ path: "work/qa/sidebar-mobile.png" });
  await mobile
    .getByRole("button", { name: "Getting started", exact: true })
    .click();
  await mobile.waitFor({ state: "hidden" });
  check(
    "Mobile navigation closes after choosing a destination",
    await page.getByRole("heading", { name: "Build your way" }).isVisible(),
  );
  await page.getByRole("button", { name: "Account", exact: true }).click();
  await page.getByRole("link", { name: "Sign out", exact: true }).click();
  await page.getByRole("link", { name: "Continue with ChatGPT" }).waitFor();
  check(
    "Sign-out removes access to the workspace API",
    (await page.request.get("http://localhost:5173/api/workspace")).status() ===
      401,
  );
  check(
    "Recovery and sidebar flows have no runtime exceptions",
    errors.length === 0,
  );
} catch (e) {
  await page.screenshot({
    path: "work/qa/resilience-failure.png",
    fullPage: true,
  });
  console.error(e);
  process.exitCode = 1;
} finally {
  await fs.writeFile(
    "work/qa/resilience-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  await browser.close();
}
