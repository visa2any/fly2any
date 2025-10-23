import { chromium } from '@playwright/test';

const url = 'http://localhost:3000/flights/results?from=JFK%2CEWR%2CLGA&to=MIA&departure=2025-10-25&adults=1&children=0&infants=0&class=economy&direct=false';

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: false });

  try {
    // Desktop view
    const desktopContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();

    console.log('📱 Navigating to flight results page...');
    await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for results to load
    console.log('⏳ Waiting for flight cards to load...');
    await desktopPage.waitForSelector('[data-testid="flight-card"]', { timeout: 30000 }).catch(() => {
      console.log('⚠️ Flight cards not found with data-testid, trying alternative selector...');
    });

    // Wait a bit for animations
    await desktopPage.waitForTimeout(2000);

    // 1. Initial results page (collapsed cards)
    console.log('📸 Taking screenshot 1: Initial results page...');
    await desktopPage.screenshot({
      path: 'ux-analysis-1-initial-results.png',
      fullPage: true
    });

    // 2. Expanded flight card view
    console.log('📸 Taking screenshot 2: Clicking first flight card Details button...');
    const detailsButton = await desktopPage.locator('button:has-text("Details")').first();
    if (await detailsButton.isVisible()) {
      await detailsButton.click();
      await desktopPage.waitForTimeout(1000);

      await desktopPage.screenshot({
        path: 'ux-analysis-2-expanded-card.png',
        fullPage: true
      });

      // 3. Scroll to show expanded card details
      console.log('📸 Taking screenshot 3: Scrolled to expanded card...');
      const expandedCard = await desktopPage.locator('.group.relative.bg-white').first();
      await expandedCard.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(500);

      await desktopPage.screenshot({
        path: 'ux-analysis-3-expanded-card-scrolled.png',
        fullPage: false
      });

      // 4. Check if there's a fare comparison modal button
      console.log('📸 Looking for fare comparison elements...');
      const fareButton = await desktopPage.locator('text=/Compare.*fare/i').first();
      if (await fareButton.isVisible().catch(() => false)) {
        await fareButton.click();
        await desktopPage.waitForTimeout(1000);

        await desktopPage.screenshot({
          path: 'ux-analysis-4-fare-comparison-modal.png',
          fullPage: false
        });

        // Close modal
        const closeButton = await desktopPage.locator('button[aria-label="Close"]').or(desktopPage.locator('button:has-text("×")')).first();
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
          await desktopPage.waitForTimeout(500);
        }
      }

      // 5. Open baggage calculator accordion
      console.log('📸 Opening baggage calculator...');
      const baggageAccordion = await desktopPage.locator('summary:has-text("Baggage")').first();
      if (await baggageAccordion.isVisible().catch(() => false)) {
        await baggageAccordion.click();
        await desktopPage.waitForTimeout(1000);

        await desktopPage.screenshot({
          path: 'ux-analysis-5-baggage-calculator.png',
          fullPage: false
        });
      }

      // 6. Open seat map accordion
      console.log('📸 Opening seat map...');
      const seatMapAccordion = await desktopPage.locator('summary:has-text("Seat Map")').first();
      if (await seatMapAccordion.isVisible().catch(() => false)) {
        await seatMapAccordion.click();
        await desktopPage.waitForTimeout(1000);

        await desktopPage.screenshot({
          path: 'ux-analysis-6-seat-map.png',
          fullPage: false
        });
      }
    }

    await desktopContext.close();

    // Mobile view
    console.log('📱 Taking mobile screenshots...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await mobilePage.waitForTimeout(2000);

    // 7. Mobile initial view
    console.log('📸 Taking screenshot 7: Mobile initial view...');
    await mobilePage.screenshot({
      path: 'ux-analysis-7-mobile-initial.png',
      fullPage: true
    });

    // 8. Mobile expanded card
    console.log('📸 Taking screenshot 8: Mobile expanded card...');
    const mobileDetailsButton = await mobilePage.locator('button:has-text("Details")').first();
    if (await mobileDetailsButton.isVisible()) {
      await mobileDetailsButton.click();
      await mobilePage.waitForTimeout(1000);

      await mobilePage.screenshot({
        path: 'ux-analysis-8-mobile-expanded.png',
        fullPage: true
      });
    }

    await mobileContext.close();

    console.log('✅ All screenshots captured successfully!');

  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

takeScreenshots();
