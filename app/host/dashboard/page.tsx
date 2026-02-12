'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import {
  BarChart3, Building2, Plus, TrendingUp, Eye, Star, Calendar, DollarSign,
  ChevronRight, Sparkles, Bell, Settings, MapPin, ExternalLink, Clock,
  CheckCircle2, AlertCircle, PauseCircle, FileEdit, MoreHorizontal,
  Users, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ------------------------------------------------------------------
// MOCK DATA (replaced by API calls in production)
// ------------------------------------------------------------------
const MOCK_OVERVIEW = {
  totalProperties: 3,
  activeProperties: 2,
  draftProperties: 1,
  totalViews: 12847,
  totalBookings: 234,
  avgRating: 4.7,
  estimatedMonthlyRevenue: 18500,
};

const MOCK_PROPERTIES = [
  {
    id: '1', name: 'Seaside Paradise Villa', propertyType: 'villa', city: 'Miami', country: 'US',
    status: 'active', basePricePerNight: 450, currency: 'USD', viewCount: 8342, bookingCount: 156,
    avgRating: 4.8, reviewCount: 89, coverImageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70&auto=format',
    roomCount: 4, imageCount: 12, publishedAt: '2024-06-15', updatedAt: '2025-02-10',
  },
  {
    id: '2', name: 'Downtown Lux Apartment', propertyType: 'apartment', city: 'New York', country: 'US',
    status: 'active', basePricePerNight: 220, currency: 'USD', viewCount: 4505, bookingCount: 78,
    avgRating: 4.6, reviewCount: 45, coverImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=70&auto=format',
    roomCount: 2, imageCount: 8, publishedAt: '2024-09-01', updatedAt: '2025-02-08',
  },
  {
    id: '3', name: 'Mountain Retreat Lodge', propertyType: 'lodge', city: 'Aspen', country: 'US',
    status: 'draft', basePricePerNight: 380, currency: 'USD', viewCount: 0, bookingCount: 0,
    avgRating: 0, reviewCount: 0, coverImageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=70&auto=format',
    roomCount: 6, imageCount: 3, publishedAt: null, updatedAt: '2025-02-01',
  },
];

const QUICK_ACTIONS = [
  { label: 'Add Property', href: '/list-your-property/create', icon: Plus, color: 'from-yellow-400 to-amber-500' },
  { label: 'Calendar', href: '/host/calendar', icon: Calendar, color: 'from-blue-400 to-indigo-500' },
  { label: 'Analytics', href: '/host/analytics', icon: BarChart3, color: 'from-emerald-400 to-green-500' },
  { label: 'Settings', href: '/host/settings', icon: Settings, color: 'from-violet-400 to-purple-500' },
];

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  active: { label: 'Active', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  draft: { label: 'Draft', icon: FileEdit, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  paused: { label: 'Paused', icon: PauseCircle, color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  pending_review: { label: 'Pending', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' },
};

export default function HostDashboard() {
  const [overview] = useState(MOCK_OVERVIEW);
  const [properties] = useState(MOCK_PROPERTIES);

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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">3</span>
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
            { label: 'Active Properties', value: overview.activeProperties, sub: `${overview.totalProperties} total`, icon: Building2, color: 'from-blue-500 to-indigo-500', change: null },
            { label: 'Monthly Revenue', value: `$${overview.estimatedMonthlyRevenue.toLocaleString()}`, sub: 'estimated', icon: DollarSign, color: 'from-emerald-500 to-green-500', change: '+12%' },
            { label: 'Total Views', value: overview.totalViews.toLocaleString(), sub: 'all time', icon: Eye, color: 'from-violet-500 to-purple-500', change: '+8%' },
            { label: 'Avg Rating', value: overview.avgRating.toFixed(1), sub: `${overview.totalBookings} bookings`, icon: Star, color: 'from-amber-500 to-orange-500', change: null },
          ].map((card, idx) => (
            <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                {card.change && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    {card.change}
                  </span>
                )}
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

          <div className="space-y-3">
            {properties.map((property) => {
              const statusCfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.draft;
              return (
                <div key={property.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group">
                  {/* Image */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={property.coverImageUrl} alt={property.name} fill className="object-cover" sizes="96px" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-base truncate">{property.name}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                        <statusCfg.icon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-white/40 text-xs mb-1.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{property.city}, {property.country}</span>
                      <span className="capitalize">{property.propertyType}</span>
                      <span>{property.roomCount} rooms</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-white/60 font-semibold">${property.basePricePerNight}/night</span>
                      <span className="flex items-center gap-1 text-white/40"><Eye className="w-3 h-3" />{property.viewCount.toLocaleString()} views</span>
                      <span className="flex items-center gap-1 text-white/40"><Users className="w-3 h-3" />{property.bookingCount} bookings</span>
                      {property.avgRating > 0 && (
                        <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{property.avgRating} ({property.reviewCount})</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/host/properties/${property.id}`} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-semibold flex items-center gap-1">
                      <FileEdit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    {property.status === 'active' && (
                      <Link href={`/properties/${property.id}`} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-semibold flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- AI Insights Banner ---------- */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">AI Insights</h3>
              <p className="text-white/50 text-sm mb-3">
                Your &ldquo;Seaside Paradise Villa&rdquo; could earn 23% more by adjusting pricing for the upcoming spring season.
                Properties with 10+ photos get 40% more bookings — consider adding more photos to &ldquo;Downtown Lux Apartment&rdquo;.
              </p>
              <button className="flex items-center gap-1.5 text-violet-300 hover:text-violet-200 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                View AI Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Recent Activity (placeholder for future) ---------- */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { text: 'New booking request for Seaside Paradise Villa', time: '2 hours ago', icon: Users, color: 'text-blue-400' },
              { text: 'Guest left a 5-star review for Downtown Lux Apartment', time: '1 day ago', icon: Star, color: 'text-amber-400' },
              { text: 'Price alert: competitors in Miami reduced rates by 8%', time: '2 days ago', icon: TrendingUp, color: 'text-emerald-400' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-white/70 text-sm">{activity.text}</p>
                </div>
                <span className="text-white/30 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}
