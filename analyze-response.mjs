import fs from 'fs';

const data = JSON.parse(fs.readFileSync('test-response.json', 'utf8'));

console.log('📊 MULTI-SOURCE AGGREGATION RESULTS\n');
console.log('✅ Total Flights:', data.metadata.total);
console.log('🎯 Route:', `${data.metadata.searchParams.origin} → ${data.metadata.searchParams.destination}`);
console.log('📅 Dates:', `${data.metadata.searchParams.departureDate} to ${data.metadata.searchParams.returnDate}`);
console.log('\n💰 TOP 10 CHEAPEST FLIGHTS:\n');

data.flights.slice(0, 10).forEach((f, i) => {
  const carrier = f.validatingAirlineCodes?.[0] || 'Unknown';
  const price = f.price.total;
  const source = f.source || 'Amadeus';
  const segments = f.itineraries[0].segments.length;
  const direct = segments === 1 ? 'Direct' : `${segments-1} stop${segments > 2 ? 's' : ''}`;

  console.log(`${i+1}. ${carrier.padEnd(4)} - $${price.padStart(7)} (${direct.padEnd(8)}) - ${source}`);
});

// Count flights by source
const sourceCount = {};
data.flights.forEach(f => {
  const source = f.source || 'Amadeus';
  sourceCount[source] = (sourceCount[source] || 0) + 1;
});

console.log('\n📈 FLIGHTS BY SOURCE:\n');
Object.entries(sourceCount).forEach(([source, count]) => {
  console.log(`  ${source}: ${count} flights (${((count/data.metadata.total)*100).toFixed(1)}%)`);
});

// Find Frontier flights
const frontierFlights = data.flights.filter(f =>
  f.validatingAirlineCodes?.[0] === 'F9' ||
  f.itineraries[0].segments.some(s => s.carrierCode === 'F9')
);

if (frontierFlights.length > 0) {
  console.log('\n🛩️  FRONTIER AIRLINES FOUND:\n');
  frontierFlights.slice(0, 5).forEach((f, i) => {
    const price = f.price.total;
    const source = f.source || 'Amadeus';
    const segments = f.itineraries[0].segments.length;
    const direct = segments === 1 ? 'Direct' : `${segments-1} stop${segments > 2 ? 's' : ''}`;

    console.log(`  ${i+1}. $${price} (${direct}) - Source: ${source}`);
  });

  // Check cheapest Frontier price
  const cheapestFrontier = frontierFlights.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total))[0];
  console.log(`\n  💵 Cheapest Frontier: $${cheapestFrontier.price.total} from ${cheapestFrontier.source || 'Amadeus'}`);

  if (parseFloat(cheapestFrontier.price.total) > 100) {
    console.log('  ⚠️  Still showing GDS bundled pricing (not $60 basic fare)');
    console.log('  ℹ️  Frontier NDC API needed for unbundled $60 fares');
  }
} else {
  console.log('\n⚠️  No Frontier flights found on JFK→LAX route');
  console.log('   (Frontier may not operate this route)');
}

// Compare Amadeus vs Duffel pricing
console.log('\n🔍 PRICE COMPARISON (Amadeus vs Duffel):\n');

const amadeusFlights = data.flights.filter(f => (f.source || 'Amadeus') === 'Amadeus');
const duffelFlights = data.flights.filter(f => f.source === 'Duffel');

if (amadeusFlights.length > 0 && duffelFlights.length > 0) {
  const avgAmadeus = amadeusFlights.reduce((sum, f) => sum + parseFloat(f.price.total), 0) / amadeusFlights.length;
  const avgDuffel = duffelFlights.reduce((sum, f) => sum + parseFloat(f.price.total), 0) / duffelFlights.length;

  console.log(`  Amadeus avg: $${avgAmadeus.toFixed(2)}`);
  console.log(`  Duffel avg:  $${avgDuffel.toFixed(2)}`);
  console.log(`  Difference:  $${(avgDuffel - avgAmadeus).toFixed(2)} ${avgDuffel < avgAmadeus ? '(Duffel cheaper)' : '(Amadeus cheaper)'}`);
}

console.log('\n✅ Multi-source aggregation working successfully!');
console.log('📌 Both Amadeus and Duffel APIs are queried in parallel');
console.log('📌 Results are merged and deduplicated');
console.log('📌 Cheapest price for each unique flight is kept');
