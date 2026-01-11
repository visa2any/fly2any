/**
 * Payment Security Guard
 * 
 * CRITICAL: Enforces production-only payment configuration
 * Blocks test cards, test keys, and misconfigured payments
 */

export interface PaymentValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate Stripe key is production-ready
 * 
 * SECURITY: Test keys (sk_test_) will crash production
 * 
 * @returns Validation result
 */
export function validateStripeKey(): PaymentValidationResult {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production';

  if (!isProduction) {
    // Allow test keys in development
    return { valid: true };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return {
      valid: false,
      error: 'STRIPE_SECRET_KEY not set',
    };
  }

  // Block test keys in production
  if (stripeKey.startsWith('sk_test_')) {
    return {
      valid: false,
      error: 'Cannot use Stripe test key (sk_test_) in production. Use live key (sk_live_)',
    };
  }

  // Ensure live key is used
  if (!stripeKey.startsWith('sk_live_')) {
    return {
      valid: false,
      error: `Invalid Stripe key format. Expected sk_live_*, got ${stripeKey.substring(0, 10)}...`,
    };
  }

  return { valid: true };
}

/**
 * Check if test payments are enabled
 * 
 * SECURITY: Must be disabled in production
 * 
 * @returns Whether test payments are allowed
 */
export function areTestPaymentsEnabled(): boolean {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production';

  if (!isProduction) {
    return process.env.ENABLE_TEST_PAYMENTS === 'true';
  }

  // Never allow in production
  return false;
}

/**
 * Validate payment intent parameters
 * 
 * SECURITY: Block suspicious amounts and currencies
 * 
 * @param amount - Amount in cents
 * @param currency - Currency code (3 letters)
 * @returns Validation result
 */
export function validatePaymentIntent(
  amount: number,
  currency: string
): PaymentValidationResult {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production';

  // Block extremely small amounts (likely test payments)
  if (isProduction && amount < 100) {
    return {
      valid: false,
      error: 'Amount too small for production payment (minimum: $1.00)',
    };
  }

  // Block extremely large amounts (likely test or error)
  if (amount > 99999900) {
    return {
      valid: false,
      error: 'Amount exceeds maximum allowed ($999,999)',
    };
  }

  // Validate currency
  const validCurrencies = [
    'usd', 'eur', 'gbp', 'cad', 'aud', 
    'chf', 'sek', 'nok', 'dkk', 'pln',
  ];
  
  const lowerCurrency = currency.toLowerCase();
  
  if (!validCurrencies.includes(lowerCurrency)) {
    return {
      valid: false,
      error: `Invalid currency: ${currency}. Supported: ${validCurrencies.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Check if card number is a test card
 * 
 * SECURITY: Block test cards in production
 * 
 * @param cardNumber - Last 4 digits or full card number
 * @returns Whether it's a test card
 */
export function isTestCard(cardNumber: string): boolean {
  const testCardPatterns = [
    '4242', // Stripe test card
    '4000', // Declined card
    '5555', // Mastercard test
    '3782', // Amex test
  ];

  const cleanNumber = cardNumber.replace(/\s/g, '').replace(/-/g, '');
  
  return testCardPatterns.some(pattern => 
    cleanNumber.includes(pattern) || cleanNumber.startsWith(pattern)
  );
}

/**
 * Validate payment environment
 * 
 * CRITICAL: Call this on app startup
 * Crashes if payment configuration is invalid
 * 
 * @throws Error if configuration is invalid
 */
export function validatePaymentEnvironment(): void {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production';

  if (!isProduction) {
    console.log('ℹ️  Development mode - payment validation relaxed');
    return;
  }

  const errors: string[] = [];

  // Check Stripe key
  const stripeCheck = validateStripeKey();
  if (!stripeCheck.valid) {
    errors.push(stripeCheck.error || 'Invalid Stripe key');
  }

  // Check test payments flag
  if (process.env.ENABLE_TEST_PAYMENTS === 'true') {
    errors.push('ENABLE_TEST_PAYMENTS cannot be true in production');
  }

  // Check required payment providers
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY not set in production');
  }

  if (!process.env.DUFFEL_ACCESS_TOKEN) {
    errors.push('DUFFEL_ACCESS_TOKEN not set in production');
  }

  // Crash if any errors
  if (errors.length > 0) {
    console.error('\n╔══════════════════════════════════════════════════════════╗');
    console.error('║         CRITICAL PAYMENT CONFIGURATION ERRORS             ║');
    console.error('╚══════════════════════════════════════════════════════════╝\n');
    
    errors.forEach((err, i) => {
      console.error(`  ${i + 1}. ${err}`);
    });
    
    console.error('\n  Application CANNOT start without fixing these issues.\n');
    throw new Error('Payment validation failed: ' + errors.join('; '));
  }

  console.log('✅ Payment environment validation passed');
}

/**
 * Validate payment before processing
 * 
 * @param amount - Amount in cents
 * @param currency - Currency code
 * @param cardNumber - Optional card number for test card check
 * @returns Validation result
 */
export function validateBeforeProcessing(
  amount: number,
  currency: string,
  cardNumber?: string
): PaymentValidationResult {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production';

  // Check if test payments enabled
  if (isProduction && !areTestPaymentsEnabled()) {
    // Check for test cards
    if (cardNumber && isTestCard(cardNumber)) {
      return {
        valid: false,
        error: 'Test cards are not accepted in production',
      };
    }
  }

  // Validate payment intent
  const intentCheck = validatePaymentIntent(amount, currency);
  if (!intentCheck.valid) {
    return intentCheck;
  }

  return { valid: true };
}

// Auto-validate on module import in production
if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
  validatePaymentEnvironment();
}