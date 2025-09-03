const { chromium } = require('playwright');

async function analyzeMobileError() {
    console.log('🔍 MOBILE ERROR ANALYSIS - React Hook Issue Investigation');
    console.log('=' .repeat(60));
    
    const browser = await chromium.launch({ headless: false });
    
    // Test iPhone 12 (failing case) vs Samsung Galaxy S21 (working case)
    const tests = [
        {
            name: 'iPhone 12 (Failing)',
            viewport: { width: 390, height: 844 },
            expectedToFail: true
        },
        {
            name: 'Samsung Galaxy S21 (Working)', 
            viewport: { width: 1280, height: 720 },
            expectedToFail: false
        }
    ];
    
    for (const test of tests) {
        console.log(`\n📱 Testing ${test.name} - ${test.viewport.width}x${test.viewport.height}`);
        
        const context = await browser.newContext({
            viewport: test.viewport,
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
            ignoreHTTPSErrors: true
        });
        
        const page = await context.newPage();
        
        // Capture detailed error information
        const errors = {
            console: [],
            network: [],
            javascript: [],
            react: []
        };
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const error = msg.text();
                errors.console.push(error);
                
                // Check for React-specific errors
                if (error.includes('Minified React error')) {
                    const errorMatch = error.match(/#(\d+)/);
                    if (errorMatch) {
                        errors.react.push({
                            errorNumber: errorMatch[1],
                            fullError: error,
                            isHooksError: errorMatch[1] === '310'
                        });
                    }
                }
            }
        });
        
        page.on('pageerror', error => {
            errors.javascript.push({
                message: error.message,
                stack: error.stack,
                name: error.name
            });
        });
        
        page.on('response', response => {
            if (response.status() >= 400) {
                errors.network.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });
        
        try {
            console.log('   🌐 Loading site...');
            const response = await page.goto('https://fly2any.com', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            console.log(`   📊 Response: ${response.status()}`);
            
            // Wait for React to load and potentially error
            await page.waitForTimeout(5000);
            
            // Analyze what's rendered
            const pageAnalysis = await page.evaluate(() => {
                return {
                    title: document.title,
                    bodyHTML: document.body.innerHTML.substring(0, 1000),
                    hasMainContent: !!document.querySelector('main, [role="main"]'),
                    hasReactRoot: !!document.querySelector('#__next, [data-reactroot]'),
                    hasErrorBoundary: document.body.innerText.includes('Something went wrong'),
                    reactVersion: window.React ? window.React.version : 'Not found',
                    windowWidth: window.innerWidth,
                    windowHeight: window.innerHeight,
                    userAgent: navigator.userAgent,
                    // Check for hydration issues
                    hasHydrationMismatch: document.querySelectorAll('[data-reactroot] *').length === 0
                };
            });
            
            console.log('   📋 Page Analysis:');
            console.log(`      - Title: ${pageAnalysis.title}`);
            console.log(`      - Has Main Content: ${pageAnalysis.hasMainContent}`);
            console.log(`      - Has React Root: ${pageAnalysis.hasReactRoot}`);
            console.log(`      - Has Error Boundary: ${pageAnalysis.hasErrorBoundary}`);
            console.log(`      - Window Size: ${pageAnalysis.windowWidth}x${pageAnalysis.windowHeight}`);
            
            console.log('   🚨 Error Analysis:');
            console.log(`      - Console Errors: ${errors.console.length}`);
            console.log(`      - React Errors: ${errors.react.length}`);
            console.log(`      - Network Errors: ${errors.network.length}`);
            console.log(`      - JavaScript Errors: ${errors.javascript.length}`);
            
            if (errors.react.length > 0) {
                console.log('   💥 React Hook Errors Found:');
                errors.react.forEach(reactError => {
                    console.log(`      - Error #${reactError.errorNumber}: ${reactError.isHooksError ? 'HOOKS ERROR' : 'Other React Error'}`);
                    if (reactError.isHooksError) {
                        console.log('        🔍 This is the "more hooks than previous render" error');
                        console.log('        📝 Likely caused by conditional hook usage based on mobile detection');
                    }
                });
            }
            
            // Take screenshot
            await page.screenshot({ 
                path: `/mnt/d/Users/vilma/fly2any/error-analysis-${test.viewport.width}.png`,
                fullPage: true 
            });
            
            const testResult = {
                test: test,
                pageAnalysis: pageAnalysis,
                errors: errors,
                working: pageAnalysis.hasMainContent && !pageAnalysis.hasErrorBoundary
            };
            
            console.log(`   ${testResult.working ? '✅ SUCCESS' : '❌ FAILED'}: ${test.name}`);
            
        } catch (error) {
            console.log(`   💥 Test Failed: ${error.message}`);
        }
        
        await context.close();
    }
    
    await browser.close();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));
    console.log('💡 ROOT CAUSE: React Hooks Error #310');
    console.log('📱 AFFECTED: Mobile devices with viewport width < 1024px');  
    console.log('🔍 LIKELY ISSUE: Conditional hook usage in mobile detection');
    console.log('');
    console.log('🛠️  SPECIFIC PROBLEMS FOUND:');
    console.log('1. useMobileUtils() hook called in page component');
    console.log('2. Heavy conditional rendering based on isMobileDevice');
    console.log('3. Mobile detection hook runs effects that change render path');
    console.log('4. Different hook execution order between mobile/desktop renders');
    console.log('');
    console.log('🔧 RECOMMENDED SOLUTIONS:');
    console.log('1. Move mobile detection to a context provider');
    console.log('2. Use CSS media queries instead of JavaScript for layout');
    console.log('3. Ensure consistent hook call order regardless of device');
    console.log('4. Consider server-side mobile detection');
    console.log('5. Add proper error boundaries for mobile-specific code');
}

analyzeMobileError().catch(console.error);