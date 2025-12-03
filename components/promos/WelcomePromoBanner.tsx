'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Gift, X, Sparkles, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface WelcomePromoBannerProps {
  variant?: 'banner' | 'card' | 'inline';
  onApplyCode?: (code: string) => void;
  className?: string;
}

export function WelcomePromoBanner({
  variant = 'banner',
  onApplyCode,
  className = '',
}: WelcomePromoBannerProps) {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  const promoCode = 'WELCOME5';

  useEffect(() => {
    // Check if banner was dismissed
    const wasDismissed = localStorage.getItem('welcome_promo_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }

    // Check if user has made bookings before (if logged in)
    // For simplicity, we'll show to all users initially
    // In production, you'd check booking history
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('welcome_promo_dismissed', 'true');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast.success('Promo code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleApply = () => {
    if (onApplyCode) {
      onApplyCode(promoCode);
    } else {
      handleCopy();
    }
  };

  if (dismissed) return null;

  // Inline variant - minimal
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Gift className="w-4 h-4 text-amber-500" />
        <span className="text-gray-600">New here? Use</span>
        <button
          onClick={handleApply}
          className="font-mono font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-0.5 rounded"
        >
          {promoCode}
        </button>
        <span className="text-gray-600">for 5% off!</span>
      </div>
    );
  }

  // Card variant - compact
  if (variant === 'card') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 ${className}`}
        >
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 flex flex-wrap items-center gap-2">
              <span className="text-sm text-amber-800">
                <span className="font-semibold">5% off</span> first booking:
              </span>
              <button
                onClick={handleCopy}
                className="font-mono font-bold text-amber-700 bg-white border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
              >
                {promoCode}
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {onApplyCode && (
                <button
                  onClick={handleApply}
                  className="px-2 py-0.5 bg-amber-600 text-white rounded text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  Apply
                </button>
              )}
            </div>
            <button
              onClick={handleDismiss}
              className="text-amber-400 hover:text-amber-600 p-1 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant - compact full width
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`bg-gradient-to-r from-amber-500 to-orange-500 text-white ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-200 hidden sm:block" />
            <p className="text-sm font-medium">
              <span className="font-bold">5% off</span> first booking:{' '}
              <button
                onClick={handleCopy}
                className="font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded hover:bg-white/30 transition-colors inline-flex items-center gap-1"
              >
                {promoCode}
                {copied && <CheckCircle2 className="w-3 h-3" />}
              </button>
            </p>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WelcomePromoBanner;
