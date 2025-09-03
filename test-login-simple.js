const { chromium } = require('playwright');

async function testLoginSimple() {
  console.log('🔍 Testing Login Page...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Show browser to see what's happening
    slowMo: 100      // Slow down actions to observe
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to login page with extended timeout
    console.log('1️⃣ Navigating to login page...');
    await page.goto('http://localhost:3000/admin/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // Wait for React hydration and any client-side rendering
    console.log('2️⃣ Waiting for page to fully load...');
    await page.waitForTimeout(5000);
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'login-page-state.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved as login-page-state.png');
    
    // Check what's actually on the page
    const pageContent = await page.content();
    const hasLoginForm = pageContent.includes('admin-login-form');
    const hasEmailInput = pageContent.includes('name="email"');
    const hasPasswordInput = pageContent.includes('name="password"');
    const hasLoadingSpinner = pageContent.includes('animate-spin');
    
    console.log('\n📊 Page Analysis:');
    console.log(`  - Has login form: ${hasLoginForm}`);
    console.log(`  - Has email input: ${hasEmailInput}`);
    console.log(`  - Has password input: ${hasPasswordInput}`);
    console.log(`  - Has loading spinner: ${hasLoadingSpinner}`);
    
    // Try different selectors
    const selectors = {
      'Form (class)': '.admin-login-form',
      'Form (tag)': 'form',
      'Email (name)': 'input[name="email"]',
      'Email (type)': 'input[type="email"]',
      'Password (name)': 'input[name="password"]',
      'Password (type)': 'input[type="password"]',
      'Submit button': 'button[type="submit"]',
      'Any button': 'button',
      'Any input': 'input'
    };
    
    console.log('\n🔍 Element Visibility Check:');
    for (const [name, selector] of Object.entries(selectors)) {
      try {
        const element = await page.$(selector);
        const isVisible = element ? await element.isVisible() : false;
        console.log(`  ${isVisible ? '✅' : '❌'} ${name}: ${selector}`);
      } catch (e) {
        console.log(`  ❌ ${name}: Error checking`);
      }
    }
    
    // Check if page is stuck on loading
    const loadingElement = await page.$('.animate-spin');
    if (loadingElement) {
      console.log('\n⚠️  Page appears to be stuck on loading spinner');
      
      // Wait longer and check again
      console.log('⏳ Waiting 10 more seconds...');
      await page.waitForTimeout(10000);
      
      const stillLoading = await page.$('.animate-spin');
      if (stillLoading) {
        console.log('❌ Still showing loading spinner after extended wait');
      } else {
        console.log('✅ Loading completed');
        
        // Take another screenshot
        await page.screenshot({ 
          path: 'login-page-after-wait.png',
          fullPage: true 
        });
        console.log('📸 Screenshot saved as login-page-after-wait.png');
      }
    }
    
    // Try to find form with wait
    console.log('\n3️⃣ Attempting to find login form...');
    try {
      await page.waitForSelector('.admin-login-form', { timeout: 15000 });
      console.log('✅ Login form found!');
      
      // Test filling the form
      console.log('\n4️⃣ Testing form interaction...');
      await page.fill('input[name="email"]', 'admin@fly2any.com');
      await page.fill('input[name="password"]', 'fly2any2024!');
      console.log('✅ Form filled successfully');
      
      // Take screenshot with filled form
      await page.screenshot({ 
        path: 'login-form-filled.png',
        fullPage: true 
      });
      console.log('📸 Screenshot with filled form saved');
      
      // Click submit
      console.log('\n5️⃣ Clicking submit button...');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`\n📍 Current URL: ${currentUrl}`);
      
      if (!currentUrl.includes('/login')) {
        console.log('✅ Successfully logged in and redirected!');
      } else {
        // Check for error message
        const errorElement = await page.$('.admin-login-error');
        if (errorElement) {
          const errorText = await page.textContent('.admin-login-error');
          console.log(`⚠️  Login failed with error: ${errorText}`);
        } else {
          console.log('⚠️  Still on login page, no error shown');
        }
      }
      
    } catch (timeoutError) {
      console.log('❌ Login form never appeared');
      console.log('   The page might be stuck loading or there might be a JavaScript error');
      
      // Check console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('   Console error:', msg.text());
        }
      });
      
      // Check for any JavaScript errors
      const jsErrors = await page.evaluate(() => {
        return window.errors || [];
      });
      
      if (jsErrors.length > 0) {
        console.log('\n🐛 JavaScript Errors Found:');
        jsErrors.forEach(err => console.log(`   - ${err}`));
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    console.log('\n📊 Test Complete. Check screenshots for visual confirmation.');
    await browser.close();
  }
}

testLoginSimple().catch(console.error);