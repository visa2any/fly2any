'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, X } from 'lucide-react';

interface ViewedDestination {
  id: string;
  city: string;
  country: string;
  price: number;
  imageUrl: string;
  viewedAt: number;
  from?: string;  // Origin airport code (optional for backward compatibility)
  to: string;     // Destination airport code
}

interface RecentlyViewedSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '👁️ Your Recent Searches and Viewed',
    subtitle: 'Pick up where you left off',
    clearAll: 'Clear All',
    from: 'from',
    noItems: 'No recently viewed destinations',
    browseDestinations: 'Browse destinations to see them here',
  },
  pt: {
    title: '👁️ Suas Pesquisas e Visualizações Recentes',
    subtitle: 'Continue de onde parou',
    clearAll: 'Limpar Tudo',
    from: 'a partir de',
    noItems: 'Nenhum destino visualizado recentemente',
    browseDestinations: 'Navegue pelos destinos para vê-los aqui',
  },
  es: {
    title: '👁️ Tus Búsquedas y Vistas Recientes',
    subtitle: 'Continúa donde lo dejaste',
    clearAll: 'Borrar Todo',
    from: 'desde',
    noItems: 'No hay destinos vistos recientemente',
    browseDestinations: 'Explora destinos para verlos aquí',
  },
};

export function RecentlyViewedSection({ lang = 'en' }: RecentlyViewedSectionProps) {
  const t = translations[lang];
  const router = useRouter();
  const [recentlyViewed, setRecentlyViewed] = useState<ViewedDestination[]>([]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed.slice(0, 4)); // Show max 4
      } catch (e) {
        console.error('Error parsing recently viewed:', e);
      }
    }
  }, []);

  const clearAll = () => {
    localStorage.removeItem('recentlyViewed');
    setRecentlyViewed([]);
  };

  const removeItem = (id: string) => {
    const updated = recentlyViewed.filter(item => item.id !== id);
    setRecentlyViewed(updated);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getReturnDate = (): string => {
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 8);
    return returnDate.toISOString().split('T')[0];
  };

  if (recentlyViewed.length === 0) {
    return null; // Don't show section if no items
  }

  return (
    <section className="py-4" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-xs text-gray-600 mt-0.5">{t.subtitle}</p>
        </div>
        <button
          onClick={clearAll}
          className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          {t.clearAll}
        </button>
      </div>

      {/* Horizontal Scroll Grid */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-3 min-w-max">
          {recentlyViewed.map((item) => {
            // Build proper URL parameters for flight search
            const params = new URLSearchParams({
              from: item.from || 'JFK',  // Fallback to JFK if no origin stored
              to: item.to,
              departure: getTomorrowDate(),
              return: getReturnDate(),
              adults: '1',
              children: '0',
              infants: '0',
              class: 'economy',
            });

            return (
              <div
                key={item.id}
                onClick={() => window.open(`/flights/results?${params.toString()}`, '_blank')}
                className="relative w-48 h-28 rounded-lg overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-primary-400 transition-all duration-300 hover:shadow-xl flex-shrink-0"
              >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 p-3 flex flex-col justify-between">
                {/* Remove button */}
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="w-5 h-5 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-700" />
                  </button>
                </div>

                {/* Destination Info */}
                <div>
                  <h3 className="text-sm font-bold text-white drop-shadow-lg">{item.city}</h3>
                  <p className="text-xs text-white/90 drop-shadow-lg">{item.country}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xs text-white/80">{t.from}</span>
                    <span className="text-base font-bold text-white">${item.price}</span>
                  </div>
                </div>
              </div>

              {/* Recently Viewed Indicator */}
              <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-gray-300" />
                <span className="text-[10px] text-gray-200 font-medium">
                  {Math.floor((Date.now() - item.viewedAt) / 60000)}m ago
                </span>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
