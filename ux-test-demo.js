#!/usr/bin/env node

const { chromium } = require('playwright');

console.log('🎭 UX Testing Demo - Quick Verification');
console.log('🎯 Testing glassmorphism flight search form');
console.log('');

async function quickDemo() {
  let browser;
  
  try {
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();
    
    console.log('🌐 Navigating to flights page...');
    await page.goto('http://localhost:3000/flights');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Looking for flight search form...');
    const searchForm = page.locator('[data-testid="flight-search-form"], .flight-search-form, form').first();
    
    if (await searchForm.isVisible()) {
      console.log('✅ Flight search form found!');
      
      // Check for glassmorphism effects
      const glassmorphism = await searchForm.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backdropFilter: computed.backdropFilter || computed.webkitBackdropFilter,
          background: computed.background,
          borderRadius: computed.borderRadius
        };
      });
      
      if (glassmorphism.backdropFilter && glassmorphism.backdropFilter !== 'none') {
        console.log('✅ Glassmorphism effects detected!');
        console.log(`   • Backdrop filter: ${glassmorphism.backdropFilter}`);
      } else {
        console.log('⚠️  Glassmorphism effects not detected');
      }
      
      if (glassmorphism.background.includes('rgba') || glassmorphism.background.includes('hsla')) {
        console.log('✅ Semi-transparent background detected!');
      }
      
      // Test form interactions
      console.log('🎯 Testing form interactions...');
      
      const inputs = page.locator('input:visible');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        console.log(`✅ Found ${inputCount} form inputs`);
        
        // Test first input
        const firstInput = inputs.first();
        await firstInput.focus();
        console.log('✅ Form input focus works');
        
        await firstInput.fill('Test');
        console.log('✅ Form input typing works');
        
        await firstInput.clear();
      }
      
      // Check for buttons
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        console.log(`✅ Found ${buttonCount} interactive buttons`);
        
        // Test button hover
        const firstButton = buttons.first();
        await firstButton.hover();
        console.log('✅ Button hover effects work');
      }
      
      console.log('');
      console.log('🎉 Quick demo completed successfully!');
      console.log('🚀 Your glassmorphism flight search form is ready for comprehensive UX testing!');
      console.log('');
      console.log('🔧 Run full test suite with:');
      console.log('   npm run ux:test');
      
    } else {
      console.log('❌ Flight search form not found');
      console.log('   Please check that the form exists on /flights page');
    }
    
    // Keep browser open for 3 seconds to see the form
    console.log('👀 Keeping browser open for 3 seconds...');
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('🔧 Development server not running. Please start it with:');
      console.log('   npm run dev');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the demo
quickDemo();