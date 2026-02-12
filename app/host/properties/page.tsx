'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  Search, Plus, Filter, MoreHorizontal, MapPin, BedDouble, Users,
  CheckCircle2, AlertCircle, PauseCircle, Clock, FileEdit, Trash2,
  ExternalLink, ArrowUpDown
} from 'lucide-react';
import { Property } from '@/lib/properties/types'; // Assuming types exist

// Status configuration map
const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  active: { label: 'Active', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  draft: { label: 'Draft', icon: FileEdit, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  archived: { label: 'Archived', icon: Trash2, color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30' },
  pending_review: { label: 'Pending', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Fetch properties from API
    async function fetchProperties() {
      try {
        const res = await fetch('/api/properties'); // Fetch all properties for current user
        if (res.ok) {
          const data = await res.json();
          setProperties(data.properties || []);
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  // Filter properties logic
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.location?.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-4 pb-20">
      <MaxWidthContainer>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Your Properties</h1>
            <p className="text-white/50 text-sm">Manage your listings, availability, and pricing.</p>
          </div>
          <Link
            href="/list-your-property/create"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Add New Property
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['all', 'active', 'draft', 'paused'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap border ${
                  statusFilter === status
                    ? 'bg-white text-black border-white'
                    : 'bg-white/[0.03] text-white/60 border-white/10 hover:bg-white/[0.06] hover:text-white'
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
              <div key={i} className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const statusCfg = STATUS_CONFIG[property.status as string] || STATUS_CONFIG.draft;
              return (
                <div key={property.id} className="group flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
                  {/* Image */}
                  <div className="relative w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {property.images && property.images.length > 0 ? (
                       <Image
                         src={property.images.find(img => img.isPrimary)?.url || property.images[0].url}
                         alt={property.name}
                         fill
                         className="object-cover group-hover:scale-105 transition-transform duration-500"
                       />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/20">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
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
                          <h3 className="text-white font-bold text-lg truncate">{property.name}</h3>
                          <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                            <statusCfg.icon className="w-3.5 h-3.5" />
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-white/50 text-sm">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {property.location?.city || 'No location'}, {property.location?.country}</span>
                          <span className="flex items-center gap-1.5 capitalize"><Building2 className="w-3.5 h-3.5" /> {property.type?.toLowerCase().replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">
                          {property.currency} {property.pricing?.basePrice}
                          <span className="text-sm text-white/40 font-normal">/night</span>
                        </div>
                         {/* Optional bookings count or other metric */}
                      </div>
                    </div>

                    <div className="h-px w-full bg-white/5 my-3" />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs font-medium text-white/40">
                         <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> {property.rooms?.length || 0} Rooms</span>
                         <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Max {property.rooms?.reduce((acc, r) => acc + (r.maxOccupancy || 2), 0) || 0} Guests</span>
                         <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated {new Date(property.updatedAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/list-your-property/create?id=${property.id}`} // Edit uses wizard? Or separate edit page?
                          className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.08] text-xs font-bold transition-colors"
                        >
                          Edit
                        </Link>
                         {property.status === 'active' && (
                          <Link
                            href={`/properties/${property.id}`} // View public page
                            target="_blank"
                            className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
                            title="View Public Listing"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors" title="Settings">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No properties found</h3>
            <p className="text-white/50 text-sm max-w-sm mb-6">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your filters or search query."
                : "It looks like you haven't listed any properties yet. Get started now!"}
            </p>
            {(searchQuery || statusFilter !== 'all') ? (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="text-amber-400 hover:text-amber-300 text-sm font-bold"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/list-your-property/create"
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform"
              >
                List Your First Property
              </Link>
            )}
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}
