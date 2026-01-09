"use client";

import { useEffect, useState } from "react";
import { Plane, Hotel, Car, Compass, CheckCircle2, Clock, XCircle, Mail, ExternalLink } from "lucide-react";
import { useQuoteWorkspace } from "../QuoteWorkspaceProvider";

interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'car' | 'activity' | 'transfer';
  name: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  confirmationCode?: string;
  details: string;
}

export default function ReservationsView() {
  const { state } = useQuoteWorkspace();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.id) {
      fetchBookings();
    }
  }, [state.id]);

  const fetchBookings = async () => {
    if (!state.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/quotes/${state.id}/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'car': return Car;
      case 'activity': return Compass;
      default: return CheckCircle2;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="w-3 h-3" /> Confirmed
        </span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
          <Clock className="w-3 h-3" /> Pending
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>;
      default:
        return null;
    }
  };

  if (!state.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Quote First</h3>
          <p className="text-sm text-gray-500">Save this quote to view reservations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Reservations for this Quote</h2>
        {state.client && (
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All Client Bookings →
          </button>
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-sm text-gray-500">Loading reservations...</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No Reservations Yet</h3>
          <p className="text-sm text-gray-500">Reservations will appear here once bookings are confirmed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const Icon = getIcon(booking.type);
            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{booking.details}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    {booking.confirmationCode && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span className="font-mono font-medium text-gray-900">
                          {booking.confirmationCode}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <button className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email Confirmation
                      </button>
                      <button className="text-xs font-medium text-gray-600 hover:text-gray-700 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
