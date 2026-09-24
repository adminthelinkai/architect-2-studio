import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
await fs.mkdir("work/qa", { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
await page.goto("http://localhost:5173/auth");
await page.getByRole("link", { name: "Continue with ChatGPT" }).click();
await page.waitForTimeout(1400);
const results = [];
for (const path of [
  "overview",
  "templates",
  "projects",
  "library",
  "connections",
  "knowledge",
  "settings",
  "usage",
  "activity",
  "project/support-copilot/blueprint",
  "project/support-copilot/data",
  "project/support-copilot/tests",
  "project/support-copilot/monitor",
  "project/support-copilot/build",
  "project/support-copilot/agents",
  "project/support-copilot/release",
]) {
  await page.goto("http://localhost:5173/#" + path);
  await page.waitForTimeout(250);
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  results.push({
    path,
    violations: r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  console.log(path, JSON.stringify(results.at(-1).violations));
}
await fs.writeFile(
  "work/qa/accessibility.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
if (results.some((r) => r.violations.length)) process.exitCode = 1;
