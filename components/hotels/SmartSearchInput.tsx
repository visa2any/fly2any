'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Mic,
  MicOff,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Star,
  Loader2,
  ArrowRight,
  X,
  Lightbulb,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ParsedQuery {
  destination?: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  children?: number;
  nights?: number;
  budget?: { min?: number; max?: number };
  stars?: number[];
  amenities?: string[];
  mood?: string;
  sortBy?: string;
  intent: string;
  confidence: number;
}

interface SmartSearchInputProps {
  onSearch?: (params: Record<string, any>) => void;
  initialQuery?: string;
  placeholder?: string;
  className?: string;
  showVoice?: boolean;
  showSuggestions?: boolean;
}

const exampleQueries = [
  "5-star hotels in Dubai with pool under $300",
  "Family friendly resort in Bali next weekend",
  "Romantic getaway in Paris for 3 nights",
  "Business hotel near airport in Singapore",
  "Budget-friendly stay in Barcelona with breakfast",
  "Luxury beachfront villa in Maldives",
];

export function SmartSearchInput({
  onSearch,
  initialQuery = '',
  placeholder = 'Try: "5-star hotel in Dubai with pool under $300"',
  className = '',
  showVoice = true,
  showSuggestions = true,
}: SmartSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [parsed, setParsed] = useState<ParsedQuery | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Check for voice support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setVoiceSupported(true);
    }
  }, []);

  // Debounced NLP parsing
  const parseQuery = useCallback(async (text: string) => {
    if (text.length < 3) {
      setParsed(null);
      setInterpretation('');
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/hotels/nlp-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      const data = await response.json();

      if (data.success) {
        setParsed(data.data.parsed);
        setInterpretation(data.data.interpretation);
        setSuggestions(data.data.suggestions || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('NLP parse error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        parseQuery(query);
      } else {
        setShowResults(false);
        setParsed(null);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, parseQuery]);

  // Handle search execution
  const handleSearch = () => {
    if (!parsed) return;

    // Build search parameters
    const params = new URLSearchParams();

    if (parsed.destination) params.set('destination', parsed.destination);
    if (parsed.checkin) params.set('checkin', parsed.checkin);
    if (parsed.checkout) params.set('checkout', parsed.checkout);
    if (parsed.adults) params.set('adults', String(parsed.adults));
    if (parsed.children) params.set('children', String(parsed.children));
    if (parsed.budget?.max) params.set('maxPrice', String(parsed.budget.max));
    if (parsed.stars?.length) params.set('stars', parsed.stars.join(','));
    if (parsed.amenities?.length) params.set('amenities', parsed.amenities.join(','));
    if (parsed.sortBy) params.set('sort', parsed.sortBy);

    if (onSearch) {
      onSearch(Object.fromEntries(params));
    } else {
      // Navigate to search results
      router.push(`/hotels?${params.toString()}`);
    }

    setShowResults(false);
  };

  // Voice recognition
  const startVoiceRecognition = () => {
    if (!voiceSupported) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Handle example query click
  const handleExampleClick = (example: string) => {
    setQuery(example);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <Search className="w-5 h-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && parsed && handleSearch()}
          onFocus={() => query.length > 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-16 pr-24 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}

          {showVoice && voiceSupported && (
            <button
              onClick={startVoiceRecognition}
              className={`p-2 rounded-full transition-colors ${
                isListening
                  ? 'bg-red-100 text-red-600'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="Voice search"
            >
              {isListening ? (
                <Mic className="w-5 h-5 animate-pulse" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowResults(false);
                setParsed(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Parsed Results Dropdown */}
      {showResults && parsed && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Interpretation */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">{interpretation}</p>
                {parsed.confidence && (
                  <p className="text-xs text-gray-500 mt-1">
                    Confidence: {Math.round(parsed.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parsed Parameters */}
          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {parsed.destination && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <MapPin className="w-4 h-4" />
                  {parsed.destination}
                </span>
              )}
              {parsed.checkin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                  <Calendar className="w-4 h-4" />
                  {parsed.checkin}
                  {parsed.checkout && ` → ${parsed.checkout}`}
                </span>
              )}
              {parsed.nights && !parsed.checkout && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                  <Calendar className="w-4 h-4" />
                  {parsed.nights} nights
                </span>
              )}
              {(parsed.adults || parsed.children) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                  <Users className="w-4 h-4" />
                  {parsed.adults || 2} adults{parsed.children ? `, ${parsed.children} children` : ''}
                </span>
              )}
              {parsed.budget?.max && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  <DollarSign className="w-4 h-4" />
                  Under ${parsed.budget.max}
                </span>
              )}
              {parsed.stars && parsed.stars.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  <Star className="w-4 h-4" />
                  {parsed.stars.join(' or ')}-star
                </span>
              )}
              {parsed.amenities && parsed.amenities.map(amenity => (
                <span key={amenity} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {amenity}
                </span>
              ))}
              {parsed.mood && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm capitalize">
                  {parsed.mood} trip
                </span>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-4 text-sm text-gray-500">
                <span className="font-medium">To refine your search:</span>{' '}
                {suggestions.join(' ')}
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!parsed.destination}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
              Search Hotels
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Example Queries */}
      {showSuggestions && !showResults && !query && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            Try searching like this:
          </p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.slice(0, 3).map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Listening Indicator */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-2xl">
          <div className="text-center">
            <div className="relative inline-block">
              <Mic className="w-12 h-12 text-red-500 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            </div>
            <p className="mt-2 text-gray-600">Listening...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartSearchInput;
