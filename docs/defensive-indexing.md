# Fly2Any Defensive Indexing Strategy

## Purpose
Protect valuable indexed pages, prevent index bloat, and maintain search authority.
Define clear rules for what enters and exits the Google index.

---

## 1. PROTECTED PAGES (MUST STAY INDEXED)

### Tier 1: Critical (Never De-index)
| Page Type | Pattern | Monthly Traffic | Action |
|-----------|---------|-----------------|--------|
| Homepage | `/` | Core | Protected |
| Route hubs | `/flights/[route]` (top 100) | High | Protected |
| Destinations | `/destinations/[city]` | Medium | Protected |
| Airlines | `/airlines/[code]` | Medium | Protected |
| Product landing | `/flights`, `/hotels` | High | Protected |

### Tier 2: Important (De-index with approval)
| Page Type | Pattern | Condition |
|-----------|---------|-----------|
| Long-tail routes | `/flights/[route]` | Keep if traffic > 0 |
| Blog articles | `/blog/[slug]` | Keep if engagement > 0 |
| Travel guides | `/travel-guide/*` | Keep if valuable |
| Event pages | `/world-cup-2026/*` | Until 2026-08-31 |

### Protection Mechanisms
```typescript
// Critical pages CANNOT be de-indexed programmatically
const PROTECTED_PATTERNS = [
  /^\/$/, // Homepage
  /^\/flights$/, // Flights landing
  /^\/hotels$/, // Hotels landing
  /^\/flights\/[a-z]{3}-to-[a-z]{3}$/, // Top routes
  /^\/destinations\//, // All destinations
  /^\/airlines\//, // All airlines
];

function canDeindex(path: string): boolean {
  return !PROTECTED_PATTERNS.some(p => p.test(path));
}
```

---

## 2. PAGES THAT MUST NEVER BE INDEXED

### Permanent Noindex
| Pattern | Reason |
|---------|--------|
| `/api/*` | API endpoints |
| `/admin/*` | Internal admin |
| `/account/*` | User private data |
| `/auth/*` | Auth flows |
| `/booking/*` | Booking process |
| `/checkout/*` | Payment flow |
| `/flights/results*` | Dynamic search results |
| `?preview=*` | Preview mode |
| `/verify-upload/*` | Temporary tokens |

### Implementation
```typescript
// robots.txt
Disallow: /api/
Disallow: /admin/
Disallow: /account/
Disallow: /auth/
Disallow: /booking/
Disallow: /checkout/
Disallow: /flights/results

// Page-level (fallback)
export const metadata = {
  robots: { index: false, follow: false }
};
```

---

## 3. SEASONAL INDEXING LOGIC

### Event Pages
```typescript
const SEASONAL_PAGES = {
  'world-cup-2026': {
    indexStart: '2025-06-01',
    indexEnd: '2026-08-31',
    afterAction: 'redirect', // → /flights
  },
  'christmas-travel': {
    indexStart: 'October 1',
    indexEnd: 'January 15',
    afterAction: 'noindex-keep', // Keep page, remove from index
    recurring: true,
  },
  'spring-break': {
    indexStart: 'February 1',
    indexEnd: 'April 15',
    afterAction: 'noindex-keep',
    recurring: true,
  },
};
```

### Seasonal Decision Tree
```
Is within active period? → Index
Is past end date + 30 days? → Execute afterAction
Is recurring? → Prepare for next year
Is one-time event? → Redirect or archive
```

---

## 4. INVENTORY-AWARE INDEXING

### Route Page Logic
```typescript
function getRouteIndexingStatus(route: RouteData): IndexingDecision {
  // No inventory for extended period
  if (!route.hasInventory) {
    const daysSinceInventory = getDaysSince(route.lastInventoryDate);

    if (daysSinceInventory > 180) {
      return { index: false, reason: 'No inventory 180+ days' };
    }

    if (daysSinceInventory > 90) {
      return { index: true, removeOffer: true, reason: 'Stale inventory' };
    }
  }

  // Has current inventory
  return { index: true, removeOffer: false };
}
```

### Inventory States
| State | Duration | Index | Offer Schema |
|-------|----------|-------|--------------|
| Has inventory | Current | ✅ | ✅ |
| No inventory | < 90 days | ✅ | ❌ |
| No inventory | 90-180 days | ✅ (review) | ❌ |
| No inventory | > 180 days | ❌ | ❌ |
| Route deprecated | Permanent | ❌ → Redirect | ❌ |

---

## 5. EMERGENCY SEO KILL SWITCH

### Activation Triggers
1. **Google Manual Action** - Immediate response
2. **Algorithmic Penalty** - Traffic drop > 50% in 7 days
3. **Schema Spam** - Offer schema without inventory
4. **Legal Request** - DMCA, compliance
5. **Security Breach** - Malware injection detected

### Kill Switch Implementation
```typescript
// lib/seo/kill-switch.ts
export async function activateKillSwitch(
  scope: 'page' | 'section' | 'site',
  target: string,
  reason: string
): Promise<void> {
  switch (scope) {
    case 'page':
      // Add noindex to specific page
      await setPageNoindex(target, reason);
      break;
    case 'section':
      // Add noindex to all pages matching pattern
      await setSectionNoindex(target, reason);
      break;
    case 'site':
      // Emergency: Block all crawling
      await activateSiteWideBlock(reason);
      alertTeam('CRITICAL: Site-wide SEO kill switch activated');
      break;
  }

  // Log action
  await logSEOAction('kill-switch', { scope, target, reason });
}
```

### Recovery Process
```
1. Identify root cause
2. Fix underlying issue
3. Remove kill switch
4. Submit affected URLs to GSC
5. Monitor recovery (30 days)
6. Post-mortem documentation
```

---

## 6. INDEX BLOAT PREVENTION

### Maximum Page Limits
| Page Type | Max Pages | Current | Action |
|-----------|-----------|---------|--------|
| Route pages | 10,000 | ~8,350 | Monitor |
| Destination pages | 500 | ~150 | OK |
| Airline pages | 100 | ~50 | OK |
| Blog posts | 500 | TBD | Monitor |

### Bloat Detection
```typescript
// Monthly audit
async function detectIndexBloat(): Promise<BloatReport> {
  const indexed = await getGSCIndexedCount();
  const expected = await getExpectedPageCount();

  if (indexed > expected * 1.2) {
    return {
      status: 'bloat',
      excess: indexed - expected,
      action: 'audit-required'
    };
  }

  return { status: 'healthy' };
}
```

---

## 7. REDIRECT STRATEGY

### Redirect Rules
| Scenario | Redirect Type | Example |
|----------|---------------|---------|
| Route deprecated | 301 | /flights/abc-xyz → /flights |
| City renamed | 301 | /destinations/old → /destinations/new |
| Page merged | 301 | /page-a → /page-b |
| Temporary issue | 302 | /page → /maintenance |
| URL structure change | 301 | /old-path → /new-path |

### Redirect Limits
- Max redirect chain: 2 hops
- Redirect loops: Block publication
- Orphan redirects: Audit monthly

---

## 8. AUDIT SCHEDULE

### Daily (Automated)
- [ ] Sitemap generation successful
- [ ] robots.txt accessible
- [ ] No 5xx errors on key pages

### Weekly
- [ ] GSC coverage report
- [ ] New soft 404s
- [ ] Index coverage changes

### Monthly
- [ ] Full crawl audit
- [ ] Page count vs indexed
- [ ] Redirect chain check
- [ ] Schema validation

### Quarterly
- [ ] Governance doc review
- [ ] Kill switch test
- [ ] Recovery drill

---

## VERSION
- Created: 2025-12-23
- Owner: SEO Platform Engineering
- Review: Monthly
