const { chromium } = require('playwright');

async function runSecurityValidationTest() {
    console.log('🔐 SECURITY VALIDATION TEST');
    console.log('='.repeat(50));
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Enable detailed logging
    page.on('request', request => {
        if (request.url().includes('localhost:3000')) {
            console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('localhost:3000')) {
            console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        console.log('\n🔒 TEST: Direct Admin Access (Unauthenticated)');
        console.log('-'.repeat(40));
        
        const startTime = Date.now();
        await page.goto('http://localhost:3000/admin', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // Wait a bit to see if client-side redirect happens
        await page.waitForTimeout(3000);
        const loadTime = Date.now() - startTime;
        
        const finalUrl = page.url();
        const pageTitle = await page.title();
        
        await page.screenshot({ 
            path: 'test-results/security-admin-access.png', 
            fullPage: true 
        });
        
        console.log(`⏱️ Load time: ${loadTime}ms`);
        console.log(`📍 Final URL: ${finalUrl}`);
        console.log(`📄 Page title: ${pageTitle}`);
        
        // Check for loading states
        const hasSpinner = await page.locator('.animate-spin').count() > 0;
        console.log(`🔄 Has loading spinner: ${hasSpinner}`);
        
        // Check if redirected
        const isLoginPage = finalUrl.includes('/login') || finalUrl.includes('/signin');
        const isAdminPage = finalUrl.includes('/admin') && !isLoginPage;
        
        console.log(`🔐 Is login page: ${isLoginPage}`);
        console.log(`🛡️ Is admin page: ${isAdminPage}`);
        
        // Security assessment
        if (isLoginPage) {
            console.log('✅ SECURITY PASS: Redirected to login page');
        } else if (isAdminPage && hasSpinner) {
            console.log('⚠️ SECURITY PARTIAL: Admin page loading but may redirect');
        } else if (isAdminPage) {
            console.log('❌ SECURITY FAIL: Admin page accessible without auth');
        } else {
            console.log('❓ SECURITY UNKNOWN: Unexpected redirect behavior');
        }
        
        console.log('\n🔐 TEST: Login Form Validation');
        console.log('-'.repeat(40));
        
        // Navigate to login page if not already there
        if (!isLoginPage) {
            await page.goto('http://localhost:3000/admin/login', {
                waitUntil: 'networkidle',
                timeout: 15000
            });
        }
        
        // Wait for page to fully load
        await page.waitForTimeout(2000);
        
        // Look for login form
        const emailInput = await page.locator('input[name="email"]').first();
        const passwordInput = await page.locator('input[name="password"]').first();
        const submitButton = await page.locator('button[type="submit"]').first();
        
        const hasLoginForm = await emailInput.isVisible({ timeout: 5000 }).catch(() => false) &&
                            await passwordInput.isVisible({ timeout: 5000 }).catch(() => false) &&
                            await submitButton.isVisible({ timeout: 5000 }).catch(() => false);
        
        await page.screenshot({ 
            path: 'test-results/security-login-form.png', 
            fullPage: true 
        });
        
        console.log(`📝 Login form present: ${hasLoginForm}`);
        
        if (hasLoginForm) {
            // Test invalid credentials
            console.log('\n❌ Testing invalid credentials...');
            await emailInput.fill('wrong@test.com');
            await passwordInput.fill('wrongpass');
            
            const invalidStartTime = Date.now();
            await submitButton.click();
            
            // Wait for response
            await page.waitForTimeout(3000);
            const invalidTime = Date.now() - invalidStartTime;
            
            const afterInvalidUrl = page.url();
            console.log(`⏱️ Invalid login response time: ${invalidTime}ms`);
            console.log(`📍 URL after invalid login: ${afterInvalidUrl}`);
            
            // Check if still on login page (expected for invalid credentials)
            if (afterInvalidUrl.includes('/login')) {
                console.log('✅ SECURITY PASS: Invalid credentials rejected');
            } else {
                console.log('❌ SECURITY FAIL: Invalid credentials accepted');
            }
            
            await page.screenshot({ 
                path: 'test-results/security-invalid-login.png', 
                fullPage: true 
            });
            
            // Test valid credentials
            console.log('\n✅ Testing valid credentials...');
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            
            // Re-locate form elements after reload
            const emailInputValid = await page.locator('input[name="email"]').first();
            const passwordInputValid = await page.locator('input[name="password"]').first();
            const submitButtonValid = await page.locator('button[type="submit"]').first();
            
            if (await emailInputValid.isVisible({ timeout: 5000 })) {
                await emailInputValid.fill('admin@fly2any.com');
                await passwordInputValid.fill('fly2any2024!');
                
                const validStartTime = Date.now();
                await submitButtonValid.click();
                
                // Wait for potential redirect
                await page.waitForTimeout(5000);
                const validTime = Date.now() - validStartTime;
                
                const afterValidUrl = page.url();
                console.log(`⏱️ Valid login response time: ${validTime}ms`);
                console.log(`📍 URL after valid login: ${afterValidUrl}`);
                
                await page.screenshot({ 
                    path: 'test-results/security-valid-login.png', 
                    fullPage: true 
                });
                
                if (afterValidUrl.includes('/admin') && !afterValidUrl.includes('/login')) {
                    console.log('✅ AUTHENTICATION PASS: Valid credentials accepted');
                    
                    // Test session persistence
                    console.log('\n🔄 Testing session persistence...');
                    const newTab = await context.newPage();
                    await newTab.goto('http://localhost:3000/admin', {
                        waitUntil: 'networkidle',
                        timeout: 10000
                    });
                    
                    await newTab.waitForTimeout(2000);
                    const sessionUrl = newTab.url();
                    
                    await newTab.screenshot({ 
                        path: 'test-results/security-session-test.png', 
                        fullPage: true 
                    });
                    
                    if (sessionUrl.includes('/admin') && !sessionUrl.includes('/login')) {
                        console.log('✅ SESSION PASS: Session persists across tabs');
                    } else {
                        console.log('❌ SESSION FAIL: Session not maintained');
                    }
                    
                    await newTab.close();
                } else {
                    console.log('❌ AUTHENTICATION FAIL: Valid credentials not accepted');
                }
            }
        } else {
            console.log('⚠️ Cannot test authentication - login form not found');
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        await page.screenshot({ 
            path: 'test-results/security-error.png', 
            fullPage: true 
        });
    }
    
    console.log('\n📊 SECURITY TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('Tests completed - check screenshots in test-results/');
    console.log('Key files:');
    console.log('- security-admin-access.png: Initial admin access attempt');
    console.log('- security-login-form.png: Login form validation');
    console.log('- security-invalid-login.png: Invalid credentials test');
    console.log('- security-valid-login.png: Valid credentials test');
    console.log('- security-session-test.png: Session persistence test');
    
    await browser.close();
}

// Create test-results directory
const fs = require('fs');
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
}

runSecurityValidationTest().catch(console.error);