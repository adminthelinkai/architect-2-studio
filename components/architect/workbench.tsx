"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  LayoutGrid,
  FolderOpen,
  Workflow,
  Layers,
  Plug,
  BookOpen,
  Settings,
  ChevronDown,
  Search,
  Bell,
  Activity,
  ArrowLeft,
  Code2,
  Compass,
  Check,
  Cloud,
  LoaderCircle,
  Download,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command as CommandRoot,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Toaster, toast } from "sonner";
import { Workspace, Project, createProject, inferName } from "./model";
import {
  HomeView,
  ProjectsView,
  TemplatesView,
  LibraryView,
  ConnectionsView,
  KnowledgeView,
  SettingsView,
  UsageView,
  ActivityView,
} from "./workspace-views";
import { ProjectView } from "./project-view";
import { StartView, PortabilityView } from "./launch-views";
import { useWorkspace } from "./use-workspace";
import { FlowModal } from "./flow-modal";
type Account = { name: string; email: string } | null;
export type ModalPayload = {
  name?: string;
  id?: string;
  agentId?: string;
  brief?: string;
  framework?: string;
  kind?: string;
  description?: string;
  type?: string;
  title?: string;
  detail?: string;
  status?: string;
  scope?: string;
  connected?: boolean;
  environment?: string;
  date?: string;
  version?: string;
  index?: number;
};
type NavigationContext = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: object;
      execute: (input: unknown) => Promise<{ section: string }>;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export type Context = {
  ws: Workspace;
  setWs: React.Dispatch<React.SetStateAction<Workspace>>;
  project: Project | undefined;
  page: string;
  projectId: string;
  nav: (page: string, id?: string) => void;
  modal: string;
  setModal: (s: string) => void;
  developer: boolean;
  setDeveloper: (v: boolean) => void;
  patch: (data: Partial<Project>, id?: string) => void;
  create: (
    name: string,
    brief: string,
    framework?: string,
    kind?: string,
  ) => void;
  toast: typeof toast;
  payload: ModalPayload;
  setPayload: (p: ModalPayload) => void;
  user: Account;
  saveStatus: string;
  exportProject: () => void;
};
export default function Workbench({ user }: { user: Account }) {
  const {
    ws,
    setWs,
    loaded,
    saveStatus,
    saveError,
    saveConflict,
    retryLoad,
    retrySave,
  } = useWorkspace();
  const initials = (user?.name || "Studio creator").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const [page, setPage] = useState("overview");
  const [projectId, setProjectId] = useState("");
  const [modal, setModal] = useState("");
  const [payload, setPayload] = useState<ModalPayload>({});
  const [developer, setDeveloper] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const parse = () => {
      const parts = location.hash.slice(1).split("/");
      if (parts[0] === "project" && parts[1]) {
        setProjectId(parts[1]);
        setPage(parts[2] || "build");
      } else {
        setProjectId("");
        setPage(parts[0] || "overview");
      }
    };
    // Synchronize the initial route with the browser hash after hydration.
    parse();
    window.addEventListener("hashchange", parse);
    // Restore the browser-only preference after server hydration.
    try {
      // Restore an external browser preference after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeveloper(localStorage.getItem("architect-view") === "developer");
    } catch {
      /* Storage can be unavailable in privacy mode. */
    }
    return () => window.removeEventListener("hashchange", parse);
  }, []);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "architect-view",
        developer ? "developer" : "guided",
      );
    } catch {
      /* The preference is optional. */
    }
  }, [developer]);
  const nav = (p: string, id = "") => {
    window.location.assign(id ? `#project/${id}/${p}` : `#${p}`);
    setPage(p);
    setProjectId(id);
  };
  const project = ws.projects.find((p) => p.id === projectId);
  const patch = (data: Partial<Project>, id = projectId) =>
    setWs((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  const create = (
    name: string,
    brief: string,
    framework = "Lyzr",
    kind = "support",
  ) => {
    const p = createProject(name || inferName(brief), brief, framework, kind);
    setWs((s) => ({ ...s, projects: [p, ...s.projects] }));
    setModal("");
    nav("blueprint", p.id);
    toast.success("Your project blueprint is ready");
  };
  const exportProject = (all = false) => {
    const content = JSON.stringify(all ? ws : project || ws, null, 2);
    const a = document.createElement("a");
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    a.href = url;
    a.download = `${(!all && project?.name) || "architect-workspace"}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Project configuration exported");
  };
  const ctx: Context = {
    ws,
    setWs,
    project,
    page,
    projectId,
    nav,
    modal,
    setModal,
    developer,
    setDeveloper,
    patch,
    create,
    toast,
    payload,
    setPayload,
    user,
    saveStatus,
    exportProject,
  };
  useEffect(() => {
    const context = (
      document as Document & { modelContext?: NavigationContext }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "architect_navigate",
          description:
            "Open an Architect workspace section. Does not create or deploy applications.",
          inputSchema: {
            type: "object",
            properties: {
              section: {
                type: "string",
                enum: [
                  "overview",
                  "projects",
                  "library",
                  "templates",
                  "connections",
                  "knowledge",
                  "settings",
                  "usage",
                ],
              },
            },
            required: ["section"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: async (value: unknown) => {
            const input = value as { section?: unknown };
            if (!input || typeof input.section !== "string")
              throw new Error("Unknown section");
            if (
              ![
                "overview",
                "projects",
                "library",
                "templates",
                "connections",
                "knowledge",
                "settings",
                "usage",
              ].includes(input.section)
            )
              throw new Error("Unknown section");
            nav(input.section);
            await new Promise((r) => requestAnimationFrame(r));
            return { section: input.section };
          },
        },
        { signal: controller.signal },
      ),
    ).catch(() => {});
    return () => controller.abort();
  }, []);
  const menu = [
    { name: "Overview", id: "overview", icon: LayoutGrid },
    { name: "Getting started", id: "start", icon: Compass },
    { name: "All projects", id: "projects", icon: FolderOpen },
    { name: "Agent library", id: "library", icon: Workflow },
    { name: "Templates", id: "templates", icon: Layers },
    { name: "Connections", id: "connections", icon: Plug },
    { name: "Knowledge", id: "knowledge", icon: BookOpen },
    { name: "Project portability", id: "portability", icon: Download },
  ];
  const projectMenu = [
    { name: "Build", id: "build", icon: Code2 },
    { name: "Blueprint", id: "blueprint", icon: Compass },
    { name: "Agents & workflows", id: "agents", icon: Workflow },
    { name: "Data & identity", id: "data", icon: Layers },
    { name: "Test lab", id: "tests", icon: Check },
    { name: "Evidence & readiness", id: "readiness", icon: Check },
    { name: "Release", id: "release", icon: Cloud },
    { name: "Monitor", id: "monitor", icon: Activity },
  ];
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "232px" } as React.CSSProperties}
    >
      <SidebarNavigationCloser />
      <Toaster position="bottom-right" richColors closeButton />
      <Sidebar className="architect-sidebar" inert={!loaded}>
        <SidebarHeader className="studio-sidebar-header">
          <a className="brand" href="#overview">
            <span className="brandmark">a</span>architect
            <span className="version">2.0</span>
          </a>
          <button
            className="workspace-switch"
            onClick={() => setModal("workspace")}
          >
            <span className="workspace-icon">S</span>
            <span>
              {ws.settings.name}
              <small>Personal workspace</small>
            </span>
            <ChevronDown size={15} />
          </button>
          <button
            className="new-project"
            onClick={() => {
              setPayload({});
              setModal("create");
            }}
          >
            <Plus size={17} /> New project <kbd>⌘ K</kbd>
          </button>
        </SidebarHeader>
        <SidebarContent
          className="studio-sidebar-nav"
          role="navigation"
          aria-label="Workspace navigation"
        >
          {project ? (
            <>
              <button
                className="back-workspace"
                onClick={() => nav("overview")}
              >
                <ArrowLeft size={14} /> Back to workspace
              </button>
              <SidebarGroup>
                <SidebarGroupLabel>{project.name}</SidebarGroupLabel>
                <SidebarMenu>
                  {projectMenu.map(({ name, id, icon: Icon }) => (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        onClick={() => nav(id, project.id)}
                        isActive={page === id}
                      >
                        <Icon />
                        <span>{name}</span>
                        {id === "agents" && (
                          <small className="nav-count">
                            {project.agents.length}
                          </small>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
              <div className="sidebar-project-status">
                <span className="eyebrow">CURRENT ENVIRONMENT</span>
                <p>
                  <span className="status-dot green" />
                  Development sandbox
                </p>
                <small>External actions are simulated</small>
              </div>
            </>
          ) : (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
                <SidebarMenu>
                  {menu.map(({ name, id, icon: Icon }) => (
                    <SidebarMenuItem key={id}>
                      <SidebarMenuButton
                        onClick={() => nav(id)}
                        isActive={page === id}
                      >
                        <Icon />
                        <span>{name}</span>
                        {id === "projects" && (
                          <small className="nav-count">
                            {ws.projects.length}
                          </small>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>RECENT PROJECTS</SidebarGroupLabel>
                <SidebarMenu>
                  {ws.projects.slice(0, 4).map((p, i) => (
                    <SidebarMenuItem key={p.id}>
                      <SidebarMenuButton onClick={() => nav("build", p.id)}>
                        <span className={"project-dot dot-" + i} />
                        <span className="truncate">{p.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>
        <SidebarFooter className="studio-sidebar-footer">
          <button
            className="usage-compact"
            onClick={() => nav("usage")}
            aria-label="Usage and budgets: 1,240 demo credits remaining"
          >
            <span>Usage & budgets</span>
            <small>1,240 demo</small>
          </button>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => nav("settings")}
                isActive={page === "settings"}
              >
                <Settings />
                Settings & members
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <button className="profile" onClick={() => setModal("account")}>
            <span className="avatar">{initials}</span>
            <span>
              {user?.name || "Studio creator"}
              <small>{user ? "Connected account" : "Explore workspace"}</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="topbar">
          <div className="top-title">
            <SidebarTrigger />
            <button onClick={() => nav("overview")}>
              {project ? "Projects" : "Workspace"}
            </button>
            <span>/</span>
            <b>
              {project
                ? project.name
                : menu.find((m) => m.id === page)?.name ||
                  (
                    {
                      usage: "Usage & budgets",
                      settings: "Settings",
                      activity: "Activity",
                    } as Record<string, string>
                  )[page]}
            </b>
            {project && <span className="branch-chip">{project.branch}</span>}
          </div>
          <div className="top-actions">
            {project && (
              <button
                className={"view-toggle " + (developer ? "developer" : "")}
                onClick={() => setDeveloper(!developer)}
              >
                {developer ? <Code2 size={14} /> : <Compass size={14} />}
                <span>{developer ? "Developer" : "Guided"}</span>
              </button>
            )}
            <button
              aria-label="Search workspace"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
              <kbd>⌘ K</kbd>
            </button>
            <button
              aria-label="Activity and approvals"
              onClick={() => nav("activity")}
              className="notification-button"
            >
              <Bell size={18} />
              {ws.settings.notifications &&
                ws.approvals.some((a) => a.status === "Pending") && <i />}
            </button>
            <button aria-label="Account" onClick={() => setModal("account")}>
              <span className="avatar small">{initials}</span>
            </button>
          </div>
        </header>
        {saveError && (
          <div className="save-error" role="alert">
            <span>{saveError}</span>
            <button
              onClick={() => {
                if (saveConflict) {
                  exportProject(true);
                  return;
                }
                if (!loaded) retryLoad();
                else retrySave();
              }}
            >
              {" "}
              {saveConflict
                ? "Export unsaved changes"
                : !loaded
                  ? "Retry loading"
                  : "Retry save"}
            </button>
            {saveConflict && (
              <button onClick={() => location.reload()}>
                Reload workspace
              </button>
            )}
          </div>
        )}
        {!loaded ? (
          <main className="page" aria-busy={!saveError}>
            <h1>
              {saveError
                ? "Your workspace could not be loaded"
                : "Loading your workspace…"}
            </h1>
            <p>Editing starts after your saved work is loaded.</p>
          </main>
        ) : project ? (
          <ProjectView key={project.id} ctx={ctx} />
        ) : page === "overview" ? (
          <HomeView ctx={ctx} />
        ) : page === "start" ? (
          <StartView ctx={ctx} />
        ) : page === "portability" ? (
          <PortabilityView ctx={ctx} />
        ) : page === "projects" ? (
          <ProjectsView ctx={ctx} />
        ) : page === "templates" ? (
          <TemplatesView ctx={ctx} />
        ) : page === "library" ? (
          <LibraryView ctx={ctx} />
        ) : page === "connections" ? (
          <ConnectionsView ctx={ctx} />
        ) : page === "knowledge" ? (
          <KnowledgeView ctx={ctx} />
        ) : page === "settings" ? (
          <SettingsView ctx={ctx} />
        ) : page === "usage" ? (
          <UsageView ctx={ctx} />
        ) : page === "activity" ? (
          <ActivityView ctx={ctx} />
        ) : (
          <div className="page">
            <h1>Project not found</h1>
            <button className="btn primary" onClick={() => nav("overview")}>
              Back to workspace
            </button>
          </div>
        )}
        <div className="save-indicator" aria-live="polite">
          {saveStatus === "All changes saved" ? (
            <Check size={12} />
          ) : saveStatus === "Saving changes" ? (
            <LoaderCircle size={12} className="spin" />
          ) : (
            <Cloud size={12} />
          )}{" "}
          {saveStatus}
        </div>
      </SidebarInset>
      {loaded && <FlowModal ctx={ctx} />}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="command-modal">
          <DialogTitle className="sr-only">Search workspace</DialogTitle>
          <DialogDescription className="sr-only">
            Find projects and navigate your workspace
          </DialogDescription>
          <CommandRoot>
            <CommandInput placeholder="Find a project or jump to…" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Workspace">
                {menu.map((m) => (
                  <CommandItem
                    key={m.id}
                    onSelect={() => {
                      nav(m.id);
                      setSearchOpen(false);
                    }}
                  >
                    <m.icon size={16} />
                    {m.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Projects">
                {ws.projects.map((p) => (
                  <CommandItem
                    key={p.id}
                    onSelect={() => {
                      nav("build", p.id);
                      setSearchOpen(false);
                    }}
                  >
                    <FolderOpen size={16} />
                    {p.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Actions">
                <CommandItem
                  onSelect={() => {
                    setSearchOpen(false);
                    setModal("create");
                  }}
                >
                  <Plus size={16} />
                  Create a new project
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setSearchOpen(false);
                    setModal("import");
                  }}
                >
                  <Download size={16} />
                  Import a project
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandRoot>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
function SidebarNavigationCloser() {
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    const close = () => setOpenMobile(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [setOpenMobile]);
  return null;
}
