import type { Metadata } from "next";
import { SiteHeader } from "../site-header";

export const metadata: Metadata = {
  title: "Карточки IT-Пресейл — 200 вопросов для сильной команды",
  description: "Набор из 200 карточек по пяти областям знаний для самостоятельной проработки IT-пресейла.",
};

const blocks = [
  { number:"01", title:"Клиент и контекст", text:"Глубокие вопросы, которые помогают увидеть реальные бизнес-цели, ограничения и боли заказчика." },
  { number:"02", title:"Потребности и запрос", text:"От функциональных пожеланий — к точной формулировке экономического и стратегического эффекта." },
  { number:"03", title:"Ценность и аргументация", text:"Сложные возражения, конкурентные преимущества и спокойная защита своего предложения." },
  { number:"04", title:"Коммуникация и доверие", text:"Роли продаж и производства, правила взаимодействия и единая позиция команды перед заказчиком." },
  { number:"05", title:"От заявки до защиты КП", text:"Слабые места процесса: первый контакт, оценка, предложение, подготовка и финальная защита." },
];

export default function CardsPage(){
  return <main className="cards-page">
    <SiteHeader ctaHref="https://t.me/Ekaterina_Makhnovskaya" ctaLabel="Приобрести"/>

    <section className="cards-hero">
      <div className="cards-hero-copy"><p className="eyebrow">КАРТОЧКИ «IT-ПРЕСЕЙЛ»</p><h1>200 вопросов.<br/><span className="accent-text">Одна стратегия</span><br/>победы.</h1><p>Практический инструмент для самостоятельной проработки IT-пресейла, созданный на основе более 500 проведённых пресейлов.</p><div className="cards-buttons"><a className="primary-action" href="https://t.me/Ekaterina_Makhnovskaya" target="_blank" rel="noreferrer">Приобрести набор</a><a href="#how">Как использовать</a></div></div>
      <div className="cards-hero-image"><img src="/cards/cards-pack-new.jpg" alt="Екатерина Махновская с набором карточек IT-Пресейл"/></div>
    </section>

    <section className="cards-proof"><div><strong>200</strong><span>коучинговых вопросов</span></div><div><strong>5</strong><span>ключевых областей</span></div><div><strong>500+</strong><span>пресейлов в основе</span></div><div><strong>2</strong><span>сценария работы</span></div></section>

    <section className="card-domains"><div className="section-heading"><p className="eyebrow">ЧТО ВНУТРИ</p><h2>Пять областей<br/>сильного пресейла.</h2><p>Не готовые скрипты, а вопросы, которые заставляют команду сформулировать собственные сильные ответы.</p></div><div className="domain-list">{blocks.map(block=><article key={block.number}><span>{block.number}</span><h3>{block.title}</h3><p>{block.text}</p></article>)}</div></section>

    <section className="card-gallery"><img src="/cards/example-1.png" alt="Пример карточек IT-Пресейл"/><img src="/cards/example-2.png" alt="Вопрос и пример ответа на карточке"/><img src="/cards/example-3.png" alt="Карточка для командной работы"/></section>

    <section className="cards-how" id="how"><p className="eyebrow">СЦЕНАРИЙ КОМАНДНОЙ СЕССИИ</p><div className="cards-how-grid"><h2>Из вопросов —<br/>в базу знаний.</h2><ol><li><b>01</b><span>Соберите продажи и производство в смешанные команды до 10 человек.</span></li><li><b>02</b><span>Ведущий выбирает вопрос; «Кворум-карточка» подтверждает, что тема важна участникам.</span></li><li><b>03</b><span>Команды готовят ответы, обсуждают варианты и голосуют за самый сильный.</span></li><li><b>04</b><span>Победный ответ фиксируется и пополняет корпоративную базу знаний по пресейлам.</span></li></ol></div></section>

    <section className="cards-audience"><p className="eyebrow">ДЛЯ КОГО</p><div><h2>Для всех, кто влияет на победу в сделке.</h2><p>Руководители продаж и проектных офисов, аккаунты, менеджеры, кураторы, руководители проектов, аналитики, архитекторы и специалисты производства.</p></div></section>

    <section className="contact cards-contact"><p className="eyebrow">ПРОКАЧАТЬ ПРЕСЕЙЛ</p><h2>Соберите лучшие<br/>ответы команды.</h2><p className="contact-copy">Начните разговор об острых темах без напряжения и превратите опыт сильнейших сотрудников в актив всей компании.</p><div className="contact-actions"><a className="primary-action" href="https://t.me/Ekaterina_Makhnovskaya" target="_blank" rel="noreferrer">Приобрести набор</a><a href="mailto:info@it-therapy.ru">Задать вопрос</a></div></section>
    <footer><a className="brand brand-footer" href="/"><span className="brand-mark">IT</span><span>ТЕРАПИЯ</span></a><p>200 вопросов для сильного IT-пресейла.</p><p>© 2026 IT‑Терапия</p></footer>
  </main>;
}
