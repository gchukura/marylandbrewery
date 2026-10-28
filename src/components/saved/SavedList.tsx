'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { getSaved, subscribeSaved } from '@/lib/saved';
import BreweryCard, { type BreweryCardData } from '@/components/ui/BreweryCard';
import { buttonVariants } from '@/components/ui/button';

const EMPTY: string[] = [];

/** Saved breweries from this browser, newest first, drawn from /brewery-cards.json. */
export default function SavedList() {
  const saved = useSyncExternalStore(subscribeSaved, getSaved, () => EMPTY);
  const [cards, setCards] = useState<Map<string, BreweryCardData> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (saved.length === 0 || cards) return;
    fetch('/brewery-cards.json')
      .then((r) => (r.ok ? (r.json() as Promise<BreweryCardData[]>) : Promise.reject(new Error(String(r.status)))))
      .then((list) => setCards(new Map(list.map((c) => [c.slug, c]))))
      .catch(() => setFailed(true));
  }, [saved.length, cards]);

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-panel border border-line bg-white p-6">
        <p className="m-0 text-ink">Nothing saved yet. Use the Save button on any brewery page and it shows up here, in this browser.</p>
        <Link href="/map" className={buttonVariants({ variant: 'secondary' })}>
          Browse the map
        </Link>
      </div>
    );
  }
  if (failed) return <p className="m-0 text-muted">Your saved breweries couldn&apos;t load. Try again in a moment.</p>;
  if (!cards) return <p className="m-0 text-muted" aria-live="polite">Loading your saved breweries…</p>;

  // Slugs of breweries that have since left the directory are skipped
  const list = saved.map((slug) => cards.get(slug)).filter((c): c is BreweryCardData => !!c);
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[15px] text-muted" aria-live="polite">
        {list.length} saved {list.length === 1 ? 'brewery' : 'breweries'}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
        {list.map((b) => (
          <BreweryCard key={b.slug} brewery={b} />
        ))}
      </div>
    </div>
  );
}
