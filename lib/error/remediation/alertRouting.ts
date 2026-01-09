/**
 * Intelligent Alert Routing with Machine Learning
 * 
 * Uses ML to route alerts to the most appropriate teams and individuals
 * based on error patterns, team expertise, and historical resolution data.
 * Part of Phase 2C: Automated Remediation improvements.
 */

import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export interface TeamExpertise {
  teamId: string;
  teamName: string;
  expertiseAreas: ErrorCategory[];
  preferredSeverities: ErrorSeverity[];
  responseTime: number; // Average response time in minutes
  resolutionRate: number; // 0-100 percentage
  currentLoad: number; // 0-100 percentage
  available: boolean;
  notificationChannels: string[];
}

export interface HistoricalResolution {
  errorPattern: string;
  teamId: string;
  resolutionTime: number; // minutes
  success: boolean;
  timestamp: Date;
}

export interface AlertRoutingDecision {
  alertId: string;
  errorId: string;
  primaryTeam: string;
  secondaryTeam?: string;
  escalationLevel: number; // 1-5
  estimatedResponseTime: number; // minutes
  confidence: number; // 0-1
  routingReason: string;
  notificationChannels: string[];
  timestamp: Date;
}

export interface AlertContext {
  alertId: string;
  errorId: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  endpoint?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * ML-based Alert Router that uses historical data to make intelligent routing decisions
 */
export class AlertRouter {
  private teams: Map<string, TeamExpertise> = new Map();
  private historicalData: HistoricalResolution[] = [];
  private patterns: Map<string, { pattern: RegExp; teamId: string; confidence: number }> = new Map();

  constructor() {
    this.loadDefaultTeams();
    this.learnFromHistoricalData();
  }

  /**
   * Route an alert to the most appropriate team
   */
  async routeAlert(context: AlertContext): Promise<AlertRoutingDecision> {
    const startTime = Date.now();
    
    try {
      // Step 1: Check for known patterns
      const patternMatch = this.matchPattern(context);
      if (patternMatch) {
        return this.createRoutingDecision(context, patternMatch.teamId, patternMatch.confidence, 'Pattern match');
      }

      // Step 2: Use ML model to predict best team (simplified for now)
      const teamScores = this.calculateTeamScores(context);
      
      // Step 3: Find best team based on score
      const bestTeam = this.selectBestTeam(teamScores);
      
      // Step 4: Check for escalation based on severity and time
      const escalationLevel = this.calculateEscalationLevel(context);
      
      // Step 5: Create routing decision
      const decision = this.createRoutingDecision(
        context,
        bestTeam.teamId,
        bestTeam.score,
        bestTeam.reason,
        escalationLevel
      );

      // Step 6: Log the decision for future learning
      this.recordRoutingDecision(context, decision);

      console.log(`[AlertRouter] Routed alert ${context.alertId} to ${bestTeam.teamId} with confidence ${bestTeam.score}`);
      return decision;

    } catch (error: any) {
      console.error('[AlertRouter] Failed to route alert:', error.message);
      
      // Fallback to default routing
      return this.createFallbackRouting(context);
    }
  }

  /**
   * Add a team to the routing system
   */
  addTeam(team: TeamExpertise): void {
    this.teams.set(team.teamId, team);
  }

  /**
   * Record a resolution outcome for learning
   */
  recordResolution(resolution: HistoricalResolution): void {
    this.historicalData.push(resolution);
    
    // Learn from this resolution
    this.learnFromResolution(resolution);
    
    // Keep only last 1000 records
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(-1000);
    }
  }

  /**
   * Get all teams (for UI/management)
   */
  getAllTeams(): TeamExpertise[] {
    return Array.from(this.teams.values());
  }

  /**
   * Update team availability
   */
  updateTeamAvailability(teamId: string, available: boolean): boolean {
    const team = this.teams.get(teamId);
    if (team) {
      team.available = available;
      return true;
    }
    return false;
  }

  /**
   * Update team load
   */
  updateTeamLoad(teamId: string, load: number): boolean {
    const team = this.teams.get(teamId);
    if (team) {
      team.currentLoad = Math.max(0, Math.min(100, load));
      return true;
    }
    return false;
  }

  /**
   * Get routing statistics
   */
  getStatistics() {
    const totalDecisions = this.historicalData.length;
    const successfulResolutions = this.historicalData.filter(r => r.success).length;
    const averageResolutionTime = this.historicalData.reduce((sum, r) => sum + r.resolutionTime, 0) / (totalDecisions || 1);
    
    return {
      totalDecisions,
      successfulResolutions,
      successRate: (successfulResolutions / (totalDecisions || 1)) * 100,
      averageResolutionTime,
      teams: this.teams.size,
      patterns: this.patterns.size,
    };
  }

  private matchPattern(context: AlertContext): { teamId: string; confidence: number } | null {
    for (const [key, pattern] of this.patterns.entries()) {
      if (pattern.pattern.test(context.message) || 
          (context.endpoint && pattern.pattern.test(context.endpoint))) {
        return { teamId: pattern.teamId, confidence: pattern.confidence };
      }
    }
    return null;
  }

  private calculateTeamScores(context: AlertContext): Array<{ teamId: string; score: number; reason: string }> {
    const scores: Array<{ teamId: string; score: number; reason: string }> = [];
    
    for (const team of this.teams.values()) {
      if (!team.available) {
        scores.push({ teamId: team.teamId, score: 0, reason: 'Team unavailable' });
        continue;
      }

      let score = 0;
      let reason = '';

      // Expertise match (40% weight)
      const expertiseMatch = team.expertiseAreas.includes(context.category) ? 1 : 0.3;
      score += expertiseMatch * 40;

      // Severity preference (20% weight)
      const severityMatch = team.preferredSeverities.includes(context.severity) ? 1 : 0.5;
      score += severityMatch * 20;

      // Load consideration (20% weight)
      const loadFactor = (100 - team.currentLoad) / 100;
      score += loadFactor * 20;

      // Historical performance (20% weight)
      const historicalScore = team.resolutionRate / 100;
      score += historicalScore * 20;

      // Adjust based on response time (bonus/penalty)
      const responseTimeFactor = Math.max(0, 1 - (team.responseTime / 120)); // 2 hours max
      score *= (0.8 + responseTimeFactor * 0.2); // Adjust by 80-100%

      reason = `Expertise: ${expertiseMatch}, Severity: ${severityMatch}, Load: ${loadFactor}, History: ${historicalScore}`;
      scores.push({ teamId: team.teamId, score, reason });
    }

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  }

  private selectBestTeam(scores: Array<{ teamId: string; score: number; reason: string }>) {
    // Filter out teams with score 0
    const viableTeams = scores.filter(s => s.score > 0);
    
    if (viableTeams.length === 0) {
      // Return highest scoring team even if score is 0
      return scores[0] || { teamId: 'default', score: 0, reason: 'No viable teams' };
    }

    // For high severity, pick the highest score
    return viableTeams[0];
  }

  private calculateEscalationLevel(context: AlertContext): number {
    // Base escalation on severity
    const severityLevels: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 1,
      [ErrorSeverity.NORMAL]: 2,
      [ErrorSeverity.HIGH]: 3,
      [ErrorSeverity.CRITICAL]: 4,
    };

    let level = severityLevels[context.severity] || 2;

    // Check if this is a repeated error (would require checking history)
    const recentErrors = this.historicalData.filter(
      h => h.timestamp.getTime() > Date.now() - 3600000 // Last hour
    );

    if (recentErrors.length > 5) {
      level = Math.min(5, level + 1);
    }

    // Check if business hours (9 AM to 5 PM)
    const now = new Date();
    const hour = now.getHours();
    const isBusinessHours = hour >= 9 && hour < 17;
    
    if (!isBusinessHours && level < 3) {
      level = 3; // Escalate during off-hours
    }

    return level;
  }

  private createRoutingDecision(
    context: AlertContext,
    teamId: string,
    confidence: number,
    reason: string,
    escalationLevel?: number
  ): AlertRoutingDecision {
    const team = this.teams.get(teamId);
    const actualEscalationLevel = escalationLevel || this.calculateEscalationLevel(context);

    return {
      alertId: context.alertId,
      errorId: context.errorId,
      primaryTeam: teamId,
      secondaryTeam: this.getSecondaryTeam(teamId, context),
      escalationLevel: actualEscalationLevel,
      estimatedResponseTime: team?.responseTime || 30,
      confidence: Math.max(0.1, Math.min(1, confidence / 100)),
      routingReason: reason,
      notificationChannels: team?.notificationChannels || ['slack', 'email'],
      timestamp: new Date(),
    };
  }

  private getSecondaryTeam(primaryTeamId: string, context: AlertContext): string | undefined {
    const teams = Array.from(this.teams.values())
      .filter(team => team.teamId !== primaryTeamId && team.available)
      .sort((a, b) => b.resolutionRate - a.resolutionRate);

    if (teams.length > 0) {
      return teams[0].teamId;
    }
    return undefined;
  }

  private createFallbackRouting(context: AlertContext): AlertRoutingDecision {
    // Fallback to default team or round-robin among available teams
    const availableTeams = Array.from(this.teams.values()).filter(t => t.available);
    
    let fallbackTeam = 'default';
    if (availableTeams.length > 0) {
      // Pick team with lowest current load
      availableTeams.sort((a, b) => a.currentLoad - b.currentLoad);
      fallbackTeam = availableTeams[0].teamId;
    }

    return {
      alertId: context.alertId,
      errorId: context.errorId,
      primaryTeam: fallbackTeam,
      escalationLevel: 3,
      estimatedResponseTime: 60,
      confidence: 0.3,
      routingReason: 'Fallback routing - no optimal team found',
      notificationChannels: ['slack', 'email'],
      timestamp: new Date(),
    };
  }

  private recordRoutingDecision(context: AlertContext, decision: AlertRoutingDecision): void {
    // In production, this would be stored in a database
    console.log(`[AlertRouter] Recorded routing decision for alert ${context.alertId}:`, decision);
  }

  private learnFromHistoricalData(): void {
    // Extract patterns from historical data
    this.historicalData.forEach(resolution => {
      this.learnFromResolution(resolution);
    });
  }

  private learnFromResolution(resolution: HistoricalResolution): void {
    // Simple pattern learning: extract key terms from error patterns
    const terms = resolution.errorPattern.toLowerCase().split(/[^a-z0-9]+/).filter(term => term.length > 3);
    
    terms.forEach(term => {
      const patternKey = `term:${term}`;
      if (!this.patterns.has(patternKey)) {
        this.patterns.set(patternKey, {
          pattern: new RegExp(term, 'i'),
          teamId: resolution.teamId,
          confidence: resolution.success ? 0.8 : 0.3,
        });
      } else {
        // Update confidence based on success
        const pattern = this.patterns.get(patternKey)!;
        if (resolution.success) {
          pattern.confidence = Math.min(0.95, pattern.confidence + 0.1);
        } else {
          pattern.confidence = Math.max(0.1, pattern.confidence - 0.1);
        }
      }
    });
  }

  private loadDefaultTeams(): void {
    this.addTeam({
      teamId: 'frontend',
      teamName: 'Frontend Team',
      expertiseAreas: [ErrorCategory.VALIDATION, ErrorCategory.NETWORK, ErrorCategory.UNKNOWN],
      preferredSeverities: [ErrorSeverity.LOW, ErrorSeverity.NORMAL, ErrorSeverity.HIGH],
      responseTime: 15,
      resolutionRate: 85,
      currentLoad: 30,
      available: true,
      notificationChannels: ['slack-frontend', 'email'],
    });

    this.addTeam({
      teamId: 'backend',
      teamName: 'Backend Team',
      expertiseAreas: [ErrorCategory.DATABASE, ErrorCategory.EXTERNAL_API, ErrorCategory.AUTHENTICATION],
      preferredSeverities: [ErrorSeverity.NORMAL, ErrorSeverity.HIGH, ErrorSeverity.CRITICAL],
      responseTime: 25,
      resolutionRate: 90,
      currentLoad: 40,
      available: true,
      notificationChannels: ['slack-backend', 'email', 'pagerduty'],
    });

    this.addTeam({
      teamId: 'infrastructure',
      teamName: 'Infrastructure Team',
      expertiseAreas: [ErrorCategory.NETWORK, ErrorCategory.CONFIGURATION, ErrorCategory.EXTERNAL_API],
      preferredSeverities: [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL],
      responseTime: 10,
      resolutionRate: 95,
      currentLoad: 20,
      available: true,
      notificationChannels: ['slack-infra', 'pagerduty', 'sms'],
    });

    this.addTeam({
      teamId: 'payments',
      teamName: 'Payments Team',
      expertiseAreas: [ErrorCategory.PAYMENT, ErrorCategory.AUTHORIZATION],
      preferredSeverities: [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL],
      responseTime: 5,
      resolutionRate: 98,
      currentLoad: 25,
      available: true,
      notificationChannels: ['slack-payments', 'pagerduty'],
    });

    this.addTeam({
      teamId: 'customer-support',
      teamName: 'Customer Support',
      expertiseAreas: [ErrorCategory.VALIDATION, ErrorCategory.BOOKING, ErrorCategory.UNKNOWN],
      preferredSeverities: [ErrorSeverity.LOW, ErrorSeverity.NORMAL],
      responseTime: 45,
      resolutionRate: 75,
      currentLoad: 60,
      available: true,
      notificationChannels: ['slack-support', 'email'],
    });
  }
}

/**
 * Global alert router instance
 */
export const globalAlertRouter = new AlertRouter();

/**
 * Helper to create an alert context
 */
export function createAlertContext(
  alertId: string,
  errorId: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  message: string,
  endpoint?: string,
  userId?: string,
  metadata?: Record<string, any>
): AlertContext {
  return {
    alertId,
    errorId,
    category,
    severity,
    message,
    endpoint,
    userId,
    timestamp: new Date(),
    metadata,
  };
}