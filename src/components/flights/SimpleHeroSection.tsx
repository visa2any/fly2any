/**
 * 🚀 Simple Hero Section - EXACT original styles with UltraOptimized form
 */

import React from 'react';
import { FlightSearchFormData } from '@/types/flights';
import UltraOptimizedFlightSearchForm from './UltraOptimizedFlightSearchForm';

interface SimpleHeroSectionProps {
  onSearch: (searchData: FlightSearchFormData) => void;
  isLoading?: boolean;
}

// Trust signals for competitive advantage (EXACT ORIGINAL)
const TRUST_SIGNALS = [
  { icon: '🏆', text: '2M+ Travelers Trust Us', color: 'text-yellow-400' },
  { icon: '💰', text: 'Save Up to 60%', color: 'text-green-400' },
  { icon: '⚡', text: 'Sub-1 Second Search', color: 'text-blue-400' },
  { icon: '🔒', text: 'Price Match Guarantee', color: 'text-purple-400' }
];

export default function SimpleHeroSection({ onSearch, isLoading = false }: SimpleHeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
      {/* Background Effects - EXACT ORIGINAL */}
      <div className="absolute inset-0">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-800/30 animate-pulse"></div>
        
        {/* Geometric Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Hero Content - EXACT ORIGINAL LAYOUT */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Trust Signals Bar - Fixed at top */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              {TRUST_SIGNALS.map((signal: any, index: number) => (
                <div key={index} className={`flex items-center gap-2 ${signal.color}`}>
                  <span className="text-base">{signal.icon}</span>
                  <span>{signal.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="flex-1 flex flex-col justify-center px-4 py-12">
          <div className="max-w-7xl mx-auto text-center">
            
            {/* Main Headline - EXACT ORIGINAL TYPOGRAPHY */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight font-sans">
              Find Flights That
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Don't Break the Bank
              </span>
            </h1>

            {/* Subheadline - EXACT ORIGINAL */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-3 sm:mb-4 max-w-4xl mx-auto font-medium px-4">
              AI-powered search across 500+ airlines. Compare prices instantly and save up to 60% vs other booking sites.
            </p>

            {/* Competitive Advantage - EXACT ORIGINAL RESPONSIVE */}
            <div className="text-sm sm:text-lg text-green-400 font-semibold mb-8 sm:mb-12 px-4">
              <div className="hidden sm:block">⚡ 3x faster than Kayak • 💰 Better prices than Expedia • 🎯 More options than Booking.com</div>
              <div className="sm:hidden text-center">
                <div>⚡ 3x faster than Kayak</div>
                <div>💰 Better prices than Expedia</div>
                <div>🎯 More options than Booking.com</div>
              </div>
            </div>

            {/* 🏆 ULTRA-OPTIMIZED FLIGHT SEARCH FORM - Full Width */}
            <div className="w-full max-w-none mx-auto px-4">
              <UltraOptimizedFlightSearchForm 
                onSearch={onSearch}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}