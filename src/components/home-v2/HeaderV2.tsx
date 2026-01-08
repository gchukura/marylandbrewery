'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

// Static navigation data
const NAVIGATION_ITEMS = [
  { label: 'Cities', href: '/cities' },
  { label: 'Counties', href: '/counties' },
  { label: 'Brewery Map', href: '/map' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function HeaderV2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="bg-[#9B2335] sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-4 safe-left safe-right">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-0 hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]"
              aria-label="Maryland Brewery Directory Home"
            >
              {/* Logo Emblem */}
              <Image
                src="/logo-emblem.svg"
                alt="Maryland Brewery"
                width={112}
                height={112}
                className="h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 object-contain flex-shrink-0"
                priority
              />
              {/* Text Logo - using Source Sans 3 from design system */}
              <span 
                className="text-white whitespace-nowrap text-base sm:text-lg md:text-xl font-semibold -ml-4 sm:-ml-6 hidden sm:inline"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                MarylandBrewery.com
              </span>
            </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white hover:text-white transition-colors py-2 font-medium text-sm"
                style={{ fontFamily: "'Source Sans 3', sans-serif" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 text-white hover:text-[#D4A017] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <>
              {/* Backdrop - click to close */}
              <div 
                className="lg:hidden fixed inset-0 bg-black/50 z-40 top-20"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="lg:hidden py-4 border-t border-[#7A1C2A] relative z-50 bg-[#9B2335]">
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {NAVIGATION_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-4 text-white hover:text-[#D4A017] hover:bg-[#7A1C2A]/30 active:bg-[#7A1C2A]/50 transition-colors font-medium min-h-[48px] flex items-center touch-manipulation"
                      style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </>
          )}
        </div>
      </header>
      {/* Orange border at bottom */}
      <div className="h-1 bg-[#D4A017]" />
    </>
  );
}
