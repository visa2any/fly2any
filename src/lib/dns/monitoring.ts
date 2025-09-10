/**
 * 📊 Advanced DNS Monitoring and Analytics System
 * Real-time monitoring, threat detection, and performance analysis
 */

export interface DNSQuery {
  timestamp: Date;
  source_ip: string;
  query_type: string;
  query_name: string;
  response_code: string;
  response_time: number;
  server_location: string;
  client_location?: {
    country: string;
    region: string;
    city: string;
  };
  threat_indicators?: ThreatIndicator[];
}

export interface ThreatIndicator {
  type: 'malware' | 'phishing' | 'botnet' | 'ddos' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}

export interface PerformanceMetrics {
  avg_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  uptime_percentage: number;
  queries_per_second: number;
  error_rate: number;
  cache_hit_rate: number;
}

export interface GeographicMetrics {
  region: string;
  query_count: number;
  avg_latency: number;
  top_query_types: Record<string, number>;
  threat_level: 'low' | 'medium' | 'high';
}

/**
 * 🔍 Real-time DNS Query Monitor
 */
export class DNSQueryMonitor {
  private queries: DNSQuery[] = [];
  private threats: ThreatIndicator[] = [];
  private alertCallbacks: ((alert: SecurityAlert) => void)[] = [];

  /**
   * Process incoming DNS query
   */
  async processQuery(query: DNSQuery): Promise<void> {
    // Store query for analysis
    this.queries.push(query);
    
    // Analyze for threats
    const threats = await this.analyzeThreats(query);
    if (threats.length > 0) {
      query.threat_indicators = threats;
      this.threats.push(...threats);
      
      // Trigger alerts for high severity threats
      const criticalThreats = threats.filter(t => t.severity === 'critical' || t.severity === 'high');
      if (criticalThreats.length > 0) {
        await this.triggerSecurityAlert({
          type: 'threat_detected',
          severity: criticalThreats[0].severity,
          query,
          threats: criticalThreats,
          timestamp: new Date()
        });
      }
    }
    
    // Cleanup old queries (keep last 24 hours)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.queries = this.queries.filter(q => q.timestamp > cutoff);
  }

  /**
   * Analyze query for security threats
   */
  private async analyzeThreats(query: DNSQuery): Promise<ThreatIndicator[]> {
    const threats: ThreatIndicator[] = [];

    // 1. Check for DGA (Domain Generation Algorithm) patterns
    if (this.isDGADomain(query.query_name)) {
      threats.push({
        type: 'malware',
        severity: 'high',
        description: 'Domain matches DGA pattern commonly used by malware',
        confidence: 0.85
      });
    }

    // 2. Check for DNS tunneling
    if (this.isDNSTunneling(query)) {
      threats.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        description: 'Potential DNS tunneling detected',
        confidence: 0.7
      });
    }

    // 3. Check for DDoS patterns
    if (this.isDDoSPattern(query)) {
      threats.push({
        type: 'ddos',
        severity: 'critical',
        description: 'DDoS attack pattern detected',
        confidence: 0.9
      });
    }

    // 4. Check against threat intelligence feeds
    const threatIntelligence = await this.checkThreatIntelligence(query.query_name);
    if (threatIntelligence) {
      threats.push(threatIntelligence);
    }

    // 5. Check for suspicious geographic patterns
    const geoThreat = await this.analyzeGeographicPattern(query);
    if (geoThreat) {
      threats.push(geoThreat);
    }

    return threats;
  }

  /**
   * Check if domain matches DGA patterns
   */
  private isDGADomain(domain: string): boolean {
    // Remove TLD and check base domain
    const baseDomain = domain.split('.')[0];
    
    // DGA indicators:
    // - High entropy (random-looking)
    // - Unusual length
    // - No vowels or all vowels
    // - Digit patterns
    
    const entropy = this.calculateEntropy(baseDomain);
    const vowelRatio = this.calculateVowelRatio(baseDomain);
    const digitRatio = this.calculateDigitRatio(baseDomain);
    
    return entropy > 3.5 || vowelRatio < 0.1 || vowelRatio > 0.8 || digitRatio > 0.5;
  }

  /**
   * Check for DNS tunneling indicators
   */
  private isDNSTunneling(query: DNSQuery): boolean {
    // Tunneling indicators:
    // - Unusual query types (TXT with large payloads)
    // - High frequency from single source
    // - Long subdomain names
    
    const recentQueries = this.queries.filter(q => 
      q.source_ip === query.source_ip && 
      Date.now() - q.timestamp.getTime() < 60000 // Last minute
    ).length;
    
    const hasLongSubdomain = query.query_name.split('.').some(part => part.length > 63);
    const isHighFrequency = recentQueries > 100;
    
    return (query.query_type === 'TXT' && hasLongSubdomain) || isHighFrequency;
  }

  /**
   * Check for DDoS attack patterns
   */
  private isDDoSPattern(query: DNSQuery): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Count queries from same source in last minute
    const recentQueries = this.queries.filter(q => 
      q.source_ip === query.source_ip && 
      q.timestamp.getTime() > oneMinuteAgo
    ).length;
    
    // Count total queries in last minute
    const totalRecentQueries = this.queries.filter(q => 
      q.timestamp.getTime() > oneMinuteAgo
    ).length;
    
    return recentQueries > 1000 || totalRecentQueries > 50000;
  }

  /**
   * Check domain against threat intelligence feeds
   */
  private async checkThreatIntelligence(domain: string): Promise<ThreatIndicator | null> {
    // In production, integrate with:
    // - VirusTotal API
    // - AlienVault OTX
    // - Abuse.ch
    // - IBM X-Force
    
    const knownMalwareDomains = [
      'malware-example.com',
      'phishing-site.net',
      'botnet-c2.org'
    ];
    
    if (knownMalwareDomains.some(bad => domain.includes(bad))) {
      return {
        type: 'malware',
        severity: 'critical',
        description: 'Domain found in threat intelligence feeds',
        confidence: 0.95
      };
    }
    
    return null;
  }

  /**
   * Analyze geographic patterns for anomalies
   */
  private async analyzeGeographicPattern(query: DNSQuery): Promise<ThreatIndicator | null> {
    if (!query.client_location) return null;
    
    // Check for queries from high-risk countries to sensitive subdomains
    const sensitiveSubdomains = ['admin', 'api', 'internal', 'staging'];
    const highRiskCountries = ['CN', 'RU', 'KP', 'IR'];
    
    const isSensitiveQuery = sensitiveSubdomains.some(sub => 
      query.query_name.includes(sub)
    );
    
    if (isSensitiveQuery && highRiskCountries.includes(query.client_location.country)) {
      return {
        type: 'suspicious_pattern',
        severity: 'medium',
        description: `Sensitive subdomain queried from high-risk country: ${query.client_location.country}`,
        confidence: 0.6
      };
    }
    
    return null;
  }

  /**
   * Calculate string entropy
   */
  private calculateEntropy(str: string): number {
    const freq: Record<string, number> = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (const count of Object.values(freq)) {
      const p = count / str.length;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  /**
   * Calculate vowel ratio in string
   */
  private calculateVowelRatio(str: string): number {
    const vowels = str.match(/[aeiou]/gi) || [];
    return vowels.length / str.length;
  }

  /**
   * Calculate digit ratio in string
   */
  private calculateDigitRatio(str: string): number {
    const digits = str.match(/\d/g) || [];
    return digits.length / str.length;
  }

  /**
   * Trigger security alert
   */
  private async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    console.log('🚨 SECURITY ALERT:', alert);
    
    // Notify all registered callbacks
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    }
    
    // Send to external monitoring systems
    await this.sendToExternalMonitoring(alert);
  }

  /**
   * Send alert to external monitoring systems
   */
  private async sendToExternalMonitoring(alert: SecurityAlert): Promise<void> {
    // Send to Slack, PagerDuty, etc.
    try {
      const response = await fetch('https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 DNS Security Alert: ${alert.type}`,
          attachments: [{
            color: alert.severity === 'critical' ? 'danger' : 'warning',
            fields: [
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Query', value: alert.query.query_name, short: true },
              { title: 'Source', value: alert.query.source_ip, short: true },
              { title: 'Threats', value: alert.threats.map(t => t.description).join(', '), short: false }
            ]
          }]
        })
      });
    } catch (error) {
      console.error('Failed to send alert to Slack:', error);
    }
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: SecurityAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(timeRange: number = 3600000): PerformanceMetrics {
    const cutoff = new Date(Date.now() - timeRange);
    const recentQueries = this.queries.filter(q => q.timestamp > cutoff);
    
    if (recentQueries.length === 0) {
      return {
        avg_response_time: 0,
        p95_response_time: 0,
        p99_response_time: 0,
        uptime_percentage: 100,
        queries_per_second: 0,
        error_rate: 0,
        cache_hit_rate: 0
      };
    }
    
    const responseTimes = recentQueries.map(q => q.response_time).sort((a, b) => a - b);
    const errorQueries = recentQueries.filter(q => !q.response_code.startsWith('NOERROR'));
    
    return {
      avg_response_time: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p95_response_time: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99_response_time: responseTimes[Math.floor(responseTimes.length * 0.99)],
      uptime_percentage: ((recentQueries.length - errorQueries.length) / recentQueries.length) * 100,
      queries_per_second: recentQueries.length / (timeRange / 1000),
      error_rate: (errorQueries.length / recentQueries.length) * 100,
      cache_hit_rate: 85 // Would be calculated from actual cache metrics
    };
  }

  /**
   * Get geographic metrics
   */
  getGeographicMetrics(timeRange: number = 3600000): GeographicMetrics[] {
    const cutoff = new Date(Date.now() - timeRange);
    const recentQueries = this.queries.filter(q => 
      q.timestamp > cutoff && q.client_location
    );
    
    const regionMetrics: Record<string, any> = {};
    
    for (const query of recentQueries) {
      const region = `${query.client_location!.country}-${query.client_location!.region}`;
      
      if (!regionMetrics[region]) {
        regionMetrics[region] = {
          region,
          query_count: 0,
          latencies: [],
          query_types: {},
          threats: 0
        };
      }
      
      regionMetrics[region].query_count++;
      regionMetrics[region].latencies.push(query.response_time);
      regionMetrics[region].query_types[query.query_type] = 
        (regionMetrics[region].query_types[query.query_type] || 0) + 1;
      
      if (query.threat_indicators && query.threat_indicators.length > 0) {
        regionMetrics[region].threats++;
      }
    }
    
    return Object.values(regionMetrics).map((metrics: any) => ({
      region: metrics.region,
      query_count: metrics.query_count,
      avg_latency: metrics.latencies.reduce((a: number, b: number) => a + b, 0) / metrics.latencies.length,
      top_query_types: metrics.query_types,
      threat_level: metrics.threats > metrics.query_count * 0.1 ? 'high' : 
                   metrics.threats > metrics.query_count * 0.05 ? 'medium' : 'low'
    }));
  }
}

/**
 * 🚨 Security Alert Interface
 */
export interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  query: DNSQuery;
  threats: ThreatIndicator[];
  timestamp: Date;
}

/**
 * 📈 DNS Analytics Dashboard
 */
export class DNSAnalyticsDashboard {
  private monitor: DNSQueryMonitor;

  constructor(monitor: DNSQueryMonitor) {
    this.monitor = monitor;
  }

  /**
   * Generate comprehensive analytics report
   */
  generateReport(timeRange: number = 3600000): {
    performance: PerformanceMetrics;
    geographic: GeographicMetrics[];
    security: {
      total_threats: number;
      threat_breakdown: Record<string, number>;
      top_threat_sources: string[];
    };
  } {
    const performance = this.monitor.getPerformanceMetrics(timeRange);
    const geographic = this.monitor.getGeographicMetrics(timeRange);
    
    // Calculate security metrics
    const cutoff = new Date(Date.now() - timeRange);
    const recentThreats = this.monitor['threats'].filter((t: any) => 
      t.timestamp && t.timestamp > cutoff
    );
    
    const threatBreakdown: Record<string, number> = {};
    const threatSources: Record<string, number> = {};
    
    for (const threat of recentThreats) {
      threatBreakdown[threat.type] = (threatBreakdown[threat.type] || 0) + 1;
    }
    
    return {
      performance,
      geographic,
      security: {
        total_threats: recentThreats.length,
        threat_breakdown: threatBreakdown,
        top_threat_sources: Object.entries(threatSources)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([ip]) => ip)
      }
    };
  }
}