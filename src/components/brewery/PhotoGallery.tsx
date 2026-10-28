'use client';

/**
 * The photo grid (one large + two small, as in Brewery.html) and its lightbox. The lightbox is a
 * native modal <dialog>: showModal() sets aria-modal, makes the page inert (focus stays inside)
 * and closes on Esc. Arrow keys move between photos; focus returns to whatever opened it.
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { canOptimizeImage } from '@/lib/images';
import { cn } from '@/lib/utils';

function Photo({ src, alt, sizes, priority, contain }: { src: string; alt: string; sizes: string; priority?: boolean; contain?: boolean }) {
  const fit = contain ? 'object-contain' : 'object-cover';
  if (!canOptimizeImage(src)) {
    // eslint-disable-next-line @next/next/no-img-element -- host outside next.config remotePatterns
    return <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} className={cn('absolute inset-0 h-full w-full', fit)} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={fit} />;
}

export default function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const label = (i: number) => `${name}, photo ${i + 1} of ${count}`;

  const open = (i: number, opener: HTMLElement) => {
    openerRef.current = opener;
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => openerRef.current?.focus();
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  // Keep the active thumbnail in view
  useEffect(() => {
    dialogRef.current?.querySelector(`[data-thumb="${index}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [index]);

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  if (count === 0) return null;
  const tiles = photos.slice(0, 3);

  return (
    <>
      <div className="relative">
        <div className={cn('grid gap-2.5 overflow-hidden rounded-hero', tiles.length >= 3 && 'sm:grid-cols-[2fr_1fr] sm:grid-rows-[220px_220px]')}>
          {tiles.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              aria-label={`Open ${label(i)}`}
              className={cn(
                'relative block overflow-hidden bg-cream',
                i > 0
                  ? 'hidden sm:block'
                  : tiles.length >= 3
                    ? 'aspect-[4/3] sm:row-span-2 sm:aspect-auto'
                    : 'aspect-[4/3] sm:aspect-[16/7]'
              )}
            >
              <Photo src={src} alt="" sizes={i === 0 ? '(max-width: 640px) 100vw, 800px' : '400px'} priority={i === 0} />
            </button>
          ))}
        </div>
        {count > 1 && (
          <button
            type="button"
            onClick={(e) => open(0, e.currentTarget)}
            className="tap absolute bottom-3 right-3 rounded-[8px] bg-white px-3 py-2 text-[13px] font-semibold text-ink shadow-[0_2px_8px_rgba(20,20,20,0.15)] hover:bg-cream"
          >
            All {count} photos
          </button>
        )}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${name} photos`}
        onKeyDown={onKeyDown}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-ink/95 p-0 text-paper backdrop:bg-ink/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="m-0 text-sm text-paper/80" aria-live="polite">
              {index + 1} of {count}
            </p>
            <button type="button" onClick={close} aria-label="Close photos" className="flex h-11 w-11 items-center justify-center rounded-control hover:bg-paper/10">
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Photo src={photos[index]} alt={label(index)} sizes="100vw" contain />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 hover:bg-ink"
                >
                  <ChevronLeft className="h-7 w-7" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 hover:bg-ink"
                >
                  <ChevronRight className="h-7 w-7" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          {count > 1 && (
            <ul className="m-0 flex list-none gap-2 overflow-x-auto p-3" aria-label="Thumbnails">
              {photos.map((src, i) => (
                <li key={src} className="shrink-0">
                  <button
                    type="button"
                    data-thumb={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${label(i)}`}
                    aria-current={i === index ? 'true' : undefined}
                    className={cn('relative block h-14 w-20 overflow-hidden rounded-[6px] border-2', i === index ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100')}
                  >
                    <Photo src={src} alt="" sizes="80px" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
