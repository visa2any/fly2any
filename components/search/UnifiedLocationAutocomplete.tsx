'use client';

import { useState, useEffect, useRef } from 'react';
import { LOCATIONS, type Location, type LocationType, type Popularity } from '@/data/locations';

// ============================================
// TYPES & INTERFACES
// ============================================

type Mode = 'airports-only' | 'cities-only' | 'both' | 'any';

interface Section {
  id: string;
  title: string;
  icon: string;
  locations: Location[];
}

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, location?: Location) => void;

  // Filtering
  mode?: Mode;
  allowedTypes?: LocationType[];

  // UI Options
  icon?: React.ReactNode;
  showExplore?: boolean;
  showPricing?: boolean;
  showWeather?: boolean;
  showSocialProof?: boolean;
  showRecentSearches?: boolean;
  showNearbyAirports?: boolean;
  groupBySections?: boolean;
  maxResults?: number;
}

// ============================================
// LOCATION DATA NOW IMPORTED FROM @/data/locations
// ============================================
// Locations array has been extracted to reduce bundle size
// See: @/data/locations.ts

// ============================================
// MAIN COMPONENT
// ============================================

export function UnifiedLocationAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  mode = 'any',
  allowedTypes,
  icon,
  showExplore = false,
  showPricing = true,
  showWeather = true,
  showSocialProof = true,
  showRecentSearches = true,
  showNearbyAirports = false,
  groupBySections = true,
  maxResults = 8,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches && typeof window !== 'undefined') {
      const saved = localStorage.getItem('fly2any-recent-searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load recent searches:', e);
        }
      }
    }
  }, [showRecentSearches]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter locations based on mode and query
  useEffect(() => {
    const organizedSections = organizeResults(inputValue, mode, allowedTypes || [], recentSearches, maxResults);
    setSections(organizedSections);
  }, [inputValue, mode, allowedTypes, recentSearches, maxResults]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function filterLocationsByMode(locations: Location[], mode: Mode, allowedTypes: LocationType[]): Location[] {
    let filtered = locations;

    // Mode filtering
    if (mode === 'airports-only') {
      filtered = filtered.filter(l => l.type === 'airport');
    } else if (mode === 'cities-only') {
      filtered = filtered.filter(l => l.type === 'city' || l.type === 'resort');
    } else if (mode === 'both') {
      filtered = filtered.filter(l => l.type === 'airport' || l.type === 'city');
    }

    // Additional type filtering
    if (allowedTypes.length > 0) {
      filtered = filtered.filter(l => allowedTypes.includes(l.type));
    }

    return filtered;
  }

  function organizeResults(
    query: string,
    mode: Mode,
    allowedTypes: LocationType[],
    recentSearches: string[],
    maxResults: number
  ): Section[] {
    const lowerQuery = query.toLowerCase().trim();
    const allSections: Section[] = [];

    // Filter all locations by mode first
    let filteredLocations = filterLocationsByMode(LOCATIONS, mode, allowedTypes);

    // Text search filtering
    if (lowerQuery.length > 0) {
      filteredLocations = filteredLocations.filter(loc =>
        loc.code.toLowerCase().includes(lowerQuery) ||
        loc.name.toLowerCase().includes(lowerQuery) ||
        loc.city.toLowerCase().includes(lowerQuery) ||
        loc.country.toLowerCase().includes(lowerQuery) ||
        loc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    if (!groupBySections) {
      // Simple ungrouped list
      return [{
        id: 'all',
        title: '',
        icon: '',
        locations: filteredLocations.slice(0, maxResults)
      }];
    }

    // Section 1: Perfect Match
    const perfectMatches = filteredLocations.filter(l =>
      l.code.toLowerCase() === lowerQuery ||
      l.name.toLowerCase() === lowerQuery
    ).slice(0, 1);

    if (perfectMatches.length > 0) {
      allSections.push({
        id: 'perfect',
        title: '🎯 PERFECT MATCH',
        icon: '🎯',
        locations: perfectMatches
      });
    }

    // Section 2: Recent Searches
    if (showRecentSearches && lowerQuery.length === 0 && recentSearches.length > 0) {
      const recentLocs = filteredLocations.filter(l => recentSearches.includes(l.id)).slice(0, 2);
      if (recentLocs.length > 0) {
        allSections.push({
          id: 'recent',
          title: '📍 RECENT SEARCHES',
          icon: '📍',
          locations: recentLocs
        });
      }
    }

    // Section 3: Trending Now
    if (lowerQuery.length === 0 || lowerQuery.length >= 2) {
      const trending = filteredLocations
        .filter(l => l.trendingScore >= 85)
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 3);

      if (trending.length > 0) {
        allSections.push({
          id: 'trending',
          title: '🔥 TRENDING NOW',
          icon: '🔥',
          locations: trending
        });
      }
    }

    // Section 4: Best Matches (text relevance)
    const remainingCount = maxResults - allSections.reduce((sum, s) => sum + s.locations.length, 0);
    if (remainingCount > 0) {
      const alreadyShown = new Set(allSections.flatMap(s => s.locations.map(l => l.id)));
      const bestMatches = filteredLocations
        .filter(l => !alreadyShown.has(l.id))
        .slice(0, remainingCount);

      if (bestMatches.length > 0) {
        allSections.push({
          id: 'destinations',
          title: lowerQuery.length > 0 ? '🌍 MATCHING DESTINATIONS' : '🌍 POPULAR DESTINATIONS',
          icon: '🌍',
          locations: bestMatches
        });
      }
    }

    return allSections.filter(s => s.locations.length > 0);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectLocation = (location: Location | 'explore') => {
    if (location === 'explore') {
      const value = 'Anywhere ✈️';
      setInputValue(value);
      onChange(value);
    } else {
      const value = location.type === 'airport'
        ? `${location.code} - ${location.city}`
        : `${location.name}, ${location.country}`;

      setInputValue(value);
      onChange(value, location);

      // Save to recent searches
      if (showRecentSearches && typeof window !== 'undefined') {
        const updated = [location.id, ...recentSearches.filter(id => id !== location.id)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('fly2any-recent-searches', JSON.stringify(updated));
      }
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allLocations = sections.flatMap(s => s.locations);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, allLocations.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectLocation(allLocations[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getBadges = (location: Location) => {
    const badges: JSX.Element[] = [];

    if (location.verified) {
      badges.push(
        <span key="verified" className="text-xs text-primary-600">✓</span>
      );
    }

    if (location.trendingScore >= 90) {
      badges.push(
        <span key="trending" className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 animate-pulse-subtle">
          🔥 Trending
        </span>
      );
    } else if (location.trendingScore >= 85) {
      badges.push(
        <span key="popular" className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
          ⭐ Popular
        </span>
      );
    }

    if (location.dealAvailable && showPricing) {
      badges.push(
        <span key="deal" className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-md">
          🌟 Deal
        </span>
      );
    }

    if (location.seasonalTag) {
      badges.push(
        <span key="seasonal" className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600">
          {location.seasonalTag.split(' ')[0]}
        </span>
      );
    }

    return badges;
  };

  // Flatten sections for keyboard navigation
  let globalIndex = -1;

  return (
    <div className="relative">
      {label && (
        <label className="block text-base font-bold text-gray-900 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-lg font-semibold text-gray-900 placeholder:text-gray-400 bg-white`}
        />
      </div>

      {/* Premium Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-[600px] overflow-y-auto animate-slideDown"
        >
          {/* Explore Anywhere Option */}
          {showExplore && inputValue.length === 0 && (
            <button
              onClick={() => handleSelectLocation('explore')}
              className="w-full relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600 p-6 text-white transition-all hover:scale-[1.02] border-b-2 border-white"
            >
              <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
              <div className="relative z-10">
                <div className="text-4xl mb-2">🌍</div>
                <div className="text-xl font-bold mb-1">Explore Anywhere</div>
                <div className="text-sm text-white/90">
                  Find the cheapest destinations from your location
                </div>
                <div className="mt-3 text-xs bg-white/20 rounded-lg px-3 py-1.5 inline-block">
                  ✨ Powered by AI price prediction
                </div>
              </div>
            </button>
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} className="py-2">
              {/* Section Header */}
              {section.title && (
                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                  {section.title}
                </div>
              )}

              {/* Location Cards */}
              {section.locations.map((location) => {
                globalIndex++;
                const isHighlighted = globalIndex === highlightedIndex;

                return (
                  <button
                    key={location.id}
                    onClick={() => handleSelectLocation(location)}
                    className={`w-full group relative overflow-hidden p-4 transition-all border-b border-gray-100 last:border-b-0 ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-l-primary-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Subtle gradient background */}
                    <div
                      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${location.gradientColors[0]}, ${location.gradientColors[1]})`
                      }}
                    />

                    <div className="relative z-10 flex items-start gap-4">
                      {/* Icon with gradient */}
                      <div
                        className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-3xl shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${location.gradientColors[0]}20, ${location.gradientColors[1]}20)`
                        }}
                      >
                        {location.emoji}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0">
                        {/* Name + Badges */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900 text-base">
                            {location.type === 'airport' ? (
                              <>
                                <span className="text-primary-600">{location.code}</span> - {location.name}
                              </>
                            ) : (
                              <>
                                {location.name}, {location.country}
                              </>
                            )}
                          </span>
                          {getBadges(location)}
                        </div>

                        {/* Context Row 1: Pricing & Weather */}
                        <div className="flex items-center gap-3 text-sm mb-1 flex-wrap">
                          {showPricing && location.averageFlightPrice && (
                            <span className="font-semibold text-primary-600">
                              From ${location.averageFlightPrice} ✈️
                            </span>
                          )}
                          {showPricing && location.averageHotelPrice && mode !== 'airports-only' && (
                            <span className="text-gray-600">
                              Hotels from ${location.averageHotelPrice}/nt 🏨
                            </span>
                          )}
                          {showWeather && location.weatherNow && (
                            <span className="text-gray-600">
                              {location.weatherNow.condition === 'sunny' ? '☀️' : location.weatherNow.condition === 'cloudy' ? '🌤️' : '🌧️'}
                              {location.weatherNow.temp}°F
                            </span>
                          )}
                        </div>

                        {/* Context Row 2: Best Time / Social Proof */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          {location.bestTimeToVisit && (
                            <span>💡 Best in {location.bestTimeToVisit}</span>
                          )}
                          {showSocialProof && location.searchCount24h && (
                            <span>{location.searchCount24h} searching now</span>
                          )}
                          {location.flightDuration && (
                            <span>{location.flightDuration} direct</span>
                          )}
                        </div>

                        {/* Seasonal Tag */}
                        {location.seasonalTag && (
                          <div className="mt-2 text-xs font-medium text-purple-600">
                            {location.seasonalTag}
                          </div>
                        )}

                        {/* Deal Badge */}
                        {location.dealAvailable && location.dealSavings && showPricing && (
                          <div className="mt-2 text-xs font-bold text-orange-600">
                            🔥 Save up to ${location.dealSavings} on packages!
                          </div>
                        )}

                        {/* Nearby Airports (for cities) */}
                        {showNearbyAirports && location.nearbyAirports && location.nearbyAirports.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            ✈️ Airports: {location.nearbyAirports.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className={`text-xl transition-all ${isHighlighted ? 'text-primary-600 translate-x-1' : 'text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1'}`}>
                        →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}

          {/* No Results */}
          {sections.length === 0 && inputValue.length > 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🌍</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                No destinations found
              </div>
              <div className="text-sm text-gray-500 mb-6">
                Try searching for &quot;Paris&quot;, &quot;New York&quot;, or &quot;Tokyo&quot;
              </div>
              <div className="text-xs text-gray-400">
                💡 TIP: Type at least 2 characters to see suggestions
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
