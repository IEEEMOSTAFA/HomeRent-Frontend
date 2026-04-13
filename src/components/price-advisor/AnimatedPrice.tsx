"use client";

import React, { useEffect, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";

interface Props {
  value: number;
  prefix?: string;
}

export default function AnimatedPrice({ value, prefix = "৳" }: Props) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 55, damping: 14 });
  const [display, setDisplay] = useState(value);

  useEffect(() => { motionVal.set(value); }, [value]);
  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return (
    <span className="tabular-nums">
      {prefix}{display.toLocaleString("en-BD")}
    </span>
  );
}