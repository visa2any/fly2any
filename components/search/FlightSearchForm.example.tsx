/**
 * Example Usage of FlightSearchForm Component
 *
 * This file demonstrates various ways to use the FlightSearchForm component
 */

'use client';

import { useState } from 'react';
import FlightSearchForm from './FlightSearchForm';

// Example 1: Basic Usage
export function BasicExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Search for Flights
        </h1>
        <FlightSearchForm />
      </div>
    </div>
  );
}

// Example 2: With Language Control
export function LanguageControlExample() {
  const [currentLang, setCurrentLang] = useState<'en' | 'pt' | 'es'>('en');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-center gap-3 mb-8">
          {(['en', 'pt', 'es'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setCurrentLang(lang)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                currentLang === lang
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          {currentLang === 'en' && 'Search for Flights'}
          {currentLang === 'pt' && 'Buscar Voos'}
          {currentLang === 'es' && 'Buscar Vuelos'}
        </h1>

        <FlightSearchForm
          language={currentLang}
          onLanguageChange={setCurrentLang}
        />
      </div>
    </div>
  );
}

// Example 3: In a Card Layout
export function CardLayoutExample() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto pt-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Find Your Perfect Flight
          </h1>
          <p className="text-xl text-gray-600">
            Search and compare flights from hundreds of airlines
          </p>
        </div>

        {/* Search Form Card */}
        <FlightSearchForm className="shadow-2xl" />

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Best Prices</h3>
            <p className="text-gray-600">
              Compare prices from hundreds of airlines and travel sites
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure Booking</h3>
            <p className="text-gray-600">
              Your information is protected with industry-leading security
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Instant Results</h3>
            <p className="text-gray-600">
              Get real-time flight availability and pricing instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 4: Integration with existing page
export function IntegratedExample() {
  const [language, setLanguage] = useState<'en' | 'pt' | 'es'>('en');

  const handleLanguageChange = (newLang: 'en' | 'pt' | 'es') => {
    setLanguage(newLang);
    // You can also save to localStorage or update global state here
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', newLang);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">Fly2Any</div>
          <nav className="flex gap-6">
            <a href="/flights" className="text-gray-700 hover:text-blue-600">
              Flights
            </a>
            <a href="/hotels" className="text-gray-700 hover:text-blue-600">
              Hotels
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <FlightSearchForm
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 Fly2Any Travel - Your Travel Experts</p>
        </div>
      </footer>
    </div>
  );
}

// Example 5: Compact Version with Custom Styling
export function CompactExample() {
  return (
    <div className="p-4">
      <FlightSearchForm className="max-w-3xl mx-auto bg-white/90" />
    </div>
  );
}
