import { cn } from '@/lib/utils';

// Maryland flag checker: ink/gold twice, then flag-red/white twice (docs/design/tokens.css)
const TOP = ['bg-ink', 'bg-gold', 'bg-ink', 'bg-gold', 'bg-flag-red', 'bg-white', 'bg-flag-red', 'bg-white'];
// The footer band starts on the other color of each pair
const BOTTOM = ['bg-gold', 'bg-ink', 'bg-gold', 'bg-ink', 'bg-white', 'bg-flag-red', 'bg-white', 'bg-flag-red'];

/** 8px band of 16 cells; 6px and 8 cells on phones. Decorative. */
export default function CheckerBand({ variant = 'top', className }: { variant?: 'top' | 'bottom'; className?: string }) {
  const cells = [...(variant === 'top' ? TOP : BOTTOM), ...(variant === 'top' ? TOP : BOTTOM)];
  return (
    <div aria-hidden="true" className={cn('grid h-1.5 grid-cols-8 sm:h-2 sm:grid-cols-16', className)}>
      {cells.map((cell, i) => (
        <div key={i} className={cn(cell, i >= 8 && 'hidden sm:block')} />
      ))}
    </div>
  );
}
