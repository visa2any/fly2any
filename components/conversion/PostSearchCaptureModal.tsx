'use client';

import { useState, useEffect } from 'react';
import { X, Bell, TrendingDown, Mail, CheckCircle } from 'lucide-react';

interface PostSearchCaptureModalProps {
  origin?: string;
  destination?: string;
  departureDate?: string;
  lowestPrice?: number;
  currency?: string;
  onEmailSubmit?: (email: string) => void;
  delayMs?: number; // Delay before showing modal
}

export default function PostSearchCaptureModal({
  origin,
  destination,
  departureDate,
  lowestPrice,
  currency = 'USD',
  onEmailSubmit,
  delayMs = 8000, // Show after 8 seconds by default
}: PostSearchCaptureModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user has already seen this modal in this session
    const hasSeenModal = sessionStorage.getItem('postSearchCaptureShown');
    if (hasSeenModal) return;

    // Check if user is already logged in (has email in session)
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail) return;

    // Show modal after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem('postSearchCaptureShown', 'true');
      // Track modal shown
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'post_search_capture_shown', {
          event_category: 'lead_capture',
          origin,
          destination,
        });
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, origin, destination]);

  const handleClose = () => {
    setIsVisible(false);
    // Track modal dismissed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'post_search_capture_dismissed', {
        event_category: 'lead_capture',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);

    try {
      // Subscribe to newsletter with source
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'post_search_capture',
          metadata: { origin, destination, departureDate },
        }),
      });

      // Create price alert if search context available
      if (origin && destination) {
        await fetch('/api/price-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin,
            destination,
            departureDate,
            targetPrice: lowestPrice ? Math.round(lowestPrice * 0.9) : undefined,
            email,
          }),
        }).catch(() => {}); // Silent fail for price alert
      }

      setIsSubmitted(true);
      onEmailSubmit?.(email);

      // Track conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'post_search_capture_converted', {
          event_category: 'lead_capture',
          origin,
          destination,
          email_captured: true,
        });
      }

      // Auto-close after success
      setTimeout(() => setIsVisible(false), 3000);
    } catch (error) {
      console.error('Capture error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              You're All Set!
            </h3>
            <p className="text-gray-600">
              We'll notify you when prices drop for{' '}
              {origin && destination ? (
                <span className="font-semibold">{origin} → {destination}</span>
              ) : (
                'your routes'
              )}
            </p>
          </div>
        ) : (
          <>
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Track This Price</h3>
                  <p className="text-sm text-white/80">Get notified when it drops</p>
                </div>
              </div>

              {origin && destination && (
                <div className="bg-white/10 rounded-xl p-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/70">Route</p>
                      <p className="font-bold">{origin} → {destination}</p>
                    </div>
                    {lowestPrice && (
                      <div className="text-right">
                        <p className="text-xs text-white/70">From</p>
                        <p className="text-xl font-bold">
                          {currency === 'USD' ? '$' : currency}{lowestPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Create Price Alert
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Free forever • No spam • Unsubscribe anytime</span>
              </div>

              <button
                onClick={handleClose}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
