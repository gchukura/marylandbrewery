import type { MetadataRoute } from 'next';
import { getProcessedBreweryData, getAllCities } from '../../lib/brewery-data';
import { slugify } from '../lib/data-utils';

const BASE_URL = 'https://marylandbrewery.com';
const AMENITY_SLUGS = [
  'dog-friendly', 'outdoor-seating', 'live-music', 'food-trucks', 'full-kitchen', 'beer-garden',
  'games', 'wifi', 'parking', 'private-events', 'tours', 'tastings', 'merchandise', 'growlers', 'crowlers'
] as const;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function generateSitemaps() {
  const processed = await getProcessedBreweryData();

  const cities = await getAllCities();
  const amenities = AMENITY_SLUGS as readonly string[];

  const cityCount = cities.length;
  const amenityCount = amenities.length;
  const comboCount = cityCount * amenityCount;

  const breweriesCount = processed.breweries.length;
  const counties = Array.from(new Set(processed.breweries.map((b) => (b as any).county).filter(Boolean)));

  // Estimate total URL count
  const typeCount = 5; // microbrewery, brewpub, taproom, production, nano
  const total = 1 /*home*/ +
    cityCount + counties.length + breweriesCount + typeCount + amenityCount + comboCount +
    1 /*map*/ + 1 /*open-now*/ + 7 /*open/[day]*/ + 1 /*contact*/ + 1 /*city index*/ + 1 /*county index*/;

  const chunkTotal = Math.ceil(total / 50000) || 1;
  return Array.from({ length: chunkTotal }).map((_, i) => ({ id: String(i) }));
}

export default async function sitemap({ id }: { id?: string }): Promise<MetadataRoute.Sitemap> {
  const processed = await getProcessedBreweryData();
  const cities = await getAllCities();
  const amenities = AMENITY_SLUGS as readonly string[];
  const counties = Array.from(new Set(processed.breweries.map((b) => (b as any).county).filter(Boolean))) as string[];

  const lastMod = new Date();

  const urls: MetadataRoute.Sitemap = [];

  // Homepage
  urls.push({ url: `${BASE_URL}/`, lastModified: lastMod, priority: 1.0 });

  // Important static pages
  urls.push({ url: `${BASE_URL}/map`, lastModified: lastMod, priority: 0.8 });
  urls.push({ url: `${BASE_URL}/open-now`, lastModified: lastMod, priority: 0.7 });
  urls.push({ url: `${BASE_URL}/contact`, lastModified: lastMod, priority: 0.6 });
  urls.push({ url: `${BASE_URL}/city`, lastModified: lastMod, priority: 0.8 });
  urls.push({ url: `${BASE_URL}/county`, lastModified: lastMod, priority: 0.8 });

  // Open by day pages
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const day of days) {
    urls.push({ url: `${BASE_URL}/open/${day}`, lastModified: lastMod, priority: 0.5 });
  }

  // City pages
  for (const city of cities) {
    urls.push({ url: `${BASE_URL}/city/${slugify(city)}/breweries`, lastModified: lastMod, priority: 0.9 });
  }

  // County pages
  for (const county of counties) {
    urls.push({ url: `${BASE_URL}/county/${slugify(county)}/breweries`, lastModified: lastMod, priority: 0.7 });
  }

  // Individual breweries
  for (const b of processed.breweries) {
    const slug = (b as any).slug || b.id;
    const lm = (b as any).lastUpdated ? new Date((b as any).lastUpdated) : lastMod;
    urls.push({ url: `${BASE_URL}/breweries/${slug}`, lastModified: lm, priority: 0.8 });
  }

  // Type pages
  const types = ['microbrewery', 'brewpub', 'taproom', 'production', 'nano'];
  for (const type of types) {
    urls.push({ url: `${BASE_URL}/type/${type}`, lastModified: lastMod, priority: 0.7 });
  }

  // Amenity pages
  for (const a of amenities) {
    urls.push({ url: `${BASE_URL}/amenities/${a}`, lastModified: lastMod, priority: 0.6 });
  }

  // Combination pages: city + amenity
  for (const city of cities) {
    const citySlug = slugify(city);
    for (const a of amenities) {
      urls.push({ url: `${BASE_URL}/city/${citySlug}/${a}`, lastModified: lastMod, priority: 0.5 });
    }
  }

  // Chunk at 50k per part
  const chunks = chunkArray(urls, 50000);
  const index = id ? Math.max(0, Math.min(Number(id) || 0, chunks.length - 1)) : 0;
  return chunks[index] || [];
}
