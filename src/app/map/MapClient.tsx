"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const MapFallback = () => (
  <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
    <div className="text-gray-500 text-sm">Loading map...</div>
  </div>
);

const MapboxMap = dynamic(() => import('@/components/maps/MapboxMap'), { ssr: false, loading: () => <MapFallback /> });

export default function MapClient({ breweries }: { breweries: any[] }) {
  const [city, setCity] = useState('');
  const [amenity, setAmenity] = useState('');

  const filtered = useMemo(() => {
    const c = city.trim().toLowerCase();
    const a = amenity.trim().toLowerCase();
    return breweries.filter((b) => {
      const cityOk = c ? b.city?.toLowerCase().includes(c) : true;
      const amenityList: string[] = (b.amenities || b.features || []) as string[];
      const amenityOk = a ? amenityList.some((x) => x?.toLowerCase().includes(a)) : true;
      return cityOk && amenityOk;
    });
  }, [breweries, city, amenity]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const tokenMissing = !token || token.trim() === '';

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-white border-b flex items-center gap-2">
        <input
          type="text"
          placeholder="Filter by city..."
          className="border rounded px-2 py-1 text-sm"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by amenity..."
          className="border rounded px-2 py-1 text-sm"
          value={amenity}
          onChange={(e) => setAmenity(e.target.value)}
        />
        <div className="text-sm text-gray-600 ml-2">Showing {filtered.length} breweries</div>
      </div>
      <div className="flex-1 min-h-[400px]">
        {tokenMissing ? (
          <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600 px-4">
            Map is unavailable: missing Mapbox token. Set NEXT_PUBLIC_MAPBOX_TOKEN and redeploy.
          </div>
        ) : (
          <MapboxMap breweries={filtered as any} height="100%" />
        )}
      </div>
    </div>
  );
}
