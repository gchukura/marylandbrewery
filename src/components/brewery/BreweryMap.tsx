"use client";

import { useMemo } from 'react';
import type { Brewery } from '@/types/brewery';
import GoogleMap from '../maps/GoogleMap';
import { MARYLAND_CENTER } from '@/lib/google-maps-config';

interface BreweryMapProps {
  breweries: Brewery[];
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  showClustering?: boolean;
}

export default function BreweryMap({ 
  breweries, 
  height = '500px', 
  center, 
  zoom = 7, 
  showClustering = true 
}: BreweryMapProps) {
  const mapCenter = useMemo(() => {
    if (center) return center;
    return MARYLAND_CENTER;
  }, [center]);

  return (
    <GoogleMap
      breweries={breweries}
      height={height}
      center={mapCenter}
      zoom={zoom}
      showClusters={showClustering}
    />
  );
}
