#!/usr/bin/env node

/**
 * DNS Migration Validator for fly2any.com
 * Comprehensive validation and monitoring tool for zero-downtime DNS migration
 * 2025 Enterprise-Grade Implementation
 */

const dns = require('dns').promises;
const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

class DNSMigrationValidator {
  constructor() {
    this.domain = 'fly2any.com';
    this.subdomains = ['www', 'api', 'cdn', 'mail'];
    this.expectedRecords = {
      A: ['76.76.19.61'], // Vercel IP
      AAAA: ['2606:4700::1111'], // Vercel IPv6
      MX: [{ exchange: 'mx2.hostinger.com', priority: 20 }],
      CNAME: {
        'www': 'cname.vercel-dns.com'
      }
    };
    this.nameservers = {
      current: ['ns1.dns-parking.com', 'ns2.dns-parking.com'],
      target: ['ns1.vercel-dns.com', 'ns2.vercel-dns.com']
    };
    this.globalDnsServers = [
      '8.8.8.8',      // Google
      '1.1.1.1',      // Cloudflare
      '208.67.222.222', // OpenDNS
      '9.9.9.9',      // Quad9
      '8.26.56.26'    // Comodo
    ];
  }

  // Color codes for terminal output
  colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
  };

  log(message, color = 'reset') {
    const timestamp = new Date().toISOString();
    console.log(`${this.colors[color]}[${timestamp}] ${message}${this.colors.reset}`);
  }

  async checkDNSPropagation() {
    this.log('🔍 Checking DNS Propagation Status', 'cyan');
    const results = {};

    for (const server of this.globalDnsServers) {
      try {
        const resolver = new dns.Resolver();
        resolver.setServers([server]);

        const startTime = performance.now();
        const records = await resolver.resolve4(this.domain);
        const responseTime = Math.round(performance.now() - startTime);

        results[server] = {
          records,
          responseTime,
          status: 'success'
        };

        this.log(`✅ ${server}: ${records.join(', ')} (${responseTime}ms)`, 'green');
      } catch (error) {
        results[server] = {
          error: error.message,
          status: 'failed'
        };
        this.log(`❌ ${server}: ${error.message}`, 'red');
      }
    }

    return results;
  }

  async validateNameservers() {
    this.log('🔧 Validating Nameservers', 'cyan');
    
    try {
      const ns = await dns.resolveNs(this.domain);
      this.log(`Current nameservers: ${ns.join(', ')}`, 'blue');

      const isVercelDNS = ns.some(server => 
        server.includes('vercel-dns.com')
      );

      if (isVercelDNS) {
        this.log('✅ Migration Complete: Using Vercel DNS', 'green');
        return { migrated: true, nameservers: ns };
      } else {
        this.log('⏳ Migration Pending: Still using old nameservers', 'yellow');
        return { migrated: false, nameservers: ns };
      }
    } catch (error) {
      this.log(`❌ Nameserver validation failed: ${error.message}`, 'red');
      return { migrated: false, error: error.message };
    }
  }

  async checkWebsiteAccessibility() {
    this.log('🌐 Checking Website Accessibility', 'cyan');
    const urls = [
      `https://${this.domain}`,
      `https://www.${this.domain}`,
      `http://${this.domain}`,
      `http://www.${this.domain}`
    ];

    const results = {};

    for (const url of urls) {
      try {
        const startTime = performance.now();
        const result = await this.makeHttpRequest(url);
        const responseTime = Math.round(performance.now() - startTime);

        results[url] = {
          statusCode: result.statusCode,
          responseTime,
          status: result.statusCode < 400 ? 'success' : 'failed'
        };

        const statusColor = result.statusCode < 400 ? 'green' : 'red';
        const statusIcon = result.statusCode < 400 ? '✅' : '❌';
        
        this.log(`${statusIcon} ${url}: ${result.statusCode} (${responseTime}ms)`, statusColor);
      } catch (error) {
        results[url] = {
          error: error.message,
          status: 'failed'
        };
        this.log(`❌ ${url}: ${error.message}`, 'red');
      }
    }

    return results;
  }

  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https://') ? https : http;
      
      const req = client.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'DNS-Migration-Validator/1.0'
        }
      }, (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async checkSSLCertificates() {
    this.log('🔒 Validating SSL Certificates', 'cyan');
    const domains = [this.domain, `www.${this.domain}`];
    const results = {};

    for (const domain of domains) {
      try {
        const certInfo = await this.getSSLCertInfo(domain);
        results[domain] = {
          valid: certInfo.valid,
          issuer: certInfo.issuer,
          validFrom: certInfo.validFrom,
          validTo: certInfo.validTo,
          daysUntilExpiry: certInfo.daysUntilExpiry
        };

        if (certInfo.valid) {
          this.log(`✅ ${domain}: Valid SSL (expires in ${certInfo.daysUntilExpiry} days)`, 'green');
        } else {
          this.log(`❌ ${domain}: Invalid SSL certificate`, 'red');
        }
      } catch (error) {
        results[domain] = { error: error.message };
        this.log(`❌ ${domain}: SSL check failed - ${error.message}`, 'red');
      }
    }

    return results;
  }

  getSSLCertInfo(hostname) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        port: 443,
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        
        if (!cert || Object.keys(cert).length === 0) {
          return reject(new Error('No certificate found'));
        }

        const now = new Date();
        const validTo = new Date(cert.valid_to);
        const validFrom = new Date(cert.valid_from);
        const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

        resolve({
          valid: now >= validFrom && now <= validTo,
          issuer: cert.issuer.CN || cert.issuer.O,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysUntilExpiry
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('SSL check timeout'));
      });

      req.end();
    });
  }

  async performanceTest() {
    this.log('⚡ Running Performance Tests', 'cyan');
    const results = {
      dns: {},
      http: {},
      global: {}
    };

    // DNS Resolution Performance
    for (const server of this.globalDnsServers) {
      const times = [];
      
      for (let i = 0; i < 5; i++) {
        try {
          const startTime = performance.now();
          const resolver = new dns.Resolver();
          resolver.setServers([server]);
          await resolver.resolve4(this.domain);
          times.push(performance.now() - startTime);
        } catch (error) {
          // Ignore errors for average calculation
        }
      }

      if (times.length > 0) {
        const avgTime = Math.round(times.reduce((a, b) => a + b) / times.length);
        results.dns[server] = {
          averageTime: avgTime,
          tests: times.length
        };

        const performanceColor = avgTime < 50 ? 'green' : avgTime < 100 ? 'yellow' : 'red';
        this.log(`DNS ${server}: ${avgTime}ms average`, performanceColor);
      }
    }

    // HTTP Response Performance
    const urls = [`https://${this.domain}`, `https://www.${this.domain}`];
    
    for (const url of urls) {
      const times = [];
      
      for (let i = 0; i < 3; i++) {
        try {
          const startTime = performance.now();
          await this.makeHttpRequest(url);
          times.push(performance.now() - startTime);
        } catch (error) {
          // Ignore errors for average calculation
        }
      }

      if (times.length > 0) {
        const avgTime = Math.round(times.reduce((a, b) => a + b) / times.length);
        results.http[url] = {
          averageTime: avgTime,
          tests: times.length
        };

        const performanceColor = avgTime < 500 ? 'green' : avgTime < 1000 ? 'yellow' : 'red';
        this.log(`HTTP ${url}: ${avgTime}ms average`, performanceColor);
      }
    }

    return results;
  }

  async generateReport() {
    this.log('📊 Generating Comprehensive Migration Report', 'magenta');
    
    const report = {
      timestamp: new Date().toISOString(),
      domain: this.domain,
      tests: {}
    };

    // Run all validation tests
    report.tests.nameservers = await this.validateNameservers();
    report.tests.propagation = await this.checkDNSPropagation();
    report.tests.accessibility = await this.checkWebsiteAccessibility();
    report.tests.ssl = await this.checkSSLCertificates();
    report.tests.performance = await this.performanceTest();

    // Calculate overall health score
    const healthScore = this.calculateHealthScore(report.tests);
    report.healthScore = healthScore;

    // Display summary
    this.displaySummary(report);

    return report;
  }

  calculateHealthScore(tests) {
    let score = 0;
    let maxScore = 0;

    // Nameserver migration (30 points)
    maxScore += 30;
    if (tests.nameservers.migrated) {
      score += 30;
    }

    // DNS propagation (25 points)
    maxScore += 25;
    const propagationResults = Object.values(tests.propagation);
    const successfulPropagation = propagationResults.filter(r => r.status === 'success').length;
    score += Math.round((successfulPropagation / propagationResults.length) * 25);

    // Website accessibility (25 points)
    maxScore += 25;
    const accessibilityResults = Object.values(tests.accessibility);
    const successfulAccess = accessibilityResults.filter(r => r.status === 'success').length;
    score += Math.round((successfulAccess / accessibilityResults.length) * 25);

    // SSL certificates (20 points)
    maxScore += 20;
    const sslResults = Object.values(tests.ssl);
    const validSSL = sslResults.filter(r => r.valid).length;
    score += Math.round((validSSL / sslResults.length) * 20);

    return {
      score,
      maxScore,
      percentage: Math.round((score / maxScore) * 100)
    };
  }

  displaySummary(report) {
    this.log('\n' + '='.repeat(60), 'bold');
    this.log('📋 MIGRATION VALIDATION SUMMARY', 'bold');
    this.log('='.repeat(60), 'bold');

    const { healthScore, tests } = report;
    
    // Overall health
    const healthColor = healthScore.percentage >= 90 ? 'green' : 
                        healthScore.percentage >= 70 ? 'yellow' : 'red';
    this.log(`Overall Health: ${healthScore.score}/${healthScore.maxScore} (${healthScore.percentage}%)`, healthColor);

    // Migration status
    if (tests.nameservers.migrated) {
      this.log('🎉 Migration Status: COMPLETED', 'green');
    } else {
      this.log('⏳ Migration Status: IN PROGRESS', 'yellow');
    }

    // Key metrics
    const propagationSuccess = Object.values(tests.propagation)
      .filter(r => r.status === 'success').length;
    const totalServers = Object.keys(tests.propagation).length;
    
    this.log(`DNS Propagation: ${propagationSuccess}/${totalServers} servers (${Math.round(propagationSuccess/totalServers*100)}%)`, 
      propagationSuccess === totalServers ? 'green' : 'yellow');

    // Performance summary
    const dnsPerf = Object.values(tests.performance.dns);
    if (dnsPerf.length > 0) {
      const avgDnsTime = Math.round(
        dnsPerf.reduce((sum, p) => sum + p.averageTime, 0) / dnsPerf.length
      );
      this.log(`Average DNS Time: ${avgDnsTime}ms`, avgDnsTime < 50 ? 'green' : 'yellow');
    }

    // Recommendations
    this.log('\n📝 RECOMMENDATIONS:', 'bold');
    
    if (!tests.nameservers.migrated) {
      this.log('• Complete nameserver migration to Vercel DNS', 'yellow');
    }
    
    if (propagationSuccess < totalServers) {
      this.log('• Wait for DNS propagation to complete globally', 'yellow');
    }
    
    if (healthScore.percentage < 90) {
      this.log('• Monitor and resolve any remaining issues', 'yellow');
    } else {
      this.log('• Migration successful! Monitor performance for 24-48 hours', 'green');
    }

    this.log('\n' + '='.repeat(60), 'bold');
  }

  async monitorMigration(intervalMinutes = 5, maxHours = 24) {
    this.log(`🔄 Starting migration monitoring (${intervalMinutes}min intervals, ${maxHours}h max)`, 'magenta');
    
    const startTime = Date.now();
    const maxDuration = maxHours * 60 * 60 * 1000;
    let migrationCompleted = false;

    while (Date.now() - startTime < maxDuration && !migrationCompleted) {
      this.log('\n' + '-'.repeat(50), 'blue');
      const report = await this.generateReport();
      
      if (report.tests.nameservers.migrated && report.healthScore.percentage >= 90) {
        this.log('🎉 Migration completed successfully!', 'green');
        migrationCompleted = true;
        break;
      }

      this.log(`⏳ Next check in ${intervalMinutes} minutes...`, 'blue');
      await this.sleep(intervalMinutes * 60 * 1000);
    }

    if (!migrationCompleted) {
      this.log('⚠️  Migration monitoring timeout reached', 'yellow');
      this.log('Please check migration status manually', 'yellow');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
if (require.main === module) {
  const validator = new DNSMigrationValidator();
  const command = process.argv[2];

  switch (command) {
    case 'check':
      validator.generateReport()
        .then(report => {
          process.exit(report.healthScore.percentage >= 90 ? 0 : 1);
        })
        .catch(error => {
          console.error('Validation failed:', error);
          process.exit(1);
        });
      break;

    case 'monitor':
      const interval = parseInt(process.argv[3]) || 5;
      const maxHours = parseInt(process.argv[4]) || 24;
      
      validator.monitorMigration(interval, maxHours)
        .catch(error => {
          console.error('Monitoring failed:', error);
          process.exit(1);
        });
      break;

    case 'performance':
      validator.performanceTest()
        .then(results => {
          console.log('Performance test completed');
          console.log(JSON.stringify(results, null, 2));
        })
        .catch(error => {
          console.error('Performance test failed:', error);
          process.exit(1);
        });
      break;

    default:
      console.log(`
🚀 DNS Migration Validator for fly2any.com

Usage:
  node dns-migration-validator.js check          # Run complete validation
  node dns-migration-validator.js monitor [5] [24] # Monitor migration (interval mins, max hours)  
  node dns-migration-validator.js performance    # Run performance tests only

Examples:
  node dns-migration-validator.js check
  node dns-migration-validator.js monitor 2 12
  node dns-migration-validator.js performance
      `);
      break;
  }
}

module.exports = DNSMigrationValidator;