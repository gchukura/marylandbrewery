/**
 * Layout Utilities for Static Generation
 * Provides consistent metadata and styling for 500+ pages
 */

import { openingHoursSpecification } from '@/lib/hours';
import { buildMetadata } from '@/lib/seo/metadata';
import { Metadata } from 'next';

// Maryland flag colors for consistent theming
// Base metadata template for consistent SEO
/**
 * Metadata for static pages (FAQ, terms, ...). A thin wrapper over buildMetadata; the title
 * must not include the brand, which the layout template adds.
 */
export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  return { ...buildMetadata({ title, description, path, image }), keywords };
}

// Utility for consistent page titles (optimized for <60 chars)
// Utility for consistent meta descriptions (optimized for 120-160 chars)
// Utility for consistent CSS classes
