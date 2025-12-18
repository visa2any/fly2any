'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Star, Clock, TrendingUp, Flame, ArrowRight, Loader2 } from 'lucide-react';

interface Tour {
  id: string;
  name: string;
  description?: string;
  price?: { amount: string; currencyCode: string };
  pictures?: { url?: string }[] | string[];
  rating?: number;
  minimumDuration?: string;
  bookingLink?: string;
}

interface ToursSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: { title: 'Featured Tours', subtitle: 'Real tours from top providers', viewAll: 'View All Tours', perPerson: 'per person', bookNow: 'Book Now' },
  pt: { title: 'Passeios em Destaque', subtitle: 'Passeios reais dos melhores fornecedores', viewAll: 'Ver Todos', perPerson: 'por pessoa', bookNow: 'Reservar' },
  es: { title: 'Tours Destacados', subtitle: 'Tours reales de los mejores proveedores', viewAll: 'Ver Todos', perPerson: 'por persona', bookNow: 'Reservar' },
};

// Popular destinations for featured tours
const FEATURED_COORDS = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
];

export function ToursSection({ lang = 'en' }: ToursSectionProps) {
  const t = translations[lang];
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        // Fetch from multiple destinations
        const results = await Promise.all(
          FEATURED_COORDS.slice(0, 2).map(async (city) => {
            const res = await fetch(`/api/activities/search?latitude=${city.lat}&longitude=${city.lng}&radius=10&type=tours`);
            const data = await res.json();
            return (data.data || []).slice(0, 2);
          })
        );
        setTours(results.flat().slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch tours:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const getImage = (tour: Tour) => {
    const firstPic = tour.pictures?.[0];
    return typeof firstPic === 'string' ? firstPic : firstPic?.url || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80';
  };

  const getPrice = (tour: Tour) => {
    // API already applies markup ($35 min or 35%) - use price.amount directly
    return tour.price?.amount ? Math.round(parseFloat(tour.price.amount)) : null;
  };

  return (
    <section className="py-4 px-4 md:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg">
            <MapPin className="w-6 h-6 text-orange-600" />
          </div>
          {t.title}
        </h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tours.map((tour) => {
            const price = getPrice(tour);
            const img = getImage(tour);
            return (
              <div
                key={tour.id}
                onClick={() => router.push(`/tours/book?id=${tour.id}&name=${encodeURIComponent(tour.name)}&price=${price || 0}&img=${encodeURIComponent(img)}&duration=${tour.minimumDuration || '3h'}&link=${encodeURIComponent(tour.bookingLink || '')}`)}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image src={img} alt={tour.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                  {price && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-white/95 backdrop-blur shadow-sm">
                      <span className="font-bold text-gray-900">${price}</span>
                      <span className="text-gray-500 text-xs ml-1">/{t.perPerson}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">{tour.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{tour.rating || '4.8'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{tour.minimumDuration || '3h'}</span>
                  </div>
                  <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    {t.bookNow}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-6">
        <button onClick={() => router.push('/tours')} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:from-orange-600 hover:to-amber-700 font-bold rounded-lg transition-colors shadow-md hover:shadow-lg">
          {t.viewAll}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
