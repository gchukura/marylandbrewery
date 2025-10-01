import { NextResponse } from 'next/server';
import { getProcessedBreweryData } from '@/lib/brewery-data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const limit = Math.min(10, Math.max(1, Number(searchParams.get('limit') || 10)));

  const processed = await getProcessedBreweryData();
  const breweries = processed.breweries || [];

  const citySet = new Map<string, number>();
  const amenitySet = new Set<string>();

  for (const b of breweries) {
    const city = (b.city || '').trim();
    if (city) citySet.set(city, (citySet.get(city) || 0) + 1);
    const features: string[] = (b as any).features || (b as any).amenities || [];
    for (const a of features) {
      if (a) amenitySet.add(a);
    }
  }

  const cities = Array.from(citySet.entries()).map(([name, count]) => ({ name, count }));
  const amenities = Array.from(amenitySet);

  const breweryMatches = breweries
    .filter(b => !q || b.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map(b => ({ type: 'brewery', id: b.id, name: b.name, city: b.city }));

  const cityMatches = cities
    .filter(c => !q || c.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map(c => ({ type: 'city', name: c.name, count: c.count }));

  const amenityMatches = amenities
    .filter(a => !q || a.toLowerCase().includes(q))
    .slice(0, limit)
    .map(a => ({ type: 'amenity', name: a }));

  return NextResponse.json({
    ok: true,
    breweries: breweryMatches,
    cities: cityMatches,
    amenities: amenityMatches,
  });
}
