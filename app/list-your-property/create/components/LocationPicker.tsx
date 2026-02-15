'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  initialLocation: {
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  onLocationSelect: (location: any) => void;
}

// Map Updater Component
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);
    return null;
}

// Click Handler
function LocationMarker({ position, setPosition, onDragEnd }: any) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onDragEnd(e.latlng);
        },
    });

    const markerRef = useRef<any>(null);

    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPos = marker.getLatLng();
                setPosition(newPos);
                onDragEnd(newPos);
            }
        },
    };

    return position === null ? null : (
        <Marker 
            position={position} 
            icon={icon} 
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
        />
    );
}


export function LocationPicker({ initialLocation, onLocationSelect }: LocationPickerProps) {
  const [query, setQuery] = useState(initialLocation.address || '');
  const [position, setPosition] = useState<L.LatLng | null>(
      initialLocation.latitude ? new L.LatLng(initialLocation.latitude, initialLocation.longitude) : null
  );
  // Default center if no location: London or User's location could be better
  const [activePosition, setActivePosition] = useState<[number, number]>(
      initialLocation.latitude ? [initialLocation.latitude, initialLocation.longitude] : [51.505, -0.09] 
  );
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // React to prop changes (e.g. from Import)
  useEffect(() => {
      if (initialLocation.address !== query) {
          setQuery(initialLocation.address || '');
      }
      
      if (initialLocation.latitude && initialLocation.longitude) {
          const newPos = new L.LatLng(initialLocation.latitude, initialLocation.longitude);
          setPosition(newPos);
          setActivePosition([initialLocation.latitude, initialLocation.longitude]);
      } else if (initialLocation.address && !initialLocation.latitude) {
          // Address updated but no coords - trigger search automatically
          // We use a timeout to avoid rapid firing if typing, though this is prop-driven
          const timer = setTimeout(() => {
              handleSearch(initialLocation.address);
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [initialLocation]);

  const handleSearch = async (searchQuery?: string) => {
    // Safety check: ensure we're not receiving an event object or non-string
    let term = (typeof searchQuery === 'string' ? searchQuery : query);
    
    if (!term || typeof term !== 'string') return;
    
    // Smart Heuristic: Detect Brazilian CEP (e.g., 72305-503)
    const cepRegex = /^\d{5}-\d{3}$/;
    if (cepRegex.test(term.trim())) {
        term = `${term}, Brazil`;
    }
    
    setIsSearching(true);
    try {
        // Add explicit address details (addressdetails=1) to get structured data
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&addressdetails=1&limit=5`;
        
        // If we have a country hint from the initial location (e.g. import), usage it to bias results
        // Note: Nominatim uses 2-letter country codes usually, effectively hard to map from full name without a map.
        // But we can just append the country name to the query if it's not already there.
        if (initialLocation.country && !term.toLowerCase().includes(initialLocation.country.toLowerCase())) {
             // Optional: careful not to over-constrain if user is searching for something else
        }

        const res = await fetch(url);
        const data = await res.json();
        setSearchResults(data);
        
        if (data && data.length > 0) {
            // Smart Selection: 
            // If multiple results, try to pick the one that matches our heuristics or just the first relevant one.
            // For now, let's pick the first one but ensure we map it correctly.
            const first = data[0];
            const lat = parseFloat(first.lat);
            const lon = parseFloat(first.lon);
            const newPos = new L.LatLng(lat, lon);
            
            setPosition(newPos);
            setActivePosition([lat, lon]);
            
            // Generate a better display name using address components if available
            // Safety check: ensure first.address is an object before accessing properties
            const addr = first.address || {};
            const displayName = first.address ? 
                `${addr.road || ''} ${addr.house_number || ''}, ${addr.city || addr.town || addr.village || ''}, ${addr.country || ''}`
                : first.display_name;

            // Update parent
            updateLocationDetails(lat, lon, first.display_name); // Use full display name for form
            setSearchResults([]); 
        } else {
             // Retry with less specific query? 
             // Or let user know.
        }
    } catch (error) {
        console.error("Geocoding error", error);
    } finally {
        setIsSearching(false);
    }
  };

  const updateLocationDetails = async (lat: number, lon: number, addressOverride?: string) => {
      // Reverse Geocode for precise details
      try {
          // If we have an address override (from search), use it partially but get components
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          
          const address = data.address || {};
          const city = address.city || address.town || address.village || address.county || '';
          const country = address.country || '';
          
          onLocationSelect({
              address: addressOverride || data.display_name,
              city,
              country,
              latitude: lat,
              longitude: lon
          });
      } catch (e) {
          // Fallback
           onLocationSelect({
              address: addressOverride || `${lat}, ${lon}`,
              city: '',
              country: '',
              latitude: lat,
              longitude: lon
          });
      }
  };

  const onMarkerDragEnd = (newPos: L.LatLng) => {
      updateLocationDetails(newPos.lat, newPos.lng);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative z-10">
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter an address, city, or zip code"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                />
            </div>
            <button 
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="bg-neutral-900 hover:bg-black text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50"
            >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
        </div>

        {/* Results Dropdown */}
        {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden z-50">
                {searchResults.slice(0, 5).map((result: any, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            const lat = parseFloat(result.lat);
                            const lon = parseFloat(result.lon);
                            setPosition(new L.LatLng(lat, lon));
                            setActivePosition([lat, lon]);
                            setQuery(result.display_name);
                            updateLocationDetails(lat, lon, result.display_name);
                            setSearchResults([]);
                        }}
                        className="w-full text-left p-3 hover:bg-neutral-50 flex items-start gap-3 border-b border-neutral-100 last:border-0"
                    >
                        <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{result.display_name}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[400px] rounded-2xl overflow-hidden border border-neutral-200 shadow-inner relative z-0 bg-neutral-100">
        {(typeof window !== 'undefined') && (
           <MapContainer
             center={activePosition}
             zoom={13}
             scrollWheelZoom={false}
             className="w-full h-full"
           >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={activePosition} />
            <LocationMarker 
                position={position} 
                setPosition={setPosition}
                onDragEnd={onMarkerDragEnd}    
            />
           </MapContainer>
        )}
      </div>
    </div>
  );
}
