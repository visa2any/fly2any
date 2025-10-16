/**
 * Seat Map Types
 * Comprehensive type definitions for seat selection system
 */

export type SeatPosition = 'window' | 'middle' | 'aisle';
export type SeatStatus = 'available' | 'taken' | 'blocked';
export type ReclineType = 'full' | 'limited' | 'none';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export interface SeatInfo {
  number: string;
  row: number;
  position: SeatPosition;
  status: SeatStatus;
  legroom: number; // inches
  recline: ReclineType;
  features: string[];
  warnings: string[];
  price?: number; // USD for paid seat selection
  rating: number; // 1-5 stars
  isPremium: boolean;
  isExit: boolean;
  windowAlignment?: boolean; // true if window is properly aligned
  reviewCount: number;
}

export interface SeatRow {
  rowNumber: number;
  seats: (SeatInfo | null)[]; // null represents aisle
  isExitRow?: boolean;
  isBulkhead?: boolean;
}

export interface CabinConfig {
  class: CabinClass;
  rows: SeatRow[];
  seatsPerRow: number;
  aislePositions: number[]; // indices where aisles are located
}

export interface AircraftConfig {
  type: string;
  name: string;
  manufacturer: 'Boeing' | 'Airbus' | 'Embraer' | 'Bombardier';
  cabins: CabinConfig[];
  totalSeats: number;
  wifiAvailable: boolean;
  powerOutlets: boolean;
}

export interface SeatMapPreviewProps {
  flightId: string;
  airline: string;
  aircraftType: string;
  cabinClass: CabinClass;
  onSeatSelect?: (seatNumber: string, price: number) => void;
  showPricing?: boolean;
  lang?: 'en' | 'pt' | 'es';
}

export interface SeatRecommendation {
  seatNumber: string;
  reason: string;
  type: 'best' | 'popular' | 'avoid' | 'upgrade';
}

export interface SeatFilter {
  position?: SeatPosition[];
  minLegroom?: number;
  requirePower?: boolean;
  avoidLavatory?: boolean;
  exitRowOnly?: boolean;
}
