'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  BarChart3, Building2, Plus, TrendingUp, Eye, Star, Calendar, DollarSign,
  ChevronRight, Sparkles, Bell, Settings, MapPin, ExternalLink, Clock,
  CheckCircle2, AlertCircle, PauseCircle, FileEdit, Loader2,
  Users, ArrowUpRight, ImageIcon
} from 'lucide-react';

interface DashboardOverview {
  totalProperties: number;
  activeProperties: number;
  draftProperties: number;
  totalViews: number;
  totalBookings: number;
  avgRating: number;
  estimatedMonthlyRevenue: number;
}
interface DashboardProperty {
  id: string; name: string; slug: string; propertyType: string;
  city: string | null; country: string | null; status: string;
  basePricePerNight: number | null; currency: string;
  viewCount: number; bookingCount: number; avgRating: number;
  reviewCount: number; coverImageUrl: string | null;
  roomCount: number; imageCount: number;
  publishedAt: string | null; updatedAt: string;
}

const QUICK_ACTIONS = [
  { label: 'Add Property', href: '/list-your-property/create', icon: Plus, color: 'from-yellow-400 to-amber-500' },
  { label: 'Calendar', href: '/host/calendar', icon: Calendar, color: 'from-blue-400 to-indigo-500' },
  { label: 'Properties', href: '/host/properties', icon: Building2, color: 'from-emerald-400 to-green-500' },
  { label: 'Bookings', href: '/host/bookings', icon: Users, color: 'from-violet-400 to-purple-500' },
];

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  active: { label: 'Active', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  draft: { label: 'Draft', icon: FileEdit, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  pending_review: { label: 'Pending', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
};

export default function HostDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [properties, setProperties] = useState<DashboardProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/properties/dashboard');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setOverview(json.data.overview);
            setProperties(json.data.properties || []);
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    );
  }

  const ov = overview || {
    totalProperties: 0, activeProperties: 0, draftProperties: 0,
    totalViews: 0, totalBookings: 0, avgRating: 0, estimatedMonthlyRevenue: 0,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-4">
      <MaxWidthContainer>
        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Host Dashboard</h1>
            <p className="text-white/50 text-sm">Welcome back! Here&apos;s your property overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <Link
              href="/list-your-property/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Property</span>
            </Link>
          </div>
        </div>

        {/* ---------- Overview Cards ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Properties', value: ov.activeProperties, sub: `${ov.totalProperties} total`, icon: Building2, color: 'from-blue-500 to-indigo-500' },
            { label: 'Monthly Revenue', value: `$${ov.estimatedMonthlyRevenue.toLocaleString()}`, sub: 'estimated', icon: DollarSign, color: 'from-emerald-500 to-green-500' },
            { label: 'Total Views', value: ov.totalViews.toLocaleString(), sub: 'all time', icon: Eye, color: 'from-violet-500 to-purple-500' },
            { label: 'Avg Rating', value: ov.avgRating > 0 ? ov.avgRating.toFixed(1) : '—', sub: `${ov.totalBookings} bookings`, icon: Star, color: 'from-amber-500 to-orange-500' },
          ].map((card, idx) => (
            <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-white font-black text-2xl mb-0.5">{card.value}</div>
              <div className="text-white/40 text-xs font-medium">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ---------- Quick Actions ---------- */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {QUICK_ACTIONS.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/60 text-xs font-semibold group-hover:text-white transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* ---------- Properties List ---------- */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Properties</h2>
            <Link href="/host/properties" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <Building2 className="w-12 h-12 text-white/10 mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">No properties yet</h3>
              <p className="text-white/40 text-sm mb-6 max-w-sm">List your first property to start managing it from your dashboard.</p>
              <Link href="/list-your-property/create" className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-transform">
                List Your First Property
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.slice(0, 5).map((property) => {
                const statusCfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.draft;
                return (
                  <div key={property.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                      {property.coverImageUrl ? (
                        <Image src={property.coverImageUrl} alt={property.name} fill className="object-cover" sizes="96px" />
                      ) : (
                        <div className="flex items-center justify-center h-full"><ImageIcon className="w-6 h-6 text-white/20" /></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-base truncate">{property.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                          <statusCfg.icon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-white/40 text-xs mb-1.5">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{property.city || '—'}{property.country ? `, ${property.country}` : ''}</span>
                        <span className="capitalize">{(property.propertyType || '').replace('_', ' ')}</span>
                        <span>{property.roomCount} rooms</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-white/60 font-semibold">${property.basePricePerNight ?? '—'}/night</span>
                        <span className="flex items-center gap-1 text-white/40"><Eye className="w-3 h-3" />{property.viewCount.toLocaleString()} views</span>
                        <span className="flex items-center gap-1 text-white/40"><Users className="w-3 h-3" />{property.bookingCount} bookings</span>
                        {property.avgRating > 0 && (
                          <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{property.avgRating} ({property.reviewCount})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/list-your-property/create?id=${property.id}`} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-semibold flex items-center gap-1">
                        <FileEdit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      {property.status === 'active' && (
                        <Link href={`/properties/${property.slug || property.id}`} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-semibold flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------- AI Insights Banner ---------- */}
        {properties.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">AI Insights</h3>
                <p className="text-white/50 text-sm mb-3">
                  Properties with 10+ photos get 40% more bookings. Consider adjusting pricing for the upcoming season based on local demand.
                </p>
                <button className="flex items-center gap-1.5 text-violet-300 hover:text-violet-200 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  View AI Recommendations
                </button>
              </div>
            </div>
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}
