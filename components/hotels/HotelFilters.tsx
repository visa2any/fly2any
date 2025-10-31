'use client';

import { useState } from 'react';
import { Star, DollarSign, Check, X } from 'lucide-react';

export interface HotelFiltersType {
  priceRange: [number, number];
  starRating: number[];
  guestRating: number; // Minimum rating (0-10)
  amenities: string[];
  mealPlans: string[];
  propertyTypes: string[];
  cancellationPolicy: string[];
}

interface HotelFiltersProps {
  filters: HotelFiltersType;
  onFiltersChange: (filters: HotelFiltersType) => void;
  hotels: any[];
  lang?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    filters: 'Filters',
    clearAll: 'Clear All',
    pricePerNight: 'Price per Night',
    starRating: 'Star Rating',
    guestRating: 'Guest Rating',
    amenities: 'Amenities',
    mealPlans: 'Meal Plans',
    propertyType: 'Property Type',
    cancellation: 'Cancellation Policy',
    andAbove: 'and above',
    wifi: 'Free WiFi',
    parking: 'Free Parking',
    breakfast: 'Breakfast Included',
    pool: 'Swimming Pool',
    gym: 'Fitness Center',
    spa: 'Spa',
    restaurant: 'Restaurant',
    airportShuttle: 'Airport Shuttle',
    roomOnly: 'Room Only',
    breakfastIncluded: 'Breakfast Included',
    halfBoard: 'Half Board',
    fullBoard: 'Full Board',
    allInclusive: 'All Inclusive',
    hotel: 'Hotel',
    resort: 'Resort',
    apartment: 'Apartment',
    villa: 'Villa',
    guesthouse: 'Guesthouse',
    freeCancellation: 'Free Cancellation',
    partialRefund: 'Partial Refund',
    nonRefundable: 'Non-refundable',
  },
  pt: {
    filters: 'Filtros',
    clearAll: 'Limpar Tudo',
    pricePerNight: 'Preço por Noite',
    starRating: 'Classificação',
    guestRating: 'Avaliação',
    amenities: 'Comodidades',
    mealPlans: 'Planos de Refeição',
    propertyType: 'Tipo de Propriedade',
    cancellation: 'Política de Cancelamento',
    andAbove: 'e acima',
    wifi: 'WiFi Grátis',
    parking: 'Estacionamento Grátis',
    breakfast: 'Café da Manhã Incluído',
    pool: 'Piscina',
    gym: 'Academia',
    spa: 'Spa',
    restaurant: 'Restaurante',
    airportShuttle: 'Transfer Aeroporto',
    roomOnly: 'Apenas Quarto',
    breakfastIncluded: 'Café Incluído',
    halfBoard: 'Meia Pensão',
    fullBoard: 'Pensão Completa',
    allInclusive: 'Tudo Incluído',
    hotel: 'Hotel',
    resort: 'Resort',
    apartment: 'Apartamento',
    villa: 'Villa',
    guesthouse: 'Pousada',
    freeCancellation: 'Cancelamento Grátis',
    partialRefund: 'Reembolso Parcial',
    nonRefundable: 'Não reembolsável',
  },
  es: {
    filters: 'Filtros',
    clearAll: 'Limpiar Todo',
    pricePerNight: 'Precio por Noche',
    starRating: 'Clasificación',
    guestRating: 'Calificación',
    amenities: 'Servicios',
    mealPlans: 'Planes de Comida',
    propertyType: 'Tipo de Propiedad',
    cancellation: 'Política de Cancelación',
    andAbove: 'y superior',
    wifi: 'WiFi Gratis',
    parking: 'Estacionamiento Gratis',
    breakfast: 'Desayuno Incluido',
    pool: 'Piscina',
    gym: 'Gimnasio',
    spa: 'Spa',
    restaurant: 'Restaurante',
    airportShuttle: 'Transporte Aeropuerto',
    roomOnly: 'Solo Habitación',
    breakfastIncluded: 'Desayuno Incluido',
    halfBoard: 'Media Pensión',
    fullBoard: 'Pensión Completa',
    allInclusive: 'Todo Incluido',
    hotel: 'Hotel',
    resort: 'Resort',
    apartment: 'Apartamento',
    villa: 'Villa',
    guesthouse: 'Casa de Huéspedes',
    freeCancellation: 'Cancelación Gratis',
    partialRefund: 'Reembolso Parcial',
    nonRefundable: 'No reembolsable',
  },
};

export default function HotelFilters({
  filters,
  onFiltersChange,
  hotels,
  lang = 'en',
}: HotelFiltersProps) {
  const t = translations[lang];
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'price',
    'rating',
    'amenities',
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handlePriceChange = (value: number, index: 0 | 1) => {
    const newRange: [number, number] = [...filters.priceRange] as [number, number];
    newRange[index] = value;
    onFiltersChange({ ...filters, priceRange: newRange });
  };

  const toggleStarRating = (stars: number) => {
    const newRatings = filters.starRating.includes(stars)
      ? filters.starRating.filter((r) => r !== stars)
      : [...filters.starRating, stars];
    onFiltersChange({ ...filters, starRating: newRatings });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  const toggleMealPlan = (plan: string) => {
    const newPlans = filters.mealPlans.includes(plan)
      ? filters.mealPlans.filter((p) => p !== plan)
      : [...filters.mealPlans, plan];
    onFiltersChange({ ...filters, mealPlans: newPlans });
  };

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type];
    onFiltersChange({ ...filters, propertyTypes: newTypes });
  };

  const toggleCancellationPolicy = (policy: string) => {
    const newPolicies = filters.cancellationPolicy.includes(policy)
      ? filters.cancellationPolicy.filter((p) => p !== policy)
      : [...filters.cancellationPolicy, policy];
    onFiltersChange({ ...filters, cancellationPolicy: newPolicies });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      starRating: [],
      guestRating: 0,
      amenities: [],
      mealPlans: [],
      propertyTypes: [],
      cancellationPolicy: [],
    });
  };

  const amenityOptions = [
    { value: 'wifi', label: t.wifi },
    { value: 'parking', label: t.parking },
    { value: 'breakfast', label: t.breakfastIncluded },
    { value: 'pool', label: t.pool },
    { value: 'gym', label: t.gym },
    { value: 'spa', label: t.spa },
    { value: 'restaurant', label: t.restaurant },
    { value: 'airportShuttle', label: t.airportShuttle },
  ];

  const mealPlanOptions = [
    { value: 'room-only', label: t.roomOnly },
    { value: 'breakfast', label: t.breakfastIncluded },
    { value: 'half-board', label: t.halfBoard },
    { value: 'full-board', label: t.fullBoard },
    { value: 'all-inclusive', label: t.allInclusive },
  ];

  const propertyTypeOptions = [
    { value: 'hotel', label: t.hotel },
    { value: 'resort', label: t.resort },
    { value: 'apartment', label: t.apartment },
    { value: 'villa', label: t.villa },
    { value: 'guesthouse', label: t.guesthouse },
  ];

  const cancellationOptions = [
    { value: 'free', label: t.freeCancellation },
    { value: 'partial', label: t.partialRefund },
    { value: 'non-refundable', label: t.nonRefundable },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{t.filters}</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
        >
          {t.clearAll}
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.pricePerNight}</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), 0)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceChange(parseInt(e.target.value), 1)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.starRating}</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <label key={stars} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.starRating.includes(stars)}
                onChange={() => toggleStarRating(stars)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="flex items-center">
                {Array.from({ length: stars }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Guest Rating */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.guestRating}</h4>
        <div className="space-y-2">
          {[9, 8, 7, 6].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="guestRating"
                checked={filters.guestRating === rating}
                onChange={() => onFiltersChange({ ...filters, guestRating: rating })}
                className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                {rating}+ {t.andAbove}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.amenities}</h4>
        <div className="space-y-2">
          {amenityOptions.map((amenity) => (
            <label key={amenity.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity.value)}
                onChange={() => toggleAmenity(amenity.value)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{amenity.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Meal Plans */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.mealPlans}</h4>
        <div className="space-y-2">
          {mealPlanOptions.map((plan) => (
            <label key={plan.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.mealPlans.includes(plan.value)}
                onChange={() => toggleMealPlan(plan.value)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{plan.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.propertyType}</h4>
        <div className="space-y-2">
          {propertyTypeOptions.map((type) => (
            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.propertyTypes.includes(type.value)}
                onChange={() => togglePropertyType(type.value)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">{t.cancellation}</h4>
        <div className="space-y-2">
          {cancellationOptions.map((policy) => (
            <label key={policy.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.cancellationPolicy.includes(policy.value)}
                onChange={() => toggleCancellationPolicy(policy.value)}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{policy.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
