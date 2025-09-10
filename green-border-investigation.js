const { chromium } = require('playwright');

async function investigateGreenBorders() {
  console.log('🎭 Starting Playwright investigation for green borders...');
  
  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(3000);
    
    // Check if page loaded successfully
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    console.log('🔍 Analyzing elements with green borders or styling...');
    
    // Find all elements with green borders, backgrounds, or text
    const greenElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const greenItems = [];
      
      elements.forEach((el, index) => {
        const styles = window.getComputedStyle(el);
        const borderColor = styles.borderColor;
        const borderTopColor = styles.borderTopColor;
        const borderBottomColor = styles.borderBottomColor;
        const borderLeftColor = styles.borderLeftColor;
        const borderRightColor = styles.borderRightColor;
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        const boxShadow = styles.boxShadow;
        const outline = styles.outline;
        
        // Check for various shades of green
        const greenPattern = /rgb\(\s*([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\s*,\s*(1[0-9][0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\s*\)/;
        
        const hasGreenBorder = [borderColor, borderTopColor, borderBottomColor, borderLeftColor, borderRightColor]
          .some(color => color.includes('green') || greenPattern.test(color));
        
        const hasGreenBackground = backgroundColor.includes('green') || greenPattern.test(backgroundColor);
        const hasGreenText = color.includes('green') || greenPattern.test(color);
        const hasGreenShadow = boxShadow.includes('green') || greenPattern.test(boxShadow);
        const hasGreenOutline = outline.includes('green') || greenPattern.test(outline);
        
        if (hasGreenBorder || hasGreenBackground || hasGreenText || hasGreenShadow || hasGreenOutline) {
          greenItems.push({
            index: index,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            borderColor: borderColor,
            borderTopColor: borderTopColor,
            borderBottomColor: borderBottomColor,
            borderLeftColor: borderLeftColor,
            borderRightColor: borderRightColor,
            backgroundColor: backgroundColor,
            color: color,
            boxShadow: boxShadow,
            outline: outline,
            innerHTML: el.innerHTML.substring(0, 100) + (el.innerHTML.length > 100 ? '...' : ''),
            hasGreenBorder,
            hasGreenBackground,
            hasGreenText,
            hasGreenShadow,
            hasGreenOutline
          });
        }
      });
      
      return greenItems;
    });
    
    console.log(`🟢 Found ${greenElements.length} elements with green styling:`);
    greenElements.forEach((element, index) => {
      console.log(`\n--- Element ${index + 1} ---`);
      console.log(`Tag: ${element.tagName}`);
      console.log(`Class: ${element.className}`);
      console.log(`ID: ${element.id}`);
      if (element.hasGreenBorder) {
        console.log(`🔲 Border Colors: ${element.borderColor}, ${element.borderTopColor}, ${element.borderBottomColor}, ${element.borderLeftColor}, ${element.borderRightColor}`);
      }
      if (element.hasGreenBackground) {
        console.log(`🟢 Background: ${element.backgroundColor}`);
      }
      if (element.hasGreenText) {
        console.log(`📝 Text Color: ${element.color}`);
      }
      if (element.hasGreenShadow) {
        console.log(`🌑 Shadow: ${element.boxShadow}`);
      }
      if (element.hasGreenOutline) {
        console.log(`📐 Outline: ${element.outline}`);
      }
      console.log(`Content: ${element.innerHTML}`);
    });
    
    // Look specifically for service-related elements
    console.log('\n🔎 Checking for service elements with borders...');
    const serviceElements = await page.evaluate(() => {
      const serviceSelectors = [
        '[class*="service"]',
        '[class*="card"]', 
        '[class*="border"]',
        '[data-testid*="service"]',
        '.bg-white',
        '.rounded',
        '.shadow'
      ];
      
      const serviceItems = [];
      serviceSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          serviceItems.push({
            selector: selector,
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            borderColor: styles.borderColor,
            borderWidth: styles.borderWidth,
            borderStyle: styles.borderStyle,
            boxShadow: styles.boxShadow,
            backgroundColor: styles.backgroundColor,
            innerHTML: el.innerHTML.substring(0, 150) + (el.innerHTML.length > 150 ? '...' : '')
          });
        });
      });
      
      return serviceItems;
    });
    
    console.log(`🎯 Found ${serviceElements.length} service-related elements:`);
    serviceElements.forEach((element, index) => {
      console.log(`\n--- Service Element ${index + 1} ---`);
      console.log(`Selector: ${element.selector}`);
      console.log(`Tag: ${element.tagName}`);
      console.log(`Class: ${element.className}`);
      console.log(`Border: ${element.borderWidth} ${element.borderStyle} ${element.borderColor}`);
      console.log(`Background: ${element.backgroundColor}`);
      console.log(`Shadow: ${element.boxShadow}`);
    });
    
    console.log('📸 Taking full page screenshot...');
    await page.screenshot({ 
      path: 'green-border-investigation.png',
      fullPage: true
    });
    
    console.log('📝 Getting page source...');
    const pageSource = await page.content();
    
    // Save page source for analysis
    require('fs').writeFileSync('homepage-source.html', pageSource);
    
    console.log('✅ Investigation complete!');
    console.log('📁 Files created:');
    console.log('   - green-border-investigation.png (screenshot)');
    console.log('   - homepage-source.html (page source)');
    
    return {
      greenElements,
      serviceElements,
      title,
      screenshot: 'green-border-investigation.png',
      source: 'homepage-source.html'
    };
    
  } catch (error) {
    console.error('❌ Error during investigation:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the investigation
investigateGreenBorders()
  .then(result => {
    console.log('\n🎉 Investigation Results:');
    console.log(`📄 Page title: ${result.title}`);
    console.log(`🟢 Green elements found: ${result.greenElements.length}`);
    console.log(`🎯 Service elements found: ${result.serviceElements.length}`);
    console.log(`📸 Screenshot saved: ${result.screenshot}`);
    console.log(`📝 Source saved: ${result.source}`);
  })
  .catch(error => {
    console.error('💥 Investigation failed:', error);
    process.exit(1);
  });