/**
 * 🔍 GREEN BORDER DEBUG SCRIPT
 * Specifically find green borders around services on homepage
 */

const { chromium } = require('playwright');

async function debugGreenBorders() {
  console.log('🔍 Starting Green Border Debug Analysis...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📄 Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take initial screenshot
    await page.screenshot({ path: './green-border-before.png', fullPage: true });
    console.log('📸 Screenshot taken: green-border-before.png');
    
    // Find all elements with green styling
    console.log('\n🔍 Searching for elements with green styling...');
    
    const greenElements = await page.evaluate(() => {
      const elements = [];
      
      // Get all elements
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        const borderColor = computed.borderColor;
        const backgroundColor = computed.backgroundColor;
        const color = computed.color;
        
        // Check for green colors
        const hasGreenBorder = borderColor.includes('22, 197, 94') || 
                              borderColor.includes('16, 163, 74') || 
                              borderColor.includes('34, 197, 94') || 
                              borderColor.includes('59, 130, 246') || // This might be misidentified as green
                              borderColor.includes('green') ||
                              borderColor.includes('#22c55e') ||
                              borderColor.includes('#16a34a') ||
                              borderColor.includes('#10b981');
                              
        const hasGreenBackground = backgroundColor.includes('22, 197, 94') || 
                                  backgroundColor.includes('16, 163, 74') || 
                                  backgroundColor.includes('34, 197, 94') ||
                                  backgroundColor.includes('green') ||
                                  backgroundColor.includes('#22c55e') ||
                                  backgroundColor.includes('#16a34a') ||
                                  backgroundColor.includes('#10b981');
                                  
        const hasGreenText = color.includes('22, 197, 94') || 
                            color.includes('16, 163, 74') || 
                            color.includes('34, 197, 94') ||
                            color.includes('green') ||
                            color.includes('#22c55e') ||
                            color.includes('#16a34a') ||
                            color.includes('#10b981');
        
        if (hasGreenBorder || hasGreenBackground || hasGreenText) {
          const rect = el.getBoundingClientRect();
          elements.push({
            index,
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent ? el.textContent.substring(0, 50) + '...' : '',
            borderColor,
            backgroundColor,
            color,
            position: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            visible: rect.width > 0 && rect.height > 0
          });
        }
      });
      
      return elements;
    });
    
    console.log(`🎯 Found ${greenElements.length} elements with green styling:`);
    greenElements.forEach((el, i) => {
      console.log(`\n${i + 1}. ${el.tagName} (${el.className})`);
      console.log(`   Text: ${el.textContent}`);
      console.log(`   Border: ${el.borderColor}`);
      console.log(`   Background: ${el.backgroundColor}`);
      console.log(`   Color: ${el.color}`);
      console.log(`   Position: ${el.position.left}, ${el.position.top} (${el.position.width}x${el.position.height})`);
      console.log(`   Visible: ${el.visible}`);
    });
    
    // Look specifically for service buttons
    console.log('\n🎯 Checking service buttons specifically...');
    
    const serviceButtons = await page.locator('button, .serviceButton, [class*="service"]').all();
    console.log(`📋 Found ${serviceButtons.length} potential service buttons`);
    
    for (let i = 0; i < serviceButtons.length; i++) {
      try {
        const button = serviceButtons[i];
        const text = await button.textContent();
        const className = await button.getAttribute('class');
        const computedStyle = await button.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            borderColor: computed.borderColor,
            backgroundColor: computed.backgroundColor,
            borderWidth: computed.borderWidth,
            borderStyle: computed.borderStyle
          };
        });
        
        if (text && (text.includes('Voo') || text.includes('Hotel') || text.includes('Carro') || text.includes('Passeio') || text.includes('Seguro'))) {
          console.log(`\n🎮 Service Button ${i + 1}: "${text}"`);
          console.log(`   Class: ${className}`);
          console.log(`   Border: ${computedStyle.borderWidth} ${computedStyle.borderStyle} ${computedStyle.borderColor}`);
          console.log(`   Background: ${computedStyle.backgroundColor}`);
          
          // Highlight this element temporarily
          await button.evaluate(el => {
            el.style.outline = '3px solid red';
            setTimeout(() => {
              el.style.outline = '';
            }, 2000);
          });
        }
      } catch (e) {
        // Skip elements that can't be analyzed
      }
    }
    
    // Try clicking the "Free Quote" button to open lead form
    console.log('\n🎯 Trying to open lead form...');
    try {
      const quoteButton = await page.locator('button:has-text("Save up to $250 - Free Quote")');
      if (await quoteButton.count() > 0) {
        await quoteButton.click();
        await page.waitForTimeout(3000);
        
        console.log('✅ Lead form opened, taking screenshot...');
        await page.screenshot({ path: './green-border-with-form.png', fullPage: true });
        
        // Check for green borders in the opened form
        const formGreenElements = await page.evaluate(() => {
          const elements = [];
          const allElements = document.querySelectorAll('*');
          
          allElements.forEach((el) => {
            const computed = window.getComputedStyle(el);
            const borderColor = computed.borderColor;
            
            if (borderColor.includes('22, 197, 94') || 
                borderColor.includes('16, 163, 74') || 
                borderColor.includes('34, 197, 94') ||
                borderColor.includes('green')) {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                elements.push({
                  tagName: el.tagName,
                  className: el.className,
                  textContent: el.textContent ? el.textContent.substring(0, 50) : '',
                  borderColor
                });
              }
            }
          });
          
          return elements;
        });
        
        console.log(`\n🎯 Found ${formGreenElements.length} green border elements in opened form:`);
        formGreenElements.forEach((el, i) => {
          console.log(`${i + 1}. ${el.tagName}.${el.className}: "${el.textContent}" - Border: ${el.borderColor}`);
        });
      }
    } catch (e) {
      console.log('⚠️ Could not open lead form:', e.message);
    }
    
    console.log('\n✅ Green border analysis complete!');
    console.log('📸 Screenshots saved: green-border-before.png, green-border-with-form.png');
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser staying open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugGreenBorders().catch(console.error);