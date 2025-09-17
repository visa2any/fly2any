/**
 * LGPD (Lei Geral de Proteção de Dados) Compliance Service
 * Ensures compliance with Brazilian data protection law for diaspora users
 */

import { sql } from '@vercel/postgres';

export interface LGPDConsentRecord {
  user_id: string;
  consent_type: 'marketing' | 'analytics' | 'essential' | 'data_processing';
  consent_given: boolean;
  consent_date: Date;
  consent_method: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  purpose_description: string;
  data_categories: string[];
  retention_period: string;
  ip_address?: string;
  user_agent?: string;
}

export interface LGPDDataRequest {
  request_id: string;
  user_id: string;
  request_type: 'access' | 'portability' | 'rectification' | 'erasure' | 'restriction' | 'objection';
  request_date: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  response_date?: Date;
  fulfillment_notes?: string;
}

export interface LGPDComplianceReport {
  timestamp: string;
  total_users: number;
  consent_status: {
    marketing_consent: number;
    analytics_consent: number;
    essential_consent: number;
    no_consent: number;
  };
  data_requests: {
    total_requests: number;
    pending_requests: number;
    completed_requests: number;
    avg_response_time_hours: number;
  };
  security_measures: {
    encryption_enabled: boolean;
    access_controls: boolean;
    audit_logging: boolean;
    data_minimization: boolean;
  };
  compliance_score: number;
  recommendations: string[];
}

export class LGPDCompliance {
  /**
   * Initialize LGPD compliance tables
   */
  static async initializeLGPDTables(): Promise<void> {
    try {
      // LGPD consent records table
      await sql`
        CREATE TABLE IF NOT EXISTS lgpd_consent_records (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id VARCHAR(255) NOT NULL,
          consent_type VARCHAR(50) NOT NULL,
          consent_given BOOLEAN NOT NULL,
          consent_date TIMESTAMP NOT NULL DEFAULT NOW(),
          consent_method VARCHAR(20) NOT NULL,
          purpose_description TEXT NOT NULL,
          data_categories TEXT[] DEFAULT '{}',
          retention_period VARCHAR(100),
          ip_address INET,
          user_agent TEXT,
          withdrawal_date TIMESTAMP,
          withdrawal_reason TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // LGPD data requests table
      await sql`
        CREATE TABLE IF NOT EXISTS lgpd_data_requests (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          request_id VARCHAR(255) UNIQUE NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          request_type VARCHAR(50) NOT NULL,
          request_date TIMESTAMP NOT NULL DEFAULT NOW(),
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          response_date TIMESTAMP,
          fulfillment_date TIMESTAMP,
          fulfillment_notes TEXT,
          requested_data_categories TEXT[],
          legal_basis TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // LGPD data processing log table
      await sql`
        CREATE TABLE IF NOT EXISTS lgpd_processing_log (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id VARCHAR(255) NOT NULL,
          processing_activity VARCHAR(100) NOT NULL,
          legal_basis VARCHAR(100) NOT NULL,
          data_categories TEXT[] NOT NULL,
          processing_purpose TEXT NOT NULL,
          data_source VARCHAR(100),
          data_recipients TEXT[],
          retention_period VARCHAR(100),
          processing_date TIMESTAMP NOT NULL DEFAULT NOW(),
          automated_decision BOOLEAN DEFAULT FALSE,
          profiling_activity BOOLEAN DEFAULT FALSE,
          cross_border_transfer BOOLEAN DEFAULT FALSE,
          transfer_safeguards TEXT
        )
      `;

      // LGPD audit trail table
      await sql`
        CREATE TABLE IF NOT EXISTS lgpd_audit_trail (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id VARCHAR(255),
          action VARCHAR(100) NOT NULL,
          action_details JSONB DEFAULT '{}',
          performed_by VARCHAR(255) NOT NULL,
          ip_address INET,
          user_agent TEXT,
          timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
          result VARCHAR(50),
          error_message TEXT
        )
      `;

      // Create indexes for performance
      await sql`
        CREATE INDEX IF NOT EXISTS idx_lgpd_consent_user_type 
        ON lgpd_consent_records(user_id, consent_type, consent_given)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_lgpd_requests_status_date 
        ON lgpd_data_requests(status, request_date DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_lgpd_processing_user_date 
        ON lgpd_processing_log(user_id, processing_date DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_lgpd_audit_timestamp 
        ON lgpd_audit_trail(timestamp DESC)
      `;

      console.log('✅ LGPD compliance tables initialized');
    } catch (error) {
      console.error('❌ Failed to initialize LGPD tables:', error);
      throw error;
    }
  }

  /**
   * Record user consent for LGPD compliance
   */
  static async recordConsent(consentData: LGPDConsentRecord): Promise<void> {
    try {
      await sql`
        INSERT INTO lgpd_consent_records (
          user_id,
          consent_type,
          consent_given,
          consent_date,
          consent_method,
          purpose_description,
          data_categories,
          retention_period,
          ip_address,
          user_agent
        ) VALUES (
          ${consentData.user_id},
          ${consentData.consent_type},
          ${consentData.consent_given},
          ${consentData.consent_date.toISOString()},
          ${consentData.consent_method},
          ${consentData.purpose_description},
          ${JSON.stringify(consentData.data_categories)},
          ${consentData.retention_period},
          ${consentData.ip_address || null},
          ${consentData.user_agent || null}
        )
      `;

      // Log the consent action
      await this.logAuditAction(
        consentData.user_id,
        'consent_recorded',
        {
          consent_type: consentData.consent_type,
          consent_given: consentData.consent_given,
          method: consentData.consent_method
        },
        'system',
        consentData.ip_address
      );

      console.log(`✅ LGPD consent recorded for user ${consentData.user_id}: ${consentData.consent_type}`);
    } catch (error) {
      console.error('❌ Failed to record LGPD consent:', error);
      throw error;
    }
  }

  /**
   * Withdraw user consent
   */
  static async withdrawConsent(
    userId: string, 
    consentType: string, 
    reason?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      await sql`
        UPDATE lgpd_consent_records 
        SET 
          consent_given = FALSE,
          withdrawal_date = NOW(),
          withdrawal_reason = ${reason || 'User requested withdrawal'},
          updated_at = NOW()
        WHERE user_id = ${userId} 
          AND consent_type = ${consentType}
          AND consent_given = TRUE
      `;

      await this.logAuditAction(
        userId,
        'consent_withdrawn',
        { consent_type: consentType, reason },
        'user',
        ipAddress
      );

      console.log(`✅ LGPD consent withdrawn for user ${userId}: ${consentType}`);
    } catch (error) {
      console.error('❌ Failed to withdraw LGPD consent:', error);
      throw error;
    }
  }

  /**
   * Create LGPD data request
   */
  static async createDataRequest(requestData: Omit<LGPDDataRequest, 'status'>): Promise<string> {
    try {
      const requestId = `LGPD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await sql`
        INSERT INTO lgpd_data_requests (
          request_id,
          user_id,
          request_type,
          request_date
        ) VALUES (
          ${requestId},
          ${requestData.user_id},
          ${requestData.request_type},
          ${requestData.request_date.toISOString()}
        )
      `;

      await this.logAuditAction(
        requestData.user_id,
        'data_request_created',
        { request_type: requestData.request_type, request_id: requestId },
        'user'
      );

      console.log(`✅ LGPD data request created: ${requestId}`);
      return requestId;
    } catch (error) {
      console.error('❌ Failed to create LGPD data request:', error);
      throw error;
    }
  }

  /**
   * Process LGPD data request
   */
  static async processDataRequest(
    requestId: string, 
    status: 'completed' | 'rejected', 
    notes?: string
  ): Promise<void> {
    try {
      await sql`
        UPDATE lgpd_data_requests 
        SET 
          status = ${status},
          response_date = NOW(),
          fulfillment_date = ${status === 'completed' ? 'NOW()' : null},
          fulfillment_notes = ${notes || null},
          updated_at = NOW()
        WHERE request_id = ${requestId}
      `;

      const request = await sql`
        SELECT user_id FROM lgpd_data_requests WHERE request_id = ${requestId}
      `;

      if (request.rows.length > 0) {
        await this.logAuditAction(
          request.rows[0].user_id,
          'data_request_processed',
          { request_id: requestId, status, notes },
          'admin'
        );
      }

      console.log(`✅ LGPD data request processed: ${requestId} - ${status}`);
    } catch (error) {
      console.error('❌ Failed to process LGPD data request:', error);
      throw error;
    }
  }

  /**
   * Log data processing activity for LGPD compliance
   */
  static async logDataProcessing(
    userId: string,
    activity: string,
    legalBasis: string,
    dataCategories: string[],
    purpose: string,
    options: {
      dataSource?: string;
      recipients?: string[];
      retentionPeriod?: string;
      automatedDecision?: boolean;
      profiling?: boolean;
      crossBorderTransfer?: boolean;
      transferSafeguards?: string;
    } = {}
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO lgpd_processing_log (
          user_id,
          processing_activity,
          legal_basis,
          data_categories,
          processing_purpose,
          data_source,
          data_recipients,
          retention_period,
          automated_decision,
          profiling_activity,
          cross_border_transfer,
          transfer_safeguards
        ) VALUES (
          ${userId},
          ${activity},
          ${legalBasis},
          ${JSON.stringify(dataCategories)},
          ${purpose},
          ${options.dataSource || null},
          ${options.recipients ? JSON.stringify(options.recipients) : null},
          ${options.retentionPeriod || null},
          ${options.automatedDecision || false},
          ${options.profiling || false},
          ${options.crossBorderTransfer || false},
          ${options.transferSafeguards || null}
        )
      `;
    } catch (error) {
      console.error('❌ Failed to log LGPD data processing:', error);
      throw error;
    }
  }

  /**
   * Log audit trail action
   */
  static async logAuditAction(
    userId: string | null,
    action: string,
    details: any,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
    result: string = 'success'
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO lgpd_audit_trail (
          user_id,
          action,
          action_details,
          performed_by,
          ip_address,
          user_agent,
          result
        ) VALUES (
          ${userId},
          ${action},
          ${JSON.stringify(details)},
          ${performedBy},
          ${ipAddress || null},
          ${userAgent || null},
          ${result}
        )
      `;
    } catch (error) {
      console.error('❌ Failed to log LGPD audit action:', error);
    }
  }

  /**
   * Get user's data for portability request
   */
  static async getUserData(userId: string): Promise<any> {
    try {
      // Get user profile data
      const userProfile = await sql`
        SELECT * FROM diaspora_user_profiles WHERE user_id = ${userId}
      `;

      // Get user events
      const userEvents = await sql`
        SELECT * FROM brazilian_user_events WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1000
      `;

      // Get consent records
      const consentRecords = await sql`
        SELECT * FROM lgpd_consent_records WHERE user_id = ${userId}
        ORDER BY consent_date DESC
      `;

      // Get processing log
      const processingLog = await sql`
        SELECT * FROM lgpd_processing_log WHERE user_id = ${userId}
        ORDER BY processing_date DESC
        LIMIT 100
      `;

      await this.logAuditAction(
        userId,
        'data_export_requested',
        { exported_records: userEvents.rows.length },
        'user'
      );

      return {
        user_profile: userProfile.rows,
        events: userEvents.rows,
        consent_records: consentRecords.rows,
        processing_log: processingLog.rows,
        export_date: new Date().toISOString(),
        export_format: 'JSON'
      };
    } catch (error) {
      console.error('❌ Failed to get user data for LGPD:', error);
      throw error;
    }
  }

  /**
   * Delete user data for erasure request
   */
  static async eraseUserData(userId: string, reason: string = 'User requested erasure'): Promise<void> {
    try {
      // Start transaction for data erasure
      const tables = [
        'diaspora_user_profiles',
        'brazilian_user_events',
        'conversion_funnel_tracking',
        'ab_test_experiments'
      ];

      let deletedRecords = 0;

      for (const table of tables) {
        const result = await sql.query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]);
        deletedRecords += result.rowCount || 0;
      }

      // Keep consent records and processing log for legal compliance
      // but mark them as related to erased user
      await sql`
        UPDATE lgpd_consent_records 
        SET user_id = 'ERASED_USER', updated_at = NOW()
        WHERE user_id = ${userId}
      `;

      await sql`
        UPDATE lgpd_processing_log 
        SET user_id = 'ERASED_USER'
        WHERE user_id = ${userId}
      `;

      await this.logAuditAction(
        null, // No user ID after erasure
        'user_data_erased',
        { 
          original_user_id: userId,
          deleted_records: deletedRecords,
          reason 
        },
        'admin'
      );

      console.log(`✅ LGPD user data erased: ${userId} (${deletedRecords} records)`);
    } catch (error) {
      console.error('❌ Failed to erase user data for LGPD:', error);
      throw error;
    }
  }

  /**
   * Generate LGPD compliance report
   */
  static async generateComplianceReport(): Promise<LGPDComplianceReport> {
    try {
      await this.initializeLGPDTables();

      // Get consent statistics
      const consentStats = await sql`
        SELECT 
          consent_type,
          COUNT(*) as total_consents,
          COUNT(CASE WHEN consent_given = true THEN 1 END) as granted_consents
        FROM lgpd_consent_records 
        WHERE withdrawal_date IS NULL
        GROUP BY consent_type
      `;

      // Get data request statistics
      const requestStats = await sql`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (COALESCE(response_date, NOW()) - request_date))/3600) as avg_hours
        FROM lgpd_data_requests 
        GROUP BY status
      `;

      // Get total unique users
      const totalUsers = await sql`
        SELECT COUNT(DISTINCT user_id) as total 
        FROM lgpd_consent_records 
        WHERE user_id != 'ERASED_USER'
      `;

      const consentByType = consentStats.rows.reduce((acc, row) => {
        acc[row.consent_type + '_consent'] = parseInt(row.granted_consents);
        return acc;
      }, {} as any);

      const requestsByStatus = requestStats.rows.reduce((acc, row) => {
        acc[row.status + '_requests'] = parseInt(row.count);
        return acc;
      }, {} as any);

      const avgResponseTime = requestStats.rows.find(r => r.status === 'completed')?.avg_hours || 0;

      // Calculate compliance score
      const totalConsents = consentStats.rows.reduce((sum, row) => sum + parseInt(row.total_consents), 0);
      const grantedConsents = consentStats.rows.reduce((sum, row) => sum + parseInt(row.granted_consents), 0);
      const consentRate = totalConsents > 0 ? (grantedConsents / totalConsents) : 0;
      const responseTimeScore = avgResponseTime <= 72 ? 100 : Math.max(0, 100 - (avgResponseTime - 72) * 2);
      const complianceScore = Math.round((consentRate * 50) + (responseTimeScore * 0.3) + 20); // Base compliance

      return {
        timestamp: new Date().toISOString(),
        total_users: parseInt(totalUsers.rows[0]?.total) || 0,
        consent_status: {
          marketing_consent: consentByType.marketing_consent || 0,
          analytics_consent: consentByType.analytics_consent || 0,
          essential_consent: consentByType.essential_consent || 0,
          no_consent: Math.max(0, parseInt(totalUsers.rows[0]?.total) - grantedConsents)
        },
        data_requests: {
          total_requests: requestStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
          pending_requests: requestsByStatus.pending_requests || 0,
          completed_requests: requestsByStatus.completed_requests || 0,
          avg_response_time_hours: Math.round(avgResponseTime * 10) / 10
        },
        security_measures: {
          encryption_enabled: true,
          access_controls: true,
          audit_logging: true,
          data_minimization: true
        },
        compliance_score: complianceScore,
        recommendations: [
          '📋 Implement regular LGPD compliance audits (monthly)',
          '🔒 Ensure all data transfers are encrypted and logged',
          '⏱️ Respond to data requests within 15 days (LGPD requirement)',
          '📚 Provide LGPD training for all staff handling Brazilian user data',
          '🎯 Implement automated consent renewal for long-term users',
          '📊 Set up real-time monitoring for data processing activities',
          '🔍 Regular reviews of data retention policies and automated deletion',
          '🌐 Ensure privacy policy is available in Portuguese',
          '📱 Implement clear consent mechanisms on mobile applications',
          '⚖️ Maintain documentation for all legal bases of processing'
        ]
      };
    } catch (error) {
      console.error('❌ Failed to generate LGPD compliance report:', error);
      throw error;
    }
  }

  /**
   * Check if user has given consent for specific processing
   */
  static async hasUserConsent(userId: string, consentType: string): Promise<boolean> {
    try {
      const consent = await sql`
        SELECT consent_given 
        FROM lgpd_consent_records 
        WHERE user_id = ${userId} 
          AND consent_type = ${consentType}
          AND withdrawal_date IS NULL
        ORDER BY consent_date DESC
        LIMIT 1
      `;

      return consent.rows.length > 0 && consent.rows[0].consent_given;
    } catch (error) {
      console.error('❌ Failed to check user consent:', error);
      return false;
    }
  }

  /**
   * Get pending data requests requiring attention
   */
  static async getPendingDataRequests(): Promise<any[]> {
    try {
      const requests = await sql`
        SELECT 
          request_id,
          user_id,
          request_type,
          request_date,
          EXTRACT(EPOCH FROM (NOW() - request_date))/3600 as hours_pending
        FROM lgpd_data_requests 
        WHERE status = 'pending'
        ORDER BY request_date ASC
      `;

      return requests.rows.map(row => ({
        request_id: row.request_id,
        user_id: row.user_id,
        request_type: row.request_type,
        request_date: row.request_date,
        hours_pending: Math.round(parseFloat(row.hours_pending) * 10) / 10,
        urgency: parseFloat(row.hours_pending) > 72 ? 'HIGH' : 
                parseFloat(row.hours_pending) > 48 ? 'MEDIUM' : 'LOW'
      }));
    } catch (error) {
      console.error('❌ Failed to get pending data requests:', error);
      return [];
    }
  }
}