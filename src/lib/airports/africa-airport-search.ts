/**
 * 🌍 AFRICA AIRPORT SEARCH SERVICE
 * Intelligent airport search service for African airports with instant results
 * Optimized for African market with comprehensive multi-language support
 */

import { AfricaAirport, AFRICA_AIRPORTS_DATABASE, createAfricaAirportSearchIndex } from './africa-airports-database';

export interface AfricaAirportSearchResult extends AfricaAirport {
  relevanceScore: number;
  matchType: 'exact' | 'starts_with' | 'contains' | 'fuzzy' | 'keyword';
  displayName: string;
  description: string;
}

export interface AfricaAirportSearchOptions {
  limit?: number;
  includeInternational?: boolean;
  includeRegional?: boolean;
  preferredCountries?: string[];
  preferredRegions?: string[];
  sortBy?: 'relevance' | 'name' | 'passenger_count' | 'alphabetical';
  minScore?: number;
}

class AfricaAirportSearchService {
  private searchIndex: Map<string, AfricaAirport[]>;
  private fuzzyCache = new Map<string, AfricaAirportSearchResult[]>();

  constructor() {
    this.searchIndex = createAfricaAirportSearchIndex();
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
   * Normalize text for better matching (handle accents, Arabic, special characters)
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
  private scoreAirport(airport: AfricaAirport, query: string): AfricaAirportSearchResult | null {
    const searchTerm = this.normalizeText(query);
    const iataCode = airport.iataCode.toLowerCase();
    const city = this.normalizeText(airport.city);
    const name = this.normalizeText(airport.name);
    const country = this.normalizeText(airport.country);
    
    let score = 0;
    let matchType: AfricaAirportSearchResult['matchType'] = 'contains';

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
    const passengerBoost = Math.min(airport.passengerCount / 25, 0.1);
    score += passengerBoost;

    // Boost score for major African cities
    const majorCities = [
      'cairo', 'johannesburg', 'cape town', 'lagos', 'nairobi', 'casablanca',
      'addis ababa', 'tunis', 'algiers', 'accra', 'dakar', 'dar es salaam',
      'luanda', 'kinshasa', 'abidjan', 'maputo', 'antananarivo', 'khartoum'
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
    options: AfricaAirportSearchOptions = {}
  ): Promise<AfricaAirportSearchResult[]> {
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

    const results = new Set<AfricaAirportSearchResult>();
    const scoreMap = new Map<string, number>();

    // Search through all airports
    for (const airport of AFRICA_AIRPORTS_DATABASE) {
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
  getAirportByCode(iataCode: string): AfricaAirport | null {
    const code = iataCode.toUpperCase();
    return AFRICA_AIRPORTS_DATABASE.find(airport => airport.iataCode === code) || null;
  }

  /**
   * Get popular airports for empty state
   */
  getPopularAirports(limit: number = 10): AfricaAirport[] {
    return AFRICA_AIRPORTS_DATABASE
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
   * Check if route is within Africa
   */
  isAfricanRoute(origin: string, destination: string): boolean {
    const originAirport = this.getAirportByCode(origin);
    const destinationAirport = this.getAirportByCode(destination);
    
    const africanCountries = [
      'Egypt', 'Morocco', 'South Africa', 'Nigeria', 'Kenya', 'Ethiopia',
      'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Ghana', 'Senegal', 'Côte d\'Ivoire',
      'Cameroon', 'Tanzania', 'Uganda', 'Rwanda', 'Mauritius', 'Seychelles',
      'Botswana', 'Namibia', 'Zambia', 'Zimbabwe', 'Mozambique', 'Angola',
      'Democratic Republic of Congo', 'Gabon', 'Mali', 'Burkina Faso', 'Niger',
      'Chad', 'Central African Republic', 'Republic of Congo', 'Equatorial Guinea',
      'Djibouti', 'Somalia', 'Eritrea', 'Madagascar', 'Malawi', 'Lesotho',
      'Swaziland', 'Gambia', 'Guinea-Bissau', 'Guinea', 'Sierra Leone', 'Liberia',
      'Togo', 'Benin', 'Cape Verde', 'São Tomé and Príncipe', 'Comoros'
    ];
    
    return africanCountries.includes(originAirport?.country || '') && 
           africanCountries.includes(destinationAirport?.country || '');
  }

  /**
   * Get timezone difference between airports (in hours)
   */
  getTimezoneDifference(origin: string, destination: string): number {
    const originAirport = this.getAirportByCode(origin);
    const destinationAirport = this.getAirportByCode(destination);
    
    if (!originAirport || !destinationAirport) return 0;

    // African timezone offsets (simplified)
    const timezoneOffsets: { [key: string]: number } = {
      // UTC+0
      'Africa/Casablanca': 1, // Morocco uses UTC+1
      'Africa/Accra': 0,
      'Africa/Dakar': 0,
      'Africa/Abidjan': 0,
      'Africa/Monrovia': 0,
      
      // UTC+1
      'Africa/Algiers': 1,
      'Africa/Tunis': 1,
      'Africa/Lagos': 1,
      'Africa/Douala': 1,
      'Africa/Libreville': 1,
      'Africa/Kinshasa': 1,
      'Africa/Luanda': 1,
      'Africa/Windhoek': 2, // Namibia uses UTC+2
      
      // UTC+2
      'Africa/Cairo': 2,
      'Africa/Johannesburg': 2,
      'Africa/Maputo': 2,
      'Africa/Harare': 2,
      'Africa/Lusaka': 2,
      'Africa/Kigali': 2,
      'Africa/Khartoum': 2,
      
      // UTC+3
      'Africa/Nairobi': 3,
      'Africa/Addis_Ababa': 3,
      'Africa/Dar_es_Salaam': 3,
      'Africa/Kampala': 3,
      'Africa/Djibouti': 3,
      'Africa/Mogadishu': 3,
      
      // Indian Ocean
      'Indian/Mauritius': 4,
      'Indian/Mahe': 4,
      'Indian/Antananarivo': 3
    };

    const originOffset = timezoneOffsets[originAirport.timezone] || 1;
    const destOffset = timezoneOffsets[destinationAirport.timezone] || 1;
    
    return destOffset - originOffset;
  }

  /**
   * Get airports by country
   */
  getAirportsByCountry(country: string): AfricaAirport[] {
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Get airports by region within Africa
   */
  getAirportsByRegion(region: string): AfricaAirport[] {
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      airport.region.toLowerCase() === region.toLowerCase()
    );
  }

  /**
   * Get major hubs only
   */
  getMajorHubs(): AfricaAirport[] {
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      airport.category === 'major_hub'
    );
  }

  /**
   * Get international gateways
   */
  getInternationalGateways(): AfricaAirport[] {
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      airport.isInternational && ['major_hub', 'hub', 'international_gateway'].includes(airport.category)
    );
  }

  /**
   * Get North African airports (Arab League countries)
   */
  getNorthAfricanAirports(): AfricaAirport[] {
    const northAfricanCountries = [
      'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Sudan'
    ];
    
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      northAfricanCountries.includes(airport.country)
    );
  }

  /**
   * Get Sub-Saharan African airports
   */
  getSubSaharanAirports(): AfricaAirport[] {
    const subSaharanCountries = [
      'South Africa', 'Nigeria', 'Kenya', 'Ethiopia', 'Ghana', 'Senegal',
      'Côte d\'Ivoire', 'Cameroon', 'Tanzania', 'Uganda', 'Rwanda', 'Mauritius',
      'Seychelles', 'Botswana', 'Namibia', 'Zambia', 'Zimbabwe', 'Mozambique',
      'Angola', 'Democratic Republic of Congo', 'Gabon', 'Mali', 'Burkina Faso',
      'Niger', 'Chad', 'Central African Republic', 'Republic of Congo',
      'Equatorial Guinea', 'Djibouti', 'Somalia', 'Eritrea', 'Madagascar',
      'Malawi', 'Lesotho', 'Swaziland', 'Gambia', 'Guinea-Bissau', 'Guinea',
      'Sierra Leone', 'Liberia', 'Togo', 'Benin', 'Cape Verde',
      'São Tomé and Príncipe', 'Comoros'
    ];
    
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      subSaharanCountries.includes(airport.country)
    );
  }

  /**
   * Get East African Community airports
   */
  getEACairports(): AfricaAirport[] {
    const eacCountries = [
      'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'South Sudan'
    ];
    
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      eacCountries.includes(airport.country)
    );
  }

  /**
   * Get Southern African Development Community airports
   */
  getSADCAirports(): AfricaAirport[] {
    const sadcCountries = [
      'South Africa', 'Botswana', 'Namibia', 'Zambia', 'Zimbabwe', 'Mozambique',
      'Angola', 'Democratic Republic of Congo', 'Tanzania', 'Malawi', 'Lesotho',
      'Swaziland', 'Madagascar', 'Mauritius', 'Seychelles'
    ];
    
    return AFRICA_AIRPORTS_DATABASE.filter(airport => 
      sadcCountries.includes(airport.country)
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
export const africaAirportSearch = new AfricaAirportSearchService();