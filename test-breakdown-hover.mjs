import { chromium } from '@playwright/test';
import fs from 'fs';

async function testBreakdownHover() {
  console.log('🚀 Testing BREAKDOWN HOVER and all interactive elements...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 600
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const report = {
    bugsFound: [],
    testsRun: 0,
    timestamp: new Date().toISOString()
  };

  try {
    console.log('📍 Navigating to flight results...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForResponse(r => r.url().includes('/api/flights/search'), { timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded\n');

    console.log('='.repeat(80));
    console.log('STEP 1: Expand a flight card');
    console.log('='.repeat(80));

    const detailsButtons = await page.$$('button:has-text("Details")');
    if (detailsButtons.length === 0) {
      console.log('❌ No Details buttons found!');
      return;
    }

    console.log(`Found ${detailsButtons.length} Details buttons`);
    console.log('🖱️  Clicking first one...');
    await detailsButtons[0].click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'HOVER-TEST-1-expanded.png', fullPage: false });
    console.log('📸 Screenshot: HOVER-TEST-1-expanded.png\n');

    console.log('='.repeat(80));
    console.log('STEP 2: Test BREAKDOWN section hover (USER REPORTED BUG)');
    console.log('='.repeat(80));

    // Find "Breakdown" text or score elements
    const breakdownElements = await page.$$('text=Breakdown, [class*="breakdown"], [class*="Breakdown"], text=/\\d+\\/\\d+/');
    console.log(`Found ${breakdownElements.length} breakdown-related elements\n`);

    report.testsRun++;

    if (breakdownElements.length > 0) {
      for (let i = 0; i < Math.min(3, breakdownElements.length); i++) {
        const element = breakdownElements[i];
        const text = await element.innerText().catch(() => '');
        const box = await element.boundingBox();

        if (!box) continue;

        console.log(`Test ${i + 1}: Hovering "${text.substring(0, 30)}..." at (${Math.round(box.x)}, ${Math.round(box.y)})`);

        // Hover over element
        await element.hover();
        await page.waitForTimeout(1500);

        // Check for tooltips/popovers
        const tooltips = await page.$$('[role="tooltip"], [class*="tooltip"], [class*="Tooltip"], [class*="popover"], [class*="Popover"], [class*="dropdown"], [class*="Dropdown"]');

        console.log(`  Tooltips appeared: ${tooltips.length}`);

        for (const tooltip of tooltips) {
          const isVisible = await tooltip.isVisible().catch(() => false);
          if (isVisible) {
            const tooltipBox = await tooltip.boundingBox();
            if (tooltipBox) {
              console.log(`  ✅ Visible tooltip found:`);
              console.log(`     Position: (${Math.round(tooltipBox.x)}, ${Math.round(tooltipBox.y)})`);
              console.log(`     Size: ${Math.round(tooltipBox.width)}x${Math.round(tooltipBox.height)}`);

              // Check for overflow
              const overflowsViewport =
                tooltipBox.x < 0 ||
                tooltipBox.y < 0 ||
                tooltipBox.x + tooltipBox.width > 1920 ||
                tooltipBox.y + tooltipBox.height > 1080;

              // Check if tooltip is far from parent (bad positioning)
              const distanceX = Math.abs(tooltipBox.x - box.x);
              const distanceY = Math.abs(tooltipBox.y - box.y);
              const isFarAway = distanceX > 500 || distanceY > 500;

              if (overflowsViewport) {
                console.log(`  ⚠️  🐛 BUG: Tooltip overflows viewport!`);
                report.bugsFound.push({
                  type: 'Tooltip Overflow - Viewport',
                  element: text.substring(0, 50),
                  details: `Tooltip at (${Math.round(tooltipBox.x)}, ${Math.round(tooltipBox.y)}) overflows viewport`
                });
              }

              if (isFarAway) {
                console.log(`  ⚠️  🐛 BUG: Tooltip positioned too far from parent!`);
                console.log(`     Distance: X=${distanceX}px, Y=${distanceY}px`);
                report.bugsFound.push({
                  type: 'Tooltip Positioning - Too Far',
                  element: text.substring(0, 50),
                  details: `Tooltip ${distanceX}px away horizontally, ${distanceY}px vertically`
                });
              }

              // Check if tooltip extends outside flight card
              const cardElement = await page.$('[class*="card"], [class*="flight"], article').catch(() => null);
              if (cardElement) {
                const cardBox = await cardElement.boundingBox();
                if (cardBox) {
                  const overflowsCard =
                    tooltipBox.x < cardBox.x - 20 ||
                    tooltipBox.y < cardBox.y - 20 ||
                    tooltipBox.x + tooltipBox.width > cardBox.x + cardBox.width + 20 ||
                    tooltipBox.y + tooltipBox.height > cardBox.y + cardBox.height + 100;

                  if (overflowsCard) {
                    console.log(`  ⚠️  🐛 BUG: Tooltip extends far outside flight card!`);
                    report.bugsFound.push({
                      type: 'Tooltip Overflow - Card Boundary',
                      element: text.substring(0, 50),
                      details: 'Tooltip not contained within card boundaries'
                    });
                  }
                }
              }
            }
          }
        }

        // Screenshot hover state
        await page.screenshot({ path: `HOVER-TEST-2-breakdown-${i + 1}.png`, fullPage: false });
        console.log(`  📸 Screenshot: HOVER-TEST-2-breakdown-${i + 1}.png\n`);

        // Move mouse away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);
      }
    }

    console.log('='.repeat(80));
    console.log('STEP 3: Test Details dropdown button');
    console.log('='.repeat(80));

    report.testsRun++;

    const detailsDropdowns = await page.$$('button:has-text("Details")');
    console.log(`Found ${detailsDropdowns.length} Details buttons in expanded view\n`);

    if (detailsDropdowns.length > 1) {
      // Click the Details dropdown (not the main expand button)
      const dropdownButton = detailsDropdowns[1]; // Second one is likely the dropdown
      console.log('🖱️  Clicking Details dropdown button...');

      await dropdownButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const box = await dropdownButton.boundingBox();
      if (box) {
        console.log(`Button at: (${Math.round(box.x)}, ${Math.round(box.y)})`);

        await dropdownButton.click();
        await page.waitForTimeout(1500);

        // Check for dropdown menu
        const dropdowns = await page.$$('[role="menu"], [class*="menu"], [class*="Menu"], [class*="dropdown"], [class*="Dropdown"]');
        console.log(`Dropdown menus appeared: ${dropdowns.length}`);

        for (const dropdown of dropdowns) {
          const isVisible = await dropdown.isVisible().catch(() => false);
          if (isVisible) {
            const dropdownBox = await dropdown.boundingBox();
            if (dropdownBox) {
              console.log(`Dropdown menu found:`);
              console.log(`  Position: (${Math.round(dropdownBox.x)}, ${Math.round(dropdownBox.y)})`);
              console.log(`  Size: ${Math.round(dropdownBox.width)}x${Math.round(dropdownBox.height)}`);

              const overflowsViewport =
                dropdownBox.x < 0 ||
                dropdownBox.y < 0 ||
                dropdownBox.x + dropdownBox.width > 1920 ||
                dropdownBox.y + dropdownBox.height > 1080;

              if (overflowsViewport) {
                console.log(`  ⚠️  🐛 BUG: Dropdown overflows viewport!`);
                report.bugsFound.push({
                  type: 'Dropdown Overflow',
                  element: 'Details dropdown',
                  details: 'Dropdown menu extends outside viewport'
                });
              }
            }
          }
        }

        await page.screenshot({ path: 'HOVER-TEST-3-details-dropdown.png', fullPage: false });
        console.log(`📸 Screenshot: HOVER-TEST-3-details-dropdown.png\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('STEP 4: Test all price/fare hover interactions');
    console.log('='.repeat(80));

    report.testsRun++;

    const priceElements = await page.$$('[class*="price"], [class*="Price"], text=/\\$\\d+/, [class*="fare"], [class*="Fare"]');
    console.log(`Found ${priceElements.length} price/fare elements\n`);

    for (let i = 0; i < Math.min(5, priceElements.length); i++) {
      const element = priceElements[i];
      const text = await element.innerText().catch(() => '');
      const box = await element.boundingBox();

      if (!box || !text) continue;

      console.log(`Hover test ${i + 1}: "${text.substring(0, 30)}..."`);

      await element.hover();
      await page.waitForTimeout(1000);

      const tooltips = await page.$$('[role="tooltip"], [class*="tooltip"]');
      if (tooltips.length > 0) {
        console.log(`  Tooltip appeared: YES`);
      }

      await page.screenshot({ path: `HOVER-TEST-4-price-${i + 1}.png` });

      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    }

    console.log('\n' + '='.repeat(80));
    console.log('FINAL REPORT');
    console.log('='.repeat(80));

    console.log(`\nTests run: ${report.testsRun}`);
    console.log(`Bugs found: ${report.bugsFound.length}\n`);

    if (report.bugsFound.length > 0) {
      console.log('🐛 BUGS IDENTIFIED:\n');
      report.bugsFound.forEach((bug, i) => {
        console.log(`${i + 1}. ${bug.type}`);
        console.log(`   Element: ${bug.element}`);
        console.log(`   Details: ${bug.details}\n`);
      });
    } else {
      console.log('✅ No obvious positioning bugs found!');
      console.log('   (But review screenshots to be sure)\n');
    }

    // Save report
    fs.writeFileSync('BUG-REPORT.json', JSON.stringify(report, null, 2));
    console.log('📄 Full report saved to: BUG-REPORT.json\n');

    console.log('📸 All screenshots saved with prefix: HOVER-TEST-*\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'HOVER-TEST-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testBreakdownHover();
