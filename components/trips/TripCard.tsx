'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

interface Flight {
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  duration: string;
  class: string;
}

interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
  seatOutbound?: string;
  seatReturn?: string;
}

export interface Trip {
  id: string;
  bookingReference: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  type: string;
  outbound: Flight;
  return?: Flight;
  passengers: Passenger[];
  bookingDate: string;
  totalPrice: number;
  currency: string;
  paymentStatus: string;
  checkInAvailable: boolean;
  flightStatus: string;
  cancellationDate?: string;
  cancellationReason?: string;
}

interface TripCardProps {
  trip: Trip;
  onViewDetails: () => void;
  onCheckIn?: () => void;
  onManage?: () => void;
  onCancel?: () => void;
  translations: any;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onViewDetails,
  onCheckIn,
  onManage,
  onCancel,
  translations: t,
}) => {
  const getDaysUntilDeparture = () => {
    const now = new Date();
    const departure = new Date(trip.outbound.departureDate);
    const diffTime = departure.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = () => {
    const statusStyles = {
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    const statusLabels = {
      upcoming: t.upcoming,
      completed: t.completed,
      cancelled: t.cancelled,
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[trip.status]}`}>
        {statusLabels[trip.status]}
      </span>
    );
  };

  const getFlightStatusBadge = () => {
    if (trip.status !== 'upcoming') return null;

    const statusStyles = {
      'on-time': 'bg-green-50 text-green-700',
      'delayed': 'bg-orange-50 text-orange-700',
      'cancelled': 'bg-red-50 text-red-700',
      'scheduled': 'bg-gray-50 text-gray-700',
    };

    const statusLabels = {
      'on-time': t.onTime || 'On Time',
      'delayed': t.delayed || 'Delayed',
      'cancelled': t.cancelled,
      'scheduled': t.scheduled || 'Scheduled',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[trip.flightStatus as keyof typeof statusStyles]}`}>
        {statusLabels[trip.flightStatus as keyof typeof statusLabels]}
      </span>
    );
  };

  const daysUntil = getDaysUntilDeparture();

  return (
    <Card variant="elevated" padding="none" hover className="overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge()}
              {getFlightStatusBadge()}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t.bookingRef}: <span className="font-semibold text-gray-700">{trip.bookingReference}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              ${trip.totalPrice.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{trip.currency}</p>
          </div>
        </div>

        {/* Flight Route - Outbound */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{t.from || 'From'}</p>
              <p className="text-lg font-bold text-gray-900">{trip.outbound.from}</p>
              <p className="text-sm text-gray-600">{trip.outbound.fromCity}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(trip.outbound.departureDate).toLocaleDateString()} {trip.outbound.departureTime}
              </p>
            </div>

            <div className="flex-shrink-0 px-4">
              <div className="flex flex-col items-center">
                <svg className="w-6 h-6 text-primary-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <p className="text-xs text-gray-500">{trip.outbound.duration}</p>
              </div>
            </div>

            <div className="flex-1 text-right">
              <p className="text-xs text-gray-500 mb-1">{t.to || 'To'}</p>
              <p className="text-lg font-bold text-gray-900">{trip.outbound.to}</p>
              <p className="text-sm text-gray-600">{trip.outbound.toCity}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(trip.outbound.arrivalDate).toLocaleDateString()} {trip.outbound.arrivalTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <span className="font-medium">{trip.outbound.airline}</span>
            <span className="text-gray-400">•</span>
            <span>{trip.outbound.flightNumber}</span>
            <span className="text-gray-400">•</span>
            <span>{trip.outbound.class}</span>
          </div>
        </div>

        {/* Return Flight */}
        {trip.return && (
          <div className="mb-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">{t.returnFlight || 'RETURN FLIGHT'}</p>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{trip.return.from}</p>
                <p className="text-xs text-gray-500">
                  {new Date(trip.return.departureDate).toLocaleDateString()} {trip.return.departureTime}
                </p>
              </div>

              <div className="flex-shrink-0 px-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <div className="flex-1 text-right">
                <p className="text-sm font-semibold text-gray-900">{trip.return.to}</p>
                <p className="text-xs text-gray-500">
                  {new Date(trip.return.arrivalDate).toLocaleDateString()} {trip.return.arrivalTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Countdown for upcoming trips */}
        {trip.status === 'upcoming' && daysUntil >= 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-blue-900">
                {daysUntil === 0 ? t.departingToday || 'Departing Today!' :
                 daysUntil === 1 ? t.departingTomorrow || 'Departing Tomorrow!' :
                 `${daysUntil} ${t.daysUntilDeparture || 'days until departure'}`}
              </p>
            </div>
          </div>
        )}

        {/* Passengers */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">{t.passengers || 'PASSENGERS'}</p>
          <div className="flex flex-wrap gap-2">
            {trip.passengers.map((passenger) => (
              <div key={passenger.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-700">
                    {passenger.firstName[0]}{passenger.lastName[0]}
                  </span>
                </div>
                <span className="text-sm text-gray-700">
                  {passenger.firstName} {passenger.lastName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="primary"
            size="sm"
            onClick={onViewDetails}
            className="flex-1 min-w-[120px]"
          >
            {t.viewDetails || 'View Details'}
          </Button>

          {trip.status === 'upcoming' && trip.checkInAvailable && onCheckIn && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onCheckIn}
              className="flex-1 min-w-[120px]"
            >
              {t.checkIn || 'Check In'}
            </Button>
          )}

          {trip.status === 'upcoming' && onManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManage}
              className="flex-1 min-w-[120px]"
            >
              {t.manage || 'Manage'}
            </Button>
          )}

          {trip.status === 'upcoming' && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-red-600 hover:bg-red-50"
            >
              {t.cancel || 'Cancel'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
