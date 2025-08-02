/**
 * 🧪 Test Amadeus API Direct Connection
 */

const { getAmadeusClient } = require('./src/lib/flights/amadeus-client');

async function testAmadeusAPI() {
  console.log('🔍 Testing Amadeus API connection...');
  
  try {
    const client = getAmadeusClient();
    
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const isHealthy = await client.healthCheck();
    console.log(`Health check: ${isHealthy ? '✅ PASS' : '❌ FAIL'}`);
    
    // Test 2: Simple flight search
    console.log('2️⃣ Testing flight search...');
    const searchParams = {
      originLocationCode: 'GRU',
      destinationLocationCode: 'GIG', 
      departureDate: '2025-08-15',
      adults: 1,
      max: 10,
      currencyCode: 'USD'
    };
    
    console.log('Search params:', searchParams);
    
    const response = await client.searchFlights(searchParams);
    console.log(`✅ API Response received!`);
    console.log(`- Data length: ${response.data?.length || 0}`);
    console.log(`- Has dictionaries: ${!!response.dictionaries}`);
    console.log(`- Sample offer ID: ${response.data?.[0]?.id || 'none'}`);
    
    if (response.data?.length > 0) {
      console.log('🎉 SUCCESS: Real Amadeus API is working!');
      console.log(`Found ${response.data.length} real flight offers`);
    } else {
      console.log('⚠️ WARNING: API responded but no flights found');
    }
    
  } catch (error) {
    console.error('❌ FAILED: Amadeus API test failed');
    console.error('Error details:', error.message);
    console.error('This explains why fallback data is being used');
    
    // Check specific error types
    if (error.message.includes('401')) {
      console.error('🔑 CREDENTIALS ERROR: Check AMADEUS_API_KEY and AMADEUS_API_SECRET');
    } else if (error.message.includes('403')) {
      console.error('🚫 PERMISSION ERROR: API key may not have flight search permissions');
    } else if (error.message.includes('429')) {
      console.error('⏱️ RATE LIMIT ERROR: Too many requests to Amadeus API');
    } else if (error.message.includes('timeout')) {
      console.error('⏰ TIMEOUT ERROR: Amadeus API taking too long to respond');
    }
  }
}

// Run the test
testAmadeusAPI().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});