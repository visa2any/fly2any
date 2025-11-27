'use client';

import { Shield, BadgeCheck, CreditCard, Lock, RefreshCw, Headphones, Award, Star, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrustBadgesProps {
  variant?: 'compact' | 'full' | 'checkout';
  showPriceGuarantee?: boolean;
  showFreeCancellation?: boolean;
  showSecurePayment?: boolean;
  className?: string;
}

const trustFeatures = {
  priceGuarantee: {
    icon: Award,
    title: 'Best Price Guarantee',
    description: 'Find it cheaper? We\'ll match it',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  freeCancellation: {
    icon: RefreshCw,
    title: 'Free Cancellation',
    description: 'Cancel up to 24h before check-in',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  securePayment: {
    icon: Lock,
    title: 'Secure Payment',
    description: '256-bit SSL encryption',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  support247: {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We\'re here to help anytime',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  verifiedReviews: {
    icon: BadgeCheck,
    title: 'Verified Reviews',
    description: 'Real guests, real experiences',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  instantConfirmation: {
    icon: CheckCircle2,
    title: 'Instant Confirmation',
    description: 'Booking confirmed immediately',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

function CompactBadge({ feature }: { feature: keyof typeof trustFeatures }) {
  const { icon: Icon, title, color, bgColor } = trustFeatures[feature];

  return (
    <div className={`flex items-center gap-1.5 ${bgColor} px-2 py-1 rounded-full`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{title}</span>
    </div>
  );
}

function FullBadge({ feature, index }: { feature: keyof typeof trustFeatures; index: number }) {
  const { icon: Icon, title, description, color, bgColor, borderColor } = trustFeatures[feature];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-start gap-3 p-3 rounded-xl ${bgColor} border ${borderColor}`}
    >
      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <h4 className={`font-semibold text-sm ${color}`}>{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

export function HotelTrustBadges({
  variant = 'compact',
  showPriceGuarantee = true,
  showFreeCancellation = true,
  showSecurePayment = true,
  className = '',
}: TrustBadgesProps) {
  const featuresToShow: (keyof typeof trustFeatures)[] = [];

  if (showPriceGuarantee) featuresToShow.push('priceGuarantee');
  if (showFreeCancellation) featuresToShow.push('freeCancellation');
  if (showSecurePayment) featuresToShow.push('securePayment');

  // Compact variant - inline badges
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {featuresToShow.map((feature) => (
          <CompactBadge key={feature} feature={feature} />
        ))}
      </div>
    );
  }

  // Full variant - detailed cards
  if (variant === 'full') {
    const allFeatures: (keyof typeof trustFeatures)[] = [
      'priceGuarantee',
      'freeCancellation',
      'securePayment',
      'support247',
      'verifiedReviews',
      'instantConfirmation',
    ];

    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}>
        {allFeatures.map((feature, index) => (
          <FullBadge key={feature} feature={feature} index={index} />
        ))}
      </div>
    );
  }

  // Checkout variant - reassurance strip
  if (variant === 'checkout') {
    return (
      <div className={`bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl p-4 border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-gray-900">Book with Confidence</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Best Price</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Secure Pay</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Free Cancel</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-200">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600">
            Powered by <strong>Stripe</strong> secure payments
          </span>
        </div>
      </div>
    );
  }

  return null;
}

// Inline trust strip for cards
export function TrustStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-xs text-gray-500 ${className}`}>
      <span className="flex items-center gap-1">
        <Award className="w-3.5 h-3.5 text-green-500" />
        Best Price
      </span>
      <span className="flex items-center gap-1">
        <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
        Free Cancel
      </span>
      <span className="flex items-center gap-1">
        <Lock className="w-3.5 h-3.5 text-purple-500" />
        Secure
      </span>
    </div>
  );
}

export default HotelTrustBadges;
