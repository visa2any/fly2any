'use client';

/**
 * Enhanced Hotel Results List Component
 * Premium design focused on conversion and user experience
 * Implements Figma-style modern UI with advanced filtering
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Star, 
  Heart, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Wifi, 
  Car, 
  Utensils, 
  Waves,
  Coffee,
  Shield,
  Eye,
  ExternalLink,
  Clock,
  Users,
  Calendar,
  Loader2,
  BarChart3,
  ChevronDown,
  Bed,
  ChevronUp,
  Zap,
  Award,
  Percent,
  CheckCircle,
  X,
  Search,
  Sliders,
  Grid,
  List,
  Map,
  Camera,
  ArrowRight,
  TrendingUp,
  Tag,
  CreditCard,
  Calendar as CalendarIcon,
  MessageCircle
} from 'lucide-react';
import Image from 'next/image';
import type { Hotel, HotelSearchResponse, Rate } from '@/types/hotels';
import { MultiUrgencyStack } from '@/components/ui/urgency-banners';
import { ReviewsIntegration } from '@/components/ui/reviews-integration';
import { WhatsAppChat } from '@/components/ui/whatsapp-chat';

interface HotelResultsListProps {
  searchResults: HotelSearchResponse | null;
  onHotelSelect: (hotel: Hotel) => void;
  onRateSelect: (hotel: Hotel, rate: Rate) => void;
  isLoading?: boolean;
  className?: string;
  onAddToComparison?: (hotel: Hotel) => void;
  comparisonHotels?: Hotel[];
}

interface EnhancedFilters {
  priceRange: [number, number];
  starRatings: number[];
  amenities: string[];
  boardTypes: string[];
  hotelChains: string[];
  guestRating?: number;
  freeCancellation?: boolean;
  freeWifi?: boolean;
  hotelClass?: string[];
  sustainability?: boolean;
  instantConfirmation?: boolean;
  paymentOptions?: string[];
  distanceFromCenter?: number;
}

type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'stars-desc' | 'distance-asc' | 'popularity-desc';
type ViewMode = 'list' | 'grid' | 'map';

const AMENITY_ICONS: Record<string, any> = {
  'wifi': Wifi,
  'internet': Wifi,
  'parking': Car,
  'restaurant': Utensils,
  'dining': Utensils,
  'pool': Waves,
  'swimming': Waves,
  'breakfast': Coffee,
  'food': Coffee,
  'security': Shield,
  'fitness': TrendingUp,
  'gym': TrendingUp,
  'spa': Award,
  'business': CreditCard,
  'transportation': Car,
  'connectivity': Wifi,
  'recreation': Waves,
  'services': Shield,
  'general': CheckCircle
};

const BOARD_TYPE_LABELS: Record<string, string> = {
  'room_only': 'Apenas Quarto',
  'breakfast': 'Com Café da Manhã',
  'half_board': 'Meia Pensão',
  'full_board': 'Pensão Completa',
  'all_inclusive': 'All Inclusive'
};

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Menor Preço', icon: TrendingUp },
  { value: 'price-desc', label: 'Maior Preço', icon: TrendingUp },
  { value: 'rating-desc', label: 'Melhor Avaliação', icon: Award },
  { value: 'stars-desc', label: 'Mais Estrelas', icon: Star },
  { value: 'distance-asc', label: 'Distância', icon: MapPin },
  { value: 'popularity-desc', label: 'Mais Popular', icon: TrendingUp }
];

const QUICK_FILTERS = [
  { id: 'freeCancellation', label: 'Cancelamento Grátis', icon: CheckCircle },
  { id: 'freeWifi', label: 'WiFi Grátis', icon: Wifi },
  { id: 'instantConfirmation', label: 'Confirmação Instantânea', icon: Zap },
  { id: 'sustainability', label: 'Sustentável', icon: Award }
];

export default function HotelResultsList({
  searchResults,
  onHotelSelect,
  onRateSelect,
  isLoading = false,
  className = '',
  onAddToComparison,
  comparisonHotels = []
}: HotelResultsListProps) {
  const [filters, setFilters] = useState<EnhancedFilters>({
    priceRange: [0, 5000],
    starRatings: [],
    amenities: [],
    boardTypes: [],
    hotelChains: [],
    guestRating: undefined,
    freeCancellation: undefined,
    freeWifi: undefined,
    hotelClass: [],
    sustainability: undefined,
    instantConfirmation: undefined,
    paymentOptions: [],
    distanceFromCenter: 50
  });

  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [expandedHotels, setExpandedHotels] = useState<Set<string>>(new Set());
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState('');

  // Initialize filter ranges from search results
  useEffect(() => {
    if (searchResults?.filters) {
      setFilters(prev => ({
        ...prev,
        priceRange: [
          searchResults.filters.priceRange.min,
          searchResults.filters.priceRange.max
        ]
      }));
    }
  }, [searchResults]);

  // Enhanced filter and sort logic
  const filteredAndSortedHotels = useMemo(() => {
    if (!searchResults?.hotels) return [];

    const filtered = searchResults.hotels.filter(hotel => {
      // Search filter
      if (filterSearch) {
        const searchLower = filterSearch.toLowerCase();
        const matchesName = hotel.name.toLowerCase().includes(searchLower);
        const matchesLocation = hotel.location.address.city?.toLowerCase().includes(searchLower) || false;
        const matchesChain = hotel.chainName?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesLocation && !matchesChain) return false;
      }

      // Price filter
      const lowestPrice = hotel.lowestRate?.amount || 0;
      if (lowestPrice < filters.priceRange[0] || lowestPrice > filters.priceRange[1]) {
        return false;
      }

      // Star rating filter
      if (filters.starRatings.length > 0 && !filters.starRatings.includes(hotel.starRating || 0)) {
        return false;
      }

      // Guest rating filter
      if (filters.guestRating && (!hotel.guestRating || hotel.guestRating < filters.guestRating)) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hotelAmenityIds = hotel.amenities.map(a => a.id);
        if (!filters.amenities.every(amenityId => hotelAmenityIds.includes(amenityId))) {
          return false;
        }
      }

      // Board types filter
      if (filters.boardTypes.length > 0) {
        const hotelBoardTypes = hotel.rates?.map(r => r.boardType) || [];
        if (!filters.boardTypes.some(boardType => hotelBoardTypes.includes(boardType as any))) {
          return false;
        }
      }

      // Hotel chains filter
      if (filters.hotelChains.length > 0) {
        if (!hotel.chainName || !filters.hotelChains.includes(hotel.chainName)) {
          return false;
        }
      }

      // Hotel class filter
      if (filters.hotelClass && filters.hotelClass.length > 0) {
        if (!hotel.hotelClass || !filters.hotelClass.includes(hotel.hotelClass)) {
          return false;
        }
      }

      // Free cancellation filter
      if (filters.freeCancellation) {
        const hasFreeCancellation = hotel.rates?.some(r => r.isFreeCancellation);
        if (!hasFreeCancellation) return false;
      }

      // Free WiFi filter
      if (filters.freeWifi) {
        const hasWifi = hotel.amenities.some(a => 
          (a.name.toLowerCase().includes('wifi') || a.name.toLowerCase().includes('internet')) && a.isFree
        );
        if (!hasWifi) return false;
      }

      // Sustainability filter
      if (filters.sustainability) {
        if (!hotel.sustainability || hotel.sustainability.level < 3) return false;
      }

      // Instant confirmation filter
      if (filters.instantConfirmation) {
        // For now, assume all hotels have instant confirmation
        // This would be based on actual API data
      }

      return true;
    });

    // Enhanced sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.lowestRate?.amount || 0) - (b.lowestRate?.amount || 0);
        case 'price-desc':
          return (b.lowestRate?.amount || 0) - (a.lowestRate?.amount || 0);
        case 'rating-desc':
          return (b.guestRating || 0) - (a.guestRating || 0);
        case 'stars-desc':
          return (b.starRating || 0) - (a.starRating || 0);
        case 'distance-asc':
          // For now, just use hotel ID as proxy for distance
          return a.id.localeCompare(b.id);
        case 'popularity-desc':
          // Sort by review count as proxy for popularity
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchResults, filters, sortBy, filterSearch]);

  const toggleFavorite = (hotelId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId);
      } else {
        newFavorites.add(hotelId);
      }
      return newFavorites;
    });
  };

  const toggleHotelExpansion = (hotelId: string) => {
    setExpandedHotels(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(hotelId)) {
        newExpanded.delete(hotelId);
      } else {
        newExpanded.add(hotelId);
      }
      return newExpanded;
    });
  };

  // Enhanced utility functions
  const renderStars = (rating: number, size = 16, showEmpty = true) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        size={size} 
        className={index < rating 
          ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
          : showEmpty ? 'text-gray-300' : 'hidden'
        } 
      />
    ));
  };

  const renderAmenityIcon = (amenity: any) => {
    const IconComponent = AMENITY_ICONS[amenity.id] || 
                         AMENITY_ICONS[amenity.category] || 
                         (amenity.name && AMENITY_ICONS[amenity.name.toLowerCase()]) ||
                         Shield;
    return (
      <div className="relative inline-flex items-center justify-center">
        <IconComponent size={14} className="text-gray-600 transition-colors" />
        {amenity.isFree && <CheckCircle size={10} className="absolute -top-0.5 -right-0.5 text-green-500 bg-white rounded-full p-0.5" />}
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 9) return '#10b981'; // Green
    if (rating >= 8) return '#3b82f6'; // Blue  
    if (rating >= 7) return '#f59e0b'; // Orange
    if (rating >= 6) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const getRatingText = (rating: number) => {
    if (rating >= 9) return 'Excepcional';
    if (rating >= 8.5) return 'Excelente';
    if (rating >= 8) return 'Muito Bom';
    if (rating >= 7) return 'Bom';
    if (rating >= 6) return 'Satisfatório';
    return 'Regular';
  };

  const getDiscountBadge = (rate: Rate) => {
    if (rate.discountPercentage && rate.discountPercentage > 0) {
      return (
        <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
          <Percent size={12} />
          -{rate.discountPercentage}%
        </div>
      );
    }
    return null;
  };

  const getUrgencyMessage = (rate: Rate) => {
    if ((rate.availableRooms || 0) <= 3) {
      return `Apenas ${rate.availableRooms || 0} quartos restantes!`;
    }
    if ((rate.availableRooms || 0) <= 10) {
      return `Últimas ${rate.availableRooms || 0} unidades`;
    }
    return null;
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [searchResults?.filters.priceRange.min || 0, searchResults?.filters.priceRange.max || 5000],
      starRatings: [],
      amenities: [],
      boardTypes: [],
      hotelChains: [],
      guestRating: undefined,
      freeCancellation: undefined,
      freeWifi: undefined,
      hotelClass: [],
      sustainability: undefined,
      instantConfirmation: undefined,
      paymentOptions: [],
      distanceFromCenter: 50
    });
    setFilterSearch('');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[500px] bg-gradient-to-br from-white via-gray-50 to-blue-50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl ${className}`}>
        <div className="text-center text-gray-700 max-w-md">
          <div className="mb-8">
            <div className="mb-4">
              <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            </div>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-200"></div>
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔍 Buscando os melhores hotéis
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Analisando mais de 500.000 propriedades para você...
          </p>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award size={16} className="text-yellow-500" />
              <span>Melhores preços</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500" />
              <span>Verificado</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap size={16} className="text-blue-500" />
              <span>Tempo real</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!searchResults || !searchResults.hotels.length) {
    return (
      <div className={`flex items-center justify-center min-h-[500px] bg-gradient-to-br from-white via-gray-50 to-blue-50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl ${className}`}>
        <div className="text-center text-gray-700 max-w-lg px-10">
          <div className="relative inline-block mb-6">
            <Search size={48} className="text-gray-400" />
            <X size={24} className="absolute -top-2 -right-2 text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">🏨 Nenhum hotel encontrado</h3>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Não encontramos hotéis que correspondam aos seus critérios
          </p>
          <div className="text-left bg-white rounded-xl p-6 mb-8 shadow-sm border">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tente estas dicas:</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-lg">🗓️</span>
                Altere suas datas de viagem
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-lg">📍</span>
                Tente uma cidade próxima
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-lg">⚙️</span>
                Remova alguns filtros
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-lg">💰</span>
                Ajuste a faixa de preço
              </li>
            </ul>
          </div>
          <button 
            onClick={clearAllFilters} 
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105"
          >
            <Sliders size={16} />
            Limpar Todos os Filtros
          </button>
        </div>
      </div>
    );
  }

  // Check if we're in compact layout mode
  const isCompactLayout = className?.includes('compact-layout');

  return (
    <div className={`${isCompactLayout ? 'w-full' : 'max-w-7xl mx-auto px-4'} ${className?.replace('compact-layout', '') || ''}`}>
      {/* Hotels List - Layout simplificado */}
      <div className="space-y-3">
        <div className="flex flex-col gap-4">
          {filteredAndSortedHotels.map(hotel => {
            const isExpanded = expandedHotels.has(hotel.id);
            const isFavorite = favorites.has(hotel.id);
            const mainImage = hotel.images.find(img => img.isMain) || hotel.images[0];
            const lowestRate = hotel.rates?.reduce((min, rate) => 
              !min || rate.price.amount < min.price.amount ? rate : min
            );

            return (
              <div key={hotel.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5">
                {/* Urgency Banners */}
                <MultiUrgencyStack 
                  hotelId={hotel.id}
                  rateId={lowestRate?.id}
                  roomsLeft={Math.floor(Math.random() * 5) + 1}
                  className="mb-2"
                  onPreBooking={(prebookId) => {
                    console.log(`Pre-booking iniciado para hotel ${hotel.id}: ${prebookId}`);
                  }}
                />

                <div className="flex p-3 gap-4">
                  {/* Hotel Image - Mais compacto para ver mais hotéis */}
                  <div className={`relative ${isCompactLayout ? 'w-48 h-32' : 'w-72 h-52'} rounded-lg overflow-hidden flex-shrink-0`}>
                    {mainImage ? (
                      <Image
                        src={mainImage.url}
                        alt={hotel.name}
                        width={isCompactLayout ? 192 : 280}
                        height={isCompactLayout ? 128 : 200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <MapPin size={isCompactLayout ? 32 : 48} />
                      </div>
                    )}
                    
                    {/* Ações do hotel - melhoradas */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        className={`w-8 h-8 rounded-full border-0 cursor-pointer flex items-center justify-center transition-all hover:scale-110 ${
                          isFavorite 
                            ? 'bg-white text-red-500' 
                            : 'bg-white/90 text-gray-600 hover:bg-white'
                        }`}
                        onClick={() => toggleFavorite(hotel.id)}
                        title="Favoritar hotel"
                      >
                        <Heart size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:bg-white border-0 cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                        title="Ver no mapa"
                      >
                        <MapPin size={14} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:bg-white border-0 cursor-pointer flex items-center justify-center transition-all hover:scale-110"
                        title="Galeria de fotos"
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Hotel Info - Layout mais compacto com mais informações distribuídas */}
                  <div className={`flex-1 flex flex-col ${isCompactLayout ? 'gap-1.5' : 'gap-3'}`}>
                    {/* Linha 1: Nome, Estrelas, e Rating */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`${isCompactLayout ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>{hotel.name}</h3>
                          <div className="flex gap-0.5">
                            {renderStars(hotel.starRating || 0, isCompactLayout ? 12 : 16)}
                          </div>
                          {hotel.chainName && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{hotel.chainName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span>{hotel.location.address.city}, {hotel.location.address.country}</span>
                          </div>
                          {hotel.reviewCount && (
                            <span>({hotel.reviewCount} avaliações)</span>
                          )}
                        </div>
                      </div>
                      
                      {hotel.guestRating && (
                        <div className="text-right flex-shrink-0">
                          <span className={`block ${isCompactLayout ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>{hotel.guestRating}</span>
                          <span className="block text-xs text-gray-600">Muito Bom</span>
                        </div>
                      )}
                    </div>

                    {/* Linha 2: Descrição mais compacta */}
                    {hotel.description && isCompactLayout && (
                      <p className="text-gray-700 text-xs leading-relaxed m-0">
                        {hotel.description.substring(0, 120) + (hotel.description.length > 120 ? '...' : '')}
                      </p>
                    )}

                    {/* Linha 3: Amenities mais compactas */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {hotel.amenities.slice(0, isCompactLayout ? 8 : 4).map(amenity => (
                        <div key={amenity.id} className="flex items-center gap-1 text-xs text-gray-600 bg-slate-50 px-1.5 py-0.5 rounded" title={amenity.name}>
                          {renderAmenityIcon(amenity.id)}
                          <span className={isCompactLayout ? 'hidden lg:inline' : ''}>{amenity.name}</span>
                        </div>
                      ))}
                      {hotel.amenities.length > (isCompactLayout ? 8 : 4) && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                          +{hotel.amenities.length - (isCompactLayout ? 8 : 4)}
                        </span>
                      )}
                    </div>

                    {/* Linha 4: Botões e comparação */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2">
                        <button
                          className={`flex items-center gap-1 ${isCompactLayout ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} border border-gray-300 rounded-md bg-white cursor-pointer transition-all hover:border-blue-600 hover:bg-blue-50`}
                          onClick={() => onHotelSelect(hotel)}
                        >
                          <Eye size={isCompactLayout ? 12 : 16} />
                          Ver Detalhes
                        </button>
                        
                        <button
                          className={`flex items-center gap-1 ${isCompactLayout ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} border border-gray-300 rounded-md bg-white cursor-pointer transition-all hover:border-blue-600 hover:bg-blue-50`}
                          onClick={() => toggleHotelExpansion(hotel.id)}
                        >
                          {isExpanded ? 'Ocultar' : 'Quartos'}
                          {isExpanded ? <SortAsc size={isCompactLayout ? 12 : 16} /> : <SortDesc size={isCompactLayout ? 12 : 16} />}
                        </button>
                        
                        {onAddToComparison && (
                          <button
                            className={`flex items-center gap-1 ${isCompactLayout ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} border rounded-md cursor-pointer transition-all ${
                              comparisonHotels.some(h => h.id === hotel.id)
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 bg-white hover:border-blue-600 hover:bg-blue-50'
                            }`}
                            onClick={() => onAddToComparison(hotel)}
                            disabled={comparisonHotels.some(h => h.id === hotel.id)}
                          >
                            <BarChart3 size={isCompactLayout ? 12 : 16} />
                            {comparisonHotels.some(h => h.id === hotel.id) ? 'Adicionado' : 'Comparar'}
                          </button>
                        )}
                      </div>
                      
                    </div>
                  </div>

                  {/* Price Section - Compacta para ver mais hotéis */}
                  <div className={`flex flex-col items-end justify-center ${isCompactLayout ? 'pl-3' : 'pl-5'} border-l border-gray-200 ${isCompactLayout ? 'min-w-32' : 'min-w-44'}`}>
                    {hotel.lowestRate && (
                      <>
                        <div className="text-right mb-2">
                          <span className="block text-xs text-gray-500 mb-0.5">A partir de</span>
                          <div className="flex items-baseline gap-0.5 justify-end">
                            <span className="text-xs text-gray-600">{hotel.lowestRate.currency}</span>
                            <span className={`${isCompactLayout ? 'text-xl' : 'text-3xl'} font-bold text-blue-600`}>{hotel.lowestRate.amount}</span>
                          </div>
                          <span className="block text-xs text-gray-500">por noite</span>
                        </div>
                        
                        {lowestRate && (
                          <button
                            className={`flex items-center gap-1 ${isCompactLayout ? 'px-3 py-1.5 text-sm' : 'px-6 py-3'} bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 rounded-md cursor-pointer font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30`}
                            onClick={() => onRateSelect(hotel, lowestRate)}
                          >
                            Reservar
                            <ExternalLink size={isCompactLayout ? 12 : 16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Rates */}
                {isExpanded && hotel.rates && hotel.rates.length > 0 && (
                  <div className="border-t border-gray-200 p-5 bg-gray-50">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Quartos Disponíveis</h4>
                    <div className="flex flex-col gap-3">
                      {hotel.rates.slice(0, 3).map(rate => (
                        <div key={rate.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white transition-all hover:border-blue-600 hover:shadow-sm">
                          <div>
                            <h5 className="text-base font-semibold text-gray-900 mb-2">{rate.roomType.name}</h5>
                            <div className="flex flex-col gap-2">
                              <span className="text-sm font-medium text-blue-600">
                                {BOARD_TYPE_LABELS[rate.boardType] || rate.boardType}
                              </span>
                              
                              {/* Descrição do quarto */}
                              {rate.roomType.description && (
                                <p className="text-sm text-gray-600 italic">
                                  {rate.roomType.description}
                                </p>
                              )}
                              
                              {/* Comodidades do quarto */}
                              {rate.roomType.amenities && rate.roomType.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {rate.roomType.amenities.slice(0, 4).map((amenity, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                      {amenity}
                                    </span>
                                  ))}
                                  {rate.roomType.amenities.length > 4 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      +{rate.roomType.amenities.length - 4} mais
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Users size={14} />
                                  Até {rate.maxOccupancy} pessoas
                                </span>
                                {rate.isFreeCancellation && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <Clock size={14} />
                                    Cancelamento grátis
                                  </span>
                                )}
                                {rate.availableRooms && (
                                  <span className="flex items-center gap-1 text-orange-600">
                                    <Bed size={14} />
                                    {rate.availableRooms} disponíveis
                                  </span>
                                )}
                              </div>
                              
                              {/* Preço original e desconto */}
                              {rate.originalPrice && rate.discountPercentage && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="line-through text-gray-400">
                                    {rate.originalPrice.formatted}
                                  </span>
                                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                    -{rate.discountPercentage}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div>
                              <span className="block text-lg font-semibold text-blue-600">{rate.totalPrice?.formatted || 'N/A'}</span>
                              <span className="text-xs text-gray-600">por noite</span>
                            </div>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white border-0 rounded-md cursor-pointer text-sm font-medium mt-2 transition-all hover:bg-blue-700"
                              onClick={() => onRateSelect(hotel, rate)}
                            >
                              Selecionar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Paginação híbrida moderna */}
        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Estatísticas */}
            <div className="text-sm text-gray-600">
              Mostrando <strong>{filteredAndSortedHotels.length}</strong> de <strong>{searchResults?.totalResults || filteredAndSortedHotels.length}</strong> hotéis
            </div>
            
            {/* Controles de paginação */}
            <div className="flex items-center gap-4">
              {/* Carregar mais */}
              {filteredAndSortedHotels.length < (searchResults?.totalResults || 0) && (
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all">
                  <span>Carregar mais hotéis</span>
                  <ArrowRight size={16} />
                </button>
              )}
              
              {/* Paginação clássica */}
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  ←
                </button>
                <span className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">1</span>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                <span className="px-2 py-2 text-gray-400">...</span>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}