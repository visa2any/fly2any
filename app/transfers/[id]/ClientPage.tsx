'use client';

/**
 * Transfer Details Client Page
 * Level 6 Ultra-Premium Design
 * Custom layout for route-based transfers
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, Users, Calendar, Star, Check,
  Shield, Loader2, ShoppingBag, MapPin, Navigation, Plane, Info
} from 'lucide-react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { useExperiencesCart, typeColors } from '@/lib/cart/experiences-cart';

interface TransferData {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: string;
  maxPassengers: number;
  pickup: string;
  dropoff: string;
  price: number;
  duration: string;
  rating: string;
  features: string[];
  cancellation: string;
  date: string;
  time: string;
  passengers: number;
}

interface TransferDetailsClientProps {
  initialData: TransferData;
}

export default function TransferDetailsClient({ initialData }: TransferDetailsClientProps) {
  const router = useRouter();
  const { addItem } = useExperiencesCart();
  const transfer = initialData;

  const [selectedDate, setSelectedDate] = useState(transfer.date || '');
  const [selectedTime, setSelectedTime] = useState(transfer.time || '10:00');
  const [passengers, setPassengers] = useState(transfer.passengers || 1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const colors = typeColors.transfer;
  const totalPrice = transfer.price; // Transfer price is typically per vehicle, not per person

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  // Time slots for transfers (more options)
  const timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ];

  const handleAddToCart = useCallback(async () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    addItem({
      type: 'transfer',
      productId: transfer.id,
      name: transfer.name,
      image: '', // Transfers typically don't have images
      date: selectedDate,
      time: selectedTime,
      duration: transfer.duration,
      location: `${transfer.pickup} → ${transfer.dropoff}`,
      participants: { adults: passengers, children: 0 },
      unitPrice: transfer.price,
      totalPrice,
      currency: 'USD',
    });

    setIsAdding(false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  }, [addItem, transfer, selectedDate, selectedTime, passengers, totalPrice]);

  if (!transfer.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50/50 to-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚗</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Transfer Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't find the transfer you're looking for.</p>
          <button
            onClick={() => router.push('/transfers')}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            Browse Transfers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 shadow-sm">
        <MaxWidthContainer>
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <span className={`text-xs font-semibold ${colors.text}`}>
                  🚗 TRANSFER
                </span>
                <h1 className="text-sm font-bold text-gray-900 line-clamp-1">{transfer.name}</h1>
              </div>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      <MaxWidthContainer>
        <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center text-4xl">
                  {transfer.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{transfer.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      Up to {transfer.maxPassengers} passengers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      ~{transfer.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{transfer.rating}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Display */}
              <div className="relative pl-8 space-y-4 mb-6">
                <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal-500 to-teal-300"></div>
                <div className="relative">
                  <div className="absolute -left-5 w-3 h-3 bg-teal-500 rounded-full border-2 border-white shadow"></div>
                  <div className="pl-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Pickup</span>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      {transfer.pickup}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-5 w-3 h-3 bg-teal-300 rounded-full border-2 border-white shadow"></div>
                  <div className="pl-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Drop-off</span>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-teal-600" />
                      {transfer.dropoff}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {transfer.features.map((feature, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-sm">
                    <Check className="w-4 h-4" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2">
                  {[
                    'Professional driver',
                    'Meet & greet service',
                    'Flight tracking',
                    'Free waiting time',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-2">
                  {[
                    'Complimentary water',
                    'Child seats on request',
                    'Luggage assistance',
                    '24/7 support',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Free Cancellation</h3>
                  <p className="text-sm text-green-700">
                    {transfer.cancellation}. Full refund if cancelled 24 hours before pickup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(transfer.price)}</span>
                  <span className="text-gray-500">total</span>
                </div>

                {/* Date & Time Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1.5" />
                      Pickup Date
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    >
                      <option value="">Choose a date</option>
                      {availableDates.map(date => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1.5" />
                      Pickup Time
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1.5" />
                      Passengers
                    </label>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    >
                      {Array.from({ length: transfer.maxPassengers }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} passenger{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Flight Info Note */}
                <div className="mt-4 p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <p className="text-xs text-teal-700 flex items-start gap-2">
                    <Plane className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>For airport pickups:</strong> Your flight number will be requested after booking for real-time tracking.
                    </span>
                  </p>
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Total price</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || !selectedDate}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      isAdded
                        ? 'bg-green-500'
                        : !selectedDate
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-lg shadow-teal-500/25 hover:shadow-xl'
                    }`}
                  >
                    {isAdding ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added to Trip!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Add to Trip
                      </>
                    )}
                  </button>
                </div>

                {/* Manual Ticketing Notice */}
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/50">
                  <p className="text-xs text-amber-800 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Pending Confirmation:</strong> Your booking will be confirmed within 24 hours after checkout.
                    </span>
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  Secure Booking
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-600" />
                  Best Price
                </span>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthContainer>
    </div>
  );
}
