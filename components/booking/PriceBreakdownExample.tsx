'use client';

import PriceBreakdown, { CompactPriceBreakdown } from './PriceBreakdown';

/**
 * Example Usage of PriceBreakdown Component
 *
 * This file demonstrates how to use the FTC-compliant PriceBreakdown component
 * in various scenarios.
 */

export function PriceBreakdownExamples() {
  // Calculate lock expiration time (15 minutes from now)
  const lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Price Breakdown Component Examples
      </h1>
      <p className="text-gray-600 mb-8">
        FTC-compliant price transparency component with countdown timer and price change indicators.
      </p>

      {/* Example 1: Full Component with Timer */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 1: Full Component with Price Lock Timer
        </h2>
        <PriceBreakdown
          basePrice={450.00}
          taxes={85.50}
          bookingFee={25.00}
          airlineFees={15.00}
          currency="USD"
          showLockTimer={true}
          lockExpiresAt={lockExpiresAt}
        />
      </section>

      {/* Example 2: With Price Drop */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 2: Price Drop Indicator (You're Saving!)
        </h2>
        <PriceBreakdown
          basePrice={420.00}
          taxes={82.00}
          bookingFee={25.00}
          airlineFees={15.00}
          currency="USD"
          showLockTimer={true}
          lockExpiresAt={lockExpiresAt}
          previousPrice={600.00} // Previous price was higher
        />
      </section>

      {/* Example 3: With Price Increase */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 3: Price Increase Alert (Book Now!)
        </h2>
        <PriceBreakdown
          basePrice={485.00}
          taxes={92.00}
          bookingFee={25.00}
          airlineFees={15.00}
          currency="USD"
          showLockTimer={true}
          lockExpiresAt={lockExpiresAt}
          previousPrice={550.00} // Previous price was lower
        />
      </section>

      {/* Example 4: Without Timer */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 4: Without Price Lock Timer
        </h2>
        <PriceBreakdown
          basePrice={450.00}
          taxes={85.50}
          bookingFee={25.00}
          airlineFees={15.00}
          currency="USD"
          showLockTimer={false}
        />
      </section>

      {/* Example 5: International Currency */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 5: International Currency (EUR)
        </h2>
        <PriceBreakdown
          basePrice={385.00}
          taxes={72.50}
          bookingFee={22.00}
          airlineFees={13.00}
          currency="EUR"
          showLockTimer={true}
          lockExpiresAt={lockExpiresAt}
        />
      </section>

      {/* Example 6: Compact Version */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 6: Compact Version (Mobile/Sidebar)
        </h2>
        <div className="max-w-md">
          <CompactPriceBreakdown
            basePrice={450.00}
            taxes={85.50}
            bookingFee={25.00}
            airlineFees={15.00}
            currency="USD"
            onClick={() => alert('Open full price breakdown')}
          />
        </div>
      </section>

      {/* Example 7: Low Fees Scenario */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 7: Low Fees Scenario (Budget Airline)
        </h2>
        <PriceBreakdown
          basePrice={199.00}
          taxes={35.00}
          bookingFee={15.00}
          airlineFees={8.00}
          currency="USD"
          showLockTimer={true}
          lockExpiresAt={lockExpiresAt}
        />
      </section>

      {/* Example 8: High Fees Scenario */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Example 8: Premium Flight (Higher Fees)
        </h2>
        <PriceBreakdown
          basePrice={1250.00}
          taxes={245.00}
          bookingFee={45.00}
          airlineFees={35.00}
          currency="USD"
          showLockTimer={true}
          lockExpiresAt={lockExpiresAt}
          previousPrice={1500.00}
        />
      </section>

      {/* Integration Instructions */}
      <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Integration Instructions
        </h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Basic Usage:</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`import PriceBreakdown from '@/components/booking/PriceBreakdown';

<PriceBreakdown
  basePrice={450.00}
  taxes={85.50}
  bookingFee={25.00}
  airlineFees={15.00}
  currency="USD"
  showLockTimer={true}
  lockExpiresAt={new Date(Date.now() + 15 * 60 * 1000)}
  previousPrice={600.00}
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Props:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="bg-gray-200 px-1 rounded">basePrice</code> - Base ticket price (required)</li>
              <li><code className="bg-gray-200 px-1 rounded">taxes</code> - Government taxes (required)</li>
              <li><code className="bg-gray-200 px-1 rounded">bookingFee</code> - Booking service fee (required)</li>
              <li><code className="bg-gray-200 px-1 rounded">airlineFees</code> - Airline-imposed fees (required)</li>
              <li><code className="bg-gray-200 px-1 rounded">currency</code> - Currency code (optional, default: "USD")</li>
              <li><code className="bg-gray-200 px-1 rounded">showLockTimer</code> - Show countdown timer (optional, default: true)</li>
              <li><code className="bg-gray-200 px-1 rounded">lockExpiresAt</code> - Timer expiration date (optional)</li>
              <li><code className="bg-gray-200 px-1 rounded">previousPrice</code> - Previous price for comparison (optional)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>✅ FTC Compliant (May 2025 regulations)</li>
              <li>✅ All fees shown upfront</li>
              <li>✅ Price lock countdown timer</li>
              <li>✅ Price change indicators (green/red)</li>
              <li>✅ Collapsible detail view</li>
              <li>✅ Interactive tooltips for fee explanations</li>
              <li>✅ Mobile responsive design</li>
              <li>✅ WCAG 2.1 AA accessible</li>
              <li>✅ "No Hidden Fees" trust badge</li>
              <li>✅ Price guarantee messaging</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Accessibility Features:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Proper ARIA labels and roles</li>
              <li>Keyboard navigation support</li>
              <li>Screen reader announcements for price changes</li>
              <li>Focus indicators on interactive elements</li>
              <li>Semantic HTML structure</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PriceBreakdownExamples;
