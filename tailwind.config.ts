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
        'md-red': '#E03A3E',
        'md-gold': '#EAAA00',
        'md-black': '#000000',
        'md-white': '#FFFFFF',
        'status-open': '#10B981',
        'status-closed': '#EF4444',
        'status-coming': '#F59E0B',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontSize: {
        display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        h1: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        h2: ['1.5rem', { lineHeight: '1.3' }],
        h3: ['1.25rem', { lineHeight: '1.35' }],
        body: ['1rem', { lineHeight: '1.5' }],
        small: ['0.875rem', { lineHeight: '1.4' }],
      },
      spacing: {
        'card-padding': '1rem',
        'grid-gutter': '1rem',
        'section-y': '3rem',
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
