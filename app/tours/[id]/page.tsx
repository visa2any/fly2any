'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TourDetailsClient from './ClientPage';
import { Loader2 } from 'lucide-react';

function TourDetailsContent() {
  const searchParams = useSearchParams();

  // Get tour data from URL params (passed from results page)
  const tourData = {
    id: searchParams.get('id') || '',
    name: decodeURIComponent(searchParams.get('name') || 'Tour'),
    description: decodeURIComponent(searchParams.get('desc') || ''),
    price: parseFloat(searchParams.get('price') || '0'),
    image: decodeURIComponent(searchParams.get('img') || ''),
    duration: searchParams.get('duration') || '',
    location: decodeURIComponent(searchParams.get('location') || ''),
    rating: parseFloat(searchParams.get('rating') || '4.8'),
    bookingLink: decodeURIComponent(searchParams.get('link') || ''),
  };

  return <TourDetailsClient initialData={tourData} />;
}

export default function TourDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading tour details...</p>
        </div>
      </div>
    }>
      <TourDetailsContent />
    </Suspense>
  );
}
