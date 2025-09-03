const { chromium } = require('playwright');

async function testAPILogin() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const results = {
        serverReady: false,
        sessionAPIWorks: false,
        invalidLogin: { attempted: false, success: false },
        validLogin: { attempted: false, success: false },
        adminPageAccess: { beforeLogin: false, afterLogin: false },
        postLogoutAccess: false
    };
    
    try {
        console.log('🚀 Testing Admin Login via API Calls...\n');
        
        // Step 1: Check server
        console.log('1. Testing server readiness...');
        const homeResponse = await page.request.get('http://localhost:3000/');
        results.serverReady = homeResponse.ok();
        console.log(`   Home page: ${homeResponse.status()}`);
        
        // Step 2: Test session endpoint
        console.log('\n2. Testing session API...');
        const sessionResponse = await page.request.get('http://localhost:3000/api/auth/session');
        results.sessionAPIWorks = sessionResponse.ok();
        console.log(`   Session API: ${sessionResponse.status()}`);
        
        const sessionData = await sessionResponse.json();
        console.log('   Session data:', sessionData);
        
        // Step 3: Test admin access before login
        console.log('\n3. Testing /admin access before login...');
        try {
            const adminResponse = await page.request.get('http://localhost:3000/admin');
            console.log(`   Admin page status: ${adminResponse.status()}`);
            
            if (adminResponse.status() === 307 || adminResponse.status() === 302) {
                const location = adminResponse.headers()['location'];
                console.log(`   Redirected to: ${location}`);
                results.adminPageAccess.beforeLogin = location && location.includes('/admin/login');
            } else if (adminResponse.ok()) {
                results.adminPageAccess.beforeLogin = false; // Security issue if accessible
                console.log('   ⚠️ Admin page accessible without login!');
            }
        } catch (error) {
            console.log(`   Admin access error: ${error.message}`);
        }
        
        // Step 4: Test invalid credentials
        console.log('\n4. Testing invalid credentials via API...');
        results.invalidLogin.attempted = true;
        
        try {
            // Try to get CSRF token first
            const csrfResponse = await page.request.get('http://localhost:3000/api/auth/csrf');
            const csrfData = await csrfResponse.json();
            console.log('   CSRF token obtained:', !!csrfData.csrfToken);
            
            const invalidLoginResponse = await page.request.post('http://localhost:3000/api/auth/signin/credentials', {
                data: {
                    email: 'wrong@test.com',
                    password: 'wrongpass',
                    csrfToken: csrfData.csrfToken,
                    callbackUrl: 'http://localhost:3000/admin'
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            console.log(`   Invalid login response: ${invalidLoginResponse.status()}`);
            
            if (invalidLoginResponse.status() === 302 || invalidLoginResponse.status() === 307) {
                const location = invalidLoginResponse.headers()['location'];
                console.log(`   Redirected to: ${location}`);
                results.invalidLogin.success = location && location.includes('/admin/login');
            } else {
                console.log('   Unexpected response for invalid credentials');
            }
        } catch (error) {
            console.log(`   Invalid login error: ${error.message}`);
        }
        
        // Step 5: Test valid credentials
        console.log('\n5. Testing valid credentials via API...');
        results.validLogin.attempted = true;
        
        try {
            const validLoginResponse = await page.request.post('http://localhost:3000/api/auth/signin/credentials', {
                data: {
                    email: 'admin@fly2any.com',
                    password: 'fly2any2024!',
                    csrfToken: csrfData.csrfToken,
                    callbackUrl: 'http://localhost:3000/admin'
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            console.log(`   Valid login response: ${validLoginResponse.status()}`);
            
            if (validLoginResponse.status() === 302 || validLoginResponse.status() === 307) {
                const location = validLoginResponse.headers()['location'];
                console.log(`   Redirected to: ${location}`);
                results.validLogin.success = location && (location.includes('/admin') || location.includes('callback'));
            } else {
                console.log('   Unexpected response for valid credentials');
            }
            
            // Check session after login
            const newSessionResponse = await page.request.get('http://localhost:3000/api/auth/session');
            const newSessionData = await newSessionResponse.json();
            console.log('   Session after login:', newSessionData);
            
            if (newSessionData.user) {
                console.log('   ✅ User session established');
                console.log('   User info:', newSessionData.user);
            }
        } catch (error) {
            console.log(`   Valid login error: ${error.message}`);
        }
        
        // Step 6: Test admin page access after login
        console.log('\n6. Testing /admin access after login...');
        try {
            const adminAfterLoginResponse = await page.request.get('http://localhost:3000/admin');
            console.log(`   Admin page after login: ${adminAfterLoginResponse.status()}`);
            
            if (adminAfterLoginResponse.ok()) {
                results.adminPageAccess.afterLogin = true;
                console.log('   ✅ Admin page accessible after login');
            } else if (adminAfterLoginResponse.status() === 302 || adminAfterLoginResponse.status() === 307) {
                const location = adminAfterLoginResponse.headers()['location'];
                console.log(`   Still redirected to: ${location}`);
            }
        } catch (error) {
            console.log(`   Admin access after login error: ${error.message}`);
        }
        
        // Step 7: Test logout
        console.log('\n7. Testing logout...');
        try {
            const logoutResponse = await page.request.post('http://localhost:3000/api/auth/signout', {
                data: {
                    csrfToken: csrfData.csrfToken
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            console.log(`   Logout response: ${logoutResponse.status()}`);
            
            // Check session after logout
            const sessionAfterLogout = await page.request.get('http://localhost:3000/api/auth/session');
            const sessionLogoutData = await sessionAfterLogout.json();
            console.log('   Session after logout:', sessionLogoutData);
            
            // Test admin access after logout
            const adminAfterLogout = await page.request.get('http://localhost:3000/admin');
            console.log(`   Admin access after logout: ${adminAfterLogout.status()}`);
            
            if (adminAfterLogout.status() === 302 || adminAfterLogout.status() === 307) {
                const location = adminAfterLogout.headers()['location'];
                console.log(`   Correctly redirected to: ${location}`);
                results.postLogoutAccess = location && location.includes('/admin/login');
            }
            
        } catch (error) {
            console.log(`   Logout error: ${error.message}`);
        }
        
    } catch (error) {
        console.log('❌ General test error:', error.message);
    } finally {
        await browser.close();
    }
    
    // Print results
    console.log('\n' + '='.repeat(80));
    console.log('📋 API AUTHENTICATION TEST REPORT');
    console.log('='.repeat(80));
    
    console.log('\n🌐 Basic Connectivity:');
    console.log(`   Server Ready: ${results.serverReady ? '✅' : '❌'}`);
    console.log(`   Session API Works: ${results.sessionAPIWorks ? '✅' : '❌'}`);
    
    console.log('\n🔐 Authentication Flow:');
    console.log(`   Invalid Credentials: ${results.invalidLogin.attempted ? (results.invalidLogin.success ? '✅ Correctly rejected' : '❌ Should be rejected') : '⏭️ Skipped'}`);
    console.log(`   Valid Credentials: ${results.validLogin.attempted ? (results.validLogin.success ? '✅ Accepted' : '❌ Should be accepted') : '⏭️ Skipped'}`);
    
    console.log('\n🏠 Access Control:');
    console.log(`   Admin Blocked Before Login: ${results.adminPageAccess.beforeLogin ? '✅' : '❌ Security issue'}`);
    console.log(`   Admin Accessible After Login: ${results.adminPageAccess.afterLogin ? '✅' : '❌'}`);
    console.log(`   Admin Blocked After Logout: ${results.postLogoutAccess ? '✅' : '❌ Security issue'}`);
    
    const totalTests = 6;
    const passedTests = [
        results.serverReady,
        results.sessionAPIWorks,
        results.invalidLogin.success,
        results.validLogin.success,
        results.adminPageAccess.afterLogin,
        results.postLogoutAccess
    ].filter(Boolean).length;
    
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n📊 Overall Results:');
    console.log(`   Success Rate: ${successRate}% (${passedTests}/${totalTests} tests passed)`);
    
    if (successRate >= 80) {
        console.log('   Status: 🎉 EXCELLENT - Authentication system working well!');
    } else if (successRate >= 60) {
        console.log('   Status: ⚠️ GOOD - Most functionality works, minor issues');
    } else {
        console.log('   Status: ❌ NEEDS ATTENTION - Major authentication issues');
    }
    
    console.log('\n' + '='.repeat(80));
}

testAPILogin().catch(console.error);