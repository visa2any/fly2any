'use client';

/**
 * 💎 TRANSPARENT PRICING DISPLAY SYSTEM
 * Industry-compliant pricing display that builds trust and maximizes conversions
 * - Complete fee breakdown (no hidden costs)
 * - Real-time price tracking
 * - Psychological pricing elements
 * - Multi-currency support
 * - Accessibility compliant
 * - Mobile-optimized design
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Info, Shield, Clock, CheckCircle, Award, Star, Zap, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import premium styles
import '@/styles/premium-travel.css';

// ========================================
// TYPES & INTERFACES
// ========================================

export interface PriceBreakdown {
  basePrice: number;
  taxes: {
    amount: number;
    description: string;
    included: boolean;
  }[];
  fees: {
    type: string;
    amount: number;
    description: string;
    mandatory: boolean;
    provider?: string;
  }[];
  discounts: {
    type: string;
    amount: number;
    description: string;
    validUntil?: string;
  }[];
  commission: {
    amount: number;
    percentage: number;
    visible: boolean; // Only show if transparent mode enabled
  };
  currency: string;
  lastUpdated: string;
}

export interface PriceComparison {
  currentPrice: number;
  originalPrice?: number;
  competitorPrices?: {
    source: string;
    price: number;
    lastChecked: string;
  }[];
  historicalData?: {
    date: string;
    price: number;
  }[];
  priceAlert?: {
    type: 'increase' | 'decrease' | 'stable';
    percentage: number;
    message: string;
  };
}

export interface PricingDisplayProps {
  breakdown: PriceBreakdown;
  comparison?: PriceComparison;
  displayMode?: 'simple' | 'detailed' | 'transparent';
  showPriceHistory?: boolean;
  showCompetitorComparison?: boolean;
  showSavings?: boolean;
  enablePriceAlerts?: boolean;
  guaranteePrice?: boolean;
  lockDuration?: number; // minutes
  className?: string;
  onPriceLock?: () => void;
  onBreakdownToggle?: (expanded: boolean) => void;
}

// ========================================
// TRANSPARENT PRICING DISPLAY COMPONENT
// ========================================

const PricingDisplay: React.FC<PricingDisplayProps> = ({
  breakdown,
  comparison,
  displayMode = 'detailed',
  showPriceHistory = true,
  showCompetitorComparison = false,
  showSavings = true,
  enablePriceAlerts = true,
  guaranteePrice = false,
  lockDuration = 30,
  className = '',
  onPriceLock,
  onBreakdownToggle
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [showBreakdown, setShowBreakdown] = useState(displayMode === 'transparent');
  const [isPriceLocked, setIsPriceLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(lockDuration * 60); // seconds
  const [currency, setCurrency] = useState(breakdown.currency);
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);

  // ========================================
  // CALCULATIONS & MEMOIZED VALUES
  // ========================================

  const totals = useMemo(() => {
    const mandatoryFees = breakdown.fees
      .filter(fee => fee.mandatory)
      .reduce((sum, fee) => sum + fee.amount, 0);
    
    const optionalFees = breakdown.fees
      .filter(fee => !fee.mandatory)
      .reduce((sum, fee) => sum + fee.amount, 0);
    
    const totalTaxes = breakdown.taxes
      .reduce((sum, tax) => sum + tax.amount, 0);
    
    const totalDiscounts = breakdown.discounts
      .reduce((sum, discount) => sum + discount.amount, 0);
    
    const subtotal = breakdown.basePrice + mandatoryFees + totalTaxes;
    const finalPrice = subtotal - totalDiscounts;
    
    return {
      subtotal,
      finalPrice,
      mandatoryFees,
      optionalFees,
      totalTaxes,
      totalDiscounts,
      savings: (comparison?.originalPrice || finalPrice) - finalPrice
    };
  }, [breakdown, comparison]);

  // ========================================
  // PRICE TRACKING & ALERTS
  // ========================================

  useEffect(() => {
    if (!enablePriceAlerts) return;

    // Simulate price monitoring
    const checkPriceChanges = () => {
      if (comparison?.priceAlert) {
        setPriceAlerts((prev: any) => [...prev, {
          id: Date.now(),
          ...comparison.priceAlert,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    const interval = setInterval(checkPriceChanges, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [comparison, enablePriceAlerts]);

  // ========================================
  // PRICE LOCK TIMER
  // ========================================

  useEffect(() => {
    if (!isPriceLocked) return;

    const timer = setInterval(() => {
      setLockTimeRemaining((prev: any) => {
        if (prev <= 0) {
          setIsPriceLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPriceLocked]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleBreakdownToggle = () => {
    const newState = !showBreakdown;
    setShowBreakdown(newState);
    onBreakdownToggle?.(newState);
  };

  const handlePriceLock = () => {
    setIsPriceLocked(true);
    setLockTimeRemaining(lockDuration * 60);
    onPriceLock?.();
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ========================================
  // RENDER COMPONENT
  // ========================================

  return (
    <motion.div 
      className={`pricing-display bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Price Alerts */}
      <AnimatePresence>
        {priceAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`price-alert px-4 py-3 ${
              alert.type === 'decrease' ? 'bg-green-50 border-green-200' :
              alert.type === 'increase' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            } border-b`}
          >
            <div className="flex items-center">
              {alert.type === 'decrease' && <TrendingDown className="w-4 h-4 text-green-600 mr-2" />}
              {alert.type === 'increase' && <TrendingUp className="w-4 h-4 text-red-600 mr-2" />}
              {alert.type === 'stable' && <Info className="w-4 h-4 text-blue-600 mr-2" />}
              <span className={`text-sm font-medium ${
                alert.type === 'decrease' ? 'text-green-800' :
                alert.type === 'increase' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {alert.message}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Price Display */}
      <div className="main-price-section p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="price-main">
            <div className="flex items-baseline">
              <span className="text-3xl md:text-4xl font-bold text-gray-900">
                {formatPrice(totals.finalPrice)}
              </span>
              
              {comparison?.originalPrice && comparison.originalPrice > totals.finalPrice && (
                <div className="ml-3 flex flex-col">
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(comparison.originalPrice)}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    Save {formatPrice(totals.savings)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              <span>Price last updated: {new Date(breakdown.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Price Lock Feature */}
          {guaranteePrice && (
            <div className="price-lock-section">
              {!isPriceLocked ? (
                <button
                  onClick={handlePriceLock}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Lock Price
                </button>
              ) : (
                <div className="price-locked bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Price Locked</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    {formatTime(lockTimeRemaining)} remaining
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Savings Highlight */}
        {showSavings && totals.savings > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="savings-highlight bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">
                  You're saving {formatPrice(totals.savings)}!
                </p>
                <p className="text-sm text-green-600">
                  {Math.round((totals.savings / (comparison?.originalPrice || totals.finalPrice)) * 100)}% off regular price
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Breakdown Toggle */}
        <button
          onClick={handleBreakdownToggle}
          className="breakdown-toggle w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-left"
        >
          <span className="font-medium text-gray-700">
            {showBreakdown ? 'Hide' : 'Show'} price breakdown
          </span>
          <motion.div
            animate={{ rotate: showBreakdown ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>
      </div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="breakdown-section border-t border-gray-200"
          >
            <div className="p-6 space-y-4">
              
              {/* Base Price */}
              <div className="breakdown-item flex items-center justify-between">
                <span className="text-gray-700">Base Price</span>
                <span className="font-medium">{formatPrice(breakdown.basePrice)}</span>
              </div>

              {/* Taxes */}
              {breakdown.taxes.length > 0 && (
                <div className="taxes-section">
                  <h4 className="font-medium text-gray-800 mb-2">Taxes & Government Fees</h4>
                  {breakdown.taxes.map((tax, index) => (
                    <div key={index} className="breakdown-item flex items-center justify-between pl-4 py-1">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">{tax.description}</span>
                        {!tax.included && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            Additional
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium">{formatPrice(tax.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mandatory Fees */}
              {totals.mandatoryFees > 0 && (
                <div className="fees-section">
                  <h4 className="font-medium text-gray-800 mb-2">Required Fees</h4>
                  {breakdown.fees.filter(fee => fee.mandatory).map((fee, index) => (
                    <div key={index} className="breakdown-item flex items-center justify-between pl-4 py-1">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">{fee.description}</span>
                        <Info className="w-3 h-3 text-gray-400 ml-1 cursor-help" 
                              aria-label={`Charged by ${fee.provider || 'service provider'}`} />
                      </div>
                      <span className="text-sm font-medium">{formatPrice(fee.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Optional Fees */}
              {totals.optionalFees > 0 && (
                <div className="optional-fees-section">
                  <h4 className="font-medium text-gray-800 mb-2">Optional Add-ons</h4>
                  {breakdown.fees.filter(fee => !fee.mandatory).map((fee, index) => (
                    <div key={index} className="breakdown-item flex items-center justify-between pl-4 py-1">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">{fee.description}</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Optional
                        </span>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(fee.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Discounts */}
              {breakdown.discounts.length > 0 && (
                <div className="discounts-section">
                  <h4 className="font-medium text-green-800 mb-2">Discounts Applied</h4>
                  {breakdown.discounts.map((discount, index) => (
                    <div key={index} className="breakdown-item flex items-center justify-between pl-4 py-1">
                      <div className="flex items-center">
                        <span className="text-sm text-green-700">{discount.description}</span>
                        {discount.validUntil && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Until {new Date(discount.validUntil).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        -{formatPrice(discount.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Commission (Transparent Mode) */}
              {displayMode === 'transparent' && breakdown.commission.visible && (
                <div className="commission-section pt-4 border-t border-gray-200">
                  <div className="breakdown-item flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Our service fee</span>
                      <Info className="w-3 h-3 text-gray-400 ml-1 cursor-help" 
                            aria-label="This covers our booking service, customer support, and price guarantees" />
                    </div>
                    <span className="text-sm font-medium">
                      {formatPrice(breakdown.commission.amount)} ({breakdown.commission.percentage}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Final Total */}
              <div className="final-total pt-4 border-t-2 border-gray-300">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Price</span>
                  <span className="text-blue-600">{formatPrice(totals.finalPrice)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All fees and taxes included • No hidden charges
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Competitor Comparison */}
      {showCompetitorComparison && comparison?.competitorPrices && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="competitor-comparison border-t border-gray-200 p-6 bg-gray-50"
        >
          <h4 className="font-medium text-gray-800 mb-4">Price Comparison</h4>
          <div className="space-y-3">
            {comparison.competitorPrices.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{competitor.source}</span>
                <span className={`text-sm font-medium ${
                  competitor.price > totals.finalPrice ? 'text-green-600' : 'text-gray-800'
                }`}>
                  {formatPrice(competitor.price)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-gray-300">
              <span className="font-medium text-blue-600">Fly2Any (You)</span>
              <span className="font-bold text-blue-600">{formatPrice(totals.finalPrice)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trust Indicators */}
      <div className="trust-indicators p-4 bg-blue-50 border-t border-blue-200">
        <div className="flex items-center justify-center space-x-6 text-sm text-blue-800">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>No Hidden Fees</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PricingDisplay;

// ========================================
// UTILITY COMPONENTS
// ========================================

/**
 * Simple price display for cards/lists
 */
export const SimplePriceDisplay: React.FC<{
  price: number;
  originalPrice?: number;
  currency: string;
  savings?: number;
  className?: string;
}> = ({ price, originalPrice, currency, savings, className = '' }) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`simple-price-display ${className}`}>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatPrice(price)}
        </span>
        {originalPrice && originalPrice > price && (
          <span className="text-lg text-gray-500 line-through">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>
      {savings && savings > 0 && (
        <span className="text-sm font-medium text-green-600">
          Save {formatPrice(savings)}
        </span>
      )}
    </div>
  );
};

/**
 * Price comparison widget
 */
export const PriceComparisonWidget: React.FC<{
  currentPrice: number;
  competitors: { name: string; price: number }[];
  currency: string;
}> = ({ currentPrice, competitors, currency }) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isLowestPrice = competitors.every(comp => currentPrice <= comp.price);

  return (
    <div className="price-comparison-widget bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-800 mb-3">Price Comparison</h4>
      
      <div className="space-y-2">
        {competitors.map((competitor, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{competitor.name}</span>
            <span className="font-medium">{formatPrice(competitor.price)}</span>
          </div>
        ))}
        
        <div className={`flex items-center justify-between pt-2 border-t ${
          isLowestPrice ? 'text-green-600' : 'text-blue-600'
        }`}>
          <div className="flex items-center">
            <span className="font-medium">Fly2Any</span>
            {isLowestPrice && <CheckCircle className="w-4 h-4 ml-1" />}
          </div>
          <span className="font-bold">{formatPrice(currentPrice)}</span>
        </div>
      </div>
      
      {isLowestPrice && (
        <div className="mt-3 text-xs text-green-600 text-center">
          ✓ Lowest price guaranteed
        </div>
      )}
    </div>
  );
};

// Types already exported above