'use client';

import { useState } from 'react';
import TravelTipCard from '@/components/guide/TravelTipCard';

// Mock travel tips data
const travelTips = [
  {
    id: '1',
    destination: 'Paris',
    category: 'visa' as const,
    title: 'Visa Requirements for France',
    description: 'US citizens can visit France visa-free for up to 90 days within a 180-day period for tourism.',
    icon: '🛂',
    urgency: 'high' as const,
    details: [
      'Passport must be valid for at least 3 months beyond your planned departure',
      'Proof of sufficient funds may be requested',
      'Return ticket or proof of onward travel required',
      'Travel insurance recommended (min 30,000 EUR coverage)',
    ],
  },
  {
    id: '2',
    destination: 'Paris',
    category: 'currency' as const,
    title: 'Currency & Money Matters',
    description: 'France uses the Euro (EUR). Credit cards widely accepted, but cash useful for small purchases.',
    icon: '💶',
    urgency: 'medium' as const,
    details: [
      'ATMs available throughout the city',
      'Notify your bank before traveling',
      'Tipping: 5-10% in restaurants (service usually included)',
      'Many places accept contactless payments',
    ],
  },
  {
    id: '3',
    destination: 'Paris',
    category: 'weather' as const,
    title: 'Best Time to Visit Paris',
    description: 'Spring (April-June) and Fall (September-October) offer pleasant weather and fewer crowds.',
    icon: '🌤️',
    urgency: 'low' as const,
    details: [
      'Summer (July-Aug): Warm but crowded, many locals on vacation',
      'Winter (Dec-Feb): Cold but magical, especially during Christmas',
      'Pack layers - weather can be unpredictable',
      'Rain is common year-round, bring an umbrella',
    ],
  },
  {
    id: '4',
    destination: 'Paris',
    category: 'safety' as const,
    title: 'Safety Tips for Paris',
    description: 'Paris is generally safe, but be aware of pickpockets in tourist areas and public transport.',
    icon: '🛡️',
    urgency: 'high' as const,
    details: [
      'Keep valuables in inside pockets or money belt',
      'Be extra cautious near major attractions and metro stations',
      'Avoid showing expensive jewelry or electronics',
      'Emergency number: 112 (police: 17, ambulance: 15)',
      'Stay in well-lit areas at night',
    ],
  },
  {
    id: '5',
    destination: 'Paris',
    category: 'culture' as const,
    title: 'Cultural Etiquette',
    description: 'Parisians appreciate when visitors make an effort to speak French and observe local customs.',
    icon: '🗼',
    urgency: 'medium' as const,
    details: [
      'Always greet with "Bonjour" before asking questions',
      'Dress code: Generally more formal than casual',
      'Dining: Keep hands on table, not in lap',
      'Learn basic French phrases - locals appreciate the effort',
      'Avoid eating on the metro or speaking loudly in public',
    ],
  },
  {
    id: '6',
    destination: 'Paris',
    category: 'transport' as const,
    title: 'Getting Around Paris',
    description: 'The Paris Metro is efficient and affordable. Consider getting a Paris Visite travel pass.',
    icon: '🚇',
    urgency: 'medium' as const,
    details: [
      'Metro runs 5:30am-1:15am (2:15am Fri-Sat)',
      'Single ticket: ~2 EUR, Day pass: ~8 EUR',
      'Paris Visite pass includes metro, buses, and some discounts',
      'Taxis and Uber available but more expensive',
      'Many attractions walkable - comfortable shoes essential',
    ],
  },
  {
    id: '7',
    destination: 'Tokyo',
    category: 'visa' as const,
    title: 'Japan Visa Information',
    description: 'Most visitors can enter Japan visa-free for tourism for up to 90 days.',
    icon: '🛂',
    urgency: 'high' as const,
    details: [
      'Valid passport required (at least 6 months)',
      'Return ticket or proof of onward travel',
      'Sufficient funds for your stay',
      'Visit Japan Web for digital customs declaration',
    ],
  },
  {
    id: '8',
    destination: 'Tokyo',
    category: 'currency' as const,
    title: 'Japanese Yen & Payments',
    description: 'Japan uses Yen (JPY). Cash is still king - many places do not accept cards.',
    icon: '💴',
    urgency: 'high' as const,
    details: [
      'Withdraw cash at 7-Eleven ATMs (most accept foreign cards)',
      'IC cards (Suica/Pasmo) useful for transport and convenience stores',
      'Credit cards accepted at major hotels and department stores',
      'No tipping culture in Japan',
    ],
  },
  {
    id: '9',
    destination: 'Tokyo',
    category: 'culture' as const,
    title: 'Japanese Cultural Etiquette',
    description: 'Respect is central to Japanese culture. Learn basic etiquette to avoid social faux pas.',
    icon: '🏯',
    urgency: 'high' as const,
    details: [
      'Bow when greeting (slight bow is fine)',
      'Remove shoes when entering homes and some restaurants',
      'Do not tip - it can be seen as insulting',
      'Speak quietly on public transport',
      'Do not eat while walking',
      'Point with full hand, not index finger',
    ],
  },
  {
    id: '10',
    destination: 'Dubai',
    category: 'culture' as const,
    title: 'Dubai Cultural Guidelines',
    description: 'Dubai is modern but conservative. Dress modestly and respect local customs.',
    icon: '🕌',
    urgency: 'high' as const,
    details: [
      'Dress code: Cover shoulders and knees in public',
      'Public displays of affection should be minimal',
      'Alcohol only in licensed venues (hotels, restaurants)',
      'Friday is the weekly holiday (Islamic holy day)',
      'Photography: Ask permission before photographing locals',
      'During Ramadan: No eating/drinking in public during daylight',
    ],
  },
];

const destinations = [
  { id: 'paris', name: 'Paris', icon: '🗼', tipsCount: 6 },
  { id: 'tokyo', name: 'Tokyo', icon: '🗾', tipsCount: 3 },
  { id: 'dubai', name: 'Dubai', icon: '🕌', tipsCount: 1 },
  { id: 'london', name: 'London', icon: '🏰', tipsCount: 0 },
  { id: 'newyork', name: 'New York', icon: '🗽', tipsCount: 0 },
];

export default function TravelGuidePage() {
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Tips', icon: '📚' },
    { value: 'visa', label: 'Visa & Entry', icon: '🛂' },
    { value: 'currency', label: 'Currency', icon: '💰' },
    { value: 'weather', label: 'Weather', icon: '🌤️' },
    { value: 'safety', label: 'Safety', icon: '🛡️' },
    { value: 'culture', label: 'Culture', icon: '🎭' },
    { value: 'transport', label: 'Transport', icon: '🚇' },
  ];

  const filteredTips = travelTips
    .filter(tip => selectedDestination === 'all' || tip.destination === selectedDestination)
    .filter(tip => selectedCategory === 'all' || tip.category === selectedCategory)
    .filter(tip =>
      searchQuery === '' ||
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const essentialTips = filteredTips.filter(tip => tip.urgency === 'high');
  const importantTips = filteredTips.filter(tip => tip.urgency === 'medium');
  const generalTips = filteredTips.filter(tip => !tip.urgency || tip.urgency === 'low');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-gray-900 mb-4">
            Travel Guides & Tips 📚
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Essential information to help you plan and enjoy your trip
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search travel tips..."
                className="w-full px-6 py-4 pl-12 text-lg border-2 border-gray-300 rounded-full focus:ring-4 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Destination Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Select Destination
          </label>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedDestination('all')}
              className={`p-4 rounded-xl font-semibold transition-all ${
                selectedDestination === 'all'
                  ? 'bg-teal-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-3xl mb-2">🌍</div>
              <div className="text-sm">All</div>
            </button>
            {destinations.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest.name)}
                className={`p-4 rounded-xl font-semibold transition-all relative ${
                  selectedDestination === dest.name
                    ? 'bg-teal-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-3xl mb-2">{dest.icon}</div>
                <div className="text-sm">{dest.name}</div>
                {dest.tipsCount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {dest.tipsCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips Sections */}
        {filteredTips.length > 0 ? (
          <>
            {/* Essential Tips */}
            {essentialTips.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🚨</span>
                  Essential Information
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {essentialTips.map((tip) => (
                    <TravelTipCard key={tip.id} tip={tip} expanded={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Important Tips */}
            {importantTips.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>⚠️</span>
                  Important to Know
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {importantTips.map((tip) => (
                    <TravelTipCard key={tip.id} tip={tip} />
                  ))}
                </div>
              </div>
            )}

            {/* General Tips */}
            {generalTips.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>💡</span>
                  Good to Know
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {generalTips.map((tip) => (
                    <TravelTipCard key={tip.id} tip={tip} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No travel tips found
            </h3>
            <p className="text-gray-600 mb-6">
              Try selecting a different destination or category
            </p>
            <button
              onClick={() => {
                setSelectedDestination('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Resources Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Additional Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="font-bold text-gray-900 mb-2">Travel Insurance</h3>
              <p className="text-sm text-gray-600 mb-3">
                Protect yourself with comprehensive travel insurance
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Get a Quote →
              </a>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 mb-2">Travel Apps</h3>
              <p className="text-sm text-gray-600 mb-3">
                Essential apps for navigation, translation, and more
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                View Recommendations →
              </a>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="font-bold text-gray-900 mb-2">Official Resources</h3>
              <p className="text-sm text-gray-600 mb-3">
                Embassy contacts, visa requirements, and travel advisories
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                View Resources →
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Important Notice</h3>
              <p className="text-sm text-gray-700">
                Travel information is subject to change. Always verify visa requirements, travel advisories, and local regulations with official sources before your trip. This guide provides general information and should not be considered as official travel advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
