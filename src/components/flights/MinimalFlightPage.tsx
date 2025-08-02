'use client';

/**
 * Minimal Flight Page - Emergency Fallback
 * Simple implementation without complex state management
 */

import React, { useState } from 'react';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import { HeroSection } from '@/components/ui/hero-section';

export default function MinimalFlightPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple timeout to simulate search
    setTimeout(() => {
      setIsLoading(false);
      alert('Flight search functionality is being restored. Please try again shortly.');
    }, 2000);
  };

  return (
    <>
      <GlobalMobileStyles />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden font-sans flex flex-col">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-slate-100/10"></div>

        {/* Header */}
        <ResponsiveHeader />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-140px)] py-8 md:py-12">
          <div className="w-full space-y-6 md:space-y-8">
            <div className="transform transition-all duration-700 ease-out">
              <HeroSection
                title="✈️ FIND FLIGHTS WORLDWIDE!"
                subtitle="We're optimizing our flight search system for better performance"
                features={[]}
              >
                <div className="mt-4">
                  <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
                    <form onSubmit={handleSearch} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            From
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select departure city</option>
                            <option value="MIA">Miami, FL</option>
                            <option value="NYC">New York, NY</option>
                            <option value="LAX">Los Angeles, CA</option>
                            <option value="ORD">Chicago, IL</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            To
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">Select destination</option>
                            <option value="GRU">São Paulo, Brazil</option>
                            <option value="GIG">Rio de Janeiro, Brazil</option>
                            <option value="BSB">Brasília, Brazil</option>
                            <option value="FOR">Fortaleza, Brazil</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Departure Date
                          </label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Return Date
                          </label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adults
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="1">1 Adult</option>
                            <option value="2">2 Adults</option>
                            <option value="3">3 Adults</option>
                            <option value="4">4 Adults</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Children
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="0">0 Children</option>
                            <option value="1">1 Child</option>
                            <option value="2">2 Children</option>
                            <option value="3">3 Children</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Class
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="economy">Economy</option>
                            <option value="business">Business</option>
                            <option value="first">First Class</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Searching Flights...
                          </div>
                        ) : (
                          'Search Flights'
                        )}
                      </button>
                    </form>
                  </div>
                </div>
                
                {/* Features Cards */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
                  {[
                    { icon: '🔍', text: 'Compare prices' },
                    { icon: '⚡', text: 'Fast search' },
                    { icon: '✅', text: 'Secure booking' },
                    { icon: '🌍', text: 'Global flights' }
                  ].map((feature, index) => (
                    <div 
                      key={`feature-${index}`} 
                      className="bg-white rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="text-xl md:text-2xl mb-2 block">{feature.icon}</span>
                      <span className="text-slate-700 text-xs md:text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </HeroSection>
            </div>

            {/* Service Notice */}
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <div className="text-blue-600 text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">System Optimization in Progress</h3>
                <p className="text-blue-700 mb-4">
                  We're enhancing our flight search system to provide you with faster, more accurate results. 
                  The advanced features will be available shortly.
                </p>
                <div className="bg-white rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">What's Coming:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Real-time flight comparison</li>
                    <li>• Advanced filtering options</li>
                    <li>• Price tracking and alerts</li>
                    <li>• Multi-airline booking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}