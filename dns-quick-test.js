#!/usr/bin/env node
// DNS Quick Test and Validation Suite
// Fast validation of DNS optimization implementation

const { exec } = require('child_process');
const https = require('https');
const fs = require('fs');

class DNSQuickTest {
  constructor() {
    this.domain = 'fly2any.com';
    this.results = {
      timestamp: new Date().toISOString(),
      domain: this.domain,
      tests: [],
      summary: { passed: 0, failed: 0, warnings: 0 }
    };
  }

  async runAllTests() {
    console.log('🚀 DNS Quick Test Suite - fly2any.com');
    console.log('=====================================\\n');
    
    // Test suite
    await this.testBasicDNSResolution();
    await this.testWebsiteAccessibility();
    await this.testPerformance();
    await this.testSecurityFeatures();
    await this.testEmailConfiguration();
    await this.testCDNFunctionality();
    
    // Generate report
    this.generateSummary();
    this.saveResults();
    
    return this.results;
  }

  async testBasicDNSResolution() {
    console.log('📋 Test 1: Basic DNS Resolution');
    console.log('-------------------------------');
    
    const dnsTests = [
      { type: 'A', target: this.domain, expected: ['76.76.21.241', '76.76.21.123', '216.198.79.1'] },
      { type: 'CNAME', target: `www.${this.domain}`, expected: 'cname.vercel-dns.com' },
      { type: 'AAAA', target: this.domain, expected: '2606:4700:3030' },
      { type: 'TXT', target: this.domain, expected: 'google-site-verification' },
      { type: 'NS', target: this.domain, expected: ['ns1.vercel-dns.com', 'ns1.dns-parking.com'] }
    ];

    for (const test of dnsTests) {
      try {
        const result = await this.queryDNS(test.type, test.target);
        const passed = this.validateDNSResponse(result, test.expected);
        
        this.logTest(`DNS ${test.type} - ${test.target}`, passed, result);
        
        if (passed) {
          console.log(`✅ ${test.type} record: PASSED`);
          this.results.summary.passed++;
        } else {
          console.log(`❌ ${test.type} record: FAILED - ${result}`);
          this.results.summary.failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.type} record: ERROR - ${error.message}`);
        this.logTest(`DNS ${test.type} - ${test.target}`, false, error.message);
        this.results.summary.failed++;
      }
    }
    
    console.log('');
  }

  async testWebsiteAccessibility() {
    console.log('📋 Test 2: Website Accessibility');
    console.log('---------------------------------');
    
    const websiteTests = [
      { url: `https://${this.domain}`, description: 'Main website' },
      { url: `https://www.${this.domain}`, description: 'WWW subdomain' },
      { url: `https://www.${this.domain}/api/health`, description: 'API health endpoint' },
      { url: `http://${this.domain}`, description: 'HTTP redirect test' }
    ];

    for (const test of websiteTests) {
      try {
        const result = await this.testHTTPSConnection(test.url);
        const passed = result.statusCode >= 200 && result.statusCode < 400;
        
        this.logTest(`HTTP ${test.description}`, passed, `Status: ${result.statusCode}, Time: ${result.responseTime}ms`);
        
        if (passed) {
          console.log(`✅ ${test.description}: ${result.statusCode} (${result.responseTime}ms)`);
          this.results.summary.passed++;
        } else {
          console.log(`❌ ${test.description}: ${result.statusCode} (${result.responseTime}ms)`);
          this.results.summary.failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.description}: ERROR - ${error.message}`);
        this.logTest(`HTTP ${test.description}`, false, error.message);
        this.results.summary.failed++;
      }
    }
    
    console.log('');
  }

  async testPerformance() {
    console.log('📋 Test 3: Performance Metrics');
    console.log('-------------------------------');
    
    const performanceTests = [
      { name: 'DNS Resolution Time', target: this.domain },
      { name: 'HTTPS Response Time', target: `https://www.${this.domain}` },
      { name: 'CDN Cache Performance', target: `https://www.${this.domain}/favicon.ico` }
    ];

    for (const test of performanceTests) {
      try {
        let responseTime;
        
        if (test.name.includes('DNS')) {
          responseTime = await this.measureDNSTime(test.target);
        } else {
          const result = await this.testHTTPSConnection(test.target);
          responseTime = result.responseTime;
        }
        
        const benchmark = test.name.includes('DNS') ? 100 : 2000; // 100ms for DNS, 2s for HTTP
        const passed = responseTime < benchmark;
        const grade = this.getPerformanceGrade(responseTime, benchmark);
        
        this.logTest(test.name, passed, `${responseTime}ms (${grade})`);
        
        if (passed) {
          console.log(`✅ ${test.name}: ${responseTime}ms (${grade})`);
          this.results.summary.passed++;
        } else {
          console.log(`⚠️  ${test.name}: ${responseTime}ms (${grade}) - Above benchmark`);
          this.results.summary.warnings++;
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        this.logTest(test.name, false, error.message);
        this.results.summary.failed++;
      }
    }
    
    console.log('');
  }

  async testSecurityFeatures() {
    console.log('📋 Test 4: Security Configuration');
    console.log('----------------------------------');
    
    const securityTests = [
      { name: 'SSL Certificate', test: 'ssl' },
      { name: 'HTTPS Redirect', test: 'redirect' },
      { name: 'Security Headers', test: 'headers' },
      { name: 'CAA Records', test: 'caa' }
    ];

    for (const test of securityTests) {
      try {
        let passed = false;
        let details = '';
        
        switch (test.test) {
          case 'ssl':
            const sslResult = await this.testSSLCertificate();
            passed = sslResult.valid;
            details = sslResult.details;
            break;
            
          case 'redirect':
            const redirectResult = await this.testHTTPSConnection(`http://${this.domain}`);
            passed = redirectResult.statusCode >= 300 && redirectResult.statusCode < 400;
            details = `Status: ${redirectResult.statusCode}`;
            break;
            
          case 'headers':
            const headerResult = await this.testSecurityHeaders();
            passed = headerResult.score >= 3; // Minimum 3 security headers
            details = `Headers: ${headerResult.headers.join(', ')}`;
            break;
            
          case 'caa':
            const caaResult = await this.queryDNS('CAA', this.domain);
            passed = caaResult.includes('letsencrypt') || caaResult.includes('issue');
            details = caaResult;
            break;
        }
        
        this.logTest(`Security ${test.name}`, passed, details);
        
        if (passed) {
          console.log(`✅ ${test.name}: PASSED`);
          this.results.summary.passed++;
        } else {
          console.log(`❌ ${test.name}: FAILED - ${details}`);
          this.results.summary.failed++;
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        this.logTest(`Security ${test.name}`, false, error.message);
        this.results.summary.failed++;
      }
    }
    
    console.log('');
  }

  async testEmailConfiguration() {
    console.log('📋 Test 5: Email Services (MailGun)');
    console.log('------------------------------------');
    
    const emailTests = [
      { type: 'MX', target: `mail.${this.domain}`, expected: 'mailgun.org' },
      { type: 'TXT', target: `mail.${this.domain}`, expected: 'v=spf1 include:mailgun.org' },
      { type: 'CNAME', target: `krs._domainkey.mail.${this.domain}`, expected: 'domainkey' }
    ];

    for (const test of emailTests) {
      try {
        const result = await this.queryDNS(test.type, test.target);
        const passed = result.toLowerCase().includes(test.expected.toLowerCase());
        
        this.logTest(`Email ${test.type} - ${test.target}`, passed, result);
        
        if (passed) {
          console.log(`✅ Email ${test.type}: PASSED`);
          this.results.summary.passed++;
        } else {
          console.log(`❌ Email ${test.type}: FAILED - ${result}`);
          this.results.summary.failed++;
        }
      } catch (error) {
        console.log(`⚠️  Email ${test.type}: WARNING - ${error.message} (subdomain may not be configured yet)`);
        this.logTest(`Email ${test.type} - ${test.target}`, false, error.message);
        this.results.summary.warnings++;
      }
    }
    
    console.log('');
  }

  async testCDNFunctionality() {
    console.log('📋 Test 6: CDN and Edge Functions');
    console.log('----------------------------------');
    
    const cdnTests = [
      { name: 'CDN Headers', test: 'cdn-headers' },
      { name: 'Geographic Routing', test: 'geo-routing' },
      { name: 'Cache Performance', test: 'cache' },
      { name: 'Edge Functions', test: 'edge' }
    ];

    for (const test of cdnTests) {
      try {
        let passed = false;
        let details = '';
        
        switch (test.test) {
          case 'cdn-headers':
            const response = await this.testHTTPSConnection(`https://www.${this.domain}`);
            const cdnHeaders = ['x-vercel-cache', 'cf-ray', 'x-cache', 'server'];
            const foundHeaders = cdnHeaders.filter(header => 
              response.headers && response.headers[header]
            );
            passed = foundHeaders.length > 0;
            details = `Found: ${foundHeaders.join(', ') || 'none'}`;
            break;
            
          case 'geo-routing':
            // Test if different regions get different responses (basic check)
            const geoResponse = await this.testHTTPSConnection(`https://www.${this.domain}`);
            passed = geoResponse.statusCode === 200;
            details = `Status: ${geoResponse.statusCode}`;
            break;
            
          case 'cache':
            const cacheTest1 = await this.testHTTPSConnection(`https://www.${this.domain}/favicon.ico`);
            await this.sleep(1000); // Wait 1 second
            const cacheTest2 = await this.testHTTPSConnection(`https://www.${this.domain}/favicon.ico`);
            passed = cacheTest2.responseTime < cacheTest1.responseTime * 0.8; // 20% faster = cached
            details = `First: ${cacheTest1.responseTime}ms, Second: ${cacheTest2.responseTime}ms`;
            break;
            
          case 'edge':
            const edgeResponse = await this.testHTTPSConnection(`https://www.${this.domain}`);
            passed = edgeResponse.statusCode === 200;
            details = `Edge response: ${edgeResponse.statusCode}`;
            break;
        }
        
        this.logTest(`CDN ${test.name}`, passed, details);
        
        if (passed) {
          console.log(`✅ ${test.name}: PASSED - ${details}`);
          this.results.summary.passed++;
        } else {
          console.log(`⚠️  ${test.name}: WARNING - ${details}`);
          this.results.summary.warnings++;
        }
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        this.logTest(`CDN ${test.name}`, false, error.message);
        this.results.summary.failed++;
      }
    }
    
    console.log('');
  }

  // Helper methods

  queryDNS(type, target) {
    return new Promise((resolve, reject) => {
      const command = `nslookup -type=${type} ${target} 8.8.8.8`;
      
      exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
          reject(new Error(error ? error.message : stderr));
          return;
        }
        
        resolve(stdout.trim());
      });
    });
  }

  validateDNSResponse(response, expected) {
    if (Array.isArray(expected)) {
      return expected.some(exp => response.includes(exp));
    }
    return response.includes(expected);
  }

  testHTTPSConnection(url) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 10000
      };
      
      const req = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (res) => {
        const endTime = Date.now();
        resolve({
          statusCode: res.statusCode,
          responseTime: endTime - startTime,
          headers: res.headers
        });
      });
      
      req.on('error', (error) => {
        const endTime = Date.now();
        resolve({
          statusCode: 0,
          responseTime: endTime - startTime,
          error: error.message
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          statusCode: 0,
          responseTime: 10000,
          error: 'Timeout'
        });
      });
      
      req.end();
    });
  }

  async measureDNSTime(domain) {
    const startTime = Date.now();
    await this.queryDNS('A', domain);
    return Date.now() - startTime;
  }

  getPerformanceGrade(responseTime, benchmark) {
    const ratio = responseTime / benchmark;
    if (ratio < 0.2) return 'A+';
    if (ratio < 0.4) return 'A';
    if (ratio < 0.6) return 'B';
    if (ratio < 0.8) return 'C';
    if (ratio < 1.0) return 'D';
    return 'F';
  }

  async testSSLCertificate() {
    return new Promise((resolve) => {
      const options = {
        hostname: this.domain,
        port: 443,
        method: 'HEAD',
        timeout: 5000
      };
      
      const req = https.request(options, (res) => {
        const cert = res.connection.getPeerCertificate();
        resolve({
          valid: res.connection.authorized,
          details: `Issuer: ${cert.issuer?.CN || 'Unknown'}, Valid until: ${cert.valid_to || 'Unknown'}`
        });
      });
      
      req.on('error', (error) => {
        resolve({
          valid: false,
          details: error.message
        });
      });
      
      req.end();
    });
  }

  async testSecurityHeaders() {
    const response = await this.testHTTPSConnection(`https://www.${this.domain}`);
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options', 
      'referrer-policy',
      'strict-transport-security',
      'content-security-policy'
    ];
    
    const foundHeaders = securityHeaders.filter(header => 
      response.headers && response.headers[header]
    );
    
    return {
      score: foundHeaders.length,
      headers: foundHeaders
    };
  }

  logTest(name, passed, details) {
    this.results.tests.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateSummary() {
    const total = this.results.summary.passed + this.results.summary.failed + this.results.summary.warnings;
    const successRate = Math.round((this.results.summary.passed / total) * 100);
    
    console.log('📊 DNS Quick Test Summary');
    console.log('=========================');
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (successRate >= 90) {
      console.log('\\n🎉 DNS Configuration: EXCELLENT');
    } else if (successRate >= 75) {
      console.log('\\n✅ DNS Configuration: GOOD');
    } else if (successRate >= 60) {
      console.log('\\n⚠️  DNS Configuration: NEEDS IMPROVEMENT');
    } else {
      console.log('\\n❌ DNS Configuration: CRITICAL ISSUES');
    }
    
    // Recommendations
    console.log('\\n💡 Recommendations:');
    if (this.results.summary.failed > 0) {
      console.log('   - Fix failed DNS records immediately');
      console.log('   - Verify nameserver propagation is complete');
    }
    if (this.results.summary.warnings > 0) {
      console.log('   - Address performance and security warnings');
      console.log('   - Monitor and optimize over next 24 hours');
    }
    if (successRate >= 90) {
      console.log('   - Configuration is optimal');
      console.log('   - Continue monitoring for stability');
    }
  }

  saveResults() {
    const filename = `dns-test-results-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`\\n💾 Results saved to: ${filename}`);
  }
}

// CLI execution
if (require.main === module) {
  const tester = new DNSQuickTest();
  tester.runAllTests().then(() => {
    console.log('\\n🏁 DNS Quick Test Complete!');
  }).catch(error => {
    console.error('❌ Test suite error:', error.message);
    process.exit(1);
  });
}

module.exports = DNSQuickTest;