'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

type LocationType = 'airport' | 'city' | 'resort';
type Mode = 'airports-only' | 'cities-only' | 'both' | 'any';
type Popularity = 'low' | 'medium' | 'high' | 'ultra';

interface Location {
  id: string;
  type: LocationType;
  code: string;
  name: string;
  displayName: string;
  city: string;
  country: string;
  emoji: string;

  // Visual
  gradientColors: [string, string];

  // Pricing Context
  averageFlightPrice?: number;
  averageHotelPrice?: number;
  dealAvailable?: boolean;
  dealSavings?: number;

  // Social Proof
  trendingScore: number;
  searchCount24h?: number;
  popularity: Popularity;

  // Helpful Info
  weatherNow?: { temp: number; condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' };
  bestTimeToVisit?: string;
  timezone?: string;
  flightDuration?: string;

  // Seasonal
  seasonalTag?: string;

  // Trust
  verified: boolean;
  topDestination: boolean;

  // Relationships
  nearbyAirports?: string[];
  parentCity?: string;

  // Tags
  tags: string[];
}

interface Section {
  id: string;
  title: string;
  icon: string;
  locations: Location[];
}

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, location?: Location) => void;

  // Filtering
  mode?: Mode;
  allowedTypes?: LocationType[];

  // UI Options
  icon?: React.ReactNode;
  showExplore?: boolean;
  showPricing?: boolean;
  showWeather?: boolean;
  showSocialProof?: boolean;
  showRecentSearches?: boolean;
  showNearbyAirports?: boolean;
  groupBySections?: boolean;
  maxResults?: number;
}

// ============================================
// COMPREHENSIVE LOCATION DATABASE
// ============================================

const LOCATIONS: Location[] = [
  // === MAJOR US AIRPORTS ===
  {
    id: 'jfk-airport',
    type: 'airport',
    code: 'JFK',
    name: 'John F. Kennedy Intl',
    displayName: 'JFK - John F. Kennedy Intl',
    city: 'New York',
    country: 'USA',
    emoji: '✈️',
    gradientColors: ['#667eea', '#764ba2'],
    averageFlightPrice: 189,
    trendingScore: 85,
    searchCount24h: 234,
    popularity: 'ultra',
    weatherNow: { temp: 55, condition: 'cloudy' },
    timezone: 'GMT-5',
    flightDuration: '2h 30min',
    verified: true,
    topDestination: true,
    parentCity: 'New York City',
    tags: ['business', 'hub', 'international']
  },
  {
    id: 'lax-airport',
    type: 'airport',
    code: 'LAX',
    name: 'Los Angeles Intl',
    displayName: 'LAX - Los Angeles Intl',
    city: 'Los Angeles',
    country: 'USA',
    emoji: '✈️',
    gradientColors: ['#f093fb', '#f5576c'],
    averageFlightPrice: 159,
    trendingScore: 82,
    searchCount24h: 312,
    popularity: 'ultra',
    weatherNow: { temp: 72, condition: 'sunny' },
    timezone: 'GMT-8',
    verified: true,
    topDestination: true,
    parentCity: 'Los Angeles',
    tags: ['entertainment', 'beach', 'hub']
  },
  {
    id: 'mia-airport',
    type: 'airport',
    code: 'MIA',
    name: 'Miami Intl',
    displayName: 'MIA - Miami Intl',
    city: 'Miami',
    country: 'USA',
    emoji: '✈️',
    gradientColors: ['#4facfe', '#00f2fe'],
    averageFlightPrice: 149,
    trendingScore: 78,
    popularity: 'high',
    weatherNow: { temp: 82, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Miami',
    tags: ['beach', 'tropical', 'cruise']
  },
  {
    id: 'ord-airport',
    type: 'airport',
    code: 'ORD',
    name: "O'Hare Intl",
    displayName: "ORD - O'Hare Intl",
    city: 'Chicago',
    country: 'USA',
    emoji: '✈️',
    gradientColors: ['#fa709a', '#fee140'],
    averageFlightPrice: 139,
    trendingScore: 75,
    popularity: 'high',
    weatherNow: { temp: 45, condition: 'cloudy' },
    verified: true,
    topDestination: true,
    parentCity: 'Chicago',
    tags: ['business', 'hub', 'midwest']
  },
  {
    id: 'sfo-airport',
    type: 'airport',
    code: 'SFO',
    name: 'San Francisco Intl',
    displayName: 'SFO - San Francisco Intl',
    city: 'San Francisco',
    country: 'USA',
    emoji: '✈️',
    gradientColors: ['#30cfd0', '#330867'],
    averageFlightPrice: 169,
    trendingScore: 80,
    popularity: 'ultra',
    weatherNow: { temp: 62, condition: 'cloudy' },
    verified: true,
    topDestination: true,
    parentCity: 'San Francisco',
    tags: ['tech', 'culture', 'food']
  },
  {
    id: 'lga-airport',
    type: 'airport',
    code: 'LGA',
    name: 'LaGuardia Airport',
    displayName: 'LGA - LaGuardia Airport',
    city: 'New York',
    country: 'USA',
    emoji: '✈️',
    gradientColors: ['#a8edea', '#fed6e3'],
    averageFlightPrice: 179,
    trendingScore: 70,
    popularity: 'high',
    verified: true,
    topDestination: false,
    parentCity: 'New York City',
    tags: ['domestic', 'convenient']
  },
  {
    id: 'ewr-airport',
    type: 'airport',
    code: 'EWR',
    name: 'Newark Liberty Intl',
    displayName: 'EWR - Newark Liberty Intl',
    city: 'Newark',
    country: 'USA',
    emoji: '✈️',
    gradientColors: ['#ff9a9e', '#fecfef'],
    averageFlightPrice: 185,
    trendingScore: 68,
    popularity: 'high',
    verified: true,
    topDestination: false,
    parentCity: 'New York City',
    tags: ['international', 'hub']
  },

  // === MAJOR INTERNATIONAL AIRPORTS ===
  {
    id: 'cdg-airport',
    type: 'airport',
    code: 'CDG',
    name: 'Charles de Gaulle',
    displayName: 'CDG - Charles de Gaulle',
    city: 'Paris',
    country: 'France',
    emoji: '✈️',
    gradientColors: ['#667eea', '#764ba2'],
    averageFlightPrice: 289,
    trendingScore: 92,
    searchCount24h: 456,
    popularity: 'ultra',
    weatherNow: { temp: 68, condition: 'sunny' },
    bestTimeToVisit: 'Spring (Apr-Jun)',
    seasonalTag: '🌸 Spring in Paris',
    verified: true,
    topDestination: true,
    parentCity: 'Paris',
    tags: ['romantic', 'culture', 'art']
  },
  {
    id: 'lhr-airport',
    type: 'airport',
    code: 'LHR',
    name: 'London Heathrow',
    displayName: 'LHR - London Heathrow',
    city: 'London',
    country: 'UK',
    emoji: '✈️',
    gradientColors: ['#434343', '#000000'],
    averageFlightPrice: 319,
    trendingScore: 88,
    popularity: 'ultra',
    weatherNow: { temp: 59, condition: 'cloudy' },
    verified: true,
    topDestination: true,
    parentCity: 'London',
    tags: ['history', 'culture', 'business']
  },
  {
    id: 'dxb-airport',
    type: 'airport',
    code: 'DXB',
    name: 'Dubai Intl',
    displayName: 'DXB - Dubai Intl',
    city: 'Dubai',
    country: 'UAE',
    emoji: '✈️',
    gradientColors: ['#f12711', '#f5af19'],
    averageFlightPrice: 499,
    trendingScore: 86,
    dealAvailable: true,
    dealSavings: 120,
    popularity: 'ultra',
    weatherNow: { temp: 95, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Dubai',
    tags: ['luxury', 'shopping', 'modern']
  },
  {
    id: 'nrt-airport',
    type: 'airport',
    code: 'NRT',
    name: 'Narita Intl',
    displayName: 'NRT - Narita Intl',
    city: 'Tokyo',
    country: 'Japan',
    emoji: '✈️',
    gradientColors: ['#ee0979', '#ff6a00'],
    averageFlightPrice: 599,
    trendingScore: 90,
    popularity: 'ultra',
    weatherNow: { temp: 61, condition: 'cloudy' },
    seasonalTag: '🌸 Cherry Blossom Season',
    bestTimeToVisit: 'Spring (Mar-May)',
    verified: true,
    topDestination: true,
    parentCity: 'Tokyo',
    tags: ['culture', 'technology', 'food']
  },
  {
    id: 'bcn-airport',
    type: 'airport',
    code: 'BCN',
    name: 'Barcelona-El Prat',
    displayName: 'BCN - Barcelona-El Prat',
    city: 'Barcelona',
    country: 'Spain',
    emoji: '✈️',
    gradientColors: ['#fc4a1a', '#f7b733'],
    averageFlightPrice: 249,
    trendingScore: 84,
    popularity: 'ultra',
    weatherNow: { temp: 75, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Barcelona',
    tags: ['beach', 'architecture', 'culture']
  },

  // === CENTRAL AMERICA AIRPORTS ===
  {
    id: 'gua-airport',
    type: 'airport',
    code: 'GUA',
    name: 'La Aurora Intl',
    displayName: 'GUA - La Aurora Intl',
    city: 'Guatemala City',
    country: 'Guatemala',
    emoji: '✈️',
    gradientColors: ['#1e3a8a', '#3b82f6'],
    averageFlightPrice: 299,
    trendingScore: 72,
    popularity: 'medium',
    weatherNow: { temp: 75, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Guatemala City',
    tags: ['culture', 'colonial', 'adventure']
  },
  {
    id: 'bze-airport',
    type: 'airport',
    code: 'BZE',
    name: 'Philip S.W. Goldson Intl',
    displayName: 'BZE - Philip S.W. Goldson Intl',
    city: 'Belize City',
    country: 'Belize',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#06b6d4'],
    averageFlightPrice: 349,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 82, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Belize City',
    tags: ['diving', 'reef', 'beach']
  },
  {
    id: 'sap-airport',
    type: 'airport',
    code: 'SAP',
    name: 'Ramón Villeda Morales Intl',
    displayName: 'SAP - Ramón Villeda Morales Intl',
    city: 'San Pedro Sula',
    country: 'Honduras',
    emoji: '✈️',
    gradientColors: ['#0891b2', '#0e7490'],
    averageFlightPrice: 289,
    trendingScore: 65,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'San Pedro Sula',
    tags: ['business', 'gateway', 'tropical']
  },
  {
    id: 'tgu-airport',
    type: 'airport',
    code: 'TGU',
    name: 'Toncontín Intl',
    displayName: 'TGU - Toncontín Intl',
    city: 'Tegucigalpa',
    country: 'Honduras',
    emoji: '✈️',
    gradientColors: ['#0284c7', '#0369a1'],
    averageFlightPrice: 295,
    trendingScore: 62,
    popularity: 'medium',
    weatherNow: { temp: 78, condition: 'cloudy' },
    verified: true,
    topDestination: false,
    parentCity: 'Tegucigalpa',
    tags: ['capital', 'mountains', 'culture']
  },
  {
    id: 'sal-airport',
    type: 'airport',
    code: 'SAL',
    name: 'Monseñor Óscar Arnulfo Romero Intl',
    displayName: 'SAL - Monseñor Óscar Arnulfo Romero Intl',
    city: 'San Salvador',
    country: 'El Salvador',
    emoji: '✈️',
    gradientColors: ['#0284c7', '#38bdf8'],
    averageFlightPrice: 279,
    trendingScore: 70,
    popularity: 'medium',
    weatherNow: { temp: 84, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'San Salvador',
    tags: ['volcanoes', 'surf', 'culture']
  },
  {
    id: 'mga-airport',
    type: 'airport',
    code: 'MGA',
    name: 'Augusto C. Sandino Intl',
    displayName: 'MGA - Augusto C. Sandino Intl',
    city: 'Managua',
    country: 'Nicaragua',
    emoji: '✈️',
    gradientColors: ['#0369a1', '#075985'],
    averageFlightPrice: 285,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 88, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Managua',
    tags: ['lakes', 'volcanoes', 'colonial']
  },
  {
    id: 'sjo-airport',
    type: 'airport',
    code: 'SJO',
    name: 'Juan Santamaría Intl',
    displayName: 'SJO - Juan Santamaría Intl',
    city: 'San José',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#10b981', '#059669'],
    averageFlightPrice: 319,
    trendingScore: 82,
    dealAvailable: true,
    dealSavings: 90,
    popularity: 'high',
    weatherNow: { temp: 79, condition: 'sunny' },
    bestTimeToVisit: 'Dry Season (Dec-Apr)',
    verified: true,
    topDestination: true,
    parentCity: 'San José',
    tags: ['eco-tourism', 'rainforest', 'adventure']
  },
  {
    id: 'lir-airport',
    type: 'airport',
    code: 'LIR',
    name: 'Daniel Oduber Quirós Intl',
    displayName: 'LIR - Daniel Oduber Quirós Intl',
    city: 'Liberia',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#14b8a6', '#0d9488'],
    averageFlightPrice: 329,
    trendingScore: 78,
    dealAvailable: true,
    dealSavings: 75,
    popularity: 'high',
    weatherNow: { temp: 92, condition: 'sunny' },
    bestTimeToVisit: 'Dry Season (Dec-Apr)',
    verified: true,
    topDestination: true,
    parentCity: 'Liberia',
    tags: ['beach', 'surf', 'wildlife']
  },
  {
    id: 'pty-airport',
    type: 'airport',
    code: 'PTY',
    name: 'Tocumen Intl',
    displayName: 'PTY - Tocumen Intl',
    city: 'Panama City',
    country: 'Panama',
    emoji: '✈️',
    gradientColors: ['#3b82f6', '#1e40af'],
    averageFlightPrice: 269,
    trendingScore: 76,
    popularity: 'high',
    weatherNow: { temp: 85, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Panama City',
    tags: ['canal', 'business', 'cosmopolitan']
  },
  {
    id: 'rtn-airport',
    type: 'airport',
    code: 'RTN',
    name: 'Juan Manuel Gálvez Intl',
    displayName: 'RTN - Juan Manuel Gálvez Intl',
    city: 'Roatán',
    country: 'Honduras',
    emoji: '✈️',
    gradientColors: ['#06b6d4', '#0891b2'],
    averageFlightPrice: 365,
    trendingScore: 80,
    dealAvailable: true,
    dealSavings: 110,
    popularity: 'high',
    weatherNow: { temp: 84, condition: 'sunny' },
    bestTimeToVisit: 'Year-round (Diving paradise)',
    verified: true,
    topDestination: true,
    parentCity: 'Roatán',
    tags: ['diving', 'island', 'caribbean']
  },

  // === MORE GUATEMALA AIRPORTS ===
  {
    id: 'frs-airport',
    type: 'airport',
    code: 'FRS',
    name: 'Mundo Maya Intl',
    displayName: 'FRS - Mundo Maya Intl',
    city: 'Flores',
    country: 'Guatemala',
    emoji: '✈️',
    gradientColors: ['#1e3a8a', '#3b82f6'],
    averageFlightPrice: 320,
    trendingScore: 74,
    popularity: 'high',
    weatherNow: { temp: 82, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Flores',
    tags: ['tikal', 'ruins', 'jungle', 'adventure']
  },
  {
    id: 'pbr-airport',
    type: 'airport',
    code: 'PBR',
    name: 'Puerto Barrios Airport',
    displayName: 'PBR - Puerto Barrios Airport',
    city: 'Puerto Barrios',
    country: 'Guatemala',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#1e3a8a'],
    averageFlightPrice: 310,
    trendingScore: 62,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Puerto Barrios',
    tags: ['caribbean', 'coast', 'livingston', 'gateway']
  },

  // === MORE BELIZE AIRPORTS ===
  {
    id: 'tza-airport',
    type: 'airport',
    code: 'TZA',
    name: 'Sir Barry Bowen Municipal',
    displayName: 'TZA - Sir Barry Bowen Municipal',
    city: 'Belize City',
    country: 'Belize',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#06b6d4'],
    averageFlightPrice: 340,
    trendingScore: 64,
    popularity: 'medium',
    weatherNow: { temp: 83, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Belize City',
    tags: ['domestic', 'municipal', 'convenient']
  },
  {
    id: 'spr-airport',
    type: 'airport',
    code: 'SPR',
    name: 'San Pedro Airport',
    displayName: 'SPR - San Pedro Airport',
    city: 'San Pedro',
    country: 'Belize',
    emoji: '✈️',
    gradientColors: ['#14b8a6', '#06b6d4'],
    averageFlightPrice: 370,
    trendingScore: 80,
    dealAvailable: true,
    dealSavings: 90,
    popularity: 'high',
    weatherNow: { temp: 85, condition: 'sunny' },
    bestTimeToVisit: 'Feb-May (Perfect diving)',
    verified: true,
    topDestination: true,
    parentCity: 'San Pedro',
    tags: ['ambergris-caye', 'diving', 'island', 'beach']
  },
  {
    id: 'cuk-airport',
    type: 'airport',
    code: 'CUK',
    name: 'Caye Caulker Airport',
    displayName: 'CUK - Caye Caulker Airport',
    city: 'Caye Caulker',
    country: 'Belize',
    emoji: '✈️',
    gradientColors: ['#06b6d4', '#14b8a6'],
    averageFlightPrice: 365,
    trendingScore: 76,
    popularity: 'high',
    weatherNow: { temp: 84, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Caye Caulker',
    tags: ['island', 'backpacker', 'snorkeling', 'relaxed']
  },
  {
    id: 'plj-airport',
    type: 'airport',
    code: 'PLJ',
    name: 'Placencia Airport',
    displayName: 'PLJ - Placencia Airport',
    city: 'Placencia',
    country: 'Belize',
    emoji: '✈️',
    gradientColors: ['#0891b2', '#14b8a6'],
    averageFlightPrice: 360,
    trendingScore: 72,
    popularity: 'medium',
    weatherNow: { temp: 84, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Placencia',
    tags: ['beach', 'peninsula', 'resort', 'diving']
  },
  {
    id: 'dga-airport',
    type: 'airport',
    code: 'DGA',
    name: 'Dangriga Airport',
    displayName: 'DGA - Dangriga Airport',
    city: 'Dangriga',
    country: 'Belize',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#0891b2'],
    averageFlightPrice: 355,
    trendingScore: 64,
    popularity: 'medium',
    weatherNow: { temp: 83, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Dangriga',
    tags: ['garifuna', 'culture', 'gateway', 'coast']
  },
  {
    id: 'pnd-airport',
    type: 'airport',
    code: 'PND',
    name: 'Punta Gorda Airport',
    displayName: 'PND - Punta Gorda Airport',
    city: 'Punta Gorda',
    country: 'Belize',
    emoji: '✈️',
    gradientColors: ['#06b6d4', '#0891b2'],
    averageFlightPrice: 358,
    trendingScore: 60,
    popularity: 'medium',
    weatherNow: { temp: 85, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Punta Gorda',
    tags: ['southern', 'jungle', 'mayan', 'remote']
  },

  // === MORE HONDURAS AIRPORTS ===
  {
    id: 'xpl-airport',
    type: 'airport',
    code: 'XPL',
    name: 'Palmerola Intl',
    displayName: 'XPL - Palmerola Intl',
    city: 'Comayagua',
    country: 'Honduras',
    emoji: '✈️',
    gradientColors: ['#0284c7', '#0369a1'],
    averageFlightPrice: 290,
    trendingScore: 70,
    popularity: 'high',
    weatherNow: { temp: 80, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Comayagua',
    tags: ['new', 'modern', 'tegucigalpa', 'international']
  },
  {
    id: 'lce-airport',
    type: 'airport',
    code: 'LCE',
    name: 'Goloson Intl',
    displayName: 'LCE - Goloson Intl',
    city: 'La Ceiba',
    country: 'Honduras',
    emoji: '✈️',
    gradientColors: ['#0891b2', '#06b6d4'],
    averageFlightPrice: 295,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'La Ceiba',
    tags: ['coast', 'gateway', 'pico-bonito', 'caribbean']
  },
  {
    id: 'gja-airport',
    type: 'airport',
    code: 'GJA',
    name: 'Guanaja Airport',
    displayName: 'GJA - Guanaja Airport',
    city: 'Guanaja',
    country: 'Honduras',
    emoji: '✈️',
    gradientColors: ['#14b8a6', '#0891b2'],
    averageFlightPrice: 380,
    trendingScore: 72,
    popularity: 'medium',
    weatherNow: { temp: 84, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Guanaja',
    tags: ['bay-islands', 'diving', 'island', 'remote']
  },
  {
    id: 'uii-airport',
    type: 'airport',
    code: 'UII',
    name: 'Utila Airport',
    displayName: 'UII - Utila Airport',
    city: 'Utila',
    country: 'Honduras',
    emoji: '✈️',
    gradientColors: ['#06b6d4', '#0891b2'],
    averageFlightPrice: 370,
    trendingScore: 78,
    popularity: 'high',
    weatherNow: { temp: 85, condition: 'sunny' },
    bestTimeToVisit: 'Year-round diving',
    verified: true,
    topDestination: true,
    parentCity: 'Utila',
    tags: ['bay-islands', 'diving', 'budget', 'backpacker']
  },

  // === MORE EL SALVADOR AIRPORTS ===
  {
    id: 'ils-airport',
    type: 'airport',
    code: 'ILS',
    name: 'Ilopango Intl',
    displayName: 'ILS - Ilopango Intl',
    city: 'San Salvador',
    country: 'El Salvador',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#0284c7'],
    averageFlightPrice: 280,
    trendingScore: 58,
    popularity: 'medium',
    weatherNow: { temp: 85, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'San Salvador',
    tags: ['domestic', 'charter', 'regional', 'convenient']
  },

  // === MORE NICARAGUA AIRPORTS ===
  {
    id: 'bef-airport',
    type: 'airport',
    code: 'BEF',
    name: 'Bluefields Airport',
    displayName: 'BEF - Bluefields Airport',
    city: 'Bluefields',
    country: 'Nicaragua',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#0369a1'],
    averageFlightPrice: 295,
    trendingScore: 62,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Bluefields',
    tags: ['caribbean', 'coast', 'remote', 'authentic']
  },
  {
    id: 'rni-airport',
    type: 'airport',
    code: 'RNI',
    name: 'Corn Island Airport',
    displayName: 'RNI - Corn Island Airport',
    city: 'Corn Island',
    country: 'Nicaragua',
    emoji: '✈️',
    gradientColors: ['#14b8a6', '#0ea5e9'],
    averageFlightPrice: 310,
    trendingScore: 74,
    dealAvailable: true,
    dealSavings: 70,
    popularity: 'high',
    weatherNow: { temp: 85, condition: 'sunny' },
    bestTimeToVisit: 'Feb-Apr (Dry season)',
    verified: true,
    topDestination: true,
    parentCity: 'Corn Island',
    tags: ['caribbean', 'island', 'beach', 'paradise']
  },

  // === MORE COSTA RICA AIRPORTS ===
  {
    id: 'lio-airport',
    type: 'airport',
    code: 'LIO',
    name: 'Limon Intl',
    displayName: 'LIO - Limon Intl',
    city: 'Puerto Limon',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#10b981', '#0ea5e9'],
    averageFlightPrice: 330,
    trendingScore: 66,
    popularity: 'medium',
    weatherNow: { temp: 84, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Puerto Limon',
    tags: ['caribbean', 'coast', 'gateway', 'tortuguero']
  },
  {
    id: 'xqp-airport',
    type: 'airport',
    code: 'XQP',
    name: 'Quepos Airport',
    displayName: 'XQP - Quepos Airport',
    city: 'Quepos',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#14b8a6', '#10b981'],
    averageFlightPrice: 340,
    trendingScore: 82,
    dealAvailable: true,
    dealSavings: 85,
    popularity: 'high',
    weatherNow: { temp: 86, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    parentCity: 'Quepos',
    tags: ['manuel-antonio', 'beach', 'wildlife', 'national-park']
  },
  {
    id: 'tmu-airport',
    type: 'airport',
    code: 'TMU',
    name: 'Tambor Airport',
    displayName: 'TMU - Tambor Airport',
    city: 'Tambor',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#14b8a6'],
    averageFlightPrice: 345,
    trendingScore: 70,
    popularity: 'medium',
    weatherNow: { temp: 88, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Tambor',
    tags: ['nicoya', 'beach', 'montezuma', 'santa-teresa']
  },
  {
    id: 'drk-airport',
    type: 'airport',
    code: 'DRK',
    name: 'Drake Bay Airport',
    displayName: 'DRK - Drake Bay Airport',
    city: 'Drake Bay',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#059669', '#14b8a6'],
    averageFlightPrice: 355,
    trendingScore: 76,
    popularity: 'high',
    weatherNow: { temp: 87, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    parentCity: 'Drake Bay',
    tags: ['corcovado', 'jungle', 'wildlife', 'remote']
  },
  {
    id: 'glf-airport',
    type: 'airport',
    code: 'GLF',
    name: 'Golfito Airport',
    displayName: 'GLF - Golfito Airport',
    city: 'Golfito',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#10b981', '#059669'],
    averageFlightPrice: 350,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Golfito',
    tags: ['southern', 'fishing', 'coast', 'gateway']
  },
  {
    id: 'pjm-airport',
    type: 'airport',
    code: 'PJM',
    name: 'Puerto Jimenez Airport',
    displayName: 'PJM - Puerto Jimenez Airport',
    city: 'Puerto Jimenez',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#059669', '#10b981'],
    averageFlightPrice: 360,
    trendingScore: 74,
    popularity: 'high',
    weatherNow: { temp: 88, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    parentCity: 'Puerto Jimenez',
    tags: ['osa', 'corcovado', 'jungle', 'wildlife']
  },
  {
    id: 'tno-airport',
    type: 'airport',
    code: 'TNO',
    name: 'Tamarindo Airport',
    displayName: 'TNO - Tamarindo Airport',
    city: 'Tamarindo',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#10b981'],
    averageFlightPrice: 338,
    trendingScore: 80,
    popularity: 'high',
    weatherNow: { temp: 90, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Tamarindo',
    tags: ['surf', 'beach', 'guanacaste', 'nightlife']
  },
  {
    id: 'nob-airport',
    type: 'airport',
    code: 'NOB',
    name: 'Nosara Airport',
    displayName: 'NOB - Nosara Airport',
    city: 'Nosara',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#14b8a6', '#059669'],
    averageFlightPrice: 342,
    trendingScore: 76,
    popularity: 'medium',
    weatherNow: { temp: 89, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Nosara',
    tags: ['surf', 'yoga', 'wellness', 'beach']
  },
  {
    id: 'fon-airport',
    type: 'airport',
    code: 'FON',
    name: 'La Fortuna Airport',
    displayName: 'FON - La Fortuna Airport',
    city: 'La Fortuna',
    country: 'Costa Rica',
    emoji: '✈️',
    gradientColors: ['#059669', '#065f46'],
    averageFlightPrice: 335,
    trendingScore: 84,
    dealAvailable: true,
    dealSavings: 95,
    popularity: 'high',
    weatherNow: { temp: 78, condition: 'cloudy' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    parentCity: 'La Fortuna',
    tags: ['arenal', 'volcano', 'hot-springs', 'adventure']
  },

  // === MORE PANAMA AIRPORTS ===
  {
    id: 'dav-airport',
    type: 'airport',
    code: 'DAV',
    name: 'Enrique Malek Intl',
    displayName: 'DAV - Enrique Malek Intl',
    city: 'David',
    country: 'Panama',
    emoji: '✈️',
    gradientColors: ['#3b82f6', '#2563eb'],
    averageFlightPrice: 275,
    trendingScore: 70,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'David',
    tags: ['chiriqui', 'gateway', 'boquete', 'highlands']
  },
  {
    id: 'pac-airport',
    type: 'airport',
    code: 'PAC',
    name: 'Albrook Intl',
    displayName: 'PAC - Albrook Intl',
    city: 'Panama City',
    country: 'Panama',
    emoji: '✈️',
    gradientColors: ['#2563eb', '#1e40af'],
    averageFlightPrice: 272,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 85, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Panama City',
    tags: ['domestic', 'convenient', 'city-center']
  },
  {
    id: 'rih-airport',
    type: 'airport',
    code: 'RIH',
    name: 'Scarlett Martinez Intl',
    displayName: 'RIH - Scarlett Martinez Intl',
    city: 'Rio Hato',
    country: 'Panama',
    emoji: '✈️',
    gradientColors: ['#0ea5e9', '#3b82f6'],
    averageFlightPrice: 285,
    trendingScore: 72,
    popularity: 'medium',
    weatherNow: { temp: 87, condition: 'sunny' },
    verified: true,
    topDestination: true,
    parentCity: 'Rio Hato',
    tags: ['beach', 'resort', 'coronado', 'pacific']
  },
  {
    id: 'chx-airport',
    type: 'airport',
    code: 'CHX',
    name: 'Changuinola Intl',
    displayName: 'CHX - Changuinola Intl',
    city: 'Changuinola',
    country: 'Panama',
    emoji: '✈️',
    gradientColors: ['#14b8a6', '#06b6d4'],
    averageFlightPrice: 295,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 84, condition: 'sunny' },
    verified: true,
    topDestination: false,
    parentCity: 'Changuinola',
    tags: ['bocas-gateway', 'caribbean', 'gateway']
  },

  // === MAJOR CITIES ===
  {
    id: 'nyc-city',
    type: 'city',
    code: 'NYC',
    name: 'New York City',
    displayName: 'New York City, USA',
    city: 'New York City',
    country: 'USA',
    emoji: '🗽',
    gradientColors: ['#667eea', '#764ba2'],
    averageFlightPrice: 189,
    averageHotelPrice: 189,
    trendingScore: 88,
    searchCount24h: 567,
    popularity: 'ultra',
    weatherNow: { temp: 55, condition: 'cloudy' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['JFK', 'LGA', 'EWR'],
    tags: ['business', 'culture', 'shopping', 'food']
  },
  {
    id: 'paris-city',
    type: 'city',
    code: 'PAR',
    name: 'Paris',
    displayName: 'Paris, France',
    city: 'Paris',
    country: 'France',
    emoji: '🗼',
    gradientColors: ['#667eea', '#764ba2'],
    averageFlightPrice: 289,
    averageHotelPrice: 129,
    trendingScore: 95,
    searchCount24h: 823,
    popularity: 'ultra',
    weatherNow: { temp: 68, condition: 'sunny' },
    bestTimeToVisit: 'Spring (Apr-Jun)',
    seasonalTag: '🌸 Spring in Paris',
    verified: true,
    topDestination: true,
    nearbyAirports: ['CDG', 'ORY'],
    tags: ['romantic', 'culture', 'art', 'food']
  },
  {
    id: 'london-city',
    type: 'city',
    code: 'LON',
    name: 'London',
    displayName: 'London, UK',
    city: 'London',
    country: 'UK',
    emoji: '🇬🇧',
    gradientColors: ['#434343', '#000000'],
    averageFlightPrice: 319,
    averageHotelPrice: 149,
    trendingScore: 87,
    popularity: 'ultra',
    weatherNow: { temp: 59, condition: 'cloudy' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['LHR', 'LGW', 'STN'],
    tags: ['history', 'culture', 'business', 'shopping']
  },
  {
    id: 'tokyo-city',
    type: 'city',
    code: 'TYO',
    name: 'Tokyo',
    displayName: 'Tokyo, Japan',
    city: 'Tokyo',
    country: 'Japan',
    emoji: '🗾',
    gradientColors: ['#ee0979', '#ff6a00'],
    averageFlightPrice: 599,
    averageHotelPrice: 139,
    trendingScore: 92,
    popularity: 'ultra',
    weatherNow: { temp: 61, condition: 'cloudy' },
    seasonalTag: '🌸 Cherry Blossom Season',
    bestTimeToVisit: 'Spring (Mar-May)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['NRT', 'HND'],
    tags: ['culture', 'technology', 'food', 'anime']
  },
  {
    id: 'dubai-city',
    type: 'city',
    code: 'DXB',
    name: 'Dubai',
    displayName: 'Dubai, UAE',
    city: 'Dubai',
    country: 'UAE',
    emoji: '🏙️',
    gradientColors: ['#f12711', '#f5af19'],
    averageFlightPrice: 499,
    averageHotelPrice: 179,
    trendingScore: 89,
    dealAvailable: true,
    dealSavings: 120,
    popularity: 'ultra',
    weatherNow: { temp: 95, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['DXB'],
    tags: ['luxury', 'shopping', 'modern', 'beach']
  },
  {
    id: 'barcelona-city',
    type: 'city',
    code: 'BCN',
    name: 'Barcelona',
    displayName: 'Barcelona, Spain',
    city: 'Barcelona',
    country: 'Spain',
    emoji: '🏖️',
    gradientColors: ['#fc4a1a', '#f7b733'],
    averageFlightPrice: 249,
    averageHotelPrice: 99,
    trendingScore: 86,
    popularity: 'ultra',
    weatherNow: { temp: 75, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['BCN'],
    tags: ['beach', 'architecture', 'culture', 'food']
  },
  {
    id: 'rome-city',
    type: 'city',
    code: 'ROM',
    name: 'Rome',
    displayName: 'Rome, Italy',
    city: 'Rome',
    country: 'Italy',
    emoji: '🏛️',
    gradientColors: ['#a73737', '#7a2828'],
    averageFlightPrice: 279,
    averageHotelPrice: 119,
    trendingScore: 84,
    popularity: 'ultra',
    weatherNow: { temp: 71, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['FCO', 'CIA'],
    tags: ['history', 'culture', 'food', 'art']
  },
  {
    id: 'los-angeles-city',
    type: 'city',
    code: 'LA',
    name: 'Los Angeles',
    displayName: 'Los Angeles, USA',
    city: 'Los Angeles',
    country: 'USA',
    emoji: '🌴',
    gradientColors: ['#f093fb', '#f5576c'],
    averageFlightPrice: 159,
    averageHotelPrice: 159,
    trendingScore: 82,
    popularity: 'ultra',
    weatherNow: { temp: 72, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['LAX', 'BUR', 'SNA'],
    tags: ['entertainment', 'beach', 'celebrity', 'food']
  },
  {
    id: 'miami-city',
    type: 'city',
    code: 'MIA',
    name: 'Miami',
    displayName: 'Miami, USA',
    city: 'Miami',
    country: 'USA',
    emoji: '🏖️',
    gradientColors: ['#4facfe', '#00f2fe'],
    averageFlightPrice: 149,
    averageHotelPrice: 139,
    trendingScore: 79,
    popularity: 'high',
    weatherNow: { temp: 82, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['MIA', 'FLL'],
    tags: ['beach', 'nightlife', 'tropical', 'cruise']
  },

  // === CENTRAL AMERICA CITIES ===
  {
    id: 'guatemala-city',
    type: 'city',
    code: 'GUA',
    name: 'Guatemala City',
    displayName: 'Guatemala City, Guatemala',
    city: 'Guatemala City',
    country: 'Guatemala',
    emoji: '🏛️',
    gradientColors: ['#1e3a8a', '#3b82f6'],
    averageFlightPrice: 299,
    averageHotelPrice: 65,
    trendingScore: 70,
    popularity: 'medium',
    weatherNow: { temp: 75, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: false,
    nearbyAirports: ['GUA'],
    tags: ['colonial', 'culture', 'history', 'adventure']
  },
  {
    id: 'antigua-city',
    type: 'city',
    code: 'ANU',
    name: 'Antigua',
    displayName: 'Antigua, Guatemala',
    city: 'Antigua',
    country: 'Guatemala',
    emoji: '🏰',
    gradientColors: ['#2563eb', '#60a5fa'],
    averageFlightPrice: 299,
    averageHotelPrice: 55,
    trendingScore: 75,
    popularity: 'high',
    weatherNow: { temp: 72, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['GUA'],
    tags: ['colonial', 'unesco', 'architecture', 'volcanoes']
  },
  {
    id: 'belize-city',
    type: 'city',
    code: 'BZE',
    name: 'Belize City',
    displayName: 'Belize City, Belize',
    city: 'Belize City',
    country: 'Belize',
    emoji: '🐠',
    gradientColors: ['#0ea5e9', '#06b6d4'],
    averageFlightPrice: 349,
    averageHotelPrice: 75,
    trendingScore: 66,
    popularity: 'medium',
    weatherNow: { temp: 82, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: false,
    nearbyAirports: ['BZE'],
    tags: ['diving', 'reef', 'caribbean', 'adventure']
  },
  {
    id: 'ambergris-caye-city',
    type: 'city',
    code: 'AMB',
    name: 'Ambergris Caye',
    displayName: 'Ambergris Caye, Belize',
    city: 'Ambergris Caye',
    country: 'Belize',
    emoji: '🏝️',
    gradientColors: ['#14b8a6', '#0891b2'],
    averageFlightPrice: 365,
    averageHotelPrice: 95,
    trendingScore: 78,
    dealAvailable: true,
    dealSavings: 85,
    popularity: 'high',
    weatherNow: { temp: 84, condition: 'sunny' },
    bestTimeToVisit: 'Feb-May (Perfect diving)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['BZE'],
    tags: ['island', 'diving', 'snorkeling', 'beach']
  },
  {
    id: 'san-pedro-sula-city',
    type: 'city',
    code: 'SAP',
    name: 'San Pedro Sula',
    displayName: 'San Pedro Sula, Honduras',
    city: 'San Pedro Sula',
    country: 'Honduras',
    emoji: '🏙️',
    gradientColors: ['#0891b2', '#0e7490'],
    averageFlightPrice: 289,
    averageHotelPrice: 60,
    trendingScore: 63,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: false,
    nearbyAirports: ['SAP'],
    tags: ['business', 'gateway', 'tropical', 'culture']
  },
  {
    id: 'roatan-city',
    type: 'city',
    code: 'RTN',
    name: 'Roatán',
    displayName: 'Roatán, Honduras',
    city: 'Roatán',
    country: 'Honduras',
    emoji: '🤿',
    gradientColors: ['#06b6d4', '#0891b2'],
    averageFlightPrice: 365,
    averageHotelPrice: 85,
    trendingScore: 82,
    dealAvailable: true,
    dealSavings: 110,
    popularity: 'high',
    weatherNow: { temp: 84, condition: 'sunny' },
    bestTimeToVisit: 'Year-round (Diving paradise)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['RTN', 'SAP'],
    tags: ['diving', 'island', 'caribbean', 'beach']
  },
  {
    id: 'tegucigalpa-city',
    type: 'city',
    code: 'TGU',
    name: 'Tegucigalpa',
    displayName: 'Tegucigalpa, Honduras',
    city: 'Tegucigalpa',
    country: 'Honduras',
    emoji: '⛰️',
    gradientColors: ['#0284c7', '#0369a1'],
    averageFlightPrice: 295,
    averageHotelPrice: 55,
    trendingScore: 60,
    popularity: 'medium',
    weatherNow: { temp: 78, condition: 'cloudy' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: false,
    nearbyAirports: ['TGU'],
    tags: ['capital', 'mountains', 'culture', 'history']
  },
  {
    id: 'san-salvador-city',
    type: 'city',
    code: 'SAL',
    name: 'San Salvador',
    displayName: 'San Salvador, El Salvador',
    city: 'San Salvador',
    country: 'El Salvador',
    emoji: '🌋',
    gradientColors: ['#0284c7', '#38bdf8'],
    averageFlightPrice: 279,
    averageHotelPrice: 58,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 84, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: false,
    nearbyAirports: ['SAL'],
    tags: ['volcanoes', 'surf', 'culture', 'adventure']
  },
  {
    id: 'el-tunco-city',
    type: 'city',
    code: 'TUN',
    name: 'El Tunco',
    displayName: 'El Tunco, El Salvador',
    city: 'El Tunco',
    country: 'El Salvador',
    emoji: '🏄',
    gradientColors: ['#0ea5e9', '#06b6d4'],
    averageFlightPrice: 279,
    averageHotelPrice: 45,
    trendingScore: 72,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    bestTimeToVisit: 'Mar-Oct (Best surf)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SAL'],
    tags: ['surf', 'beach', 'backpacker', 'nightlife']
  },
  {
    id: 'managua-city',
    type: 'city',
    code: 'MGA',
    name: 'Managua',
    displayName: 'Managua, Nicaragua',
    city: 'Managua',
    country: 'Nicaragua',
    emoji: '🌆',
    gradientColors: ['#0369a1', '#075985'],
    averageFlightPrice: 285,
    averageHotelPrice: 52,
    trendingScore: 66,
    popularity: 'medium',
    weatherNow: { temp: 88, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: false,
    nearbyAirports: ['MGA'],
    tags: ['lakes', 'volcanoes', 'colonial', 'culture']
  },
  {
    id: 'granada-city',
    type: 'city',
    code: 'GRX',
    name: 'Granada',
    displayName: 'Granada, Nicaragua',
    city: 'Granada',
    country: 'Nicaragua',
    emoji: '🏛️',
    gradientColors: ['#0ea5e9', '#0284c7'],
    averageFlightPrice: 285,
    averageHotelPrice: 48,
    trendingScore: 74,
    popularity: 'high',
    weatherNow: { temp: 86, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['MGA'],
    tags: ['colonial', 'architecture', 'lake', 'culture']
  },
  {
    id: 'san-juan-del-sur-city',
    type: 'city',
    code: 'SJS',
    name: 'San Juan del Sur',
    displayName: 'San Juan del Sur, Nicaragua',
    city: 'San Juan del Sur',
    country: 'Nicaragua',
    emoji: '🌊',
    gradientColors: ['#06b6d4', '#14b8a6'],
    averageFlightPrice: 285,
    averageHotelPrice: 55,
    trendingScore: 76,
    dealAvailable: true,
    dealSavings: 65,
    popularity: 'high',
    weatherNow: { temp: 85, condition: 'sunny' },
    bestTimeToVisit: 'Apr-Oct (Surf season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['MGA'],
    tags: ['surf', 'beach', 'backpacker', 'sunset']
  },
  {
    id: 'san-jose-city',
    type: 'city',
    code: 'SJO',
    name: 'San José',
    displayName: 'San José, Costa Rica',
    city: 'San José',
    country: 'Costa Rica',
    emoji: '🌿',
    gradientColors: ['#10b981', '#059669'],
    averageFlightPrice: 319,
    averageHotelPrice: 68,
    trendingScore: 80,
    dealAvailable: true,
    dealSavings: 90,
    popularity: 'high',
    weatherNow: { temp: 79, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SJO'],
    tags: ['eco-tourism', 'rainforest', 'adventure', 'culture']
  },
  {
    id: 'manuel-antonio-city',
    type: 'city',
    code: 'MAN',
    name: 'Manuel Antonio',
    displayName: 'Manuel Antonio, Costa Rica',
    city: 'Manuel Antonio',
    country: 'Costa Rica',
    emoji: '🐒',
    gradientColors: ['#14b8a6', '#10b981'],
    averageFlightPrice: 319,
    averageHotelPrice: 95,
    trendingScore: 84,
    dealAvailable: true,
    dealSavings: 100,
    popularity: 'high',
    weatherNow: { temp: 86, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SJO'],
    tags: ['beach', 'wildlife', 'rainforest', 'national-park']
  },
  {
    id: 'tamarindo-city',
    type: 'city',
    code: 'TAM',
    name: 'Tamarindo',
    displayName: 'Tamarindo, Costa Rica',
    city: 'Tamarindo',
    country: 'Costa Rica',
    emoji: '🏄‍♂️',
    gradientColors: ['#0ea5e9', '#10b981'],
    averageFlightPrice: 329,
    averageHotelPrice: 88,
    trendingScore: 82,
    popularity: 'high',
    weatherNow: { temp: 89, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['LIR'],
    tags: ['surf', 'beach', 'nightlife', 'adventure']
  },
  {
    id: 'montezuma-city',
    type: 'city',
    code: 'MTZ',
    name: 'Montezuma',
    displayName: 'Montezuma, Costa Rica',
    city: 'Montezuma',
    country: 'Costa Rica',
    emoji: '🌴',
    gradientColors: ['#06b6d4', '#059669'],
    averageFlightPrice: 329,
    averageHotelPrice: 72,
    trendingScore: 77,
    popularity: 'medium',
    weatherNow: { temp: 87, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SJO', 'LIR'],
    tags: ['bohemian', 'beach', 'waterfalls', 'yoga']
  },
  {
    id: 'panama-city',
    type: 'city',
    code: 'PTY',
    name: 'Panama City',
    displayName: 'Panama City, Panama',
    city: 'Panama City',
    country: 'Panama',
    emoji: '🏙️',
    gradientColors: ['#3b82f6', '#1e40af'],
    averageFlightPrice: 269,
    averageHotelPrice: 75,
    trendingScore: 75,
    popularity: 'high',
    weatherNow: { temp: 85, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['PTY'],
    tags: ['canal', 'business', 'cosmopolitan', 'skyline']
  },
  {
    id: 'bocas-del-toro-city',
    type: 'city',
    code: 'BOC',
    name: 'Bocas del Toro',
    displayName: 'Bocas del Toro, Panama',
    city: 'Bocas del Toro',
    country: 'Panama',
    emoji: '🏝️',
    gradientColors: ['#0ea5e9', '#06b6d4'],
    averageFlightPrice: 289,
    averageHotelPrice: 68,
    trendingScore: 80,
    dealAvailable: true,
    dealSavings: 75,
    popularity: 'high',
    weatherNow: { temp: 83, condition: 'sunny' },
    bestTimeToVisit: 'Feb-Apr, Sep-Oct',
    verified: true,
    topDestination: true,
    nearbyAirports: ['PTY'],
    tags: ['island', 'caribbean', 'diving', 'backpacker']
  },
  {
    id: 'boquete-city',
    type: 'city',
    code: 'BOQ',
    name: 'Boquete',
    displayName: 'Boquete, Panama',
    city: 'Boquete',
    country: 'Panama',
    emoji: '☕',
    gradientColors: ['#10b981', '#065f46'],
    averageFlightPrice: 269,
    averageHotelPrice: 62,
    trendingScore: 73,
    popularity: 'medium',
    weatherNow: { temp: 70, condition: 'cloudy' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['PTY'],
    tags: ['mountains', 'coffee', 'hiking', 'expat-friendly']
  },

  // === MORE CENTRAL AMERICA TOURISM CITIES ===
  {
    id: 'flores-city',
    type: 'city',
    code: 'FLO',
    name: 'Flores',
    displayName: 'Flores, Guatemala',
    city: 'Flores',
    country: 'Guatemala',
    emoji: '🏛️',
    gradientColors: ['#1e3a8a', '#3b82f6'],
    averageFlightPrice: 320,
    averageHotelPrice: 45,
    trendingScore: 78,
    dealAvailable: true,
    dealSavings: 80,
    popularity: 'high',
    weatherNow: { temp: 82, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    seasonalTag: '🏛️ Gateway to Tikal',
    verified: true,
    topDestination: true,
    nearbyAirports: ['FRS'],
    tags: ['tikal', 'ruins', 'jungle', 'mayan', 'island']
  },
  {
    id: 'panajachel-city',
    type: 'city',
    code: 'PAN',
    name: 'Panajachel',
    displayName: 'Panajachel (Lake Atitlan), Guatemala',
    city: 'Panajachel',
    country: 'Guatemala',
    emoji: '🏔️',
    gradientColors: ['#2563eb', '#7c3aed'],
    averageFlightPrice: 299,
    averageHotelPrice: 52,
    trendingScore: 82,
    popularity: 'high',
    weatherNow: { temp: 68, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    seasonalTag: '🌋 Highland Lake Paradise',
    verified: true,
    topDestination: true,
    nearbyAirports: ['GUA'],
    tags: ['lake-atitlan', 'highlands', 'indigenous', 'volcanoes', 'backpacker']
  },
  {
    id: 'livingston-city',
    type: 'city',
    code: 'LIV',
    name: 'Livingston',
    displayName: 'Livingston, Guatemala',
    city: 'Livingston',
    country: 'Guatemala',
    emoji: '🏖️',
    gradientColors: ['#0ea5e9', '#1e3a8a'],
    averageFlightPrice: 310,
    averageHotelPrice: 38,
    trendingScore: 72,
    popularity: 'medium',
    weatherNow: { temp: 86, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['PBR'],
    tags: ['caribbean', 'garifuna', 'culture', 'boat-only', 'remote']
  },
  {
    id: 'copan-ruinas-city',
    type: 'city',
    code: 'CPN',
    name: 'Copan Ruinas',
    displayName: 'Copan Ruinas, Honduras',
    city: 'Copan Ruinas',
    country: 'Honduras',
    emoji: '🏛️',
    gradientColors: ['#0891b2', '#065f46'],
    averageFlightPrice: 289,
    averageHotelPrice: 48,
    trendingScore: 76,
    popularity: 'high',
    weatherNow: { temp: 75, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    seasonalTag: '🏛️ UNESCO Mayan Site',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SAP'],
    tags: ['mayan', 'ruins', 'unesco', 'archaeology', 'colonial']
  },
  {
    id: 'west-bay-city',
    type: 'city',
    code: 'WBY',
    name: 'West Bay',
    displayName: 'West Bay, Roatán, Honduras',
    city: 'West Bay',
    country: 'Honduras',
    emoji: '🏖️',
    gradientColors: ['#06b6d4', '#0891b2'],
    averageFlightPrice: 365,
    averageHotelPrice: 95,
    trendingScore: 84,
    dealAvailable: true,
    dealSavings: 115,
    popularity: 'high',
    weatherNow: { temp: 85, condition: 'sunny' },
    bestTimeToVisit: 'Year-round',
    seasonalTag: '🏝️ Best Beach in Honduras',
    verified: true,
    topDestination: true,
    nearbyAirports: ['RTB'],
    tags: ['roatan', 'beach', 'diving', 'snorkeling', 'paradise']
  },
  {
    id: 'leon-city',
    type: 'city',
    code: 'LEO',
    name: 'León',
    displayName: 'León, Nicaragua',
    city: 'León',
    country: 'Nicaragua',
    emoji: '🌋',
    gradientColors: ['#0ea5e9', '#0369a1'],
    averageFlightPrice: 285,
    averageHotelPrice: 42,
    trendingScore: 74,
    dealAvailable: true,
    dealSavings: 68,
    popularity: 'high',
    weatherNow: { temp: 88, condition: 'sunny' },
    bestTimeToVisit: 'Nov-Apr (Dry season)',
    seasonalTag: '🌋 Volcano Boarding Capital',
    verified: true,
    topDestination: true,
    nearbyAirports: ['MGA'],
    tags: ['colonial', 'volcano-boarding', 'unesco', 'culture', 'adventure']
  },
  {
    id: 'little-corn-island-city',
    type: 'city',
    code: 'LCI',
    name: 'Little Corn Island',
    displayName: 'Little Corn Island, Nicaragua',
    city: 'Little Corn Island',
    country: 'Nicaragua',
    emoji: '🏝️',
    gradientColors: ['#14b8a6', '#0ea5e9'],
    averageFlightPrice: 315,
    averageHotelPrice: 68,
    trendingScore: 78,
    dealAvailable: true,
    dealSavings: 72,
    popularity: 'medium',
    weatherNow: { temp: 84, condition: 'sunny' },
    bestTimeToVisit: 'Feb-Apr (Dry season)',
    seasonalTag: '🏝️ Car-free Paradise',
    verified: true,
    topDestination: true,
    nearbyAirports: ['RNI'],
    tags: ['island', 'caribbean', 'remote', 'no-cars', 'paradise']
  },
  {
    id: 'puerto-viejo-city',
    type: 'city',
    code: 'PVO',
    name: 'Puerto Viejo de Talamanca',
    displayName: 'Puerto Viejo de Talamanca, Costa Rica',
    city: 'Puerto Viejo',
    country: 'Costa Rica',
    emoji: '🏄',
    gradientColors: ['#10b981', '#06b6d4'],
    averageFlightPrice: 330,
    averageHotelPrice: 72,
    trendingScore: 82,
    dealAvailable: true,
    dealSavings: 88,
    popularity: 'high',
    weatherNow: { temp: 84, condition: 'sunny' },
    bestTimeToVisit: 'Feb-Apr, Sep-Oct',
    verified: true,
    topDestination: true,
    nearbyAirports: ['LIO', 'SJO'],
    tags: ['caribbean', 'surf', 'backpacker', 'reggae', 'beach']
  },
  {
    id: 'jaco-city',
    type: 'city',
    code: 'JAC',
    name: 'Jaco',
    displayName: 'Jaco, Costa Rica',
    city: 'Jaco',
    country: 'Costa Rica',
    emoji: '🏄‍♂️',
    gradientColors: ['#0ea5e9', '#059669'],
    averageFlightPrice: 319,
    averageHotelPrice: 85,
    trendingScore: 76,
    popularity: 'high',
    weatherNow: { temp: 87, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SJO'],
    tags: ['surf', 'beach', 'nightlife', 'party']
  },
  {
    id: 'santa-teresa-city',
    type: 'city',
    code: 'STE',
    name: 'Santa Teresa',
    displayName: 'Santa Teresa, Costa Rica',
    city: 'Santa Teresa',
    country: 'Costa Rica',
    emoji: '🌊',
    gradientColors: ['#14b8a6', '#10b981'],
    averageFlightPrice: 345,
    averageHotelPrice: 98,
    trendingScore: 80,
    dealAvailable: true,
    dealSavings: 92,
    popularity: 'high',
    weatherNow: { temp: 88, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    seasonalTag: '🏄 World-Class Surf',
    verified: true,
    topDestination: true,
    nearbyAirports: ['TMU', 'LIR'],
    tags: ['surf', 'yoga', 'beach', 'bohemian', 'wellness']
  },
  {
    id: 'monteverde-city',
    type: 'city',
    code: 'MTV',
    name: 'Monteverde',
    displayName: 'Monteverde, Costa Rica',
    city: 'Monteverde',
    country: 'Costa Rica',
    emoji: '🌳',
    gradientColors: ['#059669', '#065f46'],
    averageFlightPrice: 330,
    averageHotelPrice: 78,
    trendingScore: 82,
    dealAvailable: true,
    dealSavings: 85,
    popularity: 'ultra',
    weatherNow: { temp: 68, condition: 'cloudy' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    seasonalTag: '🌳 Cloud Forest Reserve',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SJO', 'LIR'],
    tags: ['cloud-forest', 'eco-tourism', 'zipline', 'wildlife', 'hiking']
  },
  {
    id: 'arenal-city',
    type: 'city',
    code: 'ARE',
    name: 'La Fortuna / Arenal',
    displayName: 'La Fortuna / Arenal, Costa Rica',
    city: 'La Fortuna',
    country: 'Costa Rica',
    emoji: '🌋',
    gradientColors: ['#dc2626', '#059669'],
    averageFlightPrice: 335,
    averageHotelPrice: 88,
    trendingScore: 88,
    dealAvailable: true,
    dealSavings: 98,
    popularity: 'ultra',
    weatherNow: { temp: 78, condition: 'cloudy' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    seasonalTag: '🌋 Active Volcano & Hot Springs',
    verified: true,
    topDestination: true,
    nearbyAirports: ['FON', 'SJO'],
    tags: ['volcano', 'hot-springs', 'adventure', 'waterfalls', 'wildlife']
  },
  {
    id: 'tortuguero-city',
    type: 'city',
    code: 'TOR',
    name: 'Tortuguero',
    displayName: 'Tortuguero, Costa Rica',
    city: 'Tortuguero',
    country: 'Costa Rica',
    emoji: '🐢',
    gradientColors: ['#10b981', '#0ea5e9'],
    averageFlightPrice: 340,
    averageHotelPrice: 92,
    trendingScore: 76,
    popularity: 'medium',
    weatherNow: { temp: 82, condition: 'sunny' },
    bestTimeToVisit: 'Jul-Sep (Turtle nesting)',
    seasonalTag: '🐢 Sea Turtle Nesting',
    verified: true,
    topDestination: true,
    nearbyAirports: ['SJO', 'LIO'],
    tags: ['turtles', 'national-park', 'canals', 'wildlife', 'boat-only']
  },
  {
    id: 'portobelo-city',
    type: 'city',
    code: 'PBL',
    name: 'Portobelo',
    displayName: 'Portobelo, Panama',
    city: 'Portobelo',
    country: 'Panama',
    emoji: '🏴‍☠️',
    gradientColors: ['#0ea5e9', '#1e40af'],
    averageFlightPrice: 275,
    averageHotelPrice: 65,
    trendingScore: 68,
    popularity: 'medium',
    weatherNow: { temp: 85, condition: 'sunny' },
    bestTimeToVisit: 'Dec-Apr (Dry season)',
    seasonalTag: '🏴‍☠️ Colonial Port Town',
    verified: true,
    topDestination: true,
    nearbyAirports: ['PTY'],
    tags: ['colonial', 'unesco', 'caribbean', 'history', 'pirates']
  },

  {
    id: 'lasvegas-city',
    type: 'city',
    code: 'LAS',
    name: 'Las Vegas',
    displayName: 'Las Vegas, USA',
    city: 'Las Vegas',
    country: 'USA',
    emoji: '🎰',
    gradientColors: ['#ff0844', '#ffb199'],
    averageFlightPrice: 99,
    averageHotelPrice: 79,
    trendingScore: 76,
    dealAvailable: true,
    dealSavings: 50,
    popularity: 'ultra',
    weatherNow: { temp: 88, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['LAS'],
    tags: ['entertainment', 'nightlife', 'casino', 'shows']
  },

  // === RESORT DESTINATIONS ===
  {
    id: 'cancun-resort',
    type: 'resort',
    code: 'CUN',
    name: 'Cancun',
    displayName: 'Cancun, Mexico',
    city: 'Cancun',
    country: 'Mexico',
    emoji: '🏖️',
    gradientColors: ['#4facfe', '#00f2fe'],
    averageFlightPrice: 299,
    averageHotelPrice: 159,
    trendingScore: 91,
    searchCount24h: 412,
    dealAvailable: true,
    dealSavings: 180,
    popularity: 'ultra',
    weatherNow: { temp: 82, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['CUN'],
    tags: ['beach', 'resort', 'all-inclusive', 'tropical']
  },
  {
    id: 'maldives-resort',
    type: 'resort',
    code: 'MLE',
    name: 'Maldives',
    displayName: 'Maldives',
    city: 'Malé',
    country: 'Maldives',
    emoji: '🏝️',
    gradientColors: ['#00c6ff', '#0072ff'],
    averageFlightPrice: 899,
    averageHotelPrice: 499,
    trendingScore: 87,
    popularity: 'high',
    weatherNow: { temp: 86, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['MLE'],
    tags: ['luxury', 'honeymoon', 'beach', 'diving']
  },
  {
    id: 'phuket-resort',
    type: 'resort',
    code: 'HKT',
    name: 'Phuket',
    displayName: 'Phuket, Thailand',
    city: 'Phuket',
    country: 'Thailand',
    emoji: '🏝️',
    gradientColors: ['#ff9966', '#ff5e62'],
    averageFlightPrice: 549,
    averageHotelPrice: 89,
    trendingScore: 83,
    popularity: 'high',
    weatherNow: { temp: 88, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['HKT'],
    tags: ['beach', 'budget', 'nightlife', 'food']
  },

  // Add more locations as needed...
  {
    id: 'singapore-city',
    type: 'city',
    code: 'SIN',
    name: 'Singapore',
    displayName: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    emoji: '🇸🇬',
    gradientColors: ['#ee0979', '#ff6a00'],
    averageFlightPrice: 599,
    averageHotelPrice: 169,
    trendingScore: 85,
    popularity: 'ultra',
    weatherNow: { temp: 84, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['SIN'],
    tags: ['modern', 'food', 'shopping', 'culture']
  },
  {
    id: 'amsterdam-city',
    type: 'city',
    code: 'AMS',
    name: 'Amsterdam',
    displayName: 'Amsterdam, Netherlands',
    city: 'Amsterdam',
    country: 'Netherlands',
    emoji: '🚲',
    gradientColors: ['#56ab2f', '#a8e063'],
    averageFlightPrice: 269,
    averageHotelPrice: 139,
    trendingScore: 81,
    popularity: 'high',
    weatherNow: { temp: 63, condition: 'cloudy' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['AMS'],
    tags: ['culture', 'history', 'canals', 'art']
  },
  {
    id: 'sydney-city',
    type: 'city',
    code: 'SYD',
    name: 'Sydney',
    displayName: 'Sydney, Australia',
    city: 'Sydney',
    country: 'Australia',
    emoji: '🦘',
    gradientColors: ['#4facfe', '#00f2fe'],
    averageFlightPrice: 799,
    averageHotelPrice: 159,
    trendingScore: 80,
    popularity: 'high',
    weatherNow: { temp: 73, condition: 'sunny' },
    verified: true,
    topDestination: true,
    nearbyAirports: ['SYD'],
    tags: ['beach', 'outdoor', 'culture', 'food']
  }
];

// ============================================
// MAIN COMPONENT
// ============================================

export function UnifiedLocationAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  mode = 'any',
  allowedTypes,
  icon,
  showExplore = false,
  showPricing = true,
  showWeather = true,
  showSocialProof = true,
  showRecentSearches = true,
  showNearbyAirports = false,
  groupBySections = true,
  maxResults = 8,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches && typeof window !== 'undefined') {
      const saved = localStorage.getItem('fly2any-recent-searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load recent searches:', e);
        }
      }
    }
  }, [showRecentSearches]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter locations based on mode and query
  useEffect(() => {
    const organizedSections = organizeResults(inputValue, mode, allowedTypes || [], recentSearches, maxResults);
    setSections(organizedSections);
  }, [inputValue, mode, allowedTypes, recentSearches, maxResults]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function filterLocationsByMode(locations: Location[], mode: Mode, allowedTypes: LocationType[]): Location[] {
    let filtered = locations;

    // Mode filtering
    if (mode === 'airports-only') {
      filtered = filtered.filter(l => l.type === 'airport');
    } else if (mode === 'cities-only') {
      filtered = filtered.filter(l => l.type === 'city' || l.type === 'resort');
    } else if (mode === 'both') {
      filtered = filtered.filter(l => l.type === 'airport' || l.type === 'city');
    }

    // Additional type filtering
    if (allowedTypes.length > 0) {
      filtered = filtered.filter(l => allowedTypes.includes(l.type));
    }

    return filtered;
  }

  function organizeResults(
    query: string,
    mode: Mode,
    allowedTypes: LocationType[],
    recentSearches: string[],
    maxResults: number
  ): Section[] {
    const lowerQuery = query.toLowerCase().trim();
    const allSections: Section[] = [];

    // Filter all locations by mode first
    let filteredLocations = filterLocationsByMode(LOCATIONS, mode, allowedTypes);

    // Text search filtering
    if (lowerQuery.length > 0) {
      filteredLocations = filteredLocations.filter(loc =>
        loc.code.toLowerCase().includes(lowerQuery) ||
        loc.name.toLowerCase().includes(lowerQuery) ||
        loc.city.toLowerCase().includes(lowerQuery) ||
        loc.country.toLowerCase().includes(lowerQuery) ||
        loc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    if (!groupBySections) {
      // Simple ungrouped list
      return [{
        id: 'all',
        title: '',
        icon: '',
        locations: filteredLocations.slice(0, maxResults)
      }];
    }

    // Section 1: Perfect Match
    const perfectMatches = filteredLocations.filter(l =>
      l.code.toLowerCase() === lowerQuery ||
      l.name.toLowerCase() === lowerQuery
    ).slice(0, 1);

    if (perfectMatches.length > 0) {
      allSections.push({
        id: 'perfect',
        title: '🎯 PERFECT MATCH',
        icon: '🎯',
        locations: perfectMatches
      });
    }

    // Section 2: Recent Searches
    if (showRecentSearches && lowerQuery.length === 0 && recentSearches.length > 0) {
      const recentLocs = filteredLocations.filter(l => recentSearches.includes(l.id)).slice(0, 2);
      if (recentLocs.length > 0) {
        allSections.push({
          id: 'recent',
          title: '📍 RECENT SEARCHES',
          icon: '📍',
          locations: recentLocs
        });
      }
    }

    // Section 3: Trending Now
    if (lowerQuery.length === 0 || lowerQuery.length >= 2) {
      const trending = filteredLocations
        .filter(l => l.trendingScore >= 85)
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 3);

      if (trending.length > 0) {
        allSections.push({
          id: 'trending',
          title: '🔥 TRENDING NOW',
          icon: '🔥',
          locations: trending
        });
      }
    }

    // Section 4: Best Matches (text relevance)
    const remainingCount = maxResults - allSections.reduce((sum, s) => sum + s.locations.length, 0);
    if (remainingCount > 0) {
      const alreadyShown = new Set(allSections.flatMap(s => s.locations.map(l => l.id)));
      const bestMatches = filteredLocations
        .filter(l => !alreadyShown.has(l.id))
        .slice(0, remainingCount);

      if (bestMatches.length > 0) {
        allSections.push({
          id: 'destinations',
          title: lowerQuery.length > 0 ? '🌍 MATCHING DESTINATIONS' : '🌍 POPULAR DESTINATIONS',
          icon: '🌍',
          locations: bestMatches
        });
      }
    }

    return allSections.filter(s => s.locations.length > 0);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectLocation = (location: Location | 'explore') => {
    if (location === 'explore') {
      const value = 'Anywhere ✈️';
      setInputValue(value);
      onChange(value);
    } else {
      const value = location.type === 'airport'
        ? `${location.code} - ${location.city}`
        : `${location.name}, ${location.country}`;

      setInputValue(value);
      onChange(value, location);

      // Save to recent searches
      if (showRecentSearches && typeof window !== 'undefined') {
        const updated = [location.id, ...recentSearches.filter(id => id !== location.id)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('fly2any-recent-searches', JSON.stringify(updated));
      }
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allLocations = sections.flatMap(s => s.locations);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, allLocations.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectLocation(allLocations[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getBadges = (location: Location) => {
    const badges: JSX.Element[] = [];

    if (location.verified) {
      badges.push(
        <span key="verified" className="text-xs text-primary-600">✓</span>
      );
    }

    if (location.trendingScore >= 90) {
      badges.push(
        <span key="trending" className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 animate-pulse-subtle">
          🔥 Trending
        </span>
      );
    } else if (location.trendingScore >= 85) {
      badges.push(
        <span key="popular" className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
          ⭐ Popular
        </span>
      );
    }

    if (location.dealAvailable && showPricing) {
      badges.push(
        <span key="deal" className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
          🌟 Deal
        </span>
      );
    }

    if (location.seasonalTag) {
      badges.push(
        <span key="seasonal" className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
          {location.seasonalTag.split(' ')[0]}
        </span>
      );
    }

    return badges;
  };

  // Flatten sections for keyboard navigation
  let globalIndex = -1;

  return (
    <div className="relative">
      {label && (
        <label className="block text-base font-bold text-gray-900 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-lg font-semibold text-gray-900 placeholder:text-gray-400 bg-white`}
        />
      </div>

      {/* Premium Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-[600px] overflow-y-auto animate-slideDown"
        >
          {/* Explore Anywhere Option */}
          {showExplore && inputValue.length === 0 && (
            <button
              onClick={() => handleSelectLocation('explore')}
              className="w-full relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 p-6 text-white transition-all hover:scale-[1.02] border-b-2 border-white"
            >
              <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-2">🌍</div>
                <div className="text-xl font-bold mb-1">Explore Anywhere</div>
                <div className="text-sm text-white/90">
                  Find the cheapest destinations from your location
                </div>
                <div className="mt-3 text-xs bg-white/20 rounded-lg px-3 py-1.5 inline-block">
                  ✨ Powered by AI price prediction
                </div>
              </div>
            </button>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} className="py-2">
              {/* Section Header */}
              {section.title && (
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                  {section.title}
                </div>
              )}

              {/* Location Cards */}
              {section.locations.map((location) => {
                globalIndex++;
                const isHighlighted = globalIndex === highlightedIndex;

                return (
                  <button
                    key={location.id}
                    onClick={() => handleSelectLocation(location)}
                    className={`w-full group relative overflow-hidden p-4 transition-all border-b border-gray-100 last:border-b-0 ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-l-primary-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Subtle gradient background */}
                    <div
                      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${location.gradientColors[0]}, ${location.gradientColors[1]})`
                      }}
                    />

                    <div className="relative z-10 flex items-start gap-4">
                      {/* Icon with gradient */}
                      <div
                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-3xl shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${location.gradientColors[0]}20, ${location.gradientColors[1]}20)`
                        }}
                      >
                        {location.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0">
                        {/* Name + Badges */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900 text-base">
                            {location.type === 'airport' ? (
                              <>
                                <span className="text-primary-600">{location.code}</span> - {location.name}
                              </>
                            ) : (
                              <>
                                {location.name}, {location.country}
                              </>
                            )}
                          </span>
                          {getBadges(location)}
                        </div>

                        {/* Context Row 1: Pricing & Weather */}
                        <div className="flex items-center gap-3 text-sm mb-1 flex-wrap">
                          {showPricing && location.averageFlightPrice && (
                            <span className="font-semibold text-primary-600">
                              From ${location.averageFlightPrice} ✈️
                            </span>
                          )}
                          {showPricing && location.averageHotelPrice && mode !== 'airports-only' && (
                            <span className="text-gray-600">
                              Hotels from ${location.averageHotelPrice}/nt 🏨
                            </span>
                          )}
                          {showWeather && location.weatherNow && (
                            <span className="text-gray-600">
                              {location.weatherNow.condition === 'sunny' ? '☀️' : location.weatherNow.condition === 'cloudy' ? '🌤️' : '🌧️'}
                              {location.weatherNow.temp}°F
                            </span>
                          )}
                        </div>

                        {/* Context Row 2: Best Time / Social Proof */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          {location.bestTimeToVisit && (
                            <span>💡 Best in {location.bestTimeToVisit}</span>
                          )}
                          {showSocialProof && location.searchCount24h && (
                            <span>{location.searchCount24h} searching now</span>
                          )}
                          {location.flightDuration && (
                            <span>{location.flightDuration} direct</span>
                          )}
                        </div>

                        {/* Seasonal Tag */}
                        {location.seasonalTag && (
                          <div className="mt-2 text-xs font-medium text-purple-600">
                            {location.seasonalTag}
                          </div>
                        )}

                        {/* Deal Badge */}
                        {location.dealAvailable && location.dealSavings && showPricing && (
                          <div className="mt-2 text-xs font-bold text-orange-600">
                            🔥 Save up to ${location.dealSavings} on packages!
                          </div>
                        )}

                        {/* Nearby Airports (for cities) */}
                        {showNearbyAirports && location.nearbyAirports && location.nearbyAirports.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            ✈️ Airports: {location.nearbyAirports.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className={`text-xl transition-all ${isHighlighted ? 'text-primary-600 translate-x-1' : 'text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1'}`}>
                        →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {/* No Results */}
          {sections.length === 0 && inputValue.length > 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                No destinations found
              </div>
              <div className="text-sm text-gray-500 mb-6">
                Try searching for &quot;Paris&quot;, &quot;New York&quot;, or &quot;Tokyo&quot;
              </div>
              <div className="text-xs text-gray-400">
                💡 TIP: Type at least 2 characters to see suggestions
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
