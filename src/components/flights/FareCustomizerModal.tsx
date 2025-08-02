'use client';

/**
 * 🎯 Fare Customizer Modal - Complete Options View
 * Interface completa de customização com todas as opções organizadas em tabs
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ProcessedFlightOffer } from '@/types/flights';
import { useFareCustomization, UpsellOption, FareBundle } from '@/lib/flights/useFareCustomization';
import { 
  XIcon,
  CheckIcon,
  ShieldIcon,
  RefreshIcon,
  LuggageIcon,
  SeatIcon,
  CrownIcon,
  SparklesIcon,
  InfoIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@/components/Icons';

// ============================================================================
// INTERFACES
// ============================================================================

interface FareCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: ProcessedFlightOffer;
  onSelectFlight: (customizedOffer: ProcessedFlightOffer, customization: any) => void;
}

type TabType = 'fare' | 'bags' | 'seats' | 'class' | 'summary';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FareCustomizerModal({ 
  isOpen, 
  onClose, 
  offer, 
  onSelectFlight 
}: FareCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('fare');
  const [showComparison, setShowComparison] = useState(false);
  
  const {
    availableOptions,
    availableBundles,
    customization,
    loading,
    error,
    toggleOption,
    toggleBundle,
    clearAllSelections,
    hasRealApiData
  } = useFareCustomization({
    offer,
    autoLoadUpsells: true,
    enableBundles: true
  });

  // ========================================================================
  // TAB CONFIGURATION
  // ========================================================================
  
  const tabs = [
    {
      id: 'fare' as TabType,
      name: 'Fare Policies',
      icon: ShieldIcon,
      color: 'blue',
      count: availableOptions.filter(opt => ['refund', 'change'].includes(opt.type)).length
    },
    {
      id: 'bags' as TabType,
      name: 'Baggage',
      icon: LuggageIcon,
      color: 'green',
      count: availableOptions.filter(opt => opt.type === 'bag').length
    },
    {
      id: 'seats' as TabType,
      name: 'Seats',
      icon: SeatIcon,
      color: 'purple',
      count: availableOptions.filter(opt => opt.type === 'seat').length
    },
    {
      id: 'class' as TabType,
      name: 'Class Upgrade',
      icon: CrownIcon,
      color: 'yellow',
      count: availableOptions.filter(opt => opt.type === 'class').length
    },
    {
      id: 'summary' as TabType,
      name: 'Summary',
      icon: SparklesIcon,
      color: 'indigo',
      count: customization.selectedOptions.length
    }
  ];

  // ========================================================================
  // FILTERED OPTIONS BY TAB
  // ========================================================================
  
  const getOptionsForTab = (tabId: TabType): UpsellOption[] => {
    switch (tabId) {
      case 'fare':
        return availableOptions.filter(opt => ['refund', 'change'].includes(opt.type));
      case 'bags':
        return availableOptions.filter(opt => opt.type === 'bag');
      case 'seats':
        return availableOptions.filter(opt => opt.type === 'seat');
      case 'class':
        return availableOptions.filter(opt => opt.type === 'class');
      default:
        return [];
    }
  };

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================
  
  const renderTabContent = () => {
    if (activeTab === 'summary') {
      return renderSummaryTab();
    }
    
    const options = getOptionsForTab(activeTab);
    const relevantBundles = availableBundles.filter(bundle => 
      bundle.options.some(optId => options.some(opt => opt.id === optId))
    );

    if (options.length === 0 && relevantBundles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Options Available</h3>
          <p className="text-gray-500 text-center">
            No {activeTab} options are currently available for this flight.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Bundles Section */}
        {relevantBundles.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-amber-500" />
              Recommended Bundles
            </h3>
            <div className="grid gap-4">
              {relevantBundles.map(bundle => renderBundle(bundle))}
            </div>
          </div>
        )}

        {/* Individual Options */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Options</h3>
          <div className="grid gap-3">
            {options.map(option => renderOption(option, true))}
          </div>
        </div>
      </div>
    );
  };

  const renderOption = (option: UpsellOption, detailed = false) => {
    const isSelected = customization.selectedOptions.some(opt => opt.id === option.id);
    const IconComponent = option.icon || InfoIcon;
    
    return (
      <div
        key={option.id}
        onClick={() => toggleOption(option.id)}
        className={`
          p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
          ${isSelected 
            ? 'border-blue-300 bg-blue-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
          }
          ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5
              ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}
            `}>
              {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {option.title}
                </h4>
                {option.popular && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
                {option.bundle && (
                  <SparklesIcon className="w-4 h-4 text-amber-500" />
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-2">{option.description}</p>
              
              {detailed && option.metadata && (
                <div className="text-xs text-gray-500 space-y-1">
                  {option.source === 'api' && (
                    <div className="flex items-center space-x-1">
                      <CheckIcon className="w-3 h-3 text-green-500" />
                      <span>Real-time data from airline</span>
                    </div>
                  )}
                  {option.metadata.restrictions && (
                    <div>Restrictions: {option.metadata.restrictions.join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right ml-4">
            <div className={`text-lg font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
              +${option.price}
            </div>
            {option.originalPrice && option.originalPrice > option.price && (
              <div className="text-sm text-gray-500 line-through">
                ${option.originalPrice}
              </div>
            )}
            {option.savings && (
              <div className="text-sm text-green-600 font-medium">
                Save ${option.savings}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBundle = (bundle: FareBundle) => {
    const isSelected = customization.selectedBundles.some(b => b.id === bundle.id);
    
    return (
      <div
        key={bundle.id}
        onClick={() => toggleBundle(bundle.id)}
        className={`
          p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-amber-200 hover:shadow-md'
          }
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}
            `}>
              {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h4 className={`font-bold text-lg ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}>
                {bundle.name}
              </h4>
              {bundle.popular && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Most Popular
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-xl font-bold ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}>
              ${bundle.bundlePrice}
            </div>
            <div className="text-sm text-gray-500 line-through">
              ${bundle.originalPrice}
            </div>
            <div className="text-sm text-green-600 font-bold">
              Save ${bundle.savings}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-3">{bundle.description}</p>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Includes:</span>
          <div className="flex space-x-1">
            {bundle.options.map((optId, idx) => {
              const option = availableOptions.find(opt => opt.id === optId);
              return option ? (
                <span key={optId} className="px-2 py-1 bg-gray-100 rounded">
                  {option.title}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSummaryTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Selection Summary</h3>
          
          {/* Price Breakdown */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Flight Price:</span>
                <span className="font-semibold">${customization.basePrice.toFixed(2)}</span>
              </div>
              {customization.upgradePrice > 0 && (
                <div className="flex justify-between">
                  <span>Selected Upgrades:</span>
                  <span className="font-semibold text-blue-600">+${customization.upgradePrice.toFixed(2)}</span>
                </div>
              )}
              {customization.totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Total Savings:</span>
                  <span className="font-semibold">-${customization.totalSavings.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Price:</span>
                  <span className="text-blue-600">${customization.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Options */}
          {customization.selectedOptions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Selected Options:</h4>
              <div className="space-y-2">
                {customization.selectedOptions.map(option => (
                  <div key={option.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500" />
                      <span>{option.title}</span>
                    </div>
                    <span className="font-semibold">+${option.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Bundles */}
          {customization.selectedBundles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Selected Bundles:</h4>
              <div className="space-y-2">
                {customization.selectedBundles.map(bundle => (
                  <div key={bundle.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="w-4 h-4 text-amber-500" />
                      <span>{bundle.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${bundle.bundlePrice}</div>
                      <div className="text-sm text-green-600">Save ${bundle.savings}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ========================================================================
  // MAIN RENDER
  // ========================================================================
  
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Customize Your Flight</h2>
              <p className="text-gray-600">
                {offer.outbound.departure.iataCode} → {offer.outbound.arrival.iataCode}
                {offer.inbound && ` • ${offer.inbound.departure.iataCode} → ${offer.inbound.arrival.iataCode}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${customization.totalPrice.toFixed(2)}
                </div>
                {customization.totalSavings > 0 && (
                  <div className="text-sm text-green-600">
                    Save ${customization.totalSavings.toFixed(2)}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 max-h-[calc(90vh-140px)]">
            {/* Sidebar Tabs */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <div className="space-y-2">
                {tabs.map(tab => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-lg text-left transition-all
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{tab.name}</span>
                      </div>
                      {tab.count > 0 && (
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-bold
                          ${isActive ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'}
                        `}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Clear All Button */}
              {(customization.selectedOptions.length > 0 || customization.selectedBundles.length > 0) && (
                <button
                  onClick={clearAllSelections}
                  className="w-full mt-4 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear All Selections
                </button>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading options...</span>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <XIcon className="w-5 h-5 text-red-400 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">Error Loading Options</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {renderTabContent()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              {!hasRealApiData && (
                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <InfoIcon className="w-4 h-4" />
                  <span>Some options estimated - final prices confirmed at booking</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSelectFlight(offer, customization);
                  onClose();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Select Flight - ${customization.totalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}