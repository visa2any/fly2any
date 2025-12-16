'use client';

/**
 * Journey Confirmation Page
 * Fly2Any Travel Operating System
 * Level 6 Ultra-Premium / Apple-Class
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Plane,
  Building2,
  Sparkles,
  Calendar,
  Users,
  Download,
  Share2,
  Home,
  Mail,
  Loader2,
} from 'lucide-react';
import { Journey } from '@/lib/journey/types';
import { PricingAggregator } from '@/lib/journey/services/PricingAggregator';
import { format, parseISO } from 'date-fns';

interface ConfirmationData {
  id: string;
  journey: Journey;
  travelers: Array<{
    firstName: string;
    lastName: string;
    email?: string;
  }>;
  bookedAt: string;
}

export default function JourneyConfirmationPage() {
  const [data, setData] = useState<ConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('journey_confirmation');
    if (stored) {
      setData(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#D63A35]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No confirmation found</h2>
        <p className="text-gray-600 mb-4">Please complete a booking first.</p>
        <Link
          href="/journey"
          className="px-6 py-3 bg-[#D63A35] text-white rounded-xl font-medium"
        >
          Start New Journey
        </Link>
      </div>
    );
  }

  const { journey } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Journey Booked!</h1>
          <p className="text-green-100">
            Confirmation #{data.id}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Journey Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="p-6">
            {/* Route */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#D63A35]/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#D63A35]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {journey.origin.code} → {journey.destination.code}
                </h2>
                <p className="text-gray-500">
                  {format(parseISO(journey.departureDate), 'MMM d')} - {format(parseISO(journey.returnDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
              <div>
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="font-medium text-gray-900">{journey.duration} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Travelers</p>
                <p className="font-medium text-gray-900">
                  {journey.travelers.adults + journey.travelers.children} guests
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                <p className="font-medium text-[#D63A35]">
                  {PricingAggregator.formatPrice(journey.pricing.total, journey.pricing.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmed
                </span>
              </div>
            </div>

            {/* Included Items */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                What's Included
              </h3>

              {journey.pricing.flights.subtotal > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Plane className="w-5 h-5 text-[#D63A35]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Round-trip Flights</p>
                    <p className="text-sm text-gray-500">
                      {journey.pricing.flights.items.length} flight(s)
                    </p>
                  </div>
                  <span className="font-medium">
                    {PricingAggregator.formatPrice(journey.pricing.flights.subtotal, journey.pricing.currency)}
                  </span>
                </div>
              )}

              {journey.pricing.hotels.subtotal > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Building2 className="w-5 h-5 text-[#D63A35]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Accommodation</p>
                    <p className="text-sm text-gray-500">
                      {journey.pricing.hotels.items[0]?.quantity || journey.duration - 1} nights
                    </p>
                  </div>
                  <span className="font-medium">
                    {PricingAggregator.formatPrice(journey.pricing.hotels.subtotal, journey.pricing.currency)}
                  </span>
                </div>
              )}

              {journey.pricing.experiences.subtotal > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#D63A35]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Experiences</p>
                    <p className="text-sm text-gray-500">
                      {journey.pricing.experiences.items.length} activities
                    </p>
                  </div>
                  <span className="font-medium">
                    {PricingAggregator.formatPrice(journey.pricing.experiences.subtotal, journey.pricing.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Mail className="w-4 h-4" />
              Email Confirmation
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Confirmation email sent</p>
                <p className="text-sm text-gray-500">Check your inbox for booking details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add to calendar</p>
                <p className="text-sm text-gray-500">Never miss your travel dates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Invite travel companions</p>
                <p className="text-sm text-gray-500">Share the itinerary with your group</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D63A35] text-white font-semibold rounded-xl hover:bg-[#C7342F] transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
