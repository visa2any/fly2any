const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing Admin Login Page UX...');
    
    // Navigate to admin login page
    await page.goto('http://localhost:3000/admin/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for the login form to be visible
    await page.waitForSelector('.admin-login-container', { timeout: 10000 });
    
    // Take a screenshot to verify the UI
    await page.screenshot({ 
      path: 'admin-login-fixed.png',
      fullPage: true 
    });
    
    console.log('✅ Screenshot saved as admin-login-fixed.png');
    
    // Check if icon elements exist and have proper sizes
    const iconSizes = await page.evaluate(() => {
      const results = [];
      
      // Check logo icon
      const logoIcon = document.querySelector('.admin-login-logo-icon');
      if (logoIcon) {
        const rect = logoIcon.getBoundingClientRect();
        results.push({
          element: 'Logo Icon',
          width: rect.width,
          height: rect.height,
          expected: '32x32px (w-8 h-8)'
        });
      }
      
      // Check field icons
      const fieldIcons = document.querySelectorAll('.admin-login-field-icon');
      fieldIcons.forEach((icon, index) => {
        const rect = icon.getBoundingClientRect();
        results.push({
          element: `Field Icon ${index + 1}`,
          width: rect.width,
          height: rect.height,
          expected: '16x16px (w-4 h-4)'
        });
      });
      
      // Check button icon
      const buttonIcon = document.querySelector('.admin-login-button-icon');
      if (buttonIcon) {
        const rect = buttonIcon.getBoundingClientRect();
        results.push({
          element: 'Button Icon',
          width: rect.width,
          height: rect.height,
          expected: '20x20px (w-5 h-5)'
        });
      }
      
      // Check error icon (if visible)
      const errorIcon = document.querySelector('.admin-login-error-icon');
      if (errorIcon) {
        const rect = errorIcon.getBoundingClientRect();
        results.push({
          element: 'Error Icon',
          width: rect.width,
          height: rect.height,
          expected: '20x20px (w-5 h-5)'
        });
      }
      
      // Check footer icon
      const footerIcon = document.querySelector('.admin-login-footer-icon');
      if (footerIcon) {
        const rect = footerIcon.getBoundingClientRect();
        results.push({
          element: 'Footer Icon',
          width: rect.width,
          height: rect.height,
          expected: '16x16px (w-4 h-4)'
        });
      }
      
      // Check dev icon (if in development mode)
      const devIcon = document.querySelector('.admin-login-dev-icon');
      if (devIcon) {
        const rect = devIcon.getBoundingClientRect();
        results.push({
          element: 'Dev Icon',
          width: rect.width,
          height: rect.height,
          expected: '16x16px (w-4 h-4)'
        });
      }
      
      return results;
    });
    
    console.log('\n📊 Icon Size Report:');
    console.log('─'.repeat(50));
    
    let allCorrect = true;
    iconSizes.forEach(icon => {
      const sizeCorrect = 
        (icon.expected.includes('32x32') && icon.width === 32 && icon.height === 32) ||
        (icon.expected.includes('20x20') && icon.width === 20 && icon.height === 20) ||
        (icon.expected.includes('16x16') && icon.width === 16 && icon.height === 16);
      
      const status = sizeCorrect ? '✅' : '❌';
      if (!sizeCorrect) allCorrect = false;
      
      console.log(`${status} ${icon.element}: ${icon.width}x${icon.height}px (Expected: ${icon.expected})`);
    });
    
    console.log('─'.repeat(50));
    
    if (allCorrect) {
      console.log('\n✨ All icons are properly sized! UX issue fixed.');
    } else {
      console.log('\n⚠️ Some icons may still have sizing issues.');
    }
    
    // Test form functionality
    console.log('\n🧪 Testing form interaction...');
    
    // Fill in the form
    await page.fill('input[name="email"]', 'admin@fly2any.com');
    await page.fill('input[name="password"]', 'fly2any2024!');
    
    // Take a screenshot with filled form
    await page.screenshot({ 
      path: 'admin-login-filled.png',
      fullPage: true 
    });
    
    console.log('✅ Form interaction test completed');
    console.log('✅ Screenshot with filled form saved as admin-login-filled.png');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
})();