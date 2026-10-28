import Link from 'next/link';
import { slugify } from '@/lib/slug';

export interface LinkGroup {
  title: string;
  links: { label: string; href: string; count?: number }[];
}

/** An A-Z index: a jump list of groups, then each group's links (/neighborhoods, /near). */
export default function GroupedLinks({
  groups,
  jumpLabel = 'Jump to a city',
}: {
  groups: LinkGroup[];
  jumpLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      <nav aria-label={jumpLabel}>
        <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1.5 p-0 text-sm">
          {groups.map((g) => (
            <li key={g.title}>
              <a
                href={`#${slugify(g.title)}`}
                className="text-brand-red hover:text-brand-red-dark"
              >
                {g.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
        {groups.map((g) => (
          <section
            key={g.title}
            id={slugify(g.title)}
            aria-labelledby={`${slugify(g.title)}-h`}
            className="mb-6 break-inside-avoid"
          >
            <h2
              id={`${slugify(g.title)}-h`}
              className="m-0 mb-2 font-display text-lg font-semibold text-ink"
            >
              {g.title}{' '}
              <span className="font-sans text-sm font-normal text-muted">
                ({g.links.length})
              </span>
            </h2>
            <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[15px]">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-ink hover:text-brand-red">
                    {l.label}
                  </Link>
                  {l.count !== undefined && (
                    <span className="text-sm text-muted"> {l.count}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/** Group items by a key, groups and items sorted A-Z; items without a key go last under `other`. */
export function groupLinks<T>(
  items: T[],
  key: (item: T) => string | null | undefined,
  link: (item: T) => LinkGroup['links'][number],
  other = 'Elsewhere'
): LinkGroup[] {
  const groups = new Map<string, LinkGroup['links']>();
  for (const item of items) {
    const title = key(item)?.trim() || other;
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title)!.push(link(item));
  }
  return [...groups.entries()]
    .sort(([a], [b]) =>
      a === other ? 1 : b === other ? -1 : a.localeCompare(b)
    )
    .map(([title, links]) => ({
      title,
      links: links.sort((a, b) => a.label.localeCompare(b.label)),
    }));
}
