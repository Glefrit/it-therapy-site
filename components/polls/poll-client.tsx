"use client";
import { pollFetch } from "./api";

import { TherapyBrand } from "@/components/polls/therapy-brand";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PollClient({ id }: { id: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { pollFetch(`/api/polls/${id}`).then(r => r.json() as Promise<{poll?:{question:string};error?:string}>).then(d => d.poll ? setQuestion(d.poll.question) : setError(d.error || "Опрос недоступен")).catch(()=>setError("Не удалось загрузить вопрос. Обновите страницу.")); }, [id]);

  async function submit() {
    if (!answer.trim()) return;
    setBusy(true); setError("");
    try {
      const res = await pollFetch(`/api/polls/${id}/responses`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answer }) });
      const data = await res.json() as {error?:string};
      if (res.ok) setSent(true); else setError(data.error || "Не удалось отправить ответ");
    } catch { setError("Нет связи с сервером. Повторите отправку."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen grid place-items-center px-4 py-10">
    <section className="panel w-full max-w-xl rounded-[2rem] p-6 sm:p-9">
      <div className="mb-7"><TherapyBrand /></div>
      {sent ? <div className="py-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl border-2 border-[#25834b] bg-[#edf7ee] text-[#25834b]">
          <Check size={38} strokeWidth={2.5} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-semibold">Ответ отправлен</h1>
        <p className="mt-3 text-[#6d6a64]">Спасибо за участие.</p>
        <a href="https://t.me/ittherapy1c" target="_blank" rel="noopener noreferrer"
          className="group mt-8 flex items-center gap-4 rounded-2xl border border-[#006b9e] bg-[#006b9e] p-4 text-left text-white transition-colors hover:border-[#005781] hover:bg-[#005781] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#006b9e] sm:p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 text-white"><Send size={23} aria-hidden="true" /></span>
          <span className="flex-1 text-base font-medium leading-snug">Присоединяйтесь к нашей группе в Telegram</span>
          <ArrowUpRight size={20} className="shrink-0" aria-hidden="true" />
        </a>
        <a href="https://it-therapy.ru/products/"
          className="group mt-3 flex items-center gap-4 rounded-2xl border border-[#ff5d1a] bg-[#ff5d1a] p-4 text-left text-[#151515] transition-colors hover:border-[#ed4e0c] hover:bg-[#ed4e0c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff5d1a] sm:p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/90" aria-hidden="true"><span className="grid h-8 w-8 place-items-center bg-[#ff5d1a] text-base font-black tracking-[-.05em] text-white">IT</span></span>
          <span className="flex-1 text-base font-medium leading-snug">Повысить конверсию продаж</span>
          <ArrowUpRight size={20} className="shrink-0" aria-hidden="true" />
        </a>
      </div> : <>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{question || (error ? "Опрос недоступен" : "Загружаем вопрос…")}</h1>
        <Textarea value={answer} onChange={e => setAnswer(e.target.value)} maxLength={1000} placeholder="Напишите ваш ответ" className="mt-7 min-h-36 border-[#151515]/20 bg-[#f6f3ed] text-base text-[#151515] placeholder:text-[#6d6a64]" />
        {error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}
        <Button onClick={submit} disabled={busy || !answer.trim() || !question} className="mt-5 h-12 w-full bg-[#ff5d1a] text-base font-bold text-[#151515] hover:bg-[#e84b0d]">{busy ? "Отправляем…" : "Отправить анонимно"}<ArrowRight /></Button>
      </>}
    </section>
  </main>;
}
