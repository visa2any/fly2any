'use client';

import { useState, useMemo } from 'react';
import { typography, spacing, dimensions } from '@/lib/design-system';

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface DatePrice {
  date: string; // ISO format: YYYY-MM-DD
  price: number;
}

export interface FlexibleDatesProps {
  currentDate: string; // ISO format: YYYY-MM-DD
  onDateSelect: (date: string) => void;
  prices: DatePrice[];
  currency?: string;
  lang?: 'en' | 'pt' | 'es';
  className?: string;
  daysRange?: number; // Default: 3 (shows ±3 days = 7 total)
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    title: 'Flexible Dates - Find Cheaper Flights',
    subtitle: 'Compare prices for nearby dates',
    cheapest: 'Best Deal',
    selected: 'Selected',
    save: 'Save',
    noData: 'Price unavailable',
    selectDate: 'Click to select',
    daysOfWeek: {
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      full: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    months: {
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
  },
  pt: {
    title: 'Datas Flexíveis - Encontre Voos Mais Baratos',
    subtitle: 'Compare preços para datas próximas',
    cheapest: 'Melhor Oferta',
    selected: 'Selecionado',
    save: 'Economize',
    noData: 'Preço indisponível',
    selectDate: 'Clique para selecionar',
    daysOfWeek: {
      short: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      full: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    },
    months: {
      short: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    },
  },
  es: {
    title: 'Fechas Flexibles - Encuentra Vuelos Más Baratos',
    subtitle: 'Compara precios para fechas cercanas',
    cheapest: 'Mejor Oferta',
    selected: 'Seleccionado',
    save: 'Ahorra',
    noData: 'Precio no disponible',
    selectDate: 'Haz clic para seleccionar',
    daysOfWeek: {
      short: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      full: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    },
    months: {
      short: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    },
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const formatDate = (dateStr: string, lang: 'en' | 'pt' | 'es'): { dayOfWeek: string; day: string; month: string } => {
  const date = new Date(dateStr + 'T00:00:00'); // Force local timezone
  const t = translations[lang];

  return {
    dayOfWeek: t.daysOfWeek.short[date.getDay()],
    day: date.getDate().toString(),
    month: t.months.short[date.getMonth()],
  };
};

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const calculateSavings = (currentPrice: number, comparePrice: number): number => {
  return currentPrice - comparePrice;
};

const formatPrice = (price: number, currency: string): string => {
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
  return `${currencySymbol}${price.toFixed(0)}`;
};

// ===========================
// DATE CARD COMPONENT
// ===========================

interface DateCardProps {
  date: string;
  price: number | null;
  isSelected: boolean;
  isCheapest: boolean;
  savings: number;
  currency: string;
  lang: 'en' | 'pt' | 'es';
  onClick: () => void;
}

const DateCard: React.FC<DateCardProps> = ({
  date,
  price,
  isSelected,
  isCheapest,
  savings,
  currency,
  lang,
  onClick,
}) => {
  const t = translations[lang];
  const { dayOfWeek, day, month } = formatDate(date, lang);
  const [isHovered, setIsHovered] = useState(false);

  // Determine card styling based on state
  const getCardStyles = () => {
    if (isSelected) {
      return {
        container: 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-700 shadow-primary scale-105 z-10',
        text: 'text-white',
        priceText: 'text-white',
        badge: 'bg-white/20 text-white',
      };
    }

    if (isCheapest) {
      return {
        container: 'bg-gradient-to-br from-success/10 to-success/5 border-success/40 hover:border-success hover:shadow-lg',
        text: 'text-gray-900',
        priceText: 'text-success',
        badge: 'bg-success/20 text-success',
      };
    }

    return {
      container: 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-md',
      text: 'text-gray-900',
      priceText: 'text-gray-900',
      badge: 'bg-primary-50 text-primary-600',
    };
  };

  const styles = getCardStyles();

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={price === null}
      className={`
        relative
        flex flex-col
        min-w-[100px] sm:min-w-[115px]
        rounded-xl
        border-2
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${styles.container}
        ${isHovered && !isSelected ? 'transform -translate-y-1' : ''}
        ${isSelected ? 'ring-4 ring-primary-200' : ''}
      `}
      style={{ padding: spacing.md }}
    >
      {/* Cheapest Badge */}
      {isCheapest && !isSelected && (
        <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-success via-success/90 to-success px-2 py-0.5 rounded-full shadow-lg">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold" style={{ fontSize: typography.card.meta.size }}>{t.cheapest}</span>
              <span className="text-white" style={{ fontSize: typography.card.body.size }}>🔥</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white px-2 py-0.5 rounded-full shadow-lg">
            <span className="text-primary-600 font-bold" style={{ fontSize: typography.card.meta.size }}>{t.selected}</span>
          </div>
        </div>
      )}

      {/* Day of Week */}
      <div className={`font-semibold mb-0.5 uppercase tracking-wide ${styles.text} ${isSelected ? 'opacity-90' : 'opacity-60'}`} style={{ fontSize: typography.card.meta.size }}>
        {dayOfWeek}
      </div>

      {/* Date */}
      <div className={`font-bold mb-0.5 ${styles.text}`} style={{ fontSize: typography.card.price.size }}>
        {day}
      </div>

      {/* Month */}
      <div className={`font-medium mb-2 ${styles.text} ${isSelected ? 'opacity-90' : 'opacity-70'}`} style={{ fontSize: typography.card.meta.size }}>
        {month}
      </div>

      {/* Price */}
      {price !== null ? (
        <>
          <div className={`font-bold ${styles.priceText}`} style={{ fontSize: typography.card.title.size }}>
            {formatPrice(price, currency)}
          </div>

          {/* Savings Badge */}
          {savings > 0 && !isSelected && (
            <div className={`mt-1.5 px-1.5 py-0.5 rounded-full font-bold ${styles.badge}`} style={{ fontSize: typography.card.meta.size }}>
              {t.save} {formatPrice(savings, currency)}
            </div>
          )}

          {/* Best Price Indicator */}
          {isCheapest && !isSelected && (
            <div className="mt-1.5 font-semibold text-success flex items-center justify-center gap-0.5" style={{ fontSize: typography.card.meta.size }}>
              <span>↓</span>
              <span>Lowest</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-400 font-medium" style={{ fontSize: typography.card.meta.size }}>
          {t.noData}
        </div>
      )}

      {/* Hover Effect Overlay */}
      {isHovered && !isSelected && price !== null && (
        <div className="absolute inset-0 bg-primary-500/5 rounded-xl sm:rounded-2xl pointer-events-none" />
      )}

      {/* Pulse Animation for Cheapest */}
      {isCheapest && !isSelected && (
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-success animate-pulse opacity-50 pointer-events-none" />
      )}
    </button>
  );
};

// ===========================
// MAIN COMPONENT
// ===========================

export const FlexibleDates: React.FC<FlexibleDatesProps> = ({
  currentDate,
  onDateSelect,
  prices,
  currency = 'USD',
  lang = 'en',
  className = '',
  daysRange = 3,
}) => {
  const t = translations[lang];

  // Generate date range (±daysRange days)
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    for (let i = -daysRange; i <= daysRange; i++) {
      dates.push(addDays(currentDate, i));
    }
    return dates;
  }, [currentDate, daysRange]);

  // Create price map for quick lookup
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    prices.forEach(({ date, price }) => {
      map.set(date, price);
    });
    return map;
  }, [prices]);

  // Find cheapest date
  const { cheapestDate, cheapestPrice } = useMemo(() => {
    let minPrice = Infinity;
    let minDate = '';

    dateRange.forEach((date) => {
      const price = priceMap.get(date);
      if (price !== undefined && price < minPrice) {
        minPrice = price;
        minDate = date;
      }
    });

    return {
      cheapestDate: minDate,
      cheapestPrice: minPrice === Infinity ? null : minPrice,
    };
  }, [dateRange, priceMap]);

  // Get current selected date price for savings calculation
  const selectedPrice = priceMap.get(currentDate) || 0;

  // Handle date selection
  const handleDateSelect = (date: string) => {
    if (date !== currentDate) {
      onDateSelect(date);
    }
  };

  return (
    <div
      className={`
        relative
        bg-gradient-to-br from-white via-gray-50/50 to-white
        rounded-2xl
        border-2 border-gray-200/80
        shadow-xl
        overflow-hidden
        ${className}
      `}
      style={{ padding: dimensions.card.padding }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-success/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-primary" style={{ fontSize: typography.card.title.size }}>
              📅
            </div>
            <div>
              <h3 className="font-bold text-gray-900" style={{ fontSize: typography.card.title.size }}>
                {t.title}
              </h3>
              <p className="text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Dates Grid - Horizontal Scroll on Mobile */}
        <div className="relative">
          {/* Gradient Fade on Edges (Mobile) */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none sm:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none sm:hidden" />

          {/* Scrollable Container */}
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex min-w-min sm:grid sm:grid-cols-7 sm:min-w-full" style={{ gap: spacing.sm }}>
              {dateRange.map((date) => {
                const price = priceMap.get(date) || null;
                const isSelected = date === currentDate;
                const isCheapest = date === cheapestDate && cheapestPrice !== null;
                const savings = price && selectedPrice ? calculateSavings(selectedPrice, price) : 0;

                return (
                  <DateCard
                    key={date}
                    date={date}
                    price={price}
                    isSelected={isSelected}
                    isCheapest={isCheapest}
                    savings={savings}
                    currency={currency}
                    lang={lang}
                    onClick={() => handleDateSelect(date)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        {cheapestPrice !== null && selectedPrice > 0 && cheapestDate !== currentDate && (
          <div className="mt-3 bg-gradient-to-r from-success/10 via-success/5 to-success/10 border-2 border-success/30 rounded-xl" style={{ padding: spacing.md }}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white" style={{ fontSize: typography.card.title.size }}>
                  💰
                </div>
                <div>
                  <div className="font-bold text-success" style={{ fontSize: typography.card.body.size }}>
                    {t.save} {formatPrice(selectedPrice - cheapestPrice, currency)} on {formatDate(cheapestDate, lang).month} {formatDate(cheapestDate, lang).day}
                  </div>
                  <div className="text-gray-600" style={{ fontSize: typography.card.meta.size }}>
                    Switch to the cheapest date and save more!
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDateSelect(cheapestDate)}
                className="px-3 py-1.5 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ fontSize: typography.card.body.size }}
              >
                Select Best Deal
              </button>
            </div>
          </div>
        )}

        {/* Mobile Scroll Hint */}
        <div className="mt-2 text-center sm:hidden">
          <p className="text-gray-500 flex items-center justify-center gap-1" style={{ fontSize: typography.card.meta.size }}>
            <span>←</span>
            <span>Swipe to see all dates</span>
            <span>→</span>
          </p>
        </div>
      </div>

      {/* Bottom Accent Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-success to-primary-400" />
    </div>
  );
};

export default FlexibleDates;
