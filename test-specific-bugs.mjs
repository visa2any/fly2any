import { chromium } from '@playwright/test';

async function testSpecificBugs() {
  console.log('🚀 Testing USER-REPORTED BUGS with correct selectors...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    console.log('📍 Navigating to flight results...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for API and rendering
    await page.waitForResponse(response => response.url().includes('/api/flights/search'), { timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('✅ Page loaded\n');

    // Take initial screenshot
    await page.screenshot({ path: 'BUG-TEST-1-initial.png', fullPage: true });
    console.log('📸 Initial screenshot: BUG-TEST-1-initial.png\n');

    console.log('='.repeat(80));
    console.log('BUG #1: BRANDED FARE SELECT BUTTONS NOT WORKING');
    console.log('='.repeat(80));
    console.log('User says: "When click to upgrade the fare on the Button Select, nothing happens"');
    console.log('Looking for: Blue Basic, Blue, Blue Plus fare cards with Select buttons\n');

    // Scroll down to find branded fares widget
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(1000);

    // Look for "Compare Our Fares" or branded fare section
    const fareCards = await page.$$('button:has-text("Select"), button:has-text("Choose")');
    console.log(`Found ${fareCards.length} Select/Choose buttons on page\n`);

    if (fareCards.length > 0) {
      // Test first 3 Select buttons
      for (let i = 0; i < Math.min(3, fareCards.length); i++) {
        const button = fareCards[i];

        // Get parent container to understand context
        const parent = await button.$('xpath=ancestor::*[@class][1]');
        const parentClass = parent ? await parent.getAttribute('class') : 'unknown';

        console.log(`\nTesting Select button ${i + 1}:`);
        console.log(`  Parent class: ${parentClass?.substring(0, 50)}...`);

        const buttonText = await button.innerText();
        console.log(`  Button text: "${buttonText}"`);

        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        console.log(`  Visible: ${isVisible}, Enabled: ${isEnabled}`);

        if (isVisible && isEnabled) {
          // Screenshot before click
          await page.screenshot({ path: `BUG-1-before-click-${i + 1}.png`, fullPage: false });

          const urlBefore = page.url();
          console.log(`  URL before: ${urlBefore}`);

          // Click the button
          console.log(`  🖱️  Clicking Select button...`);
          await button.click();
          await page.waitForTimeout(2000);

          const urlAfter = page.url();
          console.log(`  URL after: ${urlAfter}`);
          console.log(`  URL changed: ${urlBefore !== urlAfter ? '✅ YES' : '❌ NO'}`);

          // Check for navigation, modals, or any UI change
          const modalAppeared = await page.$('[role="dialog"], .modal, [class*="Modal"]').then(el => !!el).catch(() => false);
          console.log(`  Modal appeared: ${modalAppeared ? '✅ YES' : '❌ NO'}`);

          // Check for any toast/notification
          const toastAppeared = await page.$('[role="alert"], [class*="toast"], [class*="Toast"]').then(el => !!el).catch(() => false);
          console.log(`  Toast/Alert appeared: ${toastAppeared ? '✅ YES' : '❌ NO'}`);

          // Screenshot after click
          await page.screenshot({ path: `BUG-1-after-click-${i + 1}.png`, fullPage: false });
          console.log(`  📸 Screenshots: BUG-1-before-click-${i + 1}.png and BUG-1-after-click-${i + 1}.png`);

          // Determine if bug exists
          if (urlBefore === urlAfter && !modalAppeared && !toastAppeared) {
            console.log(`  ⚠️  BUG CONFIRMED: Button does NOTHING! No navigation, no modal, no feedback.`);
          } else {
            console.log(`  ✅ Button appears to work (something changed)`);
          }
        }
      }
    } else {
      console.log('❌ No Select buttons found!');
    }

    console.log('\n' + '='.repeat(80));
    console.log('BUG #2: FARE BREAKDOWN HOVER OVERFLOW');
    console.log('='.repeat(80));
    console.log('User says: "The fare breakdown when hover the card with mouse is expanding');
    console.log('completely out of the card area, I don\'t really know how it works but');
    console.log('i can say its displaying in wrong position"\n');

    // Scroll back up to flight cards
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(1000);

    // Look for fare-related elements that might have hover states
    console.log('Looking for hoverable fare elements...');

    // Try different selectors
    const selectors = [
      'text=Blue Basic',
      'text=Blue',
      'text=Blue Plus',
      '[class*="fare"]',
      '[class*="Fare"]',
      'button:has-text("$")',
      '.price',
      '[class*="price"]'
    ];

    let hoverableElements = [];
    for (const selector of selectors) {
      const elements = await page.$$(selector).catch(() => []);
      if (elements.length > 0) {
        console.log(`  Found ${elements.length} elements matching: ${selector}`);
        hoverableElements.push(...elements);
      }
    }

    console.log(`\nTotal hoverable elements to test: ${hoverableElements.length}\n`);

    if (hoverableElements.length > 0) {
      // Test first 5 hover interactions
      for (let i = 0; i < Math.min(5, hoverableElements.length); i++) {
        const element = hoverableElements[i];
        const text = await element.innerText().catch(() => '');
        const boundingBox = await element.boundingBox();

        if (!boundingBox) continue;

        console.log(`Testing hover ${i + 1}:`);
        console.log(`  Text: "${text.substring(0, 40)}..."`);
        console.log(`  Position: x=${Math.round(boundingBox.x)}, y=${Math.round(boundingBox.y)}`);

        // Hover
        await element.hover();
        await page.waitForTimeout(1500);

        // Check for any tooltip/popover that appeared
        const tooltipSelectors = [
          '[role="tooltip"]',
          '[class*="tooltip"]',
          '[class*="Tooltip"]',
          '[class*="popover"]',
          '[class*="Popover"]',
          '[class*="dropdown"]',
          '[class*="Dropdown"]'
        ];

        let foundTooltip = false;
        for (const selector of tooltipSelectors) {
          const tooltips = await page.$$(selector);
          if (tooltips.length > 0) {
            for (const tooltip of tooltips) {
              const isVisible = await tooltip.isVisible().catch(() => false);
              if (isVisible) {
                foundTooltip = true;
                const tooltipBox = await tooltip.boundingBox();
                if (tooltipBox) {
                  console.log(`  ✅ Found visible tooltip/popover!`);
                  console.log(`     Position: x=${Math.round(tooltipBox.x)}, y=${Math.round(tooltipBox.y)}`);
                  console.log(`     Size: ${Math.round(tooltipBox.width)}x${Math.round(tooltipBox.height)}`);

                  // Check for overflow issues
                  const overflowsLeft = tooltipBox.x < 0;
                  const overflowsTop = tooltipBox.y < 0;
                  const overflowsRight = tooltipBox.x + tooltipBox.width > 1920;
                  const overflowsBottom = tooltipBox.y + tooltipBox.height > 1080;

                  const overflowsParent = tooltipBox.x < boundingBox.x - 50 ||
                                         tooltipBox.y < boundingBox.y - 50 ||
                                         tooltipBox.x + tooltipBox.width > boundingBox.x + boundingBox.width + 50 ||
                                         tooltipBox.y + tooltipBox.height > boundingBox.y + boundingBox.height + 200;

                  if (overflowsLeft || overflowsTop || overflowsRight || overflowsBottom) {
                    console.log(`  ⚠️  BUG: Tooltip overflows viewport!`);
                    console.log(`     Left: ${overflowsLeft}, Top: ${overflowsTop}, Right: ${overflowsRight}, Bottom: ${overflowsBottom}`);
                  }

                  if (overflowsParent) {
                    console.log(`  ⚠️  BUG: Tooltip positioned far from parent element!`);
                  }
                }
              }
            }
          }
        }

        // Screenshot hover state
        await page.screenshot({
          path: `BUG-2-hover-${i + 1}.png`,
          fullPage: false
        });
        console.log(`  📸 Screenshot: BUG-2-hover-${i + 1}.png`);
        console.log(`  Tooltip found: ${foundTooltip ? '✅ YES' : '❌ NO'}\n`);

        // Move mouse away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
      }
    }

    console.log('='.repeat(80));
    console.log('TESTING COMPLETE');
    console.log('='.repeat(80));
    console.log('\n✅ All screenshots saved to project root directory');
    console.log('Review BUG-* files to see issues\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'ERROR-test-crash.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testSpecificBugs();
