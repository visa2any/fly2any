'use client';

import { useState, useEffect } from 'react';
import { X, Bell, Gift } from 'lucide-react';
import { shouldShowMarketingPopup, markAsSubscribed, markPopupDismissed } from '@/lib/subscription-tracker';

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

    // Skip if user already subscribed or dismissed
    if (!shouldShowMarketingPopup('mobile_scroll')) return;

    // Check if already shown this session
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
      // Safety check for document.documentElement
      if (!document.documentElement) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return; // Prevent division by zero
      const scrollPercent = (window.scrollY / totalHeight) * 100;
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
    markPopupDismissed('mobile_scroll');
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

      // Mark as subscribed to prevent ALL future marketing popups
      markAsSubscribed(email, 'mobile_scroll');
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

  // Temporarily hidden per user request
  return null;

  if (!isVisible || !isMobile) return null;

  const config = variant === 'price_alert'
    ? { icon: Bell, title: 'Track Prices', desc: 'Get alerts when prices drop', btn: 'Create Alert', color: 'primary' }
    : { icon: Gift, title: 'Get $5 Credit', desc: 'Join for exclusive deals', btn: 'Claim Now', color: 'green' };

  return (
    <div 
      className="fixed left-0 right-0 z-[1300] animate-slideUp"
      style={{ bottom: 'calc(52px + env(safe-area-inset-bottom, 0px) + 8px)' }}
    >
      <div className="mx-3 rounded-2xl shadow-2xl overflow-hidden bg-white border border-gray-100 ring-1 ring-black/5">
        {isSubmitted ? (
          <div className="p-3 text-center bg-green-50">
            <p className="text-green-700 text-sm font-semibold">✨ Successfully joined!</p>
          </div>
        ) : (
          <div className="p-3 relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors z-30"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-2.5">
              <div className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center ${
                config.color === 'primary' ? 'bg-primary-50' : 'bg-green-50'
              }`}>
                <config.icon className={`w-5 h-5 ${
                  config.color === 'primary' ? 'text-primary-600' : 'text-green-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-bold text-gray-900 text-[14px] leading-tight flex items-center gap-1.5">
                  {config.title}
                </h4>
                <p className="text-[12px] text-gray-500 font-medium truncate">{config.desc}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                required
                className="flex-1 h-10 px-3 text-[14px] bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
              <button
                type="submit"
                className={`px-4 h-10 text-[14px] font-bold text-white rounded-xl whitespace-nowrap transition-all active:scale-95 ${
                  config.color === 'primary'
                    ? 'bg-primary-500 hover:bg-primary-600 shadow-sm shadow-primary-200'
                    : 'bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200'
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
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </div>
  );
}
