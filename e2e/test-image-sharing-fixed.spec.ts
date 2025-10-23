import { test, expect, Page } from '@playwright/test';

/**
 * FIXED IMAGE SHARING TEST SUITE
 * Updated to use correct selectors after investigation
 */

test.describe('Image Sharing System - Fixed Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Navigate to flight results
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy');

    // Wait for flights to load
    await page.waitForSelector('[data-flight-card]', { timeout: 60000 });

    console.log('✅ Page loaded successfully');
  });

  test('TEST 1: Verify share button exists using data-testid', async () => {
    console.log('\n🧪 TEST 1: Checking share button with correct selector...');

    const shareButton = page.locator('[data-testid="share-button"]').first();
    const isVisible = await shareButton.isVisible();

    console.log(`Share button visible: ${isVisible ? '✅' : '❌'}`);

    await page.screenshot({ path: 'test-results/fixed-01-share-button.png', fullPage: true });

    expect(isVisible, 'Share button should be visible').toBe(true);
  });

  test('TEST 2: Click share button and verify modal opens', async () => {
    console.log('\n🧪 TEST 2: Testing share modal with correct selector...');

    const shareButton = page.locator('[data-testid="share-button"]').first();
    await shareButton.click();
    console.log('✅ Clicked share button');

    await page.waitForTimeout(500);

    // Check for modal
    const modalVisible = await page.locator('text=/Share Flight/i').isVisible().catch(() => false);

    console.log(`Share modal visible: ${modalVisible ? '✅' : '❌'}`);

    await page.screenshot({ path: 'test-results/fixed-02-share-modal.png', fullPage: true });

    expect(modalVisible, 'Share modal should open').toBe(true);
  });

  test('TEST 3: Expand card using Details button and verify', async () => {
    console.log('\n🧪 TEST 3: Expanding card with Details button...');

    const firstCard = page.locator('[data-flight-card]').first();
    const initialBox = await firstCard.boundingBox();
    console.log(`Initial card height: ${initialBox?.height}px`);

    // Click the Details button (not the card itself)
    const detailsButton = page.locator('[data-testid="expand-details-button"]').first();
    await detailsButton.click();
    console.log('✅ Clicked Details button');

    await page.waitForTimeout(1000);

    const expandedBox = await firstCard.boundingBox();
    console.log(`Expanded card height: ${expandedBox?.height}px`);

    // Check if card has expanded class
    const hasExpandedClass = await firstCard.evaluate(el => el.classList.contains('flight-card-expanded'));
    console.log(`Has 'flight-card-expanded' class: ${hasExpandedClass ? '✅' : '❌'}`);

    await page.screenshot({ path: 'test-results/fixed-03-card-expanded.png', fullPage: true });

    const heightIncreased = expandedBox && initialBox && expandedBox.height > initialBox.height + 100;

    console.log(`Card expanded significantly: ${heightIncreased ? '✅' : '❌'}`);

    expect(hasExpandedClass, 'Card should have expanded class').toBe(true);
    expect(heightIncreased, 'Card should expand by at least 100px').toBe(true);
  });

  test('TEST 4: Complete flow - Expand, Share, Capture, Platform Picker', async () => {
    console.log('\n🧪 TEST 4: Complete image sharing flow...');

    // Step 1: Expand card
    const detailsButton = page.locator('[data-testid="expand-details-button"]').first();
    await detailsButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Step 1: Card expanded');

    await page.screenshot({ path: 'test-results/fixed-04-step1-expanded.png', fullPage: true });

    // Step 2: Click share button
    const shareButton = page.locator('[data-testid="share-button"]').first();
    await shareButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Step 2: Share modal opened');

    await page.screenshot({ path: 'test-results/fixed-04-step2-modal.png', fullPage: true });

    // Step 3: Click "Share as Image"
    const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();
    const isShareImageVisible = await shareAsImageButton.isVisible();

    if (!isShareImageVisible) {
      console.log('❌ ERROR: Share as Image button not found');
      await page.screenshot({ path: 'test-results/fixed-04-ERROR-no-button.png', fullPage: true });
      throw new Error('Share as Image button not found');
    }

    await shareAsImageButton.click();
    console.log('✅ Step 3: Clicked "Share as Image"');
    console.log('⏳ Waiting for image capture (3 seconds)...');

    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/fixed-04-step3-capturing.png', fullPage: true });

    // Step 4: Check for platform picker
    const platformPickerVisible = await page.locator('text=/Quick Share|Download|Choose how to share/i').isVisible().catch(() => false);

    console.log(`Platform picker visible: ${platformPickerVisible ? '✅' : '❌'}`);

    await page.screenshot({ path: 'test-results/fixed-04-step4-platform-picker.png', fullPage: true });

    // Check console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    if (!platformPickerVisible) {
      console.log('\n📝 Console logs during capture:');
      consoleLogs.slice(-10).forEach(log => console.log(`  ${log}`));
    }

    expect(platformPickerVisible, 'Platform picker should appear').toBe(true);
  });

  test('TEST 5: Verify platform buttons in picker', async () => {
    console.log('\n🧪 TEST 5: Checking all platform buttons...');

    // Expand card
    await page.locator('[data-testid="expand-details-button"]').first().click();
    await page.waitForTimeout(1000);

    // Open share modal
    await page.locator('[data-testid="share-button"]').first().click();
    await page.waitForTimeout(500);

    // Click Share as Image
    await page.locator('button').filter({ hasText: /Share as Image/i }).first().click();
    await page.waitForTimeout(3000);

    // Check for all platforms
    const expectedPlatforms = [
      'Quick Share',
      'Download',
      'WhatsApp',
      'Instagram',
      'Facebook',
      'Twitter'
    ];

    console.log('\n📊 Platform buttons found:');
    const foundPlatforms: string[] = [];

    for (const platform of expectedPlatforms) {
      const button = page.locator('button').filter({ hasText: new RegExp(platform, 'i') });
      const count = await button.count();
      const isVisible = count > 0 && await button.first().isVisible().catch(() => false);

      console.log(`  ${platform}: ${isVisible ? '✅' : '❌'} (found ${count} buttons)`);

      if (isVisible) foundPlatforms.push(platform);
    }

    await page.screenshot({ path: 'test-results/fixed-05-all-platforms.png', fullPage: true });

    console.log(`\nTotal found: ${foundPlatforms.length}/${expectedPlatforms.length}`);

    expect(foundPlatforms.length, 'Should find at least 4 platform buttons').toBeGreaterThanOrEqual(4);
  });

  test('TEST 6: Test Download functionality', async () => {
    console.log('\n🧪 TEST 6: Testing Download button...');

    // Full setup
    await page.locator('[data-testid="expand-details-button"]').first().click();
    await page.waitForTimeout(1000);

    await page.locator('[data-testid="share-button"]').first().click();
    await page.waitForTimeout(500);

    await page.locator('button').filter({ hasText: /Share as Image/i }).first().click();
    await page.waitForTimeout(3000);

    // Click Download
    const downloadButton = page.locator('button').filter({ hasText: 'Download' }).first();

    if (await downloadButton.isVisible()) {
      console.log('✅ Download button found');

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      await downloadButton.click();
      console.log('🔄 Clicked Download');

      await page.waitForTimeout(2000);

      // Check for success message
      const successVisible = await page.locator('text=/downloaded|success|✅/i').isVisible().catch(() => false);

      console.log(`Success message: ${successVisible ? '✅' : '❌'}`);

      await page.screenshot({ path: 'test-results/fixed-06-download-result.png', fullPage: true });

      const download = await downloadPromise;
      if (download) {
        console.log(`✅ Download triggered: ${download.suggestedFilename()}`);
      }

      expect(successVisible, 'Success message should appear').toBe(true);
    } else {
      console.log('❌ Download button not visible');
      await page.screenshot({ path: 'test-results/fixed-06-ERROR.png', fullPage: true });
      throw new Error('Download button not found');
    }
  });

  test('TEST 7: Test with collapsed card (no expansion)', async () => {
    console.log('\n🧪 TEST 7: Testing with COLLAPSED card...');

    // DO NOT expand - go directly to share
    const shareButton = page.locator('[data-testid="share-button"]').first();
    await shareButton.click();
    await page.waitForTimeout(500);

    console.log('✅ Share modal opened (card still collapsed)');

    await page.locator('button').filter({ hasText: /Share as Image/i }).first().click();
    console.log('⏳ Capturing collapsed card...');

    await page.waitForTimeout(3000);

    const platformPickerVisible = await page.locator('text=/Quick Share|Download/i').isVisible().catch(() => false);

    console.log(`Platform picker appeared: ${platformPickerVisible ? '✅' : '❌'}`);

    await page.screenshot({ path: 'test-results/fixed-07-collapsed-capture.png', fullPage: true });

    expect(platformPickerVisible, 'Should work with collapsed cards').toBe(true);
  });

  test('TEST 8: Verify image preview in platform picker', async () => {
    console.log('\n🧪 TEST 8: Checking image preview...');

    await page.locator('[data-testid="expand-details-button"]').first().click();
    await page.waitForTimeout(1000);

    await page.locator('[data-testid="share-button"]').first().click();
    await page.waitForTimeout(500);

    await page.locator('button').filter({ hasText: /Share as Image/i }).first().click();
    await page.waitForTimeout(3000);

    // Check for image preview
    const imagePreview = page.locator('img[alt*="preview"], img[src^="blob:"]').first();
    const hasPreview = await imagePreview.isVisible().catch(() => false);

    console.log(`Image preview: ${hasPreview ? '✅ Found' : '❌ Not found'}`);

    if (hasPreview) {
      const src = await imagePreview.getAttribute('src');
      console.log(`Image source type: ${src?.substring(0, 20)}...`);
    }

    await page.screenshot({ path: 'test-results/fixed-08-image-preview.png', fullPage: true });

    expect(hasPreview, 'Image preview should be visible').toBe(true);
  });

  test.afterEach(async () => {
    await page.close();
  });
});

test('SUMMARY: All fixed tests completed', async () => {
  console.log('\n' + '='.repeat(80));
  console.log('✅ FIXED TEST SUITE COMPLETED');
  console.log('='.repeat(80));
  console.log('\nKey improvements:');
  console.log('  1. Using data-testid selectors for reliable element finding');
  console.log('  2. Clicking Details button instead of card div');
  console.log('  3. Proper waiting for image capture');
  console.log('  4. Better error handling and screenshots');
  console.log('\n' + '='.repeat(80));
});
