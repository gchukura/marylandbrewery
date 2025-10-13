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
  return (
    <footer className="bg-black text-white" style={{ height: '250px', maxHeight: '250px', overflow: 'hidden' }}>
      <div className="container mx-auto px-4" style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <div className="flex items-center justify-between w-full">
          {/* Left Section - Copyright */}
          <div className="text-base">
            <p>© 2025 MarylandBrewery.com</p>
          </div>

          {/* Center Section - Logo */}
          <div className="flex items-center">
            <Logo showText={true} />
          </div>

          {/* Right Section - All Rights Reserved */}
          <div className="text-base">
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
