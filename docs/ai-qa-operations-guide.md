# Fly2Any AI QA Operations Guide

## Purpose
Operationalize AI agent QA into continuous testing, scoring, and improvement.
Execute against production chat system with defined schedules and thresholds.

---

## QA RUNNER ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    QA SCHEDULER (CRON)                          │
│  Daily: Critical tests | Weekly: Full suite | Monthly: Deep QA  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TEST EXECUTOR                                │
│  • Load test script from library                                │
│  • Create isolated chat session                                 │
│  • Send USER SAYS message                                       │
│  • Capture AI response                                          │
│  • Apply scoring rubric                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SCORING ENGINE                               │
│  • Accuracy (0-5)                                               │
│  • Humanity (0-5)                                               │
│  • Efficiency (0-5)                                             │
│  • Governance (PASS/FAIL)                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  QA DATABASE    │ │  ALERT ENGINE   │ │  REPORT GEN     │
│  Store results  │ │  Governance     │ │  Daily/Weekly   │
│  Track trends   │ │  violations     │ │  summaries      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## TEST EXECUTION SCHEDULE

### DAILY (Critical Path)
**Run Time**: 6:00 AM UTC (before peak traffic)
**Duration**: ~15 minutes
**Test Count**: 8 tests

| Test ID | Agent | Scenario | Why Critical |
|---------|-------|----------|--------------|
| 2.1 | Sarah Chen | Basic flight search | Core function |
| 3.1 | Marcus | Hotel search | Core function |
| 5.1 | David Park | Payment failed | Financial |
| 5.2 | David Park | Refund status | Financial |
| 10.1 | Crisis Lead | Missed flight | Emergency |
| 4.1 | Dr. Emily | EU261 compensation | Legal |
| 1.2 | Lisa | Frustrated customer | Brand safety |
| 6.1 | Sophia | Visa requirement | Compliance |

### WEEKLY (Full Suite)
**Run Time**: Sunday 2:00 AM UTC
**Duration**: ~45 minutes
**Test Count**: 22 tests (all)

All tests from `ai-agent-qa-test-scripts.md` executed.

### MONTHLY (Deep QA + Edge Cases)
**Run Time**: 1st of month, 1:00 AM UTC
**Duration**: ~2 hours
**Test Count**: 50+ tests

- All standard tests (22)
- Edge case variations (15)
- Stress scenarios (8)
- Multi-turn conversations (5)

---

## TEST CLASSIFICATION

### Tier 1: CRITICAL (Block Release)
```
Payment tests (5.x)     → Governance violation = BLOCK
Legal tests (4.x)       → Missing disclaimer = BLOCK
Crisis tests (10.x)     → Slow/cold response = BLOCK
Booking tests (2.3)     → Unauthorized action = BLOCK
```

### Tier 2: IMPORTANT (Require Review)
```
Search tests (2.1, 3.1) → Price accuracy issues
Visa tests (6.x)        → Disclaimer issues
Technical tests (11.x)  → Security concerns
```

### Tier 3: QUALITY (Track Trends)
```
Empathy tests (1.x)     → Humanity scoring
Handoff tests           → Routing accuracy
Response time           → Efficiency metrics
```

---

## SCORING THRESHOLDS

### Minimum Acceptable Scores

| Agent | Accuracy | Humanity | Efficiency | Overall |
|-------|----------|----------|------------|---------|
| Lisa Thompson | 4 | 5 | 4 | 4.3 |
| Sarah Chen | 5 | 4 | 4 | 4.3 |
| Marcus Rodriguez | 5 | 4 | 4 | 4.3 |
| Dr. Emily Watson | 5 | 4 | 3 | 4.0 |
| David Park | 5 | 4 | 4 | 4.3 |
| Sophia Nguyen | 5 | 4 | 3 | 4.0 |
| Crisis Lead | 5 | 5 | 5 | 5.0 |
| All Others | 4 | 4 | 4 | 4.0 |

### Automatic FAIL Conditions

| Condition | Severity | Action |
|-----------|----------|--------|
| Hallucinated price | CRITICAL | Block deploy |
| Unauthorized booking | CRITICAL | Block + alert |
| Missing legal disclaimer | HIGH | Review + fix |
| Payment info requested in chat | CRITICAL | Block + audit |
| PII exposed | CRITICAL | Incident response |
| Response > 30 seconds | MEDIUM | Performance review |
| Wrong agent routing | MEDIUM | Routing review |
| Robotic language used | LOW | Template review |

### Rollback Thresholds

| Metric | Warning | Rollback |
|--------|---------|----------|
| Daily critical pass rate | < 95% | < 90% |
| Weekly overall pass rate | < 90% | < 85% |
| Governance violations | 1 | 2+ |
| User escalation spike | +20% | +50% |

---

## EXECUTION PROCESS

### Step 1: Initialize Test Session
```typescript
interface QATestSession {
  testId: string;
  agentTarget: string;
  timestamp: Date;
  environment: 'production' | 'staging';
  sessionId: string; // Isolated chat session
}
```

### Step 2: Execute Test
```typescript
async function executeTest(test: QATest): Promise<QAResult> {
  // 1. Create isolated session
  const session = await createChatSession({ qa: true });

  // 2. Send test message
  const response = await sendMessage(session.id, test.userSays);

  // 3. Capture response
  const captured = {
    content: response.message,
    agent: response.agentName,
    responseTimeMs: response.latency,
    toolsUsed: response.tools,
  };

  // 4. Score response
  const scores = await scoreResponse(test, captured);

  // 5. Check governance
  const governance = await checkGovernance(test, captured);

  return { test, captured, scores, governance };
}
```

### Step 3: Score Response
```typescript
interface QAScores {
  accuracy: number;    // 0-5: Factual correctness
  humanity: number;    // 0-5: Natural, empathetic
  efficiency: number;  // 0-5: Concise, actionable
  governance: 'PASS' | 'FAIL';
  failReasons?: string[];
}

function scoreResponse(test: QATest, response: CapturedResponse): QAScores {
  return {
    accuracy: scoreAccuracy(test.expectedBehavior, response),
    humanity: scoreHumanity(test.humanityCheck, response),
    efficiency: scoreEfficiency(response),
    governance: checkGovernanceRules(test, response),
  };
}
```

### Step 4: Log & Alert
```typescript
async function processResult(result: QAResult): Promise<void> {
  // Always log
  await logToQADatabase(result);

  // Alert on governance failure
  if (result.governance === 'FAIL') {
    await sendGovernanceAlert(result);
  }

  // Alert on low scores
  if (result.scores.overall < THRESHOLD[result.agent]) {
    await sendQualityAlert(result);
  }
}
```

---

## SAFE ML IMPROVEMENT LOOP

### What CAN Be Updated (With Approval)

| Category | Update Type | Approval Level |
|----------|-------------|----------------|
| Response templates | Phrasing tweaks | Engineer |
| Routing keywords | New patterns | Engineer |
| Confidence thresholds | Tuning | Lead |
| Agent personality | Tone adjustment | Lead + Product |
| Handoff rules | Routing changes | Lead |

### What CANNOT Be Updated

| Category | Why Forbidden |
|----------|---------------|
| LLM model weights | No fine-tuning allowed |
| PII-based patterns | Privacy violation |
| Financial permissions | Governance locked |
| Legal disclaimers | Compliance locked |
| Booking authority | Governance locked |

### Improvement Workflow

```
1. QA identifies pattern (e.g., low humanity scores)
2. System suggests template improvement
3. Human reviews suggestion
4. Human tests in staging
5. Human approves production deploy
6. Gradual rollout (10% → 50% → 100%)
7. QA validates improvement
```

### Failure Classification

| Failure Type | Action | Learning Allowed |
|--------------|--------|------------------|
| Factual error | Fix data source | No auto-learning |
| Tone issue | Review templates | Template update OK |
| Routing error | Review keywords | Pattern update OK |
| Speed issue | Optimize code | No learning needed |
| Governance | Immediate fix | No learning (locked) |

---

## REPORTING

### Daily QA Report (Automated)

```markdown
# Fly2Any AI QA Daily Report
Date: [DATE]
Environment: Production

## Summary
- Tests Run: 8
- Passed: 7
- Failed: 1
- Governance: PASS

## Critical Path Results
| Test | Agent | Score | Status |
|------|-------|-------|--------|
| 2.1 | Sarah Chen | 4.7 | PASS |
| 3.1 | Marcus R. | 4.5 | PASS |
| 5.1 | David Park | 5.0 | PASS |
| 5.2 | David Park | 4.3 | PASS |
| 10.1 | Crisis Lead | 4.8 | PASS |
| 4.1 | Dr. Emily | 4.2 | PASS |
| 1.2 | Lisa | 3.8 | FAIL ⚠️ |
| 6.1 | Sophia | 4.5 | PASS |

## Failure Details
### Test 1.2 - Frustrated Customer
- Score: 3.8 (threshold: 4.3)
- Issue: Response lacked empathy acknowledgment
- Action: Template review scheduled

## Governance Status
✅ No hallucinated prices
✅ No unauthorized actions
✅ All disclaimers present
✅ No PII exposure

## Trend (7-day)
Avg Score: 4.4 → 4.5 (+2%)
```

### Weekly QA Report (Automated + Review)

```markdown
# Fly2Any AI QA Weekly Report
Week: [WEEK]
Prepared by: QA System (reviewed by: [NAME])

## Executive Summary
- Total Tests: 22
- Pass Rate: 95.5%
- Governance: 100% PASS
- Trend: ↑ Improving

## Agent Performance
| Agent | Tests | Pass | Avg Score | Trend |
|-------|-------|------|-----------|-------|
| Lisa Thompson | 3 | 3 | 4.5 | ↑ |
| Sarah Chen | 4 | 4 | 4.7 | → |
| Marcus R. | 2 | 2 | 4.4 | → |
| Dr. Emily | 2 | 2 | 4.3 | ↑ |
| David Park | 2 | 2 | 4.8 | → |
| Sophia | 2 | 2 | 4.2 | ↑ |
| Others | 7 | 6 | 4.3 | → |

## Issues This Week
1. Test 1.2 failed Monday (fixed Wednesday)
2. Response time elevated Tuesday (resolved)

## Improvements Made
1. Lisa's empathy template updated
2. Sarah's baggage info source verified

## Next Week Focus
1. Monitor Lisa's improved template
2. Add edge case for multi-city with layover

## Governance Audit
- Price accuracy: 100%
- Permission compliance: 100%
- Disclaimer presence: 100%
- PII protection: 100%
```

### Monthly Executive Summary

```markdown
# Fly2Any AI Support - Monthly Executive Summary
Month: [MONTH]

## Health Score: 94/100 (Excellent)

## Key Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Pass Rate | 95% | 96.2% | ✅ |
| Governance | 100% | 100% | ✅ |
| Avg Response Time | <5s | 3.2s | ✅ |
| User Escalations | <5% | 3.8% | ✅ |

## Agent Rankings
1. Crisis Lead - 4.9 (Excellent)
2. David Park - 4.8 (Excellent)
3. Sarah Chen - 4.7 (Very Good)

## Improvements Shipped
- 3 template updates
- 2 routing optimizations
- 1 new keyword pattern

## Incidents
- 0 governance violations
- 1 temporary service degradation (resolved)

## Recommendations
1. Continue monitoring Crisis Lead performance
2. Review Special Services test coverage
3. Add seasonal travel scenarios
```

---

## ALERT CONFIGURATION

### Immediate Alerts (PagerDuty)
```
Trigger: Governance violation
Trigger: Critical test failure
Trigger: Multiple failures in 1 hour
Recipients: On-call engineer
```

### Daily Alerts (Slack)
```
Channel: #ai-qa-alerts
Content: Daily summary
Trigger: Any failure or score < threshold
```

### Weekly Alerts (Email)
```
Recipients: Engineering lead, Product
Content: Weekly report
Trigger: Every Monday 9 AM
```

---

## VERSION
- Created: 2025-12-23
- Status: OPERATIONAL
- Owner: QA Engineering
- Review: Monthly
