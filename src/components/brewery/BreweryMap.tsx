"use client";

import { useEffect, useRef } from 'react';
import type { Brewery } from '@/types/brewery';
import {
  MAPBOX_STYLE,
  MARYLAND_CENTER,
  MARYLAND_BOUNDS,
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from '@/lib/mapbox-config';

interface BreweryMapProps {
  breweries: Brewery[];
  height?: string;
}

export default function BreweryMap({ breweries, height = '500px' }: BreweryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanup = () => {};

    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      (mapboxgl as any).accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      if (!containerRef.current) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLE,
        center: MARYLAND_CENTER,
        zoom: 7,
        maxBounds: MARYLAND_BOUNDS,
      });

      map.addControl(new mapboxgl.NavigationControl());

      map.on('load', () => {
        // GeoJSON from breweries
        const features = breweries
          .filter((b) => b.latitude && b.longitude)
          .map((b) => ({
            type: 'Feature',
            properties: {
              id: b.id,
              name: b.name,
              city: b.city,
              state: b.state,
              slug: (b as any).slug || b.id,
              address: (b as any).street || b.address || '',
              phone: b.phone || '',
            },
            geometry: {
              type: 'Point',
              coordinates: [b.longitude, b.latitude],
            },
          }));

        map.addSource('breweries', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        } as any);

        map.addLayer(clusterLayer as any);
        map.addLayer(clusterCountLayer as any);
        map.addLayer(unclusteredPointLayer as any);

        // Cluster click zoom - bind to cluster layer and guard properties
        map.on('click', clusterLayer.id, (e: any) => {
          const f = e.features?.[0];
          if (!f || !f.properties) return;
          const clusterId = f.properties.cluster_id;
          if (clusterId === undefined || clusterId === null) return;
          const source = map.getSource('breweries') as any;
          source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            const coords = (f.geometry as any).coordinates;
            map.easeTo({ center: coords, zoom });
          });
        });

        // Popups for unclustered points
        map.on('click', unclusteredPointLayer.id, (e: any) => {
          const f = e.features?.[0];
          if (!f) return;
          const { name, city, state, slug, address, phone } = f.properties;
          const html = `
            <div class="p-2">
              <div class="font-semibold text-gray-900">${name}</div>
              <div class="text-sm text-gray-600">${city}, ${state}</div>
              ${address ? `<div class="text-xs text-gray-500 mt-1">${address}</div>` : ''}
              ${phone ? `<div class="text-xs text-blue-600 mt-1">${phone}</div>` : ''}
              <div class="mt-2">
                <a href="/breweries/${slug}" class="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded">View Details</a>
              </div>
            </div>
          `;
          new mapboxgl.Popup().setLngLat((f.geometry as any).coordinates).setHTML(html).addTo(map);
        });

        map.on('mouseenter', unclusteredPointLayer.id, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', unclusteredPointLayer.id, () => {
          map.getCanvas().style.cursor = '';
        });
      });

      mapRef.current = map;

      cleanup = () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    })();

    return () => cleanup();
  }, [breweries]);

  return (
    <div ref={containerRef} style={{ height }} className="w-full rounded-lg overflow-hidden" />
  );
}
