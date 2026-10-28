import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbList, type Crumb } from '@/lib/seo/jsonld';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  /** Home first, the current page last */
  items: Crumb[];
  /** Emit BreadcrumbList JSON-LD. Turn off where the page already emits one (e.g. via collectionPage). */
  jsonLd?: boolean;
  /** For breadcrumbs over a dark hero */
  tone?: 'default' | 'onDark';
  className?: string;
}

export default function Breadcrumbs({ items, jsonLd = true, tone = 'default', className }: BreadcrumbsProps) {
  const muted = tone === 'onDark' ? 'text-paper/80' : 'text-muted';
  const current = tone === 'onDark' ? 'text-paper' : 'text-ink';
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn('text-[13px]', muted, className)}>
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className={cn('font-medium', current)}>
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className={cn(muted, 'hover:text-brand-red')}>
                      {item.name}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {jsonLd && <JsonLd data={breadcrumbList(items)} />}
    </>
  );
}
