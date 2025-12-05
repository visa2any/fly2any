import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Fly2Any',
  description: 'Terms and Conditions for Fly2Any - Legal terms governing the use of our services',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-sm text-gray-600 mb-8">
            <strong>Effective Date:</strong> October 23, 2025<br />
            <strong>Last Updated:</strong> October 23, 2025
          </p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Fly2Any. By accessing or using our website, mobile application, or services (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, you may not use our Services.
              </p>
              <p className="text-gray-700">
                These Terms constitute a legally binding agreement between you and Fly2Any ("we," "our," or "us"). We reserve the right to modify these Terms at any time. Your continued use of the Services after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Services Description</h2>
              <p className="text-gray-700 mb-4">
                Fly2Any provides an online travel booking platform that allows users to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Search and compare flight prices from various airlines</li>
                <li>Book flights, hotels, car rentals, and travel packages</li>
                <li>Receive travel alerts, notifications, and updates via email and SMS</li>
                <li>Manage bookings and travel itineraries</li>
                <li>Access customer support and travel assistance</li>
              </ul>
              <p className="text-gray-700">
                We act as an intermediary between you and travel suppliers (airlines, hotels, etc.). We facilitate bookings but do not operate flights, hotels, or other travel services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Registration</h3>
              <p className="text-gray-700 mb-4">
                To use certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized account access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Requirements</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You may only create one account</li>
                <li>You may not share your account with others</li>
                <li>You may not transfer your account to another person</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our sole discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Bookings and Payments</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Booking Process</h3>
              <p className="text-gray-700 mb-4">
                When you make a booking through Fly2Any:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>You are making an offer to purchase travel services</li>
                <li>Prices are quoted in the currency displayed and may include taxes and fees</li>
                <li>Your booking is confirmed only upon receipt of payment and confirmation from the supplier</li>
                <li>You will receive a confirmation email with booking details</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Pricing</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Prices are subject to change until payment is completed</li>
                <li>We strive for pricing accuracy but errors may occur</li>
                <li>If a pricing error occurs, we will notify you and offer the option to proceed at the correct price or cancel</li>
                <li>Additional fees (baggage, seat selection, etc.) may apply and are charged by suppliers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Payment Methods</h3>
              <p className="text-gray-700 mb-4">
                We accept major credit cards, debit cards, and other payment methods as displayed during checkout. By providing payment information, you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Represent that you are authorized to use the payment method</li>
                <li>Authorize us to charge the full amount</li>
                <li>Agree that we may store payment information for future transactions (with your consent)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.4 Cancellations and Refunds</h3>
              <p className="text-gray-700">
                Cancellation and refund policies vary by supplier and fare type. Most bookings are subject to the supplier's terms and conditions. Please review the specific cancellation policy for your booking before completing your purchase. Some fares are non-refundable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Travel Documents and Requirements</h2>
              <p className="text-gray-700 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Obtaining valid passports, visas, and other travel documents</li>
                <li>Meeting health requirements (vaccinations, COVID-19 tests, etc.)</li>
                <li>Complying with customs, immigration, and security regulations</li>
                <li>Verifying travel restrictions and requirements for your destination</li>
                <li>Arriving at the airport/departure point with adequate time</li>
              </ul>
              <p className="text-gray-700">
                We are not responsible for your failure to obtain necessary documents or meet travel requirements.
              </p>
            </section>

            <section className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. SMS/Text Messaging Terms</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Program Overview</h3>
              <p className="text-gray-700 mb-4">
                Fly2Any offers SMS text messaging services to provide you with booking confirmations, flight updates, promotional offers, and other travel-related information. By opting in to our SMS program, you agree to these SMS-specific terms in addition to our general Terms and Conditions.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Consent to Receive SMS</h3>
              <p className="text-gray-700 mb-4">
                By providing your mobile phone number and opting in, you expressly consent to receive:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Transactional Messages:</strong> Booking confirmations, flight status updates, gate changes, cancellations, and customer service communications</li>
                <li><strong>Marketing Messages:</strong> Promotional offers, travel deals, price alerts, and other marketing communications (if you opt in separately)</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Important:</strong> Consent to receive SMS is not required as a condition of purchasing goods or services from Fly2Any. You can still book travel without opting in to SMS.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Message Frequency</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Transactional Messages:</strong> Frequency varies based on your bookings and flight changes (typically 2-10 messages per booking)</li>
                <li><strong>Marketing Messages:</strong> Up to 8 messages per month (if you opt in)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.4 Message and Data Rates</h3>
              <p className="text-gray-700 mb-4">
                Message and data rates may apply as determined by your mobile carrier. You are responsible for all charges from your carrier. Contact your carrier for details about your messaging plan.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.5 How to Opt-In</h3>
              <p className="text-gray-700 mb-4">
                You can opt in to SMS notifications by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Checking the SMS opt-in box during account registration or booking</li>
                <li>Texting <strong>JOIN</strong>, <strong>START</strong>, <strong>YES</strong>, or <strong>SUBSCRIBE</strong> to our SMS number</li>
                <li>Enabling SMS notifications in your account settings</li>
              </ul>
              <p className="text-gray-700 mb-4">
                After opting in, you will receive a confirmation message.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.6 How to Opt-Out</h3>
              <p className="text-gray-700 mb-4">
                You can opt out of SMS messages at any time by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Texting <strong>STOP</strong>, <strong>UNSUBSCRIBE</strong>, <strong>CANCEL</strong>, <strong>END</strong>, or <strong>QUIT</strong> to any Fly2Any SMS</li>
                <li>Disabling SMS notifications in your account settings</li>
                <li>Contacting customer support at support@fly2any.com or 1-332-220-0838</li>
              </ul>
              <p className="text-gray-700 mb-4">
                After opting out, you will receive one final confirmation message: <em>"You have successfully unsubscribed from Fly2Any SMS notifications. You will no longer receive messages from us. Reply JOIN to resubscribe."</em>
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Note:</strong> Opting out of marketing messages does not opt you out of transactional messages related to active bookings. To stop all messages, reply STOP.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.7 Help and Support</h3>
              <p className="text-gray-700 mb-4">
                For help with SMS messages, text <strong>HELP</strong> or <strong>INFO</strong> to any Fly2Any SMS. You will receive:
              </p>
              <p className="text-gray-700 mb-4 bg-white p-3 rounded border italic">
                "Fly2Any: For help, email support@fly2any.com or call 1-332-220-0838. Reply STOP to unsubscribe. Msg&Data rates may apply."
              </p>
              <p className="text-gray-700 mb-4">
                You can also contact:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>Email:</strong> support@fly2any.com</li>
                <li><strong>Phone:</strong> 1-332-220-0838</li>
                <li><strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.8 Supported Carriers</h3>
              <p className="text-gray-700 mb-4">
                Compatible carriers include (but are not limited to): AT&T, T-Mobile USA, Verizon Wireless, Sprint, Boost Mobile, Cricket Wireless, MetroPCS, U.S. Cellular, Virgin Mobile USA, and others.
              </p>
              <p className="text-gray-700 mb-4">
                Not all carriers are supported. Check with your carrier for SMS/text messaging service availability. We are not responsible for carrier-related delivery issues.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.9 SMS Message Examples</h3>
              <div className="bg-white p-4 rounded border space-y-3">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Opt-In Confirmation:</p>
                  <p className="text-gray-700 italic">"Welcome to Fly2Any SMS alerts! You'll receive booking confirmations, flight updates & deals. Msg&Data rates apply. Reply HELP for help, STOP to cancel."</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Booking Confirmation:</p>
                  <p className="text-gray-700 italic">"Fly2Any: Your flight JFK→LAX on Nov 14 is confirmed! Booking #FA12345. Check-in 24hrs before. View details: [link]"</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Flight Update:</p>
                  <p className="text-gray-700 italic">"Fly2Any: Flight AA2295 gate changed to B15. Boarding 10:45 AM. Have a great flight!"</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Promotional Offer:</p>
                  <p className="text-gray-700 italic">"Fly2Any: 20% OFF flights to Europe! Book by Nov 30. Use code EUROPE20. [link] Reply STOP to optout."</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Price Drop Alert:</p>
                  <p className="text-gray-700 italic">"Fly2Any: Price drop! NYC→Miami now $189 (was $259). Book now: [link]"</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.10 Message Delivery and Reliability</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>We will make reasonable efforts to deliver SMS messages, but cannot guarantee delivery</li>
                <li>Messages may be delayed due to carrier or technical issues</li>
                <li>We are not liable for failed, delayed, or misdirected messages</li>
                <li>Do not rely solely on SMS for time-sensitive information (e.g., gate changes)</li>
                <li>Check your email and the airline's website/app for the most current information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.11 SMS Data Collection and Use</h3>
              <p className="text-gray-700 mb-4">
                When you opt in to SMS, we collect and use:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your mobile phone number</li>
                <li>Opt-in/opt-out status and timestamps</li>
                <li>Message delivery status</li>
                <li>Responses to SMS messages</li>
              </ul>
              <p className="text-gray-700 mb-4">
                This information is used to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Deliver SMS notifications as requested</li>
                <li>Comply with TCPA and carrier requirements</li>
                <li>Improve our SMS program</li>
                <li>Provide customer support</li>
              </ul>
              <p className="text-gray-700 mb-4">
                For more details, see our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> (Section 3: SMS/Text Messaging Program).
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.12 SMS Compliance</h3>
              <p className="text-gray-700">
                Our SMS program complies with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li><strong>TCPA (Telephone Consumer Protection Act):</strong> We obtain express written consent before sending marketing messages</li>
                <li><strong>CTIA Messaging Principles and Best Practices:</strong> We follow industry standards for SMS marketing</li>
                <li><strong>Carrier Guidelines:</strong> We comply with AT&T, T-Mobile, Verizon, and other carrier requirements</li>
                <li><strong>The Campaign Registry (TCR):</strong> Our brand and campaigns are registered with TCR</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.13 SMS Restrictions</h3>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Use SMS services for any unlawful purpose</li>
                <li>Send spam, phishing attempts, or malicious content via reply messages</li>
                <li>Harass, threaten, or abuse our customer support staff via SMS</li>
                <li>Attempt to reverse engineer or interfere with our SMS systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.14 Changes to SMS Terms</h3>
              <p className="text-gray-700">
                We may update these SMS terms at any time. If we make material changes, we will notify you via SMS or email. Continued participation in the SMS program after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. User Conduct</h2>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Use the Services for any illegal purpose or in violation of any laws</li>
                <li>Impersonate any person or entity</li>
                <li>Transmit viruses, malware, or malicious code</li>
                <li>Interfere with or disrupt the Services or servers</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Scrape, harvest, or collect data from the Services without permission</li>
                <li>Use automated systems (bots, scrapers) to access the Services</li>
                <li>Reverse engineer or decompile any part of the Services</li>
                <li>Post false, misleading, or fraudulent content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Our Content</h3>
              <p className="text-gray-700 mb-4">
                All content on Fly2Any (text, graphics, logos, images, software) is owned by or licensed to us and is protected by copyright, trademark, and other intellectual property laws. You may not copy, reproduce, distribute, or create derivative works without our written permission.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 User Content</h3>
              <p className="text-gray-700 mb-4">
                If you submit content (reviews, photos, comments), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display that content in connection with our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services and Links</h2>
              <p className="text-gray-700">
                Our Services may contain links to third-party websites or integrate with third-party services (airlines, hotels, payment processors). We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>The content, accuracy, or practices of third-party sites</li>
                <li>Third-party terms and conditions or privacy policies</li>
                <li>Services provided by airlines, hotels, or other suppliers</li>
                <li>Delays, cancellations, or disruptions caused by suppliers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Disclaimers and Warranties</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 "As Is" Basis</h3>
              <p className="text-gray-700 mb-4">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 No Guarantees</h3>
              <p className="text-gray-700 mb-4">
                We do not warrant that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>The Services will be uninterrupted, secure, or error-free</li>
                <li>Information provided will be accurate or up-to-date</li>
                <li>Defects will be corrected</li>
                <li>The Services will meet your requirements</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Travel Supplier Responsibility</h3>
              <p className="text-gray-700">
                We are not responsible for acts, errors, omissions, representations, warranties, or negligence of airlines, hotels, or other suppliers, or for personal injury, death, property damage, or other damages resulting from them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>FLY2ANY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                <li>THIS INCLUDES LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION</li>
                <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM</li>
                <li>SOME JURISDICTIONS DO NOT ALLOW LIMITATION OF LIABILITY, SO THESE LIMITATIONS MAY NOT APPLY TO YOU</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless Fly2Any and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses (including attorney fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your failure to obtain required travel documents</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">13.1 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of [Your State/Country], without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">13.2 Arbitration</h3>
              <p className="text-gray-700 mb-4">
                Any dispute arising from these Terms or the Services shall be resolved through binding arbitration in accordance with the American Arbitration Association rules, except where prohibited by law.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">13.3 Class Action Waiver</h3>
              <p className="text-gray-700">
                You agree to resolve disputes on an individual basis only. You waive any right to participate in a class action lawsuit or class-wide arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Force Majeure</h2>
              <p className="text-gray-700">
                We are not liable for failure to perform our obligations due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, labor disputes, government actions, or technical failures.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Fly2Any regarding the use of our Services.
              </p>
            </section>

            <section className="mb-8 bg-gray-100 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions, concerns, or support regarding these Terms:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Fly2Any Legal Department</strong></p>
                <p><strong>Email:</strong> legal@fly2any.com</p>
                <p><strong>Customer Support:</strong> support@fly2any.com</p>
                <p><strong>Phone:</strong> 1-332-220-0838</p>
                <p className="mt-4"><strong>Mailing Address:</strong><br />
                Fly2Any Legal Department<br />
                [Your Business Address]<br />
                [City, State ZIP Code]<br />
                United States
                </p>
                <p className="mt-4"><strong>For SMS Support:</strong><br />
                Text HELP to any message or email support@fly2any.com
                </p>
              </div>
            </section>

            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8">
              <p className="text-sm text-blue-900">
                <strong>Last Updated:</strong> October 23, 2025<br />
                <strong>Version:</strong> 1.0<br />
                <strong>Compliance:</strong> TCPA, CAN-SPAM Act, CTIA Guidelines, and all applicable laws
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
