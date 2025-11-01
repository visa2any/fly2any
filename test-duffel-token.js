// Test Duffel token access
require('dotenv').config({ path: '.env.local' });
const { Duffel } = require('@duffel/api');

async function testToken() {
  try {
    const token = process.env.DUFFEL_ACCESS_TOKEN;
    console.log('🔑 Testing token:', token ? token.substring(0, 20) + '...' : 'NOT SET');
    console.log('   Token length:', token ? token.length : 0);
    console.log('   Has whitespace at end:', token ? /\s$/.test(token) : false);

    const client = new Duffel({ token });

    // Try to list accommodation (simpler endpoint)
    console.log('\n📍 Testing stays.accommodation.list...');
    try {
      const accommodations = await client.stays.accommodation.list({
        latitude: 25.7617,
        longitude: -80.1918,
        radius: 5,
      });
      console.log('✅ Accommodation list works!');
      console.log('   Found:', accommodations.data?.length || 0, 'properties');
      if (accommodations.data?.[0]) {
        console.log('   First property:', accommodations.data[0].name);
      }
    } catch (error) {
      console.error('❌ Accommodation list failed:', error.message);
      console.error('   Error details:', {
        meta: error.meta,
        errors: error.errors,
      });
    }

    // Try the search method
    console.log('\n🔍 Testing stays.search...');
    try {
      const searchResult = await client.stays.search({
        location: {
          geographic_coordinates: {
            latitude: 25.7617,
            longitude: -80.1918,
          },
          radius: 5,
        },
        check_in_date: '2025-11-06',
        check_out_date: '2025-11-13',
        guests: [{ type: 'adult' }, { type: 'adult' }],
        rooms: 1,
      });
      console.log('✅ Search works!');
      console.log('   Result ID:', searchResult.data?.id);
    } catch (error) {
      console.error('❌ Search failed:', error.message);
      console.error('   Error name:', error.name);
      console.error('   Error constructor:', error.constructor.name);
      console.error('   Meta:', error.meta);
      console.error('   Errors:', error.errors);
      console.error('   Headers:', error.headers ? 'Present' : 'None');

      // Try to extract more details
      if (error.headers && typeof error.headers.get === 'function') {
        console.error('   Content-Type:', error.headers.get('content-type'));
        console.error('   Rate Limit:', error.headers.get('ratelimit-remaining'));
      }
    }
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.error(error);
  }
}

testToken();
