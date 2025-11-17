"use client";

import dynamic from 'next/dynamic';
import type { Brewery } from '@/types/brewery';

function MapSkeleton() {
  return (
    <div className="w-full h-[500px] bg-gray-200 rounded-lg animate-pulse" />
  );
}

const Map = dynamic(() => import('./BreweryMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface BreweryMapWrapperProps {
  breweries: Brewery[];
  height?: string;
  center?: { lat: number; lng: number } | [number, number]; // Support both formats for backward compatibility
  zoom?: number;
  showClustering?: boolean;
}

export default function BreweryMapWrapper({ 
  breweries, 
  height, 
  center, 
  zoom = 7, 
  showClustering = true 
}: BreweryMapWrapperProps) {
  // Convert [lng, lat] array to {lat, lng} object if needed
  const centerObj = center 
    ? Array.isArray(center) 
      ? { lat: center[1], lng: center[0] } // Convert [lng, lat] to {lat, lng}
      : center
    : undefined;

  return (
    <Map 
      breweries={breweries} 
      height={height} 
      center={centerObj}
      zoom={zoom}
      showClustering={showClustering}
    />
  );
}
