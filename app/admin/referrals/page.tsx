'use client'

import { useState, useEffect } from 'react'
import {
  Gift,
  TrendingUp,
  Users,
  Award,
  Lock,
  Unlock,
  DollarSign,
  Target,
  Activity
} from 'lucide-react'

interface ReferralStats {
  totalReferrals: number
  activeReferrers: number
  totalPointsAwarded: number
  totalPointsLocked: number
  totalPointsRedeemed: number
  conversionRate: number
  totalRevenue: number
}

interface TopReferrer {
  id: string
  name: string
  email: string
  referralCode: string
  directReferralsCount: number
  totalNetworkSize: number
  fly2anyPoints: number
  fly2anyPointsLocked: number
  fly2anyPointsLifetime: number
  totalRevenue: number
}

interface RecentActivity {
  id: string
  type: 'signup' | 'booking' | 'unlock' | 'redeem'
  referrerName: string
  referreeName: string
  points: number
  amount?: number
  createdAt: string
}

export default function AdminReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'referrers' | 'activity'>('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/referrals/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data.stats)
        setTopReferrers(data.data.topReferrers)
        setRecentActivity(data.data.recentActivity)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading referral data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Gift className="h-8 w-8 text-blue-600" />
            Refer & Earn Program
          </h1>
          <p className="text-gray-600 mt-1">
            Customer referral program with 3-tier rewards
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Referrals</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalReferrals.toLocaleString()}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600 opacity-50" />
            </div>
            <p className="text-xs text-blue-700 mt-2">All-time signups via referral</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Active Referrers</p>
                <p className="text-3xl font-bold text-green-900">{stats.activeReferrers.toLocaleString()}</p>
              </div>
              <Target className="h-10 w-10 text-green-600 opacity-50" />
            </div>
            <p className="text-xs text-green-700 mt-2">Users with 1+ referral</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Points Awarded</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalPointsAwarded.toLocaleString()}</p>
              </div>
              <Award className="h-10 w-10 text-purple-600 opacity-50" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Lock className="h-3 w-3 text-orange-600" />
              <span className="text-orange-700">{stats.totalPointsLocked.toLocaleString()} locked</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">Revenue Generated</p>
                <p className="text-3xl font-bold text-orange-900">${(stats.totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-600 opacity-50" />
            </div>
            <p className="text-xs text-orange-700 mt-2">From referred customers</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Program Overview
          </button>
          <button
            onClick={() => setActiveTab('referrers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'referrers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Top Referrers
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Activity
          </button>
        </nav>
      </div>

      {/* Program Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Rewards Structure
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Level 1 (Direct Referrals)</h3>
                <p className="text-sm text-blue-700">
                  <strong>50 points per $100</strong> booking from direct referrals (50% of booking value)
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Level 2 (2nd Tier)</h3>
                <p className="text-sm text-blue-700">
                  <strong>20 points per $100</strong> booking from your referrals' referrals (20%)
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Level 3 (3rd Tier)</h3>
                <p className="text-sm text-blue-700">
                  <strong>10 points per $100</strong> booking from 3rd tier referrals (10%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Product Multipliers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">1.0x</p>
                <p className="text-sm text-gray-600 mt-1">Flights</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">1.2x</p>
                <p className="text-sm text-gray-600 mt-1">International</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">1.5x</p>
                <p className="text-sm text-gray-600 mt-1">Hotels</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">2.0x</p>
                <p className="text-sm text-gray-600 mt-1">Packages</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-600" />
              Points Locking Rules
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Points Locked Until Trip Completes</p>
                  <p className="text-sm text-gray-600">All earned points remain locked until the trip ends successfully</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Unlock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Auto-Unlock After Trip</p>
                  <p className="text-sm text-gray-600">Points automatically unlock after trip end date + grace period</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Anti-Fraud Protection</p>
                  <p className="text-sm text-gray-600">Cancelled or refunded bookings forfeit all points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Referrers Tab */}
      {activeTab === 'referrers' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direct Referrals
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Network Size
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Points
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locked Points
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lifetime Points
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue Generated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topReferrers.map((referrer, index) => (
                  <tr key={referrer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{referrer.name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{referrer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded">
                        {referrer.referralCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {referrer.directReferralsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {referrer.totalNetworkSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-green-600">
                        {referrer.fly2anyPoints.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-orange-600">
                        {referrer.fly2anyPointsLocked.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-purple-600">
                        {referrer.fly2anyPointsLifetime.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      ${referrer.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {topReferrers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No referrers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'signup' ? 'bg-blue-100' :
                  activity.type === 'booking' ? 'bg-green-100' :
                  activity.type === 'unlock' ? 'bg-purple-100' :
                  'bg-orange-100'
                }`}>
                  {activity.type === 'signup' && <Users className="h-5 w-5 text-blue-600" />}
                  {activity.type === 'booking' && <DollarSign className="h-5 w-5 text-green-600" />}
                  {activity.type === 'unlock' && <Unlock className="h-5 w-5 text-purple-600" />}
                  {activity.type === 'redeem' && <Award className="h-5 w-5 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'signup' && `${activity.referreeName} signed up via ${activity.referrerName}'s referral`}
                    {activity.type === 'booking' && `${activity.referreeName} made a booking - ${activity.referrerName} earned ${activity.points} points`}
                    {activity.type === 'unlock' && `${activity.points} points unlocked for ${activity.referrerName}`}
                    {activity.type === 'redeem' && `${activity.referrerName} redeemed ${activity.points} points`}
                  </p>
                  {activity.amount && (
                    <p className="text-sm text-gray-600 mt-1">
                      Booking Amount: ${activity.amount.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-blue-600">
                    +{activity.points} pts
                  </span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
