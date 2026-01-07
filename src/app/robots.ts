import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = 'https://www.marylandbrewery.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Admin and internal pages
          '/admin',
          '/api',
          
          // Test and development pages
          '/test-',
          '/simple-test',
          '/test-brewery',
          '/test-programmatic',
          '/test-simple-programmatic',
          '/test-templates',
          
          // Next.js HMR (dev only)
          '/_next/webpack-hmr',
        ],
      },
    ],
    sitemap: [`${base}/sitemap.xml`],
  };
}
