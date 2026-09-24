/** Only the server's authenticated identity is used as the row key. */
export async function loadWorkspace(
  db: Pick<D1Database, "prepare">,
  userId: string,
) {
  const row = await db
    .prepare(
      "SELECT content, revision FROM architect_workspaces WHERE user_id = ?",
    )
    .bind(userId)
    .first<{ content: string; revision: number }>();
  return {
    state: row ? JSON.parse(row.content) : null,
    revision: row?.revision ?? 0,
  };
}
/** One SQL statement makes the revision comparison atomic, including first-save races. */
export async function saveWorkspace(
  db: Pick<D1Database, "prepare">,
  userId: string,
  content: string,
  revision: number,
) {
  const timestamp = new Date().toISOString();
  const result =
    revision === 0
      ? await db
          .prepare(
            "INSERT OR IGNORE INTO architect_workspaces (user_id, content, revision, updated_at) VALUES (?, ?, 1, ?)",
          )
          .bind(userId, content, timestamp)
          .run()
      : await db
          .prepare(
            "UPDATE architect_workspaces SET content = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?",
          )
          .bind(content, timestamp, userId, revision)
          .run();
  return result.meta.changes === 1;
}
