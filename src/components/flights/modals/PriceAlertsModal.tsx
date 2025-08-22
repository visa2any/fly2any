'use client';

/**
 * Price Alerts Modal Component
 * Setup price monitoring for flight routes
 */

import React, { useState } from 'react';
import { 
  XIcon,
  BellIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CheckIcon,
  DollarIcon
} from '@/components/Icons';

interface PriceAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchData: {
    from: string;
    to: string;
    departure: string;
    return?: string | null;
    adults: number;
    class: string;
  };
  currentPrice?: number;
}

interface AlertSettings {
  email: string;
  sms?: string;
  priceThreshold: number;
  alertType: 'any_drop' | 'specific_price' | 'percentage_drop';
  percentageThreshold?: number;
}

export default function PriceAlertsModal({ 
  isOpen, 
  onClose, 
  searchData,
  currentPrice = 850 
}: PriceAlertsModalProps) {
  const [settings, setSettings] = useState<AlertSettings>({
    email: '',
    priceThreshold: Math.round(currentPrice * 0.9), // 10% less than current
    alertType: 'any_drop',
    percentageThreshold: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Price Alerts</h2>
                <p className="text-white/90">Get notified when prices drop</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Flight Info */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <span>{searchData.from}</span>
                  <span className="text-blue-500">→</span>
                  <span>{searchData.to}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {searchData.departure} • {searchData.adults} passenger{searchData.adults > 1 ? 's' : ''} • {searchData.class}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${currentPrice}
                </div>
                <div className="text-sm text-gray-500">Current price</div>
              </div>
            </div>
          </div>

          {isSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Alert Created!</h3>
              <p className="text-gray-600">You'll be notified when prices drop for this route.</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Alert Type */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Alert me when:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="alertType"
                      value="any_drop"
                      checked={settings.alertType === 'any_drop'}
                      onChange={(e) => setSettings(prev => ({ ...prev, alertType: e.target.value as any }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Any price drop</div>
                      <div className="text-sm text-gray-600">Get notified for any decrease in price</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="alertType"
                      value="specific_price"
                      checked={settings.alertType === 'specific_price'}
                      onChange={(e) => setSettings(prev => ({ ...prev, alertType: e.target.value as any }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Price drops below</div>
                      <div className="text-sm text-gray-600">Set a specific target price</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">$</span>
                      <input
                        type="number"
                        value={settings.priceThreshold}
                        onChange={(e) => setSettings(prev => ({ ...prev, priceThreshold: parseInt(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-center"
                        disabled={settings.alertType !== 'specific_price'}
                      />
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="alertType"
                      value="percentage_drop"
                      checked={settings.alertType === 'percentage_drop'}
                      onChange={(e) => setSettings(prev => ({ ...prev, alertType: e.target.value as any }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Percentage drop</div>
                      <div className="text-sm text-gray-600">Get notified when price drops by a specific percentage</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={settings.percentageThreshold || 10}
                        onChange={(e) => setSettings(prev => ({ ...prev, percentageThreshold: parseInt(e.target.value) || 10 }))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center"
                        disabled={settings.alertType !== 'percentage_drop'}
                        min="1"
                        max="50"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  How should we notify you?
                </label>
                <div className="space-y-3">
                  <div>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="SMS number (optional)"
                      value={settings.sms || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, sms: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Price Insights */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <TrendingUpIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold text-yellow-800 mb-1">Price Insights</div>
                    <div className="text-yellow-700">
                      Prices for this route typically drop by 15-25% within 2 weeks. 
                      Best booking window is usually 3-8 weeks before departure.
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !settings.email}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  isSubmitting || !settings.email
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transform hover:scale-[1.01]'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Alert...
                  </span>
                ) : (
                  'Create Price Alert'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}