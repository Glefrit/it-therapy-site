import { answerPoll, storageFailure } from "@/lib/poll-store";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as { answer?: unknown } | null;
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
  if (!answer || answer.length > 1000) return Response.json({ error: "Введите ответ до 1000 символов" }, { status: 400 });
  try { await answerPoll(id, answer); return Response.json({ ok: true }, { status: 201 }); }
  catch (error) { return storageFailure(error); }
}
