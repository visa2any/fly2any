import { NextRequest, NextResponse } from 'next/server';
import { emailMarketingAlerts, Alert, AlertRule } from '@/lib/email-marketing-alerts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    switch (action) {
      case 'list': {
        const level = searchParams.get('level') as Alert['level'] | undefined;
        const acknowledged = searchParams.get('acknowledged');
        const campaignId = searchParams.get('campaignId') || undefined;
        const hours = parseInt(searchParams.get('hours') || '24');

        const filter: any = { hours };
        if (level) filter.level = level;
        if (acknowledged !== null) filter.acknowledged = acknowledged === 'true';
        if (campaignId) filter.campaignId = campaignId;

        const alerts = emailMarketingAlerts.getAlerts(filter);

        return NextResponse.json({
          success: true,
          data: {
            alerts,
            count: alerts.length,
            filter
          }
        });
      }

      case 'statistics': {
        const hours = parseInt(searchParams.get('hours') || '24');
        const stats = emailMarketingAlerts.getAlertStatistics(hours);

        return NextResponse.json({
          success: true,
          data: {
            statistics: stats,
            timeRange: `Last ${hours} hours`,
            generatedAt: new Date().toISOString()
          }
        });
      }

      case 'rules': {
        const rules = emailMarketingAlerts.getRules();

        return NextResponse.json({
          success: true,
          data: {
            rules,
            count: rules.length
          }
        });
      }

      case 'active': {
        const activeAlerts = emailMarketingAlerts.getAlerts({
          acknowledged: false,
          hours: 168 // Last week
        }).filter(alert => !alert.resolvedAt);

        return NextResponse.json({
          success: true,
          data: {
            alerts: activeAlerts,
            count: activeAlerts.length,
            urgentCount: activeAlerts.filter(a => a.level === 'critical' || a.level === 'error').length
          }
        });
      }

      case 'dashboard': {
        const hours = parseInt(searchParams.get('hours') || '24');
        const stats = emailMarketingAlerts.getAlertStatistics(hours);
        const activeAlerts = emailMarketingAlerts.getAlerts({ acknowledged: false, hours: 168 });
        const recentAlerts = emailMarketingAlerts.getAlerts({ hours: 1 });

        return NextResponse.json({
          success: true,
          data: {
            overview: {
              totalAlerts: stats.total,
              activeAlerts: stats.active,
              criticalAlerts: stats.byLevel.critical || 0,
              errorAlerts: stats.byLevel.error || 0,
              warningAlerts: stats.byLevel.warning || 0,
              acknowledgedRate: stats.total > 0 ? Math.round((stats.acknowledged / stats.total) * 100) : 0
            },
            recentActivity: recentAlerts.slice(0, 10),
            topAlerts: activeAlerts
              .filter(alert => alert.level === 'critical' || alert.level === 'error')
              .slice(0, 5),
            alertTrends: stats.byLevel,
            systemHealth: this.getSystemHealthStatus(activeAlerts)
          }
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Available actions: list, statistics, rules, active, dashboard`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in alerts API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'acknowledge': {
        const { alertId } = body;
        
        if (!alertId) {
          return NextResponse.json({
            success: false,
            error: 'alertId is required'
          }, { status: 400 });
        }

        const acknowledged = emailMarketingAlerts.acknowledgeAlert(alertId);
        
        if (!acknowledged) {
          return NextResponse.json({
            success: false,
            error: 'Alert not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully',
          data: { alertId }
        });
      }

      case 'resolve': {
        const { alertId } = body;
        
        if (!alertId) {
          return NextResponse.json({
            success: false,
            error: 'alertId is required'
          }, { status: 400 });
        }

        const resolved = emailMarketingAlerts.resolveAlert(alertId);
        
        if (!resolved) {
          return NextResponse.json({
            success: false,
            error: 'Alert not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully',
          data: { alertId }
        });
      }

      case 'bulk_acknowledge': {
        const { alertIds } = body;
        
        if (!Array.isArray(alertIds)) {
          return NextResponse.json({
            success: false,
            error: 'alertIds must be an array'
          }, { status: 400 });
        }

        const results = alertIds.map(alertId => ({
          alertId,
          acknowledged: emailMarketingAlerts.acknowledgeAlert(alertId)
        }));

        const successCount = results.filter(r => r.acknowledged).length;

        return NextResponse.json({
          success: true,
          message: `${successCount}/${alertIds.length} alerts acknowledged`,
          data: { results, successCount }
        });
      }

      case 'create_rule': {
        const { name, description, enabled, conditions, actions } = body;
        
        if (!name || !conditions || !actions) {
          return NextResponse.json({
            success: false,
            error: 'name, conditions, and actions are required'
          }, { status: 400 });
        }

        const ruleId = emailMarketingAlerts.addRule({
          name,
          description: description || '',
          enabled: enabled !== false, // Default to true
          conditions,
          actions
        });

        return NextResponse.json({
          success: true,
          message: 'Alert rule created successfully',
          data: { ruleId }
        });
      }

      case 'update_rule': {
        const { ruleId, ...updates } = body;
        
        if (!ruleId) {
          return NextResponse.json({
            success: false,
            error: 'ruleId is required'
          }, { status: 400 });
        }

        const updated = emailMarketingAlerts.updateRule(ruleId, updates);
        
        if (!updated) {
          return NextResponse.json({
            success: false,
            error: 'Rule not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: 'Alert rule updated successfully',
          data: { ruleId }
        });
      }

      case 'delete_rule': {
        const { ruleId } = body;
        
        if (!ruleId) {
          return NextResponse.json({
            success: false,
            error: 'ruleId is required'
          }, { status: 400 });
        }

        const deleted = emailMarketingAlerts.deleteRule(ruleId);
        
        if (!deleted) {
          return NextResponse.json({
            success: false,
            error: 'Rule not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          message: 'Alert rule deleted successfully',
          data: { ruleId }
        });
      }

      case 'test_alert': {
        // Create a test alert for demonstration
        const testAlert = {
          id: `test-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: body.level || 'info',
          title: body.title || 'Test Alert',
          message: body.message || 'This is a test alert generated from the API',
          metadata: {
            test: true,
            generatedBy: 'API'
          },
          acknowledged: false,
          actions: ['notify']
        };

        // This would normally be handled by the alert system
        console.log('Test alert generated:', testAlert);

        return NextResponse.json({
          success: true,
          message: 'Test alert created',
          data: testAlert
        });
      }

      case 'webhook_test': {
        const { webhookUrl, alertData } = body;
        
        if (!webhookUrl) {
          return NextResponse.json({
            success: false,
            error: 'webhookUrl is required'
          }, { status: 400 });
        }

        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              test: true,
              alert: alertData || {
                id: `test-${Date.now()}`,
                title: 'Webhook Test',
                message: 'This is a test webhook from Email Marketing Alerts',
                level: 'info',
                timestamp: new Date().toISOString()
              },
              source: 'email-marketing-alerts'
            })
          });

          const success = response.ok;
          const responseText = await response.text();

          return NextResponse.json({
            success,
            message: success ? 'Webhook test successful' : 'Webhook test failed',
            data: {
              status: response.status,
              statusText: response.statusText,
              response: responseText.substring(0, 500) // Limit response size
            }
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: 'Webhook test failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Available actions: acknowledge, resolve, bulk_acknowledge, create_rule, update_rule, delete_rule, test_alert, webhook_test`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in alerts POST:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// Helper function to determine system health status
function getSystemHealthStatus(activeAlerts: Alert[]): {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  summary: string;
} {
  const criticalCount = activeAlerts.filter(a => a.level === 'critical').length;
  const errorCount = activeAlerts.filter(a => a.level === 'error').length;
  const warningCount = activeAlerts.filter(a => a.level === 'warning').length;

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  let score = 100;
  let summary = 'All systems operating normally';

  if (criticalCount > 0) {
    status = 'critical';
    score = Math.max(0, 100 - (criticalCount * 30) - (errorCount * 15) - (warningCount * 5));
    summary = `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} require immediate attention`;
  } else if (errorCount > 0) {
    status = 'warning';
    score = Math.max(20, 100 - (errorCount * 15) - (warningCount * 5));
    summary = `${errorCount} error${errorCount > 1 ? 's' : ''} detected, monitoring required`;
  } else if (warningCount > 2) {
    status = 'warning';
    score = Math.max(60, 100 - (warningCount * 5));
    summary = `${warningCount} warnings detected, system performance may be impacted`;
  }

  return { status, score, summary };
}