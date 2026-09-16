"use client";

import { useEffect, useRef } from "react";

export function HeroBackgroundMotion(){
  const anchor=useRef<HTMLSpanElement>(null);

  useEffect(()=>{
    const hero=anchor.current?.parentElement;
    if(!hero) return;

    function move(event:PointerEvent){
      if(event.pointerType==="touch") return;
      const rect=hero!.getBoundingClientRect();
      const x=((event.clientX-rect.left)/rect.width-.5)*18;
      const y=((event.clientY-rect.top)/rect.height-.5)*18;
      hero!.style.setProperty("--hero-media-x",`${x}px`);
      hero!.style.setProperty("--hero-media-y",`${y}px`);
    }

    function reset(){
      hero!.style.setProperty("--hero-media-x","0px");
      hero!.style.setProperty("--hero-media-y","0px");
    }

    hero.addEventListener("pointermove",move);
    hero.addEventListener("pointerleave",reset);
    return ()=>{
      hero.removeEventListener("pointermove",move);
      hero.removeEventListener("pointerleave",reset);
    };
  },[]);

  return <span ref={anchor} className="hero-motion-anchor" aria-hidden="true"/>;
}
