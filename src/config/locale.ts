/**
 * 🇺🇸 LOCALE CONFIGURATION - Fly2any USA Market
 * 
 * IMPORTANT: Fly2any operates in the US market.
 * All user-facing content MUST be in English.
 * 
 * This file enforces English-only content across the application.
 */

export const LOCALE_CONFIG = {
  // Application locale - ALWAYS English US
  locale: 'en-US',
  language: 'en',
  country: 'US',
  
  // Currency configuration
  currency: 'USD',
  currencySymbol: '$',
  
  // Date format preferences
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h', // 12-hour format with AM/PM
  
  // Content language enforcement
  enforceEnglish: true,
  
  // Common translations/content
  common: {
    // Navigation
    search: 'Search',
    results: 'Results',
    filters: 'Filters',
    loading: 'Loading',
    
    // Flight terms
    origin: 'Origin',
    destination: 'Destination',
    departure: 'Departure',
    arrival: 'Arrival',
    passengers: 'Passengers',
    passenger: 'Passenger',
    adults: 'Adults',
    children: 'Children',
    infants: 'Infants',
    
    // Trip types
    oneWay: 'One way',
    roundTrip: 'Round trip',
    multiCity: 'Multi city',
    
    // Classes
    economy: 'Economy',
    premiumEconomy: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
    
    // Actions
    select: 'Select',
    book: 'Book',
    compare: 'Compare',
    share: 'Share',
    favorite: 'Favorite',
    
    // Status messages
    searching: 'Searching available flights',
    analyzing: 'Analyzing best prices',
    optimizing: 'Optimizing results',
    completed: 'Search completed',
    
    // Time/Duration
    duration: 'Duration',
    layover: 'Layover',
    nonstop: 'Nonstop',
    stops: 'stops',
    
    // Common phrases
    pleaseWait: 'Please wait while we prepare the best results for you',
    openingResults: 'Opening results in new tab...',
    noResults: 'No flights found for your search criteria',
    tryAgain: 'Please try again with different dates or destinations'
  }
} as const;

/**
 * Get localized text - ensures all content is in English
 */
export const getText = (key: keyof typeof LOCALE_CONFIG.common): string => {
  return LOCALE_CONFIG.common[key] || key;
};

/**
 * Format currency for US market
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(LOCALE_CONFIG.locale, {
    style: 'currency',
    currency: LOCALE_CONFIG.currency
  }).format(amount);
};

/**
 * Format date for US market (MM/DD/YYYY)
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(LOCALE_CONFIG.locale).format(date);
};

/**
 * Validation: Ensure no Portuguese content in production
 */
export const validateEnglishContent = (content: string): boolean => {
  const portugueseWords = [
    'voos', 'passageiros', 'origem', 'destino', 'partida', 'chegada',
    'buscar', 'resultado', 'aguarde', 'concluída', 'abrindo'
  ];
  
  const lowerContent = content.toLowerCase();
  return !portugueseWords.some(word => lowerContent.includes(word));
};