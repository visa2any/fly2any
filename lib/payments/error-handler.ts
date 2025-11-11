/**
 * Payment Error Handler
 *
 * Maps Stripe error codes to user-friendly messages and provides
 * retry logic for transient errors.
 */

export interface PaymentError {
  code: string;
  message: string;
  type: string;
  statusCode: number;
  retryable: boolean;
  userMessage?: string;
}

/**
 * Map Stripe errors to user-friendly messages
 */
export function mapStripeError(error: any): PaymentError {
  const mappedError: PaymentError = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    type: error.type || 'api_error',
    statusCode: 500,
    retryable: false,
  };

  // Handle Stripe card errors
  if (error.type === 'StripeCardError' || error.code?.startsWith('card_')) {
    mappedError.statusCode = 400;
    mappedError.retryable = false;

    switch (error.code) {
      case 'card_declined':
        mappedError.userMessage = 'Your card was declined. Please try a different payment method.';
        break;
      case 'expired_card':
        mappedError.userMessage = 'Your card has expired. Please use a different payment method.';
        break;
      case 'insufficient_funds':
        mappedError.userMessage = 'Insufficient funds. Please try a different payment method.';
        break;
      case 'processing_error':
        mappedError.userMessage = 'Processing error. Please try again.';
        mappedError.retryable = true;
        break;
      default:
        mappedError.userMessage = 'Card error. Please try a different payment method.';
    }
  }
  // Handle rate limits
  else if (error.type === 'StripeRateLimitError') {
    mappedError.statusCode = 429;
    mappedError.retryable = true;
    mappedError.userMessage = 'Too many requests. Please wait and try again.';
  }
  // Handle API errors
  else if (error.type === 'StripeAPIError' || error.type === 'StripeConnectionError') {
    mappedError.statusCode = 503;
    mappedError.retryable = true;
    mappedError.userMessage = 'Payment service temporarily unavailable. Please try again.';
  }

  return mappedError;
}

export function isRetryableError(error: any): boolean {
  return mapStripeError(error).retryable;
}

export function getUserFriendlyMessage(error: any): string {
  const mapped = mapStripeError(error);
  return mapped.userMessage || mapped.message || 'An error occurred';
}
