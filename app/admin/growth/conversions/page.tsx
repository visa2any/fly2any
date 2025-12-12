/**
 * Conversion Optimization Dashboard - Fly2Any Growth OS
 *
 * Track and optimize conversion funnels across the booking journey
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChartBarIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface FunnelStep {
  name: string
  key: string
  count: number
  rate: number
  dropoff: number
  trend: number
  icon: React.ReactNode
}

interface ConversionMetrics {
  totalVisitors: number
  totalSearches: number
  flightViews: number
  bookingStarts: number
  paymentReached: number
  completedBookings: number
  abandonedCarts: number
  revenue: number
  avgOrderValue: number
  conversionRate: number
  revenuePerVisitor: number
}

const mockMetrics: ConversionMetrics = {
  totalVisitors: 125000,
  totalSearches: 45000,
  flightViews: 28500,
  bookingStarts: 4200,
  paymentReached: 2800,
  completedBookings: 1850,
  abandonedCarts: 2350,
  revenue: 832500,
  avgOrderValue: 450,
  conversionRate: 1.48,
  revenuePerVisitor: 6.66
}

const mockFunnel: FunnelStep[] = [
  {
    name: 'Visitors',
    key: 'visitors',
    count: 125000,
    rate: 100,
    dropoff: 0,
    trend: 12.5,
    icon: <UserGroupIcon className="w-5 h-5" />
  },
  {
    name: 'Searches',
    key: 'searches',
    count: 45000,
    rate: 36,
    dropoff: 64,
    trend: 8.2,
    icon: <ChartBarIcon className="w-5 h-5" />
  },
  {
    name: 'Flight Views',
    key: 'views',
    count: 28500,
    rate: 22.8,
    dropoff: 36.7,
    trend: -2.1,
    icon: <ShoppingCartIcon className="w-5 h-5" />
  },
  {
    name: 'Booking Started',
    key: 'booking_start',
    count: 4200,
    rate: 3.36,
    dropoff: 85.3,
    trend: 15.3,
    icon: <ShoppingCartIcon className="w-5 h-5" />
  },
  {
    name: 'Payment Page',
    key: 'payment',
    count: 2800,
    rate: 2.24,
    dropoff: 33.3,
    trend: 5.8,
    icon: <CreditCardIcon className="w-5 h-5" />
  },
  {
    name: 'Completed',
    key: 'completed',
    count: 1850,
    rate: 1.48,
    dropoff: 33.9,
    trend: 18.2,
    icon: <CheckCircleIcon className="w-5 h-5" />
  }
]

const dropoffInsights = [
  {
    step: 'Search → Flight View',
    dropoff: '36.7%',
    issue: 'Users not finding relevant flights',
    recommendation: 'Improve search relevance and add price predictions',
    priority: 'high'
  },
  {
    step: 'Flight View → Booking',
    dropoff: '85.3%',
    issue: 'High bounce rate from results page',
    recommendation: 'Add urgency signals, better filtering, and price alerts',
    priority: 'critical'
  },
  {
    step: 'Booking → Payment',
    dropoff: '33.3%',
    issue: 'Cart abandonment during passenger details',
    recommendation: 'Simplify form, add progress indicator, save draft',
    priority: 'high'
  },
  {
    step: 'Payment → Complete',
    dropoff: '33.9%',
    issue: 'Payment page abandonment',
    recommendation: 'Add trust signals, multiple payment options, clearer pricing',
    priority: 'medium'
  }
]

export default function ConversionsDashboard() {
  const [metrics, setMetrics] = useState<ConversionMetrics>(mockMetrics)
  const [funnel, setFunnel] = useState<FunnelStep[]>(mockFunnel)
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    }
    return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/admin" className="hover:text-blue-600">Admin</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <Link href="/admin/growth" className="hover:text-blue-600">Growth</Link>
              <ChevronRightIcon className="w-4 h-4" />
              <span>Conversions</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FunnelIcon className="w-8 h-8 text-purple-600" />
              Conversion Optimization
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track and optimize your booking funnel performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Visitors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalVisitors.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.conversionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${metrics.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Abandoned Carts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.abandonedCarts.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Booking Funnel
          </h2>

          <div className="space-y-4">
            {funnel.map((step, index) => (
              <div key={step.key} className="relative">
                <div className="flex items-center gap-4">
                  {/* Step icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    index === funnel.length - 1 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {step.icon}
                  </div>

                  {/* Step name and count */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">{step.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {step.count.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">({step.rate}%)</span>
                        <div className="flex items-center gap-1 text-sm">
                          {getTrendIcon(step.trend)}
                          <span className={step.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                            {step.trend > 0 ? '+' : ''}{step.trend}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          index === funnel.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${step.rate}%` }}
                      />
                    </div>

                    {/* Dropoff indicator */}
                    {step.dropoff > 0 && (
                      <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                        {step.dropoff}% dropoff
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {index < funnel.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-600 h-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dropoff Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
            Optimization Insights
          </h2>

          <div className="space-y-4">
            {dropoffInsights.map((insight, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{insight.step}</h3>
                    <p className="text-lg font-bold text-red-600">{insight.dropoff} dropoff</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  <strong>Issue:</strong> {insight.issue}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Recommendation:</strong> {insight.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/growth/ab-testing"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Run A/B Test</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test changes to optimize conversion rates
            </p>
          </Link>

          <Link
            href="/admin/growth/email"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cart Recovery</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send abandoned cart emails to recover sales
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">View Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deep dive into user behavior data
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
