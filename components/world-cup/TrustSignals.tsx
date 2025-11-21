'use client';

import { ShieldCheckIcon, StarIcon, CheckBadgeIcon, CreditCardIcon } from '@heroicons/react/24/solid';

interface TrustSignalsProps {
  variant?: 'compact' | 'full' | 'badges';
  className?: string;
}

export function TrustSignals({ variant = 'full', className = '' }: TrustSignalsProps) {
  const badges = (
    <div className={`flex items-center justify-center gap-4 flex-wrap ${className}`}>
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
        <ShieldCheckIcon className="w-5 h-5 text-green-600" />
        <span className="text-sm font-semibold text-green-900">Secure Booking</span>
      </div>
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
        <CreditCardIcon className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">Price Match Guarantee</span>
      </div>
      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-2">
        <CheckBadgeIcon className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-semibold text-purple-900">Free Cancellation</span>
      </div>
    </div>
  );

  if (variant === 'badges') {
    return badges;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-8 flex-wrap ${className}`}>
        <div className="flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-yellow-500" />
          <div className="text-sm">
            <div className="font-bold">4.8/5</div>
            <div className="text-gray-600">12,847 reviews</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-green-600" />
          <div className="text-sm">
            <div className="font-bold">Secure Payment</div>
            <div className="text-gray-600">256-bit SSL</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
          <div className="text-sm">
            <div className="font-bold">Best Price</div>
            <div className="text-gray-600">Guaranteed</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Testimonial 1 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700 mb-4">
            "Booked our Brazil World Cup package through Fly2Any. Everything was perfect - flights, hotel, tickets. Couldn't have asked for better service!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              JM
            </div>
            <div>
              <div className="font-semibold text-sm">John Martinez</div>
              <div className="text-xs text-gray-500">Miami, FL • March 2024</div>
            </div>
          </div>
        </div>

        {/* Testimonial 2 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700 mb-4">
            "Best travel agency for sports events. Got amazing seats and stayed at a 5-star hotel near the stadium. Worth every penny!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              SC
            </div>
            <div>
              <div className="font-semibold text-sm">Sarah Chen</div>
              <div className="text-xs text-gray-500">Los Angeles, CA • Feb 2024</div>
            </div>
          </div>
        </div>

        {/* Testimonial 3 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-700 mb-4">
            "Incredible experience! The package included everything we needed. Customer support was responsive and helpful throughout our trip."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              DR
            </div>
            <div>
              <div className="font-semibold text-sm">David Rodriguez</div>
              <div className="text-xs text-gray-500">Dallas, TX • Jan 2024</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8">
        {badges}
      </div>

      {/* Money-Back Guarantee */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
        <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">100% Money-Back Guarantee</h3>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Not satisfied with your booking? Cancel within 24 hours for a full refund. No questions asked.
          Your satisfaction is our top priority.
        </p>
      </div>
    </div>
  );
}
