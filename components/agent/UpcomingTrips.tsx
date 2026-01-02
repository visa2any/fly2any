'use client';

// components/agent/UpcomingTrips.tsx
// Level 6 Ultra-Premium Apple-Class Upcoming Trips
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Plane, CheckCircle, Clock } from 'lucide-react';

interface UpcomingTripsProps {
  trips: Array<{
    id: string;
    bookingNumber?: string;
    tripName?: string;
    destination?: string;
    startDate?: string | null;
    endDate?: string | null;
    total?: number;
    status: string;
    client?: { firstName?: string; lastName?: string; email?: string } | null;
  }>;
}

export default function UpcomingTrips({ trips }: UpcomingTripsProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'PENDING': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'IN_PROGRESS': return { icon: Plane, color: 'text-blue-600', bg: 'bg-blue-50' };
      default: return { icon: Calendar, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const tripDate = new Date(date);
    return Math.ceil((tripDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getCountdownStyle = (days: number) => {
    if (days <= 0) return 'bg-blue-500 text-white';
    if (days <= 3) return 'bg-red-500 text-white';
    if (days <= 7) return 'bg-amber-500 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100/80 overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-semibold text-gray-900">Upcoming Trips</h2>
        </div>
        <Link href="/agent/bookings" className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium group">
          All
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Trips List */}
      <div className="flex-1 divide-y divide-gray-50">
        {trips.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">No upcoming trips</p>
            <Link href="/agent/quotes/workspace" className="inline-block mt-2 text-sm text-primary-600 hover:underline">
              Create a booking →
            </Link>
          </div>
        ) : (
          trips.map((trip, idx) => {
            const daysUntil = trip.startDate ? getDaysUntil(new Date(trip.startDate)) : 999;
            const config = getStatusConfig(trip.status);
            const Icon = config.icon;
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Link href={`/agent/bookings/${trip.id}`} className="block px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Countdown Badge */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${getCountdownStyle(daysUntil)}`}>
                      <span className="text-lg font-bold leading-none">
                        {daysUntil <= 0 ? '✈️' : daysUntil}
                      </span>
                      {daysUntil > 0 && <span className="text-[10px] opacity-80">days</span>}
                    </div>

                    {/* Trip Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{trip.tripName || trip.destination || 'Upcoming Trip'}</p>
                        <span className={`w-5 h-5 rounded-full ${config.bg} flex items-center justify-center`}>
                          <Icon className={`w-3 h-3 ${config.color}`} />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500 truncate">{trip.destination || 'Destination TBD'}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {trip.client?.firstName || ''} {trip.client?.lastName || ''}
                      </p>
                    </div>

                    {/* Date & Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">${(trip.total || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
