const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing Mobile Premium Form Experience...\n');
  
  const browser = await chromium.launch({ headless: false });
  
  // Test mobile view
  console.log('📱 Testing MOBILE view...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000');
  
  // Wait for premium form to auto-show
  console.log('⏳ Waiting for premium form to auto-show on mobile...');
  await mobilePage.waitForTimeout(1500);
  
  // Check if premium form is visible
  const premiumFormVisible = await mobilePage.evaluate(() => {
    const form = document.querySelector('[class*="h-screen"][class*="bg-gradient"]');
    return form ? true : false;
  });
  
  if (premiumFormVisible) {
    console.log('✅ Premium app form is visible on mobile!');
    await mobilePage.screenshot({ path: 'mobile-premium-form.png', fullPage: false });
    console.log('📸 Screenshot saved as mobile-premium-form.png');
  } else {
    console.log('❌ Premium form not found on mobile');
  }
  
  // Test desktop view
  console.log('\n💻 Testing DESKTOP view...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000');
  await desktopPage.waitForTimeout(2000);
  
  // Check that premium form is NOT visible on desktop
  const desktopFormVisible = await desktopPage.evaluate(() => {
    const form = document.querySelector('[class*="h-screen"][class*="bg-gradient"]');
    return form ? true : false;
  });
  
  if (!desktopFormVisible) {
    console.log('✅ Premium form correctly NOT showing on desktop');
    console.log('✅ Desktop version remains untouched');
  } else {
    console.log('❌ Premium form incorrectly showing on desktop');
  }
  
  // Check if original form exists on desktop
  const originalFormExists = await desktopPage.evaluate(() => {
    const form = document.querySelector('form');
    return form ? true : false;
  });
  
  if (originalFormExists) {
    console.log('✅ Original desktop form is preserved');
    await desktopPage.screenshot({ path: 'desktop-original-form.png', fullPage: false });
    console.log('📸 Desktop screenshot saved as desktop-original-form.png');
  }
  
  console.log('\n✨ Test complete!');
  await browser.close();
})();