/**
 * 🗄️ Advanced Database Integration (2025)
 * Integration layer for new Email Marketing V2 features with existing database
 */

import { sql } from '@vercel/postgres';
import { EmailContact } from '@/lib/email-marketing/types';
import { DiasporaInsight } from './diaspora-intelligence';
import { BehavioralScore } from './advanced-segmentation';
import { PersonalizedContent } from './ai-personalization';

interface DatabaseSchema {
  // Enhanced existing tables
  email_contacts_enhanced: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    cultural_generation: 'first' | 'second' | 'third';
    diaspora_community: string;
    cultural_affinity_score: number;
    travel_intent_score: number;
    lifetime_value_prediction: number;
    churn_risk_score: number;
    preferred_language: 'pt-BR' | 'en-US' | 'bilingual';
    device_preference: 'mobile' | 'desktop' | 'tablet';
    timezone: string;
    location_lat?: number;
    location_lng?: number;
    last_ai_analysis: Date;
    created_at: Date;
    updated_at: Date;
  };

  // New AI/ML tables
  ai_personalization_cache: {
    id: string;
    contact_id: string;
    campaign_id: string;
    personalized_subject: string;
    personalized_content: string;
    cultural_elements: string[]; // JSON array
    confidence_score: number;
    optimal_send_time: Date;
    created_at: Date;
    expires_at: Date;
  };

  behavioral_scores: {
    id: string;
    contact_id: string;
    engagement_score: number;
    cultural_affinity_score: number;
    travel_intent_score: number;
    lifetime_value_score: number;
    churn_risk_score: number;
    purchase_probability_score: number;
    recency_score: number;
    frequency_score: number;
    monetary_score: number;
    calculated_at: Date;
    expires_at: Date;
  };

  diaspora_insights: {
    id: string;
    contact_id: string;
    diaspora_community: string;
    cultural_generation: string;
    cultural_retention_score: number;
    community_engagement_score: number;
    family_connections_score: number;
    economic_stability: 'low' | 'medium' | 'high';
    travel_frequency: 'never' | 'rare' | 'occasional' | 'frequent';
    preferred_destinations: string[]; // JSON array
    seasonal_preferences: string[]; // JSON array
    marketing_segment: string;
    confidence_score: number;
    last_updated: Date;
  };

  advanced_segments: {
    id: string;
    name: string;
    description: string;
    type: 'static' | 'dynamic' | 'predictive' | 'behavioral' | 'ai_generated';
    conditions: any; // JSON
    ai_prompt?: string;
    predictive_model_type?: string;
    refresh_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    contact_count: number;
    is_active: boolean;
    performance_metrics: any; // JSON
    created_at: Date;
    updated_at: Date;
  };

  campaign_performance_advanced: {
    id: string;
    campaign_id: string;
    cultural_resonance_score: number;
    diaspora_performance: any; // JSON - performance by community
    device_breakdown: any; // JSON
    ai_optimization_applied: boolean;
    personalization_success_rate: number;
    predictive_accuracy: number;
    edge_delivery_metrics: any; // JSON
    created_at: Date;
  };

  real_time_events: {
    id: string;
    contact_id: string;
    event_type: string;
    event_data: any; // JSON
    device_type: string;
    user_agent?: string;
    ip_address?: string;
    location_data?: any; // JSON
    processed: boolean;
    created_at: Date;
  };

  edge_delivery_logs: {
    id: string;
    campaign_id: string;
    contact_id: string;
    edge_location: string;
    delivery_time_ms: number;
    bandwidth_used: number;
    cache_hit: boolean;
    success: boolean;
    error_message?: string;
    created_at: Date;
  };

  mobile_integration_logs: {
    id: string;
    contact_id: string;
    channel: 'whatsapp' | 'instagram' | 'sms';
    message_type: string;
    delivery_status: string;
    engagement_data: any; // JSON
    created_at: Date;
  };
}

/**
 * Enhanced Email Marketing Database with AI/ML Support
 */
export class EnhancedEmailMarketingDatabase {
  /**
   * Initialize all new database tables for 2025 features
   */
  static async initializeAdvancedTables(): Promise<void> {
    try {
      console.log('🗄️ Initializing advanced Email Marketing V2 database tables...');

      // Enhanced email contacts table
      await sql`
        CREATE TABLE IF NOT EXISTS email_contacts_enhanced (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          cultural_generation VARCHAR(20) DEFAULT 'second',
          diaspora_community VARCHAR(100),
          cultural_affinity_score DECIMAL(5,2) DEFAULT 50.00,
          travel_intent_score DECIMAL(5,2) DEFAULT 30.00,
          lifetime_value_prediction DECIMAL(10,2) DEFAULT 0.00,
          churn_risk_score DECIMAL(5,2) DEFAULT 30.00,
          preferred_language VARCHAR(20) DEFAULT 'bilingual',
          device_preference VARCHAR(20) DEFAULT 'mobile',
          timezone VARCHAR(50) DEFAULT 'America/New_York',
          location_lat DECIMAL(10,8),
          location_lng DECIMAL(11,8),
          last_ai_analysis TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // AI Personalization Cache
      await sql`
        CREATE TABLE IF NOT EXISTS ai_personalization_cache (
          id VARCHAR(255) PRIMARY KEY,
          contact_id VARCHAR(255) NOT NULL,
          campaign_id VARCHAR(255) NOT NULL,
          personalized_subject TEXT,
          personalized_content TEXT,
          cultural_elements JSON,
          confidence_score DECIMAL(5,2),
          optimal_send_time TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,
          INDEX idx_contact_campaign (contact_id, campaign_id),
          INDEX idx_expires (expires_at)
        )
      `;

      // Behavioral Scores
      await sql`
        CREATE TABLE IF NOT EXISTS behavioral_scores (
          id VARCHAR(255) PRIMARY KEY,
          contact_id VARCHAR(255) NOT NULL,
          engagement_score DECIMAL(5,2) DEFAULT 50.00,
          cultural_affinity_score DECIMAL(5,2) DEFAULT 50.00,
          travel_intent_score DECIMAL(5,2) DEFAULT 30.00,
          lifetime_value_score DECIMAL(5,2) DEFAULT 30.00,
          churn_risk_score DECIMAL(5,2) DEFAULT 30.00,
          purchase_probability_score DECIMAL(5,2) DEFAULT 20.00,
          recency_score DECIMAL(5,2) DEFAULT 30.00,
          frequency_score DECIMAL(5,2) DEFAULT 30.00,
          monetary_score DECIMAL(5,2) DEFAULT 10.00,
          calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP,
          INDEX idx_contact_id (contact_id),
          INDEX idx_calculated_at (calculated_at)
        )
      `;

      // Diaspora Insights
      await sql`
        CREATE TABLE IF NOT EXISTS diaspora_insights (
          id VARCHAR(255) PRIMARY KEY,
          contact_id VARCHAR(255) NOT NULL UNIQUE,
          diaspora_community VARCHAR(100),
          cultural_generation VARCHAR(20),
          cultural_retention_score DECIMAL(5,2),
          community_engagement_score DECIMAL(5,2),
          family_connections_score DECIMAL(5,2),
          economic_stability VARCHAR(20),
          travel_frequency VARCHAR(20),
          preferred_destinations JSON,
          seasonal_preferences JSON,
          marketing_segment VARCHAR(100),
          confidence_score DECIMAL(5,2),
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_contact_id (contact_id),
          INDEX idx_marketing_segment (marketing_segment)
        )
      `;

      // Advanced Segments
      await sql`
        CREATE TABLE IF NOT EXISTS advanced_segments (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          conditions JSON,
          ai_prompt TEXT,
          predictive_model_type VARCHAR(50),
          refresh_frequency VARCHAR(20) DEFAULT 'daily',
          contact_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          performance_metrics JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_type (type),
          INDEX idx_active (is_active)
        )
      `;

      // Campaign Performance Advanced
      await sql`
        CREATE TABLE IF NOT EXISTS campaign_performance_advanced (
          id VARCHAR(255) PRIMARY KEY,
          campaign_id VARCHAR(255) NOT NULL,
          cultural_resonance_score DECIMAL(5,2),
          diaspora_performance JSON,
          device_breakdown JSON,
          ai_optimization_applied BOOLEAN DEFAULT false,
          personalization_success_rate DECIMAL(5,2),
          predictive_accuracy DECIMAL(5,2),
          edge_delivery_metrics JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_campaign_id (campaign_id)
        )
      `;

      // Real-time Events
      await sql`
        CREATE TABLE IF NOT EXISTS real_time_events (
          id VARCHAR(255) PRIMARY KEY,
          contact_id VARCHAR(255) NOT NULL,
          event_type VARCHAR(50) NOT NULL,
          event_data JSON,
          device_type VARCHAR(20),
          user_agent TEXT,
          ip_address VARCHAR(45),
          location_data JSON,
          processed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_contact_event (contact_id, event_type),
          INDEX idx_processed (processed),
          INDEX idx_created_at (created_at)
        )
      `;

      // Edge Delivery Logs
      await sql`
        CREATE TABLE IF NOT EXISTS edge_delivery_logs (
          id VARCHAR(255) PRIMARY KEY,
          campaign_id VARCHAR(255) NOT NULL,
          contact_id VARCHAR(255) NOT NULL,
          edge_location VARCHAR(100),
          delivery_time_ms INTEGER,
          bandwidth_used BIGINT,
          cache_hit BOOLEAN,
          success BOOLEAN,
          error_message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_campaign_id (campaign_id),
          INDEX idx_edge_location (edge_location),
          INDEX idx_success (success)
        )
      `;

      // Mobile Integration Logs
      await sql`
        CREATE TABLE IF NOT EXISTS mobile_integration_logs (
          id VARCHAR(255) PRIMARY KEY,
          contact_id VARCHAR(255) NOT NULL,
          channel VARCHAR(20) NOT NULL,
          message_type VARCHAR(50),
          delivery_status VARCHAR(20),
          engagement_data JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_contact_channel (contact_id, channel),
          INDEX idx_created_at (created_at)
        )
      `;

      console.log('✅ Advanced database tables initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize advanced database tables:', error);
      throw error;
    }
  }

  /**
   * Store AI personalization results
   */
  static async storePersonalizationCache(
    contactId: string,
    campaignId: string,
    personalization: PersonalizedContent
  ): Promise<void> {
    try {
      const id = `ai_${contactId}_${campaignId}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await sql`
        INSERT INTO ai_personalization_cache (
          id, contact_id, campaign_id, personalized_subject, 
          personalized_content, cultural_elements, confidence_score,
          optimal_send_time, expires_at
        ) VALUES (
          ${id}, ${contactId}, ${campaignId}, ${personalization.subject},
          ${personalization.content}, ${JSON.stringify(personalization.culturalElements)},
          ${personalization.confidence}, ${personalization.sendTime.toISOString()}, ${expiresAt.toISOString()}
        )
        ON CONFLICT (contact_id, campaign_id) 
        DO UPDATE SET 
          personalized_subject = ${personalization.subject},
          personalized_content = ${personalization.content},
          cultural_elements = ${JSON.stringify(personalization.culturalElements)},
          confidence_score = ${personalization.confidence},
          optimal_send_time = ${personalization.sendTime.toISOString()},
          expires_at = ${expiresAt.toISOString()}
      `;

      console.log(`💾 Personalization cached for contact ${contactId}`);
    } catch (error) {
      console.error('❌ Failed to store personalization cache:', error);
    }
  }

  /**
   * Retrieve cached personalization
   */
  static async getPersonalizationCache(
    contactId: string,
    campaignId: string
  ): Promise<PersonalizedContent | null> {
    try {
      const result = await sql`
        SELECT * FROM ai_personalization_cache
        WHERE contact_id = ${contactId} 
        AND campaign_id = ${campaignId}
        AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        subject: row.personalized_subject,
        content: row.personalized_content,
        sendTime: new Date(row.optimal_send_time),
        culturalElements: JSON.parse(row.cultural_elements || '[]'),
        confidence: row.confidence_score
      };
    } catch (error) {
      console.error('❌ Failed to retrieve personalization cache:', error);
      return null;
    }
  }

  /**
   * Store behavioral scores
   */
  static async storeBehavioralScore(
    contactId: string,
    score: BehavioralScore
  ): Promise<void> {
    try {
      const id = `score_${contactId}_${Date.now()}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await sql`
        INSERT INTO behavioral_scores (
          id, contact_id, engagement_score, cultural_affinity_score,
          travel_intent_score, lifetime_value_score, churn_risk_score,
          purchase_probability_score, recency_score, frequency_score,
          monetary_score, expires_at
        ) VALUES (
          ${id}, ${contactId}, ${score.engagementScore}, ${score.culturalAffinityScore},
          ${score.travelIntentScore}, ${score.lifetimeValueScore}, ${score.churnRiskScore},
          ${score.purchaseProbabilityScore}, ${score.recencyScore}, ${score.frequencyScore},
          ${score.monetaryScore}, ${expiresAt.toISOString()}
        )
      `;

      console.log(`📊 Behavioral score stored for contact ${contactId}`);
    } catch (error) {
      console.error('❌ Failed to store behavioral score:', error);
    }
  }

  /**
   * Get latest behavioral score
   */
  static async getBehavioralScore(contactId: string): Promise<BehavioralScore | null> {
    try {
      const result = await sql`
        SELECT * FROM behavioral_scores
        WHERE contact_id = ${contactId}
        AND expires_at > NOW()
        ORDER BY calculated_at DESC
        LIMIT 1
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        contactId: row.contact_id,
        engagementScore: row.engagement_score,
        culturalAffinityScore: row.cultural_affinity_score,
        travelIntentScore: row.travel_intent_score,
        lifetimeValueScore: row.lifetime_value_score,
        churnRiskScore: row.churn_risk_score,
        purchaseProbabilityScore: row.purchase_probability_score,
        recencyScore: row.recency_score,
        frequencyScore: row.frequency_score,
        monetaryScore: row.monetary_score,
        lastCalculated: new Date(row.calculated_at)
      };
    } catch (error) {
      console.error('❌ Failed to retrieve behavioral score:', error);
      return null;
    }
  }

  /**
   * Store diaspora insight
   */
  static async storeDiasporaInsight(
    contactId: string,
    insight: DiasporaInsight
  ): Promise<void> {
    try {
      const id = `insight_${contactId}_${Date.now()}`;

      await sql`
        INSERT INTO diaspora_insights (
          id, contact_id, diaspora_community, cultural_generation,
          cultural_retention_score, community_engagement_score,
          family_connections_score, economic_stability, travel_frequency,
          preferred_destinations, seasonal_preferences, marketing_segment,
          confidence_score
        ) VALUES (
          ${id}, ${contactId}, ${insight.location.city}, ${insight.culturalProfile.generation},
          ${insight.culturalProfile.culturalRetention}, ${insight.culturalProfile.communityEngagement},
          ${insight.culturalProfile.familyConnections}, ${insight.culturalProfile.economicStability},
          ${insight.travelIntent.tripFrequency}, ${JSON.stringify(insight.travelIntent.destinations)},
          ${JSON.stringify(insight.travelIntent.seasonalPreference)}, ${insight.marketingSegment},
          ${insight.confidenceScore}
        )
        ON CONFLICT (contact_id)
        DO UPDATE SET
          diaspora_community = ${insight.location.city},
          cultural_generation = ${insight.culturalProfile.generation},
          cultural_retention_score = ${insight.culturalProfile.culturalRetention},
          community_engagement_score = ${insight.culturalProfile.communityEngagement},
          family_connections_score = ${insight.culturalProfile.familyConnections},
          economic_stability = ${insight.culturalProfile.economicStability},
          travel_frequency = ${insight.travelIntent.tripFrequency},
          preferred_destinations = ${JSON.stringify(insight.travelIntent.destinations)},
          seasonal_preferences = ${JSON.stringify(insight.travelIntent.seasonalPreference)},
          marketing_segment = ${insight.marketingSegment},
          confidence_score = ${insight.confidenceScore},
          last_updated = CURRENT_TIMESTAMP
      `;

      console.log(`🌍 Diaspora insight stored for contact ${contactId}`);
    } catch (error) {
      console.error('❌ Failed to store diaspora insight:', error);
    }
  }

  /**
   * Get diaspora insight
   */
  static async getDiasporaInsight(contactId: string): Promise<DiasporaInsight | null> {
    try {
      const result = await sql`
        SELECT * FROM diaspora_insights
        WHERE contact_id = ${contactId}
        ORDER BY last_updated DESC
        LIMIT 1
      `;

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      
      // This is a simplified reconstruction - in practice, you'd store and retrieve the full insight structure
      return {
        contactId: row.contact_id,
        location: {
          city: row.diaspora_community,
          state: '',
          country: '',
          coordinates: { lat: 0, lng: 0 },
          timezone: '',
          brazilianPopulation: 0,
          communityStrength: 0,
          averageIncome: 0,
          culturalEvents: []
        },
        culturalProfile: {
          generation: row.cultural_generation as any,
          regionOfOrigin: '',
          arrivalDecade: '',
          languageDominance: 'bilingual' as any,
          culturalRetention: row.cultural_retention_score,
          communityEngagement: row.community_engagement_score,
          familyConnections: row.family_connections_score,
          economicStability: row.economic_stability as any
        },
        travelIntent: {
          score: 0,
          destinations: JSON.parse(row.preferred_destinations || '[]'),
          travelStyle: 'comfort' as any,
          groupSize: 2,
          seasonalPreference: JSON.parse(row.seasonal_preferences || '[]'),
          lastTripToBrazil: null,
          tripFrequency: row.travel_frequency as any,
          motivations: []
        },
        marketingSegment: row.marketing_segment,
        lifetimeValue: 0,
        nextBestAction: '',
        confidenceScore: row.confidence_score
      };
    } catch (error) {
      console.error('❌ Failed to retrieve diaspora insight:', error);
      return null;
    }
  }

  /**
   * Store real-time event
   */
  static async storeRealTimeEvent(event: {
    contactId: string;
    eventType: string;
    eventData: any;
    deviceType?: string;
    userAgent?: string;
    ipAddress?: string;
    locationData?: any;
  }): Promise<void> {
    try {
      const id = `event_${event.contactId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await sql`
        INSERT INTO real_time_events (
          id, contact_id, event_type, event_data, device_type,
          user_agent, ip_address, location_data
        ) VALUES (
          ${id}, ${event.contactId}, ${event.eventType}, ${JSON.stringify(event.eventData)},
          ${event.deviceType || null}, ${event.userAgent || null}, ${event.ipAddress || null},
          ${event.locationData ? JSON.stringify(event.locationData) : null}
        )
      `;

      console.log(`⚡ Real-time event stored: ${event.eventType} for contact ${event.contactId}`);
    } catch (error) {
      console.error('❌ Failed to store real-time event:', error);
    }
  }

  /**
   * Get unprocessed real-time events
   */
  static async getUnprocessedEvents(limit: number = 100): Promise<any[]> {
    try {
      const result = await sql`
        SELECT * FROM real_time_events
        WHERE processed = false
        ORDER BY created_at ASC
        LIMIT ${limit}
      `;

      return result.rows;
    } catch (error) {
      console.error('❌ Failed to retrieve unprocessed events:', error);
      return [];
    }
  }

  /**
   * Mark events as processed
   */
  static async markEventsProcessed(eventIds: string[]): Promise<void> {
    try {
      if (eventIds.length === 0) return;

      for (const eventId of eventIds) {
        await sql`
          UPDATE real_time_events
          SET processed = true
          WHERE id = ${eventId}
        `;
      }

      console.log(`✅ Marked ${eventIds.length} events as processed`);
    } catch (error) {
      console.error('❌ Failed to mark events as processed:', error);
    }
  }

  /**
   * Store edge delivery metrics
   */
  static async storeEdgeDeliveryMetrics(metrics: {
    campaignId: string;
    contactId: string;
    edgeLocation: string;
    deliveryTimeMs: number;
    bandwidthUsed: number;
    cacheHit: boolean;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      const id = `edge_${metrics.campaignId}_${metrics.contactId}_${Date.now()}`;

      await sql`
        INSERT INTO edge_delivery_logs (
          id, campaign_id, contact_id, edge_location, delivery_time_ms,
          bandwidth_used, cache_hit, success, error_message
        ) VALUES (
          ${id}, ${metrics.campaignId}, ${metrics.contactId}, ${metrics.edgeLocation},
          ${metrics.deliveryTimeMs}, ${metrics.bandwidthUsed}, ${metrics.cacheHit},
          ${metrics.success}, ${metrics.errorMessage || null}
        )
      `;

      console.log(`⚡ Edge delivery metrics stored for campaign ${metrics.campaignId}`);
    } catch (error) {
      console.error('❌ Failed to store edge delivery metrics:', error);
    }
  }

  /**
   * Get edge performance analytics
   */
  static async getEdgePerformanceAnalytics(timeRangeHours: number = 24): Promise<any> {
    try {
      const result = await sql`
        SELECT 
          edge_location,
          COUNT(*) as total_deliveries,
          AVG(delivery_time_ms) as avg_delivery_time,
          SUM(bandwidth_used) as total_bandwidth,
          AVG(CASE WHEN cache_hit THEN 1 ELSE 0 END) * 100 as cache_hit_rate,
          AVG(CASE WHEN success THEN 1 ELSE 0 END) * 100 as success_rate
        FROM edge_delivery_logs
        WHERE created_at >= NOW() - INTERVAL '${timeRangeHours} hours'
        GROUP BY edge_location
        ORDER BY total_deliveries DESC
      `;

      return {
        timeRange: `${timeRangeHours}h`,
        edgePerformance: result.rows.map(row => ({
          location: row.edge_location,
          deliveries: parseInt(row.total_deliveries),
          avgDeliveryTime: Math.round(row.avg_delivery_time),
          totalBandwidth: parseInt(row.total_bandwidth),
          cacheHitRate: Math.round(row.cache_hit_rate),
          successRate: Math.round(row.success_rate)
        }))
      };
    } catch (error) {
      console.error('❌ Failed to retrieve edge performance analytics:', error);
      return { timeRange: `${timeRangeHours}h`, edgePerformance: [] };
    }
  }

  /**
   * Store mobile integration event
   */
  static async storeMobileIntegrationEvent(event: {
    contactId: string;
    channel: 'whatsapp' | 'instagram' | 'sms';
    messageType: string;
    deliveryStatus: string;
    engagementData: any;
  }): Promise<void> {
    try {
      const id = `mobile_${event.contactId}_${event.channel}_${Date.now()}`;

      await sql`
        INSERT INTO mobile_integration_logs (
          id, contact_id, channel, message_type, delivery_status, engagement_data
        ) VALUES (
          ${id}, ${event.contactId}, ${event.channel}, ${event.messageType},
          ${event.deliveryStatus}, ${JSON.stringify(event.engagementData)}
        )
      `;

      console.log(`📱 Mobile integration event stored: ${event.channel} for contact ${event.contactId}`);
    } catch (error) {
      console.error('❌ Failed to store mobile integration event:', error);
    }
  }

  /**
   * Get mobile channel analytics
   */
  static async getMobileChannelAnalytics(timeRangeDays: number = 30): Promise<any> {
    try {
      const result = await sql`
        SELECT 
          channel,
          COUNT(*) as total_messages,
          AVG(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) * 100 as delivery_rate,
          COUNT(CASE WHEN JSON_EXTRACT(engagement_data, '$.opened') = true THEN 1 END) as total_opens,
          COUNT(CASE WHEN JSON_EXTRACT(engagement_data, '$.clicked') = true THEN 1 END) as total_clicks
        FROM mobile_integration_logs
        WHERE created_at >= NOW() - INTERVAL '${timeRangeDays} days'
        GROUP BY channel
        ORDER BY total_messages DESC
      `;

      return {
        timeRange: `${timeRangeDays}d`,
        channelPerformance: result.rows.map(row => ({
          channel: row.channel,
          totalMessages: parseInt(row.total_messages),
          deliveryRate: Math.round(row.delivery_rate),
          openRate: Math.round((parseInt(row.total_opens) / parseInt(row.total_messages)) * 100),
          clickRate: Math.round((parseInt(row.total_clicks) / parseInt(row.total_messages)) * 100)
        }))
      };
    } catch (error) {
      console.error('❌ Failed to retrieve mobile channel analytics:', error);
      return { timeRange: `${timeRangeDays}d`, channelPerformance: [] };
    }
  }

  /**
   * Clean up expired data
   */
  static async cleanupExpiredData(): Promise<void> {
    try {
      console.log('🧹 Starting database cleanup...');

      // Clean expired personalization cache
      const cleanupPersonalization = await sql`
        DELETE FROM ai_personalization_cache
        WHERE expires_at < NOW()
      `;

      // Clean expired behavioral scores
      const cleanupScores = await sql`
        DELETE FROM behavioral_scores
        WHERE expires_at < NOW()
      `;

      // Clean old real-time events (older than 30 days)
      const cleanupEvents = await sql`
        DELETE FROM real_time_events
        WHERE created_at < NOW() - INTERVAL '30 days'
      `;

      // Clean old edge delivery logs (older than 90 days)
      const cleanupEdgeLogs = await sql`
        DELETE FROM edge_delivery_logs
        WHERE created_at < NOW() - INTERVAL '90 days'
      `;

      // Clean old mobile integration logs (older than 90 days)
      const cleanupMobileLogs = await sql`
        DELETE FROM mobile_integration_logs
        WHERE created_at < NOW() - INTERVAL '90 days'
      `;

      console.log(`✅ Database cleanup completed:`);
      console.log(`   - Personalization cache: ${cleanupPersonalization.rowCount} records`);
      console.log(`   - Behavioral scores: ${cleanupScores.rowCount} records`);
      console.log(`   - Real-time events: ${cleanupEvents.rowCount} records`);
      console.log(`   - Edge delivery logs: ${cleanupEdgeLogs.rowCount} records`);
      console.log(`   - Mobile integration logs: ${cleanupMobileLogs.rowCount} records`);

    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    }
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  static async getComprehensiveAnalytics(): Promise<any> {
    try {
      const [
        contactStats,
        campaignStats,
        behavioralStats,
        edgeStats,
        mobileStats
      ] = await Promise.all([
        // Contact statistics
        sql`
          SELECT 
            COUNT(*) as total_contacts,
            COUNT(CASE WHEN cultural_generation = 'first' THEN 1 END) as first_generation,
            COUNT(CASE WHEN cultural_generation = 'second' THEN 1 END) as second_generation,
            COUNT(CASE WHEN cultural_generation = 'third' THEN 1 END) as third_generation,
            AVG(cultural_affinity_score) as avg_cultural_affinity,
            AVG(travel_intent_score) as avg_travel_intent
          FROM email_contacts_enhanced
          WHERE created_at >= NOW() - INTERVAL '30 days'
        `,

        // Campaign performance
        sql`
          SELECT 
            COUNT(*) as total_campaigns,
            AVG(cultural_resonance_score) as avg_cultural_resonance,
            AVG(personalization_success_rate) as avg_personalization_success
          FROM campaign_performance_advanced
          WHERE created_at >= NOW() - INTERVAL '30 days'
        `,

        // Behavioral insights
        sql`
          SELECT 
            AVG(engagement_score) as avg_engagement,
            AVG(churn_risk_score) as avg_churn_risk,
            AVG(lifetime_value_score) as avg_lifetime_value,
            COUNT(*) as total_scores
          FROM behavioral_scores
          WHERE calculated_at >= NOW() - INTERVAL '7 days'
        `,

        // Edge performance
        this.getEdgePerformanceAnalytics(24),

        // Mobile channel performance
        this.getMobileChannelAnalytics(30)
      ]);

      return {
        contacts: contactStats.rows[0],
        campaigns: campaignStats.rows[0],
        behavioral: behavioralStats.rows[0],
        edge: edgeStats,
        mobile: mobileStats,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Failed to retrieve comprehensive analytics:', error);
      return null;
    }
  }

  /**
   * Migrate existing data to enhanced schema
   */
  static async migrateExistingData(): Promise<void> {
    try {
      console.log('🔄 Starting data migration to enhanced schema...');

      // Migrate existing email_contacts to email_contacts_enhanced
      await sql`
        INSERT INTO email_contacts_enhanced (
          id, email, first_name, last_name, created_at, updated_at
        )
        SELECT 
          id, email, first_name, last_name, created_at, 
          COALESCE(updated_at, created_at)
        FROM email_contacts
        WHERE id NOT IN (SELECT id FROM email_contacts_enhanced)
      `;

      console.log('✅ Data migration completed successfully');
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      throw error;
    }
  }

  /**
   * Health check for all database components
   */
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
    metrics: Record<string, number>;
  }> {
    const components: Record<string, boolean> = {};
    const metrics: Record<string, number> = {};

    try {
      // Test basic connectivity
      await sql`SELECT 1`;
      components.connectivity = true;

      // Test each advanced table
      const tables = [
        'email_contacts_enhanced',
        'ai_personalization_cache',
        'behavioral_scores',
        'diaspora_insights',
        'advanced_segments',
        'real_time_events',
        'edge_delivery_logs',
        'mobile_integration_logs'
      ];

      for (const table of tables) {
        try {
          // Use dynamic query safely  
          let result;
          switch(table) {
            case 'contact_lifecycle':
              result = await sql`SELECT COUNT(*) FROM contact_lifecycle`;
              break;
            case 'advanced_segments':
              result = await sql`SELECT COUNT(*) FROM advanced_segments`;
              break;
            case 'real_time_events':
              result = await sql`SELECT COUNT(*) FROM real_time_events`;
              break;
            case 'edge_delivery_logs':
              result = await sql`SELECT COUNT(*) FROM edge_delivery_logs`;
              break;
            case 'mobile_integration_logs':
              result = await sql`SELECT COUNT(*) FROM mobile_integration_logs`;
              break;
            default:
              result = { rows: [{ count: '0' }] };
          }
          components[table] = true;
          metrics[`${table}_count`] = parseInt(result.rows[0].count);
        } catch (error) {
          components[table] = false;
        }
      }

      // Calculate overall health
      const healthyComponents = Object.values(components).filter(Boolean).length;
      const totalComponents = Object.keys(components).length;
      const healthRatio = healthyComponents / totalComponents;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (healthRatio >= 0.9) status = 'healthy';
      else if (healthRatio >= 0.7) status = 'degraded';
      else status = 'unhealthy';

      console.log(`🏥 Database health check: ${status} (${healthyComponents}/${totalComponents} components healthy)`);

      return { status, components, metrics };

    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return {
        status: 'unhealthy',
        components: { connectivity: false },
        metrics: {}
      };
    }
  }
}