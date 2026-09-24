import { authorized, json } from "@/lib/admin-auth";
import { listPolls, createPoll, storageFailure } from "@/lib/poll-store";
export async function GET(request: Request) {
  if (!(await authorized(request))) return json({ error: "Нет доступа" }, 401);
  try {
    const polls = await listPolls();
    const id = new URL(request.url).searchParams.get("id");
    if (id) {
      const poll = polls.find(p => p.id === id);
      if (!poll) return json({ error: "Опрос не найден" }, 404);
      const { answers, ...question } = poll;
      return json({ poll: question, answers: [...answers].sort((a,b)=>b.createdAt-a.createdAt) });
    }
    return json({ polls: polls.map(({ answers, ...poll }) => ({ ...poll, answerCount: answers.length })).sort((a,b)=>b.createdAt-a.createdAt) });
  } catch (error) { return storageFailure(error); }
}
export async function POST(request: Request) {
  if (!(await authorized(request))) return json({ error: "Нет доступа" }, 401);
  const body = await request.json().catch(() => null) as { question?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 300) return json({ error: "Введите вопрос до 300 символов" }, 400);
  try { return json({ poll: await createPoll(question) }, 201); }
  catch (error) { return storageFailure(error); }
}
