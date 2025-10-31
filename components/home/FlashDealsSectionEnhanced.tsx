'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { Clock, TrendingUp, Users, Flame, Eye, ShoppingCart, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { getAirportCity } from '@/lib/data/airports';
import { getAirlineData } from '@/lib/flights/airline-data';
import { saveToRecentlyViewed } from '@/lib/hooks/useFavorites';

interface FlashDealData {
  id: string;
  from: string;
  to: string;
  price: number;
  originalPrice: number;
  savings: number;
  savingsPercent: number;
  valueScore: number;
  carrier: string;
  carrierName: string;
  departureDate: string;
  returnDate?: string;
  expiresAt: string;
  timeRemaining: string;
  urgency: 'low-seats' | 'high-demand' | 'rising-price';
  urgencyValue?: number;
  viewersLast24h: number;
  bookingsLast24h: number;
  badges: string[];
}

interface FlashDealsSectionEnhancedProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🔥 Flash Deals - Expiring Soon',
    viewAll: 'View All',
    save: 'Save',
    viewing: 'viewing',
    bookings: 'bookings',
    only: 'Only',
    left: 'left',
    rising: 'Rising Price',
    highDemand: 'High Demand',
    scrollHint: '← Scroll →',
    loading: 'Loading flash deals...',
    noResults: 'No flash deals available',
    error: 'Failed to load flash deals',
  },
  pt: {
    title: '🔥 Ofertas Relâmpago - Expirando em Breve',
    viewAll: 'Ver Todos',
    save: 'Economize',
    viewing: 'visualizando',
    bookings: 'reservas',
    only: 'Apenas',
    left: 'restantes',
    rising: 'Preço Subindo',
    highDemand: 'Alta Demanda',
    scrollHint: '← Rolar →',
    loading: 'Carregando ofertas relâmpago...',
    noResults: 'Nenhuma oferta relâmpago disponível',
    error: 'Falha ao carregar ofertas relâmpago',
  },
  es: {
    title: '🔥 Ofertas Flash - Expiran Pronto',
    viewAll: 'Ver Todos',
    save: 'Ahorra',
    viewing: 'viendo',
    bookings: 'reservas',
    only: 'Solo',
    left: 'quedan',
    rising: 'Precio Subiendo',
    highDemand: 'Alta Demanda',
    scrollHint: '← Desplazar →',
    loading: 'Cargando ofertas flash...',
    noResults: 'No hay ofertas flash disponibles',
    error: 'Error al cargar ofertas flash',
  },
};

// Helper: Get country from airport code
const getCountryFromAirport = (airportCode: string): string => {
  const airportCountryMap: Record<string, string> = {
    // North America
    'JFK': 'United States', 'LAX': 'United States', 'MIA': 'United States', 'SFO': 'United States',
    'ORD': 'United States', 'DEN': 'United States', 'ATL': 'United States', 'SEA': 'United States',
    'YYZ': 'Canada', 'YVR': 'Canada', 'MEX': 'Mexico',
    // South America
    'GRU': 'Brazil', 'EZE': 'Argentina', 'LIM': 'Peru', 'BOG': 'Colombia', 'SCL': 'Chile',
    // Europe
    'LHR': 'United Kingdom', 'CDG': 'France', 'FCO': 'Italy', 'BCN': 'Spain', 'MAD': 'Spain',
    'AMS': 'Netherlands', 'FRA': 'Germany', 'ZRH': 'Switzerland',
    // Asia-Pacific
    'NRT': 'Japan', 'HND': 'Japan', 'SIN': 'Singapore', 'HKG': 'Hong Kong', 'SYD': 'Australia',
    'BKK': 'Thailand', 'DPS': 'Indonesia', 'ICN': 'South Korea',
    // Caribbean
    'CUN': 'Mexico', 'PUJ': 'Dominican Republic', 'MBJ': 'Jamaica', 'NAS': 'Bahamas',
    'AUA': 'Aruba', 'PVR': 'Mexico',
    // Beach
    'HNL': 'United States', 'OGG': 'United States', 'MLE': 'Maldives',
  };
  return airportCountryMap[airportCode] || 'International';
};

// Helper: Get destination image
const getDestinationImage = (airportCode: string): string => {
  const imageMap: Record<string, string> = {
    'LAX': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&h=600&fit=crop',
    'MIA': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800&h=600&fit=crop',
    'JFK': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    'YYZ': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=600&fit=crop',
    'LHR': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
    'CDG': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop',
    'FCO': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
    'BCN': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=600&fit=crop',
    'NRT': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    'SIN': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
    'CUN': 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop',
  };
  return imageMap[airportCode] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop';
};

export function FlashDealsSectionEnhanced({ lang = 'en' }: FlashDealsSectionEnhancedProps) {
  const t = translations[lang];
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deals, setDeals] = useState<FlashDealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch flash deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch('/api/flights/flash-deals-enhanced');

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setDeals(data.data || []);
      } catch (err) {
        console.error('Error fetching flash deals:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Update time remaining every 60 seconds
  useEffect(() => {
    if (deals.length === 0) return;

    const interval = setInterval(() => {
      setDeals(prevDeals =>
        prevDeals.map(deal => ({
          ...deal,
          timeRemaining: calculateTimeRemaining(deal.expiresAt),
        }))
      );
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [deals.length]);

  const calculateTimeRemaining = (expiresAt: string): string => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;

    if (diff <= 0) return '0m';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleDealClick = (deal: FlashDealData) => {
    // Save to recently viewed
    const toCity = getAirportCity(deal.to);
    saveToRecentlyViewed({
      id: deal.id,
      city: toCity,
      country: getCountryFromAirport(deal.to),
      price: deal.price,
      imageUrl: getDestinationImage(deal.to),
      from: deal.from,
      to: deal.to,
    });

    // Build search params - must match EnhancedSearchBar parameter names
    const params = new URLSearchParams({
      from: deal.from,
      to: deal.to,
      departure: deal.departureDate,
      ...(deal.returnDate && { return: deal.returnDate }),
      adults: '1',
      children: '0',
      infants: '0',
      class: 'economy',
    });

    // Navigate to flight results (open in new tab)
    window.open(`/flights/results?${params.toString()}`, '_blank');
  };

  return (
    <section className="py-4" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <button
          className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          onClick={() => window.open('/flights/results', '_blank')}
        >
          {t.viewAll} →
        </button>
      </div>

      {/* Divider */}
      <div className="h-0.5 bg-gray-200 mb-4"></div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600 font-semibold">{t.loading}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-lg border-2 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <p className="text-red-700 font-semibold">{t.error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && deals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-gray-200">
          <Sparkles className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold">{t.noResults}</p>
        </div>
      )}

      {/* Flash Deals Content */}
      {!loading && !error && deals.length > 0 && (
        <>
          {/* Scroll Hint */}
          <div className="text-center text-sm text-gray-600 mb-4 font-semibold">
            {t.scrollHint}
          </div>

          {/* Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-4 -mx-2 px-2">
            <div className="flex gap-4 min-w-max">
              {deals.map((deal) => {
                // Get city names and airline data
                const fromCity = getAirportCity(deal.from);
                const toCity = getAirportCity(deal.to);
                const airline = getAirlineData(deal.carrier);

                return (
                  <button
                    key={deal.id}
                    onClick={() => handleDealClick(deal)}
                    onMouseEnter={() => setHoveredId(deal.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`
                      w-80 bg-white rounded-xl border-2 border-gray-200
                      hover:border-primary-400 hover:shadow-2xl
                      transition-all duration-300 ease-out overflow-hidden flex-shrink-0 text-left
                      ${hoveredId === deal.id ? 'scale-[1.03] shadow-2xl -translate-y-1' : ''}
                    `}
                  >
                    {/* COMPACT HEADER - Route, Airline, Value Score */}
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-3">
                      {/* Row 1: Route + Value Score */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xl font-bold">
                          {fromCity} → {toCity}
                        </div>
                        <ValueScoreBadge score={deal.valueScore} size="sm" showLabel={false} />
                      </div>

                      {/* Row 2: Airline */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-base">{airline.logo}</span>
                        <span className="text-sm font-medium opacity-90">{airline.name}</span>
                      </div>

                      {/* Row 3: Price + Savings Percentage */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-end gap-2">
                          <div className="text-3xl font-bold">${deal.price.toFixed(2)}</div>
                          <div className="text-sm line-through opacity-75 mb-1">
                            ${deal.originalPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded font-bold text-sm">
                          -{deal.savingsPercent}% OFF
                        </div>
                      </div>
                    </div>

                    {/* COMPACT DETAILS - All on 2-3 lines */}
                    <div className="p-3 space-y-2">
                      {/* Line 1: Time + Savings Amount */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-orange-600 animate-pulse" />
                          <span className="text-sm font-bold text-orange-600">
                            ⏱️ {deal.timeRemaining}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs font-bold text-green-700">
                          <span>💰</span>
                          <span>{t.save} ${deal.savings.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Line 2: Urgency + Social Proof (inline) */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Urgency Badge */}
                        {deal.urgency === 'low-seats' && deal.urgencyValue && (
                          <div className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                            <Flame className="w-3 h-3" />
                            <span>{t.only} {deal.urgencyValue} {t.left}</span>
                          </div>
                        )}
                        {deal.urgency === 'high-demand' && (
                          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                            <Users className="w-3 h-3" />
                            <span>{t.highDemand}</span>
                          </div>
                        )}
                        {deal.urgency === 'rising-price' && (
                          <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                            <TrendingUp className="w-3 h-3" />
                            <span>{t.rising}</span>
                          </div>
                        )}

                        {/* Social Proof - Compact inline */}
                        {deal.viewersLast24h > 100 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                            <Eye className="w-3 h-3" />
                            <span>{deal.viewersLast24h}</span>
                          </div>
                        )}
                        {deal.bookingsLast24h > 10 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                            <ShoppingCart className="w-3 h-3" />
                            <span>{deal.bookingsLast24h}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
