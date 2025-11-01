// Test Amadeus Car Rental API
const axios = require('axios');

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

    console.log('✅ Access token obtained successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

async function testCarRentalSearch(token) {
  try {
    console.log('\n🚗 Testing Car Rental Search API...\n');

    const params = {
      pickUpLocation: 'MIA', // Miami Airport
      dropOffLocation: 'MIA',
      pickUpDate: '2025-11-10',
      dropOffDate: '2025-11-17',
      pickUpTime: '10:00:00',
      dropOffTime: '10:00:00',
      driverAge: 30,
      currency: 'USD'
    };

    console.log('📋 Search Parameters:');
    console.log(JSON.stringify(params, null, 2));
    console.log('');

    const response = await axios.get(
      `${BASE_URL}/v1/shopping/car-rentals`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Car Rental Search SUCCESSFUL!');
    console.log(`📊 Results: ${response.data.data?.length || 0} cars found\n`);

    if (response.data.data && response.data.data.length > 0) {
      // Show first 3 cars
      console.log('🚗 Sample Cars:\n');
      response.data.data.slice(0, 3).forEach((car, index) => {
        console.log(`${index + 1}. ${car.vehicle?.description || 'Unknown Car'}`);
        console.log(`   Category: ${car.vehicle?.category || 'N/A'}`);
        console.log(`   Transmission: ${car.vehicle?.transmission || 'N/A'}`);
        console.log(`   Air Conditioning: ${car.vehicle?.airConditioning ? 'Yes' : 'No'}`);
        console.log(`   Seats: ${car.vehicle?.seats || 'N/A'}`);
        console.log(`   Company: ${car.provider?.companyName || 'N/A'}`);
        console.log(`   Price: ${car.price?.total} ${car.price?.currency}`);
        console.log('');
      });

      // Show data structure for integration
      console.log('📝 First Car Full Data Structure:');
      console.log(JSON.stringify(response.data.data[0], null, 2));
    } else {
      console.log('⚠️  No cars found for these search parameters');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Error searching car rentals:', error.response?.data || error.message);
    if (error.response?.data?.errors) {
      console.error('\n🔍 API Errors:');
      error.response.data.errors.forEach(err => {
        console.error(`   - ${err.title}: ${err.detail}`);
      });
    }
    throw error;
  }
}

async function main() {
  try {
    console.log('🔐 Authenticating with Amadeus API...\n');
    const token = await getAccessToken();

    await testCarRentalSearch(token);

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('🎉 Amadeus Car Rental API is working correctly!\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    process.exit(1);
  }
}

main();
