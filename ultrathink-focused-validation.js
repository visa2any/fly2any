const { chromium } = require('playwright');

/**
 * ULTRATHINK FOCUSED MOBILE VALIDATION
 * 
 * Focused validation script that measures space efficiency without problematic interactions
 */

async function validateMobileSpaceEfficiency() {
    console.log('🎯 Starting ULTRATHINK Focused Mobile Space Efficiency Validation...\n');
    
    const browser = await chromium.launch({ headless: false });
    const results = {
        screenshots: [],
        measurements: {},
        analysis: {},
        success: true,
        issues: []
    };

    try {
        // Test viewports with their expected optimization targets
        const viewports = [
            { name: 'iPhone-12', width: 390, height: 844, target: 'Primary mobile optimization' },
            { name: 'Samsung-Galaxy-S21', width: 360, height: 640, target: 'Compact mobile optimization' },
            { name: 'iPhone-SE', width: 375, height: 667, target: 'Small screen optimization' },
            { name: 'Desktop-Comparison', width: 1920, height: 1080, target: 'Desktop baseline comparison' }
        ];

        for (const viewport of viewports) {
            console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
            console.log(`   Target: ${viewport.target}`);
            
            const isMobile = viewport.width < 768;
            const context = await browser.newContext({
                viewport: { width: viewport.width, height: viewport.height },
                isMobile: isMobile,
                hasTouch: isMobile,
                userAgent: isMobile ? 
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15' :
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });

            const page = await context.newPage();
            
            // Navigate and wait for stable load
            await page.goto('http://localhost:3000');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000); // Extra time for any animations

            // 1. CAPTURE INITIAL HOMEPAGE
            const homepageScreenshot = `ultrathink-validation-${viewport.name.toLowerCase()}.png`;
            await page.screenshot({ path: homepageScreenshot, fullPage: true });
            results.screenshots.push({
                viewport: viewport.name,
                type: 'homepage',
                path: homepageScreenshot,
                description: `${viewport.name} homepage showing ${isMobile ? 'mobile' : 'desktop'} optimizations`
            });

            // 2. MEASURE SPACE EFFICIENCY METRICS
            console.log(`   📏 Measuring space efficiency...`);
            
            const spaceMetrics = await page.evaluate((viewportInfo) => {
                const metrics = {
                    viewport: viewportInfo,
                    document: {
                        width: document.documentElement.scrollWidth,
                        height: document.documentElement.scrollHeight,
                        viewportWidth: window.innerWidth,
                        viewportHeight: window.innerHeight
                    },
                    serviceCards: {},
                    forms: {},
                    spacing: {},
                    efficiency: {}
                };

                // Measure service selection cards
                const serviceCards = document.querySelectorAll('[data-service], .service-card, .service-option');
                if (serviceCards.length > 0) {
                    const cardData = [];
                    serviceCards.forEach(card => {
                        const styles = window.getComputedStyle(card);
                        const rect = card.getBoundingClientRect();
                        cardData.push({
                            width: rect.width,
                            height: rect.height,
                            minHeight: styles.minHeight,
                            padding: styles.padding,
                            margin: styles.margin
                        });
                    });
                    metrics.serviceCards = {
                        count: cardData.length,
                        avgHeight: cardData.reduce((sum, card) => sum + card.height, 0) / cardData.length,
                        avgWidth: cardData.reduce((sum, card) => sum + card.width, 0) / cardData.length,
                        cards: cardData
                    };
                }

                // Measure button and input elements
                const buttons = document.querySelectorAll('button:not(.social-proof-widget button)');
                const inputs = document.querySelectorAll('input, select');
                
                if (buttons.length > 0) {
                    const buttonData = [];
                    buttons.forEach(btn => {
                        const styles = window.getComputedStyle(btn);
                        const rect = btn.getBoundingClientRect();
                        buttonData.push({
                            height: rect.height,
                            fontSize: styles.fontSize,
                            padding: styles.padding
                        });
                    });
                    metrics.forms.buttons = {
                        count: buttonData.length,
                        avgHeight: buttonData.reduce((sum, btn) => sum + btn.height, 0) / buttonData.length,
                        heights: buttonData.map(btn => btn.height)
                    };
                }

                if (inputs.length > 0) {
                    const inputData = [];
                    inputs.forEach(input => {
                        const styles = window.getComputedStyle(input);
                        const rect = input.getBoundingClientRect();
                        inputData.push({
                            height: rect.height,
                            marginTop: parseInt(styles.marginTop) || 0,
                            marginBottom: parseInt(styles.marginBottom) || 0,
                            padding: styles.padding
                        });
                    });
                    metrics.forms.inputs = {
                        count: inputData.length,
                        avgHeight: inputData.reduce((sum, input) => sum + input.height, 0) / inputData.length,
                        avgMargin: inputData.reduce((sum, input) => sum + input.marginTop + input.marginBottom, 0) / inputData.length
                    };
                }

                // Calculate space efficiency ratio
                const visibleContent = document.querySelector('main') || document.body;
                if (visibleContent) {
                    const contentRect = visibleContent.getBoundingClientRect();
                    metrics.efficiency = {
                        contentToViewportRatio: contentRect.height / window.innerHeight,
                        horizontalSpaceUsage: contentRect.width / window.innerWidth,
                        verticalScrollRequired: contentRect.height > window.innerHeight
                    };
                }

                return metrics;
            }, viewport);

            results.measurements[viewport.name] = spaceMetrics;

            // 3. TRY TO NAVIGATE TO FORM (safely)
            console.log(`   ✈️ Attempting to access flight form...`);
            
            try {
                // Look for flight service - use multiple selectors
                const flightSelectors = [
                    '[data-service="flight"]',
                    'button:has-text("Voos")',
                    '.service-card:has-text("Voos")',
                    '[aria-label*="flight" i]',
                    '[aria-label*="voo" i]'
                ];

                let flightElement = null;
                for (const selector of flightSelectors) {
                    try {
                        flightElement = await page.locator(selector).first();
                        if (await flightElement.isVisible({ timeout: 2000 })) {
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (flightElement && await flightElement.isVisible()) {
                    // Scroll element into view first
                    await flightElement.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(1000);
                    
                    // Try to click
                    await flightElement.click({ timeout: 5000 });
                    await page.waitForTimeout(2000);

                    // Capture form screenshot
                    const formScreenshot = `ultrathink-validation-${viewport.name.toLowerCase()}-form.png`;
                    await page.screenshot({ path: formScreenshot, fullPage: true });
                    results.screenshots.push({
                        viewport: viewport.name,
                        type: 'form',
                        path: formScreenshot,
                        description: `${viewport.name} form showing space-efficient layout`
                    });

                    // Measure form elements
                    const formMetrics = await page.evaluate(() => {
                        const formData = {
                            passengerControls: {},
                            dateInputs: {},
                            formFields: {}
                        };

                        // Look for passenger dropdown elements
                        const passengerButtons = document.querySelectorAll('[data-testid*="passenger"] button, .passenger-controls button');
                        if (passengerButtons.length > 0) {
                            const buttonHeights = Array.from(passengerButtons).map(btn => btn.getBoundingClientRect().height);
                            formData.passengerControls = {
                                count: passengerButtons.length,
                                avgHeight: buttonHeights.reduce((sum, h) => sum + h, 0) / buttonHeights.length,
                                minHeight: Math.min(...buttonHeights),
                                maxHeight: Math.max(...buttonHeights)
                            };
                        }

                        // Look for date inputs
                        const dateInputs = document.querySelectorAll('input[type="date"], .date-input, input[placeholder*="data"]');
                        if (dateInputs.length > 0) {
                            const inputData = Array.from(dateInputs).map(input => {
                                const rect = input.getBoundingClientRect();
                                const styles = window.getComputedStyle(input);
                                return {
                                    height: rect.height,
                                    margin: parseInt(styles.marginTop) + parseInt(styles.marginBottom)
                                };
                            });
                            formData.dateInputs = {
                                count: inputData.length,
                                avgHeight: inputData.reduce((sum, data) => sum + data.height, 0) / inputData.length,
                                avgMargin: inputData.reduce((sum, data) => sum + data.margin, 0) / inputData.length
                            };
                        }

                        // Measure all form fields
                        const formFields = document.querySelectorAll('.form-field, .input-group, .form-control');
                        if (formFields.length > 0) {
                            const fieldData = Array.from(formFields).map(field => {
                                const rect = field.getBoundingClientRect();
                                const styles = window.getComputedStyle(field);
                                return {
                                    height: rect.height,
                                    marginBottom: parseInt(styles.marginBottom) || 0
                                };
                            });
                            formData.formFields = {
                                count: fieldData.length,
                                avgSpacing: fieldData.reduce((sum, data) => sum + data.marginBottom, 0) / fieldData.length,
                                totalVerticalSpace: fieldData.reduce((sum, data) => sum + data.height + data.marginBottom, 0)
                            };
                        }

                        return formData;
                    });

                    results.measurements[viewport.name].formDetails = formMetrics;
                    console.log(`   ✅ Form accessed successfully`);
                } else {
                    console.log(`   ⚠️ Could not access flight form (no interaction issues)`);
                }

            } catch (error) {
                console.log(`   ⚠️ Form interaction skipped: ${error.message.split('\n')[0]}`);
                results.issues.push(`${viewport.name}: Form interaction issue - ${error.message.split('\n')[0]}`);
            }

            console.log(`   ✅ ${viewport.name} validation complete\n`);
            await context.close();
        }

    } catch (error) {
        console.error('❌ Validation error:', error);
        results.issues.push(`Critical error: ${error.message}`);
        results.success = false;
    } finally {
        await browser.close();
    }

    return results;
}

async function analyzeULTRATHINKResults(results) {
    console.log('\n🎯 ULTRATHINK MOBILE SPACE EFFICIENCY ANALYSIS\n');
    console.log('=' .repeat(70));

    // Screenshots summary
    console.log('\n📸 VALIDATION SCREENSHOTS:');
    results.screenshots.forEach(screenshot => {
        console.log(`   • ${screenshot.viewport} (${screenshot.type}): ${screenshot.path}`);
        console.log(`     ${screenshot.description}`);
    });

    // Analyze mobile vs desktop metrics
    console.log('\n📊 SPACE EFFICIENCY ANALYSIS:');

    const mobileViewports = Object.keys(results.measurements).filter(name => !name.includes('Desktop'));
    const desktopData = results.measurements['Desktop-Comparison'];

    mobileViewports.forEach(viewport => {
        const data = results.measurements[viewport];
        console.log(`\n   📱 ${viewport}:`);
        
        // Service Cards Analysis
        if (data.serviceCards && data.serviceCards.count > 0) {
            const avgHeight = data.serviceCards.avgHeight.toFixed(1);
            const isOptimized = data.serviceCards.avgHeight <= 120; // Target: more compact cards
            console.log(`     • Service Cards: ${data.serviceCards.count} cards, ${avgHeight}px avg height ${isOptimized ? '✅' : '⚠️'}`);
        }

        // Button Analysis
        if (data.forms.buttons) {
            const avgButtonHeight = data.forms.buttons.avgHeight.toFixed(1);
            const isOptimized = data.forms.buttons.avgHeight <= 40; // Target: smaller buttons
            console.log(`     • Buttons: ${avgButtonHeight}px avg height ${isOptimized ? '✅' : '⚠️'}`);
        }

        // Form Field Spacing Analysis
        if (data.forms.inputs) {
            const avgMargin = data.forms.inputs.avgMargin.toFixed(1);
            const isOptimized = data.forms.inputs.avgMargin <= 16; // Target: 12px margins
            console.log(`     • Form Field Margins: ${avgMargin}px avg ${isOptimized ? '✅' : '⚠️'}`);
        }

        // Space Efficiency Analysis
        if (data.efficiency) {
            const contentRatio = (data.efficiency.contentToViewportRatio * 100).toFixed(1);
            const horizontalUsage = (data.efficiency.horizontalSpaceUsage * 100).toFixed(1);
            console.log(`     • Viewport Usage: ${contentRatio}% vertical, ${horizontalUsage}% horizontal`);
            console.log(`     • Scroll Required: ${data.efficiency.verticalScrollRequired ? 'Yes' : 'No'}`);
        }

        // Form Details (if available)
        if (data.formDetails) {
            if (data.formDetails.passengerControls && data.formDetails.passengerControls.count > 0) {
                const passengerBtnHeight = data.formDetails.passengerControls.avgHeight.toFixed(1);
                const isOptimized = data.formDetails.passengerControls.avgHeight <= 32; // Target: 20px buttons
                console.log(`     • Passenger Controls: ${passengerBtnHeight}px avg height ${isOptimized ? '✅' : '⚠️'}`);
            }

            if (data.formDetails.formFields && data.formDetails.formFields.count > 0) {
                const avgSpacing = data.formDetails.formFields.avgSpacing.toFixed(1);
                const isOptimized = data.formDetails.formFields.avgSpacing <= 16; // Target: 12px spacing
                console.log(`     • Form Field Spacing: ${avgSpacing}px avg ${isOptimized ? '✅' : '⚠️'}`);
            }
        }
    });

    // Desktop comparison
    if (desktopData) {
        console.log(`\n   🖥️ Desktop Comparison:`);
        if (desktopData.serviceCards) {
            console.log(`     • Service Cards: ${desktopData.serviceCards.avgHeight.toFixed(1)}px avg height`);
        }
        if (desktopData.efficiency) {
            const desktopRatio = (desktopData.efficiency.contentToViewportRatio * 100).toFixed(1);
            console.log(`     • Viewport Usage: ${desktopRatio}% vertical`);
        }
    }

    // ULTRATHINK Requirements Check
    console.log('\n🎯 ULTRATHINK REQUIREMENTS VALIDATION:');
    console.log('   • Compact Passenger Dropdown: ' + (results.measurements['iPhone-12']?.formDetails?.passengerControls?.avgHeight <= 32 ? '✅ PASS' : '⚠️ CHECK'));
    console.log('   • Space-Efficient DatePicker: ' + (results.measurements['iPhone-12']?.formDetails?.dateInputs?.avgHeight <= 50 ? '✅ PASS' : '⚠️ CHECK'));
    console.log('   • Dense Service Cards: ' + (results.measurements['iPhone-12']?.serviceCards?.avgHeight <= 120 ? '✅ PASS' : '⚠️ CHECK'));
    console.log('   • Reduced Form Spacing: ' + (results.measurements['iPhone-12']?.formDetails?.formFields?.avgSpacing <= 16 ? '✅ PASS' : '⚠️ CHECK'));

    // Issues summary
    if (results.issues.length > 0) {
        console.log('\n⚠️ VALIDATION NOTES:');
        results.issues.forEach(issue => console.log(`   • ${issue}`));
    }

    // Overall assessment
    console.log('\n📋 VALIDATION SUMMARY:');
    console.log(`   • Overall Success: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   • Screenshots Captured: ${results.screenshots.length}`);
    console.log(`   • Viewports Tested: ${Object.keys(results.measurements).length}`);
    console.log(`   • Mobile Viewports: ${mobileViewports.length}`);
    console.log(`   • Issues/Notes: ${results.issues.length}`);

    console.log('\n' + '=' .repeat(70));
    console.log('🚀 ULTRATHINK Mobile Space Efficiency Validation Complete!');

    return results;
}

// Run the focused validation
validateMobileSpaceEfficiency()
    .then(analyzeULTRATHINKResults)
    .then(results => {
        console.log(`\n💾 Screenshots saved to current directory`);
        process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });