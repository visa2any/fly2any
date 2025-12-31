"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Plane, Search, X } from "lucide-react";

// Popular destinations with airports
const DESTINATIONS = [
  { city: "New York", country: "USA", code: "NYC", airports: ["JFK", "LGA", "EWR"] },
  { city: "Los Angeles", country: "USA", code: "LAX", airports: ["LAX"] },
  { city: "Miami", country: "USA", code: "MIA", airports: ["MIA", "FLL"] },
  { city: "Las Vegas", country: "USA", code: "LAS", airports: ["LAS"] },
  { city: "San Francisco", country: "USA", code: "SFO", airports: ["SFO", "OAK", "SJC"] },
  { city: "Chicago", country: "USA", code: "CHI", airports: ["ORD", "MDW"] },
  { city: "Orlando", country: "USA", code: "MCO", airports: ["MCO"] },
  { city: "Honolulu", country: "USA", code: "HNL", airports: ["HNL"] },
  { city: "London", country: "UK", code: "LON", airports: ["LHR", "LGW", "STN"] },
  { city: "Paris", country: "France", code: "PAR", airports: ["CDG", "ORY"] },
  { city: "Rome", country: "Italy", code: "ROM", airports: ["FCO", "CIA"] },
  { city: "Barcelona", country: "Spain", code: "BCN", airports: ["BCN"] },
  { city: "Madrid", country: "Spain", code: "MAD", airports: ["MAD"] },
  { city: "Amsterdam", country: "Netherlands", code: "AMS", airports: ["AMS"] },
  { city: "Dubai", country: "UAE", code: "DXB", airports: ["DXB", "DWC"] },
  { city: "Tokyo", country: "Japan", code: "TYO", airports: ["NRT", "HND"] },
  { city: "Singapore", country: "Singapore", code: "SIN", airports: ["SIN"] },
  { city: "Hong Kong", country: "China", code: "HKG", airports: ["HKG"] },
  { city: "Sydney", country: "Australia", code: "SYD", airports: ["SYD"] },
  { city: "Cancun", country: "Mexico", code: "CUN", airports: ["CUN"] },
  { city: "Mexico City", country: "Mexico", code: "MEX", airports: ["MEX"] },
  { city: "Punta Cana", country: "Dominican Republic", code: "PUJ", airports: ["PUJ"] },
  { city: "San Juan", country: "Puerto Rico", code: "SJU", airports: ["SJU"] },
  { city: "Toronto", country: "Canada", code: "YYZ", airports: ["YYZ", "YTZ"] },
  { city: "Vancouver", country: "Canada", code: "YVR", airports: ["YVR"] },
  { city: "Bali", country: "Indonesia", code: "DPS", airports: ["DPS"] },
  { city: "Maldives", country: "Maldives", code: "MLE", airports: ["MLE"] },
  { city: "Santorini", country: "Greece", code: "JTR", airports: ["JTR"] },
  { city: "Lisbon", country: "Portugal", code: "LIS", airports: ["LIS"] },
  { city: "Bangkok", country: "Thailand", code: "BKK", airports: ["BKK", "DMK"] },
  { city: "Phuket", country: "Thailand", code: "HKT", airports: ["HKT"] },
  { city: "Rio de Janeiro", country: "Brazil", code: "GIG", airports: ["GIG"] },
  { city: "Buenos Aires", country: "Argentina", code: "EZE", airports: ["EZE", "AEP"] },
  { city: "Cape Town", country: "South Africa", code: "CPT", airports: ["CPT"] },
  { city: "Cairo", country: "Egypt", code: "CAI", airports: ["CAI"] },
  { city: "Marrakech", country: "Morocco", code: "RAK", airports: ["RAK"] },
  { city: "Istanbul", country: "Turkey", code: "IST", airports: ["IST", "SAW"] },
  { city: "Athens", country: "Greece", code: "ATH", airports: ["ATH"] },
  { city: "Dublin", country: "Ireland", code: "DUB", airports: ["DUB"] },
  { city: "Reykjavik", country: "Iceland", code: "KEF", airports: ["KEF"] },
];

interface DestinationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function DestinationAutocomplete({
  value,
  onChange,
  placeholder = "Search destination...",
  label = "Destination",
}: DestinationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [filtered, setFiltered] = useState(DESTINATIONS);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearch(query);
    const q = query.toLowerCase();
    if (!q) {
      setFiltered(DESTINATIONS);
    } else {
      setFiltered(
        DESTINATIONS.filter(
          (d) =>
            d.city.toLowerCase().includes(q) ||
            d.country.toLowerCase().includes(q) ||
            d.code.toLowerCase().includes(q) ||
            d.airports.some((a) => a.toLowerCase().includes(q))
        )
      );
    }
    setIsOpen(true);
  };

  const handleSelect = (dest: typeof DESTINATIONS[0]) => {
    const formatted = `${dest.city}, ${dest.country}`;
    setSearch(formatted);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearch("");
    onChange("");
    setFiltered(DESTINATIONS);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-gray-900"
        />
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {/* Popular Label */}
          {!search && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Popular Destinations</p>
            </div>
          )}

          {filtered.slice(0, 10).map((dest, idx) => (
            <button
              key={dest.code}
              onClick={() => handleSelect(dest)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plane className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{dest.city}</p>
                <p className="text-sm text-gray-500">{dest.country}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  {dest.code}
                </span>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No destinations found</p>
              <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
