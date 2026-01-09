'use client';

import HeaderV2 from '@/components/home-v2/HeaderV2';
import FooterV2 from '@/components/home-v2/FooterV2';

export default function ConditionalLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use HeaderV2/FooterV2 for all pages (consistent with homepage)
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
