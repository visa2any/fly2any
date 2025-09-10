const { chromium } = require('playwright');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 30000;
const SCREENSHOT_DIR = './test-screenshots/communication-center';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Communication Center interfaces to test
const INTERFACES = [
    { path: '/admin/omnichannel/modern', name: 'Modern Omnichannel Interface' },
    { path: '/admin/omnichannel', name: 'Standard Omnichannel Interface' },
    { path: '/admin/omnichannel/premium', name: 'Premium Interface' },
    { path: '/admin/omnichannel/styled', name: 'Styled Interface' },
    { path: '/admin/omnichannel-test', name: 'Test Interface' },
    { path: '/omnichannel-direct', name: 'Direct Access Interface' }
];

// Test results storage
const testResults = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    interfaces: {},
    navigation: {},
    audit: {},
    summary: {}
};

async function runCommunicationCenterTests() {
    console.log('🚀 Starting Communication Center Comprehensive Test Suite');
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`📊 Testing ${INTERFACES.length} interfaces`);

    const browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    const page = await context.newPage();

    try {
        // Test each interface
        for (const interface of INTERFACES) {
            console.log(`\n🔍 Testing: ${interface.name} (${interface.path})`);
            
            const interfaceResults = {
                name: interface.name,
                path: interface.path,
                accessible: false,
                loadTime: 0,
                errors: [],
                warnings: [],
                elements: {},
                screenshots: []
            };

            // Monitor console messages and errors
            const consoleErrors = [];
            
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push({
                        type: msg.type(),
                        text: msg.text(),
                        location: msg.location()
                    });
                }
            });

            page.on('pageerror', error => {
                interfaceResults.errors.push({
                    type: 'JavaScript Error',
                    message: error.message,
                    stack: error.stack
                });
            });

            try {
                const startTime = Date.now();
                
                // Navigate to interface
                console.log(`📂 Navigating to: ${BASE_URL}${interface.path}`);
                await page.goto(`${BASE_URL}${interface.path}`, { 
                    waitUntil: 'networkidle',
                    timeout: TIMEOUT 
                });

                const loadTime = Date.now() - startTime;
                interfaceResults.loadTime = loadTime;
                interfaceResults.accessible = true;

                console.log(`✅ Interface loaded in ${loadTime}ms`);

                // Wait for potential React/Next.js hydration
                await page.waitForTimeout(2000);

                // Take initial screenshot
                const initialScreenshot = `${SCREENSHOT_DIR}/${interface.path.replace(/\//g, '_')}_initial.png`;
                await page.screenshot({ 
                    path: initialScreenshot, 
                    fullPage: true 
                });
                interfaceResults.screenshots.push({
                    type: 'initial',
                    path: initialScreenshot,
                    description: 'Initial page load'
                });

                // Check page title and basic structure
                const title = await page.title();
                console.log(`📄 Page title: "${title}"`);
                interfaceResults.elements.title = title;

                // Test main interface elements
                const elementChecks = [
                    { selector: 'body', name: 'Body element' },
                    { selector: 'main', name: 'Main content area' },
                    { selector: 'nav', name: 'Navigation element' },
                    { selector: '[role="main"]', name: 'Main role element' },
                    { selector: 'h1, h2, h3', name: 'Heading elements' },
                    { selector: 'button', name: 'Interactive buttons' },
                    { selector: 'input', name: 'Input elements' },
                    { selector: '[data-testid]', name: 'Test ID elements' },
                    { selector: '.communication-center, .omnichannel, .chat-interface', name: 'Communication interface elements' }
                ];

                for (const check of elementChecks) {
                    try {
                        const elements = await page.$$(check.selector);
                        const count = elements.length;
                        interfaceResults.elements[check.name] = {
                            selector: check.selector,
                            count: count,
                            found: count > 0
                        };
                        
                        if (count > 0) {
                            console.log(`✅ Found ${count} ${check.name}`);
                        } else {
                            console.log(`⚠️  No ${check.name} found`);
                            interfaceResults.warnings.push(`No ${check.name} found with selector: ${check.selector}`);
                        }
                    } catch (error) {
                        interfaceResults.warnings.push(`Error checking ${check.name}: ${error.message}`);
                    }
                }

                // Test specific Communication Center features
                console.log('🧪 Testing Communication Center specific features...');
                
                const communicationFeatures = [
                    { selector: '[data-channel="whatsapp"]', name: 'WhatsApp Integration' },
                    { selector: '[data-channel="email"]', name: 'Email Integration' },
                    { selector: '[data-channel="chat"]', name: 'Chat Interface' },
                    { selector: '[data-channel="phone"]', name: 'Phone Integration' },
                    { selector: '[data-channel="social"]', name: 'Social Media Integration' },
                    { selector: '.conversation-list, .chat-list', name: 'Conversation List' },
                    { selector: '.customer-profile, .customer-360', name: 'Customer 360 View' },
                    { selector: '.ai-assistant, .ai-suggestions', name: 'AI Assistant Features' },
                    { selector: '.analytics-dashboard', name: 'Analytics Dashboard' },
                    { selector: '.workflow-automation', name: 'Workflow Automation' }
                ];

                for (const feature of communicationFeatures) {
                    try {
                        const elements = await page.$$(feature.selector);
                        const count = elements.length;
                        interfaceResults.elements[`Feature: ${feature.name}`] = {
                            selector: feature.selector,
                            count: count,
                            found: count > 0
                        };
                        
                        if (count > 0) {
                            console.log(`✅ ${feature.name}: Found ${count} elements`);
                        }
                    } catch (error) {
                        interfaceResults.warnings.push(`Error checking ${feature.name}: ${error.message}`);
                    }
                }

                // Test interactivity
                console.log('🖱️  Testing interactive elements...');
                
                // Look for clickable elements
                const clickableElements = await page.$$('button:not(:disabled), a[href], [role="button"]');
                interfaceResults.elements['Interactive Elements'] = {
                    selector: 'button, a[href], [role="button"]',
                    count: clickableElements.length,
                    found: clickableElements.length > 0
                };

                // Test clicking the first few buttons (safely)
                if (clickableElements.length > 0) {
                    console.log(`Found ${clickableElements.length} interactive elements`);
                    
                    // Test first button click
                    try {
                        const firstButton = clickableElements[0];
                        const buttonText = await firstButton.innerText().catch(() => 'No text');
                        console.log(`🖱️  Testing click on: "${buttonText}"`);
                        
                        await firstButton.click();
                        await page.waitForTimeout(1000); // Wait for any response
                        
                        // Take screenshot after interaction
                        const interactionScreenshot = `${SCREENSHOT_DIR}/${interface.path.replace(/\//g, '_')}_interaction.png`;
                        await page.screenshot({ 
                            path: interactionScreenshot, 
                            fullPage: true 
                        });
                        interfaceResults.screenshots.push({
                            type: 'interaction',
                            path: interactionScreenshot,
                            description: `After clicking: ${buttonText}`
                        });
                        
                    } catch (error) {
                        interfaceResults.warnings.push(`Error testing button interaction: ${error.message}`);
                    }
                }

                // Check for loading states and spinners
                const loadingElements = await page.$$('[aria-label*="loading"], .loading, .spinner, [data-loading="true"]');
                if (loadingElements.length > 0) {
                    console.log(`⏳ Found ${loadingElements.length} loading indicators`);
                    interfaceResults.elements['Loading Indicators'] = {
                        count: loadingElements.length,
                        found: true
                    };
                }

                // Record console errors
                interfaceResults.errors.push(...consoleErrors.map(err => ({
                    type: 'Console Error',
                    message: err.text,
                    location: err.location
                })));

                if (consoleErrors.length > 0) {
                    console.log(`❌ Found ${consoleErrors.length} console errors`);
                } else {
                    console.log(`✅ No console errors detected`);
                }

                console.log(`✅ Interface test completed: ${interface.name}`);

            } catch (error) {
                interfaceResults.accessible = false;
                interfaceResults.errors.push({
                    type: 'Navigation Error',
                    message: error.message,
                    stack: error.stack
                });
                console.log(`❌ Interface test failed: ${interface.name} - ${error.message}`);

                // Take error screenshot
                try {
                    const errorScreenshot = `${SCREENSHOT_DIR}/${interface.path.replace(/\//g, '_')}_error.png`;
                    await page.screenshot({ 
                        path: errorScreenshot, 
                        fullPage: true 
                    });
                    interfaceResults.screenshots.push({
                        type: 'error',
                        path: errorScreenshot,
                        description: 'Error state'
                    });
                } catch (screenshotError) {
                    console.log('Could not take error screenshot');
                }
            }

            // Store results
            testResults.interfaces[interface.path] = interfaceResults;
            
            // Clear console errors for next test
            consoleErrors.length = 0;
        }

        // Cross-interface navigation test
        console.log('\n🔄 Testing cross-interface navigation...');
        
        const navigationResults = {
            successful: [],
            failed: [],
            loadTimes: {}
        };

        for (const interface of INTERFACES) {
            try {
                const startTime = Date.now();
                await page.goto(`${BASE_URL}${interface.path}`, { 
                    waitUntil: 'networkidle',
                    timeout: TIMEOUT 
                });
                const loadTime = Date.now() - startTime;
                
                navigationResults.successful.push(interface.path);
                navigationResults.loadTimes[interface.path] = loadTime;
                console.log(`✅ Navigation to ${interface.path}: ${loadTime}ms`);
                
                await page.waitForTimeout(500); // Brief pause between navigations
            } catch (error) {
                navigationResults.failed.push({
                    path: interface.path,
                    error: error.message
                });
                console.log(`❌ Navigation failed to ${interface.path}: ${error.message}`);
            }
        }

        testResults.navigation = navigationResults;

        // Performance and accessibility audit
        console.log('\n📊 Running performance and accessibility audit...');
        
        const auditResults = {
            performance: {},
            accessibility: {},
            recommendations: []
        };

        // Test the main modern interface for detailed performance
        const mainInterface = INTERFACES[0]; // Modern interface
        
        try {
            console.log(`🔍 Auditing: ${mainInterface.name}`);
            
            const startTime = Date.now();
            await page.goto(`${BASE_URL}${mainInterface.path}`, { 
                waitUntil: 'networkidle',
                timeout: TIMEOUT 
            });
            const totalLoadTime = Date.now() - startTime;
            
            auditResults.performance.totalLoadTime = totalLoadTime;
            
            // Check for accessibility attributes
            const accessibilityChecks = [
                { selector: '[aria-label]', name: 'ARIA Labels' },
                { selector: '[role]', name: 'ARIA Roles' },
                { selector: 'img[alt]', name: 'Image Alt Text' },
                { selector: 'button[aria-describedby]', name: 'Button Descriptions' },
                { selector: '[tabindex]', name: 'Tab Index' },
                { selector: 'input[aria-label], input[aria-labelledby]', name: 'Input Labels' }
            ];

            for (const check of accessibilityChecks) {
                const elements = await page.$$(check.selector);
                auditResults.accessibility[check.name] = {
                    count: elements.length,
                    present: elements.length > 0
                };
            }

            // Check for semantic HTML
            const semanticElements = await page.$$('main, nav, section, article, aside, header, footer');
            auditResults.accessibility['Semantic HTML'] = {
                count: semanticElements.length,
                present: semanticElements.length > 0
            };

            // Performance recommendations
            if (totalLoadTime > 3000) {
                auditResults.recommendations.push('Consider optimizing load time - currently over 3 seconds');
            }
            
            if (auditResults.accessibility['ARIA Labels'].count === 0) {
                auditResults.recommendations.push('Add ARIA labels for better accessibility');
            }

        } catch (error) {
            auditResults.error = error.message;
            console.log(`❌ Audit failed: ${error.message}`);
        }

        testResults.audit = auditResults;

    } finally {
        await browser.close();
    }

    // Generate summary
    console.log('\n📝 Generating comprehensive test report...');
    
    const totalInterfaces = INTERFACES.length;
    const accessibleInterfaces = Object.values(testResults.interfaces).filter(i => i.accessible).length;
    const totalErrors = Object.values(testResults.interfaces).reduce((sum, i) => sum + i.errors.length, 0);
    const totalWarnings = Object.values(testResults.interfaces).reduce((sum, i) => sum + i.warnings.length, 0);

    testResults.summary = {
        totalInterfaces,
        accessibleInterfaces,
        accessibilityRate: `${((accessibleInterfaces / totalInterfaces) * 100).toFixed(1)}%`,
        totalErrors,
        totalWarnings,
        testCompleted: new Date().toISOString()
    };

    // Generate detailed report
    const reportPath = './COMMUNICATION_CENTER_TEST_REPORT.md';
    const report = generateMarkdownReport(testResults);
    
    fs.writeFileSync(reportPath, report);
    fs.writeFileSync('./communication-center-test-results.json', JSON.stringify(testResults, null, 2));
    
    console.log(`\n✅ Test completed!`);
    console.log(`📊 Results: ${accessibleInterfaces}/${totalInterfaces} interfaces accessible`);
    console.log(`📝 Detailed report: ${reportPath}`);
    console.log(`📈 Raw data: ./communication-center-test-results.json`);

    return testResults;
}

function generateMarkdownReport(results) {
    const { interfaces, navigation, audit, summary } = results;
    
    return `# 🚀 Communication Center - Comprehensive Test Report

## 📊 Executive Summary

**Test Date:** ${new Date(results.timestamp).toLocaleString()}  
**Base URL:** ${results.baseUrl}  
**Total Interfaces Tested:** ${summary.totalInterfaces}  
**Accessibility Rate:** ${summary.accessibilityRate}  
**Total Errors:** ${summary.totalErrors}  
**Total Warnings:** ${summary.totalWarnings}  

### 🎯 Production Readiness Assessment

${summary.accessibilityRate === '100.0%' ? 
    '✅ **PRODUCTION READY** - All interfaces are accessible' : 
    `⚠️  **NEEDS ATTENTION** - ${summary.totalInterfaces - summary.accessibleInterfaces} interface(s) have issues`}

---

## 🔍 Interface Testing Results

${Object.entries(interfaces).map(([path, data]) => `
### ${data.name}
**Path:** \`${path}\`  
**Status:** ${data.accessible ? '✅ Accessible' : '❌ Not Accessible'}  
**Load Time:** ${data.loadTime}ms  
**Errors:** ${data.errors.length}  
**Warnings:** ${data.warnings.length}  

#### 🧩 Elements Found
${Object.entries(data.elements).map(([name, element]) => 
    `- **${name}:** ${element.found ? `✅ ${element.count} found` : '❌ Not found'}`
).join('\n')}

${data.errors.length > 0 ? `
#### ❌ Errors
${data.errors.map(err => `- **${err.type}:** ${err.message}`).join('\n')}
` : ''}

${data.warnings.length > 0 ? `
#### ⚠️ Warnings
${data.warnings.map(warning => `- ${warning}`).join('\n')}
` : ''}

${data.screenshots.length > 0 ? `
#### 📸 Screenshots
${data.screenshots.map(screenshot => `- **${screenshot.type}:** ${screenshot.description} - \`${screenshot.path}\``).join('\n')}
` : ''}
`).join('\n')}

---

## 🔄 Navigation Testing

${navigation ? `
**Successful Navigation:** ${navigation.successful.length}/${INTERFACES.length} interfaces  
**Failed Navigation:** ${navigation.failed.length} interfaces  

### ⚡ Load Times
${Object.entries(navigation.loadTimes || {}).map(([path, time]) => 
    `- \`${path}\`: ${time}ms`
).join('\n')}

${navigation.failed.length > 0 ? `
### ❌ Failed Navigations
${navigation.failed.map(fail => `- \`${fail.path}\`: ${fail.error}`).join('\n')}
` : ''}
` : 'Navigation testing not completed'}

---

## 📈 Performance & Accessibility Audit

${audit ? `
### ⚡ Performance
- **Total Load Time:** ${audit.performance?.totalLoadTime || 'Not measured'}ms
- **Performance Status:** ${audit.performance?.totalLoadTime > 3000 ? '⚠️ Slow' : '✅ Good'}

### ♿ Accessibility Features
${Object.entries(audit.accessibility || {}).map(([feature, data]) => 
    `- **${feature}:** ${data.present ? `✅ Present (${data.count})` : '❌ Missing'}`
).join('\n')}

### 💡 Recommendations
${(audit.recommendations || []).map(rec => `- ${rec}`).join('\n') || 'No specific recommendations'}
` : 'Audit not completed'}

---

## 🏁 Production Readiness Checklist

### ✅ Functional Requirements
- [${summary.accessibleInterfaces === summary.totalInterfaces ? 'x' : ' '}] All interfaces are accessible
- [${summary.totalErrors === 0 ? 'x' : ' '}] No JavaScript errors
- [${navigation?.successful?.length === INTERFACES.length ? 'x' : ' '}] All navigation paths work

### ⚡ Performance Requirements  
- [${audit?.performance?.totalLoadTime <= 3000 ? 'x' : ' '}] Load time under 3 seconds
- [ ] Network requests optimized
- [ ] Image optimization verified

### ♿ Accessibility Requirements
- [${audit?.accessibility?.['ARIA Labels']?.present ? 'x' : ' '}] ARIA labels present
- [${audit?.accessibility?.['Semantic HTML']?.present ? 'x' : ' '}] Semantic HTML structure
- [${audit?.accessibility?.['Image Alt Text']?.present ? 'x' : ' '}] Images have alt text

### 🔧 Technical Requirements
- [ ] Error handling implemented
- [ ] Loading states present
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility verified

---

## 📋 Next Steps

### 🚨 Critical Issues to Address
${summary.totalErrors > 0 ? `- Fix ${summary.totalErrors} JavaScript errors` : ''}
${summary.accessibleInterfaces < summary.totalInterfaces ? `- Fix ${summary.totalInterfaces - summary.accessibleInterfaces} inaccessible interface(s)` : ''}

### 🔧 Improvements to Consider
${summary.totalWarnings > 0 ? `- Address ${summary.totalWarnings} warnings` : ''}
${audit?.recommendations?.length > 0 ? audit.recommendations.map(rec => `- ${rec}`).join('\n') : ''}

### 🧪 Additional Testing Recommended
- Mobile device testing
- Cross-browser compatibility testing  
- Load testing under high traffic
- Integration testing with real data
- User acceptance testing

---

**Generated on:** ${new Date().toLocaleString()}  
**Test Framework:** Playwright Standalone  
**Report Version:** 1.0
`;
}

// Run the tests
runCommunicationCenterTests().catch(console.error);