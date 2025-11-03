/**
 * Real-world usage examples of the logger in Fly2Any
 * These examples show actual migration patterns from the codebase
 */

import { logger } from '@/lib/logger';

// ============================================================================
// Example 1: API Request/Response Logging
// ============================================================================

export async function searchFlights(searchParams: any) {
  const timer = logger.startTimer('Flight search');

  logger.group('Flight Search Operation');

  try {
    // Log the search initiation
    logger.info('Flight search initiated', {
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.date,
      passengers: searchParams.passengers
    });

    // Validate input
    logger.debug('Validating search parameters', searchParams);

    // Check cache first
    const cacheKey = `flight-search-${searchParams.origin}-${searchParams.destination}`;
    const cached = await checkCache(cacheKey);

    if (cached) {
      logger.debug('Cache hit', { key: cacheKey, age: cached.age });
      logger.groupEnd();
      timer.end({ source: 'cache', resultCount: cached.data.length });
      return cached.data;
    }

    logger.debug('Cache miss', { key: cacheKey });

    // Call external API
    logger.debug('Calling flight search API', {
      provider: 'duffel',
      endpoint: '/air/offer_requests'
    });

    const response = await fetch('/api/flights/search', {
      method: 'POST',
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const results = await response.json();

    logger.success('Flight search completed', {
      resultCount: results.length,
      topPrice: results[0]?.price,
      provider: 'duffel'
    });

    logger.groupEnd();
    timer.end({ source: 'api', resultCount: results.length });

    return results;
  } catch (error) {
    logger.error('Flight search failed', error, {
      origin: searchParams.origin,
      destination: searchParams.destination,
      provider: 'duffel'
    });

    logger.groupEnd();
    throw error;
  }
}

// ============================================================================
// Example 2: Cache Operations
// ============================================================================

export async function checkCache(key: string) {
  try {
    const value = await redis.get(key);

    if (value) {
      logger.debug('Cache hit', {
        key: key.substring(0, 50),
        size: value.length,
        type: 'redis'
      });
      return JSON.parse(value);
    }

    logger.debug('Cache miss', {
      key: key.substring(0, 50),
      type: 'redis'
    });

    return null;
  } catch (error) {
    logger.warn('Cache read failed, continuing without cache', {
      key: key.substring(0, 50),
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

export async function setCache(key: string, value: any, ttl: number = 3600) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
    logger.debug('Cache set', {
      key: key.substring(0, 50),
      ttl: `${ttl}s`,
      type: 'redis'
    });
  } catch (error) {
    logger.warn('Cache write failed', {
      key: key.substring(0, 50),
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// ============================================================================
// Example 3: Payment Processing
// ============================================================================

export async function processPayment(paymentData: {
  amount: number;
  currency: string;
  customerId: string;
  bookingId: string;
}) {
  const timer = logger.startTimer('Payment processing');

  logger.group('Payment Processing');

  try {
    logger.info('Payment initiated', {
      amount: paymentData.amount,
      currency: paymentData.currency,
      bookingId: paymentData.bookingId,
      // Never log full customer details
      customerId: paymentData.customerId
    });

    // Create payment intent
    logger.debug('Creating Stripe payment intent');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.amount,
      currency: paymentData.currency,
      customer: paymentData.customerId
    });

    logger.debug('Payment intent created', {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status
    });

    // Confirm payment
    logger.debug('Confirming payment');
    const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id);

    if (confirmed.status === 'succeeded') {
      logger.success('Payment succeeded', {
        paymentIntentId: confirmed.id,
        amount: confirmed.amount,
        bookingId: paymentData.bookingId
      });

      logger.groupEnd();
      timer.end({ status: 'success' });
      return confirmed;
    } else {
      logger.warn('Payment requires additional action', {
        paymentIntentId: confirmed.id,
        status: confirmed.status,
        nextAction: confirmed.next_action?.type
      });

      logger.groupEnd();
      timer.end({ status: 'requires_action' });
      return confirmed;
    }
  } catch (error) {
    logger.error('Payment processing failed', error, {
      amount: paymentData.amount,
      currency: paymentData.currency,
      bookingId: paymentData.bookingId,
      customerId: paymentData.customerId
    });

    logger.groupEnd();
    timer.end({ status: 'failed' });
    throw error;
  }
}

// ============================================================================
// Example 4: Database Operations
// ============================================================================

export async function createBooking(bookingData: any) {
  const timer = logger.startTimer('Database insert');

  try {
    logger.debug('Inserting booking into database', {
      userId: bookingData.userId,
      flightId: bookingData.flightId,
      passengers: bookingData.passengers.length
    });

    const result = await db.insert(bookings).values(bookingData);

    logger.success('Booking created in database', {
      bookingId: result[0].id,
      userId: bookingData.userId
    });

    timer.end({ operation: 'insert', rowCount: 1 });
    return result[0];
  } catch (error) {
    logger.error('Database insert failed', error, {
      table: 'bookings',
      userId: bookingData.userId,
      flightId: bookingData.flightId
    });

    timer.end({ operation: 'insert', status: 'failed' });
    throw error;
  }
}

// ============================================================================
// Example 5: Email Sending
// ============================================================================

export async function sendBookingConfirmation(booking: any) {
  try {
    logger.info('Sending booking confirmation email', {
      bookingId: booking.id,
      to: booking.email,
      template: 'booking-confirmation'
    });

    const result = await emailService.send({
      to: booking.email,
      subject: 'Your Fly2Any Booking Confirmation',
      template: 'booking-confirmation',
      data: booking
    });

    logger.success('Email sent successfully', {
      bookingId: booking.id,
      messageId: result.messageId,
      provider: 'aws-ses'
    });

    return result;
  } catch (error) {
    logger.error('Failed to send booking confirmation email', error, {
      bookingId: booking.id,
      to: booking.email,
      provider: 'aws-ses'
    });

    // Don't throw - email failure shouldn't fail the booking
    return null;
  }
}

// ============================================================================
// Example 6: Analytics Tracking
// ============================================================================

export async function logSearchAnalytics(searchData: any) {
  try {
    logger.debug('Logging search analytics', {
      origin: searchData.origin,
      destination: searchData.destination,
      userId: searchData.userId
    });

    const searchId = await db.insert(searchAnalytics).values({
      ...searchData,
      timestamp: new Date()
    });

    logger.debug('Search analytics logged', {
      searchId,
      origin: searchData.origin,
      destination: searchData.destination
    });

    return searchId;
  } catch (error) {
    // Analytics failures should never break the user flow
    logger.warn('Failed to log search analytics', {
      origin: searchData.origin,
      destination: searchData.destination,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

// ============================================================================
// Example 7: External API Integration
// ============================================================================

export async function fetchFromDuffel(endpoint: string, options: any = {}) {
  const timer = logger.startTimer(`Duffel API: ${endpoint}`);

  try {
    logger.debug('Calling Duffel API', {
      endpoint,
      method: options.method || 'GET'
    });

    const response = await fetch(`https://api.duffel.com${endpoint}`, {
      ...options,
      headers: {
        'Duffel-Version': 'v1',
        'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Duffel API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    logger.debug('Duffel API response received', {
      endpoint,
      status: response.status,
      dataSize: JSON.stringify(data).length
    });

    timer.end({ status: response.status });
    return data;
  } catch (error) {
    logger.error('Duffel API request failed', error, {
      endpoint,
      method: options.method || 'GET'
    });

    timer.end({ status: 'failed' });
    throw error;
  }
}

// ============================================================================
// Example 8: Rate Limiting
// ============================================================================

export async function checkRateLimit(userId: string): Promise<boolean> {
  try {
    const key = `rate-limit:${userId}`;
    const requests = await redis.incr(key);

    // Set expiry on first request
    if (requests === 1) {
      await redis.expire(key, 60); // 1 minute window
    }

    const limit = 100;

    if (requests > limit) {
      logger.warn('Rate limit exceeded', {
        userId,
        requests,
        limit,
        window: '60s'
      });
      return false;
    }

    if (requests > limit * 0.8) {
      logger.warn('Rate limit approaching', {
        userId,
        requests,
        limit,
        remaining: limit - requests
      });
    }

    logger.debug('Rate limit check passed', {
      userId,
      requests,
      limit,
      remaining: limit - requests
    });

    return true;
  } catch (error) {
    logger.error('Rate limit check failed', error, { userId });
    // Fail open - don't block users if rate limiting is broken
    return true;
  }
}

// ============================================================================
// Example 9: Background Jobs
// ============================================================================

export async function processAbandonedCarts() {
  const timer = logger.startTimer('Abandoned cart processing');

  logger.group('Abandoned Cart Processing Job');

  try {
    logger.info('Starting abandoned cart processing job');

    const abandonedCarts = await findAbandonedCarts();

    logger.info('Found abandoned carts', {
      count: abandonedCarts.length,
      threshold: '24 hours'
    });

    let processed = 0;
    let failed = 0;

    for (const cart of abandonedCarts) {
      try {
        logger.debug('Processing abandoned cart', {
          cartId: cart.id,
          userId: cart.userId,
          abandonedAt: cart.updatedAt
        });

        await sendAbandonedCartEmail(cart);
        processed++;

        logger.debug('Abandoned cart processed', { cartId: cart.id });
      } catch (error) {
        failed++;
        logger.warn('Failed to process abandoned cart', {
          cartId: cart.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    logger.success('Abandoned cart processing completed', {
      total: abandonedCarts.length,
      processed,
      failed
    });

    logger.groupEnd();
    timer.end({ processed, failed });
  } catch (error) {
    logger.error('Abandoned cart processing job failed', error);
    logger.groupEnd();
    timer.end({ status: 'failed' });
  }
}

// ============================================================================
// Example 10: WebSocket/Real-time Events
// ============================================================================

export function handleWebSocketConnection(socket: any, userId: string) {
  logger.info('WebSocket connection established', {
    userId,
    socketId: socket.id,
    transport: socket.conn.transport.name
  });

  socket.on('disconnect', (reason: string) => {
    logger.info('WebSocket disconnected', {
      userId,
      socketId: socket.id,
      reason,
      duration: socket.conn.upgrades?.length
    });
  });

  socket.on('error', (error: Error) => {
    logger.error('WebSocket error', error, {
      userId,
      socketId: socket.id
    });
  });

  socket.on('message', (data: any) => {
    logger.debug('WebSocket message received', {
      userId,
      socketId: socket.id,
      type: data.type,
      size: JSON.stringify(data).length
    });
  });
}

// ============================================================================
// Helper Examples (Not exported)
// ============================================================================

// Mock implementations for examples
const redis = {
  get: async (key: string) => null,
  set: async (key: string, value: string, ...args: any[]) => {},
  incr: async (key: string) => 1,
  expire: async (key: string, seconds: number) => {}
};

const stripe = {
  paymentIntents: {
    create: async (data: any) => ({ id: 'pi_123', status: 'requires_confirmation' }),
    confirm: async (id: string) => ({
      id,
      status: 'succeeded',
      amount: 0,
      next_action: undefined as any
    })
  }
};

const db = {
  insert: (table: any) => ({
    values: async (data: any) => [{ id: 'new-id', ...data }]
  })
};

const bookings = {};
const searchAnalytics = {};

const emailService = {
  send: async (data: any) => ({ messageId: 'msg_123' })
};

async function findAbandonedCarts() {
  return [];
}

async function sendAbandonedCartEmail(cart: any) {}
