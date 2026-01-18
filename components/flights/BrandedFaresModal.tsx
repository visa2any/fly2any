'use client';

import { useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import { X, Check, AlertCircle } from 'lucide-react';
import type { ParsedBrandedFares, BrandedFare } from '@/lib/flights/branded-fares-parser';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

interface BrandedFaresModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandedFares: ParsedBrandedFares;
  onSelectFare?: (fare: BrandedFare) => void;
}

export default function BrandedFaresModal({
  isOpen,
  onClose,
  brandedFares,
  onSelectFare,
}: BrandedFaresModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { lockScroll, unlockScroll } = useScrollLock();

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Centralized scroll lock management (prevents conflicts)
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll(); // Guaranteed cleanup
    };
  }, [isOpen, lockScroll, unlockScroll]);

  if (!isOpen || !brandedFares.hasRealData) return null;

  const features = [
    { key: 'includedBags', label: '🎒 Checked Bags', format: (val: number) => val > 0 ? val.toString() : 'None' },
    { key: 'changeable', label: '🔄 Changes', format: (val: boolean, fee: number | null) => {
      if (!val) return 'Not allowed';
      return fee && fee > 0 ? `$${fee} fee` : 'Free';
    }},
    { key: 'refundable', label: '💰 Refunds', format: (val: boolean, fee: number | null) => {
      if (!val) return 'Not allowed';
      return fee && fee > 0 ? `$${fee} fee` : 'Free';
    }},
    { key: 'seatSelectionIncluded', label: '💺 Seat Selection', format: (val: boolean, fee: number | null) => {
      if (!val) return 'Not included';
      return fee && fee > 0 ? `$${fee} fee` : 'Free';
    }},
    { key: 'priorityBoarding', label: '🎟️ Priority Boarding', format: (val: boolean) => val ? 'Included' : 'No' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="branded-fares-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: true,
          escapeDeactivates: false, // We handle Escape manually
        }}
      >
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 id="branded-fares-title" className="text-xl font-bold text-gray-900">Compare Fare Options</h2>
            <p className="text-sm text-gray-600 mt-1">Choose the fare that best fits your needs</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-3 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Savings Insight */}
          {brandedFares.savingsInsight && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">💡 Smart Tip</p>
                <p className="text-sm text-blue-700 mt-1">{brandedFares.savingsInsight}</p>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700"></th>
                  {brandedFares.fares.map((fare) => (
                    <th key={fare.type} className="text-center py-3 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-base font-bold text-gray-900">{fare.type}</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${Math.round(fare.price)}
                        </span>
                        {fare.isSelected && (
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                            CURRENT
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Checked Bags */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-700">🎒 Checked Bags</td>
                  {brandedFares.fares.map((fare) => (
                    <td key={fare.type} className="py-4 px-4 text-center">
                      <span className={`font-medium ${fare.includedBags > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                        {fare.includedBags > 0 ? fare.includedBags : 'None'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Changes */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-700">🔄 Changes</td>
                  {brandedFares.fares.map((fare) => (
                    <td key={fare.type} className="py-4 px-4 text-center">
                      {fare.changeable ? (
                        <span className={fare.changeFee && fare.changeFee > 0 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                          {fare.changeFee && fare.changeFee > 0 ? `$${fare.changeFee} fee` : 'Free'}
                        </span>
                      ) : (
                        <span className="text-red-600">Not allowed</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Refunds */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-700">💰 Refunds</td>
                  {brandedFares.fares.map((fare) => (
                    <td key={fare.type} className="py-4 px-4 text-center">
                      {fare.refundable ? (
                        <span className={fare.refundFee && fare.refundFee > 0 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                          {fare.refundFee && fare.refundFee > 0 ? `$${fare.refundFee} fee` : 'Free'}
                        </span>
                      ) : (
                        <span className="text-red-600">Not allowed</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Seat Selection */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-700">💺 Seat Selection</td>
                  {brandedFares.fares.map((fare) => (
                    <td key={fare.type} className="py-4 px-4 text-center">
                      {fare.seatSelectionIncluded ? (
                        <span className={fare.seatSelectionFee && fare.seatSelectionFee > 0 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                          {fare.seatSelectionFee && fare.seatSelectionFee > 0 ? `$${fare.seatSelectionFee} fee` : 'Free'}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not included</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Priority Boarding */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-700">🎟️ Priority Boarding</td>
                  {brandedFares.fares.map((fare) => (
                    <td key={fare.type} className="py-4 px-4 text-center">
                      {fare.priorityBoarding ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Additional Amenities */}
          {brandedFares.fares.some(f => f.amenities.length > 0) && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Benefits:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {brandedFares.fares.map((fare) => (
                  <div key={fare.type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-sm text-gray-900 mb-2">{fare.type}</p>
                    {fare.amenities.length > 0 ? (
                      <ul className="space-y-1">
                        {fare.amenities.map((amenity, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                            <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 italic">Standard benefits</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600">
            ✓ Verified pricing from airline
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            {onSelectFare && (
              <button
                onClick={() => {
                  const selectedFare = brandedFares.fares.find(f => f.isSelected);
                  if (selectedFare) {
                    onSelectFare(selectedFare);
                    onClose();
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Continue with {brandedFares.currentFareType}
              </button>
            )}
          </div>
        </div>
      </div>
      </FocusTrap>
    </div>
  );
}
