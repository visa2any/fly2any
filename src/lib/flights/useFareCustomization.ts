'use client';

/**
 * 🧮 useFareCustomization Hook
 * Gerencia estado de customização de tarifas com cálculos dinâmicos e integração com APIs
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ProcessedFlightOffer } from '@/types/flights';
import { safeApiClient } from '@/lib/flights/safe-api-client';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface UpsellOption {
  id: string;
  type: 'refund' | 'change' | 'bag' | 'seat' | 'class' | 'meal' | 'wifi';
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  popular?: boolean;
  bundle?: boolean;
  category: 'popular' | 'savings' | 'premium';
  available: boolean;
  source: 'api' | 'estimated' | 'calculated';
  icon?: React.ComponentType<any>; // For UI display
  metadata?: {
    segmentIds?: string[];
    travelerIds?: string[];
    restrictions?: string[];
    validUntil?: string;
  };
}

export interface FareBundle {
  id: string;
  name: string;
  description: string;
  options: string[]; // UpsellOption IDs
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  popular?: boolean;
}

export interface FareCustomization {
  selectedOptions: UpsellOption[];
  selectedBundles: FareBundle[];
  basePrice: number;
  upgradePrice: number;
  totalPrice: number;
  totalSavings: number;
  priceBreakdown: {
    base: number;
    upgrades: number;
    bundles: number;
    taxes: number;
    fees: number;
  };
}

export interface UseFareCustomizationOptions {
  offer: ProcessedFlightOffer;
  autoLoadUpsells?: boolean;
  enableBundles?: boolean;
  maxUpsellRequests?: number;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useFareCustomization({
  offer,
  autoLoadUpsells = true,
  enableBundles = true,
  maxUpsellRequests = 3
}: UseFareCustomizationOptions) {
  
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [selectedBundles, setSelectedBundles] = useState<Set<string>>(new Set());
  const [availableOptions, setAvailableOptions] = useState<UpsellOption[]>([]);
  const [availableBundles, setAvailableBundles] = useState<FareBundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<{
    brandedFares?: any;
    baggage?: any;
    seatMaps?: any;
  }>({});

  // ========================================================================
  // BASE PRICE CALCULATION
  // ========================================================================
  
  const basePrice = useMemo(() => {
    return parseFloat(offer.totalPrice.replace(/[^0-9.]/g, ''));
  }, [offer.totalPrice]);

  // ========================================================================
  // LOAD UPSELL DATA FROM AMADEUS API
  // ========================================================================
  
  const loadUpsellData = useCallback(async () => {
    if (!autoLoadUpsells) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use safe API client instead of direct Amadeus calls
      const result = await safeApiClient.callAmadeusApi(
        '/customization-options',
        {
          flightOffer: offer.rawOffer,
          includes: ['branded-fares', 'baggage', 'seat-maps']
        },
        {
          method: 'POST',
          useCache: true,
          cacheKey: `upsell-${offer.id}`
        }
      );

      if (result.success && result.data) {
        const apiResponseData = result.data as any;
        const pricingWithBaggage = apiResponseData.pricingWithBaggage || null;
        const brandedFares = apiResponseData.brandedFares || null;
        const seatMaps = apiResponseData.seatMaps || null;
        
        setApiData({
          brandedFares: brandedFares,
          baggage: pricingWithBaggage,
          seatMaps: seatMaps
        });
        
        console.log('🎯 Upsell data loaded from', result.source);
      } else {
        console.warn('⚠️ Failed to load upsell data:', result.error);
        setError('Failed to load upgrade options');
      }
      
    } catch (error) {
      console.error('❌ Failed to load upsell data:', error);
      setError('Failed to load upgrade options');
    } finally {
      setLoading(false);
    }
  }, [offer.rawOffer, autoLoadUpsells]);

  // ========================================================================
  // GENERATE UPSELL OPTIONS FROM API DATA
  // ========================================================================
  
  const generateOptionsFromAPI = useCallback((): UpsellOption[] => {
    const options: UpsellOption[] = [];
    
    // Branded Fares (Refund/Change policies)
    if (apiData.brandedFares?.data) {
      const brandedOffers = apiData.brandedFares.data;
      
      brandedOffers.forEach((brandedOffer: any, index: number) => {
        if (brandedOffer.price && brandedOffer.price.total) {
          const upgradePrice = parseFloat(brandedOffer.price.total) - basePrice;
          
          if (upgradePrice > 0) {
            const brandedFare = brandedOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare;
            
            // Determine option type based on branded fare name
            let type: UpsellOption['type'] = 'change';
            let title = 'Flexible Fare';
            let category: UpsellOption['category'] = 'popular';
            
            if (brandedFare?.toLowerCase().includes('flex')) {
              type = 'change';
              title = 'Flexible Fare';
              category = 'popular';
            } else if (brandedFare?.toLowerCase().includes('premium')) {
              type = 'class';
              title = 'Premium Fare';
              category = 'premium';
            }
            
            options.push({
              id: `branded-${index}`,
              type,
              title,
              description: brandedFare || 'Enhanced fare option',
              price: Math.round(upgradePrice),
              category,
              available: true,
              source: 'api',
              popular: category === 'popular',
              metadata: {
                validUntil: brandedOffer.lastTicketingDate
              }
            });
          }
        }
      });
    }
    
    // Baggage Options
    if (apiData.baggage?.data?.bags) {
      const bags = apiData.baggage.data.bags;
      
      Object.entries(bags).forEach(([bagId, bagData]: [string, any]) => {
        if (bagData.price && bagData.price.amount) {
          options.push({
            id: `bag-${bagId}`,
            type: 'bag',
            title: `${bagData.name?.replace('_', ' ') || 'Extra Bag'}`,
            description: `${bagData.quantity || 1}x checked bag`,
            price: Math.round(parseFloat(bagData.price.amount)),
            category: 'savings',
            available: bagData.bookableByItinerary,
            source: 'api',
            metadata: {
              segmentIds: bagData.segmentIds,
              travelerIds: bagData.travelerIds
            }
          });
        }
      });
    }
    
    // Seat Options (from seat maps)
    if (apiData.seatMaps?.data) {
      const seatMaps = apiData.seatMaps.data;
      
      // Find premium seats and calculate average price
      let premiumSeatFound = false;
      let premiumPrice = 25; // Default estimate
      
      seatMaps.forEach((seatMap: any) => {
        seatMap.decks?.forEach((deck: any) => {
          deck.seats?.forEach((seat: any) => {
            if (seat.travelerPricing?.[0]?.price?.total) {
              const seatPrice = parseFloat(seat.travelerPricing[0].price.total);
              if (seatPrice > 0 && !premiumSeatFound) {
                premiumPrice = Math.round(seatPrice);
                premiumSeatFound = true;
              }
            }
          });
        });
      });
      
      if (premiumSeatFound) {
        options.push({
          id: 'seat-selection',
          type: 'seat',
          title: 'Choose Seat',
          description: 'Select your preferred seat',
          price: premiumPrice,
          category: 'savings',
          available: true,
          source: 'api',
          popular: premiumPrice <= 20
        });
      }
    }
    
    return options;
  }, [apiData, basePrice]);

  // ========================================================================
  // FALLBACK OPTIONS (when API fails)
  // ========================================================================
  
  const generateFallbackOptions = useCallback((): UpsellOption[] => {
    // Extract current fare rules to make intelligent estimates
    const currentFareType = offer.rawOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare?.toLowerCase();
    const isBasicFare = currentFareType?.includes('light') || currentFareType?.includes('basic');
    const checkedBags = offer.rawOffer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0;
    
    return [
      // Refund/Change options based on fare type
      {
        id: 'refundable-estimated',
        type: 'refund',
        title: 'Refundable',
        description: 'Cancel and get money back',
        price: isBasicFare ? 85 : 65,
        originalPrice: isBasicFare ? 120 : 95,
        savings: isBasicFare ? 35 : 30,
        category: 'popular',
        available: true,
        source: 'estimated',
        popular: true
      },
      {
        id: 'free-changes-estimated',
        type: 'change',
        title: 'Free Changes',
        description: 'Change dates without penalty',
        price: isBasicFare ? 45 : 35,
        originalPrice: isBasicFare ? 75 : 55,
        savings: isBasicFare ? 30 : 20,
        category: 'popular',
        available: true,
        source: 'estimated',
        popular: true
      },
      // Baggage options based on current allowance
      ...(checkedBags === 0 ? [{
        id: 'first-bag-estimated',
        type: 'bag' as const,
        title: 'Add Checked Bag',
        description: '23kg checked bag',
        price: 35,
        category: 'savings' as const,
        available: true,
        source: 'estimated' as const
      }] : [{
        id: 'extra-bag-estimated',
        type: 'bag' as const,
        title: 'Extra Bag',
        description: 'Additional 23kg bag',
        price: 45,
        category: 'savings' as const,
        available: true,
        source: 'estimated' as const
      }]),
      // Seat selection
      {
        id: 'seat-selection-estimated',
        type: 'seat',
        title: 'Choose Seat',
        description: 'Pick your preferred seat',
        price: 15,
        category: 'savings',
        available: true,
        source: 'estimated'
      },
      // Class upgrade
      {
        id: 'business-estimated',
        type: 'class',
        title: 'Business Class',
        description: 'Premium cabin upgrade',
        price: 250,
        category: 'premium',
        available: true,
        source: 'estimated'
      }
    ];
  }, [offer.rawOffer]);

  // ========================================================================
  // GENERATE SMART BUNDLES
  // ========================================================================
  
  const generateBundles = useCallback((options: UpsellOption[]): FareBundle[] => {
    if (!enableBundles) return [];
    
    const bundles: FareBundle[] = [];
    
    // Flexibility Bundle (Refund + Change)
    const refundOption = options.find(opt => opt.type === 'refund');
    const changeOption = options.find(opt => opt.type === 'change');
    
    if (refundOption && changeOption) {
      const originalPrice = refundOption.price + changeOption.price;
      const bundlePrice = Math.round(originalPrice * 0.85); // 15% discount
      
      bundles.push({
        id: 'flexibility-bundle',
        name: 'Flexibility Bundle',
        description: 'Free changes + Full refund',
        options: [refundOption.id, changeOption.id],
        originalPrice,
        bundlePrice,
        savings: originalPrice - bundlePrice,
        popular: true
      });
    }
    
    // Travel Bundle (Bag + Seat + Priority)
    const bagOption = options.find(opt => opt.type === 'bag');
    const seatOption = options.find(opt => opt.type === 'seat');
    
    if (bagOption && seatOption) {
      const originalPrice = bagOption.price + seatOption.price + 25; // +priority boarding
      const bundlePrice = Math.round(originalPrice * 0.8); // 20% discount
      
      bundles.push({
        id: 'travel-bundle',
        name: 'Travel Bundle',
        description: 'Extra bag + Seat + Priority boarding',
        options: [bagOption.id, seatOption.id],
        originalPrice,
        bundlePrice,
        savings: originalPrice - bundlePrice
      });
    }
    
    return bundles;
  }, [enableBundles]);

  // ========================================================================
  // UPDATE OPTIONS WHEN API DATA CHANGES
  // ========================================================================
  
  useEffect(() => {
    const apiOptions = generateOptionsFromAPI();
    const fallbackOptions = generateFallbackOptions();
    
    // Combine API options with fallback, preferring API data
    const combinedOptions = [...apiOptions];
    
    // Add fallback options for types not covered by API
    const apiTypes = new Set(apiOptions.map(opt => opt.type));
    fallbackOptions.forEach(fallbackOpt => {
      if (!apiTypes.has(fallbackOpt.type)) {
        combinedOptions.push(fallbackOpt);
      }
    });
    
    setAvailableOptions(combinedOptions);
    
    // Generate bundles
    const bundles = generateBundles(combinedOptions);
    setAvailableBundles(bundles);
    
  }, [apiData, generateOptionsFromAPI, generateFallbackOptions, generateBundles]);

  // Load upsell data on mount
  useEffect(() => {
    loadUpsellData();
  }, [loadUpsellData]);

  // ========================================================================
  // COMPUTED CUSTOMIZATION
  // ========================================================================
  
  const customization = useMemo((): FareCustomization => {
    const selectedOpts = availableOptions.filter(opt => selectedOptions.has(opt.id));
    const selectedBundlesList = availableBundles.filter((bundle: any) => selectedBundles.has(bundle.id));
    
    const upgradePrice = selectedOpts.reduce((sum: number, opt) => sum + opt.price, 0) +
                        selectedBundlesList.reduce((sum: number, bundle: any) => sum + bundle.bundlePrice, 0);
    
    const totalSavings = selectedOpts.reduce((sum: number, opt) => sum + (opt.savings || 0), 0) +
                        selectedBundlesList.reduce((sum: number, bundle: any) => sum + bundle.savings, 0);
    
    return {
      selectedOptions: selectedOpts,
      selectedBundles: selectedBundlesList,
      basePrice,
      upgradePrice,
      totalPrice: basePrice + upgradePrice,
      totalSavings,
      priceBreakdown: {
        base: basePrice,
        upgrades: selectedOpts.reduce((sum: number, opt) => sum + opt.price, 0),
        bundles: selectedBundlesList.reduce((sum: number, bundle: any) => sum + bundle.bundlePrice, 0),
        taxes: 0, // Would be calculated from API
        fees: 0   // Would be calculated from API
      }
    };
  }, [selectedOptions, selectedBundles, availableOptions, availableBundles, basePrice]);

  // ========================================================================
  // ACTION HANDLERS
  // ========================================================================
  
  const toggleOption = useCallback((optionId: string) => {
    setSelectedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  }, []);

  const toggleBundle = useCallback((bundleId: string) => {
    setSelectedBundles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bundleId)) {
        newSet.delete(bundleId);
        // Remove bundle options from selected options
        const bundle = availableBundles.find(b => b.id === bundleId);
        if (bundle) {
          setSelectedOptions(optSet => {
            const newOptSet = new Set(optSet);
            bundle.options.forEach(optId => newOptSet.delete(optId));
            return newOptSet;
          });
        }
      } else {
        newSet.add(bundleId);
        // Add bundle options to selected options
        const bundle = availableBundles.find(b => b.id === bundleId);
        if (bundle) {
          setSelectedOptions(optSet => {
            const newOptSet = new Set(optSet);
            bundle.options.forEach(optId => newOptSet.add(optId));
            return newOptSet;
          });
        }
      }
      return newSet;
    });
  }, [availableBundles]);

  const clearAllSelections = useCallback(() => {
    setSelectedOptions(new Set());
    setSelectedBundles(new Set());
  }, []);

  const refreshUpsells = useCallback(() => {
    loadUpsellData();
  }, [loadUpsellData]);

  // ========================================================================
  // RETURN HOOK INTERFACE
  // ========================================================================
  
  return {
    // State
    availableOptions,
    availableBundles,
    customization,
    loading,
    error,
    
    // Actions
    toggleOption,
    toggleBundle,
    clearAllSelections,
    refreshUpsells,
    
    // Utilities
    hasRealApiData: Object.values(apiData).some(data => data !== null),
    selectedOptionsCount: selectedOptions.size,
    selectedBundlesCount: selectedBundles.size
  };
}