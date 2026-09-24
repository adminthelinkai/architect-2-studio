"use client";
import { useState, useEffect } from "react";
import {
  ArrowUp,
  Play,
  Plus,
  GitBranch,
  Globe,
  History,
  Code2,
  Monitor,
  Smartphone,
  Check,
  Workflow,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Download,
  Search,
  Settings,
  Maximize2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Context } from "./workbench";
import { PageHead, SelectBox, Empty } from "./workspace-views";
import { ReadinessView } from "./launch-views";
import { uid } from "./model";
export function ProjectView({ ctx }: { ctx: Context }) {
  return ctx.page === "build" ? (
    <Build key={String(ctx.developer)} ctx={ctx} />
  ) : ctx.page === "blueprint" ? (
    <Blueprint ctx={ctx} />
  ) : ctx.page === "agents" ? (
    <Agents ctx={ctx} />
  ) : ctx.page === "data" ? (
    <Data ctx={ctx} />
  ) : ctx.page === "tests" ? (
    <Tests ctx={ctx} />
  ) : ctx.page === "readiness" ? (
    <ReadinessView ctx={ctx} />
  ) : ctx.page === "release" ? (
    <Release ctx={ctx} />
  ) : (
    <Monitoring ctx={ctx} />
  );
}
function Build({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("Build");
  const [tab, setTab] = useState(ctx.developer ? "Code" : "Preview");
  const [phone, setPhone] = useState(false);
  const [focus, setFocus] = useState(false);
  const [code, setCode] = useState(p.code);
  const [busy, setBusy] = useState(false);
  const [terminal, setTerminal] = useState(ctx.developer);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => {
      const title = q.match(/["“]([^"”]+)["”]/)?.[1];
      ctx.patch({
        title: title || p.title,
        history: [
          {
            id: uid(),
            label: "Prompt iteration",
            date: new Date().toISOString(),
            title: title || p.title,
            brief: q,
          },
          ...p.history,
        ],
        messages: [
          ...p.messages,
          { role: "user", text: q },
          {
            role: "assistant",
            text: title
              ? `Updated the preview heading to “${title}”. A snapshot is saved in history.`
              : 'Your request is captured in a new snapshot. This prototype demonstrates the build journey; the sample layout remains unchanged. Try: Change the heading to "Customer happiness, connected".',
          },
        ],
      });
      setQ("");
      setBusy(false);
    }, 1800);
    return () => clearTimeout(timer);
    // Capture this simulation request once; cancel on unmount or explicit stop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);
  const send = () => {
    if (!q.trim()) return;
    if (mode === "Build") setBusy(true);
    else {
      ctx.patch({
        ...(mode === "Plan"
          ? { blueprint: p.blueprint + "\n\n## Planned refinement\n" + q }
          : {}),
        messages: [
          ...p.messages,
          { role: "user", text: q },
          {
            role: "assistant",
            text:
              mode === "Plan"
                ? "Added your refinement to the living blueprint. Open Blueprint to review before building."
                : `This project uses ${p.framework} with ${p.agents.length} agents. Configure behavior in Agents, validate approval rules in Test lab, then explore a release. This response is a guided demo.`,
          },
        ],
      });
      setQ("");
    }
  };
  return (
    <div className={"build-workspace " + (focus ? "focused" : "")}>
      <div className="build-toolbar">
        <span className="badge">
          <span className="status-dot green" />
          Development sandbox
        </span>
        <div>
          <button
            className="btn small-btn"
            onClick={() => ctx.setModal("history")}
          >
            <History size={15} />
            History
          </button>
          <button
            className="btn small-btn"
            onClick={() => ctx.setModal("share")}
          >
            Share
          </button>
          <button
            className="btn primary small-btn"
            onClick={() => ctx.nav("release", p.id)}
          >
            <Globe size={15} />
            Publish
          </button>
        </div>
      </div>
      <div className="build-columns">
        <aside className="build-chat">
          <div className="chat-heading">
            <span className="agent-icon">✦</span>
            <div>
              <b>Your build partner</b>
              <small>From intent to implementation</small>
            </div>
          </div>
          <div className="chat-messages">
            {p.messages.map((m, i) => (
              <div className={"chat-message " + m.role} key={i}>
                {m.role === "assistant" && (
                  <span className="eyebrow">ARCHITECT</span>
                )}
                <p>{m.text}</p>
              </div>
            ))}
            {busy && (
              <div className="build-progress">
                <i className="pulse" />
                Applying your preview change…
                <small>
                  Reviewing intent → preparing snapshot → updating preview
                </small>
              </div>
            )}
          </div>
          <div className="chat-suggestions">
            <button onClick={() => ctx.nav("blueprint", p.id)}>
              Review blueprint
            </button>
            <button
              onClick={() =>
                setQ('Change the heading to "Support, beautifully simple"')
              }
            >
              Refine the heading
            </button>
          </div>
          <div className="chat-composer">
            <textarea
              aria-label="Message your build partner"
              placeholder="What would you like to change?"
              value={q}
              disabled={busy}
              onChange={(e) => setQ(e.target.value)}
            />
            <div>
              <SelectBox
                label="Build mode"
                value={mode}
                onChange={setMode}
                options={["Build", "Plan", "Ask"]}
              />
              <button
                className="send-button"
                aria-label={busy ? "Cancel build" : "Send message"}
                onClick={() => (busy ? setBusy(false) : send())}
              >
                {busy ? "■" : <ArrowUp size={18} />}
              </button>
            </div>
          </div>
          <small className="chat-disclaimer">
            Simulated generation · Your configuration is saved
          </small>
        </aside>
        <section className="preview-pane">
          <div className="preview-toolbar">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger aria-controls={undefined} value="Preview">
                  <Monitor size={14} />
                  Preview
                </TabsTrigger>
                <TabsTrigger aria-controls={undefined} value="Code">
                  <Code2 size={14} />
                  Code
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div>
              <button
                className={phone ? "active" : ""}
                aria-label="Toggle mobile preview"
                onClick={() => setPhone(!phone)}
              >
                <Smartphone size={17} />
              </button>
              <button
                aria-label="Toggle focused preview"
                onClick={() => setFocus(!focus)}
              >
                <Maximize2 size={17} />
              </button>
              <button
                className="btn small-btn"
                onClick={() => ctx.setModal("visual")}
              >
                Edit design
              </button>
            </div>
          </div>
          {tab === "Code" ? (
            <div className="code-workspace">
              <div>
                <span>src/application.ts · editable example</span>
                <button
                  className="btn small-btn"
                  onClick={() => {
                    ctx.patch({ code });
                    ctx.toast.success("Example code saved");
                  }}
                >
                  Save code
                </button>
              </div>
              <textarea
                aria-label="Application code"
                spellCheck={false}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p>
                Saved as project configuration. This example is not executed by
                the preview.
              </p>
            </div>
          ) : (
            <div className={"preview-canvas " + (phone ? "phone" : "")}>
              <div className="preview-address">
                <span className="status-dot green" />
                preview.architect / {p.name.toLowerCase().replaceAll(" ", "-")}
                <span>Interactive sample</span>
              </div>
              <SampleApp ctx={ctx} />
            </div>
          )}
          <button
            className="terminal-toggle"
            onClick={() => setTerminal(!terminal)}
          >
            <Code2 size={14} />
            {terminal ? "Hide" : "Show"} runtime log <span>Sample session</span>
          </button>
          {terminal && (
            <pre className="terminal">
              [demo] Workspace initialized{`\n`}[demo] {p.agents.length} agent
              definitions loaded{`\n`}[demo] Preview ready · no external runtime
              connected
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
function SampleApp({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const [tab, setTab] = useState("Overview");
  const [q, setQ] = useState("");
  return (
    <div
      className="sample-app"
      style={{ "--app-accent": p.color } as React.CSSProperties}
    >
      <nav>
        <strong>
          <span className="sample-logo">a</span>atlas
        </strong>
        <div>
          {["Overview", "Requests", "Knowledge"].map((t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <span className="avatar small">AM</span>
      </nav>
      <div className="sample-body">
        <span className="eyebrow">YOUR CUSTOMER EXPERIENCE, CONNECTED</span>
        <h1>{tab === "Overview" ? p.title : tab}</h1>
        <p>A little more clarity. A lot less busywork.</p>
        {tab === "Overview" ? (
          <>
            <div className="sample-welcome">
              <div>
                <span className="eyebrow">EVERY CONVERSATION MATTERS</span>
                <h2>
                  Make room for the
                  <br />
                  work that matters.
                </h2>
                <p>Your agents have the everyday covered.</p>
                <button onClick={() => ctx.setModal("request")}>
                  Create a request <ArrowRight size={15} />
                </button>
              </div>
              <div className="orbit-art">
                <i />
                <i />
                <i />
                <span>✦</span>
              </div>
            </div>
            <div className="sample-stats">
              {[
                ["128", "Requests resolved"],
                ["94%", "Customer happiness"],
                ["1.2s", "Average response"],
              ].map(([a, b]) => (
                <div key={b}>
                  <strong>{a}</strong>
                  <small>{b} · sample</small>
                </div>
              ))}
            </div>
            <div className="section-title">
              <h3>Recent conversations</h3>
              <button onClick={() => setTab("Requests")}>View all →</button>
            </div>
            {[
              "Getting started with your workspace",
              "A question about my subscription",
              ...p.notes.slice(-2),
            ].map((n, i) => (
              <button
                className="sample-request"
                key={i}
                onClick={() => {
                  ctx.setPayload({ name: n });
                  ctx.setModal("request-detail");
                }}
              >
                <span className="avatar small">{i % 2 ? "JC" : "AM"}</span>
                <div>
                  <b>{n}</b>
                  <small>
                    {i % 2 ? "Jamie Chen" : "Alex Morgan"} · Just now
                  </small>
                </div>
                <span className="badge success">
                  {i % 2 ? "In review" : "Resolved"}
                </span>
              </button>
            ))}
          </>
        ) : tab === "Requests" ? (
          <>
            <div className="filterbar">
              <div className="search-field">
                <Search size={16} />
                <input
                  aria-label="Search requests"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Find a request"
                />
              </div>
              <button
                className="btn primary"
                onClick={() => ctx.setModal("request")}
              >
                New request
              </button>
            </div>
            {p.notes
              .filter((n) => n.toLowerCase().includes(q.toLowerCase()))
              .map((n, i) => (
                <div className="activity-row" key={i}>
                  <BookOpen size={16} />
                  {n}
                  <span className="badge">Received</span>
                </div>
              ))}
            {!p.notes.length && (
              <Empty
                title="Your next conversation starts here"
                text="Create a request to try this application's user journey."
              />
            )}
          </>
        ) : (
          ctx.ws.knowledge.map((k) => (
            <button
              className="sample-request"
              key={k.id}
              onClick={() => {
                ctx.setPayload(k);
                ctx.setModal("retrieval");
              }}
            >
              <BookOpen size={20} />
              <div>
                <b>{k.name}</b>
                <small>{k.type} · Ready</small>
              </div>
              <ArrowRight size={17} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
function Blueprint({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(p.blueprint);
  return (
    <main className="page">
      <PageHead
        eyebrow="INTENT, CONNECTED TO IMPLEMENTATION"
        title="Living blueprint"
        description="One shared understanding of what you are building, and why."
      >
        <button
          className="btn"
          onClick={() =>
            edit
              ? (ctx.patch({ blueprint: value }),
                setEdit(false),
                ctx.toast.success("Blueprint saved"))
              : setEdit(true)
          }
        >
          {edit ? "Save blueprint" : "Edit blueprint"}
        </button>
        <button className="btn primary" onClick={() => ctx.setModal("impact")}>
          Review & build <ArrowRight size={16} />
        </button>
      </PageHead>
      <div className="blueprint-layout">
        <article className="blueprint-document">
          <div className="document-meta">
            <span className="badge success">Ready for review</span>
            <span>
              Version {p.history.length} · {p.framework}
            </span>
          </div>
          {edit ? (
            <textarea
              aria-label="Blueprint content"
              className="blueprint-editor"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            p.blueprint
              .split("\n")
              .map((l, i) =>
                l.startsWith("## ") ? (
                  <h2 key={i}>{l.slice(3)}</h2>
                ) : (
                  <p key={i}>{l}</p>
                ),
              )
          )}
        </article>
        <aside className="blueprint-aside">
          <section className="panel">
            <span className="eyebrow">CONNECTED TO YOUR PLAN</span>
            {[
              ["agents", `${p.agents.length} specialist agents`],
              ["build", "Interactive application preview"],
              ["tests", `${p.tests.length} acceptance scenarios`],
              ["data", "Data & access policies"],
            ].map(([id, label]) => (
              <button
                className="linked-row"
                key={id}
                onClick={() => ctx.nav(id, p.id)}
              >
                <Workflow size={17} />
                {label}
                <ArrowRight size={15} />
              </button>
            ))}
          </section>
          <section className="panel">
            <ShieldCheck size={22} />
            <h3>Your autonomy boundary</h3>
            <p className="muted">
              Agents can research and draft. You approve external actions.
            </p>
            <button
              className="text-button"
              onClick={() => ctx.setModal("boundaries")}
            >
              Adjust boundaries →
            </button>
          </section>
          <div className="notice">
            Blueprint edits are saved as intent. Review changes before
            simulating a build.
          </div>
        </aside>
      </div>
    </main>
  );
}
function Agents({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const [tab, setTab] = useState("Canvas");
  const [zoom, setZoom] = useState(100);
  return (
    <main className="page">
      <PageHead
        eyebrow="SPECIALISTS, WORKING TOGETHER"
        title="Agents & workflows"
        description="Give every agent a purpose, the right tools, and clear boundaries."
      >
        <button className="btn" onClick={() => ctx.setModal("simulate")}>
          <Play size={15} />
          Simulate a run
        </button>
        <button
          className="btn primary"
          onClick={() => {
            ctx.setPayload({});
            ctx.setModal("new-agent");
          }}
        >
          <Plus size={16} />
          Add agent
        </button>
      </PageHead>
      <div className="filterbar">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {["Canvas", "List", "Contract"].map((s) => (
              <TabsTrigger aria-controls={undefined} key={s} value={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <button
          className="btn small-btn"
          onClick={() => ctx.setModal("boundaries")}
        >
          <ShieldCheck size={15} />
          Autonomy boundaries
        </button>
      </div>
      {tab === "Canvas" ? (
        <div className="workflow-canvas">
          <div className="canvas-caption">
            <span className="badge">{p.framework} · Configuration preview</span>
            <div>
              <button
                aria-label="Zoom out"
                onClick={() => setZoom(Math.max(60, zoom - 10))}
              >
                −
              </button>
              <span>{zoom}%</span>
              <button
                aria-label="Zoom in"
                onClick={() => setZoom(Math.min(120, zoom + 10))}
              >
                +
              </button>
            </div>
          </div>
          <div className="workflow-stack" style={{ zoom: zoom / 100 }}>
            <div className="trigger-node">
              <span className="status-dot green" />
              New customer request
            </div>
            <i className="flow-line" />
            {p.agents.map((a, i) => (
              <div className="node-wrap" key={a.id}>
                <button
                  className="workflow-node"
                  onClick={() => {
                    ctx.setPayload({ agentId: a.id });
                    ctx.setModal("agent");
                  }}
                >
                  <span className="agent-icon">
                    <Workflow size={22} />
                  </span>
                  <div>
                    <small>
                      AGENT 0{i + 1} · {a.framework}
                    </small>
                    <h3>{a.name}</h3>
                    <p>{a.role}</p>
                    <footer>
                      <span>{a.tools.length} tools</span>
                      <span>
                        {a.approval ? "Approval protected" : "Autonomous"}
                      </span>
                    </footer>
                  </div>
                  <Settings size={15} />
                </button>
                <i className="flow-line" />
              </div>
            ))}
            <button
              className="gate-node"
              onClick={() => ctx.setModal("boundaries")}
            >
              <ShieldCheck size={17} />
              Human approval for external actions
            </button>
            <i className="flow-line" />
            <div className="trigger-node">
              <Check size={16} />
              Response delivered
            </div>
          </div>
          <button
            className="canvas-add btn"
            onClick={() => ctx.setModal("workflow-step")}
          >
            <Plus size={15} />
            Add workflow step
          </button>
        </div>
      ) : tab === "List" ? (
        <div className="agent-grid">
          {p.agents.map((a) => (
            <button
              className="agent-card"
              key={a.id}
              onClick={() => {
                ctx.setPayload({ agentId: a.id });
                ctx.setModal("agent");
              }}
            >
              <span className="agent-icon">
                <Workflow size={24} />
              </span>
              <h3>{a.name}</h3>
              <p>{a.role}</p>
              <span className="tag">{a.framework}</span>
              <footer>
                {a.tools.length} tools · ${a.budget} run budget{" "}
                <ArrowRight size={16} />
              </footer>
            </button>
          ))}
        </div>
      ) : (
        <section className="panel">
          <div className="section-title">
            <h2>Portable agent contract</h2>
            <button className="btn" onClick={ctx.exportProject}>
              <Download size={16} />
              Export project
            </button>
          </div>
          <p className="muted">
            Framework-neutral definitions, ready for an adapter. Export does not
            create a running service.
          </p>
          <pre className="code-block">
            {JSON.stringify(
              { version: "1.0", runtime: p.framework, agents: p.agents },
              null,
              2,
            )}
          </pre>
        </section>
      )}
    </main>
  );
}
function Data({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const [tab, setTab] = useState("Database");
  return (
    <main className="page">
      <PageHead
        eyebrow="A FOUNDATION FOR YOUR APPLICATION"
        title="Data & identity"
        description="Manage the information your app uses, and who can access it."
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {["Database", "Authentication", "Storage", "Secrets"].map((s) => (
            <TabsTrigger aria-controls={undefined} key={s} value={s}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <section className="panel mt-6">
        {tab === "Database" ? (
          <>
            <div className="section-title">
              <div>
                <h2>
                  Users <span className="count-badge">{p.records.length}</span>
                </h2>
                <p className="muted">
                  Demo application records · saved in your workspace
                </p>
              </div>
              <button
                className="btn primary"
                onClick={() => ctx.setModal("record")}
              >
                <Plus size={16} />
                Add record
              </button>
            </div>
            <div className="table-scroll">
              <table className="native-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {p.records.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>
                        <span className="tag">{r.role}</span>
                      </td>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => {
                            ctx.setPayload({ type: "record", ...r });
                            ctx.setModal("delete");
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="notice">
              Workspace persistence is real. These records model your future
              application&apos;s database; they do not create login accounts.
            </div>
          </>
        ) : tab === "Authentication" ? (
          <>
            <div className="setting-row">
              <div>
                <h2>Application authentication</h2>
                <p>Prototype the sign-in experience for your users.</p>
              </div>
              <Switch
                aria-label="Application authentication"
                checked={p.auth}
                onCheckedChange={(auth) => ctx.patch({ auth })}
              />
            </div>
            {[
              "Email & password",
              "Google OAuth",
              "GitHub OAuth",
              "Enterprise SSO",
            ].map((s, i) => (
              <div className="setting-row" key={s}>
                <div>
                  <b>{s}</b>
                  <p>
                    {i === 0
                      ? "Email verification and password recovery"
                      : "Provider connection required for production"}
                  </p>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    ctx.setPayload({ name: s });
                    ctx.setModal("auth-provider");
                  }}
                >
                  Configure
                </button>
              </div>
            ))}
            <div className="notice">
              Provider settings are a demo. Architect itself uses the hosting
              platform&apos;s authenticated account.
            </div>
          </>
        ) : tab === "Storage" ? (
          <Empty
            title="A place for every asset"
            text="Try the upload journey. This prototype stores file metadata, not file contents."
          >
            <button
              className="btn primary"
              onClick={() => ctx.setModal("reference")}
            >
              Upload an asset
            </button>
          </Empty>
        ) : (
          <>
            <h2>Environment variables</h2>
            <p className="muted">
              Explore environment-scoped configuration. Use placeholder values
              only.
            </p>
            <div className="activity-row">
              <Code2 size={18} />
              <b>MODEL_API_KEY</b>
              <span className="tag">Not configured</span>
            </div>
            <button className="btn" onClick={() => ctx.setModal("secrets")}>
              <Plus size={16} />
              Add variable definition
            </button>
            <div className="notice">
              A secure production secret store is not connected. Do not enter
              real credentials.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
function Tests({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => {
      ctx.patch({
        tests: p.tests.map((t, i) => ({
          ...t,
          status:
            i === 2 && !p.agents.every((a) => a.approval) ? "Failed" : "Passed",
        })),
      });
      setBusy(false);
      ctx.toast.success("Configuration simulation completed");
    }, 1300);
    return () => clearTimeout(timer);
    // Capture this simulation request once; cancel on unmount or explicit stop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);
  const passed = p.tests.filter((t) => t.status === "Passed").length;
  return (
    <main className="page">
      <PageHead
        eyebrow="CONFIDENCE BEFORE RELEASE"
        title="Test lab"
        description="Turn your intentions into observable, repeatable scenarios."
      >
        <button className="btn" onClick={() => ctx.setModal("test-new")}>
          <Plus size={16} />
          Add scenario
        </button>
        <button
          className="btn primary"
          disabled={busy}
          onClick={() => setBusy(true)}
        >
          <Play size={16} />
          {busy ? "Running simulation…" : "Run all scenarios"}
        </button>
      </PageHead>
      <div className="stat-grid three">
        <div className="stat-card">
          <span>Scenario coverage</span>
          <strong>{p.tests.length}</strong>
          <small>Connected to your blueprint</small>
        </div>
        <div className="stat-card">
          <span>Passing simulations</span>
          <strong>
            {passed}
            <small> / {p.tests.length}</small>
          </strong>
          <small>Configuration checks and sample results</small>
        </div>
        <div className="stat-card">
          <span>Human oversight</span>
          <strong className="text-stat">
            {p.agents.every((a) => a.approval) ? "Protected" : "Needs review"}
          </strong>
          <small>Approval boundary configuration</small>
        </div>
      </div>
      <section className="panel">
        <div className="section-title">
          <h2>Acceptance scenarios</h2>
          <span className="tag">Sandbox · simulated</span>
        </div>
        {p.tests.map((t, i) => (
          <button
            className="test-row"
            key={i}
            onClick={() => {
              ctx.setPayload({ ...t, index: i });
              ctx.setModal("test-result");
            }}
          >
            <span
              className={"test-icon " + (t.status === "Passed" ? "passed" : "")}
            >
              {t.status === "Passed" ? <Check size={18} /> : i + 1}
            </span>
            <div>
              <b>{t.name}</b>
              <small>
                {i === 2
                  ? "Live configuration assertion"
                  : "Illustrative scenario result; runtime adapter required"}
              </small>
            </div>
            <span
              className={
                "badge " +
                (t.status === "Passed"
                  ? "success"
                  : t.status === "Failed"
                    ? "danger"
                    : "")
              }
            >
              {busy ? "Running" : t.status}
            </span>
            <ArrowRight size={16} />
          </button>
        ))}
      </section>
      <div className="notice">
        <ShieldCheck size={20} />
        Only the approval-boundary check evaluates real configuration. Other
        scenarios demonstrate results and must be replaced with execution tests
        before production.
      </div>
    </main>
  );
}
function Release({ ctx }: { ctx: Context }) {
  const p = ctx.project!;
  const ready = p.tests.every((t) => t.status === "Passed");
  return (
    <main className="page">
      <PageHead
        eyebrow="FROM YOUR WORKSPACE TO THE WORLD"
        title="Release with confidence"
        description="Review what changed, verify the important things, and choose your destination."
      >
        <button className="btn" onClick={ctx.exportProject}>
          <Download size={16} />
          Export
        </button>
        <button className="btn primary" onClick={() => ctx.setModal("deploy")}>
          <Globe size={16} />
          New deployment
        </button>
      </PageHead>
      <div className="release-evidence-callout">
        <ShieldCheck size={20} />
        <span>
          <b>Configuration is not production evidence.</b> Inspect runtime gaps
          before making a release decision.
        </span>
        <button
          className="text-button"
          onClick={() => ctx.nav("readiness", p.id)}
        >
          Open evidence ledger →
        </button>
      </div>
      <div className="two-col">
        <section className="panel">
          <div className="section-title">
            <h2>
              <GitBranch size={19} />
              Source control
            </h2>
            <span className="tag">Demo integration</span>
          </div>
          <h3>{p.repo || "Connect your code"}</h3>
          <p className="muted">Keep ownership with a repository you control.</p>
          <div className="release-actions">
            <button className="btn" onClick={() => ctx.setModal("github")}>
              {p.repo ? "Manage repository" : "Connect GitHub"}
            </button>
            <button className="btn" onClick={() => ctx.setModal("branch")}>
              <GitBranch size={14} />
              {p.branch}
            </button>
          </div>
          <button
            className="text-button"
            onClick={() => ctx.setModal("pull-request")}
          >
            Review changes & create pull request →
          </button>
        </section>
        <section className="panel">
          <div className="section-title">
            <h2>
              <ShieldCheck size={19} />
              Demo configuration readiness
            </h2>
            <span className={"badge " + (ready ? "success" : "")}>
              {ready ? "Simulation ready" : "Review needed"}
            </span>
          </div>
          {[
            ["Blueprint defined", true],
            ["Agent boundaries configured", p.agents.every((a) => a.approval)],
            ["Scenario simulation complete", ready],
          ].map(([label, ok]) => (
            <div className="readiness-row" key={String(label)}>
              <span className={ok ? "check-circle" : "pending-circle"}>
                {ok ? "✓" : "·"}
              </span>
              {label}
            </div>
          ))}
          <button
            className="text-button"
            onClick={() => ctx.nav("tests", p.id)}
          >
            Open test lab →
          </button>
        </section>
      </div>
      <div className="section-title mt-8">
        <h2>Your environments</h2>
        <button
          className="btn small-btn"
          onClick={() => ctx.setModal("domain")}
        >
          Custom domain
        </button>
      </div>
      <div className="environment-grid">
        {["Development", "Staging", "Production"].map((s, i) => (
          <section className="panel environment" key={s}>
            <span className="eyebrow">
              0{i + 1} / {s.toUpperCase()}
            </span>
            <h3>
              {s === "Development"
                ? "Your creative space"
                : s === "Staging"
                  ? "Try it before you ship"
                  : "Ready when you are"}
            </h3>
            <p>
              {s === "Development"
                ? "Preview changes as you build."
                : s === "Staging"
                  ? "Validate with your team."
                  : "A controlled path to your users."}
            </p>
            <button
              className="btn"
              onClick={() =>
                s === "Development"
                  ? ctx.nav("build", p.id)
                  : (ctx.setPayload({ environment: s }), ctx.setModal("deploy"))
              }
            >
              {s === "Development" ? "Open preview" : "Deploy here"}
              <ArrowRight size={15} />
            </button>
          </section>
        ))}
      </div>
      <section className="panel mt-6">
        <h2>Deployment history</h2>
        {p.deployments.length ? (
          p.deployments.map((d) => (
            <button
              className="test-row"
              key={d.id}
              onClick={() => {
                ctx.setPayload(d);
                ctx.setModal("deployment");
              }}
            >
              <Globe size={18} />
              <div>
                <b>
                  {d.environment} · {d.version}
                </b>
                <small>
                  {new Date(d.date).toLocaleString()} · simulated deployment
                </small>
              </div>
              <span className="badge success">{d.status}</span>
              <ArrowRight size={16} />
            </button>
          ))
        ) : (
          <Empty
            title="Your first release is ahead"
            text="Walk through checks, configuration, deployment, and rollback."
          />
        )}
      </section>
    </main>
  );
}
function Monitoring({ ctx }: { ctx: Context }) {
  const [q, setQ] = useState("All runs");
  return (
    <main className="page">
      <PageHead
        eyebrow="UNDERSTAND EVERY DECISION"
        title="Monitor & replay"
        description="Follow a run from question to evidence to action."
      >
        <button className="btn" onClick={() => ctx.nav("activity")}>
          Approval inbox
        </button>
        <button
          className="btn primary"
          onClick={() => ctx.setModal("simulate")}
        >
          <Play size={16} />
          Simulate a run
        </button>
      </PageHead>
      <div className="notice compact">
        Illustrative telemetry · Connect a runtime adapter to receive live
        traces
      </div>
      <div className="stat-grid three">
        {[
          ["Runs today", "1,316", "Sample volume across three agents"],
          ["Success rate", "98.2%", "24 runs escalated for review"],
          ["Average latency", "1.2s", "From request to prepared response"],
        ].map(([a, b, c]) => (
          <div className="stat-card" key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="section-title">
          <h2>Recent agent runs</h2>
          <SelectBox
            label="Filter runs"
            value={q}
            onChange={setQ}
            options={["All runs", "Completed", "Needs approval", "Failed"]}
          />
        </div>
        {[
          {
            name: "Find the onboarding guide",
            status: "Completed",
            time: "1.1s",
          },
          {
            name: "Refund a subscription payment",
            status: "Needs approval",
            time: "2.4s",
          },
          {
            name: "Search an unavailable source",
            status: "Failed",
            time: "4.8s",
          },
          {
            name: "Summarize product documentation",
            status: "Completed",
            time: "1.3s",
          },
        ]
          .filter((r) => q === "All runs" || r.status === q)
          .map((r, i) => (
            <button
              className="test-row"
              key={r.name}
              onClick={() => {
                ctx.setPayload(r);
                ctx.setModal("trace");
              }}
            >
              <Workflow size={18} />
              <div>
                <b>{r.name}</b>
                <small>run_10{i + 1} · Knowledge → Response</small>
              </div>
              <span
                className={
                  "badge " +
                  (r.status === "Completed"
                    ? "success"
                    : r.status === "Failed"
                      ? "danger"
                      : "")
                }
              >
                {r.status}
              </span>
              <span className="muted">{r.time}</span>
              <ArrowRight size={16} />
            </button>
          ))}
      </section>
      <section className="replay-banner">
        <div>
          <span className="eyebrow">A FLIGHT RECORDER FOR YOUR AGENTS</span>
          <h2>
            Don&apos;t just debug the answer.
            <br />
            Understand how it happened.
          </h2>
          <p>
            Inspect context, tool calls, sources, and approval decisions in one
            trace.
          </p>
        </div>
        <button className="btn" onClick={() => ctx.setModal("simulate")}>
          Explore a replay <ArrowRight size={16} />
        </button>
      </section>
    </main>
  );
}
