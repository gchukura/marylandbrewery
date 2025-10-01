/**
 * Footer Component - Server Component for Static Generation
 * Optimized for 500+ page builds with SEO links and Maryland branding
 */

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Beer } from 'lucide-react';

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
  { name: 'Food', href: '/breweries/amenity/food' },
  { name: 'Outdoor Seating', href: '/breweries/amenity/outdoor-seating' },
  { name: 'Live Music', href: '/breweries/amenity/live-music' },
  { name: 'Tours', href: '/breweries/amenity/tours' },
  { name: 'Pet Friendly', href: '/breweries/amenity/pet-friendly' },
  { name: 'WiFi', href: '/breweries/amenity/wifi' },
];

const BREWERY_TYPES = [
  { name: 'Microbrewery', href: '/breweries/type/microbrewery' },
  { name: 'Brewpub', href: '/breweries/type/brewpub' },
  { name: 'Taproom', href: '/breweries/type/taproom' },
  { name: 'Production', href: '/breweries/type/production' },
  { name: 'Nano', href: '/breweries/type/nano' },
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
  const currentDate = getCurrentDate();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Beer className="h-8 w-8 text-red-400" />
              <h3 className="text-xl font-bold text-white">Maryland Brewery Directory</h3>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Discover Maryland's vibrant craft beer scene. From Baltimore's historic breweries to Annapolis' waterfront taprooms, explore the best breweries across the Old Line State.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>All 24 Maryland Counties</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <span>📅</span>
              <span>Data updated: {currentDate}</span>
            </div>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Top Cities</h4>
            <ul className="space-y-2">
              {TOP_CITIES.map((city) => (
                <li key={city.href}>
                  <Link
                    href={city.href}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm flex items-center justify-between group"
                  >
                    <span>{city.name}</span>
                    <span className="text-xs text-gray-500 group-hover:text-red-400">
                      {city.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Counties */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Counties</h4>
            <ul className="space-y-2">
              {TOP_COUNTIES.map((county) => (
                <li key={county.href}>
                  <Link
                    href={county.href}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm flex items-center justify-between group"
                  >
                    <span>{county.name}</span>
                    <span className="text-xs text-gray-500 group-hover:text-red-400">
                      {county.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features & Types */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2 mb-6">
              {FEATURES.map((feature) => (
                <li key={feature.href}>
                  <Link
                    href={feature.href}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                  >
                    {feature.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="text-lg font-semibold text-white mb-4">Brewery Types</h4>
            <ul className="space-y-2">
              {BREWERY_TYPES.map((type) => (
                <li key={type.href}>
                  <Link
                    href={type.href}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm"
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Social Media & Contact */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Follow us:</span>
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>info@marylandbrewery.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-red-600 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-4">
              <span>© 2024 Maryland Brewery Directory</span>
              <span className="hidden md:inline">•</span>
              <span>Supporting Maryland's Craft Beer Community</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-yellow-300 transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-yellow-300 transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-yellow-300 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Maryland Flag Colors Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600"></div>
    </footer>
  );
}
