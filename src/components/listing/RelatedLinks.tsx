import Link from 'next/link';
import SectionHeading from '@/components/ui/SectionHeading';

export interface RelatedGroup {
  title: string;
  links: { label: string; href: string; count?: number }[];
}

/** Internal links under a listing: neighborhoods, nearby cities, the county, amenity pages. */
export default function RelatedLinks({ groups }: { groups: RelatedGroup[] }) {
  const shown = groups.filter((g) => g.links.length > 0);
  if (shown.length === 0) return null;
  return (
    <div className="flex flex-col gap-8">
      {shown.map((group) => (
        <section key={group.title} className="flex flex-col gap-4">
          <SectionHeading title={group.title} size="md" />
          <ul className="flex flex-wrap gap-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="tap inline-flex items-center gap-2 rounded-chip border-[1.5px] border-line-strong bg-white px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-ink hover:text-ink"
                >
                  {link.label}
                  {link.count !== undefined && (
                    <span className="font-medium text-muted">{link.count}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
