'use client';

import { useState } from 'react';
import { PROPERTY_AMENITY_CATEGORIES } from '@/lib/properties/types';
import { Check, Search, Plus } from 'lucide-react';

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

export function AmenitySelector({ selectedAmenities = [], onChange }: AmenitySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof PROPERTY_AMENITY_CATEGORIES>('essentials');
  const [search, setSearch] = useState('');

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onChange(selectedAmenities.filter(a => a !== amenity));
    } else {
      onChange([...selectedAmenities, amenity]);
    }
  };

  // Filter amenities if search is active
  const filteredCategories = search 
    ? Object.entries(PROPERTY_AMENITY_CATEGORIES).map(([key, cat]) => ({
        key,
        ...cat,
        options: cat.options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
      })).filter(cat => cat.options.length > 0)
    : null;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
         <input 
           type="text" 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder="Search amenities (e.g. Wifi, Pool...)"
           className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-neutral-200 text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm placeholder-gray-400"
         />
      </div>

      {!search && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-200">
          {Object.entries(PROPERTY_AMENITY_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as any)}
              className={`
                px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                ${activeCategory === key 
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' 
                  : 'bg-white text-gray-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {(filteredCategories || [PROPERTY_AMENITY_CATEGORIES[activeCategory]]).map((cat: any) => (
             cat.options.map((amenity: string) => {
                 const isSelected = selectedAmenities?.includes(amenity);
                 return (
                    <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`
                            flex items-center justify-between p-4 rounded-xl border transition-all text-left group
                            ${isSelected 
                                ? 'border-primary-600 bg-primary-50 shadow-sm' 
                                : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md'}
                        `}
                    >
                        <span className={`font-medium ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                            {amenity}
                        </span>
                        <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center transition-all
                            ${isSelected 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-neutral-100 text-neutral-300 group-hover:bg-primary-100 group-hover:text-primary-400'}
                        `}>
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                        </div>
                    </button>
                 );
             })
        ))}
      </div>
      
      {filteredCategories && filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
              <p>No amenities found matching "{search}"</p>
          </div>
      )}
    </div>
  );
}
