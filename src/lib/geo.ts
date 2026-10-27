export interface LatLng {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_MILES = 3959;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle (haversine) distance in miles. */
export function distanceMiles(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function milesToKm(miles: number): number {
  return miles * 1.609344;
}

/** Items that have coordinates, with their distance from origin, nearest first. */
export function sortByDistance<T extends Partial<LatLng>>(
  origin: LatLng,
  items: T[]
): (T & { distance: number })[] {
  return items
    .filter((item): item is T & LatLng => typeof item.latitude === 'number' && typeof item.longitude === 'number')
    .map((item) => ({ ...item, distance: distanceMiles(origin, item) }))
    .sort((a, b) => a.distance - b.distance);
}

/** distanceMiles for call sites that hold raw coordinates. */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return distanceMiles({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 });
}
