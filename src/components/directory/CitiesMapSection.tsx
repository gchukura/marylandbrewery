'use client';

import dynamic from 'next/dynamic';

// Dynamically import GoogleMap to avoid SSR issues
const DynamicGoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-paper rounded-lg flex items-center justify-center">
      <div className="text-muted">Loading map...</div>
    </div>
  ),
});

interface CitiesMapSectionProps {
  breweries: any[];
  zoom?: number;
}

export default function CitiesMapSection({ breweries, zoom = 9 }: CitiesMapSectionProps) {
  if (!breweries || breweries.length === 0) return null;

  return (
    <section className="bg-white py-12 border-b border-line">
      <div className="container mx-auto px-4">
        <h2 
          className="font-display text-3xl md:text-4xl font-bold text-ink mb-8 text-center"
        >
          Interactive Map
        </h2>
        <div className="h-[400px] md:h-[500px] rounded-lg overflow-hidden border-2 border-line shadow-lg">
          <DynamicGoogleMap 
            breweries={breweries} 
            height="100%" 
            showClusters={true}
            zoom={zoom}
          />
        </div>
      </div>
    </section>
  );
}

