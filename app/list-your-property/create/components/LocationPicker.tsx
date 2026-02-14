'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  onChange: (data: { latitude: number; longitude: number; address: string; city: string; country: string; state?: string; postalCode?: string }) => void;
}

function LocationMarker({ position, onDragEnd }: { position: [number, number], onDragEnd: (e: any) => void }) {
  const markerRef = useRef<any>(null);
  
  const map = useMapEvents({
    click(e) {
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (markerRef.current) {
        // Update marker position manually if needed when props change
    }
  }, [position]);

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: onDragEnd,
      }}
      ref={markerRef}
    />
  );
}

export function LocationPicker({ latitude, longitude, address, city, country, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activePosition, setActivePosition] = useState<[number, number]>([latitude || 51.505, longitude || -0.09]);

  // Sync internal state with props
  useEffect(() => {
    if (latitude && longitude) {
      setActivePosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error('Search failed', e);
    }
    setIsSearching(false);
  };

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setActivePosition([lat, lon]);
    setSearchResults([]);
    
    // Parse address components roughly (Nominatim structure varies)
    // For a real app, we might want a better parser or Google Places API
    const displayName = result.display_name;
    const parts = displayName.split(',').map((s: string) => s.trim());
    
    onChange({
      latitude: lat,
      longitude: lon,
      address: parts[0],
      city: parts.length > 2 ? parts[parts.length - 3] : parts[0], // Heuristic
      country: parts[parts.length - 1],
    });
  };

  const onMarkerDragEnd = async (e: any) => {
    const marker = e.target;
    const position = marker.getLatLng();
    const { lat, lng } = position;
    setActivePosition([lat, lng]);

    // Reverse geocode
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.address || {};
      
      onChange({
        latitude: lat,
        longitude: lng,
        address: addr.road ? `${addr.house_number || ''} ${addr.road}`.trim() : data.display_name.split(',')[0],
        city: addr.city || addr.town || addr.village || addr.county || '',
        country: addr.country || '',
        state: addr.state,
        postalCode: addr.postcode,
      });
    } catch (error) {
       console.error("Reverse geocode failed", error);
       // Still update coords
       onChange({
           latitude: lat,
           longitude: lng,
           address: address, // keep existing as fallback
           city: city,
           country: country
       });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative z-[1001]"> {/* High Z-index to sit above map controls */}
        <div className="flex gap-2">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
             <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for address, city, or landmark..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-amber-400/50 outline-none transition-colors"
             />
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-amber-400 text-black font-bold hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </div>

        {/* Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectResult(result)}
                className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-white text-sm line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10 relative z-0">
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
             <LocationMarker position={activePosition} onDragEnd={onMarkerDragEnd} />
           </MapContainer>
        )}
      </div>
      
      <div className="flex gap-4 text-sm text-white/50 bg-white/5 p-4 rounded-xl border border-white/10">
         <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Lat: {activePosition[0].toFixed(5)}</span>
         </div>
         <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Lng: {activePosition[1].toFixed(5)}</span>
         </div>
         <div className="ml-auto italic">Drag the marker to pinpoint exact location</div>
      </div>
    </div>
  );
}
