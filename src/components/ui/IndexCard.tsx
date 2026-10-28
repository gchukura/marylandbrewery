import Link from 'next/link';

interface IndexCardProps {
  href: string;
  title: string;
  count: number;
  description?: string;
  /** A short extra line, e.g. the top cities in a county */
  meta?: string;
}

/** One entry on a browse index (/counties, /region, /amenities, /type): name, brewery count, a line or two. */
export default function IndexCard({
  href,
  title,
  count,
  description,
  meta,
}: IndexCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-2 rounded-card border border-line bg-white p-5 text-ink hover:border-ink hover:text-ink"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-display text-[22px] font-bold leading-tight group-hover:text-brand-red">
          {title}
        </span>
        <span className="shrink-0 text-sm text-muted">
          {count} {count === 1 ? 'brewery' : 'breweries'}
        </span>
      </span>
      {description && (
        <span className="text-[15px] leading-[1.55] text-muted">
          {description}
        </span>
      )}
      {meta && (
        <span className="mt-auto pt-1 text-[13px] text-muted">{meta}</span>
      )}
    </Link>
  );
}

/** The grid IndexCards sit in. */
export function IndexGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}
