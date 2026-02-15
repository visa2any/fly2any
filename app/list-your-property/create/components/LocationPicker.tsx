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

  // Helper: Fetch info from ViaCEP (Brazil)
  const fetchViaCep = async (cep: string) => {
      try {
          const cleanCep = cep.replace(/\D/g, '');
          if (cleanCep.length !== 8) return null;
          
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await res.json();
          if (data.erro) return null;
          
          return data; // { logradouro, bairro, localidade, uf, ... }
      } catch (e) {
          console.error("ViaCEP error:", e);
          return null;
      }
  };

  const handleSearch = async (searchQuery?: string) => {
    // Safety check: ensure we're not receiving an event object or non-string
    let term = (typeof searchQuery === 'string' ? searchQuery : query);
    
    if (!term || typeof term !== 'string') return;
    
    setIsSearching(true);
    setSearchResults([]);

    try {
        let searchResults: any[] = [];
        
        // Strategy 1: Brazilian CEP Detection (xxxxx-xxx or 8 digits)
        const cepRegex = /^\d{5}-?\d{3}$/;
        const isCep = cepRegex.test(term.trim());
        
        if (isCep) {
            const viaCepData = await fetchViaCep(term);
            if (viaCepData) {
                // Verified Brazilian Address -> Try multiple levels of precision
                
                // Attempt 1: Full Address (Street + Neighborhood + City)
                let preciseQuery = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade} - ${viaCepData.uf}, Brazil`;
                let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(preciseQuery)}&addressdetails=1&limit=5`;
                let res = await fetch(url);
                searchResults = await res.json();
                
                // Attempt 2: Neighborhood + City (if Full Address fails)
                if (searchResults.length === 0 && viaCepData.bairro) {
                    preciseQuery = `${viaCepData.bairro}, ${viaCepData.localidade} - ${viaCepData.uf}, Brazil`;
                    url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(preciseQuery)}&addressdetails=1&limit=5`;
                    res = await fetch(url);
                    searchResults = await res.json();
                }

                // Attempt 3: Street + City (if Neighborhood is missing/wrong in OSM)
                if (searchResults.length === 0 && viaCepData.logradouro) {
                    preciseQuery = `${viaCepData.logradouro}, ${viaCepData.localidade} - ${viaCepData.uf}, Brazil`;
                    url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(preciseQuery)}&addressdetails=1&limit=5`;
                    res = await fetch(url);
                    searchResults = await res.json();
                }

                // Attempt 4: City Only (Fallback)
                if (searchResults.length === 0) {
                     preciseQuery = `${viaCepData.localidade} - ${viaCepData.uf}, Brazil`;
                     url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(preciseQuery)}&addressdetails=1&limit=5`;
                     res = await fetch(url);
                     searchResults = await res.json();
                }
            }
        }

        // Strategy 2: Standard Nominatim Search (Global)
        if (searchResults.length === 0) {
            // Priority: Try strict search first
             let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&addressdetails=1&limit=5`;
             
             // Context Awareness: If we have a country context and the term looks simple, maybe bias?
             // Actually, for "06106 hartford ct", we don't want to bias to Brazil. 
             // Global search is best left unbiased unless user explicitly selected a country filter (which we don't have here yet).
             
             const res = await fetch(url);
             searchResults = await res.json();
        }

        // Strategy 3: Fallback - Relaxed Search (if no results)
        if (searchResults.length === 0) {
             // Try removing special chars or country codes if likely to interfere?
             // Or try structured search if it looks like a zip
             if (/^\d+$/.test(term.trim())) {
                 // Pure numbers -> try as postalcode
                 const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(term)}&addressdetails=1&limit=5`;
                 const res = await fetch(url);
                 searchResults = await res.json();
             }
        }

        setSearchResults(searchResults);
        
        if (searchResults && searchResults.length > 0) {
            // Automatically select first result if it's high confidence? 
            // For now, let user pick from dropdown to be safe, unless it's a perfect match (like the ViaCEP case).
            // But to keep UI consistent, show dropdown.
            
            // However, if it was a ViaCEP match, it is almost certainly correct.
            // Let's just show results. User will click.
            
            // Auto-center map on first result for better UX
            const first = searchResults[0];
            const lat = parseFloat(first.lat);
            const lon = parseFloat(first.lon);
            setActivePosition([lat, lon]); 
        } else {
             // No results found
             // toast.error("Address not found. Try entering city and country.");
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
