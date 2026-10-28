'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import CheckerBand from '@/components/ui/CheckerBand';
import { PRIMARY_NAV, isCurrent } from './nav';

/**
 * Phone menu: a native modal <dialog>. showModal() makes the page behind it inert (so focus stays
 * in the dialog) and Esc closes it; focus goes back to the menu button on close.
 */
export default function MobileMenu({ className }: { className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const close = () => dialogRef.current?.close();

  // Navigating closes the menu
  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      document.documentElement.style.overflow = '';
      triggerRef.current?.focus();
    };
    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  const open = () => {
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = 'hidden';
  };

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-control text-ink hover:bg-cream"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        // Clicking the backdrop (the dialog element itself, outside its content) closes it
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-ink/40"
      >
        <CheckerBand />
        <div className="flex items-center justify-between px-5 py-3.5">
          <Logo size="md" />
          <button type="button" onClick={close} aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-control hover:bg-cream">
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Primary" className="px-5 pt-2">
          <ul className="flex flex-col border-t border-line">
            {PRIMARY_NAV.map(({ label, href }) => {
              const current = isCurrent(pathname, href);
              return (
                <li key={href} className="border-b border-line">
                  <Link
                    href={href}
                    onClick={close}
                    aria-current={current ? 'page' : undefined}
                    className={cn('tap flex items-center py-4 font-display text-2xl font-semibold', current ? 'text-brand-red' : 'text-ink')}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/add-brewery" onClick={close} className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'mt-6 w-full')}>
            Add a brewery
          </Link>
        </nav>
      </dialog>
    </div>
  );
}
