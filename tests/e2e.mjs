import { chromium } from "playwright";
import fs from "node:fs/promises";
await fs.mkdir("./work/qa", { recursive: true });
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
const results = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = (name, ok) => {
  results.push({ name, passed: !!ok });
  if (!ok) throw new Error(name);
  console.log("PASS", name);
};
const waitSave = async () => {
  await page.waitForTimeout(900);
  await page.getByText("All changes saved", { exact: true }).waitFor();
};
const nav = async (path) => {
  await page.goto("http://localhost:5173/#" + path);
  await page.waitForTimeout(300);
};
const dialog = () => page.getByRole("dialog");
try {
  const noauth = await page.request.get("http://localhost:5173/api/workspace");
  check("Anonymous API access denied", noauth.status() === 401);
  await page.goto("http://localhost:5173/auth");
  await page.getByRole("link", { name: "Continue with ChatGPT" }).click();
  await waitSave();
  check(
    "Local platform sign-in and workspace load",
    await page
      .getByRole("heading", { name: "What will you build next?" })
      .isVisible(),
  );
  let seed = await (
    await page.request.get("http://localhost:5173/api/workspace")
  ).json();
  seed.state.projects = seed.state.projects.filter((p) =>
    ["support-copilot", "research-studio", "customer-portal"].includes(p.id),
  );
  seed.state.connections = seed.state.connections.map((c) =>
    c.name === "GitHub" ? { ...c, connected: false } : c,
  );
  seed.state.knowledge = seed.state.knowledge.filter((k) =>
    ["kb1", "kb2", "kb3"].includes(k.id),
  );
  seed.state.members = seed.state.members.slice(0, 1);
  seed.state.approvals = seed.state.approvals.map((a) => ({
    ...a,
    status: "Pending",
  }));
  await page.request.put("http://localhost:5173/api/workspace", { data: seed });
  await page.reload();
  await waitSave();
  seed = await (
    await page.request.get("http://localhost:5173/api/workspace")
  ).json();
  const malformed = await page.request.put(
    "http://localhost:5173/api/workspace",
    { data: { state: {}, revision: 1 } },
  );
  check("Invalid workspace rejected", malformed.status() === 400);
  const conflict = await page.request.put(
    "http://localhost:5173/api/workspace",
    { data: { state: seed.state, revision: seed.revision + 100 } },
  );
  check("Concurrent revision conflict protected", conflict.status() === 409);
  await page
    .getByRole("button", { name: "New project", exact: false })
    .first()
    .click();
  await dialog().getByRole("button", { name: "Create my blueprint" }).click();
  check("Empty brief validation", await page.getByRole("alert").isVisible());
  await page
    .getByLabel("Project name", { exact: true })
    .fill("QA Customer Studio");
  await page
    .getByLabel("What should your app do?")
    .fill(
      "Help customers find relevant answers and escalate sensitive actions to a human.",
    );
  await dialog().getByRole("button", { name: "Create my blueprint" }).click();
  await page.getByRole("heading", { name: "Living blueprint" }).waitFor();
  check("Prompt creates a connected project", true);
  const projectPath = page.url().split("#")[1].replace("/blueprint", "");
  await page
    .getByRole("button", { name: "Edit blueprint", exact: true })
    .click();
  await page
    .getByLabel("Blueprint content")
    .fill(
      "## Outcome\nA carefully designed customer journey.\n\n## Acceptance\nHuman approval before external actions.",
    );
  await page
    .getByRole("button", { name: "Save blueprint", exact: true })
    .click();
  await waitSave();
  await page.reload();
  await page
    .getByText("A carefully designed customer journey.", { exact: true })
    .waitFor();
  check("Blueprint persists after reload", true);
  await nav(projectPath + "/build");
  await page
    .getByLabel("Message your build partner")
    .fill('Change the heading to "Customer happiness, connected"');
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByRole("heading", {
      name: "Customer happiness, connected",
      exact: true,
    })
    .waitFor();
  check("Prompt iteration updates preview heading", true);
  await page
    .getByRole("button", { name: "Create a request", exact: false })
    .click();
  await page.getByLabel("Request title").fill("Onboarding help");
  await dialog().getByRole("button", { name: "Submit request" }).click();
  await waitSave();
  check(
    "Interactive app request saved",
    await page.getByText("Onboarding help", { exact: true }).isVisible(),
  );
  await page.screenshot({
    path: "./work/qa/architect-build.png",
    fullPage: true,
  });
  await nav(projectPath + "/agents");
  await page.getByRole("button", { name: /AGENT 01/ }).click();
  await page
    .getByLabel("Agent name", { exact: true })
    .fill("Customer concierge");
  await page.getByLabel("Require human approval", { exact: true }).click();
  await dialog().getByRole("button", { name: "Save agent" }).click();
  await waitSave();
  check(
    "Agent configuration editable",
    await page.getByRole("heading", { name: "Customer concierge" }).isVisible(),
  );
  await page.screenshot({
    path: "./work/qa/architect-agents.png",
    fullPage: true,
  });
  await nav(projectPath + "/tests");
  await page.getByRole("button", { name: "Run all scenarios" }).click();
  await page.getByText("Failed", { exact: true }).waitFor();
  check("Approval configuration failure detected", true);
  await page
    .getByRole("button", { name: /External action requires approval/ })
    .click();
  await page.getByRole("button", { name: "Enable agent approvals" }).click();
  await page.getByRole("button", { name: "Run all scenarios" }).click();
  await page.waitForTimeout(1600);
  check(
    "Approval remediation passes simulation",
    (await page.getByText("Passed", { exact: true }).count()) === 5,
  );
  await nav(projectPath + "/data");
  await page.getByRole("button", { name: "Add record" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Taylor QA");
  await page.getByLabel("Email", { exact: true }).fill("taylor@example.com");
  await page.getByRole("button", { name: "Create record" }).click();
  await waitSave();
  check(
    "Database demo record saved",
    await page.getByText("taylor@example.com", { exact: true }).isVisible(),
  );
  await nav(projectPath + "/release");
  await page
    .getByRole("button", { name: "Connect GitHub", exact: true })
    .click();
  await page
    .getByLabel("GitHub repository URL")
    .fill("https://github.com/example/customer-studio");
  await page.getByRole("button", { name: "Save repository" }).click();
  await page.getByRole("button", { name: "New deployment" }).click();
  await page.getByLabel("Demonstrate a failed deployment").check();
  await page.getByRole("button", { name: "Deploy simulation" }).click();
  await page.getByText(/Simulated build failure:/).waitFor();
  check("Deployment failure and retry state", true);
  await page.getByLabel("Demonstrate a failed deployment").uncheck();
  await page.getByRole("button", { name: "Deploy simulation" }).click();
  await page
    .getByRole("heading", { name: "Your demo release is ready" })
    .waitFor();
  await page.getByRole("button", { name: "Open application preview" }).click();
  await waitSave();
  await nav(projectPath + "/release");
  check(
    "Release record appears",
    await page.getByRole("button", { name: /Staging · v1/ }).isVisible(),
  );
  await page.screenshot({
    path: "./work/qa/architect-release.png",
    fullPage: true,
  });
  await nav("overview");
  await page
    .getByRole("button", { name: "Import a project", exact: true })
    .click();
  await page.getByLabel("Repository URL", { exact: true }).fill("not-a-url");
  await page.getByRole("button", { name: "Inspect project" }).click();
  check(
    "Import validates repository URL",
    await page
      .getByText("Enter a GitHub repository URL", { exact: true })
      .isVisible(),
  );
  await page
    .getByLabel("Repository URL", { exact: true })
    .fill("https://github.com/example/imported-app");
  await page.getByRole("button", { name: "Inspect project" }).click();
  await page.getByRole("button", { name: "Open imported workspace" }).click();
  await page.getByRole("heading", { name: "Living blueprint" }).waitFor();
  check("Import journey creates project metadata", true);
  await nav("connections");
  await page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "GitHub", exact: true }) })
    .getByRole("button", { name: "Connect", exact: true })
    .click();
  await page.getByRole("button", { name: "Authorize demo connection" }).click();
  check(
    "Connection authorization simulation",
    await page
      .getByRole("article")
      .filter({
        has: page.getByRole("heading", { name: "GitHub", exact: true }),
      })
      .getByRole("button", { name: "Manage", exact: true })
      .isVisible(),
  );
  await nav("knowledge");
  await page
    .getByRole("button", { name: "Add knowledge", exact: true })
    .click();
  await page.getByLabel("Source name").fill("QA handbook");
  await page.getByRole("button", { name: "Add to workspace" }).click();
  check(
    "Knowledge metadata flow",
    await page.getByText("QA handbook", { exact: true }).isVisible(),
  );
  await nav("settings");
  await page.getByRole("tab", { name: "Members" }).click();
  await page.getByRole("button", { name: "Invite member" }).click();
  await page.getByLabel("Email address").fill("reviewer@example.com");
  await page.getByRole("button", { name: "Add demo member" }).click();
  check(
    "Team invitation demo",
    await page.getByText("reviewer@example.com", { exact: true }).isVisible(),
  );
  await nav("activity");
  await page.getByRole("button", { name: "Review & approve" }).first().click();
  await page.getByRole("button", { name: "Approve demo action" }).click();
  check(
    "Human approval inbox",
    (await page.getByText("Approved", { exact: true }).count()) > 0,
  );
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder("Find a project or jump to…").fill("Templates");
  await page.getByRole("option", { name: "Templates", exact: true }).click();
  await page
    .getByRole("heading", { name: "Start a few steps ahead" })
    .waitFor();
  check("Keyboard command navigation", true);
  await page.screenshot({
    path: "./work/qa/architect-templates.png",
    fullPage: true,
  });
  const mobilePaths = [
    "overview",
    "projects",
    "library",
    "templates",
    "connections",
    "knowledge",
    "settings",
    "usage",
    "activity",
    projectPath + "/build",
    projectPath + "/blueprint",
    projectPath + "/agents",
    projectPath + "/data",
    projectPath + "/tests",
    projectPath + "/release",
    projectPath + "/monitor",
  ];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of mobilePaths) {
    await nav(path);
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    );
    check("Mobile width: " + path, fits);
  }
  await nav("overview");
  await page.screenshot({
    path: "./work/qa/architect-mobile.png",
    fullPage: true,
  });
  check("No browser runtime exceptions", errors.length === 0);
} catch (e) {
  console.log("FAIL", e.message);
  console.log((await page.locator("body").innerText()).slice(-2300));
  await page.screenshot({ path: "./work/qa/qa-failure.png", fullPage: true });
  results.push({ name: e.message, passed: false });
} finally {
  await fs.writeFile(
    "./work/qa/qa-results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  await browser.close();
  if (results.some((r) => !r.passed)) process.exitCode = 1;
}
