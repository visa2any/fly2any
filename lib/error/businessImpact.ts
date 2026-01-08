/**
 * Business Impact Assessment Utility
 * 
 * Analyzes errors and predicts their business impact in terms of:
 * - Revenue loss
 * - Customer satisfaction
 * - Support ticket volume
 * - Brand reputation
 */

export interface BusinessImpactMetrics {
  revenueLoss: {
    estimatedAmount: number; // in USD
    confidence: number; // 0 to 1
    factors: Array<{
      factor: string;
      impact: number;
      description: string;
    }>;
  };
  customerSatisfaction: {
    score: number; // 0 to 100
    trend: 'improving' | 'stable' | 'declining';
    factors: Array<{
      factor: string;
      impact: number; // -1 to 1
      description: string;
    }>;
  };
  supportVolume: {
    predictedTickets: number;
    currentTickets: number;
    trend: number; // percentage change
  };
  reputationRisk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  recommendations: string[];
}

export interface ErrorContext {
  errorCount: number;
  errorSeverity: number; // 0-1 normalized
  affectedUsers: number;
  timeWindow: number; // hours
  category: string;
  isPublicFacing: boolean;
  conversionPathAffected: boolean;
}

/**
 * Calculate business impact of errors
 */
export function calculateBusinessImpact(
  errorContext: ErrorContext,
  historicalData?: {
    revenuePerUser?: number;
    supportCostPerTicket?: number;
    satisfactionBaseline?: number;
  }
): BusinessImpactMetrics {
  const defaultRevenuePerUser = historicalData?.revenuePerUser || 100; // Default $100 per user
  const defaultSupportCost = historicalData?.supportCostPerTicket || 25; // Default $25 per ticket
  const satisfactionBaseline = historicalData?.satisfactionBaseline || 85; // Default 85/100

  // Revenue loss calculation
  const estimatedAffectedRevenue = errorContext.affectedUsers * defaultRevenuePerUser * 0.1; // Assume 10% of revenue at risk
  const severityMultiplier = errorContext.errorSeverity;
  const publicFacingMultiplier = errorContext.isPublicFacing ? 1.5 : 1;
  const conversionImpactMultiplier = errorContext.conversionPathAffected ? 2 : 1;

  const revenueLossAmount = estimatedAffectedRevenue * severityMultiplier * publicFacingMultiplier * conversionImpactMultiplier;

  // Support volume prediction
  const baseTickets = errorContext.errorCount * 0.3; // Assume 30% of errors generate tickets
  const severityTicketMultiplier = 1 + (errorContext.errorSeverity * 0.5); // Higher severity = more tickets
  const predictedTickets = baseTickets * severityTicketMultiplier;

  // Customer satisfaction impact
  const errorDensity = errorContext.errorCount / (errorContext.timeWindow || 1);
  const satisfactionImpact = Math.max(0, satisfactionBaseline - (errorDensity * 10 * errorContext.errorSeverity));
  const satisfactionTrend = errorDensity > 5 ? 'declining' : errorDensity > 2 ? 'stable' : 'improving';

  // Reputation risk
  let reputationLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const riskScore = errorContext.errorCount * errorContext.errorSeverity * (errorContext.isPublicFacing ? 2 : 1);
  if (riskScore > 50) reputationLevel = 'critical';
  else if (riskScore > 20) reputationLevel = 'high';
  else if (riskScore > 5) reputationLevel = 'medium';

  const recommendations = generateRecommendations(errorContext, riskScore, reputationLevel);

  return {
    revenueLoss: {
      estimatedAmount: Math.round(revenueLossAmount),
      confidence: 0.7, // Based on model confidence
      factors: [
        {
          factor: 'Affected Users',
          impact: errorContext.affectedUsers * 0.1,
          description: `Estimated ${errorContext.affectedUsers} users affected`,
        },
        {
          factor: 'Error Severity',
          impact: severityMultiplier,
          description: `Severity level: ${(errorContext.errorSeverity * 100).toFixed(0)}%`,
        },
        {
          factor: 'Public Facing',
          impact: publicFacingMultiplier,
          description: errorContext.isPublicFacing ? 'Public-facing error' : 'Internal error',
        },
      ],
    },
    customerSatisfaction: {
      score: Math.max(0, Math.min(100, satisfactionImpact)),
      trend: satisfactionTrend,
      factors: [
        {
          factor: 'Error Frequency',
          impact: -errorDensity * 0.2,
          description: `${errorDensity.toFixed(1)} errors per hour`,
        },
        {
          factor: 'Severity Impact',
          impact: -errorContext.errorSeverity * 0.3,
          description: 'High severity errors reduce satisfaction',
        },
      ],
    },
    supportVolume: {
      predictedTickets: Math.round(predictedTickets),
      currentTickets: Math.round(predictedTickets * 0.7), // Assume 70% already created
      trend: errorContext.errorCount > 10 ? 25 : errorContext.errorCount > 5 ? 10 : -5,
    },
    reputationRisk: {
      level: reputationLevel,
      factors: [
        errorContext.isPublicFacing ? 'Public-facing error' : null,
        errorContext.conversionPathAffected ? 'Affects conversion funnel' : null,
        errorContext.errorSeverity > 0.7 ? 'High severity errors' : null,
        errorContext.errorCount > 10 ? 'High error frequency' : null,
      ].filter(Boolean) as string[],
    },
    recommendations,
  };
}

function generateRecommendations(
  context: ErrorContext,
  riskScore: number,
  reputationLevel: string
): string[] {
  const recommendations: string[] = [];

  if (context.errorCount > 20) {
    recommendations.push('Implement immediate error triage and assign dedicated team');
  } else if (context.errorCount > 10) {
    recommendations.push('Schedule urgent review of error patterns');
  }

  if (context.errorSeverity > 0.8) {
    recommendations.push('Prioritize fixing critical errors affecting user experience');
  }

  if (context.isPublicFacing) {
    recommendations.push('Consider proactive communication with affected users');
  }

  if (context.conversionPathAffected) {
    recommendations.push('Monitor conversion metrics closely and implement fallback flows');
  }

  if (riskScore > 30) {
    recommendations.push('Escalate to engineering leadership for immediate attention');
  }

  if (reputationLevel === 'critical' || reputationLevel === 'high') {
    recommendations.push('Prepare incident report and customer communication plan');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring; current error levels are within acceptable range');
  }

  return recommendations;
}

/**
 * Calculate cumulative business impact over time
 */
export function calculateCumulativeImpact(
  errorContexts: ErrorContext[],
  timeWindow: number // in days
): BusinessImpactMetrics & {
  totalRevenueAtRisk: number;
  totalSupportCost: number;
} {
  const impacts = errorContexts.map(ctx => calculateBusinessImpact(ctx));
  
  const totalRevenueAtRisk = impacts.reduce((sum, impact) => sum + impact.revenueLoss.estimatedAmount, 0);
  const totalSupportCost = impacts.reduce((sum, impact) => sum + (impact.supportVolume.predictedTickets * 25), 0); // $25 per ticket
  
  const avgSatisfaction = impacts.reduce((sum, impact) => sum + impact.customerSatisfaction.score, 0) / impacts.length;
  
  // Determine overall reputation risk (highest from all impacts)
  const riskLevels = { low: 0, medium: 1, high: 2, critical: 3 };
  const overallReputationLevel = impacts.reduce((highest, impact) => {
    return riskLevels[impact.reputationRisk.level] > riskLevels[highest] ? impact.reputationRisk.level : highest;
  }, 'low' as 'low' | 'medium' | 'high' | 'critical');

  // Combine recommendations
  const allRecommendations = Array.from(new Set(impacts.flatMap(impact => impact.recommendations)));

  return {
    revenueLoss: {
      estimatedAmount: totalRevenueAtRisk,
      confidence: 0.8,
      factors: [
        {
          factor: 'Cumulative Impact',
          impact: totalRevenueAtRisk / 1000, // Normalized
          description: `Total revenue at risk over ${timeWindow} days`,
        },
      ],
    },
    customerSatisfaction: {
      score: avgSatisfaction,
      trend: avgSatisfaction < 70 ? 'declining' : avgSatisfaction < 80 ? 'stable' : 'improving',
      factors: [
        {
          factor: 'Aggregate Score',
          impact: (avgSatisfaction - 50) / 50, // Normalized to -1 to 1
          description: `Average satisfaction across ${errorContexts.length} error contexts`,
        },
      ],
    },
    supportVolume: {
      predictedTickets: impacts.reduce((sum, impact) => sum + impact.supportVolume.predictedTickets, 0),
      currentTickets: impacts.reduce((sum, impact) => sum + impact.supportVolume.currentTickets, 0),
      trend: 15, // Average trend
    },
    reputationRisk: {
      level: overallReputationLevel,
      factors: Array.from(new Set(impacts.flatMap(impact => impact.reputationRisk.factors))),
    },
    recommendations: allRecommendations.slice(0, 5), // Top 5 recommendations
    totalRevenueAtRisk,
    totalSupportCost,
  };
}

/**
 * Generate a business impact report for stakeholders
 */
export function generateImpactReport(
  impact: BusinessImpactMetrics,
  options?: {
    includeExecutiveSummary?: boolean;
    includeTechnicalDetails?: boolean;
    format?: 'text' | 'html' | 'markdown';
  }
): string {
  const format = options?.format || 'text';
  const includeExecutiveSummary = options?.includeExecutiveSummary ?? true;
  const includeTechnicalDetails = options?.includeTechnicalDetails ?? false;

  if (format === 'markdown') {
    return generateMarkdownReport(impact, includeExecutiveSummary, includeTechnicalDetails);
  } else if (format === 'html') {
    return generateHTMLReport(impact, includeExecutiveSummary, includeTechnicalDetails);
  } else {
    return generateTextReport(impact, includeExecutiveSummary, includeTechnicalDetails);
  }
}

function generateTextReport(
  impact: BusinessImpactMetrics,
  includeExecutiveSummary: boolean,
  includeTechnicalDetails: boolean
): string {
  let report = 'BUSINESS IMPACT ASSESSMENT REPORT\n';
  report += '=====================================\n\n';

  if (includeExecutiveSummary) {
    report += 'EXECUTIVE SUMMARY\n';
    report += '-----------------\n';
    report += `Revenue at Risk: $${impact.revenueLoss.estimatedAmount.toLocaleString()}\n`;
    report += `Customer Satisfaction: ${impact.customerSatisfaction.score.toFixed(0)}/100 (${impact.customerSatisfaction.trend})\n`;
    report += `Predicted Support Tickets: ${impact.supportVolume.predictedTickets}\n`;
    report += `Reputation Risk: ${impact.reputationRisk.level.toUpperCase()}\n\n`;
  }

  report += 'DETAILED ANALYSIS\n';
  report += '-----------------\n';

  report += 'Revenue Impact:\n';
  impact.revenueLoss.factors.forEach(factor => {
    report += `  - ${factor.factor}: ${factor.description} (Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(2)})\n`;
  });
  report += `  Confidence: ${(impact.revenueLoss.confidence * 100).toFixed(0)}%\n\n`;

  report += 'Customer Satisfaction:\n';
  report += `  Score: ${impact.customerSatisfaction.score.toFixed(0)}/100\n`;
  report += `  Trend: ${impact.customerSatisfaction.trend}\n`;
  impact.customerSatisfaction.factors.forEach(factor => {
    report += `  - ${factor.factor}: ${factor.description} (Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(2)})\n`;
  });
  report += '\n';

  report += 'Support Volume:\n';
  report += `  Predicted Tickets: ${impact.supportVolume.predictedTickets}\n`;
  report += `  Current Tickets: ${impact.supportVolume.currentTickets}\n`;
  report += `  Trend: ${impact.supportVolume.trend > 0 ? '+' : ''}${impact.supportVolume.trend}%\n\n`;

  report += 'Reputation Risk:\n';
  report += `  Level: ${impact.reputationRisk.level.toUpperCase()}\n`;
  if (impact.reputationRisk.factors.length > 0) {
    report += '  Factors:\n';
    impact.reputationRisk.factors.forEach(factor => {
      report += `    - ${factor}\n`;
    });
  }
  report += '\n';

  report += 'RECOMMENDATIONS\n';
  report += '---------------\n';
  impact.recommendations.forEach((rec, index) => {
    report += `${index + 1}. ${rec}\n`;
  });

  return report;
}

function generateMarkdownReport(
  impact: BusinessImpactMetrics,
  includeExecutiveSummary: boolean,
  includeTechnicalDetails: boolean
): string {
  let report = '# Business Impact Assessment Report\n\n';

  if (includeExecutiveSummary) {
    report += '## Executive Summary\n\n';
    report += `| Metric | Value |\n`;
    report += `|--------|-------|\n`;
    report += `| Revenue at Risk | $${impact.revenueLoss.estimatedAmount.toLocaleString()} |\n`;
    report += `| Customer Satisfaction | ${impact.customerSatisfaction.score.toFixed(0)}/100 (${impact.customerSatisfaction.trend}) |\n`;
    report += `| Predicted Support Tickets | ${impact.supportVolume.predictedTickets} |\n`;
    report += `| Reputation Risk | ${impact.reputationRisk.level.toUpperCase()} |\n\n`;
  }

  report += '## Detailed Analysis\n\n';

  report += '### Revenue Impact\n\n';
  report += `- Estimated Loss: **$${impact.revenueLoss.estimatedAmount.toLocaleString()}**\n`;
  report += `- Confidence: **${(impact.revenueLoss.confidence * 100).toFixed(0)}%**\n`;
  report += '- Factors:\n';
  impact.revenueLoss.factors.forEach(factor => {
    report += `  - ${factor.factor}: ${factor.description} (Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(2)})\n`;
  });
  report += '\n';

  report += '### Customer Satisfaction\n\n';
  report += `- Score: **${impact.customerSatisfaction.score.toFixed(0)}/100**\n`;
  report += `- Trend: **${impact.customerSatisfaction.trend}**\n`;
  report += '- Factors:\n';
  impact.customerSatisfaction.factors.forEach(factor => {
    report += `  - ${factor.factor}: ${factor.description} (Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(2)})\n`;
  });
  report += '\n';

  report += '### Support Volume\n\n';
  report += `- Predicted Tickets: **${impact.supportVolume.predictedTickets}**\n`;
  report += `- Current Tickets: **${impact.supportVolume.currentTickets}**\n`;
  report += `- Trend: **${impact.supportVolume.trend > 0 ? '+' : ''}${impact.supportVolume.trend}%**\n\n`;

  report += '### Reputation Risk\n\n';
  report += `- Level: **${impact.reputationRisk.level.toUpperCase()}**\n`;
  if (impact.reputationRisk.factors.length > 0) {
    report += '- Factors:\n';
    impact.reputationRisk.factors.forEach(factor => {
      report += `  - ${factor}\n`;
    });
  }
  report += '\n';

  report += '## Recommendations\n\n';
  impact.recommendations.forEach((rec, index) => {
    report += `${index + 1}. ${rec}\n`;
  });

  return report;
}

function generateHTMLReport(
  impact: BusinessImpactMetrics,
  includeExecutiveSummary: boolean,
  includeTechnicalDetails: boolean
): string {
  let report = `
<!DOCTYPE html>
<html>
<head>
  <title>Business Impact Assessment Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f4f4f4; }
    .risk-low { color: green; }
    .risk-medium { color: orange; }
    .risk-high { color: #e67e22; }
    .risk-critical { color: red; }
    .recommendation { background-color: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 4px solid #3498db; }
  </style>
</head>
<body>
  <h1>Business Impact Assessment Report</h1>
  `;

  if (includeExecutiveSummary) {
    report += `
  <h2>Executive Summary</h2>
  <table>
    <tr>
      <th>Metric</th>
      <th>Value</th>
    </tr>
    <tr>
      <td>Revenue at Risk</td>
      <td>$${impact.revenueLoss.estimatedAmount.toLocaleString()}</td>
    </tr>
    <tr>
      <td>Customer Satisfaction</td>
      <td>${impact.customerSatisfaction.score.toFixed(0)}/100 (${impact.customerSatisfaction.trend})</td>
    </tr>
    <tr>
      <td>Predicted Support Tickets</td>
      <td>${impact.supportVolume.predictedTickets}</td>
    </tr>
    <tr>
      <td>Reputation Risk</td>
      <td class="risk-${impact.reputationRisk.level}">${impact.reputationRisk.level.toUpperCase()}</td>
    </tr>
  </table>
    `;
  }

  report += `
  <h2>Detailed Analysis</h2>
  
  <h3>Revenue Impact</h3>
  <p><strong>Estimated Loss:</strong> $${impact.revenueLoss.estimatedAmount.toLocaleString()}</p>
  <p><strong>Confidence:</strong> ${(impact.revenueLoss.confidence * 100).toFixed(0)}%</p>
  <ul>
  `;
  
  impact.revenueLoss.factors.forEach(factor => {
    report += `<li>${factor.factor}: ${factor.description} (Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(2)})</li>`;
  });
  
  report += `
  </ul>
  
  <h3>Customer Satisfaction</h3>
  <p><strong>Score:</strong> ${impact.customerSatisfaction.score.toFixed(0)}/100</p>
  <p><strong>Trend:</strong> ${impact.customerSatisfaction.trend}</p>
  <ul>
  `;
  
  impact.customerSatisfaction.factors.forEach(factor => {
    report += `<li>${factor.factor}: ${factor.description} (Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(2)})</li>`;
  });
  
  report += `
  </ul>
  
  <h3>Support Volume</h3>
  <p><strong>Predicted Tickets:</strong> ${impact.supportVolume.predictedTickets}</p>
  <p><strong>Current Tickets:</strong> ${impact.supportVolume.currentTickets}</p>
  <p><strong>Trend:</strong> ${impact.supportVolume.trend > 0 ? '+' : ''}${impact.supportVolume.trend}%</p>
  
  <h3>Reputation Risk</h3>
  <p class="risk-${impact.reputationRisk.level}"><strong>Level:</strong> ${impact.reputationRisk.level.toUpperCase()}</p>
  `;
  
  if (impact.reputationRisk.factors.length > 0) {
    report += '<ul>';
    impact.reputationRisk.factors.forEach(factor => {
      report += `<li>${factor}</li>`;
    });
    report += '</ul>';
  }
  
  report += `
  <h2>Recommendations</h2>
  `;
  
  impact.recommendations.forEach((rec, index) => {
    report += `<div class="recommendation"><strong>${index + 1}.</strong> ${rec}</div>`;
  });
  
  report += `
</body>
</html>
  `;
  
  return report;
}