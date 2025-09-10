// Advanced DNS Monitoring and Alerting System
// Enterprise-grade monitoring for fly2any.com DNS infrastructure

const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');

class DNSMonitoringSystem {
  constructor(config) {
    this.config = {
      domain: 'fly2any.com',
      checkInterval: 60000, // 1 minute
      alertThreshold: 3, // Failed checks before alert
      maxResponseTime: 100, // milliseconds
      criticalRecords: ['A', 'AAAA', 'CNAME', 'MX'],
      ...config
    };
    
    this.failedChecks = {};
    this.isRunning = false;
    this.stats = {
      totalChecks: 0,
      successfulChecks: 0,
      averageResponseTime: 0,
      uptime: 100,
      lastCheck: null
    };
  }

  async start() {
    console.log(`🚀 Starting DNS Monitoring System for ${this.config.domain}`);
    console.log(`📊 Check interval: ${this.config.checkInterval / 1000}s`);
    console.log(`⚠️  Alert threshold: ${this.config.alertThreshold} failed checks`);
    
    this.isRunning = true;
    this.monitorLoop();
  }

  stop() {
    console.log('🛑 Stopping DNS Monitoring System');
    this.isRunning = false;
  }

  async monitorLoop() {
    while (this.isRunning) {
      await this.performHealthCheck();
      await this.sleep(this.config.checkInterval);
    }
  }

  async performHealthCheck() {
    const checkId = `check_${Date.now()}`;
    const startTime = Date.now();
    
    console.log(`\\n🔍 DNS Health Check ${checkId} - ${new Date().toLocaleTimeString()}`);
    
    const results = {
      checkId,
      timestamp: new Date().toISOString(),
      duration: 0,
      status: 'success',
      records: {},
      issues: []
    };

    // Test critical DNS records
    for (const recordType of this.config.criticalRecords) {
      try {
        const recordResult = await this.testDNSRecord(recordType);
        results.records[recordType] = recordResult;
        
        if (!recordResult.success) {
          results.issues.push(`${recordType} record resolution failed`);
        }
      } catch (error) {
        results.records[recordType] = {
          success: false,
          error: error.message,
          responseTime: null
        };
        results.issues.push(`${recordType} record error: ${error.message}`);
      }
    }

    // Calculate overall results
    const endTime = Date.now();
    results.duration = endTime - startTime;
    results.status = results.issues.length === 0 ? 'success' : 'warning';
    
    // Update statistics
    this.updateStats(results);
    
    // Check for alerting conditions
    await this.processAlerts(results);
    
    // Log results
    this.logResults(results);
    
    // Save to monitoring log
    await this.saveMonitoringData(results);
    
    return results;
  }

  async testDNSRecord(recordType) {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const command = `nslookup -type=${recordType} ${this.config.domain} 8.8.8.8`;
      
      exec(command, (error, stdout, stderr) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (error || stderr) {
          resolve({
            success: false,
            error: error ? error.message : stderr,
            responseTime: responseTime,
            rawOutput: stdout
          });
          return;
        }
        
        // Parse response for validation
        const isValid = this.validateDNSResponse(recordType, stdout);
        
        resolve({
          success: isValid,
          responseTime: responseTime,
          rawOutput: stdout,
          performanceGrade: this.gradePerformance(responseTime)
        });
      });
    });
  }

  validateDNSResponse(recordType, response) {
    // Basic validation - could be enhanced with specific record validation
    const validationPatterns = {
      A: /\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/,
      AAAA: /[0-9a-fA-F:]+::/,
      CNAME: /canonical name/,
      MX: /mail exchanger/
    };
    
    const pattern = validationPatterns[recordType];
    return pattern ? pattern.test(response) : response.length > 0;
  }

  gradePerformance(responseTime) {
    if (responseTime < 20) return 'A+';
    if (responseTime < 50) return 'A';
    if (responseTime < 100) return 'B';
    if (responseTime < 200) return 'C';
    return 'D';
  }

  updateStats(results) {
    this.stats.totalChecks++;
    this.stats.lastCheck = results.timestamp;
    
    if (results.status === 'success') {
      this.stats.successfulChecks++;
    }
    
    // Calculate average response time
    const responseTimes = Object.values(results.records)
      .map(r => r.responseTime)
      .filter(t => t !== null);
    
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      this.stats.averageResponseTime = Math.round(
        (this.stats.averageResponseTime + avgResponseTime) / 2
      );
    }
    
    // Calculate uptime
    this.stats.uptime = Math.round((this.stats.successfulChecks / this.stats.totalChecks) * 100 * 100) / 100;
  }

  async processAlerts(results) {
    const alertKey = results.checkId.split('_')[0];
    
    if (results.status !== 'success') {
      // Increment failed checks
      this.failedChecks[alertKey] = (this.failedChecks[alertKey] || 0) + 1;
      
      if (this.failedChecks[alertKey] >= this.config.alertThreshold) {
        await this.sendAlert('error', results);
        this.failedChecks[alertKey] = 0; // Reset counter after alert
      }
    } else {
      // Reset failed checks on success
      delete this.failedChecks[alertKey];
    }
    
    // Performance degradation alert
    const avgResponseTime = Object.values(results.records)
      .map(r => r.responseTime)
      .filter(t => t !== null)
      .reduce((a, b, _, arr) => a + b / arr.length, 0);
      
    if (avgResponseTime > this.config.maxResponseTime) {
      await this.sendAlert('warning', results, 'Performance degradation detected');
    }
  }

  async sendAlert(severity, results, customMessage = null) {
    const alert = {
      severity,
      domain: this.config.domain,
      timestamp: new Date().toISOString(),
      message: customMessage || `DNS ${severity} detected`,
      details: results,
      stats: this.stats
    };
    
    console.log(`\\n🚨 ALERT [${severity.toUpperCase()}]: ${alert.message}`);
    console.log(`🔗 Domain: ${this.config.domain}`);
    console.log(`📊 Issues: ${results.issues.join(', ')}`);
    console.log(`⏱️  Response Time: ${results.duration}ms`);
    
    // Save alert to file
    const alertsDir = './dns-alerts';
    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir, { recursive: true });
    }
    
    const alertFile = `${alertsDir}/alert-${Date.now()}.json`;
    fs.writeFileSync(alertFile, JSON.stringify(alert, null, 2));
    
    // Send to external monitoring (webhook, email, etc.)
    await this.sendExternalAlert(alert);
  }

  async sendExternalAlert(alert) {
    // Example webhook notification
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        const postData = JSON.stringify({
          text: `DNS Alert: ${alert.message} for ${alert.domain}`,
          alert: alert
        });
        
        const url = new URL(process.env.ALERT_WEBHOOK_URL);
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
          }
        };
        
        const req = https.request(options, (res) => {
          console.log(`📡 Alert sent to webhook: ${res.statusCode}`);
        });
        
        req.on('error', (e) => {
          console.error(`❌ Webhook error: ${e.message}`);
        });
        
        req.write(postData);
        req.end();
      } catch (error) {
        console.error(`❌ Failed to send external alert: ${error.message}`);
      }
    }
  }

  logResults(results) {
    const status = results.status === 'success' ? '✅' : '⚠️';
    console.log(`${status} Check completed in ${results.duration}ms`);
    
    // Log individual record results
    for (const [recordType, result] of Object.entries(results.records)) {
      const status = result.success ? '✅' : '❌';
      const responseTime = result.responseTime ? `${result.responseTime}ms` : 'N/A';
      const grade = result.performanceGrade || 'N/A';
      
      console.log(`  ${status} ${recordType}: ${responseTime} (${grade})`);
    }
    
    if (results.issues.length > 0) {
      console.log(`⚠️  Issues: ${results.issues.join(', ')}`);
    }
    
    console.log(`📊 Stats: ${this.stats.uptime}% uptime, ${this.stats.averageResponseTime}ms avg response`);
  }

  async saveMonitoringData(results) {
    const dataDir = './dns-monitoring-data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Daily log files
    const today = new Date().toISOString().split('T')[0];
    const logFile = `${dataDir}/dns-monitoring-${today}.jsonl`;
    
    // Append to daily log
    fs.appendFileSync(logFile, JSON.stringify(results) + '\\n');
    
    // Update current stats file
    const statsFile = `${dataDir}/current-stats.json`;
    fs.writeFileSync(statsFile, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      domain: this.config.domain,
      stats: this.stats,
      config: this.config
    }, null, 2));
  }

  async generateDashboard() {
    const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DNS Monitoring Dashboard - ${this.config.domain}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2.5em; font-weight: bold; color: #333; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status-ok { background: #4ade80; }
        .status-warning { background: #fbbf24; }
        .status-error { background: #ef4444; }
        .chart-container { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .last-updated { color: #666; font-size: 0.8em; text-align: right; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>DNS Monitoring Dashboard</h1>
        <h2>${this.config.domain}</h2>
        <div class="last-updated">Last updated: ${new Date().toLocaleString()}</div>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">
                <span class="status-indicator status-${this.stats.uptime >= 99.9 ? 'ok' : this.stats.uptime >= 99 ? 'warning' : 'error'}"></span>
                ${this.stats.uptime}%
            </div>
            <div class="stat-label">Uptime</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">${this.stats.averageResponseTime}ms</div>
            <div class="stat-label">Avg Response Time</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">${this.stats.totalChecks}</div>
            <div class="stat-label">Total Checks</div>
        </div>
        
        <div class="stat-card">
            <div class="stat-value">${this.stats.successfulChecks}</div>
            <div class="stat-label">Successful Checks</div>
        </div>
    </div>
    
    <div class="chart-container">
        <h3>System Status</h3>
        <p>Monitoring ${this.config.criticalRecords.join(', ')} records every ${this.config.checkInterval / 1000} seconds.</p>
        <p>Alert threshold: ${this.config.alertThreshold} consecutive failures</p>
        <p>Performance threshold: ${this.config.maxResponseTime}ms maximum response time</p>
    </div>
    
    <script>
        // Auto-refresh every 60 seconds
        setTimeout(() => window.location.reload(), 60000);
    </script>
</body>
</html>`;

    fs.writeFileSync('./dns-dashboard.html', dashboardHtml);
    console.log('📊 Dashboard generated: ./dns-dashboard.html');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current monitoring statistics
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      config: this.config
    };
  }
}

// Global DNS Infrastructure Monitor
class GlobalDNSInfrastructureMonitor extends DNSMonitoringSystem {
  constructor(config) {
    super(config);
    
    this.globalTestPoints = [
      { name: 'Google Primary', server: '8.8.8.8' },
      { name: 'Google Secondary', server: '8.8.4.4' },
      { name: 'Cloudflare Primary', server: '1.1.1.1' },
      { name: 'Cloudflare Secondary', server: '1.0.0.1' },
      { name: 'OpenDNS Primary', server: '208.67.222.222' },
      { name: 'OpenDNS Secondary', server: '208.67.220.220' },
      { name: 'Quad9 Primary', server: '9.9.9.9' },
      { name: 'Quad9 Secondary', server: '149.112.112.112' }
    ];
  }

  async performGlobalHealthCheck() {
    console.log('\\n🌍 Global DNS Infrastructure Health Check');
    
    const globalResults = {
      timestamp: new Date().toISOString(),
      domain: this.config.domain,
      testPoints: [],
      summary: { total: 0, successful: 0, failed: 0, averageTime: 0 }
    };

    for (const testPoint of this.globalTestPoints) {
      const startTime = Date.now();
      
      try {
        const result = await this.testDNSFromServer(testPoint.server);
        const endTime = Date.now();
        
        globalResults.testPoints.push({
          name: testPoint.name,
          server: testPoint.server,
          success: true,
          responseTime: endTime - startTime,
          result: result
        });
        
        globalResults.summary.successful++;
      } catch (error) {
        globalResults.testPoints.push({
          name: testPoint.name,
          server: testPoint.server,
          success: false,
          error: error.message,
          responseTime: null
        });
        
        globalResults.summary.failed++;
      }
      
      globalResults.summary.total++;
    }

    // Calculate average response time
    const successfulTests = globalResults.testPoints.filter(t => t.success);
    if (successfulTests.length > 0) {
      globalResults.summary.averageTime = Math.round(
        successfulTests.reduce((sum, test) => sum + test.responseTime, 0) / successfulTests.length
      );
    }

    // Log results
    console.log(`✅ Global Test Results: ${globalResults.summary.successful}/${globalResults.summary.total} successful`);
    console.log(`⏱️  Average Response Time: ${globalResults.summary.averageTime}ms`);
    
    // Save global test results
    const globalDataDir = './dns-global-monitoring';
    if (!fs.existsSync(globalDataDir)) {
      fs.mkdirSync(globalDataDir, { recursive: true });
    }
    
    const globalFile = `${globalDataDir}/global-test-${Date.now()}.json`;
    fs.writeFileSync(globalFile, JSON.stringify(globalResults, null, 2));
    
    return globalResults;
  }

  async testDNSFromServer(server) {
    return new Promise((resolve, reject) => {
      const command = `nslookup ${this.config.domain} ${server}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error || stderr) {
          reject(new Error(error ? error.message : stderr));
          return;
        }
        
        resolve(stdout);
      });
    });
  }
}

// Export classes and utilities
module.exports = {
  DNSMonitoringSystem,
  GlobalDNSInfrastructureMonitor
};

// CLI execution
if (require.main === module) {
  console.log('🔍 Advanced DNS Monitoring System');
  console.log('=================================\\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'start':
      const monitor = new DNSMonitoringSystem({
        domain: 'fly2any.com',
        checkInterval: 60000, // 1 minute
        alertThreshold: 3,
        maxResponseTime: 100
      });
      monitor.start();
      break;
      
    case 'global':
      const globalMonitor = new GlobalDNSInfrastructureMonitor({
        domain: 'fly2any.com'
      });
      globalMonitor.performGlobalHealthCheck();
      break;
      
    case 'dashboard':
      const dashboardMonitor = new DNSMonitoringSystem({
        domain: 'fly2any.com'
      });
      dashboardMonitor.generateDashboard();
      break;
      
    default:
      console.log('Available commands:');
      console.log('  start     - Start continuous DNS monitoring');
      console.log('  global    - Run global DNS infrastructure test');
      console.log('  dashboard - Generate monitoring dashboard');
      console.log('\\nExample: node dns-monitoring-system.js start');
  }
}