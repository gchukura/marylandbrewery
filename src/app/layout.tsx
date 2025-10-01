import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maryland Brewery Directory",
  description: "Discover the best craft breweries across Maryland. Find breweries, events, and more in the Old Line State.",
  keywords: ["Maryland", "brewery", "craft beer", "brewing", "Maryland breweries"],
  authors: [{ name: "Maryland Brewery Directory" }],
  openGraph: {
    title: "Maryland Brewery Directory",
    description: "Discover the best craft breweries across Maryland",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maryland Brewery Directory",
    description: "Discover the best craft breweries across Maryland",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
