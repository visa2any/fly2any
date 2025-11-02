#!/usr/bin/env node
/**
 * 🎯 CALENDAR PRICE POPULATOR
 *
 * This script manually populates Redis with calendar prices for testing.
 * Simulates what happens after a real flight search completes.
 *
 * Usage: node scripts/populate-calendar-prices.js [route] [days]
 * Example: node scripts/populate-calendar-prices.js MIA-DXB 60
 */

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

console.log('\n🎯 CALENDAR PRICE POPULATOR\n');
console.log('='.repeat(80));

// Configuration from command line or defaults
const args = process.argv.slice(2);
const routeArg = args[0] || 'MIA-DXB';
const daysAhead = parseInt(args[1]) || 60;

const [origin, destination] = routeArg.split('-');

if (!origin || !destination) {
  console.error('❌ Invalid route format. Use: ORIGIN-DESTINATION (e.g., MIA-DXB)');
  process.exit(1);
}

console.log('\n📋 CONFIGURATION:');
console.log(`   Route: ${origin} → ${destination}`);
console.log(`   Days ahead: ${daysAhead}`);
console.log(`   TTL: 2 hours (7200 seconds)`);

// Simulate the generateCacheKey function (must match production!)
function generateCacheKey(prefix, params) {
  const sortedKeys = Object.keys(params).sort();

  const paramString = sortedKeys
    .map(key => {
      const value = params[key];
      if (value === undefined || value === null) return '';
      return `${key}=${JSON.stringify(value)}`;
    })
    .filter(Boolean)
    .join('&');

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 16);
  };

  const hash = simpleHash(paramString);
  return `${prefix}:${hash}`;
}

async function populateCalendarPrices() {
  // Initialize Redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('\n❌ ERROR: Redis credentials not found in .env.local');
    console.error('   Required: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN');
    process.exit(1);
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  console.log('\n✅ Connected to Redis (Upstash)');

  // Generate mock prices for the next N days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const TTL_SECONDS = 7200; // 2 hours (matches new V2 TTL)
  const BASE_PRICE = 500; // Base price in USD

  let forwardCount = 0;
  let reverseCount = 0;
  const errors = [];

  console.log('\n🔄 Populating calendar prices...\n');

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    // Generate realistic price variation (±20%)
    const priceVariation = (Math.random() - 0.5) * 0.4; // -20% to +20%
    const price = BASE_PRICE * (1 + priceVariation);

    // FORWARD direction (e.g., MIA → DXB)
    const forwardData = {
      price: Math.round(price * 100) / 100, // Round to 2 decimals
      currency: 'USD',
      timestamp: new Date().toISOString(),
      route: `${origin}-${destination}`,
      approximate: true,
      source: 'populate-script',
    };

    const forwardKey = generateCacheKey('calendar-price', {
      origin,
      destination,
      date: dateStr,
    });

    try {
      await redis.set(forwardKey, JSON.stringify(forwardData), { ex: TTL_SECONDS });
      forwardCount++;

      if (forwardCount <= 5 || forwardCount % 10 === 0) {
        console.log(`   ✈️  ${dateStr} (${origin}→${destination}): $${forwardData.price.toFixed(2)} → ${forwardKey}`);
      }
    } catch (error) {
      errors.push({ direction: 'forward', date: dateStr, error: error.message });
    }

    // REVERSE direction (e.g., DXB → MIA)
    // Use slightly different price for reverse (realistic)
    const reversePrice = price * (1 + (Math.random() - 0.5) * 0.1);

    const reverseData = {
      price: Math.round(reversePrice * 100) / 100,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      route: `${destination}-${origin}`,
      approximate: true,
      source: 'populate-script',
    };

    const reverseKey = generateCacheKey('calendar-price', {
      origin: destination,
      destination: origin,
      date: dateStr,
    });

    try {
      await redis.set(reverseKey, JSON.stringify(reverseData), { ex: TTL_SECONDS });
      reverseCount++;

      if (reverseCount <= 5 || reverseCount % 10 === 0) {
        console.log(`   🔄 ${dateStr} (${destination}→${origin}): $${reverseData.price.toFixed(2)} → ${reverseKey}`);
      }
    } catch (error) {
      errors.push({ direction: 'reverse', date: dateStr, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ POPULATION COMPLETE!\n');
  console.log('📊 STATISTICS:');
  console.log(`   Forward prices (${origin}→${destination}): ${forwardCount}`);
  console.log(`   Reverse prices (${destination}→${origin}): ${reverseCount}`);
  console.log(`   Total dates populated: ${Math.max(forwardCount, reverseCount)}`);
  console.log(`   Total cache entries: ${forwardCount + reverseCount}`);
  console.log(`   TTL: ${TTL_SECONDS / 60} minutes (${TTL_SECONDS / 3600} hours)`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ERRORS: ${errors.length}`);
    errors.slice(0, 5).forEach(e => {
      console.log(`   - ${e.direction} ${e.date}: ${e.error}`);
    });
    if (errors.length > 5) {
      console.log(`   ... and ${errors.length - 5} more`);
    }
  }

  console.log('\n📅 DATE RANGE:');
  const startDate = today.toISOString().split('T')[0];
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysAhead - 1);
  const endDateStr = endDate.toISOString().split('T')[0];
  console.log(`   From: ${startDate}`);
  console.log(`   To:   ${endDateStr}`);

  console.log('\n🧪 NEXT STEPS:');
  console.log('   1. Open http://localhost:3000');
  console.log(`   2. Fill in: ${origin} → ${destination}`);
  console.log('   3. Click the calendar icon');
  console.log(`   4. You should see prices for ~${daysAhead} dates!`);

  console.log('\n💡 TO TEST RETRIEVAL:');
  console.log(`   curl "http://localhost:3000/api/cheapest-dates?origin=${origin}&destination=${destination}&daysAhead=${daysAhead}"`);

  console.log('\n' + '='.repeat(80) + '\n');
}

populateCalendarPrices().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});
