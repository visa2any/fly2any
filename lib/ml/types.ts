/**
 * ML-Powered Cost Optimization Types
 * Core interfaces for intelligent caching and route profiling
 */

export interface RouteCacheProfile {
  /** Route identifier (e.g., 'JFK-LAX') */
  route: string;

  /** Origin airport code */
  origin: string;

  /** Destination airport code */
  destination: string;

  /** Price volatility score (0-1, higher = more volatile) */
  volatility: number;

  /** Route popularity score (search volume) */
  popularity: number;

  /** Optimal cache TTL in minutes */
  optimalTTL: number;

  /** Historical average price */
  avgPrice: number;

  /** Price standard deviation */
  priceStdDev: number;

  /** Total searches in last 7 days */
  searchesLast7Days: number;

  /** Total searches in last 30 days */
  searchesLast30Days: number;

  /** Seasonal trend multiplier */
  seasonalTrend: number;

  /** Last profile update timestamp */
  lastUpdated: Date;

  /** Historical price samples for analysis */
  priceSamples: PriceSample[];
}

export interface PriceSample {
  /** Price amount */
  price: number;

  /** Currency code */
  currency: string;

  /** Timestamp of price observation */
  timestamp: Date;

  /** Cabin class */
  cabinClass: string;

  /** Source API (amadeus, duffel) */
  source: string;
}

export interface RouteSearchLog {
  /** Unique search ID */
  searchId: string;

  /** Route identifier */
  route: string;

  /** Search parameters */
  params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children: number;
    infants: number;
    cabinClass: string;
  };

  /** Lowest price found */
  lowestPrice: number;

  /** Currency */
  currency: string;

  /** Number of results returned */
  resultCount: number;

  /** Cache hit/miss */
  cacheHit: boolean;

  /** API calls made */
  apiCalls: {
    amadeus: boolean;
    duffel: boolean;
  };

  /** Search timestamp */
  timestamp: Date;

  /** User session ID */
  sessionId?: string;
}

export interface UserSearchPattern {
  /** Session ID */
  sessionId: string;

  /** User preferences detected */
  patterns: {
    /** Preferred cabin class */
    preferredCabin: 'economy' | 'premium_economy' | 'business' | 'first';

    /** Date flexibility (searches ±X days) */
    flexibleDates: boolean;

    /** Price vs time priority */
    priceVsTime: 'price' | 'time' | 'balanced';

    /** Average searches before booking */
    avgSearchesBeforeBook: number;

    /** Preferred routes */
    preferredRoutes: string[];
  };

  /** Search history */
  searchHistory: RouteSearchLog[];

  /** First search timestamp */
  firstSearchAt: Date;

  /** Last search timestamp */
  lastSearchAt: Date;
}

export interface APIPerformanceProfile {
  /** Route identifier */
  route: string;

  /** Amadeus win rate (% of times it had cheaper price) */
  amadeusWinRate: number;

  /** Duffel win rate */
  duffelWinRate: number;

  /** Average price difference (Amadeus - Duffel) */
  avgPriceDifference: number;

  /** Duffel inventory coverage rate */
  duffelCoverageRate: number;

  /** Amadeus average response time (ms) */
  amadeusAvgResponseTime: number;

  /** Duffel average response time (ms) */
  duffelAvgResponseTime: number;

  /** Last updated */
  lastUpdated: Date;
}

export interface CacheStats {
  /** Total cache hits */
  hits: number;

  /** Total cache misses */
  misses: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** API calls saved */
  apiCallsSaved: number;

  /** Cost savings in USD */
  costSavings: number;

  /** Average response time (ms) */
  avgResponseTime: number;

  /** Period start */
  periodStart: Date;

  /** Period end */
  periodEnd: Date;
}

export interface PredictionResult {
  /** Recommended cache TTL in minutes */
  recommendedTTL: number;

  /** Confidence score (0-1) */
  confidence: number;

  /** Reason for recommendation */
  reason: string;

  /** Supporting data */
  metadata: {
    volatility: number;
    popularity: number;
    priceStability: number;
  };
}

export interface PreFetchCandidate {
  /** Route to pre-fetch */
  route: string;

  /** Origin */
  origin: string;

  /** Destination */
  destination: string;

  /** Departure date */
  departureDate: string;

  /** Return date */
  returnDate?: string;

  /** Cabin class */
  cabinClass: string;

  /** Priority score (higher = more important) */
  priority: number;

  /** Expected searches in next 24h */
  expectedSearches: number;

  /** Estimated cost savings */
  estimatedSavings: number;
}
