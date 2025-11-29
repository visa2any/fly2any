'use client';

import { useEffect, useState } from 'react';
import { Guest, GuestBooking } from '@/lib/api/liteapi-types';
import LoyaltyPointsDisplay from '@/components/loyalty/LoyaltyPointsDisplay';

export default function GuestDashboard({ guestId }: { guestId: string }) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [recentBookings, setRecentBookings] = useState<GuestBooking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [guestRes, bookingsRes] = await Promise.all([
          fetch(`/api/guests/${guestId}`),
          fetch(`/api/guests/${guestId}/bookings?limit=5`),
        ]);

        const guestData = await guestRes.json();
        const bookingsData = await bookingsRes.json();

        if (guestData.success) setGuest(guestData.data);

        if (bookingsData.success) {
          const bookings = bookingsData.data.data || [];
          setRecentBookings(bookings);

          const now = new Date();
          setStats({
            totalBookings: bookingsData.data.total || 0,
            upcomingBookings: bookings.filter((b: GuestBooking) =>
              new Date(b.checkIn) > now && b.status === 'confirmed'
            ).length,
            totalSpent: bookings.reduce((sum: number, b: GuestBooking) =>
              sum + (b.status !== 'cancelled' ? b.totalAmount : 0), 0
            ),
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [guestId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {guest?.firstName || 'Guest'}!
          </h1>
          <p className="text-gray-600 mt-1">Your travel dashboard</p>
        </div>
        <a
          href="/account/profile"
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Edit Profile
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600">{stats.upcomingBookings}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalSpent.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
              <a
                href="/account/bookings"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </a>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No bookings yet</p>
                <a href="/" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                  Start Exploring
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.bookingId}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.hotelName}</h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</span>
                          <span>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold'
                            : 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold'
                        }>
                          {booking.status.toUpperCase()}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          {booking.currency} {booking.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Special Offer!</h2>
            <p className="mb-4 opacity-90">
              Book your next stay and earn double loyalty points
            </p>
            <a
              href="/"
              className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse Hotels
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <LoyaltyPointsDisplay guestId={guestId} showDetails={true} />

          {guest && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{guest.email}</p>
                </div>
                {guest.phone && (
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{guest.phone}</p>
                  </div>
                )}
                {guest.nationality && (
                  <div>
                    <p className="text-gray-600">Nationality</p>
                    <p className="font-medium text-gray-900">{guest.nationality}</p>
                  </div>
                )}
                <div className="pt-3 border-t">
                  <p className="text-gray-600">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(guest.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Travel Tips</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✓ Book early for best rates</li>
              <li>✓ Join loyalty program for rewards</li>
              <li>✓ Check cancellation policies</li>
              <li>✓ Use promo codes at checkout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
