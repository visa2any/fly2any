const { chromium } = require('playwright');
const fs = require('fs');

/**
 * Manual Interface Testing - Focus on actual interface elements
 */

async function manualInterfaceTest() {
  console.log('🔍 Starting Manual Interface Investigation...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to email marketing
    console.log('📧 Navigating to email marketing...');
    await page.goto('http://localhost:3000/admin/email-marketing/v2?tab=campaigns');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: './manual_test_01_initial.png', fullPage: true });
    console.log('📸 Initial screenshot saved');
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Let's inspect what's actually on the page
    console.log('\n🔍 Analyzing page content...');
    
    // Get all text content to understand the interface
    const pageText = await page.textContent('body');
    console.log('Page contains text:', pageText.substring(0, 500) + '...');
    
    // Check for campaign creation elements
    const newCampaignButton = await page.locator('button').filter({ hasText: /nova campanha|new campaign|criar/i }).first();
    const buttonExists = await newCampaignButton.isVisible().catch(() => false);
    
    if (buttonExists) {
      console.log('✅ New Campaign button found!');
      await newCampaignButton.highlight();
      await page.screenshot({ path: './manual_test_02_button_found.png' });
      
      // Click the button
      await newCampaignButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: './manual_test_03_after_click.png', fullPage: true });
      
      // Now look for the actual campaign builder interface
      console.log('🔍 Looking for campaign builder interface...');
      
      // Check for form fields
      const nameInput = await page.locator('input').first().isVisible().catch(() => false);
      if (nameInput) {
        console.log('✅ Input fields found');
        await page.locator('input').first().fill('Test Campaign Manual');
        await page.screenshot({ path: './manual_test_04_form_filled.png' });
      }
      
      // Look for TipTap/Editor content
      const editorContent = await page.locator('.ProseMirror, [contenteditable="true"], .prose').first().isVisible().catch(() => false);
      if (editorContent) {
        console.log('✅ Editor content area found');
        await page.locator('.ProseMirror, [contenteditable="true"], .prose').first().click();
        await page.keyboard.type('This is a test email content');
        await page.screenshot({ path: './manual_test_05_editor_used.png' });
      } else {
        console.log('❌ No editor content area found');
      }
      
      // Look for drag and drop elements
      const dragElements = await page.locator('div').filter({ hasText: /📝|🖼️|🔲|texto|imagem|botão/i }).count();
      console.log(`Found ${dragElements} potential drag elements`);
      
      if (dragElements > 0) {
        await page.screenshot({ path: './manual_test_06_drag_elements.png' });
      }
      
    } else {
      console.log('❌ New Campaign button not found');
      
      // Let's see what buttons ARE available
      const allButtons = await page.locator('button').allTextContents();
      console.log('Available buttons:', allButtons);
      
      const allLinks = await page.locator('a').allTextContents();
      console.log('Available links:', allLinks);
    }
    
    // Test template selection
    console.log('\n🎨 Testing template functionality...');
    const templatesTab = await page.locator('button, a').filter({ hasText: /template/i }).first();
    const templatesTabExists = await templatesTab.isVisible().catch(() => false);
    
    if (templatesTabExists) {
      await templatesTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: './manual_test_07_templates.png', fullPage: true });
      console.log('✅ Templates tab accessible');
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ path: './manual_test_08_final_state.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: './manual_test_error.png' });
  } finally {
    await browser.close();
    console.log('✅ Manual testing completed');
  }
}

manualInterfaceTest().catch(console.error);