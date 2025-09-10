/**
 * 🎯 MANUAL LEAD FORM ANALYSIS
 * Simple, manual Playwright script to explore the desktop Lead Form
 */

const { chromium } = require('playwright');
const fs = require('fs');

async function manualAnalysis() {
  console.log('🚀 Starting Manual Lead Form Analysis...');
  
  const browser = await chromium.launch({
    headless: false, // Show browser
    slowMo: 2000,    // Slow down by 2 seconds
    timeout: 0       // No timeout
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📄 Loading home page...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000); // Wait 5 seconds for everything to load
    
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: './homepage-initial.png', fullPage: true });
    
    console.log('🔍 Exploring page elements...');
    
    // Get all buttons and their text
    console.log('\n📋 All buttons on page:');
    const buttons = await page.locator('button').all();
    for (let i = 0; i < buttons.length; i++) {
      try {
        const text = await buttons[i].textContent();
        const isVisible = await buttons[i].isVisible();
        const className = await buttons[i].getAttribute('class');
        console.log(`  ${i + 1}. "${text?.trim()}" (visible: ${isVisible}) class: ${className}`);
      } catch (e) {
        console.log(`  ${i + 1}. [Error reading button]`);
      }
    }
    
    console.log('\n🔗 All links on page:');
    const links = await page.locator('a').all();
    for (let i = 0; i < Math.min(links.length, 20); i++) {
      try {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        const isVisible = await links[i].isVisible();
        console.log(`  ${i + 1}. "${text?.trim()}" -> ${href} (visible: ${isVisible})`);
      } catch (e) {
        console.log(`  ${i + 1}. [Error reading link]`);
      }
    }
    
    console.log('\n📝 All form inputs on page:');
    const inputs = await page.locator('input, textarea, select').all();
    for (let i = 0; i < inputs.length; i++) {
      try {
        const type = await inputs[i].getAttribute('type');
        const placeholder = await inputs[i].getAttribute('placeholder');
        const name = await inputs[i].getAttribute('name');
        const isVisible = await inputs[i].isVisible();
        console.log(`  ${i + 1}. Type: ${type}, Name: ${name}, Placeholder: "${placeholder}" (visible: ${isVisible})`);
      } catch (e) {
        console.log(`  ${i + 1}. [Error reading input]`);
      }
    }
    
    console.log('\n🎯 Looking for potential Lead Form triggers...');
    
    // Search for elements with "cotação", "orçamento", "viagem", "lead" etc
    const searchTerms = ['cotação', 'orçamento', 'viagem', 'lead', 'solicitar', 'agendar', 'quote'];
    
    for (const term of searchTerms) {
      try {
        const elements = await page.locator(`*:has-text("${term}")`).all();
        console.log(`  🔍 "${term}": found ${elements.length} elements`);
        
        for (let i = 0; i < Math.min(elements.length, 5); i++) {
          const text = await elements[i].textContent();
          const tagName = await elements[i].evaluate(el => el.tagName);
          const isVisible = await elements[i].isVisible();
          console.log(`    - ${tagName}: "${text?.trim()}" (visible: ${isVisible})`);
        }
      } catch (e) {
        console.log(`  ❌ Error searching for "${term}"`);
      }
    }
    
    console.log('\n🎮 Interactive Analysis - Browser will stay open for manual inspection');
    console.log('👀 Check the browser window to manually inspect the page');
    console.log('💡 Look for Lead Form triggers, modals, or hidden elements');
    console.log('⌨️  Press Ctrl+C in this terminal when done exploring');
    
    // Keep browser open for manual exploration
    await new Promise((resolve) => {
      process.on('SIGINT', () => {
        console.log('\n✅ Manual analysis complete!');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
  } finally {
    await browser.close();
  }
}

manualAnalysis().catch(console.error);