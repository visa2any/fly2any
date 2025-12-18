# Fly2Any SEO Agent System
## Internal Documentation v1.0

---

## PART 1 — AGENT EXECUTION MODEL

### Cron Schedule Overview

| Job | Schedule | Purpose | Duration |
|-----|----------|---------|----------|
| `seo-health` | `0 */6 * * *` | URL health, 404s, 5xx | ~60s |
| `seo-generate` | `0 2 * * *` | AI content generation | ~120s |
| `sitemap-sync` | `0 4 * * 0` | Sitemap vs live validation | ~90s |
| `ai-search-audit` | `0 3 * * 1` | GEO schema validation | ~60s |
| `backlink-scan` | `0 5 1 * *` | Authority/backlink check | ~180s |

### API Endpoints

```
POST /api/seo/monitor     → Run health check (manual)
POST /api/seo/generate    → Generate content (manual)
GET  /api/seo/status      → Get agent memory state
POST /api/seo/memory      → Update memory entry
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Vercel     │────▶│  Agent      │────▶│  Memory     │
│  Cron       │     │  Logic      │     │  (KV/DB)    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Alerts     │
                    │  (Slack/    │
                    │   Email)    │
                    └─────────────┘
```

### Failure Handling

| Failure Type | Action |
|--------------|--------|
| API timeout | Retry 2x, then alert |
| 5xx errors | Log + critical alert |
| Memory write fail | Fallback to file, alert |
| Generation fail | Skip + queue for next run |

---

## PART 2 — PROMPT-MEMORY SYSTEM

### Memory Schema

```typescript
interface SEOMemoryEntry {
  id: string;              // "404_flights_jfk-to-lax"
  type: 'error' | 'warning' | 'opportunity' | 'action';
  category: 'url' | 'content' | 'schema' | 'backlink' | 'speed';

  // State
  status: 'open' | 'in_progress' | 'fixed' | 'monitoring' | 'ignored';
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Tracking
  firstDetected: string;   // ISO date
  lastChecked: string;     // ISO date
  fixedAt?: string;        // ISO date

  // Context
  url?: string;
  description: string;
  suggestedAction: string;

  // Safety
  requiresHumanApproval: boolean;
  autoFixAttempts: number;
  maxAutoAttempts: number; // Default: 0 (no auto-fix)
}
```

### Memory Location

```
Vercel KV (recommended) or
PostgreSQL (Prisma) table: seo_agent_memory
```

### Update Rules

| Event | Action |
|-------|--------|
| New issue detected | Create entry, status='open' |
| Issue still exists | Update `lastChecked` |
| Issue resolved | Set status='fixed', `fixedAt` |
| 7 days fixed | Move to status='monitoring' |
| 30 days monitoring | Archive (delete or move) |

### Safety Rules

```
NEVER AUTO-FIX:
- Redirects
- URL structure changes
- Content deletion
- Schema removal
- robots.txt changes

ALWAYS REQUIRE APPROVAL:
- New page creation
- Bulk content updates
- Sitemap additions
- External link changes
```

---

## PART 3 — AGENT LOOP (STATEFUL)

### Main Loop

```
1. LOAD MEMORY
   └─▶ Fetch all entries where status IN ('open', 'in_progress', 'monitoring')

2. RUN DETECTION
   └─▶ Execute health checks (URLs, schemas, sitemaps)
   └─▶ Collect new issues

3. COMPARE WITH MEMORY
   └─▶ For each new issue:
       ├─▶ EXISTS in memory? → Update lastChecked
       └─▶ NEW? → Create entry

4. CHECK RESOLUTIONS
   └─▶ For each open issue:
       ├─▶ Still broken? → Keep open
       └─▶ Fixed? → Update status='fixed'

5. GENERATE ACTIONS
   └─▶ Critical: Immediate alert
   └─▶ High: Add to daily checklist
   └─▶ Medium: Queue for review
   └─▶ Low: Log only

6. SAVE MEMORY
   └─▶ Write all changes
   └─▶ Log summary

7. DISPATCH REPORT
   └─▶ Slack/Email if critical
   └─▶ Dashboard update
```

### Decision Matrix

```
┌──────────────┬───────────────┬────────────────┐
│ Issue Type   │ Auto-Action   │ Human Action   │
├──────────────┼───────────────┼────────────────┤
│ 404 error    │ Alert         │ Fix redirect   │
│ 5xx error    │ Alert+Retry   │ Debug code     │
│ Missing meta │ Queue gen     │ Review content │
│ Slow page    │ Log           │ Optimize       │
│ Schema error │ Alert         │ Fix code       │
│ New keyword  │ Queue content │ Approve topic  │
└──────────────┴───────────────┴────────────────┘
```

---

## PART 4 — INTERNAL DOCUMENTATION

### 1. What is the Fly2Any SEO Agent

An automated system that monitors, detects, and reports SEO issues across fly2any.com. It runs on Vercel Cron and maintains persistent memory to avoid duplicate work.

### 2. Why It Exists

- 50K+ programmatic pages impossible to monitor manually
- AI search engines require continuous schema optimization
- Competitors (Kayak, Expedia) have dedicated SEO teams
- 1-2 dev team needs automation to compete

### 3. What It Automates

| Task | Automation Level |
|------|------------------|
| 404 detection | Full |
| 5xx monitoring | Full |
| Schema validation | Full |
| Sitemap sync check | Full |
| Content generation | Semi (review required) |
| Alert dispatch | Full |
| Report generation | Full |

### 4. What It Does NOT Automate

- URL structure changes
- Redirect creation
- Content publishing (requires approval)
- robots.txt modifications
- Canonical tag changes
- External link building

### 5. Daily Workflow (1-2 Devs)

```
MORNING (5 min)
├─▶ Check Slack/email for overnight alerts
├─▶ Review critical issues (if any)
└─▶ Acknowledge in dashboard

MIDDAY (10 min)
├─▶ Review generated content queue
├─▶ Approve/reject pending items
└─▶ Check weekly metrics

WEEKLY (30 min)
├─▶ Review full agent report
├─▶ Prioritize backlog
└─▶ Plan manual optimizations
```

### 6. How to Read Agent Reports

```
REPORT SECTIONS:
─────────────────
[CRITICAL] → Act immediately (404s, 5xx, broken core pages)
[HIGH]     → Act within 24h (schema errors, slow pages)
[MEDIUM]   → Act within 7 days (content gaps, meta issues)
[LOW]      → Backlog (nice-to-haves)

METRICS:
────────
health_score: 0-100 (target: 95+)
pages_checked: total URLs scanned
issues_found: new issues this run
issues_fixed: resolved since last run
```

### 7. Acting on Issues

**Blockers (Critical)**
```
1. Check alert details
2. Verify issue exists (curl/browser)
3. Fix in codebase
4. Deploy
5. Mark as 'fixed' in memory
6. Agent will verify on next run
```

**Warnings (High/Medium)**
```
1. Add to sprint backlog
2. Assign owner
3. Fix within SLA
4. Agent tracks automatically
```

**Opportunities**
```
1. Review suggested keywords/content
2. Approve if relevant
3. Agent queues for generation
4. Review generated content
5. Publish if quality passes
```

### 8. Extending the Agent

**Adding New Check**
```typescript
// lib/seo/agent/checks/new-check.ts
export async function runNewCheck(): Promise<SEOCheckResult> {
  // Detection logic
  return { issues: [], metrics: {} };
}

// Register in monitor.ts
import { runNewCheck } from './checks/new-check';
```

**Adding New Alert Channel**
```typescript
// lib/seo/agent/alerts/discord.ts
export async function sendDiscordAlert(issue: SEOMemoryEntry) {
  // Implementation
}
```

### 9. SEO Safety Rules

```
NEVER BREAK THESE:
──────────────────
1. Never auto-redirect without human approval
2. Never delete pages automatically
3. Never modify robots.txt automatically
4. Never change canonical URLs automatically
5. Never remove schema without verification
6. Never bulk-update meta tags without review
7. Always preserve existing backlinks
8. Always maintain URL consistency
9. Always log before any write operation
10. Always have rollback capability
```

---

## PART 5 — IMPLEMENTATION FILES

### File Structure

```
lib/seo/agent/
├── index.ts           # Main exports
├── monitor.ts         # Health checking ✅
├── generator.ts       # Content gen ✅
├── memory.ts          # State management (NEW)
├── loop.ts            # Main agent loop (NEW)
├── alerts.ts          # Notification dispatch (NEW)
└── checks/
    ├── url-health.ts
    ├── schema-validation.ts
    ├── sitemap-sync.ts
    └── ai-search.ts

app/api/seo/
├── monitor/route.ts   # ✅
├── generate/route.ts  # ✅
├── status/route.ts    # (NEW)
└── memory/route.ts    # (NEW)
```

### Environment Variables Required

```env
# Existing
GROQ_API_KEY=gsk_xxx

# Add for full system
CRON_SECRET=xxx
SEO_MONITOR_API_KEY=xxx
SLACK_WEBHOOK_URL=xxx (optional)
VERCEL_KV_URL=xxx (for memory)
```

---

## Quick Reference

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Healthy |
| 401 | Auth required (expected for protected endpoints) |
| 404 | Page not found (issue to fix) |
| 405 | Wrong HTTP method |
| 5xx | Server error (critical) |

### Priority Levels

| Level | Response Time | Example |
|-------|---------------|---------|
| Critical | Immediate | Core page 404 |
| High | 24h | Schema broken |
| Medium | 7 days | Missing meta |
| Low | Backlog | Content opportunity |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2025-12-18 | 1.0 | Initial system deployed |

---

*Last updated: 2025-12-18*
*Maintainer: Engineering Team*
