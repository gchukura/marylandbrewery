/**
 * Header Component - Server Component for Static Generation
 * Updated to match v2 design system (Heritage Craft Modern)
 * Uses Source Sans 3 typography and Maryland color palette
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

// Static navigation data - simplified to match v2 design
const NAVIGATION_ITEMS = [
  { label: 'Cities', href: '/cities' },
  { label: 'Counties', href: '/counties' },
  { label: 'Brewery Map', href: '/map' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-[#9B2335] sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              {/* Text Logo - using Source Sans 3 from design system */}
              <span 
                className="text-white whitespace-nowrap text-xl font-normal"
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
                  className="text-[#E5E7EB] hover:text-white transition-colors py-2 font-medium text-sm"
                  style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#D4A017] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[#7A1C2A]">
              <nav className="space-y-1">
                {NAVIGATION_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-3 text-white hover:text-[#D4A017] transition-colors font-medium"
                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* Gold border at bottom - Maryland design accent */}
      <div className="h-1 bg-[#D4A017]" />
    </>
  );
}
