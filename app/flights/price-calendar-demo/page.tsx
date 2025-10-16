'use client';

import { useState } from 'react';
import PriceCalendarMatrix from '@/components/flights/PriceCalendarMatrix';
import { Plane, Calendar, DollarSign, Globe } from 'lucide-react';

/**
 * Demo page showcasing the PriceCalendarMatrix component
 * This demonstrates all features and usage patterns
 */
export default function PriceCalendarDemoPage() {
  // State for demo controls
  const [origin, setOrigin] = useState('LAX');
  const [destination, setDestination] = useState('JFK');
  const [currentDate, setCurrentDate] = useState('2025-11-15');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'BRL'>('USD');
  const [lang, setLang] = useState<'en' | 'pt' | 'es'>('en');

  // Popular routes for quick testing
  const popularRoutes = [
    { from: 'LAX', to: 'JFK', label: 'LA → New York' },
    { from: 'LHR', to: 'JFK', label: 'London → New York' },
    { from: 'GRU', to: 'LIS', label: 'São Paulo → Lisbon' },
    { from: 'MAD', to: 'BCN', label: 'Madrid → Barcelona' },
    { from: 'DXB', to: 'SIN', label: 'Dubai → Singapore' },
    { from: 'SYD', to: 'LAX', label: 'Sydney → LA' },
  ];

  const handleRouteChange = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
    // Reset date when changing route
    setCurrentDate('2025-11-15');
  };

  const handleDateSelect = (date: string) => {
    setCurrentDate(date);
    console.log('Date selected:', date);
    // Here you would trigger a new flight search
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Price Calendar Matrix Demo
            </h1>
          </div>
          <p className="text-white/70 text-lg">
            Interactive demonstration of the comprehensive flight price calendar component
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Controls Panel */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Demo Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Origin */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Origin (IATA)
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="LAX"
                maxLength={3}
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Destination (IATA)
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="JFK"
                maxLength={3}
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR' | 'BRL')}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="BRL">BRL (R$)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as 'en' | 'pt' | 'es')}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          {/* Quick Route Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Popular Routes
            </label>
            <div className="flex flex-wrap gap-2">
              {popularRoutes.map((route) => (
                <button
                  key={`${route.from}-${route.to}`}
                  onClick={() => handleRouteChange(route.from, route.to)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                    origin === route.from && destination === route.to
                      ? 'bg-blue-500 border-blue-400 text-white'
                      : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-white/70 mb-2">Current Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Route</div>
                <div className="text-white font-semibold">{origin} → {destination}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Selected Date</div>
                <div className="text-white font-semibold">
                  {new Date(currentDate).toLocaleDateString(
                    lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Settings</div>
                <div className="text-white font-semibold">{currency} / {lang.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Calendar Component */}
        <PriceCalendarMatrix
          origin={origin}
          destination={destination}
          currentDate={currentDate}
          onDateSelect={handleDateSelect}
          currency={currency}
          lang={lang}
        />

        {/* Features Documentation */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Component Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">Color-Coded Heatmap</h3>
              <p className="text-white/70 text-sm">
                Prices are color-coded by percentile: Green (cheapest 25%), Yellow (medium), Red (most expensive 25%).
                This makes it easy to spot the best deals at a glance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">Price Comparison</h3>
              <p className="text-white/70 text-sm">
                Each date shows a percentage difference compared to your currently selected date.
                Negative percentages (green) mean cheaper, positive (red) mean more expensive.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">Deal Detection</h3>
              <p className="text-white/70 text-sm">
                Special badges highlight deal days (30-40% off) and the absolute cheapest day gets a "BEST" label.
                Deal badges pulse to draw attention.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">Responsive Design</h3>
              <p className="text-white/70 text-sm">
                Desktop shows 3 months in a grid, while mobile uses horizontal scrolling.
                Touch-friendly interface with hover tooltips on desktop.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">Multi-Language</h3>
              <p className="text-white/70 text-sm">
                Supports English, Portuguese, and Spanish with proper date formatting,
                currency symbols, and translated labels.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">Summary Statistics</h3>
              <p className="text-white/70 text-sm">
                Bottom panel shows current price, lowest price, highest price, and average savings
                for quick reference and decision making.
              </p>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
          <div className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-white/90">
{`import PriceCalendarMatrix from '@/components/flights/PriceCalendarMatrix';

function FlightResults() {
  const [date, setDate] = useState('2025-11-15');

  return (
    <PriceCalendarMatrix
      origin="${origin}"
      destination="${destination}"
      currentDate={date}
      onDateSelect={(newDate) => {
        setDate(newDate);
        // Trigger new flight search
      }}
      currency="${currency}"
      lang="${lang}"
    />
  );
}`}
            </pre>
          </div>
        </div>

        {/* API Integration Note */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-amber-400 font-bold">ℹ</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Mock Data Notice</h3>
              <p className="text-white/70 text-sm">
                This demo currently uses realistic mock data. Prices vary by ±20% around a base price,
                with weekends being 10-15% more expensive and random "deal days" offering 30-40% discounts.
                To integrate real API data, replace the <code className="px-2 py-0.5 bg-white/10 rounded text-amber-300">generateMockPrices</code> function
                with an API call to your flight pricing service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
