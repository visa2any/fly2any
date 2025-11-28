import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Comprehensive city database for hotel suggestions
// Includes coordinates for LiteAPI location-based searches
interface CitySuggestion {
  id: string;
  name: string;
  city: string;
  country: string;
  location: { lat: number; lng: number };
  type: 'city' | 'landmark' | 'airport' | 'neighborhood' | 'poi';
  aliases?: string[];
  placeId?: string; // LiteAPI place ID for direct hotel lookup
  emoji?: string; // Visual icon for enhanced display
}

/**
 * Normalize string for accent-insensitive matching
 * Converts "São Paulo" → "sao paulo" and "Bogotá" → "bogota"
 * Uses NFD (Canonical Decomposition) to separate base characters from diacritical marks
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters (é → e + ´)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .trim();
}

const CITY_DATABASE: CitySuggestion[] = [
  // United States - Major Cities
  { id: 'nyc', name: 'New York City', city: 'New York', country: 'United States', location: { lat: 40.7128, lng: -74.0060 }, type: 'city', aliases: ['nyc', 'new york', 'manhattan', 'big apple'], emoji: '🗽' },
  { id: 'nyc-times-square', name: 'Times Square', city: 'New York', country: 'United States', location: { lat: 40.7580, lng: -73.9855 }, type: 'landmark', aliases: ['times square'], emoji: '🏙️' },
  { id: 'nyc-manhattan', name: 'Manhattan', city: 'New York', country: 'United States', location: { lat: 40.7831, lng: -73.9712 }, type: 'neighborhood', emoji: '🌆' },
  { id: 'nyc-brooklyn', name: 'Brooklyn', city: 'New York', country: 'United States', location: { lat: 40.6782, lng: -73.9442 }, type: 'neighborhood', emoji: '🌉' },
  { id: 'jfk', name: 'JFK Airport', city: 'New York', country: 'United States', location: { lat: 40.6413, lng: -73.7781 }, type: 'airport', aliases: ['jfk', 'john f kennedy'], emoji: '✈️' },

  { id: 'lax', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', location: { lat: 34.0522, lng: -118.2437 }, type: 'city', aliases: ['la', 'los angeles', 'hollywood'], emoji: '🌴' },
  { id: 'lax-hollywood', name: 'Hollywood', city: 'Los Angeles', country: 'United States', location: { lat: 34.0928, lng: -118.3287 }, type: 'neighborhood', emoji: '🎬' },
  { id: 'lax-santa-monica', name: 'Santa Monica', city: 'Los Angeles', country: 'United States', location: { lat: 34.0195, lng: -118.4912 }, type: 'neighborhood', emoji: '🏖️' },
  { id: 'lax-beverly-hills', name: 'Beverly Hills', city: 'Los Angeles', country: 'United States', location: { lat: 34.0736, lng: -118.4004 }, type: 'neighborhood', emoji: '💎' },

  { id: 'mia', name: 'Miami', city: 'Miami', country: 'United States', location: { lat: 25.7617, lng: -80.1918 }, type: 'city', aliases: ['miami', 'south florida'], emoji: '🏝️' },
  { id: 'mia-south-beach', name: 'South Beach', city: 'Miami', country: 'United States', location: { lat: 25.7907, lng: -80.1300 }, type: 'neighborhood', aliases: ['south beach', 'sobe'], emoji: '🏖️' },
  { id: 'mia-brickell', name: 'Brickell', city: 'Miami', country: 'United States', location: { lat: 25.7617, lng: -80.1918 }, type: 'neighborhood', emoji: '🏙️' },

  { id: 'chi', name: 'Chicago', city: 'Chicago', country: 'United States', location: { lat: 41.8781, lng: -87.6298 }, type: 'city', aliases: ['chicago', 'windy city'], emoji: '🌆' },
  { id: 'chi-downtown', name: 'Downtown Chicago', city: 'Chicago', country: 'United States', location: { lat: 41.8819, lng: -87.6278 }, type: 'neighborhood', emoji: '🏙️' },

  { id: 'sfo', name: 'San Francisco', city: 'San Francisco', country: 'United States', location: { lat: 37.7749, lng: -122.4194 }, type: 'city', aliases: ['sf', 'san francisco', 'frisco'], emoji: '🌉' },
  { id: 'sfo-downtown', name: 'Downtown San Francisco', city: 'San Francisco', country: 'United States', location: { lat: 37.7879, lng: -122.4074 }, type: 'neighborhood', emoji: '🏙️' },

  { id: 'las', name: 'Las Vegas', city: 'Las Vegas', country: 'United States', location: { lat: 36.1699, lng: -115.1398 }, type: 'city', aliases: ['vegas', 'las vegas', 'sin city'], emoji: '🎰' },
  { id: 'las-strip', name: 'Las Vegas Strip', city: 'Las Vegas', country: 'United States', location: { lat: 36.1147, lng: -115.1728 }, type: 'landmark', aliases: ['the strip'], emoji: '🎰' },

  { id: 'sea', name: 'Seattle', city: 'Seattle', country: 'United States', location: { lat: 47.6062, lng: -122.3321 }, type: 'city', aliases: ['seattle'], emoji: '☕' },
  { id: 'bos', name: 'Boston', city: 'Boston', country: 'United States', location: { lat: 42.3601, lng: -71.0589 }, type: 'city', aliases: ['boston'], emoji: '⚾' },
  { id: 'den', name: 'Denver', city: 'Denver', country: 'United States', location: { lat: 39.7392, lng: -104.9903 }, type: 'city', aliases: ['denver'], emoji: '🏔️' },
  { id: 'atl', name: 'Atlanta', city: 'Atlanta', country: 'United States', location: { lat: 33.7490, lng: -84.3880 }, type: 'city', aliases: ['atlanta'], emoji: '🌳' },
  { id: 'orl', name: 'Orlando', city: 'Orlando', country: 'United States', location: { lat: 28.5383, lng: -81.3792 }, type: 'city', aliases: ['orlando', 'disney'], emoji: '🏰' },
  { id: 'hou', name: 'Houston', city: 'Houston', country: 'United States', location: { lat: 29.7604, lng: -95.3698 }, type: 'city', aliases: ['houston'], emoji: '🚀' },
  { id: 'dfw', name: 'Dallas', city: 'Dallas', country: 'United States', location: { lat: 32.7767, lng: -96.7970 }, type: 'city', aliases: ['dallas'], emoji: '🤠' },
  { id: 'phx', name: 'Phoenix', city: 'Phoenix', country: 'United States', location: { lat: 33.4484, lng: -112.0740 }, type: 'city', aliases: ['phoenix'], emoji: '🌵' },
  { id: 'san', name: 'San Diego', city: 'San Diego', country: 'United States', location: { lat: 32.7157, lng: -117.1611 }, type: 'city', aliases: ['san diego'], emoji: '🌊' },
  { id: 'dca', name: 'Washington DC', city: 'Washington', country: 'United States', location: { lat: 38.9072, lng: -77.0369 }, type: 'city', aliases: ['washington', 'dc', 'washington dc'], emoji: '🏛️' },
  { id: 'nsh', name: 'Nashville', city: 'Nashville', country: 'United States', location: { lat: 36.1627, lng: -86.7816 }, type: 'city', aliases: ['nashville'], emoji: '🎸' },
  { id: 'aus', name: 'Austin', city: 'Austin', country: 'United States', location: { lat: 30.2672, lng: -97.7431 }, type: 'city', aliases: ['austin'], emoji: '🎵' },
  { id: 'nola', name: 'New Orleans', city: 'New Orleans', country: 'United States', location: { lat: 29.9511, lng: -90.0715 }, type: 'city', aliases: ['new orleans', 'nola'], emoji: '🎷' },
  { id: 'msp', name: 'Minneapolis', city: 'Minneapolis', country: 'United States', location: { lat: 44.9778, lng: -93.2650 }, type: 'city', aliases: ['minneapolis'], emoji: '❄️' },
  { id: 'pdx', name: 'Portland', city: 'Portland', country: 'United States', location: { lat: 45.5152, lng: -122.6784 }, type: 'city', aliases: ['portland'], emoji: '🌲' },
  { id: 'phl', name: 'Philadelphia', city: 'Philadelphia', country: 'United States', location: { lat: 39.9526, lng: -75.1652 }, type: 'city', aliases: ['philly', 'philadelphia'], emoji: '🔔' },
  { id: 'slt', name: 'Salt Lake City', city: 'Salt Lake City', country: 'United States', location: { lat: 40.7608, lng: -111.8910 }, type: 'city', aliases: ['salt lake', 'salt lake city'], emoji: '⛷️' },
  { id: 'hnl', name: 'Honolulu', city: 'Honolulu', country: 'United States', location: { lat: 21.3069, lng: -157.8583 }, type: 'city', aliases: ['honolulu', 'hawaii', 'waikiki'], emoji: '🌺' },

  // Europe
  { id: 'lon', name: 'London', city: 'London', country: 'United Kingdom', location: { lat: 51.5074, lng: -0.1278 }, type: 'city', aliases: ['london'], emoji: '🇬🇧' },
  { id: 'lon-westminster', name: 'Westminster', city: 'London', country: 'United Kingdom', location: { lat: 51.4975, lng: -0.1357 }, type: 'neighborhood', emoji: '🏛️' },
  { id: 'lhr', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', location: { lat: 51.4700, lng: -0.4543 }, type: 'airport', aliases: ['heathrow', 'lhr'], emoji: '✈️' },

  { id: 'par', name: 'Paris', city: 'Paris', country: 'France', location: { lat: 48.8566, lng: 2.3522 }, type: 'city', aliases: ['paris'], emoji: '🥐' },
  { id: 'par-champs', name: 'Champs-Élysées', city: 'Paris', country: 'France', location: { lat: 48.8698, lng: 2.3079 }, type: 'landmark', emoji: '🛍️' },
  { id: 'par-eiffel', name: 'Eiffel Tower Area', city: 'Paris', country: 'France', location: { lat: 48.8584, lng: 2.2945 }, type: 'landmark', emoji: '🗼' },

  { id: 'rom', name: 'Rome', city: 'Rome', country: 'Italy', location: { lat: 41.9028, lng: 12.4964 }, type: 'city', aliases: ['rome', 'roma'], emoji: '🏛️' },
  { id: 'rom-vatican', name: 'Vatican City', city: 'Rome', country: 'Italy', location: { lat: 41.9029, lng: 12.4534 }, type: 'landmark', emoji: '⛪' },

  { id: 'bcn', name: 'Barcelona', city: 'Barcelona', country: 'Spain', location: { lat: 41.3851, lng: 2.1734 }, type: 'city', aliases: ['barcelona'], emoji: '🏖️' },
  { id: 'bcn-las-ramblas', name: 'Las Ramblas', city: 'Barcelona', country: 'Spain', location: { lat: 41.3797, lng: 2.1746 }, type: 'landmark', emoji: '🚶' },

  { id: 'mad', name: 'Madrid', city: 'Madrid', country: 'Spain', location: { lat: 40.4168, lng: -3.7038 }, type: 'city', aliases: ['madrid'], emoji: '🇪🇸' },
  { id: 'ams', name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', location: { lat: 52.3676, lng: 4.9041 }, type: 'city', aliases: ['amsterdam'], emoji: '🚲' },
  { id: 'ber', name: 'Berlin', city: 'Berlin', country: 'Germany', location: { lat: 52.5200, lng: 13.4050 }, type: 'city', aliases: ['berlin'], emoji: '🧱' },
  { id: 'muc', name: 'Munich', city: 'Munich', country: 'Germany', location: { lat: 48.1351, lng: 11.5820 }, type: 'city', aliases: ['munich', 'münchen'], emoji: '🍺' },
  { id: 'vie', name: 'Vienna', city: 'Vienna', country: 'Austria', location: { lat: 48.2082, lng: 16.3738 }, type: 'city', aliases: ['vienna', 'wien'], emoji: '🎻' },
  { id: 'prg', name: 'Prague', city: 'Prague', country: 'Czech Republic', location: { lat: 50.0755, lng: 14.4378 }, type: 'city', aliases: ['prague', 'praha'], emoji: '🏰' },
  { id: 'lis', name: 'Lisbon', city: 'Lisbon', country: 'Portugal', location: { lat: 38.7223, lng: -9.1393 }, type: 'city', aliases: ['lisbon', 'lisboa'], emoji: '🚃' },
  { id: 'dub', name: 'Dublin', city: 'Dublin', country: 'Ireland', location: { lat: 53.3498, lng: -6.2603 }, type: 'city', aliases: ['dublin'], emoji: '☘️' },
  { id: 'edi', name: 'Edinburgh', city: 'Edinburgh', country: 'United Kingdom', location: { lat: 55.9533, lng: -3.1883 }, type: 'city', aliases: ['edinburgh'], emoji: '🏴' },
  { id: 'mil', name: 'Milan', city: 'Milan', country: 'Italy', location: { lat: 45.4642, lng: 9.1900 }, type: 'city', aliases: ['milan', 'milano'], emoji: '👗' },
  { id: 'flr', name: 'Florence', city: 'Florence', country: 'Italy', location: { lat: 43.7696, lng: 11.2558 }, type: 'city', aliases: ['florence', 'firenze'], emoji: '🎨' },
  { id: 'ven', name: 'Venice', city: 'Venice', country: 'Italy', location: { lat: 45.4408, lng: 12.3155 }, type: 'city', aliases: ['venice', 'venezia'], emoji: '🛶' },
  { id: 'ath', name: 'Athens', city: 'Athens', country: 'Greece', location: { lat: 37.9838, lng: 23.7275 }, type: 'city', aliases: ['athens'], emoji: '🏛️' },
  { id: 'san-tor', name: 'Santorini', city: 'Santorini', country: 'Greece', location: { lat: 36.3932, lng: 25.4615 }, type: 'city', aliases: ['santorini'], emoji: '🌅' },
  { id: 'bru', name: 'Brussels', city: 'Brussels', country: 'Belgium', location: { lat: 50.8503, lng: 4.3517 }, type: 'city', aliases: ['brussels'], emoji: '🍫' },
  { id: 'zrh', name: 'Zurich', city: 'Zurich', country: 'Switzerland', location: { lat: 47.3769, lng: 8.5417 }, type: 'city', aliases: ['zurich', 'zürich'], emoji: '⛰️' },
  { id: 'gen', name: 'Geneva', city: 'Geneva', country: 'Switzerland', location: { lat: 46.2044, lng: 6.1432 }, type: 'city', aliases: ['geneva'], emoji: '⌚' },
  { id: 'cop', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark', location: { lat: 55.6761, lng: 12.5683 }, type: 'city', aliases: ['copenhagen'], emoji: '🚴' },
  { id: 'sto', name: 'Stockholm', city: 'Stockholm', country: 'Sweden', location: { lat: 59.3293, lng: 18.0686 }, type: 'city', aliases: ['stockholm'], emoji: '🏘️' },
  { id: 'osl', name: 'Oslo', city: 'Oslo', country: 'Norway', location: { lat: 59.9139, lng: 10.7522 }, type: 'city', aliases: ['oslo'], emoji: '⛷️' },
  { id: 'hel', name: 'Helsinki', city: 'Helsinki', country: 'Finland', location: { lat: 60.1699, lng: 24.9384 }, type: 'city', aliases: ['helsinki'], emoji: '🦌' },
  { id: 'ist', name: 'Istanbul', city: 'Istanbul', country: 'Turkey', location: { lat: 41.0082, lng: 28.9784 }, type: 'city', aliases: ['istanbul'], emoji: '🕌' },
  { id: 'bud', name: 'Budapest', city: 'Budapest', country: 'Hungary', location: { lat: 47.4979, lng: 19.0402 }, type: 'city', aliases: ['budapest'], emoji: '🌉' },
  { id: 'war', name: 'Warsaw', city: 'Warsaw', country: 'Poland', location: { lat: 52.2297, lng: 21.0122 }, type: 'city', aliases: ['warsaw', 'warszawa'], emoji: '🏛️' },
  { id: 'kra', name: 'Krakow', city: 'Krakow', country: 'Poland', location: { lat: 50.0647, lng: 19.9450 }, type: 'city', aliases: ['krakow', 'kraków'], emoji: '🏰' },
  { id: 'mow', name: 'Moscow', city: 'Moscow', country: 'Russia', location: { lat: 55.7558, lng: 37.6173 }, type: 'city', aliases: ['moscow'], emoji: '⛪' },

  // Asia
  { id: 'tyo', name: 'Tokyo', city: 'Tokyo', country: 'Japan', location: { lat: 35.6762, lng: 139.6503 }, type: 'city', aliases: ['tokyo'], emoji: '🗼' },
  { id: 'tyo-shibuya', name: 'Shibuya', city: 'Tokyo', country: 'Japan', location: { lat: 35.6580, lng: 139.7016 }, type: 'neighborhood', emoji: '🏙️' },
  { id: 'tyo-shinjuku', name: 'Shinjuku', city: 'Tokyo', country: 'Japan', location: { lat: 35.6938, lng: 139.7034 }, type: 'neighborhood', emoji: '🌃' },
  { id: 'osa', name: 'Osaka', city: 'Osaka', country: 'Japan', location: { lat: 34.6937, lng: 135.5023 }, type: 'city', aliases: ['osaka'], emoji: '🏯' },
  { id: 'kyo', name: 'Kyoto', city: 'Kyoto', country: 'Japan', location: { lat: 35.0116, lng: 135.7681 }, type: 'city', aliases: ['kyoto'], emoji: '⛩️' },

  { id: 'sin', name: 'Singapore', city: 'Singapore', country: 'Singapore', location: { lat: 1.3521, lng: 103.8198 }, type: 'city', aliases: ['singapore'], emoji: '🦁' },
  { id: 'sin-marina-bay', name: 'Marina Bay', city: 'Singapore', country: 'Singapore', location: { lat: 1.2834, lng: 103.8607 }, type: 'neighborhood', emoji: '🏙️' },

  { id: 'hkg', name: 'Hong Kong', city: 'Hong Kong', country: 'Hong Kong', location: { lat: 22.3193, lng: 114.1694 }, type: 'city', aliases: ['hong kong', 'hk'], emoji: '🏙️' },
  { id: 'bkk', name: 'Bangkok', city: 'Bangkok', country: 'Thailand', location: { lat: 13.7563, lng: 100.5018 }, type: 'city', aliases: ['bangkok'], emoji: '🛕' },
  { id: 'phu', name: 'Phuket', city: 'Phuket', country: 'Thailand', location: { lat: 7.9519, lng: 98.3381 }, type: 'city', aliases: ['phuket'], emoji: '🏝️' },
  { id: 'dps', name: 'Bali', city: 'Bali', country: 'Indonesia', location: { lat: -8.3405, lng: 115.0920 }, type: 'city', aliases: ['bali', 'denpasar'], emoji: '🌴' },
  { id: 'dps-ubud', name: 'Ubud', city: 'Bali', country: 'Indonesia', location: { lat: -8.5069, lng: 115.2625 }, type: 'neighborhood', emoji: '🌿' },
  { id: 'dps-seminyak', name: 'Seminyak', city: 'Bali', country: 'Indonesia', location: { lat: -8.6913, lng: 115.1681 }, type: 'neighborhood', emoji: '🏖️' },
  { id: 'kul', name: 'Kuala Lumpur', city: 'Kuala Lumpur', country: 'Malaysia', location: { lat: 3.1390, lng: 101.6869 }, type: 'city', aliases: ['kuala lumpur', 'kl'], emoji: '🕌' },
  { id: 'mnl', name: 'Manila', city: 'Manila', country: 'Philippines', location: { lat: 14.5995, lng: 120.9842 }, type: 'city', aliases: ['manila'], emoji: '🏙️' },
  { id: 'sgn', name: 'Ho Chi Minh City', city: 'Ho Chi Minh City', country: 'Vietnam', location: { lat: 10.8231, lng: 106.6297 }, type: 'city', aliases: ['ho chi minh', 'saigon', 'hcmc'], emoji: '🛵' },
  { id: 'han', name: 'Hanoi', city: 'Hanoi', country: 'Vietnam', location: { lat: 21.0285, lng: 105.8542 }, type: 'city', aliases: ['hanoi'], emoji: '🏞️' },
  { id: 'sel', name: 'Seoul', city: 'Seoul', country: 'South Korea', location: { lat: 37.5665, lng: 126.9780 }, type: 'city', aliases: ['seoul'], emoji: '🏯' },
  { id: 'pek', name: 'Beijing', city: 'Beijing', country: 'China', location: { lat: 39.9042, lng: 116.4074 }, type: 'city', aliases: ['beijing', 'peking'], emoji: '🏛️' },
  { id: 'sha', name: 'Shanghai', city: 'Shanghai', country: 'China', location: { lat: 31.2304, lng: 121.4737 }, type: 'city', aliases: ['shanghai'], emoji: '🌆' },
  { id: 'del', name: 'New Delhi', city: 'New Delhi', country: 'India', location: { lat: 28.6139, lng: 77.2090 }, type: 'city', aliases: ['delhi', 'new delhi'], emoji: '🕌' },
  { id: 'bom', name: 'Mumbai', city: 'Mumbai', country: 'India', location: { lat: 19.0760, lng: 72.8777 }, type: 'city', aliases: ['mumbai', 'bombay'], emoji: '🏙️' },
  { id: 'goa', name: 'Goa', city: 'Goa', country: 'India', location: { lat: 15.2993, lng: 74.1240 }, type: 'city', aliases: ['goa'], emoji: '🏖️' },

  // Middle East
  { id: 'dxb', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.2048, lng: 55.2708 }, type: 'city', aliases: ['dubai'], emoji: '🏙️' },
  { id: 'dxb-downtown', name: 'Downtown Dubai', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.1972, lng: 55.2744 }, type: 'neighborhood', emoji: '🏙️' },
  { id: 'dxb-marina', name: 'Dubai Marina', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.0805, lng: 55.1403 }, type: 'neighborhood', emoji: '⛵' },
  { id: 'auh', name: 'Abu Dhabi', city: 'Abu Dhabi', country: 'United Arab Emirates', location: { lat: 24.4539, lng: 54.3773 }, type: 'city', aliases: ['abu dhabi'], emoji: '🕌' },
  { id: 'doh', name: 'Doha', city: 'Doha', country: 'Qatar', location: { lat: 25.2854, lng: 51.5310 }, type: 'city', aliases: ['doha'], emoji: '🏙️' },
  { id: 'tlv', name: 'Tel Aviv', city: 'Tel Aviv', country: 'Israel', location: { lat: 32.0853, lng: 34.7818 }, type: 'city', aliases: ['tel aviv'], emoji: '🏖️' },

  // Oceania
  { id: 'syd', name: 'Sydney', city: 'Sydney', country: 'Australia', location: { lat: -33.8688, lng: 151.2093 }, type: 'city', aliases: ['sydney'], emoji: '🦘' },
  { id: 'syd-bondi', name: 'Bondi Beach', city: 'Sydney', country: 'Australia', location: { lat: -33.8914, lng: 151.2767 }, type: 'neighborhood', emoji: '🏄' },
  { id: 'mel', name: 'Melbourne', city: 'Melbourne', country: 'Australia', location: { lat: -37.8136, lng: 144.9631 }, type: 'city', aliases: ['melbourne'], emoji: '☕' },
  { id: 'bne', name: 'Brisbane', city: 'Brisbane', country: 'Australia', location: { lat: -27.4698, lng: 153.0251 }, type: 'city', aliases: ['brisbane'], emoji: '🌞' },
  { id: 'per', name: 'Perth', city: 'Perth', country: 'Australia', location: { lat: -31.9505, lng: 115.8605 }, type: 'city', aliases: ['perth'], emoji: '🌅' },
  { id: 'gcs', name: 'Gold Coast', city: 'Gold Coast', country: 'Australia', location: { lat: -28.0167, lng: 153.4000 }, type: 'city', aliases: ['gold coast'], emoji: '🏖️' },
  { id: 'akl', name: 'Auckland', city: 'Auckland', country: 'New Zealand', location: { lat: -36.8509, lng: 174.7645 }, type: 'city', aliases: ['auckland'], emoji: '🗻' },
  { id: 'qzn', name: 'Queenstown', city: 'Queenstown', country: 'New Zealand', location: { lat: -45.0312, lng: 168.6626 }, type: 'city', aliases: ['queenstown'], emoji: '🏔️' },

  // Americas (Other)
  { id: 'yyz', name: 'Toronto', city: 'Toronto', country: 'Canada', location: { lat: 43.6532, lng: -79.3832 }, type: 'city', aliases: ['toronto'], emoji: '🍁' },
  { id: 'yvr', name: 'Vancouver', city: 'Vancouver', country: 'Canada', location: { lat: 49.2827, lng: -123.1207 }, type: 'city', aliases: ['vancouver'], emoji: '🏔️' },
  { id: 'yul', name: 'Montreal', city: 'Montreal', country: 'Canada', location: { lat: 45.5017, lng: -73.5673 }, type: 'city', aliases: ['montreal'], emoji: '🍁' },
  { id: 'cun', name: 'Cancún', city: 'Cancún', country: 'Mexico', location: { lat: 21.1619, lng: -86.8515 }, type: 'city', aliases: ['cancun', 'cancún'], emoji: '🏖️' },
  { id: 'mex', name: 'Mexico City', city: 'Mexico City', country: 'Mexico', location: { lat: 19.4326, lng: -99.1332 }, type: 'city', aliases: ['mexico city', 'cdmx'], emoji: '🏙️' },
  { id: 'pvr', name: 'Puerto Vallarta', city: 'Puerto Vallarta', country: 'Mexico', location: { lat: 20.6534, lng: -105.2253 }, type: 'city', aliases: ['puerto vallarta'], emoji: '🌅' },
  { id: 'sjd', name: 'Los Cabos', city: 'Los Cabos', country: 'Mexico', location: { lat: 22.8905, lng: -109.9167 }, type: 'city', aliases: ['cabo', 'los cabos', 'cabo san lucas'], emoji: '🌵' },
  { id: 'gru', name: 'São Paulo', city: 'São Paulo', country: 'Brazil', location: { lat: -23.5505, lng: -46.6333 }, type: 'city', aliases: ['sao paulo', 'são paulo'], emoji: '🇧🇷' },
  { id: 'gig', name: 'Rio de Janeiro', city: 'Rio de Janeiro', country: 'Brazil', location: { lat: -22.9068, lng: -43.1729 }, type: 'city', aliases: ['rio', 'rio de janeiro'], emoji: '🏖️' },
  { id: 'gig-copacabana', name: 'Copacabana', city: 'Rio de Janeiro', country: 'Brazil', location: { lat: -22.9711, lng: -43.1822 }, type: 'neighborhood', emoji: '🏖️' },
  { id: 'bog', name: 'Bogotá', city: 'Bogotá', country: 'Colombia', location: { lat: 4.7110, lng: -74.0721 }, type: 'city', aliases: ['bogota', 'bogotá'], emoji: '🏙️' },
  { id: 'ctg', name: 'Cartagena', city: 'Cartagena', country: 'Colombia', location: { lat: 10.3910, lng: -75.4794 }, type: 'city', aliases: ['cartagena'], emoji: '🏰' },
  { id: 'lim', name: 'Lima', city: 'Lima', country: 'Peru', location: { lat: -12.0464, lng: -77.0428 }, type: 'city', aliases: ['lima'], emoji: '🏙️' },
  { id: 'cuz', name: 'Cusco', city: 'Cusco', country: 'Peru', location: { lat: -13.5320, lng: -71.9675 }, type: 'city', aliases: ['cusco', 'cuzco', 'machu picchu'], emoji: '🏔️' },
  { id: 'scl', name: 'Santiago', city: 'Santiago', country: 'Chile', location: { lat: -33.4489, lng: -70.6693 }, type: 'city', aliases: ['santiago'], emoji: '🏔️' },
  { id: 'eze', name: 'Buenos Aires', city: 'Buenos Aires', country: 'Argentina', location: { lat: -34.6037, lng: -58.3816 }, type: 'city', aliases: ['buenos aires'], emoji: '🥩' },

  // Africa
  { id: 'jnb', name: 'Johannesburg', city: 'Johannesburg', country: 'South Africa', location: { lat: -26.2041, lng: 28.0473 }, type: 'city', aliases: ['johannesburg', 'joburg'], emoji: '🦁' },
  { id: 'cpt', name: 'Cape Town', city: 'Cape Town', country: 'South Africa', location: { lat: -33.9249, lng: 18.4241 }, type: 'city', aliases: ['cape town'], emoji: '🏔️' },
  { id: 'cai', name: 'Cairo', city: 'Cairo', country: 'Egypt', location: { lat: 30.0444, lng: 31.2357 }, type: 'city', aliases: ['cairo'], emoji: '🏜️' },
  { id: 'cmn', name: 'Casablanca', city: 'Casablanca', country: 'Morocco', location: { lat: 33.5731, lng: -7.5898 }, type: 'city', aliases: ['casablanca'], emoji: '🕌' },
  { id: 'rak', name: 'Marrakech', city: 'Marrakech', country: 'Morocco', location: { lat: 31.6295, lng: -7.9811 }, type: 'city', aliases: ['marrakech', 'marrakesh'], emoji: '🏛️' },
  { id: 'nbo', name: 'Nairobi', city: 'Nairobi', country: 'Kenya', location: { lat: -1.2921, lng: 36.8219 }, type: 'city', aliases: ['nairobi'], emoji: '🦒' },
  { id: 'mus', name: 'Mauritius', city: 'Port Louis', country: 'Mauritius', location: { lat: -20.1609, lng: 57.5012 }, type: 'city', aliases: ['mauritius'], emoji: '🏝️' },
  { id: 'sey', name: 'Seychelles', city: 'Victoria', country: 'Seychelles', location: { lat: -4.6191, lng: 55.4513 }, type: 'city', aliases: ['seychelles'], emoji: '🏝️' },
  { id: 'mdv', name: 'Maldives', city: 'Malé', country: 'Maldives', location: { lat: 4.1755, lng: 73.5093 }, type: 'city', aliases: ['maldives', 'male'], emoji: '🏝️' },

  // Caribbean
  { id: 'nas', name: 'Nassau', city: 'Nassau', country: 'Bahamas', location: { lat: 25.0443, lng: -77.3504 }, type: 'city', aliases: ['nassau', 'bahamas'], emoji: '🏝️' },
  { id: 'mbj', name: 'Montego Bay', city: 'Montego Bay', country: 'Jamaica', location: { lat: 18.4762, lng: -77.8939 }, type: 'city', aliases: ['montego bay', 'jamaica'], emoji: '🏝️' },
  { id: 'puj', name: 'Punta Cana', city: 'Punta Cana', country: 'Dominican Republic', location: { lat: 18.5601, lng: -68.3725 }, type: 'city', aliases: ['punta cana'], emoji: '🏖️' },
  { id: 'sju', name: 'San Juan', city: 'San Juan', country: 'Puerto Rico', location: { lat: 18.4655, lng: -66.1057 }, type: 'city', aliases: ['san juan', 'puerto rico'], emoji: '🏰' },
  { id: 'aua', name: 'Aruba', city: 'Oranjestad', country: 'Aruba', location: { lat: 12.5092, lng: -70.0086 }, type: 'city', aliases: ['aruba'], emoji: '🏝️' },
  { id: 'cur', name: 'Curaçao', city: 'Willemstad', country: 'Curaçao', location: { lat: 12.1696, lng: -68.9900 }, type: 'city', aliases: ['curacao', 'curaçao'], emoji: '🏝️' },
  { id: 'stm', name: 'St. Maarten', city: 'Philipsburg', country: 'St. Maarten', location: { lat: 18.0237, lng: -63.0458 }, type: 'city', aliases: ['st maarten', 'saint martin'], emoji: '🏝️' },
];

/**
 * Add latitude/longitude at root level for EnhancedSearchBar compatibility
 */
function normalizeForFrontend(item: any): CitySuggestion {
  return {
    ...item,
    latitude: item.location?.lat || item.latitude || 0,
    longitude: item.location?.lng || item.longitude || 0,
  };
}

/**
 * Search cities with fuzzy matching and accent-insensitive search
 * Now supports "Sao Paulo" matching "São Paulo", "Bogota" matching "Bogotá", etc.
 */
function searchCities(query: string): CitySuggestion[] {
  const normalizedQuery = normalizeString(query);

  if (normalizedQuery.length < 2) return [];

  const results: Array<{ city: CitySuggestion; score: number }> = [];

  for (const city of CITY_DATABASE) {
    let score = 0;

    // Normalize all fields for accent-insensitive matching
    const normalizedName = normalizeString(city.name);
    const normalizedCity = normalizeString(city.city);
    const normalizedCountry = normalizeString(city.country);
    const normalizedId = normalizeString(city.id);
    const normalizedAliases = city.aliases?.map(normalizeString) || [];

    // Exact name match (highest priority)
    if (normalizedName === normalizedQuery) {
      score = 100;
    }
    // City name starts with query
    else if (normalizedName.startsWith(normalizedQuery)) {
      score = 80;
    }
    // City field starts with query
    else if (normalizedCity.startsWith(normalizedQuery)) {
      score = 75;
    }
    // Alias match (important for "sao paulo" → "são paulo")
    else if (normalizedAliases.some(alias => alias.includes(normalizedQuery) || normalizedQuery.includes(alias))) {
      score = 70;
    }
    // Name contains query
    else if (normalizedName.includes(normalizedQuery)) {
      score = 60;
    }
    // City contains query
    else if (normalizedCity.includes(normalizedQuery)) {
      score = 55;
    }
    // ID match (airport/city codes)
    else if (normalizedId === normalizedQuery) {
      score = 90;
    }
    // Country contains query
    else if (normalizedCountry.includes(normalizedQuery)) {
      score = 30;
    }

    if (score > 0) {
      // Boost cities over neighborhoods/landmarks/POIs
      if (city.type === 'city') score += 5;
      results.push({ city, score });
    }
  }

  // Sort by score descending, then alphabetically
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.city.name.localeCompare(b.city.name);
  });

  return results.slice(0, 10).map(r => r.city);
}

// Popular/trending destinations for when user first focuses input
const POPULAR_DESTINATIONS: CitySuggestion[] = [
  CITY_DATABASE.find(c => c.id === 'nyc')!,
  CITY_DATABASE.find(c => c.id === 'lon')!,
  CITY_DATABASE.find(c => c.id === 'par')!,
  CITY_DATABASE.find(c => c.id === 'dxb')!,
  CITY_DATABASE.find(c => c.id === 'tyo')!,
  CITY_DATABASE.find(c => c.id === 'lax')!,
  CITY_DATABASE.find(c => c.id === 'bcn')!,
  CITY_DATABASE.find(c => c.id === 'sin')!,
  CITY_DATABASE.find(c => c.id === 'rom')!,
  CITY_DATABASE.find(c => c.id === 'mia')!,
].filter(Boolean);

/**
 * Hotel Location Suggestions API Route
 *
 * GET /api/hotels/suggestions?query=Paris
 * GET /api/hotels/suggestions?popular=true (returns trending destinations)
 *
 * Uses a hybrid approach:
 * 1. LiteAPI Places search for global coverage (200K+ locations)
 * 2. Local database fallback for instant results
 * 3. Smart merging and deduplication
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const popular = searchParams.get('popular');

    // Return popular destinations when no query
    if (popular === 'true' || (!query && !popular)) {
      const normalizedPopular = POPULAR_DESTINATIONS.map(normalizeForFrontend);
      return NextResponse.json({
        success: true,
        data: normalizedPopular,
        meta: {
          count: normalizedPopular.length,
          source: 'popular',
        },
      }, {
        headers: {
          'Cache-Control': 'public, max-age=86400', // 24 hours for popular
        }
      });
    }

    if (!query || query.length < 2) {
      const normalizedPopular = POPULAR_DESTINATIONS.map(normalizeForFrontend);
      return NextResponse.json({
        success: true,
        data: normalizedPopular,
        meta: {
          count: normalizedPopular.length,
          source: 'popular',
        },
      });
    }

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:suggestions:v2', { query: query.toLowerCase() });

    // Try to get from cache (30 min TTL for dynamic results)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log(`✅ Returning cached suggestions for "${query}"`);
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'Cache-Control': 'public, max-age=1800',
        }
      });
    }

    console.log(`🔍 Searching suggestions for "${query}"...`);

    // Parallel search: LiteAPI + local database
    const [liteApiResponse, localResults] = await Promise.all([
      searchLiteApiPlaces(query),
      Promise.resolve(searchCities(query)),
    ]);

    // Merge results with intelligent prioritization based on search intent
    const merged = mergeResults(liteApiResponse.results, localResults, liteApiResponse.intent);

    // Normalize all results for frontend compatibility
    const normalizedMerged = merged.map(normalizeForFrontend);

    const response = {
      success: true,
      data: normalizedMerged,
      meta: {
        count: normalizedMerged.length,
        query,
        intent: liteApiResponse.intent,
        sources: {
          liteapi: liteApiResponse.results.length,
          local: localResults.length,
        },
      },
    };

    // Store in cache (30 min TTL)
    await setCache(cacheKey, response, 1800);

    console.log(`✅ Found ${merged.length} suggestions for "${query}" (LiteAPI: ${liteApiResponse.results.length}, Local: ${localResults.length})`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'Cache-Control': 'public, max-age=1800',
      }
    });
  } catch (error: any) {
    console.error('❌ Hotel suggestions error:', error);

    // Fallback to local search on any error
    const query = request.nextUrl.searchParams.get('query');
    if (query && query.length >= 2) {
      const fallback = searchCities(query).map(normalizeForFrontend);
      return NextResponse.json({
        success: true,
        data: fallback,
        meta: {
          count: fallback.length,
          query,
          source: 'fallback',
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch suggestions',
      },
      { status: 500 }
    );
  }
}

/**
 * Smart Search Intent Detection
 * Analyzes user query to determine search type for optimal results
 *
 * Examples:
 * - "hotels near Eiffel Tower" → { cleanQuery: "Eiffel Tower", types: ['landmark', 'poi'] }
 * - "hotels in Manhattan" → { cleanQuery: "Manhattan", types: ['neighborhood'] }
 * - "Eiffel Tower" → { cleanQuery: "Eiffel Tower", types: ['landmark', 'poi'] }
 * - "Paris" → { cleanQuery: "Paris", types: ['city'] }
 */
interface SearchIntent {
  cleanQuery: string;
  types?: Array<'city' | 'landmark' | 'poi' | 'neighborhood' | 'country'>;
  isProximitySearch: boolean; // "near X" queries
}

function detectSearchIntent(query: string): SearchIntent {
  const normalized = query.toLowerCase().trim();

  // Pattern: "hotels near X", "near X", "close to X"
  const proximityPatterns = /(?:hotels?\s+)?(?:near|close\s+to|around|by)\s+(.+)/i;
  const proximityMatch = query.match(proximityPatterns);
  if (proximityMatch) {
    return {
      cleanQuery: proximityMatch[1].trim(),
      types: ['landmark', 'poi', 'neighborhood'],
      isProximitySearch: true,
    };
  }

  // Pattern: "hotels in X", "in X"
  const locationPatterns = /(?:hotels?\s+)?in\s+(.+)/i;
  const locationMatch = query.match(locationPatterns);
  if (locationMatch) {
    return {
      cleanQuery: locationMatch[1].trim(),
      types: ['neighborhood', 'city'],
      isProximitySearch: false,
    };
  }

  // Known landmark keywords (highly specific POIs)
  const landmarkKeywords = ['tower', 'statue', 'palace', 'cathedral', 'temple', 'monument', 'museum', 'park', 'garden', 'bridge', 'gate', 'square', 'plaza'];
  const hasLandmarkKeyword = landmarkKeywords.some(keyword => normalized.includes(keyword));
  if (hasLandmarkKeyword) {
    return {
      cleanQuery: query,
      types: ['landmark', 'poi'],
      isProximitySearch: false,
    };
  }

  // Known neighborhood indicators
  const neighborhoodKeywords = ['district', 'quarter', 'area', 'downtown', 'uptown', 'beach', 'bay', 'hills'];
  const hasNeighborhoodKeyword = neighborhoodKeywords.some(keyword => normalized.includes(keyword));
  if (hasNeighborhoodKeyword) {
    return {
      cleanQuery: query,
      types: ['neighborhood', 'city'],
      isProximitySearch: false,
    };
  }

  // Default: general search (prioritize cities but include all types)
  return {
    cleanQuery: query,
    types: undefined, // No filter - search everything
    isProximitySearch: false,
  };
}

/**
 * Search LiteAPI Places endpoint for global coverage with smart type filtering
 * Returns both results and detected search intent for intelligent ranking
 */
async function searchLiteApiPlaces(query: string): Promise<{ results: CitySuggestion[]; intent: SearchIntent }> {
  try {
    // Detect search intent for smart filtering
    const intent = detectSearchIntent(query);

    console.log(`🧠 Search Intent: "${query}" → Clean: "${intent.cleanQuery}", Types: ${intent.types?.join(', ') || 'all'}, Proximity: ${intent.isProximitySearch}`);

    // Dynamic import to avoid circular dependency
    const { liteAPI } = await import('@/lib/api/liteapi');
    const { data } = await liteAPI.searchPlaces(intent.cleanQuery, {
      types: intent.types,
      limit: 15,
    });

    if (!data || data.length === 0) return { results: [], intent };

    // Log what we're receiving from LiteAPI
    console.log('📍 LiteAPI places response sample:', JSON.stringify(data.slice(0, 2)));

    // LiteAPI returns: { placeId, displayName, formattedAddress, types: [] }
    // Convert to our format - map displayName to name, extract country from formattedAddress
    const results = data.map((place: any, index: number) => {
      const name = place.displayName || place.textForSearch || place.cityName || '';
      const addressParts = (place.formattedAddress || '').split(',').map((s: string) => s.trim());
      const country = addressParts[addressParts.length - 1] || place.countryName || '';
      const city = addressParts[0] || name;
      const type = mapPlaceType(place.types?.[0] || place.type || 'city');

      // Intelligently assign emoji based on context
      const emoji = assignEmojiByContext({ name, city, country, type });

      return {
        id: `liteapi-${place.placeId || index}`,
        name,
        city,
        country,
        location: {
          lat: place.latitude || 0,
          lng: place.longitude || 0,
        },
        latitude: place.latitude || 0,
        longitude: place.longitude || 0,
        type,
        placeId: place.placeId,
        emoji, // Add intelligently assigned emoji
      };
    }).filter((p: any) => p.name) as CitySuggestion[];

    return { results, intent };
  } catch (error) {
    console.error('LiteAPI places search failed:', error);
    return { results: [], intent: { cleanQuery: query, isProximitySearch: false } };
  }
}

/**
 * Map LiteAPI place types to our types
 */
function mapPlaceType(type: string): 'city' | 'landmark' | 'airport' | 'neighborhood' | 'poi' {
  const lowerType = (type || '').toLowerCase();
  if (lowerType.includes('city') || lowerType.includes('town')) return 'city';
  if (lowerType.includes('airport')) return 'airport';
  if (lowerType.includes('neighborhood') || lowerType.includes('district')) return 'neighborhood';
  if (lowerType.includes('poi') || lowerType.includes('point_of_interest')) return 'poi';
  if (lowerType.includes('landmark') || lowerType.includes('monument')) return 'landmark';
  return 'city';
}

/**
 * Intelligently assign emoji to places based on type, location, and keywords
 * Enhances UX by providing visual context for LiteAPI results
 */
function assignEmojiByContext(place: { name: string; city?: string; country?: string; type: string }): string | undefined {
  const name = place.name.toLowerCase();
  const city = (place.city || '').toLowerCase();
  const country = (place.country || '').toLowerCase();
  const type = place.type;

  // Landmark/POI-specific emojis (highest priority)
  if (type === 'landmark' || type === 'poi') {
    // Famous landmarks by keyword
    if (name.includes('tower')) return '🗼';
    if (name.includes('statue')) return '🗽';
    if (name.includes('palace') || name.includes('castle')) return '🏰';
    if (name.includes('cathedral') || name.includes('church') || name.includes('basilica')) return '⛪';
    if (name.includes('temple') || name.includes('shrine')) return '🛕';
    if (name.includes('museum')) return '🏛️';
    if (name.includes('beach')) return '🏖️';
    if (name.includes('park') || name.includes('garden')) return '🌳';
    if (name.includes('bridge')) return '🌉';
    if (name.includes('gate')) return '🚪';
    if (name.includes('square') || name.includes('plaza')) return '🏛️';
    if (name.includes('monument')) return '🗿';
    if (name.includes('stadium') || name.includes('arena')) return '🏟️';
    if (name.includes('market') || name.includes('bazaar')) return '🏪';
    if (name.includes('port') || name.includes('harbor')) return '⚓';
    if (name.includes('casino')) return '🎰';
    if (name.includes('opera')) return '🎭';
    return '⭐'; // Generic landmark
  }

  // Airport-specific
  if (type === 'airport') return '✈️';

  // Neighborhood-specific
  if (type === 'neighborhood') {
    if (name.includes('downtown') || name.includes('center')) return '🏙️';
    if (name.includes('old town') || name.includes('historic')) return '🏛️';
    if (name.includes('beach')) return '🏖️';
    if (name.includes('bay')) return '🌊';
    if (name.includes('hills')) return '⛰️';
    if (name.includes('district')) return '🏘️';
    return '📍'; // Generic neighborhood
  }

  // City/Country-specific emojis by region
  if (type === 'city') {
    // Europe
    if (country.includes('france')) return '🥐';
    if (country.includes('italy')) return '🍕';
    if (country.includes('spain')) return '🇪🇸';
    if (country.includes('germany')) return '🇩🇪';
    if (country.includes('united kingdom') || country.includes('england') || country.includes('uk')) return '🇬🇧';
    if (country.includes('netherlands') || country.includes('holland')) return '🇳🇱';
    if (country.includes('switzerland')) return '🇨🇭';
    if (country.includes('austria')) return '🇦🇹';
    if (country.includes('greece')) return '🇬🇷';
    if (country.includes('portugal')) return '🇵🇹';

    // Americas
    if (country.includes('united states') || country.includes('usa') || country.includes('us')) {
      if (city.includes('new york') || name.includes('new york')) return '🗽';
      if (city.includes('los angeles') || city.includes('la') || name.includes('los angeles')) return '🌴';
      if (city.includes('miami') || name.includes('miami')) return '🏝️';
      if (city.includes('las vegas') || name.includes('vegas')) return '🎰';
      if (city.includes('san francisco') || name.includes('san francisco')) return '🌉';
      if (city.includes('chicago') || name.includes('chicago')) return '🏙️';
      if (city.includes('orlando') || name.includes('orlando')) return '🎢';
      if (city.includes('hawaii') || name.includes('hawaii') || name.includes('honolulu')) return '🌺';
      return '🇺🇸';
    }
    if (country.includes('canada')) return '🇨🇦';
    if (country.includes('mexico')) return '🇲🇽';
    if (country.includes('brazil')) return '🇧🇷';
    if (country.includes('argentina')) return '🇦🇷';
    if (country.includes('colombia')) return '🇨🇴';
    if (country.includes('peru')) return '🇵🇪';
    if (country.includes('chile')) return '🇨🇱';

    // Asia
    if (country.includes('japan')) return '🗾';
    if (country.includes('china')) return '🇨🇳';
    if (country.includes('korea')) return '🇰🇷';
    if (country.includes('thailand')) return '🇹🇭';
    if (country.includes('vietnam')) return '🇻🇳';
    if (country.includes('singapore')) return '🦁';
    if (country.includes('malaysia')) return '🇲🇾';
    if (country.includes('indonesia')) return '🇮🇩';
    if (country.includes('philippines')) return '🇵🇭';
    if (country.includes('india')) return '🇮🇳';
    if (country.includes('dubai') || country.includes('uae') || country.includes('emirates')) return '🏜️';
    if (country.includes('turkey')) return '🇹🇷';

    // Oceania
    if (country.includes('australia')) return '🇦🇺';
    if (country.includes('new zealand')) return '🇳🇿';

    // Africa
    if (country.includes('egypt')) return '🇪🇬';
    if (country.includes('south africa')) return '🇿🇦';
    if (country.includes('morocco')) return '🇲🇦';
    if (country.includes('kenya')) return '🇰🇪';

    // Middle East
    if (country.includes('israel')) return '🇮🇱';
    if (country.includes('jordan')) return '🇯🇴';
    if (country.includes('saudi')) return '🇸🇦';

    return '🌆'; // Generic city
  }

  return undefined; // No emoji assigned
}

/**
 * Merge results from multiple sources with intelligent prioritization
 * Uses search intent to rank results optimally for user's query
 */
function mergeResults(
  liteApiResults: CitySuggestion[],
  localResults: CitySuggestion[],
  intent?: SearchIntent
): CitySuggestion[] {
  const seen = new Set<string>();
  const merged: CitySuggestion[] = [];

  // Helper to create a unique key for deduplication
  const getKey = (item: CitySuggestion) => {
    return `${item.name.toLowerCase()}-${item.city.toLowerCase()}-${item.country.toLowerCase()}`.replace(/\s+/g, '');
  };

  // Add local results first (they have verified coordinates and emojis)
  for (const item of localResults) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  // Add LiteAPI results that aren't duplicates
  // Note: LiteAPI places may not have coordinates - they can still be used via placeId
  for (const item of liteApiResults) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }

  /**
   * Smart prioritization based on search intent
   *
   * Priority Rules:
   * 1. Proximity Search ("near X"):
   *    POI/Landmark > Neighborhood > City
   *
   * 2. Location Search ("in X"):
   *    Neighborhood > City > Landmark
   *
   * 3. General Search (default):
   *    City > Landmark > Neighborhood > POI
   */
  merged.sort((a, b) => {
    // Calculate priority scores based on intent
    const getTypePriority = (type: string): number => {
      if (!intent) {
        // Default: prioritize cities for general searches
        if (type === 'city') return 100;
        if (type === 'landmark') return 80;
        if (type === 'neighborhood') return 70;
        if (type === 'poi') return 60;
        if (type === 'airport') return 50;
        return 0;
      }

      if (intent.isProximitySearch || intent.types?.includes('poi') || intent.types?.includes('landmark')) {
        // Proximity/POI searches: prioritize points of interest
        if (type === 'poi') return 100;
        if (type === 'landmark') return 95;
        if (type === 'neighborhood') return 80;
        if (type === 'city') return 70;
        if (type === 'airport') return 50;
        return 60;
      }

      if (intent.types?.includes('neighborhood')) {
        // Neighborhood searches: prioritize neighborhoods
        if (type === 'neighborhood') return 100;
        if (type === 'city') return 90;
        if (type === 'landmark') return 70;
        if (type === 'poi') return 65;
        if (type === 'airport') return 50;
        return 60;
      }

      // Default: cities first
      if (type === 'city') return 100;
      if (type === 'landmark') return 80;
      if (type === 'neighborhood') return 70;
      if (type === 'poi') return 60;
      if (type === 'airport') return 50;
      return 0;
    };

    const priorityA = getTypePriority(a.type);
    const priorityB = getTypePriority(b.type);

    // Sort by priority (higher first)
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    // Same priority: prefer items with emojis (local database = curated)
    const hasEmojiA = !!a.emoji;
    const hasEmojiB = !!b.emoji;
    if (hasEmojiA && !hasEmojiB) return -1;
    if (!hasEmojiA && hasEmojiB) return 1;

    // Then sort by name length (shorter names usually more recognizable)
    return a.name.length - b.name.length;
  });

  return merged.slice(0, 15);
}
