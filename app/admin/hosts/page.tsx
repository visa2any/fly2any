'use client';

/**
 * Admin Hosts Management Page
 * Full host management with search, filters, stats, and detail drawer
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users, Search, Filter, ChevronDown, ChevronRight,
  Shield, Star, AlertTriangle, CheckCircle2, Clock,
  Mail, Phone, Globe, Building2, Eye, Edit, MoreVertical,
  TrendingUp, Home, RefreshCw, X, ExternalLink, Download,
} from 'lucide-react';

// ─── Types ───
interface Host {
  id: string;
  userId: string;
  businessName: string | null;
  businessType: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  verificationStatus: string;
  identityVerified: boolean;
  superHost: boolean;
  status: string;
  commissionRate: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  trustScore: number;
  responseRate: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  _count: { properties: number };
}

interface Stats {
  totalHosts: number;
  verifiedHosts: number;
  superHosts: number;
  pendingVerification: number;
}

// ─── Stat Card ───
function StatCard({ icon: Icon, label, value, color, subLabel }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          {subLabel && <p className="text-[10px] text-gray-400 mt-0.5">{subLabel}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
    suspended: { bg: 'bg-red-50', text: 'text-red-700', label: 'Suspended' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
    VERIFIED: { bg: 'bg-blue-50', text: 'text-blue-700', label: '✓ Verified' },
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
    UNVERIFIED: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Unverified' },
  };
  const c = config[status] || config.inactive;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ─── Main Component ───
export default function AdminHostsPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [stats, setStats] = useState<Stats>({ totalHosts: 0, verifiedHosts: 0, superHosts: 0, pendingVerification: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [actionLoading, setActionLoading] = useState('');

  const fetchHosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (verificationFilter) params.set('verification', verificationFilter);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await fetch(`/api/admin/hosts?${params}`);
      const data = await res.json();
      if (data.success) {
        setHosts(data.data);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch hosts:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, verificationFilter, page]);

  useEffect(() => { fetchHosts(); }, [fetchHosts]);

  const handleAction = async (hostId: string, action: string, value: any) => {
    setActionLoading(hostId);
    try {
      const res = await fetch(`/api/admin/hosts/${hostId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [action]: value }),
      });
      if (res.ok) {
        await fetchHosts();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="h-6 w-6 text-indigo-600" />
            Host Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage property owners, verification, and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open('/api/admin/export?type=hosts', '_blank')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={fetchHosts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Hosts" value={stats.totalHosts} color="bg-indigo-500" />
        <StatCard icon={Shield} label="Verified" value={stats.verifiedHosts} color="bg-emerald-500" />
        <StatCard icon={Star} label="SuperHosts" value={stats.superHosts} color="bg-amber-500" />
        <StatCard icon={Clock} label="Pending Verification" value={stats.pendingVerification} color="bg-orange-500" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search hosts by name, email, business..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Loading hosts...</p>
          </div>
        ) : hosts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hosts found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Host</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Properties</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Trust</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hosts.map((host) => (
                  <tr key={host.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                          {(host.user?.name || host.user?.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                            {host.user?.name || 'No name'}
                            {host.superHost && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{host.user?.email}</p>
                          {host.businessName && (
                            <p className="text-[10px] text-indigo-600 font-medium">{host.businessName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={host.status} /></td>
                    <td className="px-4 py-4"><StatusBadge status={host.verificationStatus} /></td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-gray-900">{host._count?.properties || 0}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${host.trustScore >= 70 ? 'bg-emerald-500' : host.trustScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium text-gray-700">{host.trustScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{host.commissionRate}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-500">
                        {new Date(host.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedHost(host)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!host.superHost && (
                          <button
                            onClick={() => handleAction(host.id, 'superHost', true)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition"
                            title="Promote to SuperHost"
                            disabled={actionLoading === host.id}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        {host.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleAction(host.id, 'verificationStatus', 'VERIFIED')}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition"
                            title="Verify host"
                            disabled={actionLoading === host.id}
                          >
                            <Shield className="h-4 w-4" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedHost && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedHost(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">Host Details</h2>
              <button onClick={() => setSelectedHost(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                  {(selectedHost.user?.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedHost.user?.name || 'No name'}
                    {selectedHost.superHost && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedHost.user?.email}</p>
                  {selectedHost.businessName && (
                    <p className="text-sm text-indigo-600 font-medium">{selectedHost.businessName}</p>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap">
                <StatusBadge status={selectedHost.status} />
                <StatusBadge status={selectedHost.verificationStatus} />
                {selectedHost.superHost && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500" /> SuperHost
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">{selectedHost._count?.properties || 0}</p>
                  <p className="text-xs text-gray-500">Properties</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">{selectedHost.trustScore}</p>
                  <p className="text-xs text-gray-500">Trust Score</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">{selectedHost.commissionRate}%</p>
                  <p className="text-xs text-gray-500">Commission Rate</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">{selectedHost.responseRate}%</p>
                  <p className="text-xs text-gray-500">Response Rate</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Contact</h4>
                {selectedHost.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />{selectedHost.phone}
                  </div>
                )}
                {selectedHost.whatsapp && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-emerald-500" />{selectedHost.whatsapp} (WhatsApp)
                  </div>
                )}
                {selectedHost.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a href={selectedHost.website} target="_blank" className="text-indigo-600 hover:underline">{selectedHost.website}</a>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHost.verificationStatus !== 'VERIFIED' && (
                    <button
                      onClick={() => { handleAction(selectedHost.id, 'verificationStatus', 'VERIFIED'); setSelectedHost(null); }}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
                    >
                      ✓ Verify Host
                    </button>
                  )}
                  {!selectedHost.superHost && (
                    <button
                      onClick={() => { handleAction(selectedHost.id, 'superHost', true); setSelectedHost(null); }}
                      className="px-3 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition"
                    >
                      ⭐ Promote SuperHost
                    </button>
                  )}
                  {selectedHost.status === 'active' ? (
                    <button
                      onClick={() => { handleAction(selectedHost.id, 'status', 'suspended'); setSelectedHost(null); }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition"
                    >
                      Suspend Host
                    </button>
                  ) : (
                    <button
                      onClick={() => { handleAction(selectedHost.id, 'status', 'active'); setSelectedHost(null); }}
                      className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-200 transition"
                    >
                      Reactivate Host
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Host Lifecycle</h4>
                <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-indigo-500" />
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-500">{new Date(selectedHost.user?.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500" />
                    <p className="text-sm font-medium text-gray-900">Became Host</p>
                    <p className="text-xs text-gray-500">{new Date(selectedHost.createdAt).toLocaleDateString()}</p>
                  </div>
                  {selectedHost.verificationStatus === 'VERIFIED' && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500" />
                      <p className="text-sm font-medium text-gray-900">Identity Verified</p>
                    </div>
                  )}
                  {selectedHost._count?.properties > 0 && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-purple-500" />
                      <p className="text-sm font-medium text-gray-900">Listed {selectedHost._count.properties} Properties</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
