const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function investigateEmailMarketing() {
    const browser = await puppeteer.launch({
        headless: false, // Show browser for debugging
        defaultViewport: { width: 1920, height: 1080 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    });

    const page = await browser.newPage();
    
    // Arrays to collect data
    const consoleErrors = [];
    const networkRequests = [];
    const findings = {
        screenshots: [],
        totalContatos: null,
        verContatosAvailable: false,
        consoleErrors: [],
        networkRequests: [],
        apiRequests: []
    };

    try {
        // Set up console error monitoring
        page.on('console', (message) => {
            if (message.type() === 'error') {
                const error = {
                    type: message.type(),
                    text: message.text(),
                    location: message.location()
                };
                consoleErrors.push(error);
                findings.consoleErrors.push(error);
                console.log('Console Error:', error);
            }
        });

        // Set up network request monitoring
        page.on('request', (request) => {
            const requestData = {
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                postData: request.postData(),
                timestamp: Date.now()
            };
            networkRequests.push(requestData);
            findings.networkRequests.push(requestData);
            
            // Log API requests specifically
            if (request.url().includes('/api/email-marketing')) {
                findings.apiRequests.push(requestData);
                console.log('API Request detected:', request.url(), request.method());
            }
        });

        page.on('response', (response) => {
            if (response.url().includes('/api/email-marketing')) {
                console.log('API Response:', response.url(), response.status());
            }
        });

        console.log('Navigating to admin email marketing page...');
        
        // Navigate to the admin page
        await page.goto('https://www.fly2any.com/admin/email-marketing', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a bit for page to fully load
        await page.waitForTimeout(3000);

        // Take initial screenshot
        const screenshot1Path = '/mnt/d/Users/vilma/fly2any/screenshot-initial.png';
        await page.screenshot({ 
            path: screenshot1Path, 
            fullPage: true 
        });
        findings.screenshots.push(screenshot1Path);
        console.log('Initial screenshot taken');

        // Check for "Total de Contatos" 
        console.log('Looking for "Total de Contatos" element...');
        try {
            // Try different possible selectors for total contacts
            const totalContatosSelectors = [
                '[data-testid*="total"]',
                '.total-contatos',
                '*[class*="total"]',
                '*[id*="total"]',
                'h3:contains("Total")',
                'span:contains("Total")',
                'div:contains("Total de Contatos")'
            ];

            let totalElement = null;
            for (const selector of totalContatosSelectors) {
                try {
                    totalElement = await page.$(selector);
                    if (totalElement) {
                        const text = await page.evaluate(el => el.textContent, totalElement);
                        console.log(`Found total element with selector ${selector}: ${text}`);
                        findings.totalContatos = text;
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            // If not found with selectors, try searching all text content
            if (!totalElement) {
                const pageText = await page.evaluate(() => document.body.innerText);
                const totalMatches = pageText.match(/Total de Contatos[:\s]*(\d+)/i);
                if (totalMatches) {
                    findings.totalContatos = totalMatches[0];
                    console.log('Found total in page text:', totalMatches[0]);
                } else {
                    console.log('Could not find "Total de Contatos" anywhere on page');
                    console.log('Page text preview:', pageText.substring(0, 500));
                }
            }
        } catch (error) {
            console.log('Error looking for Total de Contatos:', error.message);
        }

        // Check for "Ver Contatos" button
        console.log('Looking for "Ver Contatos" button...');
        try {
            const verContatosSelectors = [
                'button:contains("Ver Contatos")',
                '[data-testid*="ver-contatos"]',
                '.ver-contatos',
                'button[class*="contatos"]',
                'a[href*="contatos"]'
            ];

            let verContatosButton = null;
            for (const selector of verContatosSelectors) {
                try {
                    // For text-based selectors, we need to use XPath
                    if (selector.includes('contains')) {
                        const xpath = `//button[contains(text(), 'Ver Contatos')] | //a[contains(text(), 'Ver Contatos')]`;
                        const [element] = await page.$x(xpath);
                        if (element) {
                            verContatosButton = element;
                            console.log('Found "Ver Contatos" button via XPath');
                            findings.verContatosAvailable = true;
                            break;
                        }
                    } else {
                        verContatosButton = await page.$(selector);
                        if (verContatosButton) {
                            console.log(`Found "Ver Contatos" with selector: ${selector}`);
                            findings.verContatosAvailable = true;
                            break;
                        }
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            // If found, click it
            if (verContatosButton) {
                console.log('Clicking "Ver Contatos" button...');
                await Promise.all([
                    page.waitForTimeout(1000), // Wait for any potential navigation/loading
                    verContatosButton.click()
                ]);
                
                // Wait for potential API calls
                await page.waitForTimeout(3000);
                
                // Take screenshot after clicking
                const screenshot2Path = '/mnt/d/Users/vilma/fly2any/screenshot-after-click.png';
                await page.screenshot({ 
                    path: screenshot2Path, 
                    fullPage: true 
                });
                findings.screenshots.push(screenshot2Path);
                console.log('Screenshot taken after clicking Ver Contatos');
            } else {
                console.log('Ver Contatos button not found');
                
                // Get all buttons on page for debugging
                const allButtons = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button, a'));
                    return buttons.map(btn => ({
                        tagName: btn.tagName,
                        text: btn.textContent.trim(),
                        className: btn.className,
                        id: btn.id
                    }));
                });
                console.log('All buttons/links found:', allButtons);
            }
        } catch (error) {
            console.log('Error looking for Ver Contatos button:', error.message);
        }

        // Try to manually trigger the API call to check contacts
        console.log('Attempting to make direct API call...');
        try {
            const response = await page.evaluate(async () => {
                try {
                    const res = await fetch('/api/email-marketing?action=contacts', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const data = await res.text();
                    return {
                        status: res.status,
                        statusText: res.statusText,
                        data: data
                    };
                } catch (err) {
                    return {
                        error: err.message
                    };
                }
            });
            
            console.log('Direct API call result:', response);
            findings.directApiCall = response;
        } catch (error) {
            console.log('Error making direct API call:', error.message);
        }

        // Get final page state
        const finalPageText = await page.evaluate(() => document.body.innerText);
        findings.finalPageText = finalPageText.substring(0, 1000); // First 1000 chars

    } catch (error) {
        console.error('Error during investigation:', error);
        findings.error = error.message;
    } finally {
        await browser.close();
    }

    // Write findings to file
    const findingsPath = '/mnt/d/Users/vilma/fly2any/investigation-findings.json';
    fs.writeFileSync(findingsPath, JSON.stringify(findings, null, 2));
    console.log('Findings saved to:', findingsPath);

    return findings;
}

// Run the investigation
investigateEmailMarketing().then((findings) => {
    console.log('\n=== INVESTIGATION COMPLETE ===');
    console.log('Screenshots taken:', findings.screenshots.length);
    console.log('Total de Contatos found:', findings.totalContatos);
    console.log('Ver Contatos available:', findings.verContatosAvailable);
    console.log('Console errors:', findings.consoleErrors.length);
    console.log('Network requests:', findings.networkRequests.length);
    console.log('API requests:', findings.apiRequests.length);
    
    if (findings.consoleErrors.length > 0) {
        console.log('\n=== CONSOLE ERRORS ===');
        findings.consoleErrors.forEach((error, i) => {
            console.log(`${i + 1}. ${error.text} at ${error.location?.url}`);
        });
    }
    
    if (findings.apiRequests.length > 0) {
        console.log('\n=== API REQUESTS ===');
        findings.apiRequests.forEach((req, i) => {
            console.log(`${i + 1}. ${req.method} ${req.url}`);
        });
    }
}).catch(console.error);