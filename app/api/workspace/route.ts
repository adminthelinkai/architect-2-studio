import { workspaceInput } from "@/db/validation";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { workspaceDb } from "@/db/workspace";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user)
      return Response.json(
        { error: "Sign in to save your workspace" },
        { status: 401 },
      );
    const row = await workspaceDb()
      .prepare(
        "SELECT content, revision FROM architect_workspaces WHERE user_id = ?",
      )
      .bind(user.userId)
      .first<{ content: string; revision: number }>();
    return Response.json(
      {
        state: row ? JSON.parse(row.content) : null,
        revision: row?.revision ?? 0,
        user: { name: user.displayName, email: user.email },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("workspace_load_failed", error);
    return Response.json(
      { error: "Your workspace could not be loaded. Please try again." },
      { status: 503 },
    );
  }
}
export async function PUT(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user)
      return Response.json({ error: "Sign in required" }, { status: 401 });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      return Response.json({ error: "Origin not allowed" }, { status: 403 });
    const raw = await request.text();
    if (raw.length > 600000)
      return Response.json(
        { error: "Workspace exceeds the prototype storage limit" },
        { status: 413 },
      );
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const validated = workspaceInput.safeParse(body);
    const state = validated.success ? validated.data.state : null;
    if (!validated.success)
      return Response.json({ error: "Invalid workspace" }, { status: 400 });
    const content = JSON.stringify(state);
    const db = workspaceDb();
    let result;
    if (body.revision === 0) {
      result = await db
        .prepare(
          "INSERT OR IGNORE INTO architect_workspaces (user_id, content, revision, updated_at) VALUES (?, ?, 1, ?)",
        )
        .bind(user.userId, content, new Date().toISOString())
        .run();
    } else {
      result = await db
        .prepare(
          "UPDATE architect_workspaces SET content = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?",
        )
        .bind(content, new Date().toISOString(), user.userId, body.revision)
        .run();
    }
    if (!result.meta.changes)
      return Response.json(
        {
          error:
            "This workspace changed in another tab. Reload before saving again.",
        },
        { status: 409 },
      );
    return Response.json(
      { revision: body.revision + 1 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("workspace_save_failed", error);
    return Response.json(
      { error: "Could not save. Your edits are still on screen." },
      { status: 503 },
    );
  }
}
