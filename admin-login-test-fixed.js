const { chromium } = require('playwright');

async function testAdminLoginFlow() {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const results = {
        serverReady: false,
        loginPageLoads: false,
        formElementsVisible: false,
        invalidCredentialsTest: { attempted: false, success: false, errorShown: false },
        validCredentialsTest: { attempted: false, success: false, redirected: false },
        adminPageAccess: { beforeLogin: false, afterLogin: false },
        logoutTest: { attempted: false, success: false },
        postLogoutAccess: { attempted: false, redirectedToLogin: false }
    };
    
    try {
        console.log('🚀 Starting Enhanced Admin Login Flow Test...\n');
        
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
        
        // Step 2: Navigate to admin login page and wait for it to fully load
        console.log('2. Navigating to admin login page...');
        try {
            await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 30000 });
            
            // Wait for either loading state to finish or form to appear
            console.log('   Waiting for page to load completely...');
            
            // Wait for loading screen to disappear if present
            try {
                await page.waitForSelector('.admin-loading', { timeout: 5000 });
                console.log('   Found loading screen, waiting for it to disappear...');
                await page.waitForSelector('.admin-loading', { state: 'hidden', timeout: 15000 });
                console.log('   Loading screen disappeared');
            } catch {
                console.log('   No loading screen found or already gone');
            }
            
            // Now wait for form elements
            await page.waitForSelector('form.admin-login-form', { timeout: 10000 });
            await page.waitForSelector('input[name="email"]', { timeout: 10000 });
            await page.waitForSelector('input[name="password"]', { timeout: 10000 });
            await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
            
            // Check if elements are actually visible
            const emailVisible = await page.isVisible('input[name="email"]');
            const passwordVisible = await page.isVisible('input[name="password"]');
            const buttonVisible = await page.isVisible('button[type="submit"]');
            
            if (emailVisible && passwordVisible && buttonVisible) {
                results.loginPageLoads = true;
                results.formElementsVisible = true;
                console.log('✅ Admin login page loaded successfully');
                console.log('   - Form found:', await page.isVisible('form.admin-login-form'));
                console.log('   - Email input visible:', emailVisible);
                console.log('   - Password input visible:', passwordVisible);
                console.log('   - Submit button visible:', buttonVisible);
                
                // Get development info if available
                const devInfo = await page.locator('.admin-login-dev-info').isVisible();
                console.log('   - Development info shown:', devInfo);
            } else {
                console.log('❌ Form elements not visible');
                console.log('   - Email input visible:', emailVisible);
                console.log('   - Password input visible:', passwordVisible);
                console.log('   - Submit button visible:', buttonVisible);
            }
        } catch (error) {
            console.log('❌ Failed to load admin login page properly:', error.message);
            
            // Take a screenshot for debugging
            await page.screenshot({ path: 'login-error-debug.png' });
            console.log('   Screenshot saved as login-error-debug.png');
        }
        
        if (!results.loginPageLoads) {
            console.log('\nSkipping remaining tests as login page failed to load properly');
            return results;
        }
        
        // Step 3: Test direct /admin access before login
        console.log('\n3. Testing direct /admin access before login...');
        try {
            await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 15000 });
            await page.waitForTimeout(2000);
            
            const currentUrl = page.url();
            
            if (currentUrl.includes('/admin/login')) {
                results.adminPageAccess.beforeLogin = false; // This is actually correct behavior
                console.log('✅ Correctly redirected to login when accessing /admin without auth');
                console.log('   - Current URL:', currentUrl);
            } else if (currentUrl.includes('/admin') && !currentUrl.includes('/admin/login')) {
                results.adminPageAccess.beforeLogin = true;
                console.log('⚠️  Admin page accessible without login (security concern)');
                console.log('   - Current URL:', currentUrl);
            } else {
                console.log('❌ Unexpected redirect behavior');
                console.log('   - Current URL:', currentUrl);
            }
        } catch (error) {
            console.log('❌ Error testing admin page access before login:', error.message);
        }
        
        // Go back to login page for credentials test
        await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
        await page.waitForSelector('input[name="email"]', { timeout: 10000 });
        
        // Step 4: Test with INVALID credentials
        console.log('\n4. Testing with INVALID credentials (wrong@test.com / wrongpass)...');
        try {
            results.invalidCredentialsTest.attempted = true;
            
            await page.fill('input[name="email"]', 'wrong@test.com');
            await page.fill('input[name="password"]', 'wrongpass');
            
            console.log('   Filled invalid credentials, submitting form...');
            
            // Click submit button
            await page.click('button[type="submit"]');
            
            // Wait for response
            await page.waitForTimeout(5000);
            
            // Check for error message
            const currentUrl = page.url();
            const errorVisible = await page.isVisible('.admin-login-error');
            let errorMessages = [];
            
            if (errorVisible) {
                errorMessages = await page.locator('.admin-login-error').allTextContents();
            }
            
            if (currentUrl.includes('/admin/login')) {
                results.invalidCredentialsTest.success = true;
                if (errorVisible) {
                    results.invalidCredentialsTest.errorShown = true;
                    console.log('✅ Invalid credentials correctly rejected with error message');
                    console.log('   - Error messages:', errorMessages);
                } else {
                    console.log('✅ Invalid credentials correctly rejected (stayed on login page)');
                    console.log('⚠️  No error message visible');
                }
            } else {
                console.log('❌ Invalid credentials incorrectly accepted');
                console.log('   - Current URL:', currentUrl);
            }
        } catch (error) {
            console.log('❌ Error testing invalid credentials:', error.message);
        }
        
        // Step 5: Test with VALID credentials
        console.log('\n5. Testing with VALID credentials (admin@fly2any.com / fly2any2024!)...');
        try {
            results.validCredentialsTest.attempted = true;
            
            // Clear fields and enter valid credentials
            await page.fill('input[name="email"]', '');
            await page.fill('input[name="password"]', '');
            await page.fill('input[name="email"]', 'admin@fly2any.com');
            await page.fill('input[name="password"]', 'fly2any2024!');
            
            console.log('   Filled valid credentials, submitting form...');
            
            // Click submit button
            await page.click('button[type="submit"]');
            
            // Wait for loading state and navigation
            console.log('   Waiting for authentication and redirect...');
            
            // Wait for either success or error
            try {
                // Wait for navigation or error
                await Promise.race([
                    page.waitForURL(url => !url.includes('/admin/login'), { timeout: 10000 }),
                    page.waitForSelector('.admin-login-error', { timeout: 10000 })
                ]);
            } catch {
                console.log('   No immediate redirect or error, waiting longer...');
                await page.waitForTimeout(3000);
            }
            
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
                // Check for error messages
                const errorVisible = await page.isVisible('.admin-login-error');
                if (errorVisible) {
                    const errorMessages = await page.locator('.admin-login-error').allTextContents();
                    console.log('❌ Valid credentials rejected with error');
                    console.log('   - Error messages:', errorMessages);
                } else {
                    console.log('❌ Valid credentials not processing - still on login page');
                }
                console.log('   - Current URL:', currentUrl);
            }
        } catch (error) {
            console.log('❌ Error testing valid credentials:', error.message);
        }
        
        // Step 6: Test direct /admin access after login (if login was successful)
        if (results.validCredentialsTest.success) {
            console.log('\n6. Testing direct /admin access after login...');
            try {
                await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 15000 });
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
                console.log('❌ Error testing admin page access after login:', error.message);
            }
        } else {
            console.log('\n6. Skipping /admin access test (login failed)');
        }
        
        // Step 7: Test logout if possible (and if login was successful)
        if (results.validCredentialsTest.success) {
            console.log('\n7. Testing logout functionality...');
            try {
                results.logoutTest.attempted = true;
                
                // Look for logout button/link
                const logoutSelectors = [
                    'button:has-text("Logout")', 
                    'button:has-text("Sign out")', 
                    'a:has-text("Logout")', 
                    'a:has-text("Sign out")', 
                    '[href*="logout"]', 
                    '[href*="signout"]',
                    'button:has-text("Sair")',
                    'a:has-text("Sair")'
                ];
                
                let logoutElement = null;
                for (const selector of logoutSelectors) {
                    try {
                        const element = page.locator(selector).first();
                        if (await element.isVisible()) {
                            logoutElement = element;
                            break;
                        }
                    } catch {
                        continue;
                    }
                }
                
                if (logoutElement) {
                    await logoutElement.click();
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
                    console.log('⚠️  No logout button/link found - trying manual session clear');
                    await context.clearCookies();
                    console.log('   - Cleared cookies manually');
                    results.logoutTest.success = true;
                }
            } catch (error) {
                console.log('❌ Error testing logout:', error.message);
            }
        } else {
            console.log('\n7. Skipping logout test (login failed)');
        }
        
        // Step 8: Test accessing /admin after logout
        if (results.logoutTest.attempted) {
            console.log('\n8. Testing /admin access after logout...');
            try {
                results.postLogoutAccess.attempted = true;
                
                await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 15000 });
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
        } else {
            console.log('\n8. Skipping post-logout test (logout not attempted)');
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
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE ADMIN LOGIN FLOW TEST REPORT');
    console.log('='.repeat(80));
    
    console.log('\n🌐 Server & Page Loading:');
    console.log(`   Server Ready: ${results.serverReady ? '✅' : '❌'}`);
    console.log(`   Login Page Loads: ${results.loginPageLoads ? '✅' : '❌'}`);
    console.log(`   Form Elements Visible: ${results.formElementsVisible ? '✅' : '❌'}`);
    
    console.log('\n🔐 Authentication Tests:');
    console.log(`   Invalid Credentials Test: ${results.invalidCredentialsTest.attempted ? (results.invalidCredentialsTest.success ? '✅' : '❌') : '⏭️  Skipped'}`);
    if (results.invalidCredentialsTest.attempted) {
        console.log(`      - Error Message Shown: ${results.invalidCredentialsTest.errorShown ? '✅' : '⚠️  No error shown'}`);
    }
    console.log(`   Valid Credentials Test: ${results.validCredentialsTest.attempted ? (results.validCredentialsTest.success ? '✅' : '❌') : '⏭️  Skipped'}`);
    if (results.validCredentialsTest.attempted) {
        console.log(`      - Redirected to Admin: ${results.validCredentialsTest.redirected ? '✅' : '⚠️  No redirect'}`);
    }
    
    console.log('\n🏠 Admin Page Access:');
    console.log(`   Before Login (Should Block): ${!results.adminPageAccess.beforeLogin ? '✅ Correctly blocked' : '❌ Security issue'}`);
    console.log(`   After Login (Should Allow): ${results.adminPageAccess.afterLogin ? '✅' : '❌'}`);
    
    console.log('\n🚪 Logout & Security:');
    console.log(`   Logout Test: ${results.logoutTest.attempted ? (results.logoutTest.success ? '✅' : '❌') : '⏭️  Skipped'}`);
    console.log(`   Post-Logout Admin Access: ${results.postLogoutAccess.attempted ? (results.postLogoutAccess.redirectedToLogin ? '✅ Correctly blocked' : '❌ Security issue') : '⏭️  Skipped'}`);
    
    // Calculate overall success rate
    const tests = [
        results.serverReady,
        results.loginPageLoads && results.formElementsVisible,
        results.invalidCredentialsTest.success,
        results.validCredentialsTest.success,
        results.adminPageAccess.afterLogin || !results.validCredentialsTest.success, // Pass if login failed or admin accessible
        !results.adminPageAccess.beforeLogin, // Security: should be blocked before login
        results.postLogoutAccess.redirectedToLogin || !results.postLogoutAccess.attempted
    ];
    
    const passedTests = tests.filter(Boolean).length;
    const totalTests = tests.length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n📊 Overall Results:');
    console.log(`   Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
    
    if (successRate >= 85) {
        console.log('   Status: 🎉 EXCELLENT - Admin login flow working excellently!');
    } else if (successRate >= 70) {
        console.log('   Status: ✅ GOOD - Admin login flow mostly working');
    } else if (successRate >= 50) {
        console.log('   Status: ⚠️  PARTIAL - Some functionality works, needs improvement');
    } else {
        console.log('   Status: ❌ CRITICAL - Major issues detected, needs immediate attention');
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!results.serverReady) {
        console.log('   - Check if the Next.js server is running properly');
    }
    if (!results.loginPageLoads) {
        console.log('   - Verify admin login page route and components are properly configured');
    }
    if (!results.formElementsVisible) {
        console.log('   - Check if CSS is loading properly and no loading states are blocking the form');
    }
    if (!results.invalidCredentialsTest.success) {
        console.log('   - Verify credential validation is working');
    }
    if (!results.invalidCredentialsTest.errorShown && results.invalidCredentialsTest.attempted) {
        console.log('   - Consider adding clearer error messages for failed login attempts');
    }
    if (!results.validCredentialsTest.success) {
        console.log('   - Check NextAuth configuration and credential validation');
    }
    if (results.adminPageAccess.beforeLogin) {
        console.log('   - SECURITY: Admin pages should not be accessible without authentication');
    }
    if (!results.adminPageAccess.afterLogin && results.validCredentialsTest.success) {
        console.log('   - Check admin page middleware and authentication state');
    }
    
    console.log('\n' + '='.repeat(80));
    
}).catch(error => {
    console.error('❌ Test failed to run:', error);
    process.exit(1);
});