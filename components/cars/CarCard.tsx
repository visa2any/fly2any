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

  const totalPrice = car.totalPrice || car.pricePerDay * days;
  const hasSavings = car.totalPrice && car.totalPrice < car.pricePerDay * days;
  const savingsAmount = hasSavings ? (car.pricePerDay * days) - car.totalPrice! : 0;
  const savingsPercent = hasSavings ? Math.round((savingsAmount / (car.pricePerDay * days)) * 100) : 0;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex flex-col md:flex-row">
        {/* PHOTO - Left Side (320px) */}
        <div className="md:w-80 h-48 md:h-auto relative bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
          {typeof car.image === 'string' && car.image.startsWith('http') ? (
            <img
              src={car.image}
              alt={car.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="text-8xl">{car.image || '🚗'}</div>
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
                  <div className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold text-sm">
                    {car.rating.toFixed(1)}
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
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
                    ${car.pricePerDay * days}
                  </span>
                )}
                <span className="text-3xl font-extrabold text-blue-600">
                  ${totalPrice}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                ${car.pricePerDay}/day · {days} day{days > 1 ? 's' : ''}
              </p>
              {hasSavings && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  You save ${savingsAmount}
                </p>
              )}
            </div>

            <button
              onClick={onSelect}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              Select Car →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
