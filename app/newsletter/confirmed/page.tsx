'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Sparkles, Mail, Plane, Gift } from 'lucide-react';

export default function NewsletterConfirmedPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-100/20 to-sky-100/20 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative max-w-lg w-full transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Success Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-500/10 border border-white/50 overflow-hidden">

          {/* Success Icon with Animation */}
          <div className="pt-12 pb-6 flex justify-center">
            <div className={`relative transition-all duration-500 delay-300 ${
              mounted ? 'scale-100' : 'scale-0'
            }`}>
              {/* Glow ring */}
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />

              {/* Icon container */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />

                {/* Sparkle decorations */}
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce" />
                <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-amber-400 animate-bounce delay-150" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 text-center">
            <h1 className={`text-2xl md:text-3xl font-bold text-gray-900 mb-3 transition-all duration-500 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              You're All Set!
            </h1>

            <p className={`text-gray-600 mb-8 transition-all duration-500 delay-600 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Your subscription is confirmed. Get ready for exclusive travel deals delivered straight to your inbox.
            </p>

            {/* Benefits */}
            <div className={`space-y-3 mb-8 transition-all duration-500 delay-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {[
                { icon: Plane, text: 'Flash deals up to 70% off', color: 'text-sky-500' },
                { icon: Gift, text: 'Early access to promotions', color: 'text-rose-500' },
                { icon: Mail, text: 'Weekly curated picks', color: 'text-violet-500' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-50/80 rounded-xl px-4 py-3"
                  style={{ transitionDelay: `${800 + i * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/"
              className={`inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '1000ms' }}
            >
              <Plane className="w-5 h-5" />
              Start Exploring Deals
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className={`text-center text-sm text-gray-500 mt-6 transition-all duration-500 delay-1000 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}>
          Questions? <a href="mailto:support@fly2any.com" className="text-primary-600 hover:underline">support@fly2any.com</a>
        </p>
      </div>
    </main>
  );
}
