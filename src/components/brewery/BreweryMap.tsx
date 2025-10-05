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
  center?: [number, number];
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
        center: center || MARYLAND_CENTER,
        zoom: zoom,
        maxBounds: center ? undefined : MARYLAND_BOUNDS, // Don't restrict bounds if we have a specific center
      });

      map.addControl(new mapboxgl.NavigationControl());

      map.on('load', () => {
        // Ensure initial view is tightly focused on Maryland
        if (MARYLAND_BOUNDS) {
          try {
            map.fitBounds(MARYLAND_BOUNDS as any, { padding: 40, maxZoom: 9 });
          } catch {}
        }
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
              address: b.street || '',
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
          cluster: showClustering,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        } as any);

        if (showClustering) {
          map.addLayer(clusterLayer as any);
          map.addLayer(clusterCountLayer as any);
        }
        map.addLayer(unclusteredPointLayer as any);

        // Cluster click zoom - only if clustering is enabled
        if (showClustering) {
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
        }

        // Popups for unclustered points
        map.on('click', unclusteredPointLayer.id, (e: any) => {
          const f = e.features?.[0];
          if (!f) return;
          const { name, city, state, slug, address, phone } = f.properties;
          
          // Find the full brewery data for additional details
          const brewery = breweries.find(b => b.id === f.properties.id);
          
          const html = `
            <div class="p-4 max-w-xs">
              <div class="font-bold text-lg text-gray-900 mb-2">${name}</div>
              <div class="text-sm text-gray-600 mb-2">${city}, ${state}</div>
              ${address ? `<div class="text-xs text-gray-500 mb-2">${address}</div>` : ''}
              ${phone ? `<div class="text-xs text-blue-600 mb-2">📞 ${phone}</div>` : ''}
              ${brewery?.type ? `<div class="text-xs text-gray-600 mb-2">🏭 ${brewery.type}</div>` : ''}
              ${brewery?.hours ? `<div class="text-xs text-gray-600 mb-2">🕒 ${Object.entries(brewery.hours).slice(0, 2).map(([day, hours]) => `${day}: ${hours || 'Closed'}`).join(', ')}</div>` : ''}
              <div class="mt-3">
                <a href="/breweries/${slug}" class="inline-block bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg font-medium transition-colors">View Full Details</a>
              </div>
            </div>
          `;
          new mapboxgl.Popup({ 
            maxWidth: '300px',
            closeButton: true,
            closeOnClick: false
          }).setLngLat((f.geometry as any).coordinates).setHTML(html).addTo(map);
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
