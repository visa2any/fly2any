'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TransferDetailsClient from './ClientPage';
import { Loader2 } from 'lucide-react';

function TransferDetailsContent() {
  const searchParams = useSearchParams();

  // Get transfer data from URL params (passed from results page)
  const transferData = {
    id: searchParams.get('id') || '',
    type: searchParams.get('type') || 'private',
    name: decodeURIComponent(searchParams.get('name') || 'Transfer'),
    icon: decodeURIComponent(searchParams.get('icon') || '🚗'),
    category: searchParams.get('category') || 'private',
    maxPassengers: parseInt(searchParams.get('maxPassengers') || '4'),
    pickup: decodeURIComponent(searchParams.get('pickup') || ''),
    dropoff: decodeURIComponent(searchParams.get('dropoff') || ''),
    price: parseFloat(searchParams.get('price') || '0'),
    duration: searchParams.get('duration') || '30 min',
    rating: searchParams.get('rating') || '4.9',
    features: (searchParams.get('features') || 'Meet & Greet,Flight Tracking,Door-to-Door').split(','),
    cancellation: decodeURIComponent(searchParams.get('cancellation') || 'Free cancellation'),
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '10:00',
    passengers: parseInt(searchParams.get('passengers') || '1'),
  };

  return <TransferDetailsClient initialData={transferData} />;
}

export default function TransferDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading transfer details...</p>
        </div>
      </div>
    }>
      <TransferDetailsContent />
    </Suspense>
  );
}
