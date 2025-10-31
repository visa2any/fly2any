'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface EnvironmentInfo {
  amadeus: {
    mode: string;
    isProduction: boolean;
    baseUrl: string;
  };
  duffel: {
    mode: string;
    isProduction: boolean;
  };
  nodeEnv: string;
  isTestData: boolean;
}

export function TestModeBanner() {
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if banner was previously dismissed in this session
    const dismissed = sessionStorage.getItem('testModeBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Fetch environment info
    fetch('/api/environment')
      .then(res => res.json())
      .then(data => {
        setEnvironment(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch environment info:', err);
        setIsLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('testModeBannerDismissed', 'true');
  };

  // Don't show banner if dismissed, loading, or in production mode
  if (isDismissed || isLoading || !environment || !environment.isTestData) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 border-b-2 border-yellow-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-900" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900">
                🧪 TEST MODE - Real Flight Data, Simulated Bookings
              </p>
              <p className="text-xs text-yellow-800 mt-0.5">
                Amadeus: <span className="font-mono font-semibold">{environment.amadeus.mode}</span>
                {' • '}
                Duffel: <span className="font-mono font-semibold">{environment.duffel.mode}</span>
                {' • '}
                <span className="italic">Showing real prices & availability. Bookings won't issue actual tickets. See API_ENVIRONMENT_SETUP.md for production setup.</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 inline-flex text-yellow-900 hover:text-yellow-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 rounded-md p-1.5 transition-colors"
            aria-label="Dismiss test mode banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
