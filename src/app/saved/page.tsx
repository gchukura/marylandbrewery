import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SavedList from '@/components/saved/SavedList';

// Per-visitor content: nothing for search engines
export const metadata: Metadata = buildMetadata({
  title: 'Saved Breweries',
  description: 'The breweries you saved on this device.',
  path: '/saved',
  noindex: true,
});

export default function SavedPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6">
      <header className="flex flex-col gap-3.5">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Saved', path: '/saved' },
          ]}
          jsonLd={false}
        />
        <h1 className="m-0 font-display text-[32px] font-bold leading-[1.05] text-ink md:text-[44px]">Saved breweries</h1>
        <p className="m-0 text-base text-muted">Kept in this browser only; no account needed.</p>
      </header>
      <SavedList />
    </div>
  );
}
