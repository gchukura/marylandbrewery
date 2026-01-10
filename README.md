# Maryland Brewery Directory

A Next.js 14 application for discovering and exploring craft breweries across Maryland. Built with TypeScript, Tailwind CSS, and optimized for Vercel deployment.

## Features

- 🍺 Comprehensive brewery directory
- 🗺️ Interactive map integration with Google Maps
- 📱 Responsive design with Maryland flag colors
- 🔍 Advanced filtering and search
- 📊 Analytics integration
- ⚡ Optimized for performance and SEO

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Google Maps (via @vis.gl/react-google-maps)
- **Analytics**: Vercel Analytics
- **Package Manager**: pnpm
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd marylandbrewery
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Fill in the required environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
   - `NEXT_PUBLIC_GA_ID`: Google Analytics ID (optional)
   - `NEXT_PUBLIC_SITE_URL`: Site URL
   - `ADMIN_TOKEN`: Admin authentication token
   - `ADMIN_SYNC_TOKEN`: Admin sync token

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable components
│   └── ui/            # UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── styles/            # Additional styles
├── templates/          # Page templates
└── types/             # TypeScript type definitions
```

## Style Guide & Design System

The project follows a comprehensive, accessible design system that ensures consistency and WCAG AA compliance. The style guide is centralized in `src/styles/style-guide.ts` and `src/styles/style-guide.css`.

### Typography

**Font Families:**
- **Display/Headings**: `'Playfair Display', Georgia, serif` - Use `font-display` class or `fontFamily: 'display'` in Tailwind
- **Body**: `'Source Sans 3', sans-serif` - Use `font-body` class or `fontFamily: 'body'` in Tailwind

**Typography Scale (WCAG AA Compliant):**
- **Display**: 3rem (48px) - Hero headings
- **H1**: 2.25rem (36px) - Page titles
- **H2**: 1.875rem (30px) - Section headings
- **H3**: 1.5rem (24px) - Subsection headings
- **Body Large**: 1.125rem (18px) - Large body text
- **Body**: 1rem (16px) - Standard body text (minimum for accessibility)
- **Navigation**: 1rem (16px) - Navigation links (minimum for accessibility)
- **Small**: 0.875rem (14px) - Small text/UI elements (minimum with adequate weight)
- **Caption**: 0.75rem (12px) - Decorative text only

**Usage Examples:**
```tsx
// Headings
<h1 className="text-h1 font-display font-bold text-charcoal">Page Title</h1>
<h2 className="text-h2 font-display font-semibold">Section Title</h2>

// Body text
<p className="text-body font-body text-warm-gray">Body text here</p>

// Navigation
<Link className="text-base font-body font-medium text-white">Nav Link</Link>
```

### Colors

**Primary Colors:**
- `red-primary`: #9B2335 (WCAG AA: 4.9:1 on white)
- `red-dark`: #7A1C2A
- `gold-primary`: #D4A017 (use with caution, verify contrast)
- `gold-light`: #E8C547
- `gold-dark`: #B8870F

**Neutral Colors:**
- `charcoal`: #1C1C1C (WCAG AAA: 15.8:1 on white)
- `warm-gray`: #6B6B6B (WCAG AA: 4.6:1 on white)
- `light-gray`: #E8E6E1
- `cream`: #FAF9F6 (background)
- `cream-dark`: #F0EDE8

**Usage:**
```tsx
// Text colors
<p className="text-charcoal">Primary text</p>
<p className="text-warm-gray">Secondary text</p>

// Background colors
<div className="bg-cream">Background</div>
<div className="bg-red-primary text-white">Button</div>
```

**Legacy Colors (for backwards compatibility):**
- `md-red`: #9B2335
- `md-gold`: #D4A017
- `md-black`: #000000
- `md-white`: #FFFFFF

### Spacing

**Optimized Spacing Scale:**
- **Section Padding**: `py-8 md:py-10` (mobile), `py-10 md:py-14` (desktop)
- **Hero Padding**: `pt-12 md:pt-16` (mobile), `pb-6 md:pb-8` (desktop)
- **Container Padding**: `px-4 sm:px-6 lg:px-8`
- **Grid Gaps**: `gap-4 md:gap-6 lg:gap-8`

**Usage:**
```tsx
<section className="py-8 md:py-10 bg-white">
  <div className="container mx-auto px-4">
    {/* Content */}
  </div>
</section>
```

### Accessibility Guidelines

**Font Sizes:**
- ✅ All body text: Minimum 16px (1rem)
- ✅ All navigation text: Minimum 16px (1rem)
- ✅ UI elements: Minimum 14px (0.875rem) with medium weight

**Color Contrast:**
- ✅ Normal text: Minimum 4.5:1 contrast ratio (WCAG AA)
- ✅ Large text (18px+): Minimum 3:1 contrast ratio (WCAG AA)
- ✅ All primary colors tested and verified

**Best Practices:**
1. Always use Tailwind classes from the style guide, avoid inline `font-size` styles
2. Use `font-body` for all body text and navigation
3. Use `font-display` for all headings
4. Verify contrast when using gold color
5. Maintain minimum touch target size of 44x44px for interactive elements

### Implementation Files

- **Design Tokens**: `src/styles/style-guide.ts` - TypeScript constants
- **CSS Variables**: `src/styles/style-guide.css` - CSS custom properties
- **Tailwind Config**: `tailwind.config.ts` - Extended with style guide tokens
- **Global Styles**: `src/app/globals.css` - Base styles and font imports

### Reference Components

For examples of proper style guide usage, see:
- `src/components/home-v2/HeaderV2.tsx` - Navigation styling
- `src/components/home-v2/HeroV2.tsx` - Hero section typography
- `src/components/home-v2/ValuePropsV2.tsx` - Section styling
- `src/app/cities/page.tsx` - Page-level typography and spacing

## Configuration

### Tailwind CSS

The project uses the style guide color palette (see Style Guide section above) with legacy color support for backwards compatibility.

### Next.js Configuration

The `next.config.ts` includes:
- Standalone output for Vercel optimization
- Image domain configuration
- Security headers
- Static generation timeout settings

### Vercel Deployment

The `vercel.json` includes:
- Region configuration (iad1 - US East)
- Build and install commands
- API route timeout settings
- Security headers

## Development

### Code Quality

- **ESLint**: Configured with TypeScript rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm format       # Format code with Prettier
```

## API Endpoints

### Breweries

- `GET /api/breweries` - Get all breweries with filtering and pagination
  - Query parameters:
    - `city`: Filter by city
    - `features`: Filter by features (array)
    - `isActive`: Filter by active status
    - `search`: Search by name or city
    - `sortField`: Sort field (name, city, established, createdAt)
    - `sortDirection`: Sort direction (asc, desc)
    - `page`: Page number
    - `limit`: Items per page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.