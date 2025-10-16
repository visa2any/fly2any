export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // Total milliseconds remaining
}

export interface Deal {
  id: string;
  title: string;
  expiryDate: string | Date;
  fromAirport?: string;
  toDestination?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
}

/**
 * Calculate time remaining until a specific date
 */
export const getTimeRemaining = (
  targetDate: Date | string
): TimeRemaining => {
  try {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const now = new Date();
    const total = target.getTime() - now.getTime();

    if (total <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
      days,
      hours,
      minutes,
      seconds,
      total,
    };
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    };
  }
};

/**
 * Format countdown display
 */
export const formatCountdown = (
  timeRemaining: TimeRemaining,
  language: 'en' | 'pt' | 'es' = 'en',
  compact: boolean = false
): string => {
  const { days, hours, minutes, seconds, total } = timeRemaining;

  if (total <= 0) {
    const expired = {
      en: 'Expired',
      pt: 'Expirado',
      es: 'Expirado',
    };
    return expired[language];
  }

  const translations = {
    en: {
      day: 'd',
      hour: 'h',
      minute: 'm',
      second: 's',
      dayFull: ['day', 'days'],
      hourFull: ['hour', 'hours'],
      minuteFull: ['minute', 'minutes'],
      secondFull: ['second', 'seconds'],
    },
    pt: {
      day: 'd',
      hour: 'h',
      minute: 'm',
      second: 's',
      dayFull: ['dia', 'dias'],
      hourFull: ['hora', 'horas'],
      minuteFull: ['minuto', 'minutos'],
      secondFull: ['segundo', 'segundos'],
    },
    es: {
      day: 'd',
      hour: 'h',
      minute: 'm',
      second: 's',
      dayFull: ['dia', 'dias'],
      hourFull: ['hora', 'horas'],
      minuteFull: ['minuto', 'minutos'],
      secondFull: ['segundo', 'segundos'],
    },
  };

  const t = translations[language];

  if (compact) {
    // Compact format: "2d 5h 30m"
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}${t.day}`);
    if (hours > 0 || days > 0) parts.push(`${hours}${t.hour}`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}${t.minute}`);
    if (days === 0 && hours === 0) parts.push(`${seconds}${t.second}`);

    return parts.join(' ');
  } else {
    // Full format: "2 days 5 hours 30 minutes"
    const parts: string[] = [];

    if (days > 0) {
      const dayText = days === 1 ? t.dayFull[0] : t.dayFull[1];
      parts.push(`${days} ${dayText}`);
    }

    if (hours > 0) {
      const hourText = hours === 1 ? t.hourFull[0] : t.hourFull[1];
      parts.push(`${hours} ${hourText}`);
    }

    if (minutes > 0 && days === 0) {
      const minuteText = minutes === 1 ? t.minuteFull[0] : t.minuteFull[1];
      parts.push(`${minutes} ${minuteText}`);
    }

    if (seconds > 0 && days === 0 && hours === 0) {
      const secondText = seconds === 1 ? t.secondFull[0] : t.secondFull[1];
      parts.push(`${seconds} ${secondText}`);
    }

    return parts.join(' ');
  }
};

/**
 * Check if a deal is still active (not expired)
 */
export const isDealActive = (expiryDate: Date | string): boolean => {
  try {
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    return expiry.getTime() > now.getTime();
  } catch (error) {
    console.error('Error checking deal active status:', error);
    return false;
  }
};

/**
 * Get urgency level based on time remaining
 */
export const getUrgencyLevel = (
  timeRemaining: TimeRemaining
): 'critical' | 'high' | 'medium' | 'low' => {
  const { total } = timeRemaining;

  if (total <= 0) return 'critical';

  const hours = total / (1000 * 60 * 60);

  if (hours <= 6) return 'critical'; // Less than 6 hours
  if (hours <= 24) return 'high'; // Less than 24 hours
  if (hours <= 72) return 'medium'; // Less than 3 days
  return 'low'; // More than 3 days
};

/**
 * Get urgency color for UI
 */
export const getUrgencyColor = (
  urgency: 'critical' | 'high' | 'medium' | 'low'
): string => {
  const colors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return colors[urgency];
};

/**
 * Get urgency background color for UI
 */
export const getUrgencyBgColor = (
  urgency: 'critical' | 'high' | 'medium' | 'low'
): string => {
  const colors = {
    critical: 'bg-red-100 border-red-300',
    high: 'bg-orange-100 border-orange-300',
    medium: 'bg-yellow-100 border-yellow-300',
    low: 'bg-green-100 border-green-300',
  };

  return colors[urgency];
};

/**
 * Format deal expiry message
 */
export const formatExpiryMessage = (
  expiryDate: Date | string,
  language: 'en' | 'pt' | 'es' = 'en'
): string => {
  const timeRemaining = getTimeRemaining(expiryDate);
  const urgency = getUrgencyLevel(timeRemaining);

  const messages = {
    en: {
      critical: 'Expires soon!',
      high: 'Ending today!',
      medium: 'Few days left',
      low: 'Limited time offer',
      expired: 'Deal expired',
    },
    pt: {
      critical: 'Expira em breve!',
      high: 'Termina hoje!',
      medium: 'Poucos dias restantes',
      low: 'Oferta por tempo limitado',
      expired: 'Oferta expirada',
    },
    es: {
      critical: 'Expira pronto!',
      high: 'Termina hoy!',
      medium: 'Pocos dias restantes',
      low: 'Oferta por tiempo limitado',
      expired: 'Oferta expirada',
    },
  };

  if (timeRemaining.total <= 0) {
    return messages[language].expired;
  }

  return messages[language][urgency];
};

/**
 * Sort deals by urgency (most urgent first)
 */
export const sortDealsByUrgency = (deals: Deal[]): Deal[] => {
  return [...deals].sort((a, b) => {
    const timeA = getTimeRemaining(a.expiryDate);
    const timeB = getTimeRemaining(b.expiryDate);

    // Expired deals go to the end
    if (timeA.total <= 0 && timeB.total > 0) return 1;
    if (timeB.total <= 0 && timeA.total > 0) return -1;

    // Sort by time remaining (least time first)
    return timeA.total - timeB.total;
  });
};

/**
 * Filter active deals only
 */
export const filterActiveDeals = (deals: Deal[]): Deal[] => {
  return deals.filter((deal) => isDealActive(deal.expiryDate));
};

/**
 * Get deals expiring within X hours
 */
export const getExpiringDeals = (
  deals: Deal[],
  withinHours: number = 24
): Deal[] => {
  const maxTime = withinHours * 60 * 60 * 1000; // Convert to milliseconds

  return deals.filter((deal) => {
    const timeRemaining = getTimeRemaining(deal.expiryDate);
    return timeRemaining.total > 0 && timeRemaining.total <= maxTime;
  });
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (
  originalPrice: number,
  currentPrice: number
): number => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return 0;
  }

  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Format price with currency
 */
export const formatPrice = (
  price: number,
  currency: string = 'USD',
  language: 'en' | 'pt' | 'es' = 'en'
): string => {
  const locales = {
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
  };

  return new Intl.NumberFormat(locales[language], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
