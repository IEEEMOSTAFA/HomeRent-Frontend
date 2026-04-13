"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { animate as animeAnimate } from "animejs";
import type { StatItem } from "./types";

export function AnimatedCounter({ value, suffix, isFloat }: StatItem) {
  const ref     = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-60px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current || !ref.current) return;
    started.current = true;
    const obj = { v: 0 };
    animeAnimate(obj, {
      v: value,
      duration: 1600,
      ease: "easeOutExpo",
      onUpdate() {
        if (ref.current)
          ref.current.textContent = (isFloat ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix;
      },
    });
  }, [inView, value, suffix, isFloat]);

  return <span ref={ref} className="tabular-nums">{isFloat ? `0.0${suffix}` : `0${suffix}`}</span>;
}