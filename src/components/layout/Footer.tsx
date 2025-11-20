/**
 * Footer Component - Server Component for Static Generation
 * Optimized for 500+ page builds with SEO links and Maryland branding
 */

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Beer } from 'lucide-react';
import Logo from '../ui/Logo';

// Static data for server-side rendering
const TOP_CITIES = [
  { name: 'Baltimore', href: '/city/baltimore/breweries', count: '15+' },
  { name: 'Annapolis', href: '/city/annapolis/breweries', count: '8+' },
  { name: 'Frederick', href: '/city/frederick/breweries', count: '6+' },
  { name: 'Rockville', href: '/city/rockville/breweries', count: '5+' },
  { name: 'Columbia', href: '/city/columbia/breweries', count: '4+' },
  { name: 'Silver Spring', href: '/city/silver-spring/breweries', count: '4+' },
  { name: 'Towson', href: '/city/towson/breweries', count: '3+' },
  { name: 'Gaithersburg', href: '/city/gaithersburg/breweries', count: '3+' },
];

const TOP_COUNTIES = [
  { name: 'Baltimore City', href: '/county/baltimore-city/breweries', count: '15+' },
  { name: 'Anne Arundel', href: '/county/anne-arundel/breweries', count: '8+' },
  { name: 'Montgomery', href: '/county/montgomery/breweries', count: '12+' },
  { name: 'Prince George\'s', href: '/county/prince-georges/breweries', count: '6+' },
  { name: 'Howard', href: '/county/howard/breweries', count: '5+' },
  { name: 'Frederick', href: '/county/frederick/breweries', count: '6+' },
  { name: 'Baltimore County', href: '/county/baltimore/breweries', count: '8+' },
  { name: 'Carroll', href: '/county/carroll/breweries', count: '3+' },
];

const FEATURES = [
  { name: 'Food', href: '/amenities/food' },
  { name: 'Outdoor Seating', href: '/amenities/outdoor-seating' },
  { name: 'Live Music', href: '/amenities/live-music' },
  { name: 'Tours', href: '/amenities/tours' },
  { name: 'Pet Friendly', href: '/amenities/pet-friendly' },
  { name: 'WiFi', href: '/amenities/wifi' },
];

const BREWERY_TYPES = [
  { name: 'Microbrewery', href: '/type/microbrewery' },
  { name: 'Brewpub', href: '/type/brewpub' },
  { name: 'Taproom', href: '/type/taproom' },
  { name: 'Production', href: '/type/production' },
  { name: 'Nano', href: '/type/nano' },
];

const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://facebook.com/marylandbrewery', icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com/marylandbrewery', icon: Instagram },
  { name: 'Twitter', href: 'https://twitter.com/marylandbrewery', icon: Twitter },
];

// Get current date for "Data updated" indicator
const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-red-300 transition-colors">Home</Link></li>
              <li><Link href="/map" className="hover:text-red-300 transition-colors">Interactive Map</Link></li>
              <li><Link href="/open-now" className="hover:text-red-300 transition-colors">Open Now</Link></li>
              <li><Link href="/contact" className="hover:text-red-300 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-bold text-lg mb-4">Top Cities</h3>
            <ul className="space-y-2 text-sm">
              {TOP_CITIES.slice(0, 6).map((city) => (
                <li key={city.href}>
                  <Link href={city.href} className="hover:text-red-300 transition-colors">
                    {city.name} ({city.count})
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-bold text-lg mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              {FEATURES.map((feature) => (
                <li key={feature.href}>
                  <Link href={feature.href} className="hover:text-red-300 transition-colors">
                    {feature.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/amenities" className="hover:text-red-300 transition-colors font-medium">
                  View All Amenities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Types */}
          <div>
            <h3 className="font-bold text-lg mb-4">Brewery Types</h3>
            <ul className="space-y-2 text-sm">
              {BREWERY_TYPES.map((type) => (
                <li key={type.href}>
                  <Link href={type.href} className="hover:text-red-300 transition-colors">
                    {type.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/type" className="hover:text-red-300 transition-colors font-medium">
                  View All Types →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex items-center justify-between">
          <div className="text-sm">
            <p>© 2025 MarylandBrewery.com</p>
          </div>
          <div className="flex items-center">
            <Logo showText={true} />
          </div>
          <div className="text-sm">
            <p>
              All rights reserved. <Link href="/contact" className="underline hover:text-red-300">Contact us</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
