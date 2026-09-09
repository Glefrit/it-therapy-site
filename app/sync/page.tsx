import type { Metadata } from "next";
import { DiagnosticForm } from "../diagnostic-form";
import { SiteHeader } from "../site-header";

export const metadata:Metadata={
  title:"Тренинг SYNC — синхронизация проектных команд",
  description:"Диагностика, тренинг и сопровождение команд заказчика и подрядчика на старте или в ходе IT-проекта.",
};

const signs=[
  "Заказчик и подрядчик по-разному понимают цели проекта",
  "Решения постоянно пересматриваются и никто не видит общую картину",
  "Участники избегают сложных разговоров и копят взаимные претензии",
  "Ответственность размыта, а эскалации не приводят к решениям",
  "Сроки сдвигаются, но команда обсуждает симптомы, а не причины",
  "Проект формально идёт, но доверие между сторонами уже снижается",
];

const program=[
  {time:"60 мин",title:"Знакомство и цели",text:"Роли на проекте, индивидуальные ожидания и критерии успеха участников."},
  {time:"90 мин",title:"Проектная технология",text:"Этапы, результаты, принципы и порядок взаимодействия на проекте."},
  {time:"60 мин",title:"Роли и решения",text:"Зоны ответственности, система принятия решений и критерии приёмки."},
  {time:"60 мин",title:"Страхи участников",text:"Выявляем риски и тревоги, которые редко попадают в формальные протоколы."},
  {time:"90 мин",title:"Коммуникации",text:"Управление конфликтами, моделирование ситуаций и практика обратной связи."},
  {time:"60 мин",title:"Договорённости",text:"Фиксируем правила работы и следующие действия команды."},
];

export default function SyncPage(){
  return <main className="sync-page">
    <SiteHeader ctaHref="#diagnostic" ctaLabel="Обсудить SYNC"/>
    <section className="sync-page-hero"><p className="eyebrow">ПРОДУКТЫ И УСЛУГИ / ТРЕНИНГИ</p><h1>SYNC</h1><div><h2>Синхронизация проектных команд.</h2><p>На старте проекта и в любой момент, когда команда понимает, что теряет общее видение достижения результата.</p><a href="#diagnostic">Обсудить ситуацию</a></div></section>

    <section className="sync-signs"><div><p className="eyebrow">КОГДА НУЖЕН SYNC</p><h2>Команде нужен SYNC, если…</h2></div><ul>{signs.map((sign,index)=><li key={sign}><span>0{index+1}</span><p>{sign}</p></li>)}</ul></section>



    <section className="sync-program"><div className="section-heading light-heading"><p className="eyebrow">ПРОГРАММА</p><h2>Один день.<br/>Шесть шагов.</h2><p>Программа адаптируется под стадию, контекст и реальную ситуацию конкретного проекта.</p></div><div className="sync-program-grid">{program.map((item,index)=><article key={item.title}><span>0{index+1}</span><b>{item.time}</b><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>

    <section className="sync-outcomes"><p className="eyebrow">РЕЗУЛЬТАТ</p><div><h2>После SYNC у команды остаются не только впечатления.</h2><div className="outcome-columns"><article><span>ФОРМАЛЬНО</span><ul><li>Акцепт проектной команды с обеих сторон</li><li>Драфт устава проекта</li><li>Согласованные роли и правила эскалации</li><li>Критерии приёмки и принятия решений</li></ul></article><article><span>В РАБОТЕ КОМАНДЫ</span><ul><li>Общее видение целей и результата</li><li>Понимание сильных сторон участников</li><li>Открытая и корректная обратная связь</li><li>Понимание точек влияния и рисков</li></ul></article></div></div></section>

    <section className="sync-facts"><div><strong>до 30</strong><span>участников</span></div><div><strong>1 день</strong><span>интенсивной работы</span></div><div><strong>2 команды</strong><span>заказчик и подрядчик</span></div><div><strong>любой этап</strong><span>от старта до кризиса</span></div></section>
    <DiagnosticForm/>
    <footer><a className="brand brand-footer" href="/"><span className="brand-mark">IT</span><span>ТЕРАПИЯ</span></a><p>Синхронизация начинается с честного разговора.</p><p>© 2026 IT‑Терапия</p></footer>
  </main>;
}
