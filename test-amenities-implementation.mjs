import { chromium } from '@playwright/test';

async function testAmenitiesImplementation() {
  console.log('🧪 Testing Aircraft-Based Amenities Implementation\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Step 1: Navigate to flight results
    console.log('1️⃣ Loading flight results page...');
    await page.goto('http://localhost:3002/flights/results?from=JFK&to=LAX&departDate=2025-11-15&returnDate=2025-11-22&adults=1&children=0&infants=0&class=economy&tripType=roundtrip');

    // Wait for flight cards to load
    await page.waitForSelector('[data-testid="flight-card"], .group.relative.bg-white.rounded-xl', { timeout: 15000 });
    await page.waitForTimeout(3000); // Wait for dynamic content

    console.log('✅ Flight cards loaded\n');

    // Step 2: Check amenities display
    console.log('2️⃣ Checking amenities display...');

    const amenitiesData = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid="flight-card"], .group.relative.bg-white.rounded-xl');
      const results = [];

      cards.forEach((card, index) => {
        // Find baggage section
        const baggageSection = card.querySelector('.mt-1.py-0.5.px-2, .mt-1\\.5.py-1.px-2');
        if (!baggageSection) {
          results.push({
            cardIndex: index,
            found: false,
            error: 'Baggage section not found'
          });
          return;
        }

        // Find WiFi, Power, Meal elements
        const wifiElement = Array.from(baggageSection.querySelectorAll('span')).find(el => el.textContent?.includes('WiFi'));
        const powerElement = Array.from(baggageSection.querySelectorAll('span')).find(el => el.textContent?.includes('Power'));
        const mealElement = Array.from(baggageSection.querySelectorAll('span')).find(el => el.textContent?.includes('🍽️'));

        // Check for estimated indicator (~)
        const hasWifiEstimate = wifiElement?.textContent?.includes('~') || false;
        const hasPowerEstimate = powerElement?.textContent?.includes('~') || false;
        const hasMealEstimate = mealElement?.textContent?.includes('~') || false;

        // Check status
        const wifiStatus = wifiElement?.textContent?.includes('✓') ? 'Available' : (wifiElement?.textContent?.includes('✗') ? 'Not available' : 'Unknown');
        const powerStatus = powerElement?.textContent?.includes('✓') ? 'Available' : (powerElement?.textContent?.includes('✗') ? 'Not available' : 'Unknown');
        const mealText = mealElement?.textContent?.replace('🍽️', '').trim() || 'Unknown';

        // Get tooltip (title attribute)
        const wifiTooltip = wifiElement?.getAttribute('title') || 'No tooltip';
        const powerTooltip = powerElement?.getAttribute('title') || 'No tooltip';

        results.push({
          cardIndex: index,
          found: true,
          wifi: {
            status: wifiStatus,
            isEstimated: hasWifiEstimate,
            tooltip: wifiTooltip
          },
          power: {
            status: powerStatus,
            isEstimated: hasPowerEstimate,
            tooltip: powerTooltip
          },
          meal: {
            text: mealText,
            isEstimated: hasMealEstimate
          }
        });
      });

      return results;
    });

    // Display results
    console.log('\n📊 AMENITIES TEST RESULTS:\n');

    amenitiesData.forEach((data, i) => {
      console.log(`Card ${i + 1}:`);
      if (!data.found) {
        console.log(`  ❌ ${data.error}`);
      } else {
        console.log(`  WiFi: ${data.wifi.status} ${data.wifi.isEstimated ? '(Estimated ~)' : '(Confirmed)'}`);
        console.log(`    Tooltip: ${data.wifi.tooltip}`);
        console.log(`  Power: ${data.power.status} ${data.power.isEstimated ? '(Estimated ~)' : '(Confirmed)'}`);
        console.log(`    Tooltip: ${data.power.tooltip}`);
        console.log(`  Meal: ${data.meal.text} ${data.meal.isEstimated ? '(Estimated ~)' : '(Confirmed)'}`);
      }
      console.log('');
    });

    // Step 3: Take screenshot
    console.log('3️⃣ Taking screenshot...');
    await page.screenshot({
      path: 'test-amenities-implementation.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: test-amenities-implementation.png\n');

    // Step 4: Expand first card to check expanded view
    console.log('4️⃣ Expanding first card to check details...');
    const detailsButton = await page.locator('button:has-text("Details")').first();
    await detailsButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-amenities-expanded.png',
      fullPage: false
    });
    console.log('✅ Screenshot saved: test-amenities-expanded.png\n');

    // Step 5: Verify that amenities are NOT all showing as "Not available"
    const hasAvailableAmenities = amenitiesData.some(card =>
      card.found &&
      (card.wifi.status === 'Available' || card.power.status === 'Available')
    );

    const hasEstimatedIndicator = amenitiesData.some(card =>
      card.found &&
      (card.wifi.isEstimated || card.power.isEstimated || card.meal.isEstimated)
    );

    console.log('\n🎯 VERIFICATION RESULTS:');
    console.log(`  ✓ Has available amenities: ${hasAvailableAmenities ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`  ✓ Has estimated indicator (~): ${hasEstimatedIndicator ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`  ✓ Total cards checked: ${amenitiesData.length}`);

    if (hasAvailableAmenities && hasEstimatedIndicator) {
      console.log('\n🎉 SUCCESS! Aircraft-based amenities are working!');
      console.log('   Business class flights should now show Power ✓');
      console.log('   787/A350 flights should show WiFi ✓');
    } else {
      console.log('\n⚠️ Some issues detected. Review screenshots for details.');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'test-amenities-error.png' });
    console.log('Error screenshot saved: test-amenities-error.png');
  } finally {
    console.log('\n👁️ Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

testAmenitiesImplementation().catch(console.error);
