"use client";
import { pollFetch } from "./api";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, MessageSquareText, Plus, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

type Poll = { id: string; question: string; createdAt: number; answerCount: number };
type Answer = { id: string; answer: string; createdAt: number };
const publicUrl = (id: string) => `https://it-therapy.ru/oprosy/otvet/?id=${encodeURIComponent(id)}`;

export default function AdminClient({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<Poll | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [qr, setQr] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const api = useCallback(async (path: string, init: RequestInit = {}) => {
    const res = await pollFetch(path, { ...init, headers: { ...init.headers, authorization: `Bearer ${token}` } });
    const data = await res.json() as { error?: string; polls: Poll[]; answers: Answer[]; poll: Poll };
    if (res.status === 401) onUnauthorized();
    if (!res.ok) throw new Error(data.error || "Не удалось выполнить запрос");
    return data;
  }, [token, onUnauthorized]);

  const load = useCallback(async () => {
    try { const data = await api("/api/admin/polls"); setPolls(data.polls); }
    catch (e) { setError(e instanceof Error ? e.message : "Нет связи с сервером"); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => {
    let active = true;
    api("/api/admin/polls").then(data => { if(active) setPolls(data.polls); })
      .catch(e => { if(active) setError(e instanceof Error ? e.message : "Нет связи с сервером"); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  }, [api]);
  useEffect(() => {
    if (!selected) return;
    let active = true;
    async function update() {
      try {
        const data = await api(`/api/admin/polls?id=${selected!.id}`);
        if(active) setAnswers(data.answers);
      } catch(e) { if(active) setError(e instanceof Error ? e.message : "Нет связи с сервером"); }
    }
    void update();
    const timer = setInterval(update, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [selected, api]);

  const openPoll = useCallback(async (poll: Poll) => {
    setSelected(poll); setAnswers([]); setQrOpen(false); setQr(""); setError(""); setCopyStatus("");
    try { setQr(await QRCode.toDataURL(publicUrl(poll.id), { width: 640, margin: 2, color: { dark: "#151515", light: "#ffffff" } })); }
    catch { setError("Не удалось создать QR-код. Используйте ссылку."); }
  }, []);

  const create = useCallback(async (questionOverride?: string) => {
    const value = (questionOverride ?? question).trim();
    if (!value || value.length > 300) throw new Error("Вопрос должен содержать от 1 до 300 символов");
    setCreating(true); setError("");
    try {
      const data = await api("/api/admin/polls", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({question:value}) });
      setQuestion(""); await load(); await openPoll({...data.poll,answerCount:0});
    } catch(e) { setError(e instanceof Error ? e.message : "Нет связи с сервером"); throw e; }
    finally { setCreating(false); }
  }, [question, api, load, openPoll]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name:"create_poll", title:"Создать опрос", description:"Создаёт анонимный опрос и открывает вопрос. QR-код можно раскрыть кнопкой.",
      inputSchema:{type:"object",properties:{question:{type:"string",minLength:1,maxLength:300}},required:["question"],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute:async (input: unknown) => {
        const value=input as {question?:unknown};
        if(typeof value.question!=="string") throw new Error("Введите вопрос");
        await create(value.question); return {status:"created",question:value.question.trim()};
      }
    },{signal:lifecycle.signal})).catch(()=>undefined);
    return ()=>lifecycle.abort();
  },[create]);

  async function deletePoll() {
    if (!selected || deleting) return;
    setDeleting(true); setError("");
    try {
      await api(`/api/admin/polls/${encodeURIComponent(selected.id)}`, {method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({confirmId:selected.id})});
      setConfirmDelete(false);setSelected(null);setAnswers([]);await load();
    } catch(e) { setError(e instanceof Error ? e.message : "Не удалось удалить опрос"); }
    finally {setDeleting(false);}
  }

  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-7 sm:py-10">
    <header className="mb-7 flex items-center justify-between gap-4"><div><p className="eyebrow">Панель ведущего</p><h1 className="mt-1 text-3xl font-semibold">Живой опрос</h1></div><Button aria-label="Обновить историю" variant="outline" size="icon" onClick={()=>void load()}><RefreshCw/></Button></header>
    {error&&!selected&&<p role="alert" className="mb-4 text-red-700">{error}</p>}
    <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <section className="panel rounded-3xl p-5 sm:p-6"><div className="flex items-center gap-2"><Plus className="text-[#b83900]"/><h2 className="text-xl font-semibold">Новый опрос</h2></div><label className="mt-5 block"><span className="text-sm">Вопрос аудитории</span><Textarea value={question} onChange={e=>setQuestion(e.target.value)} maxLength={300} placeholder="Какой вопрос задать аудитории?" className="mt-2 min-h-28 bg-[#f6f3ed] text-base"/></label><Button onClick={()=>void create().catch(()=>undefined)} disabled={!question.trim()||creating} className="mt-4 h-11 w-full bg-[#ff5d1a] font-bold text-[#151515]">{creating?"Создаём…":"Создать опрос"}</Button></section>
      <section className="panel rounded-3xl p-5 sm:p-6"><div className="mb-4 flex items-center gap-2"><MessageSquareText className="text-[#b83900]"/><h2 className="text-xl font-semibold">История опросов</h2></div>{loading?<p>Загружаем историю…</p>:polls.length===0?<p className="py-10 text-center text-[#6d6a64]">Создайте первый вопрос</p>:<div className="space-y-3">{polls.map(p=><button key={p.id} onClick={()=>void openPoll(p)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#151515]/15 bg-white p-4 text-left hover:border-[#ff5d1a]"><span className="font-medium">{p.question}</span><span className="shrink-0 rounded-full bg-[#ff5d1a]/10 px-3 py-1 text-sm text-[#b83900]">{Number(p.answerCount)} ответов</span></button>)}</div>}</section>
    </div>
    <Dialog open={!!selected} onOpenChange={v=>{if(!v&&!deleting){setSelected(null);setConfirmDelete(false);}}}><DialogContent className="max-h-[92vh] overflow-y-auto bg-[#f6f3ed] text-[#151515] sm:max-w-3xl"><DialogHeader><DialogTitle className="pr-7 text-2xl leading-tight">{selected?.question}</DialogTitle><DialogDescription>Ответы аудитории обновляются автоматически.</DialogDescription></DialogHeader>
      <Collapsible open={qrOpen} onOpenChange={setQrOpen}><CollapsibleTrigger className="flex w-full items-center gap-2 rounded-xl border border-[#151515]/20 px-4 py-3 text-left font-semibold"><QrCode size={20}/>{qrOpen?"Скрыть QR-код":"Показать QR-код и ссылку"}</CollapsibleTrigger><CollapsibleContent><div className="mx-auto mt-4 max-w-[300px]">{qr&&<img src={qr} alt="QR-код опроса" className="w-full rounded-2xl bg-white p-3"/>}<a className="mt-3 block break-all text-sm underline" href={selected?publicUrl(selected.id):"#"} target="_blank" rel="noopener noreferrer">{selected?publicUrl(selected.id):""}</a><Button variant="outline" onClick={async()=>{try{await navigator.clipboard.writeText(publicUrl(selected!.id));setCopyStatus("Ссылка скопирована");}catch{setCopyStatus("Скопируйте ссылку выше вручную");}}} className="mt-3 w-full"><Copy/>Копировать ссылку</Button><p role="status" className="mt-2 text-sm">{copyStatus}</p></div></CollapsibleContent></Collapsible>
      {error&&<p role="alert" className="text-red-700">{error}</p>}
      <div><h3 className="mb-3 font-semibold">Ответы — {answers.length}</h3>{answers.length===0?<p className="rounded-2xl border border-dashed border-[#151515]/20 p-8 text-center text-[#6d6a64]">Пока нет ответов</p>:<div className="space-y-3">{answers.map(a=><article key={a.id} className="rounded-2xl border border-[#151515]/15 bg-white p-4"><p className="whitespace-pre-wrap break-words text-base leading-relaxed">{a.answer}</p><time className="mt-2 block text-xs text-[#6d6a64]">{new Date(a.createdAt).toLocaleString("ru-RU")}</time></article>)}</div>}</div>
      <Button variant="outline" className="mt-4 text-red-700" onClick={()=>setConfirmDelete(true)}><Trash2/>Удалить опрос</Button>
    </DialogContent></Dialog>
    <AlertDialog open={confirmDelete} onOpenChange={v=>{if(!deleting)setConfirmDelete(v);}}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Удалить опрос и все ответы?</AlertDialogTitle><AlertDialogDescription>«{selected?.question}». Опрос и его ответы будут удалены без возможности восстановления в панели. Ссылка и QR-код перестанут принимать ответы. Предыдущие версии ответов останутся в публичной истории GitHub.</AlertDialogDescription></AlertDialogHeader>{error&&<p role="alert" className="text-red-700">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel><AlertDialogAction disabled={deleting} className="bg-red-700 text-white" onClick={e=>{e.preventDefault();void deletePoll();}}>{deleting?"Удаляем…":"Удалить из панели"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </main>;
}
