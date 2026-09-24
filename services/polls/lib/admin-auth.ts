import { env } from "cloudflare:workers";

export const SESSION_SECONDS = 8 * 60 * 60;
const WINDOW_MS = 15 * 60 * 1000;
const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
export const hash = async (value: string) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

export function json(value: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", ...extra } });
}

// No cookies are used: the explicit Authorization header is also safe in an embedded panel.
export async function authorized(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return false;
  const session = await env.DB.prepare("SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?")
    .bind(await hash(token), Date.now()).first();
  return Boolean(session);
}

export async function endSession(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (token) await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?").bind(await hash(token)).run();
}

export async function login(request: Request) {
  const secret = env.POLL_PASSWORD_HASH;
  const pepper = env.POLL_RATE_SECRET;
  if (!secret || !pepper) return json({ error: "Вход временно недоступен" }, 503);
  const now = Date.now();
  const window = Math.floor(now / WINDOW_MS);
  // CF-Connecting-IP is supplied by the Worker ingress; don't trust forwarded browser headers.
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ipKey = await hash(pepper + ":" + ip);
  const buckets = [`ip:${ipKey}:${window}`, `global:${window}`];
  const counts = await env.DB.batch(buckets.map(key => env.DB.prepare(
    "INSERT INTO admin_login_limits (bucket, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET attempts = attempts + 1 RETURNING attempts"
  ).bind(key, (window + 2) * WINDOW_MS)));
  const attempts = counts.map(r => Number((r.results[0] as { attempts: number }).attempts));
  if (attempts[0] > 5 || attempts[1] > 30) {
    return json({ error: "Слишком много попыток. Попробуйте через 15 минут." }, 429, { "Retry-After": String(Math.ceil(((window + 1) * WINDOW_MS - now) / 1000)) });
  }
  let body: { password?: unknown };
  try { body = await request.json(); } catch { return json({ error: "Неверный формат запроса" }, 400); }
  if (typeof body?.password !== "string" || body.password.length > 128) return json({ error: "Неверный пароль" }, 401);
  const [salt, expected] = secret.split(":");
  if (!salt || !expected) return json({ error: "Вход временно недоступен" }, 503);
  const key = await crypto.subtle.importKey("raw", encoder.encode(body.password), "PBKDF2", false, ["deriveBits"]);
  const actual = hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256));
  let difference = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ (expected.charCodeAt(i) || 0);
  if (difference) return json({ error: "Неверный пароль" }, 401);
  const token = hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const expiresAt = now + SESSION_SECONDS * 1000;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at <= ?").bind(now),
    env.DB.prepare("DELETE FROM admin_login_limits WHERE expires_at <= ?").bind(now),
    env.DB.prepare("INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)").bind(await hash(token), expiresAt),
  ]);
  return json({ token, expiresAt });
}
