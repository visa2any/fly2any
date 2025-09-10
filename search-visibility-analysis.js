const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class SearchVisibilityAnalyzer {
    constructor() {
        this.results = {
            google: {},
            bing: {},
            duckduckgo: {},
            summary: {
                totalSearches: 0,
                sitesWithVisibility: 0,
                averagePosition: 0,
                issuesFound: []
            }
        };
        this.screenshotDir = path.join(__dirname, 'search-visibility-screenshots');
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    async init() {
        this.browser = await chromium.launch({ headless: false });
        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
    }

    async searchGoogle(query, testName) {
        console.log(`🔍 Testing Google search for: "${query}"`);
        const page = await this.context.newPage();
        
        try {
            await page.goto('https://www.google.com');
            await page.waitForSelector('input[name="q"]', { timeout: 10000 });
            
            // Accept cookies if present
            try {
                await page.click('button:has-text("Accept all")', { timeout: 2000 });
            } catch (e) {
                // Cookie banner might not be present
            }
            
            await page.fill('input[name="q"]', query);
            await page.press('input[name="q"]', 'Enter');
            await page.waitForLoadState('networkidle');
            
            // Wait for search results
            await page.waitForSelector('#search', { timeout: 10000 });
            
            // Capture screenshot
            const screenshotPath = path.join(this.screenshotDir, `google_${testName}_${Date.now()}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            
            // Extract search results
            const results = await page.evaluate(() => {
                const searchResults = [];
                const resultElements = document.querySelectorAll('#search .g, .g');
                
                resultElements.forEach((element, index) => {
                    const titleElement = element.querySelector('h3');
                    const linkElement = element.querySelector('a[href]');
                    const snippetElement = element.querySelector('.VwiC3b, .s3v9rd, .IsZvec');
                    
                    if (titleElement && linkElement) {
                        searchResults.push({
                            position: index + 1,
                            title: titleElement.textContent.trim(),
                            url: linkElement.href,
                            snippet: snippetElement ? snippetElement.textContent.trim() : '',
                            containsFly2any: (titleElement.textContent + linkElement.href).toLowerCase().includes('fly2any')
                        });
                    }
                });
                
                return searchResults;
            });
            
            // Find fly2any results
            const fly2anyResults = results.filter(r => r.containsFly2any);
            
            this.results.google[testName] = {
                query,
                totalResults: results.length,
                fly2anyResults: fly2anyResults,
                bestPosition: fly2anyResults.length > 0 ? fly2anyResults[0].position : null,
                screenshot: screenshotPath,
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ Google search completed. Fly2any results found: ${fly2anyResults.length}`);
            if (fly2anyResults.length > 0) {
                console.log(`🎯 Best position: #${fly2anyResults[0].position}`);
            }
            
        } catch (error) {
            console.error(`❌ Google search failed: ${error.message}`);
            this.results.google[testName] = {
                query,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            await page.close();
        }
    }

    async searchBing(query, testName) {
        console.log(`🔍 Testing Bing search for: "${query}"`);
        const page = await this.context.newPage();
        
        try {
            await page.goto('https://www.bing.com');
            await page.waitForSelector('input[name="q"]', { timeout: 10000 });
            
            // Accept cookies if present
            try {
                await page.click('#bnp_btn_accept', { timeout: 2000 });
            } catch (e) {
                // Cookie banner might not be present
            }
            
            await page.fill('input[name="q"]', query);
            await page.press('input[name="q"]', 'Enter');
            await page.waitForLoadState('networkidle');
            
            // Wait for search results
            await page.waitForSelector('#b_results', { timeout: 10000 });
            
            // Capture screenshot
            const screenshotPath = path.join(this.screenshotDir, `bing_${testName}_${Date.now()}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            
            // Extract search results
            const results = await page.evaluate(() => {
                const searchResults = [];
                const resultElements = document.querySelectorAll('#b_results .b_algo');
                
                resultElements.forEach((element, index) => {
                    const titleElement = element.querySelector('h2 a');
                    const snippetElement = element.querySelector('.b_caption p, .b_caption');
                    
                    if (titleElement) {
                        searchResults.push({
                            position: index + 1,
                            title: titleElement.textContent.trim(),
                            url: titleElement.href,
                            snippet: snippetElement ? snippetElement.textContent.trim() : '',
                            containsFly2any: (titleElement.textContent + titleElement.href).toLowerCase().includes('fly2any')
                        });
                    }
                });
                
                return searchResults;
            });
            
            // Find fly2any results
            const fly2anyResults = results.filter(r => r.containsFly2any);
            
            this.results.bing[testName] = {
                query,
                totalResults: results.length,
                fly2anyResults: fly2anyResults,
                bestPosition: fly2anyResults.length > 0 ? fly2anyResults[0].position : null,
                screenshot: screenshotPath,
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ Bing search completed. Fly2any results found: ${fly2anyResults.length}`);
            if (fly2anyResults.length > 0) {
                console.log(`🎯 Best position: #${fly2anyResults[0].position}`);
            }
            
        } catch (error) {
            console.error(`❌ Bing search failed: ${error.message}`);
            this.results.bing[testName] = {
                query,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            await page.close();
        }
    }

    async searchDuckDuckGo(query, testName) {
        console.log(`🔍 Testing DuckDuckGo search for: "${query}"`);
        const page = await this.context.newPage();
        
        try {
            await page.goto('https://duckduckgo.com');
            await page.waitForSelector('input[name="q"]', { timeout: 10000 });
            
            await page.fill('input[name="q"]', query);
            await page.press('input[name="q"]', 'Enter');
            await page.waitForLoadState('networkidle');
            
            // Wait for search results
            await page.waitForSelector('#links', { timeout: 10000 });
            
            // Capture screenshot
            const screenshotPath = path.join(this.screenshotDir, `duckduckgo_${testName}_${Date.now()}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            
            // Extract search results
            const results = await page.evaluate(() => {
                const searchResults = [];
                const resultElements = document.querySelectorAll('#links .result');
                
                resultElements.forEach((element, index) => {
                    const titleElement = element.querySelector('h2 a, .result__title a');
                    const snippetElement = element.querySelector('.result__snippet');
                    
                    if (titleElement) {
                        searchResults.push({
                            position: index + 1,
                            title: titleElement.textContent.trim(),
                            url: titleElement.href,
                            snippet: snippetElement ? snippetElement.textContent.trim() : '',
                            containsFly2any: (titleElement.textContent + titleElement.href).toLowerCase().includes('fly2any')
                        });
                    }
                });
                
                return searchResults;
            });
            
            // Find fly2any results
            const fly2anyResults = results.filter(r => r.containsFly2any);
            
            this.results.duckduckgo[testName] = {
                query,
                totalResults: results.length,
                fly2anyResults: fly2anyResults,
                bestPosition: fly2anyResults.length > 0 ? fly2anyResults[0].position : null,
                screenshot: screenshotPath,
                timestamp: new Date().toISOString()
            };
            
            console.log(`✅ DuckDuckGo search completed. Fly2any results found: ${fly2anyResults.length}`);
            if (fly2anyResults.length > 0) {
                console.log(`🎯 Best position: #${fly2anyResults[0].position}`);
            }
            
        } catch (error) {
            console.error(`❌ DuckDuckGo search failed: ${error.message}`);
            this.results.duckduckgo[testName] = {
                query,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        } finally {
            await page.close();
        }
    }

    async runAllSearches() {
        console.log('🚀 Starting comprehensive search visibility analysis for fly2any.com');
        
        const searchQueries = [
            { query: 'fly2any', testName: 'brand_search' },
            { query: 'fly2any.com', testName: 'domain_search' },
            { query: 'fly2any travel', testName: 'brand_travel_search' },
            { query: 'fly2any flights', testName: 'brand_flights_search' },
            { query: 'flight booking platform', testName: 'generic_flight_booking' },
            { query: 'travel booking website', testName: 'generic_travel_booking' },
            { query: 'cheap flights booking', testName: 'cheap_flights' },
            { query: 'international flight booking', testName: 'international_flights' }
        ];

        for (const searchQuery of searchQueries) {
            console.log(`\n📊 Testing search query: "${searchQuery.query}"`);
            
            // Test on all search engines
            await this.searchGoogle(searchQuery.query, searchQuery.testName);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
            
            await this.searchBing(searchQuery.query, searchQuery.testName);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
            
            await this.searchDuckDuckGo(searchQuery.query, searchQuery.testName);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
        }
    }

    generateSummary() {
        console.log('\n📊 Generating comprehensive analysis summary...');
        
        let totalSearches = 0;
        let visibleSearches = 0;
        let positions = [];
        let issues = [];

        // Analyze Google results
        Object.entries(this.results.google).forEach(([testName, result]) => {
            if (!result.error) {
                totalSearches++;
                if (result.fly2anyResults && result.fly2anyResults.length > 0) {
                    visibleSearches++;
                    positions.push(result.bestPosition);
                    
                    // Check for issues
                    result.fly2anyResults.forEach(r => {
                        if (!r.snippet || r.snippet.length < 50) {
                            issues.push(`Google ${testName}: Poor/missing meta description`);
                        }
                        if (r.title.length > 60) {
                            issues.push(`Google ${testName}: Title too long (${r.title.length} chars)`);
                        }
                    });
                }
            }
        });

        // Analyze Bing results
        Object.entries(this.results.bing).forEach(([testName, result]) => {
            if (!result.error) {
                totalSearches++;
                if (result.fly2anyResults && result.fly2anyResults.length > 0) {
                    visibleSearches++;
                    positions.push(result.bestPosition);
                    
                    // Check for issues
                    result.fly2anyResults.forEach(r => {
                        if (!r.snippet || r.snippet.length < 50) {
                            issues.push(`Bing ${testName}: Poor/missing meta description`);
                        }
                        if (r.title.length > 60) {
                            issues.push(`Bing ${testName}: Title too long (${r.title.length} chars)`);
                        }
                    });
                }
            }
        });

        // Analyze DuckDuckGo results
        Object.entries(this.results.duckduckgo).forEach(([testName, result]) => {
            if (!result.error) {
                totalSearches++;
                if (result.fly2anyResults && result.fly2anyResults.length > 0) {
                    visibleSearches++;
                    positions.push(result.bestPosition);
                    
                    // Check for issues
                    result.fly2anyResults.forEach(r => {
                        if (!r.snippet || r.snippet.length < 50) {
                            issues.push(`DuckDuckGo ${testName}: Poor/missing meta description`);
                        }
                        if (r.title.length > 60) {
                            issues.push(`DuckDuckGo ${testName}: Title too long (${r.title.length} chars)`);
                        }
                    });
                }
            }
        });

        this.results.summary = {
            totalSearches,
            visibleSearches,
            visibilityRate: (visibleSearches / totalSearches * 100).toFixed(2) + '%',
            averagePosition: positions.length > 0 ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : 'N/A',
            bestPosition: positions.length > 0 ? Math.min(...positions) : 'N/A',
            issuesFound: issues,
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Check visibility across search engines
        const googleVisible = Object.values(this.results.google).some(r => r.fly2anyResults && r.fly2anyResults.length > 0);
        const bingVisible = Object.values(this.results.bing).some(r => r.fly2anyResults && r.fly2anyResults.length > 0);
        const duckduckgoVisible = Object.values(this.results.duckduckgo).some(r => r.fly2anyResults && r.fly2anyResults.length > 0);
        
        if (!googleVisible) {
            recommendations.push('CRITICAL: Site not appearing in Google search results - check Google Search Console and submit sitemap');
        }
        if (!bingVisible) {
            recommendations.push('Site not appearing in Bing - submit to Bing Webmaster Tools');
        }
        if (!duckduckgoVisible) {
            recommendations.push('Site not appearing in DuckDuckGo - ensure proper meta tags and structured data');
        }
        
        // Generic recommendations based on common issues
        recommendations.push('Optimize meta descriptions to 150-160 characters for better click-through rates');
        recommendations.push('Ensure title tags are under 60 characters and include primary keywords');
        recommendations.push('Implement structured data markup for rich snippets');
        recommendations.push('Build high-quality backlinks to improve domain authority');
        recommendations.push('Create location-specific landing pages for travel destinations');
        
        return recommendations;
    }

    async saveResults() {
        const reportPath = path.join(__dirname, 'search-visibility-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Detailed results saved to: ${reportPath}`);
        
        // Generate human-readable report
        const htmlReportPath = path.join(__dirname, 'search-visibility-report.html');
        const htmlReport = this.generateHTMLReport();
        fs.writeFileSync(htmlReportPath, htmlReport);
        console.log(`📄 HTML report saved to: ${htmlReportPath}`);
    }

    generateHTMLReport() {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Fly2Any Search Visibility Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .summary { background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .search-engine { margin-bottom: 30px; }
        .search-result { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
        .error { border-left-color: #dc3545; background: #fff5f5; }
        .success { border-left-color: #28a745; background: #f8fff8; }
        .screenshot { max-width: 300px; border: 1px solid #ddd; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔍 Fly2Any Search Engine Visibility Analysis Report</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    
    <div class="summary">
        <h2>📊 Summary</h2>
        <ul>
            <li><strong>Total Searches:</strong> ${this.results.summary.totalSearches}</li>
            <li><strong>Visible Searches:</strong> ${this.results.summary.visibleSearches}</li>
            <li><strong>Visibility Rate:</strong> ${this.results.summary.visibilityRate}</li>
            <li><strong>Average Position:</strong> ${this.results.summary.averagePosition}</li>
            <li><strong>Best Position:</strong> ${this.results.summary.bestPosition}</li>
        </ul>
    </div>

    <div class="recommendations">
        <h2>🎯 Recommendations</h2>
        <ul>
            ${this.results.summary.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
    </div>

    <div class="search-engine">
        <h2>🌐 Google Results</h2>
        ${Object.entries(this.results.google).map(([testName, result]) => `
            <div class="search-result ${result.error ? 'error' : result.fly2anyResults && result.fly2anyResults.length > 0 ? 'success' : ''}">
                <h3>${testName}: "${result.query}"</h3>
                ${result.error ? `<p>Error: ${result.error}</p>` : `
                    <p><strong>Results found:</strong> ${result.fly2anyResults ? result.fly2anyResults.length : 0}</p>
                    ${result.bestPosition ? `<p><strong>Best position:</strong> #${result.bestPosition}</p>` : ''}
                    ${result.fly2anyResults && result.fly2anyResults.length > 0 ? 
                        result.fly2anyResults.map(r => `
                            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                <strong>Position ${r.position}:</strong> ${r.title}<br>
                                <small>${r.url}</small><br>
                                <em>${r.snippet}</em>
                            </div>
                        `).join('') : '<p>No fly2any results found</p>'
                    }
                `}
            </div>
        `).join('')}
    </div>

    <div class="search-engine">
        <h2>🔵 Bing Results</h2>
        ${Object.entries(this.results.bing).map(([testName, result]) => `
            <div class="search-result ${result.error ? 'error' : result.fly2anyResults && result.fly2anyResults.length > 0 ? 'success' : ''}">
                <h3>${testName}: "${result.query}"</h3>
                ${result.error ? `<p>Error: ${result.error}</p>` : `
                    <p><strong>Results found:</strong> ${result.fly2anyResults ? result.fly2anyResults.length : 0}</p>
                    ${result.bestPosition ? `<p><strong>Best position:</strong> #${result.bestPosition}</p>` : ''}
                    ${result.fly2anyResults && result.fly2anyResults.length > 0 ? 
                        result.fly2anyResults.map(r => `
                            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                <strong>Position ${r.position}:</strong> ${r.title}<br>
                                <small>${r.url}</small><br>
                                <em>${r.snippet}</em>
                            </div>
                        `).join('') : '<p>No fly2any results found</p>'
                    }
                `}
            </div>
        `).join('')}
    </div>

    <div class="search-engine">
        <h2>🦆 DuckDuckGo Results</h2>
        ${Object.entries(this.results.duckduckgo).map(([testName, result]) => `
            <div class="search-result ${result.error ? 'error' : result.fly2anyResults && result.fly2anyResults.length > 0 ? 'success' : ''}">
                <h3>${testName}: "${result.query}"</h3>
                ${result.error ? `<p>Error: ${result.error}</p>` : `
                    <p><strong>Results found:</strong> ${result.fly2anyResults ? result.fly2anyResults.length : 0}</p>
                    ${result.bestPosition ? `<p><strong>Best position:</strong> #${result.bestPosition}</p>` : ''}
                    ${result.fly2anyResults && result.fly2anyResults.length > 0 ? 
                        result.fly2anyResults.map(r => `
                            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                                <strong>Position ${r.position}:</strong> ${r.title}<br>
                                <small>${r.url}</small><br>
                                <em>${r.snippet}</em>
                            </div>
                        `).join('') : '<p>No fly2any results found</p>'
                    }
                `}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

async function runAnalysis() {
    const analyzer = new SearchVisibilityAnalyzer();
    
    try {
        await analyzer.init();
        await analyzer.runAllSearches();
        analyzer.generateSummary();
        await analyzer.saveResults();
        
        console.log('\n🎉 Analysis completed successfully!');
        console.log(`📊 Visibility Rate: ${analyzer.results.summary.visibilityRate}`);
        console.log(`🎯 Average Position: ${analyzer.results.summary.averagePosition}`);
        console.log(`💡 Issues Found: ${analyzer.results.summary.issuesFound.length}`);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    } finally {
        await analyzer.close();
    }
}

// Run the analysis
if (require.main === module) {
    runAnalysis().catch(console.error);
}

module.exports = SearchVisibilityAnalyzer;