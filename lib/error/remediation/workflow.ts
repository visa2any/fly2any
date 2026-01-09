/**
 * Automated Remediation Workflow System
 * 
 * Provides rule-based automatic fixes for common errors and intelligent alert routing.
 * Part of Phase 2C: Automated Remediation improvements.
 */

import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';
import { createAPIChaosTest } from '@/lib/error/chaosTesting';

export interface RemediationRule {
  id: string;
  name: string;
  description: string;
  conditions: RemediationCondition[];
  actions: RemediationAction[];
  priority: number; // 1-100, higher = more important
  enabled: boolean;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
}

export interface RemediationCondition {
  field: 'category' | 'severity' | 'endpoint' | 'message' | 'statusCode' | 'userAgent' | 'timestamp';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'matches' | 'in';
  value: any;
}

export interface RemediationAction {
  type: 'retry' | 'circuitBreaker' | 'cacheBust' | 'resourceRestart' | 'scaleUp' | 'notify' | 'redirect' | 'fallback' | 'custom';
  config: Record<string, any>;
  delay?: number; // milliseconds before executing
  retryCount?: number;
  retryDelay?: number;
}

export interface RemediationContext {
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
}

export interface RemediationResult {
  success: boolean;
  ruleId: string;
  actionsExecuted: string[];
  message: string;
  duration: number;
  error?: string;
  retryNeeded?: boolean;
  nextRetryAt?: Date;
}

export interface CircuitBreakerState {
  endpoint: string;
  failureCount: number;
  lastFailure: Date;
  state: 'closed' | 'open' | 'halfOpen';
  openedAt?: Date;
  successThreshold: number;
  failureThreshold: number;
  timeout: number; // milliseconds
  successCount?: number; // Track successes in half-open state
}

/**
 * Remediation Engine that evaluates rules and executes automated fixes
 */
export class RemediationEngine {
  private rules: RemediationRule[] = [];
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private actionHandlers: Map<string, (context: RemediationContext, config: any) => Promise<boolean>> = new Map();

  constructor() {
    this.registerDefaultActionHandlers();
    this.loadDefaultRules();
  }

  /**
   * Evaluate an error and execute matching remediation rules
   */
  async remediate(context: RemediationContext): Promise<RemediationResult[]> {
    const results: RemediationResult[] = [];
    const matchingRules = this.findMatchingRules(context);

    // Sort by priority (highest first)
    matchingRules.sort((a, b) => b.priority - a.priority);

    for (const rule of matchingRules) {
      if (!rule.enabled) continue;

      const startTime = Date.now();
      const ruleResult: RemediationResult = {
        success: true,
        ruleId: rule.id,
        actionsExecuted: [],
        message: '',
        duration: 0,
      };

      try {
        // Check circuit breakers before executing actions
        if (this.isCircuitBreakerOpen(context.endpoint)) {
          ruleResult.message = `Circuit breaker open for endpoint: ${context.endpoint}`;
          ruleResult.success = false;
          ruleResult.error = 'CircuitBreakerOpen';
          results.push(ruleResult);
          continue;
        }

        // Execute each action in sequence
        for (const action of rule.actions) {
          const actionSuccess = await this.executeAction(action, context);
          ruleResult.actionsExecuted.push(action.type);
          
          if (!actionSuccess) {
            ruleResult.success = false;
            ruleResult.error = `Action ${action.type} failed`;
            break;
          }
        }

        if (ruleResult.success) {
          ruleResult.message = `Successfully executed ${rule.actions.length} action(s)`;
          rule.successCount++;
          this.recordCircuitBreakerSuccess(context.endpoint);
        } else {
          rule.failureCount++;
          this.recordCircuitBreakerFailure(context.endpoint);
        }

        rule.lastTriggered = new Date();
      } catch (error: any) {
        ruleResult.success = false;
        ruleResult.error = error.message;
        rule.failureCount++;
        this.recordCircuitBreakerFailure(context.endpoint);
      } finally {
        ruleResult.duration = Date.now() - startTime;
        results.push(ruleResult);
      }

      // If a high-priority rule succeeded, we can stop processing lower priority rules
      if (ruleResult.success && rule.priority >= 80) {
        break;
      }
    }

    return results;
  }

  /**
   * Add a new remediation rule
   */
  addRule(rule: RemediationRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Register a custom action handler
   */
  registerActionHandler(
    actionType: string,
    handler: (context: RemediationContext, config: any) => Promise<boolean>
  ): void {
    this.actionHandlers.set(actionType, handler);
  }

  /**
   * Get current circuit breaker state for an endpoint
   */
  getCircuitBreakerState(endpoint?: string): CircuitBreakerState | undefined {
    if (!endpoint) return undefined;
    return this.circuitBreakers.get(endpoint);
  }

  /**
   * Manually reset a circuit breaker
   */
  resetCircuitBreaker(endpoint: string): void {
    const state = this.circuitBreakers.get(endpoint);
    if (state) {
      state.state = 'closed';
      state.failureCount = 0;
      this.circuitBreakers.set(endpoint, state);
    }
  }

  /**
   * Get all rules (for UI/management)
   */
  getAllRules(): RemediationRule[] {
    return [...this.rules];
  }

  /**
   * Enable/disable a rule by ID
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  private findMatchingRules(context: RemediationContext): RemediationRule[] {
    return this.rules.filter(rule => 
      rule.conditions.every(condition => this.evaluateCondition(condition, context))
    );
  }

  private evaluateCondition(condition: RemediationCondition, context: RemediationContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'startsWith':
        return String(fieldValue).startsWith(String(condition.value));
      case 'endsWith':
        return String(fieldValue).endsWith(String(condition.value));
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);
      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);
      case 'matches':
        return new RegExp(condition.value).test(String(fieldValue));
      case 'in':
        return Array.isArray(condition.value) 
          ? condition.value.includes(fieldValue)
          : false;
      default:
        return false;
    }
  }

  private getFieldValue(field: string, context: RemediationContext): any {
    switch (field) {
      case 'category':
        return context.category;
      case 'severity':
        return context.severity;
      case 'endpoint':
        return context.endpoint;
      case 'message':
        return context.message;
      case 'statusCode':
        return context.statusCode;
      case 'userAgent':
        return context.userAgent;
      case 'timestamp':
        return context.timestamp;
      default:
        return context.metadata?.[field];
    }
  }

  private async executeAction(action: RemediationAction, context: RemediationContext): Promise<boolean> {
    // Apply delay if specified
    if (action.delay) {
      await new Promise(resolve => setTimeout(resolve, action.delay));
    }

    // Check for custom handler first
    const customHandler = this.actionHandlers.get(action.type);
    if (customHandler) {
      return await customHandler(context, action.config);
    }

    // Execute built-in action
    switch (action.type) {
      case 'retry':
        return await this.executeRetryAction(context, action.config);
      case 'circuitBreaker':
        return await this.executeCircuitBreakerAction(context, action.config);
      case 'cacheBust':
        return await this.executeCacheBustAction(context, action.config);
      case 'resourceRestart':
        return await this.executeResourceRestartAction(context, action.config);
      case 'scaleUp':
        return await this.executeScaleUpAction(context, action.config);
      case 'notify':
        return await this.executeNotifyAction(context, action.config);
      case 'redirect':
        return await this.executeRedirectAction(context, action.config);
      case 'fallback':
        return await this.executeFallbackAction(context, action.config);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async executeRetryAction(context: RemediationContext, config: any): Promise<boolean> {
    const maxRetries = config.maxRetries || 3;
    const retryDelay = config.retryDelay || 1000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Simulate retry logic - in production this would make the actual request
        console.log(`[Remediation] Retry attempt ${attempt}/${maxRetries} for error: ${context.errorId}`);
        
        // Add actual retry logic here based on the error context
        if (context.endpoint) {
          // Example: retry the failed API call
          // const response = await fetch(context.endpoint, { method: 'GET' });
          // if (response.ok) return true;
        }
        
        return true; // Simulate success
      } catch (error) {
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }
    
    return false;
  }

  private async executeCircuitBreakerAction(context: RemediationContext, config: any): Promise<boolean> {
    if (!context.endpoint) return false;
    
    const endpoint = context.endpoint;
    const failureThreshold = config.failureThreshold || 5;
    const successThreshold = config.successThreshold || 3;
    const timeout = config.timeout || 60000; // 1 minute
    
    let state = this.circuitBreakers.get(endpoint);
    if (!state) {
      state = {
        endpoint,
        failureCount: 0,
        lastFailure: new Date(),
        state: 'closed',
        successThreshold,
        failureThreshold,
        timeout,
      };
      this.circuitBreakers.set(endpoint, state);
    }
    
    // Update state based on current error
    state.failureCount++;
    state.lastFailure = new Date();
    
    if (state.failureCount >= failureThreshold && state.state === 'closed') {
      state.state = 'open';
      state.openedAt = new Date();
      console.log(`[Remediation] Circuit breaker opened for ${endpoint}`);
    }
    
    return true; // Action executed successfully
  }

  private async executeCacheBustAction(context: RemediationContext, config: any): Promise<boolean> {
    // Simulate cache busting - in production this would clear CDN/Redis/etc.
    console.log(`[Remediation] Busting cache for error: ${context.errorId}`);
    
    // Add actual cache busting logic here
    // Example: Clear Redis cache keys related to the failed request
    
    return true;
  }

  private async executeResourceRestartAction(context: RemediationContext, config: any): Promise<boolean> {
    // Simulate resource restart - in production this would restart containers/services
    console.log(`[Remediation] Restarting resource for error: ${context.errorId}`);
    
    // Add actual resource restart logic here
    // Example: Restart a Docker container or Kubernetes pod
    
    return true;
  }

  private async executeScaleUpAction(context: RemediationContext, config: any): Promise<boolean> {
    // Simulate scaling - in production this would trigger autoscaling
    console.log(`[Remediation] Scaling up resources for error: ${context.errorId}`);
    
    // Add actual scaling logic here
    // Example: Increase the number of instances for a service
    
    return true;
  }

  private async executeNotifyAction(context: RemediationContext, config: any): Promise<boolean> {
    const channels = config.channels || ['slack', 'email'];
    const message = config.message || `Remediation triggered for error: ${context.errorId}`;
    
    console.log(`[Remediation] Sending notification via ${channels.join(', ')}: ${message}`);
    
    // Add actual notification logic here
    // Example: Send Slack/Email notifications
    
    return true;
  }

  private async executeRedirectAction(context: RemediationContext, config: any): Promise<boolean> {
    const redirectTo = config.redirectTo;
    if (!redirectTo) return false;
    
    console.log(`[Remediation] Redirecting traffic from ${context.endpoint} to ${redirectTo}`);
    
    // Add actual redirect logic here
    // Example: Update load balancer rules or DNS
    
    return true;
  }

  private async executeFallbackAction(context: RemediationContext, config: any): Promise<boolean> {
    const fallbackEndpoint = config.fallbackEndpoint;
    const fallbackData = config.fallbackData;
    
    console.log(`[Remediation] Using fallback for error: ${context.errorId}`);
    
    // Add actual fallback logic here
    // Example: Serve cached data or default response
    
    return true;
  }

  private isCircuitBreakerOpen(endpoint?: string): boolean {
    if (!endpoint) return false;
    
    const state = this.circuitBreakers.get(endpoint);
    if (!state) return false;
    
    if (state.state === 'open') {
      // Check if timeout has passed
      if (state.openedAt && Date.now() - state.openedAt.getTime() > state.timeout) {
        state.state = 'halfOpen';
        state.failureCount = 0;
        return false;
      }
      return true;
    }
    
    return false;
  }

  private recordCircuitBreakerSuccess(endpoint?: string): void {
    if (!endpoint) return;
    
    const state = this.circuitBreakers.get(endpoint);
    if (state) {
      if (state.state === 'halfOpen') {
        const currentSuccessCount = (state.successCount || 0) + 1;
        state.successCount = currentSuccessCount;
        if (currentSuccessCount >= state.successThreshold) {
          state.state = 'closed';
          state.failureCount = 0;
          state.successCount = 0;
          console.log(`[Remediation] Circuit breaker closed for ${endpoint}`);
        }
      }
    }
  }

  private recordCircuitBreakerFailure(endpoint?: string): void {
    if (!endpoint) return;
    
    const state = this.circuitBreakers.get(endpoint);
    if (state) {
      state.failureCount++;
      state.lastFailure = new Date();
      
      if (state.state === 'halfOpen') {
        state.state = 'open';
        state.openedAt = new Date();
        console.log(`[Remediation] Circuit breaker re-opened for ${endpoint}`);
      }
    }
  }

  private registerDefaultActionHandlers(): void {
    // Register default action handlers
    this.actionHandlers.set('custom', async (context, config) => {
      console.log(`[Remediation] Custom action executed for error: ${context.errorId}`);
      return true;
    });
  }

  private loadDefaultRules(): void {
    // Default rule: Retry transient network errors
    this.addRule({
      id: 'retry-network-errors',
      name: 'Retry Network Errors',
      description: 'Automatically retry failed requests due to network issues',
      conditions: [
        { field: 'category', operator: 'equals', value: ErrorCategory.NETWORK },
        { field: 'severity', operator: 'in', value: [ErrorSeverity.LOW, ErrorSeverity.NORMAL] },
      ],
      actions: [
        {
          type: 'retry',
          config: { maxRetries: 3, retryDelay: 1000 },
          delay: 100,
          retryCount: 3,
          retryDelay: 1000,
        },
      ],
      priority: 50,
      enabled: true,
      successCount: 0,
      failureCount: 0,
    });

    // Default rule: Circuit breaker for failing endpoints
    this.addRule({
      id: 'circuit-breaker-api',
      name: 'API Circuit Breaker',
      description: 'Open circuit breaker for endpoints with repeated failures',
      conditions: [
        { field: 'category', operator: 'in', value: [ErrorCategory.EXTERNAL_API, ErrorCategory.NETWORK] },
        { field: 'severity', operator: 'in', value: [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL] },
      ],
      actions: [
        {
          type: 'circuitBreaker',
          config: { failureThreshold: 5, successThreshold: 3, timeout: 60000 },
          delay: 0,
        },
        {
          type: 'notify',
          config: { channels: ['slack'], message: 'Circuit breaker triggered for {endpoint}' },
          delay: 1000,
        },
      ],
      priority: 80,
      enabled: true,
      successCount: 0,
      failureCount: 0,
    });

    // Default rule: Cache bust for stale data errors
    this.addRule({
      id: 'cache-bust-stale',
      name: 'Bust Stale Cache',
      description: 'Clear cache when stale data errors occur',
      conditions: [
        { field: 'category', operator: 'equals', value: ErrorCategory.DATABASE },
        { field: 'message', operator: 'contains', value: 'stale' },
      ],
      actions: [
        {
          type: 'cacheBust',
          config: { cacheKeys: ['{endpoint}-cache'] },
          delay: 500,
        },
      ],
      priority: 60,
      enabled: true,
      successCount: 0,
      failureCount: 0,
    });

    // Default rule: Notify team for critical errors
    this.addRule({
      id: 'notify-critical',
      name: 'Critical Error Notification',
      description: 'Send immediate notifications for critical errors',
      conditions: [
        { field: 'severity', operator: 'equals', value: ErrorSeverity.CRITICAL },
      ],
      actions: [
        {
          type: 'notify',
          config: { 
            channels: ['slack', 'email', 'pagerduty'],
            message: '🚨 CRITICAL ERROR: {message} (Endpoint: {endpoint})'
          },
          delay: 0,
        },
      ],
      priority: 100,
      enabled: true,
      successCount: 0,
      failureCount: 0,
    });
  }
}

/**
 * Global remediation engine instance
 */
export const globalRemediationEngine = new RemediationEngine();

/**
 * Helper to create a remediation context from an error log
 */
export function createRemediationContext(
  errorId: string,
  category: ErrorCategory,
  severity: ErrorSeverity,
  message: string,
  endpoint?: string,
  statusCode?: number,
  userAgent?: string,
  userId?: string,
  metadata?: Record<string, any>
): RemediationContext {
  return {
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
  };
}