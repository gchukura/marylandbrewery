/**
 * MobileMenu Component - Client Component for Mobile Navigation
 * Lightweight client component for mobile menu functionality
 */

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  children?: Array<{
    label: string;
    href: string;
  }>;
}

interface MobileMenuProps {
  navigationItems: NavigationItem[];
}

export default function MobileMenu({ navigationItems }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemLabel: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedItems(newExpanded);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setExpandedItems(new Set());
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-white hover:text-yellow-300 transition-colors"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-72 max-w-[80vw] bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-4 space-y-2 text-right">
                  {/* Home Link */}
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
                  >
                    Home
                  </Link>

                  {/* All Breweries Link */}
                  <Link
                    href="/breweries"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
                  >
                    All Breweries
                  </Link>

                  {/* Navigation Items with Dropdowns */}
                  {navigationItems.map((item) => (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium"
                      >
                        <span className="ml-auto">{item.label}</span>
                        {item.children && (
                          expandedItems.has(item.label) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      
                      {/* Dropdown Items */}
                      {item.children && expandedItems.has(item.label) && (
                        <div className="mr-4 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMenu}
                              className="block px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-right"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* No search link on mobile to match simplified header */}
                </nav>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  <p>Maryland Brewery Directory</p>
                  <p>Supporting Local Breweries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
