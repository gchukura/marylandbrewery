import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/layout-utils';
import PageHero from '@/components/directory/PageHero';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for MarylandBrewery.com. Learn how we collect, use, and protect your personal information.',
  path: '/privacy-policy',
  keywords: ['privacy policy', 'data protection', 'user privacy'],
});

export default function PrivacyPolicyPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Privacy Policy', url: '/privacy-policy', isActive: true },
  ];

  return (
    <div className="bg-cream min-h-screen">
      <PageHero
        h1="Privacy Policy"
        introText="Your privacy is important to us. Learn how we collect, use, and protect your information."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-line p-8 space-y-6">
          <section>
            <p className="text-muted mb-4">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-muted mb-4">
              MarylandBrewery.com ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold text-ink mb-3">Information You Provide</h3>
            <p className="text-muted mb-3">We may collect information that you voluntarily provide to us, including:</p>
            <ul className="space-y-2 text-muted mb-4">
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Contact information (name, email address) when you use our contact form</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Brewery information when you submit a brewery for listing</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Reviews and comments you post on our site</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Newsletter subscription information</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-ink mb-3">Automatically Collected Information</h3>
            <p className="text-muted mb-3">When you visit our website, we may automatically collect certain information, including:</p>
            <ul className="space-y-2 text-muted">
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>IP address and browser type</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Pages visited and time spent on pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Referring website addresses</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Device information and operating system</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">How We Use Your Information</h2>
            <p className="text-muted mb-3">We use the information we collect to:</p>
            <ul className="space-y-2 text-muted">
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Provide, maintain, and improve our services</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Respond to your inquiries and requests</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Send you newsletters and updates (with your consent)</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Analyze website usage and trends</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Prevent fraud and ensure website security</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-muted mb-3">
              We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>
            <p className="text-muted mb-3">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Third-Party Services</h2>
            <p className="text-muted mb-3">
              We may use third-party services that collect, monitor, and analyze information, including:
            </p>
            <ul className="space-y-2 text-muted">
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Google Analytics:</strong> To analyze website traffic and usage patterns</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span><strong>Hosting Services:</strong> To host and operate our website</span>
              </li>
            </ul>
            <p className="text-muted mt-3">
              These third parties have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Data Security</h2>
            <p className="text-muted">
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Your Rights</h2>
            <p className="text-muted mb-3">You have the right to:</p>
            <ul className="space-y-2 text-muted">
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Access and receive a copy of your personal data</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Request correction of inaccurate personal data</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Request deletion of your personal data</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-red mr-2">•</span>
                <span>Opt-out of marketing communications</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Children's Privacy</h2>
            <p className="text-muted">
              Our website is not intended for children under the age of 21. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-ink mb-4">Changes to This Privacy Policy</h2>
            <p className="text-muted">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="bg-paper border border-line rounded-lg p-6">
            <h3 className="text-xl font-semibold text-ink mb-3">Contact Us</h3>
            <p className="text-muted mb-4">
              If you have any questions about this Privacy Policy, please contact us.
            </p>
            <a
              href="/contact"
              className="inline-block bg-brand-red text-white font-semibold px-6 py-2 rounded hover:bg-brand-red-dark transition-colors"
            >
              Contact Us
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

