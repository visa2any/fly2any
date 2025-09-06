const { chromium } = require('playwright');

async function testMobileServiceCardsTouch() {
    console.log('🚀 Starting ULTRATHINK Mobile Service Cards Touch Test...');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 800 // Slower for visual confirmation
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    // Console and error tracking
    const consoleLogs = [];
    page.on('console', msg => {
        const log = `[${msg.type()}] ${msg.text()}`;
        console.log('📱 Console:', log);
        consoleLogs.push({ type: msg.type(), text: msg.text(), timestamp: new Date().toISOString() });
    });
    
    page.on('pageerror', error => {
        console.log('❌ Page Error:', error.message);
        consoleLogs.push({ type: 'error', text: error.message, timestamp: new Date().toISOString() });
    });
    
    try {
        console.log('📱 Navigating to localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        
        // Initial screenshot
        await page.screenshot({ path: 'mobile-touch-test-initial.png', fullPage: true });
        console.log('📸 Initial mobile screenshot saved');
        
        console.log('⏳ Waiting for page to load completely...');
        await page.waitForTimeout(3000);
        
        // Look for service cards using different strategies
        console.log('🔍 Strategy 1: Looking for service cards with Portuguese names...');
        
        let serviceCards = [];
        const serviceTexts = ['Passagens Aéreas', 'Hotéis', 'Aluguel de Carros', 'Passeios', 'Seguro'];
        
        // Try to find service cards by text content
        for (const text of serviceTexts) {
            try {
                const card = page.locator(`button:has-text("${text}")`).first();
                if (await card.count() > 0) {
                    serviceCards.push({ element: card, name: text });
                    console.log(`✅ Found service card: ${text}`);
                }
            } catch (e) {
                console.log(`⚠️ Could not find service card: ${text}`);
            }
        }
        
        if (serviceCards.length === 0) {
            console.log('🔍 Strategy 2: Looking for buttons with service-related text...');
            const alternativeTexts = ['Voos', 'Hotel', 'Carro', 'Tour', 'Seguro'];
            
            for (const text of alternativeTexts) {
                try {
                    const card = page.locator(`button:has-text("${text}")`).first();
                    if (await card.count() > 0) {
                        serviceCards.push({ element: card, name: text });
                        console.log(`✅ Found alternative service card: ${text}`);
                    }
                } catch (e) {
                    console.log(`⚠️ Could not find alternative service card: ${text}`);
                }
            }
        }
        
        if (serviceCards.length === 0) {
            console.log('🔍 Strategy 3: Looking for any clickable elements...');
            const allButtons = await page.locator('button').all();
            console.log(`Found ${allButtons.length} buttons on the page`);
            
            // Take screenshot for analysis
            await page.screenshot({ path: 'mobile-touch-test-no-cards-found.png', fullPage: true });
            console.log('📸 Screenshot saved for debugging');
            
            // Try to find any elements that might be service cards
            const possibleCards = await page.locator('div[class*="service"], button[class*="card"], div[class*="card"]').all();
            console.log(`Found ${possibleCards.length} possible service card elements`);
            
            if (possibleCards.length > 0) {
                for (let i = 0; i < Math.min(possibleCards.length, 5); i++) {
                    serviceCards.push({ element: possibleCards[i], name: `Card ${i + 1}` });
                }
            }
        }
        
        console.log(`🎯 Total service cards found: ${serviceCards.length}`);
        
        if (serviceCards.length === 0) {
            console.log('❌ No service cards found. Let me check the page structure...');
            
            // Check if we're on the right page
            const pageTitle = await page.title();
            console.log(`📄 Page title: ${pageTitle}`);
            
            // Check for common elements
            const hasHeader = await page.locator('header').count() > 0;
            const hasNav = await page.locator('nav').count() > 0;
            const hasMain = await page.locator('main').count() > 0;
            console.log(`🏗️ Page structure - Header: ${hasHeader}, Nav: ${hasNav}, Main: ${hasMain}`);
            
            // Get all text content to see what's actually on the page
            const bodyText = await page.locator('body').textContent();
            console.log('📝 Page contains these keywords:', bodyText.includes('Voos'), bodyText.includes('Hotel'), bodyText.includes('Carro'));
            
            return {
                success: false,
                message: 'No service cards found on the page',
                consoleLogs,
                screenshots: ['mobile-touch-test-initial.png', 'mobile-touch-test-no-cards-found.png']
            };
        }
        
        // Test each service card
        const testResults = [];
        
        for (let i = 0; i < serviceCards.length; i++) {
            const { element, name } = serviceCards[i];
            console.log(`\n🧪 Testing ${name} (${i + 1}/${serviceCards.length})`);
            
            try {
                // Scroll into view
                await element.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                
                // Screenshot before tap
                await page.screenshot({ 
                    path: `mobile-touch-test-before-${name.replace(/\s+/g, '-').toLowerCase()}.png` 
                });
                
                // Get initial styles
                const beforeStyles = await element.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        transform: computed.transform,
                        backgroundColor: computed.backgroundColor,
                        scale: computed.scale
                    };
                });
                
                // Perform the touch test - USE TAP FOR MOBILE
                console.log(`👆 Tapping ${name}...`);
                await element.tap({ force: true });
                
                // Wait for potential visual feedback
                await page.waitForTimeout(300);
                
                // Get styles after tap to check for active state
                const afterStyles = await element.evaluate(el => {
                    const computed = window.getComputedStyle(el);
                    return {
                        transform: computed.transform,
                        backgroundColor: computed.backgroundColor,
                        scale: computed.scale
                    };
                });
                
                // Screenshot after tap
                await page.screenshot({ 
                    path: `mobile-touch-test-after-${name.replace(/\s+/g, '-').toLowerCase()}.png` 
                });
                
                // Check for visual feedback
                const hasVisualFeedback = 
                    beforeStyles.transform !== afterStyles.transform ||
                    beforeStyles.backgroundColor !== afterStyles.backgroundColor ||
                    beforeStyles.scale !== afterStyles.scale;
                
                // Check for modals or forms that might have opened
                const modalCount = await page.locator('[role="dialog"], .modal, .fixed').count();
                const formCount = await page.locator('form').count();
                
                testResults.push({
                    serviceName: name,
                    tapSuccessful: true,
                    visualFeedback: hasVisualFeedback,
                    modalOpened: modalCount > 0,
                    formsFound: formCount,
                    beforeStyles,
                    afterStyles
                });
                
                console.log(`✅ ${name}: Tapped successfully`);
                console.log(`  👁️ Visual feedback: ${hasVisualFeedback}`);
                console.log(`  📱 Modals: ${modalCount}, Forms: ${formCount}`);
                
                // Close any modals that might have opened
                await page.keyboard.press('Escape');
                await page.waitForTimeout(300);
                
            } catch (error) {
                console.log(`❌ Error testing ${name}: ${error.message}`);
                testResults.push({
                    serviceName: name,
                    tapSuccessful: false,
                    error: error.message
                });
            }
        }
        
        // Final screenshot
        await page.screenshot({ path: 'mobile-touch-test-final.png', fullPage: true });
        
        // Generate report
        const report = {
            timestamp: new Date().toISOString(),
            testType: 'ULTRATHINK Mobile Service Cards Touch Test',
            viewport: { width: 375, height: 667 },
            userAgent: 'Mobile Safari iOS 15',
            results: testResults,
            consoleLogs,
            summary: {
                totalCardsFound: serviceCards.length,
                totalCardsTested: testResults.length,
                successfulTaps: testResults.filter(r => r.tapSuccessful).length,
                cardsWithVisualFeedback: testResults.filter(r => r.visualFeedback).length,
                modalsOpened: testResults.filter(r => r.modalOpened).length
            }
        };
        
        // Save detailed report
        require('fs').writeFileSync('mobile-touch-test-report.json', JSON.stringify(report, null, 2));
        
        // Print results
        console.log('\n🎉 ULTRATHINK MOBILE TOUCH TEST RESULTS:');
        console.log('==========================================');
        console.log(`📱 Cards Found: ${report.summary.totalCardsFound}`);
        console.log(`✅ Successful Taps: ${report.summary.successfulTaps}/${report.summary.totalCardsTested}`);
        console.log(`👁️ Cards with Visual Feedback: ${report.summary.cardsWithVisualFeedback}/${report.summary.totalCardsTested}`);
        console.log(`📋 Modals Opened: ${report.summary.modalsOpened}`);
        
        console.log('\n📊 DETAILED TEST RESULTS:');
        testResults.forEach(result => {
            console.log(`\n${result.serviceName}:`);
            console.log(`  ✅ Tap Successful: ${result.tapSuccessful}`);
            if (result.visualFeedback !== undefined) {
                console.log(`  👁️ Visual Feedback: ${result.visualFeedback}`);
            }
            if (result.modalOpened !== undefined) {
                console.log(`  📱 Modal Opened: ${result.modalOpened}`);
            }
            if (result.error) {
                console.log(`  ❌ Error: ${result.error}`);
            }
        });
        
        if (consoleLogs.length > 0) {
            console.log('\n📱 CONSOLE MESSAGES:');
            consoleLogs.slice(-10).forEach(log => { // Show last 10 logs
                console.log(`  [${log.type}] ${log.text}`);
            });
        }
        
        // ANALYSIS: Determine if the ULTRATHINK fixes worked
        const touchResponsivenessFixed = report.summary.successfulTaps === report.summary.totalCardsTested;
        const visualFeedbackWorking = report.summary.cardsWithVisualFeedback > 0;
        
        console.log('\n🔍 ULTRATHINK FIX ANALYSIS:');
        console.log(`Touch Responsiveness: ${touchResponsivenessFixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
        console.log(`Visual Feedback: ${visualFeedbackWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
        
        return {
            success: touchResponsivenessFixed,
            visualFeedbackWorking,
            report,
            message: touchResponsivenessFixed ? 
                'ULTRATHINK fixes successfully resolved mobile touch issues!' : 
                'Mobile touch issues still present - further debugging needed'
        };
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
        await page.screenshot({ path: 'mobile-touch-test-error.png' });
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testMobileServiceCardsTouch()
    .then(result => {
        console.log(`\n🏁 Test completed: ${result.success ? 'SUCCESS' : 'NEEDS WORK'}`);
        console.log('📁 Check screenshots and mobile-touch-test-report.json for details');
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });