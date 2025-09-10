/**
 * 🎯 PLAYWRIGHT FULL POWER GREEN BORDER INVESTIGATION
 * Complete detailed analysis of green border elements using Playwright
 */

const { chromium } = require('playwright');
const fs = require('fs');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotsDir: './playwright-investigation',
  reportFile: './PLAYWRIGHT_GREEN_BORDER_INVESTIGATION.md'
};

// Ensure screenshots directory exists
if (!fs.existsSync(CONFIG.screenshotsDir)) {
  fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
}

let investigationResults = {
  timestamp: new Date().toISOString(),
  greenElements: [],
  screenshots: [],
  cssRules: [],
  recommendations: []
};

/**
 * 🔍 Full Power Playwright Investigation
 */
async function runFullPowerInvestigation() {
  console.log('🚀 PLAYWRIGHT FULL POWER GREEN BORDER INVESTIGATION');
  console.log('🎯 Using advanced Playwright analysis techniques');
  console.log('📍 Target: Green borders around services on homepage');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'] // For better debugging
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📄 Loading homepage with full network monitoring...');
    
    // Enable CSS coverage to track which styles are used
    await page.coverage.startCSSCoverage();
    
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    console.log('📊 Phase 1: Initial Analysis & Screenshots');
    
    // Take initial full page screenshot
    const screenshot1 = `${CONFIG.screenshotsDir}/01-initial-full-page.png`;
    await page.screenshot({ path: screenshot1, fullPage: true });
    investigationResults.screenshots.push(screenshot1);
    console.log(`📸 Full page screenshot: ${screenshot1}`);
    
    // Take viewport-only screenshot
    const screenshot2 = `${CONFIG.screenshotsDir}/02-initial-viewport.png`;
    await page.screenshot({ path: screenshot2, fullPage: false });
    investigationResults.screenshots.push(screenshot2);
    console.log(`📸 Viewport screenshot: ${screenshot2}`);
    
    console.log('🔍 Phase 2: Detecting Green Border Elements...');
    
    // Advanced green border detection
    const greenBorderElements = await page.evaluate(() => {
      const elements = [];
      const greenColorVariations = [
        'rgba(34, 197, 94, 0.3)',
        'rgba(34, 197, 94, 0.2)', 
        'rgba(34, 197, 94, 0.1)',
        'rgb(34, 197, 94)',
        '#22c55e',
        '#16a34a',
        '#10b981',
        '#059669',
        'green'
      ];
      
      // Check all elements
      document.querySelectorAll('*').forEach((el, index) => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        // Check for green borders
        const hasBorder = computed.borderTopWidth !== '0px' || 
                         computed.borderRightWidth !== '0px' || 
                         computed.borderBottomWidth !== '0px' || 
                         computed.borderLeftWidth !== '0px';
        
        if (hasBorder) {
          const borderColors = {
            top: computed.borderTopColor,
            right: computed.borderRightColor,
            bottom: computed.borderBottomColor,
            left: computed.borderLeftColor
          };
          
          const hasGreenBorder = greenColorVariations.some(color => 
            Object.values(borderColors).some(borderColor => 
              borderColor.includes(color.replace('rgba', '').replace('rgb', '').replace(/[()]/g, ''))
            )
          );
          
          if (hasGreenBorder && rect.width > 0 && rect.height > 0) {
            // Get all computed styles for detailed analysis
            const allStyles = {};
            for (let i = 0; i < computed.length; i++) {
              const prop = computed[i];
              allStyles[prop] = computed.getPropertyValue(prop);
            }
            
            elements.push({
              index,
              tagName: el.tagName.toLowerCase(),
              id: el.id,
              className: el.className,
              innerHTML: el.innerHTML.substring(0, 200) + (el.innerHTML.length > 200 ? '...' : ''),
              textContent: el.textContent ? el.textContent.substring(0, 100) + '...' : '',
              borderColors,
              borderWidths: {
                top: computed.borderTopWidth,
                right: computed.borderRightWidth,
                bottom: computed.borderBottomWidth,
                left: computed.borderLeftWidth
              },
              borderStyles: {
                top: computed.borderTopStyle,
                right: computed.borderRightStyle,
                bottom: computed.borderBottomStyle,
                left: computed.borderLeftStyle
              },
              backgroundColor: computed.backgroundColor,
              position: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              zIndex: computed.zIndex,
              display: computed.display,
              visibility: computed.visibility,
              opacity: computed.opacity,
              parent: el.parentElement ? {
                tagName: el.parentElement.tagName.toLowerCase(),
                className: el.parentElement.className,
                id: el.parentElement.id
              } : null
            });
          }
        }
      });
      
      return elements;
    });
    
    investigationResults.greenElements = greenBorderElements;
    
    console.log(`🎯 Found ${greenBorderElements.length} elements with green borders:`);
    
    greenBorderElements.forEach((element, i) => {
      console.log(`\n${i + 1}. ${element.tagName.toUpperCase()}#${element.id || 'no-id'}.${element.className || 'no-class'}`);
      console.log(`   Position: (${element.position.left}, ${element.position.top}) Size: ${element.position.width}x${element.position.height}`);
      console.log(`   Border Colors:`, element.borderColors);
      console.log(`   Border Widths:`, element.borderWidths);
      console.log(`   Background: ${element.backgroundColor}`);
      console.log(`   Text: "${element.textContent}"`);
      console.log(`   Parent: ${element.parent ? element.parent.tagName + (element.parent.className ? '.' + element.parent.className : '') : 'none'}`);
    });
    
    console.log('📊 Phase 3: Detailed Element Analysis & Screenshots');
    
    // Take screenshots highlighting each green border element
    for (let i = 0; i < greenBorderElements.length; i++) {
      const element = greenBorderElements[i];
      try {
        // Create a locator for this element
        let locator;
        if (element.id) {
          locator = page.locator(`#${element.id}`);
        } else if (element.className) {
          const firstClass = element.className.split(' ')[0];
          locator = page.locator(`.${firstClass}`);
        } else {
          locator = page.locator(element.tagName).nth(element.index);
        }
        
        // Highlight the element
        await page.evaluate((el) => {
          const elements = document.querySelectorAll('*');
          const targetEl = elements[el.index];
          if (targetEl) {
            targetEl.style.outline = '5px solid red';
            targetEl.style.outlineOffset = '2px';
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, element);
        
        await page.waitForTimeout(1000);
        
        // Take screenshot with highlighted element
        const screenshot = `${CONFIG.screenshotsDir}/03-element-${i + 1}-highlighted.png`;
        await page.screenshot({ path: screenshot, fullPage: false });
        investigationResults.screenshots.push(screenshot);
        console.log(`📸 Highlighted element ${i + 1}: ${screenshot}`);
        
        // Remove highlight
        await page.evaluate((el) => {
          const elements = document.querySelectorAll('*');
          const targetEl = elements[el.index];
          if (targetEl) {
            targetEl.style.outline = '';
            targetEl.style.outlineOffset = '';
          }
        }, element);
        
      } catch (e) {
        console.log(`⚠️ Could not highlight element ${i + 1}:`, e.message);
      }
    }
    
    console.log('📊 Phase 4: CSS Rules Analysis');
    
    // Analyze CSS coverage to find relevant green styles
    const cssCoverage = await page.coverage.stopCSSCoverage();
    
    for (const coverage of cssCoverage) {
      if (coverage.url.includes('page.module.css') || coverage.url.includes('styles')) {
        console.log(`📄 Analyzing CSS file: ${coverage.url}`);
        
        // Get CSS content and find green-related rules
        const cssText = coverage.text;
        const greenRules = cssText.match(/[^{}]*\{[^{}]*(?:rgba?\(.*?34.*?197.*?94|#22c55e|#16a34a|#10b981|green)[^{}]*\}/gi);
        
        if (greenRules) {
          greenRules.forEach(rule => {
            investigationResults.cssRules.push({
              file: coverage.url,
              rule: rule.replace(/\s+/g, ' ').trim()
            });
          });
        }
      }
    }
    
    console.log('🔄 Phase 5: Interaction Testing');
    
    // Test clicking the quote button to see if green borders appear in forms
    try {
      const quoteButton = page.locator('button:has-text("Save up to $250 - Free Quote")');
      if (await quoteButton.count() > 0) {
        console.log('🎯 Clicking quote button to open lead form...');
        await quoteButton.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot of opened form
        const screenshot4 = `${CONFIG.screenshotsDir}/04-form-opened.png`;
        await page.screenshot({ path: screenshot4, fullPage: true });
        investigationResults.screenshots.push(screenshot4);
        console.log(`📸 Form opened: ${screenshot4}`);
        
        // Re-analyze green borders in opened form
        const formGreenElements = await page.evaluate(() => {
          const elements = [];
          const greenColors = ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.2)', 'rgb(34, 197, 94)', '#22c55e'];
          
          document.querySelectorAll('*').forEach((el) => {
            const computed = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
              const borderColor = computed.borderColor || computed.borderTopColor;
              if (greenColors.some(color => borderColor.includes(color.replace(/[rgba()]/g, '')))) {
                elements.push({
                  tagName: el.tagName,
                  className: el.className,
                  textContent: el.textContent ? el.textContent.substring(0, 50) : '',
                  borderColor: computed.borderColor,
                  position: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                });
              }
            }
          });
          
          return elements;
        });
        
        console.log(`🎯 Found ${formGreenElements.length} green border elements in opened form`);
        formGreenElements.forEach((el, i) => {
          console.log(`   ${i + 1}. ${el.tagName}.${el.className}: "${el.textContent}" at (${el.position.left}, ${el.position.top})`);
        });
      }
    } catch (e) {
      console.log('⚠️ Could not test form interaction:', e.message);
    }
    
    console.log('📊 Phase 6: Service Button Specific Analysis');
    
    // Focus specifically on service buttons
    const serviceButtonAnalysis = await page.evaluate(() => {
      const serviceButtons = [];
      const serviceKeywords = ['voo', 'hotel', 'carro', 'passeio', 'seguro', 'flight', 'car', 'tour'];
      
      document.querySelectorAll('button, [class*="service"], [class*="Service"]').forEach((el) => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className || '';
        
        if (serviceKeywords.some(keyword => text.includes(keyword) || className.includes(keyword))) {
          const computed = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          
          serviceButtons.push({
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent?.substring(0, 30) + '...',
            borderColor: computed.borderColor,
            borderWidth: computed.borderWidth,
            backgroundColor: computed.backgroundColor,
            position: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            visible: rect.width > 0 && rect.height > 0
          });
        }
      });
      
      return serviceButtons;
    });
    
    console.log(`\n🎮 Found ${serviceButtonAnalysis.length} service buttons:`);
    serviceButtonAnalysis.forEach((btn, i) => {
      console.log(`   ${i + 1}. ${btn.tagName}: "${btn.textContent}"`);
      console.log(`      Border: ${btn.borderWidth} ${btn.borderColor}`);
      console.log(`      Background: ${btn.backgroundColor}`);
      console.log(`      Visible: ${btn.visible}`);
    });
    
    // Generate recommendations
    investigationResults.recommendations = [
      'Remove green border from promotional elements that may be interfering with service buttons',
      'Check CSS classes: mobilePromoBadgeGreen, promoPulse for green border styling',
      'Consider replacing rgba(34, 197, 94, 0.3) with transparent or neutral color',
      'Test changes across different viewport sizes to ensure consistency'
    ];
    
    console.log('📋 Phase 7: Generating Investigation Report');
    await generateInvestigationReport();
    
    console.log('\n✅ PLAYWRIGHT FULL POWER INVESTIGATION COMPLETE!');
    console.log('📊 Analysis Summary:');
    console.log(`   - Green border elements found: ${investigationResults.greenElements.length}`);
    console.log(`   - Screenshots captured: ${investigationResults.screenshots.length}`);
    console.log(`   - CSS rules analyzed: ${investigationResults.cssRules.length}`);
    console.log(`   - Service buttons analyzed: ${serviceButtonAnalysis.length}`);
    console.log(`   - Report generated: ${CONFIG.reportFile}`);
    
  } catch (error) {
    console.error('❌ Investigation error:', error);
  } finally {
    await browser.close();
  }
}

/**
 * 📋 Generate Investigation Report
 */
async function generateInvestigationReport() {
  const report = `# 🎯 PLAYWRIGHT FULL POWER GREEN BORDER INVESTIGATION

## 📊 Investigation Summary

**Date:** ${investigationResults.timestamp}  
**Target:** Green borders around services on homepage  
**Method:** Advanced Playwright analysis with full CSS coverage  

### 🎯 Key Findings

- **Green Border Elements:** ${investigationResults.greenElements.length} detected
- **Screenshots Captured:** ${investigationResults.screenshots.length} 
- **CSS Rules Analyzed:** ${investigationResults.cssRules.length}

## 🔍 Detailed Green Border Elements

${investigationResults.greenElements.map((element, i) => `
### Element ${i + 1}: ${element.tagName.toUpperCase()}

**Identification:**
- Tag: \`${element.tagName}\`
- ID: \`${element.id || 'none'}\`
- Class: \`${element.className || 'none'}\`

**Position & Size:**
- Location: (${element.position.left}, ${element.position.top})
- Dimensions: ${element.position.width}x${element.position.height}px
- Z-Index: ${element.zIndex}

**Border Styling:**
- Top: ${element.borderWidths.top} ${element.borderStyles.top} ${element.borderColors.top}
- Right: ${element.borderWidths.right} ${element.borderStyles.right} ${element.borderColors.right}  
- Bottom: ${element.borderWidths.bottom} ${element.borderStyles.bottom} ${element.borderColors.bottom}
- Left: ${element.borderWidths.left} ${element.borderStyles.left} ${element.borderColors.left}

**Additional Styling:**
- Background: ${element.backgroundColor}
- Display: ${element.display}
- Visibility: ${element.visibility}
- Opacity: ${element.opacity}

**Content:**
- Text: "${element.textContent}"
- HTML: \`${element.innerHTML.substring(0, 100)}...\`

**Parent Element:**
${element.parent ? `- Parent: ${element.parent.tagName}.${element.parent.className}` : '- No parent detected'}
`).join('')}

## 🎨 CSS Rules Analysis

${investigationResults.cssRules.length > 0 ? 
  investigationResults.cssRules.map((rule, i) => `
### CSS Rule ${i + 1}

**File:** ${rule.file}  
**Rule:** 
\`\`\`css
${rule.rule}
\`\`\`
`).join('') : 'No specific CSS rules detected for green styling.'}

## 📸 Visual Evidence

${investigationResults.screenshots.map((screenshot, i) => `
### Screenshot ${i + 1}
![Screenshot ${i + 1}](${screenshot})
`).join('')}

## 🛠️ Recommendations

${investigationResults.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## 🔧 Specific Fix Instructions

Based on the analysis, the green borders appear to be from promotional badge styling. To remove them:

### CSS Fixes:

1. **Remove green borders from promotional badges:**
\`\`\`css
.mobilePromoBadgeGreen {
  border: 1px solid transparent; /* Instead of rgba(34, 197, 94, 0.3) */
}
\`\`\`

2. **Remove green pulse animation:**
\`\`\`css  
.promoPulse {
  background: #gray-400; /* Instead of #22c55e */
}
\`\`\`

3. **Ensure service buttons have neutral borders:**
\`\`\`css
.serviceButton {
  border-color: #e5e7eb; /* Neutral gray */
}
\`\`\`

---

*Investigation completed with Playwright full power analysis*  
*Generated: ${new Date().toISOString()}*
`;

  fs.writeFileSync(CONFIG.reportFile, report);
  console.log(`📋 Investigation report saved: ${CONFIG.reportFile}`);
}

// Run the investigation
if (require.main === module) {
  runFullPowerInvestigation().catch(console.error);
}

module.exports = { runFullPowerInvestigation };