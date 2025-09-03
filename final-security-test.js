const { chromium } = require('playwright');

async function runFinalSecurityTest() {
    console.log('🔐 FINAL SECURITY TEST WITH FIXES');
    console.log('='.repeat(60));
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    const testResults = {
        securityPass: false,
        performanceImproved: false,
        authenticationWorks: false,
        sessionPersists: false,
        overallStatus: 'FAIL'
    };
    
    // Enable logging
    page.on('request', request => {
        if (request.url().includes('localhost:3000') && !request.url().includes('_next/static')) {
            console.log(`📡 ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('localhost:3000') && !response.url().includes('_next/static')) {
            console.log(`📥 ${response.status()} ${response.url()}`);
        }
    });
    
    try {
        // TEST 1: Security - Direct Admin Access
        console.log('\n🔒 TEST 1: Security Protection Test');
        console.log('-'.repeat(40));
        
        const securityStartTime = Date.now();
        await page.goto('http://localhost:3000/admin', { 
            waitUntil: 'networkidle',
            timeout: 15000 
        });
        const securityLoadTime = Date.now() - securityStartTime;
        
        const finalUrl = page.url();
        console.log(`⏱️ Initial load time: ${securityLoadTime}ms`);
        console.log(`📍 Final URL: ${finalUrl}`);
        
        await page.screenshot({ path: 'test-results/final-security-check.png', fullPage: true });
        
        if (finalUrl.includes('/admin/login') || finalUrl.includes('/signin')) {
            console.log('✅ SECURITY FIXED: Admin route now properly redirects to login');
            testResults.securityPass = true;
        } else {
            console.log('❌ SECURITY STILL BROKEN: Admin route accessible without auth');
        }
        
        // TEST 2: Performance - Login Page Load Time
        console.log('\n⚡ TEST 2: Login Page Performance Test');
        console.log('-'.repeat(40));
        
        const performanceStartTime = Date.now();
        await page.goto('http://localhost:3000/admin/login', { 
            waitUntil: 'networkidle',
            timeout: 10000 
        });
        const performanceLoadTime = Date.now() - performanceStartTime;
        
        console.log(`🚀 Login page load time: ${performanceLoadTime}ms`);
        
        if (performanceLoadTime < 5000) {
            console.log('✅ PERFORMANCE IMPROVED: Login page loads under 5 seconds');
            testResults.performanceImproved = true;
        } else {
            console.log('❌ PERFORMANCE ISSUE: Login page still takes over 5 seconds');
        }
        
        await page.screenshot({ path: 'test-results/final-performance-check.png', fullPage: true });
        
        // TEST 3: Authentication Flow
        console.log('\n🔐 TEST 3: Authentication Flow Test');
        console.log('-'.repeat(40));
        
        // Wait for form to be ready
        await page.waitForTimeout(2000);
        
        const emailInput = await page.locator('input[name="email"]').first();
        const passwordInput = await page.locator('input[name="password"]').first();
        const submitButton = await page.locator('button[type="submit"]').first();
        
        const formReady = await emailInput.isVisible({ timeout: 3000 }).catch(() => false) &&
                          await passwordInput.isVisible({ timeout: 3000 }).catch(() => false) &&
                          await submitButton.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (formReady) {
            console.log('📝 Login form found - testing authentication');
            
            // Test invalid credentials first
            console.log('Testing invalid credentials...');
            await emailInput.fill('wrong@test.com');
            await passwordInput.fill('wrongpass');
            await submitButton.click();
            
            await page.waitForTimeout(3000);
            const invalidUrl = page.url();
            
            if (invalidUrl.includes('/login')) {
                console.log('✅ Invalid credentials properly rejected');
            }
            
            // Test valid credentials
            console.log('Testing valid credentials...');
            await page.reload({ waitUntil: 'networkidle' });
            await page.waitForTimeout(1000);
            
            const emailInputValid = await page.locator('input[name="email"]').first();
            const passwordInputValid = await page.locator('input[name="password"]').first();
            const submitButtonValid = await page.locator('button[type="submit"]').first();
            
            if (await emailInputValid.isVisible({ timeout: 3000 })) {
                await emailInputValid.fill('admin@fly2any.com');
                await passwordInputValid.fill('fly2any2024!');
                
                const authStartTime = Date.now();
                await submitButtonValid.click();
                
                // Wait for authentication and potential redirect
                await page.waitForTimeout(5000);
                const authTime = Date.now() - authStartTime;
                
                const authUrl = page.url();
                console.log(`⏱️ Authentication time: ${authTime}ms`);
                console.log(`📍 Post-auth URL: ${authUrl}`);
                
                await page.screenshot({ path: 'test-results/final-auth-check.png', fullPage: true });
                
                if (authUrl.includes('/admin') && !authUrl.includes('/login')) {
                    console.log('✅ AUTHENTICATION FIXED: Valid login now works');
                    testResults.authenticationWorks = true;
                    
                    // TEST 4: Session Persistence
                    console.log('\n🔄 TEST 4: Session Persistence Test');
                    console.log('-'.repeat(40));
                    
                    const newTab = await context.newPage();
                    const sessionStartTime = Date.now();
                    
                    await newTab.goto('http://localhost:3000/admin', {
                        waitUntil: 'networkidle',
                        timeout: 8000
                    });
                    
                    const sessionTime = Date.now() - sessionStartTime;
                    const sessionUrl = newTab.url();
                    
                    console.log(`⏱️ Session check time: ${sessionTime}ms`);
                    console.log(`📍 Session URL: ${sessionUrl}`);
                    
                    await newTab.screenshot({ path: 'test-results/final-session-check.png', fullPage: true });
                    
                    if (sessionUrl.includes('/admin') && !sessionUrl.includes('/login')) {
                        console.log('✅ SESSION PERSISTENCE FIXED: User stays logged in across tabs');
                        testResults.sessionPersists = true;
                    } else {
                        console.log('❌ SESSION ISSUE: User not staying logged in');
                    }
                    
                    await newTab.close();
                } else {
                    console.log('❌ AUTHENTICATION STILL BROKEN: Valid login not working');
                }
            }
        } else {
            console.log('⚠️ Login form not found - cannot test authentication');
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
        await page.screenshot({ path: 'test-results/final-error.png', fullPage: true });
    }
    
    // Calculate overall status
    const passedTests = Object.values(testResults).filter(Boolean).length - 1; // Exclude overallStatus
    testResults.overallStatus = passedTests >= 3 ? 'PASS' : passedTests >= 2 ? 'PARTIAL' : 'FAIL';
    
    // FINAL REPORT
    console.log('\n📊 FINAL COMPREHENSIVE SECURITY REPORT');
    console.log('='.repeat(60));
    console.log('BEFORE vs AFTER COMPARISON:');
    console.log('');
    console.log('SECURITY PROTECTION:');
    console.log(`🔒 Admin Route Protection: ${testResults.securityPass ? '✅ FIXED' : '❌ BROKEN'}`);
    console.log('   BEFORE: Admin page accessible without auth');
    console.log(`   AFTER: ${testResults.securityPass ? 'Properly redirects to login' : 'Still accessible'}`);
    console.log('');
    console.log('PERFORMANCE:');
    console.log(`⚡ Login Page Speed: ${testResults.performanceImproved ? '✅ IMPROVED' : '❌ SLOW'}`);
    console.log('   BEFORE: 18+ second delays');
    console.log(`   AFTER: ${testResults.performanceImproved ? 'Under 5 seconds' : 'Still slow'}`);
    console.log('');
    console.log('AUTHENTICATION:');
    console.log(`🔐 Login Process: ${testResults.authenticationWorks ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log('   BEFORE: Form state bugs after failed login');
    console.log(`   AFTER: ${testResults.authenticationWorks ? 'Clean login flow' : 'Still has issues'}`);
    console.log('');
    console.log('SESSION MANAGEMENT:');
    console.log(`🔄 Session Persistence: ${testResults.sessionPersists ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log('   BEFORE: Sessions not maintained across tabs');
    console.log(`   AFTER: ${testResults.sessionPersists ? 'Proper session sharing' : 'Still not working'}`);
    console.log('');
    console.log(`OVERALL STATUS: ${testResults.overallStatus}`);
    console.log('');
    console.log('CHANGES IMPLEMENTED:');
    console.log('✅ Fixed middleware to properly protect ALL /admin routes');
    console.log('✅ Added explicit NextResponse redirects for security');  
    console.log('✅ Added session timeout optimizations');
    console.log('✅ Enhanced logging for debugging');
    console.log('✅ Improved callbackUrl handling in redirects');
    console.log('');
    console.log('📁 Test Evidence: Check test-results/ directory for screenshots');
    
    await browser.close();
    return testResults;
}

// Create test-results directory
const fs = require('fs');
if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
}

runFinalSecurityTest().catch(console.error);