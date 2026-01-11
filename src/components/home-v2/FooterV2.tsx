'use client';

import { useState } from 'react';
import Link from 'next/link';
import FooterAd from '@/components/ads/FooterAd';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

const BREWERY_ENTHUSIASTS_LINKS = [
  { name: 'Find a Maryland Brewery', href: '/map' },
  { name: 'Review Guidelines', href: '/review-guidelines' },
  { name: 'Frequently Asked Questions', href: '/faq' },
];

const BREWERY_OWNERS_LINKS = [
  { name: 'Become a Featured Listing', href: '/become-featured' },
  { name: 'Add Your Brewery', href: '/add-brewery' },
  { name: 'Marketing Tips', href: '/marketing-tips' },
  { name: 'Customer Reviews', href: '/customer-reviews' },
];

const ABOUT_LINKS = [
  { name: 'Our Story', href: '/our-story' },
  { name: 'Photo Credits', href: '/photo-credits' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms & Conditions', href: '/terms' },
];

export default function FooterV2() {
  const currentYear = new Date().getFullYear();
  const [isAdVisible, setIsAdVisible] = useState(true);

  return (
    <>
      {/* Newsletter Signup - remove bottom padding if ad is hidden */}
      <div className={isAdVisible ? '' : '[&>section]:!pb-0'}>
        <NewsletterSignup />
      </div>
      
      {/* AdSense Footer Ad */}
      <FooterAd onVisibilityChange={setIsAdVisible} />
      
      <footer className="bg-[#1C1C1C] border-t border-[#2A2A2A]">
        <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brewery Enthusiasts Column */}
          <div>
            <h3 
              className="text-sm font-semibold text-white mb-3 uppercase tracking-wider font-body"
            >
              Brewery Enthusiasts
            </h3>
            <ul className="space-y-1.5">
              {BREWERY_ENTHUSIASTS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-[#9CA3AF] hover:text-white transition-colors text-sm font-body"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brewery Owners Column */}
          <div>
            <h3 
              className="text-sm font-semibold text-white mb-3 uppercase tracking-wider font-body"
            >
              Brewery Owners
            </h3>
            <ul className="space-y-1.5">
              {BREWERY_OWNERS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-[#9CA3AF] hover:text-white transition-colors text-sm font-body"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 
              className="text-sm font-semibold text-white mb-3 uppercase tracking-wider font-body"
            >
              About
            </h3>
            <ul className="space-y-1.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-[#9CA3AF] hover:text-white transition-colors text-sm font-body"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2A2A2A] pt-4">
          <div 
            className="text-xs text-[#9CA3AF] text-center font-body"
          >
              <div className="mb-1">
                MarylandBrewery.com is a copyright © {currentYear} of <Link href="https://bluestonebrands.com" className="text-white underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">BluestoneBrands.com</Link>
              </div>
            <div>
              This site is for information purposes only and not affiliated with any of the companies mentioned. Enjoy responsibly!
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
