'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButton {
  name: string;
  icon: string;
  color: string;
  getUrl: (url: string, title: string) => string;
}

const SHARE_BUTTONS: ShareButton[] = [
  {
    name: 'WhatsApp',
    icon: '📱',
    color: 'hover:bg-green-50',
    getUrl: (url, title) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  {
    name: 'Pinterest',
    icon: '📌',
    color: 'hover:bg-red-50',
    getUrl: (url) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Email',
    icon: '✉️',
    color: 'hover:bg-gray-50',
    getUrl: (url, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
  {
    name: 'Telegram',
    icon: '✈️',
    color: 'hover:bg-blue-50',
    getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'Reddit',
    icon: '🤖',
    color: 'hover:bg-orange-50',
    getUrl: (url, title) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
];

export function ExtendedShareButtons() {
  const [isOpen, setIsOpen] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const title = typeof document !== 'undefined' ? document.title : '';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-all text-sm font-semibold text-gray-700 min-h-[44px] sm:min-h-0"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">More</span>
        <span className="sm:hidden">Share</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 sm:p-4 z-50 min-w-[280px] max-w-[90vw]">
            <div className="grid grid-cols-2 gap-2">
              {SHARE_BUTTONS.map((button) => (
                <a
                  key={button.name}
                  href={button.getUrl(url, title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-xl transition-all ${button.color} active:scale-95 sm:hover:scale-105 min-h-[48px]`}
                >
                  <span className="text-xl sm:text-2xl">{button.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">{button.name}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
