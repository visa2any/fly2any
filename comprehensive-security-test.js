const { chromium } = require('playwright');

async function runComprehensiveSecurityTest() {
    console.log('🔐 COMPREHENSIVE SECURITY & PERFORMANCE TEST');
    console.log('='.repeat(60));
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // Slow down for observation
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Enable request logging
    page.on('request', request => {
        if (request.url().includes('localhost:3000')) {
            console.log(`📡 ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('localhost:3000')) {
            console.log(`📥 ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        // TEST 1: Security Test - Direct Admin Access
        console.log('\n🔒 TEST 1: Security Test - Direct Admin Access');
        console.log('-'.repeat(50));
        
        const adminStartTime = Date.now();
        
        try {
            await page.goto('http://localhost:3000/admin', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            const adminLoadTime = Date.now() - adminStartTime;
            const currentUrl = page.url();
            
            await page.screenshot({ path: 'test-results/01-admin-redirect.png', fullPage: true });
            
            if (currentUrl.includes('/api/auth/signin') || currentUrl.includes('/login')) {
                console.log('✅ SECURITY PASS: Admin route properly redirects to login');
                console.log(`   → Redirect URL: ${currentUrl}`);
                console.log(`   → Redirect time: ${adminLoadTime}ms`);
            } else {
                console.log('❌ SECURITY FAIL: Admin route accessible without auth');
                console.log(`   → Current URL: ${currentUrl}`);
            }
        } catch (error) {
            console.log('⚠️ Admin access test error:', error.message);
        }
        
        // TEST 2: Login Page Performance
        console.log('\n⚡ TEST 2: Login Page Performance Test');
        console.log('-'.repeat(50));
        
        const loginStartTime = Date.now();
        
        await page.goto('http://localhost:3000/api/auth/signin', { 
            waitUntil: 'networkidle',
            timeout: 15000 
        });
        
        const loginLoadTime = Date.now() - loginStartTime;
        
        await page.screenshot({ path: 'test-results/02-login-page.png', fullPage: true });
        
        console.log(`🚀 Login page load time: ${loginLoadTime}ms`);
        if (loginLoadTime < 5000) {
            console.log('✅ PERFORMANCE PASS: Login loads under 5 seconds');
        } else {
            console.log('❌ PERFORMANCE FAIL: Login takes over 5 seconds');
        }
        
        // TEST 3: Invalid Login Test
        console.log('\n❌ TEST 3: Invalid Login Test');
        console.log('-'.repeat(50));
        
        // Look for email input (try multiple possible selectors)
        const emailSelectors = [
            'input[name="email"]',
            'input[type="email"]', 
            '#email',
            '[placeholder*="email" i]',
            'input[id*="email" i]'
        ];
        
        let emailInput = null;
        for (const selector of emailSelectors) {
            try {
                emailInput = await page.locator(selector).first();
                if (await emailInput.isVisible({ timeout: 2000 })) {
                    console.log(`Found email input with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (emailInput) {
            await emailInput.fill('wrong@test.com');
            
            // Look for password input
            const passwordSelectors = [
                'input[name="password"]',
                'input[type="password"]',
                '#password',
                '[placeholder*="password" i]'
            ];
            
            let passwordInput = null;
            for (const selector of passwordSelectors) {
                try {
                    passwordInput = await page.locator(selector).first();
                    if (await passwordInput.isVisible({ timeout: 2000 })) {
                        console.log(`Found password input with selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (passwordInput) {
                await passwordInput.fill('wrongpass');
                
                // Look for submit button
                const submitSelectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    'button:has-text("Sign in")',
                    'button:has-text("Login")',
                    'button:has-text("Submit")'
                ];
                
                let submitButton = null;
                for (const selector of submitSelectors) {
                    try {
                        submitButton = await page.locator(selector).first();
                        if (await submitButton.isVisible({ timeout: 2000 })) {
                            console.log(`Found submit button with selector: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (submitButton) {
                    const invalidLoginStartTime = Date.now();
                    await submitButton.click();
                    
                    // Wait for response
                    await page.waitForLoadState('networkidle', { timeout: 10000 });
                    const invalidLoginTime = Date.now() - invalidLoginStartTime;
                    
                    await page.screenshot({ path: 'test-results/03-invalid-login.png', fullPage: true });
                    
                    // Check for error messages
                    const errorSelectors = [
                        '.error',
                        '[role="alert"]',
                        '.alert-error',
                        '.text-red-500',
                        '.text-red-600',
                        ':has-text("error")',
                        ':has-text("invalid")',
                        ':has-text("wrong")'
                    ];
                    
                    let errorFound = false;
                    for (const selector of errorSelectors) {
                        try {
                            const errorElement = await page.locator(selector).first();
                            if (await errorElement.isVisible({ timeout: 2000 })) {
                                const errorText = await errorElement.textContent();
                                console.log(`✅ Error message displayed: "${errorText}"`);
                                errorFound = true;
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (!errorFound) {
                        console.log('⚠️ No clear error message found, but login attempt processed');
                    }
                    
                    console.log(`⏱️ Invalid login response time: ${invalidLoginTime}ms`);
                } else {
                    console.log('⚠️ Could not find submit button');
                }
            } else {
                console.log('⚠️ Could not find password input');
            }
        } else {
            console.log('⚠️ Could not find email input - checking page content');
            const pageContent = await page.content();
            console.log('Page title:', await page.title());
            console.log('Forms found:', await page.locator('form').count());
        }
        
        // TEST 4: Valid Login Test
        console.log('\n✅ TEST 4: Valid Login Test');
        console.log('-'.repeat(50));
        
        // Refresh the page to clear any error states
        await page.reload({ waitUntil: 'networkidle' });
        
        // Find inputs again for valid login
        emailInput = null;
        for (const selector of emailSelectors) {
            try {
                emailInput = await page.locator(selector).first();
                if (await emailInput.isVisible({ timeout: 2000 })) {
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (emailInput) {
            await emailInput.fill('admin@fly2any.com');
            
            let passwordInput = null;
            for (const selector of passwordSelectors) {
                try {
                    passwordInput = await page.locator(selector).first();
                    if (await passwordInput.isVisible({ timeout: 2000 })) {
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (passwordInput) {
                await passwordInput.fill('fly2any2024!');
                
                let submitButton = null;
                for (const selector of submitSelectors) {
                    try {
                        submitButton = await page.locator(selector).first();
                        if (await submitButton.isVisible({ timeout: 2000 })) {
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                if (submitButton) {
                    const validLoginStartTime = Date.now();
                    await submitButton.click();
                    
                    // Wait for potential redirect
                    await page.waitForLoadState('networkidle', { timeout: 15000 });
                    const validLoginTime = Date.now() - validLoginStartTime;
                    
                    const postLoginUrl = page.url();
                    await page.screenshot({ path: 'test-results/04-valid-login.png', fullPage: true });
                    
                    console.log(`🔐 Login attempt completed in ${validLoginTime}ms`);
                    console.log(`📍 Post-login URL: ${postLoginUrl}`);
                    
                    if (postLoginUrl.includes('/admin') || postLoginUrl.includes('dashboard') || !postLoginUrl.includes('signin')) {
                        console.log('✅ LOGIN SUCCESS: Redirected to protected area');
                    } else {
                        console.log('⚠️ LOGIN STATUS UNCLEAR: Still on login page or unexpected redirect');
                    }
                }
            }
        }
        
        // TEST 5: Protected Access After Login
        console.log('\n🛡️ TEST 5: Protected Access After Login');
        console.log('-'.repeat(50));
        
        const protectedAccessStartTime = Date.now();
        await page.goto('http://localhost:3000/admin', { 
            waitUntil: 'networkidle',
            timeout: 10000 
        });
        const protectedAccessTime = Date.now() - protectedAccessStartTime;
        
        const finalUrl = page.url();
        await page.screenshot({ path: 'test-results/05-protected-access.png', fullPage: true });
        
        console.log(`🚀 Protected access time: ${protectedAccessTime}ms`);
        console.log(`📍 Final URL: ${finalUrl}`);
        
        if (finalUrl.includes('/admin') && !finalUrl.includes('signin')) {
            console.log('✅ PROTECTED ACCESS SUCCESS: Admin area accessible after login');
        } else {
            console.log('❌ PROTECTED ACCESS FAIL: Still redirected to login');
        }
        
        // TEST 6: Session Persistence Test
        console.log('\n🔄 TEST 6: Session Persistence Test');
        console.log('-'.repeat(50));
        
        const newTab = await context.newPage();
        const sessionTestStartTime = Date.now();
        
        await newTab.goto('http://localhost:3000/admin', { 
            waitUntil: 'networkidle',
            timeout: 10000 
        });
        
        const sessionTestTime = Date.now() - sessionTestStartTime;
        const newTabUrl = newTab.url();
        
        await newTab.screenshot({ path: 'test-results/06-session-persistence.png', fullPage: true });
        
        console.log(`⏱️ New tab access time: ${sessionTestTime}ms`);
        console.log(`📍 New tab URL: ${newTabUrl}`);
        
        if (newTabUrl.includes('/admin') && !newTabUrl.includes('signin')) {
            console.log('✅ SESSION PERSISTENCE SUCCESS: Logged in across tabs');
        } else {
            console.log('❌ SESSION PERSISTENCE FAIL: Session not shared');
        }
        
        await newTab.close();
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
    }
    
    // FINAL SUMMARY
    console.log('\n📊 FINAL TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('🔐 Security Tests: Admin route protection');
    console.log('⚡ Performance Tests: Page load times under 5s');
    console.log('🛡️ Authentication Tests: Valid/invalid login handling');
    console.log('🔄 Session Tests: Persistence across tabs');
    console.log('\n📁 Screenshots saved in test-results/ directory');
    
    await browser.close();
}

// Create test-results directory
const fs = require('fs');
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
}

runComprehensiveSecurityTest().catch(console.error);