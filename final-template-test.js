const { chromium } = require('@playwright/test');

async function finalTemplateTest() {
  console.log('🔍 FINAL INVESTIGATION: Template Loading and Display');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Monitor network requests
    const templateAPIRequests = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('email-marketing/v2') && url.includes('action=templates')) {
        templateAPIRequests.push({
          url,
          status: response.status(),
          statusText: response.statusText()
        });
        console.log(`📡 TEMPLATE API REQUEST: ${response.status()} ${url}`);
      }
    });

    // Monitor console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ BROWSER ERROR: ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3000/admin/login');
    await page.fill('input[type="email"]', 'admin@fly2any.com');
    await page.fill('input[type="password"]', 'fly2any2024!');
    await page.click('button:has-text("Entrar"), button[type="submit"]');
    await page.waitForTimeout(3000);
    
    console.log('📍 Navigating to email marketing...');
    await page.goto('http://localhost:3000/admin/email-marketing/v2');
    await page.waitForTimeout(3000);
    
    console.log('🖱️ Clicking Templates tab...');
    await page.click('text="Templates"');
    
    // Wait for the templates to load
    console.log('⏳ Waiting for templates to load...');
    await page.waitForTimeout(5000);
    
    console.log('🔍 Checking template gallery after loading...');
    
    // Check for loading states
    const loadingElements = await page.locator('.animate-pulse, [class*="loading"], .bg-gray-200').count();
    console.log(`⏳ Loading elements found: ${loadingElements}`);
    
    // Check for template cards more broadly
    const templateCards = await page.locator('div[class*="grid"] > div, .template-card, [class*="template"], .bg-white').count();
    console.log(`🎨 Potential template elements found: ${templateCards}`);
    
    // Look for specific content that indicates templates are loaded
    const templateNames = await page.locator('text="Welcome Email", text="Newsletter Modern", text="Promotional Sale", text="Event Invitation"').count();
    console.log(`📝 Default template names found: ${templateNames}`);
    
    // Check for any buttons or interactive elements
    const buttons = await page.locator('button:has-text("Usar Template"), button:has-text("Template")').count();
    console.log(`🔘 Template action buttons found: ${buttons}`);
    
    // Get the actual content of the templates area
    const templatesContent = await page.locator('.grid').first().textContent().catch(() => 'No grid content found');
    console.log(`📄 Templates grid content (first 500 chars): ${templatesContent.slice(0, 500)}`);
    
    // Check if there are any error messages displayed
    const errorMessages = await page.locator('text="Nenhum template encontrado", text="templates não encontrados", [class*="error"]').count();
    console.log(`❌ Error messages found: ${errorMessages}`);
    
    // Summary of network requests
    console.log('🌐 Template API requests summary:');
    templateAPIRequests.forEach((req, idx) => {
      console.log(`  ${idx + 1}. ${req.status} ${req.statusText} - ${req.url}`);
    });
    
    if (templateAPIRequests.length === 0) {
      console.log('⚠️ NO TEMPLATE API REQUESTS DETECTED - This might be the issue!');
    }
    
    // Final screenshot
    console.log('📸 Taking final screenshot...');
    await page.screenshot({ path: 'final-template-investigation.png', fullPage: true });
    
    // Try to click on a template if any are visible
    const firstTemplate = page.locator('button:has-text("Usar Template")').first();
    if (await firstTemplate.count() > 0) {
      console.log('🖱️ Attempting to click first template...');
      await firstTemplate.click();
      await page.waitForTimeout(3000);
      
      // Check what happens after clicking
      const currentUrl = page.url();
      const content = await page.locator('body').textContent();
      console.log(`📍 After template click - URL: ${currentUrl}`);
      console.log(`📄 Content contains template HTML: ${content.includes('<!DOCTYPE html>') || content.includes('<div')}`);
      
      await page.screenshot({ path: 'after-template-click.png', fullPage: true });
    } else {
      console.log('❌ No clickable templates found');
    }
    
    console.log('✅ Investigation completed!');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    await page.screenshot({ path: 'investigation-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

finalTemplateTest().catch(console.error);