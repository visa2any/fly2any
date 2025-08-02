'use client';

/**
 * 🎯 Fare Customizer - Hybrid Compact Design
 * Sistema de upselling inteligente com layout híbrido otimizado
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ProcessedFlightOffer } from '@/types/flights';
import { useRealFareCustomization } from '@/lib/flights/useRealFareCustomization';
import { 
  CheckIcon, 
  ArrowRightIcon,
  SparklesIcon,
  ShieldIcon,
  RefreshIcon,
  LuggageIcon,
  SeatIcon,
  CrownIcon
} from '@/components/Icons';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UpsellOption {
  id: string;
  type: 'refund' | 'change' | 'bag' | 'seat' | 'class' | 'bundle';
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  popular?: boolean;
  bundle?: boolean;
  category: 'popular' | 'savings' | 'premium';
  icon: React.ComponentType<any>;
  available: boolean;
  dataSource?: 'api' | 'estimated' | 'unavailable';
  confidence?: number;
  restrictions?: string[];
}

interface FareCustomization {
  selectedOptions: UpsellOption[];
  totalUpgrade: number;
  totalPrice: number;
  savings: number;
}

interface FareCustomizerProps {
  offer: ProcessedFlightOffer;
  onCustomizationChange?: (customization: FareCustomization) => void;
  onViewAllOptions?: () => void;
  onSelectFlight?: (customizedOffer: ProcessedFlightOffer, customization: FareCustomization) => void;
  compact?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FareCustomizer({ 
  offer, 
  onCustomizationChange,
  onViewAllOptions,
  onSelectFlight,
  compact = true 
}: FareCustomizerProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  // Helper function to get icon for real data types - MUST be before useMemo
  const getIconForType = useCallback((type: string) => {
    try {
      switch (type) {
        case 'change': return RefreshIcon;
        case 'refund': return ShieldIcon;
        case 'bag': return LuggageIcon;
        case 'seat': return SeatIcon;
        case 'class': return CrownIcon;
        case 'bundle': return SparklesIcon;
        default: return SparklesIcon;
      }
    } catch (error) {
      console.warn('Error getting icon for type:', type, error);
      return SparklesIcon;
    }
  }, []);

  // ========================================================================
  // MOCK DATA - Will be replaced with real Amadeus API data
  // ========================================================================
  
  // 🎯 ROBUST REAL DATA: Full implementation with proper error boundaries
  const {
    loading: realDataLoading,
    data: realCustomizationData,
    error: realDataError,
    selectedOptions: realSelectedOptions,
    setSelectedOptions: setRealSelectedOptions,
    loadRealCustomizationData,
    refresh,
    statistics
  } = useRealFareCustomization(offer, {
    autoLoad: true, // Restored auto-load - the robust system as intended
    enableFallback: true,
    cacheTimeout: 5 * 60 * 1000
  });

  // 🔄 SAFE TRANSITION: Use real data when available, fallback to mock for backward compatibility
  const mockUpsellOptions: UpsellOption[] = useMemo(() => {
    // Comprehensive safety checks for real data
    if (realCustomizationData && 
        typeof realCustomizationData === 'object' && 
        realCustomizationData.options && 
        Array.isArray(realCustomizationData.options) &&
        realCustomizationData.options.length > 0) {
      try {
        const processedOptions = realCustomizationData.options
          .filter((realOpt: any) => realOpt && typeof realOpt === 'object')
          .map((realOpt: any) => {
            try {
              return {
                id: String(realOpt.id || `option-${Math.random()}`),
                type: (['change', 'refund', 'bag', 'seat', 'class', 'bundle'].includes(realOpt.type) ? realOpt.type : 'change') as any,
                title: String(realOpt.title || 'Option'),
                description: String(realOpt.description || ''),
                price: Math.max(0, Number(realOpt.price) || 0),
                originalPrice: realOpt.originalPrice ? Math.max(0, Number(realOpt.originalPrice)) : undefined,
                savings: realOpt.savings ? Math.max(0, Number(realOpt.savings)) : undefined,
                popular: Boolean(realOpt.popular),
                category: (['popular', 'savings', 'premium'].includes(realOpt.category) ? realOpt.category : 'popular') as any,
                bundle: Boolean(realOpt.bundle),
                icon: getIconForType(realOpt.type || 'change'),
                available: Boolean(realOpt.available !== false),
                dataSource: (['api', 'estimated', 'unavailable'].includes(realOpt.dataSource) ? realOpt.dataSource : 'api') as any,
                confidence: Math.min(100, Math.max(0, Number(realOpt.confidence) || 100)),
                restrictions: Array.isArray(realOpt.restrictions) ? realOpt.restrictions.map(String) : []
              };
            } catch (optError) {
              console.warn('Error processing individual option:', optError);
              return null;
            }
          })
          .filter(Boolean); // Remove null options
        
        if (processedOptions.length > 0) {
          return processedOptions as UpsellOption[];
        }
      } catch (error) {
        console.warn('Error processing real customization data:', error);
        // Fall through to mock data
      }
    }

    // Fallback to original mock data if real data not available
    return [
      // POPULAR OPTIONS
      {
        id: 'free-changes',
        type: 'change',
        title: 'Free Changes',
        description: 'Change dates without fees',
        price: 45,
        originalPrice: 75,
        savings: 30,
        popular: true,
        category: 'popular',
        icon: RefreshIcon,
        available: true,
        dataSource: 'estimated',
        confidence: 50
      },
      {
        id: 'refundable',
        type: 'refund',
        title: 'Refundable',
        description: 'Get money back if you cancel',
        price: 85,
        originalPrice: 120,
        savings: 35,
        popular: true,
        category: 'popular',
        icon: ShieldIcon,
        available: true,
        dataSource: 'estimated',
        confidence: 50
      },
      {
        id: 'bundle-flex',
        type: 'change',
        title: 'Flexibility Bundle',
        description: 'Free changes + Refundable',
        price: 120,
        originalPrice: 165,
        savings: 45,
        bundle: true,
        popular: true,
        category: 'popular',
        icon: SparklesIcon,
        available: true,
        dataSource: 'estimated',
        confidence: 50
      },
      
      // SAVINGS OPTIONS
      {
        id: 'extra-bag',
        type: 'bag',
        title: 'Extra Bag',
        description: '23kg checked bag',
        price: 35,
        category: 'savings',
        icon: LuggageIcon,
        available: true,
        dataSource: 'estimated',
        confidence: 50
      },
      {
        id: 'pick-seat',
        type: 'seat',
        title: 'Pick Seat',
        description: 'Choose your preferred seat',
        price: 15,
        category: 'savings',
        icon: SeatIcon,
        available: true,
        dataSource: 'estimated',
        confidence: 50
      },
      {
        id: 'priority-bag',
        type: 'bag',
        title: 'Priority Baggage',
        description: 'First off the plane',
        price: 25,
        category: 'savings',
        icon: LuggageIcon,
        available: true,
        dataSource: 'estimated',
        confidence: 50
      },
      
      // PREMIUM OPTIONS
      {
        id: 'business-class',
        type: 'class',
        title: 'Business Class',
        description: 'Premium cabin experience',
        price: 250,
        category: 'premium',
        icon: CrownIcon,
        available: true,
        dataSource: 'estimated',
        confidence: 50
      }
    ];
  }, [realCustomizationData, getIconForType]);

  // 🛡️ SAFE MEMOIZED OPTIONS: Add error boundary protection
  const safeUpsellOptions: UpsellOption[] = useMemo(() => {
    try {
      return mockUpsellOptions;
    } catch (error) {
      console.error('Critical error in mockUpsellOptions useMemo:', error);
      // Return minimal fallback options
      return [
        {
          id: 'fallback-change',
          type: 'change',
          title: 'Free Changes',
          description: 'Change dates without fees',
          price: 45,
          category: 'popular',
          icon: RefreshIcon,
          available: true,
          dataSource: 'estimated',
          confidence: 50
        },
        {
          id: 'fallback-bag',
          type: 'bag', 
          title: 'Extra Bag',
          description: '23kg checked bag',
          price: 35,
          category: 'savings',
          icon: LuggageIcon,
          available: true,
          dataSource: 'estimated',
          confidence: 50
        }
      ];
    }
  }, [mockUpsellOptions]);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================
  
  const customization = useMemo(() => {
    try {
      const selectedOpts = safeUpsellOptions.filter(opt => selectedOptions.has(opt.id));
      const totalUpgrade = selectedOpts.reduce((sum, opt) => sum + opt.price, 0);
      const totalSavings = selectedOpts.reduce((sum, opt) => sum + (opt.savings || 0), 0);
      const basePrice = parseFloat(offer.totalPrice.replace(/[^0-9.]/g, '')) || 0;
      
      return {
        selectedOptions: selectedOpts,
        totalUpgrade,
        totalPrice: basePrice + totalUpgrade,
        savings: totalSavings
      };
    } catch (error) {
      console.error('Error in customization calculation:', error);
      const basePrice = parseFloat(offer.totalPrice.replace(/[^0-9.]/g, '')) || 0;
      return {
        selectedOptions: [],
        totalUpgrade: 0,
        totalPrice: basePrice,
        savings: 0
      };
    }
  }, [selectedOptions, safeUpsellOptions, offer.totalPrice]);

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================
  
  const toggleOption = useCallback((optionId: string) => {
    setSelectedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
        
        // Smart bundle logic - if adding refundable or changes, suggest bundle
        const option = safeUpsellOptions.find(opt => opt.id === optionId);
        if (option?.type === 'refund' || option?.type === 'change') {
          // Could auto-suggest bundle here
        }
      }
      
      // Notify parent of change
      if (onCustomizationChange) {
        try {
          // Calculate new customization
          const selectedOpts = safeUpsellOptions.filter(opt => newSet.has(opt.id));
          const totalUpgrade = selectedOpts.reduce((sum, opt) => sum + opt.price, 0);
          const totalSavings = selectedOpts.reduce((sum, opt) => sum + (opt.savings || 0), 0);
          const basePrice = parseFloat(offer.totalPrice.replace(/[^0-9.]/g, '')) || 0;
        
          onCustomizationChange({
            selectedOptions: selectedOpts,
            totalUpgrade,
            totalPrice: basePrice + totalUpgrade,
            savings: totalSavings
          });
        } catch (changeError) {
          console.warn('Error in customization change calculation:', changeError);
        }
      }
      
      return newSet;
    });
  }, [safeUpsellOptions, onCustomizationChange, offer.totalPrice]);

  // Notify parent of changes (removed useEffect to avoid circular dependency)

  // ========================================================================
  // CATEGORY SECTIONS
  // ========================================================================
  
  const popularOptions = safeUpsellOptions.filter(opt => opt.category === 'popular').slice(0, 3);
  const savingsOptions = safeUpsellOptions.filter(opt => opt.category === 'savings').slice(0, 3);
  const premiumOptions = safeUpsellOptions.filter(opt => opt.category === 'premium').slice(0, 1);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================
  
  const renderOption = (option: UpsellOption, showDescription = false) => {
    const isSelected = selectedOptions.has(option.id);
    const IconComponent = option.icon;
    
    return (
      <div
        key={option.id}
        onClick={() => toggleOption(option.id)}
        className={`
          flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all
          ${isSelected 
            ? 'bg-blue-50 border border-blue-200 text-blue-900' 
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
          }
          ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className={`
          w-4 h-4 rounded border-2 flex items-center justify-center
          ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
        `}>
          {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
        
        <IconComponent className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
              {option.title}
            </span>
            {option.bundle && <SparklesIcon className="w-3 h-3 text-amber-500" />}
            {option.popular && <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">HOT</span>}
            {/* Data Source Indicators */}
            {option.dataSource === 'api' && (
              <span className="text-xs bg-green-100 text-green-600 px-1 rounded font-medium" title="Real-time data from airline">
                ✓
              </span>
            )}
            {option.dataSource === 'estimated' && (
              <span className="text-xs bg-amber-100 text-amber-600 px-1 rounded font-medium" title="Estimated price - confirm at booking">
                ~
              </span>
            )}
          </div>
          {showDescription && (
            <p className="text-xs text-gray-600 truncate">{option.description}</p>
          )}
        </div>
        
        <div className="text-right">
          <div className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            +${option.price}
          </div>
          {option.savings && (
            <div className="text-xs text-green-600">
              Save ${option.savings}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  if (compact) {
    return (
      <div className="bg-white border rounded-lg p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Customize This Flight</h3>
              {realCustomizationData?.dataQuality && (
                <div className={`text-xs font-medium ${
                  realCustomizationData.dataQuality.overall >= 80 ? 'text-green-600' :
                  realCustomizationData.dataQuality.overall >= 60 ? 'text-blue-600' :
                  'text-amber-600'
                }`}>
                  {realCustomizationData.dataQuality.overall >= 80 ? '🎯 Real-time data' :
                   realCustomizationData.dataQuality.overall >= 60 ? '📊 Mixed data' :
                   '⚠️ Estimated prices'} ({realCustomizationData.dataQuality.overall}%)
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewAllOptions}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All Options
              <ArrowRightIcon className="w-3 h-3" />
            </button>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ${customization.totalPrice.toFixed(2)}
              </div>
              {customization.savings > 0 && (
                <div className="text-xs text-green-600">
                  Save ${customization.savings}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-4">
          {/* Popular Column */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <SparklesIcon className="w-4 h-4 text-orange-500" />
              Popular
            </h4>
            <div className="space-y-2">
              {popularOptions.map(option => renderOption(option))}
            </div>
          </div>

          {/* Savings Column */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <LuggageIcon className="w-4 h-4 text-green-500" />
              Add-ons
            </h4>
            <div className="space-y-2">
              {savingsOptions.map(option => renderOption(option))}
            </div>
          </div>

          {/* Premium Column */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <CrownIcon className="w-4 h-4 text-purple-500" />
              Premium
            </h4>
            <div className="space-y-2">
              {premiumOptions.map(option => (
                <div
                  key={option.id}
                  className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg cursor-pointer hover:from-purple-100 hover:to-indigo-100"
                  onClick={() => onViewAllOptions?.()}
                >
                  <div className="flex items-center gap-2">
                    <CrownIcon className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium text-purple-900">{option.title}</div>
                      <div className="text-xs text-purple-700">+${option.price}</div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            <button
              onClick={() => onSelectFlight?.(offer, customization)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Select: ${customization.totalPrice.toFixed(2)}
            </button>
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Compare
            </button>
          </div>
          
          {customization.selectedOptions.length > 0 && (
            <div className="text-sm text-gray-600">
              {customization.selectedOptions.length} upgrade{customization.selectedOptions.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full expanded version would go here...
  return null;
}