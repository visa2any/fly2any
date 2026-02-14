'use client';

import { useState } from 'react';
import { PROPERTY_AMENITY_CATEGORIES } from '@/lib/properties/types';
import { Check, Search, icons } from 'lucide-react';
// Note: We use lucide-react icons, but mapping strings to components requires a helper or just generic icons.
// For now we will use a generic check and simple styling, but in a real app we'd map 'wifi' -> WifiIcon.

interface AmenitySelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
}

export function AmenitySelector({ selectedAmenities, onChange }: AmenitySelectorProps) {
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
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
         <input 
           type="text" 
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder="Search amenities (e.g. Wifi, Pool...)"
           className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none transition-colors"
         />
      </div>

      {!search && (
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10">
          {(Object.entries(PROPERTY_AMENITY_CATEGORIES) as [keyof typeof PROPERTY_AMENITY_CATEGORIES, any][]).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                activeCategory === key 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="space-y-8">
         {(filteredCategories || [[activeCategory, PROPERTY_AMENITY_CATEGORIES[activeCategory]]]).map(([key, category]: [string, any]) => (
            <div key={key}>
               {search && <h3 className="text-white font-bold mb-3">{category.label}</h3>}
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.options.map((amenity: string) => {
                     const isSelected = selectedAmenities.includes(amenity);
                     return (
                        <button
                           key={amenity}
                           onClick={() => toggleAmenity(amenity)}
                           className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${
                              isSelected 
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                           }`}
                        >
                           <span className="capitalize font-medium">{amenity.replace(/_/g, ' ')}</span>
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 group-hover:border-white/60'
                           }`}>
                              {isSelected && <Check className="w-3 h-3 text-black" />}
                           </div>
                        </button>
                     );
                  })}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
