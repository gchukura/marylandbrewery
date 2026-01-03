'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import NewsletterSignup from '../ui/NewsletterSignup';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Use HeaderV2 for homepage and homepage-v2, Header for all other pages
  if (pathname === '/' || pathname?.includes('/homepage-v2')) {
    return null; // HeaderV2 will be rendered by layout
  }
  
  return <Header />;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Use FooterV2 for homepage and homepage-v2, Footer for all other pages
  if (pathname === '/' || pathname?.includes('/homepage-v2')) {
    return null; // FooterV2 will be rendered by layout
  }
  
  return (
    <>
      <NewsletterSignup />
      <Footer />
    </>
  );
}

