import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staticGenerationRetryCount: 1, // Reduced from 3 to speed up builds
    largePageDataBytes: 512 * 1024, // 512KB (default is 128KB, but allow for larger pages)
    optimizePackageImports: ['lucide-react', '@vis.gl/react-google-maps', '@googlemaps/markerclusterer'],
  },
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'maps.googleapis.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  async redirects() {
    return [
      // Redirect old amenity URLs to new format
      {
        source: '/breweries/amenity/:path*',
        destination: '/amenities/:path*',
        permanent: true,
      },
      // Redirect old type URLs to new format
      {
        source: '/breweries/type/:path*',
        destination: '/type/:path*',
        permanent: true,
      },
      // Redirect /features to /amenities (permanent - features index doesn't exist)
      {
        source: '/features',
        destination: '/amenities',
        permanent: true,
      },
      // Redirect /types to /type (permanent - types index doesn't exist)
      {
        source: '/types',
        destination: '/type',
        permanent: true,
      },
      // Redirect /breweries to homepage (permanent - all breweries page doesn't exist)
      {
        source: '/breweries',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
