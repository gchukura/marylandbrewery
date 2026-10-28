import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: { mark: 30, text: 'text-lg sm:text-xl', gap: 'gap-2.5' }, // footer
  md: { mark: 32, text: 'text-[19px] sm:text-2xl', gap: 'gap-2.5 sm:gap-3' }, // header (38px mark from sm up via class)
  lg: { mark: 56, text: 'text-[34px]', gap: 'gap-[18px]' },
};

interface LogoProps {
  size?: keyof typeof SIZES;
  /** Wordmark color: ink on paper, paper on the dark footer */
  tone?: 'ink' | 'paper';
  /** Wrap in a link to the homepage (default) */
  href?: string | null;
  className?: string;
}

/** The pint mark (public/mark.svg) and the "Maryland Brewery" wordmark in Fraunces. */
export default function Logo({ size = 'md', tone = 'ink', href = '/', className }: LogoProps) {
  const s = SIZES[size];
  const content = (
    <>
      <Image src="/mark.svg" alt="" width={s.mark} height={s.mark} className={cn('shrink-0', size === 'md' && 'sm:h-[38px] sm:w-[38px]')} priority={size === 'md'} />
      <span className={cn('font-display font-bold leading-none tracking-[-0.01em]', s.text, tone === 'paper' ? 'text-paper' : 'text-ink')}>Maryland Brewery</span>
    </>
  );
  const classes = cn('inline-flex items-center', s.gap, className);
  return href ? (
    <Link href={href} className={cn(classes, 'hover:text-current')} aria-label="Maryland Brewery, home">
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
}
