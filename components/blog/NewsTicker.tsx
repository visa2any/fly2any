'use client';

import { useEffect, useRef, useState } from 'react';

export interface NewsItem {
  id: string;
  text: string;
  urgency: 'critical' | 'important' | 'info';
  link?: string;
}

interface NewsTickerProps {
  newsItems: NewsItem[];
  speed?: number; // pixels per second
  language?: 'en' | 'pt' | 'es';
}

export function NewsTicker({ newsItems, speed = 50, language = 'en' }: NewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const urgencyIcons = {
    critical: '🚨',
    important: '⚠️',
    info: 'ℹ️',
  };

  const urgencyColors = {
    critical: 'text-red-600',
    important: 'text-orange-600',
    info: 'text-blue-600',
  };

  const translations = {
    en: { breaking: 'BREAKING' },
    pt: { breaking: 'URGENTE' },
    es: { breaking: 'ÚLTIMA HORA' },
  };

  const t = translations[language];

  return (
    <div className="w-full bg-gray-900 text-white py-2 overflow-hidden border-b-2 border-red-600">
      <div className="w-[90%] mx-auto flex items-center gap-3">
        {/* Label */}
        <div className="flex-shrink-0 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">
          {t.breaking}
        </div>

        {/* Scrolling News Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className={`flex gap-8 ${isPaused ? '' : 'animate-scroll-left'}`}
            style={{
              animationDuration: `${(newsItems.length * 10) / (speed / 50)}s`,
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...newsItems, ...newsItems].map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex-shrink-0 flex items-center gap-2 text-sm"
              >
                <span className={urgencyColors[item.urgency]}>
                  {urgencyIcons[item.urgency]}
                </span>
                {item.link ? (
                  <a
                    href={item.link}
                    className="hover:text-blue-400 transition-colors whitespace-nowrap"
                  >
                    {item.text}
                  </a>
                ) : (
                  <span className="whitespace-nowrap">{item.text}</span>
                )}
                <span className="text-gray-500">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-left {
          animation: scroll-left linear infinite;
        }
      `}</style>
    </div>
  );
}
