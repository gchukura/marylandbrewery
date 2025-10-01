/**
 * MapboxMap - Dynamic Mapbox integration for brewery locations
 * Handles clustering, markers, and interactive features
 */

"use client";

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Brewery } from '@/types/brewery';
import { MARYLAND_BOUNDS } from '@/lib/mapbox-config';

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
  const initializedRef = useRef<boolean>(false);
  const markers = useRef<any[]>([]);
  const mapboxRef = useRef<any>(null);
  const loadTimeoutRef = useRef<any>(null);
  const resizeObserverRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = useMemo(() => (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '').trim(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initializedRef.current) return; // avoid double-init in React StrictMode
    initializedRef.current = true;

    const ensureNonZeroHeight = () => {
      if (!mapContainer.current) return false;
      const h = mapContainer.current.clientHeight || 0;
      if (h === 0) {
        mapContainer.current.style.minHeight = '400px';
        mapContainer.current.style.height = typeof height === 'string' && height.endsWith('%') ? '600px' : String(height);
        return true;
      }
      return false;
    };

    const loadMap = async () => {
      try {
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

        if (!mapContainer.current) return;

        // Ensure container is empty and has a non-zero height
        while (mapContainer.current.firstChild) {
          mapContainer.current.removeChild(mapContainer.current.firstChild);
        }
        ensureNonZeroHeight();

        mapboxgl.accessToken = token;
        const styleUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${encodeURIComponent(token)}`;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: styleUrl,
          center: center || [-76.6413, 39.0458],
          zoom: zoom,
        });

        setIsLoaded(true);

        // Proactively resize after creation to account for flex/layout
        setTimeout(() => {
          try { map.current?.resize(); } catch {}
        }, 0);

        // Observe container size changes
        if ('ResizeObserver' in window) {
          resizeObserverRef.current = new ResizeObserver(() => {
            try { map.current?.resize(); } catch {}
          });
          resizeObserverRef.current.observe(mapContainer.current);
        }

        map.current.addControl(new mapboxgl.NavigationControl());

        map.current.on('error', (e: any) => {
          const err = e?.error;
          const msg = (err && (err.message || err.toString())) || 'Unknown Mapbox error';
          setErrorMsg(`Map error: ${msg}`);
        });

        loadTimeoutRef.current = window.setTimeout(() => {
          if (!isLoaded) {
            setErrorMsg('Map failed to load in time. Check token, network, or CSP.');
          }
        }, 12000);

        const markLoaded = () => {
          window.clearTimeout(loadTimeoutRef.current);
          setIsLoaded(true);
          try {
            // Ensure a visible view even before markers
            if (!center) {
              const bounds = new mapboxRef.current.LngLatBounds(MARYLAND_BOUNDS[0], MARYLAND_BOUNDS[1]);
              map.current.fitBounds(bounds, { padding: 40, duration: 0 });
            }
          } catch {}
          addBreweryMarkers();
          try { map.current?.resize(); } catch {}
        };

        map.current.once('style.load', () => {
          // If height still 0 after style load, force a fallback height and resize
          if (ensureNonZeroHeight()) {
            try { map.current?.resize(); } catch {}
          }
          markLoaded();
        });
        map.current.once('load', markLoaded);
        map.current.once('idle', () => {});
      } catch (error: any) {
        console.error('Error loading Mapbox:', error);
        setErrorMsg('Map failed to load. Please try again later.');
      }
    };

    loadMap();

    return () => {
      if (map.current) map.current.remove();
      if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
      if (resizeObserverRef.current && mapContainer.current) {
        try { resizeObserverRef.current.unobserve(mapContainer.current); } catch {}
      }
    };
  }, [token, height]);

  const addBreweryMarkers = () => {
    if (!map.current || !mapboxRef.current) return;
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
          <div class=\"p-2\">
            <h3 class=\"font-bold text-lg text-gray-900\">${brewery.name}</h3>
            <p class=\"text-sm text-gray-600\">${brewery.city}, ${brewery.state}</p>
            <p class=\"text-xs text-gray-500 mt-1\">${(brewery as any).street || 'Address not available'}</p>
            ${brewery.phone ? `<p class=\"text-xs text-blue-600 mt-1\">${brewery.phone}</p>` : ''}
            <div class=\"mt-2\">
              <a 
                href=\"/breweries/${(brewery as any).slug || brewery.id}\"
                class=\"inline-block bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors\"
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
      const bounds = new mapboxRef.current.LngLatBounds();
      breweries.forEach(brewery => {
        if (brewery.latitude && brewery.longitude) bounds.extend([brewery.longitude, brewery.latitude]);
      });
      try { map.current.fitBounds(bounds, { padding: 50 }); } catch {}
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
    </div>
  );
}
