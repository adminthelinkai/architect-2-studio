import type { Project } from "./model";
/** A replaceable integration boundary. No network requests or real Git credentials. */
export const demoGitAdapter = {
  commit(project: Project, message: string) {
    if (!project.repo)
      throw new Error("Connect a repository before simulating sync.");
    const snapshot = projectSnapshot(project);
    if (
      project.delivery?.reviewed !== snapshot ||
      project.delivery?.verified !== snapshot
    )
      throw new Error("Review and validate the current changes first.");
    return {
      id: crypto.randomUUID(),
      message,
      snapshot,
      date: new Date().toISOString(),
    };
  },
};
export function projectSnapshot(p: Project) {
  return JSON.stringify({
    blueprint: p.blueprint,
    code: p.code,
    agents: p.agents,
    title: p.title,
  });
}
export function projectFiles(p: Project): Record<string, string> {
  return {
    "src/application.ts": p.code,
    "requirements/product.md": p.blueprint,
    "agents/workflow.json": JSON.stringify(
      {
        framework: p.framework,
        agents: p.agents,
        publish: { requiresHumanApproval: !!p.delivery },
      },
      null,
      2,
    ),
    "src/publish-policy.ts": `// Generated reference artifact; not an external runtime\nexport function canPublish(review: { approved: boolean }) {\n  return ${p.delivery ? "review.approved === true" : "false; // Define a release policy first"};\n}\n`,
  };
}
