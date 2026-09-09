import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import { DiagnosticForm } from "../diagnostic-form";
export const metadata={title:"Синхронизируем команды — IT-Терапия"};
export default function Page(){return <main><SiteHeader/><section className="editorial-hero"><p className="eyebrow">НАПРАВЛЕНИЕ / 02</p><h1>Синхронизируем<br/><span className="accent-text">команды.</span></h1><p className="editorial-lead">Синхронизация проектных команд нужна на старте и в любой момент, когда участники теряют общее видение результата. Помогаем заказчику и подрядчику согласовать ожидания и действовать как одна команда.</p></section><section className="editorial-section"><h2>Общее понимание<br/>нужно сделать явным.</h2><p className="editorial-lead">Одинаковые слова в договоре ещё не означают одинаковые ожидания. Обсуждаем, что каждая сторона считает успехом, кто принимает решения, как принимаются результаты и что происходит при изменениях. Даём место вопросам и опасениям, которые обычно остаются за рамками протокола.</p></section>    <section className="sync-feature" id="sync">
      <div className="sync-intro"><p className="eyebrow">КАК МЫ РАБОТАЕМ</p><span className="sync-index">SYNC / 01</span></div>
      <div className="sync-title"><h2>Синхронизация проектных команд.</h2><p>На старте проекта и в любой момент, когда команда понимает, что теряет общее видение достижения результата.</p></div>
      <div className="sync-path">
        <article><b>01</b><h3>Диагностика</h3><p>Находим болевые точки, конфликтующие ожидания и скрытые риски проекта.</p></article>
        <article><b>02</b><h3>Тренинг SYNC</h3><p>Согласуем цели, роли, критерии приёмки, правила решений и коммуникаций.</p></article>
        <article><b>03</b><h3>Сопровождение</h3><p>Разбираем сложные ситуации, поддерживаем изменения и возвращаем команду к договорённостям.</p></article>
        <article><b>04</b><h3>Ретроспектива</h3><p>Фиксируем уроки, рабочие практики и решения, которые станут активом следующих проектов.</p></article>
      </div>
      <div className="sync-results">
        <div><span>ФОРМАЛЬНЫЙ РЕЗУЛЬТАТ</span><strong>Драфт устава, акцепт команды, правила взаимодействия</strong></div>
        <div><span>НЕФОРМАЛЬНЫЙ РЕЗУЛЬТАТ</span><strong>Синхронизированная команда, открытая обратная связь, точки влияния</strong></div>
        <a href="/sync">Подробнее о SYNC</a>
      </div>
    </section><section className="editorial-section"><h2>Форматы для совместной работы.</h2><div className="service-grid"><article id="sync"><span className="eyebrow">01</span><h3>Тренинг SYNC</h3><p>Совместно фиксируем цели, роли и правила взаимодействия. Работаем с реальной командой и контекстом проекта.</p><a href="/products#trainings">Программа тренинга</a></article><article id="games"><span className="eyebrow">02</span><h3>Общий опыт</h3><p>Трансформационные игры помогают увидеть конкуренцию, доверие и взаимозависимость ролей.</p><a href="/products#activities">Подобрать игру</a></article><article id="retro"><span className="eyebrow">03</span><h3>Осмыслить совместный опыт</h3><p>Ретроспектива помогает обсудить, какие практики поддерживают результат, а какие стоит изменить.</p><a href="/products#retro">Ретроспектива проекта</a></article></div></section><DiagnosticForm/>    <SiteFooter/></main>}