"use client";

import { useEffect, useState } from 'react';

interface CountUpProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export default function CountUp({ value, durationMs = 1200, className = '' }: CountUpProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Math.max(0, Math.floor(value));

    let raf = 0;
    const step = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      if (p < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
