import { chromium } from '@playwright/test';

async function testRealIssues() {
  console.log('🚀 Starting REAL UI issue testing with proper waits...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || text.includes('error') || text.includes('Error')) {
      consoleLogs.push(`[${msg.type()}] ${text}`);
    }
  });

  // Capture network errors
  const networkErrors = [];
  page.on('response', async response => {
    if (!response.ok() && response.url().includes('api')) {
      try {
        const body = await response.text();
        networkErrors.push(`${response.status()} - ${response.url()}: ${body.substring(0, 200)}`);
      } catch (e) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    }
  });

  try {
    console.log('📍 Navigating to flight results page...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy');

    console.log('⏳ Waiting for flight data to load (checking for API call)...');

    // Wait for API call to complete (either success or failure)
    const apiResponse = await page.waitForResponse(
      response => response.url().includes('/api/flights/search') && response.request().method() === 'POST',
      { timeout: 30000 }
    ).catch(() => null);

    if (apiResponse) {
      const status = apiResponse.status();
      console.log(`✅ API Response received: ${status}`);

      if (status === 200) {
        console.log('✅ Flight data loaded successfully\n');
      } else {
        console.log(`❌ API returned error status: ${status}\n`);
        const body = await apiResponse.text();
        console.log('Error response:', body.substring(0, 500), '\n');
      }
    } else {
      console.log('❌ No API call detected!\n');
    }

    // Wait for flight cards to appear (or timeout if they don't)
    console.log('⏳ Waiting for flight cards to render...');
    const flightCardsAppeared = await page.waitForSelector('[class*="glass"], article, [data-testid="flight-card"]', {
      timeout: 15000,
      state: 'visible'
    }).then(() => true).catch(() => false);

    if (!flightCardsAppeared) {
      console.log('❌ No flight cards appeared! Taking screenshot...\n');
      await page.screenshot({ path: 'ERROR-no-flight-cards.png', fullPage: true });

      console.log('Current page state:');
      const bodyText = await page.$eval('body', el => el.innerText).catch(() => 'Could not get text');
      console.log(bodyText.substring(0, 1000));

      console.log('\n❌ Cannot test user-reported issues because flight cards not loading!');
      return;
    }

    console.log('✅ Flight cards rendered!\n');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'TEST-1-initial-page.png', fullPage: false });
    console.log('📸 Screenshot: TEST-1-initial-page.png\n');

    console.log('='.repeat(80));
    console.log('USER ISSUE #1: FARE BREAKDOWN HOVER OVERFLOW');
    console.log('='.repeat(80));

    // Look for branded fare elements
    const fareElements = await page.$$('button:has-text("Blue"), button:has-text("Basic"), button:has-text("Standard"), button:has-text("Premium"), [class*="fare"], [class*="Fare"]');
    console.log(`Found ${fareElements.length} potential fare elements\n`);

    if (fareElements.length > 0) {
      for (let i = 0; i < Math.min(3, fareElements.length); i++) {
        const element = fareElements[i];
        const boundingBox = await element.boundingBox();

        if (!boundingBox) continue;

        console.log(`Testing element ${i + 1}:`);
        const text = await element.textContent();
        console.log(`  Text: "${text?.substring(0, 40)}..."`);
        console.log(`  Position: x=${boundingBox.x}, y=${boundingBox.y}`);

        // Hover over the element
        await element.hover();
        await page.waitForTimeout(1500);

        // Check if any tooltips or popovers appeared
        const tooltips = await page.$$('[role="tooltip"], [class*="tooltip"], [class*="Tooltip"], [class*="popover"], [class*="Popover"]');
        console.log(`  Tooltips/Popovers appeared: ${tooltips.length}`);

        if (tooltips.length > 0) {
          for (const tooltip of tooltips) {
            const tooltipBox = await tooltip.boundingBox();
            if (tooltipBox) {
              console.log(`    Tooltip position: x=${tooltipBox.x}, y=${tooltipBox.y}, width=${tooltipBox.width}, height=${tooltipBox.height}`);

              // Check if tooltip overflows card
              const isOverflowing = tooltipBox.x < 0 || tooltipBox.y < 0 ||
                                   tooltipBox.x + tooltipBox.width > 1920 ||
                                   tooltipBox.y + tooltipBox.height > 1080;
              console.log(`    Overflowing viewport: ${isOverflowing ? '⚠️ YES' : '✅ NO'}`);
            }
          }
        }

        // Screenshot
        await page.screenshot({
          path: `TEST-ISSUE-1-fare-hover-${i + 1}.png`,
          fullPage: false
        });
        console.log(`  📸 Screenshot: TEST-ISSUE-1-fare-hover-${i + 1}.png\n`);

        // Move mouse away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
      }
    } else {
      console.log('❌ No fare elements found to test!\n');
    }

    console.log('='.repeat(80));
    console.log('USER ISSUE #2: SELECT BUTTON NOT WORKING');
    console.log('='.repeat(80));

    // First expand a flight card
    const detailsButton = await page.$('button:has-text("Details"), button:has-text("View Details")').catch(() => null);

    if (detailsButton) {
      console.log('✅ Found Details button, clicking to expand...');
      await detailsButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: 'TEST-2-flight-expanded.png',
        fullPage: false
      });
      console.log('📸 Screenshot: TEST-2-flight-expanded.png\n');
    }

    // Now look for Select buttons
    const selectButtons = await page.$$('button:has-text("Select")');
    console.log(`Found ${selectButtons.length} Select buttons\n`);

    if (selectButtons.length > 0) {
      for (let i = 0; i < Math.min(2, selectButtons.length); i++) {
        const button = selectButtons[i];
        const text = await button.innerText();
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();

        console.log(`Button ${i + 1}:`);
        console.log(`  Text: "${text}"`);
        console.log(`  Visible: ${isVisible}`);
        console.log(`  Enabled: ${isEnabled}`);

        if (isVisible && isEnabled) {
          const urlBefore = page.url();
          console.log(`  URL before click: ${urlBefore}`);

          // Click the button
          console.log(`  🖱️  Clicking...`);
          await button.click();
          await page.waitForTimeout(2000);

          const urlAfter = page.url();
          console.log(`  URL after click: ${urlAfter}`);
          console.log(`  Did URL change? ${urlBefore !== urlAfter ? '✅ YES' : '❌ NO'}`);

          // Check for modals
          const modalVisible = await page.$('[role="dialog"], [class*="modal"], [class*="Modal"]').then(el => !!el).catch(() => false);
          console.log(`  Modal appeared? ${modalVisible ? '✅ YES' : '❌ NO'}`);

          // Check console logs for any navigation messages
          console.log(`  Console logs after click: ${consoleLogs.filter(log => !log.includes('DevTools')).length} errors`);

          await page.screenshot({
            path: `TEST-ISSUE-2-select-clicked-${i + 1}.png`,
            fullPage: false
          });
          console.log(`  📸 Screenshot: TEST-ISSUE-2-select-clicked-${i + 1}.png\n`);

          // If URL didn't change and no modal, this is the bug!
          if (urlBefore === urlAfter && !modalVisible) {
            console.log(`  ⚠️  BUG CONFIRMED: Button does nothing!\n`);
          }
        }
      }
    } else {
      console.log('❌ No Select buttons found!\n');
    }

    // Final summary
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));

    if (networkErrors.length > 0) {
      console.log('\n❌ Network Errors:');
      networkErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ No network errors');
    }

    if (consoleLogs.length > 0) {
      console.log('\n❌ Console Errors:');
      consoleLogs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('\n✅ No console errors');
    }

    console.log('\n✅ Testing complete! Review screenshots in project root.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'ERROR-test-failed.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testRealIssues();
