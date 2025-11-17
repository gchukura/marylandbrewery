import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.marylandbrewery.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/sync', '/api/revalidate'],
      },
    ],
    sitemap: [`${base}/sitemap.xml`],
  };
}
