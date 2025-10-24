// Test the Branded Fares API to get all fare families
import axios from 'axios';

const API_KEY = 'MOytyHr4qQXNogQWbruaE0MtmGeigCd3';
const API_SECRET = 'exUkoGmSGbyiiOji';
const BASE_URL = 'https://test.api.amadeus.com';

async function getAccessToken() {
  const response = await axios.post(
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
  return response.data.access_token;
}

async function testBrandedFares() {
  try {
    const token = await getAccessToken();
    console.log('✅ Got access token\n');

    // Step 1: Search for flights
    console.log('🔍 Step 1: Searching flights...\n');
    const searchResponse = await axios.get(
      `${BASE_URL}/v2/shopping/flight-offers`,
      {
        params: {
          originLocationCode: 'JFK',
          destinationLocationCode: 'LAX',
          departureDate: '2025-11-15',
          adults: '1',
          travelClass: 'ECONOMY',
          max: '1', // Just get one flight for testing
          currencyCode: 'USD',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      }
    );

    const flight = searchResponse.data.data[0];
    console.log(`📋 Found flight: ${flight.id}`);
    console.log(`💰 Base Price: ${flight.price.total} ${flight.price.currency}`);
    console.log(`🎫 Base Fare Type: ${flight.travelerPricings[0].fareOption}\n`);

    // Step 2: Get branded fares for this flight
    console.log('🔍 Step 2: Getting branded fares (all fare families)...\n');

    try {
      // The Branded Fares API needs to be called with the flight offer data
      const brandedResponse = await axios.post(
        `${BASE_URL}/v1/shopping/flight-offers/upselling`,
        {
          data: {
            type: 'flight-offers-upselling',
            flightOffers: [flight],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log('✅ SUCCESS! Got branded fares response\n');
      console.log('='.repeat(80));
      console.log('AVAILABLE FARE FAMILIES:');
      console.log('='.repeat(80));

      const brandedFares = brandedResponse.data.data;
      if (brandedFares && brandedFares.length > 0) {
        brandedFares.forEach((offer, idx) => {
          const tp = offer.travelerPricings?.[0];
          const seg = tp?.fareDetailsBySegment?.[0];

          console.log(`\n${idx + 1}. Fare Family: ${seg?.brandedFare || 'N/A'}`);
          console.log(`   Price: ${offer.price.total} ${offer.price.currency}`);
          console.log(`   Fare Option: ${tp?.fareOption || 'N/A'}`);
          console.log(`   Cabin: ${seg?.cabin || 'N/A'}`);
          console.log(`   Checked Bags: ${seg?.includedCheckedBags?.quantity || 0}`);
          console.log(`   Fare Basis: ${seg?.fareBasis || 'N/A'}`);

          // Show amenities if available
          if (seg?.amenities && seg.amenities.length > 0) {
            console.log(`   Amenities:`, seg.amenities.map(a => a.description).join(', '));
          }
        });

        console.log('\n' + '='.repeat(80));
        console.log('CONCLUSION:');
        console.log('='.repeat(80));
        console.log(`✅ Found ${brandedFares.length} different fare families for this flight!`);
        console.log('   This is what other sites show - multiple fare options to choose from.');
        console.log('\n   To implement this on our site, we need to:');
        console.log('   1. Call the Upselling API for each flight offer');
        console.log('   2. Display all fare families as separate options');
        console.log('   3. Let users choose which fare family they want');
      } else {
        console.log('⚠️  No branded fares returned (might not be available for this route)');
      }

    } catch (brandedError) {
      if (brandedError.response?.status === 404) {
        console.log('⚠️  Branded fares not available for this flight');
        console.log('   This is normal - not all flights/airlines offer branded fares');
      } else {
        console.error('❌ Error getting branded fares:');
        console.error('   Status:', brandedError.response?.status);
        console.error('   Error:', brandedError.response?.data);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testBrandedFares();
