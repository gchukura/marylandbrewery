/**
 * Header Component - Server Component for Static Generation
 * Optimized for 500+ page builds with Maryland flag design
 */

import Link from 'next/link';
import { MapPin, Search, Menu, Beer } from 'lucide-react';
import MobileMenu from './MobileMenu';

// Static navigation data for server-side rendering
const NAVIGATION_ITEMS = [
  {
    label: 'Cities',
    href: '/cities',
    children: [
      { label: 'Baltimore', href: '/breweries/baltimore' },
      { label: 'Annapolis', href: '/breweries/annapolis' },
      { label: 'Frederick', href: '/breweries/frederick' },
      { label: 'Rockville', href: '/breweries/rockville' },
      { label: 'Columbia', href: '/breweries/columbia' },
      { label: 'Silver Spring', href: '/breweries/silver-spring' },
      { label: 'Towson', href: '/breweries/towson' },
      { label: 'Gaithersburg', href: '/breweries/gaithersburg' },
    ]
  },
  {
    label: 'Counties',
    href: '/counties',
    children: [
      { label: 'Baltimore City', href: '/breweries/county/baltimore-city' },
      { label: 'Anne Arundel', href: '/breweries/county/anne-arundel' },
      { label: 'Montgomery', href: '/breweries/county/montgomery' },
      { label: 'Prince George\'s', href: '/breweries/county/prince-georges' },
      { label: 'Howard', href: '/breweries/county/howard' },
      { label: 'Frederick', href: '/breweries/county/frederick' },
      { label: 'Baltimore County', href: '/breweries/county/baltimore-county' },
      { label: 'Carroll', href: '/breweries/county/carroll' },
    ]
  },
  {
    label: 'Features',
    href: '/features',
    children: [
      { label: 'Food', href: '/breweries/amenity/food' },
      { label: 'Outdoor Seating', href: '/breweries/amenity/outdoor-seating' },
      { label: 'Live Music', href: '/breweries/amenity/live-music' },
      { label: 'Tours', href: '/breweries/amenity/tours' },
      { label: 'Pet Friendly', href: '/breweries/amenity/pet-friendly' },
      { label: 'WiFi', href: '/breweries/amenity/wifi' },
      { label: 'Parking', href: '/breweries/amenity/parking' },
    ]
  },
  {
    label: 'Types',
    href: '/types',
    children: [
      { label: 'Microbrewery', href: '/breweries/type/microbrewery' },
      { label: 'Brewpub', href: '/breweries/type/brewpub' },
      { label: 'Taproom', href: '/breweries/type/taproom' },
      { label: 'Production', href: '/breweries/type/production' },
      { label: 'Nano', href: '/breweries/type/nano' },
    ]
  }
];

// Priority routes for prefetching
const PRIORITY_ROUTES = [
  '/',
  '/breweries',
  '/breweries/baltimore',
  '/breweries/annapolis',
  '/breweries/frederick',
  '/breweries/rockville',
  '/breweries/columbia'
];

export default function Header() {
  return (
    <header className="bg-white shadow-lg border-b-4 border-red-600">
      {/* Top banner with Maryland flag colors */}
      <div className="bg-red-600 text-white py-1">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-semibold">🍺 Maryland's Craft Beer Directory</span>
              <span className="hidden sm:inline">Supporting Local Breweries Since 2024</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span>📅 Updated Daily</span>
              <span>📍 All 24 Counties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-2xl font-bold text-red-600 hover:text-red-700 transition-colors"
            prefetch={true}
          >
            <Beer className="h-8 w-8" />
            <span className="hidden sm:block">Maryland Brewery Directory</span>
            <span className="sm:hidden">MD Breweries</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {NAVIGATION_ITEMS.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-gray-700 hover:text-red-600 font-medium transition-colors py-2"
                >
                  {item.label}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 w-64 bg-white shadow-lg border border-gray-200 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        prefetch={PRIORITY_ROUTES.includes(child.href)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 transition-colors"
              prefetch={false}
            >
              <Search className="h-5 w-5" />
              <span className="hidden md:inline">Search</span>
            </Link>

            {/* Mobile Menu Button */}
            <MobileMenu navigationItems={NAVIGATION_ITEMS} />
          </div>
        </div>
      </div>

      {/* Maryland flag inspired bottom border */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600"></div>
    </header>
  );
}
