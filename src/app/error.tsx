'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import NoAds from '@/components/ads/NoAds';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Route errors. Errors aren't sent to any reporting service (server errors land in the Vercel
 * logs), so the copy promises nothing more than a retry and a way to tell us.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-start gap-5 px-4 py-16 sm:px-6 md:py-24">
      <NoAds />
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Something broke
      </p>
      <h1 className="m-0 font-display text-[32px] font-bold leading-[1.05] text-ink md:text-[44px]">
        This page didn&apos;t load
      </h1>
      <p className="m-0 text-[17px] leading-[1.6] text-muted">
        Usually that&apos;s temporary, so trying again often works. If it keeps
        happening,{' '}
        <Link
          href="/contact"
          className="font-semibold text-brand-red hover:text-brand-red-dark"
        >
          let us know
        </Link>{' '}
        which page it was.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
          Home
        </Link>
        <Link href="/map" className={buttonVariants({ variant: 'secondary' })}>
          Brewery map
        </Link>
      </div>
      {error.digest && (
        <p className="m-0 text-xs text-muted">Reference: {error.digest}</p>
      )}
    </div>
  );
}
