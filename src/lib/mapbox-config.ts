export const MARYLAND_CENTER: [number, number] = [-76.6413, 39.0458];
export const MARYLAND_BOUNDS: [[number, number], [number, number]] = [
  [-79.6, 37.9], // SW
  [-75.0, 39.75], // NE
];

export const MARYLAND_RED = '#E03A3E';

export const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

export const CLUSTER_LAYER_ID = 'clusters';
export const CLUSTER_COUNT_LAYER_ID = 'cluster-count';
export const UNCLUSTERED_POINT_LAYER_ID = 'unclustered-point';

export const clusterLayer = {
  id: CLUSTER_LAYER_ID,
  type: 'circle',
  source: 'breweries',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': MARYLAND_RED,
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      18, 20, 24, 50, 30
    ],
    'circle-opacity': 0.85,
  },
} as const;

export const clusterCountLayer = {
  id: CLUSTER_COUNT_LAYER_ID,
  type: 'symbol',
  source: 'breweries',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
  },
  paint: {
    'text-color': '#ffffff',
  },
} as const;

export const unclusteredPointLayer = {
  id: UNCLUSTERED_POINT_LAYER_ID,
  type: 'circle',
  source: 'breweries',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': MARYLAND_RED,
    'circle-radius': 6,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
} as const;
