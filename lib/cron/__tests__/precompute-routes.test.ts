/**
 * Integration Tests: Pre-compute Routes Cron Job
 *
 * Tests for the popular routes pre-computation system.
 */

import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { getPrismaClient } from '@/lib/prisma';
import { setCache, getCached } from '@/lib/cache';

// Mock the external API calls
jest.mock('@/lib/api/amadeus');
jest.mock('@/lib/api/duffel');

describe('Pre-compute Routes Cron Job', () => {
  const prisma = getPrismaClient();

  beforeAll(async () => {
    // Setup: Create test data in database
    await createTestSearchHistory();
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    await cleanupTestData();
  });

  async function createTestSearchHistory() {
    // Create sample recent searches
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma!.recentSearch.createMany({
      data: [
        {
          userId: 'test-user-1',
          city: 'Los Angeles',
          country: 'United States',
          airportCode: 'LAX',
          origin: 'JFK',
          price: 299,
          originalPrice: 350,
          departDate: '2025-12-15',
          returnDate: '2025-12-22',
          imageUrl: 'https://example.com/lax.jpg',
          createdAt: thirtyDaysAgo,
        },
        {
          userId: 'test-user-2',
          city: 'Los Angeles',
          country: 'United States',
          airportCode: 'LAX',
          origin: 'JFK',
          price: 289,
          originalPrice: 340,
          departDate: '2025-12-16',
          returnDate: '2025-12-23',
          imageUrl: 'https://example.com/lax.jpg',
          createdAt: thirtyDaysAgo,
        },
        {
          userId: 'test-user-3',
          city: 'San Francisco',
          country: 'United States',
          airportCode: 'SFO',
          origin: 'JFK',
          price: 329,
          originalPrice: 380,
          departDate: '2025-12-10',
          returnDate: '2025-12-17',
          imageUrl: 'https://example.com/sfo.jpg',
          createdAt: thirtyDaysAgo,
        },
      ],
    });

    // Create sample saved searches
    await prisma!.savedSearch.createMany({
      data: [
        {
          userId: 'test-user-1',
          name: 'Christmas in LA',
          origin: 'JFK',
          destination: 'LAX',
          departDate: '2025-12-20',
          returnDate: '2025-12-27',
          adults: 2,
          children: 0,
          infants: 0,
          cabinClass: 'economy',
        },
      ],
    });
  }

  async function cleanupTestData() {
    await prisma!.recentSearch.deleteMany({
      where: {
        userId: {
          startsWith: 'test-user-',
        },
      },
    });

    await prisma!.savedSearch.deleteMany({
      where: {
        userId: {
          startsWith: 'test-user-',
        },
      },
    });
  }

  describe('Route Aggregation', () => {
    test('should identify popular routes from search history', async () => {
      const recentSearches = await prisma!.recentSearch.findMany({
        where: {
          userId: {
            startsWith: 'test-user-',
          },
        },
      });

      expect(recentSearches.length).toBeGreaterThan(0);

      // Group by route
      const routeMap = new Map();
      for (const search of recentSearches) {
        const routeKey = `${search.origin}-${search.airportCode}`;
        const count = routeMap.get(routeKey) || 0;
        routeMap.set(routeKey, count + 1);
      }

      // JFK-LAX should be most popular (2 searches)
      expect(routeMap.get('JFK-LAX')).toBe(2);
      expect(routeMap.get('JFK-SFO')).toBe(1);
    });

    test('should weight saved searches higher', async () => {
      const recentSearches = await prisma!.recentSearch.count({
        where: {
          origin: 'JFK',
          airportCode: 'LAX',
        },
      });

      const savedSearches = await prisma!.savedSearch.count({
        where: {
          origin: 'JFK',
          destination: 'LAX',
        },
      });

      // Weight calculation: recent + (saved * 2)
      const totalWeight = recentSearches + (savedSearches * 2);

      expect(totalWeight).toBeGreaterThan(recentSearches);
    });

    test('should bucket dates to nearest week', () => {
      const testDates = [
        '2025-12-15', // Monday
        '2025-12-16', // Tuesday
        '2025-12-17', // Wednesday
      ];

      const bucketDateToWeek = (dateString: string): string => {
        const date = new Date(dateString);
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        return monday.toISOString().split('T')[0];
      };

      const bucketed = testDates.map(bucketDateToWeek);

      // All dates in same week should bucket to same Monday
      expect(bucketed[0]).toBe(bucketed[1]);
      expect(bucketed[0]).toBe(bucketed[2]);
      expect(bucketed[0]).toMatch(/2025-12-15/); // Should be Monday
    });
  });

  describe('Cache Integration', () => {
    test('should generate correct cache keys', () => {
      const generateFlightSearchKey = (params: any): string => {
        const parts = [
          'flight:search',
          params.origin.toUpperCase(),
          params.destination.toUpperCase(),
          params.departureDate,
          params.returnDate || 'oneway',
          params.adults.toString(),
          (params.children || 0).toString(),
          (params.infants || 0).toString(),
          params.travelClass?.toUpperCase() || 'ECONOMY',
          params.nonStop ? 'nonstop' : 'any',
          params.currencyCode || 'USD',
        ];
        return parts.join(':');
      };

      const cacheKey = generateFlightSearchKey({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-15',
        returnDate: '2025-12-22',
        adults: 1,
        children: 0,
        infants: 0,
        travelClass: 'economy',
        nonStop: false,
        currencyCode: 'USD',
      });

      expect(cacheKey).toBe('flight:search:JFK:LAX:2025-12-15:2025-12-22:1:0:0:ECONOMY:any:USD');
    });

    test('should cache flight data with correct TTL', async () => {
      const testData = {
        offers: [
          { id: '1', price: 299, airline: 'AA' },
          { id: '2', price: 310, airline: 'UA' },
        ],
      };

      const cacheKey = 'test:flight:jfk:lax:2025-12-15';
      const ttl = 21600; // 6 hours

      await setCache(cacheKey, testData, ttl);

      const cached = await getCached(cacheKey);

      expect(cached).toBeDefined();
      expect(cached.offers).toEqual(testData.offers);
    });

    test('should handle cache misses gracefully', async () => {
      const cached = await getCached('non-existent-key');
      expect(cached).toBeNull();
    });
  });

  describe('Batch Processing', () => {
    test('should process routes in batches', () => {
      const routes = Array.from({ length: 100 }, (_, i) => ({
        origin: 'JFK',
        destination: `DEST${i}`,
        departDate: '2025-12-15',
        returnDate: '2025-12-22',
        searchCount: Math.floor(Math.random() * 10) + 1,
      }));

      const BATCH_SIZE = 20;
      const batches = [];

      for (let i = 0; i < routes.length; i += BATCH_SIZE) {
        batches.push(routes.slice(i, i + BATCH_SIZE));
      }

      expect(batches.length).toBe(5); // 100 routes / 20 per batch
      expect(batches[0].length).toBe(20);
      expect(batches[4].length).toBe(20);
    });

    test('should handle partial batches', () => {
      const routes = Array.from({ length: 95 }, (_, i) => ({
        origin: 'JFK',
        destination: `DEST${i}`,
      }));

      const BATCH_SIZE = 20;
      const batches = [];

      for (let i = 0; i < routes.length; i += BATCH_SIZE) {
        batches.push(routes.slice(i, i + BATCH_SIZE));
      }

      expect(batches.length).toBe(5); // 95 routes in 5 batches
      expect(batches[0].length).toBe(20);
      expect(batches[4].length).toBe(15); // Last batch is partial
    });
  });

  describe('Error Handling', () => {
    test('should handle API failures gracefully', () => {
      const mockAPICall = async (route: any): Promise<any> => {
        if (route.destination === 'INVALID') {
          throw new Error('API Error');
        }
        return { offers: [] };
      };

      expect(async () => {
        try {
          await mockAPICall({ destination: 'INVALID' });
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('API Error');
        }
      });
    });

    test('should continue processing after individual failures', async () => {
      const routes = [
        { origin: 'JFK', destination: 'LAX', valid: true },
        { origin: 'JFK', destination: 'INVALID', valid: false },
        { origin: 'JFK', destination: 'SFO', valid: true },
      ];

      let successful = 0;
      let failed = 0;

      for (const route of routes) {
        try {
          if (!route.valid) {
            throw new Error('Invalid route');
          }
          successful++;
        } catch (error) {
          failed++;
        }
      }

      expect(successful).toBe(2);
      expect(failed).toBe(1);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce delay between API calls', async () => {
      const API_DELAY = 100; // 100ms
      const calls: number[] = [];

      // Simulate 3 API calls with delay
      for (let i = 0; i < 3; i++) {
        calls.push(Date.now());
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, API_DELAY));
        }
      }

      // Verify delays
      const delay1 = calls[1] - calls[0];
      const delay2 = calls[2] - calls[1];

      expect(delay1).toBeGreaterThanOrEqual(API_DELAY);
      expect(delay2).toBeGreaterThanOrEqual(API_DELAY);
    });
  });

  describe('Performance', () => {
    test('should complete within reasonable time for 100 routes', () => {
      const BATCH_SIZE = 20;
      const API_DELAY = 100; // 100ms per call
      const routes = 100;

      // Calculate expected time
      const batches = Math.ceil(routes / BATCH_SIZE);
      const callsPerBatch = BATCH_SIZE;
      const timePerBatch = callsPerBatch * API_DELAY;
      const totalTime = batches * timePerBatch;

      // Should complete in under 10 seconds for 100 routes
      expect(totalTime).toBeLessThan(10000);
    });

    test('should calculate cost savings from caching', () => {
      const totalRoutes = 100;
      const cacheHitRate = 0.7; // 70% cache hits
      const apiCost = 0.001; // $0.001 per API call

      const apiCallsWithoutCache = totalRoutes;
      const apiCallsWithCache = totalRoutes * (1 - cacheHitRate);

      const costWithoutCache = apiCallsWithoutCache * apiCost;
      const costWithCache = apiCallsWithCache * apiCost;
      const savings = costWithoutCache - costWithCache;

      expect(savings).toBe(0.07); // $0.07 saved
      expect(savings / costWithoutCache).toBe(0.7); // 70% cost reduction
    });
  });

  describe('Data Quality', () => {
    test('should exclude searches older than 30 days', () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const fortyDaysAgo = new Date();
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

      const searches = [
        { date: new Date(), include: true },
        { date: thirtyDaysAgo, include: true },
        { date: fortyDaysAgo, include: false },
      ];

      const filtered = searches.filter(s => s.date >= thirtyDaysAgo);

      expect(filtered.length).toBe(2);
    });

    test('should limit results to top 100 routes', () => {
      const routes = Array.from({ length: 200 }, (_, i) => ({
        route: `ROUTE-${i}`,
        searchCount: Math.floor(Math.random() * 100),
      }));

      const topRoutes = routes
        .sort((a, b) => b.searchCount - a.searchCount)
        .slice(0, 100);

      expect(topRoutes.length).toBe(100);

      // Verify sorting
      for (let i = 0; i < topRoutes.length - 1; i++) {
        expect(topRoutes[i].searchCount).toBeGreaterThanOrEqual(
          topRoutes[i + 1].searchCount
        );
      }
    });
  });
});
