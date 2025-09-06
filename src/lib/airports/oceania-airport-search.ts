/**
 * 🌺 OCEANIA AIRPORT SEARCH SERVICE
 * Intelligent airport search service for Oceania airports with instant results
 * Optimized for Pacific region with comprehensive multi-language support
 */

import { OceaniaAirport, OCEANIA_AIRPORTS_DATABASE, createOceaniaAirportSearchIndex } from './oceania-airports-database';

export interface OceaniaAirportSearchResult extends OceaniaAirport {
  relevanceScore: number;
  matchType: 'exact' | 'starts_with' | 'contains' | 'fuzzy' | 'keyword';
  displayName: string;
  description: string;
}

export interface OceaniaAirportSearchOptions {
  limit?: number;
  includeInternational?: boolean;
  includeRegional?: boolean;
  preferredCountries?: string[];
  preferredRegions?: string[];
  sortBy?: 'relevance' | 'name' | 'passenger_count' | 'alphabetical';
  minScore?: number;
}

class OceaniaAirportSearchService {
  private searchIndex: Map<string, OceaniaAirport[]>;
  private fuzzyCache = new Map<string, OceaniaAirportSearchResult[]>();

  constructor() {
    this.searchIndex = createOceaniaAirportSearchIndex();
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(0).map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate fuzzy similarity score (0-1)
   */
  private calculateSimilarity(query: string, target: string): number {
    if (query === target) return 1.0;
    
    const maxLength = Math.max(query.length, target.length);
    if (maxLength === 0) return 1.0;
    
    const distance = this.levenshteinDistance(query.toLowerCase(), target.toLowerCase());
    return (maxLength - distance) / maxLength;
  }

  /**
   * Normalize text for better matching (handle accents, Māori, Pacific languages)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Score airport relevance based on search query
   */
  private scoreAirport(airport: OceaniaAirport, query: string): OceaniaAirportSearchResult | null {
    const searchTerm = this.normalizeText(query);
    const iataCode = airport.iataCode.toLowerCase();
    const city = this.normalizeText(airport.city);
    const name = this.normalizeText(airport.name);
    const country = this.normalizeText(airport.country);
    
    let score = 0;
    let matchType: OceaniaAirportSearchResult['matchType'] = 'contains';

    // Exact IATA code match (highest priority)
    if (iataCode === searchTerm) {
      score = 1.0;
      matchType = 'exact';
    }
    // Exact city match
    else if (city === searchTerm) {
      score = 0.95;
      matchType = 'exact';
    }
    // IATA code starts with query
    else if (iataCode.startsWith(searchTerm)) {
      score = 0.9;
      matchType = 'starts_with';
    }
    // City starts with query
    else if (city.startsWith(searchTerm)) {
      score = 0.85;
      matchType = 'starts_with';
    }
    // Airport name starts with query
    else if (name.startsWith(searchTerm)) {
      score = 0.8;
      matchType = 'starts_with';
    }
    // Country starts with query
    else if (country.startsWith(searchTerm)) {
      score = 0.75;
      matchType = 'starts_with';
    }
    // City contains query
    else if (city.includes(searchTerm)) {
      score = 0.7;
      matchType = 'contains';
    }
    // Airport name contains query
    else if (name.includes(searchTerm)) {
      score = 0.65;
      matchType = 'contains';
    }
    // Country contains query
    else if (country.includes(searchTerm)) {
      score = 0.6;
      matchType = 'contains';
    }
    // Keyword match (including normalized keywords)
    else if (airport.searchKeywords.some(keyword => this.normalizeText(keyword).includes(searchTerm))) {
      score = 0.55;
      matchType = 'keyword';
    }
    // Fuzzy matching for typos
    else {
      const citySimilarity = this.calculateSimilarity(searchTerm, city);
      const iataCodeSimilarity = this.calculateSimilarity(searchTerm, iataCode);
      const countrySimilarity = this.calculateSimilarity(searchTerm, country);
      const maxSimilarity = Math.max(citySimilarity, iataCodeSimilarity, countrySimilarity);
      
      if (maxSimilarity >= 0.7) {
        score = maxSimilarity * 0.5; // Reduce score for fuzzy matches
        matchType = 'fuzzy';
      } else {
        return null; // No match
      }
    }

    // Boost score for major hubs and popular airports
    if (airport.category === 'major_hub') {
      score += 0.1;
    } else if (airport.category === 'hub') {
      score += 0.05;
    }

    // Boost score for international airports
    if (airport.isInternational) {
      score += 0.02;
    }

    // Boost score based on passenger count
    const passengerBoost = Math.min(airport.passengerCount / 50, 0.1);
    score += passengerBoost;

    // Boost score for major Oceania cities
    const majorCities = [
      'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'auckland',
      'christchurch', 'wellington', 'nadi', 'port moresby', 'noumea',
      'papeete', 'apia', 'nuku\'alofa', 'rarotonga', 'port vila', 'honiara'
    ];
    if (majorCities.includes(city)) {
      score += 0.03;
    }

    // Ensure score doesn't exceed 1.0
    score = Math.min(score, 1.0);

    return {
      ...airport,
      relevanceScore: score,
      matchType,
      displayName: `${airport.city}, ${airport.country} (${airport.iataCode})`,
      description: `${airport.category.replace('_', ' ').toUpperCase()}${airport.passengerCount > 0 ? ` • ${airport.passengerCount}M passengers/year` : ''}`
    };
  }

  /**
   * Main search function
   */
  async searchAirports(
    query: string, 
    options: OceaniaAirportSearchOptions = {}
  ): Promise<OceaniaAirportSearchResult[]> {
    const {
      limit = 10,
      includeInternational = true,
      includeRegional = true,
      preferredCountries = [],
      preferredRegions = [],
      sortBy = 'relevance',
      minScore = 0.1
    } = options;

    const searchTerm = this.normalizeText(query);
    
    if (!searchTerm || searchTerm.length < 1) {
      return [];
    }

    // Check cache first
    const cacheKey = `${searchTerm}_${JSON.stringify(options)}`;
    if (this.fuzzyCache.has(cacheKey)) {
      return this.fuzzyCache.get(cacheKey)!;
    }

    const results = new Set<OceaniaAirportSearchResult>();
    const scoreMap = new Map<string, number>();

    // Search through all airports
    for (const airport of OCEANIA_AIRPORTS_DATABASE) {
      // Apply filters
      if (!includeInternational && airport.isInternational) continue;
      if (!includeRegional && ['regional', 'small_hub'].includes(airport.category)) continue;
      if (preferredCountries.length > 0 && !preferredCountries.includes(airport.country)) continue;
      if (preferredRegions.length > 0 && !preferredRegions.includes(airport.region)) continue;

      const scoredResult = this.scoreAirport(airport, query);
      if (scoredResult && scoredResult.relevanceScore >= minScore) {
        // Only keep the highest scoring result for each airport
        const existingScore = scoreMap.get(airport.iataCode) || 0;
        if (scoredResult.relevanceScore > existingScore) {
          // Remove previous result if exists
          const existingResult = Array.from(results).find(r => r.iataCode === airport.iataCode);
          if (existingResult) {
            results.delete(existingResult);
          }
          
          results.add(scoredResult);
          scoreMap.set(airport.iataCode, scoredResult.relevanceScore);
        }
      }
    }

    // Convert to array and sort
    const sortedResults = Array.from(results);

    switch (sortBy) {
      case 'relevance':
        sortedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'name':
        sortedResults.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'passenger_count':
        sortedResults.sort((a, b) => b.passengerCount - a.passengerCount);
        break;
      case 'alphabetical':
        sortedResults.sort((a, b) => a.city.localeCompare(b.city));
        break;
    }

    // Apply limit
    const limitedResults = sortedResults.slice(0, limit);

    // Cache results
    this.fuzzyCache.set(cacheKey, limitedResults);

    return limitedResults;
  }

  /**
   * Get airport by IATA code
   */
  getAirportByCode(iataCode: string): OceaniaAirport | null {
    const code = iataCode.toUpperCase();
    return OCEANIA_AIRPORTS_DATABASE.find(airport => airport.iataCode === code) || null;
  }

  /**
   * Get popular airports for empty state
   */
  getPopularAirports(limit: number = 10): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE
      .filter(airport => airport.category === 'major_hub' || airport.category === 'hub')
      .sort((a, b) => b.passengerCount - a.passengerCount)
      .slice(0, limit);
  }

  /**
   * Check if route is domestic (same country)
   */
  isDomesticRoute(origin: string, destination: string): boolean {
    const originAirport = this.getAirportByCode(origin);
    const destinationAirport = this.getAirportByCode(destination);
    
    return originAirport?.country === destinationAirport?.country;
  }

  /**
   * Check if route is within Oceania
   */
  isOceaniaRoute(origin: string, destination: string): boolean {
    const originAirport = this.getAirportByCode(origin);
    const destinationAirport = this.getAirportByCode(destination);
    
    const oceaniaCountries = [
      'Australia', 'New Zealand', 'Papua New Guinea', 'Fiji', 'New Caledonia',
      'Vanuatu', 'Solomon Islands', 'Samoa', 'Tonga', 'Cook Islands',
      'French Polynesia', 'Palau', 'Marshall Islands', 'Micronesia', 'Kiribati',
      'Nauru', 'Tuvalu', 'American Samoa', 'Guam', 'Northern Mariana Islands'
    ];
    
    return oceaniaCountries.includes(originAirport?.country || '') && 
           oceaniaCountries.includes(destinationAirport?.country || '');
  }

  /**
   * Get timezone difference between airports (in hours)
   */
  getTimezoneDifference(origin: string, destination: string): number {
    const originAirport = this.getAirportByCode(origin);
    const destinationAirport = this.getAirportByCode(destination);
    
    if (!originAirport || !destinationAirport) return 0;

    // Oceania timezone offsets (simplified, not accounting for DST)
    const timezoneOffsets: { [key: string]: number } = {
      // Australia - Multiple zones
      'Australia/Sydney': 10, // +11 during DST
      'Australia/Melbourne': 10, // +11 during DST
      'Australia/Brisbane': 10,
      'Australia/Adelaide': 9.5, // +10.5 during DST
      'Australia/Perth': 8,
      'Australia/Darwin': 9.5,
      
      // New Zealand
      'Pacific/Auckland': 12, // +13 during DST
      'Pacific/Chatham': 12.75, // +13.75 during DST
      
      // Pacific Islands - East to West
      'Pacific/Fiji': 12,
      'Pacific/Port_Moresby': 10,
      'Pacific/Noumea': 11,
      'Pacific/Efate': 11, // Vanuatu
      'Pacific/Guadalcanal': 11, // Solomon Islands
      'Pacific/Tahiti': -10,
      'Pacific/Apia': 13, // Samoa
      'Pacific/Tongatapu': 13, // Tonga
      'Pacific/Rarotonga': -10, // Cook Islands
      'Pacific/Guam': 10,
      'Pacific/Saipan': 10,
      'Pacific/Palau': 9
    };

    const originOffset = timezoneOffsets[originAirport.timezone] || 10;
    const destOffset = timezoneOffsets[destinationAirport.timezone] || 10;
    
    return destOffset - originOffset;
  }

  /**
   * Get airports by country
   */
  getAirportsByCountry(country: string): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Get airports by region within Oceania
   */
  getAirportsByRegion(region: string): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.region.toLowerCase() === region.toLowerCase()
    );
  }

  /**
   * Get major hubs only
   */
  getMajorHubs(): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.category === 'major_hub'
    );
  }

  /**
   * Get international gateways
   */
  getInternationalGateways(): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.isInternational && ['major_hub', 'hub', 'international_gateway'].includes(airport.category)
    );
  }

  /**
   * Get Australian airports only
   */
  getAustralianAirports(): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.country === 'Australia'
    );
  }

  /**
   * Get New Zealand airports only
   */
  getNewZealandAirports(): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.country === 'New Zealand'
    );
  }

  /**
   * Get Pacific Island airports (excluding Australia & New Zealand)
   */
  getPacificIslandAirports(): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.country !== 'Australia' && airport.country !== 'New Zealand'
    );
  }

  /**
   * Get Melanesian airports
   */
  getMelanesianAirports(): OceaniaAirport[] {
    const melanesianCountries = [
      'Papua New Guinea', 'Fiji', 'New Caledonia', 'Vanuatu', 'Solomon Islands'
    ];
    
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      melanesianCountries.includes(airport.country)
    );
  }

  /**
   * Get Polynesian airports
   */
  getPolynesianAirports(): OceaniaAirport[] {
    const polynesianCountries = [
      'French Polynesia', 'Samoa', 'Tonga', 'Cook Islands', 'American Samoa'
    ];
    
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      polynesianCountries.includes(airport.country)
    );
  }

  /**
   * Get Micronesian airports
   */
  getMicronesianAirports(): OceaniaAirport[] {
    const micronesianCountries = [
      'Palau', 'Marshall Islands', 'Micronesia', 'Kiribati', 'Nauru', 'Tuvalu',
      'Guam', 'Northern Mariana Islands'
    ];
    
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      micronesianCountries.includes(airport.country)
    );
  }

  /**
   * Get airports with trans-Pacific routes
   */
  getTransPacificGateways(): OceaniaAirport[] {
    return OCEANIA_AIRPORTS_DATABASE.filter(airport => 
      airport.popularDestinations.some(dest => ['LAX', 'SFO', 'HNL', 'YVR', 'NRT', 'ICN'].includes(dest))
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.fuzzyCache.clear();
  }
}

// Export singleton instance
export const oceaniaAirportSearch = new OceaniaAirportSearchService();