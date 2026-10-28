'use client';

import { useEffect, useRef, useState } from 'react';
import BreweryMapLazy, { type MapPoint } from '@/components/maps/BreweryMapLazy';

/** The rail's one-pin map, mounted only when it scrolls near the viewport. */
export default function RailMap({ point }: { point: MapPoint }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setVisible(true);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-56 overflow-hidden rounded-card border border-line bg-map">
      {visible && <BreweryMapLazy single points={[point]} />}
    </div>
  );
}
