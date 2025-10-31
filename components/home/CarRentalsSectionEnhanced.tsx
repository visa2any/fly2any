'use client';

import { useState, useEffect } from 'react';
import { ValueScoreBadge, calculateValueScore } from '@/components/shared/ValueScoreBadge';
import { Car, Users, Briefcase, Zap, Fuel, Settings, MapPin, Shield, TrendingUp, TrendingDown, Loader2, Eye, ShoppingCart } from 'lucide-react';

interface CarRental {
  id: string;
  type: string;
  model: string;
  company: string;
  companyLogo?: string;
  image?: string;
  photoUrl?: string;
  pricePerDay: number;
  originalPrice?: number;
  valueScore: number;
  rating: number;
  reviews: number;
  specs: {
    seats: number;
    bags: number;
    transmission: string;
    fuel: string;
  };
  badges: string[];
  demandLevel?: number;
  availability?: number;
  location: string;
  freeDelivery?: boolean;
  trending?: boolean;
  viewers?: number;
  bookings?: number;
}

interface CarRentalsSectionEnhancedProps {
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    title: 'Featured Car Rentals',
    subtitle: 'Smart recommendations based on value, availability, and customer ratings',
    viewAll: 'View All Cars',
    perDay: 'per day',
    reviews: 'reviews',
    bookNow: 'Book Now',
    seats: 'Seats',
    bags: 'Bags',
    automatic: 'Automatic',
    manual: 'Manual',
    unlimited: 'Unlimited mileage',
    freeDelivery: 'Free Delivery',
    highDemand: 'High demand',
    carsAvailable: 'cars available',
    loading: 'Loading car rentals...',
    noCarsAvailable: 'No cars available at this location',
    tryDifferentLocation: 'Try selecting a different location',
    all: 'All Locations',
    viewers: 'viewing now',
    bookings: 'bookings today',
  },
  pt: {
    title: 'Aluguel de Carros em Destaque',
    subtitle: 'Recomendações inteligentes baseadas em valor, disponibilidade e avaliações',
    viewAll: 'Ver Todos os Carros',
    perDay: 'por dia',
    reviews: 'avaliações',
    bookNow: 'Reservar Agora',
    seats: 'Assentos',
    bags: 'Malas',
    automatic: 'Automático',
    manual: 'Manual',
    unlimited: 'Km ilimitado',
    freeDelivery: 'Entrega Grátis',
    highDemand: 'Alta demanda',
    carsAvailable: 'carros disponíveis',
    loading: 'Carregando carros...',
    noCarsAvailable: 'Nenhum carro disponível neste local',
    tryDifferentLocation: 'Tente selecionar um local diferente',
    all: 'Todos os Locais',
    viewers: 'visualizando agora',
    bookings: 'reservas hoje',
  },
  es: {
    title: 'Alquiler de Autos Destacados',
    subtitle: 'Recomendaciones inteligentes basadas en valor, disponibilidad y calificaciones',
    viewAll: 'Ver Todos los Autos',
    perDay: 'por día',
    reviews: 'reseñas',
    bookNow: 'Reservar Ahora',
    seats: 'Asientos',
    bags: 'Maletas',
    automatic: 'Automático',
    manual: 'Manual',
    unlimited: 'Km ilimitado',
    freeDelivery: 'Entrega Gratis',
    highDemand: 'Alta demanda',
    carsAvailable: 'autos disponibles',
    loading: 'Cargando autos...',
    noCarsAvailable: 'No hay autos disponibles en esta ubicación',
    tryDifferentLocation: 'Intente seleccionar una ubicación diferente',
    all: 'Todas las Ubicaciones',
    viewers: 'viendo ahora',
    bookings: 'reservas hoy',
  },
};

const locationFilters = [
  { code: 'all', label: 'All' },
  { code: 'LAX', label: 'LAX' },
  { code: 'MIA', label: 'MIA' },
  { code: 'JFK', label: 'JFK' },
  { code: 'SFO', label: 'SFO' },
  { code: 'ORD', label: 'ORD' },
];

export function CarRentalsSectionEnhanced({ lang = 'en' }: CarRentalsSectionEnhancedProps) {
  const t = translations[lang];
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [cars, setCars] = useState<CarRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    fetchCars(selectedLocation);
  }, [selectedLocation]);

  const fetchCars = async (location: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cars/featured-enhanced?location=${location}&limit=8`);
      if (response.ok) {
        const data = await response.json();

        // Transform API data to match CarRental interface
        const transformedCars: CarRental[] = (data.data || []).map((car: any) => ({
          id: car.id || Math.random().toString(),
          type: car.type || car.category || 'Standard',
          model: car.model || car.vehicle?.model || 'Vehicle',
          company: car.company || car.vendor?.name || 'Unknown',
          companyLogo: car.companyLogo || car.vendor?.logo,
          image: car.image,
          photoUrl: car.photoUrl || car.vehicle?.photoUrl || car.vehicle?.image_url,
          pricePerDay: car.pricePerDay || car.price?.amount || car.rate?.amount || 0,
          originalPrice: car.originalPrice || car.price?.marketAverage,
          valueScore: car.valueScore || calculateValueScore({
            price: car.pricePerDay || car.price?.amount || 0,
            marketAvgPrice: car.originalPrice || car.price?.marketAverage || (car.pricePerDay || car.price?.amount || 0) * 1.5,
            rating: car.rating || 4.5,
            reviewCount: car.reviews || 100,
            demandLevel: car.demandLevel || 70,
            availabilityLevel: car.availability || 50
          }),
          rating: car.rating || 4.5,
          reviews: car.reviews || car.reviewCount || 100,
          specs: {
            seats: car.specs?.seats || car.vehicle?.seats || car.capacity?.seats || 5,
            bags: car.specs?.bags || car.vehicle?.bags || car.capacity?.bags || 2,
            transmission: car.specs?.transmission || car.vehicle?.transmission || car.transmission || 'automatic',
            fuel: car.specs?.fuel || car.vehicle?.fuel || car.fuelType || 'Regular'
          },
          badges: car.badges || [],
          demandLevel: car.demandLevel || car.demand?.level,
          availability: car.availability || car.stock?.available,
          location: car.location || `${location !== 'all' ? location : 'Various'} Airport`,
          freeDelivery: car.freeDelivery || car.perks?.includes('free_delivery'),
          trending: car.trending || car.demandLevel > 80,
          viewers: car.viewers || car.analytics?.currentViewers,
          bookings: car.bookings || car.analytics?.todayBookings,
        }));

        setCars(transformedCars);
      } else {
        setCars([]);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-4" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {/* Location Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {locationFilters.map((filter) => (
          <button
            key={filter.code}
            onClick={() => setSelectedLocation(filter.code)}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200
              ${selectedLocation === filter.code
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }
            `}
          >
            {filter.label === 'All' ? t.all : filter.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">{t.loading}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && cars.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg">
          <Car className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t.noCarsAvailable}</h3>
          <p className="text-gray-600">{t.tryDifferentLocation}</p>
        </div>
      )}

      {/* Cars Grid */}
      {!loading && cars.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className={`
                bg-white rounded-xl border-2 border-gray-200
                hover:border-primary-400 hover:shadow-2xl
                transition-all duration-300 ease-out overflow-hidden
                ${hoveredId === car.id ? 'scale-[1.03] shadow-2xl -translate-y-1' : ''}
              `}
              onMouseEnter={() => setHoveredId(car.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Car Image */}
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {car.photoUrl ? (
                  <img
                    src={car.photoUrl}
                    alt={`${car.type} - ${car.model}`}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: '50% 50%' }}
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : car.image ? (
                  <span className="text-6xl">{car.image}</span>
                ) : (
                  <Car className="w-16 h-16 text-gray-400" />
                )}

                {/* Fallback placeholder */}
                {car.photoUrl && (
                  <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Car className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Value Score Badge - Top Right */}
                <div className="absolute top-2 right-2">
                  <ValueScoreBadge score={car.valueScore} size="sm" showLabel={false} />
                </div>

                {/* Trending Badge - Top Left */}
                {car.trending && (
                  <div className="absolute top-2 left-2 bg-gray-700 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Trending
                  </div>
                )}

                {/* Free Delivery Badge - Bottom */}
                {car.freeDelivery && (
                  <div className="absolute bottom-2 left-2 bg-gray-700 text-white px-2 py-1 rounded text-xs font-bold">
                    {t.freeDelivery}
                  </div>
                )}
              </div>

              {/* Car Details */}
              <div className="p-4">
                {/* Type and Model */}
                <div className="text-xs text-gray-500 mb-1">{car.type}</div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{car.model}</h3>

                {/* Company with Logo */}
                <div className="flex items-center gap-2 mb-3">
                  {car.companyLogo && (
                    <img
                      src={car.companyLogo}
                      alt={car.company}
                      className="h-4 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <p className="text-sm text-gray-600">{car.company}</p>
                </div>

                {/* Rating and Location */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-sm">
                    <div className="flex items-center gap-1 bg-primary-600 text-white px-2 py-0.5 rounded font-bold text-xs">
                      ⭐ {car.rating.toFixed(1)}
                    </div>
                    <span className="text-xs text-gray-600">({car.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{car.location}</span>
                  </div>
                </div>

                {/* Social Proof - Viewers and Bookings - Only show if significant */}
                {(car.viewers || car.bookings) && (
                  <div className="flex items-center gap-3 mb-3 text-xs">
                    {car.viewers && car.viewers > 50 && (
                      <div className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <Eye className="w-3 h-3" />
                        <span className="font-semibold">{car.viewers} {t.viewers}</span>
                      </div>
                    )}
                    {car.bookings && car.bookings > 10 && (
                      <div className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <ShoppingCart className="w-3 h-3" />
                        <span className="font-semibold">{car.bookings} {t.bookings}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Users className="w-3 h-3" />
                    <span>{car.specs.seats} {t.seats}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Briefcase className="w-3 h-3" />
                    <span>{car.specs.bags} {t.bags}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Settings className="w-3 h-3" />
                    <span className="line-clamp-1">{car.specs.transmission === 'automatic' ? t.automatic : t.manual}</span>
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
                  <Fuel className="w-3 h-3" />
                  <span>{car.specs.fuel}</span>
                  {(car.specs.fuel === 'Hybrid' || car.specs.fuel.toLowerCase().includes('hybrid')) && (
                    <Zap className="w-3 h-3 text-green-600" />
                  )}
                </div>

                {/* Badges */}
                {car.badges && car.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {car.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs font-semibold"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Demand Indicator */}
                {car.demandLevel && car.demandLevel > 80 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-semibold">{t.highDemand}</span>
                  </div>
                )}

                {/* Low Availability Warning */}
                {car.availability && car.availability <= 5 && (
                  <div className="flex items-center gap-1 text-xs text-red-600 mb-3 font-semibold">
                    ⚠️ Only {car.availability} {t.carsAvailable}
                  </div>
                )}

                {/* You Save Indicator */}
                {car.originalPrice && car.originalPrice > car.pricePerDay && (
                  <div className="mb-3 inline-flex items-center gap-1 px-2 py-1.5 bg-green-50 border-2 border-green-500 rounded-lg shadow-sm">
                    <TrendingDown className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-bold text-green-700">
                      Save ${(car.originalPrice - car.pricePerDay).toFixed(2)}/day
                    </span>
                    <span className="text-xs text-green-600">
                      ({Math.round(((car.originalPrice - car.pricePerDay) / car.originalPrice) * 100)}%)
                    </span>
                  </div>
                )}

                {/* Price Section */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-end justify-between">
                    <div>
                      {car.originalPrice && car.originalPrice > car.pricePerDay && (
                        <div className="text-xs text-gray-500 line-through">
                          ${car.originalPrice.toFixed(2)}
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-primary-600">${car.pricePerDay.toFixed(0)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{t.perDay}</div>
                    </div>
                    <button className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                      {t.bookNow}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {!loading && cars.length > 0 && (
        <div className="text-center mt-6">
          <button className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold rounded-lg transition-colors">
            {t.viewAll} →
          </button>
        </div>
      )}
    </section>
  );
}
