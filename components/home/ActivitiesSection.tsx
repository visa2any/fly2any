'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Activity, Star, Clock, ArrowRight, Loader2 } from 'lucide-react';

interface ActivityItem {
  id: string;
  name: string;
  description?: string;
  price?: { amount: string; currencyCode: string };
  pictures?: { url?: string }[] | string[];
  rating?: number;
  minimumDuration?: string;
  bookingLink?: string;
}

interface ActivitiesSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: { title: 'Popular Activities', subtitle: 'Real experiences from top providers', viewAll: 'View All Activities', perPerson: 'per person', bookNow: 'Book Now' },
  pt: { title: 'Atividades Populares', subtitle: 'Experiências reais dos melhores fornecedores', viewAll: 'Ver Todas', perPerson: 'por pessoa', bookNow: 'Reservar' },
  es: { title: 'Actividades Populares', subtitle: 'Experiencias reales de los mejores proveedores', viewAll: 'Ver Todas', perPerson: 'por persona', bookNow: 'Reservar' },
};

const FEATURED_COORDS = [
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Bali', lat: -8.3405, lng: 115.0920 },
];

export function ActivitiesSection({ lang = 'en' }: ActivitiesSectionProps) {
  const t = translations[lang];
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const results = await Promise.all(
          FEATURED_COORDS.slice(0, 2).map(async (city) => {
            const res = await fetch(`/api/activities/search?latitude=${city.lat}&longitude=${city.lng}&radius=10&type=activities`);
            const data = await res.json();
            return (data.data || []).slice(0, 2);
          })
        );
        setActivities(results.flat().slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getImage = (item: ActivityItem) => {
    const firstPic = item.pictures?.[0];
    return typeof firstPic === 'string' ? firstPic : firstPic?.url || 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80';
  };

  const getPrice = (item: ActivityItem) => {
    const base = item.price?.amount ? parseFloat(item.price.amount) : 0;
    return base > 0 ? Math.round(base + Math.max(base * 0.35, 35)) : null;
  };

  return (
    <section className="py-4 px-4 md:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          {t.title}
        </h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activities.map((item) => {
            const price = getPrice(item);
            const img = getImage(item);
            return (
              <div
                key={item.id}
                onClick={() => router.push(`/activities/book?id=${item.id}&name=${encodeURIComponent(item.name)}&price=${price || 0}&img=${encodeURIComponent(img)}&duration=${item.minimumDuration || '2h'}&link=${encodeURIComponent(item.bookingLink || '')}`)}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all overflow-hidden cursor-pointer group"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image src={img} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                  {price && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-white/95 backdrop-blur shadow-sm">
                      <span className="font-bold text-gray-900">${price}</span>
                      <span className="text-gray-500 text-xs ml-1">/{t.perPerson}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{item.rating || '4.7'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.minimumDuration || '2h'}</span>
                  </div>
                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    {t.bookNow}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-6">
        <button onClick={() => router.push('/activities')} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 font-bold rounded-lg transition-colors shadow-md hover:shadow-lg">
          {t.viewAll}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
