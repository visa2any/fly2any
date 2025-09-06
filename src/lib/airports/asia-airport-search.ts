/**
 * 🌏 ASIA AIRPORT SEARCH SERVICE
 * Intelligent airport search service for Asian airports with instant results
 * Optimized for Asian market with comprehensive multi-language support
 */

import { AsiaAirport, ASIA_AIRPORTS_DATABASE, createAsiaAirportSearchIndex } from './asia-airports-database';

export interface AsiaAirportSearchResult extends AsiaAirport {
  relevanceScore: number;
  matchType: 'exact' | 'starts_with' | 'contains' | 'fuzzy' | 'keyword';
  displayName: string;
  description: string;
}

export interface AsiaAirportSearchOptions {
  limit?: number;
  includeInternational?: boolean;
  includeRegional?: boolean;
  preferredCountries?: string[];
  preferredRegions?: string[];
  sortBy?: 'relevance' | 'name' | 'passenger_count' | 'alphabetical';
  minScore?: number;
}

class AsiaAirportSearchService {
  private searchIndex: Map<string, AsiaAirport[]>;
  private fuzzyCache = new Map<string, AsiaAirportSearchResult[]>();

  constructor() {
    this.searchIndex = createAsiaAirportSearchIndex();
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
   * Normalize text for better matching (handle accents, Chinese, Japanese, Korean, Arabic, Thai, etc.)
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0600-\u06ff\u0e00-\u0e7f]/g, ' ') // Keep Asian scripts
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Score airport relevance based on search query
   */
  private scoreAirport(airport: AsiaAirport, query: string): AsiaAirportSearchResult | null {
    const searchTerm = this.normalizeText(query);
    const iataCode = airport.iataCode.toLowerCase();
    const city = this.normalizeText(airport.city);
    const name = this.normalizeText(airport.name);
    const country = this.normalizeText(airport.country);
    
    let score = 0;
    let matchType: AsiaAirportSearchResult['matchType'] = 'contains';

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

    // Boost score for major Asian cities
    const majorCities = [
      'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'tokyo', 'osaka', 'nagoya',
      'seoul', 'busan', 'taipei', 'hong kong', 'macau', 'singapore', 'kuala lumpur',
      'bangkok', 'jakarta', 'manila', 'ho chi minh city', 'hanoi', 'mumbai', 'delhi',
      'bangalore', 'chennai', 'kolkata', 'dubai', 'abu dhabi', 'doha', 'riyadh',
      'jeddah', 'kuwait city', 'tehran', 'istanbul', 'ankara'
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
    options: AsiaAirportSearchOptions = {}
  ): Promise<AsiaAirportSearchResult[]> {
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

    const results = new Set<AsiaAirportSearchResult>();
    const scoreMap = new Map<string, number>();

    // Search through all airports
    for (const airport of ASIA_AIRPORTS_DATABASE) {
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
  getAirportByCode(iataCode: string): AsiaAirport | null {
    const code = iataCode.toUpperCase();
    return ASIA_AIRPORTS_DATABASE.find(airport => airport.iataCode === code) || null;
  }

  /**
   * Get popular airports for empty state
   */
  getPopularAirports(limit: number = 10): AsiaAirport[] {
    return ASIA_AIRPORTS_DATABASE
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
   * Check if route is within Asia
   */
  isAsianRoute(origin: string, destination: string): boolean {
    const originAirport = this.getAirportByCode(origin);
    const destinationAirport = this.getAirportByCode(destination);
    
    const asianCountries = [
      'China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau', 'North Korea', 'Mongolia',
      'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Cambodia',
      'Laos', 'Myanmar', 'Brunei', 'East Timor', 'India', 'Pakistan', 'Bangladesh', 'Sri Lanka',
      'Nepal', 'Bhutan', 'Maldives', 'Afghanistan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan',
      'Tajikistan', 'Kyrgyzstan', 'Turkey', 'Iran', 'Iraq', 'Syria', 'Lebanon', 'Jordan',
      'Israel', 'Palestine', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
      'Yemen', 'Georgia', 'Armenia', 'Azerbaijan', 'Russia'
    ];
    
    return asianCountries.includes(originAirport?.country || '') && 
           asianCountries.includes(destinationAirport?.country || '');
  }

  /**
   * Get timezone difference between airports (in hours)
   */
  getTimezoneDifference(origin: string, destination: string): number {
    const originAirport = this.getAirportByCode(origin);
    const destinationAirport = this.getAirportByCode(destination);
    
    if (!originAirport || !destinationAirport) return 0;

    // Asian timezone offsets (simplified, not accounting for DST)
    const timezoneOffsets: { [key: string]: number } = {
      // East Asia
      'Asia/Shanghai': 8,
      'Asia/Beijing': 8,
      'Asia/Chongqing': 8,
      'Asia/Urumqi': 6,
      'Asia/Tokyo': 9,
      'Asia/Seoul': 9,
      'Asia/Taipei': 8,
      'Asia/Hong_Kong': 8,
      'Asia/Macau': 8,
      'Asia/Pyongyang': 9,
      'Asia/Ulaanbaatar': 8,
      
      // Southeast Asia
      'Asia/Bangkok': 7,
      'Asia/Singapore': 8,
      'Asia/Kuala_Lumpur': 8,
      'Asia/Jakarta': 7,
      'Asia/Manila': 8,
      'Asia/Ho_Chi_Minh': 7,
      'Asia/Phnom_Penh': 7,
      'Asia/Vientiane': 7,
      'Asia/Yangon': 6.5,
      'Asia/Brunei': 8,
      'Asia/Dili': 9,
      
      // South Asia
      'Asia/Kolkata': 5.5,
      'Asia/Mumbai': 5.5,
      'Asia/Delhi': 5.5,
      'Asia/Dhaka': 6,
      'Asia/Karachi': 5,
      'Asia/Colombo': 5.5,
      'Asia/Kathmandu': 5.75,
      'Asia/Thimphu': 6,
      'Asia/Maldives': 5,
      
      // Central Asia
      'Asia/Kabul': 4.5,
      'Asia/Almaty': 6,
      'Asia/Tashkent': 5,
      'Asia/Ashgabat': 5,
      'Asia/Dushanbe': 5,
      'Asia/Bishkek': 6,
      
      // West Asia
      'Europe/Istanbul': 3,
      'Asia/Tehran': 3.5,
      'Asia/Baghdad': 3,
      'Asia/Damascus': 2,
      'Asia/Beirut': 2,
      'Asia/Amman': 2,
      'Asia/Jerusalem': 2,
      'Asia/Riyadh': 3,
      'Asia/Dubai': 4,
      'Asia/Doha': 3,
      'Asia/Kuwait': 3,
      'Asia/Bahrain': 3,
      'Asia/Muscat': 4,
      'Asia/Aden': 3,
      
      // Caucasus
      'Asia/Tbilisi': 4,
      'Asia/Yerevan': 4,
      'Asia/Baku': 4,
      
      // Russia (Asian part)
      'Asia/Yekaterinburg': 5,
      'Asia/Omsk': 6,
      'Asia/Novosibirsk': 7,
      'Asia/Krasnoyarsk': 7,
      'Asia/Irkutsk': 8,
      'Asia/Yakutsk': 9,
      'Asia/Vladivostok': 10,
      'Asia/Magadan': 11,
      'Asia/Kamchatka': 12
    };

    const originOffset = timezoneOffsets[originAirport.timezone] || 8;
    const destOffset = timezoneOffsets[destinationAirport.timezone] || 8;
    
    return destOffset - originOffset;
  }

  /**
   * Get airports by country
   */
  getAirportsByCountry(country: string): AsiaAirport[] {
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Get airports by region within Asia
   */
  getAirportsByRegion(region: string): AsiaAirport[] {
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      airport.region.toLowerCase() === region.toLowerCase()
    );
  }

  /**
   * Get major hubs only
   */
  getMajorHubs(): AsiaAirport[] {
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      airport.category === 'major_hub'
    );
  }

  /**
   * Get international gateways
   */
  getInternationalGateways(): AsiaAirport[] {
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      airport.isInternational && ['major_hub', 'hub', 'international_gateway'].includes(airport.category)
    );
  }

  /**
   * Get East Asian airports (China, Japan, Korea, Taiwan, HK, Macau, Mongolia)
   */
  getEastAsianAirports(): AsiaAirport[] {
    const eastAsianCountries = [
      'China', 'Japan', 'South Korea', 'Taiwan', 'Hong Kong', 'Macau', 'North Korea', 'Mongolia'
    ];
    
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      eastAsianCountries.includes(airport.country)
    );
  }

  /**
   * Get Southeast Asian airports
   */
  getSoutheastAsianAirports(): AsiaAirport[] {
    const southeastAsianCountries = [
      'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
      'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'East Timor'
    ];
    
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      southeastAsianCountries.includes(airport.country)
    );
  }

  /**
   * Get South Asian airports
   */
  getSouthAsianAirports(): AsiaAirport[] {
    const southAsianCountries = [
      'India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives', 'Afghanistan'
    ];
    
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      southAsianCountries.includes(airport.country)
    );
  }

  /**
   * Get Middle Eastern airports
   */
  getMiddleEasternAirports(): AsiaAirport[] {
    const middleEasternCountries = [
      'Turkey', 'Iran', 'Iraq', 'Syria', 'Lebanon', 'Jordan', 'Israel', 'Palestine',
      'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen'
    ];
    
    return ASIA_AIRPORTS_DATABASE.filter(airport => 
      middleEasternCountries.includes(airport.country)
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
export const asiaAirportSearch = new AsiaAirportSearchService();