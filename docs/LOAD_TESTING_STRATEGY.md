# Load & Chaos Testing Strategy for Quote Save Hardening

## Objective

Validate the hardened quote save endpoints under high concurrency and simulated failure conditions to ensure:
- No data corruption
- No unhandled promise rejections
- No silent failures
- Error rate matches expectations
- Performance targets met (P95 < 500ms, P99 < 1s)

---

## Test Environment

### Requirements
- Node.js 18+
- Test database (SQLite for speed, or test Postgres instance)
- Load testing tool: `k6` or `artillery`

### Setup

```bash
# Install k6 for load testing
npm install -g k6

# Run test database
npx prisma db push

# Start API server
npm run dev
```

---

## Load Test Scenarios

### SCENARIO 1: Baseline Load Test
**Goal**: Establish performance baseline

**Configuration**:
- Duration: 60 seconds
- Target RPS: 100 requests/second
- Total requests: 6,000
- Quote operations: 80% PATCH, 20% POST

**Expected Results**:
- Success rate: > 99%
- P95 latency: < 500ms
- P99 latency: < 1000ms
- Error rate: < 1%
- Quote conflicts: < 0.1%

**k6 Script**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let options = {
  vus: 100,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000/api/agents/quotes';

export default function() {
  // 20% POST requests
  if (Math.random() < 0.2) {
    const payload = JSON.stringify({
      clientId: 'test-client-id',
      tripName: `Load Test Trip ${__VU}`,
      destination: 'Paris',
      startDate: '2026-02-01T10:00:00Z',
      endDate: '2026-02-05T10:00:00Z',
      adults: 2,
      children: 0,
      infants: 0,
      flights: [],
      hotels: [],
      activities: [],
      agentMarkupPercent: 15,
      discount: 0,
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(`${BASE_URL}`, payload, params);

    check(res, {
      'POST status is 201': (r) => r.status === 201,
      'POST has correlationId': (r) => r.json('success') !== undefined || r.json('correlationId') !== undefined,
    });
  }
  // 80% PATCH requests
  else {
    const quoteId = `test-quote-${__VU}`;
    const payload = JSON.stringify({
      version: Math.floor(Math.random() * 10) + 1, // Random version (some conflicts)
      tripName: `Update ${__ITER}`,
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
    };

    const res = http.patch(`${BASE_URL}/${quoteId}`, payload, params);

    check(res, {
      'PATCH status is 200 or 409': (r) => r.status === 200 || r.status === 409,
      'PATCH has correlationId': (r) => r.json('success') !== undefined || r.json('correlationId') !== undefined,
      'PATCH error has severity': (r) => r.json('severity') !== undefined,
    });
  }

  sleep(1);
}
```

---

### SCENARIO 2: Concurrent PATCH Stress Test
**Goal**: Validate optimistic locking under high concurrency

**Configuration**:
- Duration: 30 seconds
- Target RPS: 500 requests/second
- Total requests: 15,000
- Quote operations: 100% PATCH (same quote ID)
- Version conflicts: Expected 10-20%

**Expected Results**:
- Success rate: ~90% (due to conflicts)
- Conflict rate: 10-20% (as designed)
- No data corruption
- No duplicate version increments

**Validation**:
```bash
# After test, verify quote version
SELECT id, version, tripName, lastModifiedAt 
FROM AgentQuote 
WHERE id = 'test-quote-id';

# Expected: version incremented correctly
# Expected: tripName matches last successful update
```

---

### SCENARIO 3: Database Failure Injection
**Goal**: Validate atomic rollback on failures

**Configuration**:
- Duration: 30 seconds
- Target RPS: 50 requests/second
- Total requests: 1,500
- Failure injection: 5% of requests (mock Prisma P2002 error)
- Quote operations: Mix of POST and PATCH

**Expected Results**:
- All failed requests return QUOTE_PERSISTENCE_FAILED
- No partial updates in database
- Quote data remains consistent
- Error correlation IDs tracked

**k6 Script with Chaos**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 50,
  duration: '30s',
};

const BASE_URL = 'http://localhost:3000/api/agents/quotes';

export default function() {
  const shouldFail = Math.random() < 0.05; // 5% failure rate
  
  const payload = JSON.stringify({
    clientId: 'test-client-id',
    tripName: shouldFail ? 'Force Failure' : 'Success Test',
    destination: 'Paris',
    startDate: '2026-02-01T10:00:00Z',
    endDate: '2026-02-05T10:00:00Z',
    adults: 2,
    children: 0,
    infants: 0,
    flights: [],
    hotels: [],
    activities: [],
  });

  const params = {
    headers: { 
      'Content-Type': 'application/json',
      'X-Chaos-Failure': shouldFail ? 'true' : 'false',
    },
  };

  const res = http.post(`${BASE_URL}`, payload, params);

  if (shouldFail) {
    check(res, {
      'Forced failure returns QUOTE_PERSISTENCE_FAILED': (r) => {
        if (r.status === 500) {
          const body = r.json();
          return body.errorCode === 'QUOTE_PERSISTENCE_FAILED';
        }
        return false;
      },
    });
  } else {
    check(res, {
      'Success request returns 201': (r) => r.status === 201,
      'Success has quoteId': (r) => r.json('quoteId') !== undefined,
    });
  }

  sleep(1);
}
```

---

### SCENARIO 4: State Transition Violation Test
**Goal**: Validate state validation blocks invalid operations

**Configuration**:
- Duration: 30 seconds
- Target RPS: 100 requests/second
- Total requests: 3,000
- Test cases:
  - 50% PATCH to SENT quotes (should fail)
  - 50% PATCH to DRAFT quotes (should succeed)

**Expected Results**:
- SENT quote PATCHes return QUOTE_ALREADY_SENT (CRITICAL)
- DRAFT quote PATCHes return 200
- Success rate: ~50% (by design)
- All failures have severity: CRITICAL

**k6 Script**:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,
  duration: '30s',
};

const BASE_URL = 'http://localhost:3000/api/agents/quotes';

export default function() {
  const isSentQuote = Math.random() < 0.5;
  const quoteId = isSentQuote ? 'sent-quote-id' : 'draft-quote-id';
  
  const payload = JSON.stringify({
    version: 1,
    tripName: `Test Update ${__ITER}`,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.patch(`${BASE_URL}/${quoteId}`, payload, params);

  if (isSentQuote) {
    check(res, {
      'PATCH SENT quote fails': (r) => r.status !== 200,
      'SENT quote error is QUOTE_ALREADY_SENT': (r) => {
        if (r.status === 500) {
          const body = r.json();
          return body.errorCode === 'QUOTE_ALREADY_SENT';
        }
        return false;
      },
      'SENT quote error severity is CRITICAL': (r) => {
        if (r.status === 500) {
          const body = r.json();
          return body.severity === 'CRITICAL';
        }
        return false;
      },
    });
  } else {
    check(res, {
      'PATCH DRAFT quote succeeds': (r) => r.status === 200,
      'DRAFT quote has updated version': (r) => {
        if (r.status === 200) {
          const body = r.json();
          return body.version === 2;
        }
        return false;
      },
    });
  }

  sleep(1);
}
```

---

## Chaos Testing

### Failure Injection Points

1. **Database Timeout**
   - Mock P2034 error
   - Validate DATABASE_TIMEOUT error returned
   - Validate retryable: true

2. **Unique Constraint Violation**
   - Mock P2002 error
   - Validate QUOTE_PERSISTENCE_FAILED error returned
   - Validate atomic rollback

3. **Foreign Key Violation**
   - Mock P2003 error
   - Validate QUOTE_PERSISTENCE_FAILED error returned
   - Validate no partial updates

4. **Network Timeout**
   - Set request timeout to 5s
   - Validate graceful failure
   - Validate error logged

---

## Validation & Success Criteria

### Performance Targets

| Metric | Target | Pass/Fail |
|--------|---------|------------|
| Success rate | > 99% | PASS if ≥ 99% |
| P95 latency | < 500ms | PASS if ≤ 500ms |
| P99 latency | < 1000ms | PASS if ≤ 1000ms |
| Error rate | < 1% | PASS if ≤ 1% |
| Conflict rate | < 0.1% | PASS if ≤ 0.1% |
| Rollback rate | < 0.5% | PASS if ≤ 0.5% |

### Data Integrity Validation

```bash
# Run after all load tests
npx prisma studio

# Manual verification:
# 1. No duplicate version numbers
# 2. No orphaned quotes (deletedAt = null, but status = CANCELLED)
# 3. No quotes with NULL version
# 4. No quotes with NULL lastModifiedAt
# 5. Pricing consistency (subtotal = sum of items)
```

### Observability Validation

```bash
# Check logs
grep "quote_operation_complete" logs/app.log | wc -l
# Expected: >= total requests

# Check for correlation IDs
grep "correlationId" logs/app.log | wc -l
# Expected: 100% of requests

# Check for error codes
grep "errorCode" logs/app.log | jq -r '.errorCode' | sort | uniq -c | sort -rn
# Expected: Top errors match expected rates
```

---

## Execution Commands

```bash
# 1. Run baseline load test
k6 run tests/load/baseline-load-test.js

# 2. Run concurrent PATCH stress test
k6 run tests/load/concurrent-patch-test.js

# 3. Run chaos test
k6 run tests/load/chaos-failure-test.js

# 4. Run state transition test
k6 run tests/load/state-transition-test.js

# 5. Generate report
k6 run tests/load/baseline-load-test.js --out json=results.json
```

---

## Expected Report

```json
{
  "test_name": "Quote Save Load Test",
  "timestamp": "2026-01-24T09:00:00Z",
  "duration_seconds": 60,
  "total_requests": 6000,
  "success_rate": 99.5,
  "p95_latency_ms": 450,
  "p99_latency_ms": 890,
  "error_rate": 0.5,
  "conflict_rate": 0.08,
  "rollback_rate": 0.3,
  "errors_by_code": {
    "QUOTE_CONFLICT_VERSION": 5,
    "QUOTE_VALIDATION_FAILED": 3,
    "DATABASE_TIMEOUT": 1
  },
  "data_integrity_check": "PASS",
  "correlation_id_coverage": 100
}
```

---

## Failure Conditions

**GO/NO-GO Decision**:

**GO** (Deploy to production):
- ✅ All performance targets met
- ✅ Data integrity check passes
- ✅ No unhandled exceptions
- ✅ 100% correlation ID coverage
- ✅ Error rates within acceptable range

**NO-GO** (Fix before deployment):
- ❌ Any performance target missed
- ❌ Data integrity check fails
- ❌ Unhandled exceptions detected
- ❌ Missing correlation IDs
- ❌ Error rates exceed thresholds

---

**Document Version**: 1.0
**Author**: Principal Reliability Engineer
**Date**: January 24, 2026