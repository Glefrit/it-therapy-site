import { SiteFooter } from "../site-footer";
import { SiteHeader } from "../site-header";
import { DiagnosticForm } from "../diagnostic-form";
import { ReviewsCarousel } from "../reviews-carousel";
const cases = [
  { logo:"/clients/uc1.png", name:"Учебный центр №1", work:"Регулярные бизнес-игры «Пресейл» и «Кризис»" },
  { logo:"/clients/1c-erp.png", name:"1C ERP", work:"Тренинг «Мастер презентаций» для менеджеров по продажам" },
  { logo:"/clients/prime-finance.png", name:"Prime Finance", work:"Тренинг «Мастер презентаций» для руководства" },
  { logo:"/clients/1soft.svg", name:"1Софт", work:"Тренинг «Мастер презентаций» для сотрудников" },
  { logo:"/clients/galc.png", name:"ГАЛС", work:"Тренинг SYNC для проектных команд" },
  { logo:"/clients/aprel-soft.jpeg", name:"Апрель Софт", work:"Выездная игра «Пресейл» для менеджеров и руководителей проектов" },
  { logo:"/clients/astra.png", name:"Astra", work:"Тренинг SYNC для проектных команд" },
  { logo:"/clients/cors.png", name:"CORS Academy", work:"Игра «Кризис» для менеджеров и руководителей проектов" },
  { logo:"/clients/kabosh.jpeg", name:"Kabosh", work:"Тренинг SYNC для проектных команд" },
  { logo:"/clients/rzd-stroy.png", name:"РЖДстрой", work:"Тренинг SYNC по текущему проекту автоматизации" },
];
export const metadata={title:"Кейсы — IT-Терапия"};
export default function Page(){return <main><SiteHeader/>    <section className="portfolio hero-cases" id="portfolio">
      <div className="section-heading"><p className="eyebrow">КЕЙСЫ И ОТЗЫВЫ</p><h2>Нам доверяют<br/>сложные команды.</h2><p>От точечных тренировок до сопровождения действующих проектов автоматизации.</p></div>
      <div className="featured-cases">
        <article><div className="featured-case-logo"><img src="/clients/rzd-stroy.png" alt="РЖДстрой"/></div><span>ДЕЙСТВУЮЩИЙ ПРОЕКТ</span><h3>SYNC в ходе проекта автоматизации</h3><p>Фокус: вернуть участникам общее понимание результата, правил взаимодействия и ключевых проектных договорённостей.</p></article>
        <article><div className="featured-case-logo"><img src="/clients/uc1.png" alt="Учебный центр №1"/></div><span>РЕГУЛЯРНАЯ ПРАКТИКА</span><h3>Серия бизнес-игр «Пресейл» и «Кризис»</h3><p>Фокус: тренировка сложных переговоров, развитие пресейловых навыков и разбор поведения участников в реалистичных ситуациях.</p></article>
        <article><div className="featured-case-logo"><img src="/clients/1soft.svg" alt="1Софт"/></div><span>РАЗВИТИЕ СОТРУДНИКОВ</span><h3>Тренинг «Мастер презентаций»</h3><p>Фокус: ясная структура выступления, убедительная аргументация и уверенная подача материала сотрудниками.</p></article>
      </div>
      <div className="case-grid">{cases.map(item=><article className="case-card" key={item.name}><div className="case-logo"><img src={item.logo} alt={item.name}/></div><h3>{item.name}</h3><p>{item.work}</p></article>)}</div>
      <ReviewsCarousel />
    </section>    <SiteFooter/></main>}