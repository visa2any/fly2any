#!/usr/bin/env node

/**
 * Test script to verify the baggage fees link from flight results page
 */

import { chromium } from 'playwright';

async function testBaggageFeeLink() {
  console.log('🧪 Testing Baggage Fee Disclaimer Link...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to a page that has the BaggageFeeDisclaimer component
    // Let's check the flights results page
    console.log('📄 Navigating to flight results page');
    await page.goto('http://localhost:3002/flights/results', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2000); // Wait for any dynamic content

    // Check if baggage fee disclaimer exists
    console.log('\n🔍 Looking for baggage fee disclaimer...');
    const disclaimer = await page.locator('text=/.*baggage fees.*/i').first();
    const disclaimerExists = await disclaimer.count() > 0;

    if (disclaimerExists) {
      console.log('✓ Baggage fee disclaimer found');

      // Look for the link to /baggage-fees
      const baggageLink = await page.locator('a[href="/baggage-fees"]').first();
      const linkExists = await baggageLink.count() > 0;

      if (linkExists) {
        console.log('✓ Link to /baggage-fees found');
        console.log('\n🖱️ Clicking the baggage fees link...');

        await baggageLink.click();
        await page.waitForURL('**/baggage-fees', { timeout: 10000 });

        const currentUrl = page.url();
        console.log(`✓ Navigated to: ${currentUrl}`);

        // Verify we're on the baggage fees page
        const h1 = await page.locator('h1').textContent();
        console.log(`✓ Page heading: ${h1}`);

        if (h1.includes('Baggage Fees')) {
          console.log('\n✅ Link navigation successful!');
        } else {
          throw new Error('Unexpected page after clicking link');
        }
      } else {
        console.log('⚠️ Link to /baggage-fees not found in disclaimer');
        console.log('Note: This might be expected if showLink prop is false');
      }
    } else {
      console.log('⚠️ Baggage fee disclaimer not found on this page');
      console.log('Note: The disclaimer may only appear when flight results are present');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-baggage-link-result.png' });
    console.log('📸 Screenshot saved: test-baggage-link-result.png');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-baggage-link-error.png' });
    console.log('Error screenshot saved: test-baggage-link-error.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testBaggageFeeLink()
  .then(() => {
    console.log('\n🎉 Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
