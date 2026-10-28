import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: ReactNode;
  /** Small uppercase line above the title */
  eyebrow?: ReactNode;
  /** Right-aligned link, e.g. "All 61 open breweries →" */
  action?: { label: string; href: string };
  /** lg: 36px (home sections); md: 28px (detail pages) */
  size?: 'lg' | 'md';
  as?: 'h2' | 'h3';
  id?: string;
  className?: string;
}

export default function SectionHeading({ title, eyebrow, action, size = 'lg', as: Tag = 'h2', id, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-wrap items-baseline justify-between gap-4', className)}>
      <div className="flex flex-col gap-1.5">
        {eyebrow && <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</div>}
        <Tag
          id={id}
          className={cn(
            'm-0 font-display font-semibold text-ink',
            size === 'lg' ? 'text-[28px] leading-[1.15] md:text-4xl md:leading-[1.1]' : 'text-2xl leading-[1.15] md:text-[28px]'
          )}
        >
          {title}
        </Tag>
      </div>
      {action && (
        <Link href={action.href} className="text-[15px] font-semibold text-brand-red hover:text-brand-red-dark">
          {action.label}
        </Link>
      )}
    </div>
  );
}
