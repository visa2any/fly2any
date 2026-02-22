
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function reproduceError() {
  const ports = [3000, 3001];
  console.log('🧪 Attempting to reproduce flight search error...');
  console.log('📍 Search: ORD -> AMS on 2026-09-05');

  for (const port of ports) {
    console.log(`\n📡 Trying port ${port}...`);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch(`http://localhost:${port}/api/flights/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'ORD',
          destination: 'AMS',
          departureDate: '2026-09-05',
          adults: 1,
          currencyCode: 'USD',
          max: 50
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      console.log(`📡 Status: ${port} -> ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Found ${data.flights?.length || 0} flights.`);
        return; // Stop if we got a successful response
      } else {
        const text = await response.text();
        console.log(`❌ Error response (port ${port}):`, text);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error(`❌ Fetch timed out (port ${port}) after 60s`);
      } else {
        console.error(`❌ Fetch failed (port ${port}):`, err.message);
      }
    }
  }
}

reproduceError();
