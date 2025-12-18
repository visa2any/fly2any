'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ActivityDetailsClient from './ClientPage';
import { Loader2 } from 'lucide-react';

function ActivityDetailsContent() {
  const searchParams = useSearchParams();

  // Get activity data from URL params (passed from results page)
  // Parse multiple images from comma-separated imgs param
  const imgsParam = searchParams.get('imgs') || searchParams.get('img') || '';
  const images = imgsParam.split(',').map(i => decodeURIComponent(i)).filter(Boolean);

  const activityData = {
    id: searchParams.get('id') || '',
    name: decodeURIComponent(searchParams.get('name') || 'Activity'),
    description: decodeURIComponent(searchParams.get('desc') || ''),
    price: parseFloat(searchParams.get('price') || '0'),
    images: images.length > 0 ? images : ['/placeholder-activity.jpg'],
    duration: searchParams.get('duration') || '',
    location: decodeURIComponent(searchParams.get('location') || ''),
    rating: parseFloat(searchParams.get('rating') || '4.7'),
    bookingLink: decodeURIComponent(searchParams.get('link') || ''),
  };

  return <ActivityDetailsClient initialData={activityData} />;
}

export default function ActivityDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading activity details...</p>
        </div>
      </div>
    }>
      <ActivityDetailsContent />
    </Suspense>
  );
}
