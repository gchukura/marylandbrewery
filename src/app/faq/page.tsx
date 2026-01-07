import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';

export const metadata: Metadata = createPageMetadata({
  title: 'Frequently Asked Questions',
  description: 'Common questions about Maryland breweries, craft beer, and using the Maryland Brewery Directory.',
  path: '/faq',
  keywords: ['Maryland brewery FAQ', 'brewery questions', 'craft beer Maryland'],
});

export default function FAQPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'FAQ', url: '/faq', isActive: true },
  ];

  const faqs = [
    {
      question: 'How do I find breweries near me?',
      answer: 'Use our interactive map at /map to find breweries by location. You can also browse by city or county to discover breweries in specific areas of Maryland.',
    },
    {
      question: 'Are the brewery hours accurate?',
      answer: 'We strive to keep hours up to date, but brewery hours can change. We recommend calling ahead or checking the brewery\'s website or social media for the most current hours, especially during holidays or special events.',
    },
    {
      question: 'How do I add or update brewery information?',
      answer: 'Brewery owners can contact us through our contact form or use the "Add Your Brewery" link in the footer. We welcome updates to keep our directory accurate.',
    },
    {
      question: 'Can I review breweries?',
      answer: 'Yes! We encourage honest, helpful reviews. Please see our Review Guidelines for best practices on writing effective reviews.',
    },
    {
      question: 'Is this site affiliated with the breweries listed?',
      answer: 'No, MarylandBrewery.com is an independent directory. We are not affiliated with any of the breweries listed. This site is for information purposes only.',
    },
    {
      question: 'How often is the directory updated?',
      answer: 'We regularly update our directory with new breweries, closures, and information changes. If you notice outdated information, please contact us.',
    },
    {
      question: 'Do you list all Maryland breweries?',
      answer: 'We strive to include all craft breweries in Maryland. If you know of a brewery that\'s not listed, please let us know through our contact form.',
    },
    {
      question: 'Can I use photos from this site?',
      answer: 'Photos are used with permission or from public sources. Please see our Photo Credits page for attribution information. For commercial use, please contact the original photographers.',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Frequently Asked Questions"
        introText="Find answers to common questions about Maryland breweries and using our directory."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Still Have Questions?</h3>
          <p className="text-gray-700 mb-4">
            Can't find what you're looking for? Contact us and we'll be happy to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#9B2335] text-white font-semibold px-6 py-2 rounded hover:bg-[#7A1C2A] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

