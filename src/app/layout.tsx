import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import ConditionalLayoutClient from "@/components/layout/ConditionalLayoutClient";
import "./globals.css";
import "@/styles/design-system.css";

// Revalidate every hour for ISR
export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    default: "Maryland Brewery Directory | Craft Breweries Across Maryland",
    template: "%s | Maryland Brewery Directory"
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
  metadataBase: new URL("https://www.marylandbrewery.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.marylandbrewery.com",
    siteName: "Maryland Brewery Directory",
    title: "Maryland Brewery Directory | Craft Breweries Across Maryland",
    description: "Discover the best craft breweries across Maryland. Find local breweries, events, and more.",
    // OG image is auto-generated from opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Maryland Brewery Directory | Craft Breweries Across Maryland",
    description: "Discover the best craft breweries across Maryland. Find local breweries, events, and more.",
    // Twitter image is auto-generated from twitter-image.tsx
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
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
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
      <body className="min-h-screen bg-gray-50 antialiased" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
        <ConditionalLayoutClient>
          {children}
        </ConditionalLayoutClient>
        <Analytics />
      </body>
    </html>
  );
}
