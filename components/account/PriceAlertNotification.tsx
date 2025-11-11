'use client';

import { useState } from 'react';
import { Bell, X, TrendingDown, ArrowRight, ExternalLink } from 'lucide-react';
import { PriceAlertNotificationProps } from '@/lib/types/price-alerts';
import { formatCityCode } from '@/lib/data/airports';
import Link from 'next/link';

export function PriceAlertNotification({
  triggeredAlerts,
  onDismiss,
  onViewAlerts,
}: PriceAlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || triggeredAlerts.length === 0) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleViewAlerts = () => {
    onViewAlerts();
    handleDismiss();
  };

  // Get the first alert for preview
  const firstAlert = triggeredAlerts[0];
  const totalAlerts = triggeredAlerts.length;
  const hasMultiple = totalAlerts > 1;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        transform transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-400 overflow-hidden animate-slideInRight">
        {/* Accent Bar with Animation */}
        <div className="h-2 bg-gradient-to-r from-green-400 via-green-500 to-green-400 animate-shimmer" />

        {/* Header */}
        <div className="bg-gradient-to-br from-green-50 to-white p-4 border-b border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                {/* Animated Ping */}
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75" />
                  <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{totalAlerts}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Price Alert{hasMultiple ? 's' : ''} Triggered!
                </h3>
                <p className="text-sm text-green-700">
                  {hasMultiple
                    ? `${totalAlerts} flights reached your target price`
                    : 'Your flight reached your target price'}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Alert Preview */}
        <div className="p-4 bg-gradient-to-br from-white to-green-50/30">
          {/* First Alert */}
          <div className="mb-3 p-3 bg-white rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <span className="text-lg">{firstAlert.origin}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="text-lg">{firstAlert.destination}</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 mb-3">
              {formatCityCode(firstAlert.origin)} → {formatCityCode(firstAlert.destination)}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600">Current Price</div>
                <div className="text-xl font-bold text-green-600">
                  {firstAlert.currency}{firstAlert.currentPrice.toFixed(0)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <div className="text-right">
                  <div className="text-xs text-gray-600">You Save</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round(((firstAlert.targetPrice - firstAlert.currentPrice) / firstAlert.targetPrice) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Alerts Count */}
          {hasMultiple && (
            <div className="text-center text-sm text-gray-600 mb-3">
              + {totalAlerts - 1} more alert{totalAlerts - 1 > 1 ? 's' : ''} triggered
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleViewAlerts}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View All Alerts</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        {/* Footer Tip */}
        <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-green-100/50 border-t border-green-200">
          <p className="text-xs text-green-700 text-center">
            Book now before prices go up again!
          </p>
        </div>
      </div>
    </div>
  );
}

export default PriceAlertNotification;
