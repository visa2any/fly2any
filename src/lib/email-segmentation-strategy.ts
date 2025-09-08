import { sql } from '@vercel/postgres';
import { EmailMarketingDatabase, EmailSegment } from './email-marketing-database';

// Advanced Email Segmentation Strategy for Brazilian-American Travel Market
// Based on imported contact analysis and geographic/demographic data

export interface SegmentationCriteria {
  geographic?: {
    states?: string[];
    areaCodes?: string[];
    regions?: string[];
  };
  demographic?: {
    confidenceLevel?: 'high' | 'medium' | 'low';
    engagementScore?: { min?: number; max?: number };
  };
  behavioral?: {
    travelPreferences?: string[];
    communicationChannel?: string[];
    responseHistory?: string[];
  };
  temporal?: {
    importDate?: { after?: Date; before?: Date };
    lastContact?: { after?: Date; before?: Date };
  };
  tags: string[];
  customFields?: Record<string, any>;
}

export interface SegmentPerformanceMetrics {
  segmentId: string;
  contactCount: number;
  avgEngagementScore: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenueGenerated: number;
  lastCampaignSent?: Date;
  growthRate: number; // Month over month
}

export interface CampaignRecommendation {
  segmentId: string;
  campaignType: 'welcome' | 'promotional' | 'educational' | 'seasonal' | 'reactivation';
  priority: 'high' | 'medium' | 'low';
  bestSendTime: string; // Based on timezone analysis
  messageStrategy: string;
  estimatedROI: number;
}

export class EmailSegmentationStrategy {

  // Core Strategic Segments for Brazilian-American Travel Market
  static readonly STRATEGIC_SEGMENTS = {
    // Geographic High-Value Segments
    CT_BRAZILIAN_COMMUNITY: {
      id: 'seg_ct_brazilian_premium',
      name: 'Connecticut Brazilian Community',
      description: 'High-density Brazilian-American population in CT with strong travel patterns',
      priority: 'high',
      estimatedValue: 'premium'
    },
    FL_BRAZILIAN_COMMUNITY: {
      id: 'seg_fl_brazilian_premium', 
      name: 'Florida Brazilian Community',
      description: 'Large Brazilian-American population in FL, frequent Brazil travelers',
      priority: 'high',
      estimatedValue: 'premium'
    },
    MA_BRAZILIAN_COMMUNITY: {
      id: 'seg_ma_brazilian_premium',
      name: 'Massachusetts Brazilian Community',
      description: 'Established Brazilian community in MA with high travel frequency',
      priority: 'high', 
      estimatedValue: 'premium'
    },

    // Engagement-Based Segments
    HIGH_INTENT_TRAVELERS: {
      id: 'seg_high_intent_travel',
      name: 'High-Intent Travel Prospects',
      description: 'Contacts with highest confidence scores and engagement indicators',
      priority: 'critical',
      estimatedValue: 'premium'
    },
    SEASONAL_TRAVELERS: {
      id: 'seg_seasonal_travelers',
      name: 'Seasonal Brazil Travelers',
      description: 'Contacts likely to travel during peak Brazil seasons (Dec-Mar)',
      priority: 'medium',
      estimatedValue: 'high'
    },
    FAMILY_TRAVEL_SEGMENT: {
      id: 'seg_family_travelers',
      name: 'Brazilian Family Travel Market',
      description: 'Family-oriented travel to Brazil for holidays and visits',
      priority: 'high',
      estimatedValue: 'high'
    },

    // Business Segments
    BUSINESS_TRAVELERS: {
      id: 'seg_business_travel',
      name: 'USA-Brazil Business Travelers',
      description: 'Business professionals traveling between USA and Brazil',
      priority: 'high',
      estimatedValue: 'premium'
    },
    REMITTANCE_USERS: {
      id: 'seg_remittance_users',
      name: 'Brazil Remittance Market',
      description: 'Contacts likely to send money to Brazil regularly',
      priority: 'medium',
      estimatedValue: 'medium'
    }
  };

  // Create all strategic segments in database
  static async createStrategicSegments(): Promise<void> {
    console.log('🎯 Creating strategic email segments...');

    try {
      // Geographic High-Value Segments
      await this.createGeographicSegments();
      
      // Engagement-Based Segments
      await this.createEngagementSegments();
      
      // Behavioral Segments
      await this.createBehavioralSegments();
      
      // Temporal/Seasonal Segments
      await this.createTemporalSegments();

      console.log('✅ All strategic segments created successfully');
    } catch (error) {
      console.error('❌ Error creating strategic segments:', error);
      throw error;
    }
  }

  // Create geographic segments based on Brazilian population density
  static async createGeographicSegments(): Promise<void> {
    const geographicSegments: Partial<EmailSegment>[] = [
      {
        id: this.STRATEGIC_SEGMENTS.CT_BRAZILIAN_COMMUNITY.id,
        name: this.STRATEGIC_SEGMENTS.CT_BRAZILIAN_COMMUNITY.name,
        description: this.STRATEGIC_SEGMENTS.CT_BRAZILIAN_COMMUNITY.description,
        criteria: {
          location: { states: ['Connecticut'] },
          tags: ['Brazilian_American', 'Connecticut_Region', 'High_Concentration_State'],
          engagement_score_min: 60,
          email_engagement: { min_open_rate: 0.15 }
        }
      },
      {
        id: this.STRATEGIC_SEGMENTS.FL_BRAZILIAN_COMMUNITY.id,
        name: this.STRATEGIC_SEGMENTS.FL_BRAZILIAN_COMMUNITY.name,
        description: this.STRATEGIC_SEGMENTS.FL_BRAZILIAN_COMMUNITY.description,
        criteria: {
          location: { states: ['Florida'] },
          tags: ['Brazilian_American', 'Florida_Region', 'High_Concentration_State'],
          engagement_score_min: 55,
          travel_preferences: { motivation: ['family_visit', 'vacation', 'business'] }
        }
      },
      {
        id: this.STRATEGIC_SEGMENTS.MA_BRAZILIAN_COMMUNITY.id,
        name: this.STRATEGIC_SEGMENTS.MA_BRAZILIAN_COMMUNITY.name,
        description: this.STRATEGIC_SEGMENTS.MA_BRAZILIAN_COMMUNITY.description,
        criteria: {
          location: { states: ['Massachusetts'] },
          tags: ['Brazilian_American', 'Massachusetts_Region', 'High_Concentration_State'],
          engagement_score_min: 65,
          travel_preferences: { experience: ['premium', 'family_friendly'] }
        }
      },
      // Multi-state high-value segment
      {
        id: 'seg_northeast_brazilian_corridor',
        name: 'Northeast Brazilian Corridor',
        description: 'High-value Brazilian communities across Northeast states',
        criteria: {
          location: { states: ['Connecticut', 'Massachusetts', 'New Jersey', 'New York'] },
          tags: ['Brazilian_American', 'High_Confidence'],
          engagement_score_min: 70
        }
      },
      // Emerging markets
      {
        id: 'seg_emerging_brazilian_markets',
        name: 'Emerging Brazilian Markets',
        description: 'Growing Brazilian communities in secondary markets',
        criteria: {
          location: { states: ['Georgia', 'North Carolina', 'Pennsylvania'] },
          tags: ['Brazilian_American'],
          engagement_score_min: 40
        }
      }
    ];

    for (const segment of geographicSegments) {
      await this.insertSegment(segment);
    }

    console.log('✅ Geographic segments created');
  }

  // Create engagement-based segments
  static async createEngagementSegments(): Promise<void> {
    const engagementSegments: Partial<EmailSegment>[] = [
      {
        id: this.STRATEGIC_SEGMENTS.HIGH_INTENT_TRAVELERS.id,
        name: this.STRATEGIC_SEGMENTS.HIGH_INTENT_TRAVELERS.name,
        description: this.STRATEGIC_SEGMENTS.HIGH_INTENT_TRAVELERS.description,
        criteria: {
          tags: ['High_Confidence', 'Brazilian_American'],
          engagement_score_min: 85,
          email_engagement: { 
            min_open_rate: 0.25,
            opened_last_n_days: 30
          },
          custom_fields: { confidence_score_min: 0.9 }
        }
      },
      {
        id: 'seg_moderate_engagement',
        name: 'Moderate Engagement Prospects',
        description: 'Contacts with medium confidence and engagement levels',
        criteria: {
          tags: ['Brazilian_American'],
          engagement_score_min: 50,
          engagement_score_max: 84,
          email_engagement: { min_open_rate: 0.10 }
        }
      },
      {
        id: 'seg_reactivation_candidates',
        name: 'Reactivation Candidates',
        description: 'Previously engaged contacts who need reactivation',
        criteria: {
          tags: ['Brazilian_American'],
          engagement_score_min: 30,
          engagement_score_max: 49,
          email_engagement: {
            clicked_last_n_days: 90 // Haven't clicked in 90 days
          }
        }
      },
      {
        id: 'seg_vip_engagement',
        name: 'VIP High-Engagement Contacts',
        description: 'Top 5% most engaged contacts across all metrics',
        criteria: {
          tags: ['Brazilian_American', 'High_Confidence'],
          engagement_score_min: 90,
          email_engagement: {
            min_open_rate: 0.40,
            min_click_rate: 0.15,
            opened_last_n_days: 7
          }
        }
      }
    ];

    for (const segment of engagementSegments) {
      await this.insertSegment(segment);
    }

    console.log('✅ Engagement segments created');
  }

  // Create behavioral segments
  static async createBehavioralSegments(): Promise<void> {
    const behavioralSegments: Partial<EmailSegment>[] = [
      {
        id: this.STRATEGIC_SEGMENTS.BUSINESS_TRAVELERS.id,
        name: this.STRATEGIC_SEGMENTS.BUSINESS_TRAVELERS.name,
        description: this.STRATEGIC_SEGMENTS.BUSINESS_TRAVELERS.description,
        criteria: {
          tags: ['Brazilian_American', 'Business_Indicator'],
          location: { 
            cities: ['New York', 'Boston', 'Miami', 'Hartford', 'Stamford'] // Business centers
          },
          travel_preferences: { 
            experience: ['business', 'premium'],
            motivation: ['business', 'work']
          },
          engagement_score_min: 60
        }
      },
      {
        id: this.STRATEGIC_SEGMENTS.FAMILY_TRAVEL_SEGMENT.id,
        name: this.STRATEGIC_SEGMENTS.FAMILY_TRAVEL_SEGMENT.name,
        description: this.STRATEGIC_SEGMENTS.FAMILY_TRAVEL_SEGMENT.description,
        criteria: {
          tags: ['Brazilian_American'],
          travel_preferences: { 
            experience: ['family_friendly'],
            motivation: ['family_visit', 'vacation']
          },
          engagement_score_min: 45
        }
      },
      {
        id: this.STRATEGIC_SEGMENTS.REMITTANCE_USERS.id,
        name: this.STRATEGIC_SEGMENTS.REMITTANCE_USERS.name,
        description: this.STRATEGIC_SEGMENTS.REMITTANCE_USERS.description,
        criteria: {
          tags: ['Brazilian_American', 'Remittance_Likely'],
          engagement_score_min: 35,
          // Target specific area codes with high remittance activity
          custom_fields: { 
            area_codes: ['203', '508', '954', '561'] // CT, MA, FL high-density areas
          }
        }
      },
      {
        id: 'seg_frequent_travelers',
        name: 'Frequent Brazil Travelers',
        description: 'Contacts who travel to Brazil 2+ times per year',
        criteria: {
          tags: ['Brazilian_American', 'Frequent_Traveler'],
          travel_preferences: { 
            budget: ['premium', 'mid_range'],
            experience: ['experienced_traveler']
          },
          engagement_score_min: 70
        }
      }
    ];

    for (const segment of behavioralSegments) {
      await this.insertSegment(segment);
    }

    console.log('✅ Behavioral segments created');
  }

  // Create temporal/seasonal segments
  static async createTemporalSegments(): Promise<void> {
    const temporalSegments: Partial<EmailSegment>[] = [
      {
        id: this.STRATEGIC_SEGMENTS.SEASONAL_TRAVELERS.id,
        name: this.STRATEGIC_SEGMENTS.SEASONAL_TRAVELERS.name,
        description: this.STRATEGIC_SEGMENTS.SEASONAL_TRAVELERS.description,
        criteria: {
          tags: ['Brazilian_American', 'Seasonal_Travel'],
          travel_preferences: { 
            motivation: ['vacation', 'family_visit'],
            budget: ['mid_range', 'premium']
          },
          engagement_score_min: 50
        }
      },
      {
        id: 'seg_holiday_travelers',
        name: 'Brazilian Holiday Travelers',
        description: 'Contacts who travel during Brazilian holidays and festivals',
        criteria: {
          tags: ['Brazilian_American', 'Holiday_Traveler'],
          travel_preferences: { motivation: ['cultural_event', 'family_visit'] },
          engagement_score_min: 55
        }
      },
      {
        id: 'seg_new_imports',
        name: 'Recently Imported Contacts',
        description: 'Newly imported contacts requiring welcome sequences',
        criteria: {
          tags: ['Google_Contacts_Import'],
          date_filters: {
            created_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          },
          engagement_score_min: 30
        }
      }
    ];

    for (const segment of temporalSegments) {
      await this.insertSegment(segment);
    }

    console.log('✅ Temporal segments created');
  }

  // Insert segment into database
  static async insertSegment(segment: Partial<EmailSegment>): Promise<void> {
    try {
      const now = new Date();
      
      await sql`
        INSERT INTO email_segments (
          id, name, description, criteria, contact_count,
          last_calculated_at, created_by, created_at, updated_at, is_active
        ) VALUES (
          ${segment.id!},
          ${segment.name!},
          ${segment.description || ''},
          ${JSON.stringify(segment.criteria)},
          0,
          ${now.toISOString()},
          'segmentation_system',
          ${now.toISOString()},
          ${now.toISOString()},
          true
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          criteria = EXCLUDED.criteria,
          updated_at = EXCLUDED.updated_at
      `;

      // Calculate actual contact count for segment
      await this.calculateSegmentSize(segment.id!);
      
    } catch (error) {
      console.error(`Error inserting segment ${segment.id}:`, error);
      throw error;
    }
  }

  // Calculate actual segment sizes based on imported contacts
  static async calculateSegmentSize(segmentId: string): Promise<number> {
    try {
      // Get segment criteria
      const segmentResult = await sql`
        SELECT criteria FROM email_segments WHERE id = ${segmentId}
      `;
      
      if (segmentResult.rows.length === 0) {
        return 0;
      }

      const criteria = segmentResult.rows[0].criteria;
      
      // Build query based on criteria
      let query = `
        SELECT COUNT(*) as count
        FROM email_contacts ec
        JOIN customers c ON ec.customer_id = c.id
        WHERE ec.email_status = 'active'
      `;
      
      const params: any[] = [];
      let paramIndex = 1;

      // Add criteria filters
      if (criteria.location?.states?.length > 0) {
        query += ` AND ec.custom_fields->>'state' = ANY($${paramIndex})`;
        params.push(criteria.location.states);
        paramIndex++;
      }

      if (criteria.engagement_score_min) {
        query += ` AND ec.engagement_score >= $${paramIndex}`;
        params.push(criteria.engagement_score_min);
        paramIndex++;
      }

      if (criteria.engagement_score_max) {
        query += ` AND ec.engagement_score <= $${paramIndex}`;
        params.push(criteria.engagement_score_max);
        paramIndex++;
      }

      if (criteria.tags?.length > 0) {
        query += ` AND c.tags::jsonb ?| $${paramIndex}`;
        params.push(criteria.tags);
        paramIndex++;
      }

      const result = await sql.query(query, params);
      const count = parseInt(result.rows[0]?.count || '0');

      // Update segment with calculated count
      await sql`
        UPDATE email_segments 
        SET 
          contact_count = ${count},
          last_calculated_at = ${new Date().toISOString()},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${segmentId}
      `;

      return count;
      
    } catch (error) {
      console.error(`Error calculating segment size for ${segmentId}:`, error);
      return 0;
    }
  }

  // Get segment performance metrics
  static async getSegmentPerformanceMetrics(segmentId: string): Promise<SegmentPerformanceMetrics> {
    try {
      // Get basic segment info
      const segmentResult = await sql`
        SELECT * FROM email_segments WHERE id = ${segmentId}
      `;

      if (segmentResult.rows.length === 0) {
        throw new Error(`Segment ${segmentId} not found`);
      }

      const segment = segmentResult.rows[0];

      // Get engagement metrics from campaigns
      const performanceResult = await sql`
        SELECT 
          COUNT(DISTINCT ec.id) as contact_count,
          AVG(ec.engagement_score) as avg_engagement_score,
          COALESCE(AVG(CASE WHEN camp.total_sent > 0 
            THEN camp.total_opened::decimal / camp.total_sent 
            ELSE 0 END), 0) as avg_open_rate,
          COALESCE(AVG(CASE WHEN camp.total_sent > 0 
            THEN camp.total_clicked::decimal / camp.total_sent 
            ELSE 0 END), 0) as avg_click_rate,
          MAX(camp.sent_at) as last_campaign_sent
        FROM email_contacts ec
        JOIN customers c ON ec.customer_id = c.id
        LEFT JOIN email_campaigns camp ON camp.segment_id = ${segmentId}
        WHERE ec.email_status = 'active'
      `;

      const perf = performanceResult.rows[0];

      return {
        segmentId,
        contactCount: segment.contact_count || 0,
        avgEngagementScore: parseFloat(perf?.avg_engagement_score || '0'),
        openRate: parseFloat(perf?.avg_open_rate || '0'),
        clickRate: parseFloat(perf?.avg_click_rate || '0'),
        conversionRate: 0, // Would need conversion tracking
        revenueGenerated: 0, // Would need revenue tracking
        lastCampaignSent: perf?.last_campaign_sent ? new Date(perf.last_campaign_sent) : undefined,
        growthRate: 0 // Would need historical data
      };

    } catch (error) {
      console.error(`Error getting segment performance for ${segmentId}:`, error);
      throw error;
    }
  }

  // Generate campaign recommendations based on segment analysis
  static async generateCampaignRecommendations(): Promise<CampaignRecommendation[]> {
    const recommendations: CampaignRecommendation[] = [];

    try {
      // Get all active segments with their performance
      const segments = await sql`
        SELECT id, name, contact_count, created_at 
        FROM email_segments 
        WHERE is_active = true AND contact_count > 0
        ORDER BY contact_count DESC
      `;

      for (const segment of segments.rows) {
        const metrics = await this.getSegmentPerformanceMetrics(segment.id);
        
        // Generate recommendation based on segment characteristics
        let recommendation: CampaignRecommendation;

        if (segment.id.includes('new_imports')) {
          recommendation = {
            segmentId: segment.id,
            campaignType: 'welcome',
            priority: 'high',
            bestSendTime: '10:00 EST', // Morning send for welcome
            messageStrategy: 'Welcome to Fly2Any! Introduce services, establish trust, provide value',
            estimatedROI: 1.8
          };
        } else if (segment.id.includes('high_intent') || segment.id.includes('vip')) {
          recommendation = {
            segmentId: segment.id,
            campaignType: 'promotional',
            priority: 'high',
            bestSendTime: '14:00 EST', // Afternoon for high-intent
            messageStrategy: 'Premium travel offers, exclusive deals, personalized recommendations',
            estimatedROI: 3.2
          };
        } else if (segment.id.includes('seasonal') || segment.id.includes('holiday')) {
          recommendation = {
            segmentId: segment.id,
            campaignType: 'seasonal',
            priority: 'medium',
            bestSendTime: '11:00 EST',
            messageStrategy: 'Seasonal travel promotions, holiday-specific offers, family packages',
            estimatedROI: 2.1
          };
        } else if (segment.id.includes('reactivation')) {
          recommendation = {
            segmentId: segment.id,
            campaignType: 'reactivation',
            priority: 'medium',
            bestSendTime: '16:00 EST',
            messageStrategy: 'Win-back campaigns, special incentives, updated service offerings',
            estimatedROI: 1.4
          };
        } else {
          recommendation = {
            segmentId: segment.id,
            campaignType: 'educational',
            priority: 'low',
            bestSendTime: '12:00 EST',
            messageStrategy: 'Travel tips, destination guides, service education',
            estimatedROI: 1.2
          };
        }

        recommendations.push(recommendation);
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.error('Error generating campaign recommendations:', error);
      return [];
    }
  }

  // Update all segment sizes
  static async updateAllSegmentSizes(): Promise<{ updated: number; errors: number }> {
    let updated = 0;
    let errors = 0;

    try {
      const segments = await sql`
        SELECT id FROM email_segments WHERE is_active = true
      `;

      for (const segment of segments.rows) {
        try {
          await this.calculateSegmentSize(segment.id);
          updated++;
        } catch (error) {
          console.error(`Error updating segment ${segment.id}:`, error);
          errors++;
        }
      }

      console.log(`✅ Segment sizes updated: ${updated} success, ${errors} errors`);
      return { updated, errors };

    } catch (error) {
      console.error('Error in bulk segment update:', error);
      return { updated, errors: errors + 1 };
    }
  }

  // Get segmentation strategy overview
  static async getSegmentationOverview(): Promise<{
    totalSegments: number;
    totalContacts: number;
    segmentDistribution: any[];
    recommendations: CampaignRecommendation[];
    performanceMetrics: any;
  }> {
    try {
      // Get segment summary
      const segmentSummary = await sql`
        SELECT 
          COUNT(*) as total_segments,
          SUM(contact_count) as total_contacts,
          AVG(contact_count) as avg_segment_size
        FROM email_segments 
        WHERE is_active = true
      `;

      // Get segment distribution
      const segmentDistribution = await sql`
        SELECT 
          id,
          name,
          contact_count,
          ROUND((contact_count::decimal / NULLIF(SUM(contact_count) OVER(), 0)) * 100, 2) as percentage
        FROM email_segments 
        WHERE is_active = true AND contact_count > 0
        ORDER BY contact_count DESC
      `;

      const recommendations = await this.generateCampaignRecommendations();

      const summary = segmentSummary.rows[0];

      return {
        totalSegments: parseInt(summary?.total_segments || '0'),
        totalContacts: parseInt(summary?.total_contacts || '0'),
        segmentDistribution: segmentDistribution.rows,
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        performanceMetrics: {
          avgSegmentSize: parseFloat(summary?.avg_segment_size || '0'),
          segmentCoverage: segmentDistribution.rows.length,
          recommendedCampaigns: recommendations.length
        }
      };

    } catch (error) {
      console.error('Error getting segmentation overview:', error);
      throw error;
    }
  }
}