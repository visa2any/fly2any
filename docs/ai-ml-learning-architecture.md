# Fly2Any AI/ML Safe Learning Architecture

## Purpose
Design a learning system that improves AI quality over time
WITHOUT training on PII or self-modifying production logic.

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                ANONYMIZED EVENT CAPTURE                         │
│  • Intent classification result                                 │
│  • Routing decision                                             │
│  • Resolution outcome (success/failure)                         │
│  • Time to resolution                                           │
│  • Escalation flag                                              │
│  NO PII: No names, emails, booking refs                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ANALYTICS PIPELINE                             │
│  • Aggregate patterns                                           │
│  • Friction point detection                                     │
│  • Success rate by intent                                       │
│  • Agent performance metrics                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────────────┐
│  AUTOMATED INSIGHTS     │   │  HUMAN REVIEW QUEUE             │
│  • Trend reports        │   │  • Flagged conversations        │
│  • Weekly summaries     │   │  • Escalation reasons           │
│  • Alert on anomalies   │   │  • Suggested improvements       │
└─────────────────────────┘   └─────────────────────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────────┐
                              │  MANUAL APPROVAL GATE           │
                              │  Human reviews & approves any   │
                              │  changes to prompts/routing     │
                              └─────────────────────────────────┘
```

---

## WHAT WE LEARN (Allowed)

### Intent & Routing
| Data Point | Purpose |
|------------|---------|
| Intent classification accuracy | Improve router |
| Routing decision frequency | Balance load |
| Handoff success rate | Optimize transfers |
| Misrouting patterns | Fix routing rules |

### Resolution Quality
| Data Point | Purpose |
|------------|---------|
| Resolution time | Identify friction |
| Message count to resolve | Efficiency |
| Success/failure outcome | Quality metrics |
| Escalation rate | Agent effectiveness |

### User Signals
| Data Point | Purpose |
|------------|---------|
| Implicit satisfaction (completed booking) | Success signal |
| Abandonment point | Friction detection |
| Return after escalation | Resolution quality |
| Session length | Engagement |

---

## WHAT WE NEVER LEARN (Forbidden)

### PII - Never Capture
```
❌ User names
❌ Email addresses
❌ Phone numbers
❌ Booking references
❌ Payment details
❌ Passport/ID numbers
❌ Physical addresses
❌ IP addresses (beyond country)
```

### Content - Never Store
```
❌ Actual message text (anonymize intents only)
❌ Search criteria specifics
❌ Destination details
❌ Travel companion info
❌ Health/medical info
❌ Any sensitive context
```

---

## DATA SCHEMA

### Allowed Event Schema
```typescript
interface LearningEvent {
  // Timing
  timestamp: Date;
  sessionId: string;        // Hashed, not traceable

  // Classification
  detectedIntent: string;   // e.g., "FLIGHT_SEARCH"
  confidence: number;       // 0-1
  wasCorrect: boolean;      // Based on outcome

  // Routing
  assignedAgent: string;    // e.g., "flight-operations"
  wasHandoff: boolean;
  handoffReason?: string;   // e.g., "payment_issue"

  // Resolution
  outcome: 'success' | 'failure' | 'escalated' | 'abandoned';
  resolutionTimeMs: number;
  messageCount: number;

  // Context (non-PII)
  country: string;          // e.g., "US"
  platform: 'web' | 'mobile';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}
```

### Forbidden Fields (NEVER Add)
```typescript
// NEVER include these in any schema
interface FORBIDDEN {
  userId: never;
  email: never;
  name: never;
  bookingRef: never;
  messageContent: never;
  searchParams: never;
  ipAddress: never;
}
```

---

## IMPROVEMENT WORKFLOW

### Automated (No Approval Needed)
```
1. Aggregate daily metrics
2. Generate trend reports
3. Identify statistical anomalies
4. Alert on threshold breaches
5. Compile weekly summary
```

### Semi-Automated (Requires Review)
```
1. System suggests prompt improvement
2. Human reviews suggestion
3. Human tests in staging
4. Human approves deployment
5. Gradual rollout (10% → 50% → 100%)
```

### Manual (Full Human Control)
```
1. New agent behavior
2. Routing rule changes
3. Permission changes
4. New intent categories
5. Handoff protocol changes
```

---

## APPROVAL GATES

### Level 1: Auto-Approve
- Dashboard report generation
- Metric threshold alerts
- Performance summaries

### Level 2: Engineer Approval
- Prompt wording tweaks
- Confidence threshold adjustments
- Cache duration changes

### Level 3: Lead Approval
- New intent categories
- Agent role changes
- Routing rule modifications

### Level 4: Executive Approval
- New agent creation
- Permission changes
- Data retention changes

---

## FEEDBACK SIGNALS

### Implicit Signals (Automatic)
| Signal | Meaning | Weight |
|--------|---------|--------|
| Booking completed | Success | HIGH |
| Session ended after resolution | Likely satisfied | MEDIUM |
| Escalation requested | Possible failure | MEDIUM |
| Abandoned mid-conversation | Friction | HIGH |
| Multiple handoffs | Routing issue | HIGH |

### Explicit Signals (If Implemented)
| Signal | Collection Method |
|--------|-------------------|
| Thumbs up/down | Post-resolution |
| Star rating | End of session |
| "Was this helpful?" | After answers |

---

## SAFETY MECHANISMS

### Data Retention
```
Raw events: 30 days
Aggregated metrics: 1 year
Anonymized patterns: Indefinite
PII: Never stored
```

### Access Control
```
Raw events: Engineering only
Aggregated: Product + Engineering
Reports: All stakeholders
```

### Audit Trail
```
- All data access logged
- All prompt changes logged
- All approval decisions logged
- Monthly compliance review
```

---

## METRICS DASHBOARD

### Real-Time
- Active sessions
- Current agent load
- Error rate
- Response latency

### Daily
- Resolution rate by intent
- Escalation rate by agent
- Average resolution time
- Abandonment rate

### Weekly
- Trend analysis
- Agent performance comparison
- Routing accuracy
- Improvement opportunities

### Monthly
- Strategic insights
- System health
- Capacity planning
- ROI analysis

---

## IMPROVEMENT PRIORITIES

### Auto-Detected
```
IF escalation_rate > 15% FOR agent THEN
  FLAG for routing review
  SUGGEST handoff rule change

IF resolution_time > 5min FOR intent THEN
  FLAG for flow optimization
  SUGGEST prompt improvement

IF abandonment_rate > 20% AT step THEN
  FLAG for UX review
  ALERT product team
```

### Never Auto-Change
```
- Production prompts
- Routing rules
- Permission levels
- Agent behaviors
- Handoff protocols
```

---

## VERSION
- Created: 2025-12-23
- Status: LOCKED
- Owner: AI Platform Engineering
- Review: Quarterly
- Compliance: GDPR, CCPA compliant
