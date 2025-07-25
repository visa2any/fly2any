/**
 * Sistema de Tracking Real-Time para Email Marketing
 * Implementa pixels de rastreamento, links rastreáveis e métricas em tempo real
 */

import { sql } from '@vercel/postgres';
import { EmailSendsDB, EmailCampaignsDB } from './email-marketing-db';

export interface TrackingEvent {
  id: string;
  send_id: string;
  campaign_id: string;
  contact_email: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  event_data?: any;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  timestamp: Date;
}

export interface RealTimeMetrics {
  campaignId: string;
  totalSent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  complained: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  lastUpdate: Date;
}

export class EmailTrackingSystem {
  
  /**
   * Inicializa tabela de tracking
   */
  static async initTrackingTable(): Promise<void> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS email_tracking_events (
          id VARCHAR(255) PRIMARY KEY,
          send_id VARCHAR(255) REFERENCES email_sends(id) ON DELETE CASCADE,
          campaign_id VARCHAR(255) REFERENCES email_campaigns(id) ON DELETE CASCADE,
          contact_email VARCHAR(255) NOT NULL,
          event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
          event_data JSONB,
          ip_address INET,
          user_agent TEXT,
          location VARCHAR(255),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Índices para performance
      await sql`CREATE INDEX IF NOT EXISTS idx_tracking_send_id ON email_tracking_events(send_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_tracking_campaign_id ON email_tracking_events(campaign_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_tracking_event_type ON email_tracking_events(event_type);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_tracking_timestamp ON email_tracking_events(timestamp);`;

      console.log('✅ Tabela de tracking criada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar tabela de tracking:', error);
      throw error;
    }
  }

  /**
   * Registra evento de tracking
   */
  static async trackEvent(event: Omit<TrackingEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const id = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Se o email não foi fornecido, buscar do email_sends
      let contactEmail = event.contact_email;
      if (!contactEmail && event.send_id) {
        try {
          const sendResult = await sql`
            SELECT es.*, ec.email 
            FROM email_sends es 
            LEFT JOIN email_contacts ec ON es.contact_id = ec.id 
            WHERE es.id = ${event.send_id}
          `;
          if (sendResult.rows.length > 0) {
            contactEmail = sendResult.rows[0].email;
          }
        } catch (lookupError) {
          console.warn('⚠️ Não foi possível buscar email do contato:', lookupError);
        }
      }
      
      await sql`
        INSERT INTO email_tracking_events (
          id, send_id, campaign_id, contact_email, event_type, 
          event_data, ip_address, user_agent, location
        ) VALUES (
          ${id}, ${event.send_id}, ${event.campaign_id}, ${contactEmail || 'unknown'}, 
          ${event.event_type}, ${JSON.stringify(event.event_data || {})}, 
          ${event.ip_address || null}, ${event.user_agent || null}, ${event.location || null}
        )
      `;

      // Atualizar status no email_sends
      await this.updateEmailSendStatus(event.send_id, event.event_type, event.event_data);
      
      // Atualizar métricas da campanha
      await this.updateCampaignMetrics(event.campaign_id);
      
      console.log(`📊 Evento ${event.event_type} registrado para ${contactEmail || 'unknown'}`);
    } catch (error) {
      console.error('❌ Erro ao registrar evento de tracking:', error);
    }
  }

  /**
   * Atualiza status do email_sends baseado no evento
   */
  private static async updateEmailSendStatus(sendId: string, eventType: string, eventData?: any): Promise<void> {
    const updateData: any = {};
    
    switch (eventType) {
      case 'delivered':
        updateData.delivered_at = new Date();
        break;
      case 'opened':
        updateData.opened_at = new Date();
        break;
      case 'clicked':
        updateData.clicked_at = new Date();
        break;
      case 'bounced':
        updateData.failed_reason = eventData?.reason || 'Email bounced';
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await EmailSendsDB.updateStatus(sendId, eventType as any, updateData);
    }
  }

  /**
   * Atualiza métricas da campanha em real-time
   */
  private static async updateCampaignMetrics(campaignId: string): Promise<void> {
    try {
      const metrics = await this.getCampaignMetrics(campaignId);
      
      await EmailCampaignsDB.updateStats(campaignId, {
        total_delivered: metrics.delivered,
        total_opened: metrics.opened,
        total_clicked: metrics.clicked,
        total_bounced: metrics.bounced
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar métricas da campanha:', error);
    }
  }

  /**
   * Obtém métricas em tempo real de uma campanha
   */
  static async getCampaignMetrics(campaignId: string): Promise<RealTimeMetrics> {
    try {
      const result = await sql`
        SELECT 
          event_type,
          COUNT(*) as count
        FROM email_tracking_events 
        WHERE campaign_id = ${campaignId}
        GROUP BY event_type
      `;

      const metrics: any = {
        campaignId,
        totalSent: 0,
        delivered: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        complained: 0,
        lastUpdate: new Date()
      };

      result.rows.forEach(row => {
        metrics[row.event_type] = parseInt(row.count);
        if (row.event_type === 'sent') metrics.totalSent = parseInt(row.count);
      });

      // Calcular taxas
      metrics.openRate = metrics.totalSent > 0 ? (metrics.opened / metrics.totalSent) * 100 : 0;
      metrics.clickRate = metrics.totalSent > 0 ? (metrics.clicked / metrics.totalSent) * 100 : 0;
      metrics.bounceRate = metrics.totalSent > 0 ? (metrics.bounced / metrics.totalSent) * 100 : 0;

      return metrics;
    } catch (error) {
      console.error('❌ Erro ao obter métricas:', error);
      throw error;
    }
  }

  /**
   * Gera pixel de tracking para abertura de email
   */
  static generateTrackingPixel(sendId: string, campaignId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fly2any.com';
    return `${baseUrl}/api/email-marketing/track/open?send_id=${sendId}&campaign_id=${campaignId}`;
  }

  /**
   * Gera link rastreável para cliques
   */
  static generateTrackableLink(originalUrl: string, sendId: string, campaignId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fly2any.com';
    const trackingUrl = `${baseUrl}/api/email-marketing/track/click?send_id=${sendId}&campaign_id=${campaignId}&url=${encodeURIComponent(originalUrl)}`;
    return trackingUrl;
  }

  /**
   * Processa HTML do email adicionando tracking
   */
  static injectTrackingIntoEmail(htmlContent: string, sendId: string, campaignId: string): string {
    let trackedHtml = htmlContent;

    // 1. Adicionar pixel de tracking no final do HTML
    const trackingPixel = `<img src="${this.generateTrackingPixel(sendId, campaignId)}" width="1" height="1" style="display:none;" alt="" />`;
    trackedHtml = trackedHtml.replace('</body>', `${trackingPixel}</body>`);

    // 2. Converter links para rastreáveis
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    trackedHtml = trackedHtml.replace(linkRegex, (match, url) => {
      // Não rastrear links de unsubscribe ou internos já rastreados
      if (url.includes('unsubscribe') || url.includes('/track/')) {
        return match;
      }
      
      const trackableUrl = this.generateTrackableLink(url, sendId, campaignId);
      return match.replace(url, trackableUrl);
    });

    return trackedHtml;
  }

  /**
   * Obtém eventos de tracking em tempo real
   */
  static async getRealtimeEvents(campaignId: string, limit: number = 50): Promise<TrackingEvent[]> {
    try {
      const result = await sql`
        SELECT * FROM email_tracking_events 
        WHERE campaign_id = ${campaignId}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;

      return result.rows as TrackingEvent[];
    } catch (error) {
      console.error('❌ Erro ao obter eventos em tempo real:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas detalhadas por período
   */
  static async getDetailedStats(campaignId: string, hours: number = 24): Promise<any> {
    try {
      const result = await sql`
        SELECT 
          event_type,
          DATE_TRUNC('hour', timestamp) as hour,
          COUNT(*) as count
        FROM email_tracking_events 
        WHERE campaign_id = ${campaignId}
          AND timestamp >= NOW() - INTERVAL '${hours} hours'
        GROUP BY event_type, hour
        ORDER BY hour DESC
      `;

      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas detalhadas:', error);
      return [];
    }
  }
}

// Função para inicializar o sistema de tracking
export async function initEmailTracking(): Promise<void> {
  try {
    await EmailTrackingSystem.initTrackingTable();
    console.log('🎯 Sistema de tracking de email inicializado');
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de tracking:', error);
  }
}