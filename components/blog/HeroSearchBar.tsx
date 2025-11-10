'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface HeroSearchBarProps {
  onSearch: (query: string) => void;
  size?: 'md' | 'lg' | 'xl';
  showTrending?: boolean;
}

export function HeroSearchBar({ onSearch, size = 'lg', showTrending = false }: HeroSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const sizeClasses = {
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-6',
    xl: 'text-xl py-5 px-8',
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where do you want to go?"
          className={`
            w-full ${sizeClasses[size]}
            bg-white/95 backdrop-blur-md
            border-2 border-white/20
            rounded-2xl
            text-gray-900
            placeholder-gray-500
            focus:outline-none focus:border-blue-500
            shadow-2xl
            transition-all duration-300
          `}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
      {showTrending && (
        <div className="mt-4 text-white/80 text-sm text-center">
          <span className="mr-2">Trending:</span>
          <span className="text-blue-300">Paris, Tokyo, Bali, Rome, Dubai</span>
        </div>
      )}
    </form>
  );
}
