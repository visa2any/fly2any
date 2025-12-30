'use client';

import { memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Download,
  Share2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Navigation,
  Phone,
  Mail,
  MessageCircle,
  Printer,
  ChevronRight,
  Shield,
  Star,
  Info,
  HelpCircle,
  Plane,
  ExternalLink,
} from 'lucide-react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';

// Theme configurations for different experience types
const themes = {
  tour: {
    gradient: 'from-orange-50 to-amber-50',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-600',
    accentBgLight: 'bg-orange-50',
    accentBorder: 'border-orange-200',
    accentRing: 'ring-orange-500',
    icon: '🎯',
    label: 'Tour',
    returnPath: '/tours',
    returnLabel: 'Browse More Tours',
  },
  activity: {
    gradient: 'from-purple-50 to-violet-50',
    accent: 'text-purple-600',
    accentBg: 'bg-purple-600',
    accentBgLight: 'bg-purple-50',
    accentBorder: 'border-purple-200',
    accentRing: 'ring-purple-500',
    icon: '🎪',
    label: 'Activity',
    returnPath: '/activities',
    returnLabel: 'Browse More Activities',
  },
  transfer: {
    gradient: 'from-teal-50 to-cyan-50',
    accent: 'text-teal-600',
    accentBg: 'bg-teal-600',
    accentBgLight: 'bg-teal-50',
    accentBorder: 'border-teal-200',
    accentRing: 'ring-teal-500',
    icon: '🚗',
    label: 'Transfer',
    returnPath: '/transfers',
    returnLabel: 'Book Another Transfer',
  },
};

export interface ExperienceConfirmationProps {
  type: 'tour' | 'activity' | 'transfer';
  confirmationId: string;
  // Product details
  productName: string;
  productImage?: string;
  duration?: string;
  rating?: number;
  // Booking details
  date: string;
  time?: string;
  participants: number;
  // Transfer specific
  pickup?: string;
  dropoff?: string;
  flightNumber?: string;
  // Customer details
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
  // Pricing
  pricePerPerson: number;
  totalPrice: number;
  currency?: string;
  // Status
  cancellable?: boolean;
}

export const ExperienceConfirmation = memo(({
  type,
  confirmationId,
  productName,
  productImage,
  duration,
  rating,
  date,
  time,
  participants,
  pickup,
  dropoff,
  flightNumber,
  customerName,
  customerEmail,
  customerPhone,
  specialRequests,
  pricePerPerson,
  totalPrice,
  currency = 'USD',
  cancellable = true,
}: ExperienceConfirmationProps) => {
  const router = useRouter();
  const theme = themes[type];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${theme.label} Confirmation - ${productName}`,
      text: `I just booked ${productName} with Fly2Any! Confirmation: ${confirmationId}`,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    }
  };

  const handleDownload = () => {
    // In production, this would generate a PDF voucher
    window.print();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.gradient}`}>
      {/* Success Header - Apple Level 6 */}
      <div className="bg-white border-b border-gray-100">
        <MaxWidthContainer>
          <div className="py-8 md:py-12 text-center">
            {/* Success Animation */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-100 via-emerald-100 to-green-50 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100/50 animate-[bounce_1s_ease-in-out]">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-xl">{theme.icon}</span>
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-500 text-lg mb-4">
              Your {type} has been successfully booked
            </p>

            {/* Confirmation Number */}
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 ${theme.accentBgLight} rounded-full ${theme.accentBorder} border`}>
              <span className="text-gray-600 text-sm">Confirmation</span>
              <span className={`font-bold text-lg ${theme.accent}`}>{confirmationId}</span>
            </div>

            {/* Email Notification */}
            <p className="mt-4 text-gray-500 text-sm flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Confirmation sent to <strong className="text-gray-700">{customerEmail}</strong></span>
            </p>
          </div>
        </MaxWidthContainer>
      </div>

      <MaxWidthContainer>
        <div className="py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card - Apple Level 6 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">{theme.icon}</span>
                  {theme.label} Details
                </h2>

                <div className="flex gap-5">
                  {/* Product Image */}
                  {productImage && (
                    <div className="relative w-32 h-24 md:w-40 md:h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <Image
                        src={productImage}
                        alt={productName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{productName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {duration}
                        </span>
                      )}
                      {rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {rating.toFixed(1)}
                        </span>
                      )}
                      {type === 'transfer' && pickup && dropoff && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {pickup.split(',')[0]} → {dropoff.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Date
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{formatDate(date)}</p>
                  </div>

                  {time && (
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        Time
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{time}</p>
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Users className="w-3.5 h-3.5" />
                      {type === 'transfer' ? 'Passengers' : 'Travelers'}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {participants} {participants === 1 ? 'person' : 'people'}
                    </p>
                  </div>

                  {type === 'transfer' && flightNumber && (
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Plane className="w-3.5 h-3.5" />
                        Flight
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{flightNumber}</p>
                    </div>
                  )}
                </div>

                {/* Transfer Route Details */}
                {type === 'transfer' && pickup && dropoff && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <MapPin className={`w-3.5 h-3.5 ${theme.accent}`} />
                        Pickup Location
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{pickup}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Navigation className={`w-3.5 h-3.5 ${theme.accent}`} />
                        Drop-off Location
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{dropoff}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                Guest Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 ${theme.accentBgLight} rounded-full flex items-center justify-center`}>
                    <Users className={`w-5 h-5 ${theme.accent}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lead Guest</p>
                    <p className="font-semibold text-gray-900">{customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 ${theme.accentBgLight} rounded-full flex items-center justify-center`}>
                    <Mail className={`w-5 h-5 ${theme.accent}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900 text-sm truncate">{customerEmail}</p>
                  </div>
                </div>

                {customerPhone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-10 h-10 ${theme.accentBgLight} rounded-full flex items-center justify-center`}>
                      <Phone className={`w-5 h-5 ${theme.accent}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">{customerPhone}</p>
                    </div>
                  </div>
                )}

                {specialRequests && (
                  <div className="md:col-span-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-700 font-medium">Special Requests</p>
                        <p className="text-gray-700 text-sm mt-1">{specialRequests}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                What&apos;s Next
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Check Your Email</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {type === 'transfer'
                        ? 'Your driver details and voucher have been sent to your email'
                        : 'Your e-voucher with full details has been sent to your email'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Save Your Voucher</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Download or print your voucher to present on the day
                    </p>
                  </div>
                </div>

                {type === 'transfer' ? (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-teal-50 border border-teal-100">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Meet Your Driver</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Your driver will be waiting at the pickup location with a name sign
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Arrive Early</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Plan to arrive at the meeting point 15 minutes before start time
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Save Emergency Contact</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Keep our support number handy: +1 (888) 555-0123
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                Need Help?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="mailto:support@fly2any.com"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email Us</p>
                    <p className="text-xs text-gray-500">support@fly2any.com</p>
                  </div>
                </a>

                <a
                  href="tel:+18885550123"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-xs text-gray-500">+1 (888) 555-0123</p>
                  </div>
                </a>

              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${theme.accentBg} text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-sm`}
                >
                  <Download className="w-5 h-5" />
                  Download Voucher
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Print Confirmation
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Share Details
                </button>
              </div>

              {/* Payment Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {formatCurrency(pricePerPerson)} x {participants} {participants === 1 ? 'person' : 'people'}
                    </span>
                    <span className="text-gray-900 font-medium">{formatCurrency(pricePerPerson * participants)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Booking fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className={`text-2xl font-bold ${theme.accent}`}>{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cancellable ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Shield className={`w-4 h-4 ${cancellable ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${cancellable ? 'text-green-700' : 'text-red-700'}`}>
                      {cancellable ? 'Free Cancellation' : 'Non-Refundable'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {cancellable
                        ? 'Cancel up to 24 hours before for a full refund'
                        : 'This booking cannot be cancelled or refunded'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Instant confirmation
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  Best price guarantee
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Verified provider
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  24/7 support
                </div>
              </div>

              {/* Return Button */}
              <button
                onClick={() => router.push(theme.returnPath)}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-all"
              >
                {theme.returnLabel}
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </MaxWidthContainer>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 mt-8">
        <MaxWidthContainer>
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500">
              Your booking is protected by{' '}
              <span className="font-semibold text-gray-700">Fly2Any Travel</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
              <a href="/terms" className="hover:text-gray-600 transition-colors">Terms & Conditions</a>
              <span>•</span>
              <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/refund-policy" className="hover:text-gray-600 transition-colors">Cancellation Policy</a>
            </div>
          </div>
        </MaxWidthContainer>
      </div>
    </div>
  );
});

ExperienceConfirmation.displayName = 'ExperienceConfirmation';

export default ExperienceConfirmation;
