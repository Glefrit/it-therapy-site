"use client";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [{"href": "/", "label": "Главная"}, {"href": "/products", "label": "Продукты и услуги"}, {"href": "/development", "label": "Развиваем сотрудников"}, {"href": "/teams", "label": "Синхронизируем команды"}, {"href": "/rescue", "label": "Спасаем проекты"}, {"href": "/cases", "label": "Кейсы"}, {"href": "/cards", "label": "Карточки IT-Пресейл"}];

export function SiteHeader({ ctaHref="/#diagnostic", ctaLabel="Обсудить задачу" }:{ ctaHref?:string; ctaLabel?:string }){
  return <header className="site-header">
    <a className="brand" href="/" aria-label="IT-Терапия — на главную"><span className="brand-mark">IT</span><span>ТЕРАПИЯ</span></a>
    <nav aria-label="Основная навигация">{links.map(link=><a href={link.href} key={link.href}>{link.label}</a>)}</nav>
    <a className="header-cta" href={ctaHref}>{ctaLabel} <span aria-hidden="true"></span></a>
    <Sheet>
      <SheetTrigger className="mobile-menu-trigger" aria-label="Открыть меню"><Menu aria-hidden="true"/></SheetTrigger>
      <SheetContent className="mobile-menu-sheet">
        <SheetHeader>
          <SheetTitle className="mobile-menu-title">IT-ТЕРАПИЯ</SheetTitle>
          <SheetDescription className="mobile-menu-description">Успешные IT-проекты начинаются с честного разговора.</SheetDescription>
        </SheetHeader>
        <div className="mobile-menu-links">{links.map((link,index)=><SheetClose asChild key={link.href}><a href={link.href}><span>0{index+1}</span>{link.label}</a></SheetClose>)}</div>
        <SheetClose asChild><a className="mobile-menu-cta" href={ctaHref}>{ctaLabel}</a></SheetClose>
        <div className="mobile-menu-contacts"><a href="tel:+79163090129">+7 916 309-01-29</a><a href="mailto:info@it-therapy.ru">info@it-therapy.ru</a></div>
      </SheetContent>
    </Sheet>
  </header>;
}
