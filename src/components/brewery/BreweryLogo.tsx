/**
 * BreweryLogo Component
 * Handles brewery logo display with support for both local paths and external URLs
 * Uses Next.js Image component for optimization and better loading
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BreweryLogoProps {
  logo: string;
  breweryName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
  xl: 'h-40 w-40',
};

const sizePixels = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 160,
};

export default function BreweryLogo({ 
  logo, 
  breweryName, 
  className = '',
  size = 'lg'
}: BreweryLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Normalize logo path
  // If it's a local path (starts with /), it's served from public directory
  // If it's an external URL (starts with http), use as-is
  const logoUrl = logo.startsWith('/') 
    ? logo  // Local path - Next.js serves from public directory
    : logo.startsWith('http://') || logo.startsWith('https://')
    ? logo  // External URL - use as-is
    : `/${logo}`; // Assume local path if no leading slash

  // Check if it's an external URL
  const isExternal = logoUrl.startsWith('http://') || logoUrl.startsWith('https://');

  if (imageError) {
    return null; // Don't show anything if image fails to load
  }

  const sizePx = sizePixels[size];

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 relative flex items-center justify-center ${className}`}>
      {imageLoading && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse rounded ${sizeClasses[size]}`} />
      )}
      {isExternal ? (
        // For external URLs, use regular img tag (Next.js Image requires domain config)
        <img
          src={logoUrl}
          alt={`${breweryName} logo`}
          className={`${sizeClasses[size]} object-contain ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          loading="lazy"
        />
      ) : (
        // For local paths, use Next.js Image component for optimization
        <Image
          src={logoUrl}
          alt={`${breweryName} logo`}
          width={sizePx}
          height={sizePx}
          className={`object-contain ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          loading="lazy"
          unoptimized={false}
        />
      )}
    </div>
  );
}

