'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, X, TrendingDown, Sparkles, MapPin, ArrowRight, Flame, Zap, Tag, Filter } from 'lucide-react';

interface ViewedDestination {
  id: string;
  city: string;
  country: string;
  price: number;
  imageUrl: string;
  viewedAt: number;
  from?: string;  // Origin airport code (optional for backward compatibility)
  to: string;     // Destination airport code
  originalPrice?: number; // For price drop detection
  departureDate?: string;
  returnDate?: string;
}

interface RecentlyViewedSectionProps {
  lang?: 'en' | 'pt' | 'es';
}

type FilterType = 'all' | 'deals' | 'drops' | 'under400';

// Country name to ISO 2-letter code mapping for popular travel destinations
const countryToCode: Record<string, string> = {
  'United States': 'US',
  'United Kingdom': 'UK',
  'Canada': 'CA',
  'Mexico': 'MX',
  'Brazil': 'BR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'France': 'FR',
  'Germany': 'DE',
  'Italy': 'IT',
  'Spain': 'ES',
  'Portugal': 'PT',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Greece': 'GR',
  'Turkey': 'TR',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'Qatar': 'QA',
  'Egypt': 'EG',
  'Morocco': 'MA',
  'South Africa': 'ZA',
  'Kenya': 'KE',
  'Japan': 'JP',
  'China': 'CN',
  'South Korea': 'KR',
  'Thailand': 'TH',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Vietnam': 'VN',
  'Philippines': 'PH',
  'India': 'IN',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'Russia': 'RU',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Croatia': 'HR',
  'Ireland': 'IE',
  'Iceland': 'IS',
  'Norway': 'NO',
  'Sweden': 'SE',
  'Denmark': 'DK',
  'Finland': 'FI',
};

// Helper function to get country code
const getCountryCode = (countryName: string): string => {
  return countryToCode[countryName] || countryName;
};

const translations = {
  en: {
    title: '👁️ Your Recent Searches and Viewed',
    subtitle: 'Pick up where you left off',
    clearAll: 'Clear All',
    from: 'from',
    noItems: 'No recently viewed destinations',
    browseDestinations: 'Browse destinations to see them here',
    priceDrop: 'Price Drop!',
    bookNow: 'Book',
    viewFlights: 'View Flights',
    showing: 'Showing',
    of: 'of',
    searches: 'searches',
    save: 'Save',
    hotDeal: 'Hot Deal',
    flashSale: 'Flash',
    searchesCount: 'searches',
    priceDropsCount: 'price drops',
    avgPrice: 'Avg',
    bestDeal: 'Best',
    filterAll: 'All',
    filterDeals: 'Deals Only',
    filterDrops: 'Price Drops',
    filterUnder: 'Under $400',
    quickFilters: 'Quick Filters:',
  },
  pt: {
    title: '👁️ Suas Pesquisas e Visualizações Recentes',
    subtitle: 'Continue de onde parou',
    clearAll: 'Limpar Tudo',
    from: 'a partir de',
    noItems: 'Nenhum destino visualizado recentemente',
    browseDestinations: 'Navegue pelos destinos para vê-los aqui',
    priceDrop: 'Preço Caiu!',
    bookNow: 'Reservar',
    viewFlights: 'Ver Voos',
    showing: 'Mostrando',
    of: 'de',
    searches: 'pesquisas',
    save: 'Economize',
    hotDeal: 'Oferta Quente',
    flashSale: 'Flash',
    searchesCount: 'pesquisas',
    priceDropsCount: 'quedas de preço',
    avgPrice: 'Média',
    bestDeal: 'Melhor',
    filterAll: 'Todos',
    filterDeals: 'Só Ofertas',
    filterDrops: 'Quedas',
    filterUnder: 'Abaixo $400',
    quickFilters: 'Filtros Rápidos:',
  },
  es: {
    title: '👁️ Tus Búsquedas y Vistas Recientes',
    subtitle: 'Continúa donde lo dejaste',
    clearAll: 'Borrar Todo',
    from: 'desde',
    noItems: 'No hay destinos vistos recientemente',
    browseDestinations: 'Explora destinos para verlos aquí',
    priceDrop: '¡Precio Bajó!',
    bookNow: 'Reservar',
    viewFlights: 'Ver Vuelos',
    showing: 'Mostrando',
    of: 'de',
    searches: 'búsquedas',
    save: 'Ahorra',
    hotDeal: 'Oferta Caliente',
    flashSale: 'Flash',
    searchesCount: 'búsquedas',
    priceDropsCount: 'bajadas de precio',
    avgPrice: 'Prom',
    bestDeal: 'Mejor',
    filterAll: 'Todos',
    filterDeals: 'Solo Ofertas',
    filterDrops: 'Bajadas',
    filterUnder: 'Menos $400',
    quickFilters: 'Filtros Rápidos:',
  },
};

export function RecentlyViewedSection({ lang = 'en' }: RecentlyViewedSectionProps) {
  const t = translations[lang];
  const router = useRouter();
  const [recentlyViewed, setRecentlyViewed] = useState<ViewedDestination[]>([]);
  const [maxItems, setMaxItems] = useState(12); // Dynamic based on screen
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Fix hydration error: Mark as mounted first
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dynamic max items based on screen width (client-side only)
  useEffect(() => {
    if (!mounted) return; // Skip on server-side

    const calculateMaxItems = () => {
      const width = window.innerWidth;
      // Card width = 240px, gap = 12px (gap-3) - REDUCED for compactness
      // Container padding = 32px (16px each side) - REDUCED
      // Max container width = 1600px
      const containerWidth = Math.min(width - 32, 1600);
      const cardWidth = 240;
      const gap = 12;
      const itemsPerRow = Math.floor((containerWidth + gap) / (cardWidth + gap));

      // Show 2-3 rows depending on total items
      const rows = recentlyViewed.length > itemsPerRow * 2 ? 3 : 2;
      return Math.max(itemsPerRow * rows, 8); // Minimum 8 items
    };

    const updateMaxItems = () => {
      setMaxItems(calculateMaxItems());
    };

    updateMaxItems();
    window.addEventListener('resize', updateMaxItems);
    return () => window.removeEventListener('resize', updateMaxItems);
  }, [recentlyViewed.length, mounted]);

  useEffect(() => {
    if (!mounted) return; // Skip on server-side

    // Migrate and load data
    const loadData = async () => {
      // First, migrate old data to include dates
      const { migrateRecentlyViewedDates } = await import('@/lib/hooks/useFavorites');
      migrateRecentlyViewedDates();

      // Then load from localStorage
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          // Deduplicate by destination, keep most recent
          const unique = parsed.reduce((acc: ViewedDestination[], curr: ViewedDestination) => {
            const existing = acc.find(item => item.to === curr.to && item.from === curr.from);
            if (!existing || curr.viewedAt > existing.viewedAt) {
              return [...acc.filter(item => !(item.to === curr.to && item.from === curr.from)), curr];
            }
            return acc;
          }, []);

          // Sort by recency
          unique.sort((a: ViewedDestination, b: ViewedDestination) => b.viewedAt - a.viewedAt);

          // Debug: Removed console.log to reduce console spam
          // console.log('📊 Recently viewed items loaded:', unique.length);

          setRecentlyViewed(unique);
        } catch (e) {
          console.error('Error parsing recently viewed:', e);
        }
      }
    };

    loadData();
  }, [mounted]);

  const clearAll = () => {
    localStorage.removeItem('recentlyViewed');
    setRecentlyViewed([]);
    setActiveFilter('all');
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'recent_searches_cleared', {
        items_count: recentlyViewed.length,
      });
    }
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

  // Format time ago nicely
  const formatTimeAgo = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Format dates compactly (e.g., "Jan 15" or "Jan 15 - Jan 22")
  const formatTripDates = (departure?: string, returnDate?: string): string | null => {
    if (!departure) {
      // Removed console.log to reduce console spam
      return null;
    }

    try {
      const depDate = new Date(departure);
      const depFormatted = depDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (returnDate) {
        const retDate = new Date(returnDate);
        const retFormatted = retDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        // Removed console.log to reduce console spam
        return `${depFormatted} - ${retFormatted}`;
      }

      // Removed console.log to reduce console spam
      return depFormatted;
    } catch (e) {
      console.error('❌ Error formatting dates:', e);
      return null;
    }
  };

  // Detect price drop
  const isPriceDrop = (item: ViewedDestination): boolean => {
    return item.originalPrice ? item.price < item.originalPrice : false;
  };

  // Calculate price drop percentage
  const getPriceDropPercentage = (item: ViewedDestination): number => {
    if (!item.originalPrice) return 0;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  };

  // Calculate savings amount
  const getSavingsAmount = (item: ViewedDestination): number => {
    if (!item.originalPrice) return 0;
    return item.originalPrice - item.price;
  };

  // Detect hot deal (20%+ discount)
  const isHotDeal = (item: ViewedDestination): boolean => {
    return getPriceDropPercentage(item) >= 20;
  };

  // Detect flash sale (price dropped in last hour)
  const isFlashSale = (item: ViewedDestination): boolean => {
    const hourAgo = Date.now() - 3600000;
    return isPriceDrop(item) && item.viewedAt > hourAgo;
  };

  // Filter items based on active filter
  const filteredItems = useMemo(() => {
    let items = recentlyViewed;

    switch (activeFilter) {
      case 'deals':
        items = items.filter(item => isHotDeal(item));
        break;
      case 'drops':
        items = items.filter(item => isPriceDrop(item));
        break;
      case 'under400':
        items = items.filter(item => item.price < 400);
        break;
      default:
        break;
    }

    return items.slice(0, maxItems);
  }, [recentlyViewed, activeFilter, maxItems]);

  // Calculate stats for info bar
  const stats = useMemo(() => {
    const priceDropsCount = recentlyViewed.filter(item => isPriceDrop(item)).length;
    const avgPrice = recentlyViewed.length > 0
      ? Math.round(recentlyViewed.reduce((sum, item) => sum + item.price, 0) / recentlyViewed.length)
      : 0;
    const bestDeal = recentlyViewed.length > 0
      ? recentlyViewed.reduce((min, item) => item.price < min.price ? item : min, recentlyViewed[0])
      : null;

    return { priceDropsCount, avgPrice, bestDeal };
  }, [recentlyViewed]);

  // Track click
  const handleDestinationClick = (item: ViewedDestination) => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'recent_search_click', {
        destination: item.city,
        price: item.price,
        time_since_view: Date.now() - item.viewedAt,
        has_price_drop: isPriceDrop(item),
        is_hot_deal: isHotDeal(item),
        filter_active: activeFilter,
      });
    }

    // Build proper URL parameters for flight search
    const params = new URLSearchParams({
      from: item.from || 'JFK',
      to: item.to,
      departure: getTomorrowDate(),
      return: getReturnDate(),
      adults: '1',
      children: '0',
      infants: '0',
      class: 'economy',
    });

    window.open(`/flights/results?${params.toString()}`, '_blank');
  };

  // Don't show section if no items AND component is mounted (to prevent hydration errors)
  if (recentlyViewed.length === 0 && mounted) {
    return null;
  }

  // During SSR or initial mount, show nothing without causing hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <section className="py-2 md:py-4 animate-fadeIn" style={{ maxWidth: '1600px', margin: '0 auto', padding: '8px 4px' }}>
      {/* Section Header - Mobile optimized, minimal padding */}
      <div className="flex items-center justify-between mb-2 md:mb-4 px-1">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="p-1 md:p-1.5 bg-gradient-to-br from-info-50 to-primary-50 rounded-md">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="text-base md:text-xl font-bold text-neutral-800 flex items-center gap-1.5 md:gap-2 leading-tight">
              {t.title}
              {recentlyViewed.length > maxItems && (
                <span className="text-[9px] md:text-xs font-normal text-neutral-500 bg-neutral-100 px-1.5 md:px-2 py-0.5 rounded-full">
                  {t.showing} {filteredItems.length} {t.of} {recentlyViewed.length}
                </span>
              )}
            </h2>
            <p className="text-[10px] md:text-xs text-neutral-500 mt-0.5 leading-tight">{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={clearAll}
          className="text-[10px] md:text-xs font-semibold text-neutral-500 hover:text-error-500 transition-colors flex items-center gap-1 px-2 py-1 hover:bg-error-50 rounded-md"
        >
          <X className="w-3 h-3" />
          <span className="hidden md:inline">{t.clearAll}</span>
          <span className="md:hidden">Clear</span>
        </button>
      </div>

      {/* Responsive Grid Layout - Edge-to-edge, minimal gap on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 md:gap-3 px-1">
        {filteredItems.map((item, index) => {
          const hasPriceDrop = isPriceDrop(item);
          const priceDropPercent = getPriceDropPercentage(item);
          const savingsAmount = getSavingsAmount(item);
          const hotDeal = isHotDeal(item);
          const flashSale = isFlashSale(item);

          return (
            <div
              key={item.id}
              onClick={() => handleDestinationClick(item)}
              className={`
                relative w-full rounded-xl overflow-hidden cursor-pointer group
                transform transition-all duration-300
                hover:scale-105 hover:shadow-2xl hover:z-10
                ${hotDeal ? 'ring-1 sm:ring-2 ring-orange-400 shadow-md shadow-orange-100' : hasPriceDrop ? 'ring-1 sm:ring-2 ring-green-400 shadow-md shadow-green-100' : 'border border-gray-200 hover:border-blue-400'}
              `}
              style={{
                height: '115px',
                animationDelay: `${index * 50}ms`,
                animation: mounted ? 'slideInUp 0.4s ease-out forwards' : 'none',
              }}
            >
              {/* Background Image with Parallax Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={`${item.city}, ${item.country}`}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  priority={index < 4}
                />
              </div>
              {/* Lighter gradient to show photos better */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"></div>

              {/* Top Section - Route & X Button in one line */}
              <div className="absolute top-1 sm:top-1.5 left-1 sm:left-1.5 right-1 sm:right-1.5 flex items-center justify-between">
                {/* Left Side - Route Display */}
                {item.from ? (
                  <div
                    className="flex items-center gap-0.5 sm:gap-1 text-white px-1.5 sm:px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-md"
                    style={{
                      textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)'
                    }}
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold">{item.from}</span>
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={3} />
                    <span className="text-[10px] sm:text-[11px] font-bold">{item.to}</span>
                    <span className="text-[10px] sm:text-[11px]">•</span>
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-300 drop-shadow-lg" strokeWidth={2.5} />
                    <span className="text-[9px] sm:text-[10px] font-semibold" suppressHydrationWarning>{formatTimeAgo(item.viewedAt)}</span>
                  </div>
                ) : (
                  <div></div>
                )}

                {/* Right Side - Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 bg-white/95 hover:bg-red-50 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 z-10"
                  aria-label="Remove item"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </div>

              {/* Trip Dates Row - Below route, above badges */}
              {(() => {
                const formattedDates = formatTripDates(item.departureDate, item.returnDate);
                return formattedDates ? (
                  <div className="absolute top-6 sm:top-7 left-1 sm:left-1.5">
                    <div
                      className="text-white/90 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 bg-black/20 backdrop-blur-sm rounded-md"
                      style={{
                        textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.7)'
                      }}
                      suppressHydrationWarning
                    >
                      {formattedDates}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Deal Badges Row - Below dates */}
              {(flashSale || hotDeal || hasPriceDrop) && (
                <div className="absolute top-10 sm:top-11 left-1 sm:left-1.5 flex gap-0.5 sm:gap-1">
                  {flashSale && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1 sm:px-1.5 py-0.5 rounded-sm sm:rounded-md flex items-center gap-0.5 shadow-md animate-pulse">
                      <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      <span className="text-[9px] sm:text-[10px] font-bold">{t.flashSale}</span>
                    </div>
                  )}
                  {hotDeal && !flashSale && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1 sm:px-1.5 py-0.5 rounded-sm sm:rounded-md flex items-center gap-0.5 shadow-md">
                      <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      <span className="text-[9px] sm:text-[10px] font-bold">{t.hotDeal}</span>
                    </div>
                  )}
                  {hasPriceDrop && !hotDeal && !flashSale && (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-1 sm:px-1.5 py-0.5 rounded-sm sm:rounded-md flex items-center gap-0.5 shadow-md">
                      <TrendingDown className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      <span className="text-[9px] sm:text-[10px] font-bold">-{priceDropPercent}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Content Section - Bottom only */}
              <div className="absolute inset-0 p-1.5 sm:p-2 pt-7 sm:pt-8 flex flex-col justify-end">
                {/* Destination - Optimized for mobile */}
                <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.7)' }}>
                  {item.city}, {getCountryCode(item.country)}
                </h3>

                {/* Price Section - Enhanced shadows for lighter background */}
                <div className="flex items-end justify-between mt-0.5 sm:mt-1">
                  <div className="flex flex-col">
                    {hasPriceDrop && item.originalPrice && (
                      <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5">
                        <span className="text-[9px] sm:text-[10px] text-white/70 line-through" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>${item.originalPrice.toFixed(0)}</span>
                        <div className="bg-green-500/90 px-1 py-0.5 rounded flex items-center gap-0.5">
                          <Tag className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                          <span className="text-[8px] sm:text-[9px] text-white font-bold">{t.save} ${savingsAmount.toFixed(0)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-[10px] sm:text-xs text-white/80" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.85)' }}>{t.from}</span>
                      <span className="text-base sm:text-lg font-bold text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.7)' }}>${item.price.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Book Now Button - ALWAYS VISIBLE, ultra compact on mobile */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDestinationClick(item);
                    }}
                    className="bg-gradient-to-r from-primary-500 to-indigo-600 text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm sm:rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-0.5 sm:gap-1"
                  >
                    {t.bookNow}
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                </div>
              </div>

              {/* Shimmer Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            </div>
          );
        })}
      </div>

      {/* COMPACT SEARCH INFO BAR - Sticky, Single Line */}
      <div className="sticky bottom-0 left-0 right-0 mt-2 sm:mt-2.5 md:mt-3 bg-gradient-to-r from-info-50/95 via-indigo-50/95 to-purple-50/95 backdrop-blur-sm border border-gray-200 rounded-md sm:rounded-lg shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
          {/* Left: Stats */}
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-medium text-gray-700 whitespace-nowrap">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
              <span className="font-bold text-gray-900">{recentlyViewed.length}</span>
              <span className="hidden sm:inline">{t.searchesCount}</span>
            </div>
            {stats.priceDropsCount > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-green-600" />
                  <span className="font-bold text-green-700">{stats.priceDropsCount}</span>
                  <span>{t.priceDropsCount}</span>
                </div>
              </>
            )}
            {stats.avgPrice > 0 && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">{t.avgPrice}:</span>
                  <span className="font-bold text-gray-900">${stats.avgPrice}</span>
                </div>
              </>
            )}
            {stats.bestDeal && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-gray-600">{t.bestDeal}:</span>
                  <span className="font-bold text-orange-700">{stats.bestDeal.city} ${stats.bestDeal.price.toFixed(0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Right: Quick Filters */}
          <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
            <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 hidden sm:block" />
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm sm:rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-sm'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setActiveFilter('deals')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm sm:rounded-md text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-0.5 sm:gap-1 ${
                activeFilter === 'deals'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{t.filterDeals}</span>
            </button>
            <button
              onClick={() => setActiveFilter('drops')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm sm:rounded-md text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-0.5 sm:gap-1 ${
                activeFilter === 'drops'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-sm'
              }`}
            >
              <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{t.filterDrops}</span>
            </button>
            <button
              onClick={() => setActiveFilter('under400')}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-sm sm:rounded-md text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-0.5 sm:gap-1 ${
                activeFilter === 'under400'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{t.filterUnder}</span>
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
