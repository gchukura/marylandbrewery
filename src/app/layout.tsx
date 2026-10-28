import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import ConditionalLayoutClient from "@/components/layout/ConditionalLayoutClient";
import AdSenseScript from "@/components/ads/AdSenseScript";
import "./globals.css";
import "@/styles/design-system.css";
import "@/styles/style-guide.css";

// Optimize font loading with next/font/google
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair-display",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-source-sans-3",
});

// Revalidate every hour for ISR
export const revalidate = 3600;

export const metadata: Metadata = {
  // Pages set their title through buildMetadata (src/lib/seo/metadata.ts) without the brand;
  // the template adds it. Keep TITLE_SUFFIX in sync with this template.
  title: {
    default: "Maryland Brewery: Every Craft Brewery in Maryland",
    template: "%s | Maryland Brewery",
  },
  description: "Discover the best craft breweries across Maryland. Find local breweries, events, and more. Your complete guide to Maryland's thriving craft beer scene.",
  keywords: [
    "Maryland breweries",
    "craft beer Maryland", 
    "Maryland brewery directory",
    "breweries near me",
    "craft beer Baltimore",
    "Maryland beer",
    "brewery tours Maryland",
    "craft breweries Maryland"
  ],
  authors: [{ name: "Maryland Brewery Directory" }],
  creator: "Maryland Brewery Directory",
  publisher: "Maryland Brewery Directory",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // No canonical here: every page that inherits it would claim to be the homepage
  metadataBase: new URL("https://www.marylandbrewery.com"),
  // No openGraph.url or title here either: pages without their own would all claim the homepage.
  // buildMetadata sets them per page.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Maryland Brewery",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@marylandbrewery",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Search Console HTML-tag verification; set GOOGLE_SITE_VERIFICATION in Vercel
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // Support for notched devices (iPhone X and later)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

// WebSite schema. No SearchAction: Google retired the sitelinks search box (Nov 2024) and
// /map does not read ?search=
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Maryland Brewery',
  url: 'https://www.marylandbrewery.com',
  description: 'Every craft brewery in Maryland',
};

// Organization schema for brand recognition
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Maryland Brewery',
  url: 'https://www.marylandbrewery.com',
  logo: 'https://www.marylandbrewery.com/logo.png',
  sameAs: [
    'https://twitter.com/marylandbrewery'
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${playfairDisplay.variable} ${sourceSans3.variable}`}>
      <head>
        {/* WebSite Schema for Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KRN6QNRSFX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KRN6QNRSFX');
            `,
          }}
        />
        {/* Ahrefs Analytics */}
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="feHAts9QQBm4W+I9itRXzg" async></script>
        {/* Favicons handled by Next.js from /src/app/icon.png, favicon.ico, apple-icon.png */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9B2335" />
        <meta name="msapplication-TileColor" content="#9B2335" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <AdSenseScript />
        <ConditionalLayoutClient>
          {children}
        </ConditionalLayoutClient>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
