// Test LiteAPI hotel search
require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testLiteAPI() {
  try {
    const apiKey = process.env.LITEAPI_SANDBOX_PUBLIC_KEY;
    console.log('🔑 Testing LiteAPI with key:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET');

    // Test 1: Search cities for "Miami"
    console.log('\n📍 Testing cities search for "Miami"...');
    const citiesResponse = await axios.get('https://api.liteapi.travel/v3.0/data/cities', {
      params: { search: 'Miami' },
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Cities search works!');
    console.log('   Found:', citiesResponse.data.data?.length || 0, 'cities');
    if (citiesResponse.data.data?.[0]) {
      console.log('   First city:', citiesResponse.data.data[0].city, '- Code:', citiesResponse.data.data[0].cityCode);
    }

    // Get Miami city code
    const miamiCity = citiesResponse.data.data?.[0];
    if (!miamiCity) {
      console.error('❌ No Miami city found');
      return;
    }

    // Test 2: Search hotels in Miami
    console.log('\n🏨 Testing hotels search in', miamiCity.city, '(', miamiCity.cityCode, ')...');
    const hotelsResponse = await axios.get('https://api.liteapi.travel/v3.0/hotels', {
      params: {
        cityCode: miamiCity.cityCode,
        checkin: '2025-11-06',
        checkout: '2025-11-13',
        adults: 2,
        children: 0,
        currency: 'USD',
        guestNationality: 'US',
      },
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Hotels search works!');
    console.log('   Found:', hotelsResponse.data.data?.length || 0, 'hotels');
    if (hotelsResponse.data.data?.[0]) {
      const hotel = hotelsResponse.data.data[0];
      console.log('   First hotel:', hotel.name);
      console.log('   Address:', hotel.address);
      console.log('   Price:', hotel.minRate?.amount, hotel.minRate?.currency);
    }
  } catch (error) {
    console.error('❌ LiteAPI Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.error('   Stack:', error.stack);
  }
}

testLiteAPI();
