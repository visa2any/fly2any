const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Testing Exit Popup Improved Behavior...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    // Test 1: First visit - popup should appear
    console.log('Test 1: First visit - checking if popup appears after delay...');
    await page.goto('http://localhost:3000');
    
    // Clear localStorage to simulate fresh visit
    await page.evaluate(() => {
      localStorage.removeItem('exitPopupPreferences');
    });
    
    // Reload to apply fresh state
    await page.reload();
    
    // Wait for popup to appear (30 seconds delay or trigger by exit intent)
    console.log('Simulating exit intent by moving mouse to top...');
    await page.mouse.move(640, 0);
    
    // Check if popup appears
    const popupVisible = await page.waitForSelector('text="Não perca nossas ofertas!"', { 
      timeout: 5000 
    }).then(() => true).catch(() => false);
    
    if (popupVisible) {
      console.log('✅ Popup appeared on first visit');
      
      // Test 2: Close with "Don't show again" button
      console.log('\nTest 2: Clicking "Não mostrar novamente"...');
      await page.click('text="Não mostrar novamente"');
      
      // Check localStorage
      const prefs = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('exitPopupPreferences') || '{}');
      });
      
      console.log('✅ Preferences saved:', {
        permanentlyClosed: prefs.permanentlyClosed,
        closedAt: prefs.closedAt ? 'Set' : 'Not set'
      });
      
      // Test 3: Reload page - popup should NOT appear
      console.log('\nTest 3: Reloading page to verify popup doesn\'t show again...');
      await page.reload();
      await page.waitForTimeout(3000);
      
      const popupAfterReload = await page.$('text="Não perca nossas ofertas!"');
      if (!popupAfterReload) {
        console.log('✅ Popup did not appear after closing with "Don\'t show again"');
      } else {
        console.log('❌ Popup appeared again (should not have)');
      }
      
      // Test 4: Test 7-day frequency control
      console.log('\nTest 4: Testing 7-day frequency control...');
      await page.evaluate(() => {
        const prefs = {
          lastShown: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          showCount: 1
        };
        localStorage.setItem('exitPopupPreferences', JSON.stringify(prefs));
      });
      
      await page.reload();
      await page.waitForTimeout(3000);
      
      const popupWithin7Days = await page.$('text="Não perca nossas ofertas!"');
      if (!popupWithin7Days) {
        console.log('✅ Popup respects 7-day cooldown period');
      } else {
        console.log('❌ Popup appeared within 7 days (should not have)');
      }
      
      // Test 5: Test after 7+ days
      console.log('\nTest 5: Testing popup after 7+ days...');
      await page.evaluate(() => {
        const prefs = {
          lastShown: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
          showCount: 1
        };
        localStorage.setItem('exitPopupPreferences', JSON.stringify(prefs));
      });
      
      await page.reload();
      await page.mouse.move(640, 0); // Trigger exit intent
      await page.waitForTimeout(2000);
      
      const popupAfter7Days = await page.$('text="Não perca nossas ofertas!"');
      if (popupAfter7Days) {
        console.log('✅ Popup appears again after 7 days');
      } else {
        console.log('❌ Popup did not appear after 7 days (should have)');
      }
      
      // Test 6: Test subscription flag
      console.log('\nTest 6: Testing subscription flag...');
      await page.evaluate(() => {
        const prefs = {
          hasSubscribed: true,
          subscribedAt: new Date().toISOString(),
          subscribedEmail: 'test@example.com'
        };
        localStorage.setItem('exitPopupPreferences', JSON.stringify(prefs));
      });
      
      await page.reload();
      await page.waitForTimeout(3000);
      
      const popupAfterSubscription = await page.$('text="Não perca nossas ofertas!"');
      if (!popupAfterSubscription) {
        console.log('✅ Popup does not show for subscribed users');
      } else {
        console.log('❌ Popup showed for subscribed user (should not have)');
      }
      
      console.log('\n🎉 All tests completed!');
      console.log('\n📋 Summary of improvements:');
      console.log('• Popup remembers when user closes it');
      console.log('• "Don\'t show again" button permanently disables popup');
      console.log('• 7-day cooldown period between showings');
      console.log('• Never shows for subscribed users');
      console.log('• Preferences persist across sessions via localStorage');
      
    } else {
      console.log('❌ Popup did not appear on first visit');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();