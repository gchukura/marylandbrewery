/**
 * Header Component - Server Component for Static Generation
 * Updated to match v2 design system (Heritage Craft Modern)
 * Uses Source Sans 3 typography and Maryland color palette
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menu on ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="bg-[#9B2335] sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Menu Button - Left side */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#D4A017] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-0 hover:opacity-90 transition-opacity flex-1 lg:flex-initial justify-center lg:justify-start"
            >
              {/* Logo Emblem */}
              <Image
                src="/logo-emblem.svg"
                alt="Maryland Brewery"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              {/* Text Logo - using Source Sans 3 from design system */}
              <span 
                className="text-white whitespace-nowrap text-xl font-semibold ml-1"
                style={{ 
                  fontFamily: "'Source Sans 3', sans-serif",
                  letterSpacing: 'normal',
                  fontSize: '1.25rem'
                }}
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
                    className="text-white hover:text-white transition-colors py-2 font-medium text-body-large font-body"
                  >
                    {item.label}
                  </Link>
              ))}
            </nav>

            {/* Spacer for mobile to balance hamburger menu */}
            <div className="lg:hidden w-[44px]"></div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Side Menu */}
      <>
        {/* Backdrop */}
        <div 
          className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ease-in-out ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        {/* Side Menu Panel */}
        <div className={`lg:hidden fixed left-0 top-0 h-full w-64 sm:w-80 bg-[#9B2335] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#7A1C2A]">
                <span className="text-white font-semibold text-lg font-body">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-white hover:text-[#D4A017] transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {/* Navigation Links */}
              <nav className="flex-1 py-4 overflow-y-auto" aria-label="Mobile navigation">
                {NAVIGATION_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block w-full px-6 py-4 text-white hover:text-[#D4A017] hover:bg-[#7A1C2A]/30 active:bg-[#7A1C2A]/50 transition-colors font-medium text-body-large min-h-[48px] flex items-center touch-manipulation border-b border-[#7A1C2A]/30 last:border-b-0 font-body"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
      </>

      {/* Gold border at bottom - Maryland design accent */}
      <div className="h-1 bg-[#D4A017]" />
    </>
  );
}
