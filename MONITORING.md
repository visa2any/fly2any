# Production Monitoring and Alerting

Comprehensive monitoring and alerting system for Fly2Any production environment.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Sentry Setup](#sentry-setup)
- [Health Checks](#health-checks)
- [Performance Monitoring](#performance-monitoring)
- [Alert Configuration](#alert-configuration)
- [Metrics Dashboard](#metrics-dashboard)
- [Uptime Monitoring](#uptime-monitoring)
- [On-Call Procedures](#on-call-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

The monitoring system provides:

- **Error Tracking**: Sentry integration for exception tracking and debugging
- **Performance Monitoring**: Track API response times, database queries, and cache operations
- **Health Checks**: Monitor database, Redis, and external API availability
- **Alerting**: Automated alerts for critical issues via Slack, email, and PagerDuty
- **Metrics Dashboard**: Real-time metrics and performance data
- **Uptime Monitoring**: Continuous endpoint availability monitoring

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Application                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Sentry     │  │ Performance  │  │   Health     │    │
│  │   Tracking   │  │   Monitor    │  │   Checker    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                    ┌───────▼────────┐                      │
│                    │ Alert Manager  │                      │
│                    └───────┬────────┘                      │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                          │
        ┌───────▼──────┐          ┌───────▼──────┐
        │    Slack     │          │  PagerDuty   │
        │ Notifications│          │    Alerts    │
        └──────────────┘          └──────────────┘
```

## Sentry Setup

### Configuration

1. **Get Sentry DSN**: Sign up at [sentry.io](https://sentry.io) and create a project
2. **Set Environment Variables**:

```bash
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

3. **Sentry is pre-configured** in:
   - `sentry.server.config.ts` - Server-side tracking
   - `sentry.client.config.ts` - Client-side tracking
   - `sentry.edge.config.ts` - Edge runtime tracking

### Usage

```typescript
import { captureException, captureMessage } from '@/lib/monitoring/sentry';

// Capture exceptions
try {
  await someOperation();
} catch (error) {
  captureException(error, {
    component: 'FlightSearch',
    action: 'search',
    metadata: { origin, destination },
  });
}

// Capture messages
captureMessage('High cache miss rate', 'warning', {
  rate: '75%',
  endpoint: '/api/flights/search',
});
```

### Features

- **Automatic error tracking**: Unhandled exceptions are captured automatically
- **Performance monitoring**: Transaction tracking for API calls
- **Session replay**: Visual replay of user sessions with errors
- **Breadcrumbs**: Context trail leading to errors
- **Sensitive data filtering**: PII and credentials are automatically redacted

## Health Checks

### Endpoint: `/api/health`

Provides comprehensive health status of all services.

**Response Format**:

```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-11-10T12:00:00Z",
  "uptime": 86400,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45,
      "lastCheck": "2024-11-10T12:00:00Z"
    },
    "redis": {
      "status": "healthy",
      "responseTime": 12,
      "lastCheck": "2024-11-10T12:00:00Z"
    },
    "externalAPIs": {
      "duffel": { "status": "healthy", "responseTime": 234 },
      "amadeus": { "status": "healthy", "responseTime": 198 },
      "stripe": { "status": "healthy", "responseTime": 156 }
    },
    "system": {
      "memory": {
        "used": "245 MB",
        "total": "512 MB",
        "percentage": "47.8%"
      },
      "nodejs": "v20.10.0",
      "environment": "production"
    }
  }
}
```

### Load Balancer Health Check

For lightweight health checks (load balancers):

```bash
curl -I https://fly2any.com/api/health
# Returns: 200 (healthy) or 503 (unhealthy)
```

### Integration

Configure your load balancer or monitoring service:

- **Path**: `/api/health`
- **Method**: `HEAD` or `GET`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Healthy**: 200, 207
- **Unhealthy**: 503

## Performance Monitoring

### Performance Monitor

Track operation performance:

```typescript
import { perfMonitor } from '@/lib/monitoring/performance';

// Start/end measurement
perfMonitor.startMeasure('flight-search');
await searchFlights();
const duration = perfMonitor.endMeasure('flight-search');

// Measure async operations
const result = await perfMonitor.measureAsync(
  'api-call',
  async () => {
    return await fetch('/api/data');
  },
  { endpoint: '/api/data' }
);

// Get metrics
const metrics = perfMonitor.getMetrics('flight-search');
console.log(`P95: ${metrics.p95}ms, Avg: ${metrics.avg}ms`);
```

### Automatic Tracking

Operations are automatically tracked:

- **API calls**: Response time, status codes
- **Database queries**: Query execution time
- **Cache operations**: Hit/miss rates, latency
- **External APIs**: Third-party API response times

### Performance Thresholds

| Operation         | Threshold | Action                    |
| ----------------- | --------- | ------------------------- |
| API calls         | 3000ms    | Warning log               |
| External APIs     | 5000ms    | Warning log + Sentry      |
| Database queries  | 1000ms    | Warning log               |
| Cache operations  | 100ms     | Warning log (if exceeded) |
| Flight searches   | 5000ms    | Warning log + Alert       |

## Alert Configuration

### Alert Rules

The system includes pre-configured alert rules:

1. **High Error Rate** (High Priority)
   - Condition: API error rate > 5% with >10 requests
   - Threshold: 3 consecutive failures
   - Cooldown: 5 minutes

2. **Slow API Response** (Medium Priority)
   - Condition: P95 response time > 3000ms
   - Threshold: 5 consecutive occurrences
   - Cooldown: 10 minutes

3. **Database Connection Issues** (Critical)
   - Condition: Database health check fails
   - Threshold: 1 failure
   - Cooldown: 2 minutes

4. **Redis Connection Issues** (High Priority)
   - Condition: Redis health check fails
   - Threshold: 2 consecutive failures
   - Cooldown: 5 minutes

5. **External API Failures** (High Priority)
   - Condition: Duffel, Amadeus, or Stripe API failures
   - Threshold: 3 consecutive failures
   - Cooldown: 5 minutes

6. **High Memory Usage** (Medium Priority)
   - Condition: Memory usage > 90%
   - Threshold: 5 consecutive occurrences
   - Cooldown: 10 minutes

### Custom Alert Rules

Add custom rules:

```typescript
import { alertManager } from '@/lib/monitoring/alerts';

alertManager.addRule({
  id: 'custom-rule',
  name: 'Custom Alert',
  description: 'My custom alert rule',
  severity: 'high',
  threshold: 3,
  cooldown: 300000, // 5 minutes
  enabled: true,
  condition: () => {
    // Return true to trigger alert
    return someCondition();
  },
  action: async () => {
    // Alert action
    console.log('Custom alert triggered!');
  },
});
```

### Notification Channels

Configure notification channels via environment variables:

```bash
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email (requires email service setup)
ALERT_EMAIL=oncall@fly2any.com

# PagerDuty (for critical alerts)
PAGERDUTY_ROUTING_KEY=your-routing-key
```

## Metrics Dashboard

### API Endpoint: `/api/admin/metrics`

Get comprehensive metrics:

```bash
# Full metrics
curl https://fly2any.com/api/admin/metrics

# Performance metrics only
curl https://fly2any.com/api/admin/metrics?type=performance

# Alert history
curl https://fly2any.com/api/admin/metrics?type=alerts

# Health status
curl https://fly2any.com/api/admin/metrics?type=health
```

### Metrics Available

- **Request Metrics**: Total requests, error rates, requests by endpoint
- **Performance Metrics**: Response times (avg, P95, P99), slow operations
- **Error Tracking**: Error counts, error rates by endpoint
- **Health Status**: Service health, last check times
- **External APIs**: Response times and error rates for Duffel, Amadeus, Stripe
- **System Resources**: Memory usage, CPU, uptime
- **Alerts**: Recent alerts, alert history, alert rules

### Building a Dashboard

Use the metrics API to build a monitoring dashboard:

```typescript
// Fetch metrics every 30 seconds
setInterval(async () => {
  const response = await fetch('/api/admin/metrics');
  const metrics = await response.json();

  updateDashboard(metrics);
}, 30000);
```

## Uptime Monitoring

### Uptime Monitor Script

Run continuous uptime monitoring:

```bash
# Single check
npm run monitor:uptime

# Continuous monitoring (every 5 minutes)
npm run monitor:uptime -- --continuous

# Custom interval (10 minutes)
MONITOR_INTERVAL=10 npm run monitor:uptime -- --continuous

# Custom URL
MONITOR_URL=https://staging.fly2any.com npm run monitor:uptime
```

### Monitored Endpoints

- Homepage (`/`)
- Health check (`/api/health`)
- Flights page (`/flights`)
- Hotels page (`/hotels`)
- Airports API (`/api/flights/airports`)
- Environment API (`/api/environment`)

### Cron Job Setup

Add to your server's crontab:

```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/fly2any && npm run monitor:uptime >> /var/log/uptime-monitor.log 2>&1
```

### External Monitoring Services

Consider using external uptime monitoring:

- **UptimeRobot**: Free tier, 5-minute checks
- **Pingdom**: Professional monitoring
- **StatusCake**: Free tier available
- **Better Uptime**: Modern monitoring with status pages

## On-Call Procedures

### Critical Alert Response

When you receive a critical alert:

1. **Acknowledge**: Acknowledge the alert in PagerDuty/Slack
2. **Assess**: Check `/api/health` endpoint for service status
3. **Investigate**: Review Sentry for recent errors
4. **Mitigate**: Take immediate action to restore service
5. **Document**: Log the incident and resolution

### Alert Severity Levels

- **Critical**: Service down, revenue impact
  - Response time: < 5 minutes
  - Example: Database offline, payment processing failed

- **High**: Degraded service, user impact
  - Response time: < 15 minutes
  - Example: High error rate, external API down

- **Medium**: Performance issues, no immediate user impact
  - Response time: < 1 hour
  - Example: Slow responses, high memory usage

- **Low**: Informational, monitoring
  - Response time: Next business day
  - Example: Cache miss rate increase

### Common Issues

#### High Error Rate

1. Check `/api/admin/metrics?type=alerts` for error details
2. Review Sentry for error patterns
3. Check external API status (Duffel, Amadeus)
4. Verify database connectivity
5. Review recent deployments

#### Slow Performance

1. Check `/api/admin/metrics?type=performance`
2. Identify slow endpoints
3. Review database query performance
4. Check external API response times
5. Verify cache hit rates

#### Database Issues

1. Check database health: `/api/health`
2. Verify connection pool availability
3. Review recent migrations
4. Check database logs
5. Monitor database metrics (CPU, memory, connections)

#### External API Issues

1. Check provider status pages
2. Verify API credentials
3. Review rate limits
4. Check network connectivity
5. Implement fallback mechanisms

## Troubleshooting

### No Alerts Being Sent

1. Verify environment variables are set:
   ```bash
   echo $SLACK_WEBHOOK_URL
   echo $PAGERDUTY_ROUTING_KEY
   ```

2. Check alert manager is running:
   ```typescript
   import { alertManager } from '@/lib/monitoring/alerts';
   console.log(alertManager.getRules());
   ```

3. Test notification channels manually

### Sentry Not Capturing Errors

1. Verify Sentry DSN is configured:
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. Check Sentry initialization in browser console
3. Verify error rate limits haven't been exceeded
4. Check Sentry project settings

### Health Check Always Failing

1. Verify database connection:
   ```bash
   npx prisma db pull
   ```

2. Check Redis connectivity:
   ```bash
   redis-cli -u $UPSTASH_REDIS_REST_URL ping
   ```

3. Review network/firewall rules
4. Check service credentials

### High Memory Usage

1. Check for memory leaks:
   ```typescript
   console.log(process.memoryUsage());
   ```

2. Review recent code changes
3. Monitor cache size
4. Check for connection pool leaks
5. Consider increasing memory limits

## Best Practices

1. **Set up alerts before production launch**: Don't wait for issues
2. **Test alert channels**: Verify notifications work
3. **Document on-call procedures**: Clear escalation paths
4. **Review metrics regularly**: Weekly performance reviews
5. **Tune alert thresholds**: Reduce noise, increase signal
6. **Keep runbooks updated**: Document common issues
7. **Practice incident response**: Run fire drills
8. **Monitor external dependencies**: Track third-party SLAs
9. **Set up status page**: Communicate with users
10. **Post-mortem process**: Learn from incidents

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Vercel Monitoring](https://vercel.com/docs/concepts/observability/overview)
- [Prisma Metrics](https://www.prisma.io/docs/concepts/components/prisma-client/metrics)
- [Redis Monitoring](https://redis.io/docs/management/monitor/)

## Support

For monitoring system issues:

- **Email**: devops@fly2any.com
- **Slack**: #monitoring-alerts
- **On-call**: PagerDuty rotation

---

Last updated: 2024-11-10
Version: 1.0.0
