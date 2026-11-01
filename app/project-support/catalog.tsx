"use client";
import { useEffect, useRef } from "react";
import { mountCatalog } from "./catalog-engine";

// Isolate the catalogue's approved styles from the shared site chrome.
export function ProjectCatalog() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const root = element.shadowRoot ?? element.attachShadow({ mode: "open" });
    return mountCatalog(root);
  }, []);
  return <div data-project-catalog ref={host} style={{minHeight:"80vh"}}><p style={{padding:"40px"}}>Загружаем каталог услуг…</p></div>;
}
