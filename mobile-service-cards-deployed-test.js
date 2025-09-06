const { chromium } = require('playwright');
const fs = require('fs');

async function testDeployedServiceCards() {
    console.log('🚀 Starting deployed website service cards test...');
    
    const browser = await chromium.launch({ 
        headless: false,  // Show browser for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 }, // iPhone X viewport
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    try {
        console.log('📱 Navigating to https://fly2any.com...');
        await page.goto('https://fly2any.com', { waitUntil: 'networkidle' });
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        console.log('📸 Taking initial screenshot...');
        await page.screenshot({ path: 'deployed-mobile-initial.png', fullPage: true });
        
        // Test results object
        const testResults = {
            timestamp: new Date().toISOString(),
            url: 'https://fly2any.com',
            viewport: { width: 375, height: 812 },
            serviceCards: {}
        };
        
        // Service cards to test
        const serviceCards = [
            { name: 'Voos', selector: '[data-service="flights"]' },
            { name: 'Hotéis', selector: '[data-service="hotels"]' },
            { name: 'Carros', selector: '[data-service="cars"]' },
            { name: 'Tours', selector: '[data-service="tours"]' },
            { name: 'Seguro', selector: '[data-service="insurance"]' }
        ];
        
        for (const card of serviceCards) {
            console.log(`\n🔍 Testing ${card.name} card...`);
            
            try {
                // Wait for card to be visible
                await page.waitForSelector(card.selector, { timeout: 10000 });
                
                console.log(`✅ Found ${card.name} card selector: ${card.selector}`);
                
                // Take screenshot before clicking
                await page.screenshot({ 
                    path: `deployed-${card.name.toLowerCase()}-before-click.png`, 
                    fullPage: true 
                });
                
                // Get card position before clicking
                const cardElement = await page.$(card.selector);
                const cardBox = await cardElement.boundingBox();
                
                console.log(`📍 ${card.name} card position:`, cardBox);
                
                // Click the card
                console.log(`👆 Clicking ${card.name} card...`);
                await page.click(card.selector);
                
                // Wait for form to appear
                await page.waitForTimeout(2000);
                
                // Take screenshot after clicking
                await page.screenshot({ 
                    path: `deployed-${card.name.toLowerCase()}-after-click.png`, 
                    fullPage: true 
                });
                
                // Check for form visibility and positioning
                const formSelectors = [
                    '.mobile-form-overlay',
                    '.form-overlay',
                    '[class*="form"]',
                    '[class*="modal"]',
                    '[class*="overlay"]'
                ];
                
                let formFound = false;
                let formInfo = {};
                
                for (const selector of formSelectors) {
                    const form = await page.$(selector);
                    if (form) {
                        formFound = true;
                        const formBox = await form.boundingBox();
                        const styles = await page.evaluate((el) => {
                            const computed = window.getComputedStyle(el);
                            return {
                                position: computed.position,
                                zIndex: computed.zIndex,
                                top: computed.top,
                                left: computed.left,
                                transform: computed.transform,
                                display: computed.display,
                                visibility: computed.visibility
                            };
                        }, form);
                        
                        formInfo = {
                            selector,
                            boundingBox: formBox,
                            computedStyles: styles
                        };
                        
                        console.log(`📋 Form found with selector: ${selector}`);
                        console.log(`📐 Form styles:`, styles);
                        break;
                    }
                }
                
                // Scroll position check
                const scrollPosition = await page.evaluate(() => ({
                    scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight || document.body.scrollHeight,
                    clientHeight: document.documentElement.clientHeight || window.innerHeight
                }));
                
                console.log(`📜 Scroll position after ${card.name} click:`, scrollPosition);
                
                testResults.serviceCards[card.name] = {
                    cardSelector: card.selector,
                    cardPosition: cardBox,
                    formFound,
                    formInfo,
                    scrollPosition,
                    timestamp: new Date().toISOString()
                };
                
                // Close the form if found (look for close button or click outside)
                const closeButton = await page.$('[class*="close"], [aria-label="Close"], .close-btn');
                if (closeButton) {
                    console.log(`❌ Closing ${card.name} form...`);
                    await closeButton.click();
                } else {
                    // Try clicking outside or pressing Escape
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(500);
                    
                    // If still open, click on body
                    await page.click('body', { position: { x: 10, y: 10 } });
                }
                
                await page.waitForTimeout(1000);
                
            } catch (error) {
                console.error(`❌ Error testing ${card.name} card:`, error.message);
                testResults.serviceCards[card.name] = {
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        // Save test results
        fs.writeFileSync('deployed-mobile-service-cards-test-results.json', JSON.stringify(testResults, null, 2));
        
        console.log('\n✅ Test completed! Results saved to deployed-mobile-service-cards-test-results.json');
        console.log('\n📊 Summary:');
        for (const [cardName, result] of Object.entries(testResults.serviceCards)) {
            if (result.error) {
                console.log(`❌ ${cardName}: ERROR - ${result.error}`);
            } else {
                console.log(`✅ ${cardName}: Form found = ${result.formFound}, Position = ${result.formInfo?.computedStyles?.position || 'N/A'}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testDeployedServiceCards().catch(console.error);