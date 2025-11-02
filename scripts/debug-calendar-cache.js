#!/usr/bin/env node
/**
 * Debug Calendar Cache System
 * Verifies that calendar prices are being cached and retrieved correctly
 */

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

// Recreate the same hash function from helpers.ts
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 16);
}

function generateCacheKey(prefix, params) {
  // Sort keys to ensure consistent ordering
  const sortedKeys = Object.keys(params).sort();

  // Build deterministic string from sorted params
  const paramString = sortedKeys
    .map(key => {
      const value = params[key];
      // Handle undefined/null
      if (value === undefined || value === null) {
        return '';
      }
      // Convert to string
      return `${key}=${JSON.stringify(value)}`;
    })
    .filter(Boolean)
    .join('&');

  const hash = simpleHash(paramString);
  return `${prefix}:${hash}`;
}

async function debugCalendarCache() {
  console.log('\n🔍 CALENDAR CACHE DEBUG REPORT\n');
  console.log('='.repeat(70));

  // Initialize Redis
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Test case: JFK → GRU on Nov 6, 2025
  const testParams = {
    origin: 'JFK',
    destination: 'GRU',
    date: '2025-11-06',
  };

  console.log('\n📊 Testing cache key generation:');
  console.log(`   Params: ${JSON.stringify(testParams)}`);

  const cacheKey = generateCacheKey('calendar-price', testParams);
  console.log(`   Generated key: ${cacheKey}`);

  // Check if this key exists in Redis
  console.log('\n🔍 Checking Redis for this key:');
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    console.log(`   ✅ FOUND! Data:`, cachedData);
  } else {
    console.log(`   ❌ NOT FOUND`);
  }

  // List all calendar-price keys in Redis
  console.log('\n📋 All calendar-price keys in Redis:');
  const allKeys = await redis.keys('calendar-price:*');

  if (allKeys.length === 0) {
    console.log('   ⚠️  NO calendar-price keys found in Redis!');
  } else {
    console.log(`   Found ${allKeys.length} keys:`);
    for (const key of allKeys.slice(0, 20)) {
      const data = await redis.get(key);
      const ttl = await redis.ttl(key);
      console.log(`   - ${key}`);
      console.log(`     TTL: ${ttl}s remaining`);
      console.log(`     Data: ${JSON.stringify(data).substring(0, 100)}...`);
    }
    if (allKeys.length > 20) {
      console.log(`   ... and ${allKeys.length - 20} more`);
    }
  }

  // Test a few more date variations to see if any match
  console.log('\n🧪 Testing date format variations:');
  const dateVariations = [
    '2025-11-06',
    '2025-11-6',  // Single digit day
    '11/6/2025',  // US format
    new Date('2025-11-06').toISOString().split('T')[0], // ISO format
  ];

  for (const dateVar of dateVariations) {
    const testKey = generateCacheKey('calendar-price', {
      origin: 'JFK',
      destination: 'GRU',
      date: dateVar,
    });
    const exists = await redis.exists(testKey);
    console.log(`   ${dateVar}: ${testKey} → ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('');
}

debugCalendarCache().catch(console.error);
