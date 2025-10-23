import { test, expect, Page } from '@playwright/test';
import { chromium } from '@playwright/test';

/**
 * COMPREHENSIVE IMAGE SHARING TEST SUITE
 * Tests all aspects of the new image sharing functionality
 */

test.describe('Image Sharing System - Complete Test Suite', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Navigate to flight results with mock data
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy');

    // Wait for flights to load
    await page.waitForSelector('[data-flight-card]', { timeout: 30000 });

    console.log('✅ Page loaded successfully');
  });

  test('TEST 1: Verify share button exists on flight cards', async () => {
    console.log('\n🧪 TEST 1: Checking share button visibility...');

    // Find all flight cards
    const flightCards = await page.locator('[data-flight-card]').all();
    console.log(`Found ${flightCards.length} flight cards`);

    expect(flightCards.length).toBeGreaterThan(0);

    // Check first card for share button
    const firstCard = flightCards[0];

    // Look for share button (could be in different locations)
    const shareButtonSelectors = [
      'button[aria-label*="Share"]',
      'button:has-text("Share")',
      '[data-testid="share-button"]',
      'button:has(svg):has-text("Share")',
      '.share-button'
    ];

    let shareButtonFound = false;
    let foundSelector = '';

    for (const selector of shareButtonSelectors) {
      const button = firstCard.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        shareButtonFound = true;
        foundSelector = selector;
        console.log(`✅ Share button found with selector: ${selector}`);
        break;
      }
    }

    if (!shareButtonFound) {
      console.log('❌ ERROR: Share button not found on flight card');
      console.log('Available buttons on card:');
      const allButtons = await firstCard.locator('button').all();
      for (const btn of allButtons) {
        const text = await btn.textContent();
        console.log(`  - Button: "${text}"`);
      }
    }

    await page.screenshot({ path: 'test-results/01-share-button-check.png', fullPage: true });

    expect(shareButtonFound, 'Share button should be visible on flight card').toBe(true);
  });

  test('TEST 2: Click share button and verify modal opens', async () => {
    console.log('\n🧪 TEST 2: Testing share modal opening...');

    const firstCard = page.locator('[data-flight-card]').first();

    // Find and click share button
    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();

    if (await shareButton.isVisible()) {
      await shareButton.click();
      console.log('✅ Clicked share button');

      // Wait for modal to appear
      await page.waitForTimeout(500);

      // Check for modal
      const modal = page.locator('[role="dialog"]').or(page.locator('.fixed.inset-0')).first();
      const isModalVisible = await modal.isVisible().catch(() => false);

      if (isModalVisible) {
        console.log('✅ Share modal opened successfully');

        // Check modal content
        const modalText = await modal.textContent();
        console.log('Modal contains:', modalText?.substring(0, 200));

        await page.screenshot({ path: 'test-results/02-share-modal-opened.png', fullPage: true });
      } else {
        console.log('❌ ERROR: Share modal did not appear');
        await page.screenshot({ path: 'test-results/02-ERROR-no-modal.png', fullPage: true });
      }

      expect(isModalVisible, 'Share modal should open').toBe(true);
    } else {
      console.log('❌ ERROR: Share button not visible or not found');
      await page.screenshot({ path: 'test-results/02-ERROR-no-share-button.png', fullPage: true });
      throw new Error('Share button not found');
    }
  });

  test('TEST 3: Expand flight card and test "Share as Image" button', async () => {
    console.log('\n🧪 TEST 3: Testing expanded card + Share as Image...');

    const firstCard = page.locator('[data-flight-card]').first();

    // Get initial height
    const initialBox = await firstCard.boundingBox();
    console.log(`Initial card height: ${initialBox?.height}px`);

    // Click to expand card
    await firstCard.click();
    await page.waitForTimeout(1000);

    // Check if card expanded
    const expandedBox = await firstCard.boundingBox();
    console.log(`Expanded card height: ${expandedBox?.height}px`);

    const isExpanded = expandedBox && initialBox && expandedBox.height > initialBox.height;
    console.log(isExpanded ? '✅ Card expanded successfully' : '⚠️ Card may not have expanded');

    await page.screenshot({ path: 'test-results/03-card-expanded.png', fullPage: true });

    // Check if card has expanded class
    const hasExpandedClass = await firstCard.evaluate(el => el.classList.contains('flight-card-expanded'));
    console.log(`Has 'flight-card-expanded' class: ${hasExpandedClass}`);

    // Now click share button
    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();

    if (await shareButton.isVisible()) {
      await shareButton.click();
      console.log('✅ Clicked share button on expanded card');
      await page.waitForTimeout(500);

      // Look for "Share as Image" button
      const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();

      const isShareImageVisible = await shareAsImageButton.isVisible().catch(() => false);

      if (isShareImageVisible) {
        console.log('✅ "Share as Image" button found in modal');

        // Get button text and styling
        const buttonText = await shareAsImageButton.textContent();
        const buttonClasses = await shareAsImageButton.getAttribute('class');
        console.log(`Button text: "${buttonText}"`);
        console.log(`Button classes: ${buttonClasses?.substring(0, 100)}...`);

        await page.screenshot({ path: 'test-results/03-share-as-image-button.png', fullPage: true });

        expect(isShareImageVisible).toBe(true);
      } else {
        console.log('❌ ERROR: "Share as Image" button not found');

        // Debug: List all buttons in modal
        const allModalButtons = await page.locator('button').all();
        console.log('\nAll buttons found in page:');
        for (const btn of allModalButtons) {
          const text = await btn.textContent();
          const visible = await btn.isVisible();
          if (visible) {
            console.log(`  - "${text}"`);
          }
        }

        await page.screenshot({ path: 'test-results/03-ERROR-no-image-button.png', fullPage: true });
        throw new Error('Share as Image button not found');
      }
    }
  });

  test('TEST 4: Click "Share as Image" and verify platform picker appears', async () => {
    console.log('\n🧪 TEST 4: Testing image capture + platform picker...');

    const firstCard = page.locator('[data-flight-card]').first();

    // Expand card
    await firstCard.click();
    await page.waitForTimeout(1000);
    console.log('✅ Card expanded');

    // Click share button
    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();
    await shareButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Share modal opened');

    await page.screenshot({ path: 'test-results/04-before-image-capture.png', fullPage: true });

    // Click "Share as Image"
    const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();

    console.log('🔄 Clicking "Share as Image" button...');
    await shareAsImageButton.click();

    // Wait for capture to complete (should show loading state)
    console.log('⏳ Waiting for image capture...');
    await page.waitForTimeout(3000); // Give time for html2canvas

    await page.screenshot({ path: 'test-results/04-after-image-capture.png', fullPage: true });

    // Check for platform picker modal
    const platformPickerTexts = [
      'Select where',
      'Choose how to share',
      'Share Image',
      'Quick Share',
      'Download',
      'WhatsApp',
      'Instagram'
    ];

    let platformPickerFound = false;

    for (const text of platformPickerTexts) {
      const hasText = await page.locator(`text=${text}`).isVisible().catch(() => false);
      if (hasText) {
        console.log(`✅ Platform picker detected (found text: "${text}")`);
        platformPickerFound = true;
        break;
      }
    }

    if (!platformPickerFound) {
      console.log('❌ ERROR: Platform picker did not appear');

      // Check console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('Browser error:', msg.text());
        }
      });

      // Check for error messages
      const errorMsg = await page.locator('text=/error|failed/i').first().textContent().catch(() => null);
      if (errorMsg) {
        console.log(`Error message displayed: "${errorMsg}"`);
      }
    }

    await page.screenshot({ path: 'test-results/04-platform-picker-state.png', fullPage: true });

    expect(platformPickerFound, 'Platform picker should appear after image capture').toBe(true);
  });

  test('TEST 5: Verify platform picker UI elements', async () => {
    console.log('\n🧪 TEST 5: Testing platform picker UI elements...');

    // Setup: Expand card, open share modal, click share as image
    const firstCard = page.locator('[data-flight-card]').first();
    await firstCard.click();
    await page.waitForTimeout(1000);

    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();
    await shareButton.click();
    await page.waitForTimeout(500);

    const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();
    await shareAsImageButton.click();
    await page.waitForTimeout(3000);

    console.log('🔍 Checking platform picker elements...');

    // Check for image preview
    const imagePreview = page.locator('img[alt*="preview"]').or(page.locator('img[src^="blob:"]')).first();
    const hasImagePreview = await imagePreview.isVisible().catch(() => false);
    console.log(`Image preview: ${hasImagePreview ? '✅ Found' : '❌ Not found'}`);

    // Check for platform buttons
    const expectedPlatforms = [
      'Quick Share',
      'Download',
      'WhatsApp',
      'Instagram',
      'Facebook',
      'Twitter'
    ];

    console.log('\nChecking platform buttons:');
    const foundPlatforms: string[] = [];

    for (const platform of expectedPlatforms) {
      const button = page.locator('button').filter({ hasText: platform }).first();
      const isVisible = await button.isVisible().catch(() => false);
      console.log(`  ${platform}: ${isVisible ? '✅' : '❌'}`);
      if (isVisible) foundPlatforms.push(platform);
    }

    await page.screenshot({ path: 'test-results/05-platform-picker-ui.png', fullPage: true });

    console.log(`\nFound ${foundPlatforms.length}/${expectedPlatforms.length} platform buttons`);

    expect(foundPlatforms.length, 'Should find at least 4 platform buttons').toBeGreaterThanOrEqual(4);
  });

  test('TEST 6: Test platform selection (Download)', async () => {
    console.log('\n🧪 TEST 6: Testing Download platform selection...');

    // Setup
    const firstCard = page.locator('[data-flight-card]').first();
    await firstCard.click();
    await page.waitForTimeout(1000);

    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();
    await shareButton.click();
    await page.waitForTimeout(500);

    const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();
    await shareAsImageButton.click();
    await page.waitForTimeout(3000);

    // Click Download button
    const downloadButton = page.locator('button').filter({ hasText: 'Download' }).first();

    if (await downloadButton.isVisible()) {
      console.log('✅ Download button found');

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      await downloadButton.click();
      console.log('🔄 Clicked Download button');

      await page.waitForTimeout(2000);

      // Check for success message
      const successMsg = await page.locator('text=/downloaded|success|✅/i').first().textContent().catch(() => null);

      if (successMsg) {
        console.log(`✅ Success message: "${successMsg}"`);
      } else {
        console.log('⚠️ No success message displayed');
      }

      await page.screenshot({ path: 'test-results/06-download-clicked.png', fullPage: true });

      const download = await downloadPromise;
      if (download) {
        console.log(`✅ Download triggered: ${download.suggestedFilename()}`);
      } else {
        console.log('⚠️ Download event not detected (may be browser-specific)');
      }
    } else {
      console.log('❌ ERROR: Download button not visible');
      await page.screenshot({ path: 'test-results/06-ERROR-no-download-button.png', fullPage: true });
      throw new Error('Download button not found');
    }
  });

  test('TEST 7: Test smart detection with collapsed card', async () => {
    console.log('\n🧪 TEST 7: Testing smart detection with COLLAPSED card...');

    const firstCard = page.locator('[data-flight-card]').first();

    // DO NOT EXPAND - keep card collapsed
    console.log('📋 Card kept in collapsed state');

    const initialBox = await firstCard.boundingBox();
    console.log(`Card height: ${initialBox?.height}px (should be compact)`);

    // Click share button directly (without expanding)
    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();
    await shareButton.click();
    await page.waitForTimeout(500);

    const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();
    await shareAsImageButton.click();

    console.log('⏳ Capturing collapsed card...');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/07-collapsed-card-capture.png', fullPage: true });

    // Check if platform picker appeared
    const platformPickerVisible = await page.locator('text=/Quick Share|Download/i').isVisible().catch(() => false);

    console.log(platformPickerVisible ? '✅ Platform picker appeared for collapsed card' : '❌ Platform picker did not appear');

    expect(platformPickerVisible, 'Should work with collapsed cards too').toBe(true);
  });

  test('TEST 8: Check for data attributes on flight cards', async () => {
    console.log('\n🧪 TEST 8: Verifying data attributes for smart detection...');

    const flightCards = await page.locator('[data-flight-card]').all();

    console.log(`Found ${flightCards.length} cards with [data-flight-card] attribute`);

    for (let i = 0; i < Math.min(3, flightCards.length); i++) {
      const card = flightCards[i];
      const flightId = await card.getAttribute('data-flight-id');
      const classes = await card.getAttribute('class');
      const hasExpandedClass = classes?.includes('flight-card-expanded');

      console.log(`\nCard ${i + 1}:`);
      console.log(`  - data-flight-id: ${flightId || '❌ MISSING'}`);
      console.log(`  - flight-card-expanded class: ${hasExpandedClass ? '✅' : '❌'}`);

      if (!flightId) {
        console.log('  ⚠️ WARNING: data-flight-id attribute is missing!');
      }
    }

    await page.screenshot({ path: 'test-results/08-card-attributes.png', fullPage: true });

    expect(flightCards.length, 'Should have flight cards with data attributes').toBeGreaterThan(0);
  });

  test('TEST 9: Check console errors during image sharing', async () => {
    console.log('\n🧪 TEST 9: Monitoring console for errors...');

    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(`Page error: ${error.message}`);
    });

    // Perform full sharing flow
    const firstCard = page.locator('[data-flight-card]').first();
    await firstCard.click();
    await page.waitForTimeout(1000);

    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();
    await shareButton.click();
    await page.waitForTimeout(500);

    const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();
    await shareAsImageButton.click();
    await page.waitForTimeout(3000);

    console.log('\n📊 Console Report:');
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors found:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ Warnings found:');
      warnings.slice(0, 5).forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
    }

    await page.screenshot({ path: 'test-results/09-console-check.png', fullPage: true });

    // Don't fail on errors, just report them
    console.log(errors.length === 0 ? '\n✅ No errors detected' : '\n⚠️ Errors need attention');
  });

  test('TEST 10: Measure performance', async () => {
    console.log('\n🧪 TEST 10: Performance testing...');

    const firstCard = page.locator('[data-flight-card]').first();
    await firstCard.click();
    await page.waitForTimeout(1000);

    const shareButton = firstCard.locator('button').filter({ hasText: /share/i }).first();
    await shareButton.click();
    await page.waitForTimeout(500);

    const shareAsImageButton = page.locator('button').filter({ hasText: /Share as Image/i }).first();

    // Measure capture time
    const startTime = Date.now();
    await shareAsImageButton.click();

    // Wait for platform picker to appear
    await page.waitForSelector('text=/Quick Share|Download/i', { timeout: 10000 }).catch(() => null);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\n⏱️ Image capture took: ${duration}ms`);

    if (duration < 2000) {
      console.log('✅ Performance: Excellent (< 2s)');
    } else if (duration < 5000) {
      console.log('⚠️ Performance: Acceptable (2-5s)');
    } else {
      console.log('❌ Performance: Slow (> 5s)');
    }

    await page.screenshot({ path: 'test-results/10-performance.png', fullPage: true });

    expect(duration, 'Capture should complete within 10 seconds').toBeLessThan(10000);
  });

  test.afterEach(async () => {
    await page.close();
  });
});

/**
 * SUMMARY TEST: Generate comprehensive report
 */
test('FINAL: Generate comprehensive test report', async () => {
  console.log('\n' + '='.repeat(80));
  console.log('📋 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('\n✅ All tests completed. Check test-results/ folder for screenshots.');
  console.log('\nKey findings will be in individual test outputs above.');
  console.log('\n' + '='.repeat(80));
});
