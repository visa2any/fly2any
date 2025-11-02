#!/usr/bin/env node
/**
 * 🔍 CACHE KEY DEBUG TOOL
 *
 * This script simulates both STORAGE and RETRIEVAL cache key generation
 * to identify why calendar prices aren't being found despite being cached.
 */

console.log('\n🔍 CACHE KEY GENERATION DEBUG\n');
console.log('='.repeat(80));

// Simulate the generateCacheKey function
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

// Test scenario from user's logs: MIA → DXB on Nov 20-30
const scenario = {
  origin: 'MIA',
  destination: 'DXB',
  departureDate: '2025-11-20',
  returnDate: '2025-11-30',
  today: '2025-11-02'
};

console.log('\n📋 TEST SCENARIO:');
console.log(`   Route: ${scenario.origin} → ${scenario.destination}`);
console.log(`   Search Date: ${scenario.departureDate} (Return: ${scenario.returnDate})`);
console.log(`   Today: ${scenario.today}`);
console.log('\n' + '='.repeat(80));

// ============================================================================
// PART 1: STORAGE SIMULATION (what gets CACHED)
// ============================================================================

console.log('\n📦 PART 1: STORAGE SIMULATION (Zero-Cost Crowdsourcing)\n');

const searchDate = new Date(scenario.departureDate);
const returnDate = new Date(scenario.returnDate);
const today = new Date(scenario.today);
const CALENDAR_WINDOW_DAYS = 15;

const storageCacheKeys = [];

// Simulate ±15 days caching for DEPARTURE
console.log(`🟢 Caching DEPARTURE prices (${scenario.origin}→${scenario.destination}):`);
for (let offset = -CALENDAR_WINDOW_DAYS; offset <= CALENDAR_WINDOW_DAYS; offset++) {
  if (offset === 0) continue; // Skip exact search date

  const calendarDate = new Date(searchDate);
  calendarDate.setDate(searchDate.getDate() + offset);

  // Skip past dates
  if (calendarDate < today) continue;

  const dateStr = calendarDate.toISOString().split('T')[0];

  const cacheKey = generateCacheKey('calendar-price', {
    origin: scenario.origin,
    destination: scenario.destination,
    date: dateStr,
  });

  storageCacheKeys.push({
    direction: 'departure',
    date: dateStr,
    key: cacheKey,
    route: `${scenario.origin}→${scenario.destination}`
  });
}

console.log(`   Cached ${storageCacheKeys.filter(k => k.direction === 'departure').length} departure dates`);

// Simulate ±15 days caching for RETURN
console.log(`\n🔵 Caching RETURN prices (${scenario.destination}→${scenario.origin}):`);
for (let offset = -CALENDAR_WINDOW_DAYS; offset <= CALENDAR_WINDOW_DAYS; offset++) {
  if (offset === 0) continue;

  const calendarDate = new Date(returnDate);
  calendarDate.setDate(returnDate.getDate() + offset);

  if (calendarDate < today) continue;

  const dateStr = calendarDate.toISOString().split('T')[0];

  const cacheKey = generateCacheKey('calendar-price', {
    origin: scenario.destination, // Note: reversed!
    destination: scenario.origin,  // Note: reversed!
    date: dateStr,
  });

  storageCacheKeys.push({
    direction: 'return',
    date: dateStr,
    key: cacheKey,
    route: `${scenario.destination}→${scenario.origin}`
  });
}

console.log(`   Cached ${storageCacheKeys.filter(k => k.direction === 'return').length} return dates`);
console.log(`\n   📊 TOTAL CACHED: ${storageCacheKeys.length} dates`);

// ============================================================================
// PART 2: RETRIEVAL SIMULATION (what calendar LOOKS FOR)
// ============================================================================

console.log('\n\n📬 PART 2: RETRIEVAL SIMULATION (Calendar Opening)\n');

const startDate = new Date(scenario.today);
const totalDays = 30;

const retrievalCacheKeys = [];

console.log(`🔎 Checking ${totalDays} days starting from ${scenario.today}:\n`);

for (let i = 0; i < totalDays; i++) {
  const checkDate = new Date(startDate);
  checkDate.setDate(startDate.getDate() + i);
  const dateStr = checkDate.toISOString().split('T')[0];

  // Forward direction (MIA→DXB)
  const forwardKey = generateCacheKey('calendar-price', {
    origin: scenario.origin,
    destination: scenario.destination,
    date: dateStr,
  });

  // Reverse direction (DXB→MIA)
  const reverseKey = generateCacheKey('calendar-price', {
    origin: scenario.destination,
    destination: scenario.origin,
    date: dateStr,
  });

  retrievalCacheKeys.push({
    date: dateStr,
    forwardKey,
    reverseKey,
  });
}

console.log(`   Generated ${retrievalCacheKeys.length} × 2 cache keys (forward + reverse)`);

// ============================================================================
// PART 3: COMPARISON (MATCHES & MISSES)
// ============================================================================

console.log('\n\n🎯 PART 3: CACHE KEY COMPARISON\n');

let forwardMatches = 0;
let reverseMatches = 0;
const matchDetails = [];

retrievalCacheKeys.forEach(retrieval => {
  const forwardMatch = storageCacheKeys.find(s => s.key === retrieval.forwardKey);
  const reverseMatch = storageCacheKeys.find(s => s.key === retrieval.reverseKey);

  if (forwardMatch) {
    forwardMatches++;
    matchDetails.push({
      date: retrieval.date,
      direction: 'FORWARD',
      route: forwardMatch.route,
      matched: true,
    });
  }

  if (reverseMatch) {
    reverseMatches++;
    matchDetails.push({
      date: retrieval.date,
      direction: 'REVERSE',
      route: reverseMatch.route,
      matched: true,
    });
  }
});

console.log('📊 MATCH RESULTS:\n');
console.log(`   ✅ Forward matches (${scenario.origin}→${scenario.destination}): ${forwardMatches} dates`);
console.log(`   ✅ Reverse matches (${scenario.destination}→${scenario.origin}): ${reverseMatches} dates`);
console.log(`   📊 Total unique dates found: ${matchDetails.length}`);

if (matchDetails.length > 0) {
  console.log('\n   Date breakdown:');
  matchDetails.slice(0, 10).forEach(m => {
    console.log(`      ${m.date} - ${m.direction} (${m.route})`);
  });
  if (matchDetails.length > 10) {
    console.log(`      ... and ${matchDetails.length - 10} more`);
  }
} else {
  console.log('\n   ❌ NO MATCHES FOUND! This is the problem!');
}

// ============================================================================
// PART 4: DETAILED ANALYSIS
// ============================================================================

console.log('\n\n🔬 PART 4: DETAILED ANALYSIS\n');

// Show sample cache keys
console.log('📝 Sample Cache Keys:\n');

const sampleStorageKey = storageCacheKeys[0];
console.log(`   STORAGE (${sampleStorageKey.date}):`);
console.log(`      Direction: ${sampleStorageKey.direction}`);
console.log(`      Route: ${sampleStorageKey.route}`);
console.log(`      Key: ${sampleStorageKey.key}`);

const sampleRetrievalDate = retrievalCacheKeys.find(r => r.date === sampleStorageKey.date);
if (sampleRetrievalDate) {
  console.log(`\n   RETRIEVAL (${sampleRetrievalDate.date}):`);
  console.log(`      Forward Key: ${sampleRetrievalDate.forwardKey}`);
  console.log(`      Reverse Key: ${sampleRetrievalDate.reverseKey}`);
  console.log(`\n   ✅ MATCH: ${sampleStorageKey.key === sampleRetrievalDate.forwardKey || sampleStorageKey.key === sampleRetrievalDate.reverseKey ? 'YES' : 'NO'}`);
} else {
  console.log(`\n   ⚠️  Date ${sampleStorageKey.date} not in retrieval window`);
}

// Check for date range overlap
const storedDates = storageCacheKeys.map(k => k.date).sort();
const retrievedDates = retrievalCacheKeys.map(k => k.date).sort();

console.log(`\n📅 Date Range Analysis:\n`);
console.log(`   Stored range: ${storedDates[0]} to ${storedDates[storedDates.length - 1]}`);
console.log(`   Retrieval range: ${retrievedDates[0]} to ${retrievedDates[retrievedDates.length - 1]}`);

const overlapStart = storedDates[0] > retrievedDates[0] ? storedDates[0] : retrievedDates[0];
const overlapEnd = storedDates[storedDates.length - 1] < retrievedDates[retrievedDates.length - 1]
  ? storedDates[storedDates.length - 1]
  : retrievedDates[retrievedDates.length - 1];

console.log(`   Overlap window: ${overlapStart} to ${overlapEnd}`);

const daysOverlap = Math.ceil((new Date(overlapEnd) - new Date(overlapStart)) / (1000 * 60 * 60 * 24)) + 1;
console.log(`   Expected overlap: ${daysOverlap} days`);

// ============================================================================
// VERDICT
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('🏁 VERDICT\n');

if (forwardMatches + reverseMatches === 0) {
  console.log('❌ CRITICAL ISSUE: Zero cache key matches despite overlap!');
  console.log('\n🔍 POSSIBLE CAUSES:');
  console.log('   1. Date string format mismatch (ISO vs local)');
  console.log('   2. Timezone issue causing date shift');
  console.log('   3. Airport code extraction difference (MIA vs Miami (MIA))');
  console.log('   4. Hash function producing different results for same params');
  console.log('\n💡 RECOMMENDATION:');
  console.log('   Add extensive logging to both storage AND retrieval endpoints');
  console.log('   to compare actual cache keys being generated in production.');
} else if (forwardMatches + reverseMatches < daysOverlap) {
  console.log(`⚠️  PARTIAL MATCHES: ${forwardMatches + reverseMatches}/${daysOverlap} expected dates found`);
  console.log('\n🔍 Investigation needed for missing matches.');
} else {
  console.log(`✅ WORKING AS EXPECTED: ${forwardMatches + reverseMatches}/${daysOverlap} dates matched!`);
  console.log('\n   If calendar still shows 0 dates, check:');
  console.log('   - Redis connection');
  console.log('   - TTL expiration (15 minutes for approximate prices)');
  console.log('   - Early exit logic (MAX_CONSECUTIVE_MISSES)');
}

console.log('\n' + '='.repeat(80) + '\n');
