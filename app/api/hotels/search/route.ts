import { NextRequest, NextResponse } from 'next/server';
import { liteAPI } from '@/lib/api/liteapi'; // ✅ Updated with amenities support
import { searchHotels as searchHotelbeds, normalizeHotelbedsHotel } from '@/lib/api/hotelbeds';
import { amadeus } from '@/lib/api/amadeus'; // ✅ Amadeus fallback
import { mapAmadeusHotelToHotel, extractCityCode } from '@/lib/mappers/amadeus-hotel-mapper';
import { getCached, setCache, generateCacheKey } from '@/lib/cache';
import type { HotelSearchParams, Hotel } from '@/lib/hotels/types';

// Cost protection - blocks bots and suspicious requests BEFORE expensive API calls
import { checkCostGuard, COST_GUARDS } from '@/lib/security/cost-protection';

// Error monitoring - sends alerts for all errors
import { handleApiError } from '@/lib/monitoring/global-error-handler';

// Global cities database - 500+ worldwide destinations with coordinates
import { GLOBAL_CITIES } from '@/lib/data/global-cities-database';

// Comprehensive city name to coordinates mapping
// Matches the suggestions API database for consistent location lookups
const CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  // United States - Major Cities
  'new york': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'new york city': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'nyc': { lat: 40.7128, lng: -74.0060, country: 'US' },
  'manhattan': { lat: 40.7831, lng: -73.9712, country: 'US' },
  'brooklyn': { lat: 40.6782, lng: -73.9442, country: 'US' },
  'times square': { lat: 40.7580, lng: -73.9855, country: 'US' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'US' },
  'la': { lat: 34.0522, lng: -118.2437, country: 'US' },
  'hollywood': { lat: 34.0928, lng: -118.3287, country: 'US' },
  'santa monica': { lat: 34.0195, lng: -118.4912, country: 'US' },
  'beverly hills': { lat: 34.0736, lng: -118.4004, country: 'US' },
  'miami': { lat: 25.7617, lng: -80.1918, country: 'US' },
  'south beach': { lat: 25.7907, lng: -80.1300, country: 'US' },
  'chicago': { lat: 41.8781, lng: -87.6298, country: 'US' },
  'san francisco': { lat: 37.7749, lng: -122.4194, country: 'US' },
  'sf': { lat: 37.7749, lng: -122.4194, country: 'US' },
  'las vegas': { lat: 36.1699, lng: -115.1398, country: 'US' },
  'vegas': { lat: 36.1699, lng: -115.1398, country: 'US' },
  'seattle': { lat: 47.6062, lng: -122.3321, country: 'US' },
  'boston': { lat: 42.3601, lng: -71.0589, country: 'US' },
  'denver': { lat: 39.7392, lng: -104.9903, country: 'US' },
  'atlanta': { lat: 33.7490, lng: -84.3880, country: 'US' },
  'orlando': { lat: 28.5383, lng: -81.3792, country: 'US' },
  'houston': { lat: 29.7604, lng: -95.3698, country: 'US' },
  'dallas': { lat: 32.7767, lng: -96.7970, country: 'US' },
  'phoenix': { lat: 33.4484, lng: -112.0740, country: 'US' },
  'san diego': { lat: 32.7157, lng: -117.1611, country: 'US' },
  'washington': { lat: 38.9072, lng: -77.0369, country: 'US' },
  'washington dc': { lat: 38.9072, lng: -77.0369, country: 'US' },
  'dc': { lat: 38.9072, lng: -77.0369, country: 'US' },
  'nashville': { lat: 36.1627, lng: -86.7816, country: 'US' },
  'austin': { lat: 30.2672, lng: -97.7431, country: 'US' },
  'new orleans': { lat: 29.9511, lng: -90.0715, country: 'US' },
  'nola': { lat: 29.9511, lng: -90.0715, country: 'US' },
  'minneapolis': { lat: 44.9778, lng: -93.2650, country: 'US' },
  'portland': { lat: 45.5152, lng: -122.6784, country: 'US' },
  'philadelphia': { lat: 39.9526, lng: -75.1652, country: 'US' },
  'philly': { lat: 39.9526, lng: -75.1652, country: 'US' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, country: 'US' },
  'honolulu': { lat: 21.3069, lng: -157.8583, country: 'US' },
  'hawaii': { lat: 21.3069, lng: -157.8583, country: 'US' },
  'waikiki': { lat: 21.2793, lng: -157.8292, country: 'US' },

  // Europe
  'london': { lat: 51.5074, lng: -0.1278, country: 'GB' },
  'westminster': { lat: 51.4975, lng: -0.1357, country: 'GB' },
  'paris': { lat: 48.8566, lng: 2.3522, country: 'FR' },
  'rome': { lat: 41.9028, lng: 12.4964, country: 'IT' },
  'roma': { lat: 41.9028, lng: 12.4964, country: 'IT' },
  'barcelona': { lat: 41.3851, lng: 2.1734, country: 'ES' },
  'madrid': { lat: 40.4168, lng: -3.7038, country: 'ES' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, country: 'NL' },
  'berlin': { lat: 52.5200, lng: 13.4050, country: 'DE' },
  'munich': { lat: 48.1351, lng: 11.5820, country: 'DE' },
  'münchen': { lat: 48.1351, lng: 11.5820, country: 'DE' },
  'vienna': { lat: 48.2082, lng: 16.3738, country: 'AT' },
  'wien': { lat: 48.2082, lng: 16.3738, country: 'AT' },
  'prague': { lat: 50.0755, lng: 14.4378, country: 'CZ' },
  'praha': { lat: 50.0755, lng: 14.4378, country: 'CZ' },
  'lisbon': { lat: 38.7223, lng: -9.1393, country: 'PT' },
  'lisboa': { lat: 38.7223, lng: -9.1393, country: 'PT' },
  'dublin': { lat: 53.3498, lng: -6.2603, country: 'IE' },
  'edinburgh': { lat: 55.9533, lng: -3.1883, country: 'GB' },
  'milan': { lat: 45.4642, lng: 9.1900, country: 'IT' },
  'milano': { lat: 45.4642, lng: 9.1900, country: 'IT' },
  'florence': { lat: 43.7696, lng: 11.2558, country: 'IT' },
  'firenze': { lat: 43.7696, lng: 11.2558, country: 'IT' },
  'venice': { lat: 45.4408, lng: 12.3155, country: 'IT' },
  'venezia': { lat: 45.4408, lng: 12.3155, country: 'IT' },
  'athens': { lat: 37.9838, lng: 23.7275, country: 'GR' },
  'santorini': { lat: 36.3932, lng: 25.4615, country: 'GR' },
  'brussels': { lat: 50.8503, lng: 4.3517, country: 'BE' },
  'zurich': { lat: 47.3769, lng: 8.5417, country: 'CH' },
  'zürich': { lat: 47.3769, lng: 8.5417, country: 'CH' },
  'geneva': { lat: 46.2044, lng: 6.1432, country: 'CH' },
  'copenhagen': { lat: 55.6761, lng: 12.5683, country: 'DK' },
  'stockholm': { lat: 59.3293, lng: 18.0686, country: 'SE' },
  'oslo': { lat: 59.9139, lng: 10.7522, country: 'NO' },
  'helsinki': { lat: 60.1699, lng: 24.9384, country: 'FI' },
  'istanbul': { lat: 41.0082, lng: 28.9784, country: 'TR' },
  'budapest': { lat: 47.4979, lng: 19.0402, country: 'HU' },
  'warsaw': { lat: 52.2297, lng: 21.0122, country: 'PL' },
  'warszawa': { lat: 52.2297, lng: 21.0122, country: 'PL' },
  'krakow': { lat: 50.0647, lng: 19.9450, country: 'PL' },
  'kraków': { lat: 50.0647, lng: 19.9450, country: 'PL' },
  'moscow': { lat: 55.7558, lng: 37.6173, country: 'RU' },

  // Asia
  'tokyo': { lat: 35.6762, lng: 139.6503, country: 'JP' },
  'shibuya': { lat: 35.6580, lng: 139.7016, country: 'JP' },
  'shinjuku': { lat: 35.6938, lng: 139.7034, country: 'JP' },
  'osaka': { lat: 34.6937, lng: 135.5023, country: 'JP' },
  'kyoto': { lat: 35.0116, lng: 135.7681, country: 'JP' },
  'singapore': { lat: 1.3521, lng: 103.8198, country: 'SG' },
  'marina bay': { lat: 1.2834, lng: 103.8607, country: 'SG' },
  'hong kong': { lat: 22.3193, lng: 114.1694, country: 'HK' },
  'hk': { lat: 22.3193, lng: 114.1694, country: 'HK' },
  'bangkok': { lat: 13.7563, lng: 100.5018, country: 'TH' },
  'phuket': { lat: 7.9519, lng: 98.3381, country: 'TH' },
  'bali': { lat: -8.3405, lng: 115.0920, country: 'ID' },
  'denpasar': { lat: -8.3405, lng: 115.0920, country: 'ID' },
  'ubud': { lat: -8.5069, lng: 115.2625, country: 'ID' },
  'seminyak': { lat: -8.6913, lng: 115.1681, country: 'ID' },
  'kuala lumpur': { lat: 3.1390, lng: 101.6869, country: 'MY' },
  'kl': { lat: 3.1390, lng: 101.6869, country: 'MY' },
  'manila': { lat: 14.5995, lng: 120.9842, country: 'PH' },
  'ho chi minh city': { lat: 10.8231, lng: 106.6297, country: 'VN' },
  'ho chi minh': { lat: 10.8231, lng: 106.6297, country: 'VN' },
  'saigon': { lat: 10.8231, lng: 106.6297, country: 'VN' },
  'hanoi': { lat: 21.0285, lng: 105.8542, country: 'VN' },
  'seoul': { lat: 37.5665, lng: 126.9780, country: 'KR' },
  'beijing': { lat: 39.9042, lng: 116.4074, country: 'CN' },
  'peking': { lat: 39.9042, lng: 116.4074, country: 'CN' },
  'shanghai': { lat: 31.2304, lng: 121.4737, country: 'CN' },
  'new delhi': { lat: 28.6139, lng: 77.2090, country: 'IN' },
  'delhi': { lat: 28.6139, lng: 77.2090, country: 'IN' },
  'mumbai': { lat: 19.0760, lng: 72.8777, country: 'IN' },
  'bombay': { lat: 19.0760, lng: 72.8777, country: 'IN' },
  'goa': { lat: 15.2993, lng: 74.1240, country: 'IN' },

  // Middle East
  'dubai': { lat: 25.2048, lng: 55.2708, country: 'AE' },
  'abu dhabi': { lat: 24.4539, lng: 54.3773, country: 'AE' },
  'doha': { lat: 25.2854, lng: 51.5310, country: 'QA' },
  'tel aviv': { lat: 32.0853, lng: 34.7818, country: 'IL' },

  // Oceania
  'sydney': { lat: -33.8688, lng: 151.2093, country: 'AU' },
  'bondi beach': { lat: -33.8914, lng: 151.2767, country: 'AU' },
  'melbourne': { lat: -37.8136, lng: 144.9631, country: 'AU' },
  'brisbane': { lat: -27.4698, lng: 153.0251, country: 'AU' },
  'perth': { lat: -31.9505, lng: 115.8605, country: 'AU' },
  'gold coast': { lat: -28.0167, lng: 153.4000, country: 'AU' },
  'auckland': { lat: -36.8509, lng: 174.7645, country: 'NZ' },
  'queenstown': { lat: -45.0312, lng: 168.6626, country: 'NZ' },

  // Americas (Canada, Mexico, South America)
  'toronto': { lat: 43.6532, lng: -79.3832, country: 'CA' },
  'vancouver': { lat: 49.2827, lng: -123.1207, country: 'CA' },
  'montreal': { lat: 45.5017, lng: -73.5673, country: 'CA' },
  'cancun': { lat: 21.1619, lng: -86.8515, country: 'MX' },
  'cancún': { lat: 21.1619, lng: -86.8515, country: 'MX' },
  'mexico city': { lat: 19.4326, lng: -99.1332, country: 'MX' },
  'cdmx': { lat: 19.4326, lng: -99.1332, country: 'MX' },
  'puerto vallarta': { lat: 20.6534, lng: -105.2253, country: 'MX' },
  'los cabos': { lat: 22.8905, lng: -109.9167, country: 'MX' },
  'cabo': { lat: 22.8905, lng: -109.9167, country: 'MX' },
  'cabo san lucas': { lat: 22.8905, lng: -109.9167, country: 'MX' },
  // South America - Brazil (All State Capitals + Major Cities)
  'são paulo': { lat: -23.5505, lng: -46.6333, country: 'BR' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, country: 'BR' },
  'sp': { lat: -23.5505, lng: -46.6333, country: 'BR' },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, country: 'BR' },
  'rio': { lat: -22.9068, lng: -43.1729, country: 'BR' },
  'copacabana': { lat: -22.9711, lng: -43.1822, country: 'BR' },
  'ipanema': { lat: -22.9838, lng: -43.2047, country: 'BR' },
  'brasilia': { lat: -15.7975, lng: -47.8919, country: 'BR' },
  'brasília': { lat: -15.7975, lng: -47.8919, country: 'BR' },
  'bsb': { lat: -15.7975, lng: -47.8919, country: 'BR' },
  // Brazilian State Capitals
  'salvador': { lat: -12.9777, lng: -38.5016, country: 'BR' },
  'fortaleza': { lat: -3.7172, lng: -38.5433, country: 'BR' },
  'belo horizonte': { lat: -19.9167, lng: -43.9345, country: 'BR' },
  'bh': { lat: -19.9167, lng: -43.9345, country: 'BR' },
  'manaus': { lat: -3.1190, lng: -60.0217, country: 'BR' },
  'curitiba': { lat: -25.4290, lng: -49.2671, country: 'BR' },
  'recife': { lat: -8.0476, lng: -34.8770, country: 'BR' },
  'porto alegre': { lat: -30.0346, lng: -51.2177, country: 'BR' },
  'poa': { lat: -30.0346, lng: -51.2177, country: 'BR' },
  'belém': { lat: -1.4558, lng: -48.4902, country: 'BR' },
  'belem': { lat: -1.4558, lng: -48.4902, country: 'BR' },
  'goiânia': { lat: -16.6869, lng: -49.2648, country: 'BR' },
  'goiania': { lat: -16.6869, lng: -49.2648, country: 'BR' },
  'guarulhos': { lat: -23.4538, lng: -46.5333, country: 'BR' },
  'campinas': { lat: -22.9056, lng: -47.0608, country: 'BR' },
  'são luís': { lat: -2.5297, lng: -44.3028, country: 'BR' },
  'sao luis': { lat: -2.5297, lng: -44.3028, country: 'BR' },
  'maceió': { lat: -9.6658, lng: -35.7350, country: 'BR' },
  'maceio': { lat: -9.6658, lng: -35.7350, country: 'BR' },
  'natal': { lat: -5.7945, lng: -35.2110, country: 'BR' },
  'teresina': { lat: -5.0892, lng: -42.8019, country: 'BR' },
  'campo grande': { lat: -20.4697, lng: -54.6201, country: 'BR' },
  'joão pessoa': { lat: -7.1195, lng: -34.8450, country: 'BR' },
  'joao pessoa': { lat: -7.1195, lng: -34.8450, country: 'BR' },
  'cuiabá': { lat: -15.6014, lng: -56.0979, country: 'BR' },
  'cuiaba': { lat: -15.6014, lng: -56.0979, country: 'BR' },
  'aracaju': { lat: -10.9472, lng: -37.0731, country: 'BR' },
  'florianópolis': { lat: -27.5954, lng: -48.5480, country: 'BR' },
  'florianopolis': { lat: -27.5954, lng: -48.5480, country: 'BR' },
  'floripa': { lat: -27.5954, lng: -48.5480, country: 'BR' },
  'vitória': { lat: -20.3155, lng: -40.3128, country: 'BR' },
  'vitoria': { lat: -20.3155, lng: -40.3128, country: 'BR' },
  'porto velho': { lat: -8.7612, lng: -63.8999, country: 'BR' },
  'macapá': { lat: 0.0349, lng: -51.0694, country: 'BR' },
  'macapa': { lat: 0.0349, lng: -51.0694, country: 'BR' },
  'boa vista': { lat: 2.8235, lng: -60.6758, country: 'BR' },
  'rio branco': { lat: -9.9754, lng: -67.8249, country: 'BR' },
  'palmas': { lat: -10.2491, lng: -48.3243, country: 'BR' },
  // Brazilian Tourist Destinations
  'foz do iguaçu': { lat: -25.5478, lng: -54.5882, country: 'BR' },
  'foz do iguacu': { lat: -25.5478, lng: -54.5882, country: 'BR' },
  'búzios': { lat: -22.7469, lng: -41.8817, country: 'BR' },
  'buzios': { lat: -22.7469, lng: -41.8817, country: 'BR' },
  'paraty': { lat: -23.2178, lng: -44.7131, country: 'BR' },
  'angra dos reis': { lat: -23.0067, lng: -44.3181, country: 'BR' },
  'gramado': { lat: -29.3788, lng: -50.8766, country: 'BR' },
  'fernando de noronha': { lat: -3.8549, lng: -32.4238, country: 'BR' },
  'noronha': { lat: -3.8549, lng: -32.4238, country: 'BR' },
  'jericoacoara': { lat: -2.7928, lng: -40.5141, country: 'BR' },
  'jeri': { lat: -2.7928, lng: -40.5141, country: 'BR' },
  'porto seguro': { lat: -16.4435, lng: -39.0643, country: 'BR' },
  'ouro preto': { lat: -20.3855, lng: -43.5034, country: 'BR' },
  'tiradentes': { lat: -21.1097, lng: -44.1706, country: 'BR' },
  'bonito': { lat: -21.1261, lng: -56.4836, country: 'BR' },
  'lençóis': { lat: -12.5622, lng: -41.3931, country: 'BR' },
  'lencois': { lat: -12.5622, lng: -41.3931, country: 'BR' },
  'chapada diamantina': { lat: -12.5622, lng: -41.3931, country: 'BR' },
  'morro de são paulo': { lat: -13.3864, lng: -38.9136, country: 'BR' },
  'morro de sao paulo': { lat: -13.3864, lng: -38.9136, country: 'BR' },
  'trancoso': { lat: -16.5903, lng: -39.0947, country: 'BR' },
  'arraial d ajuda': { lat: -16.4828, lng: -39.0756, country: 'BR' },
  'praia do forte': { lat: -12.5769, lng: -38.0028, country: 'BR' },
  'ilhabela': { lat: -23.7781, lng: -45.3581, country: 'BR' },
  'ubatuba': { lat: -23.4336, lng: -45.0711, country: 'BR' },
  'santos': { lat: -23.9608, lng: -46.3336, country: 'BR' },
  'guarujá': { lat: -23.9931, lng: -46.2564, country: 'BR' },
  'guaruja': { lat: -23.9931, lng: -46.2564, country: 'BR' },
  'balneário camboriú': { lat: -26.9906, lng: -48.6352, country: 'BR' },
  'balneario camboriu': { lat: -26.9906, lng: -48.6352, country: 'BR' },
  'bc': { lat: -26.9906, lng: -48.6352, country: 'BR' },
  // Goiás State (user mentioned Planaltina)
  'planaltina': { lat: -15.4528, lng: -47.6139, country: 'BR' },
  'anápolis': { lat: -16.3281, lng: -48.9531, country: 'BR' },
  'anapolis': { lat: -16.3281, lng: -48.9531, country: 'BR' },
  'aparecida de goiânia': { lat: -16.8231, lng: -49.2456, country: 'BR' },
  'aparecida de goiania': { lat: -16.8231, lng: -49.2456, country: 'BR' },
  'caldas novas': { lat: -17.7439, lng: -48.6253, country: 'BR' },
  'rio quente': { lat: -17.7728, lng: -48.7556, country: 'BR' },
  'pirenópolis': { lat: -15.8511, lng: -48.9581, country: 'BR' },
  'pirenopolis': { lat: -15.8511, lng: -48.9581, country: 'BR' },
  // Other South American Countries
  'bogotá': { lat: 4.7110, lng: -74.0721, country: 'CO' },
  'bogota': { lat: 4.7110, lng: -74.0721, country: 'CO' },
  'cartagena': { lat: 10.3910, lng: -75.4794, country: 'CO' },
  'lima': { lat: -12.0464, lng: -77.0428, country: 'PE' },
  'cusco': { lat: -13.5320, lng: -71.9675, country: 'PE' },
  'cuzco': { lat: -13.5320, lng: -71.9675, country: 'PE' },
  'machu picchu': { lat: -13.5320, lng: -71.9675, country: 'PE' },
  'santiago': { lat: -33.4489, lng: -70.6693, country: 'CL' },
  'buenos aires': { lat: -34.6037, lng: -58.3816, country: 'AR' },

  // Africa
  'johannesburg': { lat: -26.2041, lng: 28.0473, country: 'ZA' },
  'joburg': { lat: -26.2041, lng: 28.0473, country: 'ZA' },
  'cape town': { lat: -33.9249, lng: 18.4241, country: 'ZA' },
  'cairo': { lat: 30.0444, lng: 31.2357, country: 'EG' },
  'casablanca': { lat: 33.5731, lng: -7.5898, country: 'MA' },
  'marrakech': { lat: 31.6295, lng: -7.9811, country: 'MA' },
  'marrakesh': { lat: 31.6295, lng: -7.9811, country: 'MA' },
  'nairobi': { lat: -1.2921, lng: 36.8219, country: 'KE' },
  'mauritius': { lat: -20.1609, lng: 57.5012, country: 'MU' },
  'seychelles': { lat: -4.6191, lng: 55.4513, country: 'SC' },
  'maldives': { lat: 4.1755, lng: 73.5093, country: 'MV' },

  // Caribbean
  'nassau': { lat: 25.0443, lng: -77.3504, country: 'BS' },
  'bahamas': { lat: 25.0443, lng: -77.3504, country: 'BS' },
  'montego bay': { lat: 18.4762, lng: -77.8939, country: 'JM' },
  'jamaica': { lat: 18.4762, lng: -77.8939, country: 'JM' },
  'punta cana': { lat: 18.5601, lng: -68.3725, country: 'DO' },
  'san juan': { lat: 18.4655, lng: -66.1057, country: 'PR' },
  'puerto rico': { lat: 18.4655, lng: -66.1057, country: 'PR' },
  'aruba': { lat: 12.5092, lng: -70.0086, country: 'AW' },
  'curaçao': { lat: 12.1696, lng: -68.9900, country: 'CW' },
  'curacao': { lat: 12.1696, lng: -68.9900, country: 'CW' },
  'st maarten': { lat: 18.0237, lng: -63.0458, country: 'SX' },
  'saint martin': { lat: 18.0237, lng: -63.0458, country: 'SX' },
};

/**
 * Get coordinates from city query
 */
function getCityCoordinates(query: string): { lat: number; lng: number; country: string } | null {
  const normalized = query.toLowerCase().trim();

  // 1. Direct match in CITY_COORDINATES (fastest)
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }

  // 2. Partial match in CITY_COORDINATES
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }

  // 3. Search in GLOBAL_CITIES database (500+ worldwide destinations)
  const globalMatch = GLOBAL_CITIES.find(city => {
    const cityName = city.name.toLowerCase();
    const cityId = city.id.toLowerCase();
    const cityCity = city.city.toLowerCase();

    // Direct match
    if (cityName === normalized || cityId === normalized || cityCity === normalized) {
      return true;
    }

    // Alias match
    if (city.aliases?.some(alias => alias.toLowerCase() === normalized)) {
      return true;
    }

    // Partial match (for multi-word cities)
    if (normalized.length >= 4) {
      if (cityName.includes(normalized) || normalized.includes(cityName) ||
          cityCity.includes(normalized) || normalized.includes(cityCity)) {
        return true;
      }
    }

    return false;
  });

  if (globalMatch) {
    console.log(`✅ Found "${query}" in GLOBAL_CITIES: ${globalMatch.name}, ${globalMatch.country}`);
    return {
      lat: globalMatch.location.lat,
      lng: globalMatch.location.lng,
      country: globalMatch.countryCode,
    };
  }

  return null;
}

/**
 * Geocode unknown cities using OpenStreetMap Nominatim API (free)
 * Fallback for cities not in our database
 */
async function geocodeCity(query: string): Promise<{ lat: number; lng: number; country: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Fly2Any Travel Platform (contact@fly2any.com)' },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    const result = data[0];
    const countryCode = result.address?.country_code?.toUpperCase() || 'XX';

    console.log(`🌍 Geocoded "${query}" via Nominatim: ${result.display_name} (${result.lat}, ${result.lon})`);

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      country: countryCode,
    };
  } catch (error: any) {
    console.warn(`⚠️ Nominatim geocoding failed for "${query}":`, error.message);
    return null;
  }
}

/**
 * Hotel Search API Route
 *
 * POST /api/hotels/search
 *
 * Search for hotels using LiteAPI (primary).
 * Supports both coordinate-based and query-based location search.
 *
 * Features:
 * - Location search (coordinates or city name)
 * - Date range filtering
 * - Guest count (adults + children)
 * - Price range filtering
 * - Response caching (15 minutes)
 *
 * Revenue: Commission-based (~$30-50 per booking)
 */
export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    // 🛡️ COST PROTECTION: Block bots and suspicious requests BEFORE expensive API calls
    const costGuard = await checkCostGuard(request, COST_GUARDS.HOTEL_SEARCH);
    if (!costGuard.allowed && costGuard.response) {
      return costGuard.response;
    }

    const body = await request.json().catch(() => ({}));

    // Validate required parameters
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body is empty',
          hint: 'Please provide location, checkIn, checkOut, and guests parameters'
        },
        { status: 400 }
      );
    }

    if (!body.location) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: location',
          hint: 'Provide either { lat, lng } coordinates or { query: "city name" }'
        },
        { status: 400 }
      );
    }

    if (!body.checkIn || !body.checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: checkIn and/or checkOut',
          hint: 'Provide dates in YYYY-MM-DD format'
        },
        { status: 400 }
      );
    }

    if (!body.guests?.adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: guests.adults',
          hint: 'Provide { guests: { adults: number } }'
        },
        { status: 400 }
      );
    }

    // ✅ CRITICAL: Past date validation - APIs return 0 results for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const checkInDate = new Date(body.checkIn);
    const checkOutDate = new Date(body.checkOut);

    if (checkInDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in date cannot be in the past',
          hint: `Check-in date ${body.checkIn} is before today (${today.toISOString().split('T')[0]}). Please select a future date.`,
          code: 'INVALID_CHECKIN_DATE',
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-out date must be after check-in date',
          hint: `Check-out ${body.checkOut} must be at least 1 day after check-in ${body.checkIn}.`,
          code: 'INVALID_CHECKOUT_DATE',
        },
        { status: 400 }
      );
    }

    // Build search parameters
    const searchParams: HotelSearchParams = {
      location: body.location,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: {
        adults: body.guests.adults,
        children: body.guests.children || [],
      },
      radius: body.radius || 50, // 50km default for better city coverage (major cities like Rio, NYC need wider radius)
      limit: body.limit || 100, // 100 hotels for more options
      currency: body.currency || 'USD',
    };

    // Add optional filters
    if (body.minRating !== undefined) searchParams.minRating = body.minRating;
    if (body.maxRating !== undefined) searchParams.maxRating = body.maxRating;
    if (body.minPrice !== undefined) searchParams.minPrice = body.minPrice;
    if (body.maxPrice !== undefined) searchParams.maxPrice = body.maxPrice;

    // Generate cache key (v2: fixed coordinate validation)
    const cacheKey = generateCacheKey('hotels:liteapi:search:v2', searchParams);

    // Try to get from cache (15 minutes TTL)
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached hotel search results (Multi-API)');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-API-Sources': 'LITEAPI,HOTELBEDS',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    // Determine location coordinates
    let latitude: number | undefined;
    let longitude: number | undefined;
    let countryCode: string | undefined;

    const location = searchParams.location as { lat?: number; lng?: number; query?: string };
    if (location.lat !== undefined && location.lng !== undefined) {
      latitude = location.lat;
      longitude = location.lng;
    } else if (location.query) {
      // 1. Try local database first (fast)
      const cityCoords = getCityCoordinates(location.query);
      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lng;
        countryCode = cityCoords.country;
      } else {
        // 2. Fallback to Nominatim geocoding for unknown cities (worldwide coverage)
        const geocoded = await geocodeCity(location.query);
        if (geocoded) {
          latitude = geocoded.lat;
          longitude = geocoded.lng;
          countryCode = geocoded.country;
        }
      }
    }

    if (!latitude || !longitude) {
      // CRITICAL: Do NOT default to any location - return error instead
      // This prevents showing wrong city's hotels (e.g., NYC hotels in Brasilia search)
      const locationQuery = (searchParams.location as any)?.query || (searchParams.location as any)?.name || 'unknown';
      console.error(`❌ Could not determine coordinates for location: "${locationQuery}"`);
      return NextResponse.json({
        success: false,
        error: 'LOCATION_NOT_FOUND',
        message: `Could not find coordinates for "${locationQuery}". Please try a different city name.`,
        hint: 'Try using a major city name like "Rio de Janeiro" or "São Paulo"',
      }, { status: 400 });
    }

    console.log('🔍 Searching hotels (FAST mode)...', { latitude, longitude, countryCode });

    // PERFORMANCE OPTIMIZED: Single API search in production
    const roomCount = body.rooms || 1;
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

    console.log(`🏨 [SEARCH] ${searchParams.guests?.adults || 2} adults, ${Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0} children, ${roomCount} rooms`);

    // LiteAPI Search (Primary - FAST with parallel batching)
    const liteAPIResults = await liteAPI.searchHotelsWithMinRates({
      latitude,
      longitude,
      checkinDate: searchParams.checkIn!,
      checkoutDate: searchParams.checkOut!,
      adults: searchParams.guests?.adults || 2,
      children: Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0,
      rooms: roomCount,
      currency: searchParams.currency || 'USD',
      guestNationality: 'US',
      radius: searchParams.radius || 50, // CRITICAL: Pass radius for proper city coverage (in km)
      limit: searchParams.limit || 100, // Increased for better coverage
    }).catch(err => {
      console.error('⚠️ LiteAPI search failed:', err.message);
      return { hotels: [], meta: { usedMinRates: true, error: err.message } };
    });

    // Amadeus - ALWAYS search to provide more hotel options (not just fallback)
    let amadeusResults = { hotels: [] as any[] };
    // Try multiple location fields: query, name, city
    const locationQuery = (searchParams.location as any)?.query
      || (searchParams.location as any)?.name
      || (searchParams.location as any)?.city
      || '';

    console.log(`🔍 Location data for Amadeus:`, { locationQuery, location: searchParams.location });

    if (locationQuery) {
      try {
        const cityCode = extractCityCode(locationQuery);
        console.log(`🔍 Amadeus search: "${locationQuery}" → city code: ${cityCode}`);

        const amadeusData = await amadeus.searchHotels({
          cityCode,
          checkInDate: searchParams.checkIn!,
          checkOutDate: searchParams.checkOut!,
          adults: searchParams.guests?.adults || 2,
          roomQuantity: roomCount,
        });

        if (amadeusData?.data?.length > 0) {
          amadeusResults.hotels = amadeusData.data.map((offer: any) => {
            const mapped = mapAmadeusHotelToHotel(offer);
            // Convert to normalized format matching other sources
            return {
              id: `amadeus_${mapped.id}`,
              name: mapped.name,
              description: mapped.description || '',
              latitude: mapped.location?.lat || latitude,
              longitude: mapped.location?.lng || longitude,
              address: mapped.address?.street || '',
              city: mapped.address?.city || '',
              country: mapped.address?.country || '',
              stars: mapped.starRating || 4,
              rating: mapped.starRating || 4,
              reviewCount: 0,
              images: mapped.images?.map(img => ({ url: img.url, alt: mapped.name })) || [],
              image: mapped.images?.[0]?.url || null,
              thumbnail: mapped.images?.[0]?.url || null,
              amenities: mapped.amenities || [],
              lowestPrice: mapped.rates?.[0] ? parseFloat(mapped.rates[0].totalPrice.amount) : 0,
              lowestPricePerNight: mapped.rates?.[0] ? parseFloat(mapped.rates[0].totalPrice.amount) / Math.max(1, Math.ceil((new Date(searchParams.checkOut!).getTime() - new Date(searchParams.checkIn!).getTime()) / (1000*60*60*24))) : 0,
              currency: mapped.rates?.[0]?.totalPrice.currency || 'USD',
              rooms: mapped.rates?.map(rate => ({
                rateId: rate.id,
                name: rate.roomType,
                price: parseFloat(rate.totalPrice.amount),
                currency: rate.totalPrice.currency,
                refundable: rate.refundable,
                boardName: rate.mealsIncluded || 'Room Only',
              })) || [],
              source: 'Amadeus',
              refundable: mapped.rates?.some(r => r.refundable) || false,
            };
          });
          console.log(`✅ Amadeus returned ${amadeusResults.hotels.length} additional hotels`);
        }
      } catch (amErr: any) {
        console.log(`⚠️ Amadeus hotel search failed: ${amErr.message}`);
        // Log detailed error for debugging
        if (amErr.response?.data?.errors) {
          console.log(`   Amadeus API errors:`, JSON.stringify(amErr.response.data.errors, null, 2));
        }
      }
    } else {
      console.log(`⚠️ Amadeus search skipped - no location query provided`);
    }

    // Hotelbeds only in development (skip entirely in production for speed)
    let hotelbedsResults = { hotels: [] as any[], processTime: 0 };

    if (!isProduction && process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_SECRET) {
      try {
        const paxes = [];
        const adults = searchParams.guests?.adults || 2;
        for (let i = 0; i < adults; i++) {
          paxes.push({ type: 'AD' as const, age: 30 });
        }
        const childrenCount = Array.isArray(searchParams.guests?.children) ? searchParams.guests.children.length : 0;
        for (let i = 0; i < childrenCount; i++) {
          paxes.push({ type: 'CH' as const, age: 10 });
        }

        const hotelbedsData = await searchHotelbeds({
          stay: { checkIn: searchParams.checkIn!, checkOut: searchParams.checkOut! },
          occupancies: [{ rooms: 1, adults, children: childrenCount, paxes }],
          geolocation: { latitude, longitude, radius: searchParams.radius || 20, unit: 'km' },
          language: 'ENG',
        });

        hotelbedsResults = {
          hotels: (hotelbedsData.hotels?.hotels || []).map(hotel =>
            normalizeHotelbedsHotel(hotel, searchParams.checkIn!, searchParams.checkOut!)
          ),
          processTime: hotelbedsData.auditData?.processTime || 0,
        };
      } catch (err: any) {
        console.error('⚠️ Hotelbeds search failed:', err.message);
      }
    }

    // Combine results from all APIs (LiteAPI + Amadeus + Hotelbeds)
    const allHotels = [...(liteAPIResults.hotels || []), ...(amadeusResults.hotels || []), ...(hotelbedsResults.hotels || [])];

    console.log(`✅ Multi-API Results: LiteAPI (${liteAPIResults.hotels?.length || 0}) + Amadeus (${amadeusResults.hotels?.length || 0}) + Hotelbeds (${hotelbedsResults.hotels?.length || 0}) = ${allHotels.length} total`);

    // Deduplicate hotels by name + approximate location (within 100m radius)
    const deduplicatedHotels: Hotel[] = [];
    const seenHotels = new Map<string, Hotel>();

    for (const hotel of allHotels) {
      const key = `${hotel.name.toLowerCase().trim()}:${Math.floor(hotel.latitude * 1000)}:${Math.floor(hotel.longitude * 1000)}`;

      if (!seenHotels.has(key)) {
        seenHotels.set(key, hotel);
        deduplicatedHotels.push(hotel);
      } else {
        // If duplicate, keep the one with better price
        const existing = seenHotels.get(key);
        if (existing) {
          const existingPrice = existing.lowestPricePerNight || existing.lowestPrice || Infinity;
          const newPrice = hotel.lowestPricePerNight || hotel.lowestPrice || Infinity;

          if (newPrice < existingPrice) {
            const index = deduplicatedHotels.indexOf(existing);
            if (index > -1) {
              deduplicatedHotels[index] = hotel;
              seenHotels.set(key, hotel);
            }
          }
        }
      }
    }

    console.log(`🔄 Deduplication: ${allHotels.length} → ${deduplicatedHotels.length} unique hotels`);

    // 🚨 ALERT: Zero results monitoring
    if (deduplicatedHotels.length === 0) {
      const alertData = {
        timestamp: new Date().toISOString(),
        location: searchParams.location,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        latitude,
        longitude,
        liteAPICount: liteAPIResults.hotels?.length || 0,
        amadeusCount: amadeusResults.hotels?.length || 0,
        hotelbedsCount: hotelbedsResults.hotels?.length || 0,
        liteAPIError: (liteAPIResults as any).meta?.error || null,
      };
      console.error('🚨 [HOTEL_SEARCH_ZERO_RESULTS]', JSON.stringify(alertData));

      // Non-blocking alert
      import('@/lib/monitoring/customer-error-alerts').then(({ alertCustomerError }) => {
        alertCustomerError({
          errorMessage: `Hotel search returned 0 results for ${JSON.stringify(searchParams.location)}`,
          errorCode: 'HOTEL_SEARCH_ZERO_RESULTS',
          category: 'external_api',
          severity: 'high',
          url: `/api/hotels/search`,
          additionalData: alertData,
        }, { sendTelegram: true, sendEmail: true }).catch(console.error);
      }).catch(console.error);
    }

    // Sort by best price
    const results = {
      hotels: deduplicatedHotels.sort((a, b) => {
        const priceA = a.lowestPricePerNight || a.lowestPrice || Infinity;
        const priceB = b.lowestPricePerNight || b.lowestPrice || Infinity;
        return priceA - priceB;
      }),
      meta: {
        usedMinRates: 'meta' in liteAPIResults ? liteAPIResults.meta?.usedMinRates : undefined,
        liteAPICount: liteAPIResults.hotels?.length || 0,
        amadeusCount: amadeusResults.hotels?.length || 0,
        hotelbedsCount: hotelbedsResults.hotels?.length || 0,
        totalBeforeDedup: allHotels.length,
        totalAfterDedup: deduplicatedHotels.length,
        hotelbedsTime: 'processTime' in hotelbedsResults ? hotelbedsResults.processTime : undefined,
      }
    };

    // Apply additional filters
    let filteredHotels = results.hotels;

    // Filter by price
    if (searchParams.minPrice !== undefined || searchParams.maxPrice !== undefined) {
      filteredHotels = filteredHotels.filter((hotel) => {
        const price = hotel.lowestPrice;
        if (!price) return false;
        const meetsMin = searchParams.minPrice === undefined || price >= searchParams.minPrice;
        const meetsMax = searchParams.maxPrice === undefined || price <= searchParams.maxPrice;
        return meetsMin && meetsMax;
      });
    }

    // Filter by rating
    if (searchParams.minRating !== undefined) {
      filteredHotels = filteredHotels.filter((hotel) => (hotel.starRating || 0) >= (searchParams.minRating || 0));
    }

    // Map to expected format (handles both LiteAPI and Hotelbeds structures)
    const mappedHotels = filteredHotels.map(hotel => {
      // Determine source (LiteAPI or Hotelbeds)
      const source = hotel.source || 'LiteAPI';
      const isHotelbeds = source === 'Hotelbeds';

      // Get location data
      const location = hotel.location || {};

      // Map rates from either structure
      const rates = hotel.rooms?.map((room: any) => ({
        id: room.id || room.rateId,
        roomType: room.name,
        boardType: room.boardName || room.boardType,
        totalPrice: {
          amount: (room.price || room.totalPrice || 0).toString(),
          currency: room.currency || hotel.currency || 'USD',
        },
        refundable: room.refundable,
        maxOccupancy: room.maxOccupancy,
        offerId: room.offerId,
      })) || [];

      // Get the lowest price (different field names for different APIs)
      const lowestPriceValue = hotel.lowestPricePerNight || hotel.lowestPrice || 0;

      return {
        id: hotel.id,
        name: hotel.name,
        description: hotel.description || '',
        location: {
          address: location.address || hotel.address,
          city: location.city || hotel.city,
          country: location.country || hotel.country,
          latitude: location.latitude || hotel.latitude,
          longitude: location.longitude || hotel.longitude,
        },
        rating: hotel.rating || hotel.stars || 0,
        reviewScore: hotel.reviewScore || 0,
        reviewCount: hotel.reviewCount || 0,
        images: hotel.images || (hotel.image ? [{ url: hotel.image, alt: hotel.name }] : []),
        thumbnail: hotel.thumbnail,
        amenities: hotel.amenities || [],
        rates,
        lowestPrice: lowestPriceValue > 0 ? {
          amount: lowestPriceValue.toString(),
          currency: hotel.currency || 'USD',
        } : undefined,
        lowestPricePerNight: hotel.lowestPricePerNight,
        // ✅ CRITICAL: Pass cancellation policy data from LiteAPI
        refundable: (hotel as any).refundable || false,
        hasRefundableRate: (hotel as any).hasRefundableRate || false,
        lowestRefundablePrice: (hotel as any).lowestRefundablePrice || null,
        refundableCancellationDeadline: (hotel as any).refundableCancellationDeadline || null,
        cancellationDeadline: (hotel as any).cancellationDeadline || null,
        boardType: (hotel as any).boardType || 'RO',
        source,
      };
    });

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        sources: ['LiteAPI', 'Amadeus', 'Hotelbeds'],
        apiResults: {
          liteAPI: results.meta.liteAPICount,
          amadeus: results.meta.amadeusCount,
          hotelbeds: results.meta.hotelbedsCount,
          totalBeforeDedup: results.meta.totalBeforeDedup,
          totalAfterDedup: results.meta.totalAfterDedup,
        },
        usedMinRates: results.meta.usedMinRates,
        performance: 'Multi-API aggregation with price deduplication (LiteAPI + Amadeus + Hotelbeds)',
        hotelbedsProcessTime: results.meta.hotelbedsTime,
      },
    };

    // Store in cache (15 minutes TTL)
    await setCache(cacheKey, response, 900);

    console.log(`✅ Multi-API Aggregation: ${mappedHotels.length} hotels (LiteAPI: ${results.meta.liteAPICount}, Amadeus: ${results.meta.amadeusCount}, Hotelbeds: ${results.meta.hotelbedsCount})`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Sources': 'LITEAPI,AMADEUS,HOTELBEDS',
        'X-Performance-Mode': 'MULTI-API-AGGREGATION',
        'X-Hotel-Count-LiteAPI': results.meta.liteAPICount.toString(),
        'X-Hotel-Count-Amadeus': results.meta.amadeusCount.toString(),
        'X-Hotel-Count-Hotelbeds': results.meta.hotelbedsCount.toString(),
        'Cache-Control': 'public, max-age=900',
      }
    });
  });
}

/**
 * GET endpoint for URL-based searches
 * Supports both new (query/checkIn/checkOut) and legacy (cityCode/checkInDate/checkOutDate) parameters
 */
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const searchParams = request.nextUrl.searchParams;

    // Support both new and legacy parameter names
    const query = searchParams.get('query') || searchParams.get('cityCode');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const checkIn = searchParams.get('checkIn') || searchParams.get('checkInDate');
    const checkOut = searchParams.get('checkOut') || searchParams.get('checkOutDate');
    const adults = searchParams.get('adults');

    console.log('🔍 Hotel search GET request:', { query, lat, lng, checkIn, checkOut, adults });

    if (!(query || (lat && lng)) || !checkIn || !checkOut || !adults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          hint: 'Provide query/cityCode or lat/lng, checkIn/checkInDate, checkOut/checkOutDate, and adults'
        },
        { status: 400 }
      );
    }

    // ✅ CRITICAL: Past date validation - APIs return 0 results for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in date cannot be in the past',
          hint: `Check-in date ${checkIn} is before today (${today.toISOString().split('T')[0]}). Please select a future date.`,
          code: 'INVALID_CHECKIN_DATE',
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-out date must be after check-in date',
          hint: `Check-out ${checkOut} must be at least 1 day after check-in ${checkIn}.`,
          code: 'INVALID_CHECKOUT_DATE',
        },
        { status: 400 }
      );
    }

    // Determine coordinates
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);
    } else if (query) {
      // 1. Try local database first (fast)
      const cityCoords = getCityCoordinates(query);
      if (cityCoords) {
        latitude = cityCoords.lat;
        longitude = cityCoords.lng;
        console.log(`✅ Resolved "${query}" to coordinates:`, { latitude, longitude });
      } else {
        // 2. Fallback to Nominatim geocoding for unknown cities (worldwide coverage)
        const geocoded = await geocodeCity(query);
        if (geocoded) {
          latitude = geocoded.lat;
          longitude = geocoded.lng;
          console.log(`🌍 Geocoded "${query}" via Nominatim:`, { latitude, longitude });
        }
      }
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not determine location',
          hint: `Provide valid coordinates or a recognized city name. Searched for: "${query}"`,
          details: process.env.NODE_ENV === 'development' ? 'City not found in coordinate database' : undefined,
        },
        { status: 400 }
      );
    }

    // Parse room count and children
    const rooms = searchParams.get('rooms') ? parseInt(searchParams.get('rooms')!) : 1;
    const children = searchParams.get('children') ? parseInt(searchParams.get('children')!) : 0;

    // Parse child ages from comma-separated string (e.g., "2,5,8" for actual infant/child ages)
    // CRITICAL: Infants (age 0-2) often stay FREE at hotels!
    const childAgesParam = searchParams.get('childAges');
    const childAges: number[] = childAgesParam
      ? childAgesParam.split(',').map(age => parseInt(age.trim())).filter(age => !isNaN(age) && age >= 0 && age <= 17)
      : [];

    console.log('👶 Child ages for search:', { childAgesParam, childAges, children });

    // Generate cache key (v2: fixed coordinate validation, include ALL params for accurate pricing)
    const cacheKey = generateCacheKey('hotels:liteapi:search:get:v2', {
      latitude,
      longitude,
      checkIn,
      checkOut,
      adults,
      children,
      childAges: childAges.join(',') || 'default', // Include actual ages in cache key
      rooms,
    });

    // Try cache first
    const cached = await getCached<any>(cacheKey);
    if (cached) {
      console.log('✅ Returning cached hotel search results (GET)');
      return NextResponse.json(cached, {
        headers: {
          'X-Cache-Status': 'HIT',
          'X-API-Source': 'LITEAPI',
          'Cache-Control': 'public, max-age=900',
        }
      });
    }

    console.log('🔍 Searching hotels with Multi-API (GET - LiteAPI + Amadeus)...', { latitude, longitude, query });

    // Search hotels using MINIMUM rates (5x faster and more reliable!)
    // CRITICAL: Pass rooms param AND childAges for accurate multi-room pricing
    console.log(`🏨 [SEARCH] Searching with: ${adults} adults, ${children} children (ages: ${childAges.length > 0 ? childAges.join(',') : 'default'}), ${rooms} rooms`);

    // 1. LiteAPI Search (Primary)
    const liteAPIResults = await liteAPI.searchHotelsWithMinRates({
      latitude,
      longitude,
      checkIn,
      checkOut,
      adults: parseInt(adults),
      children,
      childAges: childAges.length > 0 ? childAges : undefined, // Pass actual ages for accurate pricing (infants 0-2 often FREE!)
      rooms,
      currency: searchParams.get('currency') || 'USD',
      guestNationality: 'US',
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 50, // CRITICAL: 50km default for proper city coverage
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
    }).catch(err => {
      console.error('⚠️ LiteAPI search failed:', err.message);
      return { hotels: [], meta: { usedMinRates: true, error: err.message } };
    });

    // 2. Amadeus Search (Additional inventory)
    let amadeusHotels: any[] = [];
    if (query) {
      try {
        const cityCode = extractCityCode(query);
        console.log(`🔍 Amadeus GET search: "${query}" → city code: ${cityCode}`);

        const amadeusData = await amadeus.searchHotels({
          cityCode,
          checkInDate: checkIn!,
          checkOutDate: checkOut!,
          adults: parseInt(adults),
          roomQuantity: rooms,
        });

        if (amadeusData?.data?.length > 0) {
          // Calculate nights for per-night price
          const nights = Math.max(1, Math.ceil((new Date(checkOut!).getTime() - new Date(checkIn!).getTime()) / (1000*60*60*24)));

          amadeusHotels = amadeusData.data.map((offer: any) => {
            const mapped = mapAmadeusHotelToHotel(offer);
            const totalPrice = mapped.rates?.[0] ? parseFloat(mapped.rates[0].totalPrice.amount) : 0;

            return {
              id: `amadeus_${mapped.id}`,
              name: mapped.name,
              description: mapped.description || '',
              latitude: mapped.location?.lat || latitude,
              longitude: mapped.location?.lng || longitude,
              address: mapped.address?.street || '',
              city: mapped.address?.city || '',
              country: mapped.address?.country || '',
              stars: mapped.starRating || 4,
              rating: mapped.starRating || 4,
              reviewCount: 0,
              images: mapped.images?.map(img => ({ url: img.url, alt: mapped.name })) || [],
              image: mapped.images?.[0]?.url || null,
              thumbnail: mapped.images?.[0]?.url || null,
              amenities: mapped.amenities || [],
              lowestPrice: totalPrice,
              lowestPricePerNight: totalPrice / nights,
              currency: mapped.rates?.[0]?.totalPrice.currency || 'USD',
              rooms: mapped.rates?.map(rate => ({
                rateId: rate.id,
                name: rate.roomType,
                price: parseFloat(rate.totalPrice.amount),
                currency: rate.totalPrice.currency,
                refundable: rate.refundable,
                boardName: rate.mealsIncluded || 'Room Only',
              })) || [],
              source: 'Amadeus',
              refundable: mapped.rates?.some(r => r.refundable) || false,
            };
          });
          console.log(`✅ Amadeus GET returned ${amadeusHotels.length} additional hotels`);
        }
      } catch (amErr: any) {
        console.log(`⚠️ Amadeus hotel search (GET) failed: ${amErr.message}`);
      }
    }

    // 3. Combine and deduplicate results
    const allHotels = [...(liteAPIResults.hotels || []), ...amadeusHotels];
    console.log(`✅ Multi-API GET Results: LiteAPI (${liteAPIResults.hotels?.length || 0}) + Amadeus (${amadeusHotels.length}) = ${allHotels.length} total`);

    // Deduplicate hotels by name + approximate location
    const deduplicatedHotels: any[] = [];
    const seenHotels = new Map<string, any>();

    for (const hotel of allHotels) {
      const key = `${hotel.name.toLowerCase().trim()}:${Math.floor(hotel.latitude * 1000)}:${Math.floor(hotel.longitude * 1000)}`;

      if (!seenHotels.has(key)) {
        seenHotels.set(key, hotel);
        deduplicatedHotels.push(hotel);
      } else {
        // If duplicate, keep the one with better price
        const existing = seenHotels.get(key);
        if (existing) {
          const existingPrice = existing.lowestPricePerNight || existing.lowestPrice || Infinity;
          const newPrice = hotel.lowestPricePerNight || hotel.lowestPrice || Infinity;

          if (newPrice < existingPrice) {
            const index = deduplicatedHotels.indexOf(existing);
            if (index > -1) {
              deduplicatedHotels[index] = hotel;
              seenHotels.set(key, hotel);
            }
          }
        }
      }
    }

    // Sort by best price
    const sortedHotels = deduplicatedHotels.sort((a, b) => {
      const priceA = a.lowestPricePerNight || a.lowestPrice || Infinity;
      const priceB = b.lowestPricePerNight || b.lowestPrice || Infinity;
      return priceA - priceB;
    });

    console.log(`🔄 GET Deduplication: ${allHotels.length} → ${sortedHotels.length} unique hotels`);

    // 🚨 ALERT: Zero results monitoring (GET handler)
    if (sortedHotels.length === 0) {
      const alertData = {
        timestamp: new Date().toISOString(),
        query,
        checkIn,
        checkOut,
        latitude,
        longitude,
        liteAPICount: liteAPIResults.hotels?.length || 0,
        amadeusCount: amadeusHotels.length,
        liteAPIError: (liteAPIResults as any).meta?.error || null,
      };
      console.error('🚨 [HOTEL_SEARCH_ZERO_RESULTS_GET]', JSON.stringify(alertData));

      // Non-blocking alert
      import('@/lib/monitoring/customer-error-alerts').then(({ alertCustomerError }) => {
        alertCustomerError({
          errorMessage: `Hotel search (GET) returned 0 results for query: ${query}`,
          errorCode: 'HOTEL_SEARCH_ZERO_RESULTS',
          category: 'external_api',
          severity: 'high',
          url: `/api/hotels/search?query=${query}`,
          additionalData: alertData,
        }, { sendTelegram: true, sendEmail: true }).catch(console.error);
      }).catch(console.error);
    }

    // Map to expected format
    const mappedHotels = sortedHotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      location: {
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      },
      rating: hotel.stars,
      reviewScore: hotel.rating,
      reviewCount: hotel.reviewCount,
      images: hotel.images || (hotel.image ? [{ url: hotel.image, alt: hotel.name }] : []),
      thumbnail: hotel.thumbnail,
      amenities: hotel.amenities || [],
      rates: hotel.rooms?.map(room => ({
        id: room.rateId,
        roomType: room.name,
        boardType: room.boardName,
        totalPrice: {
          amount: room.price.toString(),
          currency: room.currency,
        },
        refundable: room.refundable,
        maxOccupancy: room.maxOccupancy,
        offerId: room.offerId,
      })) || [],
      lowestPrice: hotel.lowestPrice ? {
        amount: hotel.lowestPrice.toString(),
        currency: hotel.currency,
      } : undefined,
      lowestPricePerNight: hotel.lowestPricePerNight, // CRITICAL: Include per-night price
      // ✅ CRITICAL: Pass cancellation policy data from LiteAPI
      refundable: (hotel as any).refundable || false,
      hasRefundableRate: (hotel as any).hasRefundableRate || false,
      lowestRefundablePrice: (hotel as any).lowestRefundablePrice || null,
      refundableCancellationDeadline: (hotel as any).refundableCancellationDeadline || null,
      cancellationDeadline: (hotel as any).cancellationDeadline || null,
      boardType: (hotel as any).boardType || 'RO',
      source: hotel.source || 'LiteAPI', // Preserve source from original hotel
    }));

    const liteAPICount = liteAPIResults.hotels?.length || 0;
    const amadeusCount = amadeusHotels.length;

    const response = {
      success: true,
      data: mappedHotels,
      meta: {
        count: mappedHotels.length,
        sources: ['LiteAPI', 'Amadeus'],
        apiResults: {
          liteAPI: liteAPICount,
          amadeus: amadeusCount,
          totalBeforeDedup: allHotels.length,
          totalAfterDedup: sortedHotels.length,
        },
        usedMinRates: liteAPIResults.meta?.usedMinRates,
        performance: 'Multi-API aggregation (LiteAPI + Amadeus)',
      },
    };

    // Cache for 15 minutes
    await setCache(cacheKey, response, 900);

    console.log(`✅ Multi-API GET: ${mappedHotels.length} hotels (LiteAPI: ${liteAPICount}, Amadeus: ${amadeusCount})`);

    return NextResponse.json(response, {
      headers: {
        'X-Cache-Status': 'MISS',
        'X-API-Sources': 'LITEAPI,AMADEUS',
        'X-Performance-Mode': 'MULTI-API',
        'X-Hotel-Count-LiteAPI': liteAPICount.toString(),
        'X-Hotel-Count-Amadeus': amadeusCount.toString(),
        'Cache-Control': 'public, max-age=900',
      }
    });
  });
}
