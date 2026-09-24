"use client";

import { useSyncExternalStore } from "react";
import PollClient from "@/components/polls/poll-client";

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
  return <div style={{minHeight:"100dvh",background:"#f6f3ed",color:"#151515"}}><PollClient id={id}/></div>;
}
