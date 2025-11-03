/**
 * Error Boundary Examples
 *
 * This file contains example implementations for wrapping different
 * components with error boundaries. Copy and adapt these examples
 * to your actual components.
 */

'use client';

import { ErrorBoundary } from './ErrorBoundary';

/**
 * Example 1: Wrap Search Form
 *
 * Use this pattern for the flight search form
 */
export function FlightSearchWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="section"
      context="flight-search"
      onError={(error) => {
        // Optional: Custom error handling
        console.error('Flight search error:', error);
        // Could send analytics event, show toast, etc.
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 2: Wrap Flight Results
 *
 * Use this pattern for the flight results page/component
 */
export function FlightResultsWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="section"
      context="flight-results"
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 3: Wrap Booking Flow
 *
 * Use this pattern for the booking checkout page
 * Full-page variant because booking is critical
 */
export function BookingFlowWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="full-page"
      context="booking-checkout"
      onError={(error, errorInfo) => {
        // Critical: Log booking errors
        console.error('Booking flow error:', {
          error,
          errorInfo,
          timestamp: new Date().toISOString(),
        });

        // TODO: Send alert to team for booking errors
        // sendSlackAlert('Booking error detected', error.message);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 4: Wrap Payment Form
 *
 * Use this pattern for Stripe payment form
 * Section variant since it's within the booking page
 */
export function PaymentFormWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="section"
      context="payment-form"
      onError={(error) => {
        // Critical: Payment errors need attention
        console.error('Payment error:', error);

        // TODO: Log to payment monitoring
        // logPaymentError(error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 5: Wrap Passenger Form
 *
 * Use this pattern for passenger details form
 */
export function PassengerFormWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="section"
      context="passenger-form"
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 6: Wrap Seat Selection
 *
 * Use this pattern for seat selection component
 */
export function SeatSelectionWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="section"
      context="seat-selection"
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 7: Wrap Small Widget (Inline)
 *
 * Use this pattern for small widgets, cards, or inline components
 */
export function WidgetWithErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="inline"
      context="widget"
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 8: Multiple Boundaries in a Page
 *
 * This shows how to use multiple error boundaries at different levels
 */
export function BookingPageExample() {
  return (
    <ErrorBoundary variant="full-page" context="booking-page">
      <div className="container mx-auto p-6">
        <h1>Complete Your Booking</h1>

        {/* Flight Details - separate boundary */}
        <ErrorBoundary variant="section" context="flight-details-summary">
          <FlightDetailsSummary />
        </ErrorBoundary>

        {/* Passenger Form - separate boundary */}
        <ErrorBoundary variant="section" context="passenger-form">
          <PassengerDetailsForm />
        </ErrorBoundary>

        {/* Seat Selection - separate boundary */}
        <ErrorBoundary variant="section" context="seat-selection">
          <SeatSelection />
        </ErrorBoundary>

        {/* Payment Form - separate boundary */}
        <ErrorBoundary variant="section" context="payment-form">
          <PaymentForm />
        </ErrorBoundary>

        {/* Price Summary - inline boundary */}
        <ErrorBoundary variant="inline" context="price-summary">
          <PriceSummary />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

/**
 * Example 9: With Custom Fallback
 *
 * Use this pattern when you want a custom error UI
 */
export function ComponentWithCustomError({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="section"
      context="custom-error-example"
      fallback={
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Temporarily Unavailable
          </h3>
          <p className="text-yellow-700 mb-4">
            This feature is temporarily unavailable. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Example 10: Async Data Loading with Error Boundary
 *
 * Pattern for components that load data asynchronously
 */
export function AsyncDataComponentExample() {
  return (
    <ErrorBoundary variant="section" context="async-data">
      <AsyncDataComponent />
    </ErrorBoundary>
  );
}

/**
 * Example 11: Third-Party Integration
 *
 * Wrap third-party components that might fail
 */
export function ThirdPartyIntegrationExample({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      variant="section"
      context="third-party-integration"
      fallback={
        <div className="text-center py-8 text-gray-600">
          <p>Unable to load third-party content.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Try Again
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Placeholder components for examples
function FlightDetailsSummary() {
  return <div>Flight Details</div>;
}

function PassengerDetailsForm() {
  return <div>Passenger Form</div>;
}

function SeatSelection() {
  return <div>Seat Selection</div>;
}

function PaymentForm() {
  return <div>Payment Form</div>;
}

function PriceSummary() {
  return <div>Price Summary</div>;
}

function AsyncDataComponent() {
  return <div>Async Data</div>;
}

/**
 * Example Usage in an Actual File:
 *
 * // In your app/flights/booking/page.tsx:
 * import { BookingFlowWithErrorBoundary } from '@/components/ErrorBoundaryExamples';
 * import { BookingCheckout } from '@/components/booking/BookingCheckout';
 *
 * export default function BookingPage() {
 *   return (
 *     <BookingFlowWithErrorBoundary>
 *       <BookingCheckout />
 *     </BookingFlowWithErrorBoundary>
 *   );
 * }
 *
 * // Or directly in the component:
 * import { ErrorBoundary } from '@/components/ErrorBoundary';
 *
 * export default function BookingPage() {
 *   return (
 *     <ErrorBoundary variant="full-page" context="booking-checkout">
 *       <BookingCheckout />
 *     </ErrorBoundary>
 *   );
 * }
 */
