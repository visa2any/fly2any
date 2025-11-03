/**
 * Toast Notification Usage Examples
 *
 * This file demonstrates real-world usage patterns for the toast notification system.
 * These are reference examples and should be integrated into your actual components/API handlers.
 */

import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismissToast,
  handlePromiseToast,
} from './toast';
import { logError, logWarning, createContextLogger } from './errorLogger';

/**
 * EXAMPLE 1: Basic Flight Search Success
 * Shows success notification after user completes flight search
 */
export function exampleFlightSearchSuccess() {
  showSuccess('Found 48 flights! Cheapest option is $129 on Aug 15.', {
    duration: 5000,
  });
}

/**
 * EXAMPLE 2: Flight Search Error with Error Logging
 * Handles search failure with both toast and error logging
 */
export function exampleFlightSearchError(error: Error) {
  const errorId = logError(error, {
    context: 'flight-search',
    action: 'search-initiated',
  });

  showError(
    `Failed to search flights (Error ID: ${errorId}). Please try again.`,
    {
      duration: 6000,
    }
  );
}

/**
 * EXAMPLE 3: Booking with Promise Toast
 * Shows loading toast while booking flight, then success or error
 */
export async function exampleFlightBooking(flightId: string, userEmail: string) {
  try {
    await handlePromiseToast(
      fetch('/api/flights/book', {
        method: 'POST',
        body: JSON.stringify({ flightId, userEmail }),
      }).then((res) => {
        if (!res.ok) throw new Error('Booking failed');
        return res.json();
      }),
      {
        loading: 'Processing your booking...',
        success: 'Flight booked! Check your email for confirmation.',
        error: 'Booking failed. Please try again.',
      }
    );
  } catch (error) {
    const logger = createContextLogger('flight-booking');
    logger.error(error, { flightId, userEmail });
  }
}

/**
 * EXAMPLE 4: Price Drop Alert
 * Shows warning when selected flight price has increased
 */
export function examplePriceChangeWarning(oldPrice: number, newPrice: number) {
  const increase = newPrice - oldPrice;
  const percentage = Math.round((increase / oldPrice) * 100);

  showWarning(
    `Price increased by $${increase} (+${percentage}%) since you last viewed this flight`,
    {
      duration: 7000,
      position: 'top-right',
    }
  );
}

/**
 * EXAMPLE 5: Payment Processing
 * Long-running payment with loading toast
 */
export async function examplePaymentProcessing() {
  const loadingToastId = showLoading('Processing payment... This may take a moment.');

  try {
    const response = await fetch('/api/payment/process', {
      method: 'POST',
      body: JSON.stringify({ amount: 599, currency: 'USD' }),
    });

    dismissToast(loadingToastId as string);

    if (response.ok) {
      showSuccess('Payment successful! Your booking is confirmed.', {
        duration: 5000,
      });
    } else {
      throw new Error('Payment processing failed');
    }
  } catch (error) {
    dismissToast(loadingToastId as string);

    const errorId = logError(error, {
      context: 'payment-processing',
      action: 'process-payment',
    });

    showError(
      `Payment failed (Error ID: ${errorId}). Please contact support if the problem persists.`,
      {
        duration: 8000,
      }
    );
  }
}

/**
 * EXAMPLE 6: Hotel Booking Confirmation
 * Shows success with additional details
 */
export function exampleHotelBookingSuccess(hotelName: string, checkIn: string, nights: number) {
  showSuccess(
    `Booked ${hotelName} for ${nights} night(s) starting ${checkIn}. Confirmation sent to your email.`,
    {
      duration: 5000,
    }
  );
}

/**
 * EXAMPLE 7: Network Error Handling
 * Handles network failures gracefully
 */
export async function exampleNetworkErrorHandling(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    const logger = createContextLogger('api-request');
    const errorId = logger.error(error, {
      url,
      action: 'fetch-data',
    });

    if (error instanceof TypeError && error.message.includes('fetch')) {
      showError('No internet connection. Please check your connection and try again.', {
        duration: 7000,
      });
    } else {
      showError(
        `Failed to load data (Error ID: ${errorId}). Please try again or contact support.`,
        {
          duration: 6000,
        }
      );
    }

    throw error;
  }
}

/**
 * EXAMPLE 8: Form Submission with Validation
 * Shows warning for invalid input before submission
 */
export async function exampleFormSubmission(formData: Record<string, unknown>) {
  if (!formData.email) {
    showWarning('Please enter a valid email address');
    return;
  }

  if (!formData.departureDate) {
    showWarning('Please select a departure date');
    return;
  }

  try {
    await handlePromiseToast(
      fetch('/api/user/preferences', {
        method: 'POST',
        body: JSON.stringify(formData),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to save preferences');
        return res.json();
      }),
      {
        loading: 'Saving your preferences...',
        success: 'Preferences saved successfully!',
        error: 'Failed to save preferences. Please try again.',
      }
    );
  } catch (error) {
    logError(error, {
      context: 'preference-save',
      formData: formData, // Be careful with sensitive data
    });
  }
}

/**
 * EXAMPLE 9: Notification for New Features
 * Shows info toast about new features or updates
 */
export function exampleNewFeatureAnnouncement() {
  showInfo('New: You can now compare prices across multiple airlines! Try it now.', {
    duration: 8000,
    position: 'top-right',
  });
}

/**
 * EXAMPLE 10: Multi-Step Process with Warnings
 * Handles warnings during a multi-step booking process
 */
export async function exampleMultiStepBooking() {
  try {
    // Step 1: Select flight
    const flight = { id: 'FL123', price: 299, carrier: 'Airline A' };
    showSuccess(`Selected ${flight.carrier} flight ($${flight.price})`);

    // Step 2: Check for alternative options
    const hasCheckerPassenger = true;
    if (hasCheckerPassenger) {
      showWarning(
        'One passenger has a name mismatch. Please verify before continuing.',
        {
          duration: 6000,
        }
      );
      // User would review and continue...
    }

    // Step 3: Process payment (with loading toast)
    const bookingPromise = fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ flightId: flight.id }),
    }).then((res) => {
      if (!res.ok) throw new Error('Booking failed');
      return res.json();
    });

    const result = await handlePromiseToast(bookingPromise, {
      loading: 'Completing your booking...',
      success: 'Booking confirmed! Your confirmation number is in your email.',
      error: 'Booking failed. Please try again or contact support.',
    });

    return result;
  } catch (error) {
    const logger = createContextLogger('multi-step-booking');
    logger.error(error, { step: 'payment' });
  }
}

/**
 * EXAMPLE 11: Session Timeout Warning
 * Warns user when session is about to expire
 */
export function exampleSessionTimeoutWarning(minutesRemaining: number) {
  showWarning(
    `Your session will expire in ${minutesRemaining} minutes. Please save your work.`,
    {
      duration: 0, // Don't auto-dismiss
      position: 'top-center',
    }
  );
}

/**
 * EXAMPLE 12: Async Error with Retry
 * Shows error toast with context for debugging
 */
export async function exampleAsyncErrorWithContext() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('/api/expensive-operation', {
      method: 'POST',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    showSuccess('Operation completed successfully!');
  } catch (error) {
    const logger = createContextLogger('expensive-operation');

    if (error instanceof Error && error.message.includes('timeout')) {
      logger.warning('Operation timed out', {
        timeout: 30000,
        action: 'expensive-operation',
      });

      showWarning(
        'Operation took longer than expected. Your request might still be processing.'
      );
    } else {
      const errorId = logger.error(error, {
        action: 'expensive-operation',
        timestamp: Date.now(),
      });

      showError(
        `Operation failed (Error ID: ${errorId}). Please try again later.`
      );
    }
  }
}

// ============================================================================
// Integration Patterns
// ============================================================================

/**
 * Pattern 1: React Hook for Toast + Error Logging
 * Use this pattern in your React components
 *
 * @example
 * ```tsx
 * function BookFlightButton() {
 *   const handleBook = useCallback(async () => {
 *     try {
 *       await handlePromiseToast(bookFlight(), {
 *         loading: 'Booking...',
 *         success: 'Booked!',
 *         error: 'Failed to book'
 *       });
 *     } catch (error) {
 *       logError(error, { context: 'book-button' });
 *     }
 *   }, []);
 *
 *   return <button onClick={handleBook}>Book Flight</button>;
 * }
 * ```
 */

/**
 * Pattern 2: API Route Handler Integration
 * Use in your Next.js API routes
 *
 * @example
 * ```ts
 * // app/api/flights/book/route.ts
 * export async function POST(request: Request) {
 *   try {
 *     const data = await request.json();
 *     // Process booking...
 *     return NextResponse.json({ success: true });
 *   } catch (error) {
 *     logError(error, {
 *       context: 'api-book-flight',
 *       path: '/api/flights/book',
 *     });
 *     return NextResponse.json({ error: 'Failed to book' }, { status: 500 });
 *   }
 * }
 * ```
 */

/**
 * Pattern 3: Form Submission Handler
 * Use with form submissions
 *
 * @example
 * ```tsx
 * async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 *   e.preventDefault();
 *   const formData = new FormData(e.currentTarget);
 *
 *   try {
 *     await handlePromiseToast(
 *       fetch('/api/subscribe', {
 *         method: 'POST',
 *         body: formData,
 *       }),
 *       {
 *         loading: 'Subscribing...',
 *         success: 'Successfully subscribed!',
 *         error: 'Failed to subscribe. Please try again.',
 *       }
 *     );
 *   } catch (error) {
 *     logError(error, { context: 'subscribe-form' });
 *   }
 * }
 * ```
 */
