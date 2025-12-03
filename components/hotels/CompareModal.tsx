'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MapPin, Check, Minus, DollarSign, Award, Wifi, Car, Dumbbell, UtensilsCrossed, ShieldCheck, Clock } from 'lucide-react';
import Image from 'next/image';
import { useHotelCompare } from '@/contexts/HotelCompareContext';
import type { LiteAPIHotel } from '@/lib/hotels/types';

interface CompareRowProps {
  label: string;
  icon?: React.ReactNode;
  values: (string | number | boolean | null | undefined)[];
  type?: 'text' | 'stars' | 'price' | 'rating' | 'boolean' | 'amenity';
  highlight?: 'lowest' | 'highest' | 'best';
}

function CompareRow({ label, icon, values, type = 'text', highlight }: CompareRowProps) {
  // Find the best value for highlighting
  let bestIndex = -1;
  if (highlight && values.length > 1) {
    const numericValues = values.map(v => typeof v === 'number' ? v : parseFloat(String(v)) || 0);
    if (highlight === 'lowest') {
      const validValues = numericValues.filter(v => v > 0);
      if (validValues.length > 0) {
        const minVal = Math.min(...validValues);
        bestIndex = numericValues.findIndex(v => v === minVal);
      }
    } else if (highlight === 'highest' || highlight === 'best') {
      bestIndex = numericValues.indexOf(Math.max(...numericValues));
    }
  }

  const renderValue = (value: typeof values[0], index: number) => {
    const isBest = index === bestIndex;
    const baseClasses = isBest ? 'bg-green-50 text-green-700 font-bold' : '';

    switch (type) {
      case 'stars':
        const stars = typeof value === 'number' ? value : 0;
        return (
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${baseClasses}`}>
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            {stars === 0 && <span className="text-gray-400">-</span>}
          </div>
        );

      case 'price':
        const price = typeof value === 'number' ? value : 0;
        return (
          <span className={`px-2 py-1 rounded ${isBest ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
            {price > 0 ? `$${Math.round(price)}` : '-'}
          </span>
        );

      case 'rating':
        const rating = typeof value === 'number' ? value : 0;
        return (
          <div className={`flex items-center gap-1 px-2 py-1 rounded ${baseClasses}`}>
            <span className="font-semibold">{rating > 0 ? rating.toFixed(1) : '-'}</span>
            {rating > 0 && <span className="text-sm text-gray-500">/10</span>}
          </div>
        );

      case 'boolean':
        return value ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <Minus className="w-5 h-5 text-gray-300" />
        );

      case 'amenity':
        return value ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-red-400" />
        );

      default:
        return (
          <span className={`px-2 py-1 rounded ${baseClasses}`}>
            {value || '-'}
          </span>
        );
    }
  };

  return (
    <div className="grid gap-4 py-3 border-b border-gray-100" style={{ gridTemplateColumns: `180px repeat(${values.length}, 1fr)` }}>
      <div className="flex items-center gap-2 text-gray-600 font-medium">
        {icon}
        {label}
      </div>
      {values.map((value, index) => (
        <div key={index} className="flex items-center justify-center">
          {renderValue(value, index)}
        </div>
      ))}
    </div>
  );
}

export default function CompareModal() {
  const { compareList, removeFromCompare, isCompareOpen, setCompareOpen, clearCompare } = useHotelCompare();

  if (!isCompareOpen || compareList.length < 2) return null;

  const hasAmenity = (hotel: LiteAPIHotel, keyword: string): boolean => {
    const amenities = hotel.amenities || [];
    return amenities.some(a => a.toLowerCase().includes(keyword.toLowerCase()));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setCompareOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-orange-500" />
              Compare Hotels
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={clearCompare}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setCompareOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* Hotel Cards Row */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, 1fr)` }}>
                <div /> {/* Empty cell for label column */}
                {compareList.map((hotel) => (
                  <div key={hotel.id} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(hotel.id)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-red-50 rounded-full shadow-md transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                    </button>

                    {/* Hotel image */}
                    <div className="h-36 relative bg-gray-100">
                      {hotel.images?.[0]?.url || hotel.thumbnail ? (
                        <Image
                          src={hotel.images?.[0]?.url || hotel.thumbnail || ''}
                          alt={hotel.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Hotel info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1">
                        {hotel.name}
                      </h3>
                      {hotel.lowestPricePerNight && (
                        <p className="text-lg font-bold text-orange-600">
                          ${Math.round(hotel.lowestPricePerNight)}
                          <span className="text-xs font-normal text-gray-500">/night</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                  Price & Rating
                </h3>

                <CompareRow
                  label="Price/Night"
                  icon={<DollarSign className="w-4 h-4" />}
                  values={compareList.map(h => h.lowestPricePerNight || 0)}
                  type="price"
                  highlight="lowest"
                />

                <CompareRow
                  label="Star Rating"
                  icon={<Star className="w-4 h-4" />}
                  values={compareList.map(h => h.rating || 0)}
                  type="stars"
                  highlight="highest"
                />

                <CompareRow
                  label="Guest Rating"
                  icon={<Award className="w-4 h-4" />}
                  values={compareList.map(h => h.reviewScore || 0)}
                  type="rating"
                  highlight="highest"
                />

                <CompareRow
                  label="Location"
                  icon={<MapPin className="w-4 h-4" />}
                  values={compareList.map(h => h.location?.city || (h as any).city || '-')}
                />

                <h3 className="font-semibold text-gray-800 mt-6 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  Cancellation Policy
                </h3>

                <CompareRow
                  label="Free Cancellation"
                  icon={<ShieldCheck className="w-4 h-4" />}
                  values={compareList.map(h => (h as any).hasRefundableRate || (h as any).refundable || false)}
                  type="amenity"
                />

                <CompareRow
                  label="Meal Plan"
                  icon={<UtensilsCrossed className="w-4 h-4" />}
                  values={compareList.map(h => {
                    const boardType = (h as any).boardType || 'RO';
                    const boardNames: Record<string, string> = {
                      'RO': 'Room Only',
                      'BB': 'Breakfast',
                      'HB': 'Half Board',
                      'FB': 'Full Board',
                      'AI': 'All Inclusive',
                    };
                    return boardNames[boardType] || boardType;
                  })}
                />

                <h3 className="font-semibold text-gray-800 mt-6 mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-500" />
                  Amenities
                </h3>

                <CompareRow
                  label="Free WiFi"
                  icon={<Wifi className="w-4 h-4" />}
                  values={compareList.map(h => hasAmenity(h, 'wifi') || hasAmenity(h, 'internet'))}
                  type="amenity"
                />

                <CompareRow
                  label="Parking"
                  icon={<Car className="w-4 h-4" />}
                  values={compareList.map(h => hasAmenity(h, 'parking'))}
                  type="amenity"
                />

                <CompareRow
                  label="Fitness Center"
                  icon={<Dumbbell className="w-4 h-4" />}
                  values={compareList.map(h => hasAmenity(h, 'fitness') || hasAmenity(h, 'gym'))}
                  type="amenity"
                />

                <CompareRow
                  label="Restaurant"
                  icon={<UtensilsCrossed className="w-4 h-4" />}
                  values={compareList.map(h => hasAmenity(h, 'restaurant'))}
                  type="amenity"
                />

                <CompareRow
                  label="Pool"
                  values={compareList.map(h => hasAmenity(h, 'pool') || hasAmenity(h, 'swimming'))}
                  type="amenity"
                />

                <CompareRow
                  label="Spa"
                  values={compareList.map(h => hasAmenity(h, 'spa') || hasAmenity(h, 'wellness'))}
                  type="amenity"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
