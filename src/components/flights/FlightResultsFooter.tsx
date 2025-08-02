'use client';

/**
 * Full-width Footer Components for Flight Results
 * Pagination and Cross-sell sections that use full page width
 */

import React from 'react';
import { ProcessedFlightOffer } from '@/types/flights';

interface FlightPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalOffers: number;
  onPageChange: (page: number) => void;
  hasMoreOffers: boolean;
}

interface FlightCrossSellProps {
  // Props for cross-sell section if needed
}

export function FlightPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalOffers,
  onPageChange,
  hasMoreOffers
}: FlightPaginationProps) {
  if (totalOffers <= itemsPerPage) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 py-8 px-4 border-t border-blue-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center space-y-4">
          {/* Progress indicator */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalOffers)} of {totalOffers} flights
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 border-2 border-gray-300 hover:border-blue-400 disabled:border-gray-200 text-gray-700 hover:text-blue-700 disabled:text-gray-400 font-semibold rounded-xl transition-all duration-200 bg-white hover:bg-blue-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 border-2 border-gray-300 hover:border-blue-400 disabled:border-gray-200 text-gray-700 hover:text-blue-700 disabled:text-gray-400 font-semibold rounded-xl transition-all duration-200 bg-white hover:bg-blue-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
          
          {hasMoreOffers && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                🔥 We still have {totalOffers - (currentPage * itemsPerPage)} more amazing flights!
              </p>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                ✈️ View More Flights ({totalOffers - (currentPage * itemsPerPage)} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FlightCrossSell({}: FlightCrossSellProps) {
  return (
    <div className="w-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4 text-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            ✈️ Maximize Your Trip
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Transform your trip into an unforgettable experience with our extra services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Hotel Booking Cross-sell */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-4">🏨</div>
            <h3 className="text-xl font-bold mb-2">Hotels</h3>
            <p className="text-blue-100 text-sm mb-4">Save up to 40% booking hotel with your flight</p>
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold mb-3">
              Exclusive discount: -40%
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors">
              View Hotels
            </button>
          </div>

          {/* Car Rental Cross-sell */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2">Car Rental</h3>
            <p className="text-blue-100 text-sm mb-4">Complete freedom at your destination with the best prices</p>
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold mb-3">
              Starting at $89/day
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors">
              Rent Car
            </button>
          </div>

          {/* Travel Insurance Cross-sell */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">Travel Insurance</h3>
            <p className="text-blue-100 text-sm mb-4">Travel worry-free with complete worldwide coverage</p>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-bold mb-3">
              Starting at $15/day
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors">
              Get Insurance
            </button>
          </div>

          {/* Experiences Cross-sell */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="text-3xl mb-4">🎭</div>
            <h3 className="text-xl font-bold mb-2">Experiences</h3>
            <p className="text-blue-100 text-sm mb-4">Tours, tickets and activities at your destination</p>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold mb-3">
              Up to 50% off
            </div>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors">
              View Experiences
            </button>
          </div>
        </div>

        {/* Trust signals and guarantees */}
        <div className="border-t border-white/20 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🔒</div>
              <div className="text-sm font-semibold">Secure Payment</div>
              <div className="text-xs text-blue-200">SSL 256-bit</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">📞</div>
              <div className="text-sm font-semibold">24/7 Support</div>
              <div className="text-xs text-blue-200">Specialized service</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">✈️</div>
              <div className="text-sm font-semibold">IATA Certified</div>
              <div className="text-xs text-blue-200">Official agency</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">💯</div>
              <div className="text-sm font-semibold">Total Guarantee</div>
              <div className="text-xs text-blue-200">Satisfaction guaranteed</div>
            </div>
          </div>
        </div>

        {/* Newsletter signup with incentive */}
        <div className="mt-12 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-8 border border-white/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">📧 Exclusive Offers</h3>
            <p className="text-blue-100 mb-6">Get the best deals delivered straight to your email</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your best email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105">
                Get 10% OFF
              </button>
            </div>
            <p className="text-xs text-blue-200 mt-3">Get 10% discount on your next trip when you sign up</p>
          </div>
        </div>
      </div>
    </div>
  );
}