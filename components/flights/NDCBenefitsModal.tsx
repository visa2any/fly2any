'use client';

import { X, Sparkles, DollarSign, Shield, Zap, TrendingDown, Award, CheckCircle } from 'lucide-react';

interface NDCBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NDCBenefitsModal({ isOpen, onClose }: NDCBenefitsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">What is NDC?</h2>
                <p className="text-sm text-blue-100">New Distribution Capability</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100 text-sm">
            NDC is a modern way to book flights directly from airlines, offering you better prices,
            more options, and exclusive benefits not available through traditional booking channels.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Key Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Better Pricing */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 mb-2">Better Pricing</h3>
                    <p className="text-sm text-green-800 mb-2">
                      Airlines can offer lower prices when you book directly through NDC, cutting out middlemen
                      and passing savings to you.
                    </p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Average savings of $30-$150 per ticket
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Access to exclusive promotional fares
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Real-time pricing updates
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Exclusive Fares */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 mb-2">Exclusive Fare Options</h3>
                    <p className="text-sm text-purple-800 mb-2">
                      Get access to branded fares and special offers that aren't available through
                      traditional booking systems.
                    </p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Airline-specific fare families
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Customizable bundles and add-ons
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Premium economy and business exclusives
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* More Flexibility */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">More Flexibility</h3>
                    <p className="text-sm text-blue-800 mb-2">
                      NDC bookings often come with better change and cancellation policies,
                      giving you peace of mind when plans change.
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Easier modifications and rebooking
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Lower change fees
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        24-hour flexible cancellation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Better Service */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900 mb-2">Enhanced Service</h3>
                    <p className="text-sm text-orange-800 mb-2">
                      Direct connection with airlines means better support, faster issue resolution,
                      and access to loyalty benefits.
                    </p>
                    <ul className="text-xs text-orange-700 space-y-1">
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Direct airline customer support
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Automatic loyalty program linking
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Real-time flight status updates
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Rich Content Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Rich Content & Transparency
              </h3>
              <p className="text-sm text-indigo-800 mb-3">
                NDC allows airlines to share detailed information about your flight that traditional systems can't provide:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Visual Previews</p>
                  <p className="text-xs text-indigo-700">
                    See actual photos of cabin interiors, seats, and amenities before you book
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Detailed Amenities</p>
                  <p className="text-xs text-indigo-700">
                    Get comprehensive information about meals, entertainment, WiFi, and more
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Seat Maps</p>
                  <p className="text-xs text-indigo-700">
                    View detailed seat maps with exact configurations and features
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Personalized Options</p>
                  <p className="text-xs text-indigo-700">
                    Get recommendations based on your preferences and travel history
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">How NDC Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Direct Connection</p>
                    <p className="text-xs text-gray-600">
                      We connect directly to the airline's booking system using modern NDC technology
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Real-Time Data</p>
                    <p className="text-xs text-gray-600">
                      Get live pricing, availability, and rich content directly from the airline
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Seamless Booking</p>
                    <p className="text-xs text-gray-600">
                      Book with confidence knowing you're getting the best price and full airline support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Standard */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-800">
                <strong>Industry Standard:</strong> NDC is backed by IATA (International Air Transport Association)
                and is being adopted by major airlines worldwide including United, Lufthansa, American Airlines,
                British Airways, and many more. It represents the future of airline distribution.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Look for the <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white rounded-full font-semibold">
              <Sparkles className="w-3 h-3" />
              NDC Exclusive
            </span> badge to find these benefits
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
