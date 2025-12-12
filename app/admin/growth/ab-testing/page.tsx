/**
 * A/B Testing Admin Dashboard - Fly2Any Growth OS
 *
 * View and manage A/B tests with statistical analysis
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChartBarIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface VariantMetrics {
  variant: string
  exposures: number
  views: number
  clicks: number
  startedBooking: number
  reachedPayment: number
  conversions: number
  conversionRate: number
  revenue: number
  revenuePerUser: number
  clickThroughRate: number
  bookingStartRate: number
  paymentReachRate: number
}

interface TestResults {
  testId: string
  testName: string
  status: 'active' | 'inactive' | 'completed'
  startDate: string
  endDate?: string
  variants: VariantMetrics[]
  winner?: string
  lift?: number
  confidence?: number
}

interface ABTestData {
  success: boolean
  timestamp: string
  tests: TestResults[]
  summary: {
    totalTests: number
    activeTests: number
    winnersFound: number
  }
}

export default function ABTestingDashboard() {
  const [data, setData] = useState<ABTestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchABTests()
  }, [])

  const fetchABTests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/ab-tests')
      if (!response.ok) throw new Error('Failed to fetch A/B tests')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getConfidenceColor = (confidence: number | undefined) => {
    if (!confidence) return 'text-gray-400'
    if (confidence >= 95) return 'text-green-600'
    if (confidence >= 80) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getLiftColor = (lift: number | undefined) => {
    if (!lift) return 'text-gray-400'
    if (lift > 0) return 'text-green-600'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading A/B tests</h3>
            <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
            <button
              onClick={fetchABTests}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
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
              <span>A/B Testing</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BeakerIcon className="w-8 h-8 text-blue-600" />
              A/B Testing Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor experiment performance and statistical significance
            </p>
          </div>
          <button
            onClick={fetchABTests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BeakerIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.summary.totalTests || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.summary.activeTests || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Winners Found</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.summary.winnersFound || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Experiment Results
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {data?.tests.map(test => (
              <div key={test.testId} className="p-6">
                {/* Test Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {test.testName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {test.testId} | Started: {new Date(test.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Lift</p>
                      <p className={`text-lg font-bold ${getLiftColor(test.lift)}`}>
                        {test.lift !== undefined ? `${test.lift > 0 ? '+' : ''}${test.lift}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Confidence</p>
                      <p className={`text-lg font-bold ${getConfidenceColor(test.confidence)}`}>
                        {test.confidence !== undefined ? `${test.confidence}%` : 'N/A'}
                      </p>
                    </div>
                    {test.winner && (
                      <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        Winner: {test.winner}
                      </div>
                    )}
                  </div>
                </div>

                {/* Variants Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50">
                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Variant</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Exposures</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">CTR</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Booking Start</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Conversions</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Conv. Rate</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Revenue</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">RPU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {test.variants.map(variant => (
                        <tr key={variant.variant} className={variant.variant === test.winner ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-2 ${variant.variant === test.winner ? 'font-semibold text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'}`}>
                              {variant.variant === test.winner && (
                                <CheckCircleIcon className="w-4 h-4" />
                              )}
                              {variant.variant === 'control' ? 'Control' : variant.variant.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                            {variant.exposures.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                            {variant.clickThroughRate}%
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                            {variant.bookingStartRate}%
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                            {variant.conversions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                            {variant.conversionRate}%
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                            ${variant.revenue.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                            ${variant.revenuePerUser.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  )
}
