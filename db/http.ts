export const MAX_WORKSPACE_BYTES = 600_000;
export class RequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
/** Enforce the byte limit while reading, before parsing or retaining the full request. */
export async function readBoundedJson(request: Request): Promise<unknown> {
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new RequestError(403, "Origin not allowed");
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new RequestError(415, "Use application/json");
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_WORKSPACE_BYTES)
    throw new RequestError(
      413,
      "Workspace exceeds the prototype storage limit",
    );
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "Invalid JSON");
  let size = 0,
    raw = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_WORKSPACE_BYTES) {
        await reader.cancel();
        throw new RequestError(
          413,
          "Workspace exceeds the prototype storage limit",
        );
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    return JSON.parse(raw);
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(400, "Invalid JSON");
  } finally {
    reader.releaseLock();
  }
}
export function privateJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie, oai-authenticated-user-id",
    },
  });
}
