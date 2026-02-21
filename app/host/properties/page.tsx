'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { toast } from 'react-hot-toast';
import {
  Search, Plus, Filter, MoreHorizontal, MapPin, BedDouble, Users,
  CheckCircle2, AlertCircle, PauseCircle, Clock, FileEdit, Trash2,
  ExternalLink, ArrowUpDown, Building2, ImageIcon, Eye, Star, TrendingUp,
  CalendarCheck2, ChevronRight
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
    try {
      const res = await fetch('/api/properties/dashboard', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setProperties(data.data?.properties || []);
    } catch (err: any) {
      console.error('Failed to fetch properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-midnight-navy mb-1 tracking-tight">Your Properties</h1>
            <p className="text-neutral-400 font-medium">Manage your listings, availability, and pricing.</p>
          </div>
          <Link
            href="/list-your-property/create"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 transition-colors shadow-[0_8px_16px_rgba(231,64,53,0.25)] hover:shadow-[0_12px_24px_rgba(231,64,53,0.35)] hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add New Property
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-soft focus:shadow-soft text-midnight-navy placeholder-neutral-400 focus:outline-none focus:border-primary-300 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar p-1.5 bg-neutral-100/50 rounded-2xl border border-neutral-100">
            {['all', 'active', 'draft', 'paused'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black capitalize transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-midnight-navy text-white shadow-soft'
                    : 'text-neutral-500 hover:text-midnight-navy hover:bg-white/60'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProperties.map((property) => {
              const statusCfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.draft;
              return (
                <div key={property.id} className="group relative bg-white rounded-[2rem] shadow-soft hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-500 flex flex-col overflow-hidden border border-neutral-100">
                  {/* Top: Image & Status */}
                  <div className="relative h-64 w-full overflow-hidden bg-neutral-100/50">
                    {property.coverImageUrl ? (
                       <img
                         src={property.coverImageUrl}
                         alt={property.name}
                         className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                       />
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-300">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Glassmorphism Status Badge */}
                    <div className="absolute top-5 left-5">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black backdrop-blur-xl bg-white/95 shadow-soft border border-neutral-100 ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3.5 h-3.5" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                       <div className="bg-midnight-navy/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-baseline border border-white/10">
                          <span className="text-xl font-black">{property.currency} {property.basePricePerNight ?? '—'}</span>
                          <span className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-wider">/night</span>
                       </div>
                    </div>
                  </div>

                  {/* Bottom: Info & X-Ray Analytics */}
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-extrabold text-midnight-navy leading-tight mb-2 group-hover:text-primary-500 transition-colors tracking-tight truncate">{property.name}</h3>
                        <div className="flex items-center gap-1.5 text-neutral-500 font-medium text-sm">
                          <MapPin className="w-4 h-4 text-secondary-500" />
                          <span className="truncate">{property.city || 'No location'}{property.country ? `, ${property.country}` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Property Quick Stats */}
                    <div className="flex items-center gap-3 mb-8">
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-xl text-neutral-600 text-xs font-bold border border-neutral-100">
                          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                          {(property.propertyType || 'property').replace('_', ' ')}
                       </div>
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-xl text-neutral-600 text-xs font-bold border border-neutral-100">
                          <BedDouble className="w-3.5 h-3.5 text-neutral-400" />
                          {property.roomCount} Rooms
                       </div>
                    </div>

                    {/* X-RAY SECTION: Analytics & Performance */}
                    <div className="bg-neutral-50/50 border border-neutral-100 rounded-2xl p-5 mb-8 mt-auto">
                       <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-secondary-500" /> Insights X-Ray
                       </p>
                       <div className="grid grid-cols-3 gap-3">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1 mb-1">
                                <Eye className="w-3 h-3" /> Views
                             </span>
                             <span className="text-base font-black text-midnight-navy">{property.viewCount.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1 mb-1">
                                <CalendarCheck2 className="w-3 h-3 text-primary-400" /> Bookings
                             </span>
                             <span className="text-base font-black text-midnight-navy">{property.bookingCount}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1 mb-1">
                                <Star className="w-3 h-3 text-secondary-500" /> Rating
                             </span>
                             <span className="text-base font-black text-midnight-navy">{property.avgRating || '—'}</span>
                          </div>
                       </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex items-center justify-between pt-5 border-t border-neutral-100">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-neutral-400 text-opacity-80">Added: <span className="text-neutral-500">{property.publishedAt ? new Date(property.publishedAt).toLocaleDateString() : 'Draft'}</span></p>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {property.status === 'active' && (
                            <Link
                              href={`/properties/${property.slug || property.id}`}
                              target="_blank"
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 hover:text-midnight-navy hover:bg-neutral-100 transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/list-your-property/create?id=${property.id}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-50 text-primary-600 font-bold text-xs hover:bg-primary-100 hover:text-primary-700 transition-all"
                          >
                            Edit
                            <FileEdit className="w-3 h-3" />
                          </Link>
                          <button 
                            onClick={() => setConfirmDeleteId(property.id)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group/btn" 
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
