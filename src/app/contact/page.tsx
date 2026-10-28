import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';
import PageHeader from '@/components/ui/PageHeader';
import ContactForm from '@/components/contact/ContactForm';
import RelatedLinks from '@/components/listing/RelatedLinks';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description:
    "Questions, corrections or a brewery to add? Contact the Maryland Brewery directory and we'll update the listing.",
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 pb-16 pt-6 sm:px-6">
      <PageHeader
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
        title="Contact us"
        intro="A question, a correction or a brewery we're missing? Send us a note and we'll get back to you."
      />
      <ContactForm />
      <RelatedLinks
        groups={[
          {
            title: 'Explore',
            links: [
              { label: 'Brewery map', href: '/map' },
              { label: 'Browse by city', href: '/cities' },
              { label: 'Browse by amenity', href: '/amenities' },
            ],
          },
        ]}
      />
    </div>
  );
}
