import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("privacy.title"),
    description: "Privacy Policy for TheSpeedDating - GDPR compliant",
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("privacy.title")}</h1>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-muted-foreground mb-8">
            <strong>Last updated:</strong> February 2026
          </p>

          <p className="mb-8">
            TheSpeedDating ("we", "us", "our") is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your information when you use
            our website and services.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Data We Collect</h2>

            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <p>When you register and use our services, we collect:</p>
            <ul>
              <li>Name, email address, date of birth</li>
              <li>Phone number (optional)</li>
              <li>Gender and gender preferences</li>
              <li>City and country of residence</li>
              <li>Profile information you choose to provide</li>
              <li>Event attendance and participation records</li>
              <li>Your match selections and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Payment Information</h3>
            <p>
              We use Stripe to process payments. We do not store your full credit card details on our
              servers. Stripe collects and processes payment information in accordance with their
              privacy policy.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Automatically Collected Information</h3>
            <ul>
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on our website</li>
              <li>Referring website addresses</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Data</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Process event bookings and payments</li>
              <li>Match you with other participants based on mutual interest</li>
              <li>Communicate with you about events, bookings, and matches</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our services and user experience</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns and trends</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Legal Basis for Processing</h2>
            <p>Under GDPR, we process your data based on:</p>
            <ul>
              <li>
                <strong>Contract:</strong> Processing necessary to fulfill our contract with you (e.g.,
                providing event services)
              </li>
              <li>
                <strong>Consent:</strong> You have given explicit consent for specific purposes (e.g.,
                marketing communications)
              </li>
              <li>
                <strong>Legitimate Interests:</strong> Processing necessary for our legitimate business
                interests (e.g., fraud prevention, service improvement)
              </li>
              <li>
                <strong>Legal Obligation:</strong> Processing required to comply with legal requirements
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>

            <h3 className="text-xl font-semibold mb-3">With Other Users</h3>
            <p>
              When you match with another participant, we share your contact information (name, email)
              with them so you can connect. This is a core part of our service.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">With Service Providers</h3>
            <p>We share data with trusted third-party service providers who help us operate:</p>
            <ul>
              <li>
                <strong>Supabase:</strong> Database and authentication services (data stored in EU
                region)
              </li>
              <li>
                <strong>Stripe:</strong> Payment processing
              </li>
              <li>
                <strong>Email service providers:</strong> For sending notifications and communications
              </li>
            </ul>
            <p>
              These providers are contractually obligated to protect your data and use it only for the
              purposes we specify.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to valid legal requests.</p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Business Transfers</h3>
            <p>
              If we are involved in a merger, acquisition, or sale of assets, your information may be
              transferred. You will be notified of any such change.
            </p>

            <p className="mt-4">
              <strong>We never sell your personal data to third parties.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Understand how you use our website</li>
              <li>Provide personalized content</li>
            </ul>
            <p>
              You can control cookie settings through your browser. Disabling cookies may affect website
              functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
            <p>We retain your data for as long as:</p>
            <ul>
              <li>Your account is active</li>
              <li>Needed to provide you services</li>
              <li>Required by law (e.g., tax records, payment information)</li>
              <li>Necessary for legitimate business purposes (e.g., fraud prevention)</li>
            </ul>
            <p>
              When you delete your account, we will delete or anonymize your personal data within 30
              days, except where we're legally required to retain it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Your Rights Under GDPR</h2>
            <p>You have the right to:</p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal data we hold about you
              </li>
              <li>
                <strong>Rectification:</strong> Request correction of inaccurate or incomplete data
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your personal data ("right to be
                forgotten")
              </li>
              <li>
                <strong>Restrict Processing:</strong> Request that we limit how we use your data
              </li>
              <li>
                <strong>Data Portability:</strong> Request your data in a machine-readable format
              </li>
              <li>
                <strong>Object:</strong> Object to processing based on legitimate interests or for direct
                marketing
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent at any time (where processing is
                based on consent)
              </li>
              <li>
                <strong>Complain:</strong> Lodge a complaint with a supervisory authority (ICO in the UK)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your data:</p>
            <ul>
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Staff training on data protection</li>
            </ul>
            <p>
              While we strive to protect your data, no method of transmission over the internet is 100%
              secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
            <p>
              Your data is primarily stored in the EU (via Supabase's EU region). If we transfer data
              outside the EU, we ensure appropriate safeguards are in place, such as Standard
              Contractual Clauses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
            <p>
              Our services are not intended for anyone under 18 years of age. We do not knowingly
              collect personal information from children. If you believe we have collected information
              from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by email or through a prominent notice on our website. Your continued use of our
              services after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact Us About Privacy</h2>
            <p>
              To exercise your rights or if you have questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p>
              <strong>Data Protection Contact:</strong>
              <br />
              Email:{" "}
              <a href="mailto:privacy@thespeeddating.co.uk" className="text-primary hover:underline">
                privacy@thespeeddating.co.uk
              </a>
              <br />
              <br />
              Please allow up to 30 days for us to respond to your request.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
