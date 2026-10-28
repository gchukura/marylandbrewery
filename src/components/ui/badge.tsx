import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva('inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 font-sans text-xs font-semibold', {
  variants: {
    variant: {
      default: 'bg-cream text-ink',
      gold: 'bg-gold text-ink', // gold always carries black text
      ink: 'bg-ink text-paper',
      outline: 'border border-line-strong bg-white text-ink',
      brand: 'bg-brand-red text-paper',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
