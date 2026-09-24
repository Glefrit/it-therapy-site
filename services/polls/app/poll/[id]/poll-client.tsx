"use client";

import { TherapyBrand } from "@/components/therapy-brand";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PollClient({ id }: { id: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch(`/api/polls/${id}`).then(r => r.json() as Promise<{poll?:{question:string};error?:string}>).then(d => d.poll ? setQuestion(d.poll.question) : setError(d.error || "Опрос недоступен")).catch(()=>setError("Не удалось загрузить вопрос. Обновите страницу.")); }, [id]);

  async function submit() {
    if (!answer.trim()) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/polls/${id}/responses`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answer }) });
      const data = await res.json() as {error?:string};
      if (res.ok) setSent(true); else setError(data.error || "Не удалось отправить ответ");
    } catch { setError("Нет связи с сервером. Повторите отправку."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen grid place-items-center px-4 py-10">
    <section className="panel w-full max-w-xl rounded-[2rem] p-6 sm:p-9">
      <div className="mb-7"><TherapyBrand /></div>
      <div className="mb-7 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff5d1a] text-[#151515]"><MessageCircleQuestion /></span><div><p className="eyebrow">Анонимный ответ</p><p className="text-sm text-[#6d6a64]">Имя и контакты не запрашиваются</p></div></div>
      {sent ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto text-[#b83900]" size={54}/><h1 className="mt-5 text-3xl font-semibold">Ответ отправлен</h1><p className="mt-3 text-[#6d6a64]">Спасибо за участие.</p></div> : <>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{question || (error ? "Опрос недоступен" : "Загружаем вопрос…")}</h1>
        <Textarea value={answer} onChange={e => setAnswer(e.target.value)} maxLength={1000} placeholder="Напишите ваш ответ" className="mt-7 min-h-36 border-[#151515]/20 bg-[#f6f3ed] text-base text-[#151515] placeholder:text-[#6d6a64]" />
        <p className="mt-3 text-sm text-[#6d6a64]">Не указывайте имена, контакты и конфиденциальные данные. После нажатия кнопки ответ будет опубликован в открытом репозитории GitHub и доступен всем.</p>
        {error && <p className="mt-3 text-sm text-[#b42318]">{error}</p>}
        <Button onClick={submit} disabled={busy || !answer.trim() || !question} className="mt-5 h-12 w-full bg-[#ff5d1a] text-base font-bold text-[#151515] hover:bg-[#e84b0d]">{busy ? "Отправляем…" : "Отправить анонимно"}<ArrowRight /></Button>
      </>}
    </section>
  </main>;
}
