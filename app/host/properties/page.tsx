'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { toast } from 'react-hot-toast';
import {
  Search, Plus, Filter, MoreHorizontal, MapPin, BedDouble, Users,
  CheckCircle2, AlertCircle, PauseCircle, Clock, FileEdit, Trash2,
  ExternalLink, ArrowUpDown, Building2, ImageIcon
} from 'lucide-react';

// Match the shape returned by /api/properties/dashboard
interface DashboardProperty {
  id: string;
  name: string;
  slug: string;
  propertyType: string;
  city: string | null;
  country: string | null;
  status: string;
  basePricePerNight: number | null;
  currency: string;
  viewCount: number;
  bookingCount: number;
  avgRating: number;
  reviewCount: number;
  coverImageUrl: string | null;
  roomCount: number;
  imageCount: number;
  publishedAt: string | null;
  updatedAt: string;
}

// Status configuration map
const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  active: { label: 'Active', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  draft: { label: 'Draft', icon: FileEdit, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  archived: { label: 'Archived', icon: Trash2, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
  pending_review: { label: 'Pending', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<DashboardProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch('/api/properties/dashboard', {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setProperties(data.data?.properties || []);
    } catch (err: any) {
      console.error('Failed to fetch properties:', err);
      setError(err.name === 'AbortError' ? 'Request timed out. Please try again.' : (err.message || 'Failed to load properties'));
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  // Filter properties logic — uses flat fields matching the API response
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (property.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success('Property deleted successfully');
    } catch (e: any) {
      toast.error('Failed to delete: ' + e.message);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-4 pb-20">
      <MaxWidthContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Your Properties</h1>
            <p className="text-gray-500 text-sm">Manage your listings, availability, and pricing.</p>
          </div>
          <Link
            href="/list-your-property/create"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            <Plus className="w-4 h-4" />
            Add New Property
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['all', 'active', 'draft', 'paused'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap border ${
                  statusFilter === status
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-neutral-200 hover:bg-neutral-50 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Properties List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <AlertCircle className="w-12 h-12 text-red-300 mb-4" />
            <h3 className="text-gray-900 font-bold text-lg mb-2">Failed to load properties</h3>
            <p className="text-gray-500 text-sm mb-4 max-w-sm">{error}</p>
            <button onClick={fetchProperties} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              Try Again
            </button>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const statusCfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.draft;
              return (
                <div key={property.id} className="group flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all">
                  {/* Image */}
                  <div className="relative w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                    {property.coverImageUrl ? (
                       <img
                         src={property.coverImageUrl}
                         alt={property.name}
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; e.currentTarget.parentElement?.querySelector('.img-fallback')?.classList.remove('hidden'); }}
                       />
                    ) : null}
                    <div className={`img-fallback flex items-center justify-center h-full text-neutral-300 ${property.coverImageUrl ? 'hidden' : ''}`}>
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="absolute top-2 left-2 md:hidden">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold backdrop-blur-md ${statusCfg.bg} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-gray-900 font-bold text-lg truncate">{property.name}</h3>
                          <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                            <statusCfg.icon className="w-3.5 h-3.5" />
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {property.city || 'No location'}{property.country ? `, ${property.country}` : ''}</span>
                          <span className="flex items-center gap-1.5 capitalize"><Building2 className="w-3.5 h-3.5" /> {(property.propertyType || 'property').replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-bold text-lg">
                          {property.currency} {property.basePricePerNight ?? '—'}
                          <span className="text-sm text-gray-400 font-normal">/night</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-neutral-100 my-3" />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                         <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> {property.roomCount} Rooms</span>
                         <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {property.bookingCount} Bookings</span>
                         <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated {new Date(property.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/list-your-property/create?id=${property.id}`}
                          className="px-4 py-2 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-700 hover:bg-neutral-100 text-xs font-bold transition-colors"
                        >
                          Edit
                        </Link>
                         {property.status === 'active' && (
                          <Link
                            href={`/properties/${property.slug || property.id}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-500 hover:text-gray-900 hover:bg-neutral-100 transition-colors"
                            title="View Public Listing"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button 
                          onClick={() => setConfirmDeleteId(property.id)} 
                          className="p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-gray-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors" 
                          title="Delete Property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-200 rounded-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">No properties found</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your filters or search query."
                : "It looks like you haven't listed any properties yet. Get started now!"}
            </p>
            {(searchQuery || statusFilter !== 'all') ? (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="text-primary-600 hover:text-primary-700 text-sm font-bold"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/list-your-property/create"
                className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-colors"
              >
                List Your First Property
              </Link>
            )}
          </div>
        )}
      </MaxWidthContainer>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Property?</h3>
            <p className="text-gray-500 text-sm text-center mb-8">This action cannot be undone. All associated data including images, rooms, availability, and bookings will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-5 py-3 rounded-xl bg-neutral-100 text-gray-700 font-bold text-sm hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 px-5 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
