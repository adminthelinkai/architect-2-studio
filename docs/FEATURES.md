# Feature and journey map

| Journey            | Experience                                                                                | Status                                                       |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Sign in            | Auth introduction → platform sign-in → personal workspace                                 | Real platform authentication; local simulator in development |
| Prompt to project  | Brief → framework → blueprint → build workspace                                           | Saved configuration; generation simulated                    |
| Existing project   | GitHub URL or ZIP → validation → inspection → workspace                                   | Metadata only; source is not fetched                         |
| Idea consultant    | Role and friction → opportunity template → blueprint                                      | Guided template                                              |
| Templates          | Category filter → detail → use template                                                   | Creates an editable project                                  |
| Guided / Developer | One shared project, preview or code/log workspace                                         | Working view preference                                      |
| Build              | Ask / Plan / Build → explanation or blueprint refinement or heading iteration             | Deterministic simulation; saved edits                        |
| Visual editing     | Heading and accent → interactive preview                                                  | Working                                                      |
| Example code       | Code editor → save → export                                                               | Saved example; not executed                                  |
| Blueprint          | Edit intent → impact review → linked agents/data/tests/build                              | Working configuration; impact analysis illustrative          |
| Agents             | Canvas/list/contract → inspector → tools/model/budget/approval                            | Saved agent definitions                                      |
| Any framework      | Lyzr, LangGraph, CrewAI, OpenAI Agents SDK, Google ADK, custom runtime, external endpoint | Native/adapter/endpoint contract UX; no execution engine     |
| Knowledge          | File/website metadata → library → sample retrieval                                        | Metadata persists; content not uploaded/indexed              |
| Connections        | Service → scope → environment → authorize/disconnect                                      | Demo connection state; no OAuth                              |
| Data               | Records → validation → create/remove                                                      | Real persistence for demonstration records                   |
| App identity       | Auth enabled → provider setup guide                                                       | Demo policy, not generated-app authentication                |
| Storage/secrets    | Metadata upload; variable name definition                                                 | No secure secret storage; placeholder value discarded        |
| Tests              | Run suite → failed approval config → remediation → rerun                                  | Approval assertion real; other scenario results simulated    |
| Git                | Repository → branch → review summary → demo PR                                            | Saved labels and review; no Git mutation                     |
| Deploy             | Target/environment → readiness gate → failure/retry → success                             | Saved release record; no separate app hosted                 |
| Rollback           | Deployment history → select snapshot → rollback record                                    | Simulated; no restoration of runtime or project data         |
| Domain             | Hostname → DNS example → save intent                                                      | No domain operation                                          |
| Monitor            | Filter sample runs → trace → inspect evidence → replay                                    | Illustrative telemetry                                       |
| Approvals          | Review proposed action → approve/reject                                                   | Saved decision; external action never executed               |
| Team               | Email/role → validation → member record                                                   | No email sent or real access granted                         |
| Usage              | Sample metrics → budget configuration                                                     | Budget persists; no billing                                  |
| Portability        | Workspace/project export → JSON                                                           | Working download                                             |
| Version history    | Prompt snapshots → restore preview heading/brief                                          | Working scoped restoration                                   |
| Search             | Ctrl/Cmd K → projects, pages, actions                                                     | Working keyboard navigation                                  |

## Distinctive product decisions

1. A living blueprint connects human intent to the app, agents, data, and acceptance criteria.
2. Guided and Developer modes share state, so users can move between intent and implementation.
3. Capability passports make tools, model policy, budget, framework, and approval visible in one inspector.
4. A human approval boundary is carried from agent configuration to testing and release readiness.
5. Change-impact review, replay, and portable contracts make agent behavior understandable and ownership explicit.

## Scope boundaries

The product is a demonstrable UX prototype, not a production replacement for an IDE, sandbox service, LLM orchestrator, or deployment provider. Configuration is saved per authenticated site user. Demo invitations do not grant access. The hosted site itself remains owner-private unless the owner changes its audience through the hosting platform.
