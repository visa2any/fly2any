'use client';

import { useEffect, useState } from 'react';
import MyBookingsPage from '@/components/booking/MyBookingsPage';

export default function BookingsPage() {
  const [guestId, setGuestId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const storedGuestId = localStorage.getItem('guestId');
    if (storedGuestId) {
      setGuestId(storedGuestId);
    }
  }, []);

  return <MyBookingsPage guestId={guestId} />;
}
