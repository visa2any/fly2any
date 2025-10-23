import { chromium } from '@playwright/test';

async function testAllHoverElements() {
  console.log('🔍 DEEP INVESTIGATION: Testing ALL Hover Elements for Overflow\n');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
    slowMo: 500,
    args: ['--start-maximized']
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const overflowIssues = [];

  try {
    console.log('Loading flight results page...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('Waiting for flights to load...');
    await page.waitForResponse(
      response => response.url().includes('/api/flights/search') && response.status() === 200,
      { timeout: 30000 }
    );
    await page.waitForSelector('button:has-text("Details")', { timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('✅ Flights loaded\n');

    // Expand first flight
    console.log('Expanding flight card...');
    const detailsButton = await page.$('button:has-text("Details")');
    if (detailsButton) {
      await detailsButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Flight expanded\n');
    }

    await page.screenshot({ path: 'HOVER-DEBUG-1-expanded.png', fullPage: false });

    console.log('='.repeat(80));
    console.log('TESTING ALL HOVERABLE ELEMENTS');
    console.log('='.repeat(80) + '\n');

    // List of all elements to test hover on
    const hoverTargets = [
      { name: 'Deal Score Badge (70)', selector: 'text=/70.*Good.*Score/i' },
      { name: 'Deal Score Badge (any score)', selector: 'text=/\\d+.*Score/i' },
      { name: 'Breakdown text', selector: 'text=Breakdown' },
      { name: 'Individual scores (0/40)', selector: 'text=0/40' },
      { name: 'Individual scores (0/15)', selector: 'text=0/15' },
      { name: 'Individual scores (0/10)', selector: 'text=0/10' },
      { name: 'Individual scores (0/5)', selector: 'text=0/5' },
      { name: 'Total score (70/100)', selector: 'text=70/100' },
      { name: 'Details button', selector: 'button:has-text("Details")' },
      { name: 'Select button', selector: 'button:has-text("Select")' },
      { name: 'Price elements', selector: '[class*="price"]:visible' },
      { name: 'Badge elements', selector: '[class*="badge"]:visible' },
      { name: 'Info icons', selector: 'svg[class*="info"], button:has-text("i")' },
    ];

    let testCount = 0;

    for (const target of hoverTargets) {
      console.log(`\nTest ${++testCount}: Hovering over "${target.name}"...`);

      const elements = await page.$$(target.selector).catch(() => []);

      if (elements.length === 0) {
        console.log(`  ⚠️  Element not found: ${target.selector}`);
        continue;
      }

      const element = elements[0];

      try {
        // Scroll element into view
        await element.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        // Get element position before hover
        const beforeBox = await element.boundingBox();
        if (!beforeBox) {
          console.log('  ⚠️  Element has no bounding box');
          continue;
        }

        console.log(`  Element position: (${Math.round(beforeBox.x)}, ${Math.round(beforeBox.y)})`);

        // Hover over element
        await element.hover();
        await page.waitForTimeout(1500);

        // Take screenshot
        const filename = `HOVER-DEBUG-${testCount}-${target.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        await page.screenshot({ path: filename });
        console.log(`  📸 Screenshot: ${filename}`);

        // Check for ANY visible tooltips, popovers, or dropdowns
        const possibleOverflows = await page.$$('[role="tooltip"], [class*="tooltip"], [class*="Tooltip"], [class*="popover"], [class*="Popover"], [class*="dropdown"], [class*="absolute"]');

        for (let i = 0; i < possibleOverflows.length; i++) {
          const el = possibleOverflows[i];
          const isVisible = await el.isVisible().catch(() => false);

          if (isVisible) {
            const box = await el.boundingBox();
            if (box) {
              const overflowRight = box.x + box.width > 1920;
              const overflowLeft = box.x < 0;
              const overflowTop = box.y < 0;
              const overflowBottom = box.y + box.height > 1080;

              if (overflowRight || overflowLeft || overflowTop || overflowBottom) {
                console.log(`  ⚠️  🐛 OVERFLOW DETECTED!`);
                console.log(`     Element ${i} position: (${Math.round(box.x)}, ${Math.round(box.y)})`);
                console.log(`     Size: ${Math.round(box.width)}x${Math.round(box.height)}`);

                if (overflowRight) console.log(`     ❌ Overflows RIGHT edge (${Math.round(box.x + box.width)} > 1920)`);
                if (overflowLeft) console.log(`     ❌ Overflows LEFT edge (${Math.round(box.x)} < 0)`);
                if (overflowTop) console.log(`     ❌ Overflows TOP edge (${Math.round(box.y)} < 0)`);
                if (overflowBottom) console.log(`     ❌ Overflows BOTTOM edge (${Math.round(box.y + box.height)} > 1080)`);

                // Get element class and structure
                const className = await el.getAttribute('class').catch(() => 'unknown');
                console.log(`     Element class: ${className}`);

                overflowIssues.push({
                  hoverTarget: target.name,
                  elementIndex: i,
                  position: { x: box.x, y: box.y },
                  size: { width: box.width, height: box.height },
                  overflows: { right: overflowRight, left: overflowLeft, top: overflowTop, bottom: overflowBottom },
                  className: className,
                  screenshot: filename
                });
              }
            }
          }
        }

        // Move mouse away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(500);

      } catch (error) {
        console.log(`  ❌ Error testing hover: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY OF OVERFLOW ISSUES');
    console.log('='.repeat(80) + '\n');

    if (overflowIssues.length === 0) {
      console.log('✅ NO OVERFLOW ISSUES DETECTED!');
    } else {
      console.log(`🐛 Found ${overflowIssues.length} overflow issue(s):\n`);

      overflowIssues.forEach((issue, idx) => {
        console.log(`Issue ${idx + 1}:`);
        console.log(`  Hover target: ${issue.hoverTarget}`);
        console.log(`  Element class: ${issue.className}`);
        console.log(`  Position: (${Math.round(issue.position.x)}, ${Math.round(issue.position.y)})`);
        console.log(`  Size: ${Math.round(issue.size.width)}x${Math.round(issue.size.height)}`);
        console.log(`  Overflows: ${Object.entries(issue.overflows).filter(([k, v]) => v).map(([k]) => k.toUpperCase()).join(', ')}`);
        console.log(`  Screenshot: ${issue.screenshot}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'HOVER-DEBUG-ERROR.png', fullPage: true });
  } finally {
    console.log('\n⏸️  Keeping browser open for 15 seconds for inspection...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

testAllHoverElements();
