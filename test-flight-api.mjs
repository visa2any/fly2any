// Test flight search API endpoint
import axios from 'axios';

async function testFlightAPI() {
  try {
    console.log('🧪 Testing flight search API on localhost:3002...\n');

    const response = await axios.post('http://localhost:3002/api/flights/search', {
      origin: 'JFK',
      destination: 'GRU',
      departureDate: '2025-11-15',
      returnDate: '2025-11-22',
      adults: 1,
      currencyCode: 'USD',
      max: 5
    });

    const data = response.data;

    console.log(`✅ API Response received!`);
    console.log(`📊 Found ${data.metadata.total} flights`);
    console.log(`💾 Cached: ${data.metadata.cached}`);

    if (data.flights && data.flights.length > 0) {
      const firstFlight = data.flights[0];
      console.log(`\n✈️  First flight details:`);
      console.log(`   Price: $${firstFlight.price.total} ${firstFlight.price.currency}`);
      console.log(`   Airline: ${firstFlight.validatingAirlineCodes[0]}`);
      console.log(`   Outbound: ${firstFlight.itineraries[0].segments[0].departure.iataCode} → ${firstFlight.itineraries[0].segments[firstFlight.itineraries[0].segments.length - 1].arrival.iataCode}`);
      console.log(`   Duration: ${firstFlight.itineraries[0].duration}`);
      console.log(`   Stops: ${firstFlight.itineraries[0].segments.length - 1}`);

      if (firstFlight.itineraries[1]) {
        console.log(`   Return: ${firstFlight.itineraries[1].segments[0].departure.iataCode} → ${firstFlight.itineraries[1].segments[firstFlight.itineraries[1].segments.length - 1].arrival.iataCode}`);
        console.log(`   Return Duration: ${firstFlight.itineraries[1].duration}`);
      }

      // Check if it's mock data or real data
      if (firstFlight.id.startsWith('MOCK_')) {
        console.log(`\n⚠️  WARNING: Still using MOCK data!`);
      } else {
        console.log(`\n✅ SUCCESS: Using REAL Amadeus API data!`);
      }
    }
  } catch (error) {
    console.error('\n❌ Error testing flight API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testFlightAPI();
