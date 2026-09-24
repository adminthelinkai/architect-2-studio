export type Agent = {
  id: string;
  name: string;
  role: string;
  framework: string;
  model: string;
  instructions: string;
  tools: string[];
  approval: boolean;
  budget: number;
};
export type Version = {
  id: string;
  label: string;
  date: string;
  title: string;
  brief: string;
};
export type Delivery = {
  intent: string;
  before: string;
  reviewed: string;
  verified: string;
  commits: { id: string; message: string; snapshot: string; date: string }[];
};
export type Project = {
  delivery?: Delivery;
  id: string;
  name: string;
  description: string;
  kind: string;
  status: string;
  framework: string;
  brief: string;
  title: string;
  color: string;
  agents: Agent[];
  blueprint: string;
  messages: { role: string; text: string }[];
  history: Version[];
  repo: string;
  branch: string;
  tests: { name: string; status: string }[];
  deployments: {
    id: string;
    environment: string;
    date: string;
    version: string;
    status: string;
  }[];
  records: { id: string; name: string; email: string; role: string }[];
  auth: boolean;
  notes: string[];
  code: string;
};
export type Workspace = {
  projects: Project[];
  connections: {
    name: string;
    category: string;
    description: string;
    connected: boolean;
    scope: string;
  }[];
  knowledge: {
    id: string;
    name: string;
    type: string;
    size: string;
    status: string;
  }[];
  members: { name: string; email: string; role: string }[];
  approvals: { id: string; title: string; detail: string; status: string }[];
  settings: {
    name: string;
    budget: number;
    notifications: boolean;
    theme: string;
    knowledge: string;
  };
};
export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
export const frameworks = [
  "Lyzr",
  "LangGraph",
  "CrewAI",
  "OpenAI Agents SDK",
  "Google ADK",
  "Custom runtime",
  "External endpoint",
];
export const agentSeed = (
  name = "Triage agent",
  framework = "Lyzr",
): Agent => ({
  id: uid(),
  name,
  framework,
  role: "Classify incoming requests and route them to the right specialist.",
  model: "Auto · balanced",
  instructions:
    "Understand the request. Use approved knowledge sources. Cite your evidence. Escalate when confidence is low. Never perform consequential actions without approval.",
  tools: ["Knowledge search"],
  approval: true,
  budget: 2,
});
export function createProject(
  name: string,
  brief: string,
  framework = "Lyzr",
  kind = "support",
): Project {
  const id = uid();
  return {
    id,
    name,
    brief,
    framework,
    kind,
    description:
      kind === "research"
        ? "A team of agents. One clear answer."
        : kind === "portal"
          ? "Your customers, connected."
          : "Customer experience, thoughtfully automated",
    status: "Draft",
    title: name,
    color: "#7661c9",
    agents: [
      agentSeed(
        kind === "research" ? "Research agent" : "Triage agent",
        framework,
      ),
      {
        ...agentSeed("Knowledge agent", framework),
        role: "Retrieve relevant evidence from approved knowledge sources.",
      },
      {
        ...agentSeed(
          kind === "research" ? "Writer agent" : "Response agent",
          framework,
        ),
        role: "Compose a helpful, accurate response with citations.",
      },
    ],
    blueprint: `## Outcome\n${brief}\n\n## People & journeys\nCustomers submit a request, view progress, and receive a clear answer. Operators review escalations and approve consequential actions.\n\n## Experience\nDashboard, requests, knowledge library, and account settings. Responsive layouts with clear loading and error states.\n\n## Agent architecture\nA coordinator classifies the request, a knowledge agent retrieves evidence, and a response agent prepares the result. Human approval protects external actions.\n\n## Data & integrations\nUsers, requests, agent runs, and knowledge sources. Connect services explicitly and keep credentials environment-specific.\n\n## Acceptance criteria\nA user can submit a request and find the result. Missing evidence triggers escalation. Every external action is logged. Sensitive actions require approval.`,
    messages: [
      {
        role: "assistant",
        text: `Your ${name} workspace is ready. We can refine the blueprint, configure your agents, or explore the app preview. This is a simulated build environment; your workspace edits are saved.`,
      },
    ],
    history: [
      {
        id: uid(),
        label: "Initial workspace",
        date: new Date().toISOString(),
        title: name,
        brief,
      },
    ],
    repo: "",
    branch: "main",
    tests: [
      { name: "Customer submits a request", status: "Not run" },
      { name: "Agent cites a knowledge source", status: "Not run" },
      { name: "External action requires approval", status: "Not run" },
      { name: "Missing evidence escalates to a human", status: "Not run" },
      { name: "Access is limited to the correct role", status: "Not run" },
    ],
    deployments: [],
    records: [
      {
        id: "usr_01",
        name: "Alex Morgan",
        email: "alex@example.com",
        role: "Admin",
      },
      {
        id: "usr_02",
        name: "Jamie Chen",
        email: "jamie@example.com",
        role: "Member",
      },
    ],
    auth: true,
    notes: [],
    code: `// ${name} — editable example, not an executing runtime\nexport const application = {\n  name: ${JSON.stringify(name)},\n  framework: ${JSON.stringify(framework)},\n  approvalRequired: true,\n  knowledge: ["support-handbook"],\n  agents: ["triage", "knowledge", "response"],\n};\n`,
  };
}
export function seedWorkspace(): Workspace {
  const support = createProject(
    "Support Copilot",
    "Build a support portal that answers questions from our knowledge base and escalates sensitive requests.",
  );
  support.id = "support-copilot";
  support.status = "Deployed";
  support.deployments = [
    {
      id: "demo-release-01",
      environment: "Staging",
      date: "2026-09-24T08:00:00Z",
      version: "v1",
      status: "Succeeded",
    },
  ];
  const research = createProject(
    "Research Studio",
    "Research a topic, compare sources, and produce a cited report.",
    "LangGraph",
    "research",
  );
  research.id = "research-studio";
  const portal = createProject(
    "Customer Portal",
    "Create a customer workspace for requests, documents, and account management.",
    "OpenAI Agents SDK",
    "portal",
  );
  portal.id = "customer-portal";
  return {
    projects: [support, research, portal],
    connections: [
      {
        name: "GitHub",
        category: "Development",
        description: "Repositories, branches, and reviewable changes.",
        connected: false,
        scope: "Selected repositories",
      },
      {
        name: "Slack",
        category: "Communication",
        description: "Bring the right updates to your team.",
        connected: true,
        scope: "Read channels; draft messages",
      },
      {
        name: "Notion",
        category: "Knowledge",
        description: "Turn your team knowledge into agent context.",
        connected: true,
        scope: "Read selected pages",
      },
      {
        name: "Google Drive",
        category: "Knowledge",
        description: "Connect documents your agents can cite.",
        connected: false,
        scope: "Read selected files",
      },
      {
        name: "Supabase",
        category: "Data",
        description: "Database, authentication, and file storage.",
        connected: false,
        scope: "Project database access",
      },
      {
        name: "Stripe",
        category: "Payments",
        description: "Build payment flows with approval boundaries.",
        connected: false,
        scope: "Read payments; sandbox only",
      },
      {
        name: "Gmail",
        category: "Communication",
        description: "Draft and organize customer conversations.",
        connected: false,
        scope: "Read and draft; send requires approval",
      },
      {
        name: "Linear",
        category: "Development",
        description: "Turn issues into planned improvements.",
        connected: false,
        scope: "Read and create issues",
      },
      {
        name: "MCP server",
        category: "Custom",
        description: "Bring a tool server into your workspace.",
        connected: false,
        scope: "Select tools individually",
      },
    ],
    knowledge: [
      {
        id: "kb1",
        name: "Support handbook.md",
        type: "Document",
        size: "24 KB",
        status: "Ready",
      },
      {
        id: "kb2",
        name: "Product documentation",
        type: "Website",
        size: "18 pages",
        status: "Ready",
      },
      {
        id: "kb3",
        name: "Brand guidelines.pdf",
        type: "Design system",
        size: "1.2 MB",
        status: "Ready",
      },
    ],
    members: [
      { name: "Studio creator", email: "creator@example.com", role: "Owner" },
    ],
    approvals: [
      {
        id: "ap1",
        title: "Approve a customer refund",
        detail:
          "Response agent requests a $49 refund for request #1048. Policy allows refunds within 14 days.",
        status: "Pending",
      },
      {
        id: "ap2",
        title: "Send a follow-up email",
        detail:
          "Response agent prepared a resolution summary for Alex Morgan. Review before sending.",
        status: "Pending",
      },
    ],
    settings: {
      name: "Studio workspace",
      budget: 50,
      notifications: true,
      theme: "Violet",
      knowledge:
        "Keep interfaces clear and accessible. Cite sources. Ask before consequential external actions.",
    },
  };
}
export function inferName(prompt: string) {
  const words = prompt
    .replace(/^(build|create|make|design)\s+(me\s+)?(an?\s+)?/i, "")
    .split(/[.!?\n]/)[0]
    .split(" ")
    .slice(0, 5)
    .join(" ");
  return (
    words.charAt(0).toUpperCase() + words.slice(1) || "Untitled application"
  );
}
