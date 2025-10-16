'use client';

import { useState } from 'react';
import Image from 'next/image';

type Language = 'en' | 'pt' | 'es';

const content = {
  en: {
    title: 'Find Your Perfect Hotel',
    subtitle: 'Search and compare hotels worldwide',
    destination: 'Destination',
    checkin: 'Check-in',
    checkout: 'Check-out',
    guests: 'Guests',
    rooms: 'Rooms',
    adults: 'Adults',
    children: 'Children',
    search: 'Search Hotels',
  },
  pt: {
    title: 'Encontre Seu Hotel Perfeito',
    subtitle: 'Busque e compare hotéis pelo mundo',
    destination: 'Destino',
    checkin: 'Check-in',
    checkout: 'Check-out',
    guests: 'Hóspedes',
    rooms: 'Quartos',
    adults: 'Adultos',
    children: 'Crianças',
    search: 'Buscar Hotéis',
  },
  es: {
    title: 'Encuentra Tu Hotel Perfecto',
    subtitle: 'Busca y compara hoteles en todo el mundo',
    destination: 'Destino',
    checkin: 'Check-in',
    checkout: 'Check-out',
    guests: 'Huéspedes',
    rooms: 'Habitaciones',
    adults: 'Adultos',
    children: 'Niños',
    search: 'Buscar Hoteles',
  },
};

export default function HotelsPage() {
  const [lang, setLang] = useState<Language>('en');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const t = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <Image
              src="/fly2any-logo.png"
              alt="Fly2Any Travel"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </a>

          {/* Language Switcher */}
          <div className="flex gap-2">
            {(['en', 'pt', 'es'] as Language[]).map((language) => (
              <button
                key={language}
                onClick={() => setLang(language)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  lang === language
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
          {/* Destination */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.destination}
            </label>
            <input
              type="text"
              placeholder="New York, USA"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.checkin}
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.checkout}
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Guests and Rooms */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.adults}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.children}
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.rooms}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rooms}
                onChange={(e) => setRooms(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-center"
              />
            </div>
          </div>

          {/* Search Button */}
          <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            🏨 {t.search}
          </button>
        </div>

        {/* Results will appear here */}
        <div className="text-center text-gray-500">
          <p className="text-lg">Search results will appear here</p>
        </div>
      </main>
    </div>
  );
}
