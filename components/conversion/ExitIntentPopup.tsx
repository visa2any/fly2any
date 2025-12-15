'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Tag } from 'lucide-react';

interface ExitIntentPopupProps {
  discountCode?: string;
  discountPercent?: number;
  onEmailSubmit?: (email: string) => void;
}

export default function ExitIntentPopup({
  discountCode = 'COMEBACK5',
  discountPercent = 5,
  onEmailSubmit
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup in this session
    const hasSeenPopup = sessionStorage.getItem('exitIntentShown');
    if (hasSeenPopup) return;

    let mouseLeaveTimer: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from the top (typical exit behavior)
      if (e.clientY <= 0 && !isVisible) {
        mouseLeaveTimer = setTimeout(() => {
          setIsVisible(true);
          sessionStorage.setItem('exitIntentShown', 'true');
          // Track popup shown
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'exit_intent_shown', {
              event_category: 'lead_capture',
              discount_percent: discountPercent,
            });
          }
        }, 100);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (mouseLeaveTimer) clearTimeout(mouseLeaveTimer);
    };
  }, [isVisible, discountPercent]);

  const handleClose = () => {
    setIsVisible(false);
    // Track popup dismissed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exit_intent_dismissed', {
        event_category: 'lead_capture',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onEmailSubmit?.(email);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-xl">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-8 h-8" />
            <h3 className="text-xl font-bold">Wait! Don't miss this deal</h3>
          </div>
          <p className="text-white/90 text-sm">
            Get {discountPercent}% off your first booking
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isSubmitted ? (
            <>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg mb-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="text-sm font-semibold text-green-900">
                      Exclusive Discount Code
                    </div>
                    <div className="text-xs text-green-700">
                      Use code: <span className="font-mono font-bold">{discountCode}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Plus, get exclusive deals and price alerts delivered to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="exit-email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      id="exit-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
                >
                  Get My {discountPercent}% Discount
                </button>
              </form>

              <button
                onClick={handleClose}
                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Continue browsing
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✓</div>
              <h4 className="text-lg font-bold text-green-600 mb-1">
                You're all set!
              </h4>
              <p className="text-sm text-gray-600">
                Check your email for your discount code and exclusive deals.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 200ms ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 200ms ease-out;
        }
      `}</style>
    </div>
  );
}
