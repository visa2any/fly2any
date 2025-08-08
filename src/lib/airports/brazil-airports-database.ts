/**
 * 🇧🇷 COMPREHENSIVE BRAZIL AIRPORTS DATABASE
 * Complete database of Brazilian airports with major hubs, regional airports, and international gateways
 * Data optimized for flight booking and search functionality
 */

export interface BrazilAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  region: 'Southeast' | 'South' | 'Northeast' | 'North' | 'Center-West';
  country: 'Brazil';
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  elevation: number; // meters above sea level
  category: 'major_hub' | 'hub' | 'regional' | 'international_gateway' | 'focus_city' | 'small_hub';
  isInternational: boolean;
  passengerCount: number; // annual passengers (millions)
  airlines: string[]; // major airlines operating at this airport
  terminals: number;
  runways: number;
  popularDestinations: string[]; // IATA codes of popular routes
  searchKeywords: string[]; // additional search terms
  weatherStation?: string;
  groundTransport: ('metro' | 'train' | 'bus' | 'taxi' | 'rideshare' | 'rental_car')[];
  amenities: ('wifi' | 'lounges' | 'shopping' | 'dining' | 'hotels' | 'spa' | 'conference')[];
}

/**
 * MAJOR BRAZILIAN AIRPORT HUBS - Top tier airports
 */
export const BRAZIL_MAJOR_HUBS: BrazilAirport[] = [
  // São Paulo-Guarulhos International Airport
  {
    iataCode: 'GRU',
    icaoCode: 'SBGR',
    name: 'São Paulo-Guarulhos International Airport',
    city: 'São Paulo',
    state: 'São Paulo',
    stateCode: 'SP',
    region: 'Southeast',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -23.4356, longitude: -46.4731 },
    elevation: 750,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 42.0,
    airlines: ['LA', 'G3', 'AD', 'JJ', 'O6'],
    terminals: 3,
    runways: 2,
    popularDestinations: ['GIG', 'BSB', 'CGH', 'SDU', 'CNF', 'REC', 'SSA', 'FOR'],
    searchKeywords: ['sao paulo', 'guarulhos', 'sp', 'sampa', 'paulista'],
    groundTransport: ['train', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Rio de Janeiro-Galeão International Airport
  {
    iataCode: 'GIG',
    icaoCode: 'SBGL',
    name: 'Rio de Janeiro-Galeão International Airport',
    city: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    stateCode: 'RJ',
    region: 'Southeast',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -22.8099, longitude: -43.2505 },
    elevation: 9,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 17.2,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['GRU', 'BSB', 'CGH', 'SDU', 'CNF', 'SSA', 'REC', 'FOR'],
    searchKeywords: ['rio de janeiro', 'galeao', 'rj', 'cidade maravilhosa', 'carioca'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // Brasília International Airport
  {
    iataCode: 'BSB',
    icaoCode: 'SBBR',
    name: 'Brasília International Airport',
    city: 'Brasília',
    state: 'Distrito Federal',
    stateCode: 'DF',
    region: 'Center-West',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -15.8711, longitude: -47.9172 },
    elevation: 1061,
    category: 'major_hub',
    isInternational: true,
    passengerCount: 18.8,
    airlines: ['LA', 'G3', 'AD', 'JJ', 'O6'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['GRU', 'GIG', 'CGH', 'SDU', 'CNF', 'SSA', 'REC', 'FOR'],
    searchKeywords: ['brasilia', 'capital', 'df', 'distrito federal', 'planalto'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels', 'spa', 'conference']
  },

  // São Paulo-Congonhas Airport
  {
    iataCode: 'CGH',
    icaoCode: 'SBSP',
    name: 'São Paulo-Congonhas Airport',
    city: 'São Paulo',
    state: 'São Paulo',
    stateCode: 'SP',
    region: 'Southeast',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -23.6266, longitude: -46.6565 },
    elevation: 803,
    category: 'hub',
    isInternational: false,
    passengerCount: 20.4,
    airlines: ['LA', 'G3', 'AD', 'JJ'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['BSB', 'GIG', 'SDU', 'REC', 'SSA', 'FOR', 'POA', 'CWB'],
    searchKeywords: ['sao paulo', 'congonhas', 'sp', 'centro', 'domestic'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  },

  // Rio de Janeiro-Santos Dumont Airport
  {
    iataCode: 'SDU',
    icaoCode: 'SBRJ',
    name: 'Rio de Janeiro-Santos Dumont Airport',
    city: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    stateCode: 'RJ',
    region: 'Southeast',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -22.9105, longitude: -43.1634 },
    elevation: 3,
    category: 'hub',
    isInternational: false,
    passengerCount: 9.2,
    airlines: ['LA', 'G3', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['CGH', 'BSB', 'PLU', 'BPS', 'CNF', 'SSA', 'REC', 'FOR'],
    searchKeywords: ['rio de janeiro', 'santos dumont', 'centro', 'rj', 'domestic'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * MAJOR BRAZILIAN HUB AIRPORTS - Second tier important airports
 */
export const BRAZIL_HUB_AIRPORTS: BrazilAirport[] = [
  // Belo Horizonte-Confins International Airport
  {
    iataCode: 'CNF',
    icaoCode: 'SBCF',
    name: 'Belo Horizonte-Confins International Airport',
    city: 'Belo Horizonte',
    state: 'Minas Gerais',
    stateCode: 'MG',
    region: 'Southeast',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -19.6244, longitude: -43.9719 },
    elevation: 827,
    category: 'hub',
    isInternational: true,
    passengerCount: 10.9,
    airlines: ['LA', 'G3', 'AD', 'JJ', 'O6'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'SDU', 'SSA', 'REC', 'FOR'],
    searchKeywords: ['belo horizonte', 'confins', 'mg', 'minas gerais', 'tancredo neves'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Salvador International Airport
  {
    iataCode: 'SSA',
    icaoCode: 'SBSV',
    name: 'Salvador Bahia Airport',
    city: 'Salvador',
    state: 'Bahia',
    stateCode: 'BA',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Bahia',
    coordinates: { latitude: -12.9111, longitude: -38.3222 },
    elevation: 20,
    category: 'hub',
    isInternational: true,
    passengerCount: 7.8,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'CNF', 'REC', 'FOR', 'MAO'],
    searchKeywords: ['salvador', 'bahia', 'ba', 'nordeste', 'deputado luis eduardo magalhaes'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Recife International Airport
  {
    iataCode: 'REC',
    icaoCode: 'SBRF',
    name: 'Recife International Airport',
    city: 'Recife',
    state: 'Pernambuco',
    stateCode: 'PE',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Recife',
    coordinates: { latitude: -8.1265, longitude: -34.9236 },
    elevation: 10,
    category: 'hub',
    isInternational: true,
    passengerCount: 8.4,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 2,
    runways: 2,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'SSA', 'FOR', 'MAO', 'BEL'],
    searchKeywords: ['recife', 'pernambuco', 'pe', 'nordeste', 'guararapes'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Fortaleza International Airport
  {
    iataCode: 'FOR',
    icaoCode: 'SBFZ',
    name: 'Fortaleza Pinto Martins International Airport',
    city: 'Fortaleza',
    state: 'Ceará',
    stateCode: 'CE',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Fortaleza',
    coordinates: { latitude: -3.7763, longitude: -38.5326 },
    elevation: 25,
    category: 'hub',
    isInternational: true,
    passengerCount: 6.2,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'REC', 'SSA', 'MAO', 'BEL'],
    searchKeywords: ['fortaleza', 'ceara', 'ce', 'nordeste', 'pinto martins'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Porto Alegre International Airport
  {
    iataCode: 'POA',
    icaoCode: 'SBPA',
    name: 'Porto Alegre Salgado Filho International Airport',
    city: 'Porto Alegre',
    state: 'Rio Grande do Sul',
    stateCode: 'RS',
    region: 'South',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -29.9939, longitude: -51.1714 },
    elevation: 3,
    category: 'hub',
    isInternational: true,
    passengerCount: 8.6,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'CWB', 'FLN', 'CNF', 'SSA'],
    searchKeywords: ['porto alegre', 'rs', 'rio grande do sul', 'sul', 'salgado filho'],
    groundTransport: ['metro', 'bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Curitiba International Airport
  {
    iataCode: 'CWB',
    icaoCode: 'SBCT',
    name: 'Curitiba Afonso Pena International Airport',
    city: 'Curitiba',
    state: 'Paraná',
    stateCode: 'PR',
    region: 'South',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -25.5275, longitude: -49.1758 },
    elevation: 911,
    category: 'hub',
    isInternational: true,
    passengerCount: 6.4,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 1,
    runways: 2,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'POA', 'FLN', 'CNF', 'SSA'],
    searchKeywords: ['curitiba', 'parana', 'pr', 'sul', 'afonso pena'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Manaus International Airport
  {
    iataCode: 'MAO',
    icaoCode: 'SBEG',
    name: 'Manaus Eduardo Gomes International Airport',
    city: 'Manaus',
    state: 'Amazonas',
    stateCode: 'AM',
    region: 'North',
    country: 'Brazil',
    timezone: 'America/Manaus',
    coordinates: { latitude: -3.0386, longitude: -60.0497 },
    elevation: 84,
    category: 'hub',
    isInternational: true,
    passengerCount: 2.8,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'BEL', 'SSA', 'REC', 'FOR'],
    searchKeywords: ['manaus', 'amazonas', 'am', 'norte', 'amazonia', 'eduardo gomes'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining', 'hotels']
  },

  // Belém International Airport
  {
    iataCode: 'BEL',
    icaoCode: 'SBBE',
    name: 'Belém Val de Cans International Airport',
    city: 'Belém',
    state: 'Pará',
    stateCode: 'PA',
    region: 'North',
    country: 'Brazil',
    timezone: 'America/Belem',
    coordinates: { latitude: -1.3793, longitude: -48.4781 },
    elevation: 16,
    category: 'regional',
    isInternational: true,
    passengerCount: 2.6,
    airlines: ['G3', 'LA', 'AD', 'JJ', 'O6'],
    terminals: 2,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'MAO', 'SSA', 'REC', 'FOR'],
    searchKeywords: ['belem', 'para', 'pa', 'norte', 'amazonia', 'val de cans'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'lounges', 'shopping', 'dining']
  }
];

/**
 * REGIONAL BRAZILIAN AIRPORTS - Important regional and state capital airports
 */
export const BRAZIL_REGIONAL_AIRPORTS: BrazilAirport[] = [
  // Florianópolis International Airport
  {
    iataCode: 'FLN',
    icaoCode: 'SBFL',
    name: 'Florianópolis Hercílio Luz International Airport',
    city: 'Florianópolis',
    state: 'Santa Catarina',
    stateCode: 'SC',
    region: 'South',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -27.6703, longitude: -48.5525 },
    elevation: 5,
    category: 'regional',
    isInternational: true,
    passengerCount: 4.2,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'POA', 'CWB', 'CNF', 'SSA'],
    searchKeywords: ['florianopolis', 'santa catarina', 'sc', 'sul', 'ilha', 'hercilio luz'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Goiânia Airport
  {
    iataCode: 'GYN',
    icaoCode: 'SBGO',
    name: 'Goiânia Santa Genoveva Airport',
    city: 'Goiânia',
    state: 'Goiás',
    stateCode: 'GO',
    region: 'Center-West',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -16.6320, longitude: -49.2206 },
    elevation: 742,
    category: 'regional',
    isInternational: false,
    passengerCount: 1.9,
    airlines: ['LA', 'G3', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'CNF', 'SSA', 'CGB', 'THE'],
    searchKeywords: ['goiania', 'goias', 'go', 'centro-oeste', 'santa genoveva'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Cuiabá International Airport
  {
    iataCode: 'CGB',
    icaoCode: 'SBCY',
    name: 'Cuiabá Marechal Rondon International Airport',
    city: 'Cuiabá',
    state: 'Mato Grosso',
    stateCode: 'MT',
    region: 'Center-West',
    country: 'Brazil',
    timezone: 'America/Cuiaba',
    coordinates: { latitude: -15.6529, longitude: -56.1168 },
    elevation: 165,
    category: 'regional',
    isInternational: true,
    passengerCount: 3.2,
    airlines: ['LA', 'G3', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'CNF', 'SSA', 'GYN', 'THE'],
    searchKeywords: ['cuiaba', 'mato grosso', 'mt', 'centro-oeste', 'pantanal', 'marechal rondon'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Campo Grande Airport
  {
    iataCode: 'CGR',
    icaoCode: 'SBCG',
    name: 'Campo Grande International Airport',
    city: 'Campo Grande',
    state: 'Mato Grosso do Sul',
    stateCode: 'MS',
    region: 'Center-West',
    country: 'Brazil',
    timezone: 'America/Campo_Grande',
    coordinates: { latitude: -20.4689, longitude: -54.6725 },
    elevation: 532,
    category: 'regional',
    isInternational: false,
    passengerCount: 1.4,
    airlines: ['LA', 'G3', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'CNF', 'CGB', 'THE', 'SSA'],
    searchKeywords: ['campo grande', 'mato grosso do sul', 'ms', 'centro-oeste', 'pantanal'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Natal International Airport
  {
    iataCode: 'NAT',
    icaoCode: 'SBNT',
    name: 'Natal Governador Aluízio Alves International Airport',
    city: 'Natal',
    state: 'Rio Grande do Norte',
    stateCode: 'RN',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Fortaleza',
    coordinates: { latitude: -5.9111, longitude: -35.2478 },
    elevation: 48,
    category: 'regional',
    isInternational: true,
    passengerCount: 3.4,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'REC', 'FOR', 'SSA', 'CGH', 'CNF'],
    searchKeywords: ['natal', 'rio grande do norte', 'rn', 'nordeste', 'aluizio alves'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // João Pessoa Airport
  {
    iataCode: 'JPA',
    icaoCode: 'SBJP',
    name: 'João Pessoa Presidente Castro Pinto International Airport',
    city: 'João Pessoa',
    state: 'Paraíba',
    stateCode: 'PB',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Fortaleza',
    coordinates: { latitude: -7.1469, longitude: -34.9494 },
    elevation: 64,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.2,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'REC', 'FOR', 'SSA', 'BSB', 'CGH', 'CNF'],
    searchKeywords: ['joao pessoa', 'paraiba', 'pb', 'nordeste', 'castro pinto'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Maceió Airport
  {
    iataCode: 'MCZ',
    icaoCode: 'SBMO',
    name: 'Maceió Zumbi dos Palmares International Airport',
    city: 'Maceió',
    state: 'Alagoas',
    stateCode: 'AL',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Maceio',
    coordinates: { latitude: -9.5108, longitude: -35.7917 },
    elevation: 115,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.8,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'REC', 'SSA', 'FOR', 'BSB', 'CGH', 'CNF'],
    searchKeywords: ['maceio', 'alagoas', 'al', 'nordeste', 'zumbi dos palmares'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Aracaju Airport
  {
    iataCode: 'AJU',
    icaoCode: 'SBAR',
    name: 'Aracaju Santa Maria Airport',
    city: 'Aracaju',
    state: 'Sergipe',
    stateCode: 'SE',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Maceio',
    coordinates: { latitude: -10.9840, longitude: -37.0703 },
    elevation: 4,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.1,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'REC', 'SSA', 'FOR', 'BSB', 'CGH', 'MCZ'],
    searchKeywords: ['aracaju', 'sergipe', 'se', 'nordeste', 'santa maria'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * SECONDARY BRAZILIAN AIRPORTS - State capitals and important cities
 */
export const BRAZIL_SECONDARY_AIRPORTS: BrazilAirport[] = [
  // Vitória Airport
  {
    iataCode: 'VIX',
    icaoCode: 'SBVT',
    name: 'Vitória Eurico de Aguiar Salles Airport',
    city: 'Vitória',
    state: 'Espírito Santo',
    stateCode: 'ES',
    region: 'Southeast',
    country: 'Brazil',
    timezone: 'America/Sao_Paulo',
    coordinates: { latitude: -20.2581, longitude: -40.2864 },
    elevation: 3,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 2.1,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'SDU', 'CNF', 'SSA', 'REC'],
    searchKeywords: ['vitoria', 'espirito santo', 'es', 'sudeste', 'eurico salles'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // São Luís Airport
  {
    iataCode: 'SLZ',
    icaoCode: 'SBSL',
    name: 'São Luís Marechal Cunha Machado International Airport',
    city: 'São Luís',
    state: 'Maranhão',
    stateCode: 'MA',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Fortaleza',
    coordinates: { latitude: -2.5856, longitude: -44.2342 },
    elevation: 53,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 1.6,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'FOR', 'REC', 'SSA', 'BEL', 'CGH'],
    searchKeywords: ['sao luis', 'maranhao', 'ma', 'nordeste', 'cunha machado'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Teresina Airport
  {
    iataCode: 'THE',
    icaoCode: 'SBTE',
    name: 'Teresina Senador Petrônio Portella Airport',
    city: 'Teresina',
    state: 'Piauí',
    stateCode: 'PI',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Fortaleza',
    coordinates: { latitude: -5.0597, longitude: -42.8236 },
    elevation: 74,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.3,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'FOR', 'REC', 'SSA', 'SLZ', 'CGH'],
    searchKeywords: ['teresina', 'piaui', 'pi', 'nordeste', 'petronio portella'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Palmas Airport
  {
    iataCode: 'PMW',
    icaoCode: 'SBPJ',
    name: 'Palmas Brigadeiro Lysias Rodrigues Airport',
    city: 'Palmas',
    state: 'Tocantins',
    stateCode: 'TO',
    region: 'North',
    country: 'Brazil',
    timezone: 'America/Araguaina',
    coordinates: { latitude: -10.2915, longitude: -48.3569 },
    elevation: 280,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.9,
    airlines: ['G3', 'LA', 'AD'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'THE', 'SLZ', 'BEL', 'MAO'],
    searchKeywords: ['palmas', 'tocantins', 'to', 'norte', 'lysias rodrigues'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Macapá Airport
  {
    iataCode: 'MCP',
    icaoCode: 'SBMQ',
    name: 'Macapá Alberto Alcolumbre International Airport',
    city: 'Macapá',
    state: 'Amapá',
    stateCode: 'AP',
    region: 'North',
    country: 'Brazil',
    timezone: 'America/Belem',
    coordinates: { latitude: 0.0506, longitude: -51.0722 },
    elevation: 17,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.7,
    airlines: ['G3', 'LA', 'AD'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'BEL', 'MAO', 'CGH', 'SLZ', 'FOR'],
    searchKeywords: ['macapa', 'amapa', 'ap', 'norte', 'alberto alcolumbre'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Boa Vista Airport
  {
    iataCode: 'BVB',
    icaoCode: 'SBBV',
    name: 'Boa Vista Atlas Brasil Cantanhede International Airport',
    city: 'Boa Vista',
    state: 'Roraima',
    stateCode: 'RR',
    region: 'North',
    country: 'Brazil',
    timezone: 'America/Boa_Vista',
    coordinates: { latitude: 2.8461, longitude: -60.6903 },
    elevation: 85,
    category: 'small_hub',
    isInternational: true,
    passengerCount: 0.6,
    airlines: ['G3', 'LA', 'AD'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'MAO', 'BEL', 'CGH', 'MCP', 'RBR'],
    searchKeywords: ['boa vista', 'roraima', 'rr', 'norte', 'atlas brasil cantanhede'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Rio Branco Airport
  {
    iataCode: 'RBR',
    icaoCode: 'SBRB',
    name: 'Rio Branco Plácido de Castro Airport',
    city: 'Rio Branco',
    state: 'Acre',
    stateCode: 'AC',
    region: 'North',
    country: 'Brazil',
    timezone: 'America/Rio_Branco',
    coordinates: { latitude: -9.8686, longitude: -67.8958 },
    elevation: 192,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 0.8,
    airlines: ['G3', 'LA', 'AD'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'MAO', 'CGH', 'CGB', 'BVB', 'PVH'],
    searchKeywords: ['rio branco', 'acre', 'ac', 'norte', 'placido de castro'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Porto Velho Airport
  {
    iataCode: 'PVH',
    icaoCode: 'SBPV',
    name: 'Porto Velho Governador Jorge Teixeira de Oliveira Airport',
    city: 'Porto Velho',
    state: 'Rondônia',
    stateCode: 'RO',
    region: 'North',
    country: 'Brazil',
    timezone: 'America/Porto_Velho',
    coordinates: { latitude: -8.7093, longitude: -63.9023 },
    elevation: 90,
    category: 'small_hub',
    isInternational: false,
    passengerCount: 1.0,
    airlines: ['G3', 'LA', 'AD'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'MAO', 'CGH', 'CGB', 'RBR', 'BVB'],
    searchKeywords: ['porto velho', 'rondonia', 'ro', 'norte', 'jorge teixeira'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  },

  // Porto Seguro Airport
  {
    iataCode: 'BPS',
    icaoCode: 'SBPS',
    name: 'Porto Seguro Airport',
    city: 'Porto Seguro',
    state: 'Bahia',
    stateCode: 'BA',
    region: 'Northeast',
    country: 'Brazil',
    timezone: 'America/Bahia',
    coordinates: { latitude: -16.4386, longitude: -39.0808 },
    elevation: 51,
    category: 'regional',
    isInternational: false,
    passengerCount: 1.2,
    airlines: ['G3', 'LA', 'AD', 'JJ'],
    terminals: 1,
    runways: 1,
    popularDestinations: ['GRU', 'GIG', 'BSB', 'CGH', 'SSA', 'CNF', 'REC', 'FOR'],
    searchKeywords: ['porto seguro', 'bahia', 'ba', 'nordeste', 'costa do descobrimento', 'praia', 'turismo'],
    groundTransport: ['bus', 'taxi', 'rideshare', 'rental_car'],
    amenities: ['wifi', 'shopping', 'dining']
  }
];

/**
 * COMPLETE BRAZIL AIRPORTS DATABASE
 */
export const BRAZIL_AIRPORTS_DATABASE: BrazilAirport[] = [
  ...BRAZIL_MAJOR_HUBS,
  ...BRAZIL_HUB_AIRPORTS,
  ...BRAZIL_REGIONAL_AIRPORTS,
  ...BRAZIL_SECONDARY_AIRPORTS
];

/**
 * POPULAR BRAZILIAN ROUTES - Common city pairs for quick suggestions
 */
export const POPULAR_BRAZIL_ROUTES = [
  { from: 'GRU', to: 'GIG', route: 'São Paulo → Rio de Janeiro', popularity: 95 },
  { from: 'GIG', to: 'GRU', route: 'Rio de Janeiro → São Paulo', popularity: 95 },
  { from: 'CGH', to: 'SDU', route: 'São Paulo → Rio de Janeiro', popularity: 90 },
  { from: 'GRU', to: 'BSB', route: 'São Paulo → Brasília', popularity: 88 },
  { from: 'GIG', to: 'BSB', route: 'Rio de Janeiro → Brasília', popularity: 85 },
  { from: 'GRU', to: 'SSA', route: 'São Paulo → Salvador', popularity: 83 },
  { from: 'GRU', to: 'REC', route: 'São Paulo → Recife', popularity: 82 },
  { from: 'GRU', to: 'FOR', route: 'São Paulo → Fortaleza', popularity: 80 },
  { from: 'GIG', to: 'SSA', route: 'Rio de Janeiro → Salvador', popularity: 78 },
  { from: 'GRU', to: 'CNF', route: 'São Paulo → Belo Horizonte', popularity: 75 }
];

/**
 * BRAZILIAN TIMEZONE MAPPING
 */
export const BRAZIL_TIMEZONE_MAP = {
  'America/Sao_Paulo': 'Brasília Time (BRT/BRST)',
  'America/Manaus': 'Amazon Time (AMT)',
  'America/Cuiaba': 'Amazon Time (AMT)',
  'America/Campo_Grande': 'Amazon Time (AMT)',
  'America/Boa_Vista': 'Amazon Time (AMT)',
  'America/Porto_Velho': 'Amazon Time (AMT)',
  'America/Rio_Branco': 'Acre Time (ACT)',
  'America/Belem': 'Brasília Time (BRT/BRST)',
  'America/Fortaleza': 'Brasília Time (BRT/BRST)',
  'America/Recife': 'Brasília Time (BRT/BRST)',
  'America/Bahia': 'Brasília Time (BRT/BRST)',
  'America/Maceio': 'Brasília Time (BRT/BRST)',
  'America/Araguaina': 'Brasília Time (BRT/BRST)'
};

/**
 * BRAZILIAN REGIONS MAPPING
 */
export const BRAZIL_REGIONS = {
  'Southeast': ['SP', 'RJ', 'MG', 'ES'],
  'South': ['RS', 'PR', 'SC'],
  'Northeast': ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'],
  'North': ['AM', 'PA', 'AP', 'RR', 'AC', 'RO', 'TO'],
  'Center-West': ['GO', 'MT', 'MS', 'DF']
};

/**
 * AIRPORT SEARCH INDEX - Optimized for fast searching
 */
export const createBrazilAirportSearchIndex = () => {
  const searchIndex = new Map<string, BrazilAirport[]>();
  
  BRAZIL_AIRPORTS_DATABASE.forEach(airport => {
    // Index by IATA code
    const iataKey = airport.iataCode.toLowerCase();
    if (!searchIndex.has(iataKey)) searchIndex.set(iataKey, []);
    searchIndex.get(iataKey)!.push(airport);
    
    // Index by city
    const cityKey = airport.city.toLowerCase();
    if (!searchIndex.has(cityKey)) searchIndex.set(cityKey, []);
    searchIndex.get(cityKey)!.push(airport);
    
    // Index by state
    const stateKey = airport.state.toLowerCase();
    if (!searchIndex.has(stateKey)) searchIndex.set(stateKey, []);
    searchIndex.get(stateKey)!.push(airport);
    
    // Index by search keywords
    airport.searchKeywords.forEach(keyword => {
      const keywordKey = keyword.toLowerCase();
      if (!searchIndex.has(keywordKey)) searchIndex.set(keywordKey, []);
      searchIndex.get(keywordKey)!.push(airport);
    });
    
    // Index by partial matches
    const nameParts = airport.name.toLowerCase().split(' ');
    nameParts.forEach(part => {
      if (part.length > 2) {
        if (!searchIndex.has(part)) searchIndex.set(part, []);
        searchIndex.get(part)!.push(airport);
      }
    });
  });
  
  return searchIndex;
};