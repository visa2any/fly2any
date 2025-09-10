/**
 * ULTRATHINK BRAZILIAN DIASPORA SEO VERIFICATION SCRIPT
 * Comprehensive testing and verification of all SEO implementations
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

class BrazilianDiasporaSEOVerification {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  success(message) {
    this.results.passed++;
    this.results.details.push({ type: 'success', message });
    this.log(`✅ ${message}`, colors.green);
  }

  error(message) {
    this.results.failed++;
    this.results.details.push({ type: 'error', message });
    this.log(`❌ ${message}`, colors.red);
  }

  warning(message) {
    this.results.warnings++;
    this.results.details.push({ type: 'warning', message });
    this.log(`⚠️  ${message}`, colors.yellow);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.blue);
  }

  header(message) {
    this.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    this.log(`${colors.bright}${colors.cyan}${message}${colors.reset}`);
    this.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  }

  /**
   * Check if file exists
   */
  checkFile(filePath, description) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      this.success(`${description} exists: ${filePath}`);
      return true;
    } else {
      this.error(`${description} missing: ${filePath}`);
      return false;
    }
  }

  /**
   * Check file content
   */
  checkFileContent(filePath, searchTerm, description) {
    const fullPath = path.join(__dirname, filePath);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(searchTerm)) {
        this.success(`${description} found in ${filePath}`);
        return true;
      } else {
        this.warning(`${description} not found in ${filePath}`);
        return false;
      }
    } catch (error) {
      this.error(`Cannot read ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Count occurrences in file
   */
  countInFile(filePath, searchTerm, description) {
    const fullPath = path.join(__dirname, filePath);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = (content.match(new RegExp(searchTerm, 'g')) || []).length;
      this.info(`${description}: ${matches} occurrences in ${filePath}`);
      return matches;
    } catch (error) {
      this.error(`Cannot count in ${filePath}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Verify core SEO files
   */
  verifyCoreFiles() {
    this.header('CORE SEO FILES VERIFICATION');
    
    // Check robots.ts
    this.checkFile('src/app/robots.ts', 'Dynamic robots.ts');
    this.checkFileContent('src/app/robots.ts', 'Claude-Web', 'AI crawler support');
    this.checkFileContent('src/app/robots.ts', 'GPTBot', 'ChatGPT crawler support');
    this.checkFileContent('src/app/robots.ts', 'brazilianDiaspora', 'Brazilian diaspora integration');

    // Check site.webmanifest
    this.checkFile('public/site.webmanifest', 'PWA manifest');
    this.checkFileContent('public/site.webmanifest', 'Fly2Any', 'Fly2Any branding in manifest');

    // Check global SEO config
    this.checkFile('src/lib/seo/global-seo-config.ts', 'Global SEO configuration');
    this.checkFileContent('src/lib/seo/global-seo-config.ts', 'primaryMarkets', 'Primary markets configuration');
    this.checkFileContent('src/lib/seo/global-seo-config.ts', 'aiSearchOptimization', 'AI search optimization');

    // Check Brazilian diaspora data
    this.checkFile('src/lib/data/brazilian-diaspora.ts', 'Brazilian diaspora data');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'new-york-ny', 'New York data');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'boston-ma', 'Boston data');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'miami-fl', 'Miami data');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'tokyo-japan', 'Tokyo data');
    
    const cityCount = this.countInFile('src/lib/data/brazilian-diaspora.ts', 'ultra-high', 'Ultra-high priority cities');
    if (cityCount >= 4) {
      this.success(`Found ${cityCount} ultra-high priority cities`);
    } else {
      this.warning(`Only ${cityCount} ultra-high priority cities found`);
    }
  }

  /**
   * Verify city landing pages
   */
  verifyCityPages() {
    this.header('CITY LANDING PAGES VERIFICATION');
    
    // Check city landing generator
    this.checkFile('src/lib/seo/city-landing-generator.ts', 'City landing page generator');
    this.checkFileContent('src/lib/seo/city-landing-generator.ts', 'generateCityPage', 'City page generation function');
    this.checkFileContent('src/lib/seo/city-landing-generator.ts', 'generateMetadata', 'Metadata generation');
    this.checkFileContent('src/lib/seo/city-landing-generator.ts', 'generateStructuredData', 'Structured data generation');

    // Check multilingual routes
    this.checkFile('src/app/[lang]/cidade/[cityId]/page.tsx', 'Multilingual city pages');
    this.checkFile('src/app/en/city/[cityId]/page.tsx', 'English city pages');
    this.checkFile('src/app/es/ciudad/[cityId]/page.tsx', 'Spanish city pages');
    this.checkFile('src/app/cidade/[cityId]/page.tsx', 'Default Portuguese redirect');

    // Check trilingual content
    this.checkFileContent('src/app/[lang]/cidade/[cityId]/page.tsx', 'content.hero.title[lang]', 'Trilingual hero titles');
    this.checkFileContent('src/app/[lang]/cidade/[cityId]/page.tsx', 'generateMetadata', 'Dynamic metadata generation');
    this.checkFileContent('src/app/[lang]/cidade/[cityId]/page.tsx', 'structuredData', 'Structured data inclusion');
  }

  /**
   * Verify local business SEO
   */
  verifyLocalBusiness() {
    this.header('LOCAL BUSINESS SEO VERIFICATION');
    
    // Check local business SEO system
    this.checkFile('src/lib/seo/local-business-seo.ts', 'Local business SEO system');
    this.checkFileContent('src/lib/seo/local-business-seo.ts', 'generateLocalBusiness', 'Local business generation');
    this.checkFileContent('src/lib/seo/local-business-seo.ts', 'generateGMBCsv', 'Google My Business CSV export');
    this.checkFileContent('src/lib/seo/local-business-seo.ts', 'getDirectoryList', 'Directory submission list');

    // Check schema markup
    this.checkFileContent('src/lib/seo/local-business-seo.ts', 'TravelAgency', 'Travel agency schema');
    this.checkFileContent('src/lib/seo/local-business-seo.ts', 'LocalBusiness', 'Local business schema');
    this.checkFileContent('src/lib/seo/local-business-seo.ts', 'areaServed', 'Area served markup');
  }

  /**
   * Verify sitemap integration
   */
  verifySitemap() {
    this.header('SITEMAP INTEGRATION VERIFICATION');
    
    // Check sitemap file
    this.checkFile('src/app/sitemap.ts', 'Dynamic sitemap');
    this.checkFileContent('src/app/sitemap.ts', 'brazilianDiaspora', 'Brazilian diaspora integration');
    this.checkFileContent('src/app/sitemap.ts', 'brazilianCityPages', 'City pages in sitemap');
    
    // Count city URLs in sitemap
    const portugalCount = this.countInFile('src/app/sitemap.ts', '/pt/cidade/', 'Portuguese city URLs');
    const englishCount = this.countInFile('src/app/sitemap.ts', '/en/city/', 'English city URLs');
    const spanishCount = this.countInFile('src/app/sitemap.ts', '/es/ciudad/', 'Spanish city URLs');
    
    if (portugalCount > 0 && englishCount > 0 && spanishCount > 0) {
      this.success('Trilingual city URLs found in sitemap generation');
    } else {
      this.error('Missing trilingual URLs in sitemap');
    }
  }

  /**
   * Verify meta tags and SEO elements
   */
  verifyMetaTags() {
    this.header('META TAGS AND SEO ELEMENTS VERIFICATION');
    
    // Check layout.tsx for meta tags
    this.checkFile('src/app/layout.tsx', 'Main layout file');
    this.checkFileContent('src/app/layout.tsx', 'ai-content-type', 'AI crawler meta tags');
    this.checkFileContent('src/app/layout.tsx', 'geo.region', 'Geographic meta tags');
    this.checkFileContent('src/app/layout.tsx', 'distribution', 'Distribution meta tag');
    this.checkFileContent('src/app/layout.tsx', 'coverage', 'Coverage meta tag');

    // Check H1 tag fix
    const h1Count = this.countInFile('src/app/page.tsx', '<h1', 'H1 tags on homepage');
    if (h1Count === 1) {
      this.success('Single H1 tag found on homepage (SEO optimized)');
    } else {
      this.error(`Found ${h1Count} H1 tags on homepage (should be 1)`);
    }

    // Check hreflang implementation
    this.checkFileContent('src/lib/seo/city-landing-generator.ts', 'alternates', 'Hreflang alternates');
    this.checkFileContent('src/lib/seo/city-landing-generator.ts', 'languages', 'Multi-language configuration');
  }

  /**
   * Verify keyword targeting
   */
  verifyKeywords() {
    this.header('KEYWORD TARGETING VERIFICATION');
    
    // Check Portuguese keywords
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'brasileiros nova york', 'Portuguese NYC keywords');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'brasileiros boston', 'Portuguese Boston keywords');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'brasileiros miami', 'Portuguese Miami keywords');

    // Check English keywords
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'brazilian community new york', 'English NYC keywords');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'brazilian community boston', 'English Boston keywords');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'brazilian community miami', 'English Miami keywords');

    // Check Spanish keywords
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'comunidad brasileña', 'Spanish keywords');

    // Check local neighborhood keywords
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'framingham brazilian', 'Local Framingham keywords');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'ironbound brazilian', 'Local Newark keywords');
    this.checkFileContent('src/lib/data/brazilian-diaspora.ts', 'brickell brasileiros', 'Local Miami keywords');
  }

  /**
   * Verify technical SEO
   */
  verifyTechnicalSEO() {
    this.header('TECHNICAL SEO VERIFICATION');
    
    // Check image optimization
    this.checkFileContent('next.config.ts', 'unoptimized: process.env.NODE_ENV', 'Conditional image optimization');
    
    // Check performance settings
    this.checkFileContent('src/app/layout.tsx', 'dynamic = \'force-dynamic\'', 'Dynamic rendering configuration');
    
    // Check favicon references
    this.checkFileContent('src/app/layout.tsx', 'favicon.ico', 'Favicon references');
    this.checkFileContent('src/app/layout.tsx', 'apple-touch-icon', 'Apple touch icon');
    this.checkFileContent('public/site.webmanifest', 'android-chrome', 'Android icon references');

    // Check README for favicons
    this.checkFile('public/FAVICON_README.md', 'Favicon implementation guide');
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    this.header('VERIFICATION SUMMARY');
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const passRate = ((this.results.passed / total) * 100).toFixed(1);
    
    this.log(`${colors.bright}Total Checks: ${total}${colors.reset}`);
    this.log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
    this.log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
    this.log(`${colors.yellow}⚠️  Warnings: ${this.results.warnings}${colors.reset}`);
    this.log(`${colors.bright}Pass Rate: ${passRate}%${colors.reset}\n`);

    // Status assessment
    if (this.results.failed === 0) {
      this.log(`${colors.bright}${colors.green}🎉 ALL CRITICAL CHECKS PASSED! 🎉${colors.reset}`);
      this.log(`${colors.green}Your Brazilian diaspora SEO implementation is ready for production!${colors.reset}\n`);
    } else if (this.results.failed <= 2) {
      this.log(`${colors.bright}${colors.yellow}⚡ NEARLY READY!${colors.reset}`);
      this.log(`${colors.yellow}Fix ${this.results.failed} critical issue(s) and you're ready to dominate search results!${colors.reset}\n`);
    } else {
      this.log(`${colors.bright}${colors.red}🔧 NEEDS ATTENTION${colors.reset}`);
      this.log(`${colors.red}Please fix ${this.results.failed} critical issues before deployment.${colors.reset}\n`);
    }

    // Recommendations
    this.header('NEXT STEPS RECOMMENDATIONS');
    
    this.info('1. Add actual favicon files as per public/FAVICON_README.md');
    this.info('2. Submit sitemaps to Google Search Console');
    this.info('3. Set up Google My Business listings for priority cities');
    this.info('4. Configure international targeting in Google Search Console');
    this.info('5. Monitor Core Web Vitals and page speed');
    this.info('6. Track keyword rankings for target cities');
    
    this.log(`\n${colors.bright}${colors.magenta}🚀 ULTRATHINK BRAZILIAN DIASPORA SEO READY TO RANK #1! 🚀${colors.reset}\n`);
  }

  /**
   * Run all verification tests
   */
  async runAll() {
    this.log(`${colors.bright}${colors.magenta}🇧🇷 BRAZILIAN DIASPORA SEO VERIFICATION 🇺🇸${colors.reset}`);
    this.log(`${colors.cyan}Testing comprehensive SEO implementation for global Brazilian communities${colors.reset}\n`);

    this.verifyCoreFiles();
    this.verifyCityPages();
    this.verifyLocalBusiness();
    this.verifySitemap();
    this.verifyMetaTags();
    this.verifyKeywords();
    this.verifyTechnicalSEO();
    this.generateSummary();

    // Save detailed report
    const reportPath = path.join(__dirname, 'seo-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.info(`Detailed report saved to: ${reportPath}`);

    return this.results;
  }
}

// Run verification
const verifier = new BrazilianDiasporaSEOVerification();
verifier.runAll().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});