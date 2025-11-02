#!/usr/bin/env node
/**
 * Test Complete Calendar Flow
 * Verifies: Redis cache → API endpoint → Response format
 */

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

// Recreate the hash function from helpers.ts
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

async function testCalendarFlow() {
  console.log('\n🧪 CALENDAR FLOW TEST\n');
  console.log('='.repeat(70));

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Test JFK → GRU for specific dates
  const testCases = [
    { origin: 'JFK', destination: 'GRU', date: '2025-11-05' },
    { origin: 'JFK', destination: 'GRU', date: '2025-11-06' },
    { origin: 'JFK', destination: 'GRU', date: '2025-11-11' },
    { origin: 'GRU', destination: 'JFK', date: '2025-11-05' }, // Return direction
    { origin: 'GRU', destination: 'JFK', date: '2025-11-11' }, // Return direction
  ];

  console.log('\n1️⃣ REDIS CACHE CHECK:\n');

  const cachedPrices = {};
  for (const testCase of testCases) {
    const key = generateCacheKey('calendar-price', testCase);
    const data = await redis.get(key);
    const ttl = await redis.ttl(key);

    if (data) {
      console.log(`✅ ${testCase.origin}→${testCase.destination} on ${testCase.date}`);
      console.log(`   Key: ${key}`);
      console.log(`   Data: ${JSON.stringify(data)}`);
      console.log(`   TTL: ${ttl}s (${Math.round(ttl/60)} minutes)\n`);
      cachedPrices[testCase.date] = data;
    } else {
      console.log(`❌ ${testCase.origin}→${testCase.destination} on ${testCase.date}: NOT FOUND`);
      console.log(`   Key: ${key}\n`);
    }
  }

  // Simulate what the API does
  console.log('\n2️⃣ API SIMULATION:\n');

  const pricesMap = {};
  const pricesData = [];

  for (const testCase of testCases) {
    const key = generateCacheKey('calendar-price', testCase);
    const cachedPrice = await redis.get(key);

    if (cachedPrice && cachedPrice.price) {
      // This is what the API does at line 145
      pricesMap[testCase.date] = cachedPrice.price;

      // This is what the API does at lines 133-144
      pricesData.push({
        type: 'flight-date',
        origin: testCase.origin,
        destination: testCase.destination,
        departureDate: testCase.date,
        price: {
          total: cachedPrice.price.toFixed(2),
          currency: cachedPrice.currency || 'USD',
        },
        cached: true,
        cachedAt: cachedPrice.timestamp,
      });
    }
  }

  console.log('📊 Prices Map (what API returns):', pricesMap);
  console.log('📊 Prices Map Keys:', Object.keys(pricesMap));
  console.log('📊 Prices Array Length:', pricesData.length);
  console.log('📊 First Item:', pricesData[0]);

  // Simulate API response
  const apiResponse = {
    data: pricesData,
    meta: {
      count: pricesData.length,
      route: 'JFK → GRU',
      source: 'cached-searches',
    },
    prices: pricesMap,
  };

  console.log('\n3️⃣ SIMULATED API RESPONSE:\n');
  console.log(JSON.stringify(apiResponse, null, 2));

  // Test what frontend would receive
  console.log('\n4️⃣ FRONTEND PARSING:\n');
  if (apiResponse.prices) {
    console.log('✅ Frontend would find data.prices');
    console.log('   Keys:', Object.keys(apiResponse.prices));
    console.log('   Values:', apiResponse.prices);
  } else {
    console.log('❌ Frontend would NOT find data.prices');
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Test complete!\n');
}

testCalendarFlow().catch(console.error);
