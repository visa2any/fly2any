'use client';

import { useEffect, useRef, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import { X, Hotel, Car, MapPin, Star, Check, Plus } from 'lucide-react';
import type { ParsedTripBundles, TripBundle } from '@/lib/flights/trip-bundles-parser';

interface TripBundlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripBundles: ParsedTripBundles;
  flightPrice: number;
  currency: string;
  onSelectBundle?: (bundle: TripBundle) => void;
}

export default function TripBundlesModal({
  isOpen,
  onClose,
  tripBundles,
  flightPrice,
  currency,
  onSelectBundle,
}: TripBundlesModalProps) {
  const [selectedHotel, setSelectedHotel] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(true);
  const [selectedPOI, setSelectedPOI] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tripBundles.hasRealData) return null;

  const bundle = tripBundles.bestBundle!;

  // Calculate current total
  const currentTotal =
    flightPrice +
    (selectedHotel && bundle.hotel ? bundle.hotel.totalPrice : 0) +
    (selectedTransfer && bundle.transfer ? bundle.transfer.price : 0) +
    (selectedPOI && bundle.poi ? bundle.poi.price || 0 : 0);

  const regularTotal =
    flightPrice +
    (selectedHotel && bundle.hotel ? Math.round(bundle.hotel.totalPrice * 1.08) : 0) +
    (selectedTransfer && bundle.transfer ? Math.round(bundle.transfer.price * 1.15) : 0) +
    (selectedPOI && bundle.poi && bundle.poi.price ? Math.round(bundle.poi.price * 1.1) : 0);

  const savings = regularTotal - currentTotal;
  const savingsPercent = regularTotal > 0 ? Math.round((savings / regularTotal) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-bundles-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: true,
          escapeDeactivates: false,
        }}
      >
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 id="trip-bundles-title" className="text-xl font-bold text-gray-900">Complete Your Trip</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {tripBundles.destination} • {tripBundles.nights} nights
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-3 hover:bg-white rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Flight (Always included) */}
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">✈️</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Flight: {tripBundles.destination}</p>
                  <p className="text-sm text-gray-600">{tripBundles.checkInDate} - {tripBundles.checkOutDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">${flightPrice}</p>
                <p className="text-xs text-green-600 font-medium">✓ Included</p>
              </div>
            </div>
          </div>

          {/* Hotel */}
          {bundle.hotel && (
            <div className="mb-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedHotel
                    ? 'bg-green-50 border-green-400'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedHotel(!selectedHotel)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Hotel className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{bundle.hotel.name}</p>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: bundle.hotel.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        {bundle.hotel.reviewScore && (
                          <span className="text-xs text-gray-600">
                            {bundle.hotel.reviewScore.toFixed(1)} ({bundle.hotel.reviewCount} reviews)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        ${bundle.hotel.pricePerNight}/night × {tripBundles.nights} nights
                      </p>
                      {bundle.hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {bundle.hotel.amenities.slice(0, 4).map((amenity, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">${bundle.hotel.totalPrice}</p>
                    {selectedHotel && (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end">
                        <Check className="w-3 h-3" /> Selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transfer */}
          {bundle.transfer && (
            <div className="mb-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTransfer
                    ? 'bg-green-50 border-green-400'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTransfer(!selectedTransfer)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        Airport Transfer - {bundle.transfer.type}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">{bundle.transfer.vehicle}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>🚗 Up to {bundle.transfer.passengerCapacity} passengers</span>
                        <span>⏱️ {bundle.transfer.duration}</span>
                        <span>📍 {bundle.transfer.distance}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Regular price: ${Math.round(bundle.transfer.price * 1.15)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">${bundle.transfer.price}</p>
                    {selectedTransfer && (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end">
                        <Check className="w-3 h-3" /> Selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* POI/Attraction */}
          {bundle.poi && bundle.poi.price && (
            <div className="mb-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPOI
                    ? 'bg-green-50 border-green-400'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPOI(!selectedPOI)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{bundle.poi.name}</p>
                      <p className="text-sm text-gray-600 mb-1">{bundle.poi.category}</p>
                      {bundle.poi.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {bundle.poi.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">${bundle.poi.price}</p>
                    {selectedPOI ? (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end">
                        <Check className="w-3 h-3" /> Selected
                      </p>
                    ) : (
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 justify-end">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Savings Info */}
          {savings > 0 && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Bundle Savings</p>
                  <p className="text-sm text-gray-600">
                    You save ${savings} ({savingsPercent}%) by booking together
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 line-through">${regularTotal}</p>
                  <p className="text-2xl font-bold text-green-600">${currentTotal}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div>
            <p className="text-xs text-gray-600">Total for {tripBundles.nights} nights</p>
            <p className="text-2xl font-bold text-gray-900">${currentTotal}</p>
            {savings > 0 && (
              <p className="text-sm text-green-600 font-medium">
                💡 Save ${savings} with bundle
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Skip for now
            </button>
            {onSelectBundle && (
              <button
                onClick={() => {
                  const selectedBundle = {
                    ...bundle,
                    hotel: selectedHotel ? bundle.hotel : null,
                    transfer: selectedTransfer ? bundle.transfer : null,
                    poi: selectedPOI ? bundle.poi : null,
                  };
                  onSelectBundle(selectedBundle);
                  onClose();
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Add Selected to Booking
              </button>
            )}
          </div>
        </div>
      </div>
      </FocusTrap>
    </div>
  );
}
