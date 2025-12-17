'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Navigation, MapPin, Calendar, Clock, Users, Shield, Star, Check, ArrowRight } from 'lucide-react';

const POPULAR_ROUTES = [
  { pickup: 'JFK Airport', dropoff: 'Manhattan', price: 65, duration: '45-60 min', emoji: '🗽' },
  { pickup: 'LAX Airport', dropoff: 'Hollywood', price: 55, duration: '30-45 min', emoji: '🌴' },
  { pickup: 'MIA Airport', dropoff: 'South Beach', price: 45, duration: '25-35 min', emoji: '🏖️' },
  { pickup: 'ORD Airport', dropoff: 'Downtown Chicago', price: 50, duration: '35-50 min', emoji: '🏙️' },
  { pickup: 'LAS Airport', dropoff: 'The Strip', price: 35, duration: '15-25 min', emoji: '🎰' },
  { pickup: 'SFO Airport', dropoff: 'Union Square', price: 60, duration: '30-45 min', emoji: '🌉' },
];

const FEATURES = [
  { icon: Shield, title: 'Safe & Reliable', desc: 'Vetted professional drivers' },
  { icon: Clock, title: 'Flight Tracking', desc: 'We monitor your flight status' },
  { icon: Star, title: '4.9 Rating', desc: 'Thousands of happy customers' },
  { icon: Check, title: 'Free Cancellation', desc: 'Up to 48h before pickup' },
];

export default function TransfersPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [passengers, setPassengers] = useState(1);

  const handleSearch = () => {
    if (!pickup || !dropoff || !date) return;
    const params = new URLSearchParams({ pickup, dropoff, date, time, passengers: passengers.toString() });
    router.push(`/transfers/results?${params.toString()}`);
  };

  const handleQuickBook = (route: typeof POPULAR_ROUTES[0]) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const params = new URLSearchParams({ pickup: route.pickup, dropoff: route.dropoff, date: dateStr, time: '10:00', passengers: '1' });
    router.push(`/transfers/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 text-white">
        <MaxWidthContainer>
          <div className="py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Airport Transfers</h1>
              <p className="text-xl text-teal-100 mb-8">Reliable private transfers to and from airports worldwide. Pre-book your ride and travel stress-free.</p>

              {/* Search Form */}
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pickup</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
                      <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Airport or address"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Dropoff</label>
                    <div className="relative">
                      <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600" />
                      <input
                        type="text"
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        placeholder="Hotel or address"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Passengers</label>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!pickup || !dropoff || !date}
                  className="w-full mt-4 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Search Transfers <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      {/* Features */}
      <MaxWidthContainer>
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="font-bold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </MaxWidthContainer>

      {/* Popular Routes */}
      <div className="bg-gray-50 py-12">
        <MaxWidthContainer>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route, i) => (
              <button
                key={i}
                onClick={() => handleQuickBook(route)}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all text-left group border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{route.emoji}</span>
                  <span className="text-xl font-bold text-teal-600">From ${route.price}</span>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <MapPin className="w-4 h-4 text-teal-500" /> {route.pickup}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Navigation className="w-4 h-4 text-gray-400" /> {route.dropoff}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <Clock className="w-4 h-4" /> {route.duration}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </MaxWidthContainer>
      </div>
    </div>
  );
}
