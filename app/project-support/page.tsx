import { SiteHeader } from "../site-header";
import { SiteFooter } from "../site-footer";
import { ProjectCatalog } from "./catalog";

export const metadata = {
  title: "Комплексное сопровождение проектов — IT-Терапия",
  description: "35 услуг и 18 пакетов для заказчиков и подрядчиков: запуск, реализация и восстановление IT-проектов, развитие команды и синхронизация участников.",
  alternates: { canonical: "https://it-therapy.ru/project-support" },
};

export default function ProjectSupportPage() {
  return <><script dangerouslySetInnerHTML={{__html: `window.addEventListener("popstate",function(e){if(document.querySelector("[data-project-catalog]")&&location.pathname.replace(/\\/$/,"")==="/project-support"){e.stopImmediatePropagation();window.dispatchEvent(new Event("project-catalog-route"));}},true);`}}/><SiteHeader/><ProjectCatalog/><noscript><section style={{padding:"40px"}}><h1>Комплексное сопровождение проектов</h1><p>Помощь заказчикам с запуском, реализацией и восстановлением IT-проекта. Развитие команд подрядчика, синхронизация с заказчиком и помощь с проектом.</p><p>Для выбора пакета и фильтрации 35 услуг включите JavaScript или <a href="mailto:info@it-therapy.ru">напишите нам</a>.</p></section></noscript><SiteFooter/></>;
}
