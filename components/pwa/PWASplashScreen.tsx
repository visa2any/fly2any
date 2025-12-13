'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * PWA Splash Screen - Level-6 Ultra-Premium
 *
 * Beautiful app loading entry for PWA with:
 * - Animated logo reveal
 * - Gradient background
 * - Smooth fade out transition
 * - Travel-themed loading animation
 */
export function PWASplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if running as PWA (standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;

    // Only show splash for PWA mode
    if (!isPWA) {
      setIsVisible(false);
      return;
    }

    // Trigger loaded animation after mount
    const loadTimer = setTimeout(() => setIsLoaded(true), 100);

    // Hide splash after animation completes
    const hideTimer = setTimeout(() => setIsVisible(false), 2500);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 50%, #FAFAFA 100%)',
      }}
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #E74035 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full opacity-[0.02]"
          style={{
            background: 'radial-gradient(circle, #F7C928 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite 1.5s',
          }}
        />
      </div>

      {/* Logo Container */}
      <div
        className={`relative transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isLoaded ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
        }`}
      >
        <Image
          src="/logo.png"
          alt="Fly2Any"
          width={231}
          height={80}
          priority
          className="h-16 sm:h-20 lg:h-24 w-auto object-contain drop-shadow-lg"
        />
      </div>

      {/* Tagline */}
      <p
        className={`mt-4 text-sm sm:text-base text-neutral-500 font-medium tracking-wide transition-all duration-700 delay-300 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        Your journey starts here
      </p>

      {/* Loading Animation - Airplane Trail */}
      <div
        className={`mt-8 flex items-center gap-1 transition-all duration-700 delay-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              style={{
                animation: 'bounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
        <svg
          className="w-5 h-5 text-primary-500 ml-1"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ animation: 'fly 1.4s ease-in-out infinite' }}
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.03; }
          50% { transform: scale(1.1); opacity: 0.05; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fly {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(3px) translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
