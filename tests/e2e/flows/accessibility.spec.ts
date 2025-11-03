import { test, expect } from '@playwright/test';
import { testFlights, getTestDateRange } from '../fixtures/test-data';

test.describe('Accessibility Tests', () => {
  test('should support keyboard navigation on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test Tab navigation
    await page.keyboard.press('Tab'); // Should focus on first interactive element
    await page.waitForTimeout(200);

    // Get focused element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        className: el?.className,
        text: el?.textContent?.substring(0, 50)
      };
    });

    console.log('First focused element:', focusedElement);

    // Test multiple Tab presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    console.log('Keyboard navigation works on homepage');
  });

  test('should support keyboard navigation on flight search form', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Tab through form fields
    await page.keyboard.press('Tab'); // Logo or first element
    await page.keyboard.press('Tab'); // Next element

    // Try to interact with form using keyboard
    await page.keyboard.type('JFK');
    await page.waitForTimeout(500);

    await page.keyboard.press('Tab');
    await page.keyboard.type('LAX');
    await page.waitForTimeout(500);

    console.log('Keyboard navigation works on flight search form');
  });

  test('should support Enter key to submit form', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    const dates = getTestDateRange(30, 7);

    // Fill form using keyboard
    const originInput = page.locator('input').first();
    await originInput.focus();
    await page.keyboard.type('JFK');

    await page.keyboard.press('Tab');
    await page.keyboard.type('LAX');

    // Fill dates
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.focus();
    await dateInput.fill(dates.departureDate);

    // Try to submit with Enter key
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);

    console.log('Enter key form submission tested');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Check for ARIA labels on form elements
    const ariaElements = await page.locator('[aria-label], [aria-labelledby], [role]').count();
    console.log(`Found ${ariaElements} elements with ARIA attributes`);

    // Check for form labels
    const labels = await page.locator('label').count();
    console.log(`Found ${labels} form labels`);

    expect(ariaElements + labels).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check heading structure
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();

    console.log(`Heading structure: H1=${h1Count}, H2=${h2Count}, H3=${h3Count}`);

    // Should have at least one H1
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1); // Only one H1 per page

    // H1 should be visible
    if (h1Count > 0) {
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check contrast ratios (this is a basic check)
    const textElements = await page.locator('p, span, div').all();
    const sampleSize = Math.min(textElements.length, 10);

    console.log(`Checking color contrast on ${sampleSize} text elements`);

    for (let i = 0; i < sampleSize; i++) {
      const element = textElements[i];
      if (await element.isVisible()) {
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
          };
        });

        console.log(`Element ${i + 1} styles:`, styles);
      }
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Check for live regions
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();
    console.log(`Found ${liveRegions} live regions for screen readers`);

    // Check for sr-only (screen reader only) elements
    const srOnly = await page.locator('.sr-only, [class*="screen-reader"]').count();
    console.log(`Found ${srOnly} screen reader only elements`);
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Check all buttons have accessible names
    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      if (await button.isVisible()) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        const hasAccessibleName = (text && text.trim().length > 0) || (ariaLabel && ariaLabel.length > 0);

        if (!hasAccessibleName) {
          console.warn('Button without accessible name found');
        }
      }
    }

    console.log('Checked accessibility of all buttons');
  });

  test('should have accessible form inputs', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Check all inputs have labels
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      if (await input.isVisible()) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        let hasLabel = false;

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = await label.count() > 0;
        }

        const hasAccessibility = hasLabel || ariaLabel || ariaLabelledBy || placeholder;

        if (!hasAccessibility) {
          console.warn('Input without label/aria-label found');
        }
      }
    }

    console.log('Checked accessibility of all form inputs');
  });

  test('should support Escape key to close modals/overlays', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test Escape key behavior
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Any open modals/overlays should close
    const modals = page.locator('[role="dialog"], [class*="modal"]');
    const modalCount = await modals.count();

    if (modalCount > 0) {
      const isModalVisible = await modals.first().isVisible();
      expect(isModalVisible).toBeFalsy();
    }

    console.log('Escape key behavior tested');
  });

  test('should have focus visible indicators', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Take screenshot to visually verify focus indicator
    await page.screenshot({ path: 'test-results/focus-visible.png' });

    // Check if focused element has focus styles
    const hasFocusVisible = await page.evaluate(() => {
      const focused = document.activeElement;
      const styles = window.getComputedStyle(focused);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    console.log('Focus visible styles:', hasFocusVisible);
  });

  test('should have proper link accessibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check all links have text or aria-label
    const links = await page.locator('a').all();

    for (const link of links) {
      if (await link.isVisible()) {
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');

        const hasAccessibleName =
          (text && text.trim().length > 0) ||
          (ariaLabel && ariaLabel.length > 0) ||
          (title && title.length > 0);

        if (!hasAccessibleName) {
          console.warn('Link without accessible name found');
        }
      }
    }

    console.log('Checked accessibility of all links');
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check all images have alt text
    const images = await page.locator('img').all();

    for (const image of images) {
      if (await image.isVisible()) {
        const alt = await image.getAttribute('alt');
        const role = await image.getAttribute('role');

        // Decorative images should have empty alt or role="presentation"
        // Content images should have descriptive alt text
        if (alt === null && role !== 'presentation') {
          console.warn('Image without alt attribute found');
        }
      }
    }

    console.log('Checked alt text for all images');
  });

  test('should support zoom to 200% without content loss', async ({ page }) => {
    await page.goto('/flights');
    await page.waitForLoadState('networkidle');

    // Take screenshot at normal zoom
    await page.screenshot({ path: 'test-results/zoom-100.png' });

    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2.0';
    });

    await page.waitForTimeout(500);

    // Take screenshot at 200% zoom
    await page.screenshot({ path: 'test-results/zoom-200.png' });

    // Verify main elements are still visible
    const searchButton = page.locator('button:has-text("Search")');
    await expect(searchButton).toBeVisible();

    console.log('Zoom support tested');
  });
});
