'use client';

import { useEffect, useState } from 'react';
import { WeeklyAnalytics, HotelRankings } from '@/lib/api/liteapi-types';

export default function AnalyticsDashboard() {
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalytics | null>(null);
  const [rankings, setRankings] = useState<HotelRankings | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [weeklyRes, rankingsRes] = await Promise.all([
          fetch('/api/analytics/weekly'),
          fetch(`/api/analytics/hotels?period=${period}`),
        ]);

        const weeklyData = await weeklyRes.json();
        const rankingsData = await rankingsRes.json();

        if (weeklyData.success) setWeeklyData(weeklyData.data);
        if (rankingsData.success) setRankings(rankingsData.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={
                period === p
                  ? 'px-4 py-2 bg-blue-600 text-white rounded-lg font-medium'
                  : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200'
              }
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {weeklyData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">
                {weeklyData.metrics.totalBookings.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {weeklyData.weekStartDate} - {weeklyData.weekEndDate}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                ${weeklyData.metrics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Avg: ${weeklyData.metrics.averageBookingValue.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">New Customers</p>
              <p className="text-3xl font-bold text-blue-600">
                {weeklyData.metrics.newCustomers}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Repeat: {weeklyData.metrics.repeatCustomerRate.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Cancellation Rate</p>
              <p className="text-3xl font-bold text-orange-600">
                {weeklyData.metrics.cancellationRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Target: &lt;10%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Hotels</h2>
              <div className="space-y-3">
                {weeklyData.topHotels.slice(0, 5).map((hotel, idx) => (
                  <div
                    key={hotel.hotelId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{hotel.hotelName}</p>
                        <p className="text-sm text-gray-600">{hotel.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${hotel.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Destinations</h2>
              <div className="space-y-3">
                {weeklyData.topDestinations.slice(0, 5).map((dest, idx) => (
                  <div
                    key={`${dest.city}-${dest.country}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{dest.city}</p>
                        <p className="text-sm text-gray-600">{dest.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{dest.bookings} bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {rankings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hotel Rankings - {period.charAt(0).toUpperCase() + period.slice(1)}ly
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankings.rankings.slice(0, 10).map((hotel) => (
                  <tr key={hotel.hotelId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-lg text-gray-900">#{hotel.rank}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{hotel.hotelName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{hotel.city}</td>
                    <td className="px-6 py-4 text-sm font-medium">{hotel.bookings}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">
                      ${hotel.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{hotel.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          hotel.changeFromLastPeriod > 0
                            ? 'text-green-600 font-semibold'
                            : hotel.changeFromLastPeriod < 0
                            ? 'text-red-600 font-semibold'
                            : 'text-gray-600'
                        }
                      >
                        {hotel.changeFromLastPeriod > 0 ? '↑' : hotel.changeFromLastPeriod < 0 ? '↓' : '→'}
                        {Math.abs(hotel.changeFromLastPeriod)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
