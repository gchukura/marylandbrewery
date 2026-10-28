import Image from 'next/image';
import { canOptimizeImage } from '@/lib/images';
import { cn } from '@/lib/utils';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w) && !/^(the|of|and|&)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

interface BreweryPhotoProps {
  src?: string | null;
  name: string;
  /** next/image sizes for the box this fills */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Fills its (relatively positioned) parent. Cream box with initials when there's no photo. */
export default function BreweryPhoto({ src, name, sizes, priority, className }: BreweryPhotoProps) {
  if (!src) {
    return (
      <div aria-hidden="true" className={cn('absolute inset-0 flex items-center justify-center bg-cream font-display text-3xl font-bold text-muted', className)}>
        {initials(name)}
      </div>
    );
  }
  if (!canOptimizeImage(src)) {
    // Hosts outside next.config remotePatterns can't go through next/image
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" loading={priority ? 'eager' : 'lazy'} className={cn('absolute inset-0 h-full w-full object-cover', className)} />;
  }
  return <Image src={src} alt="" fill sizes={sizes} priority={priority} className={cn('object-cover', className)} />;
}
