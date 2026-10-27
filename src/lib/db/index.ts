/**
 * Data layer: the only place that talks to Supabase.
 * Pages and components import from '@/lib/db', never from the client directly.
 */
// The raw clients stay private to this folder; only the row types are public.
export type {
  DatabaseBrewery,
  DatabaseBeer,
  DatabaseNewsletterSubscriber,
  DatabaseAttraction,
  DatabaseNeighborhood,
  DatabaseBreweryArticle,
} from './client';
export * from './queries';
export * from './attractions';
export * from './brewery-data';
// queries.ts has uncached versions of these; the cached ones are the public API.
export { searchBreweries, getNearbyBreweries } from './brewery-data';
