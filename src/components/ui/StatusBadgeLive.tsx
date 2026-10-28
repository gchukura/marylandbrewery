'use client';

import { useEffect, useState } from 'react';
import { openStatusLabel, type OpenStatusLabel, type WeeklyHours } from '@/lib/hours';
import { cn } from '@/lib/utils';

interface StatusBadgeLiveProps {
  hours: WeeklyHours;
  /** Status computed when the page was rendered; shown until the browser recomputes it */
  initial: OpenStatusLabel | null;
  className?: string;
}

/** Pages are cached for an hour, so recompute open/closed in the browser after mount. */
export default function StatusBadgeLive({ hours, initial, className }: StatusBadgeLiveProps) {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    const update = () => setStatus(openStatusLabel(hours));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [hours]);

  if (!status) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip font-sans font-semibold',
        status.open ? 'bg-gold text-ink' : 'bg-ink text-paper',
        className
      )}
    >
      {status.label}
    </span>
  );
}
