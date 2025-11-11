'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Bell,
  TrendingDown,
  Target,
  Mail,
  Plane,
  Calendar,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { CreatePriceAlertModalProps } from '@/lib/types/price-alerts';
import { formatCityCode } from '@/lib/data/airports';
import { toast } from 'react-hot-toast';

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'BRL', symbol: 'R$' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' },
];

export function CreatePriceAlert({
  isOpen,
  onClose,
  flightData,
  onSuccess,
}: CreatePriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState(flightData.currency || 'USD');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Quick select options (percentage discounts)
  const quickSelectOptions = [
    { label: '5% off', percentage: 5 },
    { label: '10% off', percentage: 10 },
    { label: '15% off', percentage: 15 },
    { label: '20% off', percentage: 20 },
  ];

  // Calculate suggested target price (10% off)
  const suggestedPrice = Math.round(flightData.currentPrice * 0.9);

  // Initialize target price with suggested value
  useEffect(() => {
    if (isOpen && targetPrice === 0) {
      setTargetPrice(suggestedPrice);
    }
  }, [isOpen, suggestedPrice]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle quick select
  const handleQuickSelect = (percentage: number) => {
    const discountedPrice = Math.round(flightData.currentPrice * (1 - percentage / 100));
    setTargetPrice(discountedPrice);
    setError('');
  };

  // Validate target price
  const validateTargetPrice = (price: number): boolean => {
    if (price <= 0) {
      setError('Target price must be greater than 0');
      return false;
    }
    if (price >= flightData.currentPrice) {
      setError('Target price must be less than current price');
      return false;
    }
    setError('');
    return true;
  };

  // Handle target price change
  const handleTargetPriceChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setTargetPrice(numValue);
      validateTargetPrice(numValue);
    }
  };

  // Calculate savings
  const savings = flightData.currentPrice - targetPrice;
  const savingsPercentage = targetPrice > 0
    ? Math.round((savings / flightData.currentPrice) * 100)
    : 0;

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTargetPrice(targetPrice)) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: flightData.origin,
          destination: flightData.destination,
          departDate: flightData.departDate,
          returnDate: flightData.returnDate || null,
          currentPrice: flightData.currentPrice,
          targetPrice: targetPrice,
          currency: selectedCurrency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create price alert');
      }

      // Show success message
      if (data.updated) {
        toast.success('Price alert updated successfully!');
      } else {
        toast.success('Price alert created successfully!');
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(data.alert);
      }

      // Reset and close
      setTargetPrice(0);
      setError('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create price alert';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const currencySymbol = CURRENCY_OPTIONS.find(c => c.code === selectedCurrency)?.symbol || '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Set Price Alert</h2>
                <p className="text-primary-100 text-sm">Get notified when prices drop</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Flight Info */}
          <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Plane className="w-5 h-5 text-primary-500" />
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{flightData.origin}</span>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">{flightData.destination}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              {formatCityCode(flightData.origin)} → {formatCityCode(flightData.destination)}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(flightData.departDate)}</span>
              {flightData.returnDate && (
                <>
                  <span>-</span>
                  <span>{formatDate(flightData.returnDate)}</span>
                </>
              )}
            </div>
          </div>

          {/* Current Price Display */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Current Price
            </label>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-700">
                {currencySymbol}{flightData.currentPrice.toFixed(0)}
              </div>
              <div className="text-xs text-blue-600 mt-1">Price as of today</div>
            </div>
          </div>

          {/* Target Price Input */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Target Price *
              </label>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickSelectOptions.map((option) => {
                  const price = Math.round(flightData.currentPrice * (1 - option.percentage / 100));
                  const isSelected = targetPrice === price;
                  return (
                    <button
                      key={option.percentage}
                      type="button"
                      onClick={() => handleQuickSelect(option.percentage)}
                      className={`
                        py-2 px-3 rounded-lg font-semibold text-sm transition-all
                        ${isSelected
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      <div className="text-xs mb-1">{option.label}</div>
                      <div className="font-bold">{currencySymbol}{price}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Price Input */}
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={targetPrice || ''}
                  onChange={(e) => handleTargetPriceChange(e.target.value)}
                  placeholder={suggestedPrice.toString()}
                  className={`
                    w-full pl-16 pr-4 py-3 border-2 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    transition-all font-semibold text-lg
                    ${error ? 'border-red-500' : 'border-gray-200'}
                  `}
                  min="1"
                  max={flightData.currentPrice - 1}
                  step="1"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Savings Display */}
              {targetPrice > 0 && targetPrice < flightData.currentPrice && (
                <div className="mt-3 p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700 font-medium">Potential Savings</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        {currencySymbol}{savings.toFixed(0)}
                      </span>
                      <span className="text-sm text-green-600 bg-green-200 px-2 py-0.5 rounded-full font-semibold">
                        {savingsPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Currency
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              >
                {CURRENCY_OPTIONS.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Notifications Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <Mail className="w-4 h-4 text-primary-500" />
                    <span>Email Notifications</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Get notified when the price drops to your target
                  </div>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Check className="w-4 h-4" />
                How it works
              </h4>
              <ul className="space-y-1.5 text-xs text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>We monitor this flight 24/7 for price changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>Instant notification when price drops to your target</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>Direct booking link included in the alert</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>Manage all your alerts from your account dashboard</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !!error || targetPrice <= 0 || targetPrice >= flightData.currentPrice}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Alert...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    <span>Create Price Alert</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePriceAlert;
