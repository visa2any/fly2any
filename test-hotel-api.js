// Test hotel search API
const testAPI = async () => {
  try {
    const url = 'http://localhost:3000/api/hotels/search?checkIn=2025-11-05&checkOut=2025-11-12&adults=2&query=Miami&currency=USD&limit=50';
    console.log('🔍 Testing API:', url);

    const response = await fetch(url);
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📋 Headers:', Object.fromEntries(response.headers));

    const text = await response.text();
    console.log('📄 Raw Response:', text.substring(0, 500));

    try {
      const json = JSON.parse(text);
      console.log('✅ JSON Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.error('❌ Not valid JSON');
    }
  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
    console.error('   Stack:', error.stack);
  }
};

testAPI();
