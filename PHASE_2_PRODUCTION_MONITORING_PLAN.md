# Phase 2: Send Quote Hub - 7-Day Production Monitoring Plan

**Deployed:** January 23, 2026
**Monitoring Window:** January 23-30, 2026 (7 days)
**Objective:** Detect regressions, data inconsistencies, or UX friction

---

## 📊 1. API METRICS

### Endpoint: `POST /api/agents/quotes/[id]/send`

**Owner:** Backend Engineer

**Metrics to Track:**

| Metric | Baseline | Warning Threshold | Critical Threshold | Action |
|--------|----------|------------------|-------------------|---------|
| Error Rate | < 1% | > 2% | > 5% | Investigate errors, consider rollback |
| Duplicate Request Attempts | N/A | > 5% of requests | > 10% of requests | Review double-submit protection |
| Idempotency Hits (within 5min) | N/A | N/A | Monitor volume | Verify idempotency working correctly |
| Response Time (p95) | < 500ms | > 1s | > 2s | Optimize queries or add caching |

**Red Flags:**
- ❌ Error rate > 5% for 30 minutes
- ❌ 500 errors on validation failures (should be 400)
- ❌ Idempotency hits = 0 (protection not working)
- ❌ Duplicate requests incrementing counters (idempotency broken)

**Immediate Rollback Criteria:**
- ❌ Error rate > 10% for 15 minutes
- ❌ Counter corruption detected (counts increasing on idempotency hits)
- ❌ Database transaction failures > 1%

---

### Endpoint: `POST /api/agents/quotes/send/whatsapp`

**Owner:** Backend Engineer

**Metrics to Track:**

| Metric | Baseline | Warning Threshold | Critical Threshold | Action |
|--------|----------|------------------|-------------------|---------|
| Validation Error Rate | < 5% (expected) | > 10% | > 20% | Review validation rules |
| Invalid Phone Errors | N/A | > 10% of requests | > 20% of requests | Phone format education needed |
| Message Length Errors | N/A | > 5% of requests | > 10% of requests | UX improvement needed |

**Red Flags:**
- ❌ E.164 validation rejecting valid numbers
- ❌ Phone normalization corrupting numbers
- ❌ URL encoding errors in wa.me URLs
- ❌ 500 errors on validation (should be 400)

**Immediate Rollback Criteria:**
- ❌ Validation blocking all WhatsApp sends (> 50% error rate)
- ❌ Generated wa.me URLs are malformed

---

## 🔒 2. DATA INTEGRITY

### Quote Send Counters

**Owner:** Backend Engineer

**Metrics to Track:**

| Metric | Expected Behavior | Warning | Critical | Action |
|--------|------------------|----------|-----------|--------|
| emailSentCount | +1 per email send | Increment on idempotency hit | Increment on rapid clicks | Review idempotency logic |
| smsSentCount | +1 per WhatsApp send | Increment on idempotency hit | Increment on rapid clicks | Review idempotency logic |
| sentAt | Preserved on re-send (within 5min) | Overwritten within 5min | Overwritten on duplicate clicks | Review sentAt preservation |

**Red Flags:**
- ❌ emailSentCount > number of unique email sends
- ❌ smsSentCount > number of unique WhatsApp sends
- ❌ sentAt overwritten within 5-minute window
- ❌ Counters not incrementing at all

**Immediate Rollback Criteria:**
- ❌ Counters incrementing on duplicate requests (idempotency failure)
- ❌ sentAt corruption (invalid dates or null values)

---

## 🎨 3. UX SIGNALS

### Send Button & Modal Behavior

**Owner:** Frontend Engineer

**Metrics to Track:**

| Metric | Expected Behavior | Warning | Critical | Action |
|--------|------------------|----------|-----------|--------|
| Send Button Disabled Events | When quote not saved | Button enabled but send fails | Button disabled when quote IS saved | Review canSend logic |
| Modal Open → Send Success Ratio | > 80% | < 60% | < 40% | Review error UX |
| Error Message Frequency | Low (< 10% of sends) | High (> 20% of sends) | Very High (> 30% of sends) | Improve validation UX |
| Double-Click Attempts | Blocked by protection | Multiple requests sent | Counter corruption | Review request ID tracking |

**Red Flags:**
- ❌ Agents confused by Send button being disabled
- ❌ Modal opens but all send attempts fail
- ❌ Error messages not actionable (generic "Error" messages)
- ❌ Modal state not resetting on close
- ❌ Double-click results in duplicate sends

**Immediate Rollback Criteria:**
- ❌ Send button validation not matching handler validation
- ❌ Modal stuck in sending state (never resets)
- ❌ Alert errors not showing to agents

---

## 📈 4. BUSINESS SIGNALS

### Quote Sending Analytics

**Owner:** Product Manager

**Metrics to Track:**

| Metric | Daily Target | Warning | Critical | Action |
|--------|--------------|----------|-----------|--------|
| Quotes Sent per Day | Baseline established | < 50% of baseline | < 25% of baseline | Investigate UX blockage |
| Channel Distribution | Email: 60%, WhatsApp: 30%, Link: 10% | Link < 5% | Any channel = 0% | Review channel UX |
| Send Success Rate | > 95% | < 90% | < 80% | Review technical issues |
| Agent Satisfaction | N/A | Complaints > 5/day | Complaints > 10/day | UX improvement needed |

**Red Flags:**
- ❌ Significant drop in quote sends (agents avoiding new feature)
- ❌ One channel completely unused
- ❌ High abandonment rate (modal opens but no send)
- ❌ Agents reporting data corruption issues

**Immediate Rollback Criteria:**
- ❌ Send success rate < 50%
- ❌ Multiple agents reporting duplicate sends
- ❌ Quote data loss or corruption reported

---

## 📋 DAILY MONITORING CHECKLIST

### Day 1-3: Critical Period (Hourly Checks)

**Morning (9 AM):**
- [ ] Check Vercel deployment logs for errors
- [ ] Verify API error rates < 2%
- [ ] Confirm no 500 errors on send endpoints
- [ ] Check database for counter anomalies
- [ ] Review sentAt preservation (query quotes sent in last 5min)

**Mid-Day (12 PM):**
- [ ] Check idempotency hit count (should be non-zero)
- [ ] Verify WhatsApp validation error rate
- [ ] Monitor Send button disabled events
- [ ] Review agent feedback channels (Slack/intercom)

**Evening (5 PM):**
- [ ] Compare emailSentCount vs unique email sends
- [ ] Compare smsSentCount vs unique WhatsApp sends
- [ ] Check modal open → send success ratio
- [ ] Document any red flags

### Day 4-7: Normalization (Daily Checks)

**Daily Review:**
- [ ] Check API error rates (should be < 1%)
- [ ] Review send success rate (target > 95%)
- [ ] Monitor channel distribution
- [ ] Check for counter corruption
- [ ] Review agent feedback
- [ ] Update monitoring thresholds if needed

---

## 🚨 ROLLBACK PROCEDURE

### When to Rollback:
1. **Critical:** Data integrity issues (counter corruption, sentAt overwritten)
2. **Critical:** Error rate > 10% for 15 minutes
3. **Severe:** Send success rate < 50%
4. **Severe:** Multiple agents reporting duplicate sends

### Rollback Steps:
1. Deploy previous commit: `git revert <commit-hash>`
2. Push to main: `git push origin main`
3. Vercel auto-deploys (monitor build)
4. Verify rollback successful (check production URL)
5. Notify stakeholders of rollback
6. Investigate root cause
7. Create fix and redeploy

### Rollback Communication:
```
Subject: 🚨 Phase 2 Rollback - Send Quote Hub

Dear Team,

Phase 2: Send Quote Hub has been rolled back due to:
- [Issue detected]

Rollback time: [timestamp]
Previous version restored: [commit-hash]

Investigation in progress. Estimated fix time: [estimate]

Thank you for your patience.
```

---

## 📊 MONITORING DASHBOARD

### Recommended Tools:
- **Vercel Analytics:** API metrics, error rates
- **Prisma Studio:** Data integrity checks
- **Sentry:** Error tracking and alerting
- **Custom Dashboard:** Business metrics

### Key Queries:

**Counter Integrity:**
```sql
-- Check for corrupted counters
SELECT 
  id,
  emailSentCount,
  smsSentCount,
  sentAt,
  status,
  updatedAt
FROM agentQuote
WHERE status = 'SENT'
ORDER BY sentAt DESC
LIMIT 100;
```

**Idempotency Verification:**
```sql
-- Check sentAt preservation
SELECT 
  id,
  sentAt,
  updatedAt,
  TIMESTAMPDIFF(MINUTE, sentAt, updatedAt) as minutes_between
FROM agentQuote
WHERE status = 'SENT'
  AND updatedAt > sentAt
  AND TIMESTAMPDIFF(MINUTE, sentAt, updatedAt) < 5;
```

**Send Success Rate:**
```sql
-- Calculate daily success rate
SELECT 
  DATE(sentAt) as date,
  COUNT(*) as total_sends,
  SUM(emailSentCount + smsSentCount) as counter_total
FROM agentQuote
WHERE sentAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(sentAt);
```

---

## 📞 EMERGENCY CONTACTS

**Critical Issues (Immediate Response Required):**
- **Backend Lead:** [Name] - [Phone] - [Email]
- **Frontend Lead:** [Name] - [Phone] - [Email]
- **DevOps:** [Name] - [Phone] - [Email]
- **Product Manager:** [Name] - [Phone] - [Email]

**Non-Critical Issues (Response within 24h):**
- Create GitHub issue with tag `phase-2-monitoring`
- Include metrics and reproduction steps

---

## ✅ END OF 7-DAY MONITORING

### Success Criteria:
- ✅ Error rate < 1% for 7 consecutive days
- ✅ No counter corruption detected
- ✅ sentAt preservation verified
- ✅ Send success rate > 95%
- ✅ Agent satisfaction > 80%
- ✅ No urgent support tickets related to sending

### Transition to Standard Monitoring:
After 7 days with all success criteria met, transition to standard monitoring:
- Weekly error rate reviews
- Monthly data integrity audits
- Quarterly UX satisfaction surveys

### Post-Monitoring Actions:
1. Document lessons learned
2. Update monitoring thresholds based on real data
3. Plan Phase 3 enhancements (if needed)
4. Archive monitoring data for future reference

---

**Document Version:** 1.0
**Last Updated:** January 23, 2026
**Next Review:** January 30, 2026
