'use client';

import { CheckCircle, Download, Mail, Calendar, Plane, User, CreditCard, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { PassengerInfo } from './PassengerDetailsWidget';

interface BookingConfirmationWidgetProps {
  bookingReference: string;
  pnr?: string;
  flight: {
    airline?: string;
    flightNumber?: string;
    origin?: string;
    destination?: string;
    departureDate?: string;
    departureTime?: string;
    arrivalTime?: string;
  };
  passengers: PassengerInfo[];
  totalPaid: number;
  currency: string;
  confirmationEmail: string;
  onDownloadTicket?: () => void;
  onViewBooking?: () => void;
}

export function BookingConfirmationWidget({
  bookingReference,
  pnr,
  flight,
  passengers,
  totalPaid,
  currency,
  confirmationEmail,
  onDownloadTicket,
  onViewBooking,
}: BookingConfirmationWidgetProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPNR, setCopiedPNR] = useState(false);

  const copyToClipboard = async (text: string, type: 'ref' | 'pnr') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'ref') {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
      } else {
        setCopiedPNR(true);
        setTimeout(() => setCopiedPNR(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-black mb-2">Booking Confirmed!</h2>
        <p className="text-green-100 text-lg">
          Your flight has been successfully booked
        </p>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Booking Reference */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl p-6">
          <div className="text-center mb-4">
            <p className="text-sm font-semibold text-primary-900 mb-2">
              Your Booking Reference
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl font-black text-primary-600 tracking-wider font-mono">
                {bookingReference}
              </span>
              <button
                onClick={() => copyToClipboard(bookingReference, 'ref')}
                className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
                title="Copy booking reference"
              >
                {copiedRef ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-primary-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-primary-700 mt-2">
              Save this number - you'll need it to manage your booking
            </p>
          </div>

          {pnr && pnr !== bookingReference && (
            <div className="text-center pt-4 border-t border-primary-200">
              <p className="text-xs font-semibold text-primary-900 mb-1">
                Airline PNR (Booking Reference)
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-primary-700 tracking-wider font-mono">
                  {pnr}
                </span>
                <button
                  onClick={() => copyToClipboard(pnr, 'pnr')}
                  className="p-1 hover:bg-primary-200 rounded-lg transition-colors"
                  title="Copy PNR"
                >
                  {copiedPNR ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-primary-700 mt-1">
                Use this at the airline check-in counter
              </p>
            </div>
          )}
        </div>

        {/* Flight Details */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-gray-700" />
            <h3 className="font-bold text-gray-900">Flight Details</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Airline</span>
              <span className="font-semibold text-gray-900">
                {flight.airline} {flight.flightNumber}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Route</span>
              <span className="font-semibold text-gray-900">
                {flight.origin} → {flight.destination}
              </span>
            </div>

            {flight.departureDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Departure</span>
                <span className="font-semibold text-gray-900">
                  {flight.departureDate}
                  {flight.departureTime && ` at ${flight.departureTime}`}
                </span>
              </div>
            )}

            {flight.arrivalTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Arrival</span>
                <span className="font-semibold text-gray-900">{flight.arrivalTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-700" />
            <h3 className="font-bold text-gray-900">
              Passenger{passengers.length > 1 ? 's' : ''}
            </h3>
          </div>

          <div className="space-y-2">
            {passengers.map((passenger, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {passenger.title.toUpperCase()}. {passenger.firstName} {passenger.lastName}
                  </div>
                  <div className="text-xs text-gray-600">{passenger.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Confirmation */}
        <div className="bg-green-50 rounded-lg p-5 border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-green-700" />
            <h3 className="font-bold text-green-900">Payment Confirmed</h3>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-green-800">Total Paid</span>
            <span className="text-2xl font-black text-green-700">
              {currency} {totalPaid.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-green-700 mt-3">
            A payment receipt has been sent to <strong>{confirmationEmail}</strong>
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-info-50 rounded-lg p-5 border border-info-200">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-info-600" />
            <h3 className="font-bold text-neutral-800">What's Next?</h3>
          </div>

          <ol className="space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>
                Check your email at <strong>{confirmationEmail}</strong> for your e-ticket
                and booking details
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>
                Arrive at the airport at least 2 hours before departure for international
                flights (1 hour for domestic)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>
                Use your booking reference <strong>{bookingReference}</strong> or PNR{' '}
                {pnr && <strong>{pnr}</strong>} to check in online or at the airport
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>Don't forget to bring valid ID and passport (for international travel)</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {onDownloadTicket && (
            <button
              onClick={onDownloadTicket}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download E-Ticket</span>
            </button>
          )}

          {onViewBooking && (
            <button
              onClick={onViewBooking}
              className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>View Booking</span>
            </button>
          )}
        </div>

        {/* Support */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Need help with your booking?{' '}
            <a
              href="mailto:support@fly2any.com"
              className="text-primary-600 font-semibold underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-600">
          Thank you for booking with FLY2ANY. Have a great trip! ✈️
        </p>
      </div>
    </div>
  );
}
