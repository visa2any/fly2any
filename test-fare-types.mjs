// Test script to check what fare types the Amadeus API returns
import axios from 'axios';

const API_KEY = 'MOytyHr4qQXNogQWbruaE0MtmGeigCd3';
const API_SECRET = 'exUkoGmSGbyiiOji';
const BASE_URL = 'https://test.api.amadeus.com';

async function getAccessToken() {
  try {
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
  } catch (error) {
    console.error('Error getting token:', error.message);
    throw error;
  }
}

async function searchFlights() {
  try {
    const token = await getAccessToken();
    console.log('✅ Got access token\n');

    const searchParams = new URLSearchParams({
      originLocationCode: 'JFK',
      destinationLocationCode: 'LAX',
      departureDate: '2025-11-15',
      returnDate: '2025-11-22',
      adults: '1',
      travelClass: 'ECONOMY',
      max: '5',
      currencyCode: 'USD',
    });

    console.log('🔍 Searching flights: JFK → LAX (Economy class)...\n');

    const response = await axios.get(
      `${BASE_URL}/v2/shopping/flight-offers`,
      {
        params: searchParams,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      }
    );

    const flights = response.data.data || [];
    console.log(`📋 Found ${flights.length} flights\n`);

    if (flights.length > 0) {
      console.log('='.repeat(80));
      console.log('ANALYZING FIRST FLIGHT FOR FARE TYPE DETAILS');
      console.log('='.repeat(80));

      const flight = flights[0];

      console.log('\n📍 Flight ID:', flight.id);
      console.log('💰 Price:', flight.price.total, flight.price.currency);
      console.log('✈️  Source:', flight.source);

      // Check travelerPricings for fare details
      if (flight.travelerPricings && flight.travelerPricings.length > 0) {
        console.log('\n--- TRAVELER PRICING DETAILS ---');
        flight.travelerPricings.forEach((tp, idx) => {
          console.log(`\nTraveler ${idx + 1}:`);
          console.log('  Type:', tp.travelerType);
          console.log('  Fare Option:', tp.fareOption);
          console.log('  Price:', tp.price.total, tp.price.currency);

          if (tp.fareDetailsBySegment && tp.fareDetailsBySegment.length > 0) {
            console.log('\n  Fare Details by Segment:');
            tp.fareDetailsBySegment.forEach((seg, segIdx) => {
              console.log(`    Segment ${segIdx + 1}:`);
              console.log('      Cabin:', seg.cabin);
              console.log('      Fare Basis:', seg.fareBasis);
              console.log('      Branded Fare:', seg.brandedFare || 'N/A');
              console.log('      Booking Class:', seg.class);
              if (seg.includedCheckedBags) {
                console.log('      Checked Bags:', seg.includedCheckedBags.quantity || 0);
              }
            });
          }
        });
      }

      // Check pricingOptions
      if (flight.pricingOptions) {
        console.log('\n--- PRICING OPTIONS ---');
        console.log('Fare Type:', flight.pricingOptions.fareType);
        console.log('Included Checked Bags Only:', flight.pricingOptions.includedCheckedBagsOnly);
      }

      console.log('\n' + '='.repeat(80));
      console.log('\n📊 SUMMARY OF ALL FLIGHTS:');
      console.log('='.repeat(80));

      flights.forEach((f, idx) => {
        const tp = f.travelerPricings?.[0];
        const seg = tp?.fareDetailsBySegment?.[0];

        console.log(`\nFlight ${idx + 1}:`);
        console.log(`  Price: ${f.price.total} ${f.price.currency}`);
        console.log(`  Fare Option: ${tp?.fareOption || 'N/A'}`);
        console.log(`  Branded Fare: ${seg?.brandedFare || 'N/A'}`);
        console.log(`  Cabin: ${seg?.cabin || 'N/A'}`);
        console.log(`  Fare Basis: ${seg?.fareBasis || 'N/A'}`);
        console.log(`  Checked Bags: ${seg?.includedCheckedBags?.quantity || 0}`);
      });

      console.log('\n' + '='.repeat(80));
      console.log('\n🔍 CHECKING FOR FARE VARIETY:');
      console.log('='.repeat(80));

      // Analyze variety of fare options
      const fareOptions = new Set();
      const brandedFares = new Set();
      const cabins = new Set();

      flights.forEach(f => {
        const tp = f.travelerPricings?.[0];
        const seg = tp?.fareDetailsBySegment?.[0];

        if (tp?.fareOption) fareOptions.add(tp.fareOption);
        if (seg?.brandedFare) brandedFares.add(seg.brandedFare);
        if (seg?.cabin) cabins.add(seg.cabin);
      });

      console.log('\nUnique Fare Options:', Array.from(fareOptions));
      console.log('Unique Branded Fares:', Array.from(brandedFares));
      console.log('Unique Cabins:', Array.from(cabins));

      console.log('\n' + '='.repeat(80));
      console.log('CONCLUSION:');
      console.log('='.repeat(80));

      if (fareOptions.size === 1 && brandedFares.size <= 1) {
        console.log('⚠️  ISSUE FOUND: All flights show the SAME fare type!');
        console.log('    This suggests the basic Flight Offers Search API only returns');
        console.log('    ONE fare family per flight. To get multiple fare types');
        console.log('    (Basic Economy, Standard, Flex, etc.), we need to either:');
        console.log('    1. Call the Branded Fares API for each flight');
        console.log('    2. Use a different search parameter');
      } else {
        console.log('✅ Multiple fare types found in results!');
        console.log('   The API is returning different fare families.');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

searchFlights();
