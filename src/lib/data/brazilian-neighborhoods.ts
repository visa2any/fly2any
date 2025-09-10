/**
 * ULTRATHINK BRAZILIAN NEIGHBORHOOD DATA
 * Hyperlocal targeting for Brazilian communities
 * Optimized for Service Area Business SEO strategy
 */

export interface BrazilianNeighborhood {
  id: string;
  name: string;
  cityId: string; // References brazilian-diaspora.ts
  cityName: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  demographics: {
    brazilianPopulation: number;
    totalPopulation: number;
    percentage: number;
    medianIncome: number;
    primaryLanguage: 'portuguese' | 'english' | 'spanish';
  };
  characteristics: {
    type: 'residential' | 'commercial' | 'mixed' | 'cultural';
    priceLevel: 'budget' | 'mid-range' | 'upscale' | 'luxury';
    travelFrequency: 'high' | 'medium' | 'low';
    familyOriented: boolean;
  };
  infrastructure: {
    brazilianBusinesses: string[];
    restaurants: string[];
    churches: string[];
    schools: string[];
    consulate: boolean;
    publicTransport: string[];
  };
  localKeywords: {
    portuguese: string[];
    english: string[];
    spanish: string[];
  };
  competitorPresence: {
    level: 'high' | 'medium' | 'low';
    competitors: string[];
  };
  priority: 'ultra-high' | 'high' | 'medium' | 'low';
  serviceArea: {
    radius: number; // miles
    adjacentNeighborhoods: string[];
  };
}

export const brazilianNeighborhoods: BrazilianNeighborhood[] = [
  // NEW YORK - ULTRA HIGH PRIORITY
  {
    id: 'long-island-city-ny',
    name: 'Long Island City',
    cityId: 'new-york-ny',
    cityName: 'New York',
    state: 'NY',
    country: 'USA',
    coordinates: { lat: 40.7505, lng: -73.9370 },
    demographics: {
      brazilianPopulation: 85000,
      totalPopulation: 167000,
      percentage: 50.9,
      medianIncome: 75000,
      primaryLanguage: 'portuguese'
    },
    characteristics: {
      type: 'mixed',
      priceLevel: 'mid-range',
      travelFrequency: 'high',
      familyOriented: true
    },
    infrastructure: {
      brazilianBusinesses: ['Açaí shops', 'Brazilian markets', 'Money transfer services', 'Beauty salons'],
      restaurants: ['Churrascarias', 'Açaí bowls', 'Padarias', 'Brazilian bakeries'],
      churches: ['Igreja Universal', 'Igreja Batista Brasileira', 'Igreja Assembleia de Deus'],
      schools: ['Brazilian Portuguese classes', 'Saturday schools'],
      consulate: false,
      publicTransport: ['7 train', 'N/W trains', 'Bus lines']
    },
    localKeywords: {
      portuguese: ['brasileiros long island city', 'voos lic brasil', 'comunidade brasileira queens'],
      english: ['brazilian long island city', 'flights lic brazil', 'brazilian community queens'],
      spanish: ['brasileños long island city', 'vuelos lic brasil']
    },
    competitorPresence: {
      level: 'medium',
      competitors: ['Local Brazilian agencies', 'Travel shops']
    },
    priority: 'ultra-high',
    serviceArea: {
      radius: 15,
      adjacentNeighborhoods: ['astoria-ny', 'sunnyside-ny', 'woodside-ny']
    }
  },
  {
    id: 'newark-nj',
    name: 'Newark (Ironbound)',
    cityId: 'new-york-ny',
    cityName: 'New York',
    state: 'NJ',
    country: 'USA',
    coordinates: { lat: 40.7356, lng: -74.1723 },
    demographics: {
      brazilianPopulation: 120000,
      totalPopulation: 280000,
      percentage: 42.8,
      medianIncome: 65000,
      primaryLanguage: 'portuguese'
    },
    characteristics: {
      type: 'cultural',
      priceLevel: 'mid-range',
      travelFrequency: 'high',
      familyOriented: true
    },
    infrastructure: {
      brazilianBusinesses: ['Ferry Street Brazilian corridor', 'Money transfer', 'Legal services'],
      restaurants: ['Ironbound restaurants', 'Brazilian steakhouses', 'Pastelerias'],
      churches: ['Multiple Brazilian churches', 'Portuguese Catholic churches'],
      schools: ['Portuguese Language School', 'Brazilian cultural center'],
      consulate: true,
      publicTransport: ['PATH train', 'NJ Transit', 'Bus connections to NYC']
    },
    localKeywords: {
      portuguese: ['brasileiros newark', 'ironbound brasileiros', 'ferry street brasil'],
      english: ['brazilian newark', 'ironbound brazilian', 'ferry street brazilian'],
      spanish: ['brasileños newark', 'ironbound brasileños']
    },
    competitorPresence: {
      level: 'high',
      competitors: ['Established Brazilian agencies', 'Travel consultants']
    },
    priority: 'ultra-high',
    serviceArea: {
      radius: 20,
      adjacentNeighborhoods: ['kearny-nj', 'elizabeth-nj', 'harrison-nj']
    }
  },

  // BOSTON - ULTRA HIGH PRIORITY
  {
    id: 'framingham-ma',
    name: 'Framingham',
    cityId: 'boston-ma',
    cityName: 'Boston',
    state: 'MA',
    country: 'USA',
    coordinates: { lat: 42.2793, lng: -71.4162 },
    demographics: {
      brazilianPopulation: 180000,
      totalPopulation: 240000,
      percentage: 75.0,
      medianIncome: 72000,
      primaryLanguage: 'portuguese'
    },
    characteristics: {
      type: 'cultural',
      priceLevel: 'mid-range',
      travelFrequency: 'high',
      familyOriented: true
    },
    infrastructure: {
      brazilianBusinesses: ['Brazilian Plaza', 'Açaí shops', 'Auto services', 'Beauty salons'],
      restaurants: ['Route 9 Brazilian corridor', 'Churrascarias', 'Padarias'],
      churches: ['Igreja Universal Framingham', 'Multiple Brazilian congregations'],
      schools: ['Brazilian Cultural Center', 'Portuguese weekend schools'],
      consulate: false,
      publicTransport: ['Commuter Rail', 'MBTA bus lines']
    },
    localKeywords: {
      portuguese: ['brasileiros framingham', 'voos framingham brasil', 'comunidade framingham'],
      english: ['brazilian framingham', 'flights framingham brazil', 'framingham brazilian community'],
      spanish: ['brasileños framingham', 'comunidad brasileña framingham']
    },
    competitorPresence: {
      level: 'medium',
      competitors: ['Local Brazilian travel agents', 'Community travel services']
    },
    priority: 'ultra-high',
    serviceArea: {
      radius: 25,
      adjacentNeighborhoods: ['marlborough-ma', 'natick-ma', 'ashland-ma']
    }
  },

  // MIAMI - ULTRA HIGH PRIORITY
  {
    id: 'brickell-fl',
    name: 'Brickell',
    cityId: 'miami-fl',
    cityName: 'Miami',
    state: 'FL',
    country: 'USA',
    coordinates: { lat: 25.7663, lng: -80.1917 },
    demographics: {
      brazilianPopulation: 95000,
      totalPopulation: 120000,
      percentage: 79.2,
      medianIncome: 125000,
      primaryLanguage: 'portuguese'
    },
    characteristics: {
      type: 'mixed',
      priceLevel: 'luxury',
      travelFrequency: 'high',
      familyOriented: false
    },
    infrastructure: {
      brazilianBusinesses: ['Luxury condos', 'Investment firms', 'High-end services'],
      restaurants: ['Upscale Brazilian restaurants', 'Fine dining', 'Rooftop bars'],
      churches: ['Igreja Universal Brickell'],
      schools: ['International schools'],
      consulate: true,
      publicTransport: ['Metromover', 'Metrobus', 'Metrorail']
    },
    localKeywords: {
      portuguese: ['brasileiros brickell', 'voos brickell brasil', 'luxury travel miami'],
      english: ['brazilian brickell', 'luxury flights brickell', 'high-end brazilian travel'],
      spanish: ['brasileños brickell', 'viajes de lujo brickell']
    },
    competitorPresence: {
      level: 'high',
      competitors: ['Luxury travel agencies', 'Concierge services']
    },
    priority: 'ultra-high',
    serviceArea: {
      radius: 12,
      adjacentNeighborhoods: ['downtown-miami-fl', 'key-biscayne-fl', 'coral-gables-fl']
    }
  },

  {
    id: 'aventura-fl',
    name: 'Aventura',
    cityId: 'miami-fl',
    cityName: 'Miami',
    state: 'FL',
    country: 'USA',
    coordinates: { lat: 25.9564, lng: -80.1389 },
    demographics: {
      brazilianPopulation: 75000,
      totalPopulation: 90000,
      percentage: 83.3,
      medianIncome: 110000,
      primaryLanguage: 'portuguese'
    },
    characteristics: {
      type: 'mixed',
      priceLevel: 'upscale',
      travelFrequency: 'high',
      familyOriented: true
    },
    infrastructure: {
      brazilianBusinesses: ['Aventura Mall Brazilian stores', 'Real estate offices', 'Banking services'],
      restaurants: ['Brazilian steakhouses', 'Casual dining', 'Shopping mall food court'],
      churches: ['Igreja Batista Brasileira Aventura'],
      schools: ['Private schools', 'Brazilian tutoring'],
      consulate: false,
      publicTransport: ['Bus routes', 'Uber/Lyft prevalent']
    },
    localKeywords: {
      portuguese: ['brasileiros aventura', 'aventura mall brasileiros', 'voos aventura brasil'],
      english: ['brazilian aventura', 'aventura mall brazilian', 'flights aventura brazil'],
      spanish: ['brasileños aventura', 'aventura mall brasileños']
    },
    competitorPresence: {
      level: 'medium',
      competitors: ['Mall travel kiosks', 'Online agencies']
    },
    priority: 'ultra-high',
    serviceArea: {
      radius: 15,
      adjacentNeighborhoods: ['sunny-isles-fl', 'hallandale-fl', 'north-miami-beach-fl']
    }
  },

  // ORLANDO - HIGH PRIORITY
  {
    id: 'kissimmee-fl',
    name: 'Kissimmee',
    cityId: 'orlando-fl',
    cityName: 'Orlando',
    state: 'FL',
    country: 'USA',
    coordinates: { lat: 28.2920, lng: -81.4076 },
    demographics: {
      brazilianPopulation: 85000,
      totalPopulation: 140000,
      percentage: 60.7,
      medianIncome: 58000,
      primaryLanguage: 'portuguese'
    },
    characteristics: {
      type: 'residential',
      priceLevel: 'budget',
      travelFrequency: 'high',
      familyOriented: true
    },
    infrastructure: {
      brazilianBusinesses: ['Tourist services', 'Vacation rentals', 'Brazilian markets'],
      restaurants: ['Family restaurants', 'Brazilian fast food', 'Tourist dining'],
      churches: ['Igreja Universal Kissimmee', 'Brazilian Protestant churches'],
      schools: ['Public schools with Brazilian programs'],
      consulate: false,
      publicTransport: ['Lynx bus system', 'Tourist shuttles']
    },
    localKeywords: {
      portuguese: ['brasileiros kissimmee', 'disney brasileiros', 'orlando brasileiro'],
      english: ['brazilian kissimmee', 'disney brazilian families', 'orlando brazilian'],
      spanish: ['brasileños kissimmee', 'disney brasileños', 'orlando brasileño']
    },
    competitorPresence: {
      level: 'medium',
      competitors: ['Disney travel packages', 'Tourist agencies']
    },
    priority: 'high',
    serviceArea: {
      radius: 20,
      adjacentNeighborhoods: ['celebration-fl', 'saint-cloud-fl', 'hunters-creek-fl']
    }
  },

  // ATLANTA - HIGH PRIORITY
  {
    id: 'marietta-ga',
    name: 'Marietta',
    cityId: 'atlanta-ga',
    cityName: 'Atlanta',
    state: 'GA',
    country: 'USA',
    coordinates: { lat: 33.9526, lng: -84.5499 },
    demographics: {
      brazilianPopulation: 45000,
      totalPopulation: 65000,
      percentage: 69.2,
      medianIncome: 68000,
      primaryLanguage: 'english'
    },
    characteristics: {
      type: 'residential',
      priceLevel: 'mid-range',
      travelFrequency: 'medium',
      familyOriented: true
    },
    infrastructure: {
      brazilianBusinesses: ['Brazilian restaurants', 'Soccer clubs', 'Community centers'],
      restaurants: ['Brazilian steakhouses', 'Family dining'],
      churches: ['Igreja Batista Brasileira Marietta'],
      schools: ['Cobb County Brazilian programs'],
      consulate: false,
      publicTransport: ['CobbLinc bus', 'MARTA connections']
    },
    localKeywords: {
      portuguese: ['brasileiros marietta', 'comunidade brasileira cobb county'],
      english: ['brazilian marietta', 'brazilian community cobb county', 'flights marietta brazil'],
      spanish: ['brasileños marietta', 'comunidad brasileña marietta']
    },
    competitorPresence: {
      level: 'low',
      competitors: ['Local travel agents', 'Online booking sites']
    },
    priority: 'high',
    serviceArea: {
      radius: 25,
      adjacentNeighborhoods: ['kennesaw-ga', 'smyrna-ga', 'roswell-ga']
    }
  },

  // LOS ANGELES - HIGH PRIORITY
  {
    id: 'beverly-hills-ca',
    name: 'Beverly Hills',
    cityId: 'los-angeles-ca',
    cityName: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    coordinates: { lat: 34.0736, lng: -118.4004 },
    demographics: {
      brazilianPopulation: 25000,
      totalPopulation: 34000,
      percentage: 73.5,
      medianIncome: 185000,
      primaryLanguage: 'english'
    },
    characteristics: {
      type: 'mixed',
      priceLevel: 'luxury',
      travelFrequency: 'high',
      familyOriented: false
    },
    infrastructure: {
      brazilianBusinesses: ['Luxury boutiques', 'High-end services', 'Investment firms'],
      restaurants: ['Fine dining', 'Celebrity chef restaurants'],
      churches: ['High-end congregations'],
      schools: ['Private elite schools'],
      consulate: true,
      publicTransport: ['Metro lines', 'Premium car services']
    },
    localKeywords: {
      portuguese: ['brasileiros beverly hills', 'luxury travel brasil'],
      english: ['brazilian beverly hills', 'luxury flights brazil', 'high-end brazilian travel'],
      spanish: ['brasileños beverly hills', 'viajes de lujo brasil']
    },
    competitorPresence: {
      level: 'high',
      competitors: ['Luxury travel agencies', 'High-end concierge services']
    },
    priority: 'high',
    serviceArea: {
      radius: 10,
      adjacentNeighborhoods: ['west-hollywood-ca', 'santa-monica-ca', 'century-city-ca']
    }
  }
];

// Helper functions for neighborhood data access
export function getNeighborhoodsByCity(cityId: string) {
  return brazilianNeighborhoods.filter(neighborhood => neighborhood.cityId === cityId);
}

export function getNeighborhoodsByPriority(priority: string) {
  return brazilianNeighborhoods.filter(neighborhood => neighborhood.priority === priority);
}

export function getHighDensityNeighborhoods(minPercentage: number = 50) {
  return brazilianNeighborhoods.filter(
    neighborhood => neighborhood.demographics.percentage >= minPercentage
  );
}

export function getNeighborhoodsByTravelFrequency(frequency: 'high' | 'medium' | 'low') {
  return brazilianNeighborhoods.filter(
    neighborhood => neighborhood.characteristics.travelFrequency === frequency
  );
}

export function getServiceAreaNeighborhoods(neighborhoodId: string) {
  const neighborhood = brazilianNeighborhoods.find(n => n.id === neighborhoodId);
  if (!neighborhood) return [];
  
  return brazilianNeighborhoods.filter(n => 
    neighborhood.serviceArea.adjacentNeighborhoods.includes(n.id)
  );
}

export default brazilianNeighborhoods;