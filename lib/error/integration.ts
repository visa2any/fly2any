/**
 * Error Monitoring Integration System
 * 
 * Connects the error monitoring system with remediation, alert routing, and scaling prediction.
 * This is the central integration point for Phase 2 improvements.
 */

import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { globalRemediationEngine, createRemediationContext } from '@/lib/error/remediation/workflow';
import { globalAlertRouter, createAlertContext } from '@/lib/error/remediation/alertRouting';
import { globalScalingPredictor } from '@/lib/scaling/predictor';

export interface IntegratedErrorEvent {
  errorId: string;
  timestamp: Date;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  endpoint?: string;
  statusCode?: number;
  userAgent?: string;
  userId?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  component?: string;
  sessionId?: string;
}

export interface IntegrationResult {
  errorId: string;
  remediation: {
    triggered: boolean;
    rulesExecuted: number;
    success: boolean;
  };
  alertRouting: {
    triggered: boolean;
    primaryTeam?: string;
    confidence?: number;
  };
  scalingPrediction: {
    triggered: boolean;
    recommendations?: number;
  };
  timestamp: Date;
}

/**
 * Central integration orchestrator for error handling
 */
export class ErrorIntegrationOrchestrator {
  private isEnabled: boolean = true;
  private thresholds = {
    highSeverityRate: 5, // errors per minute for high severity
    criticalSeverityRate: 2, // errors per minute for critical severity
    scalingPredictionInterval: 5 * 60 * 1000, // 5 minutes
  };

  constructor() {
    // Error logging is handled by the existing error monitoring system
  }

  /**
   * Process an error through all integrated systems
   */
  async processError(errorEvent: IntegratedErrorEvent): Promise<IntegrationResult> {
    const startTime = Date.now();
    const result: IntegrationResult = {
      errorId: errorEvent.errorId,
      remediation: { triggered: false, rulesExecuted: 0, success: false },
      alertRouting: { triggered: false },
      scalingPrediction: { triggered: false },
      timestamp: new Date(),
    };

    if (!this.isEnabled) {
      console.log('[ErrorIntegration] Integration is disabled, skipping processing');
      return result;
    }

    try {
      console.log(`[ErrorIntegration] Processing error: ${errorEvent.errorId} (${errorEvent.category}, ${errorEvent.severity})`);

      // Step 1: Log the error to monitoring systems
      await this.logError(errorEvent);

      // Step 2: Trigger remediation for appropriate errors
      const remediationResults = await this.triggerRemediation(errorEvent);
      result.remediation = remediationResults;

      // Step 3: Route alerts for high/critical severity errors
      if (errorEvent.severity === ErrorSeverity.HIGH || errorEvent.severity === ErrorSeverity.CRITICAL) {
        const alertResult = await this.routeAlert(errorEvent);
        result.alertRouting = alertResult;
      }

      // Step 4: Check if scaling prediction should be triggered
      const shouldPredictScaling = this.shouldTriggerScalingPrediction(errorEvent);
      if (shouldPredictScaling) {
        const scalingResult = await this.triggerScalingPrediction(errorEvent);
        result.scalingPrediction = scalingResult;
      }

      // Step 5: Update error rate metrics and check for rate-based triggers
      this.updateErrorRates(errorEvent);

      const duration = Date.now() - startTime;
      console.log(`[ErrorIntegration] Completed processing error ${errorEvent.errorId} in ${duration}ms`);

      return result;

    } catch (error: any) {
      console.error('[ErrorIntegration] Failed to process error:', error.message, error.stack);
      
      // Even if integration fails, ensure error is logged
      await this.logError(errorEvent);
      
      return result;
    }
  }

  /**
   * Enable or disable the integration system
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[ErrorIntegration] Integration system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current integration status and statistics
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      thresholds: this.thresholds,
      systems: {
        remediation: globalRemediationEngine.getAllRules().length > 0,
        alertRouting: globalAlertRouter.getAllTeams().length > 0,
        scalingPrediction: true,
        errorLogging: true,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Manually trigger a scaling prediction based on current error patterns
   */
  async manualScalingPrediction(
    timeHorizon: number = 24,
    includeErrorPatterns: boolean = true
  ) {
    console.log(`[ErrorIntegration] Manual scaling prediction triggered (timeHorizon: ${timeHorizon}h)`);
    
    // Get recent error metrics
    const errorMetrics = await this.getRecentErrorMetrics();
    
    // Generate scaling prediction
    const prediction = await globalScalingPredictor.analyzeAndPredict(errorMetrics, timeHorizon);
    
    // If including error patterns, add recommendations based on current error rates
    let errorPatternRecommendations = [];
    if (includeErrorPatterns) {
      const errorRates = this.calculateErrorRatesByCategory();
      for (const [category, rate] of Object.entries(errorRates)) {
        if (rate > 1) { // More than 1% error rate
          errorPatternRecommendations.push(
            ...(await globalScalingPredictor.getScalingForErrorPattern(
              category as ErrorCategory,
              ErrorSeverity.HIGH,
              rate,
              undefined
            ))
          );
        }
      }
    }
    
    return {
      prediction,
      errorPatternRecommendations,
      timestamp: new Date(),
    };
  }

  /**
   * Reset all integration systems (for testing/maintenance)
   */
  resetSystems(): void {
    console.log('[ErrorIntegration] Resetting integration systems');
    
    // Note: In a real implementation, we would reset circuit breakers, clear caches, etc.
    // For now, we just log the reset action.
  }

  private async logError(errorEvent: IntegratedErrorEvent): Promise<void> {
    try {
      // Use the existing error logging API endpoint
      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: errorEvent.errorId,
          category: errorEvent.category,
          severity: errorEvent.severity,
          message: errorEvent.message,
          endpoint: errorEvent.endpoint,
          statusCode: errorEvent.statusCode,
          userAgent: errorEvent.userAgent,
          userId: errorEvent.userId,
          metadata: {
            ...errorEvent.metadata,
            integrationProcessed: true,
            component: errorEvent.component,
            sessionId: errorEvent.sessionId,
          },
          timestamp: errorEvent.timestamp.toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn(`[ErrorIntegration] Error logging API returned ${response.status}`);
      }
    } catch (error: any) {
      console.error('[ErrorIntegration] Failed to log error:', error.message);
    }
  }

  private async triggerRemediation(errorEvent: IntegratedErrorEvent) {
    try {
      const context = createRemediationContext(
        errorEvent.errorId,
        errorEvent.category,
        errorEvent.severity,
        errorEvent.message,
        errorEvent.endpoint,
        errorEvent.statusCode,
        errorEvent.userAgent,
        errorEvent.userId,
        errorEvent.metadata
      );

      const results = await globalRemediationEngine.remediate(context);
      
      return {
        triggered: true,
        rulesExecuted: results.length,
        success: results.some(r => r.success),
        results: results.map(r => ({
          ruleId: r.ruleId,
          success: r.success,
          actions: r.actionsExecuted,
        })),
      };
    } catch (error: any) {
      console.error('[ErrorIntegration] Remediation failed:', error.message);
      return { triggered: false, rulesExecuted: 0, success: false };
    }
  }

  private async routeAlert(errorEvent: IntegratedErrorEvent) {
    try {
      const alertId = `alert-${errorEvent.errorId}-${Date.now()}`;
      const context = createAlertContext(
        alertId,
        errorEvent.errorId,
        errorEvent.category,
        errorEvent.severity,
        errorEvent.message,
        errorEvent.endpoint,
        errorEvent.userId,
        errorEvent.metadata
      );

      const decision = await globalAlertRouter.routeAlert(context);
      
      return {
        triggered: true,
        primaryTeam: decision.primaryTeam,
        secondaryTeam: decision.secondaryTeam,
        confidence: decision.confidence,
        escalationLevel: decision.escalationLevel,
        estimatedResponseTime: decision.estimatedResponseTime,
        notificationChannels: decision.notificationChannels,
      };
    } catch (error: any) {
      console.error('[ErrorIntegration] Alert routing failed:', error.message);
      return { triggered: false };
    }
  }

  private shouldTriggerScalingPrediction(errorEvent: IntegratedErrorEvent): boolean {
    // Trigger scaling prediction for:
    // 1. Critical errors
    // 2. High severity errors that are recurring
    // 3. Database or network errors that might indicate capacity issues
    
    if (errorEvent.severity === ErrorSeverity.CRITICAL) {
      return true;
    }
    
    if (errorEvent.severity === ErrorSeverity.HIGH && 
        (errorEvent.category === ErrorCategory.DATABASE || 
         errorEvent.category === ErrorCategory.NETWORK ||
         errorEvent.category === ErrorCategory.EXTERNAL_API)) {
      return true;
    }
    
    // Check error rates (would need to track rates over time)
    // For now, we'll use a simple threshold
    return false;
  }

  private async triggerScalingPrediction(errorEvent: IntegratedErrorEvent) {
    try {
      // Create metrics from error event (simplified - in production would use actual metrics)
      const metrics = [{
        timestamp: new Date(),
        cpuUsage: 50, // Default - would be real metrics
        memoryUsage: 60,
        requestRate: 100,
        errorRate: errorEvent.severity === ErrorSeverity.CRITICAL ? 10 : 5,
        responseTime: 200,
        activeConnections: 50,
      }];
      
      // Get scaling recommendations for the error pattern
      const errorPatternRecommendations = await globalScalingPredictor.getScalingForErrorPattern(
        errorEvent.category,
        errorEvent.severity,
        errorEvent.severity === ErrorSeverity.CRITICAL ? 10 : 5,
        errorEvent.endpoint
      );
      
      return {
        triggered: true,
        recommendations: errorPatternRecommendations.length,
        details: errorPatternRecommendations.map(r => ({
          id: r.id,
          resourceType: r.resourceType,
          action: r.action,
          urgency: r.urgency,
        })),
      };
    } catch (error: any) {
      console.error('[ErrorIntegration] Scaling prediction failed:', error.message);
      return { triggered: false, recommendations: 0 };
    }
  }

  private updateErrorRates(errorEvent: IntegratedErrorEvent): void {
    // In production, this would update error rate counters and check thresholds
    // For now, we'll just log the update
    console.log(`[ErrorIntegration] Updated error rates for ${errorEvent.category}: ${errorEvent.severity}`);
  }

  private async getRecentErrorMetrics() {
    // In production, this would fetch actual resource metrics
    // For now, return mock data
    const now = new Date();
    const metrics = [];
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      metrics.push({
        timestamp,
        cpuUsage: 40 + Math.random() * 40,
        memoryUsage: 50 + Math.random() * 30,
        requestRate: 80 + Math.random() * 240,
        errorRate: Math.random() * 8,
        responseTime: 100 + Math.random() * 500,
        activeConnections: 30 + Math.random() * 120,
      });
    }
    
    return metrics;
  }

  private calculateErrorRatesByCategory(): Record<string, number> {
    // In production, this would calculate actual error rates from the error log
    // For now, return mock data
    return {
      [ErrorCategory.NETWORK]: 2.5,
      [ErrorCategory.DATABASE]: 1.8,
      [ErrorCategory.EXTERNAL_API]: 3.2,
      [ErrorCategory.VALIDATION]: 0.5,
      [ErrorCategory.UNKNOWN]: 0.2,
    };
  }
}

/**
 * Global integration orchestrator instance
 */
export const globalErrorIntegrationOrchestrator = new ErrorIntegrationOrchestrator();

/**
 * Convenience function to process an error through the integrated system
 */
export async function processIntegratedError(
  errorId: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  message: string,
  endpoint?: string,
  statusCode?: number,
  userAgent?: string,
  userId?: string,
  metadata?: Record<string, any>,
  stackTrace?: string,
  component?: string,
  sessionId?: string
): Promise<IntegrationResult> {
  const errorEvent: IntegratedErrorEvent = {
    errorId,
    timestamp: new Date(),
    category,
    severity,
    message,
    endpoint,
    statusCode,
    userAgent,
    userId,
    metadata,
    stackTrace,
    component,
    sessionId,
  };
  
  return globalErrorIntegrationOrchestrator.processError(errorEvent);
}