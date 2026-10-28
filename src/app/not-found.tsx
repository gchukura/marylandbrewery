import type { Metadata } from 'next';
import Link from 'next/link';
import SearchCombobox from '@/components/search/SearchCombobox';
import NoAds from '@/components/ads/NoAds';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

const SUGGESTIONS = [
  { label: 'Brewery map', href: '/map' },
  { label: 'Open now', href: '/open-now' },
  { label: 'Cities', href: '/cities' },
  { label: 'Counties', href: '/counties' },
  { label: 'Best breweries', href: '/best-breweries' },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-16 sm:px-6 md:py-24">
      <NoAds />
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        404
      </p>
      <h1 className="m-0 font-display text-[32px] font-bold leading-[1.05] text-ink md:text-[44px]">
        We can&apos;t find that page
      </h1>
      <p className="m-0 text-[17px] leading-[1.6] text-muted">
        It may have moved, or the brewery may have closed. Search for a brewery,
        city or county instead:
      </p>
      <SearchCombobox submitLabel="Search" />
      <nav aria-label="Popular pages">
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {SUGGESTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="tap inline-flex items-center rounded-chip border-[1.5px] border-line-strong bg-white px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink hover:text-ink"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
