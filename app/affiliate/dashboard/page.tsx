'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Award,
  DollarSign,
  TrendingUp,
  MousePointer,
  Users,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  Clock,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Download,
  ExternalLink,
} from 'lucide-react';

interface DashboardData {
  overview: {
    tier: string;
    status: string;
    currentBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
    lifetimePaid: number;
  };
  last30Days: {
    clicks: number;
    signups: number;
    bookings: number;
    completedTrips: number;
    activeDays: number;
    conversionRates: {
      clickToSignup: string;
      signupToBooking: string;
      bookingToCompleted: string;
      clickToCompleted: string;
    };
  };
  commissions: {
    byStatus: Array<{
      status: string;
      count: number;
      totalAmount: number;
    }>;
    recent: Array<{
      id: string;
      bookingId: string;
      customerPaid: number;
      yourProfit: number;
      commissionRate: number;
      commissionAmount: number;
      status: string;
      bookingDate: string;
    }>;
  };
  tierProgress: {
    currentTier: string;
    monthlyCompletedTrips: number;
    nextTier: string | null;
    tripsNeeded: number;
    progressPercentage: string;
    nextTierCommissionRate: number;
  };
  topSources: Array<{
    source: string;
    clicks: number;
    conversions: number;
    conversionRate: string;
  }>;
}

export default function AffiliateDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchDashboard();
      fetchProfile();
    }
  }, [status]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/affiliates/me/dashboard');

      if (!response.ok) {
        if (response.status === 404) {
          // Affiliate account not found - redirect to registration
          router.push('/affiliate/register');
          return;
        }
        throw new Error('Failed to fetch dashboard');
      }

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/affiliates/me');

      if (response.ok) {
        const result = await response.json();
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const copyTrackingUrl = () => {
    if (profile?.trackingUrl) {
      navigator.clipboard.writeText(profile.trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTierInfo = (tier: string) => {
    const tiers: Record<string, any> = {
      starter: {
        name: 'Starter',
        rate: '15%',
        color: 'bg-slate-100 text-slate-700',
        icon: '🌱',
      },
      bronze: {
        name: 'Bronze',
        rate: '20%',
        color: 'bg-orange-100 text-orange-700',
        icon: '🥉',
      },
      silver: {
        name: 'Silver',
        rate: '25%',
        color: 'bg-gray-100 text-gray-700',
        icon: '🥈',
      },
      gold: {
        name: 'Gold',
        rate: '30%',
        color: 'bg-yellow-100 text-yellow-700',
        icon: '🥇',
      },
      platinum: {
        name: 'Platinum',
        rate: '35%',
        color: 'bg-purple-100 text-purple-700',
        icon: '💎',
      },
    };

    return tiers[tier] || tiers.starter;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Affiliate Account</h2>
          <p className="text-gray-600 mb-4">Register as an affiliate to start earning commissions</p>
          <button
            onClick={() => router.push('/affiliate/register')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Register Now
          </button>
        </div>
      </div>
    );
  }

  const { overview, last30Days, commissions, tierProgress, topSources } = data;
  const tierInfo = getTierInfo(overview.tier);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8 text-primary-600" />
            Affiliate Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track your performance and earnings</p>
        </div>

        {/* Tier & Tracking URL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Tier */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-lg shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Your Tier</div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{tierInfo.icon}</span>
                  <span className="text-3xl font-bold">{tierInfo.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Commission Rate</div>
                <div className="text-3xl font-bold">{tierInfo.rate}</div>
              </div>
            </div>
            {tierProgress.nextTier && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="text-sm opacity-90 mb-2">
                  Progress to {tierProgress.nextTier.charAt(0).toUpperCase() + tierProgress.nextTier.slice(1)}
                </div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${tierProgress.progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs opacity-80">
                  {tierProgress.tripsNeeded} more trips this month
                </div>
              </div>
            )}
          </div>

          {/* Tracking URL */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Referral Link</h3>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-3 font-mono text-sm break-all">
              {profile?.trackingUrl || 'Loading...'}
            </div>
            <button
              onClick={copyTrackingUrl}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Available Balance
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${overview.currentBalance.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Ready for payout</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Clock className="h-4 w-4" />
              Pending Balance
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ${overview.pendingBalance.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Processing</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Lifetime Earnings
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${overview.lifetimeEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total earned</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Total Paid
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${overview.lifetimePaid.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Withdrawn</div>
          </div>
        </div>

        {/* Performance (Last 30 Days) */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            Last 30 Days Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">{last30Days.clicks}</div>
              <div className="text-sm text-gray-600 mt-1">Clicks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{last30Days.signups}</div>
              <div className="text-sm text-gray-600 mt-1">Sign Ups</div>
              <div className="text-xs text-green-600 mt-1">
                {last30Days.conversionRates.clickToSignup}% conversion
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{last30Days.bookings}</div>
              <div className="text-sm text-gray-600 mt-1">Bookings</div>
              <div className="text-xs text-green-600 mt-1">
                {last30Days.conversionRates.signupToBooking}% conversion
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">
                {last30Days.completedTrips}
              </div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
              <div className="text-xs text-green-600 mt-1">
                {last30Days.conversionRates.bookingToCompleted}% conversion
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{last30Days.activeDays}</div>
              <div className="text-sm text-gray-600 mt-1">Active Days</div>
            </div>
          </div>
        </div>

        {/* Recent Commissions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Commissions</h3>
              <a
                href="/affiliate/commissions"
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          {commissions.recent.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No commissions yet</p>
              <p className="text-sm text-gray-500 mt-1">Share your referral link to start earning!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Your Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {commissions.recent.slice(0, 5).map((comm) => (
                    <tr key={comm.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {comm.bookingId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${comm.customerPaid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${comm.commissionAmount.toFixed(2)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({(comm.commissionRate * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            comm.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : comm.status === 'approved'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {comm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(comm.bookingDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/affiliate/commissions"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <DollarSign className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">View Commissions</h3>
            <p className="text-sm text-gray-600">See all your earnings and status</p>
          </a>

          <a
            href="/affiliate/payouts"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Request Payout</h3>
            <p className="text-sm text-gray-600">Withdraw your available balance</p>
          </a>

          <a
            href="/affiliate/settings"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <Users className="h-8 w-8 text-gray-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
            <p className="text-sm text-gray-600">Update your payout preferences</p>
          </a>
        </div>
      </div>
    </div>
  );
}
