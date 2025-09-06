const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testMobileServiceCards() {
    console.log('🚀 Starting Mobile Service Cards Test...');
    
    // Launch browser in mobile mode
    const browser = await chromium.launch({
        headless: false, // Show browser for visual confirmation
        slowMo: 1000 // Slow down actions for better visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE dimensions
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const message = `[${msg.type()}] ${msg.text()}`;
        console.log('📱 Console:', message);
        consoleMessages.push({
            type: msg.type(),
            text: msg.text(),
            timestamp: new Date().toISOString()
        });
    });
    
    // Capture network errors
    page.on('pageerror', error => {
        console.log('❌ Page Error:', error.message);
        consoleMessages.push({
            type: 'error',
            text: error.message,
            timestamp: new Date().toISOString()
        });
    });
    
    try {
        // Navigate to the application
        console.log('📱 Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'mobile-initial-load.png',
            fullPage: true 
        });
        console.log('📸 Initial screenshot saved: mobile-initial-load.png');
        
        // Wait for service cards to be visible
        console.log('⏳ Waiting for service cards to load...');
        await page.waitForSelector('[data-testid="service-card"], .service-card, .bg-white.rounded-xl', { 
            timeout: 10000 
        });
        
        // Find all service cards
        const serviceCards = await page.locator('[data-testid="service-card"], .service-card, .bg-white.rounded-xl').all();
        console.log(`🎯 Found ${serviceCards.length} service cards`);
        
        if (serviceCards.length === 0) {
            // Try alternative selectors
            const alternativeCards = await page.locator('div:has-text("Voos"), div:has-text("Hotéis"), div:has-text("Carros"), div:has-text("Tours"), div:has-text("Seguro")').all();
            console.log(`🔍 Alternative search found ${alternativeCards.length} service cards`);
            serviceCards.push(...alternativeCards);
        }
        
        const testResults = [];
        const serviceNames = ['Voos', 'Hotéis', 'Carros', 'Tours', 'Seguro'];
        
        // Test each service card
        for (let i = 0; i < Math.min(serviceCards.length, 5); i++) {
            const card = serviceCards[i];
            const serviceName = serviceNames[i] || `Service ${i + 1}`;
            
            console.log(`\n🧪 Testing ${serviceName} card (${i + 1}/${serviceCards.length})`);
            
            try {
                // Scroll card into view
                await card.scrollIntoViewIfNeeded();
                
                // Take screenshot before interaction
                await page.screenshot({ 
                    path: `mobile-before-${serviceName.toLowerCase()}-tap.png`,
                    fullPage: false 
                });
                
                // Test hover state (should not exist on mobile)
                const beforeHoverStyle = await card.evaluate(el => {
                    return window.getComputedStyle(el).transform;
                });
                
                // Test touch interaction
                console.log(`👆 Tapping ${serviceName} card...`);
                
                // Use tap instead of click for better mobile simulation
                await card.tap({ force: true });
                
                // Small delay to allow for visual feedback
                await page.waitForTimeout(500);
                
                // Check for active state feedback
                const afterTapStyle = await card.evaluate(el => {
                    return {
                        transform: window.getComputedStyle(el).transform,
                        transition: window.getComputedStyle(el).transition
                    };
                });
                
                // Take screenshot after tap
                await page.screenshot({ 
                    path: `mobile-after-${serviceName.toLowerCase()}-tap.png`,
                    fullPage: false 
                });
                
                // Check if modal or form opened
                const modalOpened = await page.locator('.modal, [role="dialog"], .fixed.inset-0').count() > 0;
                const formOpened = await page.locator('form, .form-container').count() > 0;
                
                // Record test results
                testResults.push({
                    service: serviceName,
                    tapSuccessful: true,
                    visualFeedback: afterTapStyle.transform !== beforeHoverStyle,
                    modalOpened,
                    formOpened,
                    styles: {
                        before: beforeHoverStyle,
                        after: afterTapStyle
                    }
                });
                
                console.log(`✅ ${serviceName}: Tap successful, Visual feedback: ${afterTapStyle.transform !== beforeHoverStyle}, Modal: ${modalOpened}, Form: ${formOpened}`);
                
                // Close any opened modals
                const closeButtons = await page.locator('[aria-label="close"], .close, button:has-text("×"), button:has-text("Close")').all();
                for (const closeButton of closeButtons) {
                    if (await closeButton.isVisible()) {
                        await closeButton.tap();
                        await page.waitForTimeout(300);
                    }
                }
                
                // Press Escape key to close modals
                await page.keyboard.press('Escape');
                await page.waitForTimeout(300);
                
            } catch (error) {
                console.log(`❌ Error testing ${serviceName}: ${error.message}`);
                testResults.push({
                    service: serviceName,
                    tapSuccessful: false,
                    error: error.message
                });
            }
        }
        
        // Final screenshot
        await page.screenshot({ 
            path: 'mobile-final-state.png',
            fullPage: true 
        });
        
        // Generate test report
        const report = {
            timestamp: new Date().toISOString(),
            viewport: { width: 375, height: 667 },
            testResults,
            consoleMessages,
            summary: {
                totalCards: testResults.length,
                successfulTaps: testResults.filter(r => r.tapSuccessful).length,
                cardsWithFeedback: testResults.filter(r => r.visualFeedback).length,
                modalsOpened: testResults.filter(r => r.modalOpened).length,
                formsOpened: testResults.filter(r => r.formOpened).length
            }
        };
        
        // Save detailed report
        fs.writeFileSync('mobile-service-cards-test-report.json', JSON.stringify(report, null, 2));
        
        // Print summary
        console.log('\n📊 TEST RESULTS SUMMARY:');
        console.log('========================');
        console.log(`Total Service Cards Tested: ${report.summary.totalCards}`);
        console.log(`Successful Taps: ${report.summary.successfulTaps}/${report.summary.totalCards}`);
        console.log(`Cards with Visual Feedback: ${report.summary.cardsWithFeedback}/${report.summary.totalCards}`);
        console.log(`Modals Opened: ${report.summary.modalsOpened}`);
        console.log(`Forms Opened: ${report.summary.formsOpened}`);
        
        console.log('\n🔍 DETAILED RESULTS:');
        testResults.forEach(result => {
            console.log(`\n${result.service}:`);
            console.log(`  ✅ Tap Successful: ${result.tapSuccessful}`);
            if (result.visualFeedback !== undefined) {
                console.log(`  🎯 Visual Feedback: ${result.visualFeedback}`);
            }
            if (result.modalOpened !== undefined) {
                console.log(`  📱 Modal Opened: ${result.modalOpened}`);
            }
            if (result.formOpened !== undefined) {
                console.log(`  📝 Form Opened: ${result.formOpened}`);
            }
            if (result.error) {
                console.log(`  ❌ Error: ${result.error}`);
            }
        });
        
        if (consoleMessages.length > 0) {
            console.log('\n📱 CONSOLE MESSAGES:');
            consoleMessages.forEach(msg => {
                console.log(`  [${msg.type}] ${msg.text}`);
            });
        }
        
        return report;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: 'mobile-error-state.png' });
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
testMobileServiceCards()
    .then(report => {
        console.log('\n🎉 Mobile Service Cards test completed successfully!');
        console.log('📁 Check the generated screenshots and test report for detailed results.');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });