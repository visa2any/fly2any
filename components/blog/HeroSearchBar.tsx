'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, MapPin } from 'lucide-react';

interface HeroSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  size?: 'lg' | 'xl';
  className?: string;
  showTrending?: boolean;
}

const trendingSearches = [
  { query: 'Paris', icon: '🗼', region: 'Europe' },
  { query: 'Tokyo', icon: '🗾', region: 'Asia' },
  { query: 'Bali', icon: '🏝️', region: 'Indonesia' },
  { query: 'Dubai', icon: '🕌', region: 'UAE' },
  { query: 'New York', icon: '🗽', region: 'USA' },
  { query: 'Maldives', icon: '🏖️', region: 'Indian Ocean' },
];

const popularDestinations = [
  'Paris, France',
  'Tokyo, Japan',
  'Bali, Indonesia',
  'Dubai, UAE',
  'New York, USA',
  'London, UK',
  'Barcelona, Spain',
  'Rome, Italy',
  'Maldives',
  'Santorini, Greece',
];

export function HeroSearchBar({
  onSearch,
  placeholder = 'Where do you want to go?',
  size = 'xl',
  className = '',
  showTrending = true,
}: HeroSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    lg: 'h-14 text-lg',
    xl: 'h-16 md:h-20 text-lg md:text-xl',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = popularDestinations.filter(dest =>
        dest.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setIsFocused(false);
  };

  const handleTrendingClick = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative group">
        <div
          className={`
            relative ${sizeClasses[size]} rounded-2xl md:rounded-3xl
            bg-white shadow-2xl
            transition-all duration-300 ease-out
            ${isFocused ? 'ring-4 ring-blue-500/50 shadow-blue-500/30' : 'hover:shadow-blue-500/20'}
          `}
          style={{
            animation: 'glowPulse 3s ease-in-out infinite'
          }}
        >
          {/* Search Icon */}
          <div className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2">
            <Search className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className={`
              w-full h-full pl-14 md:pl-20 pr-32 md:pr-40
              ${sizeClasses[size]}
              rounded-2xl md:rounded-3xl
              font-semibold text-gray-900 placeholder-gray-400
              focus:outline-none
              bg-transparent
            `}
          />

          {/* Search Button */}
          <button
            type="submit"
            className="
              absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2
              px-4 md:px-8 py-2 md:py-3
              bg-gradient-to-r from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800
              text-white font-bold rounded-xl md:rounded-2xl
              transition-all duration-300
              shadow-lg hover:shadow-xl
              hover:scale-105
              text-sm md:text-base
            "
          >
            Search
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {isFocused && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="
                  w-full px-6 py-4 text-left
                  hover:bg-blue-50 transition-colors
                  flex items-center gap-3
                  group/item
                "
              >
                <MapPin className="w-5 h-5 text-blue-600 group-hover/item:scale-110 transition-transform" />
                <span className="text-gray-900 font-medium group-hover/item:text-blue-600">
                  {suggestion}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Trending Searches */}
      {showTrending && !isFocused && (
        <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3 animate-fadeIn">
          <span className="flex items-center gap-2 text-white/80 text-sm md:text-base font-medium">
            <TrendingUp className="w-4 h-4" />
            Trending:
          </span>
          {trendingSearches.slice(0, 6).map((item, index) => (
            <button
              key={index}
              onClick={() => handleTrendingClick(item.query)}
              className="
                px-3 md:px-4 py-1.5 md:py-2
                bg-white/10 backdrop-blur-sm
                hover:bg-white/20
                border border-white/20 hover:border-white/40
                rounded-full
                text-white text-xs md:text-sm font-medium
                transition-all duration-300
                hover:scale-105
                flex items-center gap-1.5
              "
            >
              <span>{item.icon}</span>
              <span>{item.query}</span>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 60px rgba(59, 130, 246, 0.4); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
