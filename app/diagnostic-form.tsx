"use client";

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function DiagnosticForm(){
  const [stage,setStage]=useState("");
  const [situation,setSituation]=useState("");
  const [participants,setParticipants]=useState("");
  const [result,setResult]=useState("");
  const [copyStatus,setCopyStatus]=useState("");

  const message=useMemo(()=>[
    "Здравствуйте! Хочу обсудить проект с IT-Терапией.",
    "",
    `Стадия проекта: ${stage}`,
    `Текущая ситуация: ${situation}`,
    `Участники: ${participants}`,
    `Желаемый результат: ${result}`,
  ].join("\n"),[stage,situation,participants,result]);

  const ready=Boolean(stage&&situation&&participants&&result.trim());
  const copyMessage=async()=>{
    if(!ready) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus("Текст скопирован. Откройте удобный канал, вставьте текст, проверьте его и отправьте самостоятельно.");
    } catch {
      setCopyStatus("Не удалось скопировать автоматически. Выделите и скопируйте текст из поля «Текст для отправки» вручную.");
    }
  };
  const clearAnswers=()=>{
    setStage(""); setSituation(""); setParticipants(""); setResult(""); setCopyStatus("");
  };

  return <section className="diagnostic" id="diagnostic">
    <div className="diagnostic-intro"><p className="eyebrow">ДИАГНОСТИКА ЗА 2 МИНУТЫ</p><h2>Опишите ситуацию.<br/>Мы предложим <span className="accent-text">следующий шаг.</span></h2><p>Четыре ответа помогут нам понять контекст до первого разговора и не тратить встречу на общие вопросы.</p></div>
    <div className="diagnostic-form">
      <label><span>01 / На какой стадии проект?</span><Select value={stage} onValueChange={value=>{setStage(value);setCopyStatus("");}}><SelectTrigger className="diagnostic-select"><SelectValue placeholder="Выберите стадию"/></SelectTrigger><SelectContent><SelectItem value="Идея и подготовка">Идея и подготовка</SelectItem><SelectItem value="Старт проекта">Старт проекта</SelectItem><SelectItem value="Активная реализация">Активная реализация</SelectItem><SelectItem value="Проект буксует">Проект буксует</SelectItem><SelectItem value="Завершение или ретроспектива">Завершение или ретроспектива</SelectItem></SelectContent></Select></label>
      <label><span>02 / Что сейчас происходит?</span><Select value={situation} onValueChange={value=>{setSituation(value);setCopyStatus("");}}><SelectTrigger className="diagnostic-select"><SelectValue placeholder="Выберите ситуацию"/></SelectTrigger><SelectContent><SelectItem value="Не совпадают цели и ожидания">Не совпадают цели и ожидания</SelectItem><SelectItem value="Размыты роли и ответственность">Размыты роли и ответственность</SelectItem><SelectItem value="Конфликты и сложные переговоры">Конфликты и сложные переговоры</SelectItem><SelectItem value="Срываются сроки или бюджет">Срываются сроки или бюджет</SelectItem><SelectItem value="Нужно развить команду">Нужно развить команду</SelectItem></SelectContent></Select></label>
      <label><span>03 / Кто участвует?</span><Select value={participants} onValueChange={value=>{setParticipants(value);setCopyStatus("");}}><SelectTrigger className="diagnostic-select"><SelectValue placeholder="Выберите участников"/></SelectTrigger><SelectContent><SelectItem value="Только команда заказчика">Только команда заказчика</SelectItem><SelectItem value="Только команда подрядчика">Только команда подрядчика</SelectItem><SelectItem value="Заказчик и подрядчик">Заказчик и подрядчик</SelectItem><SelectItem value="Руководители и спонсоры">Руководители и спонсоры</SelectItem><SelectItem value="Несколько подразделений">Несколько подразделений</SelectItem></SelectContent></Select></label>
      <label><span>04 / Какой результат нужен?</span><Textarea className="diagnostic-textarea" value={result} maxLength={2000} aria-describedby="diagnostic-privacy" onChange={event=>{setResult(event.target.value);setCopyStatus("");}} placeholder="Например: согласовать цели, роли и правила эскалации..."/></label>
      <div className="diagnostic-notice" id="diagnostic-privacy">
        <p>Опишите задачу без чужих персональных данных, паролей и конфиденциальных сведений. Не указывайте сведения о здоровье и другие чувствительные данные.</p>
        <p>Ответы формируются в вашем браузере и автоматически никуда не отправляются. Кнопка ниже только копирует текст в буфер обмена. <a href="/privacy">Политика обработки персональных данных</a>.</p>
      </div>
      {ready&&<label><span>Текст для отправки</span><Textarea className="diagnostic-textarea diagnostic-message" readOnly value={message} rows={8}/></label>}
      <div className="diagnostic-actions"><button type="button" disabled={!ready} onClick={copyMessage}>Скопировать текст</button><button type="button" onClick={clearAnswers}>Очистить ответы</button></div>
      {!ready&&<p className="diagnostic-hint">Заполните четыре поля, чтобы подготовить текст. Связаться с нами можно и без диагностики.</p>}
      <p className="diagnostic-status" role="status">{copyStatus}</p>
      <div className="diagnostic-channels" aria-label="Каналы связи">
        <a href="mailto:info@it-therapy.ru">Написать на email</a>
        <a href="https://wa.me/79163090129" target="_blank" rel="noopener noreferrer">Открыть WhatsApp ↗</a>
        <a href="https://t.me/virdsh" target="_blank" rel="noopener noreferrer">Открыть Telegram ↗</a>
      </div>
      <p className="diagnostic-notice">Email откроет почтовую программу: адрес — info@it-therapy.ru. Ссылки на WhatsApp и Telegram открывают внешние сервисы по их правилам. Текст ответов в ссылки не включается. Вставка и отправка — только вашим действием в выбранном сервисе. Очистка ответов здесь не очищает буфер обмена и уже отправленные сообщения.</p>
    </div>
  </section>;
}
