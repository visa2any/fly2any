'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Trash2,
  MapPin,
  Calendar,
  TrendingDown,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface PriceAlert {
  id: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  currentPrice: number;
  targetPrice: number;
  currency: string;
  active: boolean;
  triggered: boolean;
  triggeredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account/alerts');
      return;
    }

    if (status === 'authenticated') {
      fetchAlerts();
    }
  }, [status, router]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/price-alerts');

      if (!response.ok) {
        throw new Error('Failed to fetch price alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err: any) {
      console.error('Error fetching price alerts:', err);
      setError(err.message || 'Failed to load price alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);

      const response = await fetch(`/api/price-alerts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete price alert');
      }

      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Price alert deleted');
    } catch (err: any) {
      console.error('Error deleting price alert:', err);
      toast.error('Failed to delete price alert');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/price-alerts?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update price alert');
      }

      setAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, active: !currentActive } : a
      ));
      toast.success(currentActive ? 'Alert paused' : 'Alert activated');
    } catch (err: any) {
      console.error('Error updating price alert:', err);
      toast.error('Failed to update price alert');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const activeAlerts = alerts.filter(a => a.active && !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);
  const pausedAlerts = alerts.filter(a => !a.active && !a.triggered);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Alerts</h1>
            <p className="text-gray-600">Get notified when prices drop</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Alerts</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchAlerts}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (alerts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Alerts</h1>
            <p className="text-gray-600">Get notified when prices drop</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Price Alerts Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create price alerts when searching for flights. We'll notify you when prices drop to your target!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Search Flights
            </Link>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-orange-50 rounded-lg p-4">
                <Bell className="w-8 h-8 text-orange-600 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Set Target Price</h3>
                <p className="text-sm text-gray-600">
                  Choose your ideal price when saving a search
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <TrendingDown className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">We Monitor</h3>
                <p className="text-sm text-gray-600">
                  We check prices regularly and track drops
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-primary-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Get Notified</h3>
                <p className="text-sm text-gray-600">
                  Receive email when price hits your target
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Alerts</h1>
            <p className="text-gray-600">
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'} • {activeAlerts.length} active
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Alert
          </Link>
        </div>

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Price Drops Detected! ({triggeredAlerts.length})
            </h2>
            <div className="space-y-4">
              {triggeredAlerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDelete={handleDelete}
                  onToggle={handleToggleActive}
                  deletingId={deletingId}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-600" />
              Active Alerts ({activeAlerts.length})
            </h2>
            <div className="space-y-4">
              {activeAlerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDelete={handleDelete}
                  onToggle={handleToggleActive}
                  deletingId={deletingId}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        )}

        {/* Paused Alerts */}
        {pausedAlerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-500 mb-4">
              Paused Alerts ({pausedAlerts.length})
            </h2>
            <div className="space-y-4 opacity-70">
              {pausedAlerts.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDelete={handleDelete}
                  onToggle={handleToggleActive}
                  deletingId={deletingId}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        )}

        {/* Back to Account Link */}
        <div className="mt-12 text-center">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Account
          </Link>
        </div>
      </div>
    </div>
  );
}

// Alert Card Component
function AlertCard({
  alert,
  onDelete,
  onToggle,
  deletingId,
  formatDate,
  formatPrice
}: {
  alert: PriceAlert;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  deletingId: string | null;
  formatDate: (date: string) => string;
  formatPrice: (price: number, currency: string) => string;
}) {
  const priceDiff = alert.currentPrice - alert.targetPrice;
  const percentDiff = ((priceDiff / alert.currentPrice) * 100).toFixed(0);

  return (
    <div className={`bg-white rounded-xl shadow-md border-2 p-6 transition-all ${
      alert.triggered
        ? 'border-green-400 bg-green-50'
        : alert.active
          ? 'border-orange-200 hover:border-orange-400'
          : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Route */}
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            <span className="text-lg font-bold text-gray-900">
              {alert.origin} → {alert.destination}
            </span>
            {alert.triggered && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full animate-pulse">
                PRICE DROP!
              </span>
            )}
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(alert.departDate)}</span>
            {alert.returnDate && (
              <>
                <span>→</span>
                <span>{formatDate(alert.returnDate)}</span>
              </>
            )}
          </div>

          {/* Prices */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase">Current Price</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(alert.currentPrice, alert.currency)}
              </p>
            </div>
            <div className="text-2xl text-gray-300">→</div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Target Price</p>
              <p className="text-xl font-bold text-orange-600">
                {formatPrice(alert.targetPrice, alert.currency)}
              </p>
            </div>
            {priceDiff > 0 && (
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <p className="text-sm font-semibold text-orange-700">
                  -{percentDiff}% to go
                </p>
              </div>
            )}
            {alert.triggered && (
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <p className="text-sm font-semibold text-green-700">
                  Target reached!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Search Button */}
          <Link
            href={`/flights/results?from=${alert.origin}&to=${alert.destination}&departure=${alert.departDate}${alert.returnDate ? `&return=${alert.returnDate}` : ''}&adults=1`}
            className="p-2 text-primary-500 hover:bg-info-50 rounded-lg transition-colors"
            title="Search this route"
          >
            <ExternalLink className="w-5 h-5" />
          </Link>

          {/* Toggle Active */}
          <button
            onClick={() => onToggle(alert.id, alert.active)}
            className={`p-2 rounded-lg transition-colors ${
              alert.active
                ? 'text-orange-600 hover:bg-orange-50'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={alert.active ? 'Pause alert' : 'Activate alert'}
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(alert.id)}
            disabled={deletingId === alert.id}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Delete alert"
          >
            {deletingId === alert.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Created date */}
      <p className="text-xs text-gray-400 mt-4">
        Created {formatDate(alert.createdAt)}
        {alert.triggeredAt && ` • Triggered ${formatDate(alert.triggeredAt)}`}
      </p>
    </div>
  );
}
