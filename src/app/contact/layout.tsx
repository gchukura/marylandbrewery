import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description: "Questions, corrections or a brewery to add? Contact the Maryland Brewery directory and we'll update the listing.",
  path: '/contact',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

