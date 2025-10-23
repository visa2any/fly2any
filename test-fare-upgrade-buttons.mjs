import { chromium } from '@playwright/test';

async function testFareUpgradeButtons() {
  console.log('🚀 Testing FARE UPGRADE SELECT BUTTONS specifically...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });

  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  try {
    console.log('📍 Navigating...');
    await page.goto('http://localhost:3000/flights/results?from=JFK&to=LAX&departure=2025-11-15&return=2025-11-22&adults=1&children=0&infants=0&class=economy', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForResponse(response => response.url().includes('/api/flights/search'), { timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('✅ Page loaded\n');

    console.log('='.repeat(80));
    console.log('STEP 1: Find and click a flight Details button to expand');
    console.log('='.repeat(80));

    // Find the first "Details" button on a flight card
    const detailsButtons = await page.$$('button:has-text("Details")');
    console.log(`Found ${detailsButtons.length} Details buttons\n`);

    if (detailsButtons.length === 0) {
      console.log('❌ No Details buttons found! Cannot proceed with test.');
      return;
    }

    const firstDetailsButton = detailsButtons[0];
    console.log('🖱️  Clicking first Details button...');
    await firstDetailsButton.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'FARE-TEST-1-expanded-flight.png', fullPage: false });
    console.log('📸 Screenshot: FARE-TEST-1-expanded-flight.png\n');

    console.log('='.repeat(80));
    console.log('STEP 2: Look for BRANDED FARE cards (Blue Basic, Blue, Blue Plus)');
    console.log('='.repeat(80));

    // Look for branded fare text
    const blueBasicElements = await page.$$('text=Blue Basic, text=BLUE BASIC, text=Blue basic');
    const blueElements = await page.$$('text=/^Blue$/');
    const bluePlusElements = await page.$$('text=Blue Plus, text=BLUE PLUS, text=Blue plus');

    console.log(`Blue Basic cards found: ${blueBasicElements.length}`);
    console.log(`Blue cards found: ${blueElements.length}`);
    console.log(`Blue Plus cards found: ${bluePlusElements.length}\n`);

    // Look for all buttons in expanded section
    const allButtons = await page.$$('button');
    console.log(`Total buttons on page: ${allButtons.length}\n`);

    console.log('Looking for Select buttons near branded fare text...\n');

    // Find Select buttons within expanded content
    const expandedContent = await page.$('[class*="expanded"], [class*="details"], [class*="content"]').catch(() => null);

    let fareSelectButtons = [];
    if (expandedContent) {
      fareSelectButtons = await expandedContent.$$('button:has-text("Select")');
      console.log(`✅ Found expanded content with ${fareSelectButtons.length} Select buttons inside\n`);
    } else {
      // Fallback: get all Select buttons and filter manually
      const allSelectButtons = await page.$$('button:has-text("Select")');
      console.log(`Found ${allSelectButtons.length} total Select buttons on page\n`);

      // Filter out the main flight Select button and airline "Select All"
      for (const btn of allSelectButtons) {
        const text = await btn.innerText();
        if (text.trim() === 'Select →' && text !== 'Select All') {
          // This might be a fare upgrade button
          fareSelectButtons.push(btn);
        }
      }
      console.log(`Filtered to ${fareSelectButtons.length} potential fare upgrade buttons\n`);
    }

    console.log('='.repeat(80));
    console.log('STEP 3: Test FARE UPGRADE Select buttons');
    console.log('='.repeat(80));

    if (fareSelectButtons.length === 0) {
      console.log('⚠️  No fare upgrade Select buttons found in expanded flight!');
      console.log('This might be because:');
      console.log('  1. Branded fares are shown differently');
      console.log('  2. The expanded content uses different selectors');
      console.log('  3. The feature is not yet implemented\n');

      // Try to find ANY interactive fare elements
      console.log('Searching for ANY fare-related interactive elements...');
      const fareClickables = await page.$$('[class*="fare"] button, [class*="Fare"] button, button[class*="fare"], button[class*="Fare"]');
      console.log(`Found ${fareClickables.length} buttons with fare-related classes\n`);

      if (fareClickables.length > 0) {
        console.log('Testing these buttons instead:\n');
        fareSelectButtons = fareClickables.slice(0, 3);
      }
    }

    if (fareSelectButtons.length > 0) {
      for (let i = 0; i < Math.min(3, fareSelectButtons.length); i++) {
        const button = fareSelectButtons[i];

        console.log(`\nTesting Fare Select button ${i + 1}:`);

        const buttonText = await button.innerText().catch(() => 'unknown');
        const isVisible = await button.isVisible().catch(() => false);
        const isEnabled = await button.isEnabled().catch(() => false);

        console.log(`  Text: "${buttonText}"`);
        console.log(`  Visible: ${isVisible}`);
        console.log(`  Enabled: ${isEnabled}`);

        if (!isVisible || !isEnabled) {
          console.log(`  ⚠️  Skipping - button not interactable\n`);
          continue;
        }

        // Get nearby text to understand context
        const parentElement = await button.evaluateHandle(el => el.closest('[class*="card"], [class*="fare"], [class*="Fare"]'));
        const parentText = await parentElement.asElement()?.innerText().catch(() => '');
        console.log(`  Context: "${parentText?.substring(0, 100)}..."`);

        // Screenshot before click
        await button.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `FARE-TEST-2-before-select-${i + 1}.png`, fullPage: false });

        const urlBefore = page.url();
        console.log(`  URL before: ${urlBefore}`);

        // Clear console logs
        const logsBefore = consoleLogs.length;

        // Click the button
        console.log(`  🖱️  Clicking...`);
        try {
          await button.click();
          await page.waitForTimeout(2000);

          const urlAfter = page.url();
          console.log(`  URL after: ${urlAfter}`);
          console.log(`  URL changed: ${urlBefore !== urlAfter ? '✅ YES' : '❌ NO'}`);

          // Check for modals
          const modalAppeared = await page.$('[role="dialog"], .modal, [class*="Modal"]').then(el => !!el).catch(() => false);
          console.log(`  Modal appeared: ${modalAppeared ? '✅ YES' : '❌ NO'}`);

          // Check for toasts/alerts
          const alertAppeared = await page.$('[role="alert"], [class*="toast"], [class*="Toast"], [class*="notification"]').then(el => !!el).catch(() => false);
          console.log(`  Alert/Toast appeared: ${alertAppeared ? '✅ YES' : '❌ NO'}`);

          // Check console logs
          const logsAfter = consoleLogs.length;
          const newLogs = consoleLogs.slice(logsBefore);
          if (newLogs.length > 0) {
            console.log(`  Console logs (${newLogs.length} new):`);
            newLogs.forEach(log => console.log(`    ${log}`));
          }

          // Screenshot after
          await page.screenshot({ path: `FARE-TEST-2-after-select-${i + 1}.png`, fullPage: false });
          console.log(`  📸 Screenshots: FARE-TEST-2-before-select-${i + 1}.png and after`);

          // Verdict
          if (urlBefore === urlAfter && !modalAppeared && !alertAppeared) {
            console.log(`  ⚠️  🐛 BUG CONFIRMED: Button does NOTHING!`);
            console.log(`      No navigation, no modal, no visual feedback.`);
            console.log(`      This is the issue the user reported!`);
          } else {
            console.log(`  ✅ Button works - something changed`);
          }

        } catch (e) {
          console.log(`  ❌ Error clicking: ${e.message}`);
        }
      }
    } else {
      console.log('\n❌ Could not find any fare Select buttons to test!');
      console.log('The branded fare upgrade feature may not be visible or implemented yet.\n');
    }

    console.log('\n' + '='.repeat(80));
    console.log('COMPLETE - Review screenshots');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Test crashed:', error.message);
    await page.screenshot({ path: 'FARE-TEST-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testFareUpgradeButtons();
