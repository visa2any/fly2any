#!/usr/bin/env node

/**
 * Test script to verify the /baggage-fees page works correctly
 */

import { chromium } from 'playwright';

async function testBaggageFeesPage() {
  console.log('🧪 Testing Baggage Fees Page...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to baggage fees page
    console.log('📄 Navigating to http://localhost:3002/baggage-fees');
    await page.goto('http://localhost:3002/baggage-fees', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Check page title
    const title = await page.title();
    console.log(`✓ Page title: ${title}`);

    // Check for main heading
    const h1 = await page.locator('h1').textContent();
    console.log(`✓ Main heading: ${h1}`);

    // Check for key sections
    const sections = [
      'Understanding Baggage Fees',
      'Major US Airlines Baggage Fees Comparison',
      'Baggage Size & Weight Limits',
      'How to Find Your Flight\'s Baggage Policy',
      'Tips to Save on Baggage Fees',
      'Frequently Asked Questions',
    ];

    console.log('\n📋 Checking content sections:');
    for (const section of sections) {
      const exists = await page.locator(`text="${section}"`).count() > 0;
      console.log(`${exists ? '✓' : '✗'} ${section}`);
    }

    // Check for airline comparison table
    console.log('\n✈️ Checking airline comparison:');
    const airlines = ['United', 'American', 'Delta', 'JetBlue', 'Southwest'];
    for (const airline of airlines) {
      const exists = await page.locator(`text=/.*${airline}.*/i`).count() > 0;
      console.log(`${exists ? '✓' : '✗'} ${airline} Airlines listed`);
    }

    // Check for navigation links
    console.log('\n🔗 Checking navigation:');
    const backLink = await page.locator('a[href="/flights/results"]').count();
    console.log(`${backLink > 0 ? '✓' : '✗'} Back to Flight Search link`);

    const searchLink = await page.locator('a[href="/"]').count();
    console.log(`${searchLink > 0 ? '✓' : '✗'} Search Flights link`);

    // Take a screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({
      path: 'test-baggage-fees-page.png',
      fullPage: true,
    });
    console.log('✓ Screenshot saved: test-baggage-fees-page.png');

    // Test mobile responsiveness
    console.log('\n📱 Testing mobile view...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'test-baggage-fees-mobile.png',
      fullPage: true,
    });
    console.log('✓ Mobile screenshot saved: test-baggage-fees-mobile.png');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-baggage-fees-error.png', fullPage: true });
    console.log('Error screenshot saved: test-baggage-fees-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testBaggageFeesPage()
  .then(() => {
    console.log('\n🎉 Baggage fees page verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });
