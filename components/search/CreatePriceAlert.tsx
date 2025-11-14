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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header - Clean & Balanced */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-3.5 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">Set Price Alert</h2>
                <p className="text-primary-100 text-xs">Get notified when price drops</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - Well Organized */}
        <div className="p-5">
          {/* Section 1: Flight Route & Current Price */}
          <div className="mb-4 p-3.5 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200">
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <Plane className="w-4 h-4 text-primary-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">{flightData.origin}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-base font-bold text-gray-900">{flightData.destination}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 ml-6">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(flightData.departDate)}</span>
                  {flightData.returnDate && (
                    <>
                      <span className="mx-0.5">→</span>
                      <span>{formatDate(flightData.returnDate)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right bg-white px-3 py-2 rounded-lg border border-blue-200">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Current</div>
                <div className="text-lg font-bold text-blue-600">
                  {currencySymbol}{flightData.currentPrice.toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Target Price Selection */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Your Target Price
              </label>

              {/* Quick Select Options */}
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
                        py-2 px-2 rounded-lg text-xs font-semibold transition-all
                        ${isSelected
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }
                      `}
                    >
                      <div className="text-[10px] opacity-90 mb-1">{option.label}</div>
                      <div className="font-bold">{currencySymbol}{price}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Price Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="text-gray-600 font-bold text-sm">{currencySymbol}</span>
                </div>
                <input
                  type="number"
                  value={targetPrice || ''}
                  onChange={(e) => handleTargetPriceChange(e.target.value)}
                  placeholder={`Enter amount (e.g., ${suggestedPrice})`}
                  className={`
                    w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm font-semibold
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    transition-all placeholder:text-gray-400 placeholder:font-normal
                    ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}
                  `}
                  min="1"
                  max={flightData.currentPrice - 1}
                  step="1"
                  required
                />
              </div>

              {/* Error or Savings */}
              {error ? (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ) : targetPrice > 0 && targetPrice < flightData.currentPrice && (
                <div className="mt-2.5 p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700 font-medium">You'll save</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-green-600">
                        {currencySymbol}{savings.toFixed(0)}
                      </span>
                      <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded-full font-semibold">
                        {savingsPercentage}% off
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Options & Submit */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                {/* Currency */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    {CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Notification */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Notifications
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors h-[38px]">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <Mail className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!error || targetPrice <= 0 || targetPrice >= flightData.currentPrice}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Create Alert</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePriceAlert;
