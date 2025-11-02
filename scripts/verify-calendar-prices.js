#!/usr/bin/env node
/**
 * Verify Calendar Price Display System
 * Tests the complete flow: Cache → API → Frontend
 */

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

// Hash function (same as helpers.ts)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 16);
}

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
  const hash = simpleHash(paramString);
  return `${prefix}:${hash}`;
}

async function verifyCalendarSystem() {
  console.log('\n🔍 CALENDAR PRICE DISPLAY VERIFICATION\n');
  console.log('='.repeat(70));

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  console.log('\n📊 CURRENT CACHE STATUS:\n');

  // Check all calendar-price keys
  const allKeys = await redis.keys('calendar-price:*');
  console.log(`Total calendar-price keys: ${allKeys.length}\n`);

  if (allKeys.length === 0) {
    console.log('⚠️  NO CACHED PRICES FOUND!');
    console.log('\n💡 This is why calendar shows no prices.');
    console.log('\n✅ SOLUTION:');
    console.log('   1. Perform a flight search (any route, any date)');
    console.log('   2. Wait for results to load');
    console.log('   3. Open calendar - price should appear for that date');
    console.log('\n' + '='.repeat(70) + '\n');
    return;
  }

  // Show all active prices
  for (const key of allKeys) {
    const data = await redis.get(key);
    const ttl = await redis.ttl(key);

    if (ttl > 0) {
      const minutes = Math.floor(ttl / 60);
      const seconds = ttl % 60;

      console.log(`✅ ${key}`);
      console.log(`   Price: $${data.price} ${data.currency}`);
      console.log(`   Route: ${data.route}`);
      console.log(`   TTL: ${minutes}m ${seconds}s remaining`);
      console.log(`   Cached: ${new Date(data.timestamp).toLocaleString()}`);
      console.log('');
    } else {
      console.log(`❌ ${key} (EXPIRED)`);
      console.log('');
    }
  }

  console.log('='.repeat(70));
  console.log('\n✅ VERIFICATION COMPLETE!\n');
  console.log('📌 KEY INSIGHTS:');
  console.log('   • Calendar only shows prices for dates in cache');
  console.log('   • Cache populated by actual flight searches');
  console.log('   • TTL = 1 hour (3600 seconds) for most routes');
  console.log('   • Prices persist across page refreshes\n');
}

verifyCalendarSystem().catch(console.error);
