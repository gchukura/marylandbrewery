import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chipVariants = cva(
  'tap inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip px-3.5 py-2 font-sans text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red',
  {
    variants: {
      tone: {
        default: 'border-[1.5px] border-line-strong bg-white text-ink hover:border-ink',
        selected: 'border-[1.5px] border-ink bg-ink text-paper',
        gold: 'bg-gold text-ink hover:bg-gold/90',
        onDark: 'border border-paper/40 bg-paper/15 text-paper hover:bg-paper/25',
      },
    },
    defaultVariants: { tone: 'default' },
  }
);

interface ChipProps extends VariantProps<typeof chipVariants> {
  children: ReactNode;
  className?: string;
  /** Renders a link when given, otherwise a span */
  href?: string;
}

interface FilterChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  pressed: boolean;
  /** "Open now" is gold when on; every other filter is ink */
  highlight?: 'gold' | 'ink';
}

/** A toggle filter. State lives in the parent (a client component); this only renders it. */
export function FilterChip({ pressed, highlight = 'ink', className, children, type = 'button', ...props }: FilterChipProps) {
  const tone = !pressed ? 'default' : highlight === 'gold' ? 'gold' : 'selected';
  return (
    <button type={type} aria-pressed={pressed} className={cn(chipVariants({ tone }), className)} {...props}>
      {children}
      {pressed && highlight === 'ink' && <span aria-hidden="true">×</span>}
    </button>
  );
}
