import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import "./globals.css";
import "@/styles/design-system.css";

// Revalidate every hour for ISR
export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    default: "Maryland Brewery Directory | Craft Breweries Across Maryland",
    template: "%s | Maryland Brewery Directory"
  },
  description: "Discover the best craft breweries across Maryland. Find breweries, events, and more in the Old Line State. Complete guide to Maryland's craft beer scene.",
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
  metadataBase: new URL("https://marylandbrewery.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://marylandbrewery.com",
    siteName: "Maryland Brewery Directory",
    title: "Maryland Brewery Directory | Craft Breweries Across Maryland",
    description: "Discover the best craft breweries across Maryland. Find breweries, events, and more in the Old Line State.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Maryland Brewery Directory - Craft Breweries Across Maryland",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maryland Brewery Directory | Craft Breweries Across Maryland",
    description: "Discover the best craft breweries across Maryland. Find breweries, events, and more in the Old Line State.",
    images: ["/og-image.jpg"],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#dc2626" />
        <meta name="msapplication-TileColor" content="#dc2626" />
      </head>
          <body className="min-h-screen bg-gray-50 font-sans antialiased">
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <div className="mt-auto">
                <NewsletterSignup />
                <Footer />
              </div>
            </div>
            <Analytics />
          </body>
    </html>
  );
}
