import { NextRequest, NextResponse } from 'next/server';
import { globalRemediationEngine } from '@/lib/error/remediation/workflow';
import { createRemediationContext } from '@/lib/error/remediation/workflow';
import { globalAlertRouter } from '@/lib/error/remediation/alertRouting';
import { createAlertContext } from '@/lib/error/remediation/alertRouting';
import { ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RemediationRequest {
  errorId: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  endpoint?: string;
  statusCode?: number;
  userAgent?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface RemediationResponse {
  success: boolean;
  remediationId: string;
  results: Array<{
    ruleId: string;
    success: boolean;
    actionsExecuted: string[];
    message: string;
    duration: number;
    error?: string;
  }>;
  alertRouting?: {
    alertId: string;
    primaryTeam: string;
    secondaryTeam?: string;
    escalationLevel: number;
    estimatedResponseTime: number;
    confidence: number;
    routingReason: string;
  };
  timestamp: string;
}

interface RuleUpdateRequest {
  ruleId: string;
  enabled?: boolean;
  priority?: number;
  actions?: Array<{
    type: string;
    config: Record<string, any>;
    delay?: number;
  }>;
}

interface CircuitBreakerState {
  endpoint: string;
  state: string;
  failureCount: number;
  lastFailure: string;
  openedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RemediationRequest = await request.json();
    
    // Validate required fields
    if (!body.errorId || !body.category || !body.severity || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: errorId, category, severity, message' },
        { status: 400 }
      );
    }

    // Create remediation context
    const context = createRemediationContext(
      body.errorId,
      body.category,
      body.severity,
      body.message,
      body.endpoint,
      body.statusCode,
      body.userAgent,
      body.userId,
      body.metadata
    );

    // Execute remediation
    const results = await globalRemediationEngine.remediate(context);

    // Generate alert routing for critical/high severity errors
    let alertRouting = null;
    if (body.severity === ErrorSeverity.HIGH || body.severity === ErrorSeverity.CRITICAL) {
      const alertId = `alert-${body.errorId}-${Date.now()}`;
      const alertContext = createAlertContext(
        alertId,
        body.errorId,
        body.category,
        body.severity,
        body.message,
        body.endpoint,
        body.userId,
        body.metadata
      );

      const routingDecision = await globalAlertRouter.routeAlert(alertContext);
      alertRouting = {
        alertId: routingDecision.alertId,
        primaryTeam: routingDecision.primaryTeam,
        secondaryTeam: routingDecision.secondaryTeam,
        escalationLevel: routingDecision.escalationLevel,
        estimatedResponseTime: routingDecision.estimatedResponseTime,
        confidence: routingDecision.confidence,
        routingReason: routingDecision.routingReason,
      };
    }

    const response: RemediationResponse = {
      success: results.some(r => r.success),
      remediationId: `remediation-${body.errorId}-${Date.now()}`,
      results: results.map(r => ({
        ruleId: r.ruleId,
        success: r.success,
        actionsExecuted: r.actionsExecuted,
        message: r.message,
        duration: r.duration,
        error: r.error,
      })),
      alertRouting: alertRouting || undefined,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[Remediation API] Failed:', error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const endpoint = searchParams.get('endpoint');
    const ruleId = searchParams.get('ruleId');

    switch (action) {
      case 'rules':
        const rules = globalRemediationEngine.getAllRules();
        return NextResponse.json({
          rules,
          count: rules.length,
          timestamp: new Date().toISOString(),
        });

      case 'circuit-breakers':
        if (endpoint) {
          const state = globalRemediationEngine.getCircuitBreakerState(endpoint);
          return NextResponse.json({
            endpoint,
            state: state || { endpoint, state: 'closed', failureCount: 0, lastFailure: null },
            timestamp: new Date().toISOString(),
          });
        } else {
          // Return all circuit breakers (simplified)
          const allBreakers: CircuitBreakerState[] = [];
          // Note: In a real implementation, we would iterate over circuitBreakers map
          return NextResponse.json({
            circuitBreakers: allBreakers,
            count: allBreakers.length,
            timestamp: new Date().toISOString(),
          });
        }

      case 'teams':
        const teams = globalAlertRouter.getAllTeams();
        const stats = globalAlertRouter.getStatistics();
        return NextResponse.json({
          teams,
          statistics: stats,
          timestamp: new Date().toISOString(),
        });

      case 'rule':
        if (!ruleId) {
          return NextResponse.json(
            { error: 'Missing ruleId parameter' },
            { status: 400 }
          );
        }
        const rulesList = globalRemediationEngine.getAllRules();
        const rule = rulesList.find(r => r.id === ruleId);
        if (!rule) {
          return NextResponse.json(
            { error: 'Rule not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          rule,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          endpoints: {
            POST: '/api/remediation - Trigger remediation',
            GET: [
              '/api/remediation?action=rules - Get all rules',
              '/api/remediation?action=circuit-breakers&endpoint=<url> - Get circuit breaker state for endpoint',
              '/api/remediation?action=circuit-breakers - Get all circuit breakers',
              '/api/remediation?action=teams - Get alert routing teams',
              '/api/remediation?action=rule&ruleId=<id> - Get specific rule',
            ],
            PATCH: '/api/remediation - Update rule (enable/disable)',
            PUT: '/api/remediation?action=reset-circuit-breaker&endpoint=<url> - Reset circuit breaker',
          },
          timestamp: new Date().toISOString(),
        });
    }

  } catch (error: any) {
    console.error('[Remediation API GET] Failed:', error.message);
    
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: RuleUpdateRequest = await request.json();
    
    if (!body.ruleId) {
      return NextResponse.json(
        { error: 'Missing ruleId' },
        { status: 400 }
      );
    }

    let success = false;
    let message = '';

    if (body.enabled !== undefined) {
      success = globalRemediationEngine.setRuleEnabled(body.ruleId, body.enabled);
      message = `Rule ${body.ruleId} ${body.enabled ? 'enabled' : 'disabled'}`;
    }

    // Note: Updating priority and actions would require additional methods in RemediationEngine
    // For now, we only support enabling/disabling

    return NextResponse.json({
      success,
      message: success ? message : 'Rule not found or update failed',
      ruleId: body.ruleId,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Remediation API PATCH] Failed:', error.message);
    
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const endpoint = searchParams.get('endpoint');

    if (action === 'reset-circuit-breaker' && endpoint) {
      globalRemediationEngine.resetCircuitBreaker(endpoint);
      
      return NextResponse.json({
        success: true,
        message: `Circuit breaker reset for ${endpoint}`,
        endpoint,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing endpoint' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[Remediation API PUT] Failed:', error.message);
    
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}