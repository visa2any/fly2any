'use client';

import { useState, useEffect } from 'react';
import { X, Bell, Gift } from 'lucide-react';

interface MobileScrollCaptureProps {
  scrollThreshold?: number; // Percentage (0-100) of page scrolled
  timeOnPageMs?: number; // Minimum time on page before showing
  onEmailSubmit?: (email: string) => void;
  variant?: 'newsletter' | 'price_alert';
}

export default function MobileScrollCapture({
  scrollThreshold = 50,
  timeOnPageMs = 15000,
  onEmailSubmit,
  variant = 'newsletter',
}: MobileScrollCaptureProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only show on mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    // Check if already shown
    const hasSeenCapture = sessionStorage.getItem('mobileScrollCaptureShown');
    if (hasSeenCapture) return;

    let hasMetTimeRequirement = false;
    let hasMetScrollRequirement = false;

    // Time on page check
    const timeTimer = setTimeout(() => {
      hasMetTimeRequirement = true;
      if (hasMetScrollRequirement) triggerShow();
    }, timeOnPageMs);

    // Scroll depth check
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= scrollThreshold) {
        hasMetScrollRequirement = true;
        if (hasMetTimeRequirement) triggerShow();
      }
    };

    const triggerShow = () => {
      setIsVisible(true);
      sessionStorage.setItem('mobileScrollCaptureShown', 'true');
      // Track
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'mobile_scroll_capture_shown', {
          event_category: 'lead_capture',
          scroll_threshold: scrollThreshold,
          time_on_page: timeOnPageMs,
        });
      }
      window.removeEventListener('scroll', handleScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, scrollThreshold, timeOnPageMs]);

  const handleClose = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_scroll_capture_dismissed', {
        event_category: 'lead_capture',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'mobile_scroll_capture' }),
      });

      setIsSubmitted(true);
      onEmailSubmit?.(email);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'mobile_scroll_capture_converted', {
          event_category: 'lead_capture',
          email_captured: true,
        });
      }

      setTimeout(() => setIsVisible(false), 2500);
    } catch {
      // Silent fail
    }
  };

  if (!isVisible || !isMobile) return null;

  const config = variant === 'price_alert'
    ? { icon: Bell, title: 'Track Prices', desc: 'Get alerts when prices drop', btn: 'Create Alert', color: 'primary' }
    : { icon: Gift, title: 'Get $5 Credit', desc: 'Join for exclusive deals', btn: 'Claim Now', color: 'green' };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
      <div className={`mx-2 mb-2 rounded-2xl shadow-2xl overflow-hidden bg-white border border-gray-100`}>
        {isSubmitted ? (
          <div className="p-4 text-center bg-green-50">
            <p className="text-green-700 font-medium">You're all set!</p>
          </div>
        ) : (
          <div className="p-4">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                config.color === 'primary' ? 'bg-primary-100' : 'bg-green-100'
              }`}>
                <config.icon className={`w-5 h-5 ${
                  config.color === 'primary' ? 'text-primary-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{config.title}</h4>
                <p className="text-sm text-gray-500">{config.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className={`px-4 py-2.5 text-sm font-semibold text-white rounded-xl whitespace-nowrap ${
                  config.color === 'primary'
                    ? 'bg-primary-500 hover:bg-primary-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {config.btn}
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
