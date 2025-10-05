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
  center?: [number, number];
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
  return (
    <Map 
      breweries={breweries} 
      height={height} 
      center={center}
      zoom={zoom}
      showClustering={showClustering}
    />
  );
}
