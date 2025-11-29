'use client';

import { useEffect, useState } from 'react';
import LoyaltyDashboard from '@/components/loyalty/LoyaltyDashboard';

export default function LoyaltyPage() {
  const [guestId, setGuestId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">Loading...</div>;
  }

  if (!guestId) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Please create a profile first to access your loyalty rewards.
          <a href="/account/profile" className="ml-2 underline font-semibold">Go to Profile</a>
        </div>
      </div>
    );
  }

  return <LoyaltyDashboard guestId={guestId} />;
}
