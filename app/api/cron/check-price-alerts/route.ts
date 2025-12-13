import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { getCached, setCache, generateFlightCacheKey } from '@/lib/cache';
import { amadeusAPI } from '@/lib/api/amadeus';
import { duffelAPI } from '@/lib/api/duffel';
import { sendPriceAlertEmail } from '@/lib/email/price-alert';
import { notifyTelegramAdmins } from '@/lib/notifications/notification-service';

/**
 * CRON JOB: Check Price Alerts
 *
 * Monitors active price alerts and triggers notifications when prices drop
 *
 * ARCHITECTURE:
 * 1. Cache-First Strategy: Check Redis cache before calling APIs (cost optimization)
 * 2. Fallback to API: Only call flight APIs if cache miss
 * 3. Batch Processing: Process alerts in batches to avoid timeouts
 * 4. Email Notifications: Send alerts when target price is reached
 *
 * SECURITY:
 * - Requires CRON_SECRET environment variable
 * - Only accessible via Vercel Cron or authorized requests
 *
 * SCHEDULE: Every 6 hours (configurable in vercel.json)
 */

const BATCH_SIZE = 50; // Process 50 alerts at a time
const CACHE_TTL = 21600; // 6 hours cache for price data

/**
 * Send Web Push notification to a specific user
 */
async function sendPushToUser(
  prisma: any,
  userId: string,
  payload: { title: string; body: string; url: string }
): Promise<boolean> {
  try {
    // Dynamically load web-push
    let webpush;
    try {
      webpush = require('web-push');
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          'mailto:support@fly2any.com',
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
      } else {
        return false; // VAPID not configured
      }
    } catch {
      return false; // web-push not installed
    }

    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (!subscriptions || subscriptions.length === 0) {
      return false; // No subscriptions
    }

    const pushPayload = JSON.stringify({
      ...payload,
      icon: '/logo.png',
      tag: `price-alert-${Date.now()}`,
      requireInteraction: true,
    });

    // Send to all user's devices
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            pushPayload
          );
          return true;
        } catch (error: any) {
          // Remove expired subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { endpoint: sub.endpoint },
            }).catch(() => null);
          }
          throw error;
        }
      })
    );

    return results.some(r => r.status === 'fulfilled');
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}

interface FlightPrice {
  price: number;
  currency: string;
  updatedAt: string;
}

/**
 * Fetch current flight price with cache-first strategy
 */
async function getCurrentPrice(
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string | null
): Promise<FlightPrice | null> {
  console.log(`🔍 Checking price for ${origin} → ${destination} on ${departDate}`);

  // STEP 1: Try cache first (COST OPTIMIZATION)
  const cacheKey = generateFlightCacheKey('search', {
    origin,
    destination,
    departureDate: departDate,
    returnDate: returnDate || undefined,
    adults: 1,
  });

  const cached = await getCached<any>(cacheKey);
  if (cached && cached.flights && cached.flights.length > 0) {
    console.log(`✅ CACHE HIT: Using cached price for ${origin} → ${destination}`);

    // Find cheapest flight
    const cheapest = cached.flights.reduce((min: any, flight: any) => {
      const price = parseFloat(String(flight.price?.total || '999999'));
      const minPrice = parseFloat(String(min.price?.total || '999999'));
      return price < minPrice ? flight : min;
    });

    return {
      price: parseFloat(String(cheapest.price?.total || '0')),
      currency: cheapest.price?.currency || 'USD',
      updatedAt: cached.cachedAt || new Date().toISOString(),
    };
  }

  console.log(`❌ CACHE MISS: Fetching from API for ${origin} → ${destination}`);

  // STEP 2: Cache miss - call API (fallback)
  try {
    // Try Amadeus first
    const amadeusOffers = await amadeusAPI.searchFlights({
      origin,
      destination,
      departureDate: departDate,
      returnDate: returnDate || undefined,
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: 'ECONOMY',
      nonStop: false,
      max: 5, // Limit to 5 for cost optimization (correct parameter name)
    });

    if (amadeusOffers && amadeusOffers.length > 0) {
      // Find cheapest offer with proper typing
      const cheapest = amadeusOffers.reduce((min: any, offer: any) => {
        const price = parseFloat(String(offer.price?.total || '999999'));
        const minPrice = parseFloat(String(min.price?.total || '999999'));
        return price < minPrice ? offer : min;
      });

      const result = {
        price: parseFloat(String(cheapest.price?.total || '0')),
        currency: cheapest.price?.currency || 'USD',
        updatedAt: new Date().toISOString(),
      };

      // Cache the result
      await setCache(cacheKey, {
        flights: amadeusOffers,
        cachedAt: result.updatedAt,
      }, CACHE_TTL);

      console.log(`💾 Cached price: $${result.price} for ${origin} → ${destination}`);
      return result;
    }

    // Fallback to Duffel if Amadeus fails
    console.log('⚠️ Amadeus returned no results, trying Duffel...');
    const duffelResponse = await duffelAPI.searchFlights({
      origin,
      destination,
      departureDate: departDate,
      returnDate: returnDate || undefined,
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'economy',
    });

    // Duffel returns { data: [], meta: {} } structure
    const duffelOffers = duffelResponse?.data || [];

    if (duffelOffers && duffelOffers.length > 0) {
      const cheapest = duffelOffers.reduce((min: any, offer: any) => {
        const price = parseFloat(String(offer.price?.total || '999999'));
        const minPrice = parseFloat(String(min.price?.total || '999999'));
        return price < minPrice ? offer : min;
      });

      const result = {
        price: parseFloat(String(cheapest.price?.total || '0')),
        currency: cheapest.price?.currency || 'USD',
        updatedAt: new Date().toISOString(),
      };

      // Cache the result
      await setCache(cacheKey, {
        flights: duffelOffers,
        cachedAt: result.updatedAt,
      }, CACHE_TTL);

      return result;
    }

    console.log(`❌ No prices found for ${origin} → ${destination}`);
    return null;
  } catch (error) {
    console.error(`Error fetching price for ${origin} → ${destination}:`, error);
    return null;
  }
}

/**
 * Process a batch of price alerts
 */
async function processBatch(alerts: any[], prisma: any): Promise<{
  processed: number;
  triggered: number;
  errors: number;
}> {
  let processed = 0;
  let triggered = 0;
  let errors = 0;

  for (const alert of alerts) {
    try {
      processed++;

      // Get current price (cache-first)
      const currentPriceData = await getCurrentPrice(
        alert.origin,
        alert.destination,
        alert.departDate,
        alert.returnDate
      );

      if (!currentPriceData) {
        console.log(`⚠️ Could not fetch price for alert ${alert.id}`);
        continue;
      }

      const currentPrice = currentPriceData.price;

      // Update current price in database
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: {
          currentPrice,
          lastChecked: new Date(),
        },
      });

      // Check if target price reached
      if (currentPrice <= alert.targetPrice && !alert.triggered) {
        console.log(`🎯 TARGET REACHED! Alert ${alert.id}: $${currentPrice} <= $${alert.targetPrice}`);

        // Mark as triggered
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            triggered: true,
            triggeredAt: new Date(),
            triggeredPrice: currentPrice,
          },
        });

        // Get user email
        const user = await prisma.user.findUnique({
          where: { id: alert.userId },
          select: { email: true, name: true },
        });

        if (user?.email) {
          const savings = (alert.currentPrice || alert.targetPrice) - currentPrice;

          // MULTI-CHANNEL NOTIFICATIONS
          const notifications = await Promise.allSettled([
            // 1. Email notification
            sendPriceAlertEmail({
              to: user.email,
              userName: user.name || 'Traveler',
              alert: {
                origin: alert.origin,
                destination: alert.destination,
                departDate: alert.departDate,
                returnDate: alert.returnDate,
                targetPrice: alert.targetPrice,
                currentPrice,
                currency: currentPriceData.currency,
                savings,
              },
            }),

            // 2. Telegram notification to admins
            notifyTelegramAdmins(`
💰 <b>PRICE DROP ALERT!</b>

✈️ <b>Route:</b> ${alert.origin} → ${alert.destination}
📅 <b>Date:</b> ${alert.departDate}${alert.returnDate ? ` - ${alert.returnDate}` : ''}

💵 <b>Current:</b> $${currentPrice.toFixed(2)}
🎯 <b>Target:</b> $${alert.targetPrice.toFixed(2)}
📉 <b>Savings:</b> $${savings.toFixed(2)}

👤 <b>User:</b> ${user.name || 'Anonymous'} (${user.email})
            `.trim()),

            // 3. Web Push notification (if user has subscription)
            sendPushToUser(prisma, alert.userId, {
              title: `💰 Price Drop: ${alert.origin} → ${alert.destination}`,
              body: `Now $${currentPrice.toFixed(2)} (was $${alert.targetPrice.toFixed(2)}) - Save $${savings.toFixed(2)}!`,
              url: `/flights/search?origin=${alert.origin}&destination=${alert.destination}&departDate=${alert.departDate}`,
            }),
          ]);

          const emailResult = notifications[0];
          const telegramResult = notifications[1];
          const pushResult = notifications[2];

          if (emailResult.status === 'fulfilled') {
            console.log(`✅ Email sent to ${user.email}`);
          }
          if (telegramResult.status === 'fulfilled') {
            console.log(`✅ Telegram notification sent`);
          }
          if (pushResult.status === 'fulfilled') {
            console.log(`✅ Push notification sent`);
          }

          triggered++;
        }
      } else {
        console.log(
          `📊 Alert ${alert.id}: Current $${currentPrice} vs Target $${alert.targetPrice} (${currentPrice > alert.targetPrice ? 'not yet' : 'already triggered'})`
        );
      }

      // Small delay between API calls to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing alert ${alert.id}:`, error);
      errors++;
    }
  }

  return { processed, triggered, errors };
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

/**
 * Verify Vercel cron or manual authentication
 */
function isAuthorized(request: NextRequest): boolean {
  // Method 1: Vercel cron (automatic) - sends x-vercel-cron: "1"
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  if (isVercelCron) return true;

  // Method 2: Manual trigger - uses Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isManualAuth = !!(cronSecret && authHeader === `Bearer ${cronSecret}`);

  return isManualAuth;
}

/**
 * GET /api/cron/check-price-alerts
 * Cron job endpoint to check all active price alerts
 *
 * Schedule: Every 4 hours (0 [star]/4 [star] [star] [star])
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Verify authentication (Vercel cron or manual)
  if (!isAuthorized(request)) {
    console.error('❌ Unauthorized cron request for price alerts');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  console.log('🚀 Starting price alert monitoring job...');

  try {
    const prisma = getPrismaClient();

    // Fetch all active, non-triggered alerts
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        active: true,
        triggered: false,
      },
      orderBy: {
        createdAt: 'asc', // Process oldest alerts first
      },
    });

    console.log(`📊 Found ${activeAlerts.length} active alerts to check`);

    if (activeAlerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active alerts to process',
        stats: {
          totalAlerts: 0,
          processed: 0,
          triggered: 0,
          errors: 0,
          duration: Date.now() - startTime,
        },
      });
    }

    // Process in batches
    let totalProcessed = 0;
    let totalTriggered = 0;
    let totalErrors = 0;

    for (let i = 0; i < activeAlerts.length; i += BATCH_SIZE) {
      const batch = activeAlerts.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(activeAlerts.length / BATCH_SIZE)}`);

      const { processed, triggered, errors } = await processBatch(batch, prisma);

      totalProcessed += processed;
      totalTriggered += triggered;
      totalErrors += errors;

      console.log(`✅ Batch complete: ${processed} processed, ${triggered} triggered, ${errors} errors`);
    }

    const duration = Date.now() - startTime;

    console.log(`\n🎉 Price alert monitoring completed!`);
    console.log(`   Total Alerts: ${activeAlerts.length}`);
    console.log(`   Processed: ${totalProcessed}`);
    console.log(`   Triggered: ${totalTriggered}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`   Duration: ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Price alert monitoring completed',
      stats: {
        totalAlerts: activeAlerts.length,
        processed: totalProcessed,
        triggered: totalTriggered,
        errors: totalErrors,
        duration,
        cacheUtilization: `Used cache-first strategy to minimize API costs`,
      },
    });
  } catch (error) {
    console.error('❌ Price alert monitoring failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process price alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/check-price-alerts
 * Manual trigger for testing
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
