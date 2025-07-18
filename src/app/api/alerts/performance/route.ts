import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface AlertRule {
  id: string;
  name: string;
  metric: 'conversion_rate' | 'cost_per_acquisition' | 'total_conversions' | 'total_spend';
  operator: 'below' | 'above' | 'equal';
  threshold: number;
  period_hours: number;
  active: boolean;
}

interface AlertTrigger {
  rule: AlertRule;
  current_value: number;
  threshold: number;
  message: string;
  timestamp: string;
}

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'low_conversion_rate',
    name: 'Taxa de Conversão Baixa',
    metric: 'conversion_rate',
    operator: 'below',
    threshold: 1.0, // Below 1%
    period_hours: 24,
    active: true
  },
  {
    id: 'high_cpa',
    name: 'CPA Muito Alto',
    metric: 'cost_per_acquisition',
    operator: 'above',
    threshold: 50, // Above $50
    period_hours: 12,
    active: true
  },
  {
    id: 'no_conversions',
    name: 'Sem Conversões',
    metric: 'total_conversions',
    operator: 'equal',
    threshold: 0, // Zero conversions
    period_hours: 6,
    active: true
  },
  {
    id: 'high_spend',
    name: 'Gasto Alto',
    metric: 'total_spend',
    operator: 'above',
    threshold: 100, // Above $100/day
    period_hours: 24,
    active: true
  }
];

async function initializeAlertSystem() {
  try {
    // Create alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS performance_alerts (
        id SERIAL PRIMARY KEY,
        rule_id VARCHAR(100) NOT NULL,
        rule_name VARCHAR(200) NOT NULL,
        metric VARCHAR(50) NOT NULL,
        current_value DECIMAL(10,2) NOT NULL,
        threshold_value DECIMAL(10,2) NOT NULL,
        alert_message TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // Create alert rules table
    await sql`
      CREATE TABLE IF NOT EXISTS alert_rules (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        metric VARCHAR(50) NOT NULL,
        operator VARCHAR(20) NOT NULL,
        threshold_value DECIMAL(10,2) NOT NULL,
        period_hours INTEGER NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default rules if not exist
    for (const rule of DEFAULT_ALERT_RULES) {
      await sql`
        INSERT INTO alert_rules (id, name, metric, operator, threshold_value, period_hours, active)
        VALUES (${rule.id}, ${rule.name}, ${rule.metric}, ${rule.operator}, ${rule.threshold}, ${rule.period_hours}, ${rule.active})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    console.log('✅ Alert system initialized');
  } catch (error) {
    console.error('Error initializing alert system:', error);
  }
}

async function calculateMetrics(periodHours: number) {
  const startTime = new Date(Date.now() - periodHours * 60 * 60 * 1000);

  // Get total events and conversions
  const metricsResult = await sql`
    SELECT 
      COUNT(*) as total_events,
      COUNT(CASE WHEN event_name IN ('form_submission', 'phone_click', 'whatsapp_click') THEN 1 END) as total_conversions,
      SUM(COALESCE(value, 0)) as total_value
    FROM analytics_events 
    WHERE created_at >= ${startTime.toISOString()}
  `;

  const totalEvents = parseInt(metricsResult.rows[0]?.total_events || '0');
  const totalConversions = parseInt(metricsResult.rows[0]?.total_conversions || '0');
  const totalValue = parseFloat(metricsResult.rows[0]?.total_value || '0');

  const conversionRate = totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;
  const costPerAcquisition = totalConversions > 0 ? totalValue / totalConversions : 0;

  return {
    total_events: totalEvents,
    total_conversions: totalConversions,
    total_value: totalValue,
    conversion_rate: conversionRate,
    cost_per_acquisition: costPerAcquisition,
    total_spend: totalValue // Assuming value represents spending for this example
  };
}

async function checkAlertRules(): Promise<AlertTrigger[]> {
  const triggeredAlerts: AlertTrigger[] = [];

  // Get active alert rules
  const rulesResult = await sql`
    SELECT * FROM alert_rules WHERE active = true
  `;

  for (const rule of rulesResult.rows) {
    const metrics = await calculateMetrics(rule.period_hours);
    const currentValue = metrics[rule.metric as keyof typeof metrics] as number;
    
    let shouldTrigger = false;
    
    switch (rule.operator) {
      case 'below':
        shouldTrigger = currentValue < rule.threshold_value;
        break;
      case 'above':
        shouldTrigger = currentValue > rule.threshold_value;
        break;
      case 'equal':
        shouldTrigger = currentValue === rule.threshold_value;
        break;
    }

    if (shouldTrigger) {
      // Check if this alert was already triggered recently (avoid spam)
      const recentAlertResult = await sql`
        SELECT id FROM performance_alerts 
        WHERE rule_id = ${rule.id} 
        AND resolved = false 
        AND created_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
      `;

      if (recentAlertResult.rows.length === 0) {
        const alert: AlertTrigger = {
          rule: {
            id: rule.id,
            name: rule.name,
            metric: rule.metric,
            operator: rule.operator,
            threshold: rule.threshold_value,
            period_hours: rule.period_hours,
            active: rule.active
          },
          current_value: currentValue,
          threshold: rule.threshold_value,
          message: generateAlertMessage(rule, currentValue),
          timestamp: new Date().toISOString()
        };

        triggeredAlerts.push(alert);

        // Store alert in database
        await sql`
          INSERT INTO performance_alerts (
            rule_id, rule_name, metric, current_value, threshold_value, alert_message
          ) VALUES (
            ${rule.id}, ${rule.name}, ${rule.metric}, ${currentValue}, ${rule.threshold_value}, ${alert.message}
          )
        `;
      }
    }
  }

  return triggeredAlerts;
}

function generateAlertMessage(rule: any, currentValue: number): string {
  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'conversion_rate':
        return `${value.toFixed(2)}%`;
      case 'cost_per_acquisition':
      case 'total_spend':
        return `$${value.toFixed(2)}`;
      default:
        return value.toString();
    }
  };

  const currentFormatted = formatValue(currentValue, rule.metric);
  const thresholdFormatted = formatValue(rule.threshold_value, rule.metric);

  switch (rule.id) {
    case 'low_conversion_rate':
      return `🚨 Taxa de conversão baixa: ${currentFormatted} (limite: ${thresholdFormatted})`;
    case 'high_cpa':
      return `💰 CPA muito alto: ${currentFormatted} (limite: ${thresholdFormatted})`;
    case 'no_conversions':
      return `⚠️ Nenhuma conversão nas últimas ${rule.period_hours} horas`;
    case 'high_spend':
      return `💸 Gasto alto: ${currentFormatted} (limite: ${thresholdFormatted})`;
    default:
      return `⚠️ ${rule.name}: ${currentFormatted} (limite: ${thresholdFormatted})`;
  }
}

async function sendAlertNotifications(alerts: AlertTrigger[]) {
  for (const alert of alerts) {
    console.log(`🚨 PERFORMANCE ALERT: ${alert.message}`);
    
    // In a real application, send notifications via:
    // - Email
    // - Slack webhook
    // - SMS
    // - Push notifications
    
    const notificationData = {
      title: `Fly2Any - ${alert.rule.name}`,
      message: alert.message,
      severity: getSeverityLevel(alert.rule.metric),
      timestamp: alert.timestamp,
      dashboard_url: 'https://fly2any.com/admin/campanhas'
    };

    // TODO: Implement actual notification sending
    console.log('📧 Notification Data:', notificationData);
  }
}

function getSeverityLevel(metric: string): 'low' | 'medium' | 'high' {
  switch (metric) {
    case 'no_conversions':
    case 'high_cpa':
      return 'high';
    case 'low_conversion_rate':
      return 'medium';
    default:
      return 'low';
  }
}

// Manual alert check endpoint
export async function POST(request: NextRequest) {
  try {
    await initializeAlertSystem();
    
    console.log('🔍 Checking performance alerts...');
    const triggeredAlerts = await checkAlertRules();
    
    if (triggeredAlerts.length > 0) {
      await sendAlertNotifications(triggeredAlerts);
    }
    
    return NextResponse.json({
      success: true,
      alerts_triggered: triggeredAlerts.length,
      alerts: triggeredAlerts,
      message: `Alert check completed. ${triggeredAlerts.length} alerts triggered.`
    });
    
  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json(
      { error: 'Failed to check performance alerts' },
      { status: 500 }
    );
  }
}

// Get alert history
export async function GET(request: NextRequest) {
  try {
    await initializeAlertSystem();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const resolved = searchParams.get('resolved') === 'true';
    
    const result = resolved 
      ? await sql`
          SELECT * FROM performance_alerts 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
          AND resolved = true
          ORDER BY created_at DESC 
          LIMIT 100
        `
      : await sql`
          SELECT * FROM performance_alerts 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
          ORDER BY created_at DESC 
          LIMIT 100
        `;

    return NextResponse.json({
      success: true,
      alerts: result.rows,
      period: `${days} days`,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching alert history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert history' },
      { status: 500 }
    );
  }
}

// Resolve an alert
export async function PATCH(request: NextRequest) {
  try {
    const { alert_id } = await request.json();
    
    await sql`
      UPDATE performance_alerts 
      SET resolved = true, resolved_at = CURRENT_TIMESTAMP 
      WHERE id = ${alert_id}
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Alert resolved successfully'
    });
    
  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}
