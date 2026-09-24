import { listPolls, storageFailure } from "@/lib/poll-store";
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const poll = (await listPolls()).find(p => p.id === id);
    return Response.json(poll ? { poll: { id: poll.id, question: poll.question } } : { error: "Опрос не найден" }, { status: poll ? 200 : 404, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return storageFailure(error); }
}
