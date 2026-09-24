import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { webcrypto, pbkdf2Sync } from "node:crypto";
import vm from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
function setup() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  for (const name of readdirSync(root + "drizzle").filter(n => n.endsWith(".sql")).sort())
    sqlite.exec(readFileSync(root + "drizzle/" + name, "utf8"));
  const env = {
    POLL_GITHUB_TOKEN: "test-only-github-token",
    POLL_PASSWORD_HASH: "test-salt:" + pbkdf2Sync("test-password", "test-salt", 100000, 32, "sha256").toString("hex"),
    POLL_RATE_SECRET: "test-only-rate-secret",
    DB: {
      prepare(sql) {
        let args = [];
        const stmt = {
          bind(...values) { args = values; return stmt; },
          first() { return sqlite.prepare(sql).get(...args) ?? null; },
          all() { return { results: sqlite.prepare(sql).all(...args) }; },
          run() { return { meta: sqlite.prepare(sql).run(...args) }; },
          execute() {
            const prepared = sqlite.prepare(sql);
            return prepared.columns().length ? { results: prepared.all(...args) } : { results: [], meta: prepared.run(...args) };
          },
        };
        return stmt;
      },
      batch(statements) {
        sqlite.exec("BEGIN");
        try { const result = statements.map(s => s.execute()); sqlite.exec("COMMIT"); return result; }
        catch (error) { sqlite.exec("ROLLBACK"); throw error; }
      },
    },
  };
  let gitData = { schemaVersion: 1, polls: [] };
  let revision = 1;
  let failWrites = false;
  const gitFetch = async (_url, options) => {
    if (options.method === "GET") return Response.json({ sha: String(revision), content: Buffer.from(JSON.stringify(gitData)).toString("base64") });
    if (failWrites) return Response.json({}, {status:403});
    const body = JSON.parse(options.body);
    if (body.sha !== String(revision)) return Response.json({}, {status:409});
    gitData = JSON.parse(Buffer.from(body.content,"base64").toString("utf8"));
    revision++;
    return Response.json({commit:{sha:String(revision)}});
  };
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const exports = {};
    const compiled = ts.transpileModule(readFileSync(root + path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(compiled, {
      exports, Request, Response, URL, TextEncoder, TextDecoder, Uint8Array, btoa, atob, AbortSignal, setTimeout, fetch: gitFetch, crypto: webcrypto,
      require(name) {
        if (name === "cloudflare:workers") return { env };
        if (name.startsWith("@/")) return load(name.slice(2) + ".ts");
        return require(name);
      },
    });
    cache.set(path, exports);
    return exports;
  }
  const auth = load("lib/admin-auth.ts");
  const polls = load("app/api/admin/polls/route.ts");
  const removal = load("app/api/admin/polls/[id]/route.ts");
  const votes = load("app/api/polls/[id]/responses/route.ts");
  const publicPoll = load("app/api/polls/[id]/route.ts");
  const request = (method, body, token = "", ip = "192.0.2.1") => new Request("https://example.test/api", {
    method, headers: { "content-type": "application/json", "cf-connecting-ip": ip, ...(token ? { authorization: "Bearer " + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const signIn = async () => {
    const response = await auth.login(request("POST", { password: "test-password" }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    return (await response.json()).token;
  };
  return { sqlite, auth, polls, removal, votes, publicPoll, request, signIn, store:load("lib/poll-store.ts"), data:()=>gitData, fail:()=>{failWrites=true;} };
}

test("admin reads, creation and deletion reject missing and forged sessions", async () => {
  const s = setup();
  for (const token of ["", "a".repeat(64)]) {
    assert.equal((await s.polls.GET(s.request("GET", undefined, token))).status, 401);
    assert.equal((await s.polls.POST(s.request("POST", { question: "test" }, token))).status, 401);
    assert.equal((await s.removal.DELETE(s.request("DELETE", { confirmId: "test" }, token), { params: Promise.resolve({ id: "test" }) })).status, 401);
  }
  s.sqlite.close();
});

test("wrong passwords fail; sixth attempt is rate limited", async () => {
  const s = setup();
  for (let i=0;i<5;i++) assert.equal((await s.auth.login(s.request("POST", { password: "wrong" }))).status, 401);
  const response = await s.auth.login(s.request("POST", { password: "test-password" }));
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get("retry-after")) > 0);
  s.sqlite.close();
});

test("session token is stored hashed, expires and is revoked on logout", async () => {
  const s = setup();
  const token = await s.signIn();
  assert.equal(await s.auth.authorized(s.request("GET", undefined, token)), true);
  assert.notEqual(s.sqlite.prepare("SELECT token_hash FROM admin_sessions").get().token_hash, token);
  s.sqlite.exec("UPDATE admin_sessions SET expires_at = 0");
  assert.equal(await s.auth.authorized(s.request("GET", undefined, token)), false);
  const next = await s.signIn();
  await s.auth.endSession(s.request("DELETE", undefined, next));
  assert.equal(await s.auth.authorized(s.request("GET", undefined, next)), false);
  s.sqlite.close();
});

test("anonymous answer flow and confirmed deletion preserve other history", async () => {
  const s = setup();
  const token = await s.signIn();
  const create = async question => (await (await s.polls.POST(s.request("POST", {question}, token))).json()).poll.id;
  const existing = await create("Keep this history");
  const id = await create("Disposable test");
  const params = { params: Promise.resolve({ id }) };
  assert.equal((await s.votes.POST(s.request("POST", {answer:"Anonymous test answer"}),params)).status,201);
  assert.equal((await s.publicPoll.GET(s.request("GET"),params)).status,200);
  assert.equal((await s.removal.DELETE(s.request("DELETE", {confirmId:existing}, token),params)).status,400);
  assert.equal(s.data().polls.find(p=>p.id===id).answers.length,1);
  assert.equal((await s.removal.DELETE(s.request("DELETE", {confirmId:id}, token),params)).status,200);
  assert.equal(s.data().polls.some(p=>p.id===id),false);
  assert.ok(s.data().polls.find(p=>p.id===existing));
  assert.equal((await s.publicPoll.GET(s.request("GET"),params)).status,404);
  s.sqlite.close();
});

test("migration preserves IDs and unicode; concurrent writes preserve every answer", async()=>{
  const s=setup();
  s.sqlite.exec("INSERT INTO polls VALUES ('old','Вопрос ☀',123); INSERT INTO responses VALUES ('answer','old','Ответ ✓',124)");
  await s.store.listPolls();
  assert.equal(s.data().d1MigrationCompleted,true);
  assert.equal(s.data().polls[0].answers[0].id,'answer');
  await Promise.all(Array.from({length:4},(_,i)=>s.store.answerPoll('old','Ответ '+i)));
  assert.equal(s.data().polls[0].answers.length,5);
  await s.store.deletePoll('old');
  assert.equal((await s.store.listPolls()).length,0);
  assert.equal(s.sqlite.prepare('SELECT COUNT(*) AS n FROM responses').get().n,1);
  s.sqlite.close();
});
test("failed GitHub write reports failure without accepting an answer",async()=>{
  const s=setup(); const p=await s.store.createPoll('test'); s.fail();
  const result=await s.votes.POST(s.request('POST',{answer:'will fail'}),{params:Promise.resolve({id:p.id})});
  assert.equal(result.status,503); assert.equal(s.data().polls[0].answers.length,0); s.sqlite.close();
});
