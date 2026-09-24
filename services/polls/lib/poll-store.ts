import { env } from "cloudflare:workers";

type Answer = { id: string; answer: string; createdAt: number };
export type Poll = { id: string; question: string; createdAt: number; answers: Answer[] };
type Document = { schemaVersion: number; polls: Poll[]; d1MigrationCompleted?: boolean; updatedAt?: string };
const endpoint = "https://api.github.com/repos/Glefrit/it-therapy-site/contents/data/polls.json";
const encode = (text: string) => btoa(Array.from(new TextEncoder().encode(text), b => String.fromCharCode(b)).join(""));
const decode = (text: string) => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g, "")), c => c.charCodeAt(0)));

export class StorageError extends Error {}
export class MissingPoll extends Error {}

async function api(method: string, body?: unknown) {
  if (!env.POLL_GITHUB_TOKEN) throw new StorageError("GitHub unavailable");
  try {
    return await fetch(endpoint + (method === "GET" ? "?ref=main" : ""), {
      method, cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${env.POLL_GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "it-therapy-polls", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch { throw new StorageError("GitHub unavailable"); }
}

async function read() {
  const response = await api("GET");
  if (!response.ok) throw new StorageError("GitHub read failed");
  const file = await response.json() as { sha: string; content: string; encoding: string };
  let data: Document;
  try { data = JSON.parse(decode(file.content)); } catch { throw new StorageError("Invalid data file"); }
  if (data.schemaVersion !== 1 || !Array.isArray(data.polls) || data.polls.some(p => !Array.isArray(p.answers))) throw new StorageError("Invalid data schema");
  return { sha: file.sha, data };
}

async function update<T>(message: string, change: (data: Document) => T) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { sha, data } = await read();
    const result = change(data);
    data.updatedAt = new Date().toISOString();
    const content = encode(JSON.stringify(data, null, 2) + "\n");
    if (content.length > 1250000) throw new StorageError("Data file capacity reached");
    const response = await api("PUT", { sha, content, branch: "main", message: message + " [skip ci]" });
    if (response.ok) return result;
    if (response.status !== 409 && response.status !== 422) throw new StorageError("GitHub write failed");
    await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
  }
  throw new StorageError("Concurrent update limit reached");
}

// All new requests write to Git. Import the old data once, preserving IDs.
// Concurrent import attempts recheck the marker inside the SHA-protected update.
async function ready() {
  const current = await read();
  if (current.data.d1MigrationCompleted) return current.data;
  const polls = await env.DB.prepare("SELECT id, question, created_at AS createdAt FROM polls").all<Omit<Poll, "answers">>();
  const responses = await env.DB.prepare("SELECT id, poll_id AS pollId, answer, created_at AS createdAt FROM responses").all<Answer & { pollId: string }>();
  await update("Migrate existing anonymous polls to Git", data => {
    if (data.d1MigrationCompleted) return;
    // D1 is authoritative before the switch; replace the earlier export snapshot.
    data.polls = polls.results.map(p => ({ ...p, answers: responses.results.filter(a => a.pollId === p.id).map(({ id, answer, createdAt }) => ({ id, answer, createdAt })) }));
    data.d1MigrationCompleted = true;
  });
  return (await read()).data;
}

export async function listPolls() { return (await ready()).polls; }
export async function createPoll(question: string) {
  await ready();
  const poll: Poll = { id: crypto.randomUUID().replaceAll("-", "").slice(0, 12), question, createdAt: Date.now(), answers: [] };
  return update("Create poll " + poll.id, data => {
    if (!data.polls.some(p => p.id === poll.id)) data.polls.unshift(poll);
    return poll;
  });
}
export async function answerPoll(id: string, answer: string) {
  await ready();
  const item: Answer = { id: crypto.randomUUID(), answer, createdAt: Date.now() };
  return update("Answer poll " + id, data => {
    const poll = data.polls.find(p => p.id === id);
    if (!poll) throw new MissingPoll();
    if (!poll.answers.some(a => a.id === item.id)) poll.answers.unshift(item);
  });
}
export async function deletePoll(id: string) {
  await ready();
  return update("Remove poll " + id, data => {
    if (!data.polls.some(p => p.id === id)) throw new MissingPoll();
    data.polls = data.polls.filter(p => p.id !== id);
  });
}
export function storageFailure(error: unknown) {
  return Response.json({ error: error instanceof MissingPoll ? "Опрос не найден" : "Хранилище временно недоступно. Попробуйте ещё раз." }, { status: error instanceof MissingPoll ? 404 : 503, headers: { "Cache-Control": "no-store" } });
}
