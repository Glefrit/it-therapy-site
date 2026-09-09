"use client";

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function DiagnosticForm(){
  const [stage,setStage]=useState("");
  const [situation,setSituation]=useState("");
  const [participants,setParticipants]=useState("");
  const [result,setResult]=useState("");

  const message=useMemo(()=>[
    "Здравствуйте! Хочу обсудить проект с IT-Терапией.",
    "",
    `Стадия проекта: ${stage}`,
    `Текущая ситуация: ${situation}`,
    `Участники: ${participants}`,
    `Желаемый результат: ${result}`,
  ].join("\n"),[stage,situation,participants,result]);

  const ready=Boolean(stage&&situation&&participants&&result.trim());
  const openWhatsApp=()=>{ if(ready) window.open(`https://wa.me/79163090129?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer"); };
  const openTelegram=async()=>{ if(!ready) return; try{ await navigator.clipboard.writeText(message); }catch{} window.open("https://t.me/virdsh","_blank","noopener,noreferrer"); };

  return <section className="diagnostic" id="diagnostic">
    <div className="diagnostic-intro"><p className="eyebrow">ДИАГНОСТИКА ЗА 2 МИНУТЫ</p><h2>Опишите ситуацию.<br/>Мы предложим <span className="accent-text">следующий шаг.</span></h2><p>Четыре ответа помогут нам понять контекст до первого разговора и не тратить встречу на общие вопросы.</p></div>
    <div className="diagnostic-form">
      <label><span>01 / На какой стадии проект?</span><Select value={stage} onValueChange={setStage}><SelectTrigger className="diagnostic-select"><SelectValue placeholder="Выберите стадию"/></SelectTrigger><SelectContent><SelectItem value="Идея и подготовка">Идея и подготовка</SelectItem><SelectItem value="Старт проекта">Старт проекта</SelectItem><SelectItem value="Активная реализация">Активная реализация</SelectItem><SelectItem value="Проект буксует">Проект буксует</SelectItem><SelectItem value="Завершение или ретроспектива">Завершение или ретроспектива</SelectItem></SelectContent></Select></label>
      <label><span>02 / Что сейчас происходит?</span><Select value={situation} onValueChange={setSituation}><SelectTrigger className="diagnostic-select"><SelectValue placeholder="Выберите ситуацию"/></SelectTrigger><SelectContent><SelectItem value="Не совпадают цели и ожидания">Не совпадают цели и ожидания</SelectItem><SelectItem value="Размыты роли и ответственность">Размыты роли и ответственность</SelectItem><SelectItem value="Конфликты и сложные переговоры">Конфликты и сложные переговоры</SelectItem><SelectItem value="Срываются сроки или бюджет">Срываются сроки или бюджет</SelectItem><SelectItem value="Нужно развить команду">Нужно развить команду</SelectItem></SelectContent></Select></label>
      <label><span>03 / Кто участвует?</span><Select value={participants} onValueChange={setParticipants}><SelectTrigger className="diagnostic-select"><SelectValue placeholder="Выберите участников"/></SelectTrigger><SelectContent><SelectItem value="Только команда заказчика">Только команда заказчика</SelectItem><SelectItem value="Только команда подрядчика">Только команда подрядчика</SelectItem><SelectItem value="Заказчик и подрядчик">Заказчик и подрядчик</SelectItem><SelectItem value="Руководители и спонсоры">Руководители и спонсоры</SelectItem><SelectItem value="Несколько подразделений">Несколько подразделений</SelectItem></SelectContent></Select></label>
      <label><span>04 / Какой результат нужен?</span><Textarea className="diagnostic-textarea" value={result} onChange={event=>setResult(event.target.value)} placeholder="Например: согласовать цели, роли и правила эскалации..."/></label>
      <div className="diagnostic-actions"><button type="button" disabled={!ready} onClick={openWhatsApp}>Отправить в WhatsApp</button><button type="button" disabled={!ready} onClick={openTelegram}>Скопировать и открыть Telegram</button></div>
      {!ready&&<p className="diagnostic-hint">Заполните четыре поля — кнопки станут активными.</p>}
    </div>
  </section>;
}
