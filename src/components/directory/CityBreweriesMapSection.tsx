"use client";

import dynamic from 'next/dynamic';
import { Brewery } from '@/types/brewery';

// Dynamically import GoogleMap to avoid SSR issues
const GoogleMap = dynamic(() => import('@/components/maps/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

interface CityBreweriesMapSectionProps {
  breweries: Brewery[];
  zoom?: number;
}

export default function CityBreweriesMapSection({ 
  breweries, 
  zoom = 11 
}: CityBreweriesMapSectionProps) {
  if (breweries.length === 0) {
    return null;
  }

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border border-[#E8E6E1]">
      <GoogleMap 
        breweries={breweries as any} 
        height="100%" 
        showClusters={true}
        zoom={zoom}
      />
    </div>
  );
}

