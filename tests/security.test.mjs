import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import { readBoundedJson, RequestError, privateJson } from "../db/http.ts";
import { workspaceInput } from "../db/validation.ts";
import { seedWorkspace } from "../components/architect/model.ts";
import { loadWorkspace, saveWorkspace } from "../db/workspace-repository.ts";
const request = (body, headers = {}) =>
  new Request("https://architect.test/api/workspace", {
    method: "PUT",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
const rejected = (r, status) =>
  assert.rejects(
    () => readBoundedJson(r),
    (e) => e instanceof RequestError && e.status === status,
  );
test("valid JSON accepts same-origin requests", async () =>
  assert.deepEqual(
    await readBoundedJson(
      request('{"ok":true}', { origin: "https://architect.test" }),
    ),
    { ok: true },
  ));
test("cross-origin writes are denied", () =>
  rejected(request("{}", { origin: "https://other.test" }), 403));
test("fetch metadata rejects cross-site requests without Origin", () =>
  rejected(request("{}", { "sec-fetch-site": "cross-site" }), 403));
test("non-JSON media types are denied", () =>
  rejected(request("{}", { "content-type": "text/plain" }), 415));
test("malformed JSON is rejected", () => rejected(request("{"), 400));
test("declared oversized content is rejected early", () =>
  rejected(request("{}", { "content-length": "600001" }), 413));
test("byte limit cannot be bypassed with Unicode", () =>
  rejected(request(JSON.stringify("界".repeat(210000))), 413));
test("streamed request cannot bypass the limit", () => {
  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < 7; i++) controller.enqueue(new Uint8Array(100000));
      controller.close();
    },
  });
  return rejected(
    new Request("https://architect.test/api/workspace", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: stream,
      duplex: "half",
    }),
    413,
  );
});
test("private error responses are not cacheable", () => {
  const response = privateJson({ error: "Sign in required" }, 401);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});
test("seed workspace satisfies the shared schema", () =>
  assert.equal(
    workspaceInput.safeParse({ state: seedWorkspace(), revision: 0 }).success,
    true,
  ));
test("duplicate projects cannot ambiguously update multiple records", () => {
  const state = seedWorkspace();
  state.projects.push(state.projects[0]);
  assert.equal(workspaceInput.safeParse({ state, revision: 0 }).success, false);
});
test("duplicate agent IDs are rejected", () => {
  const state = seedWorkspace();
  state.projects[0].agents.push(state.projects[0].agents[0]);
  assert.equal(workspaceInput.safeParse({ state, revision: 0 }).success, false);
});
test("route-breaking project IDs are rejected", () => {
  const state = seedWorkspace();
  state.projects[0].id = "../../other";
  assert.equal(workspaceInput.safeParse({ state, revision: 0 }).success, false);
});
test("unsafe revision counters are rejected", () =>
  assert.equal(
    workspaceInput.safeParse({
      state: seedWorkspace(),
      revision: Number.MAX_SAFE_INTEGER,
    }).success,
    false,
  ));
test("nonfinite budgets cannot enter stored state", () => {
  const state = seedWorkspace();
  state.settings.budget = Infinity;
  assert.equal(workspaceInput.safeParse({ state, revision: 0 }).success, false);
});
// Real SQLite executes the same statements as D1; no mocked SQL comparison results.
function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    fs.readFileSync(
      new URL("../drizzle/0000_lucky_shriek.sql", import.meta.url),
      "utf8",
    ),
  );
  return {
    close: () => sqlite.close(),
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              return sqlite.prepare(sql).get(...args) ?? null;
            },
            async run() {
              const r = sqlite.prepare(sql).run(...args);
              return { meta: { changes: Number(r.changes) } };
            },
          };
        },
      };
    },
  };
}
test("two authenticated identities have independent workspaces", async () => {
  const db = database();
  try {
    await saveWorkspace(db, "alice", '{"private":"alice"}', 0);
    await saveWorkspace(db, "bob", '{"private":"bob"}', 0);
    assert.deepEqual((await loadWorkspace(db, "alice")).state, {
      private: "alice",
    });
    assert.deepEqual((await loadWorkspace(db, "bob")).state, {
      private: "bob",
    });
    assert.equal((await loadWorkspace(db, "unknown")).state, null);
  } finally {
    db.close();
  }
});
test("stale updates cannot overwrite a newer revision", async () => {
  const db = database();
  try {
    assert.equal(await saveWorkspace(db, "alice", '{"version":1}', 0), true);
    assert.equal(await saveWorkspace(db, "alice", '{"version":2}', 1), true);
    assert.equal(await saveWorkspace(db, "alice", '{"version":3}', 1), false);
    assert.deepEqual(await loadWorkspace(db, "alice"), {
      state: { version: 2 },
      revision: 2,
    });
  } finally {
    db.close();
  }
});
test("concurrent first saves do not replace the first workspace", async () => {
  const db = database();
  try {
    const results = await Promise.all([
      saveWorkspace(db, "alice", '{"first":true}', 0),
      saveWorkspace(db, "alice", '{"first":false}', 0),
    ]);
    assert.deepEqual(results, [true, false]);
    assert.equal((await loadWorkspace(db, "alice")).state.first, true);
  } finally {
    db.close();
  }
});
test("SQL-shaped identifiers remain literal bound parameters", async () => {
  const db = database();
  try {
    await saveWorkspace(db, "x' OR 1=1 --", '{"safe":true}', 0);
    assert.equal((await loadWorkspace(db, "x")).state, null);
    assert.equal((await loadWorkspace(db, "x' OR 1=1 --")).state.safe, true);
  } finally {
    db.close();
  }
});
