'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, ChevronUp, Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useHotelCompare } from '@/contexts/HotelCompareContext';

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare, setCompareOpen, isCompareOpen } = useHotelCompare();

  if (compareList.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl"
      >
        {/* Compare bar content */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
                <BarChart2 className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  Compare ({compareList.length}/4)
                </span>
              </div>
            </div>

            {/* Selected hotels */}
            <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-1">
              {compareList.map((hotel) => (
                <motion.div
                  key={hotel.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 pr-8 min-w-[200px] border border-gray-200"
                >
                  {/* Hotel thumbnail */}
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                    {hotel.images?.[0]?.url || hotel.thumbnail ? (
                      <Image
                        src={hotel.images?.[0]?.url || hotel.thumbnail || ''}
                        alt={hotel.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Hotel info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {hotel.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center">
                        {Array.from({ length: hotel.rating || 0 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      {hotel.lowestPricePerNight && (
                        <span className="text-xs text-orange-600 font-semibold">
                          ${Math.round(hotel.lowestPricePerNight)}/night
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCompare(hotel.id)}
                    className="absolute top-1 right-1 p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Remove from compare"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 4 - compareList.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center justify-center w-[200px] h-14 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50"
                >
                  <span className="text-sm text-gray-400">Add hotel</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={clearCompare}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setCompareOpen(true)}
                disabled={compareList.length < 2}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  compareList.length >= 2
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                Compare Now
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
