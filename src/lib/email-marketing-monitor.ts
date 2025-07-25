/**
 * Sistema de Monitoramento Avançado para Email Marketing
 * Monitora performance, detecta problemas e gera alertas automáticos
 */

import { sql } from '@vercel/postgres';
import { EmailTrackingSystem } from './email-tracking';
import { emailMarketingLogger } from './email-marketing-logger';

export interface PerformanceMetrics {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  unsubscribeRate: number;
  avgTimeToOpen: number; // em minutos
  peakOpeningHours: number[];
  geoDistribution: Record<string, number>;
  deviceDistribution: Record<string, number>;
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  lastCheck: Date;
}

export interface CampaignInsights {
  campaignId: string;
  performance: PerformanceMetrics;
  health: HealthStatus;
  trends: {
    openRate: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
    clickRate: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
    bounceRate: { current: number; previous: number; trend: 'up' | 'down' | 'stable' };
  };
  predictions: {
    estimatedDeliveryTime: number; // minutos
    expectedFinalOpenRate: number;
    riskFactors: string[];
  };
}

export class EmailMarketingMonitor {

  /**
   * Analisa performance de uma campanha específica
   */
  static async analyzeCampaignPerformance(campaignId: string): Promise<CampaignInsights> {
    try {
      const metrics = await this.calculatePerformanceMetrics(campaignId);
      const health = await this.assessCampaignHealth(campaignId, metrics);
      const trends = await this.calculateTrends(campaignId);
      const predictions = await this.generatePredictions(campaignId, metrics);

      return {
        campaignId,
        performance: metrics,
        health,
        trends,
        predictions
      };
    } catch (error) {
      console.error('❌ Erro na análise de performance:', error);
      throw error;
    }
  }

  /**
   * Calcula métricas detalhadas de performance
   */
  private static async calculatePerformanceMetrics(campaignId: string): Promise<PerformanceMetrics> {
    const [basicMetrics, timeMetrics, geoMetrics, deviceMetrics] = await Promise.all([
      this.getBasicMetrics(campaignId),
      this.getTimeMetrics(campaignId),
      this.getGeoMetrics(campaignId),
      this.getDeviceMetrics(campaignId)
    ]);

    return {
      deliveryRate: basicMetrics.deliveryRate,
      openRate: basicMetrics.openRate,
      clickRate: basicMetrics.clickRate,
      bounceRate: basicMetrics.bounceRate,
      complaintRate: basicMetrics.complaintRate,
      unsubscribeRate: basicMetrics.unsubscribeRate,
      avgTimeToOpen: timeMetrics.avgTimeToOpen,
      peakOpeningHours: timeMetrics.peakHours,
      geoDistribution: geoMetrics,
      deviceDistribution: deviceMetrics
    };
  }

  /**
   * Métricas básicas de delivery e engajamento
   */
  private static async getBasicMetrics(campaignId: string): Promise<any> {
    const result = await sql`
      SELECT 
        event_type,
        COUNT(*) as count
      FROM email_tracking_events 
      WHERE campaign_id = ${campaignId}
      GROUP BY event_type
    `;

    const counts: Record<string, number> = {};
    result.rows.forEach(row => {
      counts[row.event_type] = parseInt(row.count);
    });

    const sent = counts.sent || 0;
    const delivered = counts.delivered || 0;
    const opened = counts.opened || 0;
    const clicked = counts.clicked || 0;
    const bounced = counts.bounced || 0;
    const complained = counts.complained || 0;
    const unsubscribed = counts.unsubscribed || 0;

    return {
      deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
      complaintRate: delivered > 0 ? (complained / delivered) * 100 : 0,
      unsubscribeRate: delivered > 0 ? (unsubscribed / delivered) * 100 : 0
    };
  }

  /**
   * Métricas de timing e padrões temporais
   */
  private static async getTimeMetrics(campaignId: string): Promise<any> {
    const result = await sql`
      SELECT 
        EXTRACT(EPOCH FROM (
          MIN(CASE WHEN event_type = 'opened' THEN timestamp END) - 
          MIN(CASE WHEN event_type = 'sent' THEN timestamp END)
        )) / 60 as avg_time_to_open,
        EXTRACT(HOUR FROM timestamp) as hour,
        COUNT(*) as opens
      FROM email_tracking_events 
      WHERE campaign_id = ${campaignId} 
        AND event_type IN ('sent', 'opened')
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY opens DESC
    `;

    const avgTimeToOpen = result.rows[0]?.avg_time_to_open || 0;
    const peakHours = result.rows.slice(0, 3).map(row => parseInt(row.hour));

    return {
      avgTimeToOpen: Math.round(avgTimeToOpen),
      peakHours
    };
  }

  /**
   * Distribuição geográfica (baseada em IP)
   */
  private static async getGeoMetrics(campaignId: string): Promise<Record<string, number>> {
    // Implementação simplificada - em produção usar serviço de geolocalização
    const result = await sql`
      SELECT 
        COALESCE(location, 'Unknown') as location,
        COUNT(*) as count
      FROM email_tracking_events 
      WHERE campaign_id = ${campaignId} 
        AND event_type = 'opened'
      GROUP BY location
      ORDER BY count DESC
    `;

    const distribution: Record<string, number> = {};
    result.rows.forEach(row => {
      distribution[row.location] = parseInt(row.count);
    });

    return distribution;
  }

  /**
   * Distribuição de dispositivos (baseada em User-Agent)
   */
  private static async getDeviceMetrics(campaignId: string): Promise<Record<string, number>> {
    const result = await sql`
      SELECT 
        user_agent,
        COUNT(*) as count
      FROM email_tracking_events 
      WHERE campaign_id = ${campaignId} 
        AND event_type = 'opened'
        AND user_agent IS NOT NULL
      GROUP BY user_agent
    `;

    const distribution: Record<string, number> = {
      'Mobile': 0,
      'Desktop': 0,
      'Tablet': 0,
      'Unknown': 0
    };

    result.rows.forEach(row => {
      const ua = row.user_agent.toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        distribution['Mobile'] += parseInt(row.count);
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        distribution['Tablet'] += parseInt(row.count);
      } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('firefox')) {
        distribution['Desktop'] += parseInt(row.count);
      } else {
        distribution['Unknown'] += parseInt(row.count);
      }
    });

    return distribution;
  }

  /**
   * Avalia saúde da campanha
   */
  private static async assessCampaignHealth(campaignId: string, metrics: PerformanceMetrics): Promise<HealthStatus> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Avaliar taxa de bounce
    if (metrics.bounceRate > 10) {
      issues.push('Taxa de bounce muito alta');
      recommendations.push('Verificar qualidade da lista de emails');
      score -= 30;
    } else if (metrics.bounceRate > 5) {
      issues.push('Taxa de bounce elevada');
      recommendations.push('Revisar segmentação da audiência');
      score -= 15;
    }

    // Avaliar taxa de abertura
    if (metrics.openRate < 15) {
      issues.push('Taxa de abertura baixa');
      recommendations.push('Melhorar linha de assunto e horário de envio');
      score -= 20;
    } else if (metrics.openRate < 20) {
      issues.push('Taxa de abertura abaixo da média');
      recommendations.push('Testar diferentes assuntos');
      score -= 10;
    }

    // Avaliar taxa de clique
    if (metrics.clickRate < 2) {
      issues.push('Taxa de clique baixa');
      recommendations.push('Melhorar call-to-actions e conteúdo');
      score -= 15;
    }

    // Avaliar taxa de reclamação
    if (metrics.complaintRate > 0.5) {
      issues.push('Taxa de reclamação alta');
      recommendations.push('Revisar frequência e relevância do conteúdo');
      score -= 25;
    }

    // Determinar status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (score < 50) {
      status = 'critical';
    } else if (score < 75) {
      status = 'warning';
    }

    return {
      status,
      score: Math.max(0, score),
      issues,
      recommendations,
      lastCheck: new Date()
    };
  }

  /**
   * Calcula tendências comparando com campanhas anteriores
   */
  private static async calculateTrends(campaignId: string): Promise<any> {
    // Buscar campanha anterior para comparação
    const previousCampaign = await sql`
      SELECT id FROM email_campaigns 
      WHERE created_at < (SELECT created_at FROM email_campaigns WHERE id = ${campaignId})
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    if (previousCampaign.rows.length === 0) {
      return {
        openRate: { current: 0, previous: 0, trend: 'stable' },
        clickRate: { current: 0, previous: 0, trend: 'stable' },
        bounceRate: { current: 0, previous: 0, trend: 'stable' }
      };
    }

    const prevCampaignId = previousCampaign.rows[0].id;
    const [currentMetrics, previousMetrics] = await Promise.all([
      EmailTrackingSystem.getCampaignMetrics(campaignId),
      EmailTrackingSystem.getCampaignMetrics(prevCampaignId)
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (Math.abs(current - previous) < 1) return 'stable';
      return current > previous ? 'up' : 'down';
    };

    return {
      openRate: {
        current: currentMetrics.openRate,
        previous: previousMetrics.openRate,
        trend: calculateTrend(currentMetrics.openRate, previousMetrics.openRate)
      },
      clickRate: {
        current: currentMetrics.clickRate,
        previous: previousMetrics.clickRate,
        trend: calculateTrend(currentMetrics.clickRate, previousMetrics.clickRate)
      },
      bounceRate: {
        current: currentMetrics.bounceRate,
        previous: previousMetrics.bounceRate,
        trend: calculateTrend(currentMetrics.bounceRate, previousMetrics.bounceRate)
      }
    };
  }

  /**
   * Gera predições baseadas em padrões históricos
   */
  private static async generatePredictions(campaignId: string, metrics: PerformanceMetrics): Promise<any> {
    const riskFactors: string[] = [];

    // Analisar fatores de risco
    if (metrics.bounceRate > 5) riskFactors.push('Alta taxa de bounce');
    if (metrics.complaintRate > 0.1) riskFactors.push('Risco de spam');
    if (metrics.openRate < 15) riskFactors.push('Baixo engajamento');

    // Estimativas baseadas em padrões típicos
    const estimatedDeliveryTime = Math.round(60 + (metrics.avgTimeToOpen * 0.1)); // minutos
    const expectedFinalOpenRate = metrics.openRate * 1.2; // abertura continua após primeiras horas

    return {
      estimatedDeliveryTime,
      expectedFinalOpenRate: Math.min(expectedFinalOpenRate, 100),
      riskFactors
    };
  }

  /**
   * Gera relatório de análise completa
   */
  static async generateAnalysisReport(campaignId: string): Promise<string> {
    try {
      const insights = await this.analyzeCampaignPerformance(campaignId);
      
      const report = `
📊 RELATÓRIO DE ANÁLISE - CAMPANHA ${campaignId}
═══════════════════════════════════════════════

🎯 PERFORMANCE
- Taxa de Entrega: ${insights.performance.deliveryRate.toFixed(1)}%
- Taxa de Abertura: ${insights.performance.openRate.toFixed(1)}%
- Taxa de Clique: ${insights.performance.clickRate.toFixed(1)}%
- Taxa de Bounce: ${insights.performance.bounceRate.toFixed(1)}%

🏥 SAÚDE DA CAMPANHA
Status: ${insights.health.status.toUpperCase()}
Score: ${insights.health.score}/100

⚠️ PROBLEMAS IDENTIFICADOS:
${insights.health.issues.map(issue => `- ${issue}`).join('\n')}

💡 RECOMENDAÇÕES:
${insights.health.recommendations.map(rec => `- ${rec}`).join('\n')}

📈 TENDÊNCIAS
- Abertura: ${insights.trends.openRate.trend === 'up' ? '📈' : insights.trends.openRate.trend === 'down' ? '📉' : '➡️'} ${insights.trends.openRate.current.toFixed(1)}% (anterior: ${insights.trends.openRate.previous.toFixed(1)}%)
- Clique: ${insights.trends.clickRate.trend === 'up' ? '📈' : insights.trends.clickRate.trend === 'down' ? '📉' : '➡️'} ${insights.trends.clickRate.current.toFixed(1)}% (anterior: ${insights.trends.clickRate.previous.toFixed(1)}%)

🔮 PREDIÇÕES
- Tempo estimado de entrega: ${insights.predictions.estimatedDeliveryTime} minutos
- Taxa final de abertura esperada: ${insights.predictions.expectedFinalOpenRate.toFixed(1)}%
- Fatores de risco: ${insights.predictions.riskFactors.join(', ') || 'Nenhum'}

📱 DISPOSITIVOS
${Object.entries(insights.performance.deviceDistribution)
  .map(([device, count]) => `- ${device}: ${count}`)
  .join('\n')}

⏰ HORÁRIOS DE PICO
${insights.performance.peakOpeningHours.map(hour => `${hour}:00`).join(', ')}

═══════════════════════════════════════════════
Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
      `;

      // Log do relatório
      emailMarketingLogger.logCampaignAnalysis(campaignId, {
        insights,
        report
      });

      return report.trim();
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      return 'Erro ao gerar relatório de análise.';
    }
  }
}