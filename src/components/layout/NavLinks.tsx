'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PRIMARY_NAV, isCurrent } from './nav';

/** The desktop nav row. A client island only to mark the current section. */
export default function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-7 text-[15px] font-medium">
        {PRIMARY_NAV.map(({ label, href }) => {
          const current = isCurrent(pathname, href);
          return (
            <li key={href}>
              <Link href={href} aria-current={current ? 'page' : undefined} className={cn(current ? 'text-brand-red' : 'text-ink', 'hover:text-brand-red')}>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
