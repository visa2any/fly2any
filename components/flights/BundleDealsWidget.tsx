'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Coffee,
  Dumbbell,
  Wine,
  Plane,
  Hotel,
  ChevronDown,
  ChevronUp,
  Users,
  Check,
  AlertCircle,
  Crown,
  Zap,
  Gift,
  Flame
} from 'lucide-react';

/**
 * ENHANCED BUNDLE DEALS WIDGET
 *
 * High-conversion widget showing Flight + Hotel packages with:
 * - 3-tier bundle comparison (Budget, Smart, Luxury)
 * - Dynamic pricing with real savings calculations
 * - Compelling visual savings displays
 * - Psychological triggers (scarcity, social proof, urgency)
 * - Hotel previews with ratings & amenities
 * - Add-ons & upsells
 * - Mobile-responsive design
 * - Trilingual support (EN/PT/ES)
 *
 * Conversion Optimization Features:
 * - Anchoring (show original price first)
 * - Default selection (Smart Bundle)
 * - Social proof (booking counts)
 * - Scarcity (limited availability)
 * - Loss aversion (highlight savings)
 * - Trust signals (free cancellation, best price)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BundleDealsWidgetProps {
  flightPrice: number;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  passengers: number;
  onBundleSelect: (bundleId: string, totalPrice: number) => void;
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
}

interface Hotel {
  id: string;
  name: string;
  stars: number;
  rating: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
  distance: string;
  reviews: number;
  popularChoice?: boolean;
  freeBreakfast?: boolean;
  freeCancellation?: boolean;
}

interface BundleOption {
  id: string;
  type: 'budget' | 'smart' | 'luxury';
  name: string;
  hotel: Hotel;
  discount: number; // percentage
  features: string[];
  badge?: string;
  addOns: {
    breakfast?: boolean;
    allMeals?: boolean;
    transfer?: boolean;
    privateTransfer?: boolean;
    spaCredit?: number;
    roomUpgrade?: boolean;
  };
  popularity?: number; // percentage of travelers who choose this
  urgency?: string;
  bookingsToday?: number;
}

interface AddOn {
  id: string;
  name: string;
  pricePerDay?: number;
  priceFlat?: number;
  icon: React.ReactNode;
  popular?: boolean;
}

// ============================================================================
// MOCK HOTEL DATABASE
// ============================================================================

const HOTEL_DATABASE: Record<string, Hotel[]> = {
  'LAX': [
    {
      id: 'lax_budget_1',
      name: 'LA Downtown Hostel',
      stars: 2,
      rating: 4.1,
      pricePerNight: 75,
      image: '/hotels/la-hostel.jpg',
      amenities: ['WiFi', 'Shared Kitchen', 'Lounge'],
      distance: '2.5 mi from downtown',
      reviews: 543,
      freeCancellation: true
    },
    {
      id: 'lax_smart_1',
      name: 'Downtown Grand Hotel',
      stars: 3,
      rating: 4.3,
      pricePerNight: 145,
      image: '/hotels/la-grand.jpg',
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
      distance: '1.2 mi from downtown',
      reviews: 1247,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'lax_luxury_1',
      name: 'The Beverly Prestige',
      stars: 5,
      rating: 4.8,
      pricePerNight: 320,
      image: '/hotels/la-prestige.jpg',
      amenities: ['WiFi', 'Pool', 'Spa', 'Fine Dining', 'Concierge'],
      distance: '0.8 mi from downtown',
      reviews: 2891,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'JFK': [
    {
      id: 'jfk_budget_1',
      name: 'Brooklyn Budget Inn',
      stars: 2,
      rating: 3.9,
      pricePerNight: 95,
      image: '/hotels/ny-budget.jpg',
      amenities: ['WiFi', 'Coffee'],
      distance: '3.8 mi from Times Square',
      reviews: 412,
      freeCancellation: true
    },
    {
      id: 'jfk_smart_1',
      name: 'Manhattan Express Hotel',
      stars: 3,
      rating: 4.4,
      pricePerNight: 189,
      image: '/hotels/ny-express.jpg',
      amenities: ['WiFi', 'Gym', 'Business Center', 'Parking'],
      distance: '0.9 mi from Times Square',
      reviews: 1653,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'jfk_luxury_1',
      name: 'The Plaza Royale',
      stars: 5,
      rating: 4.9,
      pricePerNight: 425,
      image: '/hotels/ny-plaza.jpg',
      amenities: ['WiFi', 'Spa', 'Rooftop Bar', 'Fine Dining', 'Valet'],
      distance: '0.3 mi from Central Park',
      reviews: 3542,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'MIA': [
    {
      id: 'mia_budget_1',
      name: 'Miami Beach Hostel',
      stars: 2,
      rating: 4.0,
      pricePerNight: 65,
      image: '/hotels/mia-hostel.jpg',
      amenities: ['WiFi', 'Beach Access', 'Bar'],
      distance: '1.5 mi from South Beach',
      reviews: 678,
      freeCancellation: true
    },
    {
      id: 'mia_smart_1',
      name: 'Ocean View Resort',
      stars: 4,
      rating: 4.5,
      pricePerNight: 165,
      image: '/hotels/mia-ocean.jpg',
      amenities: ['WiFi', 'Pool', 'Beach Access', 'Gym', 'Parking'],
      distance: '0.5 mi from South Beach',
      reviews: 2134,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'mia_luxury_1',
      name: 'The Fontainebleau',
      stars: 5,
      rating: 4.7,
      pricePerNight: 380,
      image: '/hotels/mia-fontaine.jpg',
      amenities: ['WiFi', 'Spa', 'Multiple Pools', 'Fine Dining', 'Casino'],
      distance: '0.2 mi from beach',
      reviews: 4231,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'ORD': [
    {
      id: 'ord_budget_1',
      name: 'Chicago Central Hostel',
      stars: 2,
      rating: 3.8,
      pricePerNight: 70,
      image: '/hotels/chi-hostel.jpg',
      amenities: ['WiFi', 'Kitchen', 'Lounge'],
      distance: '2.2 mi from Loop',
      reviews: 389,
      freeCancellation: true
    },
    {
      id: 'ord_smart_1',
      name: 'Magnificent Mile Hotel',
      stars: 3,
      rating: 4.2,
      pricePerNight: 155,
      image: '/hotels/chi-mile.jpg',
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      distance: '0.8 mi from Loop',
      reviews: 1456,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'ord_luxury_1',
      name: 'The Drake Chicago',
      stars: 5,
      rating: 4.6,
      pricePerNight: 295,
      image: '/hotels/chi-drake.jpg',
      amenities: ['WiFi', 'Spa', 'Fine Dining', 'Lake View', 'Concierge'],
      distance: '0.5 mi from Loop',
      reviews: 2987,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'LAS': [
    {
      id: 'las_budget_1',
      name: 'Vegas Downtown Hostel',
      stars: 2,
      rating: 3.7,
      pricePerNight: 55,
      image: '/hotels/vegas-hostel.jpg',
      amenities: ['WiFi', 'Pool', 'Bar'],
      distance: '2.0 mi from Strip',
      reviews: 512,
      freeCancellation: true
    },
    {
      id: 'las_smart_1',
      name: 'The Linq Hotel',
      stars: 4,
      rating: 4.4,
      pricePerNight: 125,
      image: '/hotels/vegas-linq.jpg',
      amenities: ['WiFi', 'Pool', 'Casino', 'Restaurants', 'Parking'],
      distance: 'On the Strip',
      reviews: 3421,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'las_luxury_1',
      name: 'Bellagio Resort',
      stars: 5,
      rating: 4.8,
      pricePerNight: 285,
      image: '/hotels/vegas-bellagio.jpg',
      amenities: ['WiFi', 'Spa', 'Casino', 'Fine Dining', 'Shows'],
      distance: 'Center of Strip',
      reviews: 5678,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'SFO': [
    {
      id: 'sfo_budget_1',
      name: 'SF Bay Hostel',
      stars: 2,
      rating: 4.0,
      pricePerNight: 85,
      image: '/hotels/sf-hostel.jpg',
      amenities: ['WiFi', 'Kitchen', 'City View'],
      distance: '1.8 mi from downtown',
      reviews: 623,
      freeCancellation: true
    },
    {
      id: 'sfo_smart_1',
      name: 'Union Square Hotel',
      stars: 3,
      rating: 4.3,
      pricePerNight: 175,
      image: '/hotels/sf-union.jpg',
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Parking'],
      distance: '0.6 mi from downtown',
      reviews: 1789,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'sfo_luxury_1',
      name: 'The Fairmont',
      stars: 5,
      rating: 4.7,
      pricePerNight: 345,
      image: '/hotels/sf-fairmont.jpg',
      amenities: ['WiFi', 'Spa', 'Fine Dining', 'Bay View', 'Concierge'],
      distance: '0.4 mi from downtown',
      reviews: 3456,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'SEA': [
    {
      id: 'sea_budget_1',
      name: 'Seattle Budget Inn',
      stars: 2,
      rating: 3.9,
      pricePerNight: 80,
      image: '/hotels/sea-budget.jpg',
      amenities: ['WiFi', 'Coffee'],
      distance: '2.3 mi from Pike Place',
      reviews: 445,
      freeCancellation: true
    },
    {
      id: 'sea_smart_1',
      name: 'Pike Place Hotel',
      stars: 3,
      rating: 4.4,
      pricePerNight: 160,
      image: '/hotels/sea-pike.jpg',
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      distance: '0.3 mi from Pike Place',
      reviews: 1567,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'sea_luxury_1',
      name: 'The Edgewater',
      stars: 5,
      rating: 4.6,
      pricePerNight: 310,
      image: '/hotels/sea-edge.jpg',
      amenities: ['WiFi', 'Spa', 'Waterfront', 'Fine Dining', 'Concierge'],
      distance: 'Waterfront',
      reviews: 2234,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'BOS': [
    {
      id: 'bos_budget_1',
      name: 'Boston Common Hostel',
      stars: 2,
      rating: 4.1,
      pricePerNight: 75,
      image: '/hotels/bos-hostel.jpg',
      amenities: ['WiFi', 'Kitchen', 'Lounge'],
      distance: '1.5 mi from Common',
      reviews: 534,
      freeCancellation: true
    },
    {
      id: 'bos_smart_1',
      name: 'Back Bay Hotel',
      stars: 3,
      rating: 4.3,
      pricePerNight: 170,
      image: '/hotels/bos-bay.jpg',
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Parking'],
      distance: '0.7 mi from Common',
      reviews: 1432,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'bos_luxury_1',
      name: 'The Liberty Hotel',
      stars: 5,
      rating: 4.8,
      pricePerNight: 335,
      image: '/hotels/bos-liberty.jpg',
      amenities: ['WiFi', 'Spa', 'Fine Dining', 'Historic Building', 'Concierge'],
      distance: '0.5 mi from Common',
      reviews: 2987,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'ATL': [
    {
      id: 'atl_budget_1',
      name: 'Atlanta Budget Lodge',
      stars: 2,
      rating: 3.8,
      pricePerNight: 65,
      image: '/hotels/atl-budget.jpg',
      amenities: ['WiFi', 'Parking'],
      distance: '3.0 mi from downtown',
      reviews: 398,
      freeCancellation: true
    },
    {
      id: 'atl_smart_1',
      name: 'Peachtree Plaza Hotel',
      stars: 3,
      rating: 4.2,
      pricePerNight: 140,
      image: '/hotels/atl-peach.jpg',
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      distance: '0.9 mi from downtown',
      reviews: 1654,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'atl_luxury_1',
      name: 'The St. Regis Atlanta',
      stars: 5,
      rating: 4.7,
      pricePerNight: 290,
      image: '/hotels/atl-regis.jpg',
      amenities: ['WiFi', 'Spa', 'Fine Dining', 'Butler Service', 'Concierge'],
      distance: '0.4 mi from downtown',
      reviews: 2123,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  'DEN': [
    {
      id: 'den_budget_1',
      name: 'Denver Hostel',
      stars: 2,
      rating: 4.0,
      pricePerNight: 70,
      image: '/hotels/den-hostel.jpg',
      amenities: ['WiFi', 'Kitchen', 'Bar'],
      distance: '2.1 mi from downtown',
      reviews: 456,
      freeCancellation: true
    },
    {
      id: 'den_smart_1',
      name: 'LoDo District Hotel',
      stars: 3,
      rating: 4.4,
      pricePerNight: 150,
      image: '/hotels/den-lodo.jpg',
      amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
      distance: '0.6 mi from downtown',
      reviews: 1345,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'den_luxury_1',
      name: 'The Brown Palace',
      stars: 5,
      rating: 4.8,
      pricePerNight: 315,
      image: '/hotels/den-brown.jpg',
      amenities: ['WiFi', 'Spa', 'Fine Dining', 'Historic', 'Concierge'],
      distance: '0.3 mi from downtown',
      reviews: 2765,
      freeBreakfast: true,
      freeCancellation: true
    }
  ],
  // Default fallback for unknown destinations
  'DEFAULT': [
    {
      id: 'default_budget_1',
      name: 'Budget Inn',
      stars: 2,
      rating: 3.9,
      pricePerNight: 70,
      image: '/hotels/default-budget.jpg',
      amenities: ['WiFi', 'Parking'],
      distance: '2.5 mi from city center',
      reviews: 423,
      freeCancellation: true
    },
    {
      id: 'default_smart_1',
      name: 'City Center Hotel',
      stars: 3,
      rating: 4.2,
      pricePerNight: 150,
      image: '/hotels/default-smart.jpg',
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
      distance: '1.0 mi from city center',
      reviews: 1234,
      popularChoice: true,
      freeBreakfast: true,
      freeCancellation: true
    },
    {
      id: 'default_luxury_1',
      name: 'Grand Luxury Hotel',
      stars: 5,
      rating: 4.7,
      pricePerNight: 300,
      image: '/hotels/default-luxury.jpg',
      amenities: ['WiFi', 'Spa', 'Fine Dining', 'Concierge', 'Valet'],
      distance: '0.5 mi from city center',
      reviews: 2456,
      freeBreakfast: true,
      freeCancellation: true
    }
  ]
};

// ============================================================================
// TRANSLATIONS
// ============================================================================

const TRANSLATIONS = {
  en: {
    title: 'Bundle & Save Big',
    subtitle: 'Get more for less with our exclusive package deals',
    budgetBundle: 'Budget Bundle',
    smartBundle: 'Smart Bundle',
    luxuryBundle: 'Luxury Bundle',
    mostPopular: 'Most Popular',
    bestValue: 'Best Value',
    premium: 'Premium',
    save: 'Save',
    perNight: 'per night',
    nights: 'nights',
    flightPrice: 'Flight',
    hotelPrice: 'Hotel',
    total: 'Total',
    youSave: 'You save',
    vsBookingSeparately: 'vs booking separately',
    selectBundle: 'Select Bundle',
    viewDetails: 'View Details',
    hideDetails: 'Hide Details',
    whatsIncluded: "What's Included",
    amenities: 'Amenities',
    hotelDetails: 'Hotel Details',
    rating: 'rating',
    reviews: 'reviews',
    fromDowntown: 'from downtown',
    addOns: 'Popular Add-ons',
    carRental: 'Car Rental',
    perDay: 'per day',
    airportParking: 'Airport Parking',
    travelInsurance: 'Travel Insurance',
    activities: 'Activities & Tours',
    addToBundle: 'Add to Bundle',
    features: {
      breakfast: 'Breakfast included',
      allMeals: 'All meals included',
      transfer: 'Airport transfer',
      privateTransfer: 'Private airport transfer',
      spaCredit: 'Spa credit',
      roomUpgrade: 'Room upgrade',
      freeCancellation: 'Free cancellation',
      bestPrice: 'Best price guarantee'
    },
    urgency: {
      roomsLeft: 'rooms left at this price',
      bookingsToday: 'bookings today',
      limitedAvailability: 'Limited availability'
    },
    social: {
      travelersChoose: 'of travelers choose this',
      upgradeFor: 'Upgrade to Luxury for only',
      popularChoice: 'Popular choice'
    }
  },
  pt: {
    title: 'Pacote e Economize Muito',
    subtitle: 'Ganhe mais por menos com nossas ofertas exclusivas',
    budgetBundle: 'Pacote Econômico',
    smartBundle: 'Pacote Inteligente',
    luxuryBundle: 'Pacote Luxo',
    mostPopular: 'Mais Popular',
    bestValue: 'Melhor Valor',
    premium: 'Premium',
    save: 'Economize',
    perNight: 'por noite',
    nights: 'noites',
    flightPrice: 'Voo',
    hotelPrice: 'Hotel',
    total: 'Total',
    youSave: 'Você economiza',
    vsBookingSeparately: 'vs reserva separada',
    selectBundle: 'Selecionar Pacote',
    viewDetails: 'Ver Detalhes',
    hideDetails: 'Ocultar Detalhes',
    whatsIncluded: 'O que está incluído',
    amenities: 'Comodidades',
    hotelDetails: 'Detalhes do Hotel',
    rating: 'avaliação',
    reviews: 'avaliações',
    fromDowntown: 'do centro',
    addOns: 'Complementos Populares',
    carRental: 'Aluguel de Carro',
    perDay: 'por dia',
    airportParking: 'Estacionamento no Aeroporto',
    travelInsurance: 'Seguro Viagem',
    activities: 'Atividades e Passeios',
    addToBundle: 'Adicionar ao Pacote',
    features: {
      breakfast: 'Café da manhã incluído',
      allMeals: 'Todas as refeições incluídas',
      transfer: 'Transfer do aeroporto',
      privateTransfer: 'Transfer privado',
      spaCredit: 'Crédito spa',
      roomUpgrade: 'Upgrade de quarto',
      freeCancellation: 'Cancelamento grátis',
      bestPrice: 'Garantia de melhor preço'
    },
    urgency: {
      roomsLeft: 'quartos restantes neste preço',
      bookingsToday: 'reservas hoje',
      limitedAvailability: 'Disponibilidade limitada'
    },
    social: {
      travelersChoose: 'dos viajantes escolhem este',
      upgradeFor: 'Upgrade para Luxo por apenas',
      popularChoice: 'Escolha popular'
    }
  },
  es: {
    title: 'Paquete y Ahorra Mucho',
    subtitle: 'Obtén más por menos con nuestras ofertas exclusivas',
    budgetBundle: 'Paquete Económico',
    smartBundle: 'Paquete Inteligente',
    luxuryBundle: 'Paquete Lujo',
    mostPopular: 'Más Popular',
    bestValue: 'Mejor Valor',
    premium: 'Premium',
    save: 'Ahorra',
    perNight: 'por noche',
    nights: 'noches',
    flightPrice: 'Vuelo',
    hotelPrice: 'Hotel',
    total: 'Total',
    youSave: 'Ahorras',
    vsBookingSeparately: 'vs reserva por separado',
    selectBundle: 'Seleccionar Paquete',
    viewDetails: 'Ver Detalles',
    hideDetails: 'Ocultar Detalles',
    whatsIncluded: 'Qué está incluido',
    amenities: 'Servicios',
    hotelDetails: 'Detalles del Hotel',
    rating: 'calificación',
    reviews: 'reseñas',
    fromDowntown: 'del centro',
    addOns: 'Complementos Populares',
    carRental: 'Alquiler de Coche',
    perDay: 'por día',
    airportParking: 'Estacionamiento Aeropuerto',
    travelInsurance: 'Seguro de Viaje',
    activities: 'Actividades y Tours',
    addToBundle: 'Agregar al Paquete',
    features: {
      breakfast: 'Desayuno incluido',
      allMeals: 'Todas las comidas incluidas',
      transfer: 'Transfer aeropuerto',
      privateTransfer: 'Transfer privado',
      spaCredit: 'Crédito spa',
      roomUpgrade: 'Mejora de habitación',
      freeCancellation: 'Cancelación gratis',
      bestPrice: 'Garantía de mejor precio'
    },
    urgency: {
      roomsLeft: 'habitaciones restantes a este precio',
      bookingsToday: 'reservas hoy',
      limitedAvailability: 'Disponibilidad limitada'
    },
    social: {
      travelersChoose: 'de los viajeros eligen este',
      upgradeFor: 'Mejora a Lujo por solo',
      popularChoice: 'Elección popular'
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract airport code from destination string
 */
const extractAirportCode = (destination: string): string => {
  // Try to extract 3-letter airport code
  const match = destination.match(/\b([A-Z]{3})\b/);
  return match ? match[1] : 'DEFAULT';
};

/**
 * Calculate number of nights
 */
const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

/**
 * Format currency
 */
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Get hotel amenity icon
 */
const getAmenityIcon = (amenity: string): React.ReactNode => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" />;
  if (amenityLower.includes('pool')) return <Wine className="w-4 h-4" />;
  if (amenityLower.includes('gym')) return <Dumbbell className="w-4 h-4" />;
  if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="w-4 h-4" />;
  if (amenityLower.includes('restaurant') || amenityLower.includes('dining') || amenityLower.includes('meals')) return <Utensils className="w-4 h-4" />;
  if (amenityLower.includes('breakfast') || amenityLower.includes('coffee')) return <Coffee className="w-4 h-4" />;
  return <Check className="w-4 h-4" />;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BundleDealsWidget({
  flightPrice,
  destination,
  checkInDate,
  checkOutDate,
  passengers,
  onBundleSelect,
  currency = 'USD',
  lang = 'en'
}: BundleDealsWidgetProps) {
  const [selectedBundle, setSelectedBundle] = useState<string>('smart');
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const t = TRANSLATIONS[lang];

  // Get hotels for destination
  const airportCode = extractAirportCode(destination);
  const hotels = HOTEL_DATABASE[airportCode] || HOTEL_DATABASE['DEFAULT'];
  const nights = calculateNights(checkInDate, checkOutDate);

  // Create bundle options
  const bundles: BundleOption[] = useMemo(() => [
    {
      id: 'budget',
      type: 'budget',
      name: t.budgetBundle,
      hotel: hotels[0],
      discount: 12,
      features: [
        t.features.freeCancellation,
        t.features.bestPrice
      ],
      addOns: {},
      popularity: 18,
      bookingsToday: 23
    },
    {
      id: 'smart',
      type: 'smart',
      name: t.smartBundle,
      hotel: hotels[1],
      discount: 18,
      features: [
        t.features.breakfast,
        t.features.transfer,
        t.features.freeCancellation,
        t.features.bestPrice
      ],
      addOns: {
        breakfast: true,
        transfer: true
      },
      badge: t.mostPopular,
      popularity: 67,
      urgency: `3 ${t.urgency.roomsLeft}`,
      bookingsToday: 142
    },
    {
      id: 'luxury',
      type: 'luxury',
      name: t.luxuryBundle,
      hotel: hotels[2],
      discount: 28,
      features: [
        t.features.allMeals,
        t.features.privateTransfer,
        `${t.features.spaCredit} ($100)`,
        t.features.roomUpgrade,
        t.features.freeCancellation,
        t.features.bestPrice
      ],
      addOns: {
        allMeals: true,
        privateTransfer: true,
        spaCredit: 100,
        roomUpgrade: true
      },
      badge: t.premium,
      popularity: 15,
      bookingsToday: 34
    }
  ], [hotels, t]);

  // Add-ons data
  const addOns: AddOn[] = [
    {
      id: 'car',
      name: t.carRental,
      pricePerDay: 35,
      icon: <Car className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'parking',
      name: t.airportParking,
      pricePerDay: 15,
      icon: <Car className="w-5 h-5" />
    },
    {
      id: 'insurance',
      name: t.travelInsurance,
      priceFlat: 45,
      icon: <Shield className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'activities',
      name: t.activities,
      priceFlat: 89,
      icon: <Gift className="w-5 h-5" />
    }
  ];

  // Calculate pricing for a bundle
  const calculateBundlePricing = (bundle: BundleOption) => {
    const hotelOriginalPrice = bundle.hotel.pricePerNight * nights;
    const hotelDiscountedPrice = hotelOriginalPrice * (1 - bundle.discount / 100);
    const bundleTotal = flightPrice + hotelDiscountedPrice;
    const originalTotal = flightPrice + hotelOriginalPrice;
    const savings = originalTotal - bundleTotal;
    const savingsPercent = (savings / originalTotal) * 100;

    return {
      hotelOriginalPrice,
      hotelDiscountedPrice,
      bundleTotal,
      originalTotal,
      savings,
      savingsPercent
    };
  };

  // Calculate add-ons total
  const calculateAddOnsTotal = () => {
    let total = 0;
    selectedAddOns.forEach(addOnId => {
      const addOn = addOns.find(a => a.id === addOnId);
      if (addOn) {
        if (addOn.pricePerDay) {
          total += addOn.pricePerDay * nights;
        } else if (addOn.priceFlat) {
          total += addOn.priceFlat;
        }
      }
    });
    return total;
  };

  // Handle bundle selection
  const handleSelectBundle = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (bundle) {
      const pricing = calculateBundlePricing(bundle);
      const addOnsTotal = calculateAddOnsTotal();
      const finalTotal = pricing.bundleTotal + addOnsTotal;
      onBundleSelect(bundleId, finalTotal);
    }
  };

  // Toggle add-on
  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  // Get badge color
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'budget':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'smart':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'luxury':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-4">
          <Sparkles className="w-5 h-5 text-green-400" />
          <span className="text-green-300 font-semibold">
            {t.save} {formatCurrency(calculateBundlePricing(bundles[1]).savings, currency)}+
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {t.title}
        </h2>
        <p className="text-gray-400 text-lg">
          {t.subtitle}
        </p>
      </motion.div>

      {/* Bundle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {bundles.map((bundle, index) => {
          const pricing = calculateBundlePricing(bundle);
          const isSelected = selectedBundle === bundle.id;
          const isExpanded = expandedBundle === bundle.id;

          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Popular Badge */}
              {bundle.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`px-4 py-1 rounded-full border backdrop-blur-xl font-semibold text-sm ${
                    bundle.type === 'smart'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    {bundle.badge}
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? 'border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                } ${bundle.type === 'smart' ? 'md:scale-105' : ''}`}
              >
                {/* Hotel Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(bundle.hotel.stars)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <h3 className="text-white font-bold text-xl mb-1">
                      {bundle.hotel.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{bundle.hotel.distance}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Bundle Name */}
                  <div className="mb-4">
                    <h4 className="text-2xl font-bold text-white mb-1">
                      {bundle.name}
                    </h4>
                    {bundle.popularity && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{bundle.popularity}% {t.social.travelersChoose}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing Comparison */}
                  <div className="mb-6">
                    {/* Original Price (Strikethrough) */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <span>{t.vsBookingSeparately}</span>
                      <span className="line-through">
                        {formatCurrency(pricing.originalTotal, currency)}
                      </span>
                    </div>

                    {/* Bundle Price */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg text-white font-semibold">{t.total}</span>
                      <span className="text-3xl font-bold text-white">
                        {formatCurrency(pricing.bundleTotal, currency)}
                      </span>
                    </div>

                    {/* Savings Badge */}
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span className="text-green-300 font-semibold">
                            {t.youSave}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-300 font-bold text-xl">
                            {formatCurrency(pricing.savings, currency)}
                          </div>
                          <div className="text-green-400 text-sm">
                            {t.save} {pricing.savingsPercent.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center justify-between text-gray-400">
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4" />
                        <span>{t.flightPrice}</span>
                      </div>
                      <span>{formatCurrency(flightPrice, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hotel className="w-4 h-4 text-green-400" />
                        <span className="text-white">
                          {t.hotelPrice} ({nights} {t.nights})
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 line-through text-xs">
                          {formatCurrency(pricing.hotelOriginalPrice, currency)}
                        </div>
                        <div className="text-green-400 font-semibold">
                          {formatCurrency(pricing.hotelDiscountedPrice, currency)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {bundle.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-semibold">
                        {bundle.hotel.rating}
                      </span>
                      <span className="text-gray-400">/{bundle.hotel.reviews.toLocaleString()} {t.reviews}</span>
                    </div>
                  </div>

                  {/* Urgency & Social Proof */}
                  {(bundle.urgency || bundle.bookingsToday) && (
                    <div className="space-y-2 mb-6">
                      {bundle.urgency && (
                        <div className="flex items-center gap-2 text-sm text-orange-400">
                          <Flame className="w-4 h-4" />
                          <span>{bundle.urgency}</span>
                        </div>
                      )}
                      {bundle.bookingsToday && (
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <Users className="w-4 h-4" />
                          <span>{bundle.bookingsToday} {t.urgency.bookingsToday}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Select Button */}
                  <button
                    onClick={() => {
                      setSelectedBundle(bundle.id);
                      handleSelectBundle(bundle.id);
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isSelected
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Selected
                      </span>
                    ) : (
                      t.selectBundle
                    )}
                  </button>

                  {/* View Details Toggle */}
                  <button
                    onClick={() => setExpandedBundle(isExpanded ? null : bundle.id)}
                    className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <span>{isExpanded ? t.hideDetails : t.viewDetails}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                          {/* Amenities */}
                          <div>
                            <h5 className="text-sm font-semibold text-white mb-2">
                              {t.amenities}
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              {bundle.hotel.amenities.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                  {getAmenityIcon(amenity)}
                                  <span>{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* What's Included */}
                          <div>
                            <h5 className="text-sm font-semibold text-white mb-2">
                              {t.whatsIncluded}
                            </h5>
                            <div className="space-y-1">
                              {bundle.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add-Ons Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">{t.addOns}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {addOns.map((addOn) => {
            const isSelected = selectedAddOns.includes(addOn.id);
            const price = addOn.pricePerDay
              ? addOn.pricePerDay * nights
              : addOn.priceFlat || 0;

            return (
              <div
                key={addOn.id}
                onClick={() => toggleAddOn(addOn.id)}
                className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {addOn.popular && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Popular
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-gray-400'
                  }`}>
                    {addOn.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">{addOn.name}</h4>
                    <div className="text-sm text-gray-400">
                      {addOn.pricePerDay && (
                        <span>{formatCurrency(addOn.pricePerDay, currency)} {t.perDay}</span>
                      )}
                      {addOn.priceFlat && (
                        <span>{formatCurrency(addOn.priceFlat, currency)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(price, currency)}
                  </span>
                  <button
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Added
                      </span>
                    ) : (
                      t.addToBundle
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add-ons Total */}
        {selectedAddOns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Add-ons Total:</span>
              <span className="text-xl font-bold text-purple-300">
                +{formatCurrency(calculateAddOnsTotal(), currency)}
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Total Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-gray-400 mb-1">Grand Total (Bundle + Add-ons)</div>
            <div className="text-4xl font-bold text-white">
              {formatCurrency(
                calculateBundlePricing(bundles.find(b => b.id === selectedBundle)!).bundleTotal +
                calculateAddOnsTotal(),
                currency
              )}
            </div>
            <div className="text-green-400 font-semibold mt-1">
              {t.youSave} {formatCurrency(
                calculateBundlePricing(bundles.find(b => b.id === selectedBundle)!).savings,
                currency
              )} ({calculateBundlePricing(bundles.find(b => b.id === selectedBundle)!).savingsPercent.toFixed(0)}%)
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-5 h-5 text-green-400" />
              <span>{t.features.bestPrice}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>{t.features.freeCancellation}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex items-center justify-center gap-6 flex-wrap text-sm text-gray-400"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <span>Best Price Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>24/7 Support</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>4.8★ Rated Service</span>
        </div>
      </motion.div>
    </div>
  );
}
