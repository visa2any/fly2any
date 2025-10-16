/**
 * Deal Score Algorithm Demo
 *
 * Interactive demonstration and testing of the Deal Score algorithm.
 * Run this file to see example calculations and understand how different
 * factors affect the overall score.
 *
 * Usage:
 * ```bash
 * npx ts-node lib/flights/dealScore.demo.ts
 * ```
 *
 * @module lib/flights/dealScore.demo
 */

import {
  calculateDealScore,
  batchCalculateDealScores,
  type DealScoreFactors,
} from './dealScore';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title: string) {
  log('\n' + '='.repeat(60), 'cyan');
  log(title, 'bright');
  log('='.repeat(60), 'cyan');
}

function printScore(label: string, score: ReturnType<typeof calculateDealScore>) {
  const tierColors: Record<string, keyof typeof colors> = {
    excellent: 'green',
    great: 'green',
    good: 'blue',
    fair: 'gray',
  };

  log(`\n${label}:`, 'bright');
  log(`  Total Score: ${score.total}/100`, tierColors[score.tier]);
  log(`  Tier: ${score.tier.toUpperCase()} - ${score.label}`, tierColors[score.tier]);
  log('\n  Component Breakdown:', 'yellow');
  log(`    Price:        ${score.components.price}/40  - ${score.explanations.price}`, 'gray');
  log(`    Duration:     ${score.components.duration}/15  - ${score.explanations.duration}`, 'gray');
  log(`    Stops:        ${score.components.stops}/15  - ${score.explanations.stops}`, 'gray');
  log(`    Time of Day:  ${score.components.timeOfDay}/10  - ${score.explanations.timeOfDay}`, 'gray');
  log(`    Reliability:  ${score.components.reliability}/10  - ${score.explanations.reliability}`, 'gray');
  log(`    Comfort:      ${score.components.comfort}/5   - ${score.explanations.comfort}`, 'gray');
  log(`    Availability: ${score.components.availability}/5   - ${score.explanations.availability}`, 'gray');
}

// Demo 1: Perfect Flight
header('Demo 1: Perfect Flight (High Score)');
log('A flight that excels in all categories', 'magenta');

const perfectFlight = calculateDealScore({
  priceVsMarket: -20,           // 20% below market
  duration: 360,                 // 6 hours
  stops: 0,                      // Non-stop
  departureTime: '2025-06-15T09:00:00Z',  // 9am departure
  arrivalTime: '2025-06-15T15:00:00Z',    // 3pm arrival
  onTimePerformance: 95,         // 95% on-time
  aircraftAge: 3,                // New aircraft
  seatAvailability: 25,          // Plenty of seats
  airlineRating: 4.8,            // Excellent airline
  layoverQuality: 5.0,           // N/A for non-stop
}, 360);

printScore('Perfect Flight', perfectFlight);

// Demo 2: Budget Flight
header('Demo 2: Budget Flight (Good Price, Some Compromises)');
log('Excellent price but longer duration and one stop', 'magenta');

const budgetFlight = calculateDealScore({
  priceVsMarket: -18,            // 18% below market
  duration: 540,                 // 9 hours
  stops: 1,                      // One stop
  departureTime: '2025-06-15T14:00:00Z',  // 2pm departure
  arrivalTime: '2025-06-15T23:00:00Z',    // 11pm arrival
  onTimePerformance: 82,         // Good reliability
  aircraftAge: 8,                // Average age
  seatAvailability: 8,           // Limited seats
  airlineRating: 3.5,            // Average airline
  layoverQuality: 3.0,           // Decent layover
}, 360);

printScore('Budget Flight', budgetFlight);

// Demo 3: Premium Flight
header('Demo 3: Premium Flight (Higher Price, Best Experience)');
log('Above market price but excellent in most other factors', 'magenta');

const premiumFlight = calculateDealScore({
  priceVsMarket: 10,             // 10% above market
  duration: 360,                 // 6 hours
  stops: 0,                      // Non-stop
  departureTime: '2025-06-15T08:00:00Z',  // 8am departure
  arrivalTime: '2025-06-15T14:00:00Z',    // 2pm arrival
  onTimePerformance: 92,         // Very reliable
  aircraftAge: 2,                // Brand new aircraft
  seatAvailability: 30,          // Many seats
  airlineRating: 4.9,            // Top airline
  layoverQuality: 5.0,           // N/A
}, 360);

printScore('Premium Flight', premiumFlight);

// Demo 4: Red-Eye Flight
header('Demo 4: Red-Eye Flight (Inconvenient Times)');
log('Good price but very inconvenient departure/arrival times', 'magenta');

const redEyeFlight = calculateDealScore({
  priceVsMarket: -12,            // 12% below market
  duration: 420,                 // 7 hours
  stops: 0,                      // Non-stop
  departureTime: '2025-06-15T23:30:00Z',  // 11:30pm departure
  arrivalTime: '2025-06-16T06:30:00Z',    // 6:30am arrival next day
  onTimePerformance: 88,         // Good reliability
  aircraftAge: 6,                // Decent age
  seatAvailability: 15,          // Good availability
  airlineRating: 4.0,            // Good airline
  layoverQuality: 5.0,           // N/A
}, 360);

printScore('Red-Eye Flight', redEyeFlight);

// Demo 5: Multi-Stop Economy
header('Demo 5: Multi-Stop Economy Flight');
log('Very cheap but multiple stops and long journey', 'magenta');

const multiStopFlight = calculateDealScore({
  priceVsMarket: -25,            // 25% below market
  duration: 840,                 // 14 hours
  stops: 2,                      // Two stops
  departureTime: '2025-06-15T06:00:00Z',  // 6am departure
  arrivalTime: '2025-06-15T20:00:00Z',    // 8pm arrival
  onTimePerformance: 75,         // Average reliability
  aircraftAge: 12,               // Older aircraft
  seatAvailability: 3,           // Very few seats
  airlineRating: 3.0,            // Average airline
  layoverQuality: 2.5,           // Poor layover airports
}, 360);

printScore('Multi-Stop Economy Flight', multiStopFlight);

// Demo 6: Last Minute Booking
header('Demo 6: Last Minute Booking (High Price, Low Availability)');
log('Expensive with very limited seats remaining', 'magenta');

const lastMinuteFlight = calculateDealScore({
  priceVsMarket: 25,             // 25% above market
  duration: 390,                 // 6.5 hours
  stops: 0,                      // Non-stop
  departureTime: '2025-06-15T10:00:00Z',  // 10am departure
  arrivalTime: '2025-06-15T16:30:00Z',    // 4:30pm arrival
  onTimePerformance: 90,         // Very reliable
  aircraftAge: 5,                // Modern aircraft
  seatAvailability: 1,           // Last seat!
  airlineRating: 4.5,            // Great airline
  layoverQuality: 5.0,           // N/A
}, 360);

printScore('Last Minute Booking', lastMinuteFlight);

// Demo 7: Batch Processing
header('Demo 7: Batch Processing Multiple Flights');
log('Demonstrating batch calculation with market context', 'magenta');

const flightsList = [
  {
    name: 'Flight A - Direct Premium',
    price: 550,
    factors: {
      duration: 360,
      stops: 0,
      departureTime: '2025-06-15T09:00:00Z',
      arrivalTime: '2025-06-15T15:00:00Z',
      onTimePerformance: 92,
      aircraftAge: 3,
      seatAvailability: 20,
      airlineRating: 4.7,
      layoverQuality: 5.0,
    },
  },
  {
    name: 'Flight B - Budget One-Stop',
    price: 380,
    factors: {
      duration: 480,
      stops: 1,
      departureTime: '2025-06-15T14:00:00Z',
      arrivalTime: '2025-06-15T22:00:00Z',
      onTimePerformance: 85,
      aircraftAge: 7,
      seatAvailability: 8,
      airlineRating: 3.8,
      layoverQuality: 3.5,
    },
  },
  {
    name: 'Flight C - Early Bird Special',
    price: 420,
    factors: {
      duration: 390,
      stops: 0,
      departureTime: '2025-06-15T06:00:00Z',
      arrivalTime: '2025-06-15T12:30:00Z',
      onTimePerformance: 88,
      aircraftAge: 5,
      seatAvailability: 15,
      airlineRating: 4.2,
      layoverQuality: 5.0,
    },
  },
  {
    name: 'Flight D - Multi-Stop Economy',
    price: 310,
    factors: {
      duration: 660,
      stops: 2,
      departureTime: '2025-06-15T11:00:00Z',
      arrivalTime: '2025-06-15T22:00:00Z',
      onTimePerformance: 78,
      aircraftAge: 10,
      seatAvailability: 5,
      airlineRating: 3.2,
      layoverQuality: 2.8,
    },
  },
];

log('\nInput Flights:', 'yellow');
flightsList.forEach((f, i) => {
  log(`  ${i + 1}. ${f.name} - $${f.price}`, 'gray');
});

const batchScores = batchCalculateDealScores(
  flightsList.map(f => ({ price: f.price, factors: f.factors }))
);

log('\nCalculated Scores (Sorted by Score):', 'yellow');
const sortedResults = flightsList
  .map((f, i) => ({ ...f, score: batchScores[i] }))
  .sort((a, b) => b.score.total - a.score.total);

sortedResults.forEach((result, i) => {
  const color = result.score.tier === 'excellent' || result.score.tier === 'great' ? 'green' :
                result.score.tier === 'good' ? 'blue' : 'gray';
  log(
    `  ${i + 1}. ${result.name.padEnd(30)} Score: ${result.score.total}/100 (${result.score.label})`,
    color
  );
});

// Demo 8: Missing Optional Data
header('Demo 8: Flight with Missing Optional Data');
log('Algorithm handles missing data gracefully with sensible defaults', 'magenta');

const minimalDataFlight = calculateDealScore({
  priceVsMarket: -10,            // 10% below market
  duration: 420,                 // 7 hours
  stops: 1,                      // One stop
  departureTime: '2025-06-15T13:00:00Z',
  arrivalTime: '2025-06-15T20:00:00Z',
  seatAvailability: 10,
  // No optional data provided
}, 360);

printScore('Minimal Data Flight', minimalDataFlight);

// Summary
header('Summary & Insights');
log('Key Takeaways:', 'bright');
log('  • Price is the most important factor (40/100 points)', 'cyan');
log('  • Non-stop flights have a significant advantage (15 points vs 8)', 'cyan');
log('  • Departure/arrival times matter - avoid red-eyes unless price compensates', 'cyan');
log('  • Algorithm works well even with missing optional data', 'cyan');
log('  • Batch processing automatically calculates market context', 'cyan');
log('\nScore Tiers:', 'bright');
log('  🏆 90-100: Excellent Deal (Top 10% - Feature prominently)', 'green');
log('  ✨ 75-89:  Great Deal (Strong recommendation)', 'green');
log('  👍 60-74:  Good Deal (Solid option)', 'blue');
log('  💼 0-59:   Fair Deal (Standard flight)', 'gray');
log('');

// Export for use in other files
export const demoFlights = {
  perfect: perfectFlight,
  budget: budgetFlight,
  premium: premiumFlight,
  redEye: redEyeFlight,
  multiStop: multiStopFlight,
  lastMinute: lastMinuteFlight,
  minimalData: minimalDataFlight,
  batch: sortedResults,
};
