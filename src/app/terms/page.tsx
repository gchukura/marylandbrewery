import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';

export const metadata: Metadata = createPageMetadata({
  title: 'Terms & Conditions',
  description: 'Terms and conditions for using MarylandBrewery.com. Read our terms of service and user agreement.',
  path: '/terms',
  keywords: ['terms of service', 'terms and conditions', 'user agreement'],
});

export default function TermsPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Terms & Conditions', url: '/terms', isActive: true },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Terms & Conditions"
        introText="Please read these terms and conditions carefully before using MarylandBrewery.com."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
          <section>
            <p className="text-gray-700 mb-4">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-700 mb-4">
              These Terms and Conditions ("Terms") govern your access to and use of MarylandBrewery.com (the "Website"). By accessing or using the Website, you agree to be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing or using MarylandBrewery.com, you acknowledge that you have read, understood, and agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any of these Terms, you are prohibited from using or accessing this Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
            <p className="text-gray-700 mb-3">
              Permission is granted to temporarily access and use MarylandBrewery.com for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Modify or copy the materials</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Use the materials for any commercial purpose or for any public display</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Attempt to reverse engineer any software contained on the Website</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Remove any copyright or other proprietary notations from the materials</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Content</h2>
            <p className="text-gray-700 mb-3">
              You may submit content to the Website, including reviews, comments, and brewery information. By submitting content, you grant us a non-exclusive, royalty-free, perpetual license to use, modify, and display such content on the Website.
            </p>
            <p className="text-gray-700 mb-3">You agree that you will not submit content that:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Is false, misleading, or defamatory</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Violates any third party's rights, including intellectual property rights</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Contains spam, viruses, or other harmful code</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Is illegal, obscene, or offensive</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-700 mb-3">
              The materials on MarylandBrewery.com are provided on an "as is" basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Implied warranties of merchantability or fitness for a particular purpose</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Warranties that the Website will be error-free or continuously available</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#9B2335] mr-2">•</span>
                <span>Warranties regarding the accuracy or completeness of information</span>
              </li>
            </ul>
            <p className="text-gray-700 mt-3">
              We do not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on the Website or otherwise relating to such materials or on any sites linked to this Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations of Liability</h2>
            <p className="text-gray-700">
              In no event shall MarylandBrewery.com or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy of Information</h2>
            <p className="text-gray-700 mb-3">
              We strive to provide accurate and up-to-date information about Maryland breweries. However, we cannot guarantee the accuracy, completeness, or timeliness of all information on the Website. Brewery hours, menus, and other details may change without notice.
            </p>
            <p className="text-gray-700">
              We recommend contacting breweries directly to confirm information before visiting, especially for hours, events, and availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Links to Third-Party Websites</h2>
            <p className="text-gray-700">
              The Website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of third-party websites. Your use of third-party websites is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Age Restrictions</h2>
            <p className="text-gray-700">
              This Website is intended for users who are 21 years of age or older. By using this Website, you represent that you are at least 21 years old. We do not knowingly collect information from individuals under 21.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications</h2>
            <p className="text-gray-700">
              We reserve the right to revise these Terms at any time without notice. By using this Website, you are agreeing to be bound by the then current version of these Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the State of Maryland, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Website shall be subject to the exclusive jurisdiction of the courts in Maryland.
            </p>
          </section>

          <section className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h3>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us.
            </p>
            <a
              href="/contact"
              className="inline-block bg-[#9B2335] text-white font-semibold px-6 py-2 rounded hover:bg-[#7A1C2A] transition-colors"
            >
              Contact Us
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

