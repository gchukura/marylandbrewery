# Maryland Brewery Directory

A Next.js 14 application for discovering and exploring craft breweries across Maryland. Built with TypeScript, Tailwind CSS, and optimized for Vercel deployment.

## Features

- 🍺 Comprehensive brewery directory
- 🗺️ Interactive map integration with Mapbox
- 📱 Responsive design with Maryland flag colors
- 🔍 Advanced filtering and search
- 📊 Analytics integration
- ⚡ Optimized for performance and SEO

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
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
   - `GOOGLE_SHEET_ID`: Google Sheets ID for brewery data
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Service account email
   - `GOOGLE_PRIVATE_KEY`: Service account private key
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox access token
   - `NEXT_PUBLIC_GA_ID`: Google Analytics ID (optional)
   - `NEXT_PUBLIC_SITE_URL`: Site URL
   - `ADMIN_TOKEN`: Admin authentication token

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

## Configuration

### Tailwind CSS

The project uses custom Maryland flag colors:
- `md-red`: #E03A3E
- `md-gold`: #EAAA00
- `md-black`: #000000
- `md-white`: #FFFFFF

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