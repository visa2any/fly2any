/**
 * Logger Test Example
 *
 * This file demonstrates how the logger works in practice.
 * Run this file to see the logger output in your console.
 *
 * To test:
 * 1. Create a simple Next.js API route
 * 2. Import and use these examples
 * 3. Check your console for formatted output
 */

import { logger } from './logger';

/**
 * Test 1: Basic logging at different levels
 */
export function testBasicLogging() {
  console.log('\n=== Test 1: Basic Logging ===\n');

  logger.debug('This is a debug message');
  logger.info('This is an info message');
  logger.warn('This is a warning message');
  logger.error('This is an error message');
  logger.success('This is a success message');
}

/**
 * Test 2: Logging with context
 */
export function testLoggingWithContext() {
  console.log('\n=== Test 2: Logging with Context ===\n');

  logger.debug('User action', {
    userId: 'usr_123',
    action: 'search_flights',
    timestamp: new Date().toISOString()
  });

  logger.info('API request', {
    endpoint: '/api/flights/search',
    method: 'POST',
    duration: '234ms'
  });

  logger.warn('Cache approaching capacity', {
    used: '850MB',
    total: '1GB',
    percentage: '85%'
  });

  const mockError = new Error('Database connection failed');
  logger.error('Database error', mockError, {
    host: 'localhost',
    port: 5432,
    database: 'fly2any'
  });
}

/**
 * Test 3: Performance timing
 */
export async function testPerformanceTiming() {
  console.log('\n=== Test 3: Performance Timing ===\n');

  const timer = logger.startTimer('Simulated API request');

  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 100));

  timer.end({
    endpoint: '/api/flights',
    status: 200,
    resultCount: 42
  });
}

/**
 * Test 4: Log grouping
 */
export function testLogGrouping() {
  console.log('\n=== Test 4: Log Grouping ===\n');

  logger.group('Payment Processing');

  logger.debug('Step 1: Validate payment method');
  logger.debug('Step 2: Create payment intent');
  logger.debug('Step 3: Confirm payment');
  logger.success('Payment completed successfully');

  logger.groupEnd();
}

/**
 * Test 5: Emoji auto-selection
 */
export function testEmojiAutoSelection() {
  console.log('\n=== Test 5: Emoji Auto-Selection ===\n');

  logger.debug('Cache hit for flight data');
  logger.debug('Cache miss for hotel data');
  logger.debug('Database query executed');
  logger.debug('API request to Duffel');
  logger.debug('Payment processed via Stripe');
  logger.debug('Booking created successfully');
  logger.debug('Email sent to user');
  logger.debug('User authenticated via OAuth');
  logger.debug('Search query executed');
  logger.debug('Flight booking confirmed');
  logger.debug('Hotel reservation made');
  logger.debug('Car rental booked');
  logger.debug('Performance metrics collected');
}

/**
 * Test 6: Real-world scenario - Flight search
 */
export async function testFlightSearchScenario() {
  console.log('\n=== Test 6: Flight Search Scenario ===\n');

  const timer = logger.startTimer('Flight search operation');

  logger.group('Flight Search');

  try {
    // Step 1: Validate input
    logger.debug('Validating search parameters', {
      origin: 'LAX',
      destination: 'JFK',
      date: '2025-12-01',
      passengers: 2
    });

    // Step 2: Check cache
    logger.debug('Checking cache', {
      key: 'flight-search-LAX-JFK-2025-12-01'
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    logger.debug('Cache miss', {
      key: 'flight-search-LAX-JFK-2025-12-01'
    });

    // Step 3: Call API
    logger.debug('Calling Duffel API', {
      endpoint: '/air/offer_requests',
      provider: 'duffel'
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    logger.success('API request completed', {
      resultCount: 15,
      topPrice: '$299',
      provider: 'duffel'
    });

    // Step 4: Cache results
    logger.debug('Caching results', {
      key: 'flight-search-LAX-JFK-2025-12-01',
      ttl: '900s'
    });

    logger.success('Flight search completed successfully');

    logger.groupEnd();
    timer.end({
      resultCount: 15,
      source: 'api'
    });

    return { success: true, results: 15 };

  } catch (error) {
    logger.error('Flight search failed', error instanceof Error ? error : new Error(String(error)), {
      origin: 'LAX',
      destination: 'JFK'
    });

    logger.groupEnd();
    timer.end({ status: 'failed' });

    throw error;
  }
}

/**
 * Test 7: Real-world scenario - Payment processing
 */
export async function testPaymentScenario() {
  console.log('\n=== Test 7: Payment Processing Scenario ===\n');

  const timer = logger.startTimer('Payment processing');

  logger.group('Payment Processing');

  try {
    logger.info('Payment initiated', {
      amount: 499,
      currency: 'USD',
      bookingId: 'bkg_123',
      customerId: 'cus_456'
    });

    // Create payment intent
    logger.debug('Creating Stripe payment intent');
    await new Promise(resolve => setTimeout(resolve, 100));

    logger.debug('Payment intent created', {
      paymentIntentId: 'pi_789',
      status: 'requires_confirmation'
    });

    // Confirm payment
    logger.debug('Confirming payment');
    await new Promise(resolve => setTimeout(resolve, 150));

    logger.success('Payment succeeded', {
      paymentIntentId: 'pi_789',
      amount: 499,
      currency: 'USD'
    });

    logger.groupEnd();
    timer.end({ status: 'success' });

    return { success: true, paymentId: 'pi_789' };

  } catch (error) {
    logger.error('Payment processing failed', error instanceof Error ? error : new Error(String(error)), {
      amount: 499,
      currency: 'USD',
      bookingId: 'bkg_123'
    });

    logger.groupEnd();
    timer.end({ status: 'failed' });

    throw error;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         Fly2Any Logger - Test Suite                   ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  testBasicLogging();
  testLoggingWithContext();
  await testPerformanceTiming();
  testLogGrouping();
  testEmojiAutoSelection();
  await testFlightSearchScenario();
  await testPaymentScenario();

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         All Tests Completed!                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n');
}

/**
 * Usage in Next.js API route:
 *
 * // pages/api/test-logger.ts
 * import { runAllTests } from '@/lib/logger.test-example';
 *
 * export default async function handler(req, res) {
 *   await runAllTests();
 *   res.status(200).json({ message: 'Check console for logger output' });
 * }
 */

// For direct Node.js testing:
if (require.main === module) {
  runAllTests().catch(console.error);
}
