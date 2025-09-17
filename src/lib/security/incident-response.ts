/**
 * Advanced Security Incident Response System for Brazilian Diaspora Platform
 * Implements real-time monitoring, threat detection, and LGPD incident management
 */

import { generateSecurityAuditLog, SecurityAuditLog, SuspiciousActivityReport } from './security-config';
import { LGPDCompliance } from './lgpd-compliance';

export interface SecurityIncident {
  incident_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  affected_users?: string[];
  affected_data_categories?: string[];
  detection_time: Date;
  status: IncidentStatus;
  assigned_to?: string;
  resolution_time?: Date;
  resolution_notes?: string;
  lgpd_notification_required: boolean;
  anpd_reported: boolean;
  user_notification_sent: boolean;
  technical_details: any;
  impact_assessment: ImpactAssessment;
  containment_actions: ContainmentAction[];
  lessons_learned?: string;
}

export enum IncidentType {
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SYSTEM_COMPROMISE = 'system_compromise',
  MALWARE_DETECTION = 'malware_detection',
  DDOS_ATTACK = 'ddos_attack',
  PHISHING_ATTEMPT = 'phishing_attempt',
  LGPD_VIOLATION = 'lgpd_violation',
  PAYMENT_FRAUD = 'payment_fraud',
  INSIDER_THREAT = 'insider_threat',
  CONFIGURATION_ERROR = 'configuration_error'
}

export enum IncidentSeverity {
  CRITICAL = 'critical', // Immediate threat to data or systems
  HIGH = 'high',        // Significant impact on operations or security
  MEDIUM = 'medium',    // Moderate impact, contained
  LOW = 'low'          // Minor issue, no immediate threat
}

export enum IncidentStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface ImpactAssessment {
  users_affected: number;
  data_types_compromised: string[];
  systems_affected: string[];
  business_impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  financial_impact_estimate?: number;
  reputational_risk: 'low' | 'medium' | 'high';
  regulatory_implications: string[];
  lgpd_article_violations?: string[];
}

export interface ContainmentAction {
  action_id: string;
  description: string;
  implemented_at: Date;
  implemented_by: string;
  effectiveness: 'successful' | 'partial' | 'failed';
  notes?: string;
}

export interface ThreatDetectionRule {
  rule_id: string;
  name: string;
  description: string;
  severity: IncidentSeverity;
  conditions: {
    event_type?: string[];
    ip_patterns?: string[];
    user_agent_patterns?: string[];
    request_frequency?: {
      threshold: number;
      window_seconds: number;
    };
    failed_auth_attempts?: {
      threshold: number;
      window_seconds: number;
    };
    data_access_patterns?: {
      sensitive_data: boolean;
      bulk_access: boolean;
      unusual_hours: boolean;
    };
  };
  actions: {
    create_incident: boolean;
    block_ip: boolean;
    notify_admin: boolean;
    lgpd_review: boolean;
  };
  enabled: boolean;
}

/**
 * Real-time Security Monitoring and Incident Response System
 */
export class SecurityIncidentManager {
  private static instance: SecurityIncidentManager;
  private incidents: Map<string, SecurityIncident> = new Map();
  private detectionRules: ThreatDetectionRule[] = [];
  private alertChannels: AlertChannel[] = [];

  private constructor() {
    this.initializeDetectionRules();
    this.initializeAlertChannels();
  }

  public static getInstance(): SecurityIncidentManager {
    if (!SecurityIncidentManager.instance) {
      SecurityIncidentManager.instance = new SecurityIncidentManager();
    }
    return SecurityIncidentManager.instance;
  }

  /**
   * Process security event and detect potential incidents
   */
  public async processSecurityEvent(auditLog: SecurityAuditLog, context?: any): Promise<void> {
    // Evaluate against detection rules
    for (const rule of this.detectionRules) {
      if (!rule.enabled) continue;

      const isMatch = await this.evaluateRule(rule, auditLog, context);
      if (isMatch) {
        await this.handleRuleMatch(rule, auditLog, context);
      }
    }
  }

  /**
   * Create new security incident
   */
  public async createIncident(
    type: IncidentType,
    severity: IncidentSeverity,
    title: string,
    description: string,
    affectedUsers?: string[],
    technicalDetails?: any
  ): Promise<string> {
    const incidentId = `INC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const incident: SecurityIncident = {
      incident_id: incidentId,
      type,
      severity,
      title,
      description,
      affected_users: affectedUsers || [],
      affected_data_categories: [],
      detection_time: new Date(),
      status: IncidentStatus.DETECTED,
      lgpd_notification_required: this.requiresLGPDNotification(type, severity, affectedUsers?.length || 0),
      anpd_reported: false,
      user_notification_sent: false,
      technical_details: technicalDetails || {},
      impact_assessment: await this.assessImpact(type, severity, affectedUsers),
      containment_actions: []
    };

    this.incidents.set(incidentId, incident);

    // Log to audit trail
    const auditLog = generateSecurityAuditLog(
      'security_incident_created',
      null,
      'system',
      'incident-response-system',
      'success',
      {
        incident_id: incidentId,
        type,
        severity,
        affected_users: affectedUsers?.length || 0
      }
    );

    // Send immediate alerts for high/critical incidents
    if (severity === IncidentSeverity.CRITICAL || severity === IncidentSeverity.HIGH) {
      await this.sendImmediateAlert(incident);
    }

    // Start automated containment if applicable
    await this.initiateAutomatedContainment(incident);

    console.log(`🚨 [INCIDENT] Created incident ${incidentId}: ${title}`);
    return incidentId;
  }

  /**
   * Update incident status and take actions
   */
  public async updateIncident(
    incidentId: string,
    updates: Partial<SecurityIncident>,
    updatedBy: string
  ): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const previousStatus = incident.status;
    Object.assign(incident, updates);

    // Handle status changes
    if (updates.status && updates.status !== previousStatus) {
      await this.handleStatusChange(incident, previousStatus, updatedBy);
    }

    // LGPD notification requirements
    if (incident.lgpd_notification_required && incident.status === IncidentStatus.CONTAINED) {
      await this.handleLGPDNotifications(incident);
    }

    this.incidents.set(incidentId, incident);

    const auditLog = generateSecurityAuditLog(
      'security_incident_updated',
      null,
      'system',
      updatedBy,
      'success',
      {
        incident_id: incidentId,
        status: incident.status,
        severity: incident.severity
      }
    );

    console.log(`✅ [INCIDENT] Updated incident ${incidentId} to status: ${incident.status}`);
  }

  /**
   * Add containment action to incident
   */
  public async addContainmentAction(
    incidentId: string,
    description: string,
    implementedBy: string,
    effectiveness: 'successful' | 'partial' | 'failed'
  ): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const actionId = `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const action: ContainmentAction = {
      action_id: actionId,
      description,
      implemented_at: new Date(),
      implemented_by: implementedBy,
      effectiveness
    };

    incident.containment_actions.push(action);
    this.incidents.set(incidentId, incident);

    console.log(`🔧 [INCIDENT] Added containment action to ${incidentId}: ${description}`);
  }

  /**
   * Generate incident report for LGPD/ANPD
   */
  public async generateIncidentReport(incidentId: string): Promise<LGPDIncidentReport> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    return {
      incident_id: incidentId,
      controller_info: {
        name: 'Fly2Any - Viagens para Brasileiros',
        cnpj: '00.000.000/0001-00', // Replace with actual CNPJ
        address: 'Endereço da empresa',
        dpo_contact: 'dpo@fly2any.com',
        phone: '+55 11 0000-0000'
      },
      incident_details: {
        type: incident.type,
        detection_date: incident.detection_time,
        notification_date: new Date(),
        affected_data_subjects: incident.affected_users?.length || 0,
        data_categories: incident.affected_data_categories || [],
        circumstances: incident.description,
        consequences: this.describeConsequences(incident),
        measures_taken: incident.containment_actions.map(a => a.description)
      },
      technical_analysis: {
        root_cause: incident.technical_details.root_cause || 'Under investigation',
        attack_vector: incident.technical_details.attack_vector || 'Unknown',
        systems_affected: incident.impact_assessment.systems_affected,
        data_compromised: incident.impact_assessment.data_types_compromised
      },
      impact_assessment: {
        risk_to_rights_and_freedoms: this.assessRiskToRights(incident),
        likelihood_of_harm: this.assessLikelihoodOfHarm(incident),
        severity_of_harm: incident.severity,
        measures_to_mitigate: incident.containment_actions.map(a => a.description)
      },
      notification_timeline: {
        breach_detected: incident.detection_time,
        dpo_notified: incident.detection_time, // Assuming immediate notification
        anpd_notification_required: incident.anpd_reported,
        anpd_notification_sent: incident.anpd_reported ? new Date() : undefined,
        data_subjects_notified: incident.user_notification_sent ? new Date() : undefined
      },
      lessons_learned: incident.lessons_learned || '',
      prevention_measures: this.generatePreventionMeasures(incident)
    };
  }

  /**
   * Initialize threat detection rules
   */
  private initializeDetectionRules(): void {
    this.detectionRules = [
      {
        rule_id: 'RULE-001',
        name: 'Multiple Failed Login Attempts',
        description: 'Detects brute force login attempts',
        severity: IncidentSeverity.MEDIUM,
        conditions: {
          event_type: ['auth_failure'],
          failed_auth_attempts: { threshold: 10, window_seconds: 300 }
        },
        actions: {
          create_incident: true,
          block_ip: true,
          notify_admin: true,
          lgpd_review: false
        },
        enabled: true
      },
      {
        rule_id: 'RULE-002',
        name: 'Bulk Data Access',
        description: 'Detects unusual bulk access to user data',
        severity: IncidentSeverity.HIGH,
        conditions: {
          event_type: ['data_access'],
          data_access_patterns: {
            sensitive_data: true,
            bulk_access: true,
            unusual_hours: false
          }
        },
        actions: {
          create_incident: true,
          block_ip: false,
          notify_admin: true,
          lgpd_review: true
        },
        enabled: true
      },
      {
        rule_id: 'RULE-003',
        name: 'Suspicious LGPD Data Export',
        description: 'Multiple data export requests from same IP',
        severity: IncidentSeverity.MEDIUM,
        conditions: {
          event_type: ['lgpd_data_exported'],
          request_frequency: { threshold: 5, window_seconds: 3600 }
        },
        actions: {
          create_incident: true,
          block_ip: false,
          notify_admin: true,
          lgpd_review: true
        },
        enabled: true
      },
      {
        rule_id: 'RULE-004',
        name: 'Critical System Access',
        description: 'Unauthorized access to critical admin functions',
        severity: IncidentSeverity.CRITICAL,
        conditions: {
          event_type: ['admin_access', 'system_config_change'],
          request_frequency: { threshold: 1, window_seconds: 60 }
        },
        actions: {
          create_incident: true,
          block_ip: true,
          notify_admin: true,
          lgpd_review: false
        },
        enabled: true
      }
    ];
  }

  /**
   * Initialize alert channels
   */
  private initializeAlertChannels(): void {
    this.alertChannels = [
      {
        type: 'email',
        name: 'Security Team',
        config: {
          recipients: ['security@fly2any.com', 'dpo@fly2any.com'],
          severity_threshold: IncidentSeverity.MEDIUM
        },
        enabled: true
      },
      {
        type: 'slack',
        name: 'Security Slack Channel',
        config: {
          webhook_url: process.env.SLACK_SECURITY_WEBHOOK,
          severity_threshold: IncidentSeverity.HIGH
        },
        enabled: Boolean(process.env.SLACK_SECURITY_WEBHOOK)
      }
    ];
  }

  /**
   * Evaluate detection rule against audit log
   */
  private async evaluateRule(
    rule: ThreatDetectionRule,
    auditLog: SecurityAuditLog,
    context?: any
  ): Promise<boolean> {
    const conditions = rule.conditions;

    // Check event type
    if (conditions.event_type && !conditions.event_type.includes(auditLog.action)) {
      return false;
    }

    // Check request frequency (would require historical data in production)
    if (conditions.request_frequency) {
      // Simplified implementation - in production, query historical logs
      const recentEvents = await this.getRecentEvents(
        auditLog.ipAddress,
        conditions.request_frequency.window_seconds
      );
      if (recentEvents.length < conditions.request_frequency.threshold) {
        return false;
      }
    }

    // Check failed auth attempts
    if (conditions.failed_auth_attempts && auditLog.action.includes('auth')) {
      const failedAttempts = await this.getFailedAuthAttempts(
        auditLog.ipAddress,
        conditions.failed_auth_attempts.window_seconds
      );
      if (failedAttempts < conditions.failed_auth_attempts.threshold) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle rule match by creating incident and taking actions
   */
  private async handleRuleMatch(
    rule: ThreatDetectionRule,
    auditLog: SecurityAuditLog,
    context?: any
  ): Promise<void> {
    if (rule.actions.create_incident) {
      const incidentId = await this.createIncident(
        this.mapRuleToIncidentType(rule),
        rule.severity,
        `${rule.name} - ${auditLog.ipAddress}`,
        `Automated detection: ${rule.description}`,
        auditLog.userId ? [auditLog.userId] : undefined,
        { rule_id: rule.rule_id, audit_log: auditLog }
      );

      // Block IP if required
      if (rule.actions.block_ip) {
        await this.blockIP(auditLog.ipAddress, incidentId);
      }

      // Send admin notification
      if (rule.actions.notify_admin) {
        await this.sendImmediateAlert(this.incidents.get(incidentId)!);
      }
    }
  }

  /**
   * Send immediate alert for critical incidents
   */
  private async sendImmediateAlert(incident: SecurityIncident): Promise<void> {
    for (const channel of this.alertChannels) {
      if (!channel.enabled) continue;
      
      const severityValue = this.getSeverityValue(incident.severity);
      const thresholdValue = this.getSeverityValue(channel.config.severity_threshold);
      
      if (severityValue >= thresholdValue) {
        await this.sendAlertToChannel(channel, incident);
      }
    }
  }

  /**
   * Handle LGPD notifications when required
   */
  private async handleLGPDNotifications(incident: SecurityIncident): Promise<void> {
    if (!incident.lgpd_notification_required) return;

    // Check if ANPD notification is required (within 72 hours of detection)
    const hoursSinceDetection = 
      (Date.now() - incident.detection_time.getTime()) / (1000 * 60 * 60);

    if (hoursSinceDetection <= 72 && this.requiresANPDNotification(incident)) {
      await this.notifyANPD(incident);
    }

    // Notify affected users if required
    if (this.requiresUserNotification(incident)) {
      await this.notifyAffectedUsers(incident);
    }
  }

  /**
   * Determine if incident requires LGPD notification
   */
  private requiresLGPDNotification(
    type: IncidentType,
    severity: IncidentSeverity,
    affectedUsersCount: number
  ): boolean {
    // LGPD Article 48 - notification requirements
    const criticalTypes = [
      IncidentType.DATA_BREACH,
      IncidentType.UNAUTHORIZED_ACCESS,
      IncidentType.SYSTEM_COMPROMISE
    ];

    return criticalTypes.includes(type) || 
           severity === IncidentSeverity.CRITICAL ||
           affectedUsersCount > 0;
  }

  /**
   * Assess impact of security incident
   */
  private async assessImpact(
    type: IncidentType,
    severity: IncidentSeverity,
    affectedUsers?: string[]
  ): Promise<ImpactAssessment> {
    return {
      users_affected: affectedUsers?.length || 0,
      data_types_compromised: this.getDataTypesForIncidentType(type),
      systems_affected: ['web_application', 'database'], // Simplified
      business_impact: this.mapSeverityToBusinessImpact(severity),
      reputational_risk: severity === IncidentSeverity.CRITICAL ? 'high' : 'medium',
      regulatory_implications: ['LGPD', 'PCI DSS'],
      lgpd_article_violations: this.getLGPDViolationsForType(type)
    };
  }

  // Helper methods (simplified implementations)
  private async getRecentEvents(ipAddress: string, windowSeconds: number): Promise<any[]> {
    // In production, query audit logs database
    return [];
  }

  private async getFailedAuthAttempts(ipAddress: string, windowSeconds: number): Promise<number> {
    // In production, count failed auth attempts from database
    return 0;
  }

  private async blockIP(ipAddress: string, incidentId: string): Promise<void> {
    // In production, integrate with firewall/CDN
    console.log(`🚫 [SECURITY] Blocked IP ${ipAddress} for incident ${incidentId}`);
  }

  private mapRuleToIncidentType(rule: ThreatDetectionRule): IncidentType {
    if (rule.rule_id.includes('auth')) return IncidentType.UNAUTHORIZED_ACCESS;
    if (rule.rule_id.includes('data')) return IncidentType.DATA_BREACH;
    return IncidentType.SYSTEM_COMPROMISE;
  }

  private getSeverityValue(severity: IncidentSeverity): number {
    switch (severity) {
      case IncidentSeverity.LOW: return 1;
      case IncidentSeverity.MEDIUM: return 2;
      case IncidentSeverity.HIGH: return 3;
      case IncidentSeverity.CRITICAL: return 4;
    }
  }

  private getDataTypesForIncidentType(type: IncidentType): string[] {
    switch (type) {
      case IncidentType.DATA_BREACH:
        return ['personal_data', 'contact_info', 'travel_history'];
      case IncidentType.PAYMENT_FRAUD:
        return ['payment_data', 'financial_info'];
      default:
        return ['system_logs'];
    }
  }

  private mapSeverityToBusinessImpact(severity: IncidentSeverity): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case IncidentSeverity.CRITICAL: return 'critical';
      case IncidentSeverity.HIGH: return 'high';
      case IncidentSeverity.MEDIUM: return 'medium';
      case IncidentSeverity.LOW: return 'low';
    }
  }

  private getLGPDViolationsForType(type: IncidentType): string[] {
    switch (type) {
      case IncidentType.DATA_BREACH:
        return ['Art. 46', 'Art. 49'];
      case IncidentType.UNAUTHORIZED_ACCESS:
        return ['Art. 46'];
      default:
        return [];
    }
  }

  // Additional helper methods...
  private async initiateAutomatedContainment(incident: SecurityIncident): Promise<void> {
    // Implement automated containment based on incident type
    console.log(`🤖 [CONTAINMENT] Initiating automated containment for ${incident.incident_id}`);
  }

  private async handleStatusChange(
    incident: SecurityIncident,
    previousStatus: IncidentStatus,
    updatedBy: string
  ): Promise<void> {
    console.log(`📊 [INCIDENT] Status changed: ${previousStatus} → ${incident.status}`);
  }

  private async sendAlertToChannel(channel: AlertChannel, incident: SecurityIncident): Promise<void> {
    console.log(`📢 [ALERT] Sending alert via ${channel.type} for incident ${incident.incident_id}`);
  }

  private requiresANPDNotification(incident: SecurityIncident): boolean {
    return incident.severity === IncidentSeverity.CRITICAL ||
           (incident.affected_users?.length ?? 0) > 100;
  }

  private requiresUserNotification(incident: SecurityIncident): boolean {
    return incident.type === IncidentType.DATA_BREACH &&
           incident.severity !== IncidentSeverity.LOW;
  }

  private async notifyANPD(incident: SecurityIncident): Promise<void> {
    console.log(`🏛️ [LGPD] ANPD notification required for incident ${incident.incident_id}`);
    // In production, implement ANPD notification API
  }

  private async notifyAffectedUsers(incident: SecurityIncident): Promise<void> {
    console.log(`👥 [NOTIFICATION] Notifying affected users for incident ${incident.incident_id}`);
    // In production, send user notifications
  }

  private describeConsequences(incident: SecurityIncident): string {
    // Generate consequences description based on incident details
    return `Impact assessment: ${incident.impact_assessment.business_impact} business impact`;
  }

  private assessRiskToRights(incident: SecurityIncident): string {
    return incident.severity === IncidentSeverity.CRITICAL ? 'High risk' : 'Medium risk';
  }

  private assessLikelihoodOfHarm(incident: SecurityIncident): string {
    return 'Under assessment';
  }

  private generatePreventionMeasures(incident: SecurityIncident): string[] {
    return [
      'Enhanced monitoring implemented',
      'Additional security controls deployed',
      'Staff training updated'
    ];
  }
}

// Supporting interfaces
interface AlertChannel {
  type: 'email' | 'slack' | 'webhook';
  name: string;
  config: {
    recipients?: string[];
    webhook_url?: string;
    severity_threshold: IncidentSeverity;
  };
  enabled: boolean;
}

interface LGPDIncidentReport {
  incident_id: string;
  controller_info: {
    name: string;
    cnpj: string;
    address: string;
    dpo_contact: string;
    phone: string;
  };
  incident_details: {
    type: IncidentType;
    detection_date: Date;
    notification_date: Date;
    affected_data_subjects: number;
    data_categories: string[];
    circumstances: string;
    consequences: string;
    measures_taken: string[];
  };
  technical_analysis: {
    root_cause: string;
    attack_vector: string;
    systems_affected: string[];
    data_compromised: string[];
  };
  impact_assessment: {
    risk_to_rights_and_freedoms: string;
    likelihood_of_harm: string;
    severity_of_harm: IncidentSeverity;
    measures_to_mitigate: string[];
  };
  notification_timeline: {
    breach_detected: Date;
    dpo_notified: Date;
    anpd_notification_required: boolean;
    anpd_notification_sent?: Date;
    data_subjects_notified?: Date;
  };
  lessons_learned: string;
  prevention_measures: string[];
}

// Export the singleton instance
export const securityIncidentManager = SecurityIncidentManager.getInstance();