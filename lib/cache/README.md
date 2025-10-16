# Redis Caching Infrastructure

This directory contains the Redis caching infrastructure for the Fly2Any platform using **Upstash Redis**.

## Overview

The caching system is designed to:
- Cache flight search results for 15 minutes (900 seconds)
- Reduce Amadeus API calls (expensive + slow)
- Improve response times for repeated searches
- Gracefully degrade when Redis is unavailable
- Track cache performance metrics

## Architecture

### Files

1. **`redis.ts`** - Redis client initialization
   - Connects to Upstash Redis using REST API
   - Falls back gracefully when credentials are missing
   - Provides health check functionality

2. **`helpers.ts`** - Cache utility functions
   - `getCached<T>(key)` - Retrieve cached data
   - `setCache(key, value, ttl)` - Store data with TTL
   - `deleteCache(key)` - Remove specific cache entry
   - `deleteCachePattern(pattern)` - Remove multiple entries by pattern
   - `generateCacheKey(prefix, params)` - Generate deterministic cache keys
   - `cacheAside<T>(key, fetcher, ttl)` - Cache-aside pattern wrapper
   - `getCacheStats()` - Get cache performance metrics

3. **`keys.ts`** - Cache key generation
   - `generateFlightSearchKey(params)` - Flight search cache keys
   - `generateHotelSearchKey(params)` - Hotel search cache keys
   - `getFlightSearchPattern()` - Pattern for clearing flight caches
   - `getRoutePattern(origin, destination)` - Pattern for specific routes

4. **`index.ts`** - Main entry point
   - Exports all cache utilities for easy importing

## Setup Instructions

### 1. Create Upstash Redis Instance

1. Go to [https://upstash.com/](https://upstash.com/)
2. Sign up for a free account (10,000 requests/day)
3. Create a new Redis database (Global or Regional)
4. Copy your credentials:
   - REST URL: `https://your-instance.upstash.io`
   - REST Token: `your_token_here`

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Redis Cache (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

### 3. Install Dependencies

Already installed via:
```bash
npm install @upstash/redis
```

## Usage Examples

### Basic Cache Operations

```typescript
import { getCached, setCache, deleteCache } from '@/lib/cache';

// Get from cache
const data = await getCached<FlightData>('flights:NYC:LAX');

// Set cache with 15 min TTL
await setCache('flights:NYC:LAX', flightData, 900);

// Delete from cache
await deleteCache('flights:NYC:LAX');
```

### Cache-Aside Pattern

```typescript
import { cacheAside } from '@/lib/cache';

const flights = await cacheAside(
  'flights:search:hash123',
  async () => {
    // This only runs on cache miss
    return await amadeusAPI.searchFlights(params);
  },
  900 // 15 minutes TTL
);
```

### Flight Search Integration

The flight search API (`/api/flights/search`) automatically uses caching:

```typescript
import { generateFlightSearchKey, getCached, setCache } from '@/lib/cache';

// Generate cache key from search params
const cacheKey = generateFlightSearchKey(flightSearchParams);

// Try cache first
const cached = await getCached(cacheKey);
if (cached) {
  return cached; // Cache hit
}

// Cache miss - fetch from API
const results = await amadeusAPI.searchFlights(params);

// Store in cache
await setCache(cacheKey, results, 900);
```

## Cache Key Format

### Flight Searches
```
flight:search:{ORIGIN}:{DESTINATION}:{DEPARTURE}:{RETURN}:{ADULTS}:{CHILDREN}:{INFANTS}:{CLASS}:{NONSTOP}:{CURRENCY}
```

Example:
```
flight:search:JFK:LAX:2025-10-15:oneway:2:0:0:ECONOMY:any:USD
```

### Hotel Searches
```
hotel:search:{CITY}:{CHECKIN}:{CHECKOUT}:{ADULTS}:{ROOMS}
```

## Performance Monitoring

### Cache Statistics Endpoint

```
GET /api/cache/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "hits": 150,
    "misses": 45,
    "errors": 2,
    "sets": 45,
    "hitRate": "76.92%",
    "enabled": true
  },
  "timestamp": "2025-10-03T19:00:00.000Z"
}
```

### Console Logging

The cache system logs all operations:
- `<¯ Cache HIT: {key}` - Successful cache retrieval
- `L Cache MISS: {key}` - Cache miss, fetching from API
- `=¾ Cache SET: {key} (TTL: 900s)` - Data stored in cache
- `=Ñ  Cache DELETE: {key}` - Cache entry removed

## Error Handling

The cache system is designed to **never break** your application:

1. **Missing Credentials**: Falls back to no caching (direct API calls)
2. **Redis Connection Failed**: Logs error, continues without cache
3. **Cache Read Failed**: Returns `null`, fetches from API
4. **Cache Write Failed**: Logs error, response still works

All cache errors are logged but never thrown.

## Cache TTL Strategy

| Data Type | TTL | Reason |
|-----------|-----|--------|
| Flight searches | 900s (15 min) | Prices change frequently |
| Empty results | 300s (5 min) | Retry sooner for failed searches |
| Hotel searches | 900s (15 min) | Similar to flights |
| Static data | 3600s (1 hour) | Rarely changes |

## Testing

### Manual Testing

1. **Test Cache Miss** (first search):
```bash
curl -X POST http://localhost:3000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-11-15",
    "adults": 1
  }'
```

Check response headers:
- `X-Cache-Status: MISS`

2. **Test Cache Hit** (repeat same search):
```bash
# Same request as above
```

Check response headers:
- `X-Cache-Status: HIT`
- Response should be faster (~50-100ms vs 1-3 seconds)

3. **Test Cache Stats**:
```bash
curl http://localhost:3000/api/cache/stats
```

### Local Development (Without Redis)

The system works fine without Redis credentials:
- All cache operations return `null` or no-op
- API calls go directly to Amadeus
- Console logs: `   Redis not configured - caching disabled`

## Production Deployment

### Vercel Deployment

1. Add environment variables in Vercel dashboard:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

2. Deploy normally:
```bash
vercel deploy
```

3. Verify caching works:
```bash
curl -I https://fly2any.com/api/flights/search -X POST -d '{...}'
# Check X-Cache-Status header
```

## Best Practices

1. **Always use cache key generators** from `keys.ts`
2. **Don't cache user-specific data** (bookings, profiles)
3. **Set appropriate TTLs** based on data volatility
4. **Monitor cache hit rates** via `/api/cache/stats`
5. **Clear caches when needed**:
   ```typescript
   // Clear all flight searches
   await deleteCachePattern('flight:search:*');

   // Clear specific route
   await deleteCachePattern('flight:search:JFK:LAX:*');
   ```

## Troubleshooting

### Cache Not Working

1. Check environment variables:
```bash
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN
```

2. Check Redis connection:
```typescript
import { checkRedisHealth } from '@/lib/cache';
const healthy = await checkRedisHealth();
console.log('Redis healthy:', healthy);
```

3. Check console logs for errors

### High Cache Miss Rate

- Check if TTL is too short
- Verify cache keys are consistent (use generators)
- Check if Redis instance has memory issues

### Redis Quota Exceeded

Upstash free tier: 10,000 requests/day
- Upgrade to paid plan
- Increase TTLs to reduce writes
- Implement cache warming for popular routes

## Future Enhancements

- [ ] Add cache warming for popular routes
- [ ] Implement cache invalidation webhooks
- [ ] Add Redis Streams for real-time updates
- [ ] Create admin panel for cache management
- [ ] Add cache compression for large responses
- [ ] Implement distributed caching for multi-region

## Support

For issues or questions:
- Check Upstash docs: https://docs.upstash.com/redis
- Review cache logs in console
- Monitor `/api/cache/stats` endpoint
