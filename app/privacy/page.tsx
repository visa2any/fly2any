import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Fly2Any',
  description: 'Privacy Policy for Fly2Any - How we collect, use, and protect your personal information',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective Date:</strong> October 23, 2025<br />
            <strong>Last Updated:</strong> October 23, 2025
          </p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Fly2Any ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us through SMS/text messaging.
              </p>
              <p className="text-gray-700">
                By using Fly2Any services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                <li><strong>Account Information:</strong> Username, password, and other registration details</li>
                <li><strong>Travel Information:</strong> Passport details, travel preferences, frequent flyer numbers</li>
                <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through payment processors)</li>
                <li><strong>Communication Data:</strong> Messages, feedback, and correspondence with us</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, search queries</li>
                <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                <li><strong>Cookies and Similar Technologies:</strong> We use cookies to enhance your experience</li>
              </ul>
            </section>

            <section className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. SMS/Text Messaging Program</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Program Description</h3>
              <p className="text-gray-700 mb-4">
                Fly2Any offers an SMS notification program to provide you with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Flight booking confirmations and updates</li>
                <li>Flight status alerts and gate changes</li>
                <li>Price drop notifications for saved searches</li>
                <li>Special promotions and travel deals</li>
                <li>Booking reminders and check-in notifications</li>
                <li>Customer support messages</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Consent and Opt-In</h3>
              <p className="text-gray-700 mb-4">
                By providing your phone number and opting in to our SMS program, you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Expressly consent to receive recurring automated marketing and transactional text messages from Fly2Any</li>
                <li>Acknowledge that consent is not required as a condition of purchase</li>
                <li>Understand that message frequency varies based on your activity and preferences</li>
                <li>Agree that message and data rates may apply as determined by your mobile carrier</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 How to Opt-In</h3>
              <p className="text-gray-700 mb-4">
                You can opt in to SMS notifications by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Checking the SMS opt-in box during booking or account registration</li>
                <li>Texting <strong>JOIN</strong> to our SMS number</li>
                <li>Updating your notification preferences in your account settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.4 How to Opt-Out</h3>
              <p className="text-gray-700 mb-4">
                You can opt out of SMS messages at any time by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Texting <strong>STOP</strong>, <strong>UNSUBSCRIBE</strong>, <strong>CANCEL</strong>, <strong>END</strong>, or <strong>QUIT</strong> to any message</li>
                <li>Replying <strong>STOP</strong> to any SMS from Fly2Any</li>
                <li>Updating your notification preferences in your account settings</li>
                <li>Contacting our customer support</li>
              </ul>
              <p className="text-gray-700 mb-4">
                After opting out, you will receive one final confirmation message, and no further marketing messages will be sent. You may still receive transactional messages related to active bookings.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.5 Help and Support</h3>
              <p className="text-gray-700 mb-4">
                For help with SMS messages, text <strong>HELP</strong> to any message, or contact:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Email:</strong> support@fly2any.com</li>
                <li><strong>Phone:</strong> 1-332-220-0838</li>
                <li><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.6 SMS Data Collection and Use</h3>
              <p className="text-gray-700 mb-4">
                When you participate in our SMS program, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your mobile phone number</li>
                <li>Mobile carrier information</li>
                <li>SMS delivery status and timestamps</li>
                <li>Responses and interactions with SMS messages</li>
              </ul>
              <p className="text-gray-700 mb-4">
                We use this information to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Deliver requested SMS notifications</li>
                <li>Improve message relevance and timing</li>
                <li>Comply with TCPA and carrier requirements</li>
                <li>Provide customer support</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.7 Supported Carriers</h3>
              <p className="text-gray-700 mb-4">
                Our SMS program supports major U.S. carriers including AT&T, T-Mobile, Verizon Wireless, Sprint, Boost Mobile, Cricket, MetroPCS, U.S. Cellular, Virgin Mobile, and others. Not all carriers are covered. Check with your carrier for availability.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.8 SMS Terms and Conditions</h3>
              <p className="text-gray-700">
                By participating in our SMS program, you also agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a>. We comply with the Telephone Consumer Protection Act (TCPA), CTIA messaging principles, and all applicable SMS regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information for:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Service Delivery:</strong> Process bookings, send confirmations, provide customer support</li>
                <li><strong>Communication:</strong> Send notifications, updates, and respond to inquiries</li>
                <li><strong>Personalization:</strong> Customize your experience, recommend relevant offers</li>
                <li><strong>Marketing:</strong> Send promotional emails and SMS (with your consent)</li>
                <li><strong>Analytics:</strong> Understand usage patterns, improve our services</li>
                <li><strong>Security:</strong> Detect fraud, protect against unauthorized access</li>
                <li><strong>Legal Compliance:</strong> Meet regulatory requirements, respond to legal requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing and Disclosure</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We share information with third-party service providers who perform services on our behalf, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Airlines, hotels, car rental companies, and other travel suppliers</li>
                <li>Payment processors and fraud prevention services</li>
                <li>SMS/text messaging platform providers (e.g., Twilio, Vonage)</li>
                <li>Email marketing services</li>
                <li>Analytics and advertising partners</li>
                <li>Cloud hosting providers</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Business Transfers</h3>
              <p className="text-gray-700 mb-4">
                If Fly2Any is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose your information when required by law, court order, or government request, or to protect our rights, property, or safety.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.4 With Your Consent</h3>
              <p className="text-gray-700">
                We may share information with your explicit consent for specific purposes not covered above.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                <li>Secure payment processing (PCI DSS compliant)</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-gray-700">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Typically:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Account information: Retained while your account is active, plus 7 years</li>
                <li>Booking data: Retained for 7 years after travel completion</li>
                <li>SMS opt-in records: Retained for regulatory compliance (minimum 4 years after opt-out)</li>
                <li>Marketing communications: Retained until you opt out or 2 years of inactivity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Privacy Rights</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Access and Correction</h3>
              <p className="text-gray-700 mb-4">
                You have the right to access and update your personal information through your account settings or by contacting us.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Deletion</h3>
              <p className="text-gray-700 mb-4">
                You can request deletion of your personal information, subject to legal retention requirements.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Opt-Out Rights</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Email Marketing:</strong> Click "unsubscribe" in any marketing email</li>
                <li><strong>SMS Marketing:</strong> Text STOP to opt out (see Section 3.4)</li>
                <li><strong>Cookies:</strong> Adjust your browser settings to refuse cookies</li>
                <li><strong>Interest-Based Advertising:</strong> Visit <a href="http://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aboutads.info/choices</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.4 State-Specific Rights</h3>
              <p className="text-gray-700 mb-4">
                If you are a California, Virginia, Colorado, Connecticut, or Utah resident, you may have additional privacy rights under state law. Contact us to exercise these rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers in compliance with applicable law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
              <p className="text-gray-700">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on our website and updating the "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8 bg-gray-100 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Fly2Any</strong></p>
                <p><strong>Email:</strong> privacy@fly2any.com</p>
                <p><strong>Phone:</strong> 1-800-FLY-2ANY (1-800-359-2269)</p>
                <p><strong>Mailing Address:</strong><br />
                Fly2Any Privacy Team<br />
                [Your Business Address]<br />
                [City, State ZIP Code]<br />
                United States
                </p>
                <p className="mt-4"><strong>For SMS/Text Messaging Support:</strong><br />
                Text HELP to any message or email support@fly2any.com
                </p>
              </div>
            </section>

            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This Privacy Policy complies with TCPA, CAN-SPAM Act, GDPR (where applicable), CCPA, and CTIA messaging principles. For SMS-specific terms, see Section 3 above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
