"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { QuoteData } from "../QuoteBuilder";

interface Step1ProductSearchProps {
  quoteData: QuoteData;
  updateQuoteData: (data: Partial<QuoteData>) => void;
  onNext: () => void;
}

export default function QuoteBuilderStep1ProductSearch({
  quoteData,
  updateQuoteData,
  onNext,
}: Step1ProductSearchProps) {
  const [searchType, setSearchType] = useState<"flights" | "hotels">("flights");

  const hasProducts = quoteData.flights.length > 0 ||
                      quoteData.hotels.length > 0 ||
                      quoteData.activities.length > 0 ||
                      quoteData.customItems.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <span className="text-4xl">🔍</span>
          Search Products First!
        </h2>
        <p className="text-lg text-gray-600">
          Find the perfect flights, hotels, or activities for your client. You'll add their info later.
        </p>
      </div>

      {/* Quick Search Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flight Search */}
        <a
          href="/flights?source=quote-builder"
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <svg className="w-6 h-6 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Search Flights</h3>
          <p className="text-sm text-gray-600 mb-4">
            Find the best flight options from our integrated search engine
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <span>Open Flight Search</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </a>

        {/* Hotel Search */}
        <a
          href="/hotels?source=quote-builder"
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <svg className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Search Hotels</h3>
          <p className="text-sm text-gray-600 mb-4">
            Browse accommodations in 180+ cities worldwide
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
            <span>Open Hotel Search</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </a>
      </div>

      {/* Manual Add Section */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Or Add Products Manually</h3>
        <p className="text-sm text-gray-600 mb-6">
          Already have product details? Add them directly to your quote.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              // TODO: Open modal to add flight manually
              toast("Manual flight entry coming soon!");
            }}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Add Flight</h4>
            <p className="text-xs text-gray-500">Manual entry</p>
          </button>

          <button
            onClick={() => {
              // TODO: Open modal to add hotel manually
              toast("Manual hotel entry coming soon!");
            }}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Add Hotel</h4>
            <p className="text-xs text-gray-500">Manual entry</p>
          </button>

          <button
            onClick={() => {
              // TODO: Open modal to add custom item
              toast("Custom item entry coming soon!");
            }}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-left group"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Custom Item</h4>
            <p className="text-xs text-gray-500">Tours, transfers, etc.</p>
          </button>
        </div>
      </div>

      {/* Current Quote Summary */}
      {hasProducts && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Products Added to Quote</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {quoteData.flights.length > 0 && (
                  <p>✈️ {quoteData.flights.length} flight(s)</p>
                )}
                {quoteData.hotels.length > 0 && (
                  <p>🏨 {quoteData.hotels.length} hotel(s)</p>
                )}
                {quoteData.activities.length > 0 && (
                  <p>🎯 {quoteData.activities.length} activity(ies)</p>
                )}
                {quoteData.customItems.length > 0 && (
                  <p>📋 {quoteData.customItems.length} custom item(s)</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helper Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Open search in new tab to keep your quote builder open</li>
              <li>• You can skip this step and add products later in Step 3</li>
              <li>• Client info is requested in the final step - no rush!</li>
              <li>• Save drafts anytime if you need to take a break</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cancel
        </button>

        <button
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm flex items-center gap-2"
        >
          {hasProducts ? "Continue with Products" : "Skip for Now"}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
