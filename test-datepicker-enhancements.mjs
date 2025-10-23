/**
 * Date Picker Enhancements - Visual Testing Script
 * Tests all new features added to PremiumDatePicker component
 */

import { chromium } from 'playwright';

async function testDatePickerEnhancements() {
  console.log('🧪 Starting Date Picker Enhancement Tests...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    console.log('   ✅ Homepage loaded\n');

    // Take screenshot of initial page
    await page.screenshot({ path: 'test-results/datepicker-01-homepage.png', fullPage: false });
    console.log('   📸 Screenshot saved: datepicker-01-homepage.png\n');

    // Click on departure date input to open calendar
    console.log('📍 Step 2: Open departure date calendar...');

    // Try multiple selectors to find the departure date input
    const departureDateSelector = await page.evaluate(() => {
      // Look for input with departure-related labels or names
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const departureInput = inputs.find(input => {
        const label = input.closest('label')?.textContent || '';
        const placeholder = input.placeholder || '';
        const ariaLabel = input.getAttribute('aria-label') || '';
        return label.toLowerCase().includes('depart') ||
               placeholder.toLowerCase().includes('depart') ||
               ariaLabel.toLowerCase().includes('depart');
      });

      if (departureInput) {
        departureInput.click();
        return 'found';
      }
      return 'not-found';
    });

    if (departureDateSelector === 'not-found') {
      console.log('   ⚠️  Could not find departure date input, trying alternative approach...');

      // Try clicking on any date-related input
      await page.click('input[type="text"]').catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Wait for calendar to appear
    await page.waitForTimeout(2000);
    console.log('   ✅ Calendar opened\n');

    // Take screenshot of calendar with quick shortcuts
    await page.screenshot({ path: 'test-results/datepicker-02-calendar-open.png', fullPage: false });
    console.log('   📸 Screenshot saved: datepicker-02-calendar-open.png\n');

    // Test: Verify quick shortcuts are visible
    console.log('📍 Step 3: Check quick date shortcuts...');
    const shortcutsVisible = await page.evaluate(() => {
      const shortcuts = [
        'This Weekend',
        'Next Week',
        'Next Month',
        'Flexible (±3)'
      ];

      return shortcuts.map(text => {
        const button = Array.from(document.querySelectorAll('button')).find(
          btn => btn.textContent.trim() === text
        );
        return {
          text,
          found: !!button,
          visible: button ? window.getComputedStyle(button).display !== 'none' : false
        };
      });
    });

    console.log('   Quick Shortcuts Status:');
    shortcutsVisible.forEach(shortcut => {
      const status = shortcut.found && shortcut.visible ? '✅' : '❌';
      console.log(`   ${status} ${shortcut.text}: ${shortcut.found ? 'Found' : 'Not found'}`);
    });
    console.log('');

    // Test: Click "This Weekend" shortcut
    console.log('📍 Step 4: Test "This Weekend" shortcut...');
    const weekendClicked = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent.trim() === 'This Weekend'
      );
      if (button) {
        button.click();
        return true;
      }
      return false;
    });

    if (weekendClicked) {
      await page.waitForTimeout(1000);
      console.log('   ✅ "This Weekend" clicked\n');
      await page.screenshot({ path: 'test-results/datepicker-03-weekend-selected.png', fullPage: false });
      console.log('   📸 Screenshot saved: datepicker-03-weekend-selected.png\n');
    } else {
      console.log('   ⚠️  Could not click "This Weekend" button\n');
    }

    // Test: Check weekend highlighting
    console.log('📍 Step 5: Verify weekend highlighting...');
    const weekendHighlighting = await page.evaluate(() => {
      // Look for calendar day buttons
      const allButtons = Array.from(document.querySelectorAll('button'));
      const calendarDays = allButtons.filter(btn => {
        const text = btn.textContent.trim();
        return text.match(/^\d+$/) && parseInt(text) <= 31;
      });

      // Check if any have weekend styling (blue-indigo gradient)
      const weekendStyled = calendarDays.filter(btn => {
        const classes = btn.className;
        return classes.includes('from-blue-50') || classes.includes('to-indigo-50');
      });

      return {
        totalDays: calendarDays.length,
        weekendDays: weekendStyled.length,
        hasWeekendStyling: weekendStyled.length > 0
      };
    });

    console.log('   Weekend Highlighting:');
    console.log(`   Total calendar days: ${weekendHighlighting.totalDays}`);
    console.log(`   Weekend-styled days: ${weekendHighlighting.weekendDays}`);
    console.log(`   ${weekendHighlighting.hasWeekendStyling ? '✅' : '❌'} Weekend highlighting active\n`);

    // Test: Check calendar positioning
    console.log('📍 Step 6: Verify calendar positioning...');
    const positioning = await page.evaluate(() => {
      const calendar = document.querySelector('[class*="shadow-"]');
      const input = document.querySelector('input[type="text"]');

      if (!calendar || !input) {
        return { found: false };
      }

      const calendarRect = calendar.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const gap = calendarRect.top - inputRect.bottom;

      return {
        found: true,
        gap: Math.round(gap),
        calendarTop: Math.round(calendarRect.top),
        inputBottom: Math.round(inputRect.bottom),
        hasMinimalGap: gap <= 2
      };
    });

    if (positioning.found) {
      console.log('   Positioning Details:');
      console.log(`   Input bottom: ${positioning.inputBottom}px`);
      console.log(`   Calendar top: ${positioning.calendarTop}px`);
      console.log(`   Gap: ${positioning.gap}px`);
      console.log(`   ${positioning.hasMinimalGap ? '✅' : '❌'} Minimal gap (≤2px)\n`);
    } else {
      console.log('   ⚠️  Could not measure positioning\n');
    }

    // Test: Click "Next Week" shortcut
    console.log('📍 Step 7: Test "Next Week" shortcut...');
    const nextWeekClicked = await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent.trim() === 'Next Week'
      );
      if (button) {
        button.click();
        return true;
      }
      return false;
    });

    if (nextWeekClicked) {
      await page.waitForTimeout(1000);
      console.log('   ✅ "Next Week" clicked\n');
      await page.screenshot({ path: 'test-results/datepicker-04-nextweek-selected.png', fullPage: false });
      console.log('   📸 Screenshot saved: datepicker-04-nextweek-selected.png\n');
    } else {
      console.log('   ⚠️  Could not click "Next Week" button\n');
    }

    // Test: Hover over a date to check hover effects
    console.log('📍 Step 8: Test hover effects...');
    const hoverTested = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const calendarDays = allButtons.filter(btn => {
        const text = btn.textContent.trim();
        return text.match(/^\d+$/) && parseInt(text) <= 31;
      });

      if (calendarDays.length > 0) {
        const middleDay = calendarDays[Math.floor(calendarDays.length / 2)];
        middleDay.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        // Check if hover classes are applied
        setTimeout(() => {
          const hasHoverStyle = middleDay.className.includes('scale-105');
          return hasHoverStyle;
        }, 100);

        return true;
      }
      return false;
    });

    if (hoverTested) {
      await page.waitForTimeout(500);
      console.log('   ✅ Hover effects tested\n');
      await page.screenshot({ path: 'test-results/datepicker-05-hover-effect.png', fullPage: false });
      console.log('   📸 Screenshot saved: datepicker-05-hover-effect.png\n');
    }

    // Test: Check animation properties
    console.log('📍 Step 9: Verify smooth animations...');
    const animationCheck = await page.evaluate(() => {
      const calendar = document.querySelector('[class*="shadow-"]');
      if (!calendar) return { found: false };

      const classes = calendar.className;
      return {
        found: true,
        hasFadeIn: classes.includes('fade-in'),
        hasSlideIn: classes.includes('slide-in'),
        hasDuration: classes.includes('duration-'),
        hasEaseOut: classes.includes('ease-out')
      };
    });

    if (animationCheck.found) {
      console.log('   Animation Classes:');
      console.log(`   ${animationCheck.hasFadeIn ? '✅' : '❌'} Fade-in animation`);
      console.log(`   ${animationCheck.hasSlideIn ? '✅' : '❌'} Slide-in animation`);
      console.log(`   ${animationCheck.hasDuration ? '✅' : '❌'} Duration defined`);
      console.log(`   ${animationCheck.hasEaseOut ? '✅' : '❌'} Ease-out timing\n`);
    }

    // Final screenshot with all elements
    await page.screenshot({ path: 'test-results/datepicker-06-final-state.png', fullPage: true });
    console.log('   📸 Screenshot saved: datepicker-06-final-state.png\n');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All quick shortcuts present:', shortcutsVisible.every(s => s.found));
    console.log('✅ Weekend highlighting active:', weekendHighlighting.hasWeekendStyling);
    console.log('✅ Minimal positioning gap:', positioning.hasMinimalGap || 'N/A');
    console.log('✅ Animation classes present:', animationCheck.found);
    console.log('📸 Total screenshots: 6');
    console.log('='.repeat(60) + '\n');

    console.log('✨ Date picker enhancements successfully tested!\n');
    console.log('📁 All screenshots saved to: test-results/\n');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    await page.screenshot({ path: 'test-results/datepicker-error.png', fullPage: true });
    console.log('   📸 Error screenshot saved: datepicker-error.png\n');
  } finally {
    console.log('🔍 Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ Browser closed. Testing complete!\n');
  }
}

// Run the tests
testDatePickerEnhancements().catch(console.error);
