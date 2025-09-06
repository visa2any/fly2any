/**
 * 🔍 US AIRPORT SEARCH SERVICE
 * Intelligent airport search with fallback support for US market
 * Provides instant results when API is unavailable
 */

import { 
  USAirport, 
  US_AIRPORTS_DATABASE, 
  createAirportSearchIndex, 
  POPULAR_US_ROUTES,
  US_TIMEZONE_MAP,
  US_REGIONS
} from './us-airports-database';

export interface AirportSearchResult {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  region: string;
  timezone: string;
  category: string;
  isInternational: boolean;
  passengerCount: number;
  relevanceScore: number;
  matchType: 'exact' | 'starts_with' | 'contains' | 'keyword' | 'similar';
  displayName: string;
  description: string;
  popularRoutes?: string[];
}

export interface AirportSearchOptions {
  limit?: number;
  includeInternational?: boolean;
  includeRegional?: boolean;
  preferredRegions?: string[];
  sortBy?: 'relevance' | 'passenger_count' | 'alphabetical';
  minRelevanceScore?: number;
}

class USAirportSearchService {
  private searchIndex: Map<string, USAirport[]>;
  private initialized = false;

  constructor() {
    this.searchIndex = new Map();
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;
    
    console.log('🏗️ Initializing US Airport Search Service...');
    this.searchIndex = createAirportSearchIndex();
    this.initialized = true;
    console.log(`✅ Indexed ${US_AIRPORTS_DATABASE.length} US airports for search`);
  }

  /**
   * Search airports with intelligent fallback
   */
  async searchAirports(
    query: string, 
    options: AirportSearchOptions = {}
  ): Promise<AirportSearchResult[]> {
    const {
      limit = 10,
      includeInternational = true,
      includeRegional = true,
      preferredRegions = [],
      sortBy = 'relevance',
      minRelevanceScore = 0.1
    } = options;

    if (!query || query.length < 1) {
      return this.getPopularAirports(limit);
    }

    const searchTerm = query.toLowerCase().trim();
    const results = new Set<USAirport>();
    const scoreMap = new Map<string, number>();

    // 1. Exact IATA code match (highest priority)
    const exactIataMatch = US_AIRPORTS_DATABASE.find(
      airport => airport.iataCode.toLowerCase() === searchTerm
    );
    if (exactIataMatch) {
      results.add(exactIataMatch);
      scoreMap.set(exactIataMatch.iataCode, 1.0);
    }

    // 2. IATA code starts with query
    US_AIRPORTS_DATABASE.forEach(airport => {
      if (airport.iataCode.toLowerCase().startsWith(searchTerm) && !results.has(airport)) {
        results.add(airport);
        scoreMap.set(airport.iataCode, 0.9);
      }
    });

    // 3. City name exact match
    US_AIRPORTS_DATABASE.forEach(airport => {
      if (airport.city.toLowerCase() === searchTerm && !results.has(airport)) {
        results.add(airport);
        scoreMap.set(airport.iataCode, 0.85);
      }
    });

    // 4. City name starts with query
    US_AIRPORTS_DATABASE.forEach(airport => {
      if (airport.city.toLowerCase().startsWith(searchTerm) && !results.has(airport)) {
        results.add(airport);
        scoreMap.set(airport.iataCode, 0.8);
      }
    });

    // 5. Airport name contains query
    US_AIRPORTS_DATABASE.forEach(airport => {
      if (airport.name.toLowerCase().includes(searchTerm) && !results.has(airport)) {
        results.add(airport);
        scoreMap.set(airport.iataCode, 0.7);
      }
    });

    // 6. State name or code match
    US_AIRPORTS_DATABASE.forEach(airport => {
      const stateMatch = airport.state.toLowerCase().includes(searchTerm) ||
                        airport.stateCode.toLowerCase() === searchTerm;
      if (stateMatch && !results.has(airport)) {
        results.add(airport);
        scoreMap.set(airport.iataCode, 0.6);
      }
    });

    // 7. Search keywords match
    US_AIRPORTS_DATABASE.forEach(airport => {
      const keywordMatch = airport.searchKeywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      );
      if (keywordMatch && !results.has(airport)) {
        results.add(airport);
        scoreMap.set(airport.iataCode, 0.5);
      }
    });

    // 8. Fuzzy matching for typos
    if (results.size < 5) {
      US_AIRPORTS_DATABASE.forEach(airport => {
        if (!results.has(airport)) {
          const fuzzyScore = this.calculateFuzzyMatch(searchTerm, airport);
          if (fuzzyScore > 0.3) {
            results.add(airport);
            scoreMap.set(airport.iataCode, fuzzyScore * 0.4);
          }
        }
      });
    }

    // Convert to search results
    let searchResults: AirportSearchResult[] = Array.from(results)
      .filter(airport => {
        // Apply filters
        if (!includeInternational && airport.isInternational) return false;
        if (!includeRegional && !airport.isInternational) return false;
        if (preferredRegions.length > 0 && !preferredRegions.includes(airport.region)) return false;
        
        const score = scoreMap.get(airport.iataCode) || 0;
        return score >= minRelevanceScore;
      })
      .map(airport => this.formatAirportResult(airport, scoreMap.get(airport.iataCode) || 0));

    // Sort results
    searchResults = this.sortResults(searchResults, sortBy);

    // Apply limit
    return searchResults.slice(0, limit);
  }

  /**
   * Get popular airports when no search query
   */
  private getPopularAirports(limit: number): AirportSearchResult[] {
    const popularAirports = US_AIRPORTS_DATABASE
      .filter(airport => airport.category === 'major_hub' || airport.category === 'hub')
      .sort((a, b) => b.passengerCount - a.passengerCount)
      .slice(0, limit);

    return popularAirports.map(airport => 
      this.formatAirportResult(airport, 0.9, 'Popular destination')
    );
  }

  /**
   * Calculate fuzzy match score for typo tolerance
   */
  private calculateFuzzyMatch(query: string, airport: USAirport): number {
    const targets = [
      airport.iataCode.toLowerCase(),
      airport.city.toLowerCase(),
      airport.name.toLowerCase(),
      ...airport.searchKeywords
    ];

    let bestScore = 0;
    targets.forEach(target => {
      const score = this.levenshteinSimilarity(query, target);
      bestScore = Math.max(bestScore, score);
    });

    return bestScore;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len1 + 1).fill(0).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return 1 - (matrix[len1][len2] / maxLen);
  }

  /**
   * Format airport data for search results
   */
  private formatAirportResult(
    airport: USAirport, 
    relevanceScore: number, 
    customDescription?: string
  ): AirportSearchResult {
    const matchType = this.determineMatchType(relevanceScore);
    const displayName = `${airport.city}, ${airport.stateCode} (${airport.iataCode})`;
    const description = customDescription || this.generateDescription(airport);
    const popularRoutes = this.getPopularRoutesForAirport(airport.iataCode);

    return {
      iataCode: airport.iataCode,
      icaoCode: airport.icaoCode,
      name: airport.name,
      city: airport.city,
      state: airport.state,
      stateCode: airport.stateCode,
      country: airport.country,
      region: airport.region,
      timezone: airport.timezone,
      category: airport.category,
      isInternational: airport.isInternational,
      passengerCount: airport.passengerCount,
      relevanceScore,
      matchType,
      displayName,
      description,
      popularRoutes
    };
  }

  /**
   * Determine match type based on relevance score
   */
  private determineMatchType(score: number): AirportSearchResult['matchType'] {
    if (score >= 0.9) return 'exact';
    if (score >= 0.8) return 'starts_with';
    if (score >= 0.6) return 'contains';
    if (score >= 0.4) return 'keyword';
    return 'similar';
  }

  /**
   * Generate airport description with US-specific features
   */
  private generateDescription(airport: USAirport): string {
    const categoryMap = {
      'major_hub': 'Major International Hub',
      'hub': 'Major Airport',
      'regional': 'Regional Airport',
      'international_gateway': 'International Gateway',
      'focus_city': 'Focus City',
      'small_hub': 'Regional Hub'
    };

    const category = categoryMap[airport.category] || 'Airport';
    const timezoneName = US_TIMEZONE_MAP[airport.timezone as keyof typeof US_TIMEZONE_MAP] || airport.timezone;
    
    // Add US-specific features
    const features = [];
    if (airport.security?.tsaPrecheck) features.push('TSA PreCheck');
    if (airport.security?.globalEntry) features.push('Global Entry');
    if (airport.security?.clear) features.push('CLEAR');
    
    const baseDescription = `${category} • ${timezoneName} • ${airport.passengerCount}M passengers/year`;
    const featuresText = features.length > 0 ? ` • ${features.join(' + ')}` : '';
    
    return `${baseDescription}${featuresText}`;
  }

  /**
   * Get popular routes for an airport
   */
  private getPopularRoutesForAirport(iataCode: string): string[] {
    return POPULAR_US_ROUTES
      .filter(route => route.from === iataCode || route.to === iataCode)
      .slice(0, 3)
      .map(route => route.route);
  }

  /**
   * Sort search results
   */
  private sortResults(
    results: AirportSearchResult[], 
    sortBy: AirportSearchOptions['sortBy']
  ): AirportSearchResult[] {
    switch (sortBy) {
      case 'passenger_count':
        return results.sort((a, b) => b.passengerCount - a.passengerCount);
      case 'alphabetical':
        return results.sort((a, b) => a.city.localeCompare(b.city));
      case 'relevance':
      default:
        return results.sort((a, b) => {
          // First by relevance score
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          // Then by passenger count
          return b.passengerCount - a.passengerCount;
        });
    }
  }

  /**
   * Get airport by IATA code
   */
  getAirportByCode(iataCode: string): USAirport | null {
    return US_AIRPORTS_DATABASE.find(
      airport => airport.iataCode.toUpperCase() === iataCode.toUpperCase()
    ) || null;
  }

  /**
   * Get airports by region
   */
  getAirportsByRegion(region: string): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => 
      airport.region.toLowerCase() === region.toLowerCase()
    );
  }

  /**
   * Get airports by state
   */
  getAirportsByState(stateCode: string): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => 
      airport.stateCode.toUpperCase() === stateCode.toUpperCase()
    );
  }

  /**
   * Get major hub airports only
   */
  getMajorHubs(): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => 
      airport.category === 'major_hub'
    );
  }

  /**
   * Check if route is domestic US
   */
  isDomesticRoute(originCode: string, destinationCode: string): boolean {
    const origin = this.getAirportByCode(originCode);
    const destination = this.getAirportByCode(destinationCode);
    
    return !!(origin && destination && 
      origin.country === 'United States' && 
      destination.country === 'United States');
  }

  /**
   * Get timezone difference between airports
   */
  getTimezoneDifference(originCode: string, destinationCode: string): number {
    const origin = this.getAirportByCode(originCode);
    const destination = this.getAirportByCode(destinationCode);
    
    if (!origin || !destination) return 0;

    // Simplified timezone offset calculation
    const timezoneOffsets: Record<string, number> = {
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'America/Phoenix': -7,
      'America/Anchorage': -9,
      'Pacific/Honolulu': -10
    };

    const originOffset = timezoneOffsets[origin.timezone] || 0;
    const destinationOffset = timezoneOffsets[destination.timezone] || 0;
    
    return destinationOffset - originOffset;
  }

  /**
   * Get airports with specific security programs
   */
  getAirportsWithTSAPreCheck(): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => airport.security?.tsaPrecheck);
  }

  getAirportsWithGlobalEntry(): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => airport.security?.globalEntry);
  }

  getAirportsWithCLEAR(): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => airport.security?.clear);
  }

  /**
   * Get airports with specific loyalty program benefits
   */
  getAirportsWithLoyaltyProgram(airlineCode: string): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => 
      airport.loyaltyPrograms?.primaryAirlines.some(program => program.airline === airlineCode)
    );
  }

  /**
   * Get airports with premium lounges
   */
  getAirportsWithPremiumLounges(): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => {
      const lounges = airport.usAmenities?.lounges;
      if (!lounges) return false;
      
      return (lounges.creditCard && lounges.creditCard.length > 0) ||
             (lounges.independent && lounges.independent.length > 0);
    });
  }

  /**
   * Get security wait time estimate
   */
  getSecurityWaitTime(iataCode: string, isPreCheck: boolean = false, isPeakTime: boolean = false): number {
    const airport = this.getAirportByCode(iataCode);
    if (!airport?.security) return 30; // default estimate

    if (isPreCheck && airport.security.tsaPrecheck) {
      return airport.security.averageWaitTimes.precheck;
    }

    if (isPeakTime) {
      return airport.security.averageWaitTimes.peak;
    }

    return airport.security.averageWaitTimes.standard;
  }

  /**
   * Get recommended arrival time based on flight type and security programs
   */
  getRecommendedArrivalTime(
    iataCode: string, 
    isInternational: boolean = false,
    hasPreCheck: boolean = false,
    hasGlobalEntry: boolean = false
  ): number {
    const baseTime = isInternational ? 180 : 120; // 3 hours intl, 2 hours domestic
    const securityWait = this.getSecurityWaitTime(iataCode, hasPreCheck);
    
    // Adjust based on security programs
    let adjustment = 0;
    if (hasPreCheck) adjustment -= 20;
    if (hasGlobalEntry && isInternational) adjustment -= 30;
    
    return Math.max(baseTime + adjustment, 60); // minimum 1 hour
  }

  /**
   * Get credit card benefits available at airport
   */
  getCreditCardBenefits(iataCode: string): {
    freeCheckedBags: string[];
    loungeAccess: string[];
    priorityBoarding: string[];
  } | null {
    const airport = this.getAirportByCode(iataCode);
    return airport?.loyaltyPrograms?.creditCardBenefits || null;
  }

  /**
   * Check if airport has specific amenities
   */
  hasAmenity(iataCode: string, amenity: keyof NonNullable<USAirport['usAmenities']>['services']): boolean {
    const airport = this.getAirportByCode(iataCode);
    if (!airport?.usAmenities?.services) {
      return false;
    }
    return Boolean(airport.usAmenities.services[amenity]);
  }

  /**
   * Get family-friendly airports
   */
  getFamilyFriendlyAirports(): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => 
      airport.usAmenities?.families?.playAreas && 
      airport.usAmenities?.families?.nursingRooms &&
      airport.usAmenities?.families?.familyRestrooms
    );
  }

  /**
   * Get business travel optimized airports
   */
  getBusinessTravelAirports(): USAirport[] {
    return US_AIRPORTS_DATABASE.filter(airport => 
      airport.security?.tsaPrecheck &&
      airport.security?.clear &&
      (airport.usAmenities?.lounges?.airline && airport.usAmenities.lounges.airline.length > 0) &&
      airport.usAmenities?.technology?.businessCenter
    );
  }
}

// Lazy-loaded singleton to avoid initialization during build time
let _instance: USAirportSearchService | null = null;

export const getUSAirportSearch = (): USAirportSearchService => {
  if (!_instance) {
    _instance = new USAirportSearchService();
  }
  return _instance;
};

// Export lazy getter as default to avoid immediate initialization
export default getUSAirportSearch;