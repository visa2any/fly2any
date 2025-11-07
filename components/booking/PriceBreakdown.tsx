'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Shield,
  Clock,
  Info,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';

/**
 * Props interface for PriceBreakdown component
 */
interface PriceBreakdownProps {
  basePrice: number;
  taxes: number;
  bookingFee: number;
  airlineFees: number;
  currency?: string;
  showLockTimer?: boolean;
  lockExpiresAt?: Date;
  previousPrice?: number;
}

/**
 * FTC-Compliant Price Breakdown Component
 *
 * Features:
 * - Full price transparency (FTC compliance for May 2025)
 * - All fees displayed upfront
 * - "No Hidden Fees" trust badge
 * - Price lock countdown timer (15 minutes default)
 * - Price change indicators (green for drop, red for increase)
 * - Mobile responsive design
 * - WCAG 2.1 AA accessible
 * - Collapsible detail view
 * - Tooltips for fee explanations
 *
 * @component
 */
export default function PriceBreakdown({
  basePrice,
  taxes,
  bookingFee,
  airlineFees,
  currency = 'USD',
  showLockTimer = true,
  lockExpiresAt,
  previousPrice,
}: PriceBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return basePrice + taxes + bookingFee + airlineFees;
  }, [basePrice, taxes, bookingFee, airlineFees]);

  // Calculate price change
  const priceChange = useMemo(() => {
    if (previousPrice === undefined) return null;
    return totalPrice - previousPrice;
  }, [totalPrice, previousPrice]);

  // Format currency
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Timer logic for price lock
  useEffect(() => {
    if (!showLockTimer || !lockExpiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const seconds = differenceInSeconds(lockExpiresAt, now);
      setTimeRemaining(Math.max(0, seconds));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [showLockTimer, lockExpiresAt]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate timer progress percentage
  const timerProgress = useMemo(() => {
    if (!timeRemaining || !lockExpiresAt) return 100;
    const totalSeconds = 15 * 60; // 15 minutes
    return (timeRemaining / totalSeconds) * 100;
  }, [timeRemaining, lockExpiresAt]);

  // Determine timer color based on remaining time
  const getTimerColor = (): string => {
    if (!timeRemaining) return 'text-gray-500';
    if (timeRemaining < 60) return 'text-red-600'; // Less than 1 minute
    if (timeRemaining < 300) return 'text-orange-600'; // Less than 5 minutes
    return 'text-green-600';
  };

  // Tooltip content for each fee type
  const tooltips: Record<string, string> = {
    basePrice: 'The base fare charged by the airline for your flight ticket.',
    taxes: 'Government-mandated taxes including federal excise tax, segment fees, and security fees.',
    bookingFee: 'Service fee for processing your booking and providing customer support.',
    airlineFees: 'Airline-imposed fees for fuel surcharges and carrier-specific charges.',
  };

  // Fee breakdown items
  const feeItems = [
    {
      id: 'basePrice',
      label: 'Base Fare',
      amount: basePrice,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'taxes',
      label: 'Taxes & Government Fees',
      amount: taxes,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'bookingFee',
      label: 'Booking Service Fee',
      amount: bookingFee,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'airlineFees',
      label: 'Airline Fees',
      amount: airlineFees,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div
      className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden"
      role="region"
      aria-label="Price breakdown"
    >
      {/* Header with Total Price */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-white text-lg font-bold">Total Price</h2>
            <p className="text-primary-100 text-xs">All fees included</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {formatPrice(totalPrice)}
            </div>
            {priceChange !== null && priceChange !== 0 && (
              <div
                className={`flex items-center gap-1 justify-end mt-1 ${
                  priceChange < 0 ? 'text-green-100' : 'text-red-100'
                }`}
                role="status"
                aria-live="polite"
              >
                {priceChange < 0 ? (
                  <TrendingDown className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                )}
                <span className="text-sm font-semibold">
                  {priceChange > 0 ? '+' : ''}
                  {formatPrice(Math.abs(priceChange))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* No Hidden Fees Badge */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
          <div className="bg-green-500 rounded-full p-1">
            <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-900">No Hidden Fees</p>
            <p className="text-[10px] text-gray-600">
              FTC Compliant - All costs shown upfront
            </p>
          </div>
        </div>
      </div>

      {/* Price Lock Timer */}
      {showLockTimer && timeRemaining !== null && timeRemaining > 0 && (
        <div className="bg-gray-50 border-b border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${getTimerColor()}`} aria-hidden="true" />
              <span className="text-sm font-semibold text-gray-900">
                Price Locked
              </span>
            </div>
            <span
              className={`text-sm font-bold ${getTimerColor()}`}
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeRemaining < 60
                  ? 'bg-red-500'
                  : timeRemaining < 300
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${timerProgress}%` }}
              role="progressbar"
              aria-valuenow={timerProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Price lock time remaining"
            />
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5 text-center">
            Complete your booking before the timer expires
          </p>
        </div>
      )}

      {/* Collapsible Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-150 transition-colors border-b border-gray-200"
        aria-expanded={isExpanded}
        aria-controls="price-breakdown-details"
      >
        <span className="text-sm font-semibold text-gray-900">
          View Price Breakdown
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" aria-hidden="true" />
        )}
      </button>

      {/* Expandable Price Details */}
      {isExpanded && (
        <div id="price-breakdown-details" className="p-4 space-y-3">
          {/* Fee Items */}
          {feeItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`${item.bgColor} p-2 rounded-lg`}>
                    <Icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-900">{item.label}</span>
                    {/* Tooltip */}
                    <div className="relative">
                      <button
                        onMouseEnter={() => setShowTooltip(item.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                        onFocus={() => setShowTooltip(item.id)}
                        onBlur={() => setShowTooltip(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                        aria-label={`Information about ${item.label}`}
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      {showTooltip === item.id && (
                        <div
                          role="tooltip"
                          className="absolute left-0 bottom-full mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-10 pointer-events-none"
                        >
                          {tooltips[item.id]}
                          <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.amount)}
                </span>
              </div>
            );
          })}

          {/* Divider */}
          <div className="border-t-2 border-gray-300 my-4" />

          {/* Total */}
          <div className="flex items-center justify-between bg-primary-50 rounded-lg p-3">
            <span className="text-base font-bold text-gray-900">
              Total Amount
            </span>
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(totalPrice)}
            </span>
          </div>

          {/* Price Guarantee Badge */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-bold text-green-900 mb-1">
                Price Guarantee
              </h3>
              <p className="text-xs text-green-800 leading-relaxed">
                This price is locked for your booking. No surprise charges will
                be added at checkout. What you see is what you pay.
              </p>
            </div>
          </div>

          {/* Legal Compliance Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-[11px] text-blue-900 leading-relaxed">
              <strong className="font-semibold">FTC Compliance Notice:</strong>{' '}
              All mandatory fees are included in the total price shown above. This
              pricing complies with federal regulations requiring upfront
              disclosure of all fees (effective May 2025).
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
              <span className="text-xs text-gray-600">Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span className="text-xs text-gray-600">Protected Booking</span>
            </div>
          </div>
        </div>
      )}

      {/* Price Change Alert */}
      {priceChange !== null && priceChange !== 0 && (
        <div
          className={`border-t-2 p-3 ${
            priceChange < 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2">
            {priceChange < 0 ? (
              <TrendingDown className="w-5 h-5 text-green-600" aria-hidden="true" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-600" aria-hidden="true" />
            )}
            <p
              className={`text-sm font-semibold ${
                priceChange < 0 ? 'text-green-900' : 'text-red-900'
              }`}
            >
              {priceChange < 0 ? (
                <>
                  Price dropped by {formatPrice(Math.abs(priceChange))}! You're
                  saving money.
                </>
              ) : (
                <>
                  Price increased by {formatPrice(Math.abs(priceChange))}. Book
                  now to lock this rate.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Price Breakdown - Minimal version for mobile/sidebar
 */
export function CompactPriceBreakdown({
  basePrice,
  taxes,
  bookingFee,
  airlineFees,
  currency = 'USD',
  onClick,
}: Omit<PriceBreakdownProps, 'showLockTimer' | 'lockExpiresAt' | 'previousPrice'> & {
  onClick?: () => void;
}) {
  const totalPrice = basePrice + taxes + bookingFee + airlineFees;

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-primary-50 border-2 border-primary-200 rounded-lg p-3 hover:bg-primary-100 transition-colors text-left"
      aria-label="View full price breakdown"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
            <span className="text-xs font-bold text-gray-900">
              No Hidden Fees
            </span>
          </div>
          <p className="text-[10px] text-gray-600">All fees included</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary-600">
            {formatPrice(totalPrice)}
          </div>
          <p className="text-[9px] text-gray-600">Tap for details</p>
        </div>
      </div>
    </button>
  );
}
