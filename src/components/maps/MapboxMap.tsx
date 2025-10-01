/**
 * MapboxMap - Dynamic Mapbox integration for brewery locations
 * Handles clustering, markers, and interactive features
 */

"use client";

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { Brewery } from '@/types/brewery';

interface MapboxMapProps {
  breweries: Brewery[];
  height?: string;
  showClusters?: boolean;
  center?: [number, number];
  zoom?: number;
  onBreweryClick?: (brewery: Brewery) => void;
}

export default function MapboxMap({
  breweries,
  height = '400px',
  showClusters = true,
  center,
  zoom = 10,
  onBreweryClick,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const mapboxRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadMap = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
        if (!token) {
          setErrorMsg('Map is unavailable: missing Mapbox token.');
          return;
        }

        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxRef.current = mapboxgl;

        if (mapboxgl.supported && !mapboxgl.supported()) {
          setErrorMsg('Map is unavailable: browser not supported.');
          return;
        }

        mapboxgl.accessToken = token;
        if (!mapContainer.current) return;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: center || [-76.6413, 39.0458],
          zoom: zoom,
        });

        map.current.addControl(new mapboxgl.NavigationControl());

        map.current.on('load', () => {
          setIsLoaded(true);
          addBreweryMarkers();
        });
      } catch (error: any) {
        console.error('Error loading Mapbox:', error);
        setErrorMsg('Map failed to load. Please try again later.');
      }
    };

    loadMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addBreweryMarkers = () => {
    if (!map.current || !isLoaded || !mapboxRef.current) return;
    const mapboxgl = mapboxRef.current;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    breweries.forEach((brewery) => {
      if (brewery.latitude && brewery.longitude) {
        const el = document.createElement('div');
        el.className = 'brewery-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #dc2626;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        `;
        el.innerHTML = '🍺';

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
        }).setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-lg text-gray-900">${brewery.name}</h3>
            <p class="text-sm text-gray-600">${brewery.city}, ${brewery.state}</p>
            <p class="text-xs text-gray-500 mt-1">${(brewery as any).street || 'Address not available'}</p>
            ${brewery.phone ? `<p class="text-xs text-blue-600 mt-1">${brewery.phone}</p>` : ''}
            <div class="mt-2">
              <a 
                href="/breweries/${(brewery as any).slug || brewery.id}"
                class="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors"
              >
                View Details
              </a>
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([brewery.longitude, brewery.latitude])
          .setPopup(popup)
          .addTo(map.current);

        el.addEventListener('click', () => {
          if (onBreweryClick) onBreweryClick(brewery);
        });

        markers.current.push(marker);
      }
    });

    if (!center && breweries.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      breweries.forEach(brewery => {
        if (brewery.latitude && brewery.longitude) {
          bounds.extend([brewery.longitude, brewery.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  if (errorMsg) {
    return (
      <div className="w-full" style={{ height }}>
        <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600 px-4">
          {errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-lg overflow-hidden"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}
