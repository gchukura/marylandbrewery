import { NextResponse, type NextRequest } from 'next/server';

/**
 * Permanent (301) redirects that need no data: old "-md" city and county URLs.
 * Redirects that depend on data (city size, neighborhoods, brewery ids) live in their pages.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /cities/{city}-md/... and /counties/{county}-md/... -> without "-md"
  const md = pathname.match(/^\/(cities|counties)\/([^/]+)-md(\/.*)?$/);
  if (md && md[2] !== 'near') {
    return redirect(request, `/${md[1]}/${md[2]}${md[3] ?? ''}`);
  }

  return NextResponse.next();
}

function redirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ['/cities/:path*', '/counties/:path*'],
};
