'use client';

import React, { useState } from 'react';
import AlternativeAirports from './AlternativeAirports';

const AlternativeAirportsDemo: React.FC = () => {
  const [selectedOrigin, setSelectedOrigin] = useState('JFK');
  const [selectedDestination, setSelectedDestination] = useState('LAX');
  const [language, setLanguage] = useState<'en' | 'pt' | 'es'>('en');

  const handleAirportSelect = (origin: string, destination: string) => {
    setSelectedOrigin(origin);
    setSelectedDestination(destination);
    alert(`Airport changed!\nNew route: ${origin} → ${destination}\n\nIn a real implementation, this would trigger a new flight search.`);
  };

  const demoScenarios = [
    { origin: 'JFK', destination: 'LAX', price: 450, label: 'New York to Los Angeles' },
    { origin: 'SFO', destination: 'JFK', price: 380, label: 'San Francisco to New York' },
    { origin: 'ORD', destination: 'MIA', price: 320, label: 'Chicago to Miami' },
    { origin: 'IAD', destination: 'SFO', price: 420, label: 'Washington DC to San Francisco' },
    { origin: 'BOS', destination: 'LAX', price: 480, label: 'Boston to Los Angeles' },
    { origin: 'DFW', destination: 'EWR', price: 350, label: 'Dallas to Newark' },
  ];

  const [currentScenario, setCurrentScenario] = useState(demoScenarios[0]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Demo Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Alternative Airports Widget Demo
          </h1>

          <div className="space-y-4">
            {/* Scenario Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select a route scenario:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {demoScenarios.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentScenario(scenario);
                      setSelectedOrigin(scenario.origin);
                      setSelectedDestination(scenario.destination);
                    }}
                    className={`px-4 py-3 text-left rounded-lg border-2 transition-all ${
                      currentScenario === scenario
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {scenario.origin} → {scenario.destination}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {scenario.label} (${scenario.price})
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language:
              </label>
              <div className="flex gap-2">
                {(['en', 'pt', 'es'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      language === lang
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'pt' ? 'Português' : 'Español'}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Selection Display */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Route:</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedOrigin} → {selectedDestination}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Base Price: ${currentScenario.price}
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Airports Widget */}
        <AlternativeAirports
          originAirport={selectedOrigin}
          destinationAirport={selectedDestination}
          currentPrice={currentScenario.price}
          onAirportSelect={handleAirportSelect}
          currency="USD"
          lang={language}
        />

        {/* Information Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Widget Features
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Auto-detects nearby airports within 50-mile radius</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Shows distance and transport time from main airport</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Calculates savings vs main airport</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Includes ground transportation cost estimates (train, bus, Uber)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Shows total cost including round-trip transport</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>One-click switch to alternative airport search</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Smart recommendations (only shows if &gt;15% savings)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Supports EN/PT/ES translations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Collapsible design with best deal preview</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Visual comparison with price bars and badges</span>
            </li>
          </ul>
        </div>

        {/* Airport Coverage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Airport Coverage
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">New York Area</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• JFK (John F. Kennedy)</li>
                <li>• LGA (LaGuardia)</li>
                <li>• EWR (Newark)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Los Angeles Area</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• LAX (Los Angeles)</li>
                <li>• BUR (Burbank)</li>
                <li>• SNA (John Wayne)</li>
                <li>• ONT (Ontario)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">San Francisco Area</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• SFO (San Francisco)</li>
                <li>• OAK (Oakland)</li>
                <li>• SJC (San Jose)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chicago Area</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• ORD (O'Hare)</li>
                <li>• MDW (Midway)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Washington DC Area</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• IAD (Dulles)</li>
                <li>• DCA (Reagan National)</li>
                <li>• BWI (Baltimore)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Other Cities</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>• MIA/FLL (Miami/Fort Lauderdale)</li>
                <li>• BOS (Boston area)</li>
                <li>• IAH/HOU (Houston)</li>
                <li>• DFW/DAL (Dallas)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlternativeAirportsDemo;
