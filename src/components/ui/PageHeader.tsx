import type { ReactNode } from 'react';
import type { Crumb } from '@/lib/seo/jsonld';
import Breadcrumbs from './Breadcrumbs';

interface PageHeaderProps {
  /** Home first, this page last */
  breadcrumbs: Crumb[];
  /** The h1 */
  title: string;
  intro?: ReactNode;
}

/** Breadcrumbs, h1 and an intro line: the top of index and content pages (as on the listings). */
export default function PageHeader({
  breadcrumbs,
  title,
  intro,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3.5">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="m-0 font-display text-[32px] font-bold leading-[1.05] text-ink md:text-[44px]">
        {title}
      </h1>
      {intro && <p className="m-0 max-w-3xl text-base text-muted">{intro}</p>}
    </header>
  );
}
