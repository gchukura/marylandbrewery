import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Maryland Brewery Directory',
  description: 'Contact Maryland Brewery Directory with questions, suggestions, or brewery information updates. Help us keep Maryland\'s craft brewery directory accurate and comprehensive. We\'d love to hear from you!',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us - Maryland Brewery Directory',
    description: 'Contact Maryland Brewery Directory. Send us questions, suggestions, or brewery information updates.',
    url: 'https://www.marylandbrewery.com/contact',
    siteName: 'Maryland Brewery Directory',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maryland Brewery Directory - Contact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Maryland Brewery Directory',
    description: 'Contact Maryland Brewery Directory. Send us questions, suggestions, or brewery information updates.',
    images: ['/og-image.jpg'],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

