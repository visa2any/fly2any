'use client';

import { useState } from 'react';
import { Star, Users, Gauge, Fuel, Settings, CheckCircle2, Zap, Shield, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';


// ===========================
// TYPE DEFINITIONS
// ===========================

export interface CarRental {
  id: string;
  name: string;
  category: string;
  company: string;
  passengers: number;
  transmission: string;
  fuelType: string;
  pricePerDay: number;
  totalPrice?: number;
  image: string;
  features: string[];
  doors?: number;
  luggage?: number;
  airConditioning?: boolean;
  unlimited_mileage?: boolean;
  rating?: number;
  reviewCount?: number;
  location?: string;
  available?: number;
  insurance_included?: boolean;
  instant_confirmation?: boolean;
  // Rental policies from API
  mileage?: {
    unlimited?: boolean;
    included?: string;
    extraMileageCost?: string | null;
  };
  insurance?: {
    included?: boolean;
    cdwIncluded?: boolean;
    theftProtection?: boolean;
    liabilityAmount?: string;
    deductible?: string;
    type?: string;
  };
  fuelPolicy?: {
    type?: string;
    description?: string;
    fuelType?: string;
  };
  driverRequirements?: {
    minimumAge?: number;
    youngDriverAge?: number;
    youngDriverFee?: string;
    licenseHeldYears?: number;
  };
  cancellation?: {
    freeCancellationHours?: number;
    policy?: string;
    noShowFee?: string;
  };
  additionalFees?: {
    additionalDriver?: string;
    gps?: string;
    childSeat?: string;
    tollPass?: string;
    oneWayFee?: string | null;
  };
  termsAndConditions?: {
    depositRequired?: boolean;
    depositAmount?: string;
    creditCardOnly?: boolean;
    inspectionRequired?: boolean;
    gracePeriodMinutes?: number;
    lateReturnFee?: string;
  };
  // Location info with contact details
  pickupLocationInfo?: {
    code?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
    coordinates?: { lat: number; lng: number };
  };
  dropoffLocationInfo?: {
    code?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
    coordinates?: { lat: number; lng: number };
  };
}

interface CarCardProps {
  car: CarRental;
  days: number;
  onSelect?: () => void;
}

// ===========================
// CAR CARD COMPONENT
// ===========================

export function CarCard({ car, days, onSelect }: CarCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const totalPrice = Math.round((car.totalPrice || car.pricePerDay * days) * 100) / 100;
  const originalPrice = Math.round(car.pricePerDay * days * 100) / 100;
  const savingsAmount = Math.round((originalPrice - totalPrice) * 100) / 100;
  const hasSavings = savingsAmount > 0.01; // Only show if savings > 1 cent
  const savingsPercent = hasSavings ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  const getCategoryColor = (category: string) => {
    const colors = {
      'Sedan': 'bg-blue-100 text-blue-700 border-blue-200',
      'SUV': 'bg-green-100 text-green-700 border-green-200',
      'Sports': 'bg-red-100 text-red-700 border-red-200',
      'Luxury': 'bg-purple-100 text-purple-700 border-purple-200',
      'Van': 'bg-orange-100 text-orange-700 border-orange-200',
      'Compact': 'bg-teal-100 text-teal-700 border-teal-200',
      'Economy': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Use the image from the API (now local AI-generated PNGs via car-photos.ts)
  const imageUrl = car.image || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex flex-col md:flex-row">
        {/* PHOTO - Left Side (320px) - Local AI-generated car images */}
        <div className="md:w-80 h-48 md:h-auto relative bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={car.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain p-4"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H21M3.375 14.25h.008M21 14.25h-5.625m0 0L13.5 9.75m1.875 4.5h1.875M6 14.25H3.375m0 0V9.75L5.625 6h8.25l2.25 3.75" />
              </svg>
              <span className="text-xs font-medium">{car.category || 'Car'}</span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getCategoryColor(car.category)}`}>
              {car.category}
            </span>
          </div>

          {/* Company Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-900">{car.company}</span>
          </div>

          {/* Savings Badge */}
          {hasSavings && (
            <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-lg">
              <span className="text-xs font-bold">SAVE {savingsPercent}%</span>
            </div>
          )}
        </div>

        {/* ALL INFO - Right Side */}
        <div className="flex-1 p-3 flex flex-col">
          {/* HEADER - Car Name, Rating */}
          <div className="mb-2">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-extrabold text-slate-900 leading-tight flex-1" style={{ fontSize: '18px' }}>
                {car.name}
              </h3>

              {car.rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <div className="bg-primary-600 text-white px-2 py-0.5 rounded font-bold text-sm">
                    {car.rating.toFixed(1)}
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    {car.rating >= 4.5 ? 'Excellent' : car.rating >= 4 ? 'Very Good' : 'Good'}
                  </span>
                </div>
              )}
            </div>

            {/* Review Count */}
            {car.reviewCount && (
              <p className="text-sm text-slate-600">
                {car.reviewCount.toLocaleString()} reviews
              </p>
            )}
          </div>

          {/* SPECS - Transmission, Passengers, Fuel */}
          <div className="flex flex-wrap items-center gap-3 mb-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{car.passengers} seats</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{car.transmission}</span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-700">
              <Fuel className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{car.fuelType}</span>
            </div>

            {car.doors && (
              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                <span className="font-medium">{car.doors} doors</span>
              </div>
            )}

            {car.luggage && (
              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                <span className="font-medium">{car.luggage} bags</span>
              </div>
            )}
          </div>

          {/* FEATURES - AC, GPS, etc. */}
          <div className="flex flex-wrap gap-2 mb-2">
            {car.features.slice(0, 6).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold border border-slate-200"
              >
                {feature}
              </span>
            ))}
            {car.features.length > 6 && (
              <span className="text-xs text-slate-600 py-1">
                +{car.features.length - 6} more
              </span>
            )}
          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {car.unlimited_mileage && (
              <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                <Zap className="w-3 h-3" />
                <span className="font-semibold">Unlimited Mileage</span>
              </div>
            )}

            {car.insurance_included && (
              <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                <Shield className="w-3 h-3" />
                <span className="font-semibold">Insurance Included</span>
              </div>
            )}

            {car.instant_confirmation && (
              <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-semibold">Instant Confirmation</span>
              </div>
            )}
          </div>

          {/* LOCATION */}
          {car.location && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-3">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Pickup: {car.location}</span>
            </div>
          )}

          {/* PRICE + ACTION - Bottom Right (with mt-auto) */}
          <div className="mt-auto pt-3 border-t border-slate-200 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                {hasSavings && (
                  <span className="text-lg text-slate-500 line-through font-medium">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-3xl font-extrabold text-primary-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                ${car.pricePerDay.toFixed(2)}/day · {days} day{days > 1 ? 's' : ''}
              </p>
              {hasSavings && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  You save ${savingsAmount.toFixed(2)}
                </p>
              )}
            </div>

            <button
              onClick={onSelect}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-bold text-sm hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              Select Car →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
