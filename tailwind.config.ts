import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Style guide colors
        'red': {
          primary: '#9B2335',
          dark: '#7A1C2A',
          light: '#B83D52',
          DEFAULT: '#9B2335',
        },
        'gold': {
          primary: '#D4A017',
          light: '#E8C547',
          dark: '#B8870F',
          DEFAULT: '#D4A017',
        },
        'charcoal': '#1C1C1C',
        'warm-gray': '#6B6B6B',
        'light-gray': '#E8E6E1',
        'cream': '#FAF9F6',
        'cream-dark': '#F0EDE8',
        // Legacy color names (keep for backwards compatibility)
        'md-red': '#9B2335',
        'md-gold': '#D4A017',
        'md-black': '#000000',
        'md-white': '#FFFFFF',
        // Status colors
        'status-open': '#10B981',
        'status-closed': '#EF4444',
        'status-coming': '#F59E0B',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      backgroundImage: {
        'md-flag': "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRTAzQTNFLiI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIGZpbGw9IiNFQUFBMDAiPjwvcmVjdD4KPHBhdGggZD0iTTAgMEwyMCAyMEw0MCAwWiIgZmlsbD0iI0UwM0EzRSIvPgo8cGF0aCBkPSJNMCA0MEwyMCAyMEw0MCA0MFoiIGZpbGw9IiNFQUFBMDAiLz4KPC9zdmc+')",
      },
      fontSize: {
        // Style guide typography scale (WCAG AA compliant)
        display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        h1: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        h2: ['1.875rem', { lineHeight: '1.3' }],
        h3: ['1.5rem', { lineHeight: '1.35' }],
        'body-large': ['1.125rem', { lineHeight: '1.6' }],
        body: ['1rem', { lineHeight: '1.6' }], // 16px minimum for accessibility
        nav: ['1rem', { lineHeight: '1.5' }], // 16px minimum for navigation
        small: ['0.875rem', { lineHeight: '1.5' }], // 14px minimum for UI
        caption: ['0.75rem', { lineHeight: '1.4' }], // Decorative only
      },
      fontFamily: {
        display: ["var(--font-playfair-display)", "Georgia", "serif"],
        body: ["var(--font-source-sans-3)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      spacing: {
        'card-padding': '1rem',
        'grid-gutter': '1rem',
        'section-y': '2rem', // Optimized from 3rem
        'section-y-md': '2.5rem', // Optimized
        'section-y-lg': '3.5rem', // Optimized
        'hero-y': '3rem', // Optimized
        'hero-y-md': '4rem', // Optimized
      },
      borderRadius: {
        card: '0.375rem',
        btn: '0.25rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 8px -2px rgb(0 0 0 / 0.08)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
