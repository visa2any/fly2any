const { chromium } = require('playwright');

async function testHomePageVisual() {
  console.log('🔍 Testing Home Page Visual Rendering\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ 
    headless: true,
    slowMo: 100
  });
  
  const page = await browser.newPage();
  
  try {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('1️⃣ Navigating to home page...');
    await page.goto('http://localhost:3000/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('2️⃣ Waiting for page to fully load...');
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'home-page-full.png',
      fullPage: true 
    });
    console.log('📸 Full page screenshot saved as home-page-full.png');
    
    // Take viewport screenshot
    await page.screenshot({ 
      path: 'home-page-viewport.png',
      fullPage: false 
    });
    console.log('📸 Viewport screenshot saved as home-page-viewport.png');
    
    // Check for LiveSiteHeader component
    console.log('\n3️⃣ Checking for LiveSiteHeader...');
    
    // Check for elements that should be in LiveSiteHeader
    const flashSaleBar = await page.locator('text=FLASH SALE').count();
    const bbbRating = await page.locator('text=BBB A+ Rated').count();
    const fasterThanKayak = await page.locator('text=5X FASTER THAN KAYAK').count();
    const aiAssistant = await page.locator('text=AI Assistant').count();
    
    console.log('LiveSiteHeader elements:');
    console.log(`  - Flash Sale bar: ${flashSaleBar > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - BBB A+ Rating: ${bbbRating > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - 5X Faster badge: ${fasterThanKayak > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - AI Assistant: ${aiAssistant > 0 ? '✅ Found' : '❌ Not found'}`);
    
    // Check for LiveSiteFooter component
    console.log('\n4️⃣ Checking for LiveSiteFooter...');
    
    // Scroll to bottom to ensure footer is in view
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Check for elements that should be in LiveSiteFooter
    const trustedBy = await page.locator('text=Trusted by 2.1M+ Travelers').count();
    const iataFooter = await page.locator('text=IATA Certified Agent').count();
    const priceMatchFooter = await page.locator('text=Price Match').count();
    const madeWithAI = await page.locator('text=Made with').count();
    
    console.log('LiveSiteFooter elements:');
    console.log(`  - Trusted by 2.1M: ${trustedBy > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - IATA Certified: ${iataFooter > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - Price Match: ${priceMatchFooter > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - Made with AI: ${madeWithAI > 0 ? '✅ Found' : '❌ Not found'}`);
    
    // Take screenshot of just the footer area
    await page.screenshot({ 
      path: 'home-page-footer.png',
      fullPage: false 
    });
    console.log('📸 Footer area screenshot saved as home-page-footer.png');
    
    // Check what header is actually rendered
    console.log('\n5️⃣ Checking actual header content...');
    
    // Get the first header element
    const headerElement = await page.locator('header').first();
    const headerExists = await headerElement.count() > 0;
    
    if (headerExists) {
      const headerText = await headerElement.textContent();
      console.log('Header found with content:');
      console.log(headerText.substring(0, 200) + '...');
      
      // Check header classes
      const headerClasses = await headerElement.getAttribute('class');
      console.log(`Header classes: ${headerClasses || 'none'}`);
    } else {
      console.log('❌ No <header> element found');
      
      // Check for old ResponsiveHeader
      const oldHeaderNav = await page.locator('nav').first();
      if (await oldHeaderNav.count() > 0) {
        const navText = await oldHeaderNav.textContent();
        console.log('⚠️  Found <nav> element (possibly old ResponsiveHeader):');
        console.log(navText.substring(0, 200) + '...');
      }
    }
    
    // Check what footer is actually rendered
    console.log('\n6️⃣ Checking actual footer content...');
    
    const footerElement = await page.locator('footer').first();
    const footerExists = await footerElement.count() > 0;
    
    if (footerExists) {
      const footerText = await footerElement.textContent();
      console.log('Footer found with content:');
      console.log(footerText.substring(0, 200) + '...');
      
      // Check footer classes
      const footerClasses = await footerElement.getAttribute('class');
      console.log(`Footer classes: ${footerClasses || 'none'}`);
    } else {
      console.log('❌ No <footer> element found');
    }
    
    // Check console for debug messages
    console.log('\n7️⃣ Checking console messages...');
    
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.text().includes('LiveSite')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Reload to capture console messages
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    if (consoleMessages.length > 0) {
      console.log('Console messages found:');
      consoleMessages.forEach(msg => console.log(`  - ${msg}`));
    } else {
      console.log('No LiveSite console messages found');
    }
    
    // Final check: Look for any text that should be unique to new components
    console.log('\n8️⃣ Final content verification...');
    
    const pageContent = await page.content();
    const hasLiveHeaderInDOM = pageContent.includes('LiveSiteHeader');
    const hasLiveFooterInDOM = pageContent.includes('LiveSiteFooter');
    
    console.log(`LiveSiteHeader in DOM: ${hasLiveHeaderInDOM ? '✅ Yes' : '❌ No'}`);
    console.log(`LiveSiteFooter in DOM: ${hasLiveFooterInDOM ? '✅ Yes' : '❌ No'}`);
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    
    const headerWorking = flashSaleBar > 0 || bbbRating > 0 || fasterThanKayak > 0;
    const footerWorking = trustedBy > 0 || iataFooter > 0 || priceMatchFooter > 0;
    
    if (headerWorking && footerWorking) {
      console.log('✅ Both LiveSiteHeader and LiveSiteFooter are rendering!');
    } else if (headerWorking) {
      console.log('⚠️  LiveSiteHeader is working but LiveSiteFooter is not showing');
    } else if (footerWorking) {
      console.log('⚠️  LiveSiteFooter is working but LiveSiteHeader is not showing');
    } else {
      console.log('❌ Neither LiveSiteHeader nor LiveSiteFooter are rendering');
      console.log('\nPossible issues:');
      console.log('1. Components not being imported correctly');
      console.log('2. Next.js not detecting the changes (try restarting dev server)');
      console.log('3. Browser cache (try hard refresh)');
      console.log('4. Build cache (try deleting .next folder)');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('  - home-page-full.png (entire page)');
    console.log('  - home-page-viewport.png (viewport only)');
    console.log('  - home-page-footer.png (footer area)');
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

testHomePageVisual().catch(console.error);