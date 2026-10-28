import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = createPageMetadata({
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for using MarylandBrewery.com. Read our terms of service and user agreement.',
  path: '/terms',
  keywords: ['terms of service', 'terms and conditions', 'user agreement'],
});

export default function TermsPage() {
  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Terms & Conditions', path: '/terms' },
      ]}
      title="Terms & Conditions"
      intro="Please read these terms and conditions carefully before using MarylandBrewery.com."
    >
      <section>
        <p>
          <strong>Last updated:</strong> October 28, 2026
        </p>
        <p>
          These Terms and Conditions ("Terms") govern your access to and use of
          MarylandBrewery.com (the "Website"). By accessing or using the
          Website, you agree to be bound by these Terms.
        </p>
      </section>

      <section>
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing or using MarylandBrewery.com, you acknowledge that you
          have read, understood, and agree to be bound by these Terms and all
          applicable laws and regulations. If you do not agree with any of these
          Terms, you are prohibited from using or accessing this Website.
        </p>
      </section>

      <section>
        <h2>Use License</h2>
        <p>
          Permission is granted to temporarily access and use
          MarylandBrewery.com for personal, non-commercial use only. This is the
          grant of a license, not a transfer of title, and under this license
          you may not:
        </p>
        <ul>
          <li>Modify or copy the materials</li>
          <li>
            Use the materials for any commercial purpose or for any public
            display
          </li>
          <li>
            Attempt to reverse engineer any software contained on the Website
          </li>
          <li>
            Remove any copyright or other proprietary notations from the
            materials
          </li>
        </ul>
      </section>

      <section>
        <h2>User Content</h2>
        <p>
          You may submit content to the Website, such as messages through our
          contact form and brewery information. By submitting content, you grant
          us a non-exclusive, royalty-free, perpetual license to use, modify,
          and display such content on the Website.
        </p>
        <p>You agree that you will not submit content that:</p>
        <ul>
          <li>Is false, misleading, or defamatory</li>
          <li>
            Violates any third party's rights, including intellectual property
            rights
          </li>
          <li>Contains spam, viruses, or other harmful code</li>
          <li>Is illegal, obscene, or offensive</li>
        </ul>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>
          The materials on MarylandBrewery.com are provided on an "as is" basis.
          We make no warranties, expressed or implied, and hereby disclaim and
          negate all other warranties including, without limitation:
        </p>
        <ul>
          <li>
            Implied warranties of merchantability or fitness for a particular
            purpose
          </li>
          <li>
            Warranties that the Website will be error-free or continuously
            available
          </li>
          <li>
            Warranties regarding the accuracy or completeness of information
          </li>
        </ul>
        <p>
          We do not warrant or make any representations concerning the accuracy,
          likely results, or reliability of the use of the materials on the
          Website or otherwise relating to such materials or on any sites linked
          to this Website.
        </p>
      </section>

      <section>
        <h2>Limitations of Liability</h2>
        <p>
          In no event shall MarylandBrewery.com or its suppliers be liable for
          any damages (including, without limitation, damages for loss of data
          or profit, or due to business interruption) arising out of the use or
          inability to use the materials on the Website, even if we or an
          authorized representative has been notified orally or in writing of
          the possibility of such damage.
        </p>
      </section>

      <section>
        <h2>Accuracy of Information</h2>
        <p>
          We strive to provide accurate and up-to-date information about
          Maryland breweries. However, we cannot guarantee the accuracy,
          completeness, or timeliness of all information on the Website. Brewery
          hours, menus, and other details may change without notice.
        </p>
        <p>
          We recommend contacting breweries directly to confirm information
          before visiting, especially for hours, events, and availability.
        </p>
      </section>

      <section>
        <h2>Links to Third-Party Websites</h2>
        <p>
          The Website may contain links to third-party websites. We are not
          responsible for the content, privacy policies, or practices of
          third-party websites. Your use of third-party websites is at your own
          risk.
        </p>
      </section>

      <section>
        <h2>Age Restrictions</h2>
        <p>
          This Website is intended for users who are 21 years of age or older.
          By using this Website, you represent that you are at least 21 years
          old. We do not knowingly collect information from individuals under
          21.
        </p>
      </section>

      <section>
        <h2>Modifications</h2>
        <p>
          We reserve the right to revise these Terms at any time without notice.
          By using this Website, you are agreeing to be bound by the then
          current version of these Terms. We encourage you to review these Terms
          periodically.
        </p>
      </section>

      <section>
        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the State of Maryland, without regard to its conflict of law
          provisions. Any disputes arising from these Terms or your use of the
          Website shall be subject to the exclusive jurisdiction of the courts
          in Maryland.
        </p>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Contact Us</h3>
        <p>
          If you have any questions about these Terms and Conditions, please
          contact us.
        </p>
        <a href="/contact" className={buttonVariants()}>
          Contact Us
        </a>
      </section>
    </ContentPage>
  );
}
