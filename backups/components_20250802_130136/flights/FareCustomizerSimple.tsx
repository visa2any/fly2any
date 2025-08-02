'use client';

/**
 * 🎯 Fare Customizer Simple - Version without complex hooks
 * Sistema de upselling básico para evitar erros de importação
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ProcessedFlightOffer } from '@/types/flights';
import { 
  CheckIcon, 
  ArrowRightIcon,
  SparklesIcon,
  ShieldIcon,
  RefreshIcon,
  LuggageIcon,
  CrownIcon
} from '@/components/Icons';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface UpsellOption {
  id: string;
  type: 'refund' | 'change' | 'bag' | 'seat' | 'class';
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  popular?: boolean;
  category: 'popular' | 'savings' | 'premium';
  available: boolean;
}

interface FareCustomizerProps {
  offer: ProcessedFlightOffer;
  onCustomizationChange?: (customization: any) => void;
  onViewAllOptions?: () => void;
  onSelectFlight?: (customizedOffer: ProcessedFlightOffer, customization: any) => void;
  compact?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FareCustomizerSimple({ 
  offer, 
  onCustomizationChange,
  onViewAllOptions,
  onSelectFlight,
  compact = true 
}: FareCustomizerProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  // ========================================================================
  // MOCK DATA - Simplified version
  // ========================================================================
  
  const mockUpsellOptions: UpsellOption[] = useMemo(() => [
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
      available: true
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
      available: true
    },
    
    // SAVINGS OPTIONS
    {
      id: 'extra-bag',
      type: 'bag',
      title: 'Extra Bag',
      description: '23kg checked bag',
      price: 35,
      category: 'savings',
      available: true
    },
    {
      id: 'pick-seat',
      type: 'seat',
      title: 'Pick Seat',
      description: 'Choose your preferred seat',
      price: 15,
      category: 'savings',
      available: true
    },
    
    // PREMIUM OPTIONS
    {
      id: 'business-class',
      type: 'class',
      title: 'Business Class',
      description: 'Premium cabin experience',
      price: 250,
      category: 'premium',
      available: true
    }
  ], []);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================
  
  const customization = useMemo(() => {
    const selectedOpts = mockUpsellOptions.filter(opt => selectedOptions.has(opt.id));
    const totalUpgrade = selectedOpts.reduce((sum, opt) => sum + opt.price, 0);
    const totalSavings = selectedOpts.reduce((sum, opt) => sum + (opt.savings || 0), 0);
    const basePrice = parseFloat(offer.totalPrice.replace(/[^0-9.]/g, ''));
    
    return {
      selectedOptions: selectedOpts,
      totalUpgrade,
      totalPrice: basePrice + totalUpgrade,
      savings: totalSavings
    };
  }, [selectedOptions, mockUpsellOptions, offer.totalPrice]);

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
      }
      return newSet;
    });
  }, []);

  // ========================================================================
  // CATEGORY SECTIONS
  // ========================================================================
  
  const popularOptions = mockUpsellOptions.filter(opt => opt.category === 'popular').slice(0, 2);
  const savingsOptions = mockUpsellOptions.filter(opt => opt.category === 'savings').slice(0, 2);
  const premiumOptions = mockUpsellOptions.filter(opt => opt.category === 'premium').slice(0, 1);

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================
  
  const renderOption = (option: UpsellOption) => {
    const isSelected = selectedOptions.has(option.id);
    
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
        `}
      >
        <div className={`
          w-4 h-4 rounded border-2 flex items-center justify-center
          ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
        `}>
          {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
              {option.title}
            </span>
            {option.popular ? <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">HOT</span> : null}
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            +${option.price}
          </div>
          <div className="text-xs text-green-600">
            {option.savings ? `Save $${option.savings}` : ''}
          </div>
        </div>
      </div>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Customize This Flight</h3>
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
            <div className="text-xs text-green-600">
              {customization.savings > 0 ? `Save $${customization.savings}` : ''}
            </div>
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
        
        <div className="text-sm text-gray-600">
          {customization.selectedOptions.length > 0 ? 
            `${customization.selectedOptions.length} upgrade${customization.selectedOptions.length > 1 ? 's' : ''} selected` : 
            ''
          }
        </div>
      </div>
    </div>
  );
}