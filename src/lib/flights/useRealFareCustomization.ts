/**
 * 🎯 Real Fare Customization Hook
 * Substitui dados mockup por dados reais da API Amadeus de forma segura
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProcessedFlightOffer } from '@/types/flights';
import { safeApiClient } from './safe-api-client';

export interface RealUpsellOption {
  id: string;
  type: 'change' | 'refund' | 'seat' | 'bag' | 'class' | 'bundle';
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  currency: string;
  available: boolean;
  dataSource: 'api' | 'estimated' | 'unavailable';
  confidence: number; // 0-100
  category: 'popular' | 'savings' | 'premium';
  popular?: boolean;
  bundle?: boolean;
  restrictions?: string[];
  validUntil?: Date;
}

export interface RealCustomizationData {
  basePrice: number;
  currency: string;
  totalUpgrade: number;
  totalSavings: number;
  finalPrice: number;
  options: RealUpsellOption[];
  dataQuality: {
    overall: number;
    breakdown: Record<string, number>;
  };
  lastUpdated: Date;
  errors: string[];
}

export interface UseRealFareCustomizationOptions {
  autoLoad?: boolean;
  enableFallback?: boolean;
  cacheTimeout?: number;
}

export function useRealFareCustomization(
  offer: ProcessedFlightOffer,
  options: UseRealFareCustomizationOptions = {}
) {
  const {
    autoLoad = false,
    enableFallback = true,
    cacheTimeout = 5 * 60 * 1000 // 5 minutes
  } = options;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RealCustomizationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  // Use safe API client instead of direct API manager
  const apiClient = useMemo(() => safeApiClient, []);

  /**
   * 🎯 Load real customization data from APIs
   */
  const loadRealCustomizationData = useCallback(async () => {
    try {
      if (!offer?.rawOffer) {
        setError('No flight offer data available');
        return;
      }

      setLoading(true);
      setError(null);

      console.log('🔄 Loading real customization data for offer:', offer.id);

      // Use safe API client to get customization options
      const result = await apiClient.callAmadeusApi(
        '/customization-options',
        {
          flightOffer: offer.rawOffer,
          includes: ['fare-rules', 'baggage', 'branded-fares', 'seat-maps', 'other-services']
        },
        {
          method: 'POST',
          useCache: true,
          cacheKey: `customization-${offer.id}`
        }
      );

      if (result.success && result.data) {
        try {
          const realOptions = await extractRealUpsellOptions(result.data, offer);
          const customizationData = buildCustomizationData(realOptions || [], offer);
          
          setData(customizationData);
          console.log(`✅ Real customization data loaded from ${result.source}`);
        } catch (extractError) {
          console.warn('Error extracting real data, using fallback:', extractError);
          if (enableFallback) {
            const fallbackData = generateFallbackCustomizationData(offer);
            setData(fallbackData);
          } else {
            throw extractError;
          }
        }
      } else {
        throw new Error(`Failed to load customization data: ${result.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('❌ Failed to load real customization data:', error);
      
      if (enableFallback) {
        console.log('🔄 Falling back to estimated data...');
        const fallbackData = generateFallbackCustomizationData(offer);
        setData(fallbackData);
      } else {
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, [offer, apiClient, enableFallback]);

  /**
   * Extract real upsell options from API data
   */
  const extractRealUpsellOptions = async (
    apiData: any,
    offer: ProcessedFlightOffer
  ): Promise<RealUpsellOption[]> => {
    try {
      const options: RealUpsellOption[] = [];

      // Extract baggage options with safety checks
      if (apiData?.pricingWithBaggage?.data?.flightOffers?.[0]) {
        try {
          const baggageOptions = extractBaggageOptions(apiData.pricingWithBaggage.data.flightOffers[0]);
          if (Array.isArray(baggageOptions)) {
            options.push(...baggageOptions);
          }
        } catch (error) {
          console.warn('Error extracting baggage options:', error);
        }
      }

      // Extract branded fare options with safety checks
      if (apiData?.brandedFares?.data?.flightOffers) {
        try {
          const fareOptions = extractBrandedFareOptions(apiData.brandedFares.data.flightOffers, offer);
          if (Array.isArray(fareOptions)) {
            options.push(...fareOptions);
          }
        } catch (error) {
          console.warn('Error extracting branded fare options:', error);
        }
      }

      // Extract seat options with safety checks
      if (apiData?.seatMaps?.data) {
        try {
          const seatOptions = extractSeatOptions(apiData.seatMaps.data);
          if (Array.isArray(seatOptions)) {
            options.push(...seatOptions);
          }
        } catch (error) {
          console.warn('Error extracting seat options:', error);
        }
      }

      // Extract change/refund options from fare rules with safety checks
      if (apiData?.pricingWithFareRules?.data?.flightOffers?.[0]) {
        try {
          const policyOptions = extractPolicyOptions(apiData.pricingWithFareRules.data.flightOffers[0]);
          if (Array.isArray(policyOptions)) {
            options.push(...policyOptions);
          }
        } catch (error) {
          console.warn('Error extracting policy options:', error);
        }
      }

      return options;
    } catch (error) {
      console.error('Critical error in extractRealUpsellOptions:', error);
      return []; // Return empty array instead of failing
    }
  };

  /**
   * Extract baggage options from API response
   */
  const extractBaggageOptions = (flightOffer: any): RealUpsellOption[] => {
    const options: RealUpsellOption[] = [];
    
    // Check for additional baggage services
    const services = flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.additionalServices?.chargeableCheckedBags;
    
    if (services?.length > 0) {
      services.forEach((bag: any, index: number) => {
        if (bag.quantity > 0 && bag.weight) {
          options.push({
            id: `extra-bag-${index}`,
            type: 'bag',
            title: `Extra Bag (${bag.weight}${bag.weightUnit || 'kg'})`,
            description: `Additional checked baggage`,
            price: parseFloat(bag.price?.amount || '0'),
            currency: bag.price?.currency || offer.currency,
            available: true,
            dataSource: 'api',
            confidence: 95,
            category: 'savings'
          });
        }
      });
    }

    // Fallback estimated baggage if no API data
    if (options.length === 0) {
      options.push({
        id: 'extra-bag-estimated',
        type: 'bag',
        title: 'Extra Bag (23kg)',
        description: 'Additional checked baggage',
        price: 35,
        currency: offer.currency,
        available: true,
        dataSource: 'estimated',
        confidence: 60,
        category: 'savings',
        restrictions: ['Price estimated - confirm at booking']
      });
    }

    return options;
  };

  /**
   * Extract branded fare options
   */
  const extractBrandedFareOptions = (flightOffers: any[], baseOffer: ProcessedFlightOffer): RealUpsellOption[] => {
    const options: RealUpsellOption[] = [];
    const basePrice = parseFloat(baseOffer.totalPrice.replace(/[^0-9.]/g, ''));

    flightOffers.forEach((offer: any) => {
      const fareDetails = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
      const brandedFare = fareDetails?.brandedFare;
      const offerPrice = parseFloat(offer.price?.total || '0');
      
      if (brandedFare && offerPrice > basePrice) {
        const priceDiff = offerPrice - basePrice;
        
        options.push({
          id: `branded-fare-${brandedFare.toLowerCase()}`,
          type: 'bundle',
          title: `${brandedFare} Fare`,
          description: 'Enhanced fare with additional benefits',
          price: priceDiff,
          currency: offer.price?.currency || baseOffer.currency,
          available: true,
          dataSource: 'api',
          confidence: 90,
          category: 'popular',
          popular: brandedFare.toLowerCase().includes('flex')
        });
      }
    });

    return options;
  };

  /**
   * Extract seat options
   */
  const extractSeatOptions = (seatMapData: any): RealUpsellOption[] => {
    const options: RealUpsellOption[] = [];
    
    // Look for seat pricing in seat map data
    const seatMaps = seatMapData.seatMaps || [];
    
    seatMaps.forEach((seatMap: any) => {
      const deck = seatMap.aircraft?.seatMaps?.[0];
      if (deck?.seats) {
        const paidSeats = deck.seats.filter((seat: any) => seat.price?.amount);
        
        if (paidSeats.length > 0) {
          const avgPrice = paidSeats.reduce((sum: number, seat: any) => sum + parseFloat(seat.price.amount), 0) / paidSeats.length;
          
          options.push({
            id: 'seat-selection',
            type: 'seat',
            title: 'Seat Selection',
            description: 'Choose your preferred seat',
            price: Math.round(avgPrice),
            currency: paidSeats[0].price.currency,
            available: true,
            dataSource: 'api',
            confidence: 85,
            category: 'savings'
          });
        }
      }
    });

    // Fallback estimated seat pricing
    if (options.length === 0) {
      options.push({
        id: 'seat-estimated',
        type: 'seat',
        title: 'Seat Selection',
        description: 'Choose your preferred seat',
        price: 15,
        currency: 'USD',
        available: true,
        dataSource: 'estimated',
        confidence: 60,
        category: 'savings',
        restrictions: ['Price estimated - confirm at booking']
      });
    }

    return options;
  };

  /**
   * Extract change/refund options from fare rules
   */
  const extractPolicyOptions = (flightOffer: any): RealUpsellOption[] => {
    const options: RealUpsellOption[] = [];
    
    // Check pricing options for policy data
    const pricingOptions = flightOffer.pricingOptions;
    
    if (pricingOptions) {
      // Free changes option
      if (pricingOptions.noPenaltyFare === false) {
        options.push({
          id: 'free-changes',
          type: 'change',
          title: 'Free Changes',
          description: 'Change dates without fees',
          price: 45,
          originalPrice: 75,
          savings: 30,
          currency: 'USD',
          available: true,
          dataSource: 'estimated', // API doesn't provide upgrade pricing for policies
          confidence: 70,
          category: 'popular',
          popular: true
        });
      }

      // Refundable option
      if (pricingOptions.refundableFare === false) {
        options.push({
          id: 'refundable',
          type: 'refund',
          title: 'Refundable',
          description: 'Get money back if you cancel',
          price: 85,
          originalPrice: 120,
          savings: 35,
          currency: 'USD',
          available: true,
          dataSource: 'estimated',
          confidence: 70,
          category: 'popular',
          popular: true
        });
      }
    }

    return options;
  };

  /**
   * Build final customization data structure
   */
  const buildCustomizationData = (
    options: RealUpsellOption[],
    offer: ProcessedFlightOffer
  ): RealCustomizationData => {
    const basePrice = parseFloat(offer.totalPrice.replace(/[^0-9.]/g, ''));
    
    // Calculate data quality
    const apiOptions = options.filter(opt => opt.dataSource === 'api').length;
    const totalOptions = options.length;
    const overallQuality = totalOptions > 0 ? Math.round((apiOptions / totalOptions) * 100) : 0;
    
    const breakdown = options.reduce((acc, opt) => {
      acc[opt.type] = opt.confidence;
      return acc;
    }, {} as Record<string, number>);

    return {
      basePrice,
      currency: offer.currency,
      totalUpgrade: 0,
      totalSavings: 0,
      finalPrice: basePrice,
      options: options.sort((a, b) => b.confidence - a.confidence), // Sort by confidence
      dataQuality: {
        overall: overallQuality,
        breakdown
      },
      lastUpdated: new Date(),
      errors: []
    };
  };

  /**
   * Generate fallback data when APIs fail
   */
  const generateFallbackCustomizationData = (offer: ProcessedFlightOffer): RealCustomizationData => {
    const basePrice = parseFloat(offer.totalPrice.replace(/[^0-9.]/g, ''));
    
    const fallbackOptions: RealUpsellOption[] = [
      {
        id: 'extra-bag-fallback',
        type: 'bag',
        title: 'Extra Bag (23kg)',
        description: 'Additional checked baggage',
        price: 35,
        currency: offer.currency,
        available: true,
        dataSource: 'estimated',
        confidence: 50,
        category: 'savings',
        restrictions: ['Price estimated - confirm at booking']
      },
      {
        id: 'seat-fallback',
        type: 'seat',
        title: 'Seat Selection',
        description: 'Choose your preferred seat',
        price: 15,
        currency: offer.currency,
        available: true,
        dataSource: 'estimated',
        confidence: 50,
        category: 'savings',
        restrictions: ['Price estimated - confirm at booking']
      }
    ];

    return {
      basePrice,
      currency: offer.currency,
      totalUpgrade: 0,
      totalSavings: 0,
      finalPrice: basePrice,
      options: fallbackOptions,
      dataQuality: {
        overall: 50,
        breakdown: { bag: 50, seat: 50 }
      },
      lastUpdated: new Date(),
      errors: ['Using estimated data - API unavailable']
    };
  };

  /**
   * Calculate totals when options are selected
   */
  const selectedData = useMemo(() => {
    if (!data) return null;

    const selectedOpts = data.options.filter(opt => selectedOptions.has(opt.id));
    const totalUpgrade = selectedOpts.reduce((sum, opt) => sum + opt.price, 0);
    const totalSavings = selectedOpts.reduce((sum, opt) => sum + (opt.savings || 0), 0);

    return {
      ...data,
      totalUpgrade,
      totalSavings,
      finalPrice: data.basePrice + totalUpgrade,
      selectedOptions: selectedOpts
    };
  }, [data, selectedOptions]);

  /**
   * Auto-load on mount if enabled
   */
  useEffect(() => {
    // Only auto-load if we have valid offer data and not already loading
    if (autoLoad && offer?.id && offer?.rawOffer && !loading && !data) {
      // Add small delay to prevent rapid consecutive calls
      const timeoutId = setTimeout(() => {
        loadRealCustomizationData().catch(error => {
          console.warn('Auto-load failed:', error);
        });
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [autoLoad, offer?.id, loading, data]); // Removed loadRealCustomizationData to prevent infinite loops

  return {
    loading,
    data: selectedData,
    error,
    selectedOptions,
    setSelectedOptions,
    loadRealCustomizationData,
    refresh: loadRealCustomizationData,
    statistics: { cacheSize: 0, config: {}, cacheEntries: [] }
  };
}