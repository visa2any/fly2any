'use client';

/**
 * Admin Properties Management Page
 * Property review queue, management, and approval workflow
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, Filter, Eye, CheckCircle2, XCircle,
  Star, Clock, AlertTriangle, MapPin, Camera, DollarSign,
  RefreshCw, ChevronDown, X, ExternalLink, Home,
  Shield, TrendingUp, Sparkles, Ban, RotateCcw, Download,
} from 'lucide-react';

// ─── Types ───
interface Property {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  propertyType: string;
  status: string;
  city: string;
  country: string;
  basePricePerNight: number | null;
  currency: string;
  maxGuests: number;
  totalRooms: number;
  totalBedrooms: number;
  totalBathrooms: number;
  amenities: string[];
  verified: boolean;
  featuredUntil: string | null;
  rejectionReason: string | null;
  createdAt: string;
  publishedAt: string | null;
  coverImageUrl: string | null;
  images: Array<{ id: string; url: string; isPrimary: boolean }>;
  owner: {
    id: string;
    businessName: string | null;
    superHost: boolean;
    verificationStatus: string;
    user: { name: string | null; email: string; image: string | null };
  };
  _count: { rooms: number; images: number; bookings: number };
}

interface Stats {
  totalProperties: number;
  activeProperties: number;
  pendingReview: number;
  draftProperties: number;
  rejectedProperties: number;
}

type Tab = 'pending_review' | 'all' | 'active' | 'draft' | 'rejected';

// ─── Status Config ───
const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active', icon: CheckCircle2 },
  pending_review: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Review', icon: Clock },
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft', icon: Building2 },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', icon: XCircle },
  suspended: { bg: 'bg-red-50', text: 'text-red-600', label: 'Suspended', icon: Ban },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

// ─── Quality Score Bar ───
function QualityBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600">{score}</span>
    </div>
  );
}

// ─── Rejection Modal ───
function RejectModal({ property, onReject, onClose }: { property: Property; onReject: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const presets = [
    'Insufficient photos (minimum 5 required)',
    'Missing or incomplete description',
    'Pricing information not provided',
    'Location details are inaccurate',
    'Content violates platform guidelines',
    'Duplicate listing detected',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Reject Property</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-gray-500">Provide a reason for rejecting &quot;{property.name}&quot;. The host will be notified.</p>
        <div className="space-y-2">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setReason(preset)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition ${
                reason === preset ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Or type a custom reason..."
          rows={3}
          className="w-full px-3 py-2 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-red-500 resize-none"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
            Cancel
          </button>
          <button
            onClick={() => reason && onReject(reason)}
            disabled={!reason}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-40"
          >
            Reject Property
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProperties: 0, activeProperties: 0, pendingReview: 0, draftProperties: 0, rejectedProperties: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending_review');
  const [search, setSearch] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (tab !== 'all') params.set('status', tab);
      if (propertyTypeFilter) params.set('propertyType', propertyTypeFilter);
      params.set('page', String(page));
      params.set('limit', '15');

      const res = await fetch(`/api/admin/properties?${params}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  }, [search, tab, propertyTypeFilter, page]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleAction = async (propertyId: string, action: string, extra?: any) => {
    setActionLoading(propertyId);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      });
      if (res.ok) {
        await fetchProperties();
        setSelectedProperty(null);
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading('');
    }
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'pending_review', label: '📋 Review Queue', count: stats.pendingReview },
    { key: 'all', label: 'All Properties', count: stats.totalProperties },
    { key: 'active', label: 'Active', count: stats.activeProperties },
    { key: 'draft', label: 'Drafts', count: stats.draftProperties },
    { key: 'rejected', label: 'Rejected', count: stats.rejectedProperties },
  ];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map(p => p.id)));
    }
  };

  const handleBulkAction = async (action: string, rejectionReason?: string) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/properties/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds: Array.from(selectedIds), action, rejectionReason }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        await fetchProperties();
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = (type: string) => {
    window.open(`/api/admin/export?type=${type}`, '_blank');
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600" />
            Property Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review, approve, and manage property listings</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('properties')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={fetchProperties}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total', value: stats.totalProperties, color: 'bg-gray-100 text-gray-700', icon: Building2 },
          { label: 'Active', value: stats.activeProperties, color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
          { label: 'Pending Review', value: stats.pendingReview, color: 'bg-amber-50 text-amber-700', icon: Clock },
          { label: 'Drafts', value: stats.draftProperties, color: 'bg-blue-50 text-blue-700', icon: Building2 },
          { label: 'Rejected', value: stats.rejectedProperties, color: 'bg-red-50 text-red-700', icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl p-3.5 ${color}`}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 opacity-70" />
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              tab === key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                tab === key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, city, country, host..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={propertyTypeFilter}
          onChange={(e) => { setPropertyTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="hotel">Hotel</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="house">House</option>
          <option value="resort">Resort</option>
          <option value="hostel">Hostel</option>
          <option value="cabin">Cabin</option>
          <option value="cottage">Cottage</option>
        </select>
        {properties.length > 0 && (
          <label className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={selectedIds.size === properties.length && properties.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Select All
          </label>
        )}
      </div>

      {/* Property Cards Grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {tab === 'pending_review' ? 'No properties pending review 🎉' : 'No properties found'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {tab === 'pending_review' ? 'All caught up!' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${
              selectedIds.has(property.id) ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
            }`}>
              <div className="flex flex-col sm:flex-row">
                {/* Checkbox + Property Image */}
                <div className="sm:w-48 h-32 sm:h-auto bg-gray-100 relative flex-shrink-0">
                  <label className="absolute top-2 right-2 z-10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(property.id)}
                      onChange={() => toggleSelect(property.id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shadow-sm"
                    />
                  </label>
                  {property.images?.[0]?.url || property.coverImageUrl ? (
                    <img
                      src={property.images?.[0]?.url || property.coverImageUrl || ''}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={property.status} />
                  </div>
                </div>

                {/* Property Info */}
                <div className="flex-1 p-4 sm:p-5 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">{property.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500 truncate">
                          {property.city}{property.country ? `, ${property.country}` : ''}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 capitalize flex-shrink-0">
                          {property.propertyType}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {property.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleAction(property.id, 'approve')}
                            disabled={actionLoading === property.id}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectTarget(property)}
                            disabled={actionLoading === property.id}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                      {property.status === 'active' && !property.featuredUntil && (
                        <button
                          onClick={() => handleAction(property.id, 'feature', { featuredDays: 30 })}
                          disabled={actionLoading === property.id}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <Star className="h-3.5 w-3.5" /> Feature
                        </button>
                      )}
                      {property.status === 'active' && property.featuredUntil && (
                        <button
                          onClick={() => handleAction(property.id, 'unfeature')}
                          className="px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-semibold hover:bg-amber-200 transition"
                        >
                          ⭐ Featured
                        </button>
                      )}
                      {property.status === 'rejected' && (
                        <button
                          onClick={() => handleAction(property.id, 'reactivate')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedProperty(property)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Property Meta */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Camera className="h-3.5 w-3.5" /> {property._count?.images || 0} photos
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Home className="h-3.5 w-3.5" /> {property._count?.rooms || 0} rooms
                    </span>
                    {property.basePricePerNight && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <DollarSign className="h-3.5 w-3.5" /> {property.currency} {property.basePricePerNight}/night
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {property._count?.bookings || 0} bookings
                    </span>
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold flex-shrink-0">
                      {(property.owner?.user?.name || property.owner?.user?.email || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-600 truncate">
                      {property.owner?.user?.name || property.owner?.user?.email}
                    </span>
                    {property.owner?.superHost && (
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                    {property.owner?.verificationStatus === 'VERIFIED' && (
                      <Shield className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    )}
                    <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">
                      Listed {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Rejection Reason */}
                  {property.status === 'rejected' && property.rejectionReason && (
                    <div className="mt-3 p-2.5 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-700">
                        <span className="font-semibold">Rejection reason:</span> {property.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Property Detail Drawer */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedProperty(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">Property Details</h2>
              <button onClick={() => setSelectedProperty(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Cover Image */}
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                {selectedProperty.images?.[0]?.url || selectedProperty.coverImageUrl ? (
                  <img
                    src={selectedProperty.images?.[0]?.url || selectedProperty.coverImageUrl || ''}
                    alt={selectedProperty.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-400 ml-2">No photos uploaded</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={selectedProperty.status} />
                  {selectedProperty.verified && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold">✓ Verified</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedProperty.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" /> {selectedProperty.city}, {selectedProperty.country}
                </p>
              </div>

              {selectedProperty.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                  <p className="text-sm text-gray-600 line-clamp-4">{selectedProperty.description}</p>
                </div>
              )}

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedProperty.totalBedrooms}</p>
                  <p className="text-[10px] text-gray-500">Bedrooms</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedProperty.totalBathrooms}</p>
                  <p className="text-[10px] text-gray-500">Bathrooms</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedProperty.maxGuests}</p>
                  <p className="text-[10px] text-gray-500">Max Guests</p>
                </div>
              </div>

              {/* Pricing */}
              {selectedProperty.basePricePerNight && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-700">Nightly Rate</span>
                    <span className="text-xl font-bold text-indigo-900">
                      {selectedProperty.currency} {selectedProperty.basePricePerNight}
                    </span>
                  </div>
                </div>
              )}

              {/* Amenities */}
              {selectedProperty.amenities?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Amenities ({selectedProperty.amenities.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProperty.amenities.slice(0, 12).map((a: string) => (
                      <span key={a} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">{a}</span>
                    ))}
                    {selectedProperty.amenities.length > 12 && (
                      <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">+{selectedProperty.amenities.length - 12} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Host Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Host</h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {(selectedProperty.owner?.user?.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedProperty.owner?.user?.name}</p>
                    <p className="text-xs text-gray-500">{selectedProperty.owner?.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {selectedProperty.status === 'pending_review' && (
                  <>
                    <button
                      onClick={() => { handleAction(selectedProperty.id, 'approve'); }}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => { setSelectedProperty(null); setRejectTarget(selectedProperty); }}
                      className="flex-1 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-200 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </>
                )}
                {selectedProperty.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleAction(selectedProperty.id, 'feature', { featuredDays: 30 })}
                      className="flex-1 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition"
                    >
                      ⭐ Feature 30 Days
                    </button>
                    <button
                      onClick={() => handleAction(selectedProperty.id, 'suspend')}
                      className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition"
                    >
                      Suspend
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          property={rejectTarget}
          onReject={(reason) => {
            handleAction(rejectTarget.id, 'reject', { rejectionReason: reason });
            setRejectTarget(null);
          }}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* Bulk Actions Floating Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="w-px h-6 bg-gray-700" />
          <button
            onClick={() => handleBulkAction('approve')}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve All
          </button>
          <button
            onClick={() => handleBulkAction('reject', 'Batch rejected by admin')}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
          >
            <XCircle className="h-3.5 w-3.5" /> Reject All
          </button>
          <button
            onClick={() => handleBulkAction('suspend')}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1"
          >
            <Ban className="h-3.5 w-3.5" /> Suspend All
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
