'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plane,
  Calendar,
  Users,
  Clock,
  MapPin,
  ChevronRight,
  MoreVertical,
  Download,
  Mail,
  XCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import type { Booking } from '@/lib/bookings/types';

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const firstSegment = booking.flight.segments[0];
  const lastSegment = booking.flight.segments[booking.flight.segments.length - 1];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Confirmed',
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Clock className="w-4 h-4" />,
          label: 'Pending',
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Cancelled',
        };
      case 'completed':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Completed',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <AlertCircle className="w-4 h-4" />,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDepartureDate = () => {
    const date = new Date(firstSegment.departure.at);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return { label: 'Departed', color: 'text-gray-600' };
    } else if (diffDays === 0) {
      return { label: 'Today', color: 'text-red-600 font-bold' };
    } else if (diffDays === 1) {
      return { label: 'Tomorrow', color: 'text-orange-600 font-bold' };
    } else if (diffDays <= 7) {
      return { label: `In ${diffDays} days`, color: 'text-orange-600' };
    } else {
      return { label: formatDate(firstSegment.departure.at), color: 'text-gray-700' };
    }
  };

  const departureInfo = getDepartureDate();
  const totalPassengers = booking.passengers.length;

  return (
    <Link href={`/account/bookings/${booking.id}`}>
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group">
        {/* Status Bar */}
        <div
          className={`h-2 ${
            booking.status === 'confirmed'
              ? 'bg-green-500'
              : booking.status === 'pending'
              ? 'bg-yellow-500'
              : booking.status === 'cancelled'
              ? 'bg-red-500'
              : 'bg-gray-500'
          }`}
        ></div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  {booking.bookingReference}
                </span>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig.color}`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {firstSegment.departure.iataCode}
                  </span>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {lastSegment.arrival.iataCode}
                  </span>
                </div>
                <Plane className="w-5 h-5 text-blue-600" />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {/* Departure */}
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-600 text-xs">Departure</div>
                    <div className={`font-semibold ${departureInfo.color}`}>
                      {departureInfo.label}
                    </div>
                    <div className="text-gray-600">{formatTime(firstSegment.departure.at)}</div>
                  </div>
                </div>

                {/* Passengers */}
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-600 text-xs">Passengers</div>
                    <div className="font-semibold text-gray-900">
                      {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
                    </div>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">$</span>
                  </div>
                  <div>
                    <div className="text-gray-600 text-xs">Total Amount</div>
                    <div className="font-semibold text-gray-900">
                      {booking.payment.currency}
                      {booking.payment.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Flight Type */}
                <div className="flex items-start gap-2">
                  <Plane className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-gray-600 text-xs">Flight Type</div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {booking.flight.type.replace('-', ' ')}
                    </div>
                    {booking.flight.segments.length > 1 && (
                      <div className="text-xs text-orange-600">
                        {booking.flight.segments.length - 1}{' '}
                        {booking.flight.segments.length === 2 ? 'stop' : 'stops'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Icon */}
            <div className="flex-shrink-0 ml-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <ChevronRight className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Booked {formatDate(booking.createdAt)}
            </div>
            {booking.status === 'confirmed' && (
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle className="w-3 h-3" />
                E-ticket issued
              </div>
            )}
            {booking.status === 'cancelled' && booking.cancelledAt && (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="w-3 h-3" />
                Cancelled {formatDate(booking.cancelledAt)}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Bar (visible on hover) */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-end gap-3 text-sm">
            <span className="text-gray-600 font-medium">Quick Actions:</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Download action
              }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Email action
              }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
