'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Floating vertical agent promo tab
 * Appears on the right edge of public pages after scrolling 200px.
 * Hidden on /agent/*, /admin/*, /host/*, /auth/* routes.
 */
export function AgentPromoTab() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Hide on internal portal routes
  const isInternalRoute =
    pathname?.startsWith('/agent') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/host') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/account');

  useEffect(() => {
    if (isInternalRoute) return;
    // Check session storage to not re-show if dismissed this session
    if (sessionStorage.getItem('agentTabDismissed')) {
      setDismissed(true);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isInternalRoute]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('agentTabDismissed', '1');
  };

  if (isInternalRoute || dismissed || !visible) return null;

  return (
    <a
      href="/agent"
      aria-label="Travel Agent Portal"
      className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 group flex-col items-center"
      style={{ willChange: 'transform' }}
    >
      {/* Tab body */}
      <div
        className="relative flex flex-col items-center justify-center gap-1.5 px-2 py-4 rounded-l-2xl shadow-lg transition-all duration-200 group-hover:pr-3 group-hover:shadow-xl"
        style={{
          background: 'linear-gradient(180deg, #E74035 0%, #c0392b 100%)',
          width: '36px',
          minHeight: '110px',
        }}
      >
        {/* Dismiss × */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -left-2 w-5 h-5 bg-gray-800 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50"
          aria-label="Dismiss"
        >
          ×
        </button>

        {/* Icon */}
        <span className="text-white text-base leading-none">💼</span>

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
          AGENTS
        </span>

        {/* Earn badge */}
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
          Earn&nbsp;%
        </span>
      </div>
    </a>
  );
}
