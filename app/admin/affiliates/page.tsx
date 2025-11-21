'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  DollarSign,
  User,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  ArrowUpDown,
  Users,
  Sparkles,
  Award,
  Ban,
  Clock,
} from 'lucide-react';

type StatusFilter = 'all' | 'pending' | 'active' | 'suspended' | 'banned';
type TierFilter = 'all' | 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum';

interface Affiliate {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  businessName?: string;
  website?: string;
  tier: string;
  status: string;
  referralCode: string;
  trackingId: string;
  metrics: {
    totalClicks: number;
    totalReferrals: number;
    completedTrips: number;
    successfulCommissions: number;
    monthlyTrips: number;
  };
  financials: {
    totalCustomerSpend: number;
    totalYourProfit: number;
    commissionsEarned: number;
    commissionsPaid: number;
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
}

interface Summary {
  totalAffiliates: number;
  activeCount: number;
  pendingCount: number;
  totalCommissionsEarned: number;
  totalCommissionsPaid: number;
  totalBalanceOwed: number;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalAffiliates: 0,
    activeCount: 0,
    pendingCount: 0,
    totalCommissionsEarned: 0,
    totalCommissionsPaid: 0,
    totalBalanceOwed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [sortBy, setSortBy] = useState<'created' | 'earnings' | 'trips' | 'balance'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchAffiliates();
  }, [statusFilter, tierFilter, sortBy, sortOrder]);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (tierFilter !== 'all') params.append('tier', tierFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/admin/affiliates?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch affiliates');
      }

      const data = await response.json();
      setAffiliates(data.data.affiliates || []);
      setSummary(data.data.summary || {});
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter affiliates by search term
  const filteredAffiliates = useMemo(() => {
    if (!searchTerm) return affiliates;

    const term = searchTerm.toLowerCase();
    return affiliates.filter(
      (a) =>
        a.businessName?.toLowerCase().includes(term) ||
        a.userName?.toLowerCase().includes(term) ||
        a.userEmail?.toLowerCase().includes(term) ||
        a.referralCode?.toLowerCase().includes(term)
    );
  }, [affiliates, searchTerm]);

  const handleUpdateStatus = async (affiliateId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status changed to ${newStatus} by admin`,
        }),
      });

      if (response.ok) {
        fetchAffiliates(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating affiliate:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'banned':
        return <Ban className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

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
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          colors[tier] || colors.starter
        }`}
      >
        <span>{icons[tier]}</span>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-8 w-8 text-primary-600" />
                Affiliate Partners
              </h1>
              <p className="text-gray-600 mt-1">Manage affiliate partners and payouts</p>
            </div>
            <button
              onClick={fetchAffiliates}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Users className="h-4 w-4" />
              Total Partners
            </div>
            <div className="text-2xl font-bold text-gray-900">{summary.totalAffiliates}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Active
            </div>
            <div className="text-2xl font-bold text-green-600">{summary.activeCount}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-yellow-600 text-sm mb-1">
              <Clock className="h-4 w-4" />
              Pending
            </div>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Total Earned
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${summary.totalCommissionsEarned.toFixed(0)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Total Paid
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalCommissionsPaid.toFixed(0)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200 bg-orange-50">
            <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
              <AlertCircle className="h-4 w-4" />
              Balance Owed
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ${summary.totalBalanceOwed.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as TierFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="starter">Starter</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'created' | 'earnings' | 'trips' | 'balance')
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="balance">Sort by Balance</option>
                <option value="earnings">Sort by Earnings</option>
                <option value="trips">Sort by Trips</option>
                <option value="created">Sort by Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : filteredAffiliates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No affiliates found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search' : 'No affiliates registered yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAffiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {affiliate.businessName || affiliate.userName}
                            </div>
                            <div className="text-sm text-gray-500">{affiliate.userEmail}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Code: <span className="font-mono">{affiliate.referralCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getTierBadge(affiliate.tier)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(affiliate.status)}
                          <span className="text-sm capitalize">{affiliate.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {affiliate.metrics.completedTrips} trips
                          </div>
                          <div className="text-gray-500">
                            {affiliate.metrics.totalClicks} clicks
                          </div>
                          <div className="text-gray-400 text-xs">
                            {affiliate.metrics.monthlyTrips} this month
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            ${affiliate.financials.commissionsEarned.toFixed(2)}
                          </div>
                          <div className="text-green-600 text-xs">
                            ${affiliate.financials.commissionsPaid.toFixed(2)} paid
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">
                            ${affiliate.financials.currentBalance.toFixed(2)}
                          </div>
                          <div className="text-gray-500 text-xs">
                            ${affiliate.financials.pendingBalance.toFixed(2)} pending
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/affiliates/${affiliate.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {affiliate.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(affiliate.id, 'active')}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                            >
                              Approve
                            </button>
                          )}
                          {affiliate.status === 'active' && (
                            <button
                              onClick={() => handleUpdateStatus(affiliate.id, 'suspended')}
                              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm font-medium"
                            >
                              Suspend
                            </button>
                          )}
                          {affiliate.status === 'suspended' && (
                            <button
                              onClick={() => handleUpdateStatus(affiliate.id, 'active')}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredAffiliates.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredAffiliates.length} of {affiliates.length} affiliate
            {affiliates.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
