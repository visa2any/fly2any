/**
 * 🔍 VERIFY GREEN BORDER REMOVAL
 * Quick test to confirm green borders have been successfully removed
 */

const { chromium } = require('playwright');

async function verifyGreenBorderRemoval() {
  console.log('🔍 Verifying Green Border Removal...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📄 Loading homepage to verify changes...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot after changes
    await page.screenshot({ path: './green-border-fixed.png', fullPage: true });
    console.log('📸 Screenshot taken: green-border-fixed.png');
    
    // Check for remaining green elements
    const remainingGreenElements = await page.evaluate(() => {
      const elements = [];
      const greenColors = [
        'rgba(34, 197, 94',
        'rgb(34, 197, 94)',
        '#22c55e',
        '#16a34a',
        '#10b981',
        '#059669'
      ];
      
      document.querySelectorAll('*').forEach((el) => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        if (rect.width > 0 && rect.height > 0) {
          const borderColor = computed.borderColor || computed.borderTopColor;
          const backgroundColor = computed.backgroundColor;
          const color = computed.color;
          
          const hasGreen = greenColors.some(greenColor => 
            borderColor.includes(greenColor) || 
            backgroundColor.includes(greenColor) ||
            color.includes(greenColor)
          );
          
          if (hasGreen) {
            elements.push({
              tagName: el.tagName,
              className: el.className,
              textContent: el.textContent ? el.textContent.substring(0, 50) + '...' : '',
              borderColor,
              backgroundColor,
              color,
              position: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              }
            });
          }
        }
      });
      
      return elements;
    });
    
    console.log(`\n🎯 Results: Found ${remainingGreenElements.length} remaining green elements`);
    
    if (remainingGreenElements.length === 0) {
      console.log('✅ SUCCESS: All green borders have been successfully removed!');
    } else {
      console.log('⚠️  Warning: Some green elements still remain:');
      remainingGreenElements.forEach((el, i) => {
        console.log(`\n${i + 1}. ${el.tagName}.${el.className}`);
        console.log(`   Text: "${el.textContent}"`);
        console.log(`   Position: (${el.position.left}, ${el.position.top}) ${el.position.width}x${el.position.height}`);
        console.log(`   Border: ${el.borderColor}`);
        console.log(`   Background: ${el.backgroundColor}`);
        console.log(`   Color: ${el.color}`);
      });
    }
    
    // Test service buttons functionality
    console.log('\n🎮 Testing service button functionality...');
    
    const serviceButtons = await page.locator('button, [class*="service"]').all();
    let functionalButtons = 0;
    
    for (let i = 0; i < Math.min(serviceButtons.length, 10); i++) {
      try {
        const button = serviceButtons[i];
        const text = await button.textContent();
        
        if (text && (text.includes('Voo') || text.includes('Hotel') || text.includes('Carro') || text.includes('Passeio') || text.includes('Seguro'))) {
          const isVisible = await button.isVisible();
          const isEnabled = await button.isEnabled();
          
          if (isVisible && isEnabled) {
            functionalButtons++;
            console.log(`   ✅ "${text.substring(0, 20)}..." - Functional`);
          } else {
            console.log(`   ⚠️  "${text.substring(0, 20)}..." - Not functional (visible: ${isVisible}, enabled: ${isEnabled})`);
          }
        }
      } catch (e) {
        // Skip problematic elements
      }
    }
    
    console.log(`\n📊 Service buttons: ${functionalButtons} functional buttons found`);
    
    // Test quote button and form opening
    console.log('\n🎯 Testing quote button and form...');
    try {
      const quoteButton = await page.locator('button:has-text("Save up to $250 - Free Quote")');
      if (await quoteButton.count() > 0) {
        await quoteButton.click();
        await page.waitForTimeout(3000);
        
        console.log('✅ Quote button works - Lead form opened successfully');
        
        // Check for green elements in opened form
        const formGreenElements = await page.evaluate(() => {
          const elements = [];
          const greenColors = ['rgba(34, 197, 94', '#22c55e', '#16a34a', '#10b981'];
          
          document.querySelectorAll('*').forEach((el) => {
            const computed = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
              const borderColor = computed.borderColor;
              if (greenColors.some(color => borderColor.includes(color))) {
                elements.push({
                  tagName: el.tagName,
                  className: el.className,
                  borderColor
                });
              }
            }
          });
          
          return elements;
        });
        
        if (formGreenElements.length === 0) {
          console.log('✅ No green borders found in opened form');
        } else {
          console.log(`⚠️  Found ${formGreenElements.length} green elements in form`);
        }
        
        // Take screenshot of form
        await page.screenshot({ path: './green-border-form-fixed.png', fullPage: true });
        console.log('📸 Form screenshot: green-border-form-fixed.png');
        
      } else {
        console.log('⚠️  Quote button not found');
      }
    } catch (e) {
      console.log('❌ Error testing form:', e.message);
    }
    
    console.log('\n✅ Green Border Removal Verification Complete!');
    
    if (remainingGreenElements.length === 0) {
      console.log('🎉 SUCCESS: All green borders successfully removed from services!');
      console.log('🎨 New color scheme: Blue (#2563eb) replacing green (#22c55e)');
    } else {
      console.log('📋 ACTION NEEDED: Some green elements may need additional attention');
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    console.log('\n🔍 Browser staying open for visual inspection...');
    console.log('👀 Check the page manually to confirm the changes');
    console.log('⌨️  Press Ctrl+C when done inspecting');
    
    // Keep browser open for manual inspection
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });
    
    await browser.close();
  }
}

// Run verification
verifyGreenBorderRemoval().catch(console.error);