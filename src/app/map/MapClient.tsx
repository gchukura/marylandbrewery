"use client";

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const MapboxMap = dynamic(() => import('@/components/maps/MapboxMap'), { ssr: false });

export default function MapClient({ breweries }: { breweries: any[] }) {
  const [city, setCity] = useState('');
  const [amenity, setAmenity] = useState('');

  const filtered = useMemo(() => {
    const c = city.trim().toLowerCase();
    const a = amenity.trim().toLowerCase();
    return breweries.filter((b) => {
      const cityOk = c ? b.city?.toLowerCase().includes(c) : true;
      const amenityOk = a ? ((b.amenities || b.features || []).some((x: string) => x.toLowerCase().includes(a))) : true;
      return cityOk && amenityOk;
    });
  }, [breweries, city, amenity]);

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="p-3 bg-white border-b flex items-center gap-2 z-10">
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
      <div className="flex-1">
        <MapboxMap breweries={filtered as any} height="100%" />
      </div>
    </div>
  );
}
