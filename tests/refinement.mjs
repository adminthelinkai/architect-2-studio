import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [],
  requests = [],
  results = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (r.url().includes("/api/workspace")) requests.push(r.method());
});
const check = (name, ok) => {
  if (!ok) throw Error(name);
  results.push(name);
  console.log("PASS", name);
};
const click = (name) => page.getByRole("button", { name, exact: true }).click();
try {
  await page.goto("http://localhost:5173/auth");
  check(
    "Clear product proposition",
    await page
      .getByRole("heading", { name: /Build AI agents and apps/ })
      .isVisible(),
  );
  const landingScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    JSON.stringify(
      landingScan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ),
  );
  check("Accessible landing", landingScan.violations.length === 0);
  await page.screenshot({
    path: "work/qa/refinement-landing.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Try Demo" }).click();
  await page.getByText("ONE PROJECT · SHARED CONTEXT").waitFor();
  check(
    "Guest reaches seeded project without setup",
    page.url().includes("/demo#project/support-copilot/build"),
  );
  await click("Business");
  await page
    .getByLabel("Message your build partner")
    .fill("Draft remains across perspectives");
  await click("Developer");
  check(
    "Mode switch preserves composer state",
    (await page.getByLabel("Message your build partner").inputValue()) ===
      "Draft remains across perspectives",
  );
  check(
    "Developer has a working file browser",
    await page.getByRole("navigation", { name: "Project files" }).isVisible(),
  );
  await click("Add approval before publishing");
  await click("Send message");
  await click("Cancel build");
  await page.waitForTimeout(1900);
  check(
    "Cancelled build applies no approval policy",
    !(await page
      .getByText("Approval required before publishing", { exact: true })
      .isVisible()),
  );
  await page.getByLabel("Simulate next build failure").check();
  await click("Send message");
  await page.getByRole("button", { name: "Retry build" }).waitFor();
  check(
    "Failed build preserves request",
    (await page.getByLabel("Message your build partner").inputValue()).includes(
      "approval",
    ),
  );
  await click("Retry build");
  await page.getByRole("button", { name: "Review this change →" }).waitFor();
  check(
    "Approval requirement reaches preview",
    await page
      .getByText("Approval required before publishing", { exact: true })
      .isVisible(),
  );
  await click("Business");
  check(
    "Business sees the same updated preview",
    await page
      .getByText("Approval required before publishing", { exact: true })
      .isVisible(),
  );
  await page.screenshot({
    path: "work/qa/refinement-business.png",
    fullPage: true,
  });
  await click("Developer");
  await page.screenshot({
    path: "work/qa/refinement-developer.png",
    fullPage: true,
  });
  await click("Review this change →");
  await page
    .getByRole("heading", { name: "Review one connected change." })
    .waitFor();
  check(
    "Commit gated before review",
    await page
      .getByRole("button", { name: "Commit & simulate sync" })
      .isDisabled(),
  );
  await page.getByLabel("I reviewed the current requirement").check();
  await click("Validate current change");
  await page
    .getByText("Configuration checks passed for this exact change.", {
      exact: false,
    })
    .waitFor();
  if (
    await page
      .getByRole("button", { name: "Connect GitHub", exact: true })
      .isVisible()
  ) {
    await click("Connect GitHub");
    await page
      .getByLabel("GitHub repository URL")
      .fill("https://github.com/example/support-copilot");
    await click("Save repository");
  }
  await click("Commit & simulate sync");
  check(
    "Simulated commit stored and sync state shown",
    await page
      .getByRole("button", { name: "Current change synced in demo" })
      .isVisible(),
  );
  await page.screenshot({
    path: "work/qa/refinement-review.png",
    fullPage: true,
  });
  await click("Continue to deployment →");
  check(
    "Release tied to reviewed change",
    await page
      .getByRole("heading", {
        name: "Reviewed change ready for a simulated release",
      })
      .isVisible(),
  );
  await click("New deployment");
  await click("Go to test lab");
  await click("Run all scenarios");
  await page.waitForTimeout(1500);
  await page
    .getByRole("navigation", { name: "Product lifecycle" })
    .getByRole("button", { name: /7\s*Ship/ })
    .click();
  await click("New deployment");
  await click("Deploy simulation");
  await page
    .getByRole("heading", { name: "Staging · release complete" })
    .waitFor();
  check("Connected journey reaches a simulated release", true);
  await click("Open application preview");
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  check(
    "Generated approval artifact reaches editable source",
    (await page.getByLabel("Application code").inputValue()).includes(
      "requiresHumanApproval: true",
    ),
  );
  await page
    .getByRole("navigation", { name: "Product lifecycle" })
    .getByRole("button", { name: /3\s*Build/ })
    .click();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page
    .getByLabel("Application code")
    .fill("export const modified = true;");
  await click("Save code");
  await click("Review changes →");
  check(
    "Edits invalidate review",
    !(await page.getByLabel("I reviewed the current requirement").isChecked()),
  );
  check(
    "Edits invalidate commit eligibility",
    await page
      .getByRole("button", { name: "Commit & simulate sync" })
      .isDisabled(),
  );
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    check(
      `Review fits ${width}px`,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of ["build", "agents", "review", "release"]) {
    await page.evaluate((r) => {
      location.hash = "project/support-copilot/" + r;
    }, route);
    await page.waitForTimeout(300);
    for (const width of [1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      check(
        `${route} fits ${width}px`,
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    check(
      `Accessible ${route}`,
      scan.violations.length === 0 ||
        (console.log(
          JSON.stringify(
            scan.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
          ),
        ),
        false),
    );
  }
  check("Guest never accesses private workspace API", requests.length === 0);
  check(
    "Private API still requires authentication",
    (await page.request.get("http://localhost:5173/api/workspace")).status() ===
      401,
  );
  check("No browser exceptions", errors.length === 0);
  await page.reload();
  await page.waitForTimeout(400);
  await page.evaluate(() => (location.hash = "project/support-copilot/review"));
  await page
    .getByRole("heading", { name: "No pending connected change" })
    .waitFor();
  check("Guest changes reset on reload", true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "work/qa/refinement-mobile.png",
    fullPage: true,
  });
  await fs.writeFile(
    "work/qa/refinement-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
} finally {
  await browser.close();
}
