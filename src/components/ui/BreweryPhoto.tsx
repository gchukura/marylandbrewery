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
  /** Smaller initials for thumbnail-size boxes */
  small?: boolean;
  className?: string;
}

/** Fills its (relatively positioned) parent. Cream box with initials when there's no photo. */
export default function BreweryPhoto({
  src,
  name,
  sizes,
  priority,
  small,
  className,
}: BreweryPhotoProps) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-cream font-display font-bold text-muted',
          small ? 'text-base' : 'text-3xl',
          className
        )}
      >
        {initials(name)}
      </div>
    );
  }
  if (!canOptimizeImage(src)) {
    // Hosts outside next.config remotePatterns can't go through next/image
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        className={cn('absolute inset-0 h-full w-full object-cover', className)}
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      priority={priority}
      className={cn('object-cover', className)}
    />
  );
}
