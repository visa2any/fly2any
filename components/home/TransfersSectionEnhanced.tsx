'use client';

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Clock, Users, Shield, ArrowRight, Loader2, Car, Navigation, Check, Flame } from 'lucide-react';
import { ValueScoreBadge } from '@/components/shared/ValueScoreBadge';

interface TransferRoute {
  id: string;
  pickup: string;
  pickupCode: string;
  dropoff: string;
  dropoffLat: number;
  dropoffLng: number;
  city: string;
  country: string;
  flag: string;
  region: 'americas' | 'europe' | 'asia' | 'middleEast';
  basePrice: number;
  duration: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  vehicleType: string;
  icon: string;
}

interface TransfersSectionEnhancedProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: '🚗 Airport Transfers',
    subtitle: 'Reliable transfers from trusted providers',
    viewAll: 'View All',
    from: 'From',
    to: 'to',
    perRide: 'per ride',
    bookNow: 'Book Transfer',
    all: 'All',
    americas: '🌎 Americas',
    europe: '🌍 Europe',
    asia: '🌏 Asia',
    middleEast: '🕌 Middle East',
    loading: 'Finding transfers...',
    noResults: 'No transfers available',
    popular: 'Popular Route',
    freeCancellation: 'Free cancellation',
    meetGreet: 'Meet & Greet',
    flightTracking: 'Flight Tracking',
    carsAvailable: 'cars available',
  },
  pt: {
    title: '🚗 Transfers de Aeroporto',
    subtitle: 'Transfers confiáveis de fornecedores verificados',
    viewAll: 'Ver Todos',
    from: 'De',
    to: 'para',
    perRide: 'por corrida',
    bookNow: 'Reservar',
    all: 'Todos',
    americas: '🌎 Américas',
    europe: '🌍 Europa',
    asia: '🌏 Ásia',
    middleEast: '🕌 Oriente Médio',
    loading: 'Buscando transfers...',
    noResults: 'Nenhum transfer disponível',
    popular: 'Rota Popular',
    freeCancellation: 'Cancelamento grátis',
    meetGreet: 'Recepção',
    flightTracking: 'Rastreamento de voo',
    carsAvailable: 'carros disponíveis',
  },
  es: {
    title: '🚗 Traslados de Aeropuerto',
    subtitle: 'Traslados confiables de proveedores verificados',
    viewAll: 'Ver Todos',
    from: 'De',
    to: 'a',
    perRide: 'por viaje',
    bookNow: 'Reservar',
    all: 'Todos',
    americas: '🌎 Américas',
    europe: '🌍 Europa',
    asia: '🌏 Asia',
    middleEast: '🕌 Medio Oriente',
    loading: 'Buscando traslados...',
    noResults: 'No hay traslados disponibles',
    popular: 'Ruta Popular',
    freeCancellation: 'Cancelación gratis',
    meetGreet: 'Recepción',
    flightTracking: 'Seguimiento de vuelo',
    carsAvailable: 'autos disponibles',
  },
};

// Curated popular transfer routes by region
const POPULAR_ROUTES: TransferRoute[] = [
  // Americas
  { id: 'jfk-manhattan', pickup: 'JFK Airport', pickupCode: 'JFK', dropoff: 'Manhattan', dropoffLat: 40.7831, dropoffLng: -73.9712, city: 'New York', country: 'USA', flag: '🇺🇸', region: 'americas', basePrice: 85, duration: '45-60 min', distance: '26 km', rating: 4.8, reviewCount: 1250, isPopular: true, vehicleType: 'Private Sedan', icon: '🚗' },
  { id: 'lax-hollywood', pickup: 'LAX Airport', pickupCode: 'LAX', dropoff: 'Hollywood', dropoffLat: 34.0928, dropoffLng: -118.3287, city: 'Los Angeles', country: 'USA', flag: '🇺🇸', region: 'americas', basePrice: 65, duration: '30-45 min', distance: '18 km', rating: 4.7, reviewCount: 890, isPopular: true, vehicleType: 'Private Sedan', icon: '🚗' },
  { id: 'mia-southbeach', pickup: 'MIA Airport', pickupCode: 'MIA', dropoff: 'South Beach', dropoffLat: 25.7907, dropoffLng: -80.1300, city: 'Miami', country: 'USA', flag: '🇺🇸', region: 'americas', basePrice: 55, duration: '25-35 min', distance: '15 km', rating: 4.9, reviewCount: 720, isPopular: true, vehicleType: 'Private SUV', icon: '🚙' },
  { id: 'gru-paulista', pickup: 'GRU Airport', pickupCode: 'GRU', dropoff: 'Av. Paulista', dropoffLat: -23.5614, dropoffLng: -46.6558, city: 'São Paulo', country: 'Brazil', flag: '🇧🇷', region: 'americas', basePrice: 45, duration: '45-60 min', distance: '28 km', rating: 4.6, reviewCount: 450, isPopular: false, vehicleType: 'Private Sedan', icon: '🚗' },

  // Europe
  { id: 'cdg-paris', pickup: 'CDG Airport', pickupCode: 'CDG', dropoff: 'City Center', dropoffLat: 48.8566, dropoffLng: 2.3522, city: 'Paris', country: 'France', flag: '🇫🇷', region: 'europe', basePrice: 75, duration: '40-55 min', distance: '25 km', rating: 4.8, reviewCount: 2100, isPopular: true, vehicleType: 'Mercedes E-Class', icon: '🚘' },
  { id: 'lhr-london', pickup: 'Heathrow', pickupCode: 'LHR', dropoff: 'Central London', dropoffLat: 51.5074, dropoffLng: -0.1278, city: 'London', country: 'UK', flag: '🇬🇧', region: 'europe', basePrice: 95, duration: '45-60 min', distance: '24 km', rating: 4.9, reviewCount: 1850, isPopular: true, vehicleType: 'Mercedes V-Class', icon: '🚐' },
  { id: 'fco-rome', pickup: 'Fiumicino', pickupCode: 'FCO', dropoff: 'Rome Center', dropoffLat: 41.9028, dropoffLng: 12.4964, city: 'Rome', country: 'Italy', flag: '🇮🇹', region: 'europe', basePrice: 65, duration: '35-50 min', distance: '30 km', rating: 4.7, reviewCount: 980, isPopular: true, vehicleType: 'Private Sedan', icon: '🚗' },
  { id: 'bcn-barcelona', pickup: 'El Prat', pickupCode: 'BCN', dropoff: 'Las Ramblas', dropoffLat: 41.3809, dropoffLng: 2.1741, city: 'Barcelona', country: 'Spain', flag: '🇪🇸', region: 'europe', basePrice: 55, duration: '25-35 min', distance: '15 km', rating: 4.8, reviewCount: 1120, isPopular: false, vehicleType: 'Private Sedan', icon: '🚗' },

  // Asia
  { id: 'nrt-tokyo', pickup: 'Narita', pickupCode: 'NRT', dropoff: 'Shinjuku', dropoffLat: 35.6938, dropoffLng: 139.7034, city: 'Tokyo', country: 'Japan', flag: '🇯🇵', region: 'asia', basePrice: 180, duration: '60-90 min', distance: '65 km', rating: 4.9, reviewCount: 890, isPopular: true, vehicleType: 'Toyota Alphard', icon: '🚐' },
  { id: 'sin-marina', pickup: 'Changi', pickupCode: 'SIN', dropoff: 'Marina Bay', dropoffLat: 1.2838, dropoffLng: 103.8591, city: 'Singapore', country: 'Singapore', flag: '🇸🇬', region: 'asia', basePrice: 45, duration: '20-30 min', distance: '20 km', rating: 4.9, reviewCount: 1560, isPopular: true, vehicleType: 'Mercedes E-Class', icon: '🚘' },
  { id: 'hkg-central', pickup: 'Hong Kong Intl', pickupCode: 'HKG', dropoff: 'Central', dropoffLat: 22.2819, dropoffLng: 114.1577, city: 'Hong Kong', country: 'Hong Kong', flag: '🇭🇰', region: 'asia', basePrice: 85, duration: '35-45 min', distance: '35 km', rating: 4.8, reviewCount: 720, isPopular: false, vehicleType: 'Private Sedan', icon: '🚗' },
  { id: 'bkk-sukhumvit', pickup: 'Suvarnabhumi', pickupCode: 'BKK', dropoff: 'Sukhumvit', dropoffLat: 13.7308, dropoffLng: 100.5695, city: 'Bangkok', country: 'Thailand', flag: '🇹🇭', region: 'asia', basePrice: 35, duration: '30-45 min', distance: '28 km', rating: 4.7, reviewCount: 980, isPopular: false, vehicleType: 'Toyota Camry', icon: '🚗' },

  // Middle East
  { id: 'dxb-downtown', pickup: 'Dubai Intl', pickupCode: 'DXB', dropoff: 'Downtown Dubai', dropoffLat: 25.1972, dropoffLng: 55.2744, city: 'Dubai', country: 'UAE', flag: '🇦🇪', region: 'middleEast', basePrice: 45, duration: '15-25 min', distance: '12 km', rating: 4.9, reviewCount: 2200, isPopular: true, vehicleType: 'Lexus ES', icon: '🚘' },
  { id: 'ist-taksim', pickup: 'Istanbul Airport', pickupCode: 'IST', dropoff: 'Taksim', dropoffLat: 41.0370, dropoffLng: 28.9850, city: 'Istanbul', country: 'Turkey', flag: '🇹🇷', region: 'middleEast', basePrice: 55, duration: '45-60 min', distance: '40 km', rating: 4.7, reviewCount: 650, isPopular: true, vehicleType: 'Mercedes E-Class', icon: '🚘' },
  { id: 'cai-giza', pickup: 'Cairo Intl', pickupCode: 'CAI', dropoff: 'Giza Pyramids', dropoffLat: 29.9773, dropoffLng: 31.1325, city: 'Cairo', country: 'Egypt', flag: '🇪🇬', region: 'middleEast', basePrice: 35, duration: '40-55 min', distance: '35 km', rating: 4.6, reviewCount: 420, isPopular: false, vehicleType: 'Private Sedan', icon: '🚗' },
  { id: 'tlv-telaviv', pickup: 'Ben Gurion', pickupCode: 'TLV', dropoff: 'Tel Aviv Center', dropoffLat: 32.0853, dropoffLng: 34.7818, city: 'Tel Aviv', country: 'Israel', flag: '🇮🇱', region: 'middleEast', basePrice: 65, duration: '20-30 min', distance: '18 km', rating: 4.8, reviewCount: 380, isPopular: false, vehicleType: 'Private Sedan', icon: '🚗' },
];

type FilterType = 'all' | 'americas' | 'europe' | 'asia' | 'middleEast';

// Memoized Transfer Card - Level 6 Apple-Class design
const TransferCard = memo(({ route, onClick, t }: { route: TransferRoute; onClick: () => void; t: typeof translations['en'] }) => {
  // Calculate price with markup
  const price = Math.round(route.basePrice + Math.max(route.basePrice * 0.35, 35));

  // Seeded values
  const seed = route.id.charCodeAt(0) + route.id.length;
  const carsAvailable = 2 + (seed % 5);
  const isLimited = carsAvailable <= 3;

  // Value score
  const valueScore = Math.min(99, Math.round(75 + (route.rating - 4.5) * 30 + (price < 70 ? 10 : 0)));

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-neutral-200 shadow-level-md hover:shadow-level-xl hover:border-teal-400 transition-all duration-150 ease-apple overflow-hidden cursor-pointer active:scale-[0.97]"
    >
      <div className="p-5">
        {/* Header: Route & Price */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
              route.isPopular ? 'bg-gradient-to-br from-teal-50 to-cyan-100' : 'bg-gray-50'
            }`}>
              {route.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors text-sm">
                {route.flag} {route.city}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {route.pickup} → {route.dropoff}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-gray-900 text-xs">{route.rating.toFixed(1)}</span>
                <span className="text-gray-400 text-[10px]">({route.reviewCount})</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">${price}</div>
            <div className="text-[10px] text-gray-500">{t.perRide}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {route.isPopular && (
            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-lg">
              🔥 {t.popular}
            </span>
          )}
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg">
            {route.vehicleType}
          </span>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            Up to 4
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {route.duration}
          </span>
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {route.distance}
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-[10px] text-green-700 font-medium">
            <Check className="w-3 h-3" />{t.freeCancellation}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-[10px] text-blue-700 font-medium">
            <Check className="w-3 h-3" />{t.meetGreet}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <ValueScoreBadge score={valueScore} size="sm" showLabel={false} />
            {isLimited && (
              <span className="text-orange-600 font-medium text-[10px] flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {carsAvailable} {t.carsAvailable}
              </span>
            )}
          </div>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-xs hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg">
            {t.bookNow}
          </button>
        </div>
      </div>
    </div>
  );
});
TransferCard.displayName = 'TransferCard';

export function TransfersSectionEnhanced({ lang = 'en' }: TransfersSectionEnhancedProps) {
  const t = translations[lang];
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter routes by region
  const filteredRoutes = activeFilter === 'all'
    ? POPULAR_ROUTES.slice(0, 8)
    : POPULAR_ROUTES.filter(r => r.region === activeFilter).slice(0, 8);

  const handleTransferClick = useCallback((route: TransferRoute) => {
    // Navigate to transfers search with airport code in pickup
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const params = new URLSearchParams({
      pickup: `${route.pickup} (${route.pickupCode})`,
      dropoff: route.dropoff,
      dropoffLat: route.dropoffLat.toString(),
      dropoffLng: route.dropoffLng.toString(),
      dropoffCity: route.city,
      dropoffCountry: route.country,
      date: dateStr,
      time: '10:00',
      passengers: '2',
    });
    router.push(`/transfers/results?${params.toString()}`);
  }, [router]);

  return (
    <section className="pt-1 pb-2 md:py-6 lg:py-10" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 md:mb-6 gap-2 px-3 md:px-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <h2 className="text-sm md:text-[26px] lg:text-[32px] font-semibold text-neutral-800 tracking-[0.01em]">{t.title}</h2>
        </div>
        <button
          className="text-sm font-semibold text-teal-500 hover:text-teal-600 transition-colors duration-150 min-h-[44px] px-3 flex items-center flex-shrink-0"
          onClick={() => router.push('/transfers')}
        >
          {t.viewAll} →
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-200/80 mb-3 md:mb-4 mx-4 md:mx-0" />

      {/* Filter Pills */}
      <div
        className="flex gap-2 mb-3 md:mb-4 overflow-x-auto scrollbar-hide pb-1 px-4 md:px-0"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
      >
        {[
          { key: 'all' as FilterType, label: t.all },
          { key: 'americas' as FilterType, label: t.americas },
          { key: 'europe' as FilterType, label: t.europe },
          { key: 'asia' as FilterType, label: t.asia },
          { key: 'middleEast' as FilterType, label: t.middleEast },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`min-h-[36px] px-3 md:px-4 py-1.5 rounded-lg font-semibold text-sm transition-all duration-150 border flex-shrink-0 whitespace-nowrap ${
              activeFilter === filter.key
                ? 'bg-teal-500 text-white border-teal-500 shadow-md'
                : 'bg-white text-neutral-700 border-neutral-200 hover:border-teal-400 hover:bg-teal-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredRoutes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-gray-200">
          <Car className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-semibold">{t.noResults}</p>
        </div>
      )}

      {/* Transfers Grid */}
      {filteredRoutes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4 px-0">
          {filteredRoutes.map((route) => (
            <TransferCard
              key={route.id}
              route={route}
              onClick={() => handleTransferClick(route)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* View All CTA */}
      <div className="text-center mt-6 px-4 md:px-0">
        <button
          onClick={() => router.push('/transfers')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          {t.viewAll}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
