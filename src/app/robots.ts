import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.marylandbrewery.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Internal endpoints
          '/api',

          // Next.js HMR (dev only)
          '/_next/webpack-hmr',
        ],
      },
    ],
    sitemap: [`${base}/sitemap.xml`],
  };
}
