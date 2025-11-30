'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Briefcase,
  Heart,
  Users,
  Palmtree,
  Building2,
  Wallet,
  Star,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Coffee,
  Dog,
  Accessibility,
  Baby,
  Martini,
  X,
  Filter,
  ChevronDown,
  Check,
} from 'lucide-react';

interface SmartFilterPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  filters: {
    stars?: number[];
    amenities?: string[];
    priceRange?: { min: number; max: number };
    rating?: number;
    refundable?: boolean;
    types?: string[];
  };
  popular?: boolean;
}

const smartPresets: SmartFilterPreset[] = [
  {
    id: 'business',
    name: 'Business Ready',
    description: 'WiFi, workspace, near business districts',
    icon: Briefcase,
    gradient: 'from-blue-500 to-indigo-600',
    filters: {
      amenities: ['wifi', 'business center', 'meeting room', 'desk'],
      stars: [4, 5],
      rating: 8,
    },
    popular: true,
  },
  {
    id: 'romantic',
    name: 'Romantic Escape',
    description: 'Spa, fine dining, boutique hotels',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-600',
    filters: {
      amenities: ['spa', 'restaurant', 'room service', 'pool'],
      stars: [4, 5],
      rating: 8.5,
    },
    popular: true,
  },
  {
    id: 'family',
    name: 'Family Friendly',
    description: 'Kid amenities, connecting rooms, activities',
    icon: Users,
    gradient: 'from-green-500 to-emerald-600',
    filters: {
      amenities: ['pool', 'kids club', 'family room', 'playground'],
      stars: [3, 4, 5],
    },
    popular: true,
  },
  {
    id: 'beach',
    name: 'Beach Lovers',
    description: 'Beachfront, pool, water activities',
    icon: Palmtree,
    gradient: 'from-cyan-500 to-blue-600',
    filters: {
      amenities: ['beach', 'pool', 'sea view', 'water sports'],
      types: ['resort', 'beach resort'],
    },
  },
  {
    id: 'luxury',
    name: 'Luxury Stay',
    description: '5-star, premium amenities, top-rated',
    icon: Star,
    gradient: 'from-yellow-500 to-orange-600',
    filters: {
      stars: [5],
      rating: 9,
      amenities: ['spa', 'pool', 'concierge', 'valet parking'],
    },
    popular: true,
  },
  {
    id: 'budget',
    name: 'Budget Smart',
    description: 'Best value, essential amenities',
    icon: Wallet,
    gradient: 'from-gray-500 to-gray-700',
    filters: {
      stars: [2, 3],
      amenities: ['wifi', 'breakfast'],
    },
  },
  {
    id: 'petfriendly',
    name: 'Pet Friendly',
    description: 'Bring your furry friends along',
    icon: Dog,
    gradient: 'from-amber-500 to-orange-600',
    filters: {
      amenities: ['pet friendly', 'pets allowed'],
    },
  },
  {
    id: 'accessible',
    name: 'Accessible',
    description: 'Wheelchair access, accessible rooms',
    icon: Accessibility,
    gradient: 'from-purple-500 to-violet-600',
    filters: {
      amenities: ['wheelchair accessible', 'accessible bathroom', 'elevator'],
    },
  },
];

interface SmartFiltersProps {
  onFilterChange: (filters: {
    stars?: number[];
    amenities?: string[];
    priceRange?: { min: number; max: number };
    rating?: number;
    refundable?: boolean;
    types?: string[];
    preset?: string;
  }) => void;
  activeFilters?: {
    stars?: number[];
    amenities?: string[];
    priceRange?: { min: number; max: number };
    rating?: number;
    refundable?: boolean;
    types?: string[];
  };
  className?: string;
}

export function SmartFilters({
  onFilterChange,
  activeFilters = {},
  className = '',
}: SmartFiltersProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Custom filter states
  const [stars, setStars] = useState<number[]>(activeFilters.stars || []);
  const [minRating, setMinRating] = useState<number>(activeFilters.rating || 0);
  const [priceRange, setPriceRange] = useState(activeFilters.priceRange || { min: 0, max: 1000 });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(activeFilters.amenities || []);
  const [refundableOnly, setRefundableOnly] = useState(activeFilters.refundable || false);

  const displayedPresets = showAllPresets ? smartPresets : smartPresets.filter(p => p.popular);

  const applyPreset = (preset: SmartFilterPreset) => {
    if (selectedPreset === preset.id) {
      // Deselect
      setSelectedPreset(null);
      onFilterChange({});
    } else {
      setSelectedPreset(preset.id);
      setStars(preset.filters.stars || []);
      setMinRating(preset.filters.rating || 0);
      setSelectedAmenities(preset.filters.amenities || []);
      onFilterChange({ ...preset.filters, preset: preset.id });
    }
  };

  const applyCustomFilters = () => {
    setSelectedPreset(null);
    onFilterChange({
      stars: stars.length > 0 ? stars : undefined,
      rating: minRating > 0 ? minRating : undefined,
      priceRange: priceRange.min > 0 || priceRange.max < 1000 ? priceRange : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      refundable: refundableOnly || undefined,
    });
  };

  const clearAll = () => {
    setSelectedPreset(null);
    setStars([]);
    setMinRating(0);
    setPriceRange({ min: 0, max: 1000 });
    setSelectedAmenities([]);
    setRefundableOnly(false);
    onFilterChange({});
  };

  const activeCount = useMemo(() => {
    let count = 0;
    if (selectedPreset) count++;
    if (stars.length > 0 && !selectedPreset) count++;
    if (minRating > 0 && !selectedPreset) count++;
    if (selectedAmenities.length > 0 && !selectedPreset) count++;
    if (refundableOnly) count++;
    return count;
  }, [selectedPreset, stars, minRating, selectedAmenities, refundableOnly]);

  const amenityOptions = [
    { id: 'wifi', label: 'Free WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'bar', label: 'Bar', icon: Martini },
    { id: 'pet friendly', label: 'Pet Friendly', icon: Dog },
    { id: 'kids club', label: 'Kids Club', icon: Baby },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Smart Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Smart Filters</h3>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {activeCount} active
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>

        {/* Preset Cards */}
        <div className="flex gap-2 flex-wrap">
          {displayedPresets.map((preset) => {
            const Icon = preset.icon;
            const isActive = selectedPreset === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${preset.gradient} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium text-sm">{preset.name}</span>
                {isActive && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setShowAllPresets(!showAllPresets)}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {showAllPresets ? 'Show less' : `+${smartPresets.length - displayedPresets.length} more`}
          </button>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <Filter className="w-4 h-4" />
        <span>Custom Filters</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
      </button>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 rounded-xl space-y-5">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Star Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    const newStars = stars.includes(star)
                      ? stars.filter(s => s !== star)
                      : [...stars, star];
                    setStars(newStars);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
                    stars.includes(star)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${stars.includes(star) ? 'fill-blue-500 text-blue-500' : 'text-gray-400'}`} />
                  <span className="text-sm">{star}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guest Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Minimum Guest Rating: {minRating > 0 ? `${minRating}+` : 'Any'}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Any</span>
              <span>6+</span>
              <span>8+</span>
              <span>9+</span>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Price Range: ${priceRange.min} - ${priceRange.max}+
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="number"
                min="0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                className="w-24 px-3 py-2 border rounded-lg text-sm"
                placeholder="Min"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min="0"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 1000 })}
                className="w-24 px-3 py-2 border rounded-lg text-sm"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((amenity) => {
                const Icon = amenity.icon;
                const isSelected = selectedAmenities.includes(amenity.id);

                return (
                  <button
                    key={amenity.id}
                    onClick={() => {
                      setSelectedAmenities(
                        isSelected
                          ? selectedAmenities.filter(a => a !== amenity.id)
                          : [...selectedAmenities, amenity.id]
                      );
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {amenity.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refundable Only */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Free Cancellation Only</label>
            <button
              onClick={() => setRefundableOnly(!refundableOnly)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                refundableOnly ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                refundableOnly ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyCustomFilters}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Custom Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartFilters;
