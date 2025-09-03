const { chromium } = require('playwright');

/**
 * ULTRATHINK MOBILE VIEWPORT EFFICIENCY VALIDATION
 * 
 * This script validates the space optimization improvements implemented
 * in the mobile interface to ensure compact, efficient use of vertical space.
 */

async function validateMobileEfficiency() {
    console.log('🚀 Starting ULTRATHINK Mobile Viewport Efficiency Validation...\n');
    
    const browser = await chromium.launch({ headless: false });
    const results = {
        screenshots: [],
        measurements: {},
        interactions: {},
        issues: [],
        success: true
    };

    try {
        // Test multiple mobile viewports
        const viewports = [
            { name: 'iPhone 12', width: 390, height: 844 },
            { name: 'Samsung Galaxy S21', width: 360, height: 640 },
            { name: 'iPhone SE', width: 375, height: 667 },
            { name: 'Mobile Landscape', width: 667, height: 375 }
        ];

        for (const viewport of viewports) {
            console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
            
            const context = await browser.newContext({
                viewport: { width: viewport.width, height: viewport.height },
                isMobile: true,
                hasTouch: true,
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
            });

            const page = await context.newPage();
            
            // Navigate to homepage
            await page.goto('http://localhost:3000');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            // 1. INITIAL HOMEPAGE SCREENSHOT
            const homeScreenshot = `ultrathink-${viewport.name.replace(/\s/g, '-').toLowerCase()}-homepage.png`;
            await page.screenshot({ path: homeScreenshot });
            results.screenshots.push({
                name: `${viewport.name} Homepage`,
                path: homeScreenshot,
                description: 'Initial homepage showing mobile optimizations'
            });

            // 2. MEASURE INITIAL VIEWPORT USAGE
            const initialStats = await page.evaluate(() => {
                const body = document.body;
                const viewport = {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    scrollHeight: body.scrollHeight,
                    contentHeight: body.offsetHeight
                };
                
                // Find main container
                const mainContainer = document.querySelector('main') || document.querySelector('[class*="main"]');
                const containerStats = mainContainer ? {
                    height: mainContainer.offsetHeight,
                    scrollHeight: mainContainer.scrollHeight
                } : null;

                return { viewport, containerStats };
            });

            results.measurements[viewport.name] = {
                initial: initialStats,
                forms: {},
                spacing: {}
            };

            // 3. OPEN FLIGHT FORM (PRIMARY TEST)
            console.log(`   ✈️ Testing Flight Form`);
            
            // Look for flight service button/card
            const flightSelector = 'button[data-service="flight"], [data-testid="flight-service"], button:has-text("Passagens"), .flight-card, [class*="flight"]';
            await page.waitForSelector(flightSelector, { timeout: 10000 });
            await page.click(flightSelector);
            await page.waitForTimeout(1500);

            // Screenshot after form opens
            const flightFormScreenshot = `ultrathink-${viewport.name.replace(/\s/g, '-').toLowerCase()}-flight-form.png`;
            await page.screenshot({ path: flightFormScreenshot });
            results.screenshots.push({
                name: `${viewport.name} Flight Form`,
                path: flightFormScreenshot,
                description: 'Flight form showing compact mobile layout'
            });

            // 4. TEST PASSENGER DROPDOWN COMPACT DESIGN
            console.log(`   👥 Testing Passenger Dropdown`);
            const passengerDropdown = await page.locator('[data-testid="passenger-dropdown"], .passenger-selector, button:has-text("Passageiros")').first();
            
            if (await passengerDropdown.isVisible()) {
                await passengerDropdown.click();
                await page.waitForTimeout(1000);
                
                // Measure dropdown buttons
                const dropdownStats = await page.evaluate(() => {
                    const buttons = document.querySelectorAll('[data-testid="passenger-dropdown"] button, .passenger-selector button, .passenger-controls button');
                    const buttonStats = [];
                    
                    buttons.forEach(btn => {
                        const styles = window.getComputedStyle(btn);
                        buttonStats.push({
                            width: btn.offsetWidth,
                            height: btn.offsetHeight,
                            padding: styles.padding,
                            fontSize: styles.fontSize
                        });
                    });
                    
                    return buttonStats;
                });

                results.measurements[viewport.name].forms.passengerDropdown = dropdownStats;

                // Screenshot with dropdown open
                const dropdownScreenshot = `ultrathink-${viewport.name.replace(/\s/g, '-').toLowerCase()}-passenger-dropdown.png`;
                await page.screenshot({ path: dropdownScreenshot });
                results.screenshots.push({
                    name: `${viewport.name} Passenger Dropdown`,
                    path: dropdownScreenshot,
                    description: 'Compact passenger dropdown with smaller buttons'
                });

                // Test functionality - increment/decrement
                const incrementBtn = page.locator('button[data-testid="increment-adults"], button:has-text("+")').first();
                if (await incrementBtn.isVisible()) {
                    await incrementBtn.click();
                    await page.waitForTimeout(500);
                    results.interactions[`${viewport.name}_passenger_increment`] = 'SUCCESS';
                }
            }

            // 5. TEST DATEPICKER COMPACT DESIGN
            console.log(`   📅 Testing DatePicker Compact Design`);
            const dateInput = page.locator('input[type="date"], .date-picker-input, input[placeholder*="data"]').first();
            
            if (await dateInput.isVisible()) {
                await dateInput.click();
                await page.waitForTimeout(1000);

                // Measure calendar popup if it appears
                const calendarStats = await page.evaluate(() => {
                    const calendar = document.querySelector('.react-datepicker, .date-picker-popup, [class*="calendar"]');
                    if (!calendar) return null;
                    
                    const styles = window.getComputedStyle(calendar);
                    return {
                        width: calendar.offsetWidth,
                        height: calendar.offsetHeight,
                        maxWidth: styles.maxWidth,
                        padding: styles.padding
                    };
                });

                if (calendarStats) {
                    results.measurements[viewport.name].forms.datePicker = calendarStats;
                    
                    const calendarScreenshot = `ultrathink-${viewport.name.replace(/\s/g, '-').toLowerCase()}-calendar.png`;
                    await page.screenshot({ path: calendarScreenshot });
                    results.screenshots.push({
                        name: `${viewport.name} Calendar`,
                        path: calendarScreenshot,
                        description: 'Compact calendar popup (should be 280px width)'
                    });
                }

                // Close calendar
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
            }

            // 6. MEASURE FORM FIELD SPACING
            console.log(`   📏 Measuring Form Field Spacing`);
            const spacingStats = await page.evaluate(() => {
                const formFields = document.querySelectorAll('.form-field, .input-group, input, select');
                const spacingData = [];
                
                formFields.forEach(field => {
                    const styles = window.getComputedStyle(field);
                    const rect = field.getBoundingClientRect();
                    spacingData.push({
                        element: field.tagName,
                        marginTop: styles.marginTop,
                        marginBottom: styles.marginBottom,
                        paddingTop: styles.paddingTop,
                        paddingBottom: styles.paddingBottom,
                        height: rect.height
                    });
                });

                return spacingData;
            });

            results.measurements[viewport.name].spacing = spacingStats;

            // 7. TEST SERVICE SELECTION CARDS
            console.log(`   🎯 Testing Service Selection Cards`);
            
            // Go back to service selection if needed
            const backButton = page.locator('button:has-text("Voltar"), button[aria-label="Back"], .back-button').first();
            if (await backButton.isVisible()) {
                await backButton.click();
                await page.waitForTimeout(1000);
            }

            const serviceCards = await page.locator('.service-card, .service-option, [data-testid*="service"]').all();
            
            if (serviceCards.length > 0) {
                const cardStats = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.service-card, .service-option, [data-testid*="service"]');
                    const cardData = [];
                    
                    cards.forEach(card => {
                        const styles = window.getComputedStyle(card);
                        cardData.push({
                            minHeight: styles.minHeight,
                            padding: styles.padding,
                            margin: styles.margin,
                            height: card.offsetHeight
                        });
                    });
                    
                    return cardData;
                });

                results.measurements[viewport.name].forms.serviceCards = cardStats;

                const serviceCardsScreenshot = `ultrathink-${viewport.name.replace(/\s/g, '-').toLowerCase()}-service-cards.png`;
                await page.screenshot({ path: serviceCardsScreenshot });
                results.screenshots.push({
                    name: `${viewport.name} Service Cards`,
                    path: serviceCardsScreenshot,
                    description: 'Compact service selection cards (32px min-height)'
                });
            }

            // 8. FINAL COMPREHENSIVE SCREENSHOT
            const finalScreenshot = `ultrathink-${viewport.name.replace(/\s/g, '-').toLowerCase()}-final.png`;
            await page.screenshot({ path: finalScreenshot, fullPage: true });
            results.screenshots.push({
                name: `${viewport.name} Full Page`,
                path: finalScreenshot,
                description: 'Complete page showing all mobile optimizations'
            });

            console.log(`   ✅ ${viewport.name} testing complete\n`);
            
            await context.close();
        }

        // 9. DESKTOP COMPARISON (to verify desktop is unchanged)
        console.log('🖥️ Testing Desktop for comparison...');
        const desktopContext = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        const desktopPage = await desktopContext.newPage();
        await desktopPage.goto('http://localhost:3000');
        await desktopPage.waitForLoadState('networkidle');
        await desktopPage.waitForTimeout(2000);

        const desktopScreenshot = 'ultrathink-desktop-comparison.png';
        await desktopPage.screenshot({ path: desktopScreenshot });
        results.screenshots.push({
            name: 'Desktop Comparison',
            path: desktopScreenshot,
            description: 'Desktop version to verify unchanged experience'
        });

        await desktopContext.close();

    } catch (error) {
        console.error('❌ Error during validation:', error);
        results.issues.push(`Validation Error: ${error.message}`);
        results.success = false;
    } finally {
        await browser.close();
    }

    return results;
}

async function analyzeResults(results) {
    console.log('\n📊 ULTRATHINK MOBILE VALIDATION RESULTS\n');
    console.log('=' .repeat(60));

    // Screenshots Summary
    console.log('\n📸 SCREENSHOTS CAPTURED:');
    results.screenshots.forEach(screenshot => {
        console.log(`   • ${screenshot.name}: ${screenshot.path}`);
        console.log(`     ${screenshot.description}`);
    });

    // Measurements Analysis
    console.log('\n📏 SPACE EFFICIENCY MEASUREMENTS:');
    Object.entries(results.measurements).forEach(([viewport, data]) => {
        console.log(`\n   ${viewport}:`);
        
        if (data.forms.passengerDropdown) {
            const avgButtonHeight = data.forms.passengerDropdown.reduce((sum, btn) => sum + btn.height, 0) / data.forms.passengerDropdown.length;
            console.log(`     • Passenger Dropdown Button Height: ${avgButtonHeight.toFixed(1)}px ${avgButtonHeight <= 24 ? '✅' : '⚠️'}`);
        }

        if (data.forms.datePicker) {
            console.log(`     • Calendar Popup Width: ${data.forms.datePicker.width}px ${data.forms.datePicker.width <= 300 ? '✅' : '⚠️'}`);
        }

        if (data.forms.serviceCards && data.forms.serviceCards.length > 0) {
            const avgCardHeight = data.forms.serviceCards.reduce((sum, card) => sum + card.height, 0) / data.forms.serviceCards.length;
            console.log(`     • Service Card Height: ${avgCardHeight.toFixed(1)}px ${avgCardHeight <= 40 ? '✅' : '⚠️'}`);
        }

        if (data.spacing && data.spacing.length > 0) {
            const marginValues = data.spacing.map(s => parseInt(s.marginBottom) || 0);
            const avgMargin = marginValues.reduce((sum, val) => sum + val, 0) / marginValues.length;
            console.log(`     • Average Field Margin: ${avgMargin.toFixed(1)}px ${avgMargin <= 16 ? '✅' : '⚠️'}`);
        }
    });

    // Interaction Tests
    console.log('\n🖱️ INTERACTION TESTS:');
    Object.entries(results.interactions).forEach(([test, result]) => {
        console.log(`   • ${test}: ${result}`);
    });

    // Issues
    if (results.issues.length > 0) {
        console.log('\n⚠️ ISSUES FOUND:');
        results.issues.forEach(issue => {
            console.log(`   • ${issue}`);
        });
    }

    // Overall Assessment
    console.log('\n🎯 ULTRATHINK VALIDATION SUMMARY:');
    console.log(`   • Overall Success: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   • Screenshots Captured: ${results.screenshots.length}`);
    console.log(`   • Viewports Tested: ${Object.keys(results.measurements).length}`);
    console.log(`   • Issues Found: ${results.issues.length}`);

    console.log('\n' + '=' .repeat(60));
    console.log('🚀 ULTRATHINK Mobile Viewport Efficiency Validation Complete!');
    
    return results;
}

// Run the validation
validateMobileEfficiency()
    .then(analyzeResults)
    .then(results => {
        process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });