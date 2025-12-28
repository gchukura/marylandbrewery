/**
 * BreweryLogo Component
 * Handles brewery logo display with support for both local paths and external URLs
 */

'use client';

import { useState } from 'react';

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

  if (imageError) {
    return null; // Don't show anything if image fails to load
  }

  return (
    <div className={`${sizeClasses[size]} flex-shrink-0 ${className}`}>
      <img
        src={logoUrl}
        alt={`${breweryName} logo`}
        className={`${sizeClasses[size]} object-contain rounded-lg border border-gray-200 bg-white ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-200`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
}

