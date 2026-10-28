import { NextResponse, type NextRequest } from 'next/server';
import { AMENITY_ALIASES } from '@/lib/amenities';

/**
 * Permanent (301) redirects that need no data: old "-md" city and county URLs and amenity aliases.
 * Redirects that depend on data (city size, neighborhoods, brewery ids) live in their pages.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /cities/{city}-md/... and /counties/{county}-md/... -> without "-md"
  const md = pathname.match(/^\/(cities|counties)\/([^/]+)-md(\/.*)?$/);
  if (md && md[2] !== 'near') {
    return redirect(request, `/${md[1]}/${md[2]}${md[3] ?? ''}`);
  }

  // /amenities/{alias} -> canonical amenity, or the index when the amenity has no page
  const amenity = pathname.match(/^\/amenities\/([^/]+)$/);
  if (amenity && Object.hasOwn(AMENITY_ALIASES, amenity[1])) {
    const target = AMENITY_ALIASES[amenity[1]];
    return redirect(request, target ? `/amenities/${target}` : '/amenities');
  }

  // /cities/{city}/{alias} -> canonical amenity, or the city listing when it has no page
  const cityAmenity = pathname.match(/^\/cities\/([^/]+)\/([^/]+)$/);
  if (cityAmenity && Object.hasOwn(AMENITY_ALIASES, cityAmenity[2])) {
    const target = AMENITY_ALIASES[cityAmenity[2]];
    return redirect(
      request,
      `/cities/${cityAmenity[1]}/${target ?? 'breweries'}`
    );
  }

  // /map?search=x (old links and the retired SearchAction) -> /map?q=x
  if (pathname === '/map' && request.nextUrl.searchParams.has('search')) {
    const url = request.nextUrl.clone();
    const query = url.searchParams.get('search') ?? '';
    url.searchParams.delete('search');
    if (query.trim() && !url.searchParams.has('q'))
      url.searchParams.set('q', query.trim());
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ['/cities/:path*', '/counties/:path*', '/amenities/:path*', '/map'],
};
