/**
 * Programmatic SEO Engine - Fly2Any Global Coverage
 * Dynamic page generation for routes, airports, destinations, and airlines
 * Online-only business · USA primary market · Worldwide coverage
 */

export interface RouteData {
  origin: string
  originCity: string
  originCountry: string
  destination: string
  destinationCity: string
  destinationCountry: string
  slug: string
  avgPrice: number
  lowestPrice: number
  airlines: string[]
  flightDuration: string
  popularity: number
  distanceKm: number
  directFlights: boolean
}

export interface AirportData {
  code: string
  name: string
  city: string
  country: string
  continent: string
  latitude: number
  longitude: number
  timezone: string
  slug: string
  popularRoutes: string[]
  terminals?: number
  annualPassengers?: number
}

export interface DestinationData {
  city: string
  country: string
  continent: string
  slug: string
  description: string
  highlights: string[]
  bestTimeToVisit: string
  avgFlightPrice: number
  popularOrigins: string[]
  imageUrl?: string
  currency?: string
  language?: string
  visaRequired?: string
  timezone?: string
}

export interface AirlineData {
  code: string
  name: string
  country: string
  alliance?: string
  slug: string
  rating: number
  popularRoutes: string[]
  hubAirports: string[]
  founded?: number
  fleet?: number
}

// ─── 50+ WORLDWIDE AIRPORTS ───────────────────────────────────────────────────
export const TOP_AIRPORTS: AirportData[] = [
  // ── North America ──
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', continent: 'North America', latitude: 40.6413, longitude: -73.7781, timezone: 'America/New_York', slug: 'new-york-jfk', popularRoutes: ['LHR','CDG','LAX','MIA','GRU','NRT','DXB','FRA'], terminals: 6, annualPassengers: 62000000 },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', continent: 'North America', latitude: 33.9425, longitude: -118.4081, timezone: 'America/Los_Angeles', slug: 'los-angeles-lax', popularRoutes: ['JFK','SFO','NRT','SIN','SYD','HKG','LHR','MEX'], terminals: 9, annualPassengers: 88000000 },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', continent: 'North America', latitude: 41.9742, longitude: -87.9073, timezone: 'America/Chicago', slug: 'chicago-ord', popularRoutes: ['LAX','JFK','LHR','FRA','NRT','MEX','CAN'], terminals: 4, annualPassengers: 80000000 },
  { code: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA', continent: 'North America', latitude: 25.7959, longitude: -80.2870, timezone: 'America/New_York', slug: 'miami-mia', popularRoutes: ['JFK','LAX','GRU','BOG','SCL','LIM','MEX','LHR'], terminals: 3, annualPassengers: 52000000 },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', continent: 'North America', latitude: 37.6213, longitude: -122.3790, timezone: 'America/Los_Angeles', slug: 'san-francisco-sfo', popularRoutes: ['LAX','JFK','NRT','HKG','SIN','LHR','PEK'], terminals: 4, annualPassengers: 57000000 },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'USA', continent: 'North America', latitude: 33.6407, longitude: -84.4277, timezone: 'America/New_York', slug: 'atlanta-atl', popularRoutes: ['JFK','LAX','LHR','CDG','MEX','GRU','CUN'], terminals: 2, annualPassengers: 104000000 },
  { code: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', continent: 'North America', latitude: 32.8968, longitude: -97.0380, timezone: 'America/Chicago', slug: 'dallas-dfw', popularRoutes: ['LAX','JFK','LHR','CDG','MEX','BOG','GRU'], terminals: 5, annualPassengers: 75000000 },
  { code: 'BOS', name: 'Logan International', city: 'Boston', country: 'USA', continent: 'North America', latitude: 42.3656, longitude: -71.0096, timezone: 'America/New_York', slug: 'boston-bos', popularRoutes: ['JFK','LAX','LHR','DUB','CDG','MAD'], terminals: 4, annualPassengers: 42000000 },
  { code: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', continent: 'North America', latitude: 47.4502, longitude: -122.3088, timezone: 'America/Los_Angeles', slug: 'seattle-sea', popularRoutes: ['LAX','JFK','NRT','ICN','SIN','ANC'], terminals: 1, annualPassengers: 51000000 },
  { code: 'MCO', name: 'Orlando International', city: 'Orlando', country: 'USA', continent: 'North America', latitude: 28.4312, longitude: -81.3081, timezone: 'America/New_York', slug: 'orlando-mco', popularRoutes: ['JFK','LAX','LHR','CUN','GCM','NAS'], terminals: 4, annualPassengers: 50000000 },
  { code: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada', continent: 'North America', latitude: 43.6777, longitude: -79.6248, timezone: 'America/Toronto', slug: 'toronto-yyz', popularRoutes: ['JFK','LHR','CDG','DEL','HKG','LAX'], terminals: 2, annualPassengers: 50000000 },
  { code: 'MEX', name: 'Mexico City International', city: 'Mexico City', country: 'Mexico', continent: 'North America', latitude: 19.4363, longitude: -99.0721, timezone: 'America/Mexico_City', slug: 'mexico-city-mex', popularRoutes: ['LAX','JFK','MIA','DFW','MAD','CUN'], terminals: 2, annualPassengers: 47000000 },
  { code: 'CUN', name: 'Cancún International', city: 'Cancún', country: 'Mexico', continent: 'North America', latitude: 21.0365, longitude: -86.8770, timezone: 'America/Cancun', slug: 'cancun-cun', popularRoutes: ['JFK','LAX','ORD','MIA','DFW','ATL'], terminals: 4, annualPassengers: 30000000 },

  // ── South America ──
  { code: 'GRU', name: 'Guarulhos International', city: 'São Paulo', country: 'Brazil', continent: 'South America', latitude: -23.4356, longitude: -46.4731, timezone: 'America/Sao_Paulo', slug: 'sao-paulo-gru', popularRoutes: ['MIA','JFK','LIS','CDG','MAD','EZE','SCL','BOG'], terminals: 3, annualPassengers: 44000000 },
  { code: 'GIG', name: 'Galeão International', city: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', latitude: -22.8089, longitude: -43.2437, timezone: 'America/Sao_Paulo', slug: 'rio-de-janeiro-gig', popularRoutes: ['MIA','JFK','LIS','CDG','EZE','GRU'], terminals: 2, annualPassengers: 20000000 },
  { code: 'EZE', name: 'Ezeiza International', city: 'Buenos Aires', country: 'Argentina', continent: 'South America', latitude: -34.8222, longitude: -58.5358, timezone: 'America/Argentina/Buenos_Aires', slug: 'buenos-aires-eze', popularRoutes: ['MIA','JFK','MAD','CDG','LHR','SCL','GRU'], terminals: 1, annualPassengers: 22000000 },
  { code: 'SCL', name: 'Arturo Merino Benítez', city: 'Santiago', country: 'Chile', continent: 'South America', latitude: -33.3930, longitude: -70.7858, timezone: 'America/Santiago', slug: 'santiago-scl', popularRoutes: ['MIA','JFK','MAD','LIM','BOG','GRU'], terminals: 2, annualPassengers: 26000000 },
  { code: 'BOG', name: 'El Dorado International', city: 'Bogotá', country: 'Colombia', continent: 'South America', latitude: 4.7016, longitude: -74.1469, timezone: 'America/Bogota', slug: 'bogota-bog', popularRoutes: ['MIA','JFK','LAX','MAD','MEX','LIM'], terminals: 2, annualPassengers: 36000000 },
  { code: 'LIM', name: 'Jorge Chávez International', city: 'Lima', country: 'Peru', continent: 'South America', latitude: -12.0219, longitude: -77.1143, timezone: 'America/Lima', slug: 'lima-lim', popularRoutes: ['MIA','JFK','LAX','BOG','SCL','MAD'], terminals: 1, annualPassengers: 25000000 },

  // ── Europe ──
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK', continent: 'Europe', latitude: 51.4700, longitude: -0.4543, timezone: 'Europe/London', slug: 'london-lhr', popularRoutes: ['JFK','DXB','CDG','FRA','SIN','HKG','NRT'], terminals: 5, annualPassengers: 80000000 },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', continent: 'Europe', latitude: 49.0097, longitude: 2.5479, timezone: 'Europe/Paris', slug: 'paris-cdg', popularRoutes: ['JFK','LHR','FCO','BCN','NRT','SIN'], terminals: 3, annualPassengers: 76000000 },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', continent: 'Europe', latitude: 50.0379, longitude: 8.5622, timezone: 'Europe/Berlin', slug: 'frankfurt-fra', popularRoutes: ['LHR','JFK','DXB','SIN','NRT','IST'], terminals: 2, annualPassengers: 70000000 },
  { code: 'AMS', name: 'Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', continent: 'Europe', latitude: 52.3105, longitude: 4.7683, timezone: 'Europe/Amsterdam', slug: 'amsterdam-ams', popularRoutes: ['LHR','CDG','FRA','JFK','SIN'], terminals: 1, annualPassengers: 71000000 },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', continent: 'Europe', latitude: 40.4936, longitude: -3.5668, timezone: 'Europe/Madrid', slug: 'madrid-mad', popularRoutes: ['LHR','CDG','JFK','GRU','MEX','BOG'], terminals: 4, annualPassengers: 61000000 },
  { code: 'BCN', name: 'El Prat Airport', city: 'Barcelona', country: 'Spain', continent: 'Europe', latitude: 41.2974, longitude: 2.0833, timezone: 'Europe/Madrid', slug: 'barcelona-bcn', popularRoutes: ['MAD','CDG','LHR','FCO','JFK'], terminals: 2, annualPassengers: 53000000 },
  { code: 'FCO', name: 'Fiumicino Airport', city: 'Rome', country: 'Italy', continent: 'Europe', latitude: 41.8003, longitude: 12.2389, timezone: 'Europe/Rome', slug: 'rome-fco', popularRoutes: ['CDG','LHR','FRA','BCN','JFK'], terminals: 4, annualPassengers: 50000000 },
  { code: 'MXP', name: 'Malpensa Airport', city: 'Milan', country: 'Italy', continent: 'Europe', latitude: 45.6306, longitude: 8.7281, timezone: 'Europe/Rome', slug: 'milan-mxp', popularRoutes: ['CDG','LHR','FRA','FCO','JFK'], terminals: 2, annualPassengers: 29000000 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', continent: 'Europe', latitude: 41.2608, longitude: 28.7418, timezone: 'Europe/Istanbul', slug: 'istanbul-ist', popularRoutes: ['LHR','FRA','CDG','DXB','JFK','DEL'], terminals: 1, annualPassengers: 64000000 },
  { code: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria', continent: 'Europe', latitude: 48.1103, longitude: 16.5697, timezone: 'Europe/Vienna', slug: 'vienna-vie', popularRoutes: ['LHR','CDG','FRA','AMS','JFK'], terminals: 3, annualPassengers: 32000000 },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', continent: 'Europe', latitude: 47.4647, longitude: 8.5492, timezone: 'Europe/Zurich', slug: 'zurich-zrh', popularRoutes: ['LHR','CDG','FRA','JFK','SIN'], terminals: 3, annualPassengers: 31000000 },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', continent: 'Europe', latitude: 38.7742, longitude: -9.1342, timezone: 'Europe/Lisbon', slug: 'lisbon-lis', popularRoutes: ['LHR','CDG','GRU','JFK','MAD','MIA'], terminals: 1, annualPassengers: 34000000 },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', continent: 'Europe', latitude: 53.4213, longitude: -6.2701, timezone: 'Europe/Dublin', slug: 'dublin-dub', popularRoutes: ['LHR','JFK','BOS','LAX','CDG'], terminals: 2, annualPassengers: 32000000 },

  // ── Middle East ──
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', continent: 'Middle East', latitude: 25.2532, longitude: 55.3657, timezone: 'Asia/Dubai', slug: 'dubai-dxb', popularRoutes: ['LHR','BOM','DEL','SIN','JFK','LAX'], terminals: 3, annualPassengers: 86000000 },
  { code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar', continent: 'Middle East', latitude: 25.2609, longitude: 51.6138, timezone: 'Asia/Qatar', slug: 'doha-doh', popularRoutes: ['LHR','JFK','SIN','KUL','BKK','DEL'], terminals: 1, annualPassengers: 50000000 },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE', continent: 'Middle East', latitude: 24.4330, longitude: 54.6511, timezone: 'Asia/Dubai', slug: 'abu-dhabi-auh', popularRoutes: ['LHR','JFK','DEL','BOM','SIN'], terminals: 3, annualPassengers: 24000000 },
  { code: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel', continent: 'Middle East', latitude: 32.0114, longitude: 34.8867, timezone: 'Asia/Jerusalem', slug: 'tel-aviv-tlv', popularRoutes: ['LHR','CDG','JFK','FRA','AMS'], terminals: 3, annualPassengers: 24000000 },

  // ── Asia ──
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore', continent: 'Asia', latitude: 1.3644, longitude: 103.9915, timezone: 'Asia/Singapore', slug: 'singapore-sin', popularRoutes: ['HKG','BKK','SYD','LHR','NRT','DEL'], terminals: 4, annualPassengers: 68000000 },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China', continent: 'Asia', latitude: 22.3080, longitude: 113.9185, timezone: 'Asia/Hong_Kong', slug: 'hong-kong-hkg', popularRoutes: ['SIN','TPE','NRT','BKK','LAX','SYD'], terminals: 2, annualPassengers: 71000000 },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', continent: 'Asia', latitude: 35.7720, longitude: 140.3929, timezone: 'Asia/Tokyo', slug: 'tokyo-nrt', popularRoutes: ['LAX','SFO','HNL','SIN','ICN','HKG'], terminals: 3, annualPassengers: 40000000 },
  { code: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea', continent: 'Asia', latitude: 37.4602, longitude: 126.4407, timezone: 'Asia/Seoul', slug: 'seoul-icn', popularRoutes: ['NRT','HKG','SIN','LAX','JFK','SFO'], terminals: 2, annualPassengers: 71000000 },
  { code: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China', continent: 'Asia', latitude: 40.0799, longitude: 116.6031, timezone: 'Asia/Shanghai', slug: 'beijing-pek', popularRoutes: ['SIN','HKG','LAX','JFK','LHR','FRA'], terminals: 3, annualPassengers: 101000000 },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', continent: 'Asia', latitude: 13.6900, longitude: 100.7501, timezone: 'Asia/Bangkok', slug: 'bangkok-bkk', popularRoutes: ['SIN','HKG','NRT','SYD','DXB','KUL'], terminals: 1, annualPassengers: 65000000 },
  { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', continent: 'Asia', latitude: 2.7456, longitude: 101.7099, timezone: 'Asia/Kuala_Lumpur', slug: 'kuala-lumpur-kul', popularRoutes: ['SIN','BKK','HKG','DXB','NRT','SYD'], terminals: 2, annualPassengers: 62000000 },
  { code: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', continent: 'Asia', latitude: 28.5561, longitude: 77.1000, timezone: 'Asia/Kolkata', slug: 'new-delhi-del', popularRoutes: ['DXB','LHR','SIN','JFK','FRA','BOM'], terminals: 3, annualPassengers: 70000000 },
  { code: 'BOM', name: 'Chhatrapati Shivaji International', city: 'Mumbai', country: 'India', continent: 'Asia', latitude: 19.0896, longitude: 72.8656, timezone: 'Asia/Kolkata', slug: 'mumbai-bom', popularRoutes: ['DXB','LHR','SIN','DEL','JFK','DOH'], terminals: 2, annualPassengers: 50000000 },
  { code: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines', continent: 'Asia', latitude: 14.5086, longitude: 121.0194, timezone: 'Asia/Manila', slug: 'manila-mnl', popularRoutes: ['HKG','SIN','NRT','ICN','LAX','SFO'], terminals: 4, annualPassengers: 47000000 },
  { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia', continent: 'Asia', latitude: -6.1256, longitude: 106.6559, timezone: 'Asia/Jakarta', slug: 'jakarta-cgk', popularRoutes: ['SIN','KUL','HKG','DXB','SYD','NRT'], terminals: 3, annualPassengers: 66000000 },

  // ── Oceania ──
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', continent: 'Oceania', latitude: -33.9461, longitude: 151.1772, timezone: 'Australia/Sydney', slug: 'sydney-syd', popularRoutes: ['LAX','SIN','HKG','NRT','AKL','MEL'], terminals: 3, annualPassengers: 44000000 },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', continent: 'Oceania', latitude: -37.6690, longitude: 144.8410, timezone: 'Australia/Melbourne', slug: 'melbourne-mel', popularRoutes: ['SIN','LAX','HKG','AKL','SYD','DXB'], terminals: 4, annualPassengers: 38000000 },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', continent: 'Oceania', latitude: -37.0082, longitude: 174.7850, timezone: 'Pacific/Auckland', slug: 'auckland-akl', popularRoutes: ['SYD','MEL','LAX','SIN','NRT','LHR'], terminals: 2, annualPassengers: 21000000 },

  // ── Africa ──
  { code: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa', continent: 'Africa', latitude: -26.1392, longitude: 28.2460, timezone: 'Africa/Johannesburg', slug: 'johannesburg-jnb', popularRoutes: ['LHR','DXB','CPT','NBO','JFK','CDG'], terminals: 2, annualPassengers: 21000000 },
  { code: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya', continent: 'Africa', latitude: -1.3192, longitude: 36.9275, timezone: 'Africa/Nairobi', slug: 'nairobi-nbo', popularRoutes: ['DXB','LHR','JNB','ADD','CDG','SIN'], terminals: 2, annualPassengers: 9000000 },
  { code: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt', continent: 'Africa', latitude: 30.1219, longitude: 31.4056, timezone: 'Africa/Cairo', slug: 'cairo-cai', popularRoutes: ['DXB','LHR','IST','FRA','JED','RUH'], terminals: 3, annualPassengers: 15000000 },
  { code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco', continent: 'Africa', latitude: 33.3675, longitude: -7.5898, timezone: 'Africa/Casablanca', slug: 'casablanca-cmn', popularRoutes: ['CDG','MAD','LHR','JFK','MIA','FRA'], terminals: 1, annualPassengers: 10000000 },
]

// ─── TOP AIRLINES ─────────────────────────────────────────────────────────────
export const TOP_AIRLINES: AirlineData[] = [
  { code: 'AA', name: 'American Airlines', country: 'USA', alliance: 'Oneworld', slug: 'american-airlines', rating: 4.1, popularRoutes: ['JFK-LAX','DFW-LHR','MIA-CDG','ATL-GRU'], hubAirports: ['DFW','CLT','PHX','MIA'], founded: 1926, fleet: 956 },
  { code: 'UA', name: 'United Airlines', country: 'USA', alliance: 'Star Alliance', slug: 'united-airlines', rating: 3.9, popularRoutes: ['EWR-LHR','SFO-NRT','ORD-FRA','IAH-GRU'], hubAirports: ['ORD','EWR','IAH','SFO'], founded: 1926, fleet: 868 },
  { code: 'DL', name: 'Delta Air Lines', country: 'USA', alliance: 'SkyTeam', slug: 'delta-air-lines', rating: 4.2, popularRoutes: ['ATL-LHR','JFK-CDG','LAX-NRT','MSP-AMS'], hubAirports: ['ATL','DTW','MSP','JFK'], founded: 1925, fleet: 1278 },
  { code: 'BA', name: 'British Airways', country: 'UK', alliance: 'Oneworld', slug: 'british-airways', rating: 4.0, popularRoutes: ['LHR-JFK','LHR-LAX','LHR-DXB','LHR-GRU'], hubAirports: ['LHR','LGW'], founded: 1974, fleet: 273 },
  { code: 'AF', name: 'Air France', country: 'France', alliance: 'SkyTeam', slug: 'air-france', rating: 4.1, popularRoutes: ['CDG-JFK','CDG-LAX','CDG-NRT','CDG-GRU'], hubAirports: ['CDG','ORY'], founded: 1933, fleet: 220 },
  { code: 'LH', name: 'Lufthansa', country: 'Germany', alliance: 'Star Alliance', slug: 'lufthansa', rating: 4.3, popularRoutes: ['FRA-JFK','MUC-LAX','FRA-SIN','FRA-DEL'], hubAirports: ['FRA','MUC'], founded: 1955, fleet: 279 },
  { code: 'EK', name: 'Emirates', country: 'UAE', slug: 'emirates', rating: 4.6, popularRoutes: ['DXB-LHR','DXB-JFK','DXB-SYD','DXB-SIN'], hubAirports: ['DXB'], founded: 1985, fleet: 255 },
  { code: 'QR', name: 'Qatar Airways', country: 'Qatar', alliance: 'Oneworld', slug: 'qatar-airways', rating: 4.7, popularRoutes: ['DOH-LHR','DOH-JFK','DOH-SIN','DOH-GRU'], hubAirports: ['DOH'], founded: 1993, fleet: 253 },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore', alliance: 'Star Alliance', slug: 'singapore-airlines', rating: 4.8, popularRoutes: ['SIN-LHR','SIN-JFK','SIN-SYD','SIN-NRT'], hubAirports: ['SIN'], founded: 1947, fleet: 192 },
  { code: 'CX', name: 'Cathay Pacific', country: 'Hong Kong', alliance: 'Oneworld', slug: 'cathay-pacific', rating: 4.4, popularRoutes: ['HKG-LHR','HKG-LAX','HKG-SYD','HKG-JFK'], hubAirports: ['HKG'], founded: 1946, fleet: 235 },
  { code: 'TK', name: 'Turkish Airlines', country: 'Turkey', alliance: 'Star Alliance', slug: 'turkish-airlines', rating: 4.2, popularRoutes: ['IST-JFK','IST-LHR','IST-DEL','IST-NBO'], hubAirports: ['IST'], founded: 1933, fleet: 409 },
  { code: 'LA', name: 'LATAM Airlines', country: 'Chile', alliance: 'Oneworld', slug: 'latam-airlines', rating: 3.8, popularRoutes: ['SCL-MIA','GRU-JFK','BOG-MIA','LIM-JFK'], hubAirports: ['SCL','GRU','BOG'], founded: 2012, fleet: 340 },
  { code: 'AV', name: 'Avianca', country: 'Colombia', alliance: 'Star Alliance', slug: 'avianca', rating: 3.7, popularRoutes: ['BOG-MIA','BOG-JFK','BOG-MAD','BOG-LIM'], hubAirports: ['BOG','MIA'], founded: 1919, fleet: 183 },
  { code: 'G3', name: 'Gol Linhas Aéreas', country: 'Brazil', slug: 'gol-airlines', rating: 3.5, popularRoutes: ['GRU-MIA','GRU-GIG','GRU-BOG','GRU-SCL'], hubAirports: ['GRU','GIG','BSB'], founded: 2001, fleet: 131 },
]

// ─── TOP DESTINATIONS ─────────────────────────────────────────────────────────
export const TOP_DESTINATIONS: DestinationData[] = [
  { city: 'Paris', country: 'France', continent: 'Europe', slug: 'paris', description: 'The City of Light, famous for the Eiffel Tower, world-class museums, and romantic ambiance.', highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Champs-Élysées', 'Palace of Versailles'], bestTimeToVisit: 'April to June or September to November', avgFlightPrice: 650, popularOrigins: ['JFK','LAX','LHR','ORD'], currency: 'EUR', language: 'French', visaRequired: 'Schengen visa (US citizens exempt up to 90 days)', timezone: 'Europe/Paris' },
  { city: 'London', country: 'UK', continent: 'Europe', slug: 'london', description: 'Historic capital blending tradition with modern innovation, from Big Ben to world-class theatre.', highlights: ['Big Ben', 'Tower of London', 'British Museum', 'Buckingham Palace', 'The Shard'], bestTimeToVisit: 'March to May or September to November', avgFlightPrice: 550, popularOrigins: ['JFK','LAX','BOS','ORD'], currency: 'GBP', language: 'English', visaRequired: 'No visa required for US citizens (up to 6 months)', timezone: 'Europe/London' },
  { city: 'Tokyo', country: 'Japan', continent: 'Asia', slug: 'tokyo', description: 'Ultra-modern metropolis where ancient temples meet neon-lit streets and cutting-edge technology.', highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Mt. Fuji Day Trip', 'teamLab digital art', 'Akihabara'], bestTimeToVisit: 'March to May (cherry blossom) or October to November', avgFlightPrice: 900, popularOrigins: ['LAX','SFO','SEA','ORD'], currency: 'JPY', language: 'Japanese', visaRequired: 'No visa required for US citizens (up to 90 days)', timezone: 'Asia/Tokyo' },
  { city: 'Dubai', country: 'UAE', continent: 'Middle East', slug: 'dubai', description: 'Futuristic city of superlatives with the world\'s tallest building, luxury shopping, and desert adventures.', highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari', 'Dubai Frame'], bestTimeToVisit: 'November to March', avgFlightPrice: 800, popularOrigins: ['JFK','LHR','LAX','ORD'], currency: 'AED', language: 'Arabic (English widely spoken)', visaRequired: 'Visa on arrival for US citizens (30 days)', timezone: 'Asia/Dubai' },
  { city: 'New York', country: 'USA', continent: 'North America', slug: 'new-york', description: 'The city that never sleeps — iconic skyline, world-class entertainment, and endless diversity.', highlights: ['Statue of Liberty', 'Central Park', 'Times Square', 'Broadway', 'Metropolitan Museum'], bestTimeToVisit: 'April to June or September to November', avgFlightPrice: 300, popularOrigins: ['LAX','MIA','ORD','ATL'], currency: 'USD', language: 'English', visaRequired: 'No visa required for US citizens', timezone: 'America/New_York' },
  { city: 'Singapore', country: 'Singapore', continent: 'Asia', slug: 'singapore', description: 'Garden city blending futuristic architecture, diverse cultures, and world-renowned cuisine.', highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Hawker Centers', 'Universal Studios'], bestTimeToVisit: 'February to April', avgFlightPrice: 850, popularOrigins: ['LAX','SFO','JFK','SEA'], currency: 'SGD', language: 'English (official)', visaRequired: 'No visa required for US citizens (up to 30 days)', timezone: 'Asia/Singapore' },
  { city: 'Barcelona', country: 'Spain', continent: 'Europe', slug: 'barcelona', description: 'Vibrant coastal city famous for Gaudí architecture, Mediterranean beaches, and lively nightlife.', highlights: ['Sagrada Familia', 'Park Güell', 'La Rambla', 'Gothic Quarter', 'Camp Nou'], bestTimeToVisit: 'May to June or September to October', avgFlightPrice: 500, popularOrigins: ['JFK','MIA','BOS','LAX'], currency: 'EUR', language: 'Spanish/Catalan', visaRequired: 'Schengen visa (US citizens exempt up to 90 days)', timezone: 'Europe/Madrid' },
  { city: 'Rome', country: 'Italy', continent: 'Europe', slug: 'rome', description: 'Eternal city where ancient ruins, Renaissance art, and la dolce vita come together.', highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Roman Forum', 'Pantheon'], bestTimeToVisit: 'April to June or September to October', avgFlightPrice: 550, popularOrigins: ['JFK','MIA','BOS','ORD'], currency: 'EUR', language: 'Italian', visaRequired: 'Schengen visa (US citizens exempt up to 90 days)', timezone: 'Europe/Rome' },
  { city: 'Cancún', country: 'Mexico', continent: 'North America', slug: 'cancun', description: 'World-famous Caribbean resort destination with turquoise waters, ancient Mayan ruins, and vibrant nightlife.', highlights: ['Chichen Itza', 'Tulum Ruins', 'Isla Mujeres', 'Xcaret Park', 'Hotel Zone Beach'], bestTimeToVisit: 'December to April', avgFlightPrice: 280, popularOrigins: ['JFK','LAX','ORD','MIA','ATL','DFW'], currency: 'MXN (USD accepted)', language: 'Spanish (English widely spoken)', visaRequired: 'No visa required for US citizens', timezone: 'America/Cancun' },
  { city: 'São Paulo', country: 'Brazil', continent: 'South America', slug: 'sao-paulo', description: 'South America\'s largest city and financial capital — a vibrant mosaic of cultures, cuisine, and art.', highlights: ['Ibirapuera Park', 'São Paulo Museum of Art', 'Paulista Avenue', 'Liberdade (Japan Town)', 'Vila Madalena Art District'], bestTimeToVisit: 'March to May or September to November', avgFlightPrice: 600, popularOrigins: ['MIA','JFK','LAX','ORD'], currency: 'BRL', language: 'Portuguese', visaRequired: 'No visa required for US citizens', timezone: 'America/Sao_Paulo' },
  { city: 'Bangkok', country: 'Thailand', continent: 'Asia', slug: 'bangkok', description: 'Bustling capital known for ornate temples, vibrant street life, and incredible street food culture.', highlights: ['Grand Palace', 'Wat Pho', 'Chatuchak Market', 'Khao San Road', 'Floating Markets'], bestTimeToVisit: 'November to February', avgFlightPrice: 750, popularOrigins: ['LAX','SFO','SEA','JFK'], currency: 'THB', language: 'Thai (English in tourist areas)', visaRequired: 'Visa on arrival for US citizens (30 days free)', timezone: 'Asia/Bangkok' },
  { city: 'Bali', country: 'Indonesia', continent: 'Asia', slug: 'bali', description: 'Tropical paradise with stunning temples, rice terraces, world-class surfing, and spiritual retreats.', highlights: ['Uluwatu Temple', 'Ubud Rice Terraces', 'Seminyak Beach', 'Sacred Monkey Forest', 'Mount Batur'], bestTimeToVisit: 'April to October', avgFlightPrice: 950, popularOrigins: ['LAX','SFO','SEA','JFK'], currency: 'IDR', language: 'Balinese/Indonesian (English in tourist areas)', visaRequired: 'Visa on arrival for US citizens (30 days, extendable)', timezone: 'Asia/Makassar' },
  { city: 'Sydney', country: 'Australia', continent: 'Oceania', slug: 'sydney', description: 'Harbor city with iconic Opera House, beautiful beaches, and vibrant multicultural food scene.', highlights: ['Opera House', 'Harbour Bridge', 'Bondi Beach', 'Darling Harbour', 'Blue Mountains'], bestTimeToVisit: 'September to November or March to May', avgFlightPrice: 1100, popularOrigins: ['LAX','SFO','JFK','SEA'], currency: 'AUD', language: 'English', visaRequired: 'ETA required for US citizens (available online, $20 AUD)', timezone: 'Australia/Sydney' },
  { city: 'Amsterdam', country: 'Netherlands', continent: 'Europe', slug: 'amsterdam', description: 'Canal city famous for world-class museums, cycling culture, and vibrant cultural scene.', highlights: ['Rijksmuseum', 'Van Gogh Museum', 'Anne Frank House', 'Canal Ring', 'Vondelpark'], bestTimeToVisit: 'April to May (tulip season) or June to August', avgFlightPrice: 600, popularOrigins: ['JFK','BOS','LAX','ORD'], currency: 'EUR', language: 'Dutch (English widely spoken)', visaRequired: 'Schengen visa (US citizens exempt up to 90 days)', timezone: 'Europe/Amsterdam' },
  { city: 'Buenos Aires', country: 'Argentina', continent: 'South America', slug: 'buenos-aires', description: 'Paris of South America — tango, steak, colonial architecture, and passionate culture.', highlights: ['La Boca', 'Recoleta Cemetery', 'San Telmo Market', 'Teatro Colón', 'Palermo'], bestTimeToVisit: 'March to May or September to November', avgFlightPrice: 700, popularOrigins: ['MIA','JFK','LAX','ATL'], currency: 'ARS', language: 'Spanish', visaRequired: 'No visa required for US citizens', timezone: 'America/Argentina/Buenos_Aires' },
  { city: 'Istanbul', country: 'Turkey', continent: 'Europe', slug: 'istanbul', description: 'City straddling two continents — ancient mosques, Byzantine churches, and vibrant bazaars.', highlights: ['Hagia Sophia', 'Blue Mosque', 'Grand Bazaar', 'Topkapi Palace', 'Bosphorus Cruise'], bestTimeToVisit: 'March to May or September to November', avgFlightPrice: 700, popularOrigins: ['JFK','LAX','ORD','BOS'], currency: 'TRY', language: 'Turkish (English in tourist areas)', visaRequired: 'e-Visa required for US citizens ($50)', timezone: 'Europe/Istanbul' },
  { city: 'Dubai', country: 'UAE', continent: 'Middle East', slug: 'dubai', description: 'Futuristic city of superlatives with the world\'s tallest building, luxury shopping, and desert adventures.', highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari', 'Gold Souk'], bestTimeToVisit: 'November to March', avgFlightPrice: 800, popularOrigins: ['JFK','LAX','ORD','BOS'], currency: 'AED', language: 'Arabic (English widely spoken)', visaRequired: 'Visa on arrival for US citizens (30 days)', timezone: 'Asia/Dubai' },
  { city: 'Lisbon', country: 'Portugal', continent: 'Europe', slug: 'lisbon', description: 'Charming hillside city with historic trams, Fado music, pastel de nata, and Atlantic coastal beauty.', highlights: ['Belém Tower', 'Jerónimos Monastery', 'Sintra Palace', 'Alfama District', 'Time Out Market'], bestTimeToVisit: 'March to May or September to October', avgFlightPrice: 550, popularOrigins: ['JFK','BOS','MIA','LAX'], currency: 'EUR', language: 'Portuguese (English in tourist areas)', visaRequired: 'Schengen visa (US citizens exempt up to 90 days)', timezone: 'Europe/Lisbon' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Calculate great-circle distance between two airports (km)
 */
function haversineKm(a: AirportData, b: AirportData): number {
  const R = 6371
  const dLat = (b.latitude - a.latitude) * Math.PI / 180
  const dLon = (b.longitude - a.longitude) * Math.PI / 180
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const c = 2 * Math.atan2(
    Math.sqrt(sinDLat * sinDLat + Math.cos(a.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) * sinDLon * sinDLon),
    Math.sqrt(1 - sinDLat * sinDLat - Math.cos(a.latitude * Math.PI / 180) * Math.cos(b.latitude * Math.PI / 180) * sinDLon * sinDLon)
  )
  return Math.round(R * c)
}

/**
 * Deterministic flight duration string from distance
 */
function durationFromKm(km: number): string {
  const totalMinutes = Math.round((km / 850 + 0.75) * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m > 0 ? m + 'm' : ''}`
}

/**
 * Deterministic price from distance (no Math.random)
 * Based on real-world pricing tiers
 */
function priceFromKm(km: number): { avg: number; lowest: number } {
  let base: number
  if (km < 1500) base = 180
  else if (km < 4000) base = 350
  else if (km < 8000) base = 650
  else if (km < 12000) base = 900
  else base = 1200
  // Distance factor
  const factor = 1 + (km / 20000)
  const avg = Math.round(base * factor / 10) * 10
  const lowest = Math.round(avg * 0.65 / 10) * 10
  return { avg, lowest }
}

/**
 * City-name slug: "New York" → "new-york", "São Paulo" → "sao-paulo"
 */
function citySlug(city: string): string {
  return city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ─── PROGRAMMATIC SEO ENGINE ──────────────────────────────────────────────────
export class ProgrammaticSEOEngine {
  /** Generate all route combinations with deterministic data */
  generateRoutes(): RouteData[] {
    const routes: RouteData[] = []
    const seen = new Set<string>()

    for (const origin of TOP_AIRPORTS) {
      for (const destCode of origin.popularRoutes) {
        const dest = TOP_AIRPORTS.find(a => a.code === destCode)
        if (!dest) continue

        const slug = `${citySlug(origin.city)}-to-${citySlug(dest.city)}`
        if (seen.has(slug)) continue
        seen.add(slug)

        const km = haversineKm(origin, dest)
        const { avg, lowest } = priceFromKm(km)

        routes.push({
          origin: origin.code,
          originCity: origin.city,
          originCountry: origin.country,
          destination: dest.code,
          destinationCity: dest.city,
          destinationCountry: dest.country,
          slug,
          avgPrice: avg,
          lowestPrice: lowest,
          airlines: this.getAirlinesForRoute(origin.code, dest.code),
          flightDuration: durationFromKm(km),
          popularity: Math.min(100, Math.round(((origin.annualPassengers || 20000000) + (dest.annualPassengers || 20000000)) / 2000000)),
          distanceKm: km,
          directFlights: km < 10000,
        })
      }
    }

    // Sort by popularity descending
    return routes.sort((a, b) => b.popularity - a.popularity)
  }

  /** Airlines operating a route (deterministic) */
  private getAirlinesForRoute(origin: string, dest: string): string[] {
    return TOP_AIRLINES
      .filter(a =>
        a.hubAirports.includes(origin) ||
        a.hubAirports.includes(dest) ||
        a.popularRoutes.some(r => r.includes(origin) && r.includes(dest))
      )
      .map(a => a.name)
      .slice(0, 6)
  }

  /** Sitemap entries for all programmatic pages */
  generateSitemapEntries() {
    const now = new Date().toISOString().split('T')[0]
    const entries: Array<{ url: string; lastmod: string; changefreq: string; priority: number }> = []

    for (const route of this.generateRoutes()) {
      entries.push({ url: `/flights/${route.slug}`, lastmod: now, changefreq: 'daily', priority: 0.85 })
    }
    for (const airport of TOP_AIRPORTS) {
      entries.push({ url: `/airports/${airport.slug}`, lastmod: now, changefreq: 'weekly', priority: 0.75 })
    }
    for (const dest of TOP_DESTINATIONS) {
      entries.push({ url: `/destinations/${dest.slug}`, lastmod: now, changefreq: 'weekly', priority: 0.8 })
    }
    for (const airline of TOP_AIRLINES) {
      entries.push({ url: `/airlines/${airline.slug}`, lastmod: now, changefreq: 'weekly', priority: 0.7 })
    }

    return entries
  }

  /** Lookup by city-name slug */
  getRouteBySlug(slug: string): RouteData | null {
    return this.generateRoutes().find(r => r.slug === slug) ?? null
  }

  getAirportBySlug(slug: string): AirportData | null {
    return TOP_AIRPORTS.find(a => a.slug === slug) ?? null
  }

  getDestinationBySlug(slug: string): DestinationData | null {
    return TOP_DESTINATIONS.find(d => d.slug === slug) ?? null
  }

  getAirlineBySlug(slug: string): AirlineData | null {
    return TOP_AIRLINES.find(a => a.slug === slug) ?? null
  }

  /** Generate meta tags for a route page */
  generateRouteMeta(route: RouteData) {
    return {
      title: `Cheap Flights ${route.originCity} to ${route.destinationCity} from $${route.lowestPrice} | Fly2Any`,
      description: `Find cheap flights from ${route.originCity} (${route.origin}) to ${route.destinationCity} (${route.destination}). Compare ${route.airlines.slice(0, 3).join(', ')} and more. Best prices from $${route.lowestPrice}. Book online 24/7.`,
      keywords: `${route.originCity} to ${route.destinationCity} flights, cheap flights ${route.origin} ${route.destination}, ${route.originCity} ${route.destinationCity} airfare, ${route.airlines.join(', ')}, fly ${route.originCity} to ${route.destinationCity}`,
    }
  }
}

export const seoEngine = new ProgrammaticSEOEngine()
