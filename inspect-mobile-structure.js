/**
 * Mobile Structure Inspector
 * Analyzes the page structure to identify navigation elements and their selectors
 */

const { chromium } = require('playwright');

async function inspectMobileStructure() {
    console.log('🔍 Inspecting mobile page structure...\n');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, // iPhone 12 Pro
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true
    });
    
    const page = await context.newPage();
    
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Take initial screenshot
        await page.screenshot({
            path: 'mobile-structure-inspection.png',
            fullPage: true
        });
        console.log('✅ Full page screenshot captured');
        
        // Inspect page structure
        console.log('📋 Page Structure Analysis:');
        
        // Check for various navigation patterns
        const navSelectors = [
            '.fixed.bottom-0',
            '[class*="bottom-0"]',
            '[class*="fixed"]',
            'nav',
            '[role="navigation"]',
            '.navigation',
            '.nav',
            '.bottom-nav',
            '.mobile-nav'
        ];
        
        for (const selector of navSelectors) {
            try {
                const elements = await page.locator(selector).all();
                if (elements.length > 0) {
                    console.log(`✅ Found ${elements.length} element(s) with selector: ${selector}`);
                    
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        const boundingBox = await element.boundingBox();
                        const classes = await element.getAttribute('class') || 'no-class';
                        console.log(`   Element ${i + 1}: classes="${classes}"`);
                        if (boundingBox) {
                            console.log(`   Position: x=${boundingBox.x}, y=${boundingBox.y}, w=${boundingBox.width}, h=${boundingBox.height}`);
                        }
                    }
                }
            } catch (e) {
                // Selector not found, continue
            }
        }
        
        // Check for buttons and links that might be navigation
        console.log('\n🔗 Potential Navigation Elements:');
        
        const buttonElements = await page.locator('button').all();
        console.log(`Found ${buttonElements.length} button elements`);
        
        const linkElements = await page.locator('a').all();
        console.log(`Found ${linkElements.length} link elements`);
        
        // Check for elements at the bottom of the viewport
        console.log('\n📍 Elements Near Bottom of Viewport:');
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        
        const allElements = await page.locator('*').all();
        let bottomElements = 0;
        
        for (let i = 0; i < Math.min(allElements.length, 50); i++) { // Check first 50 elements
            try {
                const element = allElements[i];
                const boundingBox = await element.boundingBox();
                if (boundingBox && boundingBox.y + boundingBox.height > viewportHeight * 0.8) {
                    const classes = await element.getAttribute('class') || 'no-class';
                    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
                    console.log(`   ${tagName}: classes="${classes}", y=${boundingBox.y}, height=${boundingBox.height}`);
                    bottomElements++;
                }
            } catch (e) {
                // Skip elements that can't be accessed
            }
        }
        
        if (bottomElements === 0) {
            console.log('   No elements found near bottom of viewport');
        }
        
        // Get page HTML structure for manual inspection
        console.log('\n📄 Page HTML Structure (body content):');
        const bodyHTML = await page.locator('body').innerHTML();
        
        // Extract relevant parts for navigation
        const navigationPatterns = [
            /class="[^"]*fixed[^"]*"/gi,
            /class="[^"]*bottom[^"]*"/gi,
            /class="[^"]*nav[^"]*"/gi,
            /<nav[^>]*>/gi,
            /role="navigation"/gi
        ];
        
        navigationPatterns.forEach((pattern, index) => {
            const matches = bodyHTML.match(pattern);
            if (matches) {
                console.log(`Pattern ${index + 1} matches:`, matches.slice(0, 5)); // Show first 5 matches
            }
        });
        
        // Check viewport and document dimensions
        console.log('\n📐 Dimensions:');
        const dimensions = await page.evaluate(() => ({
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            documentWidth: document.documentElement.scrollWidth,
            documentHeight: document.documentElement.scrollHeight
        }));
        
        console.log(`Viewport: ${dimensions.viewportWidth}x${dimensions.viewportHeight}`);
        console.log(`Document: ${dimensions.documentWidth}x${dimensions.documentHeight}`);
        console.log(`Fits in viewport: ${dimensions.documentHeight <= dimensions.viewportHeight}`);
        
    } catch (error) {
        console.error('❌ Inspection failed:', error);
        await page.screenshot({ path: 'mobile-structure-error.png' });
    } finally {
        await browser.close();
        console.log('\n🏁 Structure inspection completed.');
    }
}

// Run the inspection
inspectMobileStructure().catch(console.error);