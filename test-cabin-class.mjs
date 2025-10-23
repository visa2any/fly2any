/**
 * Test cabin class from API for Business class search
 */

const response = await fetch('http://localhost:3000/api/flights/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    origin: 'JFK',
    destination: 'GRU',
    departureDate: '2025-10-25',
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: 'BUSINESS', // Requesting Business class
  }),
});

const data = await response.json();

console.log('API Response status:', response.status);
console.log('API Response keys:', Object.keys(data));

if (data.error) {
  console.error('❌ API Error:', data.error);
  process.exit(1);
}

const flights = data.flights || data.data || [];

if (flights.length === 0) {
  console.log('❌ No flights returned');
  console.log('Full response:', JSON.stringify(data, null, 2).substring(0, 1000));
  process.exit(1);
}

// Check first 3 flights
console.log(`\n📊 Checking cabin class for ${flights.length} flights (showing first 3):\n`);

for (let i = 0; i < Math.min(3, flights.length); i++) {
  const flight = flights[i];
  const travelerPricing = flight.travelerPricings?.[0];
  const outboundFare = travelerPricing?.fareDetailsBySegment?.[0];
  const returnFare = travelerPricing?.fareDetailsBySegment?.[1];

  const checkedBags = outboundFare?.includedCheckedBags?.quantity || 0;
  const cabinBags = outboundFare?.includedCabinBags?.quantity || 0;

  console.log(`Flight ${i + 1}:`);
  console.log(`  Airline: ${flight.validatingAirlineCodes?.[0] || 'N/A'}`);
  console.log(`  Price: ${flight.price.currency} ${flight.price.total}`);
  console.log(`  Outbound cabin: ${outboundFare?.cabin || 'NOT_FOUND'}`);
  console.log(`  Outbound fare: ${outboundFare?.brandedFare || outboundFare?.fareOption || 'NOT_FOUND'}`);
  console.log(`  Outbound label: ${outboundFare?.brandedFareLabel || 'NOT_FOUND'}`);
  console.log(`  Checked bags: ${checkedBags}`);
  console.log(`  Cabin bags: ${cabinBags}`);

  if (returnFare) {
    console.log(`  Return cabin: ${returnFare.cabin || 'NOT_FOUND'}`);
    console.log(`  Return fare: ${returnFare?.brandedFare || returnFare?.fareOption || 'NOT_FOUND'}`);
    console.log(`  Return label: ${returnFare?.brandedFareLabel || 'NOT_FOUND'}`);
  }

  console.log('');
}

// Check if ANY flights have BUSINESS cabin
const businessFlights = flights.filter(flight => {
  const travelerPricing = flight.travelerPricings?.[0];
  const outboundFare = travelerPricing?.fareDetailsBySegment?.[0];
  return outboundFare?.cabin === 'BUSINESS';
});

console.log(`\n📈 Summary:`);
console.log(`  Total flights: ${flights.length}`);
console.log(`  Business cabin flights: ${businessFlights.length}`);
console.log(`  Economy cabin flights: ${flights.length - businessFlights.length}`);

if (businessFlights.length === 0) {
  console.log(`\n⚠️  When searching for BUSINESS class, Amadeus returned ${flights.length} flights,`);
  console.log(`   but ALL of them have ECONOMY cabin (Business class not available on this route/date)`);
}
