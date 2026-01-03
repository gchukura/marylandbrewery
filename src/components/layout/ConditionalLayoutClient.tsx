'use client';

import { usePathname } from 'next/navigation';
import HeaderV2 from '@/components/home-v2/HeaderV2';
import FooterV2 from '@/components/home-v2/FooterV2';
import { ConditionalHeader, ConditionalFooter } from './ConditionalLayout';

export default function ConditionalLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Use HeaderV2/FooterV2 for homepage
  if (pathname === '/') {
    return (
      <div className="flex flex-col min-h-screen">
        <HeaderV2 />
        <main className="flex-1 flex flex-col min-h-0">
          {children}
        </main>
        <div className="mt-auto flex-shrink-0">
          <FooterV2 />
        </div>
      </div>
    );
  }
  
  // For all other pages, use ConditionalHeader/Footer
  return (
    <div className="flex flex-col min-h-screen">
      <ConditionalHeader />
      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>
      <div className="mt-auto flex-shrink-0">
        <ConditionalFooter />
      </div>
    </div>
  );
}

