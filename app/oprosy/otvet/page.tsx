"use client";

import { useSyncExternalStore } from "react";

const subscribe = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  return () => window.removeEventListener("popstate", notify);
};
const clientSearch = () => window.location.search;
const serverSearch = () => null;

export default function PollAnswerPage() {
  const search = useSyncExternalStore<string | null>(subscribe, clientSearch, serverSearch);
  if (search === null) return <main style={{padding:32}}>Загружаем вопрос…</main>;
  const value = new URLSearchParams(search).get("id") || "";
  const id = /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : "";
  if (!id) return <main style={{padding:32}}><h1>Нужна ссылка на опрос</h1><p>Откройте QR-код или ссылку, которую показал ведущий.</p><a href="https://it-therapy.ru/">IT-Терапия — на главную</a></main>;
  return <main style={{height:"100dvh",minHeight:600,background:"#f6f3ed"}}>
    <iframe title="Анонимный ответ на опрос IT-Терапии" src={`https://zhivoy-opros.lefrit.chatgpt.site/poll/${encodeURIComponent(id)}`} referrerPolicy="no-referrer" style={{width:"100%",height:"100%",border:0}}/>
  </main>;
}
