'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Your bookings will appear here once you complete a reservation.
          </p>
          <Link
            href="/hotels"
            className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Search Hotels
          </Link>
        </div>
      </div>
    </div>
  );
}
