import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    staticGenerationRetryCount: 3,
    largePageDataBytes: 128 * 1024 * 1024, // 128MB
  },
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'maps.googleapis.com',
      'api.mapbox.com',
    ],
    formats: ['image/webp', 'image/avif'],
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
