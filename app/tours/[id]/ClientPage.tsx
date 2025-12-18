'use client';

/**
 * Tour Details Client Page
 * Level 6 Ultra-Premium Design
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExperienceDetailsPage from '@/components/experiences/ExperienceDetailsPage';
import { Loader2 } from 'lucide-react';

interface TourData {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  location: string;
  rating: number;
  bookingLink: string;
}

interface TourDetailsClientProps {
  initialData: TourData;
}

export default function TourDetailsClient({ initialData }: TourDetailsClientProps) {
  const params = useParams();
  const router = useRouter();
  const [tour, setTour] = useState<TourData | null>(initialData.id ? initialData : null);
  const [loading, setLoading] = useState(!initialData.id);
  const [error, setError] = useState<string | null>(null);

  const tourId = params.id as string;

  // Fetch tour details if not passed via URL params
  useEffect(() => {
    if (initialData.id && initialData.name !== 'Tour') {
      // We have data from URL params, use it
      setTour(initialData);
      setLoading(false);
      return;
    }

    // Otherwise, try to fetch from API
    const fetchTour = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tours/${tourId}`);
        const data = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.message || 'Tour not found');
        }

        // Map Amadeus format to our format
        const apiTour = data.data;
        const basePrice = apiTour.price?.amount ? parseFloat(apiTour.price.amount) : 0;
        const markup = Math.max(basePrice * 0.35, 35);

        setTour({
          id: apiTour.id,
          name: apiTour.name,
          description: apiTour.description || apiTour.shortDescription || 'Experience an unforgettable tour with expert guides and amazing sights.',
          price: basePrice + markup,
          image: apiTour.pictures?.[0]?.url || apiTour.pictures?.[0] || '/placeholder-tour.jpg',
          duration: apiTour.minimumDuration || '3h',
          location: apiTour.geoCode ? `${apiTour.geoCode.latitude.toFixed(2)}, ${apiTour.geoCode.longitude.toFixed(2)}` : 'Various locations',
          rating: apiTour.rating || 4.8,
          bookingLink: apiTour.bookingLink || '',
        });
      } catch (err: any) {
        console.error('Failed to fetch tour:', err);
        setError(err.message || 'Failed to load tour');
      } finally {
        setLoading(false);
      }
    };

    if (tourId) {
      fetchTour();
    }
  }, [tourId, initialData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/50 to-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗺️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tour Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'We couldn\'t find the tour you\'re looking for.'}</p>
          <button
            onClick={() => router.push('/tours')}
            className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors"
          >
            Browse Tours
          </button>
        </div>
      </div>
    );
  }

  // Map to ExperienceData format
  const experienceData = {
    id: tour.id,
    type: 'tour' as const,
    name: tour.name,
    description: tour.description,
    images: tour.image ? [tour.image] : [],
    price: tour.price,
    currency: 'USD',
    duration: tour.duration,
    location: tour.location,
    rating: tour.rating,
    reviewCount: Math.floor(Math.random() * 500) + 50, // Simulated
    highlights: [
      'Expert local guides',
      'Small group experience',
      'Skip-the-line access',
      'Stunning photo opportunities',
      'Cultural insights and stories',
    ],
    includes: [
      'Professional guide',
      'Entry tickets',
      'Headsets for audio guide',
      'Bottled water',
    ],
    excludes: [
      'Hotel pickup/drop-off',
      'Gratuities',
      'Food and drinks',
    ],
    meetingPoint: 'Meeting point will be confirmed in your booking confirmation email.',
    cancellationPolicy: 'Full refund if cancelled 24 hours before the experience. No refund for late cancellations.',
    bookingLink: tour.bookingLink,
  };

  return (
    <ExperienceDetailsPage
      experience={experienceData}
      accentColor="orange"
      gradientFrom="from-orange-50/50"
      gradientTo="to-white"
    />
  );
}
