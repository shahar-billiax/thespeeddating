import { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();
  return {
    title: t("terms.title"),
    description: "Terms and Conditions for TheSpeedDating",
  };
}

export default async function TermsPage() {
  const { t } = await getTranslations();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("terms.title")}</h1>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p className="text-muted-foreground mb-8">
            <strong>Last updated:</strong> February 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using TheSpeedDating website and services, you accept and agree to be
              bound by these Terms and Conditions. If you do not agree to these terms, please do not
              use our services.
            </p>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the service
              after changes are posted constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Registration and Accounts</h2>
            <p>To use our services, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your information to keep it accurate and current</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept all responsibility for activity under your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that provide false information or
              violate these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Events and Bookings</h2>
            <p>
              <strong>Booking:</strong> When you book a ticket to an event, you enter into a binding
              agreement to attend that event. All bookings are subject to availability.
            </p>
            <p>
              <strong>Age Requirements:</strong> You must fall within the specified age range for each
              event. We reserve the right to verify ages and refuse entry to those outside the age
              range.
            </p>
            <p>
              <strong>Event Changes:</strong> We reserve the right to cancel or reschedule events due to
              circumstances beyond our control. In such cases, you'll receive a full refund or transfer
              to another event.
            </p>
            <p>
              <strong>Behavior:</strong> We expect all participants to behave respectfully and
              appropriately. We reserve the right to remove anyone who behaves inappropriately, without
              refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Payments and Pricing</h2>
            <p>
              All prices are displayed in GBP (£) for UK events and ILS (₪) for Israeli events. Prices
              include applicable taxes unless otherwise stated.
            </p>
            <p>
              Payment is required at the time of booking. We accept payment via credit/debit card
              through our secure payment processor (Stripe).
            </p>
            <p>
              Promotional codes and discounts cannot be combined unless explicitly stated. Promotional
              offers are subject to availability and may be withdrawn at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Cancellation and Refunds</h2>
            <p>
              <strong>User Cancellations:</strong> You may cancel your booking up to 48 hours before the
              event for a full refund. Cancellations made less than 48 hours before the event are
              non-refundable.
            </p>
            <p>
              <strong>Transfers:</strong> You may transfer your booking to another event (subject to
              availability) if you cannot attend. Transfer requests must be made at least 48 hours
              before the original event.
            </p>
            <p>
              <strong>No-Shows:</strong> Failure to attend an event without prior cancellation will
              result in forfeiture of your ticket price.
            </p>
            <p>
              <strong>Our Cancellations:</strong> If we cancel an event, you'll receive a full refund or
              the option to attend another event.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Our use of your personal data is governed by our Privacy
              Policy, which you should read in conjunction with these Terms.
            </p>
            <p>
              By using our service, you consent to the collection and use of your information as
              described in our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p>
              TheSpeedDating acts as an organizer of social events. We do not guarantee that you will
              meet compatible partners or receive any matches.
            </p>
            <p>
              While we verify participant registrations, we cannot guarantee the accuracy of information
              provided by participants. We are not responsible for the actions, conduct, or statements
              of event participants.
            </p>
            <p>
              We are not liable for any indirect, incidental, special, or consequential damages arising
              from your use of our services or attendance at events.
            </p>
            <p>
              Our total liability to you for any claims arising from or related to these terms or our
              services shall not exceed the amount you paid for the relevant event ticket.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
            <p>
              All content on TheSpeedDating website, including text, graphics, logos, images, and
              software, is the property of TheSpeedDating and is protected by copyright and intellectual
              property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works from, or publicly
              display any content from our website without prior written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Provide false or misleading information</li>
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated systems to access the service</li>
              <li>Collect or harvest information about other users</li>
            </ul>
            <p>Violation of these rules may result in termination of your account and legal action.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
            <p>
              We may update these Terms and Conditions from time to time. We will notify you of any
              material changes by posting the new terms on our website and updating the "Last updated"
              date.
            </p>
            <p>
              Your continued use of our services after changes are posted constitutes your acceptance of
              the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of
              England and Wales. Any disputes arising from these terms shall be subject to the exclusive
              jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
              <br />
              Email:{" "}
              <a href="mailto:info@thespeeddating.co.uk" className="text-primary hover:underline">
                info@thespeeddating.co.uk
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
