'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  TrendingDown,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Check,
  Clock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { PriceAlert } from '@/lib/types/price-alerts';
import PriceAlertCard from '@/components/account/PriceAlertCard';
import PriceAlertNotification from '@/components/account/PriceAlertNotification';
import { toast } from 'react-hot-toast';

type FilterType = 'all' | 'active' | 'triggered' | 'inactive';

export default function PriceAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNotification, setShowNotification] = useState(false);

  // Fetch alerts
  const fetchAlerts = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const response = await fetch('/api/price-alerts');

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin');
          return;
        }
        throw new Error('Failed to fetch price alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);

      // Check if there are triggered alerts
      const triggered = data.alerts?.filter((a: PriceAlert) => a.triggered) || [];
      if (triggered.length > 0) {
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      toast.error('Failed to load price alerts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = alerts;

    switch (filter) {
      case 'active':
        filtered = alerts.filter((a) => a.active && !a.triggered);
        break;
      case 'triggered':
        filtered = alerts.filter((a) => a.triggered);
        break;
      case 'inactive':
        filtered = alerts.filter((a) => !a.active);
        break;
      case 'all':
      default:
        filtered = alerts;
    }

    setFilteredAlerts(filtered);
  }, [alerts, filter]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAlerts(false);
    toast.success('Alerts refreshed');
  };

  // Handle toggle active
  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/price-alerts?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update alert');
      }

      const data = await response.json();

      // Update local state
      setAlerts((prev) =>
        prev.map((alert) => (alert.id === id ? data.alert : alert))
      );

      toast.success(active ? 'Alert activated' : 'Alert paused');
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Failed to update alert');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/price-alerts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }

      // Remove from local state
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      toast.success('Alert deleted');
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  // Get filter stats
  const stats = {
    all: alerts.length,
    active: alerts.filter((a) => a.active && !a.triggered).length,
    triggered: alerts.filter((a) => a.triggered).length,
    inactive: alerts.filter((a) => !a.active).length,
  };

  // Filter options
  const filterOptions: Array<{
    value: FilterType;
    label: string;
    icon: React.ReactNode;
    color: string;
    count: number;
  }> = [
    {
      value: 'all',
      label: 'All Alerts',
      icon: <Bell className="w-4 h-4" />,
      color: 'text-gray-700 bg-gray-100 hover:bg-gray-200',
      count: stats.all,
    },
    {
      value: 'active',
      label: 'Active',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200',
      count: stats.active,
    },
    {
      value: 'triggered',
      label: 'Triggered',
      icon: <Check className="w-4 h-4" />,
      color: 'text-green-700 bg-green-100 hover:bg-green-200',
      count: stats.triggered,
    },
    {
      value: 'inactive',
      label: 'Inactive',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'text-gray-700 bg-gray-100 hover:bg-gray-200',
      count: stats.inactive,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notification */}
      {showNotification && (
        <PriceAlertNotification
          triggeredAlerts={alerts.filter((a) => a.triggered)}
          onDismiss={() => setShowNotification(false)}
          onViewAlerts={() => {
            setFilter('triggered');
            setShowNotification(false);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Account</span>
          </Link>

          {/* Title */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Price Alerts</h1>
                <p className="text-lg text-gray-600 mt-1">
                  Track flight prices and save money
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Refresh alerts"
              >
                <RefreshCw className={`w-5 h-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Alert</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.all}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Triggered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.triggered}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Potential Savings</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  $
                  {alerts
                    .reduce((sum, a) => sum + (a.currentPrice - a.targetPrice), 0)
                    .toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Filter className="w-5 h-5" />
              <span>Filter:</span>
            </div>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
                  transition-all border-2
                  ${
                    filter === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 scale-105 shadow-md'
                      : `border-transparent ${option.color}`
                  }
                `}
              >
                {option.icon}
                <span>{option.label}</span>
                <span className="ml-1 px-2 py-0.5 bg-white rounded-full text-xs font-bold">
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading your price alerts...</p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-md border-2 border-gray-200 text-center">
            {filter === 'all' ? (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No Price Alerts Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start tracking flight prices and we'll notify you when they drop to your
                  target price. Never miss a great deal!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Search Flights & Set Alerts</span>
                </Link>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No {filter.charAt(0).toUpperCase() + filter.slice(1)} Alerts
                </h3>
                <p className="text-gray-600 mb-6">
                  Try selecting a different filter to view your alerts.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>View All Alerts</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAlerts.map((alert) => (
              <PriceAlertCard
                key={alert.id}
                alert={alert}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Help Section */}
        {alerts.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Pro Tips for Price Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm text-blue-900 font-semibold">Set realistic targets</p>
                  <p className="text-xs text-blue-700">
                    Aim for 10-20% discounts for better chances of triggering
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm text-blue-900 font-semibold">Book quickly</p>
                  <p className="text-xs text-blue-700">
                    Prices can change fast - book within hours of alert
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm text-blue-900 font-semibold">Multiple alerts</p>
                  <p className="text-xs text-blue-700">
                    Set alerts for flexible dates to increase savings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold">4</span>
                </div>
                <div>
                  <p className="text-sm text-blue-900 font-semibold">Best days</p>
                  <p className="text-xs text-blue-700">
                    Prices often drop on Tuesday/Wednesday mornings
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
