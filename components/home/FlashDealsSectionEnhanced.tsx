'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { Clock, TrendingUp, Users, Flame, Eye, ShoppingCart, Loader2, AlertCircle, Sparkles, Calendar } from 'lucide-react';
import { getAirportCity } from '@/lib/data/airports';
import { getAirlineData } from '@/lib/flights/airline-data';
import { saveToRecentlyViewed } from '@/lib/hooks/useFavorites';
import { useClientCache } from '@/lib/hooks/useClientCache';
import { CacheIndicator } from '@/components/cache/CacheIndicator';

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

  // ✅ NEW: Client-side cache for instant loads (30min TTL for time-sensitive deals)
  interface FlashDealsResponse {
    data: FlashDealData[];
    meta?: {
      totalDeals: number;
      averageSavings: number;
    };
  }

  const {
    data: dealsData,
    loading,
    error: fetchError,
    fromCache,
    cacheAgeFormatted,
    timeUntilExpiry,
    refresh,
  } = useClientCache<FlashDealsResponse>(
    '/api/flights/flash-deals-enhanced',
    {
      ttl: 1800, // 30 minutes (matches server-side time-bucketed cache)
      autoRefresh: true, // Auto-refresh when expired for deals
    }
  );

  const error = !!fetchError;

  // Update local state when cache data changes
  useEffect(() => {
    if (dealsData?.data) {
      setDeals(dealsData.data);
    }
  }, [dealsData]);

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
    <section className="py-4 md:py-6" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Section Header - Level-6 Typography */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-3 md:gap-4">
          <h2 className="text-xl md:text-[26px] font-semibold text-neutral-800 tracking-[0.01em]">{t.title}</h2>
          {/* Cache Indicator */}
          {fromCache && cacheAgeFormatted && (
            <CacheIndicator
              cacheAge={null}
              cacheAgeFormatted={cacheAgeFormatted}
              fromCache={fromCache}
              onRefresh={refresh}
              compact
            />
          )}
        </div>
        <button
          className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors duration-150 ease-apple min-h-[44px] px-4 flex items-center"
          onClick={() => window.open('/flights/results', '_blank')}
        >
          {t.viewAll} →
        </button>
      </div>

      {/* Divider - Subtle */}
      <div className="h-px bg-neutral-200/80 mb-4 md:mb-6"></div>

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

          {/* Horizontal Scroll Container - Full width */}
          <div className="overflow-x-auto pb-4 md:pb-6 scrollbar-hide">
            <div className="flex gap-4 md:gap-6 min-w-max">
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
                      w-[320px] bg-white rounded-2xl border border-neutral-200
                      shadow-level-md hover:shadow-level-xl hover:border-primary-400
                      transition-all duration-150 ease-apple overflow-hidden flex-shrink-0 text-left
                      active:scale-[0.97]
                      ${hoveredId === deal.id ? 'scale-[1.02] shadow-level-xl -translate-y-1' : ''}
                    `}
                  >
                    {/* CARD HEADER - Level-6 8pt grid spacing */}
                    <div className="bg-white border-b border-neutral-100 p-4">
                      {/* Row 1: Route + Value Score */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg md:text-xl font-semibold text-neutral-800 tracking-[0.01em]">
                          {fromCity} → {toCity}
                        </div>
                        <ValueScoreBadge score={deal.valueScore} size="sm" showLabel={false} />
                      </div>

                      {/* Row 2: Airline + Date */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{airline.logo}</span>
                          <span className="text-sm font-medium text-neutral-600">{airline.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-success-700 bg-success-50 px-2.5 py-1 rounded-lg border border-success-200">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(deal.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Row 3: Price + Savings - Level-6 Typography */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <div className="text-2xl md:text-3xl font-bold text-primary-500">${deal.price.toFixed(0)}</div>
                          <div className="text-sm line-through text-neutral-400">
                            ${deal.originalPrice.toFixed(0)}
                          </div>
                        </div>
                        <div className="bg-success-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-level-sm">
                          -{deal.savingsPercent}% OFF
                        </div>
                      </div>
                    </div>

                    {/* CARD DETAILS - Level-6 8pt grid */}
                    <div className="p-4 space-y-3">
                      {/* Line 1: Countdown + Savings */}
                      <div className="flex items-center justify-between">
                        <CountdownTimer
                          expiresAt={deal.expiresAt}
                          showIcon={true}
                          compact={true}
                          className="bg-warning-50 px-2.5 py-1.5 rounded-lg border border-warning-200"
                        />
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-success-50 border border-success-200 rounded-lg text-xs font-bold text-success-700">
                          <span>💰</span>
                          <span>{t.save} ${deal.savings.toFixed(0)}</span>
                        </div>
                      </div>

                      {/* Line 2: Urgency + Social Proof */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Urgency Badge */}
                        {deal.urgency === 'low-seats' && deal.urgencyValue && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-error-600 bg-error-50 px-2.5 py-1.5 rounded-lg border border-error-200">
                            <Flame className="w-3.5 h-3.5" />
                            <span>{t.only} {deal.urgencyValue} {t.left}</span>
                          </div>
                        )}
                        {deal.urgency === 'high-demand' && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-info-600 bg-info-50 px-2.5 py-1.5 rounded-lg border border-info-200">
                            <Users className="w-3.5 h-3.5" />
                            <span>{t.highDemand}</span>
                          </div>
                        )}
                        {deal.urgency === 'rising-price' && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-warning-600 bg-warning-50 px-2.5 py-1.5 rounded-lg border border-warning-200">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{t.rising}</span>
                          </div>
                        )}

                        {/* Social Proof */}
                        {deal.viewersLast24h > 100 && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{deal.viewersLast24h}</span>
                          </div>
                        )}
                        {deal.bookingsLast24h > 10 && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
                            <ShoppingCart className="w-3.5 h-3.5" />
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
