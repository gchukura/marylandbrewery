import { getProcessedBreweryData } from '@/lib/db';
import { buildSearchIndex } from '@/lib/search-index';

// Built with the site and refreshed with the data; the typeahead fetches it on first focus
export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const { breweries } = await getProcessedBreweryData();
  return Response.json(buildSearchIndex(breweries));
}
