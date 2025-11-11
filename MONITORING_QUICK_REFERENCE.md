# Monitoring Quick Reference Card

One-page reference for production monitoring and alerting.

---

## Essential Environment Variables

```bash
# Required
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Optional (for enhanced alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
PAGERDUTY_ROUTING_KEY=your-routing-key
ALERT_EMAIL=oncall@fly2any.com
```

---

## Key Endpoints

| Endpoint                          | Purpose                    |
|-----------------------------------|----------------------------|
| `GET /api/health`                 | Full health report         |
| `HEAD /api/health`                | Quick health check         |
| `GET /api/admin/metrics`          | All metrics                |
| `GET /api/admin/metrics?type=...` | Specific metrics           |

---

## Common Commands

```bash
# Check health
curl https://fly2any.com/api/health

# Get metrics
curl https://fly2any.com/api/admin/metrics

# Run uptime monitor (single check)
npm run monitor:uptime

# Run uptime monitor (continuous)
npm run monitor:uptime:continuous

# View metrics types
curl https://fly2any.com/api/admin/metrics?type=performance
curl https://fly2any.com/api/admin/metrics?type=alerts
curl https://fly2any.com/api/admin/metrics?type=health
```

---

## Alert Severity Levels

| Level    | Response Time | Action                        |
|----------|---------------|-------------------------------|
| Critical | < 5 min       | Immediate response required   |
| High     | < 15 min      | Respond within 15 minutes     |
| Medium   | < 1 hour      | Respond within 1 hour         |
| Low      | Next day      | Review during business hours  |

---

## Pre-configured Alerts

1. **High Error Rate** (High) - Error rate > 5%
2. **Slow API Response** (Medium) - P95 > 3000ms
3. **Database Issues** (Critical) - DB connection fails
4. **Redis Issues** (High) - Redis connection fails
5. **External API Failures** (High) - API providers down
6. **High Memory** (Medium) - Memory > 90%

---

## Performance Thresholds

| Metric                  | Good      | Warning   | Alert     |
|-------------------------|-----------|-----------|-----------|
| API Response (P95)      | < 500ms   | < 3000ms  | > 3000ms  |
| Database Query          | < 100ms   | < 1000ms  | > 1000ms  |
| Cache Operation         | < 50ms    | < 100ms   | > 100ms   |
| External API            | < 1000ms  | < 5000ms  | > 5000ms  |
| Error Rate              | < 1%      | < 5%      | > 5%      |
| Memory Usage            | < 70%     | < 90%     | > 90%     |

---

## Code Examples

### Track Error
```typescript
import { captureException } from '@/lib/monitoring/sentry';

try {
  await operation();
} catch (error) {
  captureException(error, {
    component: 'ComponentName',
    action: 'action-name',
    metadata: { key: 'value' }
  });
}
```

### Track Performance
```typescript
import { perfMonitor } from '@/lib/monitoring/performance';

const result = await perfMonitor.measureAsync(
  'operation-name',
  async () => await operation(),
  { context: 'data' }
);
```

### Update Service Health
```typescript
import { healthChecker } from '@/lib/monitoring/middleware';

healthChecker.updateServiceHealth(
  'service-name',
  true, // healthy
  123,  // response time
  undefined // error message
);
```

---

## Troubleshooting

### No Alerts Received
```bash
# Check environment variables
echo $SLACK_WEBHOOK_URL
echo $PAGERDUTY_ROUTING_KEY

# Test notification manually
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test alert"}'
```

### Health Check Fails
```bash
# Check database
npx prisma db pull

# Check Redis
redis-cli -u $UPSTASH_REDIS_REST_URL ping

# Check full health
curl -v https://fly2any.com/api/health
```

### High Error Rate
```bash
# Check recent errors
curl https://fly2any.com/api/admin/metrics?type=alerts

# Check Sentry dashboard
open https://sentry.io/

# Review error patterns
curl https://fly2any.com/api/admin/metrics | jq '.errors'
```

---

## Files & Locations

**Core Modules**:
- `/lib/monitoring/sentry.ts` - Sentry integration
- `/lib/monitoring/performance.ts` - Performance tracking
- `/lib/monitoring/middleware.ts` - API monitoring
- `/lib/monitoring/alerts.ts` - Alert rules

**Endpoints**:
- `/app/api/health/route.ts` - Health checks
- `/app/api/admin/metrics/route.ts` - Metrics API

**Scripts**:
- `/scripts/uptime-monitor.ts` - Uptime monitoring

**Documentation**:
- `/MONITORING.md` - Complete guide
- `/MONITORING_SETUP_REPORT.md` - Implementation report
- `/MONITORING_QUICK_REFERENCE.md` - This card

---

## Load Balancer Configuration

```yaml
health_check:
  path: /api/health
  method: HEAD
  interval: 30s
  timeout: 5s
  healthy_codes: [200, 207]
  unhealthy_codes: [503]
```

---

## Cron Job for Uptime Monitoring

```bash
# Add to crontab
*/5 * * * * cd /path/to/fly2any && npm run monitor:uptime >> /var/log/uptime.log 2>&1
```

---

## Metrics Dashboard Integration

```typescript
// Real-time metrics
const fetchMetrics = async () => {
  const res = await fetch('/api/admin/metrics');
  const data = await res.json();

  return {
    health: data.health.status,
    requests: data.requests.total,
    errorRate: data.requests.errorRate,
    avgResponseTime: data.performance.avgResponseTime,
    uptime: data.uptime
  };
};

// Update every 30 seconds
setInterval(async () => {
  const metrics = await fetchMetrics();
  updateDashboard(metrics);
}, 30000);
```

---

## Alert Response Checklist

**When Critical Alert Fires**:
- [ ] Acknowledge alert in PagerDuty/Slack
- [ ] Check `/api/health` endpoint
- [ ] Review Sentry for recent errors
- [ ] Check external service status pages
- [ ] Review recent deployments
- [ ] Escalate if needed
- [ ] Document incident
- [ ] Update team after resolution

**When High Priority Alert Fires**:
- [ ] Review alert details
- [ ] Check metrics dashboard
- [ ] Identify affected services
- [ ] Implement mitigation
- [ ] Monitor for recurrence
- [ ] Document resolution

---

## Emergency Contacts

- **DevOps Lead**: devops@fly2any.com
- **Slack Channel**: #monitoring-alerts
- **On-Call**: PagerDuty rotation
- **Escalation**: CTO contact

---

## External Service Status Pages

- **Vercel**: status.vercel.com
- **Duffel**: status.duffel.com
- **Stripe**: status.stripe.com
- **Sentry**: status.sentry.io

---

**Version**: 1.0.0 | **Last Updated**: 2024-11-10
