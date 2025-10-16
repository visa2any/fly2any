'use client';

import { useState, useEffect } from 'react';

interface BlogSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  language?: 'en' | 'pt' | 'es';
}

export function BlogSearch({ onSearch, placeholder, language = 'en' }: BlogSearchProps) {
  const [query, setQuery] = useState('');

  const translations = {
    en: { placeholder: 'Search articles, deals, destinations...' },
    pt: { placeholder: 'Buscar artigos, ofertas, destinos...' },
    es: { placeholder: 'Buscar artículos, ofertas, destinos...' },
  };

  const t = translations[language];

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="w-[90%] mx-auto py-4">
      <div className="relative max-w-2xl mx-auto">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || t.placeholder}
          className="
            w-full pl-12 pr-12 py-3
            text-base
            bg-white
            border-2 border-gray-200
            rounded-full
            focus:outline-none focus:border-blue-600
            transition-colors duration-300
            shadow-sm
          "
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
