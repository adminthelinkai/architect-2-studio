"use client";
import { projectSnapshot } from "./delivery-adapter";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Workflow,
  ShieldCheck,
  Upload,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Context } from "./workbench";
import { SelectBox } from "./workspace-views";
import { agentSeed, createProject, frameworks, uid, inferName } from "./model";
export function FlowModal({ ctx }: { ctx: Context }) {
  if (!ctx.modal) return null;
  return (
    <Flow key={ctx.modal + "-" + (ctx.payload?.agentId || "")} ctx={ctx} />
  );
}
function Flow({ ctx }: { ctx: Context }) {
  const m = ctx.modal,
    p = ctx.project,
    d = {
      name: "",
      brief: "",
      description: "",
      title: "",
      date: "",
      environment: "Staging",
      status: "Succeeded",
      ...ctx.payload,
    };
  const agent = p?.agents.find((a) => a.id === d.agentId);
  const [name, setName] = useState(
    agent?.name ||
      (["template", "connect", "retrieval"].includes(m) ? d.name : "") ||
      "",
  );
  const [body, setBody] = useState(agent?.instructions || d.brief || "");
  const [framework, setFramework] = useState(
    agent?.framework || d.framework || p?.framework || "Lyzr",
  );
  const [role, setRole] = useState(agent?.role || "Member");
  const [email, setEmail] = useState("");
  const [choice, setChoice] = useState(d.environment || "Staging");
  const [approval, setApproval] = useState(agent?.approval ?? true);
  const [budget, setBudget] = useState(agent?.budget || 2);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState(p?.color || "#7661c9");
  const [toolsList, setTools] = useState(agent?.tools || ["Knowledge search"]);
  const [model, setModel] = useState(agent?.model || "Auto · balanced");
  const [failed, setFailed] = useState(false);
  const deploymentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (deploymentTimer.current) clearTimeout(deploymentTimer.current);
    },
    [],
  );
  const close = () => ctx.setModal("");
  const done = (message: string) => {
    ctx.toast.success(message);
    close();
  };
  const patch = ctx.patch;
  const field = (
    label: string,
    value: string,
    set: (s: string) => void,
    placeholder = "",
    type = "text",
  ) => (
    <label className="field">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        maxLength={300}
        required
      />
    </label>
  );
  const area = (
    label: string,
    value: string,
    set: (s: string) => void,
    placeholder = "",
  ) => (
    <label className="field">
      {label}
      <textarea
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={100000}
        required
      />
    </label>
  );
  const action = (label: string, fn: () => void, disabled = false) => (
    <button
      type="button"
      className="btn primary modal-action"
      disabled={disabled || busy}
      onClick={() => {
        setError("");
        fn();
      }}
    >
      {busy ? "Working…" : label}
      <ArrowRight size={16} />
    </button>
  );
  const notice = (text: string) => <div className="notice">{text}</div>;
  const fileInput = (
    <label className="upload-zone">
      <Upload size={25} />
      <b>{file?.name || "Choose a file"}</b>
      <span>Metadata only · up to 25 MB</span>
      <input
        aria-label="Select a file"
        type="file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && f.size > 25 * 1024 * 1024) {
            setError("Choose a file under 25 MB");
            return;
          }
          setFile(f || null);
          if (f) setName(f.name);
        }}
      />
    </label>
  );
  const frameworkField = (
    <label className="field">
      Framework
      <SelectBox
        label="Agent framework"
        value={framework}
        onChange={setFramework}
        options={frameworks}
      />
      <small>
        {framework === "Lyzr"
          ? "Configuration schema only · runtime not connected"
          : framework === "Custom runtime" || framework === "External endpoint"
            ? "Endpoint contract · bring any runtime"
            : "Adapter contract · runtime integration required"}
      </small>
    </label>
  );
  const saveAgent = () => {
    if (!name.trim()) return setError("Give your agent a name");
    if (!Number.isFinite(budget) || budget < 0.01 || budget > 1000)
      return setError("Choose a budget between $0.01 and $1,000");
    const a = {
      ...(agent || agentSeed(name, framework)),
      name: name.trim(),
      framework,
      role:
        role === "Member"
          ? "A specialist that completes its assigned task."
          : role,
      instructions: body || agentSeed().instructions,
      approval,
      budget,
      tools: toolsList,
      model,
    };
    if (p) {
      patch({
        tests: p.tests.map((t) => ({ ...t, status: "Not run" })),
        agents: agent
          ? p.agents.map((x) => (x.id === agent.id ? a : x))
          : [...p.agents, a],
      });
      done("Agent configuration saved");
    } else {
      const project = createProject(
        name,
        body || "Create a specialist agent",
        framework,
      );
      project.agents = [a];
      ctx.setWs((s) => ({ ...s, projects: [project, ...s.projects] }));
      close();
      ctx.nav("agents", project.id);
    }
  };
  if (m === "delete")
    return (
      <AlertDialog open onOpenChange={(o) => !o && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {d.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the{" "}
              {d.type === "record"
                ? "demo record"
                : "knowledge source metadata"}{" "}
              from your saved workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (d.type === "record" && p)
                  patch({ records: p.records.filter((r) => r.id !== d.id) });
                else
                  ctx.setWs((s) => ({
                    ...s,
                    knowledge: s.knowledge.filter((k) => k.id !== d.id),
                  }));
                done("Removed from workspace");
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  const agentFields = (
    <>
      <div className="capability-strip">
        <span className="badge">Capability passport</span>
        <small>Portable contract · tools · approval · budget</small>
      </div>
      {field("Agent name", name, setName, "Research specialist")}
      {field(
        "Responsibility",
        role === "Member" ? "" : role,
        setRole,
        "What is this agent responsible for?",
      )}
      {frameworkField}
      <label className="field">
        Model policy
        <SelectBox
          label="Model policy"
          value={model}
          onChange={setModel}
          options={[
            "Auto · balanced",
            "Fast · low latency",
            "Reasoning · complex tasks",
            "Bring your own model",
          ]}
        />
      </label>
      {area(
        "Instructions",
        body,
        setBody,
        "Describe success, constraints, and escalation rules.",
      )}
      <label className="field">Allowed tools</label>
      <div className="tool-options">
        {[
          "Knowledge search",
          "Web research",
          "Database read",
          "Draft email",
          "Custom MCP tool",
        ].map((t) => (
          <label key={t}>
            <input
              type="checkbox"
              checked={toolsList.includes(t)}
              onChange={(e) =>
                setTools(
                  e.target.checked
                    ? [...toolsList, t]
                    : toolsList.filter((x) => x !== t),
                )
              }
            />
            {t}
          </label>
        ))}
      </div>
      <div className="setting-row">
        <div>
          <b>Require human approval</b>
          <p>Before any external action</p>
        </div>
        <Switch
          aria-label="Require human approval"
          checked={approval}
          onCheckedChange={setApproval}
        />
      </div>
      <label className="field">
        Maximum cost per run ($)
        <input
          type="number"
          min="0.01"
          max="1000"
          step="0.01"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </label>
      {notice(
        "Agent definitions are saved. No model or external tool is called in this prototype.",
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {action("Save agent", saveAgent)}
    </>
  );
  if (m === "agent")
    return (
      <Sheet open onOpenChange={(o) => !o && close()}>
        <SheetContent className="agent-sheet">
          <SheetHeader>
            <SheetTitle>Configure your agent</SheetTitle>
            <SheetDescription>
              A clear purpose. A predictable boundary.
            </SheetDescription>
          </SheetHeader>
          <div className="sheet-body">{agentFields}</div>
        </SheetContent>
      </Sheet>
    );
  let title = "Explore Architect",
    description = "A connected workspace for your ideas.",
    content: React.ReactNode;
  if (m === "create") {
    title = "Let’s build something useful";
    description = "Start with your outcome. We’ll connect the pieces.";
    content = (
      <>
        {field("Project name", name, setName, "e.g. Customer success copilot")}
        {area(
          "What should your app do?",
          body,
          setBody,
          "Who is it for? What should it help them accomplish?",
        )}
        {frameworkField}
        {notice(
          "Creates a saved blueprint, agent definitions, and an interactive sample preview. AI code generation is simulated.",
        )}
        {action("Create my blueprint", () => {
          if (body.trim().length < 10)
            return setError("Describe your idea in at least 10 characters");
          ctx.create(name || inferName(body), body, framework);
        })}
      </>
    );
  } else if (m === "new-agent" || m === "workflow-step") {
    title =
      m === "new-agent"
        ? "Give your agent a purpose"
        : "Add a workflow specialist";
    description = "A portable agent definition for the framework you choose.";
    content = agentFields;
  } else if (m === "import") {
    title = "Bring your work with you";
    description = "An existing project. A new way forward.";
    content = (
      <>
        <Tabs
          value={choice === "ZIP" ? "ZIP" : "GitHub"}
          onValueChange={setChoice}
        >
          <TabsList>
            <TabsTrigger aria-controls={undefined} value="GitHub">
              GitHub repository
            </TabsTrigger>
            <TabsTrigger aria-controls={undefined} value="ZIP">
              ZIP archive
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {choice === "ZIP"
          ? fileInput
          : field(
              "Repository URL",
              name,
              setName,
              "https://github.com/owner/repository",
            )}
        {frameworkField}
        {step === 1 && (
          <div className="import-inspection">
            <b>
              <Check size={18} />
              Sample project analysis
            </b>
            <p>
              Application shell · agent configuration · environment variables
            </p>
            <span className="tag">Review blueprint before changing code</span>
          </div>
        )}
        {notice(
          "Import demonstrates the inspection and handoff journey. It stores repository/file metadata; it does not fetch or execute source code.",
        )}
        {action(step ? "Open imported workspace" : "Inspect project", () => {
          if (choice === "ZIP" && !file) return setError("Choose a ZIP file");
          if (
            choice === "ZIP" &&
            file &&
            !file.name.toLowerCase().endsWith(".zip")
          )
            return setError("Choose a .zip archive");
          if (
            choice !== "ZIP" &&
            !/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(name)
          )
            return setError("Enter a GitHub repository URL");
          if (!step) {
            setStep(1);
            return;
          }
          const project = createProject(
            (
              file?.name ||
              name.split("/").filter(Boolean).pop() ||
              "Imported project"
            ).replace(".zip", ""),
            "Continue an imported application. Review architecture, data, and agent boundaries before changes.",
            framework,
          );
          project.repo = choice === "ZIP" ? "" : name;
          ctx.setWs((s) => ({ ...s, projects: [project, ...s.projects] }));
          close();
          ctx.nav("blueprint", project.id);
        })}
      </>
    );
  } else if (m === "consultant") {
    title = "Find your next useful idea";
    description = "Start with the work you wish took less work.";
    content = (
      <>
        {field(
          "Your team or role",
          name,
          setName,
          "Customer success, operations, research…",
        )}
        {area(
          "What slows you down?",
          body,
          setBody,
          "We answer the same product questions every day…",
        )}
        {step > 0 && (
          <div className="proposal-card">
            <span className="eyebrow">YOUR STARTING POINT</span>
            <h3>{name || "Team"} knowledge copilot</h3>
            <p>
              Answer questions from trusted sources, draft responses, and
              escalate decisions to a human.
            </p>
            <span className="tag">
              3 agents · knowledge search · approval inbox
            </span>
          </div>
        )}
        {notice(
          "A guided idea template, not an AI-generated business analysis.",
        )}
        {action(
          step ? "Create this blueprint" : "Explore an opportunity",
          () => {
            if (!body.trim())
              return setError("Tell us what you would like to improve");
            if (!step) return setStep(1);
            ctx.create((name || "Team") + " knowledge copilot", body);
          },
        )}
      </>
    );
  } else if (m === "template") {
    title = d.name || "Application template";
    description =
      d.description || "A thoughtful starting point you can make your own.";
    content = (
      <>
        <div className="proposal-card">
          <Workflow size={30} />
          <h3>{d.name}</h3>
          <p>{d.brief || d.description}</p>
          <span className="tag">
            {d.framework || "Lyzr"} · Editable blueprint · Agent team
          </span>
        </div>
        {action("Use this template", () =>
          ctx.create(
            d.name,
            d.brief || d.description,
            d.framework || "Lyzr",
            d.kind || "support",
          ),
        )}
      </>
    );
  } else if (m === "connect") {
    title = d.name + " connection";
    description = "Choose the access your agents actually need.";
    content = (
      <>
        <div className="connection-permissions">
          <ShieldCheck size={28} />
          <h3>{d.scope}</h3>
          <p>Permission scope is shown before a connection is enabled.</p>
        </div>
        <label className="field">
          Environment
          <SelectBox
            label="Connection environment"
            value={choice}
            onChange={setChoice}
            options={["Development", "Staging", "Production"]}
          />
        </label>
        {d.name === "MCP server" &&
          field("Server URL", name, setName, "https://tools.example.com/mcp")}
        {notice(
          "Demo authorization. No credentials are requested and no external account is connected.",
        )}
        {action(
          d.connected
            ? "Disconnect demo connection"
            : "Authorize demo connection",
          () => {
            ctx.setWs((s) => ({
              ...s,
              connections: s.connections.map((c) =>
                c.name === d.name ? { ...c, connected: !d.connected } : c,
              ),
            }));
            done(
              d.connected ? "Demo connection removed" : "Demo connection added",
            );
          },
        )}
      </>
    );
  } else if (m === "knowledge" || m === "reference") {
    title = m === "reference" ? "Add a reference" : "Add knowledge";
    description = "Give your workspace the context it needs.";
    content = (
      <>
        {d.type === "Website"
          ? field("Website URL", name, setName, "https://docs.example.com")
          : fileInput}
        {field("Source name", name, setName, "Product handbook")}
        {notice(
          "Stores metadata only. Files are not uploaded or indexed in this prototype.",
        )}
        {action("Add to workspace", () => {
          if (!name.trim())
            return setError("Choose a file or enter a source name");
          ctx.setWs((s) => ({
            ...s,
            knowledge: [
              ...s.knowledge,
              {
                id: uid(),
                name,
                type: d.type || "Reference",
                size: file
                  ? Math.max(1, Math.round(file.size / 1024)) + " KB"
                  : "Metadata only",
                status: "Ready",
              },
            ],
          }));
          done("Source metadata added");
        })}
      </>
    );
  } else if (m === "retrieval") {
    title = "Test knowledge retrieval";
    description = d.name || "Explore how your agent uses source context.";
    content = (
      <>
        {field("Ask a question", body, setBody, "What is the refund policy?")}
        {step > 0 && (
          <div className="retrieval-result">
            <span className="badge success">Illustrative answer</span>
            <p>
              Eligible requests within 14 days can be prepared for review.
              Financial actions require a human to approve.
            </p>
            <small>
              Sample citation: Support handbook · Refunds, section 3
            </small>
            <p className="muted">
              This sample is not extracted from your source.
            </p>
          </div>
        )}
        {action("Run sample retrieval", () =>
          body.trim() ? setStep(1) : setError("Enter a question"),
        )}
      </>
    );
  } else if (m === "visual" || m === "brand") {
    title = "Make it feel like you";
    description =
      "A consistent visual language, from the first screen to the last.";
    content = (
      <>
        {field(
          m === "visual" ? "Preview heading" : "Design system name",
          name,
          setName,
          m === "visual" ? p?.title : "Studio violet",
        )}
        <label className="field">
          Accent color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        {area(
          "Design direction",
          body,
          setBody,
          "Calm, confident, accessible…",
        )}
        {action("Save design", () => {
          if (p) patch({ title: name || p.title, color });
          ctx.setWs((s) => ({
            ...s,
            settings: { ...s.settings, theme: name || s.settings.theme },
          }));
          done("Design settings updated");
        })}
      </>
    );
  } else if (m === "request") {
    title = "How can we help?";
    description = "Try your application’s customer journey.";
    content = (
      <>
        {field("Request title", name, setName, "I need help getting started")}
        {area(
          "Tell us more",
          body,
          setBody,
          "What would a good outcome look like?",
        )}
        {action("Submit request", () => {
          if (!name.trim()) return setError("Enter a request title");
          if (p)
            patch({ notes: [...p.notes, name + (body ? " — " + body : "")] });
          done("Request saved in your demo application");
        })}
      </>
    );
  } else if (m === "request-detail") {
    title = d.name || "Request details";
    description = "A sample conversation with your support agent.";
    content = (
      <>
        <div className="chat-message assistant">
          <p>
            Thanks for reaching out. I found a relevant guide in the knowledge
            library and prepared the next steps for you.
          </p>
          <span className="tag">Source: Support handbook · Sample</span>
        </div>
        {area("Your reply", body, setBody, "Add a follow-up…")}
        {action("Save reply", () => {
          if (!body.trim()) return setError("Enter your reply");
          if (p) patch({ notes: [...p.notes, "Reply: " + body] });
          done("Reply saved");
        })}
      </>
    );
  } else if (m === "record") {
    title = "Add an application record";
    description =
      "A saved demo record, ready to explore in your database view.";
    content = (
      <>
        {field("Name", name, setName)}
        {field("Email", email, setEmail, "name@example.com", "email")}
        <label className="field">
          Role
          <SelectBox
            label="Record role"
            value={role}
            onChange={setRole}
            options={["Member", "Admin", "Viewer"]}
          />
        </label>
        {action("Create record", () => {
          if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email))
            return setError("Enter a name and valid email address");
          if (p?.records.some((r) => r.email === email))
            return setError("A record with this email already exists");
          if (p)
            patch({
              records: [...p.records, { id: uid(), name, email, role }],
            });
          done("Record created");
        })}
      </>
    );
  } else if (m === "test-new") {
    title = "Define success";
    description = "Add an observable scenario to your acceptance suite.";
    content = (
      <>
        {field(
          "Scenario",
          name,
          setName,
          "Low-confidence answers escalate to a person",
        )}
        {area("Expected behavior", body, setBody, "Given… When… Then…")}
        {action("Add scenario", () => {
          if (!name.trim()) return setError("Describe the scenario");
          if (p)
            patch({
              tests: [
                ...p.tests,
                { name: name + (body ? " — " + body : ""), status: "Not run" },
              ],
            });
          done("Scenario added");
        })}
      </>
    );
  } else if (m === "test-result") {
    title = d.name;
    description = "Scenario result and supporting evidence.";
    content = (
      <>
        <span className={"badge " + (d.status === "Passed" ? "success" : "")}>
          {d.status}
        </span>
        <div className="trace-list">
          <div>
            <Check />
            Input prepared<small>Sample request entered the workflow</small>
          </div>
          <div>
            <Workflow />
            Configuration inspected
            <small>
              {d.index === 2
                ? "Checks every agent’s approvalRequired configuration"
                : "Illustrative result; no runtime execution"}
            </small>
          </div>
          <div>
            <ShieldCheck />
            {d.status === "Failed"
              ? "Approval boundary missing"
              : "Outcome reviewed"}
            <small>
              {d.status === "Not run"
                ? "Run the suite to produce a sample result."
                : "Inspect runtime traces before a real production release."}
            </small>
          </div>
        </div>
        {d.status === "Failed" &&
          action("Enable agent approvals", () => {
            if (p)
              patch({
                agents: p.agents.map((a) => ({ ...a, approval: true })),
                tests: p.tests.map((t) => ({ ...t, status: "Not run" })),
              });
            done("Approval boundaries enabled; run tests again");
          })}
      </>
    );
  } else if (m === "github") {
    title = "Connect your repository";
    description = "Source ownership is built into your workflow.";
    content = (
      <>
        {field(
          "GitHub repository URL",
          name,
          setName,
          p?.repo || "https://github.com/owner/repository",
        )}
        {notice(
          "This connects a repository label to the demo project. It does not grant GitHub access or push code. The Architect platform’s real source repository is delivered separately.",
        )}
        {action("Save repository", () => {
          if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(name))
            return setError("Enter a valid GitHub repository URL");
          patch({ repo: name });
          done("Repository configuration saved");
        })}
      </>
    );
  } else if (m === "branch") {
    title = "Create a working branch";
    description = "Keep a focused space for your next change.";
    content = (
      <>
        {field("Branch name", name, setName, "feature/customer-onboarding")}
        {notice(
          "Saved as a demo branch label. No remote Git branch is created.",
        )}
        {action("Switch demo branch", () => {
          if (!/^[a-zA-Z0-9][a-zA-Z0-9/_-]{0,99}$/.test(name))
            return setError("Use letters, numbers, slash, dash, or underscore");
          patch({ branch: name });
          done("Demo branch selected");
        })}
      </>
    );
  } else if (m === "pull-request") {
    title = "Review your changes";
    description = "A clear explanation before a consequential action.";
    content = step ? (
      <div className="success-state">
        <Check size={40} />
        <h2>Review prepared</h2>
        <p>
          Your demo pull request summary is saved to the project. No GitHub pull
          request was created.
        </p>
        {action("Back to release", close)}
      </div>
    ) : (
      <>
        {field(
          "Change title",
          name,
          setName,
          "Refine agent approval boundaries",
        )}
        <pre className="diff-block">{`+ ${p?.agents.length} configured agents\n+ Framework: ${p?.framework}\n+ Branch: ${p?.branch}\n+ Human approval: ${p?.agents.every((a) => a.approval)}\n+ Blueprint and workspace configuration`}</pre>
        {area(
          "Review summary",
          body,
          setBody,
          "What changed, why, and how was it tested?",
        )}
        {action("Create demo review", () => {
          if (!name.trim()) return setError("Give the change a title");
          patch({
            notes: [...(p?.notes || []), "Demo review: " + name + " — " + body],
          });
          setStep(1);
        })}
      </>
    );
  } else if (m === "deploy") {
    title =
      step === 2
        ? "Your demo release is ready"
        : "A thoughtful path to production";
    description = "Configure. Verify. Release. Keep a way back.";
    const ready =
      (!p?.delivery ||
        (p.delivery.reviewed === projectSnapshot(p) &&
          p.delivery.verified === projectSnapshot(p) &&
          p.delivery.commits[0]?.snapshot === projectSnapshot(p))) &&
      p?.tests.every((t) => t.status === "Passed") &&
      p?.agents.every((a) => a.approval);
    content =
      step === 2 ? (
        <div className="success-state">
          <Globe size={44} />
          <h2>{choice} · release complete</h2>
          <p>
            Your release record is saved. This is a deployment simulation; no
            separate application URL was provisioned.
          </p>
          {action("Open application preview", () => {
            close();
            ctx.nav("build", p!.id);
          })}
        </div>
      ) : (
        <>
          <div className="flow-steps">
            <span className="selected">1 Configure</span>
            <span>2 Verify</span>
            <span>3 Release</span>
          </div>
          <label className="field">
            Environment
            <SelectBox
              label="Deployment environment"
              value={choice}
              onChange={setChoice}
              options={["Staging", "Production"]}
            />
          </label>
          <label className="field">
            Hosting target
            <SelectBox
              label="Hosting target"
              value={
                frameworks.includes(framework) ? "Architect Cloud" : framework
              }
              onChange={setFramework}
              options={[
                "Architect Cloud",
                "Vercel",
                "Container / Docker",
                "Custom infrastructure",
              ]}
            />
          </label>
          <div className="readiness-row">
            <span className={ready ? "check-circle" : "pending-circle"}>
              {ready ? "✓" : "!"}
            </span>
            {ready
              ? "Configuration checks passed"
              : "Complete scenario simulation and enable approval boundaries"}
          </div>
          {!ready && (
            <button
              className="btn"
              onClick={() => {
                close();
                ctx.nav("tests", p!.id);
              }}
            >
              Go to test lab
            </button>
          )}
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={failed}
              onChange={(e) => setFailed(e.target.checked)}
            />
            Demonstrate a failed deployment
          </label>
          {step === 1 && (
            <div className="build-progress" role="status">
              Preparing artifact → checking configuration → publishing demo
              release…
            </div>
          )}
          {notice(
            "No hosting account is modified and no resources are billed. Architect itself has a separate live deployment.",
          )}
          {action(
            "Deploy simulation",
            // action stores this callback on onClick; it never runs during render.
            // eslint-disable-next-line react-hooks/refs
            () => {
              if (!ready)
                return setError("Complete the checks before releasing");
              setBusy(true);
              setStep(1);
              deploymentTimer.current = setTimeout(() => {
                setBusy(false);
                if (failed) {
                  setStep(0);
                  setError(
                    "Simulated build failure: environment variable MODEL_API_KEY is missing. Uncheck the failure demonstration and retry.",
                  );
                  return;
                }
                patch({
                  status: "Deployed",
                  deployments: [
                    {
                      id: uid(),
                      environment: choice,
                      date: new Date().toISOString(),
                      version: "v" + ((p?.deployments.length || 0) + 1),
                      status: "Succeeded",
                    },
                    ...(p?.deployments || []),
                  ],
                });
                setStep(2);
              }, 1600);
            },
            !ready,
          )}
        </>
      );
  } else if (m === "deployment") {
    title = d.environment + " release · " + d.version;
    description = "A reviewable snapshot of your release history.";
    content = (
      <>
        <span className="badge success">{d.status} · Simulation</span>
        <div className="detail-grid">
          <span>Created</span>
          <b>{new Date(d.date).toLocaleString()}</b>
          <span>Environment</span>
          <b>{d.environment}</b>
          <span>Artifact</span>
          <b>Demo configuration snapshot</b>
        </div>
        {notice(
          "Rollback records a simulated operation. It does not change a hosted runtime or restore project data.",
        )}
        {action("Simulate rollback to this release", () => {
          if (p)
            patch({
              deployments: [
                {
                  ...d,
                  id: uid(),
                  date: new Date().toISOString(),
                  version: d.version + " · rollback",
                },
                ...p.deployments,
              ],
            });
          done("Simulated rollback recorded");
        })}
      </>
    );
  } else if (m === "domain") {
    title = "Give your app a home";
    description = "Preview the custom-domain setup journey.";
    content = (
      <>
        {field("Domain", name, setName, "app.yourcompany.com")}
        {step > 0 && (
          <div className="dns-record">
            <span>CNAME</span>
            <code>{name}</code>
            <code>your-runtime.example.com</code>
          </div>
        )}
        {notice(
          "Example DNS instructions only. No domain is registered, verified, or attached.",
        )}
        {action(step ? "Save domain intent" : "Show DNS instructions", () => {
          if (!/^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(name))
            return setError("Enter a valid hostname");
          if (!step) return setStep(1);
          if (p)
            patch({ notes: [...p.notes, "Custom domain intent: " + name] });
          done("Domain intent saved");
        })}
      </>
    );
  } else if (m === "history") {
    title = "Every iteration, within reach";
    description = "Restore a preview heading and brief from a saved snapshot.";
    content = (
      <>
        {p?.history.map((v) => (
          <div className="history-row" key={v.id}>
            <div>
              <b>{v.label}</b>
              <small>{new Date(v.date).toLocaleString()}</small>
              <p>{v.title}</p>
            </div>
            <button
              className="btn small-btn"
              onClick={() => {
                patch({ title: v.title, brief: v.brief });
                done("Preview snapshot restored");
              }}
            >
              Restore preview
            </button>
          </div>
        ))}
        {notice(
          "These snapshots restore the heading and brief. Agent, database, and source-code edits are not versioned here.",
        )}
      </>
    );
  } else if (m === "share" || m === "invite") {
    title = "Better, together";
    description = "Preview workspace invitations and access roles.";
    content = (
      <>
        {field(
          "Email address",
          email,
          setEmail,
          "teammate@example.com",
          "email",
        )}
        <label className="field">
          Role
          <SelectBox
            label="Member role"
            value={role}
            onChange={setRole}
            options={["Member", "Admin", "Viewer"]}
          />
        </label>
        {notice(
          "Adds a demo membership record. No invitation is sent and no real access is granted.",
        )}
        {action("Add demo member", () => {
          if (!/^\S+@\S+\.\S+$/.test(email))
            return setError("Enter a valid email");
          if (ctx.ws.members.some((x) => x.email === email))
            return setError("This member is already listed");
          ctx.setWs((s) => ({
            ...s,
            members: [...s.members, { name: email.split("@")[0], email, role }],
          }));
          done("Demo member added");
        })}
      </>
    );
  } else if (m === "approval") {
    title = "A human at the right moment";
    description = d.title;
    content = (
      <>
        <div className="proposal-card">
          <ShieldCheck size={28} />
          <h3>Review the proposed action</h3>
          <p>{d.detail}</p>
          <span className="tag">External action · approval required</span>
        </div>
        {notice(
          "Approval updates the demo inbox. No refund or email is executed.",
        )}
        {action("Approve demo action", () => {
          ctx.setWs((s) => ({
            ...s,
            approvals: s.approvals.map((a) =>
              a.id === d.id ? { ...a, status: "Approved" } : a,
            ),
          }));
          done("Demo action approved");
        })}
      </>
    );
  } else if (m === "boundaries") {
    title = "Autonomy with intention";
    description = "Decide where your agents act and where they ask.";
    content = (
      <>
        <div className="setting-row">
          <div>
            <b>Approve external actions</b>
            <p>Payments, messages, and changes outside the workspace</p>
          </div>
          <Switch
            aria-label="Require approval for all agents"
            checked={approval}
            onCheckedChange={setApproval}
          />
        </div>
        <div className="proposal-card">
          <h3>Agents can research and draft</h3>
          <p>
            Knowledge reads and response preparation stay inside the configured
            tool boundary. Review each agent for more specific permissions.
          </p>
        </div>
        {action("Apply to all agents", () => {
          if (p)
            patch({
              agents: p.agents.map((a) => ({ ...a, approval })),
              tests: p.tests.map((t) => ({ ...t, status: "Not run" })),
            });
          done("Approval policy saved; rerun your checks");
        })}
      </>
    );
  } else if (m === "impact") {
    title = "Understand the change before it happens";
    description = "Your blueprint, connected to the parts it affects.";
    content = (
      <>
        <div className="impact-grid">
          {[
            ["Experience", "Dashboard and request journey"],
            ["Agents", `${p?.agents.length} configured specialists`],
            ["Data", "Users and requests"],
            ["Safety", "Human approval boundary"],
          ].map(([a, b]) => (
            <div key={a}>
              <span className="eyebrow">{a}</span>
              <b>{b}</b>
            </div>
          ))}
        </div>
        {notice(
          "Illustrative impact map. The prototype does not perform source-code dependency analysis.",
        )}
        {action("Continue to build workspace", () => {
          close();
          ctx.nav("build", p!.id);
        })}
      </>
    );
  } else if (m === "trace" || m === "simulate") {
    title =
      m === "trace" ? "Follow the decision" : "A safe space to try things";
    description =
      m === "trace"
        ? d.name
        : "Simulate a run before giving your agents real work.";
    content = (
      <>
        {m === "simulate" &&
          field(
            "Test request",
            body,
            setBody,
            "Can I get a refund for my subscription?",
          )}
        {(step > 0 || m === "trace") && (
          <div className="trace-list">
            <div>
              <Check />
              Request understood<small>Coordinator · 120ms · sample</small>
            </div>
            <div>
              <BookIcon />
              Evidence retrieved
              <small>
                {d.status === "Failed"
                  ? "Source unavailable: sample timeout"
                  : "Support handbook · section 3 · illustrative citation"}
              </small>
            </div>
            <div>
              <Workflow />
              Response prepared<small>No external tools were executed</small>
            </div>
            <div>
              <ShieldCheck />
              {d.status === "Failed"
                ? "Escalated to operator"
                : "Human approval checkpoint"}
              <small>Consequential action remains pending</small>
            </div>
          </div>
        )}
        {notice(
          "A deterministic sample trace. Connect a runtime adapter for real token usage, tool results, and replay.",
        )}
        {action(
          step || m === "trace" ? "Replay sample" : "Run simulation",
          () => {
            if (m === "simulate" && !body.trim())
              return setError("Enter a test request");
            setStep(step + 1);
            ctx.toast("Sample run completed");
          },
        )}
      </>
    );
  } else if (m === "secrets") {
    title = "Define an environment variable";
    description = "Keep configuration separate from your application.";
    content = (
      <>
        {field("Variable name", name, setName, "MODEL_API_KEY")}
        {field("Placeholder value", body, setBody, "demo-value-only")}
        {notice(
          "This is a placeholder definition, not a secure secret store. Do not enter real keys.",
        )}
        {action("Save placeholder definition", () => {
          if (!/^[A-Z][A-Z0-9_]*$/.test(name))
            return setError("Use uppercase letters, numbers, and underscores");
          if (p)
            patch({
              notes: [
                ...p.notes,
                "Environment variable definition: " +
                  name +
                  " (placeholder only)",
              ],
            });
          done("Variable name saved; value discarded");
        })}
      </>
    );
  } else if (m === "auth-provider") {
    title = d.name + " configuration";
    description = "Preview the steps for a production identity provider.";
    content = (
      <>
        <div className="trace-list">
          <div>
            <Check />
            Create a provider application
            <small>Register your application in the provider console</small>
          </div>
          <div>
            <ShieldCheck />
            Configure secure credentials
            <small>Store secrets in a production secret manager</small>
          </div>
          <div>
            <Globe />
            Verify the callback URL
            <small>https://your-app.example.com/auth/callback</small>
          </div>
        </div>
        {notice(
          "Provider authentication is not connected. This guide does not create user accounts.",
        )}
        {action("Mark provider setup as planned", () => {
          if (p)
            patch({ notes: [...p.notes, d.name + " provider setup planned"] });
          done("Setup intention saved");
        })}
      </>
    );
  } else if (m === "account") {
    title = "Your Architect account";
    description = "A personal workspace, securely yours.";
    content = (
      <>
        <div className="account-card">
          <span className="avatar">SC</span>
          <h3>{ctx.user?.name || "Studio creator"}</h3>
          <p>{ctx.user?.email || "Signed in through the hosting platform"}</p>
        </div>
        <a
          className="btn primary"
          href="/signout-with-chatgpt?return_to=%2Fauth"
          target="_top"
        >
          Sign out
        </a>
        {notice(
          "Your authenticated account owns the saved workspace. Demo members do not grant access.",
        )}
      </>
    );
  } else if (m === "workspace") {
    title = "Your workspace";
    description = "One home for your projects, people, and knowledge.";
    content = (
      <>
        <div className="proposal-card">
          <span className="badge success">Active workspace</span>
          <h3>{ctx.ws.settings.name}</h3>
          <p>
            {ctx.ws.projects.length} projects · {ctx.ws.knowledge.length}{" "}
            knowledge sources
          </p>
        </div>
        {action("Manage workspace", () => {
          close();
          ctx.nav("settings");
        })}
      </>
    );
  } else {
    title = "Architect 2.0 · Product preview";
    description = "Your ideas. Your agents. Your rules.";
    content = (
      <>
        <h3>Working in this experience</h3>
        <p>
          Project creation, blueprint editing, agent configuration, preview
          interactions, records, settings, JSON export, and authenticated
          workspace persistence.
        </p>
        <h3>Demonstrated through safe simulations</h3>
        <p>
          AI generation, repository import, OAuth connections, file indexing,
          runtime execution, pull requests, and deployments of generated
          applications.
        </p>
        <p className="muted">
          Architect itself is a deployable web application. Its source
          repository and live URL are delivered separately.
        </p>
        {action("Keep exploring", close)}
      </>
    );
  }
  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent className="flow-modal">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="modal-body">
          {content}
          {error && m !== "new-agent" && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
function BookIcon() {
  return <Workflow />;
}
