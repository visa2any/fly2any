/**
 * 📊 AUTOMATED EMAIL REPORTING SYSTEM
 * Generates comprehensive email performance reports with trend analysis and recommendations
 */

import { prisma } from '@/lib/database/prisma';
import { emailService } from './email-service';

export interface ReportConfig {
  id: string;
  name: string;
  type: ReportType;
  frequency: ReportFrequency;
  recipients: string[];
  isActive: boolean;
  filters?: ReportFilters;
  format: ReportFormat[];
  nextRunDate: Date;
  lastRunDate?: Date;
  createdBy: string;
}

export type ReportType = 
  | 'performance_summary'
  | 'campaign_analysis'
  | 'deliverability_report'
  | 'engagement_trends'
  | 'provider_comparison'
  | 'reputation_monitoring'
  | 'revenue_attribution'
  | 'custom_metrics';

export type ReportFrequency = 
  | 'daily'
  | 'weekly' 
  | 'monthly'
  | 'quarterly'
  | 'on_demand';

export type ReportFormat = 'email' | 'pdf' | 'csv' | 'json';

export interface ReportFilters {
  dateRange?: {
    start: Date;
    end: Date;
    preset?: '7d' | '30d' | '90d' | '1y';
  };
  campaignTypes?: string[];
  providers?: string[];
  minEmailVolume?: number;
  includeInactive?: boolean;
}

export interface ReportData {
  id: string;
  title: string;
  subtitle: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  summary: ReportSummary;
  sections: ReportSection[];
  metadata: ReportMetadata;
}

export interface ReportSummary {
  totalEmailsSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  revenue: number;
  roi: number;
  keyInsights: string[];
  healthScore: number;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'text' | 'recommendations';
  content: any;
  priority: number;
}

export interface ReportMetadata {
  generatedBy: string;
  generationTime: number;
  dataQuality: 'high' | 'medium' | 'low';
  confidence: number;
  limitations: string[];
  nextActions: string[];
}

export interface TrendAnalysis {
  metric: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'improving' | 'declining' | 'stable';
  significance: 'high' | 'medium' | 'low';
}

export interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  insight: string;
  type: 'success' | 'warning' | 'opportunity';
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  metrics: Record<string, number>;
}

class EmailReportingSystem {
  /**
   * Generate comprehensive email performance report
   */
  async generateReport(config: ReportConfig): Promise<ReportData> {
    console.log(`📊 Generating ${config.type} report: ${config.name}`);
    
    const startTime = Date.now();
    const period = this.calculateReportPeriod(config);
    
    try {
      // Collect data based on report type
      const sections = await this.generateReportSections(config, period);
      const summary = await this.generateReportSummary(period, config.filters);
      
      const reportData: ReportData = {
        id: `report_${Date.now()}`,
        title: this.getReportTitle(config.type),
        subtitle: `${period.label} | Generated ${new Date().toLocaleDateString()}`,
        generatedAt: new Date(),
        period,
        summary,
        sections,
        metadata: {
          generatedBy: config.createdBy,
          generationTime: Date.now() - startTime,
          dataQuality: 'high',
          confidence: 85,
          limitations: this.getReportLimitations(config),
          nextActions: await this.generateNextActions(summary, period)
        }
      };

      console.log(`✅ Report generated in ${reportData.metadata.generationTime}ms`);
      return reportData;
      
    } catch (error) {
      console.error('❌ Failed to generate report:', error);
      throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate and distribute report
   */
  async generateAndDistribute(configId: string): Promise<{ success: boolean; reportId: string; distributedTo: string[] }> {
    try {
      const config = await this.getReportConfig(configId);
      if (!config) {
        throw new Error('Report configuration not found');
      }

      // Generate report
      const reportData = await this.generateReport(config);
      
      // Save report to database
      const savedReport = await prisma.emailReport.create({
        data: {
          configId: config.id,
          type: config.type,
          title: reportData.title,
          data: reportData as any,
          generatedAt: reportData.generatedAt,
          period: {
            start: reportData.period.start,
            end: reportData.period.end,
            label: reportData.period.label
          }
        }
      });

      // Distribute report
      const distributionResults = await Promise.allSettled(
        config.recipients.map(recipient => this.distributeReport(reportData, recipient, config.format))
      );

      const successfulDistributions = distributionResults
        .filter(result => result.status === 'fulfilled')
        .length;

      console.log(`📤 Report distributed to ${successfulDistributions}/${config.recipients.length} recipients`);

      // Update next run date
      await this.updateNextRunDate(configId);

      return {
        success: true,
        reportId: savedReport.id,
        distributedTo: config.recipients.slice(0, successfulDistributions)
      };

    } catch (error) {
      console.error('❌ Failed to generate and distribute report:', error);
      return {
        success: false,
        reportId: '',
        distributedTo: []
      };
    }
  }

  /**
   * Generate report sections based on type
   */
  private async generateReportSections(config: ReportConfig, period: any): Promise<ReportSection[]> {
    const sections: ReportSection[] = [];

    switch (config.type) {
      case 'performance_summary':
        sections.push(
          await this.generatePerformanceMetricsSection(period, config.filters),
          await this.generateTrendAnalysisSection(period, config.filters),
          await this.generateTopCampaignsSection(period, config.filters),
          await this.generateRecommendationsSection(period, config.filters)
        );
        break;

      case 'campaign_analysis':
        sections.push(
          await this.generateCampaignComparisonSection(period, config.filters),
          await this.generateCampaignInsightsSection(period, config.filters),
          await this.generateABTestResultsSection(period, config.filters)
        );
        break;

      case 'deliverability_report':
        sections.push(
          await this.generateDeliverabilityMetricsSection(period, config.filters),
          await this.generateBounceAnalysisSection(period, config.filters),
          await this.generateReputationSection(period, config.filters),
          await this.generateProviderComparisonSection(period, config.filters)
        );
        break;

      case 'engagement_trends':
        sections.push(
          await this.generateEngagementTrendsSection(period, config.filters),
          await this.generateAudienceSegmentationSection(period, config.filters),
          await this.generateGeographicAnalysisSection(period, config.filters)
        );
        break;

      default:
        sections.push(await this.generateDefaultSection(period, config.filters));
    }

    return sections.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate performance metrics section
   */
  private async generatePerformanceMetricsSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    const metrics = await this.getPerformanceMetrics(period, filters);
    const previousPeriod = this.getPreviousPeriod(period);
    const previousMetrics = await this.getPerformanceMetrics(previousPeriod, filters);

    const trends = this.calculateTrends(metrics, previousMetrics);

    return {
      id: 'performance_metrics',
      title: 'Email Performance Overview',
      type: 'metrics',
      priority: 1,
      content: {
        metrics,
        trends,
        chartData: await this.getMetricsChartData(period, filters)
      }
    };
  }

  /**
   * Generate trend analysis section
   */
  private async generateTrendAnalysisSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    const trendData = await this.getTrendAnalysis(period, filters);

    return {
      id: 'trend_analysis',
      title: 'Performance Trends',
      type: 'chart',
      priority: 2,
      content: {
        trends: trendData,
        insights: this.generateTrendInsights(trendData)
      }
    };
  }

  /**
   * Generate top campaigns section
   */
  private async generateTopCampaignsSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    const topCampaigns = await this.getTopPerformingCampaigns(period, filters);

    return {
      id: 'top_campaigns',
      title: 'Top Performing Campaigns',
      type: 'table',
      priority: 3,
      content: {
        campaigns: topCampaigns,
        columns: ['name', 'type', 'sent', 'openRate', 'clickRate', 'revenue', 'roi']
      }
    };
  }

  /**
   * Generate recommendations section
   */
  private async generateRecommendationsSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    const insights = await this.generateInsights(period, filters);
    const recommendations = this.generateRecommendations(insights);

    return {
      id: 'recommendations',
      title: 'Recommendations & Next Steps',
      type: 'recommendations',
      priority: 10,
      content: {
        recommendations,
        insights,
        priorityActions: recommendations.filter(r => r.priority === 'high')
      }
    };
  }

  /**
   * Generate comprehensive insights
   */
  private async generateInsights(period: any, filters?: ReportFilters): Promise<CampaignInsight[]> {
    const insights: CampaignInsight[] = [];

    // Get campaign performance data
    const campaigns = await this.getCampaignPerformance(period, filters);
    
    for (const campaign of campaigns) {
      // Identify high-performing campaigns
      if (campaign.openRate > 25 && campaign.clickRate > 3) {
        insights.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          insight: `Exceptional performance with ${campaign.openRate.toFixed(1)}% open rate and ${campaign.clickRate.toFixed(1)}% click rate`,
          type: 'success',
          impact: 'high',
          recommendation: 'Analyze this campaign\'s content and timing to replicate success in future campaigns',
          metrics: {
            openRate: campaign.openRate,
            clickRate: campaign.clickRate,
            revenue: campaign.revenue
          }
        });
      }

      // Identify underperforming campaigns
      if (campaign.openRate < 15 && campaign.sent > 1000) {
        insights.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          insight: `Low open rate of ${campaign.openRate.toFixed(1)}% may indicate subject line or timing issues`,
          type: 'warning',
          impact: 'medium',
          recommendation: 'Test different subject lines and send times. Consider audience segmentation.',
          metrics: {
            openRate: campaign.openRate,
            sent: campaign.sent
          }
        });
      }

      // Identify revenue opportunities
      if (campaign.clickRate > 3 && campaign.conversionRate < 1) {
        insights.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          insight: 'High click-through but low conversion suggests landing page optimization opportunity',
          type: 'opportunity',
          impact: 'high',
          recommendation: 'Optimize landing page experience and ensure message alignment between email and landing page',
          metrics: {
            clickRate: campaign.clickRate,
            conversionRate: campaign.conversionRate
          }
        });
      }
    }

    return insights.slice(0, 10); // Limit to top 10 insights
  }

  /**
   * Generate recommendations from insights
   */
  private generateRecommendations(insights: CampaignInsight[]): any[] {
    const recommendations = [];

    const successfulCampaigns = insights.filter(i => i.type === 'success').length;
    const warnings = insights.filter(i => i.type === 'warning').length;
    const opportunities = insights.filter(i => i.type === 'opportunity').length;

    if (successfulCampaigns > 0) {
      recommendations.push({
        title: 'Replicate Success Patterns',
        description: 'Analyze your top-performing campaigns and create templates based on their characteristics',
        priority: 'high',
        effort: 'medium',
        impact: 'high'
      });
    }

    if (warnings > 2) {
      recommendations.push({
        title: 'Address Performance Issues',
        description: 'Multiple campaigns showing suboptimal performance. Consider audience segmentation and A/B testing',
        priority: 'high',
        effort: 'high',
        impact: 'high'
      });
    }

    if (opportunities > 1) {
      recommendations.push({
        title: 'Optimize Conversion Funnel',
        description: 'Good email engagement but poor conversion suggests landing page optimization opportunities',
        priority: 'medium',
        effort: 'medium',
        impact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Distribute report to recipient
   */
  private async distributeReport(reportData: ReportData, recipient: string, formats: ReportFormat[]): Promise<void> {
    try {
      console.log(`📤 Distributing report to ${recipient} in formats: ${formats.join(', ')}`);

      // Generate email version
      if (formats.includes('email')) {
        const emailHtml = this.generateReportEmailHTML(reportData);
        const emailText = this.generateReportEmailText(reportData);

        await emailService.sendEmail({
          to: recipient,
          subject: `${reportData.title} - ${reportData.subtitle}`,
          htmlContent: emailHtml,
          textContent: emailText,
          template: 'email_report'
        });
      }

      // Generate CSV attachment if requested
      if (formats.includes('csv')) {
        const csvData = this.generateReportCSV(reportData);
        // TODO: Implement file attachment functionality
      }

      // Generate PDF if requested
      if (formats.includes('pdf')) {
        const pdfBuffer = await this.generateReportPDF(reportData);
        // TODO: Implement PDF attachment functionality
      }

      console.log(`✅ Report distributed to ${recipient}`);
    } catch (error) {
      console.error(`❌ Failed to distribute report to ${recipient}:`, error);
      throw error;
    }
  }

  /**
   * Generate HTML email version of report
   */
  private generateReportEmailHTML(reportData: ReportData): string {
    const { summary, sections } = reportData;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${reportData.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .metric-card { background: #F8F9FA; padding: 15px; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: #3B82F6; }
    .metric-label { color: #666; font-size: 0.9em; }
    .section { margin: 30px 0; padding: 20px; border-left: 4px solid #3B82F6; background: #F8F9FA; }
    .insights { background: #EFF6FF; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .recommendation { background: #ECFDF5; padding: 15px; border-radius: 8px; border-left: 4px solid #10B981; margin: 10px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${reportData.title}</h1>
    <p>${reportData.subtitle}</p>
  </div>

  <div class="summary-grid">
    <div class="metric-card">
      <div class="metric-value">${this.formatNumber(summary.totalEmailsSent)}</div>
      <div class="metric-label">Emails Sent</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${summary.deliveryRate.toFixed(1)}%</div>
      <div class="metric-label">Delivery Rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${summary.openRate.toFixed(1)}%</div>
      <div class="metric-label">Open Rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${summary.clickRate.toFixed(1)}%</div>
      <div class="metric-label">Click Rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">$${this.formatNumber(summary.revenue)}</div>
      <div class="metric-label">Revenue</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${summary.healthScore}</div>
      <div class="metric-label">Health Score</div>
    </div>
  </div>

  <div class="insights">
    <h3>🔍 Key Insights</h3>
    <ul>
      ${summary.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
    </ul>
  </div>

  ${sections.map(section => `
    <div class="section">
      <h3>${section.title}</h3>
      ${this.renderSectionContent(section)}
    </div>
  `).join('')}

  <div class="footer">
    <p>Report generated on ${reportData.generatedAt.toLocaleString()}</p>
    <p>Generation time: ${reportData.metadata.generationTime}ms | Confidence: ${reportData.metadata.confidence}%</p>
    <p>Questions? Contact your email marketing team or visit the <a href="/admin/email-analytics">Analytics Dashboard</a>.</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate text version of report
   */
  private generateReportEmailText(reportData: ReportData): string {
    const { summary } = reportData;
    
    return `
${reportData.title}
${reportData.subtitle}

EMAIL PERFORMANCE SUMMARY
========================
Emails Sent: ${this.formatNumber(summary.totalEmailsSent)}
Delivery Rate: ${summary.deliveryRate.toFixed(1)}%
Open Rate: ${summary.openRate.toFixed(1)}%
Click Rate: ${summary.clickRate.toFixed(1)}%
Revenue: $${this.formatNumber(summary.revenue)}
Health Score: ${summary.healthScore}

KEY INSIGHTS
============
${summary.keyInsights.map(insight => `• ${insight}`).join('\n')}

${reportData.sections.map(section => `
${section.title.toUpperCase()}
${'='.repeat(section.title.length)}
${this.renderSectionContentText(section)}
`).join('\n')}

Report generated on ${reportData.generatedAt.toLocaleString()}
Generation time: ${reportData.metadata.generationTime}ms
Confidence: ${reportData.metadata.confidence}%

Questions? Visit the Analytics Dashboard: /admin/email-analytics
    `;
  }

  /**
   * Helper methods
   */
  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  private calculateReportPeriod(config: ReportConfig): any {
    const now = new Date();
    let start: Date;
    let label: string;

    switch (config.frequency) {
      case 'daily':
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        label = 'Yesterday';
        break;
      case 'weekly':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        label = 'Last 7 Days';
        break;
      case 'monthly':
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        label = 'Last 30 Days';
        break;
      case 'quarterly':
        start = new Date(now);
        start.setMonth(start.getMonth() - 3);
        label = 'Last 90 Days';
        break;
      default:
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        label = 'Last 7 Days';
    }

    return { start, end: now, label };
  }

  private async getReportConfig(configId: string): Promise<ReportConfig | null> {
    try {
      const config = await prisma.reportConfig.findUnique({
        where: { id: configId }
      });
      return config as ReportConfig;
    } catch (error) {
      console.error('❌ Failed to get report config:', error);
      return null;
    }
  }

  // Placeholder methods for various data gathering operations
  private async getPerformanceMetrics(period: any, filters?: ReportFilters): Promise<any> {
    // Implementation for performance metrics
    return {};
  }

  private async getCampaignPerformance(period: any, filters?: ReportFilters): Promise<any[]> {
    // Implementation for campaign performance
    return [];
  }

  private async generateReportSummary(period: any, filters?: ReportFilters): Promise<ReportSummary> {
    // Implementation for report summary
    return {
      totalEmailsSent: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      unsubscribeRate: 0,
      bounceRate: 0,
      revenue: 0,
      roi: 0,
      keyInsights: [],
      healthScore: 0
    };
  }

  private renderSectionContent(section: ReportSection): string {
    // Render section content based on type
    return '<p>Section content placeholder</p>';
  }

  private renderSectionContentText(section: ReportSection): string {
    // Render section content as text
    return 'Section content placeholder';
  }

  // Additional placeholder methods
  private calculateTrends(current: any, previous: any): TrendAnalysis[] { return []; }
  private getMetricsChartData(period: any, filters?: ReportFilters): Promise<any> { return Promise.resolve({}); }
  private getTrendAnalysis(period: any, filters?: ReportFilters): Promise<any> { return Promise.resolve({}); }
  private generateTrendInsights(trends: any): any[] { return []; }
  private getTopPerformingCampaigns(period: any, filters?: ReportFilters): Promise<any[]> { return Promise.resolve([]); }
  private getPreviousPeriod(period: any): any { return period; }
  private getReportTitle(type: ReportType): string { return 'Email Report'; }
  private getReportLimitations(config: ReportConfig): string[] { return []; }
  private generateNextActions(summary: ReportSummary, period: any): Promise<string[]> { return Promise.resolve([]); }
  private async updateNextRunDate(configId: string): Promise<void> {}
  private generateReportCSV(reportData: ReportData): string { return ''; }
  private async generateReportPDF(reportData: ReportData): Promise<Buffer> { return Buffer.from(''); }

  // Placeholder sections for different report types
  private async generateCampaignComparisonSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'campaign_comparison', title: 'Campaign Comparison', type: 'table', priority: 1, content: {} };
  }
  private async generateCampaignInsightsSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'campaign_insights', title: 'Campaign Insights', type: 'text', priority: 2, content: {} };
  }
  private async generateABTestResultsSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'ab_test_results', title: 'A/B Test Results', type: 'chart', priority: 3, content: {} };
  }
  private async generateDeliverabilityMetricsSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'deliverability_metrics', title: 'Deliverability Metrics', type: 'metrics', priority: 1, content: {} };
  }
  private async generateBounceAnalysisSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'bounce_analysis', title: 'Bounce Analysis', type: 'chart', priority: 2, content: {} };
  }
  private async generateReputationSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'reputation', title: 'Sender Reputation', type: 'metrics', priority: 3, content: {} };
  }
  private async generateProviderComparisonSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'provider_comparison', title: 'Provider Comparison', type: 'table', priority: 4, content: {} };
  }
  private async generateEngagementTrendsSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'engagement_trends', title: 'Engagement Trends', type: 'chart', priority: 1, content: {} };
  }
  private async generateAudienceSegmentationSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'audience_segmentation', title: 'Audience Segmentation', type: 'chart', priority: 2, content: {} };
  }
  private async generateGeographicAnalysisSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'geographic_analysis', title: 'Geographic Analysis', type: 'chart', priority: 3, content: {} };
  }
  private async generateDefaultSection(period: any, filters?: ReportFilters): Promise<ReportSection> {
    return { id: 'default', title: 'General Report', type: 'text', priority: 1, content: {} };
  }

  /**
   * Schedule report generation
   */
  async scheduleReport(config: ReportConfig): Promise<{ success: boolean; nextRunDate: Date }> {
    try {
      const nextRunDate = this.calculateNextRunDate(config.frequency);
      
      await prisma.reportConfig.create({
        data: {
          ...config,
          nextRunDate
        }
      });

      console.log(`📅 Report scheduled: ${config.name} - Next run: ${nextRunDate.toISOString()}`);
      
      return { success: true, nextRunDate };
    } catch (error) {
      console.error('❌ Failed to schedule report:', error);
      return { success: false, nextRunDate: new Date() };
    }
  }

  /**
   * Run scheduled reports
   */
  async runScheduledReports(): Promise<void> {
    try {
      const dueReports = await prisma.reportConfig.findMany({
        where: {
          isActive: true,
          nextRunDate: {
            lte: new Date()
          }
        }
      });

      console.log(`🔄 Running ${dueReports.length} scheduled reports`);

      for (const config of dueReports) {
        try {
          await this.generateAndDistribute(config.id);
        } catch (error) {
          console.error(`❌ Failed to run scheduled report ${config.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to run scheduled reports:', error);
    }
  }

  private calculateNextRunDate(frequency: ReportFrequency): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
      default:
        now.setDate(now.getDate() + 7);
    }
    
    return now;
  }
}

// Export singleton instance
export const emailReporting = new EmailReportingSystem();