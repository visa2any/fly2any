'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, ExternalLink, Check } from 'lucide-react';
import Link from 'next/link';

interface ApiStatus {
  amadeus: boolean;
  database: boolean;
  nextauth: boolean;
}

export function ApiConfigBanner() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if banner was dismissed in this session
    if (sessionStorage.getItem('apiConfigBannerDismissed')) {
      setDismissed(true);
      return;
    }

    // Check API configuration status
    fetch('/api/environment')
      .then(res => res.json())
      .then(data => {
        setStatus({
          amadeus: data.amadeusConfigured || false,
          database: data.databaseConfigured || false,
          nextauth: data.nextauthConfigured || false,
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('apiConfigBannerDismissed', 'true');
    setDismissed(true);
  };

  // Don't show if dismissed, loading, or all APIs configured
  if (dismissed || loading || !status) return null;
  if (status.amadeus && status.database && status.nextauth) return null;

  const missingCount = [!status.amadeus, !status.database, !status.nextauth].filter(Boolean).length;

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-yellow-900">
                Running in Demo Mode ({missingCount} service{missingCount > 1 ? 's' : ''} not configured)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
              {/* Amadeus API */}
              <div className="flex items-center gap-2 text-xs">
                {status.amadeus ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={status.amadeus ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                  Amadeus API {status.amadeus ? '(Active)' : '(Demo Data)'}
                </span>
              </div>

              {/* Database */}
              <div className="flex items-center gap-2 text-xs">
                {status.database ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={status.database ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                  Database {status.database ? '(Connected)' : '(Limited Features)'}
                </span>
              </div>

              {/* NextAuth */}
              <div className="flex items-center gap-2 text-xs">
                {status.nextauth ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={status.nextauth ? 'text-gray-700' : 'text-gray-900 font-medium'}>
                  Authentication {status.nextauth ? '(Enabled)' : '(Sign-in Disabled)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="https://github.com/anthropics/fly2any-fresh/blob/main/docs/API_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                <ExternalLink className="w-3 h-3" />
                Setup Guide
              </Link>
              <span className="text-xs text-yellow-700">
                The app works with demo data - configure APIs for full functionality
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
