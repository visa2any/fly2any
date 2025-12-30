'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/client';
import { useCurrency, currencies, CurrencyCode } from '@/lib/hooks/useCurrency';

const languages = {
  en: { name: 'English', flag: '🇺🇸', code: 'EN' },
  pt: { name: 'Português', flag: '🇧🇷', code: 'PT' },
  es: { name: 'Español', flag: '🇪🇸', code: 'ES' },
} as const;

type Language = keyof typeof languages;

interface LocaleSwitcherProps {
  scrolled?: boolean;
}

/**
 * Ultra-compact Language & Currency Switcher
 * Level-6 Apple-class design - subtle, minimal footprint
 */
export function LocaleSwitcher({ scrolled = true }: LocaleSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency, currencyInfo } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lang' | 'curr'>('lang');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const handleCurrencyChange = (curr: CurrencyCode) => {
    setCurrency(curr);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative locale-switcher">
      {/* Trigger Button - Ultra Compact */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium ${
          scrolled
            ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            : 'text-white hover:text-white/90 hover:bg-white/10'
        }`}
        style={{ textShadow: scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.5)' }}
        aria-label="Language and Currency"
      >
        <span className="text-sm">{languages[language as Language]?.flag || '🌐'}</span>
        <span className="hidden sm:inline text-[10px] uppercase tracking-wide opacity-80">
          {languages[language as Language]?.code || 'EN'}
        </span>
        <span className={`hidden sm:inline ${scrolled ? 'text-neutral-300' : 'text-white/50'}`}>|</span>
        <span className="hidden sm:inline text-[10px] font-semibold">
          {currencyInfo.symbol}
        </span>
        <svg
          className={`w-3 h-3 opacity-60 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Tab Switcher */}
          <div className="flex border-b border-neutral-100">
            <button
              onClick={() => setActiveTab('lang')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'lang'
                  ? 'text-primary-600 border-b-2 border-primary-500 -mb-px bg-primary-50/50'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Language
            </button>
            <button
              onClick={() => setActiveTab('curr')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === 'curr'
                  ? 'text-primary-600 border-b-2 border-primary-500 -mb-px bg-primary-50/50'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Currency
            </button>
          </div>

          {/* Language Options */}
          {activeTab === 'lang' && (
            <div className="py-1 max-h-64 overflow-y-auto">
              {(Object.keys(languages) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    language === lang
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <span className="text-lg">{languages[lang].flag}</span>
                  <span className="text-sm font-medium flex-1">{languages[lang].name}</span>
                  {language === lang && (
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Currency Options */}
          {activeTab === 'curr' && (
            <div className="py-1 max-h-64 overflow-y-auto">
              {(Object.keys(currencies) as CurrencyCode[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    currency === curr
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <span className="text-lg">{currencies[curr].flag}</span>
                  <span className="text-sm font-medium flex-1">
                    {currencies[curr].symbol} {curr}
                  </span>
                  {currency === curr && (
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocaleSwitcher;
