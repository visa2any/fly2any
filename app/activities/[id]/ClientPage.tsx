'use client';

/**
 * Activity Details Client Page
 * Level 6 Ultra-Premium Design
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExperienceDetailsPage from '@/components/experiences/ExperienceDetailsPage';
import { Loader2 } from 'lucide-react';

interface ActivityData {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[]; // Multi-image gallery support
  duration: string;
  location: string;
  rating: number;
  bookingLink: string;
}

interface ActivityDetailsClientProps {
  initialData: ActivityData;
}

export default function ActivityDetailsClient({ initialData }: ActivityDetailsClientProps) {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityData | null>(initialData.id ? initialData : null);
  const [loading, setLoading] = useState(!initialData.id);
  const [error, setError] = useState<string | null>(null);

  const activityId = params.id as string;

  // Fetch activity details if not passed via URL params
  useEffect(() => {
    if (initialData.id && initialData.name !== 'Activity') {
      setActivity(initialData);
      setLoading(false);
      return;
    }

    const fetchActivity = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/activities/${activityId}`);
        const data = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.message || 'Activity not found');
        }

        const apiActivity = data.data;
        const basePrice = apiActivity.price?.amount ? parseFloat(apiActivity.price.amount) : 0;
        const markup = Math.max(basePrice * 0.35, 35);

        // Extract all images for gallery
        const apiImages = (apiActivity.pictures || []).map((p: any) => typeof p === 'string' ? p : p?.url).filter(Boolean);

        setActivity({
          id: apiActivity.id,
          name: apiActivity.name,
          description: apiActivity.description || apiActivity.shortDescription || 'Enjoy an exciting activity with professional guides.',
          price: basePrice + markup,
          images: apiImages.length > 0 ? apiImages : ['/placeholder-activity.jpg'],
          duration: apiActivity.minimumDuration || '2h',
          location: apiActivity.geoCode ? `${apiActivity.geoCode.latitude.toFixed(2)}, ${apiActivity.geoCode.longitude.toFixed(2)}` : 'Various locations',
          rating: apiActivity.rating || 4.7,
          bookingLink: apiActivity.bookingLink || '',
        });
      } catch (err: any) {
        console.error('Failed to fetch activity:', err);
        setError(err.message || 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      fetchActivity();
    }
  }, [activityId, initialData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50/50 to-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading activity details...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50/50 to-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Activity Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'We couldn\'t find the activity you\'re looking for.'}</p>
          <button
            onClick={() => router.push('/activities')}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Browse Activities
          </button>
        </div>
      </div>
    );
  }

  // Map to ExperienceData format with full image gallery
  const experienceData = {
    id: activity.id,
    type: 'activity' as const,
    name: activity.name,
    description: activity.description,
    images: activity.images,
    price: activity.price,
    currency: 'USD',
    duration: activity.duration,
    location: activity.location,
    rating: activity.rating,
    reviewCount: Math.floor(Math.random() * 300) + 30,
    highlights: [
      'Fun for all ages',
      'Professional instructors',
      'All equipment provided',
      'Safety briefing included',
      'Memorable experience',
    ],
    includes: [
      'Activity equipment',
      'Professional instruction',
      'Safety gear',
      'Insurance coverage',
    ],
    excludes: [
      'Transportation',
      'Food and beverages',
      'Personal expenses',
    ],
    meetingPoint: 'Meeting point details will be provided in your booking confirmation.',
    cancellationPolicy: 'Full refund if cancelled 24 hours before the experience. No refund for late cancellations.',
    bookingLink: activity.bookingLink,
  };

  return (
    <ExperienceDetailsPage
      experience={experienceData}
      accentColor="purple"
      gradientFrom="from-purple-50/50"
      gradientTo="to-white"
    />
  );
}
