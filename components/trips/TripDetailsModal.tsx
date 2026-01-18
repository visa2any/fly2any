'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Trip } from './TripCard';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

interface TripDetailsModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  translations: any;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
  trip,
  isOpen,
  onClose,
  translations: t,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { lockScroll, unlockScroll } = useScrollLock();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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

  if (!isOpen || !trip) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleDownloadPDF = () => {
    alert(t.downloadingTicket || 'Downloading ticket...');
  };

  const handleAddToCalendar = () => {
    alert(t.addingToCalendar || 'Adding to calendar...');
  };

  const handleShare = () => {
    alert(t.sharingTrip || 'Sharing trip...');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.tripDetails || 'Trip Details'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {t.bookingRef}: <span className="font-semibold">{trip.bookingReference}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Flight Itinerary */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t.flightItinerary || 'Flight Itinerary'}
            </h3>

            {/* Outbound Flight */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-4">{t.outboundFlight || 'OUTBOUND FLIGHT'}</p>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-blue-700 mb-1">{t.departure || 'Departure'}</p>
                  <p className="text-2xl font-bold text-gray-900">{trip.outbound.from}</p>
                  <p className="text-sm text-gray-700 mb-2">{trip.outbound.fromCity}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(trip.outbound.departureDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-lg font-bold text-primary-600">{trip.outbound.departureTime}</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-300"></div>
                    <svg className="w-8 h-8 text-primary-500 mx-auto relative z-10 bg-blue-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{trip.outbound.duration}</p>
                  <p className="text-xs text-gray-500">{t.direct || 'Direct'}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-blue-700 mb-1">{t.arrival || 'Arrival'}</p>
                  <p className="text-2xl font-bold text-gray-900">{trip.outbound.to}</p>
                  <p className="text-sm text-gray-700 mb-2">{trip.outbound.toCity}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(trip.outbound.arrivalDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-lg font-bold text-primary-600">{trip.outbound.arrivalTime}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="text-gray-700">{trip.outbound.airline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>•</span>
                    <span className="font-semibold text-gray-700">{trip.outbound.flightNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>•</span>
                    <span className="text-gray-700">{trip.outbound.class}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Flight */}
            {trip.return && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <p className="text-sm font-semibold text-green-900 mb-4">{t.returnFlight || 'RETURN FLIGHT'}</p>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-green-700 mb-1">{t.departure || 'Departure'}</p>
                    <p className="text-2xl font-bold text-gray-900">{trip.return.from}</p>
                    <p className="text-sm text-gray-700 mb-2">{trip.return.fromCity}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(trip.return.departureDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-lg font-bold text-green-600">{trip.return.departureTime}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-full">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-300"></div>
                      <svg className="w-8 h-8 text-green-600 mx-auto relative z-10 bg-green-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{trip.return.duration}</p>
                    <p className="text-xs text-gray-500">{t.direct || 'Direct'}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-green-700 mb-1">{t.arrival || 'Arrival'}</p>
                    <p className="text-2xl font-bold text-gray-900">{trip.return.to}</p>
                    <p className="text-sm text-gray-700 mb-2">{trip.return.toCity}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(trip.return.arrivalDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-lg font-bold text-green-600">{trip.return.arrivalTime}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="text-gray-700">{trip.return.airline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>•</span>
                      <span className="font-semibold text-gray-700">{trip.return.flightNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>•</span>
                      <span className="text-gray-700">{trip.return.class}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Passengers */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t.passengerList || 'Passenger List'}
            </h3>

            <div className="space-y-3">
              {trip.passengers.map((passenger, index) => (
                <div key={passenger.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {passenger.firstName[0]}{passenger.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {passenger.firstName} {passenger.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{passenger.type}</p>
                    </div>
                    <div className="text-right text-sm">
                      {passenger.seatOutbound && (
                        <div className="mb-1">
                          <span className="text-gray-500">{t.outbound || 'Outbound'}: </span>
                          <span className="font-semibold text-gray-900">{passenger.seatOutbound}</span>
                        </div>
                      )}
                      {passenger.seatReturn && (
                        <div>
                          <span className="text-gray-500">{t.return || 'Return'}: </span>
                          <span className="font-semibold text-gray-900">{passenger.seatReturn}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Details */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {t.paymentDetails || 'Payment Details'}
            </h3>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t.totalAmount || 'Total Amount'}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${trip.totalPrice.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{trip.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t.paymentStatus || 'Payment Status'}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    trip.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    trip.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trip.paymentStatus.charAt(0).toUpperCase() + trip.paymentStatus.slice(1)}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    {t.bookedOn || 'Booked on'}: {new Date(trip.bookingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Booking Timeline */}
          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.bookingTimeline || 'Booking Timeline'}
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {trip.status !== 'cancelled' && <div className="w-0.5 h-full bg-gray-300 my-2"></div>}
                </div>
                <div className="flex-1 pb-8">
                  <p className="font-semibold text-gray-900">{t.bookingConfirmed || 'Booking Confirmed'}</p>
                  <p className="text-sm text-gray-500">{new Date(trip.bookingDate).toLocaleString()}</p>
                </div>
              </div>

              {trip.status === 'cancelled' ? (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{t.bookingCancelled || 'Booking Cancelled'}</p>
                    <p className="text-sm text-gray-500">{trip.cancellationDate && new Date(trip.cancellationDate).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1">{trip.cancellationReason}</p>
                  </div>
                </div>
              ) : trip.status === 'completed' ? (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{t.tripCompleted || 'Trip Completed'}</p>
                    <p className="text-sm text-gray-500">{new Date(trip.return?.arrivalDate || trip.outbound.arrivalDate).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{t.upcomingTrip || 'Upcoming Trip'}</p>
                    <p className="text-sm text-gray-500">{new Date(trip.outbound.departureDate).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={handleDownloadPDF}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              {t.downloadPDF || 'Download PDF'}
            </Button>

            <Button
              variant="outline"
              onClick={handleAddToCalendar}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            >
              {t.addToCalendar || 'Add to Calendar'}
            </Button>

            <Button
              variant="ghost"
              onClick={handleShare}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              }
            >
              {t.share || 'Share'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
