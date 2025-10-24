// Test what Amadeus API actually returns for Frontier JFK→MIA
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

async function testFrontierPricing() {
  try {
    const token = await getAccessToken();
    console.log('✅ Got access token\n');

    // Search for JFK → MIA on Nov 5, return Nov 12 (same as Priceline)
    console.log('🔍 Searching: JFK → MIA (Nov 5-12, Economy, 1 adult)...\n');

    const response = await axios.get(
      `${BASE_URL}/v2/shopping/flight-offers`,
      {
        params: {
          originLocationCode: 'JFK',
          destinationLocationCode: 'MIA',
          departureDate: '2025-11-05',
          returnDate: '2025-11-12',
          adults: '1',
          travelClass: 'ECONOMY',
          max: '50',
          currencyCode: 'USD',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      }
    );

    const flights = response.data.data || [];
    console.log(`📋 Total flights found: ${flights.length}\n`);

    // Find Frontier flights
    const frontierFlights = flights.filter(f => {
      const carriers = f.validatingAirlineCodes || [];
      const segments = f.itineraries?.[0]?.segments || [];
      return carriers.includes('F9') || segments.some(s => s.carrierCode === 'F9');
    });

    console.log('='.repeat(80));
    console.log(`🛩️  FRONTIER FLIGHTS: ${frontierFlights.length} found`);
    console.log('='.repeat(80));

    if (frontierFlights.length === 0) {
      console.log('\n⚠️  NO FRONTIER FLIGHTS FOUND!');
      console.log('   This might be why we show different prices.');
      console.log('\n   Checking what airlines ARE available...\n');

      const airlines = new Set();
      flights.forEach(f => {
        (f.validatingAirlineCodes || []).forEach(c => airlines.add(c));
        (f.itineraries?.[0]?.segments || []).forEach(s => airlines.add(s.carrierCode));
      });

      console.log('   Available airlines:', Array.from(airlines).sort());

      // Show cheapest 5 flights
      const sorted = flights.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
      console.log('\n📊 CHEAPEST 5 FLIGHTS FROM AMADEUS:');
      sorted.slice(0, 5).forEach((f, i) => {
        const carrier = f.validatingAirlineCodes?.[0] || f.itineraries[0].segments[0].carrierCode;
        const isDirect = f.itineraries[0].segments.length === 1;
        console.log(`   ${i+1}. ${carrier} - $${f.price.total} ${f.price.currency} (${isDirect ? 'Direct' : f.itineraries[0].segments.length + ' stops'})`);
      });
    } else {
      // Analyze Frontier flights
      frontierFlights.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

      console.log(`\n💰 CHEAPEST FRONTIER FLIGHT:`);
      const cheapest = frontierFlights[0];
      console.log(`   Price: $${cheapest.price.total} ${cheapest.price.currency}`);
      console.log(`   Base: $${cheapest.price.base}`);

      const outbound = cheapest.itineraries[0];
      const returnFlight = cheapest.itineraries[1];

      console.log(`\n   Outbound: ${outbound.segments[0].departure.iataCode} → ${outbound.segments[outbound.segments.length-1].arrival.iataCode}`);
      console.log(`   Departure: ${outbound.segments[0].departure.at}`);
      console.log(`   Stops: ${outbound.segments.length === 1 ? 'Direct' : outbound.segments.length - 1}`);

      if (returnFlight) {
        console.log(`\n   Return: ${returnFlight.segments[0].departure.iataCode} → ${returnFlight.segments[returnFlight.segments.length-1].arrival.iataCode}`);
        console.log(`   Departure: ${returnFlight.segments[0].departure.at}`);
        console.log(`   Stops: ${returnFlight.segments.length === 1 ? 'Direct' : returnFlight.segments.length - 1}`);
      }

      // Check fare details
      const tp = cheapest.travelerPricings?.[0];
      const fareDetails = tp?.fareDetailsBySegment?.[0];

      console.log(`\n   Fare Details:`);
      console.log(`     Cabin: ${fareDetails?.cabin || 'N/A'}`);
      console.log(`     Branded Fare: ${fareDetails?.brandedFare || 'N/A'}`);
      console.log(`     Fare Basis: ${fareDetails?.fareBasis || 'N/A'}`);
      console.log(`     Fare Option: ${tp?.fareOption || 'N/A'}`);
      console.log(`     Checked Bags: ${fareDetails?.includedCheckedBags?.quantity || 0}`);

      console.log(`\n   Pricing Options:`);
      console.log(`     Fare Type: ${cheapest.pricingOptions?.fareType || 'N/A'}`);
      console.log(`     Included Bags Only: ${cheapest.pricingOptions?.includedCheckedBagsOnly}`);

      console.log('\n' + '='.repeat(80));
      console.log('📊 ALL FRONTIER FLIGHTS (sorted by price):');
      console.log('='.repeat(80));

      frontierFlights.forEach((f, i) => {
        const isDirect = f.itineraries[0].segments.length === 1;
        const tp = f.travelerPricings?.[0];
        const fareDetails = tp?.fareDetailsBySegment?.[0];

        console.log(`\n${i+1}. $${f.price.total} ${f.price.currency}`);
        console.log(`   ${isDirect ? 'Direct' : f.itineraries[0].segments.length + ' stops'}`);
        console.log(`   Cabin: ${fareDetails?.cabin}, Branded: ${fareDetails?.brandedFare || 'N/A'}`);
        console.log(`   Bags: ${fareDetails?.includedCheckedBags?.quantity || 0} checked`);
      });

      console.log('\n' + '='.repeat(80));
      console.log('COMPARISON WITH PRICELINE:');
      console.log('='.repeat(80));
      console.log(`Priceline Basic Fare:     $60`);
      console.log(`Amadeus Cheapest Frontier: $${cheapest.price.total}`);
      console.log(`Difference: $${parseFloat(cheapest.price.total) - 60}`);

      if (parseFloat(cheapest.price.total) > 100) {
        console.log('\n⚠️  ISSUE: Amadeus price is significantly higher than Priceline!');
        console.log('   Possible reasons:');
        console.log('   1. Amadeus might not have access to Basic/Unbundled fares');
        console.log('   2. Priceline has direct contracts with Frontier');
        console.log('   3. Amadeus test environment has limited inventory');
        console.log('   4. We need to request unbundled fares specifically');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testFrontierPricing();
