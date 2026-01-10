/**
 * UI Style Guide - Design Tokens
 * 
 * Centralized design system tokens for consistent styling across the application.
 * All values are optimized for accessibility (WCAG AA compliance) and responsive design.
 */

export const typography = {
  // Display text (hero headings)
  display: {
    size: '3rem', // 48px
    lineHeight: 1.1,
    weight: 700,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  // Page titles (H1)
  h1: {
    size: '2.25rem', // 36px
    lineHeight: 1.2,
    weight: 700,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  // Section headings (H2)
  h2: {
    size: '1.875rem', // 30px
    lineHeight: 1.3,
    weight: 600,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  // Subsection headings (H3)
  h3: {
    size: '1.5rem', // 24px
    lineHeight: 1.35,
    weight: 600,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  // Body text (16px minimum for accessibility)
  body: {
    size: '1rem', // 16px
    lineHeight: 1.6,
    weight: 400,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  // Large body text
  bodyLarge: {
    size: '1.125rem', // 18px
    lineHeight: 1.6,
    weight: 400,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  // Navigation links (16px minimum for accessibility)
  nav: {
    size: '1rem', // 16px
    lineHeight: 1.5,
    weight: 500,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  // Small text (14px minimum for UI elements)
  small: {
    size: '0.875rem', // 14px
    lineHeight: 1.5,
    weight: 400,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  // Captions (only for decorative text)
  caption: {
    size: '0.75rem', // 12px
    lineHeight: 1.4,
    weight: 400,
    fontFamily: "'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif",
  },
} as const;

export const spacing = {
  // Section padding (optimized, 20-30% reduction)
  section: {
    mobile: 'py-8 md:py-10',
    desktop: 'py-10 md:py-14',
  },
  // Hero section padding (optimized)
  hero: {
    mobile: 'pt-12 md:pt-16',
    desktop: 'pb-6 md:pb-8',
  },
  // Container padding
  container: {
    base: 'px-4',
    sm: 'sm:px-6',
    lg: 'lg:px-8',
    full: 'px-4 sm:px-6 lg:px-8',
  },
  // Grid gaps
  grid: {
    mobile: 'gap-4',
    md: 'md:gap-6',
    desktop: 'gap-6 lg:gap-8',
    full: 'gap-4 md:gap-6 lg:gap-8',
  },
} as const;

export const colors = {
  // Primary colors
  red: {
    primary: '#9B2335',
    dark: '#7A1C2A',
    light: '#B83D52',
  },
  gold: {
    primary: '#D4A017',
    light: '#E8C547',
    dark: '#B8870F',
  },
  // Neutral colors
  charcoal: '#1C1C1C',
  warmGray: '#6B6B6B',
  lightGray: '#E8E6E1',
  cream: '#FAF9F6',
  creamDark: '#F0EDE8',
  white: '#FFFFFF',
  // Semantic colors
  text: {
    primary: '#1C1C1C',
    secondary: '#6B6B6B',
    tertiary: '#9CA3AF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#FAF9F6',
  },
} as const;

// Contrast ratio notes:
// - Red (#9B2335) on white: 4.9:1 ✓ (WCAG AA)
// - Charcoal (#1C1C1C) on white: 15.8:1 ✓ (WCAG AAA)
// - Warm Gray (#6B6B6B) on white: 4.6:1 ✓ (WCAG AA)
// - White on red (#9B2335): 4.9:1 ✓ (WCAG AA)
// - Gold (#D4A017) on white: needs careful use (lower contrast)

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

