import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
const results = [],
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = (name, passed) => {
  results.push({ name, passed: !!passed });
  if (!passed) throw new Error(name);
  console.log("PASS", name);
};
const waitSave = async () => {
  await page.waitForTimeout(900);
  await page.getByText("All changes saved", { exact: true }).waitFor();
};
const nav = async (hash) => {
  await page.goto("http://localhost:5173/#" + hash);
  await page.waitForTimeout(350);
};
async function exported(button) {
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: button, exact: true }).click();
  return fs.readFile(await (await event).path(), "utf8");
}
await fs.mkdir("work/qa", { recursive: true });
try {
  await page.goto("http://localhost:5173/auth");
  await page.getByRole("link", { name: "Continue with ChatGPT" }).click();
  await waitSave();
  await page.getByRole("button", { name: "Find your starting point" }).click();
  await page.getByRole("heading", { name: "Build your way" }).waitFor();
  check("Onboarding is discoverable from home", true);
  check(
    "Business path exposes three outcome prompts",
    (await page
      .getByRole("button", { name: "Use this starting point" })
      .count()) === 3,
  );
  await page.screenshot({ path: "work/qa/audit-start.png", fullPage: true });
  await page.getByRole("button", { name: /Technical builder/ }).click();
  await page.getByRole("button", { name: "Open project portability" }).click();
  await page.getByRole("heading", { name: "Project portability" }).waitFor();
  check("Developer starting path reaches real portability", true);
  const file = await exported("Export project JSON");
  const envelope = JSON.parse(file);
  check(
    "Export carries a versioned project contract",
    envelope.format === "architect-project/v1" &&
      envelope.project.agents.length > 0,
  );
  const handoff = await exported("Engineering handoff");
  check(
    "Handoff includes requirements and honest runtime limitations",
    handoff.includes("## Blueprint") &&
      handoff.includes("not a working generated codebase"),
  );
  const before = await (
    await page.request.get("http://localhost:5173/api/workspace")
  ).json();
  const input = page.getByLabel("Import Architect project JSON");
  await input.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("not JSON"),
  });
  check(
    "Invalid JSON is rejected",
    await page
      .getByRole("alert")
      .innerText()
      .then((t) => t.includes("not valid JSON")),
  );
  await input.setInputFiles({
    name: "wrong.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await page
    .getByText(
      "This is not a valid Architect project export. Export one project, not the whole workspace.",
    )
    .waitFor();
  check("Invalid project schema rejected", true);
  check(
    "Invalid import cannot restore",
    await page
      .getByRole("button", { name: "Restore as a new project" })
      .isDisabled(),
  );
  await input.setInputFiles({
    name: "huge.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(550001, 32),
  });
  check(
    "Oversized import rejected",
    await page
      .getByRole("alert")
      .innerText()
      .then((t) => t.includes("under 550 KB")),
  );
  await input.setInputFiles({
    name: "architect-project.json",
    mimeType: "application/json",
    buffer: Buffer.from(file),
  });
  await page
    .getByText(
      "Creates a new draft. Deployment history is cleared and scenarios must be rerun. Existing projects are preserved.",
    )
    .waitFor();
  await page.getByRole("button", { name: "Restore as a new project" }).click();
  await page.getByRole("heading", { name: "Evidence & readiness" }).waitFor();
  await waitSave();
  const after = await (
    await page.request.get("http://localhost:5173/api/workspace")
  ).json();
  const restored = after.state.projects[0];
  check(
    "Import creates one separate saved project",
    after.state.projects.length === before.state.projects.length + 1 &&
      restored.id !== envelope.project.id,
  );
  check(
    "Original project preserved",
    JSON.stringify(
      after.state.projects.find((p) => p.id === envelope.project.id),
    ) ===
      JSON.stringify(
        before.state.projects.find((p) => p.id === envelope.project.id),
      ),
  );
  check(
    "Imported evidence is reset instead of trusted",
    restored.status === "Draft" &&
      restored.deployments.length === 0 &&
      restored.tests.every((t) => t.status === "Not run"),
  );
  check(
    "Blueprint and example code survive round trip",
    restored.blueprint === envelope.project.blueprint &&
      restored.code === envelope.project.code,
  );
  check(
    "Agent IDs are remapped",
    restored.agents.every(
      (a) => !envelope.project.agents.some((x) => x.id === a.id),
    ),
  );
  await page.reload();
  await page.getByRole("heading", { name: "Evidence & readiness" }).waitFor();
  check("Restored draft survives reload", true);
  check(
    "Runtime evidence is explicitly unverified",
    (await page
      .getByText("Unverified · cannot be marked passed here", { exact: true })
      .count()) === 4,
  );
  const ledger = await exported("Export evidence ledger");
  check(
    "Evidence export never claims production approval",
    ledger.includes("Production approval: NOT VERIFIED") &&
      ledger.includes("Runtime evidence: 0/4"),
  );
  await page.screenshot({ path: "work/qa/audit-evidence.png", fullPage: true });
  const findings = [];
  for (const hash of [
    "start",
    "portability",
    "project/" + restored.id + "/readiness",
  ]) {
    await nav(hash);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    findings.push({ hash, violations: scan.violations });
    await fs.writeFile(
      "work/qa/audit-accessibility.json",
      JSON.stringify(findings, null, 2),
    );
    if (scan.violations.length)
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
    check("Accessibility: " + hash, scan.violations.length === 0);
    await page.setViewportSize({ width: 390, height: 844 });
    check(
      "Mobile width: " + hash,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await fs.writeFile(
    "work/qa/audit-accessibility.json",
    JSON.stringify(findings, null, 2),
  );
  check("No new runtime errors", errors.length === 0);
} catch (e) {
  console.error("FAIL", e.message);
  results.push({ name: e.message, passed: false });
  console.log((await page.locator("body").innerText()).slice(-1500));
  await page.screenshot({ path: "work/qa/audit-failure.png", fullPage: true });
} finally {
  await fs.writeFile(
    "work/qa/audit-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  await browser.close();
  if (results.some((r) => !r.passed)) process.exitCode = 1;
}
