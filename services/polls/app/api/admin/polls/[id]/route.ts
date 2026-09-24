import { authorized, json } from "@/lib/admin-auth";
import { deletePoll, storageFailure } from "@/lib/poll-store";
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await authorized(request))) return json({ error: "Нет доступа" }, 401);
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as { confirmId?: unknown } | null;
  if (body?.confirmId !== id) return json({ error: "Подтвердите удаление выбранного опроса" }, 400);
  try { await deletePoll(id); return json({ ok: true }); }
  catch (error) { return storageFailure(error); }
}
