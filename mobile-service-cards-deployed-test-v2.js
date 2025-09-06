const { chromium } = require('playwright');
const fs = require('fs');

async function testDeployedServiceCards() {
    console.log('🚀 Starting deployed website service cards test v2...');
    
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
        await page.screenshot({ path: 'deployed-mobile-initial-v2.png', fullPage: true });
        
        // First, let's find all clickable service cards by inspecting the DOM
        console.log('🔍 Inspecting DOM for service cards...');
        
        const serviceCardsInfo = await page.evaluate(() => {
            // Look for various patterns of service cards
            const possibleSelectors = [
                'div[class*="card"]',
                'button[class*="card"]',
                '[class*="service"]',
                'div:has-text("Voos")',
                'div:has-text("Hotéis")',
                'div:has-text("Carros")',
                'div:has-text("Tours")',
                'div:has-text("Seguro")'
            ];
            
            const foundCards = [];
            
            // Look for elements containing service names
            const serviceNames = ['Voos', 'Hotéis', 'Carros', 'Tours', 'Seguro'];
            
            serviceNames.forEach(serviceName => {
                // Find elements containing the service name
                const elements = Array.from(document.querySelectorAll('*')).filter(el => {
                    return el.textContent && el.textContent.includes(serviceName) && 
                           el.offsetParent !== null; // Visible elements only
                });
                
                elements.forEach(el => {
                    // Find the clickable parent (card container)
                    let clickableParent = el;
                    let depth = 0;
                    while (clickableParent && depth < 10) {
                        const styles = window.getComputedStyle(clickableParent);
                        const hasClickableStyles = styles.cursor === 'pointer' || 
                                                 clickableParent.onclick || 
                                                 clickableParent.classList.toString().includes('card') ||
                                                 clickableParent.tagName === 'BUTTON';
                        
                        if (hasClickableStyles) {
                            break;
                        }
                        
                        clickableParent = clickableParent.parentElement;
                        depth++;
                    }
                    
                    if (clickableParent) {
                        const rect = clickableParent.getBoundingClientRect();
                        foundCards.push({
                            serviceName,
                            element: clickableParent.tagName,
                            classes: clickableParent.className,
                            id: clickableParent.id,
                            boundingBox: {
                                x: rect.x,
                                y: rect.y,
                                width: rect.width,
                                height: rect.height
                            },
                            textContent: clickableParent.textContent.trim().substring(0, 100)
                        });
                    }
                });
            });
            
            return foundCards;
        });
        
        console.log('🎯 Found service cards:', serviceCardsInfo);
        
        // Test results object
        const testResults = {
            timestamp: new Date().toISOString(),
            url: 'https://fly2any.com',
            viewport: { width: 375, height: 812 },
            discoveredCards: serviceCardsInfo,
            serviceCards: {}
        };
        
        // Group cards by service name (remove duplicates)
        const uniqueCards = {};
        serviceCardsInfo.forEach(card => {
            if (!uniqueCards[card.serviceName] || card.boundingBox.width > (uniqueCards[card.serviceName].boundingBox.width || 0)) {
                uniqueCards[card.serviceName] = card;
            }
        });
        
        console.log('🎯 Unique service cards to test:', Object.keys(uniqueCards));
        
        // Test each unique service card
        for (const [serviceName, cardInfo] of Object.entries(uniqueCards)) {
            console.log(`\n🔍 Testing ${serviceName} card...`);
            
            try {
                // Create selector based on the discovered card info
                let selector = null;
                if (cardInfo.id) {
                    selector = `#${cardInfo.id}`;
                } else if (cardInfo.classes) {
                    // Use the most specific class
                    const classes = cardInfo.classes.split(' ').filter(c => c.length > 2);
                    if (classes.length > 0) {
                        selector = `.${classes[0]}`;
                    }
                }
                
                // Fallback: use text content to find the card
                if (!selector) {
                    selector = `text="${serviceName}"`;
                }
                
                console.log(`✅ Using selector for ${serviceName}: ${selector}`);
                
                // Take screenshot before clicking
                await page.screenshot({ 
                    path: `deployed-${serviceName.toLowerCase()}-before-click-v2.png`, 
                    fullPage: true 
                });
                
                // Get initial scroll position
                const initialScroll = await page.evaluate(() => ({
                    scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
                    scrollHeight: document.documentElement.scrollHeight || document.body.scrollHeight
                }));
                
                console.log(`📜 Initial scroll position for ${serviceName}:`, initialScroll);
                
                // Click the card using coordinates if selector fails
                let clicked = false;
                try {
                    if (selector.startsWith('text=')) {
                        await page.click(selector);
                    } else {
                        await page.click(selector);
                    }
                    clicked = true;
                } catch (error) {
                    console.log(`⚠️ Selector click failed, trying coordinates for ${serviceName}`);
                    // Use coordinates as fallback
                    const centerX = cardInfo.boundingBox.x + cardInfo.boundingBox.width / 2;
                    const centerY = cardInfo.boundingBox.y + cardInfo.boundingBox.height / 2;
                    await page.click(`body`, { position: { x: centerX, y: centerY } });
                    clicked = true;
                }
                
                if (clicked) {
                    console.log(`👆 Successfully clicked ${serviceName} card`);
                    
                    // Wait for any animation/transition
                    await page.waitForTimeout(3000);
                    
                    // Take screenshot after clicking
                    await page.screenshot({ 
                        path: `deployed-${serviceName.toLowerCase()}-after-click-v2.png`, 
                        fullPage: true 
                    });
                    
                    // Get scroll position after click
                    const afterClickScroll = await page.evaluate(() => ({
                        scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
                        scrollHeight: document.documentElement.scrollHeight || document.body.scrollHeight
                    }));
                    
                    console.log(`📜 After-click scroll position for ${serviceName}:`, afterClickScroll);
                    
                    // Check for form/overlay presence and positioning
                    const formAnalysis = await page.evaluate(() => {
                        const forms = [];
                        
                        // Look for various form/overlay patterns
                        const selectors = [
                            'form',
                            '[class*="form"]',
                            '[class*="modal"]',
                            '[class*="overlay"]',
                            '[class*="popup"]',
                            '[class*="dialog"]',
                            '[role="dialog"]',
                            '[role="modal"]'
                        ];
                        
                        selectors.forEach(sel => {
                            const elements = document.querySelectorAll(sel);
                            elements.forEach(el => {
                                if (el.offsetParent !== null) { // Visible elements
                                    const rect = el.getBoundingClientRect();
                                    const styles = window.getComputedStyle(el);
                                    
                                    forms.push({
                                        selector: sel,
                                        tagName: el.tagName,
                                        classes: el.className,
                                        id: el.id,
                                        boundingBox: {
                                            x: rect.x,
                                            y: rect.y,
                                            width: rect.width,
                                            height: rect.height,
                                            top: rect.top,
                                            bottom: rect.bottom
                                        },
                                        styles: {
                                            position: styles.position,
                                            zIndex: styles.zIndex,
                                            top: styles.top,
                                            left: styles.left,
                                            transform: styles.transform,
                                            display: styles.display,
                                            visibility: styles.visibility,
                                            opacity: styles.opacity
                                        },
                                        isVisible: rect.width > 0 && rect.height > 0 && styles.visibility !== 'hidden' && styles.display !== 'none'
                                    });
                                }
                            });
                        });
                        
                        return {
                            forms,
                            viewportHeight: window.innerHeight,
                            pageHeight: document.documentElement.scrollHeight
                        };
                    });
                    
                    console.log(`📋 Form analysis for ${serviceName}:`, formAnalysis.forms.length, 'forms found');
                    
                    // Check if form appears "below the page" vs as proper overlay
                    const isProperOverlay = formAnalysis.forms.some(form => 
                        form.styles.position === 'fixed' || 
                        form.styles.position === 'absolute' ||
                        parseInt(form.styles.zIndex) > 100
                    );
                    
                    const scrolledSignificantly = Math.abs(afterClickScroll.scrollTop - initialScroll.scrollTop) > 100;
                    
                    testResults.serviceCards[serviceName] = {
                        cardInfo,
                        selector,
                        clicked: true,
                        initialScroll,
                        afterClickScroll,
                        scrolledSignificantly,
                        formAnalysis,
                        isProperOverlay,
                        appearsAsOverlay: isProperOverlay && !scrolledSignificantly,
                        appearsBelow: !isProperOverlay && scrolledSignificantly,
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log(`🎯 ${serviceName} analysis: Proper overlay = ${isProperOverlay}, Scrolled = ${scrolledSignificantly}`);
                }
                
                // Try to close any open forms/modals
                const closeActions = [
                    () => page.keyboard.press('Escape'),
                    () => page.click('[aria-label="Close"]').catch(() => {}),
                    () => page.click('[class*="close"]').catch(() => {}),
                    () => page.click('body', { position: { x: 10, y: 10 } })
                ];
                
                for (const action of closeActions) {
                    try {
                        await action();
                        await page.waitForTimeout(500);
                    } catch (e) {
                        // Ignore close action errors
                    }
                }
                
                // Scroll back to top for next test
                await page.evaluate(() => window.scrollTo(0, 0));
                await page.waitForTimeout(1000);
                
            } catch (error) {
                console.error(`❌ Error testing ${serviceName} card:`, error.message);
                testResults.serviceCards[serviceName] = {
                    error: error.message,
                    cardInfo,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        // Save test results
        fs.writeFileSync('deployed-mobile-service-cards-test-results-v2.json', JSON.stringify(testResults, null, 2));
        
        console.log('\n✅ Test completed! Results saved to deployed-mobile-service-cards-test-results-v2.json');
        console.log('\n📊 Summary:');
        for (const [cardName, result] of Object.entries(testResults.serviceCards)) {
            if (result.error) {
                console.log(`❌ ${cardName}: ERROR - ${result.error}`);
            } else {
                const behavior = result.appearsAsOverlay ? 'PROPER OVERLAY' : 
                               result.appearsBelow ? 'APPEARS BELOW' : 
                               'UNCLEAR BEHAVIOR';
                console.log(`${behavior === 'PROPER OVERLAY' ? '✅' : '⚠️'} ${cardName}: ${behavior}`);
                console.log(`   - Scrolled: ${result.scrolledSignificantly ? 'YES' : 'NO'}`);
                console.log(`   - Overlay position: ${result.isProperOverlay ? 'YES' : 'NO'}`);
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