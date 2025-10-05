/**
 * Header Component - Server Component for Static Generation
 * Optimized for 500+ page builds with Maryland flag design
 */

import Link from 'next/link';
import { MapPin, Search, Menu, Beer } from 'lucide-react';
import MobileMenu from './MobileMenu';
import Logo from '../ui/Logo';

// Static navigation data for server-side rendering
const NAVIGATION_ITEMS = [
  {
    label: 'Cities',
    href: '/city',
    children: [
      { label: 'Baltimore', href: '/city/baltimore/breweries' },
      { label: 'Annapolis', href: '/city/annapolis/breweries' },
      { label: 'Frederick', href: '/city/frederick/breweries' },
      { label: 'Rockville', href: '/city/rockville/breweries' },
      { label: 'Columbia', href: '/city/columbia/breweries' },
      { label: 'Silver Spring', href: '/city/silver-spring/breweries' },
      { label: 'Towson', href: '/city/towson/breweries' },
      { label: 'Gaithersburg', href: '/city/gaithersburg/breweries' },
    ]
  },
  {
    label: 'Counties',
    href: '/county',
    children: [
      { label: 'Baltimore City', href: '/county/baltimore-city/breweries' },
      { label: 'Anne Arundel', href: '/county/anne-arundel/breweries' },
      { label: 'Montgomery', href: '/county/montgomery/breweries' },
      { label: 'Prince George\'s', href: '/county/prince-georges/breweries' },
      { label: 'Howard', href: '/county/howard/breweries' },
      { label: 'Frederick', href: '/county/frederick/breweries' },
      { label: 'Baltimore County', href: '/county/baltimore/breweries' },
      { label: 'Carroll', href: '/county/carroll/breweries' },
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
  '/city',
  '/county',
  '/city/baltimore/breweries',
  '/city/annapolis/breweries',
  '/city/frederick/breweries',
  '/city/rockville/breweries',
  '/city/columbia/breweries'
];

export default function Header() {
  return (
    <header className="bg-red-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="hover:opacity-90 transition-opacity"
            prefetch={true}
          >
            <Logo showText={true} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 ml-auto">
            {NAVIGATION_ITEMS.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-white hover:text-yellow-300 transition-colors py-2 font-bold"
                >
                  {item.label}
                </Link>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-200 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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

          {/* Mobile Menu */}
          <div className="flex items-center gap-4">
            <MobileMenu navigationItems={NAVIGATION_ITEMS} />
          </div>
        </div>
      </div>
    </header>
  );
}
