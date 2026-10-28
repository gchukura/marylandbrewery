'use client';

import { useEffect, useState } from 'react';
import { isOpenAt, type WeeklyHours } from '@/lib/hours';

const countOpen = (hours: WeeklyHours[], now: Date) =>
  hours.filter((h) => isOpenAt(h, now).open).length;

/** "8 open right now", recomputed in the browser so a cached page stays current. */
export default function OpenNowCount({
  hours,
  renderedAt,
}: {
  hours: WeeklyHours[];
  renderedAt: number;
}) {
  const [count, setCount] = useState(() =>
    countOpen(hours, new Date(renderedAt))
  );
  useEffect(() => {
    const update = () => setCount(countOpen(hours, new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [hours]);
  return <>{count} open right now</>;
}
