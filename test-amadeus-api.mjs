// Test Amadeus API directly
import axios from 'axios';

// Use credentials from .env.local
const API_KEY = 'MOytyHr4qQXNogQWbruaE0MtmGeigCd3';
const API_SECRET = 'exUkoGmSGbyiiOji';
const BASE_URL = 'https://test.api.amadeus.com';

console.log('🔑 API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('🔐 API Secret:', API_SECRET ? `${API_SECRET.substring(0, 5)}...` : 'NOT FOUND');

async function testAmadeusAPI() {
  try {
    // Step 1: Get access token
    console.log('\n📡 Step 1: Getting access token...');
    const tokenResponse = await axios.post(
      `${BASE_URL}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: API_KEY,
        client_secret: API_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('✅ Access token received:', tokenResponse.data.access_token.substring(0, 20) + '...');
    const accessToken = tokenResponse.data.access_token;

    // Step 2: Search for flights JFK to GRU
    console.log('\n✈️  Step 2: Searching flights JFK → GRU...');
    const flightResponse = await axios.get(
      `${BASE_URL}/v2/shopping/flight-offers`,
      {
        params: {
          originLocationCode: 'JFK',
          destinationLocationCode: 'GRU',
          departureDate: '2025-11-15',
          returnDate: '2025-11-22',
          adults: 1,
          max: 5,
          currencyCode: 'USD',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log(`✅ Found ${flightResponse.data.data.length} flights!`);
    console.log('\n📋 First flight details:');
    const firstFlight = flightResponse.data.data[0];
    console.log('- Price:', firstFlight.price.total, firstFlight.price.currency);
    console.log('- Airline:', firstFlight.validatingAirlineCodes[0]);
    console.log('- Outbound duration:', firstFlight.itineraries[0].duration);
    if (firstFlight.itineraries[1]) {
      console.log('- Return duration:', firstFlight.itineraries[1].duration);
    }
    console.log('- Stops:', firstFlight.itineraries[0].segments.length - 1);

    console.log('\n✅ Amadeus API is working correctly!\n');
  } catch (error) {
    console.error('\n❌ Error testing Amadeus API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

testAmadeusAPI();
