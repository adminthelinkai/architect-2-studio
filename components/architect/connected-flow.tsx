"use client";
import { useState, useEffect } from "react";
import type { Context } from "./workbench";
import type { Project } from "./model";
import { agentSeed } from "./model";
import {
  demoGitAdapter,
  projectFiles,
  projectSnapshot,
} from "./delivery-adapter";
export function approvalChange(p: Project, intent: string): Partial<Project> {
  const requirement =
    "## Publishing approval\nA human reviewer must approve the current change before publishing. Any subsequent edit requires a new review.";
  const agents = p.agents.length
    ? p.agents
    : [agentSeed("Release reviewer", p.framework)];
  return {
    blueprint: p.blueprint.includes("## Publishing approval")
      ? p.blueprint
      : p.blueprint + "\n\n" + requirement,
    agents: agents.map((a, i) =>
      i === agents.length - 1
        ? {
            ...a,
            approval: true,
            instructions: a.instructions.includes("Review the current change")
              ? a.instructions
              : a.instructions +
                "\nReview the current change and request human approval before publishing.",
          }
        : a,
    ),
    delivery: {
      intent,
      before: p.code,
      reviewed: "",
      verified: "",
      commits: p.delivery?.commits || [],
    },
    code: p.code.includes("requiresHumanApproval")
      ? p.code
      : p.code +
        "\n\n// Requirement: publishing approval\nexport const publishPolicy = { requiresHumanApproval: true };\n",
  };
}
export function Lifecycle({ ctx }: { ctx: Context }) {
  const stages = [
    ["Intent", "blueprint"],
    ["Plan", "blueprint"],
    ["Build", "build"],
    ["Inspect", "agents"],
    ["Refine", "build"],
    ["Verify", "review"],
    ["Ship", "release"],
  ];
  return (
    <nav className="lifecycle" aria-label="Product lifecycle">
      {stages.map(([label, route], i) => (
        <button
          key={label}
          aria-current={ctx.page === route ? "step" : undefined}
          onClick={() => ctx.nav(route, ctx.projectId)}
        >
          <span>{i + 1}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}
export function ConnectedContext({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  return (
    <section className="connected-context">
      <div>
        <span className="eyebrow">ONE PROJECT · SHARED CONTEXT</span>
        <h2>
          {p.delivery
            ? "Publishing, with a human in control."
            : "Turn a business decision into a reviewable change."}
        </h2>
        <p>
          {p.delivery?.intent ||
            "Try “Add an approval step before publishing.” Then switch perspectives to inspect the result."}
        </p>
      </div>
      <div className="context-links">
        <button onClick={() => ctx.nav("blueprint", p.id)}>
          Requirement ↗
        </button>
        <button onClick={() => ctx.nav("agents", p.id)}>
          {p.agents.length} agents ↗
        </button>
        <button onClick={() => ctx.nav("review", p.id)}>
          Review changes →
        </button>
      </div>
    </section>
  );
}
export function DeveloperFiles({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const files = projectFiles(p);
  const [file, setFile] = useState("agents/workflow.json");
  return (
    <details className="developer-files" open>
      <summary>Project artifacts · {p.framework}</summary>
      <div className="file-browser">
        <nav aria-label="Project files">
          {Object.keys(files).map((name) => (
            <button
              key={name}
              aria-pressed={file === name}
              onClick={() => setFile(name)}
            >
              {name}
            </button>
          ))}
          <button onClick={() => ctx.setModal("secrets")}>
            Environment settings ↗
          </button>
          <button onClick={() => ctx.nav("review", p.id)}>
            Changes & Git ↗
          </button>
        </nav>
        <div>
          <strong>{file}</strong>
          <pre tabIndex={0}>{files[file]}</pre>
        </div>
      </div>
      <small>
        Generated reference artifacts share your project configuration. Use the
        Code tab to edit application.ts; the sample preview is a separate
        renderer.
      </small>
    </details>
  );
}
export function AgentActivity({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  return (
    <details className="agent-contract">
      <summary>Responsibilities, context & recent activity</summary>
      {p.agents.length ? (
        p.agents.map((a, i) => (
          <article key={a.id}>
            <b>
              {i + 1}. {a.name}
            </b>
            <p>{a.role}</p>
            <dl>
              <dt>Input</dt>
              <dd>
                {i === 0
                  ? "User intent + living blueprint"
                  : "Structured output from the previous agent"}
              </dd>
              <dt>Context</dt>
              <dd>
                {p.name} · {p.framework} · {a.model}
              </dd>
              <dt>Output</dt>
              <dd>
                {i === p.agents.length - 1
                  ? "Draft response → human approval → delivery"
                  : "Classified request and evidence for the next specialist"}
              </dd>
              <dt>Tools</dt>
              <dd>{a.tools.join(", ") || "No tools configured"}</dd>
              <dt>Status</dt>
              <dd>
                {p.delivery
                  ? "Configuration updated; runtime execution unverified"
                  : "Configured; awaiting a runtime connection"}
              </dd>
            </dl>
            <button
              className="btn small-btn"
              onClick={() => {
                ctx.setPayload({ agentId: a.id });
                ctx.setModal("agent");
              }}
            >
              Inspect instructions
            </button>
          </article>
        ))
      ) : (
        <p>No agents yet. Add an agent to define its responsibility.</p>
      )}
      <p>
        {p.delivery
          ? `Latest local build: ${p.delivery.intent} — requirement and approval policy prepared. No external agent run was executed.`
          : "No build activity yet. Start with an intent in Build."}
      </p>
    </details>
  );
}
export function ReviewChanges({ ctx }: { ctx: Context }) {
  const p = ctx.project!,
    d = p.delivery;
  const snapshot = projectSnapshot(p);
  const [message, setMessage] = useState(
    "Add human approval before publishing",
  );
  const [error, setError] = useState("");
  const reviewed = d?.reviewed === snapshot,
    verified = d?.verified === snapshot,
    synced = d?.commits[0]?.snapshot === snapshot;
  const update = (data: Partial<NonNullable<Project["delivery"]>>) =>
    d && ctx.patch({ delivery: { ...d, ...data } });
  const verify = () => {
    if (!d) return;
    if (
      !p.agents.length ||
      !p.agents.every((a) => a.approval) ||
      !p.blueprint.includes("## Publishing approval") ||
      !p.code.includes("requiresHumanApproval: true")
    ) {
      setError(
        "Validation failed: the requirement, code policy and every agent must require approval. Inspect Agents and Blueprint, then retry.",
      );
      return;
    }
    setError("");
    update({ verified: snapshot });
  };
  return (
    <main className="page review-page">
      <span className="eyebrow">INSPECT → VERIFY → SHIP</span>
      <h1>Review one connected change.</h1>
      <p className="muted">
        The business requirement and technical artifacts below belong to{" "}
        {p.name}.
      </p>
      {!d ? (
        <section className="panel">
          <h2>No pending connected change</h2>
          <p>
            Start the approval example in Build to create a requirement, agent
            configuration and source diff.
          </p>
          <button
            className="btn primary"
            onClick={() => ctx.nav("build", p.id)}
          >
            Open Build →
          </button>
        </section>
      ) : (
        <>
          <div className="review-grid">
            <section className="panel">
              <h2>{d.intent}</h2>
              <p>
                Requirement → {p.agents.at(-1)?.name || "Unassigned agent"} →
                publishing policy → approval preview.
              </p>
              <h3>Changed artifacts</h3>
              {Object.entries(projectFiles(p)).map(([name, content]) => (
                <details key={name}>
                  <summary>{name}</summary>
                  {name === "src/application.ts" && (
                    <>
                      <b>Before</b>
                      <pre tabIndex={0}>{d.before}</pre>
                      <b>After</b>
                    </>
                  )}
                  <pre tabIndex={0}>{content}</pre>
                </details>
              ))}
              <label className="review-check">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(e) =>
                    update({ reviewed: e.target.checked ? snapshot : "" })
                  }
                />
                I reviewed the current requirement, agent policy and artifacts.
              </label>
              <button className="btn" onClick={verify}>
                Validate current change
              </button>
              <p role="status">
                {verified
                  ? "Configuration checks passed for this exact change. External runtime tests remain unverified."
                  : "Validation needed. Editing code, intent or agents invalidates previous evidence."}
              </p>
              {error && (
                <p role="alert" className="notice">
                  {error}
                </p>
              )}
            </section>
            <aside className="panel">
              <span className="badge">Git adapter · simulation</span>
              <h2>Review → commit → release</h2>
              <p>
                <b>Repository</b>
                <br />
                {p.repo || "Not connected"}
              </p>
              <p>
                <b>Branch</b> · {p.branch}
              </p>
              <button
                className="btn small-btn"
                onClick={() => ctx.setModal("github")}
              >
                {p.repo ? "Repository settings" : "Connect GitHub"}
              </button>
              <label className="field">
                Commit message
                <input
                  value={message}
                  maxLength={300}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
              <button
                className="btn primary"
                disabled={
                  !reviewed || !verified || !p.repo || !message.trim() || synced
                }
                onClick={() => {
                  try {
                    const commit = demoGitAdapter.commit(p, message.trim());
                    update({ commits: [commit, ...d.commits].slice(0, 100) });
                    setError("");
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Unable to simulate sync.",
                    );
                  }
                }}
              >
                {synced
                  ? "Current change synced in demo"
                  : "Commit & simulate sync"}
              </button>
              <p>
                {synced
                  ? "Recorded locally. No GitHub repository was modified."
                  : "Review and validate before recording this change."}
              </p>
              <button
                className="btn"
                disabled={!synced}
                onClick={() => ctx.nav("release", p.id)}
              >
                Continue to deployment →
              </button>
              <h3>Commit history</h3>
              {d.commits.length ? (
                d.commits.map((c) => (
                  <p key={c.id}>
                    <code>{c.id.slice(0, 8)}</code> {c.message}
                    <small>{new Date(c.date).toLocaleString()}</small>
                  </p>
                ))
              ) : (
                <p>No commits yet.</p>
              )}
            </aside>
          </div>
        </>
      )}
    </main>
  );
}

export function BuildActivity() {
  const stages = [
    "Understanding intent · capture requirement",
    "Preparing plan · identify affected artifacts",
    "Inspecting agents · review responsibility and boundaries",
    "Preparing preview · inspect before shipping",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((n) => Math.min(n + 1, 3)), 400);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="build-progress" role="status">
      <b>Local demo build</b>
      {stages.map((text, i) => (
        <p key={text} className={i <= step ? "stage-done" : "stage-pending"}>
          {i < step ? "✓" : i === step ? "◉" : "○"} {text}
        </p>
      ))}
    </div>
  );
}
