'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Globe,
  Award,
  DollarSign,
  TrendingUp,
  MousePointer,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  AlertCircle,
  RefreshCw,
  Download,
  Send,
  Edit,
} from 'lucide-react';

interface AffiliateDetails {
  affiliate: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userJoined: string;
    businessName?: string;
    website?: string;
    taxId?: string;
    tier: string;
    status: string;
    referralCode: string;
    trackingId: string;
    metrics: {
      totalClicks: number;
      completedTrips: number;
      monthlyCompletedTrips: number;
      monthlyRevenue: number;
    };
    financials: {
      totalCustomerSpend: number;
      totalYourProfit: number;
      totalCommissionsEarned: number;
      totalCommissionsPaid: number;
      currentBalance: number;
      pendingBalance: number;
    };
    payoutSettings: {
      method: string;
      email: string;
      minThreshold: number;
    };
    createdAt: string;
    updatedAt: string;
  };
  commissionSummary: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  payoutSummary: Array<{
    status: string;
    count: number;
    total: number;
  }>;
  recentActivity: Array<{
    id: string;
    activityType: string;
    description: string;
    metadata: any;
    createdAt: string;
  }>;
}

export default function AffiliateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const affiliateId = params.id as string;

  const [data, setData] = useState<AffiliateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAffiliateDetails();
  }, [affiliateId]);

  const fetchAffiliateDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch affiliate details');
      }

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching affiliate details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status changed to ${newStatus} by admin`,
        }),
      });

      if (response.ok) {
        fetchAffiliateDetails();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTier = async (newTier: string) => {
    if (!confirm(`Are you sure you want to change tier to ${newTier}?`)) {
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: newTier,
          notes: `Tier manually changed to ${newTier} by admin`,
        }),
      });

      if (response.ok) {
        fetchAffiliateDetails();
      }
    } catch (error) {
      console.error('Error updating tier:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Affiliate Not Found</h2>
          <Link
            href="/admin/affiliates"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Back to Affiliates
          </Link>
        </div>
      </div>
    );
  }

  const { affiliate, commissionSummary, payoutSummary, recentActivity } = data;

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      starter: 'bg-slate-100 text-slate-700',
      bronze: 'bg-orange-100 text-orange-700',
      silver: 'bg-gray-100 text-gray-700',
      gold: 'bg-yellow-100 text-yellow-700',
      platinum: 'bg-purple-100 text-purple-700',
    };

    const icons: Record<string, string> = {
      starter: '🌱',
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          colors[tier] || colors.starter
        }`}
      >
        <span>{icons[tier]}</span>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-orange-100 text-orange-700',
      banned: 'bg-red-100 text-red-700',
    };

    const icons: Record<string, any> = {
      pending: Clock,
      active: CheckCircle2,
      suspended: AlertCircle,
      banned: Ban,
    };

    const Icon = icons[status] || Clock;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          colors[status] || colors.pending
        }`}
      >
        <Icon className="h-4 w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/affiliates"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Affiliates
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {affiliate.businessName || affiliate.userName}
                </h1>
                <p className="text-gray-600 mt-1">{affiliate.userEmail}</p>
                <div className="flex items-center gap-2 mt-2">
                  {getTierBadge(affiliate.tier)}
                  {getStatusBadge(affiliate.status)}
                </div>
              </div>
            </div>

            <button
              onClick={fetchAffiliateDetails}
              disabled={loading || updating}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            {affiliate.status === 'pending' && (
              <button
                onClick={() => handleUpdateStatus('active')}
                disabled={updating}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                Approve Affiliate
              </button>
            )}
            {affiliate.status === 'active' && (
              <button
                onClick={() => handleUpdateStatus('suspended')}
                disabled={updating}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium disabled:opacity-50"
              >
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Suspend
              </button>
            )}
            {affiliate.status === 'suspended' && (
              <button
                onClick={() => handleUpdateStatus('active')}
                disabled={updating}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                Reactivate
              </button>
            )}
            <select
              onChange={(e) => handleUpdateTier(e.target.value)}
              value={affiliate.tier}
              disabled={updating}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="starter">Starter</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Profile Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{affiliate.userName}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{affiliate.userEmail}</div>
                </div>
              </div>
              {affiliate.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Website</div>
                    <a
                      href={affiliate.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:text-primary-700 underline"
                    >
                      {affiliate.website}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Referral Code</div>
                  <div className="font-mono font-medium text-gray-900">
                    {affiliate.referralCode}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Joined</div>
                  <div className="font-medium text-gray-900">
                    {new Date(affiliate.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Total Clicks</span>
                  <span className="font-semibold text-gray-900">
                    {affiliate.metrics.totalClicks}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Completed Trips</span>
                  <span className="font-semibold text-gray-900">
                    {affiliate.metrics.completedTrips}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Monthly Trips</span>
                  <span className="font-semibold text-primary-600">
                    {affiliate.metrics.monthlyCompletedTrips}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Monthly Revenue</span>
                  <span className="font-semibold text-green-600">
                    ${affiliate.metrics.monthlyRevenue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Total Earned</span>
                  <span className="font-semibold text-gray-900">
                    ${affiliate.financials.totalCommissionsEarned.toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Total Paid</span>
                  <span className="font-semibold text-green-600">
                    ${affiliate.financials.totalCommissionsPaid.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Current Balance</span>
                  <span className="font-bold text-xl text-gray-900">
                    ${affiliate.financials.currentBalance.toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Pending Balance</span>
                  <span className="font-semibold text-orange-600">
                    ${affiliate.financials.pendingBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commissions & Payouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Commission Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commissions by Status</h3>
            {commissionSummary.length === 0 ? (
              <p className="text-gray-500 text-sm">No commissions yet</p>
            ) : (
              <div className="space-y-2">
                {commissionSummary.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm capitalize text-gray-700">{item.status}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{item.count}</div>
                      <div className="text-xs text-gray-500">${item.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payouts by Status</h3>
            {payoutSummary.length === 0 ? (
              <p className="text-gray-500 text-sm">No payouts yet</p>
            ) : (
              <div className="space-y-2">
                {payoutSummary.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-sm capitalize text-gray-700">{item.status}</span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{item.count}</div>
                      <div className="text-xs text-gray-500">${item.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
