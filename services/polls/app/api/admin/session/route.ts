import { authorized, endSession, json, login } from "@/lib/admin-auth";

export const POST = login;
export async function GET(request: Request) {
  return await authorized(request) ? json({ ok: true }) : json({ error: "Войдите с паролем" }, 401);
}
export async function DELETE(request: Request) {
  await endSession(request);
  return json({ ok: true });
}
