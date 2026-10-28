import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import ContentPage from '@/components/layout/ContentPage';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy Policy',
  description:
    'Privacy policy for MarylandBrewery.com. Learn how we collect, use, and protect your personal information.',
  path: '/privacy-policy',
  keywords: ['privacy policy', 'data protection', 'user privacy'],
});

export default function PrivacyPolicyPage() {
  return (
    <ContentPage
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy', path: '/privacy-policy' },
      ]}
      title="Privacy Policy"
      intro="Your privacy is important to us. Learn how we collect, use, and protect your information."
    >
      <section>
        <p>
          <strong>Last updated:</strong> January 6, 2026
        </p>
        <p>
          MarylandBrewery.com ("we," "our," or "us") is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you visit our website.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <h3>Information You Provide</h3>
        <p>
          We may collect information that you voluntarily provide to us,
          including:
        </p>
        <ul>
          <li>
            Contact information (name, email address) when you use our contact
            form
          </li>
          <li>Brewery information when you submit a brewery for listing</li>
          <li>Reviews and comments you post on our site</li>
          <li>Newsletter subscription information</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <p>
          When you visit our website, we may automatically collect certain
          information, including:
        </p>
        <ul>
          <li>IP address and browser type</li>
          <li>Pages visited and time spent on pages</li>
          <li>Referring website addresses</li>
          <li>Device information and operating system</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Respond to your inquiries and requests</li>
          <li>Send you newsletters and updates (with your consent)</li>
          <li>Analyze website usage and trends</li>
          <li>Prevent fraud and ensure website security</li>
        </ul>
      </section>

      <section>
        <h2>Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on
          our website and store certain information. Cookies are files with a
          small amount of data that may include an anonymous unique identifier.
        </p>
        <p>
          You can instruct your browser to refuse all cookies or to indicate
          when a cookie is being sent. However, if you do not accept cookies,
          you may not be able to use some portions of our website.
        </p>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>
          We may use third-party services that collect, monitor, and analyze
          information, including:
        </p>
        <ul>
          <li>
            <strong>Google Analytics:</strong> To analyze website traffic and
            usage patterns
          </li>
          <li>
            <strong>Hosting Services:</strong> To host and operate our website
          </li>
        </ul>
        <p>
          These third parties have access to your information only to perform
          specific tasks on our behalf and are obligated not to disclose or use
          it for any other purpose.
        </p>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational security
          measures to protect your personal information. However, no method of
          transmission over the Internet or electronic storage is 100% secure,
          and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access and receive a copy of your personal data</li>
          <li>Request correction of inaccurate personal data</li>
          <li>Request deletion of your personal data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      </section>

      <section>
        <h2>Children's Privacy</h2>
        <p>
          Our website is not intended for children under the age of 21. We do
          not knowingly collect personal information from children. If you are a
          parent or guardian and believe your child has provided us with
          personal information, please contact us.
        </p>
      </section>

      <section>
        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the "Last Updated" date. You are advised to review this
          Privacy Policy periodically for any changes.
        </p>
      </section>

      <section className="rounded-panel bg-cream p-6">
        <h3>Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact
          us.
        </p>
        <a href="/contact" className={buttonVariants()}>
          Contact Us
        </a>
      </section>
    </ContentPage>
  );
}
