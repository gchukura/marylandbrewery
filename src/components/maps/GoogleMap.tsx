/**
 * GoogleMap - Google Maps integration for brewery locations
 * Replaces MapboxMap component
 * Uses @vis.gl/react-google-maps for React integration
 */

"use client";

import { useMemo, useEffect, useRef, useState } from 'react';
import { APIProvider, Map, Marker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Brewery } from '@/types/brewery';
import { DEFAULT_MAP_OPTIONS, BREWERY_MARKER_ICON_CONFIG, MARYLAND_BOUNDS } from '@/lib/google-maps-config';

interface GoogleMapProps {
  breweries: Brewery[];
  height?: string;
  showClusters?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  onBreweryClick?: (brewery: Brewery) => void;
  autoOpenPopup?: boolean;
  useFitBounds?: boolean; // If false, use zoom/center instead of fitting bounds
}

// Internal component that handles markers and clustering
function MapContent({
  breweries,
  showClusters = true,
  onBreweryClick,
  autoOpenPopup = false,
  useFitBounds = true,
}: Omit<GoogleMapProps, 'height' | 'center' | 'zoom'>) {
  const map = useMap();
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<globalThis.Map<Brewery, google.maps.Marker>>(new globalThis.Map<Brewery, google.maps.Marker>());
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize clusterer when map is ready
  useEffect(() => {
    if (!map || !showClusters) return;

    // MarkerClusterer requires a google.maps.Map instance
    // The useMap() hook returns a Map instance that we can use
    const googleMap = map as unknown as google.maps.Map;
    if (googleMap) {
      clustererRef.current = new MarkerClusterer({ 
        map: googleMap,
        markers: []
      });
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map, showClusters]);

  // Create markers for breweries
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    const newMarkers: google.maps.Marker[] = [];

    breweries.forEach((brewery) => {
      if (!brewery.latitude || !brewery.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: brewery.latitude, lng: brewery.longitude },
        map: showClusters ? null : map, // If clustering, don't add directly to map
        icon: {
          ...BREWERY_MARKER_ICON_CONFIG,
          path: google.maps.SymbolPath.CIRCLE,
        },
        title: brewery.name,
        animation: google.maps.Animation.DROP,
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedBrewery(brewery);
        if (onBreweryClick) {
          onBreweryClick(brewery);
        }
      });

      markersRef.current.set(brewery, marker);
      newMarkers.push(marker);
    });

    // Add markers to clusterer or map
    if (showClusters && clustererRef.current) {
      clustererRef.current.addMarkers(newMarkers);
    }

    // Auto-open first brewery popup if requested
    if (autoOpenPopup && newMarkers.length > 0 && breweries.length > 0) {
      setTimeout(() => {
        setSelectedBrewery(breweries[0]);
        newMarkers[0].setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
          newMarkers[0].setAnimation(null);
        }, 750);
      }, 500);
    }

    // Fit bounds if we have breweries and useFitBounds is true
    if (newMarkers.length > 0 && useFitBounds) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        const pos = marker.getPosition();
        if (pos) bounds.extend(pos);
      });
      map.fitBounds(bounds, 50); // padding as number
    }

    setIsLoaded(true);
  }, [map, breweries, showClusters, onBreweryClick, autoOpenPopup, useFitBounds]);

  // Close popup when clicking outside
  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('click', () => {
      setSelectedBrewery(null);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map]);

  // Listen for Google Maps script loading errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMsg = event.message || event.error?.message || '';
      if (errorMsg.includes('AuthFailure') || 
          errorMsg.includes('InvalidKey') || 
          errorMsg.includes('RefererNotAllowed') ||
          errorMsg.includes('ApiNotActivated')) {
        console.error('[GoogleMap] Detected API error:', errorMsg);
        setMapError('API_KEY_ERROR');
      }
    };

    // Listen for unhandled errors (Google Maps script errors)
    window.addEventListener('error', handleError);
    
    // Also check console errors via a MutationObserver as a fallback
    const checkConsoleErrors = () => {
      // This is a fallback - the window error listener should catch most issues
    };

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Timeout to detect if map never loads (indicates API key issue)
  useEffect(() => {
    if (isLoaded) return;
    
    const timeout = setTimeout(() => {
      // If map hasn't loaded after 5 seconds, likely an API key issue
      if (!isLoaded && !mapError) {
        console.warn('[GoogleMap] Map failed to load - checking for API key issues...');
        // Don't set error automatically, as slow networks might cause false positives
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoaded, mapError]);

  return (
    <>
      {selectedBrewery && (
        <InfoWindow
          position={{
            lat: selectedBrewery.latitude,
            lng: selectedBrewery.longitude,
          }}
          onCloseClick={() => setSelectedBrewery(null)}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {selectedBrewery.name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              {selectedBrewery.city}, {selectedBrewery.state}
            </p>
            {selectedBrewery.street && (
              <p className="text-xs text-gray-500 mb-1">
                {selectedBrewery.street}
              </p>
            )}
            {selectedBrewery.phone && (
              <p className="text-xs text-blue-600 mb-2">{selectedBrewery.phone}</p>
            )}
            <div className="mt-2">
              <a
                href={`/breweries/${(selectedBrewery as any).slug || selectedBrewery.id}`}
                className="inline-block bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors"
              >
                View Details
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
      {mapError && (
        <div className="absolute top-4 left-4 right-4 z-10 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <h4 className="font-bold text-red-800 mb-2">⚠️ Google Maps API Error</h4>
          <p className="text-sm text-red-700 mb-2">
            The map cannot load due to an API key authentication issue.
          </p>
          <div className="text-xs text-red-600 space-y-1">
            <p><strong>Common fixes:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Enable <strong>Maps JavaScript API</strong> in Google Cloud Console</li>
              <li>Add your domain to API key restrictions (HTTP referrers)</li>
              <li>Ensure billing is enabled (required even for free tier)</li>
              <li>Check browser console for specific error details</li>
            </ol>
          </div>
          <button
            onClick={() => setMapError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}

// Main component
export default function GoogleMap({
  breweries,
  height = '400px',
  showClusters = true,
  center,
  zoom = 10,
  onBreweryClick,
  autoOpenPopup = false,
  useFitBounds = true,
}: GoogleMapProps) {
  const apiKey = useMemo(
    () => (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim(),
    []
  );

  const mapCenter = useMemo(
    () => center || DEFAULT_MAP_OPTIONS.center,
    [center]
  );

  const mapZoom = useMemo(
    () => zoom || DEFAULT_MAP_OPTIONS.zoom,
    [zoom]
  );

  // Debug logging (remove in production)
  useEffect(() => {
    if (apiKey) {
      console.log('[GoogleMap] API Key loaded:', apiKey.substring(0, 10) + '...');
    } else {
      console.error('[GoogleMap] API Key missing!');
    }
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div className="w-full" style={{ height }}>
        <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600 px-4">
          Map is unavailable: missing Google Maps API key. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and redeploy.
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          mapId="brewery-map"
          style={{ width: '100%', height: '100%' }}
          minZoom={DEFAULT_MAP_OPTIONS.minZoom}
          maxZoom={DEFAULT_MAP_OPTIONS.maxZoom}
          restriction={center ? undefined : DEFAULT_MAP_OPTIONS.restriction}
          mapTypeControl={DEFAULT_MAP_OPTIONS.mapTypeControl}
          streetViewControl={DEFAULT_MAP_OPTIONS.streetViewControl}
          fullscreenControl={DEFAULT_MAP_OPTIONS.fullscreenControl}
          zoomControl={DEFAULT_MAP_OPTIONS.zoomControl}
          // Note: styles cannot be set when mapId is present - styles must be configured in Google Cloud Console
        >
          <MapContent
            breweries={breweries}
            showClusters={showClusters}
            onBreweryClick={onBreweryClick}
            autoOpenPopup={autoOpenPopup}
            useFitBounds={useFitBounds}
          />
        </Map>
      </APIProvider>
    </div>
  );
}

