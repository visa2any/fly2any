'use client';

import { useEffect, useState } from 'react';

interface Booking {
  bookingId: string;
  hotelId: string;
  hotelName: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export default function MyBookingsPage({ guestId }: { guestId?: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params = new URLSearchParams();
        if (guestId) params.append('guestId', guestId);
        if (filter !== 'all') params.append('status', filter);

        const response = await fetch('/api/bookings?' + params.toString());
        const data = await response.json();

        if (data.success) {
          setBookings(data.data.data || []);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [guestId, filter]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        
        <div className="flex gap-2">
          {(['all', 'confirmed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={filter === status ? 'bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors'}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.bookingId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{booking.hotelName}</h3>
                    <span className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold' : booking.status === 'cancelled' ? 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold' : 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold'}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Check-in</p>
                      <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Check-out</p>
                      <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Guest</p>
                      <p className="font-medium">{booking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Total</p>
                      <p className="font-medium">{booking.currency} {booking.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">View Details</button>
                  {booking.status === 'confirmed' && (
                    <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Amend</button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                Booking ID: {booking.bookingId} • Booked on {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
