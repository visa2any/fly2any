'use client';

import { useState } from 'react';
import {
  Plane,
  TrendingDown,
  Calendar,
  Clock,
  Trash2,
  Check,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { PriceAlertCardProps } from '@/lib/types/price-alerts';
import { formatCityCode } from '@/lib/data/airports';

export function PriceAlertCard({
  alert,
  onToggleActive,
  onDelete,
  isUpdating = false,
}: PriceAlertCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  // Calculate savings
  const savings = alert.currentPrice - alert.targetPrice;
  const savingsPercentage = Math.round((savings / alert.currentPrice) * 100);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Get status badge
  const getStatusBadge = () => {
    if (alert.triggered) {
      return {
        text: 'Price Alert Triggered!',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: <Check className="w-3 h-3" />,
      };
    }
    if (alert.active) {
      return {
        text: 'Actively Monitoring',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <Clock className="w-3 h-3 animate-pulse" />,
      };
    }
    return {
      text: 'Inactive',
      color: 'bg-gray-100 text-gray-600 border-gray-300',
      icon: <AlertCircle className="w-3 h-3" />,
    };
  };

  const status = getStatusBadge();

  // Handle toggle active
  const handleToggleActive = async () => {
    setIsTogglingActive(true);
    try {
      await onToggleActive(alert.id, !alert.active);
    } finally {
      setIsTogglingActive(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(alert.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-2xl border-2 shadow-md hover:shadow-xl
        transition-all duration-300 overflow-hidden
        ${alert.triggered ? 'border-green-400 bg-gradient-to-br from-green-50 to-white' : 'border-gray-200'}
        ${!alert.active ? 'opacity-75' : ''}
      `}
    >
      {/* Accent Bar */}
      <div
        className={`h-1 w-full ${
          alert.triggered
            ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-400'
            : alert.active
            ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400'
            : 'bg-gray-300'
        }`}
      />

      <div className="p-6">
        {/* Header: Route & Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Route */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {alert.origin}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold text-gray-900">
                  {alert.destination}
                </span>
              </div>
              <Plane className="w-5 h-5 text-primary-500" />
            </div>

            {/* City Names */}
            <div className="text-sm text-gray-600 mb-3">
              {formatCityCode(alert.origin)} → {formatCityCode(alert.destination)}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(alert.departDate)}</span>
              {alert.returnDate && (
                <>
                  <span>-</span>
                  <span>{formatDate(alert.returnDate)}</span>
                </>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold ${status.color}`}>
            {status.icon}
            <span>{status.text}</span>
          </div>
        </div>

        {/* Price Comparison */}
        <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            {/* Current Price */}
            <div>
              <div className="text-xs text-gray-600 font-medium mb-1">Current Price</div>
              <div className="text-2xl font-bold text-gray-900">
                {alert.currency}{alert.currentPrice.toFixed(0)}
              </div>
            </div>

            {/* Target Price */}
            <div>
              <div className="text-xs text-gray-600 font-medium mb-1">Target Price</div>
              <div className="text-2xl font-bold text-green-600">
                {alert.currency}{alert.targetPrice.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Savings Display */}
          {savings > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Potential Savings</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold text-green-600">
                    {alert.currency}{savings.toFixed(0)}
                  </span>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                    {savingsPercentage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                  alert.triggered ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                }`}
                style={{
                  width: `${Math.min((alert.targetPrice / alert.currentPrice) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Target</span>
              <span>Current</span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Last checked {formatTimeAgo(alert.lastChecked)}</span>
          </div>
          {alert.triggeredAt && (
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <Check className="w-3 h-3" />
              <span>Triggered {formatTimeAgo(alert.triggeredAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Toggle Active */}
          <button
            onClick={handleToggleActive}
            disabled={isTogglingActive || isUpdating}
            className={`
              flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm
              transition-all duration-200 flex items-center justify-center gap-2
              ${alert.active
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isTogglingActive ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : alert.active ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Pause Alert</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Activate Alert</span>
              </>
            )}
          </button>

          {/* Delete Button */}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Delete alert"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Triggered Pulse Animation */}
      {alert.triggered && (
        <div className="absolute -top-1 -right-1 w-6 h-6">
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
          <div className="relative w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceAlertCard;
