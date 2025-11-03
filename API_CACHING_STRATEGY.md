# API Caching Strategy - Fly2Any Platform
**Phase 3: Intelligent Caching & Performance Optimization**

---

## Executive Summary

This document outlines a comprehensive API caching strategy designed to:
- **Reduce API costs** by up to 85% through intelligent caching
- **Improve response times** from 2-5 seconds to <100ms for cached requests
- **Enhance user experience** with instant results for popular routes
- **Scale efficiently** to handle increased traffic without proportional cost increases

**Current State:**
- ✅ Redis infrastructure already in place
- ✅ Basic caching on flight search (5-15 min TTL)
- ✅ ML-powered cache TTL optimization
- ❌ Many API routes lack caching
- ❌ Inconsistent cache key generation
- ❌ No cache analytics/monitoring

**Target State:**
- ✅ All API routes cached appropriately
- ✅ Smart cache key generation with parameter normalization
- ✅ Stale-while-revalidate for popular routes
- ✅ Cache warming for trending destinations
- ✅ Real-time cache analytics dashboard

---

## API Endpoint Audit & Prioritization

### Category 1: High-Priority (Heavy Traffic, High API Cost)

#### 1. **Flight Search** (`/api/flights/search`)
- **Status:** ✅ Already cached (5-15 min ML-optimized TTL)
- **API Cost:** $0.04 per Amadeus call + Duffel API calls
- **Traffic:** ~70-80% of all API calls
- **Current TTL:** 5-15 minutes (ML-determined)
- **Cache Hit Rate:** ~70% estimated
- **Recommendation:** Already optimized with ML-powered TTL

#### 2. **Hotel Search** (`/api/hotels/search`)
- **Status:** ✅ Already cached (15 min TTL)
- **API Cost:** Commission-based (~$150 per booking)
- **Traffic:** ~10-15% of API calls
- **Current TTL:** 15 minutes (900 seconds)
- **Recommendation:** Good, consider stale-while-revalidate

#### 3. **Popular Routes** (`/api/popular-routes`)
- **Status:** ⚠️ Basic cache headers (5 min)
- **API Cost:** $0 (uses Postgres)
- **Traffic:** Homepage load on every visit
- **Current TTL:** 5 minutes
- **Recommendation:** Increase to 1 hour with stale-while-revalidate

#### 4. **Flash Deals** (`/api/flights/flash-deals-enhanced`)
- **Status:** ✅ Cached (30 min TTL)
- **API Cost:** Multiple Duffel API calls
- **Traffic:** Homepage load
- **Current TTL:** 30 minutes
- **Recommendation:** Good, consider background refresh at 25 min mark

#### 5. **Airport Autocomplete** (`/api/flights/airports`)
- **Status:** ❌ No caching
- **API Cost:** Amadeus API call
- **Traffic:** Every keystroke during search
- **Current TTL:** None
- **Recommendation:** Cache 24 hours (airport data rarely changes)

### Category 2: Medium-Priority (Moderate Traffic)

#### 6. **Cheapest Dates** (`/api/cheapest-dates`)
- **Status:** ⚠️ Basic cache headers (5 min)
- **API Cost:** $0 (uses cached data)
- **Traffic:** Calendar interactions
- **Current TTL:** 5 minutes
- **Recommendation:** Increase to 15 minutes

#### 7. **Hotel Featured** (`/api/hotels/featured-enhanced`)
- **Status:** ⚠️ Likely cached but needs verification
- **API Cost:** Multiple API calls
- **Traffic:** Homepage load
- **Recommendation:** 1 hour cache with background refresh

#### 8. **ML Analytics** (`/api/ml/analytics`)
- **Status:** ⚠️ Basic cache (5 min)
- **API Cost:** $0 (Redis reads)
- **Traffic:** Admin/dashboard usage
- **Current TTL:** 5 minutes
- **Recommendation:** Good for real-time data

### Category 3: Low-Priority (Static or Rarely Changing)

#### 9. **Destination Enhanced** (`/api/flights/destinations-enhanced`)
- **API Cost:** $0 (static data)
- **Traffic:** Homepage load
- **Recommendation:** 24 hours cache

#### 10. **Hotels Cities** (`/api/hotels/cities`)
- **API Cost:** Low
- **Traffic:** Location search
- **Recommendation:** 24 hours cache

---

## Recommended TTL Values by Endpoint Type

### Flight-Related APIs

| Endpoint | Current TTL | Recommended TTL | Rationale |
|----------|------------|-----------------|-----------|
| Flight Search | 5-15 min (ML) | Keep current | ML-optimized based on route volatility |
| Flight Details | None | 5 minutes | Flight details change (seat availability) |
| Airports | None | 24 hours | Airport data static |
| Flash Deals | 30 min | 30 min + SWR | Time-sensitive deals |
| Cheapest Dates | 5 min | 15 minutes | Aggregated cached data |
| Branded Fares | None | 10 minutes | Fare rules stable short-term |
| Seat Maps | None | 15 minutes | Availability changes but not rapidly |

### Hotel-Related APIs

| Endpoint | Current TTL | Recommended TTL | Rationale |
|----------|------------|-----------------|-----------|
| Hotel Search | 15 min | 15 min + SWR | Availability changes moderately |
| Hotel Details | None | 30 minutes | Hotel info relatively static |
| Hotel Featured | Unknown | 1 hour + SWR | Curated list, changes slowly |
| Hotel Suggestions | Unknown | 1 hour | Recommendation list stable |

### Analytics & Static Data

| Endpoint | Current TTL | Recommended TTL | Rationale |
|----------|------------|-----------------|-----------|
| Popular Routes | 5 min | 1 hour + SWR | Changes slowly, geo-based |
| ML Analytics | 5 min | 5 minutes | Real-time monitoring data |
| Destinations | Unknown | 24 hours | Static marketing content |
| Airlines/Cities | Unknown | 24 hours | Reference data |

### Transactional (No Cache)

- Bookings (POST/GET)
- Payments
- Order modifications
- Cancellations
- Webhooks

---

## Cache Key Strategy

### Principles

1. **Deterministic:** Same inputs = same cache key
2. **Collision-Free:** Different inputs = different keys
3. **Readable:** Keys include semantic information
4. **Versionable:** Include cache version for busting

### Cache Key Patterns

```typescript
// Pattern: {namespace}:{version}:{resource}:{normalized-params-hash}

// Flight search
flight:v2:search:JFK:LAX:2025-11-15:2025-11-22:1:0:0:ECONOMY:USD

// Hotel search
hotel:v1:search:lat=40.7128:lng=-74.0060:2025-12-01:2025-12-05:2:USD

// Popular routes (geo-based)
routes:v1:popular:region=US-East:limit=8

// Airport autocomplete
airport:v1:search:keyword=new:york

// Static data
static:v1:airports:all
static:v1:airlines:all
```

### Parameter Normalization

**Problem:** Different parameter orders create different keys
```
{origin: "JFK", dest: "LAX"} !== {dest: "LAX", origin: "JFK"}
```

**Solution:** Sort parameters alphabetically before hashing
```typescript
// Before: origin=JFK&dest=LAX (hash: abc123)
// Before: dest=LAX&origin=JFK (hash: xyz789)

// After normalization: dest=LAX&origin=JFK (hash: abc123)
// After normalization: dest=LAX&origin=JFK (hash: abc123) ✓
```

---

## Cache Invalidation Strategy

### Time-Based Expiration (Primary)

- TTL expiration handles most cases automatically
- ML-optimized TTLs for volatile routes
- Seasonal adjustments (holidays = shorter TTL)

### Event-Based Invalidation (Secondary)

**Trigger scenarios:**
1. **Price drops detected** → Invalidate route cache
2. **New deals published** → Invalidate flash deals
3. **User booking** → Invalidate specific flight availability
4. **Admin content update** → Invalidate static content cache

**Implementation:**
```typescript
// Invalidate specific route
await deleteCache(`flight:v2:search:JFK:LAX:*`);

// Invalidate all flash deals
await deleteCachePattern(`deals:v1:flash:*`);

// Invalidate user-specific cache
await deleteCache(`user:${userId}:bookings`);
```

### Manual Purge (Admin)

- Admin dashboard with cache purge controls
- Specific pattern matching for surgical invalidation
- Full cache flush option (emergency only)

---

## Stale-While-Revalidate (SWR) Strategy

### What is SWR?

Serve stale content immediately while fetching fresh data in background.

**Benefits:**
- ⚡ Instant response to users (serve stale)
- 📊 Fresh data next time (background refresh)
- 🚀 Reduces perceived latency
- 💰 Saves API costs (fewer real-time calls)

### SWR Implementation

```typescript
Cache-Control: max-age=900, stale-while-revalidate=1800

// Breakdown:
// - Fresh for 15 minutes (max-age=900)
// - Stale but usable for 30 additional minutes (SWR=1800)
// - Total cache lifetime: 45 minutes
```

### SWR by Endpoint Type

| Endpoint Type | max-age | stale-while-revalidate | Total Window |
|---------------|---------|------------------------|--------------|
| Flight Search | 5-15 min | 15 min | 20-30 min |
| Hotel Search | 15 min | 30 min | 45 min |
| Popular Routes | 1 hour | 2 hours | 3 hours |
| Flash Deals | 30 min | 30 min | 1 hour |
| Static Data | 24 hours | 7 days | ~1 month |

---

## Cache Warming Strategy

### Proactive Caching for Popular Routes

**Goal:** Pre-fill cache with data for high-traffic routes before users request it.

#### Popular Route Detection

Use analytics to identify trending routes:
```sql
SELECT route, origin, destination, searches_7d
FROM route_statistics
WHERE searches_7d > 10
ORDER BY searches_7d DESC
LIMIT 100;
```

#### Cache Warming Schedule

**Time:** Run during low-traffic hours (2-4 AM UTC)

**Process:**
1. Identify top 100 routes from past 7 days
2. For each route:
   - Generate cache keys for next 30 days
   - Check if cache exists
   - If missing or expiring soon, fetch fresh data
   - Store with optimal TTL

**Frequency:**
- Popular routes: Daily
- Trending routes: Every 6 hours
- Seasonal routes: Weekly

#### Implementation

```typescript
// Pseudo-code for cache warmer cron job
async function warmPopularRoutes() {
  const popularRoutes = await getPopularRoutes(100);

  for (const route of popularRoutes) {
    const { origin, destination } = route;

    // Warm next 30 days
    for (let days = 0; days < 30; days++) {
      const departureDate = addDays(new Date(), days);
      const cacheKey = generateFlightSearchKey({
        origin,
        destination,
        departureDate: format(departureDate, 'yyyy-MM-dd'),
        adults: 1,
        // ... standard params
      });

      const cached = await getCached(cacheKey);

      // Only warm if cache missing or expiring soon (< 20% TTL remaining)
      if (!cached || isExpiringSoon(cacheKey)) {
        await fetchAndCacheFlights({
          origin,
          destination,
          departureDate,
          adults: 1,
        });
      }
    }
  }
}
```

---

## Cache Hit Rate Projections

### Current Performance Baseline

| Metric | Current Value |
|--------|---------------|
| Total API Calls | ~10,000/day |
| Cached Endpoints | 2 of 80+ |
| Estimated Cache Hit Rate | ~30% |
| Monthly API Cost | ~$400 |

### Optimized Performance (Target)

| Metric | Optimized Value | Improvement |
|--------|-----------------|-------------|
| Total API Calls | 10,000/day (same) | - |
| Cached Endpoints | 15 of 20 critical | +650% |
| Estimated Cache Hit Rate | **75-80%** | +150% |
| Monthly API Cost | **$60-80** | **-80% to -85%** |

### Hit Rate by Endpoint (Projected)

| Endpoint | Projected Hit Rate | Rationale |
|----------|-------------------|-----------|
| Flight Search | 75% | Popular routes cached + SWR |
| Hotel Search | 60% | More variable parameters |
| Popular Routes | 95% | Rarely changes, long TTL |
| Flash Deals | 85% | 30-min refresh cycle |
| Airports | 98% | Static data, 24h TTL |
| Cheapest Dates | 90% | Aggregated cached data |
| Static Content | 99% | Almost never changes |

### Hit Rate Factors

**Positive Factors:**
- Route popularity (top 100 routes = 80% traffic)
- Time-based patterns (peak hours = more hits)
- Cache warming (proactive population)
- SWR (extended cache lifetime)

**Negative Factors:**
- First-time routes (always miss)
- Parameter variations (cabin class, passengers)
- Cache expiration cycles
- Peak demand surges

---

## Cache Analytics & Monitoring

### Key Metrics to Track

1. **Cache Hit Rate:**
   - Overall hit rate %
   - Hit rate by endpoint
   - Hit rate by time of day
   - Hit rate by route popularity

2. **Cache Performance:**
   - Average response time (cached vs uncached)
   - Cache read latency
   - Cache write latency
   - Cache size / memory usage

3. **Cost Savings:**
   - API calls saved
   - Dollar savings per day/month
   - Cost per search (with vs without cache)
   - ROI on caching infrastructure

4. **Cache Health:**
   - Cache eviction rate
   - Cache miss patterns
   - Stale cache serves
   - Cache errors/timeouts

### Dashboard Widgets

```
┌─────────────────────────────────────────────────┐
│ Cache Performance - Last 24 Hours              │
├─────────────────────────────────────────────────┤
│ Hit Rate:  78.4% ▲ +2.1%                       │
│ Avg Latency: 45ms (cached) vs 2.8s (uncached) │
│ API Calls Saved: 8,432 (-76%)                  │
│ Cost Savings: $337.28/day                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Top Performing Routes (by hit rate)            │
├─────────────────────────────────────────────────┤
│ JFK → LAX:  94% (123 searches)                 │
│ LAX → JFK:  92% (118 searches)                 │
│ ORD → DEN:  89% (87 searches)                  │
│ MIA → JFK:  86% (76 searches)                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Cache Miss Analysis                             │
├─────────────────────────────────────────────────┤
│ First-time routes: 45% of misses              │
│ Expired cache: 32% of misses                  │
│ Rare param combos: 18% of misses              │
│ Cache errors: 5% of misses                    │
└─────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1) ✓ COMPLETE
- ✅ Redis infrastructure setup
- ✅ Basic cache helpers (get/set/delete)
- ✅ Flight search caching with ML TTL

### Phase 2: Smart Keys & Middleware (Week 2) 🔵 IN PROGRESS
- Create smart cache key generator
- Build reusable cache middleware
- Implement parameter normalization
- Add cache versioning support

### Phase 3: Expand Coverage (Week 3)
- Add caching to top 15 endpoints
- Implement SWR headers
- Set up cache analytics tracking
- Create cache warming jobs

### Phase 4: Optimization (Week 4)
- Build admin cache dashboard
- Implement event-based invalidation
- Fine-tune TTL values based on data
- Set up monitoring alerts

### Phase 5: Scale & Monitor (Ongoing)
- Monitor cache hit rates
- Adjust TTLs based on performance
- Expand cache warming to more routes
- Optimize for seasonal patterns

---

## Cost-Benefit Analysis

### Current Costs (Without Optimization)

```
Monthly API calls: ~300,000
Amadeus cost: $0.04/call
Monthly cost: 300,000 × $0.04 = $12,000
Annual cost: $144,000
```

### Optimized Costs (With 80% Cache Hit Rate)

```
Monthly API calls: 300,000
Cached (80%): 240,000 (cost: $0)
API calls (20%): 60,000
Amadeus cost: 60,000 × $0.04 = $2,400
Monthly cost: $2,400
Annual cost: $28,800

Monthly savings: $9,600
Annual savings: $115,200
ROI: Infinite (caching is free with existing Redis)
```

### Additional Benefits

- **User Experience:** 2-5s → <100ms response time
- **Scalability:** Handle 10x traffic with same infrastructure
- **Reliability:** Serve stale data if APIs are down
- **Business:** Better conversion rates with faster searches

---

## Risk Mitigation

### Stale Data Risks

**Risk:** Users see outdated prices/availability

**Mitigation:**
- Short TTLs for volatile routes (5 min)
- Display cache timestamp to users
- "Refresh" button for manual updates
- Background revalidation with SWR

### Cache Stampede

**Risk:** Cache expires → 100 simultaneous API calls

**Mitigation:**
- Request deduplication (already implemented)
- Stale-while-revalidate (serve stale while one refreshes)
- Cache locking (first request refreshes, others wait)

### Memory Pressure

**Risk:** Redis runs out of memory

**Mitigation:**
- Monitor Redis memory usage
- Set max memory policy (evict LRU)
- Implement cache size limits per namespace
- Regular cache cleanup jobs

### Cache Poisoning

**Risk:** Bad data cached for extended periods

**Mitigation:**
- Validate data before caching
- Shorter TTLs for high-stakes data
- Manual purge capability
- Error response caching (shorter TTL)

---

## Success Metrics

### Target KPIs (3 Months)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cache Hit Rate | 75%+ | Redis analytics |
| Avg Response Time | <200ms | Application logs |
| API Cost Reduction | 80%+ | Billing comparison |
| User Satisfaction | +15% | NPS surveys |
| System Uptime | 99.9% | Monitoring tools |

### Weekly Review Checklist

- [ ] Review cache hit rates by endpoint
- [ ] Identify top cache misses
- [ ] Check Redis memory usage
- [ ] Analyze cost savings vs. baseline
- [ ] Review error rates / cache failures
- [ ] Adjust TTLs based on data
- [ ] Update cache warming jobs

---

## Conclusion

This caching strategy provides a comprehensive roadmap to:
- **Reduce API costs by 80-85%** through intelligent caching
- **Improve performance** with <100ms cached responses
- **Scale efficiently** to handle growing traffic
- **Enhance UX** with instant results for popular searches

**Next Steps:**
1. Implement smart cache keys (lib/cache/smart-keys.ts)
2. Create cache middleware (lib/cache/middleware.ts)
3. Apply caching to top 15 endpoints
4. Build cache analytics dashboard
5. Monitor and optimize based on real data

**Success depends on:**
- Consistent cache key generation
- Appropriate TTL values per endpoint type
- Proactive cache warming for popular routes
- Real-time monitoring and adjustment
