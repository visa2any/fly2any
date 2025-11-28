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
  type: 'city' | 'landmark' | 'airport' | 'neighborhood';
  aliases?: string[];
  placeId?: string; // LiteAPI place ID for direct hotel lookup
}

const CITY_DATABASE: CitySuggestion[] = [
  // United States - Major Cities
  { id: 'nyc', name: 'New York City', city: 'New York', country: 'United States', location: { lat: 40.7128, lng: -74.0060 }, type: 'city', aliases: ['nyc', 'new york', 'manhattan', 'big apple'] },
  { id: 'nyc-times-square', name: 'Times Square', city: 'New York', country: 'United States', location: { lat: 40.7580, lng: -73.9855 }, type: 'landmark', aliases: ['times square'] },
  { id: 'nyc-manhattan', name: 'Manhattan', city: 'New York', country: 'United States', location: { lat: 40.7831, lng: -73.9712 }, type: 'neighborhood' },
  { id: 'nyc-brooklyn', name: 'Brooklyn', city: 'New York', country: 'United States', location: { lat: 40.6782, lng: -73.9442 }, type: 'neighborhood' },
  { id: 'jfk', name: 'JFK Airport', city: 'New York', country: 'United States', location: { lat: 40.6413, lng: -73.7781 }, type: 'airport', aliases: ['jfk', 'john f kennedy'] },

  { id: 'lax', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', location: { lat: 34.0522, lng: -118.2437 }, type: 'city', aliases: ['la', 'los angeles', 'hollywood'] },
  { id: 'lax-hollywood', name: 'Hollywood', city: 'Los Angeles', country: 'United States', location: { lat: 34.0928, lng: -118.3287 }, type: 'neighborhood' },
  { id: 'lax-santa-monica', name: 'Santa Monica', city: 'Los Angeles', country: 'United States', location: { lat: 34.0195, lng: -118.4912 }, type: 'neighborhood' },
  { id: 'lax-beverly-hills', name: 'Beverly Hills', city: 'Los Angeles', country: 'United States', location: { lat: 34.0736, lng: -118.4004 }, type: 'neighborhood' },

  { id: 'mia', name: 'Miami', city: 'Miami', country: 'United States', location: { lat: 25.7617, lng: -80.1918 }, type: 'city', aliases: ['miami', 'south florida'] },
  { id: 'mia-south-beach', name: 'South Beach', city: 'Miami', country: 'United States', location: { lat: 25.7907, lng: -80.1300 }, type: 'neighborhood', aliases: ['south beach', 'sobe'] },
  { id: 'mia-brickell', name: 'Brickell', city: 'Miami', country: 'United States', location: { lat: 25.7617, lng: -80.1918 }, type: 'neighborhood' },

  { id: 'chi', name: 'Chicago', city: 'Chicago', country: 'United States', location: { lat: 41.8781, lng: -87.6298 }, type: 'city', aliases: ['chicago', 'windy city'] },
  { id: 'chi-downtown', name: 'Downtown Chicago', city: 'Chicago', country: 'United States', location: { lat: 41.8819, lng: -87.6278 }, type: 'neighborhood' },

  { id: 'sfo', name: 'San Francisco', city: 'San Francisco', country: 'United States', location: { lat: 37.7749, lng: -122.4194 }, type: 'city', aliases: ['sf', 'san francisco', 'frisco'] },
  { id: 'sfo-downtown', name: 'Downtown San Francisco', city: 'San Francisco', country: 'United States', location: { lat: 37.7879, lng: -122.4074 }, type: 'neighborhood' },

  { id: 'las', name: 'Las Vegas', city: 'Las Vegas', country: 'United States', location: { lat: 36.1699, lng: -115.1398 }, type: 'city', aliases: ['vegas', 'las vegas', 'sin city'] },
  { id: 'las-strip', name: 'Las Vegas Strip', city: 'Las Vegas', country: 'United States', location: { lat: 36.1147, lng: -115.1728 }, type: 'landmark', aliases: ['the strip'] },

  { id: 'sea', name: 'Seattle', city: 'Seattle', country: 'United States', location: { lat: 47.6062, lng: -122.3321 }, type: 'city', aliases: ['seattle'] },
  { id: 'bos', name: 'Boston', city: 'Boston', country: 'United States', location: { lat: 42.3601, lng: -71.0589 }, type: 'city', aliases: ['boston'] },
  { id: 'den', name: 'Denver', city: 'Denver', country: 'United States', location: { lat: 39.7392, lng: -104.9903 }, type: 'city', aliases: ['denver'] },
  { id: 'atl', name: 'Atlanta', city: 'Atlanta', country: 'United States', location: { lat: 33.7490, lng: -84.3880 }, type: 'city', aliases: ['atlanta'] },
  { id: 'orl', name: 'Orlando', city: 'Orlando', country: 'United States', location: { lat: 28.5383, lng: -81.3792 }, type: 'city', aliases: ['orlando', 'disney'] },
  { id: 'hou', name: 'Houston', city: 'Houston', country: 'United States', location: { lat: 29.7604, lng: -95.3698 }, type: 'city', aliases: ['houston'] },
  { id: 'dfw', name: 'Dallas', city: 'Dallas', country: 'United States', location: { lat: 32.7767, lng: -96.7970 }, type: 'city', aliases: ['dallas'] },
  { id: 'phx', name: 'Phoenix', city: 'Phoenix', country: 'United States', location: { lat: 33.4484, lng: -112.0740 }, type: 'city', aliases: ['phoenix'] },
  { id: 'san', name: 'San Diego', city: 'San Diego', country: 'United States', location: { lat: 32.7157, lng: -117.1611 }, type: 'city', aliases: ['san diego'] },
  { id: 'dca', name: 'Washington DC', city: 'Washington', country: 'United States', location: { lat: 38.9072, lng: -77.0369 }, type: 'city', aliases: ['washington', 'dc', 'washington dc'] },
  { id: 'nsh', name: 'Nashville', city: 'Nashville', country: 'United States', location: { lat: 36.1627, lng: -86.7816 }, type: 'city', aliases: ['nashville'] },
  { id: 'aus', name: 'Austin', city: 'Austin', country: 'United States', location: { lat: 30.2672, lng: -97.7431 }, type: 'city', aliases: ['austin'] },
  { id: 'nola', name: 'New Orleans', city: 'New Orleans', country: 'United States', location: { lat: 29.9511, lng: -90.0715 }, type: 'city', aliases: ['new orleans', 'nola'] },
  { id: 'msp', name: 'Minneapolis', city: 'Minneapolis', country: 'United States', location: { lat: 44.9778, lng: -93.2650 }, type: 'city', aliases: ['minneapolis'] },
  { id: 'pdx', name: 'Portland', city: 'Portland', country: 'United States', location: { lat: 45.5152, lng: -122.6784 }, type: 'city', aliases: ['portland'] },
  { id: 'phl', name: 'Philadelphia', city: 'Philadelphia', country: 'United States', location: { lat: 39.9526, lng: -75.1652 }, type: 'city', aliases: ['philly', 'philadelphia'] },
  { id: 'slt', name: 'Salt Lake City', city: 'Salt Lake City', country: 'United States', location: { lat: 40.7608, lng: -111.8910 }, type: 'city', aliases: ['salt lake', 'salt lake city'] },
  { id: 'hnl', name: 'Honolulu', city: 'Honolulu', country: 'United States', location: { lat: 21.3069, lng: -157.8583 }, type: 'city', aliases: ['honolulu', 'hawaii', 'waikiki'] },

  // Europe
  { id: 'lon', name: 'London', city: 'London', country: 'United Kingdom', location: { lat: 51.5074, lng: -0.1278 }, type: 'city', aliases: ['london'] },
  { id: 'lon-westminster', name: 'Westminster', city: 'London', country: 'United Kingdom', location: { lat: 51.4975, lng: -0.1357 }, type: 'neighborhood' },
  { id: 'lhr', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', location: { lat: 51.4700, lng: -0.4543 }, type: 'airport', aliases: ['heathrow', 'lhr'] },

  { id: 'par', name: 'Paris', city: 'Paris', country: 'France', location: { lat: 48.8566, lng: 2.3522 }, type: 'city', aliases: ['paris'] },
  { id: 'par-champs', name: 'Champs-Élysées', city: 'Paris', country: 'France', location: { lat: 48.8698, lng: 2.3079 }, type: 'landmark' },
  { id: 'par-eiffel', name: 'Eiffel Tower Area', city: 'Paris', country: 'France', location: { lat: 48.8584, lng: 2.2945 }, type: 'landmark' },

  { id: 'rom', name: 'Rome', city: 'Rome', country: 'Italy', location: { lat: 41.9028, lng: 12.4964 }, type: 'city', aliases: ['rome', 'roma'] },
  { id: 'rom-vatican', name: 'Vatican City', city: 'Rome', country: 'Italy', location: { lat: 41.9029, lng: 12.4534 }, type: 'landmark' },

  { id: 'bcn', name: 'Barcelona', city: 'Barcelona', country: 'Spain', location: { lat: 41.3851, lng: 2.1734 }, type: 'city', aliases: ['barcelona'] },
  { id: 'bcn-las-ramblas', name: 'Las Ramblas', city: 'Barcelona', country: 'Spain', location: { lat: 41.3797, lng: 2.1746 }, type: 'landmark' },

  { id: 'mad', name: 'Madrid', city: 'Madrid', country: 'Spain', location: { lat: 40.4168, lng: -3.7038 }, type: 'city', aliases: ['madrid'] },
  { id: 'ams', name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', location: { lat: 52.3676, lng: 4.9041 }, type: 'city', aliases: ['amsterdam'] },
  { id: 'ber', name: 'Berlin', city: 'Berlin', country: 'Germany', location: { lat: 52.5200, lng: 13.4050 }, type: 'city', aliases: ['berlin'] },
  { id: 'muc', name: 'Munich', city: 'Munich', country: 'Germany', location: { lat: 48.1351, lng: 11.5820 }, type: 'city', aliases: ['munich', 'münchen'] },
  { id: 'vie', name: 'Vienna', city: 'Vienna', country: 'Austria', location: { lat: 48.2082, lng: 16.3738 }, type: 'city', aliases: ['vienna', 'wien'] },
  { id: 'prg', name: 'Prague', city: 'Prague', country: 'Czech Republic', location: { lat: 50.0755, lng: 14.4378 }, type: 'city', aliases: ['prague', 'praha'] },
  { id: 'lis', name: 'Lisbon', city: 'Lisbon', country: 'Portugal', location: { lat: 38.7223, lng: -9.1393 }, type: 'city', aliases: ['lisbon', 'lisboa'] },
  { id: 'dub', name: 'Dublin', city: 'Dublin', country: 'Ireland', location: { lat: 53.3498, lng: -6.2603 }, type: 'city', aliases: ['dublin'] },
  { id: 'edi', name: 'Edinburgh', city: 'Edinburgh', country: 'United Kingdom', location: { lat: 55.9533, lng: -3.1883 }, type: 'city', aliases: ['edinburgh'] },
  { id: 'mil', name: 'Milan', city: 'Milan', country: 'Italy', location: { lat: 45.4642, lng: 9.1900 }, type: 'city', aliases: ['milan', 'milano'] },
  { id: 'flr', name: 'Florence', city: 'Florence', country: 'Italy', location: { lat: 43.7696, lng: 11.2558 }, type: 'city', aliases: ['florence', 'firenze'] },
  { id: 'ven', name: 'Venice', city: 'Venice', country: 'Italy', location: { lat: 45.4408, lng: 12.3155 }, type: 'city', aliases: ['venice', 'venezia'] },
  { id: 'ath', name: 'Athens', city: 'Athens', country: 'Greece', location: { lat: 37.9838, lng: 23.7275 }, type: 'city', aliases: ['athens'] },
  { id: 'san-tor', name: 'Santorini', city: 'Santorini', country: 'Greece', location: { lat: 36.3932, lng: 25.4615 }, type: 'city', aliases: ['santorini'] },
  { id: 'bru', name: 'Brussels', city: 'Brussels', country: 'Belgium', location: { lat: 50.8503, lng: 4.3517 }, type: 'city', aliases: ['brussels'] },
  { id: 'zrh', name: 'Zurich', city: 'Zurich', country: 'Switzerland', location: { lat: 47.3769, lng: 8.5417 }, type: 'city', aliases: ['zurich', 'zürich'] },
  { id: 'gen', name: 'Geneva', city: 'Geneva', country: 'Switzerland', location: { lat: 46.2044, lng: 6.1432 }, type: 'city', aliases: ['geneva'] },
  { id: 'cop', name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark', location: { lat: 55.6761, lng: 12.5683 }, type: 'city', aliases: ['copenhagen'] },
  { id: 'sto', name: 'Stockholm', city: 'Stockholm', country: 'Sweden', location: { lat: 59.3293, lng: 18.0686 }, type: 'city', aliases: ['stockholm'] },
  { id: 'osl', name: 'Oslo', city: 'Oslo', country: 'Norway', location: { lat: 59.9139, lng: 10.7522 }, type: 'city', aliases: ['oslo'] },
  { id: 'hel', name: 'Helsinki', city: 'Helsinki', country: 'Finland', location: { lat: 60.1699, lng: 24.9384 }, type: 'city', aliases: ['helsinki'] },
  { id: 'ist', name: 'Istanbul', city: 'Istanbul', country: 'Turkey', location: { lat: 41.0082, lng: 28.9784 }, type: 'city', aliases: ['istanbul'] },
  { id: 'bud', name: 'Budapest', city: 'Budapest', country: 'Hungary', location: { lat: 47.4979, lng: 19.0402 }, type: 'city', aliases: ['budapest'] },
  { id: 'war', name: 'Warsaw', city: 'Warsaw', country: 'Poland', location: { lat: 52.2297, lng: 21.0122 }, type: 'city', aliases: ['warsaw', 'warszawa'] },
  { id: 'kra', name: 'Krakow', city: 'Krakow', country: 'Poland', location: { lat: 50.0647, lng: 19.9450 }, type: 'city', aliases: ['krakow', 'kraków'] },
  { id: 'mow', name: 'Moscow', city: 'Moscow', country: 'Russia', location: { lat: 55.7558, lng: 37.6173 }, type: 'city', aliases: ['moscow'] },

  // Asia
  { id: 'tyo', name: 'Tokyo', city: 'Tokyo', country: 'Japan', location: { lat: 35.6762, lng: 139.6503 }, type: 'city', aliases: ['tokyo'] },
  { id: 'tyo-shibuya', name: 'Shibuya', city: 'Tokyo', country: 'Japan', location: { lat: 35.6580, lng: 139.7016 }, type: 'neighborhood' },
  { id: 'tyo-shinjuku', name: 'Shinjuku', city: 'Tokyo', country: 'Japan', location: { lat: 35.6938, lng: 139.7034 }, type: 'neighborhood' },
  { id: 'osa', name: 'Osaka', city: 'Osaka', country: 'Japan', location: { lat: 34.6937, lng: 135.5023 }, type: 'city', aliases: ['osaka'] },
  { id: 'kyo', name: 'Kyoto', city: 'Kyoto', country: 'Japan', location: { lat: 35.0116, lng: 135.7681 }, type: 'city', aliases: ['kyoto'] },

  { id: 'sin', name: 'Singapore', city: 'Singapore', country: 'Singapore', location: { lat: 1.3521, lng: 103.8198 }, type: 'city', aliases: ['singapore'] },
  { id: 'sin-marina-bay', name: 'Marina Bay', city: 'Singapore', country: 'Singapore', location: { lat: 1.2834, lng: 103.8607 }, type: 'neighborhood' },

  { id: 'hkg', name: 'Hong Kong', city: 'Hong Kong', country: 'Hong Kong', location: { lat: 22.3193, lng: 114.1694 }, type: 'city', aliases: ['hong kong', 'hk'] },
  { id: 'bkk', name: 'Bangkok', city: 'Bangkok', country: 'Thailand', location: { lat: 13.7563, lng: 100.5018 }, type: 'city', aliases: ['bangkok'] },
  { id: 'phu', name: 'Phuket', city: 'Phuket', country: 'Thailand', location: { lat: 7.9519, lng: 98.3381 }, type: 'city', aliases: ['phuket'] },
  { id: 'dps', name: 'Bali', city: 'Bali', country: 'Indonesia', location: { lat: -8.3405, lng: 115.0920 }, type: 'city', aliases: ['bali', 'denpasar'] },
  { id: 'dps-ubud', name: 'Ubud', city: 'Bali', country: 'Indonesia', location: { lat: -8.5069, lng: 115.2625 }, type: 'neighborhood' },
  { id: 'dps-seminyak', name: 'Seminyak', city: 'Bali', country: 'Indonesia', location: { lat: -8.6913, lng: 115.1681 }, type: 'neighborhood' },
  { id: 'kul', name: 'Kuala Lumpur', city: 'Kuala Lumpur', country: 'Malaysia', location: { lat: 3.1390, lng: 101.6869 }, type: 'city', aliases: ['kuala lumpur', 'kl'] },
  { id: 'mnl', name: 'Manila', city: 'Manila', country: 'Philippines', location: { lat: 14.5995, lng: 120.9842 }, type: 'city', aliases: ['manila'] },
  { id: 'sgn', name: 'Ho Chi Minh City', city: 'Ho Chi Minh City', country: 'Vietnam', location: { lat: 10.8231, lng: 106.6297 }, type: 'city', aliases: ['ho chi minh', 'saigon', 'hcmc'] },
  { id: 'han', name: 'Hanoi', city: 'Hanoi', country: 'Vietnam', location: { lat: 21.0285, lng: 105.8542 }, type: 'city', aliases: ['hanoi'] },
  { id: 'sel', name: 'Seoul', city: 'Seoul', country: 'South Korea', location: { lat: 37.5665, lng: 126.9780 }, type: 'city', aliases: ['seoul'] },
  { id: 'pek', name: 'Beijing', city: 'Beijing', country: 'China', location: { lat: 39.9042, lng: 116.4074 }, type: 'city', aliases: ['beijing', 'peking'] },
  { id: 'sha', name: 'Shanghai', city: 'Shanghai', country: 'China', location: { lat: 31.2304, lng: 121.4737 }, type: 'city', aliases: ['shanghai'] },
  { id: 'del', name: 'New Delhi', city: 'New Delhi', country: 'India', location: { lat: 28.6139, lng: 77.2090 }, type: 'city', aliases: ['delhi', 'new delhi'] },
  { id: 'bom', name: 'Mumbai', city: 'Mumbai', country: 'India', location: { lat: 19.0760, lng: 72.8777 }, type: 'city', aliases: ['mumbai', 'bombay'] },
  { id: 'goa', name: 'Goa', city: 'Goa', country: 'India', location: { lat: 15.2993, lng: 74.1240 }, type: 'city', aliases: ['goa'] },

  // Middle East
  { id: 'dxb', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.2048, lng: 55.2708 }, type: 'city', aliases: ['dubai'] },
  { id: 'dxb-downtown', name: 'Downtown Dubai', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.1972, lng: 55.2744 }, type: 'neighborhood' },
  { id: 'dxb-marina', name: 'Dubai Marina', city: 'Dubai', country: 'United Arab Emirates', location: { lat: 25.0805, lng: 55.1403 }, type: 'neighborhood' },
  { id: 'auh', name: 'Abu Dhabi', city: 'Abu Dhabi', country: 'United Arab Emirates', location: { lat: 24.4539, lng: 54.3773 }, type: 'city', aliases: ['abu dhabi'] },
  { id: 'doh', name: 'Doha', city: 'Doha', country: 'Qatar', location: { lat: 25.2854, lng: 51.5310 }, type: 'city', aliases: ['doha'] },
  { id: 'tlv', name: 'Tel Aviv', city: 'Tel Aviv', country: 'Israel', location: { lat: 32.0853, lng: 34.7818 }, type: 'city', aliases: ['tel aviv'] },

  // Oceania
  { id: 'syd', name: 'Sydney', city: 'Sydney', country: 'Australia', location: { lat: -33.8688, lng: 151.2093 }, type: 'city', aliases: ['sydney'] },
  { id: 'syd-bondi', name: 'Bondi Beach', city: 'Sydney', country: 'Australia', location: { lat: -33.8914, lng: 151.2767 }, type: 'neighborhood' },
  { id: 'mel', name: 'Melbourne', city: 'Melbourne', country: 'Australia', location: { lat: -37.8136, lng: 144.9631 }, type: 'city', aliases: ['melbourne'] },
  { id: 'bne', name: 'Brisbane', city: 'Brisbane', country: 'Australia', location: { lat: -27.4698, lng: 153.0251 }, type: 'city', aliases: ['brisbane'] },
  { id: 'per', name: 'Perth', city: 'Perth', country: 'Australia', location: { lat: -31.9505, lng: 115.8605 }, type: 'city', aliases: ['perth'] },
  { id: 'gcs', name: 'Gold Coast', city: 'Gold Coast', country: 'Australia', location: { lat: -28.0167, lng: 153.4000 }, type: 'city', aliases: ['gold coast'] },
  { id: 'akl', name: 'Auckland', city: 'Auckland', country: 'New Zealand', location: { lat: -36.8509, lng: 174.7645 }, type: 'city', aliases: ['auckland'] },
  { id: 'qzn', name: 'Queenstown', city: 'Queenstown', country: 'New Zealand', location: { lat: -45.0312, lng: 168.6626 }, type: 'city', aliases: ['queenstown'] },

  // Americas (Other)
  { id: 'yyz', name: 'Toronto', city: 'Toronto', country: 'Canada', location: { lat: 43.6532, lng: -79.3832 }, type: 'city', aliases: ['toronto'] },
  { id: 'yvr', name: 'Vancouver', city: 'Vancouver', country: 'Canada', location: { lat: 49.2827, lng: -123.1207 }, type: 'city', aliases: ['vancouver'] },
  { id: 'yul', name: 'Montreal', city: 'Montreal', country: 'Canada', location: { lat: 45.5017, lng: -73.5673 }, type: 'city', aliases: ['montreal'] },
  { id: 'cun', name: 'Cancún', city: 'Cancún', country: 'Mexico', location: { lat: 21.1619, lng: -86.8515 }, type: 'city', aliases: ['cancun', 'cancún'] },
  { id: 'mex', name: 'Mexico City', city: 'Mexico City', country: 'Mexico', location: { lat: 19.4326, lng: -99.1332 }, type: 'city', aliases: ['mexico city', 'cdmx'] },
  { id: 'pvr', name: 'Puerto Vallarta', city: 'Puerto Vallarta', country: 'Mexico', location: { lat: 20.6534, lng: -105.2253 }, type: 'city', aliases: ['puerto vallarta'] },
  { id: 'sjd', name: 'Los Cabos', city: 'Los Cabos', country: 'Mexico', location: { lat: 22.8905, lng: -109.9167 }, type: 'city', aliases: ['cabo', 'los cabos', 'cabo san lucas'] },
  { id: 'gru', name: 'São Paulo', city: 'São Paulo', country: 'Brazil', location: { lat: -23.5505, lng: -46.6333 }, type: 'city', aliases: ['sao paulo', 'são paulo'] },
  { id: 'gig', name: 'Rio de Janeiro', city: 'Rio de Janeiro', country: 'Brazil', location: { lat: -22.9068, lng: -43.1729 }, type: 'city', aliases: ['rio', 'rio de janeiro'] },
  { id: 'gig-copacabana', name: 'Copacabana', city: 'Rio de Janeiro', country: 'Brazil', location: { lat: -22.9711, lng: -43.1822 }, type: 'neighborhood' },
  { id: 'bog', name: 'Bogotá', city: 'Bogotá', country: 'Colombia', location: { lat: 4.7110, lng: -74.0721 }, type: 'city', aliases: ['bogota', 'bogotá'] },
  { id: 'ctg', name: 'Cartagena', city: 'Cartagena', country: 'Colombia', location: { lat: 10.3910, lng: -75.4794 }, type: 'city', aliases: ['cartagena'] },
  { id: 'lim', name: 'Lima', city: 'Lima', country: 'Peru', location: { lat: -12.0464, lng: -77.0428 }, type: 'city', aliases: ['lima'] },
  { id: 'cuz', name: 'Cusco', city: 'Cusco', country: 'Peru', location: { lat: -13.5320, lng: -71.9675 }, type: 'city', aliases: ['cusco', 'cuzco', 'machu picchu'] },
  { id: 'scl', name: 'Santiago', city: 'Santiago', country: 'Chile', location: { lat: -33.4489, lng: -70.6693 }, type: 'city', aliases: ['santiago'] },
  { id: 'eze', name: 'Buenos Aires', city: 'Buenos Aires', country: 'Argentina', location: { lat: -34.6037, lng: -58.3816 }, type: 'city', aliases: ['buenos aires'] },

  // Africa
  { id: 'jnb', name: 'Johannesburg', city: 'Johannesburg', country: 'South Africa', location: { lat: -26.2041, lng: 28.0473 }, type: 'city', aliases: ['johannesburg', 'joburg'] },
  { id: 'cpt', name: 'Cape Town', city: 'Cape Town', country: 'South Africa', location: { lat: -33.9249, lng: 18.4241 }, type: 'city', aliases: ['cape town'] },
  { id: 'cai', name: 'Cairo', city: 'Cairo', country: 'Egypt', location: { lat: 30.0444, lng: 31.2357 }, type: 'city', aliases: ['cairo'] },
  { id: 'cmn', name: 'Casablanca', city: 'Casablanca', country: 'Morocco', location: { lat: 33.5731, lng: -7.5898 }, type: 'city', aliases: ['casablanca'] },
  { id: 'rak', name: 'Marrakech', city: 'Marrakech', country: 'Morocco', location: { lat: 31.6295, lng: -7.9811 }, type: 'city', aliases: ['marrakech', 'marrakesh'] },
  { id: 'nbo', name: 'Nairobi', city: 'Nairobi', country: 'Kenya', location: { lat: -1.2921, lng: 36.8219 }, type: 'city', aliases: ['nairobi'] },
  { id: 'mus', name: 'Mauritius', city: 'Port Louis', country: 'Mauritius', location: { lat: -20.1609, lng: 57.5012 }, type: 'city', aliases: ['mauritius'] },
  { id: 'sey', name: 'Seychelles', city: 'Victoria', country: 'Seychelles', location: { lat: -4.6191, lng: 55.4513 }, type: 'city', aliases: ['seychelles'] },
  { id: 'mdv', name: 'Maldives', city: 'Malé', country: 'Maldives', location: { lat: 4.1755, lng: 73.5093 }, type: 'city', aliases: ['maldives', 'male'] },

  // Caribbean
  { id: 'nas', name: 'Nassau', city: 'Nassau', country: 'Bahamas', location: { lat: 25.0443, lng: -77.3504 }, type: 'city', aliases: ['nassau', 'bahamas'] },
  { id: 'mbj', name: 'Montego Bay', city: 'Montego Bay', country: 'Jamaica', location: { lat: 18.4762, lng: -77.8939 }, type: 'city', aliases: ['montego bay', 'jamaica'] },
  { id: 'puj', name: 'Punta Cana', city: 'Punta Cana', country: 'Dominican Republic', location: { lat: 18.5601, lng: -68.3725 }, type: 'city', aliases: ['punta cana'] },
  { id: 'sju', name: 'San Juan', city: 'San Juan', country: 'Puerto Rico', location: { lat: 18.4655, lng: -66.1057 }, type: 'city', aliases: ['san juan', 'puerto rico'] },
  { id: 'aua', name: 'Aruba', city: 'Oranjestad', country: 'Aruba', location: { lat: 12.5092, lng: -70.0086 }, type: 'city', aliases: ['aruba'] },
  { id: 'cur', name: 'Curaçao', city: 'Willemstad', country: 'Curaçao', location: { lat: 12.1696, lng: -68.9900 }, type: 'city', aliases: ['curacao', 'curaçao'] },
  { id: 'stm', name: 'St. Maarten', city: 'Philipsburg', country: 'St. Maarten', location: { lat: 18.0237, lng: -63.0458 }, type: 'city', aliases: ['st maarten', 'saint martin'] },
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
 * Search cities with fuzzy matching
 */
function searchCities(query: string): CitySuggestion[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.length < 2) return [];

  const results: Array<{ city: CitySuggestion; score: number }> = [];

  for (const city of CITY_DATABASE) {
    let score = 0;

    // Exact name match (highest priority)
    if (city.name.toLowerCase() === normalizedQuery) {
      score = 100;
    }
    // City name starts with query
    else if (city.name.toLowerCase().startsWith(normalizedQuery)) {
      score = 80;
    }
    // City field starts with query
    else if (city.city.toLowerCase().startsWith(normalizedQuery)) {
      score = 75;
    }
    // Name contains query
    else if (city.name.toLowerCase().includes(normalizedQuery)) {
      score = 60;
    }
    // City contains query
    else if (city.city.toLowerCase().includes(normalizedQuery)) {
      score = 55;
    }
    // Alias match
    else if (city.aliases?.some(alias => alias.includes(normalizedQuery) || normalizedQuery.includes(alias))) {
      score = 70;
    }
    // ID match (airport/city codes)
    else if (city.id.toLowerCase() === normalizedQuery) {
      score = 90;
    }
    // Country contains query
    else if (city.country.toLowerCase().includes(normalizedQuery)) {
      score = 30;
    }

    if (score > 0) {
      // Boost cities over neighborhoods/landmarks
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
    const [liteApiResults, localResults] = await Promise.all([
      searchLiteApiPlaces(query),
      Promise.resolve(searchCities(query)),
    ]);

    // Merge results with smart deduplication
    const merged = mergeResults(liteApiResults, localResults);

    // Normalize all results for frontend compatibility
    const normalizedMerged = merged.map(normalizeForFrontend);

    const response = {
      success: true,
      data: normalizedMerged,
      meta: {
        count: normalizedMerged.length,
        query,
        sources: {
          liteapi: liteApiResults.length,
          local: localResults.length,
        },
      },
    };

    // Store in cache (30 min TTL)
    await setCache(cacheKey, response, 1800);

    console.log(`✅ Found ${merged.length} suggestions for "${query}" (LiteAPI: ${liteApiResults.length}, Local: ${localResults.length})`);

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
 * Search LiteAPI Places endpoint for global coverage
 */
async function searchLiteApiPlaces(query: string): Promise<CitySuggestion[]> {
  try {
    // Dynamic import to avoid circular dependency
    const { liteAPI } = await import('@/lib/api/liteapi');
    const { data } = await liteAPI.searchPlaces(query);

    if (!data || data.length === 0) return [];

    // Log what we're receiving from LiteAPI
    console.log('📍 LiteAPI places response sample:', JSON.stringify(data.slice(0, 2)));

    // LiteAPI returns: { placeId, displayName, formattedAddress, types: [] }
    // Convert to our format - map displayName to name, extract country from formattedAddress
    return data.map((place: any, index: number) => {
      const name = place.displayName || place.textForSearch || place.cityName || '';
      const addressParts = (place.formattedAddress || '').split(',').map((s: string) => s.trim());
      const country = addressParts[addressParts.length - 1] || place.countryName || '';
      const city = addressParts[0] || name;

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
        type: mapPlaceType(place.types?.[0] || place.type || 'city'),
        placeId: place.placeId,
      };
    }).filter((p: any) => p.name) as CitySuggestion[];
  } catch (error) {
    console.error('LiteAPI places search failed:', error);
    return [];
  }
}

/**
 * Map LiteAPI place types to our types
 */
function mapPlaceType(type: string): 'city' | 'landmark' | 'airport' | 'neighborhood' {
  const lowerType = (type || '').toLowerCase();
  if (lowerType.includes('city') || lowerType.includes('town')) return 'city';
  if (lowerType.includes('airport')) return 'airport';
  if (lowerType.includes('neighborhood') || lowerType.includes('district')) return 'neighborhood';
  if (lowerType.includes('landmark') || lowerType.includes('poi')) return 'landmark';
  return 'city';
}

/**
 * Merge results from multiple sources with deduplication
 */
function mergeResults(liteApiResults: CitySuggestion[], localResults: CitySuggestion[]): CitySuggestion[] {
  const seen = new Set<string>();
  const merged: CitySuggestion[] = [];

  // Helper to create a unique key for deduplication
  const getKey = (item: CitySuggestion) => {
    return `${item.name.toLowerCase()}-${item.city.toLowerCase()}-${item.country.toLowerCase()}`.replace(/\s+/g, '');
  };

  // Add local results first (they have verified coordinates)
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

  // Sort: cities first, then by name length (shorter = more relevant)
  merged.sort((a, b) => {
    // Prioritize cities over other types
    if (a.type === 'city' && b.type !== 'city') return -1;
    if (b.type === 'city' && a.type !== 'city') return 1;

    // Then sort by name length (shorter names usually more relevant)
    return a.name.length - b.name.length;
  });

  return merged.slice(0, 15);
}
