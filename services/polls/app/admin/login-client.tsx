"use client";

import { useCallback, useEffect, useState } from "react";
import AdminClient from "./admin-client";
import { TherapyBrand } from "@/components/therapy-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "it-therapy-poll-session";
export default function LoginClient() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      fetch("/api/admin/session", { headers: { authorization: `Bearer ${saved}` } })
        .then(res => { if (res.ok) setToken(saved); else sessionStorage.removeItem(STORAGE_KEY); })
        .catch(() => setError("Не удалось проверить вход. Попробуйте снова."));
    } catch { /* Private browsing may disable storage; in-memory sessions still work. */ }
  }, []);
  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json() as { token?: string; error?: string };
      if (!res.ok || typeof data.token !== "string") { setError(data.error || "Не удалось войти"); return; }
      setToken(data.token); setPassword("");
      try { sessionStorage.setItem(STORAGE_KEY, data.token); } catch {}
    } catch { setError("Нет связи с сервером. Попробуйте снова."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    const res = await fetch("/api/admin/session", { method: "DELETE", headers: { authorization: `Bearer ${token}` } }).catch(() => null);
    if (!res?.ok) { setError("Не удалось завершить сессию. Повторите выход."); return; }
    expire();
  }
  const expire = useCallback(() => {
    setToken(""); setPassword("");
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);
  if (token) return <><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-6 sm:px-7"><TherapyBrand/><Button variant="outline" onClick={signOut}>Выйти</Button></div>{error&&<p role="alert" className="text-center text-red-700">{error}</p>}<AdminClient token={token} onUnauthorized={expire}/></>;
  return <main className="grid min-h-screen place-items-center px-5 py-8"><section className="panel w-full max-w-md rounded-3xl p-7"><TherapyBrand/><h1 className="mt-8 text-3xl font-semibold">Панель ведущего</h1><p className="mt-3 text-[#6d6a64]">Введите пароль, чтобы создавать опросы и просматривать ответы.</p><form onSubmit={signIn} className="mt-6 space-y-4"><label className="block">Пароль<Input type="password" autoComplete="current-password" value={password} maxLength={128} onChange={e=>setPassword(e.target.value)} className="mt-2 h-12 bg-white" required/></label>{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}<Button type="submit" disabled={busy||!password} className="h-12 w-full bg-[#ff5d1a] text-[#151515]">{busy?"Проверяем…":"Войти"}</Button></form></section></main>;
}
