'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface MicroFeedbackProps {
  page: string;
  component?: string;
  trigger?: 'error' | 'hesitation' | 'abandonment' | 'manual';
  onSubmit?: (rating: 1 | 2 | 3, comment?: string) => void;
  onDismiss?: () => void;
  variant?: 'slide-up' | 'inline' | 'emoji-scale';
  autoHide?: number; // ms to auto-hide
}

/**
 * Apple-Class Micro-Feedback Component
 * Non-intrusive, elegant, contextual
 */
export default function MicroFeedback({
  page,
  component,
  trigger = 'manual',
  onSubmit,
  onDismiss,
  variant = 'slide-up',
  autoHide = 15000,
}: MicroFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [rating, setRating] = useState<1 | 2 | 3 | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (autoHide > 0) {
      const timer = setTimeout(() => handleDismiss(), autoHide);
      return () => clearTimeout(timer);
    }
  }, [autoHide]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleRating = (r: 1 | 2 | 3) => {
    setRating(r);
    if (r === 1) {
      setShowComment(true); // Ask for more details on negative
    } else {
      submitFeedback(r);
    }
  };

  const submitFeedback = (r: 1 | 2 | 3, c?: string) => {
    onSubmit?.(r, c);

    // Send to API
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        component,
        rating: r,
        comment: c,
        trigger,
        timestamp: Date.now(),
      }),
    }).catch(() => {}); // Silent fail

    setSubmitted(true);
    setTimeout(handleDismiss, 1500);
  };

  if (!isVisible) return null;

  // ═══════════════════════════════════════════════════════════════════════
  // EMOJI SCALE VARIANT (Minimal)
  // ═══════════════════════════════════════════════════════════════════════
  if (variant === 'emoji-scale') {
    return (
      <div className="inline-flex items-center gap-3 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
        {!submitted ? (
          <>
            <span className="text-xs text-gray-500">How was this?</span>
            <div className="flex gap-1">
              {[
                { emoji: '😞', value: 1 as const },
                { emoji: '😐', value: 2 as const },
                { emoji: '😊', value: 3 as const },
              ].map(({ emoji, value }) => (
                <button
                  key={value}
                  onClick={() => handleRating(value)}
                  className={`text-lg hover:scale-125 transition-transform ${
                    rating === value ? 'scale-125' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        ) : (
          <span className="text-xs text-gray-500">Thanks!</span>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INLINE VARIANT (Subtle link)
  // ═══════════════════════════════════════════════════════════════════════
  if (variant === 'inline') {
    if (submitted) return <span className="text-xs text-gray-400">Thanks for your feedback</span>;

    return (
      <button
        onClick={() => setShowComment(true)}
        className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
      >
        Give feedback
      </button>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SLIDE-UP VARIANT (Default - max 48px when collapsed)
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
        showComment ? 'w-80' : 'w-auto'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {submitted ? (
          <div className="px-4 py-3 text-center">
            <span className="text-sm text-gray-600">Thank you for your feedback</span>
          </div>
        ) : showComment ? (
          // Expanded state with comment input
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900">What went wrong?</span>
              <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us briefly (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none"
              rows={2}
              maxLength={200}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => submitFeedback(1)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Skip
              </button>
              <button
                onClick={() => submitFeedback(1, comment)}
                className="px-4 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          // Collapsed state (max 48px height)
          <div className="flex items-center gap-4 px-4 py-2.5">
            <span className="text-xs text-gray-500 whitespace-nowrap">Quick feedback</span>
            <div className="flex gap-2">
              {[
                { emoji: '😞', value: 1 as const, label: 'Bad' },
                { emoji: '😐', value: 2 as const, label: 'OK' },
                { emoji: '😊', value: 3 as const, label: 'Good' },
              ].map(({ emoji, value }) => (
                <button
                  key={value}
                  onClick={() => handleRating(value)}
                  className="text-xl hover:scale-110 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 ml-1">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK FOR AUTO-TRIGGERING
// ═══════════════════════════════════════════════════════════════════════════
export function useFeedbackTrigger(page: string) {
  const [shouldShow, setShouldShow] = useState(false);
  const [trigger, setTrigger] = useState<MicroFeedbackProps['trigger']>('manual');

  useEffect(() => {
    let hesitationTimer: NodeJS.Timeout;
    let formCorrections = 0;

    // Hesitation detection
    const resetHesitation = () => {
      clearTimeout(hesitationTimer);
      hesitationTimer = setTimeout(() => {
        setTrigger('hesitation');
        setShouldShow(true);
      }, 15000); // 15s hesitation
    };

    // Form correction detection
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === 'INPUT' && target.value.length < 3) {
        formCorrections++;
        if (formCorrections > 4) {
          setTrigger('hesitation');
          setShouldShow(true);
        }
      }
    };

    // Error detection
    const handleError = () => {
      setTrigger('error');
      setShouldShow(true);
    };

    document.addEventListener('mousemove', resetHesitation);
    document.addEventListener('keydown', resetHesitation);
    document.addEventListener('input', handleInput);
    window.addEventListener('error', handleError);

    return () => {
      clearTimeout(hesitationTimer);
      document.removeEventListener('mousemove', resetHesitation);
      document.removeEventListener('keydown', resetHesitation);
      document.removeEventListener('input', handleInput);
      window.removeEventListener('error', handleError);
    };
  }, [page]);

  const dismiss = () => setShouldShow(false);

  return { shouldShow, trigger, dismiss };
}
