# Layout System for Maryland Brewery Directory

Optimized layout components for static generation of 500+ pages with Maryland flag design and SEO optimization.

## 🎯 **Overview**

This layout system is designed for:
- **Static Generation**: Server components for faster builds
- **SEO Optimization**: Consistent metadata and structured data
- **Maryland Branding**: Flag colors and local theming
- **Performance**: Lightweight components for 500+ pages
- **Accessibility**: Proper ARIA labels and semantic HTML

## 📁 **File Structure**

```
src/
├── app/
│   └── layout.tsx              # Root layout with ISR and metadata
├── components/layout/
│   ├── Header.tsx              # Server component header
│   ├── MobileMenu.tsx          # Client component mobile menu
│   └── Footer.tsx               # Server component footer
└── lib/
    └── layout-utils.ts         # Layout utilities and metadata helpers
```

## 🚀 **Key Features**

### ✅ **Root Layout (`app/layout.tsx`)**
- **ISR Configuration**: `revalidate = 3600` for hourly updates
- **Metadata Template**: Consistent SEO across all pages
- **Maryland Theme**: Red, yellow, and white color scheme
- **Vercel Analytics**: Built-in analytics integration
- **Font Optimization**: Local fonts for faster builds

### ✅ **Header Component (`Header.tsx`)**
- **Server Component**: No client-side JavaScript for faster builds
- **Maryland Flag Design**: Red banner with yellow accents
- **Navigation Dropdowns**: Cities, counties, features, types
- **Mobile Menu**: Separate client component for mobile
- **Prefetch Priority**: Important routes preloaded

### ✅ **Footer Component (`Footer.tsx`)**
- **Server Component**: Static links for SEO
- **Top Cities/Counties**: Popular destinations with counts
- **Social Media**: Facebook, Instagram, Twitter links
- **Data Updated**: Current date indicator
- **Maryland Flag**: Bottom border with flag colors

### ✅ **Mobile Menu (`MobileMenu.tsx`)**
- **Client Component**: Interactive mobile navigation
- **Collapsible Sections**: Expandable navigation groups
- **Touch Friendly**: Large touch targets
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🎨 **Maryland Flag Design**

### Color Scheme
```css
/* Maryland Flag Colors */
--red: #dc2626      /* Maryland flag red */
--yellow: #fbbf24   /* Maryland flag yellow */
--white: #ffffff    /* Maryland flag white */
--black: #000000    /* Maryland flag black */
```

### Visual Elements
- **Red Banner**: Top header with Maryland flag red
- **Yellow Accents**: Highlighted elements and borders
- **Flag Border**: Bottom border with gradient flag colors
- **State Motto**: "Supporting Local Breweries" messaging

## 📊 **SEO Optimization**

### Metadata Template
```typescript
export const metadata: Metadata = {
  title: {
    default: "Maryland Brewery Directory | Craft Breweries Across Maryland",
    template: "%s | Maryland Brewery Directory"
  },
  description: "Discover the best craft breweries across Maryland...",
  keywords: ["Maryland breweries", "craft beer Maryland", ...],
  openGraph: { /* Open Graph tags */ },
  twitter: { /* Twitter Card tags */ },
  robots: { /* Search engine directives */ }
};
```

### Structured Data
- **BreadcrumbList**: Navigation breadcrumbs
- **Organization**: Site information
- **Brewery**: Individual brewery details
- **CollectionPage**: City/county pages

## 🔧 **Usage Examples**

### Basic Page Layout
```typescript
import { createPageMetadata } from '@/lib/layout-utils';

export const metadata = createPageMetadata({
  title: 'Baltimore Breweries',
  description: 'Discover 15 breweries in Baltimore, Maryland...',
  path: '/breweries/baltimore',
  keywords: ['Baltimore breweries', 'craft beer Baltimore']
});
```

### City Page Example
```typescript
// app/breweries/baltimore/page.tsx
import { createPageMetadata, generateBreadcrumbStructuredData } from '@/lib/layout-utils';

export const metadata = createPageMetadata({
  title: 'Baltimore Breweries',
  description: 'Discover 15 breweries in Baltimore, Maryland...',
  path: '/breweries/baltimore',
  keywords: ['Baltimore breweries', 'craft beer Baltimore']
});

export default function BaltimorePage() {
  const breadcrumbs = [
    { name: 'Home', url: '/', position: 1 },
    { name: 'Cities', url: '/cities', position: 2 },
    { name: 'Baltimore', url: '/breweries/baltimore', position: 3 }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbStructuredData(breadcrumbs))
        }}
      />
      {/* Page content */}
    </>
  );
}
```

## 📱 **Responsive Design**

### Breakpoints
- **Mobile**: < 768px (sm)
- **Tablet**: 768px - 1024px (md)
- **Desktop**: > 1024px (lg)

### Mobile Features
- **Hamburger Menu**: Collapsible navigation
- **Touch Targets**: 44px minimum touch areas
- **Swipe Gestures**: Mobile-friendly interactions
- **Responsive Images**: Optimized for all screen sizes

## ⚡ **Performance Optimizations**

### Server Components
- **Header**: Server component for faster builds
- **Footer**: Server component with static content
- **No Client JS**: Reduced JavaScript bundle size

### Client Components
- **Mobile Menu**: Only client component for interactivity
- **Minimal JS**: Lightweight client-side functionality
- **Lazy Loading**: Components loaded on demand

### Build Optimizations
- **Static Generation**: All pages pre-rendered
- **ISR**: Incremental Static Regeneration
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Local font files

## 🎯 **SEO Features**

### Meta Tags
- **Title Templates**: Consistent page titles
- **Meta Descriptions**: Unique descriptions per page
- **Keywords**: Maryland-specific keywords
- **Open Graph**: Social media sharing
- **Twitter Cards**: Twitter sharing optimization

### Structured Data
- **Breadcrumbs**: Navigation hierarchy
- **Local Business**: Brewery information
- **Organization**: Site details
- **Collection Pages**: City/county listings

### Internal Linking
- **Top Cities**: Popular destinations
- **Top Counties**: County listings
- **Features**: Amenity pages
- **Types**: Brewery type pages

## 🔄 **Content Updates**

### ISR Configuration
```typescript
// Revalidate every hour
export const revalidate = 3600;
```

### Data Freshness
- **Footer Date**: "Data updated: [current date]"
- **Automatic Updates**: Hourly revalidation
- **Cache Strategy**: Optimized for performance

## 📈 **Analytics Integration**

### Vercel Analytics
```typescript
import { Analytics } from '@vercel/analytics/react';

// Automatically included in root layout
<Analytics />
```

### Tracking Events
- **Page Views**: Automatic page tracking
- **Custom Events**: Brewery interactions
- **Performance**: Core Web Vitals
- **User Behavior**: Navigation patterns

## 🎨 **Customization**

### Color Scheme
```typescript
export const MARYLAND_COLORS = {
  red: '#dc2626',
  yellow: '#fbbf24',
  white: '#ffffff',
  black: '#000000'
};
```

### Layout Classes
```typescript
export const LAYOUT_CLASSES = {
  container: 'container mx-auto px-4',
  section: 'py-8 md:py-12',
  heading: 'text-3xl md:text-4xl font-bold text-gray-900',
  // ... more utility classes
};
```

## 🚀 **Next Steps**

1. **Deploy**: Layout system ready for production
2. **Monitor**: Track performance and SEO metrics
3. **Optimize**: Fine-tune based on analytics
4. **Expand**: Add more layout variations
5. **Test**: A/B test different designs

This layout system ensures your Maryland Brewery Directory has consistent, SEO-optimized pages that load fast and rank well! 🍺
