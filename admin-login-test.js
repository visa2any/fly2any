const { chromium } = require('playwright');

async function testAdminLoginFlow() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const results = {
        serverReady: false,
        loginPageLoads: false,
        invalidCredentialsTest: { attempted: false, success: false, errorShown: false },
        validCredentialsTest: { attempted: false, success: false, redirected: false },
        adminPageAccess: { beforeLogin: false, afterLogin: false },
        logoutTest: { attempted: false, success: false },
        postLogoutAccess: { attempted: false, redirectedToLogin: false }
    };
    
    try {
        console.log('🚀 Starting Admin Login Flow Test...\n');
        
        // Step 1: Check if server is ready
        console.log('1. Testing server readiness...');
        try {
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
            results.serverReady = true;
            console.log('✅ Server is ready and responding\n');
        } catch (error) {
            console.log('❌ Server not ready:', error.message);
            return results;
        }
        
        // Step 2: Navigate to admin login page
        console.log('2. Navigating to admin login page...');
        try {
            await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForLoadState('domcontentloaded');
            
            // Check if login form exists
            const emailInput = await page.locator('input[type="email"], input[name="email"]').first();
            const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
            const submitButton = await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
            
            if (await emailInput.isVisible() && await passwordInput.isVisible() && await submitButton.isVisible()) {
                results.loginPageLoads = true;
                console.log('✅ Admin login page loaded successfully');
                console.log('   - Email input found:', await emailInput.isVisible());
                console.log('   - Password input found:', await passwordInput.isVisible());
                console.log('   - Submit button found:', await submitButton.isVisible());
            } else {
                console.log('❌ Login form elements not found');
                console.log('   - Email input:', await emailInput.isVisible());
                console.log('   - Password input:', await passwordInput.isVisible());
                console.log('   - Submit button:', await submitButton.isVisible());
            }
        } catch (error) {
            console.log('❌ Failed to load admin login page:', error.message);
        }
        
        if (!results.loginPageLoads) {
            console.log('\nSkipping remaining tests as login page failed to load');
            return results;
        }
        
        // Step 3: Test with INVALID credentials
        console.log('\n3. Testing with INVALID credentials (wrong@test.com / wrongpass)...');
        try {
            results.invalidCredentialsTest.attempted = true;
            
            await page.fill('input[type="email"], input[name="email"]', 'wrong@test.com');
            await page.fill('input[type="password"], input[name="password"]', 'wrongpass');
            
            // Click submit button
            await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
            
            // Wait for response
            await page.waitForTimeout(3000);
            
            // Check for error message
            const currentUrl = page.url();
            const errorMessages = await page.locator('.error, .alert-error, [role="alert"], .text-red-500, .text-red-600').allTextContents();
            const hasError = errorMessages.length > 0 && errorMessages.some(msg => msg.toLowerCase().includes('error') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('wrong'));
            
            if (currentUrl.includes('/admin/login') && hasError) {
                results.invalidCredentialsTest.success = true;
                results.invalidCredentialsTest.errorShown = true;
                console.log('✅ Invalid credentials correctly rejected');
                console.log('   - Stayed on login page:', currentUrl.includes('/admin/login'));
                console.log('   - Error message shown:', hasError);
                console.log('   - Error messages:', errorMessages);
            } else if (currentUrl.includes('/admin/login')) {
                results.invalidCredentialsTest.success = true;
                console.log('✅ Invalid credentials rejected (stayed on login page)');
                console.log('⚠️  No error message visible');
            } else {
                console.log('❌ Invalid credentials incorrectly accepted');
                console.log('   - Current URL:', currentUrl);
            }
        } catch (error) {
            console.log('❌ Error testing invalid credentials:', error.message);
        }
        
        // Step 4: Test with VALID credentials
        console.log('\n4. Testing with VALID credentials (admin@fly2any.com / fly2any2024!)...');
        try {
            results.validCredentialsTest.attempted = true;
            
            // Clear fields and enter valid credentials
            await page.fill('input[type="email"], input[name="email"]', 'admin@fly2any.com');
            await page.fill('input[type="password"], input[name="password"]', 'fly2any2024!');
            
            // Click submit button
            await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
            
            // Wait for navigation
            await page.waitForTimeout(5000);
            
            const currentUrl = page.url();
            
            if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
                results.validCredentialsTest.success = true;
                results.validCredentialsTest.redirected = true;
                console.log('✅ Valid credentials accepted and redirected');
                console.log('   - Redirected to:', currentUrl);
            } else if (!currentUrl.includes('/admin/login')) {
                results.validCredentialsTest.success = true;
                console.log('✅ Valid credentials accepted');
                console.log('   - Current URL:', currentUrl);
            } else {
                console.log('❌ Valid credentials rejected');
                console.log('   - Current URL:', currentUrl);
                
                // Check for error messages
                const errorMessages = await page.locator('.error, .alert-error, [role="alert"], .text-red-500').allTextContents();
                if (errorMessages.length > 0) {
                    console.log('   - Error messages:', errorMessages);
                }
            }
        } catch (error) {
            console.log('❌ Error testing valid credentials:', error.message);
        }
        
        // Step 5: Test direct /admin access after login
        console.log('\n5. Testing direct /admin access after login...');
        try {
            await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);
            
            const currentUrl = page.url();
            
            if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
                results.adminPageAccess.afterLogin = true;
                console.log('✅ Admin page accessible after login');
                console.log('   - Current URL:', currentUrl);
            } else {
                console.log('❌ Admin page not accessible after login');
                console.log('   - Redirected to:', currentUrl);
            }
        } catch (error) {
            console.log('❌ Error testing admin page access:', error.message);
        }
        
        // Step 6: Test logout if possible
        console.log('\n6. Testing logout functionality...');
        try {
            results.logoutTest.attempted = true;
            
            // Look for logout button/link
            const logoutElements = await page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out"), [href*="logout"], [href*="signout"]').all();
            
            if (logoutElements.length > 0) {
                await logoutElements[0].click();
                await page.waitForTimeout(3000);
                
                const currentUrl = page.url();
                
                if (currentUrl.includes('/login') || !currentUrl.includes('/admin')) {
                    results.logoutTest.success = true;
                    console.log('✅ Logout successful');
                    console.log('   - Redirected to:', currentUrl);
                } else {
                    console.log('❌ Logout did not redirect properly');
                    console.log('   - Current URL:', currentUrl);
                }
            } else {
                console.log('⚠️  No logout button/link found');
                // Try to clear session manually
                await context.clearCookies();
                console.log('   - Cleared cookies manually');
            }
        } catch (error) {
            console.log('❌ Error testing logout:', error.message);
        }
        
        // Step 7: Test accessing /admin after logout
        console.log('\n7. Testing /admin access after logout...');
        try {
            results.postLogoutAccess.attempted = true;
            
            await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);
            
            const currentUrl = page.url();
            
            if (currentUrl.includes('/login')) {
                results.postLogoutAccess.redirectedToLogin = true;
                console.log('✅ Correctly redirected to login after logout');
                console.log('   - Redirected to:', currentUrl);
            } else {
                console.log('❌ Not redirected to login after logout');
                console.log('   - Current URL:', currentUrl);
            }
        } catch (error) {
            console.log('❌ Error testing post-logout access:', error.message);
        }
        
    } catch (error) {
        console.log('❌ General error in test:', error.message);
    } finally {
        await browser.close();
    }
    
    return results;
}

// Run the test
testAdminLoginFlow().then(results => {
    console.log('\n' + '='.repeat(60));
    console.log('📋 ADMIN LOGIN FLOW TEST REPORT');
    console.log('='.repeat(60));
    
    console.log('\n🌐 Server & Page Loading:');
    console.log(`   Server Ready: ${results.serverReady ? '✅' : '❌'}`);
    console.log(`   Login Page Loads: ${results.loginPageLoads ? '✅' : '❌'}`);
    
    console.log('\n🔐 Authentication Tests:');
    console.log(`   Invalid Credentials Test: ${results.invalidCredentialsTest.attempted ? (results.invalidCredentialsTest.success ? '✅' : '❌') : '⏭️ '}`);
    if (results.invalidCredentialsTest.attempted) {
        console.log(`      - Error Shown: ${results.invalidCredentialsTest.errorShown ? '✅' : '⚠️ '}`);
    }
    console.log(`   Valid Credentials Test: ${results.validCredentialsTest.attempted ? (results.validCredentialsTest.success ? '✅' : '❌') : '⏭️ '}`);
    if (results.validCredentialsTest.attempted) {
        console.log(`      - Redirected to Admin: ${results.validCredentialsTest.redirected ? '✅' : '⚠️ '}`);
    }
    
    console.log('\n🏠 Admin Page Access:');
    console.log(`   Direct /admin Access After Login: ${results.adminPageAccess.afterLogin ? '✅' : '❌'}`);
    
    console.log('\n🚪 Logout & Security:');
    console.log(`   Logout Test: ${results.logoutTest.attempted ? (results.logoutTest.success ? '✅' : '❌') : '⏭️ '}`);
    console.log(`   Post-Logout Admin Access: ${results.postLogoutAccess.attempted ? (results.postLogoutAccess.redirectedToLogin ? '✅' : '❌') : '⏭️ '}`);
    
    // Calculate overall success rate
    const totalTests = 6;
    let passedTests = 0;
    if (results.serverReady) passedTests++;
    if (results.loginPageLoads) passedTests++;
    if (results.invalidCredentialsTest.success) passedTests++;
    if (results.validCredentialsTest.success) passedTests++;
    if (results.adminPageAccess.afterLogin) passedTests++;
    if (results.postLogoutAccess.redirectedToLogin || results.logoutTest.success) passedTests++;
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n📊 Overall Results:');
    console.log(`   Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
    
    if (successRate >= 80) {
        console.log('   Status: 🎉 EXCELLENT - Admin login flow working well!');
    } else if (successRate >= 60) {
        console.log('   Status: ⚠️  GOOD - Some issues but core functionality works');
    } else {
        console.log('   Status: ❌ NEEDS ATTENTION - Major issues detected');
    }
    
    console.log('\n' + '='.repeat(60));
    
}).catch(error => {
    console.error('❌ Test failed to run:', error);
    process.exit(1);
});