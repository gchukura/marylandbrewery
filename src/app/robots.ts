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
          
          // Next.js internal files and static assets (blocks CSS, JS, fonts, images)
          '/_next/static',
          '/_next/image',
          '/_next/webpack-hmr',
          
          // Static asset directories (if any exist in public)
          '/static',
          
          // Manifest and other non-content files
          '/manifest.json',
        ],
      },
      // Allow Googlebot to access static assets for proper rendering
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/test-',
          '/simple-test',
          '/test-brewery',
          '/test-programmatic',
          '/test-simple-programmatic',
          '/test-templates',
        ],
      },
    ],
    sitemap: [`${base}/sitemap.xml`],
  };
}
