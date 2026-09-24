import { workspaceInput } from "@/db/validation";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { workspaceDb } from "@/db/workspace";
import { readBoundedJson, privateJson, RequestError } from "@/db/http";
import { loadWorkspace, saveWorkspace } from "@/db/workspace-repository";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user)
      return privateJson({ error: "Sign in to save your workspace" }, 401);
    const saved = await loadWorkspace(workspaceDb(), user.userId);
    if (saved.state !== null && !workspaceInput.safeParse(saved).success)
      throw new Error("Stored workspace failed validation");
    return privateJson({
      ...saved,
      user: { name: user.displayName, email: user.email },
    });
  } catch {
    console.error("workspace_load_failed");
    return privateJson(
      { error: "Your workspace could not be loaded. Please try again." },
      503,
    );
  }
}
export async function PUT(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return privateJson({ error: "Sign in required" }, 401);
    const validated = workspaceInput.safeParse(await readBoundedJson(request));
    if (!validated.success)
      return privateJson({ error: "Invalid workspace" }, 400);
    const { state, revision } = validated.data;
    const changed = await saveWorkspace(
      workspaceDb(),
      user.userId,
      JSON.stringify(state),
      revision,
    );
    if (!changed)
      return privateJson(
        {
          error:
            "This workspace changed in another tab. Export your edits, then reload before saving again.",
        },
        409,
      );
    return privateJson({ revision: revision + 1 });
  } catch (error) {
    if (error instanceof RequestError)
      return privateJson({ error: error.message }, error.status);
    console.error("workspace_save_failed");
    return privateJson(
      { error: "Could not save. Your edits are still on screen." },
      503,
    );
  }
}
