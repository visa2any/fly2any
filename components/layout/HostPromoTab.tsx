'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Floating vertical host promo tab
 * Appears on the LEFT edge of public pages after scrolling 400px.
 * Hidden on /host/*, /admin/*, /agent/*, /auth/*, /account/* routes.
 */
export function HostPromoTab() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isInternalRoute =
    pathname.startsWith('/host') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/agent') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/list-your-property');

  useEffect(() => {
    if (isInternalRoute) return;
    if (sessionStorage.getItem('hostTabDismissed')) {
      setDismissed(true);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isInternalRoute]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('hostTabDismissed', '1');
  };

  if (isInternalRoute || dismissed || !visible) return null;

  return (
    <a
      href="/list-your-property"
      aria-label="List Your Property"
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 group flex flex-col items-center"
      style={{ willChange: 'transform' }}
    >
      <div
        className="relative flex flex-col items-center justify-center gap-1.5 px-2 py-4 rounded-r-2xl shadow-lg transition-all duration-200 group-hover:pl-3 group-hover:shadow-xl"
        style={{
          background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
          width: '36px',
          minHeight: '110px',
        }}
      >
        {/* Dismiss × */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50"
          aria-label="Dismiss"
        >
          ×
        </button>

        {/* Icon */}
        <span className="text-white text-base leading-none">🏠</span>

        {/* Rotated label */}
        <span
          className="text-white font-bold text-[11px] tracking-widest leading-none"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            letterSpacing: '0.12em',
          }}
        >
          HOSTS
        </span>

        {/* Sub label */}
        <span
          className="text-white/90 font-medium leading-none text-center"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            fontSize: '9px',
            letterSpacing: '0.06em',
          }}
        >
          Earn&nbsp;$
        </span>
      </div>
    </a>
  );
}
