/**
 * Google Maps Configuration
 * Replaces Mapbox configuration
 */

export const MARYLAND_CENTER = {
  lat: 39.0458,
  lng: -76.6413,
} as const;

export const MARYLAND_BOUNDS = {
  north: 39.75,
  south: 37.9,
  east: -75.0,
  west: -79.6,
} as const;

export const MARYLAND_RED = '#E03A3E';

// Default map options
export const DEFAULT_MAP_OPTIONS = {
  center: MARYLAND_CENTER,
  zoom: 8,
  minZoom: 6,
  maxZoom: 18,
  restriction: {
    latLngBounds: MARYLAND_BOUNDS,
    strictBounds: false,
  },
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ] as google.maps.MapTypeStyle[],
};

// Marker icon configuration - will be used with google.maps.SymbolPath.CIRCLE
export const BREWERY_MARKER_ICON_CONFIG = {
  scale: 8,
  fillColor: MARYLAND_RED,
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2,
} as const;

// Cluster configuration
export const CLUSTER_OPTIONS = {
  imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
  gridSize: 60,
  maxZoom: 15,
  styles: [
    {
      textColor: 'white',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiNlMDNBM0UiLz48L3N2Zz4=',
      height: 40,
      width: 40,
      textSize: 12,
    },
  ],
};

