/**
 * 🎯 Real Data Flight Client
 * Maximizes real data extraction from Amadeus APIs
 */

import { AmadeusClient } from './amadeus-client';
import { extractRealFareRulesData, formatFareRulesForDisplay, type RealFareRulesData } from './enhanced-fare-rules-parser';
import type { ProcessedFlightOffer, FlightSearchParams } from '@/types/flights';

export interface EnhancedFlightOffer extends ProcessedFlightOffer {
  realFareRules: RealFareRulesData;
  fareRulesDisplay: ReturnType<typeof formatFareRulesForDisplay>;
  dataQuality: {
    overall: number; // 0-100
    refundDataQuality: number;
    changeDataQuality: number;
    baggageDataQuality: number;
    fareTypeDataQuality: number;
  };
}

export class RealDataFlightClient {
  private amadeusClient: AmadeusClient;

  constructor() {
    this.amadeusClient = new AmadeusClient();
  }

  /**
   * Search flights with maximum real data extraction
   */
  async searchWithRealData(params: FlightSearchParams): Promise<{
    offers: EnhancedFlightOffer[];
    summary: {
      totalOffers: number;
      offersWithRealData: number;
      averageDataQuality: number;
      dataSourceBreakdown: Record<string, number>;
    };
  }> {
    console.log('🎯 Starting enhanced flight search with maximum real data...');

    // Step 1: Basic flight search
    const searchResponse = await this.amadeusClient.searchFlights(params);
    if (!searchResponse?.data?.length) {
      throw new Error('No flight offers found');
    }

    console.log(`✈️ Found ${searchResponse.data.length} initial offers`);

    // Step 2: Get enhanced pricing for ALL offers (in batches)
    const enhancedOffers = await this.getEnhancedPricingInBatches(searchResponse.data);

    // Step 3: Get additional services data
    const offersWithServices = await this.getAdditionalServicesData(enhancedOffers);

    // Step 4: Process and enhance each offer
    const processedOffers: EnhancedFlightOffer[] = [];
    const dataSourceStats: Record<string, number> = {};

    for (const offer of offersWithServices) {
      try {
        // Extract maximum real data
        const realFareRules = extractRealFareRulesData(offer);
        const fareRulesDisplay = formatFareRulesForDisplay(realFareRules);
        
        // Calculate data quality scores
        const dataQuality = this.calculateDataQuality(realFareRules);
        
        // Track data sources
        this.trackDataSources(realFareRules, dataSourceStats);

        // Create enhanced offer (assuming base processing exists)
        const enhancedOffer: EnhancedFlightOffer = {
          ...offer, // Base processed offer
          realFareRules,
          fareRulesDisplay,
          dataQuality
        };

        processedOffers.push(enhancedOffer);

      } catch (error) {
        console.warn('Error processing offer:', error);
        // Continue with next offer
      }
    }

    // Calculate summary statistics
    const summary = {
      totalOffers: processedOffers.length,
      offersWithRealData: processedOffers.filter(o => o.dataQuality.overall > 50).length,
      averageDataQuality: processedOffers.reduce((sum, o) => sum + o.dataQuality.overall, 0) / processedOffers.length,
      dataSourceBreakdown: dataSourceStats
    };

    console.log('📊 Real data extraction summary:', summary);

    return {
      offers: processedOffers,
      summary
    };
  }

  /**
   * Get enhanced pricing with detailed fare rules in batches
   */
  private async getEnhancedPricingInBatches(offers: any[]): Promise<any[]> {
    const BATCH_SIZE = 5; // Amadeus API limit
    const enhancedOffers: any[] = [];

    for (let i = 0; i < offers.length; i += BATCH_SIZE) {
      const batch = offers.slice(i, i + BATCH_SIZE);
      
      try {
        console.log(`🔍 Getting detailed fare rules for batch ${Math.floor(i/BATCH_SIZE) + 1}...`);
        
        // Get detailed fare rules
        const detailedResponse = await this.amadeusClient.confirmPricingWithFareRules(batch);
        
        if (detailedResponse?.data?.flightOffers) {
          enhancedOffers.push(...detailedResponse.data.flightOffers);
        } else {
          // Fallback to basic pricing
          console.warn('⚠️ Detailed fare rules failed, trying basic pricing...');
          const basicResponse = await this.amadeusClient.confirmPricing(batch);
          if (basicResponse?.data?.flightOffers) {
            enhancedOffers.push(...basicResponse.data.flightOffers);
          } else {
            // Use original offers if pricing fails
            enhancedOffers.push(...batch);
          }
        }

        // Rate limiting - wait between batches
        if (i + BATCH_SIZE < offers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.warn(`⚠️ Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, error);
        // Use original offers for this batch
        enhancedOffers.push(...batch);
      }
    }

    return enhancedOffers;
  }

  /**
   * Get additional services data (bags, etc.)
   */
  private async getAdditionalServicesData(offers: any[]): Promise<any[]> {
    const offersWithServices: any[] = [];

    for (const offer of offers.slice(0, 10)) { // Limit to first 10 for performance
      try {
        // Get baggage information
        const baggageResponse = await this.amadeusClient.getBaggageOptions([offer]);
        
        if (baggageResponse?.data?.flightOffers?.[0]) {
          offersWithServices.push(baggageResponse.data.flightOffers[0]);
        } else {
          offersWithServices.push(offer);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.warn('⚠️ Additional services failed for offer:', error);
        offersWithServices.push(offer);
      }
    }

    // Add remaining offers without additional services
    offersWithServices.push(...offers.slice(10));

    return offersWithServices;
  }

  /**
   * Calculate data quality scores
   */
  private calculateDataQuality(fareRules: RealFareRulesData) {
    const refundDataQuality = fareRules.refund.confidence;
    const changeDataQuality = fareRules.change.confidence;
    const baggageDataQuality = fareRules.baggage.checked.dataSource === 'api' ? 95 : 
                              fareRules.baggage.checked.dataSource === 'fare-rules' ? 80 : 50;
    const fareTypeDataQuality = fareRules.fareType.confidence;

    const overall = Math.round((refundDataQuality + changeDataQuality + baggageDataQuality + fareTypeDataQuality) / 4);

    return {
      overall,
      refundDataQuality,
      changeDataQuality,
      baggageDataQuality,
      fareTypeDataQuality
    };
  }

  /**
   * Track data sources for statistics
   */
  private trackDataSources(fareRules: RealFareRulesData, stats: Record<string, number>): void {
    const sources = [
      fareRules.refund.dataSource,
      fareRules.change.dataSource,
      fareRules.baggage.checked.dataSource,
      fareRules.fareType.dataSource
    ];

    sources.forEach(source => {
      stats[source] = (stats[source] || 0) + 1;
    });
  }

  /**
   * Get single offer with maximum data
   */
  async getOfferWithMaximumData(offerId: string, originalOffer: any): Promise<EnhancedFlightOffer> {
    console.log('🎯 Getting maximum data for single offer...');

    try {
      // Get all possible data sources
      const [detailedPricing, baggageData] = await Promise.allSettled([
        this.amadeusClient.confirmPricingWithFareRules([originalOffer]),
        this.amadeusClient.getBaggageOptions([originalOffer])
      ]);

      // Merge data from all sources
      let enhancedOffer = originalOffer;

      if (detailedPricing.status === 'fulfilled' && detailedPricing.value?.data?.flightOffers?.[0]) {
        enhancedOffer = { ...enhancedOffer, ...detailedPricing.value.data.flightOffers[0] };
      }

      if (baggageData.status === 'fulfilled' && baggageData.value?.data?.flightOffers?.[0]) {
        enhancedOffer = { ...enhancedOffer, ...baggageData.value.data.flightOffers[0] };
      }

      // Extract and format real data
      const realFareRules = extractRealFareRulesData(enhancedOffer);
      const fareRulesDisplay = formatFareRulesForDisplay(realFareRules);
      const dataQuality = this.calculateDataQuality(realFareRules);

      return {
        ...enhancedOffer,
        realFareRules,
        fareRulesDisplay,
        dataQuality
      };

    } catch (error) {
      console.error('Error getting maximum data:', error);
      throw error;
    }
  }

  /**
   * Get real-time fare rules for display
   */
  getRealTimeFareRules(offer: EnhancedFlightOffer) {
    const rules = offer.fareRulesDisplay;
    
    return {
      refund: {
        text: rules.refund.display,
        confidence: rules.refund.confidence,
        isReal: rules.refund.source === 'api' || rules.refund.source === 'fare-rules',
        color: offer.realFareRules.refund.allowed === true ? 'green' : 
               offer.realFareRules.refund.allowed === false ? 'red' : 'yellow'
      },
      change: {
        text: rules.change.display,
        confidence: rules.change.confidence,
        isReal: rules.change.source === 'api' || rules.change.source === 'fare-rules',
        color: offer.realFareRules.change.allowed === true ? 'blue' : 
               offer.realFareRules.change.allowed === false ? 'red' : 'yellow'
      },
      baggage: {
        text: rules.baggage.checked.display,
        isReal: rules.baggage.checked.source === 'api',
        color: offer.realFareRules.baggage.checked.included ? 'green' : 'red'
      },
      fareType: {
        text: rules.fareType.display,
        confidence: rules.fareType.confidence,
        isReal: rules.fareType.source === 'api' || rules.fareType.source === 'fare-basis'
      }
    };
  }
}