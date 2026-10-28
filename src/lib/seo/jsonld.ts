/**
 * schema.org structured data. Listing pages emit CollectionPage + BreadcrumbList; brewery pages
 * emit Brewery + BreadcrumbList. No aggregateRating: our ratings come from Google and Yelp, and
 * Google's review-snippet rules don't allow third-party ratings.
 */
import type { Brewery } from '@/types/brewery';
import { openingHoursSpecification } from '@/lib/hours';
import { externalUrl } from '@/lib/format';
import { SITE_URL } from './metadata';

export interface Crumb {
  name: string;
  path: string;
}

const absolute = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function collectionPage({
  name,
  description,
  path,
  breweries,
}: {
  name: string;
  description?: string;
  path: string;
  breweries: { name: string; slug: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    ...(description ? { description } : {}),
    url: absolute(path),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: breweries.length,
      itemListElement: breweries.map((brewery, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: brewery.name,
        url: absolute(`/breweries/${brewery.slug}`),
      })),
    },
  };
}

export function brewerySchema(brewery: Brewery) {
  const url = absolute(`/breweries/${brewery.slug}`);
  const sameAs = [brewery.website, ...Object.values(brewery.socialMedia ?? {})]
    .map((link) => externalUrl(link))
    .filter((link): link is string => Boolean(link));
  const images = [...(brewery.photos ?? []), brewery.photoUrl, brewery.logo]
    .filter((src): src is string => Boolean(src))
    .map(absolute);
  const hours = openingHoursSpecification(brewery.hours);

  return {
    '@context': 'https://schema.org',
    '@type': 'Brewery',
    '@id': `${url}#brewery`,
    url,
    name: brewery.name,
    ...(brewery.description ? { description: brewery.description } : {}),
    ...(brewery.phone ? { telephone: brewery.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(brewery.street ? { streetAddress: brewery.street } : {}),
      addressLocality: brewery.city,
      addressRegion: 'MD',
      ...(brewery.zip ? { postalCode: brewery.zip } : {}),
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: brewery.latitude, longitude: brewery.longitude },
    ...(sameAs.length ? { sameAs } : {}),
    ...(images.length ? { image: [...new Set(images)].slice(0, 6) } : {}),
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
  };
}
