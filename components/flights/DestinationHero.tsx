'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plane, Loader2, AlertCircle } from 'lucide-react';
import { layout } from '@/lib/design-system';

// ===========================
// TYPES & INTERFACES
// ===========================

interface DestinationHeroProps {
  /** Origin airport code (e.g., "JFK") */
  originCode: string;
  /** Destination airport code (e.g., "DXB") */
  destinationCode: string;
  /** Language preference */
  lang?: 'en' | 'pt' | 'es';
}

interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
  flag: string;
  emoji: string;
}

interface ResolvedDestination {
  city: string;
  country: string;
  airportCode: string;
  airportName: string;
  flag: string;
}

interface DestinationImage {
  url: string;
  alt: string;
  source: string;
}

// ===========================
// AIRPORT DATABASE (from EnhancedSearchBar)
// ===========================
const popularAirports: Airport[] = [
  // United States
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', flag: '🇺🇸', emoji: '🗽' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', flag: '🇺🇸', emoji: '🌴' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', flag: '🇺🇸', emoji: '🏖️' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', flag: '🇺🇸', emoji: '🌉' },
  { code: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'USA', flag: '🇺🇸', emoji: '🏙️' },
  { code: 'DEN', name: 'Denver Intl', city: 'Denver', country: 'USA', flag: '🇺🇸', emoji: '🏔️' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'USA', flag: '🇺🇸', emoji: '🍑' },
  { code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle', country: 'USA', flag: '🇺🇸', emoji: '☕' },
  { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'USA', flag: '🇺🇸', emoji: '🤠' },
  { code: 'HNL', name: 'Daniel K. Inouye Intl', city: 'Honolulu', country: 'USA', flag: '🇺🇸', emoji: '🌺' },
  { code: 'OGG', name: 'Kahului Airport', city: 'Maui', country: 'USA', flag: '🇺🇸', emoji: '🏝️' },
  
  // Canada
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'Canada', flag: '🇨🇦', emoji: '🍁' },
  { code: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'Canada', flag: '🇨🇦', emoji: '🏔️' },
  { code: 'YUL', name: 'Montreal-Pierre Elliott Trudeau International', city: 'Montreal', country: 'Canada', flag: '🇨🇦', emoji: '🌷' },
  { code: 'YEG', name: 'Edmonton International', city: 'Calgary', country: 'Canada', flag: '🇨🇦', emoji: '🐴' },
  
  // Europe
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', flag: '🇬🇧', emoji: '🇬🇧' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', flag: '🇫🇷', emoji: '🗼' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪', emoji: '🇩🇪' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', emoji: '🌷' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', flag: '🇪🇸', emoji: '🇪🇸' },
  { code: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', emoji: '🏖️' },
  { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'Italy', flag: '🇮🇹', emoji: '🏛️' },
  { code: 'MXP', name: 'Malpensa', city: 'Milan', country: 'Italy', flag: '🇮🇹', emoji: '🎭' },
  { code: 'VCE', name: 'Marco Polo', city: 'Venice', country: 'Italy', flag: '🇮🇹', emoji: '🚣' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', flag: '🇨🇭', emoji: '🏔️' },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', flag: '🇦🇹', emoji: '🎻' },
  { code: 'BRU', name: 'Brussels', city: 'Brussels', country: 'Belgium', flag: '🇧🇪', emoji: '🇧🇪' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', flag: '🇩🇰', emoji: '🇩🇰' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway', flag: '🇳🇴', emoji: '🇳🇴' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden', flag: '🇸🇪', emoji: '🇸🇪' },
  { code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland', flag: '🇫🇮', emoji: '🇫🇮' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', flag: '🇮🇪', emoji: '☘️' },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', emoji: '🇵🇹' },
  { code: 'ATH', name: 'Athens International', city: 'Athens', country: 'Greece', flag: '🇬🇷', emoji: '🏛️' },
  { code: 'PRG', name: 'Václav Havel Prague', city: 'Prague', country: 'Czech Republic', flag: '🇨🇿', emoji: '🏰' },
  
  // Asia-Pacific
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', flag: '🇦🇪', emoji: '🏙️' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', flag: '🇭🇰', emoji: '🏙️' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', flag: '🇸🇬', emoji: '🇸🇬' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', emoji: '🗾' },
  { code: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', emoji: '🗼' },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', flag: '🇰🇷', emoji: '🇰🇷' },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', flag: '🇨🇳', emoji: '🇨🇳' },
  { code: 'PVG', name: 'Shanghai Pudong International', city: 'Shanghai', country: 'China', flag: '🇨🇳', emoji: '🏙️' },
  { code: 'BKK', name: 'Suvarnabhumi', city: 'Bangkok', country: 'Thailand', flag: '🇹🇭', emoji: '🛕' },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', flag: '🇮🇳', emoji: '🇮🇳' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', flag: '🇮🇳', emoji: '🇮🇳' },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', flag: '🇲🇾', emoji: '🇲🇾' },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia', flag: '🇮🇩', emoji: '🇮🇩' },
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines', flag: '🇵🇭', emoji: '🇵🇭' },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', flag: '🇦🇺', emoji: '🦘' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', flag: '🇦🇺', emoji: '🏙️' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', flag: '🇦🇺', emoji: '🏙️' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', flag: '🇦🇺', emoji: '🏙️' },
  { code: 'AKL', name: 'Auckland', city: 'Auckland', country: 'New Zealand', flag: '🇳🇿', emoji: '🇳🇿' },
  
  // Latin America
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', flag: '🇲🇽', emoji: '🌮' },
  { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico', flag: '🇲🇽', emoji: '🏝️' },
  { code: 'GDL', name: 'Miguel Hidalgo y Costilla Guadalajara International', city: 'Guadalajara', country: 'Mexico', flag: '🇲🇽', emoji: '🎺' },
  { code: 'MTY', name: 'Monterrey International', city: 'Monterrey', country: 'Mexico', flag: '🇲🇽', emoji: '🏭️' },
  { code: 'SJD', name: 'Los Cabos International', city: 'Los Cabos', country: 'Mexico', flag: '🇲🇽', emoji: '🌅' },
  { code: 'PTY', name: 'Tocumen International', city: 'Panama City', country: 'Panama', flag: '🇵🇦', emoji: '🚢' },
  { code: 'SJO', name: 'Juan Santamaría International', city: 'San José', country: 'Costa Rica', flag: '🇨🇷', emoji: '🌋' },
  
  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos International', city: 'São Paulo', country: 'Brazil', flag: '🇧🇷', emoji: '🇧🇷' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International', city: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', emoji: '🏖️' },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', emoji: '🥩' },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', flag: '🇨🇴', emoji: '☕' },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', flag: '🇵🇪', emoji: '🦙' },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile', flag: '🇨🇱', emoji: '🏔️' },
  
  // Caribbean
  { code: 'PUJ', name: 'Punta Cana International', city: 'Punta Cana', country: 'Dominican Republic', flag: '🇩🇴', emoji: '🏝️' },
  { code: 'SJU', name: 'Luis Muñoz Marín International', city: 'San Juan', country: 'Puerto Rico', flag: '🇵🇷', emoji: '🏝️' },
  { code: 'NAS', name: 'Lynden Pindling International', city: 'Nassau', country: 'Bahamas', flag: '🇧🇸', emoji: '🐠' },
  { code: 'MBJ', name: 'Sangster International', city: 'Montego Bay', country: 'Jamaica', flag: '🇯🇲', emoji: '🎵' },
  
  // Middle East
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', flag: '🇶🇦', emoji: '🇶🇦' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', flag: '🇦🇪', emoji: '🇦🇪' },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', flag: '🇪🇬', emoji: '🇪🇬' },
  { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', flag: '🇿🇦', emoji: '🇿🇦' },
  { code: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa', flag: '🇿🇦', emoji: '🇿🇦' },
  
  // Special destinations
  { code: 'MLE', name: 'Velana Intl', city: 'Malé', country: 'Maldives', flag: '🇲🇻', emoji: '🏝️' },
];

// ===========================
// HELPER FUNCTIONS
// ===========================

function lookupAirportByCode(code: string): Airport | null {
  if (!code) return null;
  const upperCode = code.toUpperCase().trim();
  return popularAirports.find(airport => airport.code === upperCode) || null;
}

function resolveDestination(airportCode: string): ResolvedDestination {
  // Handle comma-separated codes (e.g., "DXB,DWC") → take primary (first) code
  const primaryCode = airportCode.includes(',')
    ? airportCode.split(',')[0].trim()
    : airportCode;

  if (!primaryCode || primaryCode.length < 3 || primaryCode.length > 4) {
    throw new Error(`Invalid airport code format: ${primaryCode}`);
  }

  const airport = lookupAirportByCode(primaryCode);
  if (!airport) {
    throw new Error(`Airport not found in database: ${primaryCode}`);
  }

  if (!airport.city || airport.city.trim().length === 0) {
    throw new Error(`City not found for airport: ${primaryCode}`);
  }

  if (!airport.country || airport.country.trim().length === 0) {
    throw new Error(`Country not found for airport: ${primaryCode}`);
  }

  return {
    city: airport.city,
    country: airport.country,
    airportCode: airport.code,
    airportName: airport.name,
    flag: airport.flag
  };
}

function generateImageCacheKey(city: string, country: string): string {
  return `dest-image:${city.toLowerCase()}:${country.toLowerCase()}`;
}

async function fetchDestinationImage(city: string, country: string): Promise<DestinationImage> {
  const cacheKey = generateImageCacheKey(city, country);
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      const cachedData = JSON.parse(cached) as { url: string; expiresAt: number };
      if (Date.now() < cachedData.expiresAt) {
        return {
          url: cachedData.url,
          alt: `${city}, ${country}`,
          source: 'cache'
        };
      } else {
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      console.warn('Failed to parse cached image data:', e);
      localStorage.removeItem(cacheKey);
    }
  }

  console.log(`🔍 Fetching Unsplash image for ${city}, ${country}`);
  const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || 'demo';

  const queries = [
    `${city}, ${country} skyline`,
    `${city} travel`,
    `${country} travel`
  ];

  try {
    for (const query of queries) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high&w=1920&h=1080&auto=format`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const photo = data.results[0];
          const imageUrl = `${photo.urls.regular}?q=80&auto=format`;

          const cacheData = {
            url: imageUrl,
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
          };
          localStorage.setItem(cacheKey, JSON.stringify(cacheData));

          return {
            url: imageUrl,
            alt: `${city}, ${country}`,
            source: 'unsplash'
          };
        }
      }
    }

    console.warn(`⚠️ All Unsplash queries failed for ${city}, ${country}, using fallback`);
    const fallbackImages = [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80&auto=format',
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80&auto=format',
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=80&auto=format',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80&auto=format',
    ];
    const fallbackIndex = Math.abs(city.length) % fallbackImages.length;

    return {
      url: fallbackImages[fallbackIndex],
      alt: `${city}, ${country}`,
      source: 'fallback'
    };

  } catch (error) {
    console.error(`❌ Unsplash API error for ${city}, ${country}:`, error);
    return {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80&auto=format',
      alt: `${city}, ${country}`,
      source: 'error-fallback'
    };
  }
}

// ===========================
// MAIN COMPONENT
// ===========================

export function DestinationHero({
  originCode,
  destinationCode,
  lang = 'en'
}: DestinationHeroProps) {
  const [resolvedDest, setResolvedDest] = useState<ResolvedDestination | null>(null);
  const [image, setImage] = useState<DestinationImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const dest = resolveDestination(destinationCode);
        setResolvedDest(dest);

        const fetchedImage = await fetchDestinationImage(dest.city, dest.country);
        setImage(fetchedImage);

      } catch (err) {
        console.error('Failed to load destination data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [destinationCode, originCode]);

  if (loading) {
    return (
      <section
        className="relative overflow-hidden w-full"
        style={{
          height: '20vh',
          minHeight: '150px',
          maxHeight: '200px'
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return null; // Silent fail - don't block results
  }

  return (
    <section
      className="relative overflow-hidden w-full"
      style={{
        height: '20vh',
        minHeight: '150px',
        maxHeight: '200px'
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${image?.url || ''})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end p-3 md:p-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-3">
              {/* Destination Name */}
              <h1 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
                {resolvedDest?.city}, {resolvedDest?.country}
              </h1>

              {/* Airport Code Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Plane className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-medium text-xs">
                  {resolvedDest?.airportCode}
                </span>
              </div>
            </div>

            {/* Flag */}
            <div className="text-2xl md:text-4xl">
              {resolvedDest?.flag}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===========================
// EXPORTED UTILITIES
// ===========================

export {
  resolveDestination,
  fetchDestinationImage,
  generateImageCacheKey
};
