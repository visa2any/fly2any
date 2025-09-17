import { EmailContact } from '@/lib/email-marketing-database';

// Enterprise A/B Testing Framework for unlimited email campaigns
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Percentage of traffic (0-100)
  subject: string;
  htmlContent: string;
  textContent?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface ABTestConfig {
  id: string;
  campaignId: string;
  name: string;
  description?: string;
  variants: ABTestVariant[];
  testType: 'subject' | 'content' | 'sender' | 'send_time' | 'complete';
  sampleSize: number; // Number or percentage of contacts to test
  winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate' | 'engagement_score';
  confidenceLevel: number; // 95, 99, etc.
  testDuration: number; // Hours to run test before declaring winner
  autoPromote: boolean; // Automatically send winner to remaining contacts
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ABTestResult {
  variantId: string;
  name: string;
  recipients: number;
  opens: number;
  clicks: number;
  conversions: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  engagementScore: number;
  isWinner?: boolean;
  confidenceLevel?: number;
  statisticalSignificance?: boolean;
}

export interface ABTestStats {
  testId: string;
  status: ABTestConfig['status'];
  results: ABTestResult[];
  winner?: ABTestResult;
  recommendedAction?: string;
  nextSteps?: string[];
}

export class EnterpriseABTestingEngine {
  // Create new A/B test
  static createABTest(config: Omit<ABTestConfig, 'id' | 'createdAt' | 'status'>): ABTestConfig {
    const test: ABTestConfig = {
      ...config,
      id: `ab_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'draft',
      createdAt: new Date()
    };

    // Validate configuration
    this.validateABTestConfig(test);
    
    return test;
  }

  // Validate A/B test configuration
  private static validateABTestConfig(config: ABTestConfig): void {
    // Check variant weights sum to 100
    const totalWeight = config.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) {
      throw new Error(`Variant weights must sum to 100% (current: ${totalWeight}%)`);
    }

    // Check minimum 2 variants
    if (config.variants.length < 2) {
      throw new Error('A/B test requires at least 2 variants');
    }

    // Check sample size
    if (config.sampleSize < 100) {
      throw new Error('Minimum sample size is 100 contacts for statistical significance');
    }

    // Check confidence level
    if (config.confidenceLevel < 90 || config.confidenceLevel > 99.9) {
      throw new Error('Confidence level must be between 90% and 99.9%');
    }
  }

  // Distribute contacts across variants
  static distributeContacts(contacts: EmailContact[], variants: ABTestVariant[]): Map<string, EmailContact[]> {
    const distribution = new Map<string, EmailContact[]>();
    
    // Initialize arrays for each variant
    variants.forEach(variant => {
      distribution.set(variant.id, []);
    });

    // Distribute contacts based on variant weights
    contacts.forEach((contact, index) => {
      const variantIndex = this.getVariantForContact(index, contacts.length, variants);
      const variant = variants[variantIndex];
      distribution.get(variant.id)?.push(contact);
    });

    return distribution;
  }

  // Determine which variant a contact should receive
  private static getVariantForContact(
    contactIndex: number, 
    totalContacts: number, 
    variants: ABTestVariant[]
  ): number {
    // Use contact index to ensure consistent distribution
    const position = (contactIndex / totalContacts) * 100;
    let cumulativeWeight = 0;

    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += variants[i].weight;
      if (position <= cumulativeWeight) {
        return i;
      }
    }

    return variants.length - 1; // Fallback to last variant
  }

  // Calculate test results with statistical significance
  static calculateResults(
    testConfig: ABTestConfig,
    campaignStats: Array<{
      variantId: string;
      recipients: number;
      opens: number;
      clicks: number;
      conversions?: number;
    }>
  ): ABTestStats {
    const results: ABTestResult[] = campaignStats.map(stats => {
      const variant = testConfig.variants.find(v => v.id === stats.variantId);
      const openRate = stats.recipients > 0 ? (stats.opens / stats.recipients) * 100 : 0;
      const clickRate = stats.recipients > 0 ? (stats.clicks / stats.recipients) * 100 : 0;
      const conversionRate = stats.recipients > 0 ? ((stats.conversions || 0) / stats.recipients) * 100 : 0;
      
      // Calculate engagement score (weighted combination)
      const engagementScore = (openRate * 0.3) + (clickRate * 0.5) + (conversionRate * 0.2);

      return {
        variantId: stats.variantId,
        name: variant?.name || `Variant ${stats.variantId}`,
        recipients: stats.recipients,
        opens: stats.opens,
        clicks: stats.clicks,
        conversions: stats.conversions || 0,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        conversionRate: Math.round(conversionRate * 10) / 10,
        engagementScore: Math.round(engagementScore * 10) / 10
      };
    });

    // Determine winner based on criteria
    const winner = this.determineWinner(results, testConfig.winnerCriteria, testConfig.confidenceLevel);
    
    // Calculate statistical significance
    results.forEach(result => {
      if (winner && result.variantId !== winner.variantId) {
        result.statisticalSignificance = this.calculateStatisticalSignificance(
          result, 
          winner, 
          testConfig.confidenceLevel
        );
      }
    });

    if (winner) {
      winner.isWinner = true;
      winner.statisticalSignificance = true;
    }

    const testStats: ABTestStats = {
      testId: testConfig.id,
      status: testConfig.status,
      results,
      winner,
      ...this.generateRecommendations(results, winner, testConfig)
    };

    return testStats;
  }

  // Determine the winning variant
  private static determineWinner(
    results: ABTestResult[], 
    criteria: ABTestConfig['winnerCriteria'],
    confidenceLevel: number
  ): ABTestResult | undefined {
    if (results.length === 0) return undefined;

    // Sort by the specified criteria
    const sortedResults = [...results].sort((a, b) => {
      switch (criteria) {
        case 'open_rate':
          return b.openRate - a.openRate;
        case 'click_rate':
          return b.clickRate - a.clickRate;
        case 'conversion_rate':
          return b.conversionRate - a.conversionRate;
        case 'engagement_score':
          return b.engagementScore - a.engagementScore;
        default:
          return b.openRate - a.openRate;
      }
    });

    const potentialWinner = sortedResults[0];
    const runner_up = sortedResults[1];

    // Check if the difference is statistically significant
    if (runner_up && this.calculateStatisticalSignificance(potentialWinner, runner_up, confidenceLevel)) {
      return potentialWinner;
    }

    return undefined; // No statistically significant winner
  }

  // Calculate statistical significance using z-test for proportions
  private static calculateStatisticalSignificance(
    variant1: ABTestResult,
    variant2: ABTestResult,
    confidenceLevel: number
  ): boolean {
    // Use click rate for significance testing
    const p1 = variant1.clickRate / 100;
    const p2 = variant2.clickRate / 100;
    const n1 = variant1.recipients;
    const n2 = variant2.recipients;

    // Calculate pooled proportion
    const pooledP = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
    
    // Calculate standard error
    const se = Math.sqrt(pooledP * (1 - pooledP) * ((1/n1) + (1/n2)));
    
    // Calculate z-score
    const z = Math.abs(p1 - p2) / se;
    
    // Get critical value for confidence level
    const criticalValues: Record<number, number> = {
      90: 1.645,
      95: 1.96,
      99: 2.576,
      99.9: 3.291
    };
    
    const criticalValue = criticalValues[confidenceLevel] || 1.96;
    
    return z > criticalValue;
  }

  // Generate recommendations based on test results
  private static generateRecommendations(
    results: ABTestResult[],
    winner: ABTestResult | undefined,
    config: ABTestConfig
  ): { recommendedAction?: string; nextSteps?: string[] } {
    if (!winner) {
      return {
        recommendedAction: '⏳ Continue testing - no statistically significant winner yet',
        nextSteps: [
          '📊 Increase sample size for better statistical power',
          '⏰ Allow more time for data collection',
          '🎯 Consider testing more distinct variants',
          '📈 Review test criteria and adjust if necessary'
        ]
      };
    }

    const improvement = results.length > 1 
      ? ((winner.clickRate - results.filter(r => !r.isWinner)[0]?.clickRate) / results.filter(r => !r.isWinner)[0]?.clickRate * 100)
      : 0;

    return {
      recommendedAction: `🎉 Send "${winner.name}" to remaining ${config.sampleSize} contacts`,
      nextSteps: [
        `✅ "${winner.name}" won with ${winner.clickRate}% click rate`,
        `📈 Performance improvement: +${Math.round(improvement)}%`,
        '🚀 Deploy winning variant to full campaign',
        '📋 Document learnings for future campaigns',
        '🎯 Test similar approaches in upcoming campaigns'
      ]
    };
  }

  // Generate A/B test variants automatically
  static generateAutoVariants(
    baseSubject: string,
    baseContent: string,
    testType: ABTestConfig['testType'] = 'subject'
  ): ABTestVariant[] {
    const variants: ABTestVariant[] = [];

    switch (testType) {
      case 'subject':
        variants.push(
          {
            id: 'control',
            name: 'Original Subject',
            weight: 50,
            subject: baseSubject,
            htmlContent: baseContent
          },
          {
            id: 'personalized',
            name: 'Personalized Subject',
            weight: 50,
            subject: `{{first_name}}, ${baseSubject.toLowerCase()}`,
            htmlContent: baseContent
          }
        );
        break;

      case 'content':
        variants.push(
          {
            id: 'control',
            name: 'Original Content',
            weight: 50,
            subject: baseSubject,
            htmlContent: baseContent
          },
          {
            id: 'benefit_focused',
            name: 'Benefit-Focused Content',
            weight: 50,
            subject: baseSubject,
            htmlContent: this.enhanceContentWithBenefits(baseContent)
          }
        );
        break;

      case 'complete':
        variants.push(
          {
            id: 'control',
            name: 'Original',
            weight: 25,
            subject: baseSubject,
            htmlContent: baseContent
          },
          {
            id: 'urgent',
            name: 'Urgent Subject + CTA',
            weight: 25,
            subject: `🚨 Urgente: ${baseSubject}`,
            htmlContent: this.addUrgencyToCTA(baseContent)
          },
          {
            id: 'personalized',
            name: 'Personalized',
            weight: 25,
            subject: `{{first_name}}, ${baseSubject.toLowerCase()}`,
            htmlContent: this.personalizeContent(baseContent)
          },
          {
            id: 'benefit_focused',
            name: 'Benefit-Focused',
            weight: 25,
            subject: `✅ ${baseSubject} - Aprovado para você!`,
            htmlContent: this.enhanceContentWithBenefits(baseContent)
          }
        );
        break;

      default:
        variants.push({
          id: 'control',
          name: 'Control',
          weight: 100,
          subject: baseSubject,
          htmlContent: baseContent
        });
    }

    return variants;
  }

  // Helper methods for content enhancement
  private static enhanceContentWithBenefits(content: string): string {
    const benefitsHeader = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 18px;">✅ Benefícios Exclusivos Para Você:</h3>
        <ul style="list-style: none; padding: 0; margin: 10px 0 0 0;">
          <li>🎯 Ofertas personalizadas</li>
          <li>🚀 Entrega rápida garantida</li>
          <li>💎 Suporte premium 24/7</li>
        </ul>
      </div>
    `;
    
    return benefitsHeader + content;
  }

  private static addUrgencyToCTA(content: string): string {
    // Add urgency indicators to CTA buttons
    return content
      .replace(/(<a[^>]*class[^>]*btn[^>]*>)([^<]*)/gi, '$1⏰ $2 - Só hoje!')
      .replace(/(<button[^>]*>)([^<]*)/gi, '$1🚨 $2 - Últimas horas!');
  }

  private static personalizeContent(content: string): string {
    const personalizedHeader = `
      <div style="background-color: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px;">
        <p style="margin: 0;"><strong>Olá {{first_name}}!</strong> Esta oferta foi selecionada especialmente para você com base no seu perfil e interesses.</p>
      </div>
    `;
    
    return personalizedHeader + content;
  }
}

// Enterprise A/B Testing Templates
export const enterpriseABTestTemplates = {
  subjectLineTests: [
    {
      name: 'Personalization vs Generic',
      variants: [
        { subject: 'Oferta especial para você', type: 'generic' },
        { subject: '{{first_name}}, oferta especial para você!', type: 'personalized' }
      ]
    },
    {
      name: 'Urgency vs Benefit',
      variants: [
        { subject: '⏰ Últimas horas - Oferta imperdível!', type: 'urgency' },
        { subject: '✅ Benefícios exclusivos esperando por você', type: 'benefit' }
      ]
    }
  ],
  
  contentTests: [
    {
      name: 'Short vs Long Form',
      variants: [
        { description: 'Concise message with clear CTA', type: 'short' },
        { description: 'Detailed explanation with multiple benefits', type: 'long' }
      ]
    },
    {
      name: 'Text vs Visual Heavy',
      variants: [
        { description: 'Text-focused content with minimal images', type: 'text' },
        { description: 'Visual-heavy design with infographics', type: 'visual' }
      ]
    }
  ]
};