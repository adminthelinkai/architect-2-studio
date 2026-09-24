"use client";
import { useState } from "react";
import {
  Plus,
  ArrowUp,
  ArrowUpRight,
  GitBranch,
  Sparkles,
  Workflow,
  Search,
  BookOpen,
  Box,
  ShieldCheck,
  FolderOpen,
  Plug,
  Trash2,
  Upload,
  FileText,
  Globe,
  Download,
  Activity,
  ArrowRight,
  Code2,
  LockKeyhole,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Context } from "./workbench";
import { Project, frameworks } from "./model";
export function SelectBox({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="select-control">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function PageHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="head-actions">{children}</div>
    </div>
  );
}
export function Empty({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <FolderOpen size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
export function ProjectCard({
  p,
  i,
  ctx,
}: {
  p: Project;
  i: number;
  ctx: Context;
}) {
  return (
    <button className="project-card" onClick={() => ctx.nav("build", p.id)}>
      <div className={"project-visual visual-" + (i % 3)}>
        {p.kind === "research" ? (
          <>
            <div className="flow-mini">
              <span>
                <Search size={16} />
              </span>
              <i />
              <span>
                <Workflow size={16} />
              </span>
              <i />
              <span>
                <BookOpen size={16} />
              </span>
            </div>
            <div className="flow-caption">Research. Reason. Report.</div>
          </>
        ) : p.kind === "portal" ? (
          <div className="mini-portal">
            <Box size={23} />
            <span>
              A little less admin.
              <br />A lot more possibility.
            </span>
            <i>Explore your workspace →</i>
          </div>
        ) : (
          <>
            <div className="mini-sidebar" />
            <div className="mini-app">
              <span>Good morning, Alex</span>
              <div className="mini-stats">
                <i>
                  128<small>Resolved</small>
                </i>
                <i>
                  94%<small>Satisfaction</small>
                </i>
                <i>
                  1.2s<small>Response</small>
                </i>
              </div>
              <div className="mini-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="project-info">
        <h3>
          {p.name}
          <ArrowUpRight size={16} />
        </h3>
        <p>{p.description}</p>
        <footer>
          <span>
            <span
              className={
                "status-dot " + (p.status === "Deployed" ? "green" : "")
              }
            />
            {p.status === "Deployed" ? "Demo release" : p.status}
          </span>
          <span>
            <Workflow size={13} /> {p.agents.length} agents · {p.framework}
          </span>
        </footer>
      </div>
    </button>
  );
}
export function HomeView({ ctx }: { ctx: Context }) {
  const [prompt, setPrompt] = useState("");
  return (
    <main className="home-page">
      <div className="intro-eyebrow">
        <Sparkles size={14} /> YOUR IDEAS. YOUR AGENTS. YOUR RULES.
      </div>
      <h1>
        What will you build <em>next?</em>
      </h1>
      <p className="home-lead">
        From a first idea to a living application. Make it yours.
      </p>
      <section className="prompt-card">
        <textarea
          aria-label="Describe your application"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe an app, a workflow, or an idea worth building…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              ctx.setPayload({ brief: prompt });
              ctx.setModal("create");
            }
          }}
        />
        <div className="prompt-bottom">
          <div>
            <button
              aria-label="Attach a reference"
              onClick={() => ctx.setModal("reference")}
            >
              <Plus size={19} />
            </button>
            <button
              className="mode-button"
              onClick={() => {
                ctx.setPayload({ brief: prompt });
                ctx.setModal("create");
              }}
            >
              <Sparkles size={15} /> Plan & build <ArrowRight size={14} />
            </button>
          </div>
          <button
            className="send-button"
            aria-label="Build your idea"
            onClick={() => {
              ctx.setPayload({ brief: prompt });
              ctx.setModal("create");
            }}
          >
            <ArrowUp size={19} />
          </button>
        </div>
      </section>
      <div className="starter-actions">
        <button onClick={() => ctx.setModal("import")}>
          <GitBranch size={16} />
          Import a project
        </button>
        <button
          onClick={() => {
            ctx.setPayload({});
            ctx.setModal("new-agent");
          }}
        >
          <Workflow size={16} />
          Build an agent
        </button>
        <button onClick={() => ctx.setModal("consultant")}>
          <Sparkles size={16} />
          Help me find an idea
        </button>
      </div>
      <section className="projects-section">
        <div className="section-title">
          <div>
            <h2>Pick up where you left off</h2>
            <p>Your ideas, becoming real.</p>
          </div>
          <button onClick={() => ctx.nav("projects")}>
            View all projects <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="project-grid">
          {ctx.ws.projects.slice(0, 3).map((p, i) => (
            <ProjectCard key={p.id} p={p} i={i} ctx={ctx} />
          ))}
        </div>
      </section>
      <section className="bottom-feature">
        <div className="feature-mark">
          <Workflow size={28} />
        </div>
        <div>
          <span className="eyebrow">BUILT FOR YOUR WAY OF BUILDING</span>
          <h3>Any framework. One connected workspace.</h3>
          <p>Start with Lyzr, LangGraph, CrewAI, or bring your own agents.</p>
        </div>
        <button onClick={() => ctx.nav("library")}>
          Explore agent library <ArrowUpRight size={16} />
        </button>
      </section>
      <footer className="home-footer">
        <span>
          <ShieldCheck size={14} />
          Your code. Your data. Always yours.
        </span>
        <button onClick={() => ctx.setModal("about")}>
          Interactive preview · What works?
        </button>
      </footer>
    </main>
  );
}
export function ProjectsView({ ctx }: { ctx: Context }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All projects");
  const items = ctx.ws.projects.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) &&
      (filter === "All projects" ||
        (filter === "Drafts" ? p.status === "Draft" : p.status === "Deployed")),
  );
  return (
    <main className="page">
      <PageHead
        eyebrow="YOUR WORK, CONNECTED"
        title="All projects"
        description="A home for every idea you bring to life."
      >
        <button className="btn" onClick={() => ctx.setModal("import")}>
          <GitBranch size={16} />
          Import
        </button>
        <button
          className="btn primary"
          onClick={() => {
            ctx.setPayload({});
            ctx.setModal("create");
          }}
        >
          <Plus size={16} />
          New project
        </button>
      </PageHead>
      <div className="filterbar">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {["All projects", "Drafts", "Deployed"].map((s) => (
              <TabsTrigger aria-controls={undefined} value={s} key={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search projects"
            placeholder="Search projects…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="project-grid">
        {items.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} ctx={ctx} />
        ))}
      </div>
      {!items.length && (
        <Empty
          title="No projects here yet"
          text="Try a different search, or make room for a new idea."
        />
      )}
    </main>
  );
}
const templates = [
  {
    name: "Support Copilot",
    category: "Customer experience",
    description:
      "Give every customer a thoughtful answer, with a human in the loop.",
    framework: "Lyzr",
    kind: "support",
    icon: BookOpen,
    agents: 3,
    color: "purple",
  },
  {
    name: "Research Studio",
    category: "Research",
    description:
      "Find the evidence, connect the dots, and publish a cited report.",
    framework: "LangGraph",
    kind: "research",
    icon: Search,
    agents: 3,
    color: "green",
  },
  {
    name: "Customer Portal",
    category: "Operations",
    description:
      "One calm place for requests, documents, and customer relationships.",
    framework: "OpenAI Agents SDK",
    kind: "portal",
    icon: Box,
    agents: 3,
    color: "sand",
  },
  {
    name: "Content Collective",
    category: "Marketing",
    description:
      "A researcher, writer, and editor working from your brand guidelines.",
    framework: "CrewAI",
    kind: "research",
    icon: FileText,
    agents: 3,
    color: "pink",
  },
  {
    name: "Revenue Assistant",
    category: "Sales",
    description:
      "Research accounts, qualify opportunities, and prepare outreach for review.",
    framework: "Google ADK",
    kind: "support",
    icon: Activity,
    agents: 3,
    color: "blue",
  },
  {
    name: "Your own creation",
    category: "Blank canvas",
    description:
      "Start with an idea and choose the tools that fit your way of building.",
    framework: "Custom runtime",
    kind: "portal",
    icon: Plus,
    agents: 0,
    color: "gray",
  },
];
export function TemplatesView({ ctx }: { ctx: Context }) {
  const [category, setCategory] = useState("All templates");
  return (
    <main className="page">
      <PageHead
        eyebrow="A LITTLE INSPIRATION"
        title="Start a few steps ahead"
        description="Thoughtful foundations. Ready to become something entirely yours."
      />
      <div className="filterbar">
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList>
            {[
              "All templates",
              "Customer experience",
              "Research",
              "Operations",
            ].map((s) => (
              <TabsTrigger aria-controls={undefined} key={s} value={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <span className="muted">Curated by Architect</span>
      </div>
      <div className="template-grid">
        {templates
          .filter(
            (t) => category === "All templates" || t.category === category,
          )
          .map((t) => (
            <article className="template-card" key={t.name}>
              <div className={"template-art " + t.color}>
                <div className="template-orbit">
                  <t.icon size={30} />
                </div>
                <span>{t.category}</span>
              </div>
              <div className="template-content">
                <div className="tag">{t.framework}</div>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <footer>
                  <span>{t.agents} agents · Editable blueprint</span>
                  <button
                    className="text-button"
                    onClick={() => {
                      ctx.setPayload({ ...t, brief: t.description });
                      ctx.setModal("template");
                    }}
                  >
                    Use template <ArrowUpRight size={15} />
                  </button>
                </footer>
              </div>
            </article>
          ))}
      </div>
    </main>
  );
}
export function LibraryView({ ctx }: { ctx: Context }) {
  const [filter, setFilter] = useState("All frameworks");
  const agents = ctx.ws.projects
    .flatMap((p) =>
      p.agents.map((a) => ({ ...a, project: p.name, projectId: p.id })),
    )
    .filter((a) => filter === "All frameworks" || a.framework === filter);
  return (
    <main className="page">
      <PageHead
        eyebrow="INTELLIGENCE, BY DESIGN"
        title="Your agent library"
        description="Purpose-built specialists. Connected by a shared goal."
      >
        <button
          className="btn primary"
          onClick={() => {
            ctx.setPayload({});
            ctx.setModal("new-agent");
          }}
        >
          <Plus size={16} />
          Create agent
        </button>
      </PageHead>
      <div className="framework-strip">
        {frameworks.slice(0, 5).map((f, i) => (
          <button
            key={f}
            className={filter === f ? "selected" : ""}
            onClick={() => setFilter(filter === f ? "All frameworks" : f)}
          >
            <span className={"framework-logo logo-" + i}>{f.slice(0, 1)}</span>
            {f}
          </button>
        ))}
        <button
          onClick={() => {
            ctx.setPayload({ framework: "Custom runtime" });
            ctx.setModal("new-agent");
          }}
        >
          <Code2 size={18} />
          Bring your own
        </button>
      </div>
      <div className="section-title">
        <h2>
          {filter === "All frameworks" ? "All agents" : filter}{" "}
          <span className="count-badge">{agents.length}</span>
        </h2>
        <SelectBox
          value={filter}
          onChange={setFilter}
          options={["All frameworks", ...frameworks]}
          label="Filter agents by framework"
        />
      </div>
      <div className="agent-grid">
        {agents.map((a) => (
          <button
            key={a.id}
            className="agent-library-card"
            onClick={() => {
              ctx.nav("agents", a.projectId);
              ctx.setPayload({ agentId: a.id });
              ctx.setModal("agent");
            }}
          >
            <div className="agent-card-top">
              <span className="agent-icon">
                <Workflow size={22} />
              </span>
              <span className="tag">{a.framework}</span>
            </div>
            <h3>{a.name}</h3>
            <p>{a.role}</p>
            <div className="agent-card-bottom">
              <span>{a.project}</span>
              <ArrowUpRight size={16} />
            </div>
          </button>
        ))}
      </div>
      <div className="notice">
        <ShieldCheck size={18} />
        <span>
          <b>A framework is a choice, not a boundary.</b> Native adapters offer
          rich controls. Custom runtimes and external endpoints keep their own
          execution contracts. Framework execution is simulated in this preview.
        </span>
      </div>
    </main>
  );
}
export function ConnectionsView({ ctx }: { ctx: Context }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All connections");
  return (
    <main className="page">
      <PageHead
        eyebrow="BETTER TOGETHER"
        title="Connect your world"
        description="Give your agents the context and tools to do meaningful work."
      >
        <button
          className="btn"
          onClick={() => {
            ctx.setPayload({ name: "MCP server" });
            ctx.setModal("connect");
          }}
        >
          <Plus size={16} />
          Custom MCP server
        </button>
      </PageHead>
      <div className="notice compact">
        <LockKeyhole size={16} />
        Connections are simulated. No external accounts are accessed or
        credentials collected.
      </div>
      <div className="filterbar">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {["All connections", "Connected"].map((s) => (
              <TabsTrigger aria-controls={undefined} value={s} key={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search integrations"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a connection…"
          />
        </div>
      </div>
      <div className="connection-grid">
        {ctx.ws.connections
          .filter(
            (c) =>
              c.name.toLowerCase().includes(q.toLowerCase()) &&
              (filter !== "Connected" || c.connected),
          )
          .map((c, i) => (
            <article className="connection-card" key={c.name}>
              <div className="connection-card-header">
                <span className={"connection-logo logo-" + (i % 5)}>
                  {c.name === "GitHub" ? (
                    <GitBranch size={25} />
                  ) : c.name === "MCP server" ? (
                    <Plug size={25} />
                  ) : (
                    c.name.slice(0, 1)
                  )}
                </span>
                <span className="muted">{c.category}</span>
              </div>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <footer>
                <span className={c.connected ? "connected-label" : "muted"}>
                  {c.connected ? "Connected · demo" : "Not connected"}
                </span>
                <button
                  className={"btn small-btn " + (c.connected ? "" : "soft")}
                  onClick={() => {
                    ctx.setPayload(c);
                    ctx.setModal("connect");
                  }}
                >
                  {c.connected ? "Manage" : "Connect"}
                  <ArrowUpRight size={14} />
                </button>
              </footer>
            </article>
          ))}
      </div>
    </main>
  );
}
export function KnowledgeView({ ctx }: { ctx: Context }) {
  const [q, setQ] = useState("");
  return (
    <main className="page">
      <PageHead
        eyebrow="GROUNDED IN YOUR WORLD"
        title="Knowledge & assets"
        description="One source of context for your applications and agents."
      >
        <button
          className="btn"
          onClick={() => {
            ctx.setPayload({ type: "Website" });
            ctx.setModal("knowledge");
          }}
        >
          <Globe size={16} />
          Connect a source
        </button>
        <button
          className="btn primary"
          onClick={() => {
            ctx.setPayload({ type: "Document" });
            ctx.setModal("knowledge");
          }}
        >
          <Upload size={16} />
          Add knowledge
        </button>
      </PageHead>
      <div className="stat-grid three">
        <div className="stat-card">
          <span>Knowledge sources</span>
          <strong>{ctx.ws.knowledge.length}</strong>
          <small>Available across your workspace</small>
        </div>
        <div className="stat-card">
          <span>Ready to reference</span>
          <strong>
            {ctx.ws.knowledge.filter((k) => k.status === "Ready").length}
          </strong>
          <small>Demo indexing complete</small>
        </div>
        <div className="stat-card">
          <span>Design system</span>
          <strong className="text-stat">Studio violet</strong>
          <button className="text-button" onClick={() => ctx.setModal("brand")}>
            Customize brand kit <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
      <div className="filterbar">
        <h2>Sources</h2>
        <div className="search-field">
          <Search size={16} />
          <input
            aria-label="Search knowledge"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sources…"
          />
        </div>
      </div>
      <div className="table-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctx.ws.knowledge
              .filter((k) => k.name.toLowerCase().includes(q.toLowerCase()))
              .map((k) => (
                <TableRow key={k.id}>
                  <TableCell>
                    <span className="table-name">
                      <FileText size={17} />
                      {k.name}
                    </span>
                  </TableCell>
                  <TableCell>{k.type}</TableCell>
                  <TableCell>{k.size}</TableCell>
                  <TableCell>
                    <span className="badge success">{k.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="table-actions">
                      <button
                        className="text-button"
                        onClick={() => {
                          ctx.setPayload(k);
                          ctx.setModal("retrieval");
                        }}
                      >
                        Test retrieval
                      </button>
                      <button
                        aria-label={"Remove " + k.name}
                        onClick={() => {
                          ctx.setPayload({
                            type: "knowledge",
                            id: k.id,
                            name: k.name,
                          });
                          ctx.setModal("delete");
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="notice">
        <BookOpen size={18} />
        <span>
          Source metadata is saved. File contents, crawling, embeddings, and
          retrieval are demonstrated with sample results.
        </span>
      </div>
    </main>
  );
}
export function SettingsView({ ctx }: { ctx: Context }) {
  const [tab, setTab] = useState("General");
  const [name, setName] = useState(ctx.ws.settings.name);
  const [instructions, setInstructions] = useState(ctx.ws.settings.knowledge);
  return (
    <main className="page">
      <PageHead
        title="Workspace settings"
        description="Make Architect work the way you do."
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {["General", "Members", "Preferences", "Portability"].map((s) => (
            <TabsTrigger aria-controls={undefined} value={s} key={s}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="settings-panel">
        {tab === "General" ? (
          <>
            <h2>Workspace details</h2>
            <label className="field">
              Workspace name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
            </label>
            <label className="field">
              Shared instructions
              <textarea
                rows={5}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <small>
                Context your build agent should keep in mind across projects.
              </small>
            </label>
            <button
              className="btn primary"
              onClick={() => {
                if (!name.trim())
                  return ctx.toast.error("Enter a workspace name");
                ctx.setWs((s) => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    name: name.trim(),
                    knowledge: instructions,
                  },
                }));
                ctx.toast.success("Workspace settings updated");
              }}
            >
              Save changes
            </button>
          </>
        ) : tab === "Members" ? (
          <>
            <div className="section-title">
              <h2>Your team</h2>
              <button
                className="btn primary"
                onClick={() => ctx.setModal("invite")}
              >
                <Plus size={16} />
                Invite member
              </button>
            </div>
            <p className="muted mb-6">
              Membership changes are a demo. Invitations are not sent.
            </p>
            {ctx.ws.members.map((m) => (
              <div className="member-row" key={m.email}>
                <span className="avatar">
                  {m.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <b>{m.name}</b>
                  <small>{m.email}</small>
                </div>
                <span className="tag">{m.role}</span>
              </div>
            ))}
          </>
        ) : tab === "Preferences" ? (
          <>
            <h2>Your working style</h2>
            <div className="setting-row">
              <div>
                <b>Developer view</b>
                <p>Keep code and runtime controls close at hand.</p>
              </div>
              <Switch
                aria-label="Developer view"
                checked={ctx.developer}
                onCheckedChange={ctx.setDeveloper}
              />
            </div>
            <div className="setting-row">
              <div>
                <b>Activity notifications</b>
                <p>Show in-app reminders for pending approvals.</p>
              </div>
              <Switch
                aria-label="Activity notifications"
                checked={ctx.ws.settings.notifications}
                onCheckedChange={(v) =>
                  ctx.setWs((s) => ({
                    ...s,
                    settings: { ...s.settings, notifications: v },
                  }))
                }
              />
            </div>
            <button className="btn" onClick={() => ctx.setModal("brand")}>
              Edit design system
            </button>
          </>
        ) : (
          <>
            <h2>Your work belongs to you</h2>
            <p className="muted">
              Download a portable JSON snapshot of your projects, agent
              configuration, knowledge metadata, and workspace settings.
            </p>
            <button className="btn primary mt-6" onClick={ctx.exportProject}>
              <Download size={16} />
              Export workspace
            </button>
            <div className="notice">
              Exports contain prototype configuration and example code. They do
              not contain a generated production application or live service
              credentials.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
export function UsageView({ ctx }: { ctx: Context }) {
  const [budget, setBudget] = useState(ctx.ws.settings.budget);
  return (
    <main className="page">
      <PageHead
        eyebrow="CLEAR COSTS. CONFIDENT DECISIONS."
        title="Usage & budgets"
        description="Separate what you spend building from what your applications spend running."
      />
      <div className="notice compact">
        Sample usage data · No payment method connected · No charges incurred
      </div>
      <div className="stat-grid three">
        <div className="stat-card">
          <span>Build credits remaining</span>
          <strong>
            1,240 <small>/ 2,000</small>
          </strong>
          <Progress aria-label="Demo build credits remaining" value={62} />
        </div>
        <div className="stat-card">
          <span>Runtime spend · this month</span>
          <strong>$18.42</strong>
          <small>Within your ${ctx.ws.settings.budget} budget</small>
        </div>
        <div className="stat-card">
          <span>Average agent run</span>
          <strong>$0.014</strong>
          <small>1,316 sample runs this month</small>
        </div>
      </div>
      <div className="two-col">
        <section className="panel">
          <div className="section-title">
            <h2>Runtime usage</h2>
            <span className="tag">Last 14 days · sample</span>
          </div>
          <div
            className="bar-chart"
            aria-label="Illustrative runtime spending over fourteen days"
          >
            {[22, 35, 28, 50, 38, 62, 45, 58, 78, 64, 56, 82, 68, 92].map(
              (h, i) => (
                <div key={i}>
                  <i style={{ height: h + "%" }} />
                  <span>{i % 3 === 0 ? 10 + i : ""}</span>
                </div>
              ),
            )}
          </div>
          <div className="chart-legend">
            <i />
            Model calls <span>$12.68</span>
            <i className="light" />
            Tools & compute <span>$5.74</span>
          </div>
        </section>
        <section className="panel">
          <h2>Keep spending intentional</h2>
          <p className="muted">
            Configure a monthly runtime budget for your demo workspace.
          </p>
          <label className="field mt-6">
            Monthly budget ($)
            <input
              type="number"
              min="1"
              max="10000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
          <button
            className="btn primary"
            onClick={() => {
              if (!Number.isFinite(budget) || budget < 1 || budget > 10000)
                return ctx.toast.error(
                  "Choose a budget between $1 and $10,000",
                );
              ctx.setWs((s) => ({ ...s, settings: { ...s.settings, budget } }));
              ctx.toast.success("Demo budget updated");
            }}
          >
            Save budget
          </button>
          <div className="notice">
            Production enforcement will pause agent runs before the limit. This
            prototype saves the setting without billing.
          </div>
        </section>
      </div>
    </main>
  );
}
export function ActivityView({ ctx }: { ctx: Context }) {
  return (
    <main className="page">
      <PageHead
        eyebrow="YOU STAY IN CONTROL"
        title="Activity & approvals"
        description="The right amount of autonomy. A human when it matters."
      />
      <div className="section-title">
        <h2>
          Approval inbox{" "}
          <span className="count-badge">
            {ctx.ws.approvals.filter((a) => a.status === "Pending").length}
          </span>
        </h2>
        <span className="tag">Simulated external actions</span>
      </div>
      {ctx.ws.approvals.map((a) => (
        <section className="approval-card" key={a.id}>
          <span className="agent-icon">
            <ShieldCheck size={23} />
          </span>
          <div>
            <h3>{a.title}</h3>
            <p>{a.detail}</p>
            <span
              className={"badge " + (a.status === "Approved" ? "success" : "")}
            >
              {a.status}
            </span>
          </div>
          {a.status === "Pending" && (
            <div className="head-actions">
              <button
                className="btn"
                onClick={() => {
                  ctx.setWs((s) => ({
                    ...s,
                    approvals: s.approvals.map((x) =>
                      x.id === a.id ? { ...x, status: "Rejected" } : x,
                    ),
                  }));
                  ctx.toast("Action rejected");
                }}
              >
                Reject
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  ctx.setPayload(a);
                  ctx.setModal("approval");
                }}
              >
                Review & approve
              </button>
            </div>
          )}
        </section>
      ))}
      <section className="panel mt-6">
        <h2>Workspace activity</h2>
        {[
          {
            name: "Support Copilot workspace created",
            text: "Blueprint and three specialist agents added",
            icon: Workflow,
          },
          {
            name: "Knowledge sources prepared",
            text: "Three example sources ready for retrieval simulation",
            icon: BookOpen,
          },
          {
            name: "Staging release demonstrated",
            text: "A sample release is available in Support Copilot",
            icon: Globe,
          },
        ].map((a) => (
          <div className="activity-row" key={a.name}>
            <a.icon size={18} />
            <div>
              <b>{a.name}</b>
              <p>{a.text}</p>
            </div>
            <span className="muted">Sample</span>
          </div>
        ))}
      </section>
    </main>
  );
}
