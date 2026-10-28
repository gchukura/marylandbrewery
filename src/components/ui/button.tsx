import { forwardRef, type ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Shared by <Button> and <ButtonLink>; also usable directly on any element via className. */
export const buttonVariants = cva(
  'tap inline-flex items-center justify-center gap-2 rounded-control font-sans font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-red text-paper hover:bg-brand-red-dark hover:text-paper',
        secondary:
          'border-[1.5px] border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
        ghost: 'bg-transparent text-ink hover:bg-cream hover:text-brand-red',
        ink: 'bg-ink text-paper hover:bg-ink/90 hover:text-paper', // a toggle that's on (Saved)
      },
      size: {
        sm: 'h-10 px-4 text-sm', // the header's Add a brewery
        md: 'h-11 px-[18px] text-sm',
        lg: 'h-14 px-[26px] text-base',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export interface ButtonLinkProps extends ButtonVariantProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** External links open in a new tab with rel="noopener" */
  external?: boolean;
}

/** A link that looks like a button (Get directions, Add a brewery). */
export function ButtonLink({
  href,
  className,
  variant,
  size,
  external,
  children,
}: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
