"use client";

import type { PointerEvent } from "react";

export function HeroMotion(){
  function move(event:PointerEvent<HTMLElement>){
    const rect=event.currentTarget.getBoundingClientRect();
    const x=((event.clientX-rect.left)/rect.width-.5)*18;
    const y=((event.clientY-rect.top)/rect.height-.5)*18;
    event.currentTarget.style.setProperty("--hero-x",`${x}px`);
    event.currentTarget.style.setProperty("--hero-y",`${y}px`);
  }

  function reset(event:PointerEvent<HTMLElement>){
    event.currentTarget.style.setProperty("--hero-x","0px");
    event.currentTarget.style.setProperty("--hero-y","0px");
  }

  return <section className="editorial-hero wow-hero" onPointerMove={move} onPointerLeave={reset}>
    <div className="hero-gantt" aria-hidden="true">
      <svg viewBox="0 0 720 600" fill="none">
        <g className="hero-gantt-grid">
          {[80,160,240,320,400,480,560,640].map(x=><path key={x} d={`M${x} 36V564`}/>)}
          {[84,156,228,300,372,444,516].map(y=><path key={y} d={`M32 ${y}H696`}/>)}
        </g>
        <g className="hero-gantt-bars">
          <rect x="64" y="102" width="176" height="30" rx="5"/>
          <rect x="160" y="174" width="160" height="30" rx="5"/>
          <rect x="240" y="246" width="240" height="30" rx="5"/>
          <rect x="320" y="318" width="160" height="30" rx="5"/>
          <rect x="400" y="390" width="160" height="30" rx="5"/>
          <rect x="560" y="462" width="104" height="30" rx="5"/>
        </g>
        <g className="hero-gantt-progress">
          <rect x="64" y="102" width="176" height="30" rx="5"/>
          <rect x="160" y="174" width="160" height="30" rx="5"/>
          <rect x="240" y="246" width="128" height="30" rx="5"/>
        </g>
        <path className="hero-gantt-today" d="M368 60V540"/>
      </svg>
    </div>
    <p className="eyebrow">IT-ТЕРАПИЯ / ПРОЕКТЫ — ЭТО ЛЮДИ</p>
    <h1>Помогаем командам<br/><span className="accent-text">успешно продавать</span><br/>и реализовывать IT проекты.</h1>
    <div className="wow-hero-bottom"><p className="editorial-lead">Соединяем проектную экспертизу и работу с людьми — от первого разговора с заказчиком до результата, который принимает команда.</p></div>
  </section>;
}
