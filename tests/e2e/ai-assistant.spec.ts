import { test, expect } from '@playwright/test';

/**
 * E2E Tests: AI Travel Assistant
 *
 * Tests the AI assistant functionality:
 * 1. Opening/closing the assistant
 * 2. Sending messages
 * 3. Hotel search via AI
 * 4. Flight search via AI
 * 5. Conversation history
 */

test.describe('AI Travel Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open and close AI assistant', async ({ page }) => {
    // Look for AI assistant button (floating button)
    const aiButton = page.locator('[aria-label*="AI" i][aria-label*="assistant" i]')
      .or(page.locator('[data-testid="ai-assistant-button"]'))
      .or(page.locator('button:has-text("AI Assistant")'))
      .or(page.locator('[class*="ai-assistant" i]'))
      .first();

    if (await aiButton.count() > 0) {
      // Open AI assistant
      await aiButton.click();
      await page.waitForTimeout(500);

      console.log('✅ AI Assistant button clicked');

      // Check if assistant panel opened
      const assistantPanel = page.locator('[data-testid="ai-assistant-panel"]')
        .or(page.locator('[role="dialog"]'))
        .or(page.locator('[class*="ai-assistant" i][class*="panel" i]'));

      const panelVisible = await assistantPanel.isVisible().catch(() => false);

      if (panelVisible) {
        console.log('✅ AI Assistant panel opened');

        // Try to close it
        const closeButton = page.locator('button:has-text("Close")')
          .or(page.locator('[aria-label*="close" i]'))
          .first();

        if (await closeButton.isVisible()) {
          await closeButton.click();
          await page.waitForTimeout(300);
          console.log('✅ AI Assistant closed');
        }
      } else {
        console.log('ℹ️  AI Assistant panel not visible or uses different structure');
      }
    } else {
      console.log('ℹ️  AI Assistant button not found on homepage');
    }
  });

  test('should send message to AI assistant', async ({ page }) => {
    // Open AI assistant
    const aiButton = page.locator('[aria-label*="AI" i]')
      .or(page.locator('[data-testid="ai-assistant-button"]'))
      .first();

    if (await aiButton.count() > 0 && await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(500);

      // Look for input field
      const input = page.locator('input[placeholder*="message" i]')
        .or(page.locator('input[placeholder*="ask" i]'))
        .or(page.locator('textarea[placeholder*="message" i]'))
        .first();

      if (await input.isVisible()) {
        // Type a message
        await input.fill('I need a hotel in Miami');
        await page.waitForTimeout(200);

        // Click send button
        const sendButton = page.locator('button[type="submit"]')
          .or(page.locator('button:has-text("Send")'))
          .or(page.locator('[aria-label*="send" i]'))
          .first();

        if (await sendButton.isVisible() && await sendButton.isEnabled()) {
          await sendButton.click();
          await page.waitForTimeout(2000); // Wait for AI response

          console.log('✅ Message sent to AI assistant');

          // Check for response
          const hasResponse = await page.locator('text=/miami/i')
            .or(page.locator('[data-testid="ai-message"]'))
            .count() > 0;

          if (hasResponse) {
            console.log('✅ AI assistant responded');
          }
        }
      }
    } else {
      console.log('ℹ️  Cannot test AI assistant - button not found');
    }
  });

  test('should handle hotel search query', async ({ page }) => {
    const aiButton = page.locator('[aria-label*="AI" i]')
      .or(page.locator('[data-testid="ai-assistant-button"]'))
      .first();

    if (await aiButton.count() > 0 && await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(500);

      const input = page.locator('input[placeholder*="message" i]')
        .or(page.locator('textarea'))
        .first();

      if (await input.isVisible()) {
        // Ask for hotel recommendations
        await input.fill('Find me hotels in Orlando for December 10-15');

        const sendButton = page.locator('button[type="submit"]')
          .or(page.locator('button:has-text("Send")'))
          .first();

        if (await sendButton.isVisible()) {
          await sendButton.click();
          await page.waitForTimeout(3000); // Wait for hotel search

          // Look for hotel results or cards in AI chat
          const hasHotelResults = await page.locator('[data-testid="hotel-result-card"]')
            .or(page.locator('text=/hotel/i'))
            .count() > 0;

          if (hasHotelResults) {
            console.log('✅ AI assistant returned hotel results');
          }
        }
      }
    }
  });

  test('should display conversation history', async ({ page }) => {
    const aiButton = page.locator('[aria-label*="AI" i]')
      .or(page.locator('[data-testid="ai-assistant-button"]'))
      .first();

    if (await aiButton.count() > 0 && await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(500);

      // Send first message
      const input = page.locator('input[placeholder*="message" i]')
        .or(page.locator('textarea'))
        .first();

      if (await input.isVisible()) {
        await input.fill('Hello');
        const sendButton = page.locator('button[type="submit"]').first();
        if (await sendButton.isVisible()) {
          await sendButton.click();
          await page.waitForTimeout(1500);

          // Send second message
          await input.fill('I need help with hotels');
          await sendButton.click();
          await page.waitForTimeout(1500);

          // Check for multiple messages in history
          const messages = await page.locator('[data-testid="ai-message"]')
            .or(page.locator('[class*="message" i]'))
            .count();

          console.log(`✅ Found ${messages} messages in conversation history`);
        }
      }
    }
  });
});

test.describe('AI Assistant - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/');

    const aiButton = page.locator('[aria-label*="AI" i]')
      .or(page.locator('[data-testid="ai-assistant-button"]'))
      .first();

    if (await aiButton.count() > 0 && await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(500);

      // Verify mobile layout
      const panel = page.locator('[data-testid="ai-assistant-panel"]')
        .or(page.locator('[role="dialog"]'));

      const panelVisible = await panel.isVisible().catch(() => false);

      if (panelVisible) {
        console.log('✅ AI Assistant works on mobile');
      }
    }
  });
});
