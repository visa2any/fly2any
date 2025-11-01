'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface CarFiltersType {
  priceRange: [number, number];
  categories: string[];
  transmission: string[];
  fuelType: string[];
  passengers: number[];
  features: string[];
  companies: string[];
}

interface CarFiltersProps {
  filters: CarFiltersType;
  onFiltersChange: (filters: CarFiltersType) => void;
  cars: any[];
  lang?: 'en' | 'pt' | 'es';
}

// ===========================
// CAR FILTERS COMPONENT
// ===========================

export default function CarFilters({ filters, onFiltersChange, cars, lang = 'en' }: CarFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    transmission: true,
    fuel: true,
    passengers: true,
    features: true,
    company: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: keyof CarFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof CarFiltersType, value: string | number) => {
    const currentArray = filters[key] as any[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  // Calculate available options from cars data
  const categories = [...new Set(cars.map(c => c.category))].sort();
  const transmissions = [...new Set(cars.map(c => c.transmission))].sort();
  const fuelTypes = [...new Set(cars.map(c => c.fuelType))].sort();
  const passengerOptions = [...new Set(cars.map(c => c.passengers))].sort((a, b) => a - b);
  const allFeatures = [...new Set(cars.flatMap(c => c.features || []))].sort();
  const companies = [...new Set(cars.map(c => c.company))].sort();

  const FilterSection = ({ title, isExpanded, onToggle, children }: any) => (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-3.5 hover:bg-slate-50/50 transition-colors"
      >
        <span className="font-bold text-slate-900 text-sm">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-600" />
        )}
      </button>
      {isExpanded && (
        <div className="px-3.5 pb-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3.5 rounded-t-2xl">
        <h2 className="font-bold text-sm">Filters</h2>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-b-2xl overflow-hidden">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}/day</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Min"
              />
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 500])}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Max"
              />
            </div>
          </div>
        </FilterSection>

        {/* Vehicle Category */}
        <FilterSection
          title="Vehicle Type"
          isExpanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleArrayFilter('categories', category)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{category}</span>
                <span className="ml-auto text-xs text-slate-500">
                  ({cars.filter(c => c.category === category).length})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Transmission */}
        <FilterSection
          title="Transmission"
          isExpanded={expandedSections.transmission}
          onToggle={() => toggleSection('transmission')}
        >
          <div className="space-y-2">
            {transmissions.map((transmission) => (
              <label key={transmission} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.transmission.includes(transmission)}
                  onChange={() => toggleArrayFilter('transmission', transmission)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{transmission}</span>
                <span className="ml-auto text-xs text-slate-500">
                  ({cars.filter(c => c.transmission === transmission).length})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Fuel Type */}
        <FilterSection
          title="Fuel Type"
          isExpanded={expandedSections.fuel}
          onToggle={() => toggleSection('fuel')}
        >
          <div className="space-y-2">
            {fuelTypes.map((fuel) => (
              <label key={fuel} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.fuelType.includes(fuel)}
                  onChange={() => toggleArrayFilter('fuelType', fuel)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{fuel}</span>
                <span className="ml-auto text-xs text-slate-500">
                  ({cars.filter(c => c.fuelType === fuel).length})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Passengers */}
        <FilterSection
          title="Passengers"
          isExpanded={expandedSections.passengers}
          onToggle={() => toggleSection('passengers')}
        >
          <div className="space-y-2">
            {passengerOptions.map((count) => (
              <label key={count} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.passengers.includes(count)}
                  onChange={() => toggleArrayFilter('passengers', count)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{count}+ seats</span>
                <span className="ml-auto text-xs text-slate-500">
                  ({cars.filter(c => c.passengers >= count).length})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Features */}
        <FilterSection
          title="Features"
          isExpanded={expandedSections.features}
          onToggle={() => toggleSection('features')}
        >
          <div className="space-y-2">
            {allFeatures.slice(0, 8).map((feature) => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.features.includes(feature)}
                  onChange={() => toggleArrayFilter('features', feature)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{feature}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Rental Companies */}
        <FilterSection
          title="Rental Companies"
          isExpanded={expandedSections.company}
          onToggle={() => toggleSection('company')}
        >
          <div className="space-y-2">
            {companies.map((company) => (
              <label key={company} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.companies.includes(company)}
                  onChange={() => toggleArrayFilter('companies', company)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">{company}</span>
                <span className="ml-auto text-xs text-slate-500">
                  ({cars.filter(c => c.company === company).length})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
