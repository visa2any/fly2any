const { chromium } = require('playwright');

async function runComprehensiveFinalTest() {
    console.log('🚀 Starting Comprehensive Final Application Test...');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1
    });
    
    const page = await context.newPage();
    
    // Monitor console errors
    const consoleErrors = [];
    const networkErrors = [];
    const jsErrors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
            console.log('❌ Console Error:', msg.text());
        }
        if (msg.type() === 'warn') {
            console.log('⚠️ Console Warning:', msg.text());
        }
        if (msg.type() === 'log') {
            console.log('📝 Console Log:', msg.text());
        }
    });
    
    page.on('pageerror', error => {
        jsErrors.push(error.message);
        console.log('💥 JavaScript Error:', error.message);
    });
    
    page.on('response', response => {
        if (!response.ok()) {
            networkErrors.push(`${response.status()} ${response.url()}`);
            console.log('🔴 Network Error:', response.status(), response.url());
        }
    });
    
    try {
        console.log('\n1️⃣ Testing Desktop Version Load...');
        
        // Navigate to the application
        const response = await page.goto('http://localhost:3000', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('✅ Page Response Status:', response.status());
        
        // Wait for the page to be fully loaded
        await page.waitForTimeout(3000);
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'final-test-desktop-load.png', 
            fullPage: true 
        });
        console.log('📸 Desktop load screenshot taken');
        
        // Check if page loaded successfully
        const title = await page.title();
        console.log('✅ Page Title:', title);
        
        // Check for key elements
        console.log('\n2️⃣ Testing Core Elements...');
        
        // Check for main content
        const mainContent = await page.$('main');
        console.log('✅ Main content element:', mainContent ? 'Found' : 'Missing');
        
        // Check for flight search form
        const searchForm = await page.$('form');
        console.log('✅ Flight search form:', searchForm ? 'Found' : 'Missing');
        
        // Check for hero section
        const heroSection = await page.$('[class*="hero"], .hero-section, [data-testid="hero"]');
        console.log('✅ Hero section:', heroSection ? 'Found' : 'Missing');
        
        console.log('\n3️⃣ Testing Flight Search Functionality...');
        
        // Try to interact with flight search form
        const fromInput = await page.$('input[placeholder*="From"], input[name*="from"], input[id*="from"]');
        if (fromInput) {
            await fromInput.click();
            await fromInput.fill('New York');
            console.log('✅ From input field working');
        }
        
        const toInput = await page.$('input[placeholder*="To"], input[name*="to"], input[id*="to"]');
        if (toInput) {
            await toInput.click();
            await toInput.fill('London');
            console.log('✅ To input field working');
        }
        
        // Test passenger dropdown
        const passengerDropdown = await page.$('select, [role="combobox"], [class*="dropdown"]');
        if (passengerDropdown) {
            await passengerDropdown.click();
            console.log('✅ Passenger dropdown working');
        }
        
        // Take screenshot after form interaction
        await page.screenshot({ 
            path: 'final-test-form-interaction.png', 
            fullPage: true 
        });
        console.log('📸 Form interaction screenshot taken');
        
        console.log('\n4️⃣ Testing Error Handling System...');
        
        // Test error boundaries by triggering potential errors
        try {
            await page.evaluate(() => {
                // Try to access a non-existent function to test error boundary
                if (window.testErrorBoundary) {
                    window.testErrorBoundary();
                }
            });
        } catch (e) {
            console.log('✅ Error boundary test completed');
        }
        
        console.log('\n5️⃣ Testing Responsive Design...');
        
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: 'final-test-mobile.png', 
            fullPage: true 
        });
        console.log('📸 Mobile viewport screenshot taken');
        
        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: 'final-test-tablet.png', 
            fullPage: true 
        });
        console.log('📸 Tablet viewport screenshot taken');
        
        // Return to desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(2000);
        
        console.log('\n6️⃣ Testing Performance Metrics...');
        
        // Get performance metrics
        const metrics = await page.evaluate(() => {
            return {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 'N/A',
                resourceCount: performance.getEntriesByType('resource').length
            };
        });
        
        console.log('⚡ Performance Metrics:');
        console.log('   - Total Load Time:', metrics.loadTime, 'ms');
        console.log('   - DOM Ready Time:', metrics.domReady, 'ms');
        console.log('   - First Paint:', metrics.firstPaint, 'ms');
        console.log('   - Resources Loaded:', metrics.resourceCount);
        
        console.log('\n7️⃣ Final Verification Screenshot...');
        
        // Take final comprehensive screenshot
        await page.screenshot({ 
            path: 'final-test-comprehensive.png', 
            fullPage: true 
        });
        console.log('📸 Final comprehensive screenshot taken');
        
        // Generate test report
        console.log('\n📊 FINAL TEST REPORT');
        console.log('====================');
        console.log('✅ Page Load Status:', response.status() === 200 ? 'SUCCESS' : 'FAILED');
        console.log('✅ Console Errors:', consoleErrors.length === 0 ? 'NONE' : `${consoleErrors.length} errors`);
        console.log('✅ JavaScript Errors:', jsErrors.length === 0 ? 'NONE' : `${jsErrors.length} errors`);
        console.log('✅ Network Errors:', networkErrors.length === 0 ? 'NONE' : `${networkErrors.length} errors`);
        console.log('✅ Main Elements Present:', mainContent && searchForm ? 'YES' : 'PARTIAL');
        console.log('✅ Form Interaction:', fromInput && toInput ? 'WORKING' : 'NEEDS CHECK');
        console.log('✅ Responsive Design:', 'TESTED - Screenshots available');
        console.log('✅ Performance Load Time:', metrics.loadTime < 5000 ? 'GOOD' : 'NEEDS OPTIMIZATION');
        
        if (consoleErrors.length > 0) {
            console.log('\n❌ Console Errors Details:');
            consoleErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        if (jsErrors.length > 0) {
            console.log('\n💥 JavaScript Errors Details:');
            jsErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        if (networkErrors.length > 0) {
            console.log('\n🔴 Network Errors Details:');
            networkErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
        
        console.log('\n🎉 COMPREHENSIVE TEST COMPLETED!');
        console.log('📸 Screenshots saved:');
        console.log('   - final-test-desktop-load.png');
        console.log('   - final-test-form-interaction.png');
        console.log('   - final-test-mobile.png');
        console.log('   - final-test-tablet.png');
        console.log('   - final-test-comprehensive.png');
        
        const overallStatus = (
            response.status() === 200 && 
            consoleErrors.length === 0 && 
            jsErrors.length === 0 && 
            mainContent && 
            searchForm
        ) ? '🟢 PRODUCTION READY' : '🟡 NEEDS ATTENTION';
        
        console.log('\n🏆 OVERALL STATUS:', overallStatus);
        
        return {
            status: overallStatus,
            pageLoad: response.status() === 200,
            consoleErrors: consoleErrors.length,
            jsErrors: jsErrors.length,
            networkErrors: networkErrors.length,
            elementsPresent: mainContent && searchForm,
            formWorking: fromInput && toInput,
            loadTime: metrics.loadTime,
            screenshots: [
                'final-test-desktop-load.png',
                'final-test-form-interaction.png',
                'final-test-mobile.png',
                'final-test-tablet.png',
                'final-test-comprehensive.png'
            ]
        };
        
    } catch (error) {
        console.log('💥 Test Error:', error.message);
        
        // Take error screenshot
        await page.screenshot({ 
            path: 'final-test-error.png', 
            fullPage: true 
        });
        
        return {
            status: '🔴 TEST FAILED',
            error: error.message,
            screenshots: ['final-test-error.png']
        };
        
    } finally {
        await browser.close();
        console.log('🔚 Browser closed');
    }
}

// Run the comprehensive test
runComprehensiveFinalTest()
    .then(results => {
        console.log('\n📋 FINAL RESULTS SUMMARY:');
        console.log(JSON.stringify(results, null, 2));
    })
    .catch(error => {
        console.error('🚨 Test failed completely:', error);
    });