/**
 * 🎯 API Optimization Manager
 * Elimina redundâncias e otimiza chamadas Amadeus APIs de forma segura
 */

import { AmadeusClient } from './amadeus-client';

export interface CachedApiData {
  pricingWithFareRules?: any;
  pricingWithBaggage?: any;
  brandedFares?: any;
  seatMaps?: any;
  otherServices?: any;
  timestamp: number;
  offerId: string;
}

export interface OptimizationConfig {
  cacheTimeout: number; // ms
  maxRetries: number;
  fallbackToIndividualCalls: boolean;
  enableLogging: boolean;
}

export class ApiOptimizationManager {
  private static instance: ApiOptimizationManager;
  private cache = new Map<string, CachedApiData>();
  private amadeusClient: AmadeusClient;
  private config: OptimizationConfig = {
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxRetries: 2,
    fallbackToIndividualCalls: true,
    enableLogging: true
  };

  private constructor() {
    // Lazy initialization to avoid issues in browser environment
    this.amadeusClient = {} as any;
    
    // Cleanup cache every 10 minutes (only in browser)
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
    }
  }

  private async getAmadeusClient(): Promise<AmadeusClient> {
    // 🛡️ Browser Environment Protection
    if (typeof window !== 'undefined') {
      throw new Error('AmadeusClient cannot be initialized in browser environment');
    }
    
    if (!this.amadeusClient) {
      try {
        // Server environment - require (for SSR compatibility)
        const { AmadeusClient } = require('./amadeus-client');
        this.amadeusClient = new AmadeusClient();
      } catch (error) {
        console.error('Failed to initialize AmadeusClient:', error);
        throw new Error('AmadeusClient initialization failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
    return this.amadeusClient;
  }

  static getInstance(): ApiOptimizationManager {
    if (!ApiOptimizationManager.instance) {
      ApiOptimizationManager.instance = new ApiOptimizationManager();
    }
    return ApiOptimizationManager.instance;
  }

  /**
   * 🎯 MAIN OPTIMIZATION METHOD
   * Gets all ancillary data with minimal API calls
   */
  async getOptimizedAncillaryData(
    flightOffers: any[],
    requiredData: {
      fareRules?: boolean;
      baggage?: boolean;
      brandedFares?: boolean;
      seatMaps?: boolean;
      otherServices?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    data: CachedApiData;
    apiCallsMade: number;
    source: 'cache' | 'optimized-api' | 'fallback' | 'browser-blocked';
    errors?: string[];
  }> {
    // 🛡️ Browser Environment Protection
    if (typeof window !== 'undefined') {
      this.log('⚠️ API calls blocked in browser environment');
      const offerId = this.generateOfferId(flightOffers[0]);
      return {
        success: false,
        data: this.createEmptyData(offerId),
        apiCallsMade: 0,
        source: 'browser-blocked',
        errors: ['API calls cannot be made from browser environment']
      };
    }
    const offerId = this.generateOfferId(flightOffers[0]);
    const cached = this.getCachedData(offerId);
    
    // Return cached data if valid and complete
    if (cached && this.isCacheValid(cached) && this.hasRequiredData(cached, requiredData)) {
      this.log('📊 Using cached data', offerId);
      return {
        success: true,
        data: cached,
        apiCallsMade: 0,
        source: 'cache'
      };
    }

    try {
      // Try optimized single API call first
      const optimizedResult = await this.tryOptimizedApiCall(flightOffers, requiredData);
      if (optimizedResult.success) {
        this.setCachedData(offerId, optimizedResult.data);
        return {
          ...optimizedResult,
          source: 'optimized-api'
        };
      }

      // Fallback to individual calls if enabled
      if (this.config.fallbackToIndividualCalls) {
        this.log('⚠️ Optimized call failed, falling back to individual calls', offerId);
        const fallbackResult = await this.tryFallbackApiCalls(flightOffers, requiredData);
        this.setCachedData(offerId, fallbackResult.data);
        return {
          ...fallbackResult,
          source: 'fallback'
        };
      }

      throw new Error('Optimized API call failed and fallback is disabled');

    } catch (error) {
      this.log('❌ All API optimization attempts failed', error);
      
      // Return partial cached data if available
      if (cached) {
        return {
          success: false,
          data: cached,
          apiCallsMade: 0,
          source: 'cache',
          errors: [error instanceof Error ? error.message : 'Unknown error']
        };
      }

      throw error;
    }
  }

  /**
   * 🚀 Try single optimized API call with all includes
   */
  private async tryOptimizedApiCall(
    flightOffers: any[],
    requiredData: any
  ): Promise<{ success: boolean; data: CachedApiData; apiCallsMade: number }> {
    
    const includes = this.buildIncludeParameters(requiredData);
    
    try {
      this.log('🎯 Attempting optimized single API call', { includes });
      
      // Use the most comprehensive API with all includes
      const amadeusClient = await this.getAmadeusClient();
      const response = await amadeusClient.confirmPricingWithAllIncludes(
        flightOffers,
        includes
      );

      if (response?.data?.flightOffers) {
        const extractedData = this.extractAllDataFromResponse(response);
        
        return {
          success: true,
          data: {
            ...extractedData,
            timestamp: Date.now(),
            offerId: this.generateOfferId(flightOffers[0])
          },
          apiCallsMade: 1
        };
      }

      throw new Error('Invalid response from optimized API call');

    } catch (error) {
      this.log('❌ Optimized API call failed', error);
      return {
        success: false,
        data: this.createEmptyData(this.generateOfferId(flightOffers[0])),
        apiCallsMade: 1
      };
    }
  }

  /**
   * 🔄 Fallback to individual API calls (existing behavior)
   */
  private async tryFallbackApiCalls(
    flightOffers: any[],
    requiredData: any
  ): Promise<{ success: boolean; data: CachedApiData; apiCallsMade: number }> {
    
    const results: any = {};
    let apiCallsMade = 0;
    const errors: string[] = [];

    // Only make calls for requested data that isn't cached
    const promises: Promise<any>[] = [];
    const amadeusClient = await this.getAmadeusClient();
    
    if (requiredData.fareRules) {
      promises.push(
        amadeusClient.confirmPricingWithFareRules(flightOffers)
          .then(result => { results.pricingWithFareRules = result; apiCallsMade++; })
          .catch(error => errors.push(`FareRules: ${error.message}`))
      );
    }

    if (requiredData.baggage) {
      promises.push(
        amadeusClient.getBaggageOptions(flightOffers)
          .then(result => { results.pricingWithBaggage = result; apiCallsMade++; })
          .catch(error => errors.push(`Baggage: ${error.message}`))
      );
    }

    if (requiredData.brandedFares) {
      promises.push(
        amadeusClient.getBrandedFareUpsell(flightOffers)
          .then(result => { results.brandedFares = result; apiCallsMade++; })
          .catch(error => errors.push(`BrandedFares: ${error.message}`))
      );
    }

    if (requiredData.seatMaps) {
      promises.push(
        amadeusClient.getSeatMaps(flightOffers)
          .then(result => { results.seatMaps = result; apiCallsMade++; })
          .catch(error => errors.push(`SeatMaps: ${error.message}`))
      );
    }

    // Execute all fallback calls in parallel
    await Promise.allSettled(promises);

    return {
      success: Object.keys(results).length > 0,
      data: {
        ...results,
        timestamp: Date.now(),
        offerId: this.generateOfferId(flightOffers[0])
      },
      apiCallsMade
    };
  }

  /**
   * Extract all relevant data from comprehensive API response
   */
  private extractAllDataFromResponse(response: any): Partial<CachedApiData> {
    const flightOffer = response.data?.flightOffers?.[0];
    if (!flightOffer) return {};

    return {
      // Extract fare rules from detailedFareRules
      pricingWithFareRules: flightOffer.detailedFareRules ? {
        data: { flightOffers: [{ ...flightOffer, detailedFareRules: flightOffer.detailedFareRules }] }
      } : undefined,

      // Extract baggage from includedServices or bags
      pricingWithBaggage: flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags ? {
        data: { flightOffers: [flightOffer] }
      } : undefined,

      // Extract branded fares if available
      brandedFares: flightOffer.fareOptions ? {
        data: { flightOffers: [{ ...flightOffer, fareOptions: flightOffer.fareOptions }] }
      } : undefined,

      // Extract other services
      otherServices: flightOffer.services ? {
        data: { services: flightOffer.services }
      } : undefined
    };
  }

  /**
   * Build include parameters based on required data
   */
  private buildIncludeParameters(requiredData: any): string {
    const includes: string[] = [];
    
    if (requiredData.fareRules) includes.push('detailed-fare-rules');
    if (requiredData.baggage) includes.push('bags');
    if (requiredData.otherServices) includes.push('other-services');
    if (requiredData.brandedFares) includes.push('branded-fares');
    
    return includes.join(',');
  }

  /**
   * Cache management methods
   */
  private generateOfferId(offer: any): string {
    return offer?.id || `${offer?.source || 'unknown'}_${offer?.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || 'xx'}_${Date.now()}`;
  }

  private getCachedData(offerId: string): CachedApiData | null {
    return this.cache.get(offerId) || null;
  }

  private setCachedData(offerId: string, data: CachedApiData): void {
    this.cache.set(offerId, data);
  }

  private isCacheValid(cached: CachedApiData): boolean {
    return (Date.now() - cached.timestamp) < this.config.cacheTimeout;
  }

  private hasRequiredData(cached: CachedApiData, required: any): boolean {
    if (required.fareRules && !cached.pricingWithFareRules) return false;
    if (required.baggage && !cached.pricingWithBaggage) return false;
    if (required.brandedFares && !cached.brandedFares) return false;
    if (required.seatMaps && !cached.seatMaps) return false;
    return true;
  }

  private createEmptyData(offerId: string): CachedApiData {
    return {
      timestamp: Date.now(),
      offerId
    };
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (now - data.timestamp > this.config.cacheTimeout) {
        this.cache.delete(key);
      }
    }
    this.log(`🧹 Cache cleanup: ${this.cache.size} entries remaining`);
  }

  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[API-OPT] ${message}`, data || '');
    }
  }

  /**
   * 📊 Get optimization statistics
   */
  getStatistics() {
    return {
      cacheSize: this.cache.size,
      config: this.config,
      cacheEntries: Array.from(this.cache.keys())
    };
  }

  /**
   * 🔧 Update configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 🗑️ Clear cache manually
   */
  clearCache(): void {
    this.cache.clear();
    this.log('🗑️ Cache manually cleared');
  }
}