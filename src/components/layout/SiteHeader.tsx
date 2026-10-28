import { ButtonLink } from '@/components/ui/button';
import CheckerBand from '@/components/ui/CheckerBand';
import Logo from '@/components/ui/Logo';
import MobileMenu from './MobileMenu';
import NavLinks from './NavLinks';

/** Checker band, logo, primary nav and "Add a brewery" (docs/design/artboards/Home.html). */
export default function SiteHeader() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <CheckerBand />
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-4 sm:h-[72px] sm:px-6">
          <Logo size="md" />
          <NavLinks className="hidden lg:block" />
          <div className="hidden lg:block">
            <ButtonLink href="/add-brewery" variant="secondary" size="sm">
              Add a brewery
            </ButtonLink>
          </div>
          <MobileMenu className="lg:hidden" />
        </div>
      </header>
    </>
  );
}
