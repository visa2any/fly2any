import { chromium } from 'playwright';

(async () => {
  console.log('🔍 Checking Amadeus API Response Structure\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  let apiResponseData = null;

  // Intercept API responses
  page.on('response', async (response) => {
    if (response.url().includes('/api/flights/search') && response.status() === 200) {
      try {
        const data = await response.json();
        apiResponseData = data;
        console.log('✅ API Response Intercepted!');
      } catch (e) {
        console.log('⚠️ Could not parse API response');
      }
    }
  });

  try {
    console.log('Loading flight search...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&class=economy', {
      waitUntil: 'networkidle',
      timeout: 90000
    });

    await page.waitForSelector('text=/\\$[0-9,]+/', { timeout: 90000 });
    await page.waitForTimeout(5000);

    if (apiResponseData && apiResponseData.flights && apiResponseData.flights.length > 0) {
      const firstFlight = apiResponseData.flights[0];

      console.log('\n📊 FIRST FLIGHT STRUCTURE:');
      console.log('=' + '='.repeat(70));

      console.log('\n🔑 Top-level keys:');
      console.log(Object.keys(firstFlight).join(', '));

      if (firstFlight.travelerPricings) {
        console.log('\n👥 travelerPricings[0] keys:');
        console.log(Object.keys(firstFlight.travelerPricings[0]).join(', '));

        console.log('\n🧳 Checking for baggage data paths:');

        const tp = firstFlight.travelerPricings[0];

        console.log(`  ✓ fareDetailsBySegment exists? ${tp.fareDetailsBySegment ? 'YES' : 'NO'}`);
        console.log(`  ✓ fareDetails exists? ${tp.fareDetails ? 'YES' : 'NO'}`);
        console.log(`  ✓ perSegmentFareDetails exists? ${tp.perSegmentFareDetails ? 'YES' : 'NO'}`);

        if (tp.fareDetailsBySegment) {
          console.log('\n✅ fareDetailsBySegment FOUND!');
          console.log(`   Length: ${tp.fareDetailsBySegment.length}`);
          console.log(`   Keys in fareDetailsBySegment[0]:`);
          console.log(`   ${Object.keys(tp.fareDetailsBySegment[0]).join(', ')}`);

          console.log('\n📦 First segment baggage data:');
          console.log(JSON.stringify(tp.fareDetailsBySegment[0].includedCheckedBags, null, 2));
        } else {
          console.log('\n❌ fareDetailsBySegment NOT FOUND');
          console.log('\nDumping full travelerPricings[0] structure:');
          console.log(JSON.stringify(tp, null, 2));
        }
      }

      console.log('\n🛫 Itineraries:');
      if (firstFlight.itineraries) {
        console.log(`   Count: ${firstFlight.itineraries.length}`);
        firstFlight.itineraries.forEach((itin, idx) => {
          console.log(`   Itinerary ${idx}: ${itin.segments.length} segments`);
        });
      }

      console.log('\n💾 Saving full first flight to file...');
      const fs = await import('fs');
      fs.writeFileSync(
        'test-results/api-response-sample.json',
        JSON.stringify(firstFlight, null, 2)
      );
      console.log('✅ Saved to: test-results/api-response-sample.json');

    } else {
      console.log('❌ No flight data received');
    }

    console.log('\n⏳ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Done!');
  }
})();
