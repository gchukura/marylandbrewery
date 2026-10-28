'use client';

import { useSyncExternalStore } from 'react';
import { Bookmark } from 'lucide-react';
import { isSaved, subscribeSaved, toggleSaved } from '@/lib/saved';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Save a brewery to /saved (this browser only). Works without storage for the current visit. */
export default function SaveButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const saved = useSyncExternalStore(subscribeSaved, () => isSaved(slug), () => false);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Saved: ${name}. Remove from saved` : `Save ${name}`}
      onClick={() => toggleSaved(slug)}
      className={cn(buttonVariants({ variant: saved ? 'ink' : 'secondary', size: 'md' }), className)}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} aria-hidden="true" />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
