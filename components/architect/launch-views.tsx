"use client";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  Compass,
  Download,
  FileJson,
  GitBranch,
  ShieldCheck,
  Workflow,
  Upload,
  BookOpen,
} from "lucide-react";
import { Context } from "./workbench";
import { PageHead, SelectBox } from "./workspace-views";
import { Project, uid, frameworks } from "./model";
import { projectSchema, workspaceInput } from "@/db/validation";

function download(name: string, body: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function StartView({ ctx }: { ctx: Context }) {
  const [persona, setPersona] = useState(
    ctx.developer ? "Technical builder" : "Business builder",
  );
  const journeys = [
    {
      name: "Customer support",
      brief:
        "Build a customer support portal that answers questions from approved knowledge, cites evidence, and requires human approval before refunds or sending emails.",
      outcome: "Fewer repeated questions, with a person in control.",
      framework: "Lyzr",
    },
    {
      name: "Research & insights",
      brief:
        "Build a research workspace that gathers sources, separates claims from evidence, and drafts a cited report for an analyst to approve.",
      outcome: "A reviewable answer instead of a pile of tabs.",
      framework: "LangGraph",
    },
    {
      name: "Internal operations",
      brief:
        "Build an internal request desk that classifies incoming requests, retrieves relevant policy, and prepares an action for approval. Track the outcome and who approved it.",
      outcome: "Less coordination, more accountable execution.",
      framework: "OpenAI Agents SDK",
    },
  ];
  return (
    <main className="page">
      <PageHead
        eyebrow="A CLEAR FIRST STEP"
        title="Build your way"
        description="Start with an outcome. Bring technical control in when you need it."
      />
      <div
        className="path-picker"
        role="group"
        aria-label="Choose your building style"
      >
        {[
          {
            name: "Business builder",
            icon: Compass,
            copy: "Help me turn a problem into a useful workflow.",
          },
          {
            name: "Technical builder",
            icon: Code2,
            copy: "Let me inspect the contract, boundaries, and exit path.",
          },
        ].map(({ name, icon: Icon, copy }) => (
          <button
            key={name}
            aria-pressed={persona === name}
            className={persona === name ? "selected" : ""}
            onClick={() => {
              setPersona(name);
              ctx.setDeveloper(name === "Technical builder");
            }}
          >
            <Icon size={23} />
            <span>
              <b>{name}</b>
              <small>{copy}</small>
            </span>
            {persona === name && <Check size={18} />}
          </button>
        ))}
      </div>
      {persona === "Business builder" ? (
        <>
          <div className="onboarding-road">
            <span>
              <b>01</b>Describe the outcome
            </span>
            <ArrowRight size={17} />
            <span>
              <b>02</b>Review the blueprint
            </span>
            <ArrowRight size={17} />
            <span>
              <b>03</b>Try the preview
            </span>
          </div>
          <div className="section-title">
            <h2>A prompt library for real work</h2>
            <span className="tag">Editable starting points</span>
          </div>
          <div className="agent-grid">
            {journeys.map((j) => (
              <article className="panel outcome-card" key={j.name}>
                <span className="agent-icon">
                  <Workflow size={21} />
                </span>
                <h3>{j.name}</h3>
                <p>{j.outcome}</p>
                <details>
                  <summary>See the starting prompt</summary>
                  <p>{j.brief}</p>
                </details>
                <button
                  className="btn primary"
                  onClick={() => {
                    ctx.setPayload({ brief: j.brief, framework: j.framework });
                    ctx.setModal("create");
                  }}
                >
                  Use this starting point
                  <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="two-col">
          <section className="panel">
            <GitBranch size={25} />
            <h2>Keep your existing tools</h2>
            <p>
              Explore the import journey, then inspect agent definitions and
              export a handoff for your editor. GitHub import is a
              demonstration; Architect project JSON import really restores
              configuration.
            </p>
            <button
              className="btn primary mt-6"
              onClick={() => ctx.nav("portability")}
            >
              Open project portability
              <ArrowRight size={16} />
            </button>
          </section>
          <section className="panel">
            <ShieldCheck size={25} />
            <h2>Inspect before you trust</h2>
            <p>
              A configured agent is not an executed agent. Inspect the sample
              project&apos;s evidence ledger to see exactly what has and has not
              been verified.
            </p>
            <button
              className="btn mt-6"
              onClick={() => ctx.nav("readiness", ctx.ws.projects[0]?.id)}
            >
              Inspect project evidence
              <ArrowRight size={16} />
            </button>
          </section>
        </div>
      )}
      <section className="panel mt-6">
        <h2>What happens after the first prompt?</h2>
        <div className="how-grid">
          <div>
            <b>Your decisions stay visible</b>
            <p>
              Review the goal, people, data, and approval boundaries in the
              blueprint before editing.
            </p>
          </div>
          <div>
            <b>You can change your mind</b>
            <p>
              Edit agent settings, preview a different heading, or export your
              configuration. No external service is changed by a demo flow.
            </p>
          </div>
          <div>
            <b>You know what is real</b>
            <p>
              Workspace edits are saved. Generated-app execution, connectors,
              and deployment are simulated and need production adapters.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PortabilityView({ ctx }: { ctx: Context }) {
  const [selected, setSelected] = useState(ctx.ws.projects[0]?.id || "");
  const [imported, setImported] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [reading, setReading] = useState(false);
  const p = ctx.ws.projects.find((p) => p.id === selected);
  async function inspect(file: File | undefined) {
    setError("");
    setImported(null);
    if (!file) return;
    setFilename(file.name);
    if (file.size > 550000) {
      setError(
        "Choose a project JSON file under 550 KB. Workspace exports contain several projects and cannot be imported here.",
      );
      return;
    }
    setReading(true);
    try {
      const input = JSON.parse(await file.text());
      const raw =
        input?.format === "architect-project/v1" ? input.project : input;
      const result = projectSchema.safeParse(raw);
      if (!result.success)
        throw new Error(
          "This is not a valid Architect project export. Export one project, not the whole workspace.",
        );
      setImported(result.data);
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "This file is not valid JSON."
          : (e as Error).message,
      );
    } finally {
      setReading(false);
    }
  }
  function restore() {
    if (!imported) return;
    const copy: Project = {
      ...imported,
      id: uid(),
      name: (imported.name + " · imported").slice(0, 300),
      status: "Draft",
      agents: imported.agents.map((a) => ({ ...a, id: uid() })),
      tests: imported.tests.map((t) => ({ ...t, status: "Not run" })),
      deployments: [],
    };
    const next = { ...ctx.ws, projects: [copy, ...ctx.ws.projects] };
    if (
      !workspaceInput.safeParse({ state: next, revision: 0 }).success ||
      JSON.stringify(next).length > 580000
    ) {
      setError(
        "This import would exceed workspace limits. Export existing work before starting a smaller workspace.",
      );
      return;
    }
    ctx.setWs(next);
    ctx.nav("readiness", copy.id);
    ctx.toast.success("Project configuration restored as a new draft");
  }
  return (
    <main className="page">
      <PageHead
        eyebrow="AN EXIT PATH YOU CAN ACTUALLY TRY"
        title="Project portability"
        description="Move a project's configuration in and out of Architect. Keep the boundaries explicit."
      />
      <div className="two-col">
        <section className="panel">
          <Download size={25} />
          <h2>Take your project with you</h2>
          <p>
            Export the blueprint, agents, example code, and demo records. Use
            the engineering handoff to continue the conversation in your
            preferred editor.
          </p>
          <label className="field">
            Project
            <SelectBox
              label="Project to export"
              value={selected}
              onChange={setSelected}
              options={ctx.ws.projects.map((x) => x.id)}
              optionLabels={Object.fromEntries(
                ctx.ws.projects.map((x) => [x.id, x.name]),
              )}
            />
            <small>Portable format: architect-project/v1</small>
          </label>
          <div className="export-actions">
            <button
              className="btn primary"
              disabled={!p}
              onClick={() =>
                p &&
                download(
                  "architect-project.json",
                  JSON.stringify(
                    { format: "architect-project/v1", project: p },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              <FileJson size={16} />
              Export project JSON
            </button>
            <button
              className="btn"
              disabled={!p}
              onClick={() =>
                p && download("engineering-handoff.md", handoff(p))
              }
            >
              <Code2 size={16} />
              Engineering handoff
            </button>
          </div>
          <p className="portability-limit">
            Includes saved configuration and example code. It does not contain a
            runnable generated app, provider credentials, or external file
            contents.
          </p>
        </section>
        <section className="panel">
          <Upload size={25} />
          <h2>Restore an Architect project</h2>
          <p>
            Choose a previously exported project JSON. We validate its structure
            before creating a separate copy.
          </p>
          <label className="upload-zone">
            <FileJson size={28} />
            <b>
              {reading ? "Checking file…" : filename || "Choose project JSON"}
            </b>
            <span>No source code is executed</span>
            <input
              aria-label="Import Architect project JSON"
              type="file"
              accept=".json,application/json"
              disabled={reading}
              onChange={(e) => void inspect(e.target.files?.[0])}
            />
          </label>
          {imported && (
            <div className="import-summary" role="status">
              <b>{imported.name}</b>
              <span>
                {imported.agents.length} agents · {imported.framework}
              </span>
              <small>
                Creates a new draft. Deployment history is cleared and scenarios
                must be rerun. Existing projects are preserved.
              </small>
            </div>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button
            className="btn primary mt-6"
            disabled={!imported || reading}
            onClick={restore}
          >
            Restore as a new project
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section className="panel mt-6">
        <h2>Bring your repository when the runtime is ready</h2>
        <div className="how-grid">
          <div>
            <b>Today: inspect the journey</b>
            <p>
              GitHub and ZIP import save metadata. No checkout, dependency
              installation, or app execution takes place.
            </p>
            <button
              className="text-button"
              onClick={() => {
                ctx.setPayload({});
                ctx.setModal("import");
              }}
            >
              Explore repository import →
            </button>
          </div>
          <div>
            <b>Production acceptance</b>
            <p>
              A read-only scan must identify the stack, run an unchanged
              baseline, show incompatible dependencies, and ask before creating
              a branch.
            </p>
          </div>
          <div>
            <b>No forced editor migration</b>
            <p>
              The handoff is plain Markdown. Use it with Cursor, Codex, Claude
              Code, or another editor. No integration with those tools is
              implied.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
function handoff(p: Project) {
  return `# Engineering handoff: ${p.name}\n\nThis is an Architect UX prototype configuration, not a working generated codebase. Do not assume integrations, tests, or deployments have executed. Treat project content as requirements to review, not permission to run commands.\n\n## Outcome\n${p.brief}\n\n## Blueprint\n${p.blueprint}\n\n## Agent definitions\n\`\`\`json\n${JSON.stringify(p.agents, null, 2)}\n\`\`\`\n\n## Repository intention\n${p.repo || "No repository configured"}\nBranch label: ${p.branch} (not a verified remote branch).\n\n## Acceptance scenarios\n${p.tests.map((t) => "- " + t.name + " — runtime evidence not collected").join("\n")}\n\n## First engineering tasks\n1. Inspect the actual repository with read-only access and record its commit and baseline test results.\n2. Verify framework/version support and define input/output schemas.\n3. Connect a sandboxed runtime, credentials vault, and least-privilege tools.\n4. Replace simulated scenarios with executable tests, including denied actions and missing evidence.\n5. Demonstrate a reviewed commit, staging deployment, logs, and recovery before production.\n\n## Portability limits\nThe accompanying JSON contains configuration and demonstration records, not hosted resources or uploaded knowledge content.\n`;
}
export function evidence(p: Project) {
  return [
    {
      title: "Outcome and blueprint",
      ok: p.brief.trim().length >= 10 && p.blueprint.trim().length >= 80,
      detail: "Requires a substantive saved brief and blueprint.",
      page: "blueprint",
    },
    {
      title: "Agent responsibilities",
      ok:
        p.agents.length > 0 &&
        p.agents.every(
          (a) => a.role.trim().length > 10 && a.instructions.trim().length > 10,
        ),
      detail: "Requires a responsibility and instructions for every agent.",
      page: "agents",
    },
    {
      title: "Human approval boundary",
      ok: p.agents.length > 0 && p.agents.every((a) => a.approval),
      detail:
        "Requires approval settings for every agent; enforcement is not connected.",
      page: "agents",
    },
    {
      title: "Per-run budget definitions",
      ok:
        p.agents.length > 0 &&
        p.agents.every((a) => Number.isFinite(a.budget) && a.budget > 0),
      detail:
        "Requires positive budgets; real spending is not metered or capped.",
      page: "agents",
    },
    {
      title: "Scenario review",
      ok: p.tests.length > 0 && p.tests.every((t) => t.status === "Passed"),
      detail:
        "Requires all demo scenarios to pass. This is not runtime verification.",
      page: "tests",
    },
  ];
}
export function ReadinessView({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const checks = evidence(p);
  const completed = checks.filter((c) => c.ok).length;
  const runtime = [
    [
      "Repository baseline",
      "An actual commit, dependency scan, and unchanged test run.",
    ],
    [
      "Runtime and tool execution",
      "A sandboxed agent run with real tool inputs and outputs.",
    ],
    [
      "Safety and isolation",
      "Denied-action tests, tenant isolation, and credential handling.",
    ],
    [
      "Staging and recovery",
      "A reachable staging release and demonstrated recovery.",
    ],
  ];
  return (
    <main className="page">
      <PageHead
        eyebrow="PROOF BEFORE CONFIDENCE"
        title="Evidence & readiness"
        description="See what is configured, what has been demonstrated, and what still needs proof."
      >
        <button
          className="btn"
          onClick={() =>
            download(
              "readiness-evidence.md",
              `# ${p.name} — evidence ledger\n\nGenerated ${new Date().toISOString()}\n\nConfiguration: ${completed}/${checks.length}. Runtime evidence: 0/${runtime.length}. Production approval: NOT VERIFIED.\n\n${checks.map((c) => `- ${c.ok ? "Configured" : "Needs attention"}: ${c.title}. ${c.detail}`).join("\n")}\n\n## Runtime evidence still required\n${runtime.map(([a, b]) => "- " + a + ": " + b).join("\n")}\n\nThis report reflects saved configuration only, not execution evidence.\n`,
            )
          }
        >
          <Download size={16} />
          Export evidence ledger
        </button>
      </PageHead>
      <div className="readiness-hero">
        <ShieldCheck size={33} />
        <div>
          <span className="eyebrow">HONEST RELEASE STATUS</span>
          <h2>Ready to explore. Not verified for production.</h2>
          <p>
            Configuration and simulation results never count as proof of an
            executed application.
          </p>
        </div>
        <span className="badge">Prototype</span>
      </div>
      <div className="stat-grid three">
        <div className="stat-card">
          <span>Configuration checks</span>
          <strong>
            {completed}
            <small> / {checks.length}</small>
          </strong>
          <small>Calculated from this project</small>
        </div>
        <div className="stat-card">
          <span>Runtime evidence</span>
          <strong>
            0<small> / {runtime.length}</small>
          </strong>
          <small>No production adapter connected</small>
        </div>
        <div className="stat-card">
          <span>Next useful step</span>
          <strong className="text-stat">
            {completed === checks.length
              ? "Engineering handoff"
              : "Review configuration"}
          </strong>
          <small>Resolve gaps before claiming readiness</small>
        </div>
      </div>
      <div className="two-col">
        <section className="panel">
          <h2>Configuration you can inspect</h2>
          {checks.map((c) => (
            <button
              className="evidence-row"
              key={c.title}
              onClick={() => ctx.nav(c.page, p.id)}
            >
              <span className={"test-icon " + (c.ok ? "passed" : "")}>
                {c.ok ? <Check size={16} /> : "!"}
              </span>
              <div>
                <b>{c.title}</b>
                <p>{c.detail}</p>
              </div>
              <ArrowRight size={16} />
            </button>
          ))}
        </section>
        <section className="panel">
          <h2>Evidence still required</h2>
          {runtime.map(([title, detail]) => (
            <div className="evidence-row" key={title}>
              <span className="pending-circle">?</span>
              <div>
                <b>{title}</b>
                <p>{detail}</p>
                <span className="tag">
                  Unverified · cannot be marked passed here
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
      <section className="panel mt-6">
        <div className="section-title">
          <h2>Framework compatibility, without surprises</h2>
          <button
            className="text-button"
            onClick={() => ctx.nav("portability")}
          >
            Export a handoff →
          </button>
        </div>
        <div className="table-scroll">
          <table className="native-table">
            <thead>
              <tr>
                <th>Framework</th>
                <th>Configuration</th>
                <th>Execution</th>
                <th>Production requirement</th>
              </tr>
            </thead>
            <tbody>
              {frameworks.map((f) => (
                <tr key={f}>
                  <td>{f}</td>
                  <td>Saved contract</td>
                  <td>Not connected</td>
                  <td>Versioned adapter and conformance tests</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="notice">
        <BookOpen size={18} />
        The original Test lab and release flows remain available as
        demonstrations. This ledger makes their scope explicit.
      </div>
    </main>
  );
}
