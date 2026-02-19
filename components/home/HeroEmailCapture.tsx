'use client';

import { useState, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

interface HeroEmailCaptureProps {
  className?: string;
}

export function HeroEmailCapture({ className = '' }: HeroEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);

  // Check if user already subscribed (localStorage)
  useEffect(() => {
    try {
      const subscribed = localStorage.getItem('fly2any_newsletter_subscribed');
      if (subscribed === 'true') {
        setDismissed(true);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage_hero' }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.alreadySubscribed) {
          setStatus('already');
          setMessage("You're already subscribed! Check your inbox for deals.");
        } else {
          setStatus('success');
          setMessage('Check your email to confirm your subscription!');
          try {
            localStorage.setItem('fly2any_newsletter_subscribed', 'true');
          } catch {}
        }

        // Track conversion
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'newsletter_signup', {
            event_category: 'lead_capture',
            event_label: 'homepage_hero',
          });
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Connection error. Please try again.');
    }
  };

  if (dismissed) return null;

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      {status === 'success' || status === 'already' ? (
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/20 animate-fadeIn">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-white/95 text-sm font-medium">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="relative">
          {/* Social proof line */}
          <p className="text-white/70 text-xs font-medium text-center mb-2.5 tracking-wide">
            ✉️ Join 50,000+ travelers getting exclusive fare drops
          </p>

          {/* Input + Button group */}
          <div className="flex items-stretch bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/30 transition-colors overflow-hidden shadow-lg shadow-black/10">
            <div className="flex items-center gap-2.5 flex-1 px-4">
              <Mail className="w-4 h-4 text-white/50 flex-shrink-0" />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm py-3.5 outline-none min-w-0"
                disabled={status === 'loading'}
                aria-label="Email address for newsletter"
                id="hero-email-capture"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold text-sm px-5 py-3.5 transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Get Deals
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Error message */}
          {status === 'error' && message && (
            <p className="text-red-300 text-xs mt-1.5 text-center">{message}</p>
          )}

          {/* Privacy note */}
          <p className="text-white/40 text-[10px] text-center mt-2">
            No spam, ever. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}
