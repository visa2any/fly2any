/**
 * ULTRATHINK BRAZILIAN DIASPORA DATA
 * Comprehensive targeting data for Brazilian communities worldwide
 * Optimized for trilingual SEO (PT/ES/EN)
 */

export interface BrazilianCity {
  id: string;
  name: string;
  country: string;
  state?: string;
  region: string;
  population: {
    brazilian: number;
    total: number;
    percentage: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  neighborhoods: string[];
  languages: {
    primary: string;
    secondary: string[];
    portugueseLevel: 'high' | 'medium' | 'low';
  };
  infrastructure: {
    consulate: boolean;
    brazilianMedia: string[];
    churches: string[];
    schools: string[];
    businesses: string[];
  };
  flightRoutes: {
    primaryDestinations: string[];
    airlines: string[];
    avgPrice: number;
  };
  keywords: {
    portuguese: string[];
    english: string[];
    spanish: string[];
    local: string[];
  };
  competition: {
    level: 'high' | 'medium' | 'low';
    mainCompetitors: string[];
  };
  priority: 'ultra-high' | 'high' | 'medium' | 'low';
}

export const brazilianDiaspora: BrazilianCity[] = [
  // ULTRA-HIGH PRIORITY - USA MAJOR CENTERS
  {
    id: 'new-york-ny',
    name: 'New York',
    country: 'USA',
    state: 'NY',
    region: 'Northeast',
    population: {
      brazilian: 500000,
      total: 8400000,
      percentage: 5.95
    },
    coordinates: { lat: 40.7128, lng: -74.0060 },
    neighborhoods: ['Long Island City', 'Newark', 'Kearny', 'Astoria', 'Queens'],
    languages: {
      primary: 'english',
      secondary: ['portuguese', 'spanish'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Brazilian Voice', 'New York Portuguese Radio', 'Luso-Americano'],
      churches: ['Igreja Batista Brasileira', 'Igreja Universal NY', 'Igreja Adventista Brasileira'],
      schools: ['Brazilian American Cultural Center', 'Portuguese Language School'],
      businesses: ['Ironbound District restaurants', 'Brazilian markets', 'Money transfer services']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'SSA', 'REC', 'FOR'],
      airlines: ['LATAM', 'American', 'Delta', 'Avianca'],
      avgPrice: 850
    },
    keywords: {
      portuguese: ['brasileiros nova york', 'voos nova york brasil', 'comunidade brasileira ny', 'passagens aereas jfk sao paulo'],
      english: ['brazilian community new york', 'flights new york brazil', 'jfk to sao paulo', 'brazilian travel ny'],
      spanish: ['comunidad brasileña nueva york', 'vuelos nueva york brasil'],
      local: ['ironbound brazilian', 'newark brazilian', 'astoria brazilian']
    },
    competition: {
      level: 'high',
      mainCompetitors: ['Expedia', 'Kayak', 'Brazilian travel agencies']
    },
    priority: 'ultra-high'
  },

  {
    id: 'boston-ma',
    name: 'Boston',
    country: 'USA',
    state: 'MA',
    region: 'Northeast',
    population: {
      brazilian: 420000,
      total: 700000,
      percentage: 60.0
    },
    coordinates: { lat: 42.3601, lng: -71.0589 },
    neighborhoods: ['Framingham', 'Somerville', 'Marlborough', 'Everett', 'Malden'],
    languages: {
      primary: 'portuguese',
      secondary: ['english', 'spanish'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Portuguese Times', 'Luso-Americano', 'WSRO 650 AM'],
      churches: ['Igreja Batista Brasileira Boston', 'Igreja Pentecostal', 'Igreja Catolica Brasileira'],
      schools: ['Brazilian Cultural Center', 'Portuguese American Federation'],
      businesses: ['Brazilian restaurants Framingham', 'Açaí shops', 'Soccer clubs']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'BH', 'VCP'],
      airlines: ['LATAM', 'American', 'TAP Air Portugal'],
      avgPrice: 780
    },
    keywords: {
      portuguese: ['brasileiros boston', 'framingham brasileiros', 'voos boston brasil', 'comunidade brasileira massachusetts'],
      english: ['brazilian community boston', 'flights boston brazil', 'framingham brazilian', 'logan to sao paulo'],
      spanish: ['comunidad brasileña boston', 'vuelos boston brasil'],
      local: ['framingham brazilian restaurants', 'marlborough brazilian', 'somerville portuguese']
    },
    competition: {
      level: 'medium',
      mainCompetitors: ['Local Brazilian agencies', 'TAP Air Portugal']
    },
    priority: 'ultra-high'
  },

  {
    id: 'miami-fl',
    name: 'Miami',
    country: 'USA',
    state: 'FL',
    region: 'Southeast',
    population: {
      brazilian: 400000,
      total: 470000,
      percentage: 85.1
    },
    coordinates: { lat: 25.7617, lng: -80.1918 },
    neighborhoods: ['Brickell', 'Aventura', 'Doral', 'Sunny Isles', 'Bal Harbour'],
    languages: {
      primary: 'portuguese',
      secondary: ['english', 'spanish'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Brazilian International', 'Rede Globo Miami', 'SBT International'],
      churches: ['Igreja Batista Brasileira Miami', 'Igreja Universal Miami', 'Igreja Quadrangular'],
      schools: ['Brazilian American School', 'Colégio Miguel de Cervantes'],
      businesses: ['Brazilian restaurants Brickell', 'Real estate agencies', 'Luxury shopping']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'SSA', 'REC', 'BSB'],
      airlines: ['LATAM', 'American', 'Avianca', 'Copa Airlines'],
      avgPrice: 650
    },
    keywords: {
      portuguese: ['brasileiros miami', 'voos miami brasil', 'brickell brasileiros', 'comunidade brasileira florida'],
      english: ['brazilian community miami', 'flights miami brazil', 'brazilian brickell', 'mia to sao paulo'],
      spanish: ['comunidad brasileña miami', 'vuelos miami brasil', 'brasileños aventura'],
      local: ['doral brazilian', 'aventura brazilian restaurants', 'sunny isles brazilian']
    },
    competition: {
      level: 'high',
      mainCompetitors: ['LATAM direct', 'Brazilian tour operators', 'Local agencies']
    },
    priority: 'ultra-high'
  },

  {
    id: 'orlando-fl',
    name: 'Orlando',
    country: 'USA',
    state: 'FL',
    region: 'Southeast',
    population: {
      brazilian: 190000,
      total: 310000,
      percentage: 61.3
    },
    coordinates: { lat: 28.5383, lng: -81.3792 },
    neighborhoods: ['International Drive', 'Lake Buena Vista', 'Kissimmee', 'Winter Park'],
    languages: {
      primary: 'portuguese',
      secondary: ['english', 'spanish'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Brazilian Times Orlando', 'SBT International', 'Rede Globo'],
      churches: ['Igreja Batista Brasileira Orlando', 'Igreja Pentecostal', 'Igreja Universal'],
      schools: ['Brazilian Cultural Center Orlando'],
      businesses: ['Disney Brazilian services', 'Tourist agencies', 'Brazilian restaurants']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'SSA', 'REC'],
      airlines: ['LATAM', 'American', 'JetBlue'],
      avgPrice: 680
    },
    keywords: {
      portuguese: ['brasileiros orlando', 'voos orlando brasil', 'disney brasileiros', 'kissimmee brasileiros'],
      english: ['brazilian community orlando', 'flights orlando brazil', 'brazilian disney', 'mco to sao paulo'],
      spanish: ['comunidad brasileña orlando', 'vuelos orlando brasil'],
      local: ['kissimmee brazilian restaurants', 'international drive brazilian', 'lake buena vista']
    },
    competition: {
      level: 'medium',
      mainCompetitors: ['Disney travel', 'LATAM', 'Local tour operators']
    },
    priority: 'ultra-high'
  },

  {
    id: 'atlanta-ga',
    name: 'Atlanta',
    country: 'USA',
    state: 'GA',
    region: 'Southeast',
    population: {
      brazilian: 120000,
      total: 500000,
      percentage: 24.0
    },
    coordinates: { lat: 33.7490, lng: -84.3880 },
    neighborhoods: ['Marietta', 'Duluth', 'Norcross', 'Sandy Springs'],
    languages: {
      primary: 'english',
      secondary: ['portuguese', 'spanish'],
      portugueseLevel: 'medium'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Brazilian Times Atlanta', 'Jornal Brazilian News'],
      churches: ['Igreja Batista Brasileira Atlanta', 'Igreja Universal'],
      schools: ['Brazilian Cultural Association'],
      businesses: ['Brazilian restaurants Marietta', 'Soccer clubs']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'SSA'],
      airlines: ['Delta', 'LATAM', 'American'],
      avgPrice: 750
    },
    keywords: {
      portuguese: ['brasileiros atlanta', 'voos atlanta brasil', 'marietta brasileiros', 'comunidade brasileira georgia'],
      english: ['brazilian community atlanta', 'flights atlanta brazil', 'atl to sao paulo', 'brazilian marietta'],
      spanish: ['comunidad brasileña atlanta', 'vuelos atlanta brasil'],
      local: ['marietta brazilian restaurants', 'duluth brazilian', 'norcross portuguese']
    },
    competition: {
      level: 'medium',
      mainCompetitors: ['Delta direct routes', 'Local agencies']
    },
    priority: 'high'
  },

  {
    id: 'los-angeles-ca',
    name: 'Los Angeles',
    country: 'USA',
    state: 'CA',
    region: 'West',
    population: {
      brazilian: 120000,
      total: 4000000,
      percentage: 3.0
    },
    coordinates: { lat: 34.0522, lng: -118.2437 },
    neighborhoods: ['Beverly Hills', 'West Hollywood', 'Santa Monica', 'Manhattan Beach'],
    languages: {
      primary: 'english',
      secondary: ['spanish', 'portuguese'],
      portugueseLevel: 'medium'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Brazilian Press', 'LA Brazilian Community'],
      churches: ['Igreja Universal LA', 'Igreja Batista Brasileira'],
      schools: ['Brazilian Cultural Center LA'],
      businesses: ['High-end Brazilian restaurants', 'Entertainment industry contacts']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG'],
      airlines: ['LATAM', 'American', 'United'],
      avgPrice: 950
    },
    keywords: {
      portuguese: ['brasileiros los angeles', 'voos los angeles brasil', 'beverly hills brasileiros'],
      english: ['brazilian community los angeles', 'flights los angeles brazil', 'lax to sao paulo'],
      spanish: ['comunidad brasileña los angeles', 'vuelos los angeles brasil', 'brasileños beverly hills'],
      local: ['west hollywood brazilian', 'santa monica brazilian restaurants', 'manhattan beach']
    },
    competition: {
      level: 'high',
      mainCompetitors: ['Major airlines', 'Online travel agencies']
    },
    priority: 'high'
  },

  // INTERNATIONAL - HIGH PRIORITY
  {
    id: 'lisbon-portugal',
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Europe',
    population: {
      brazilian: 513000,
      total: 550000,
      percentage: 93.3
    },
    coordinates: { lat: 38.7223, lng: -9.1393 },
    neighborhoods: ['Martim Moniz', 'Alameda', 'Campo de Ourique', 'Arroios'],
    languages: {
      primary: 'portuguese',
      secondary: ['english'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Mundo Lusíada', 'Luso-Jornal', 'RTP Internacional'],
      churches: ['Igreja Universal Lisboa', 'Igreja Batista Brasileira'],
      schools: ['Colégio Miguel Torga', 'EPABI'],
      businesses: ['Brazilian restaurants', 'Money transfer', 'Legal services']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'SSA', 'REC', 'BSB'],
      airlines: ['TAP Air Portugal', 'LATAM', 'Azul'],
      avgPrice: 450
    },
    keywords: {
      portuguese: ['brasileiros lisboa', 'voos lisboa brasil', 'martim moniz brasileiros', 'comunidade brasileira portugal'],
      english: ['brazilian community lisbon', 'flights lisbon brazil', 'lis to sao paulo'],
      spanish: ['comunidad brasileña lisboa'],
      local: ['arroios brazilian', 'alameda brazilian restaurants']
    },
    competition: {
      level: 'high',
      mainCompetitors: ['TAP Air Portugal', 'Local Portuguese agencies']
    },
    priority: 'ultra-high'
  },

  {
    id: 'london-uk',
    name: 'London',
    country: 'United Kingdom',
    region: 'Europe',
    population: {
      brazilian: 220000,
      total: 9000000,
      percentage: 2.4
    },
    coordinates: { lat: 51.5074, lng: -0.1278 },
    neighborhoods: ['Stockwell', 'Elephant and Castle', 'Bayswater', 'Kilburn'],
    languages: {
      primary: 'english',
      secondary: ['portuguese'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Brazilian Times UK', 'London Brazilian Community'],
      churches: ['Igreja Universal Londres', 'Igreja Batista Brasileira'],
      schools: ['Brazilian Educational Centre'],
      businesses: ['Brazilian restaurants Bayswater', 'Financial services', 'Capoeira schools']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'SSA'],
      airlines: ['British Airways', 'LATAM', 'Virgin Atlantic'],
      avgPrice: 600
    },
    keywords: {
      portuguese: ['brasileiros londres', 'voos londres brasil', 'stockwell brasileiros', 'comunidade brasileira reino unido'],
      english: ['brazilian community london', 'flights london brazil', 'lhr to sao paulo', 'brazilian stockwell'],
      spanish: ['comunidad brasileña londres'],
      local: ['elephant castle brazilian', 'bayswater brazilian restaurants', 'kilburn portuguese']
    },
    competition: {
      level: 'high',
      mainCompetitors: ['British Airways', 'Virgin Atlantic', 'Online agencies']
    },
    priority: 'high'
  },

  {
    id: 'tokyo-japan',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    population: {
      brazilian: 267456,
      total: 14000000,
      percentage: 1.9
    },
    coordinates: { lat: 35.6762, lng: 139.6503 },
    neighborhoods: ['Oizumi', 'Nippori', 'Shin-Okubo', 'Kasai'],
    languages: {
      primary: 'japanese',
      secondary: ['portuguese', 'english'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Made in Japan', 'International Press', 'Jornal Tudo Bem'],
      churches: ['Igreja Católica Brasileira', 'Igreja Universal Tokyo'],
      schools: ['Colégio Pitágoras', 'Escola Brasileira'],
      businesses: ['Brazilian supermarkets', 'Dekasegi services', 'Money transfer']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'VCP'],
      airlines: ['LATAM', 'ANA', 'JAL'],
      avgPrice: 1200
    },
    keywords: {
      portuguese: ['brasileiros toquio', 'dekasegi', 'voos toquio brasil', 'comunidade brasileira japao'],
      english: ['brazilian community tokyo', 'flights tokyo brazil', 'nrt to sao paulo', 'dekasegi community'],
      spanish: ['comunidad brasileña tokio'],
      local: ['oizumi brazilian', 'nippori dekasegi', 'kasai brazilian supermarket']
    },
    competition: {
      level: 'medium',
      mainCompetitors: ['LATAM', 'Dekasegi agencies', 'Japanese travel companies']
    },
    priority: 'high'
  },

  {
    id: 'toronto-canada',
    name: 'Toronto',
    country: 'Canada',
    region: 'North America',
    population: {
      brazilian: 80000,
      total: 2930000,
      percentage: 2.7
    },
    coordinates: { lat: 43.6532, lng: -79.3832 },
    neighborhoods: ['Little Brazil', 'Kensington Market', 'Ossington', 'Dundas West'],
    languages: {
      primary: 'english',
      secondary: ['portuguese', 'french'],
      portugueseLevel: 'high'
    },
    infrastructure: {
      consulate: true,
      brazilianMedia: ['Milénio Stadium', 'Brazilian Times Canada'],
      churches: ['Igreja Universal Toronto', 'Igreja Batista Brasileira'],
      schools: ['Brazilian Cultural Centre'],
      businesses: ['Brazilian restaurants', 'Soccer clubs', 'Capoeira schools']
    },
    flightRoutes: {
      primaryDestinations: ['GRU', 'GIG', 'SSA'],
      airlines: ['Air Canada', 'LATAM', 'American'],
      avgPrice: 800
    },
    keywords: {
      portuguese: ['brasileiros toronto', 'voos toronto brasil', 'little brazil toronto', 'comunidade brasileira canada'],
      english: ['brazilian community toronto', 'flights toronto brazil', 'yyz to sao paulo', 'little brazil'],
      spanish: ['comunidad brasileña toronto'],
      local: ['kensington market brazilian', 'ossington brazilian restaurants', 'dundas west brazilian']
    },
    competition: {
      level: 'medium',
      mainCompetitors: ['Air Canada', 'Local agencies']
    },
    priority: 'high'
  }
];

// Helper functions for data access
export function getBrazilianCitiesByPriority(priority: string) {
  return brazilianDiaspora.filter(city => city.priority === priority);
}

export function getBrazilianCitiesByCountry(country: string) {
  return brazilianDiaspora.filter(city => city.country === country);
}

export function getBrazilianCitiesByLanguage(language: string) {
  return brazilianDiaspora.filter(city => 
    city.languages.primary === language || 
    city.languages.secondary.includes(language)
  );
}

export function getTopBrazilianCities(limit: number = 10) {
  return brazilianDiaspora
    .sort((a, b) => b.population.brazilian - a.population.brazilian)
    .slice(0, limit);
}

export function getCityKeywords(cityId: string, language: 'portuguese' | 'english' | 'spanish' = 'portuguese') {
  const city = brazilianDiaspora.find(c => c.id === cityId);
  return city?.keywords[language] || [];
}

export function getCitiesWithHighPortuguese() {
  return brazilianDiaspora.filter(city => city.languages.portugueseLevel === 'high');
}

export default brazilianDiaspora;