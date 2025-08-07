/**
 * 🌍 AFRICA AIRPORTS DATABASE
 * Comprehensive database of major African airports with complete metadata
 * Covers all African regions: North, West, East, Central, Southern Africa
 */

export interface AfricaAirport {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  country: 'Egypt' | 'Morocco' | 'South Africa' | 'Nigeria' | 'Kenya' | 'Ethiopia' | 
           'Algeria' | 'Tunisia' | 'Libya' | 'Sudan' | 'Ghana' | 'Senegal' | 'Côte d\'Ivoire' |
           'Cameroon' | 'Tanzania' | 'Uganda' | 'Rwanda' | 'Mauritius' | 'Seychelles' |
           'Botswana' | 'Namibia' | 'Zambia' | 'Zimbabwe' | 'Mozambique' | 'Angola' |
           'Democratic Republic of Congo' | 'Gabon' | 'Mali' | 'Burkina Faso' | 'Niger' |
           'Chad' | 'Central African Republic' | 'Republic of Congo' | 'Equatorial Guinea' |
           'Djibouti' | 'Somalia' | 'Eritrea' | 'Madagascar' | 'Malawi' | 'Lesotho' |
           'Swaziland' | 'Gambia' | 'Guinea-Bissau' | 'Guinea' | 'Sierra Leone' | 'Liberia' |
           'Togo' | 'Benin' | 'Cape Verde' | 'São Tomé and Príncipe' | 'Comoros';
  countryCode: string;
  region: 'North Africa' | 'West Africa' | 'East Africa' | 'Central Africa' | 'Southern Africa';
  timezone: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  elevation: number;
  runways: number;
  terminals: number;
  passengerCount: number; // millions per year
  cargoTonnage: number; // thousands of tons per year
  isInternational: boolean;
  category: 'major_hub' | 'hub' | 'international_gateway' | 'regional' | 'small_hub';
  primaryLanguages: string[];
  currency: string;
  searchKeywords: string[];
  popularDestinations: string[];
  airlinesCount: number;
  hasMetroConnection: boolean;
  distanceToCity: number; // km
}

export const AFRICA_AIRPORTS_DATABASE: AfricaAirport[] = [
  // NORTH AFRICA - Major Hubs
  {
    iataCode: 'CAI',
    icaoCode: 'HECA',
    name: 'Cairo International Airport',
    city: 'Cairo',
    country: 'Egypt',
    countryCode: 'EG',
    region: 'North Africa',
    timezone: 'Africa/Cairo',
    coordinates: { latitude: 30.1219, longitude: 31.4056 },
    elevation: 74,
    runways: 3,
    terminals: 3,
    passengerCount: 16.7,
    cargoTonnage: 245,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['Arabic', 'English'],
    currency: 'EGP',
    searchKeywords: ['Cairo', 'القاهرة', 'CAI', 'Egypt', 'مصر'],
    popularDestinations: ['JFK', 'LHR', 'CDG', 'FRA', 'DXB', 'DOH', 'IST'],
    airlinesCount: 67,
    hasMetroConnection: true,
    distanceToCity: 22
  },
  {
    iataCode: 'CMN',
    icaoCode: 'GMMN',
    name: 'Mohammed V International Airport',
    city: 'Casablanca',
    country: 'Morocco',
    countryCode: 'MA',
    region: 'North Africa',
    timezone: 'Africa/Casablanca',
    coordinates: { latitude: 33.3675, longitude: -7.5897 },
    elevation: 62,
    runways: 3,
    terminals: 2,
    passengerCount: 10.2,
    cargoTonnage: 58,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['Arabic', 'French', 'English'],
    currency: 'MAD',
    searchKeywords: ['Casablanca', 'الدار البيضاء', 'CMN', 'Morocco', 'المغرب', 'Mohammed V'],
    popularDestinations: ['CDG', 'MAD', 'LHR', 'FRA', 'IST', 'DXB', 'JFK'],
    airlinesCount: 54,
    hasMetroConnection: true,
    distanceToCity: 30
  },
  {
    iataCode: 'ALG',
    icaoCode: 'DAAG',
    name: 'Houari Boumediene Airport',
    city: 'Algiers',
    country: 'Algeria',
    countryCode: 'DZ',
    region: 'North Africa',
    timezone: 'Africa/Algiers',
    coordinates: { latitude: 36.6910, longitude: 3.2154 },
    elevation: 25,
    runways: 2,
    terminals: 2,
    passengerCount: 8.1,
    cargoTonnage: 21,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['Arabic', 'French', 'English'],
    currency: 'DZD',
    searchKeywords: ['Algiers', 'الجزائر', 'ALG', 'Algeria', 'Houari Boumediene'],
    popularDestinations: ['CDG', 'ORY', 'LHR', 'FCO', 'IST', 'TUN', 'CMN'],
    airlinesCount: 42,
    hasMetroConnection: false,
    distanceToCity: 20
  },
  {
    iataCode: 'TUN',
    icaoCode: 'DTTA',
    name: 'Tunis-Carthage International Airport',
    city: 'Tunis',
    country: 'Tunisia',
    countryCode: 'TN',
    region: 'North Africa',
    timezone: 'Africa/Tunis',
    coordinates: { latitude: 36.8510, longitude: 10.2272 },
    elevation: 4,
    runways: 2,
    terminals: 2,
    passengerCount: 7.5,
    cargoTonnage: 14,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['Arabic', 'French', 'English'],
    currency: 'TND',
    searchKeywords: ['Tunis', 'تونس', 'TUN', 'Tunisia', 'Carthage'],
    popularDestinations: ['CDG', 'ORY', 'LHR', 'FCO', 'IST', 'ALG', 'CMN'],
    airlinesCount: 38,
    hasMetroConnection: false,
    distanceToCity: 8
  },

  // WEST AFRICA - Major Gateways
  {
    iataCode: 'LOS',
    icaoCode: 'DNMM',
    name: 'Murtala Muhammed International Airport',
    city: 'Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    region: 'West Africa',
    timezone: 'Africa/Lagos',
    coordinates: { latitude: 6.5777, longitude: 3.3212 },
    elevation: 42,
    runways: 2,
    terminals: 5,
    passengerCount: 8.7,
    cargoTonnage: 89,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['English', 'Yoruba', 'Igbo', 'Hausa'],
    currency: 'NGN',
    searchKeywords: ['Lagos', 'LOS', 'Nigeria', 'Murtala Muhammed'],
    popularDestinations: ['LHR', 'CDG', 'AMS', 'IST', 'DXB', 'JFK', 'ATL'],
    airlinesCount: 52,
    hasMetroConnection: false,
    distanceToCity: 22
  },
  {
    iataCode: 'ACC',
    icaoCode: 'DGAA',
    name: 'Kotoka International Airport',
    city: 'Accra',
    country: 'Ghana',
    countryCode: 'GH',
    region: 'West Africa',
    timezone: 'Africa/Accra',
    coordinates: { latitude: 5.6052, longitude: -0.1668 },
    elevation: 62,
    runways: 2,
    terminals: 3,
    passengerCount: 6.3,
    cargoTonnage: 34,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English', 'Twi', 'Ga'],
    currency: 'GHS',
    searchKeywords: ['Accra', 'ACC', 'Ghana', 'Kotoka'],
    popularDestinations: ['LHR', 'JFK', 'AMS', 'CDG', 'IST', 'DXB', 'LOS'],
    airlinesCount: 43,
    hasMetroConnection: false,
    distanceToCity: 10
  },
  {
    iataCode: 'DKR',
    icaoCode: 'GOOY',
    name: 'Blaise Diagne International Airport',
    city: 'Dakar',
    country: 'Senegal',
    countryCode: 'SN',
    region: 'West Africa',
    timezone: 'Africa/Dakar',
    coordinates: { latitude: 14.6700, longitude: -17.0730 },
    elevation: 28,
    runways: 1,
    terminals: 1,
    passengerCount: 3.2,
    cargoTonnage: 18,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['French', 'Wolof', 'English'],
    currency: 'XOF',
    searchKeywords: ['Dakar', 'DKR', 'Senegal', 'Blaise Diagne'],
    popularDestinations: ['CDG', 'ORY', 'MAD', 'LIS', 'IST', 'CMN', 'LOS'],
    airlinesCount: 31,
    hasMetroConnection: false,
    distanceToCity: 43
  },
  {
    iataCode: 'ABJ',
    icaoCode: 'DIAP',
    name: 'Félix-Houphouët-Boigny International Airport',
    city: 'Abidjan',
    country: 'Côte d\'Ivoire',
    countryCode: 'CI',
    region: 'West Africa',
    timezone: 'Africa/Abidjan',
    coordinates: { latitude: 5.2539, longitude: -3.9263 },
    elevation: 7,
    runways: 1,
    terminals: 1,
    passengerCount: 2.1,
    cargoTonnage: 14,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['French', 'English'],
    currency: 'XOF',
    searchKeywords: ['Abidjan', 'ABJ', 'Côte d\'Ivoire', 'Ivory Coast', 'Félix-Houphouët-Boigny'],
    popularDestinations: ['CDG', 'ORY', 'LHR', 'IST', 'CMN', 'LOS', 'DKR'],
    airlinesCount: 28,
    hasMetroConnection: false,
    distanceToCity: 16
  },

  // EAST AFRICA - Major Hubs
  {
    iataCode: 'ADD',
    icaoCode: 'HAAB',
    name: 'Addis Ababa Bole International Airport',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    countryCode: 'ET',
    region: 'East Africa',
    timezone: 'Africa/Addis_Ababa',
    coordinates: { latitude: 8.9781, longitude: 38.7999 },
    elevation: 2334,
    runways: 2,
    terminals: 2,
    passengerCount: 14.8,
    cargoTonnage: 473,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['Amharic', 'English', 'Arabic'],
    currency: 'ETB',
    searchKeywords: ['Addis Ababa', 'ADD', 'Ethiopia', 'Bole', 'አዲስ አበባ'],
    popularDestinations: ['LHR', 'CDG', 'FRA', 'DXB', 'DOH', 'NBO', 'CAI'],
    airlinesCount: 89,
    hasMetroConnection: false,
    distanceToCity: 6
  },
  {
    iataCode: 'NBO',
    icaoCode: 'HKJK',
    name: 'Jomo Kenyatta International Airport',
    city: 'Nairobi',
    country: 'Kenya',
    countryCode: 'KE',
    region: 'East Africa',
    timezone: 'Africa/Nairobi',
    coordinates: { latitude: -1.3192, longitude: 36.9278 },
    elevation: 1625,
    runways: 2,
    terminals: 4,
    passengerCount: 8.9,
    cargoTonnage: 324,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['English', 'Swahili'],
    currency: 'KES',
    searchKeywords: ['Nairobi', 'NBO', 'Kenya', 'Jomo Kenyatta'],
    popularDestinations: ['LHR', 'CDG', 'AMS', 'DXB', 'DOH', 'ADD', 'JNB'],
    airlinesCount: 64,
    hasMetroConnection: false,
    distanceToCity: 18
  },
  {
    iataCode: 'DAR',
    icaoCode: 'HTDA',
    name: 'Julius Nyerere International Airport',
    city: 'Dar es Salaam',
    country: 'Tanzania',
    countryCode: 'TZ',
    region: 'East Africa',
    timezone: 'Africa/Dar_es_Salaam',
    coordinates: { latitude: -6.8781, longitude: 39.2026 },
    elevation: 53,
    runways: 2,
    terminals: 3,
    passengerCount: 4.2,
    cargoTonnage: 45,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['Swahili', 'English'],
    currency: 'TZS',
    searchKeywords: ['Dar es Salaam', 'DAR', 'Tanzania', 'Julius Nyerere'],
    popularDestinations: ['DXB', 'DOH', 'ADD', 'NBO', 'JNB', 'AMS', 'IST'],
    airlinesCount: 38,
    hasMetroConnection: false,
    distanceToCity: 12
  },
  {
    iataCode: 'EBB',
    icaoCode: 'HUEN',
    name: 'Entebbe International Airport',
    city: 'Kampala',
    country: 'Uganda',
    countryCode: 'UG',
    region: 'East Africa',
    timezone: 'Africa/Kampala',
    coordinates: { latitude: 0.0424, longitude: 32.4435 },
    elevation: 1155,
    runways: 1,
    terminals: 1,
    passengerCount: 1.9,
    cargoTonnage: 23,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English', 'Luganda'],
    currency: 'UGX',
    searchKeywords: ['Kampala', 'Entebbe', 'EBB', 'Uganda'],
    popularDestinations: ['DXB', 'DOH', 'ADD', 'NBO', 'BRU', 'IST', 'KGL'],
    airlinesCount: 29,
    hasMetroConnection: false,
    distanceToCity: 40
  },
  {
    iataCode: 'KGL',
    icaoCode: 'HRYR',
    name: 'Kigali International Airport',
    city: 'Kigali',
    country: 'Rwanda',
    countryCode: 'RW',
    region: 'East Africa',
    timezone: 'Africa/Kigali',
    coordinates: { latitude: -1.9686, longitude: 30.1395 },
    elevation: 1491,
    runways: 1,
    terminals: 1,
    passengerCount: 1.1,
    cargoTonnage: 12,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['Kinyarwanda', 'English', 'French'],
    currency: 'RWF',
    searchKeywords: ['Kigali', 'KGL', 'Rwanda'],
    popularDestinations: ['DXB', 'DOH', 'ADD', 'NBO', 'BRU', 'IST', 'EBB'],
    airlinesCount: 18,
    hasMetroConnection: false,
    distanceToCity: 12
  },

  // SOUTHERN AFRICA - Major Hubs  
  {
    iataCode: 'JNB',
    icaoCode: 'FAOR',
    name: 'O.R. Tambo International Airport',
    city: 'Johannesburg',
    country: 'South Africa',
    countryCode: 'ZA',
    region: 'Southern Africa',
    timezone: 'Africa/Johannesburg',
    coordinates: { latitude: -26.1367, longitude: 28.2411 },
    elevation: 1694,
    runways: 2,
    terminals: 2,
    passengerCount: 21.2,
    cargoTonnage: 442,
    isInternational: true,
    category: 'major_hub',
    primaryLanguages: ['English', 'Afrikaans', 'Zulu', 'Xhosa'],
    currency: 'ZAR',
    searchKeywords: ['Johannesburg', 'JNB', 'South Africa', 'O.R. Tambo', 'Joburg'],
    popularDestinations: ['LHR', 'DXB', 'DOH', 'IST', 'ADD', 'NBO', 'CPT'],
    airlinesCount: 67,
    hasMetroConnection: true,
    distanceToCity: 24
  },
  {
    iataCode: 'CPT',
    icaoCode: 'FACT',
    name: 'Cape Town International Airport',
    city: 'Cape Town',
    country: 'South Africa',
    countryCode: 'ZA',
    region: 'Southern Africa',
    timezone: 'Africa/Johannesburg',
    coordinates: { latitude: -33.9639, longitude: 18.6021 },
    elevation: 46,
    runways: 2,
    terminals: 2,
    passengerCount: 10.7,
    cargoTonnage: 89,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English', 'Afrikaans', 'Xhosa'],
    currency: 'ZAR',
    searchKeywords: ['Cape Town', 'CPT', 'South Africa', 'Kaapstad'],
    popularDestinations: ['LHR', 'DXB', 'DOH', 'IST', 'JNB', 'FRA', 'AMS'],
    airlinesCount: 45,
    hasMetroConnection: false,
    distanceToCity: 20
  },
  {
    iataCode: 'MRU',
    icaoCode: 'FIMP',
    name: 'Sir Seewoosagur Ramgoolam International Airport',
    city: 'Port Louis',
    country: 'Mauritius',
    countryCode: 'MU',
    region: 'Southern Africa',
    timezone: 'Indian/Mauritius',
    coordinates: { latitude: -20.4302, longitude: 57.6836 },
    elevation: 57,
    runways: 1,
    terminals: 1,
    passengerCount: 4.6,
    cargoTonnage: 35,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['English', 'French', 'Creole', 'Hindi'],
    currency: 'MUR',
    searchKeywords: ['Mauritius', 'MRU', 'Port Louis', 'Sir Seewoosagur Ramgoolam'],
    popularDestinations: ['CDG', 'LHR', 'DXB', 'JNB', 'CPT', 'SEZ', 'BOM'],
    airlinesCount: 32,
    hasMetroConnection: false,
    distanceToCity: 48
  },
  {
    iataCode: 'SEZ',
    icaoCode: 'FSIA',
    name: 'Seychelles International Airport',
    city: 'Victoria',
    country: 'Seychelles',
    countryCode: 'SC',
    region: 'Southern Africa',
    timezone: 'Indian/Mahe',
    coordinates: { latitude: -4.6743, longitude: 55.5218 },
    elevation: 3,
    runways: 1,
    terminals: 1,
    passengerCount: 0.4,
    cargoTonnage: 3,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English', 'French', 'Creole'],
    currency: 'SCR',
    searchKeywords: ['Seychelles', 'SEZ', 'Victoria', 'Mahé'],
    popularDestinations: ['DXB', 'DOH', 'CDG', 'MRU', 'JNB', 'ADD', 'NBO'],
    airlinesCount: 14,
    hasMetroConnection: false,
    distanceToCity: 11
  },

  // CENTRAL AFRICA
  {
    iataCode: 'DLA',
    icaoCode: 'FZAA',
    name: 'N\'djili Airport',
    city: 'Kinshasa',
    country: 'Democratic Republic of Congo',
    countryCode: 'CD',
    region: 'Central Africa',
    timezone: 'Africa/Kinshasa',
    coordinates: { latitude: -4.3857, longitude: 15.4446 },
    elevation: 312,
    runways: 2,
    terminals: 1,
    passengerCount: 1.8,
    cargoTonnage: 15,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['French', 'Lingala', 'Kikongo'],
    currency: 'CDF',
    searchKeywords: ['Kinshasa', 'DLA', 'Democratic Republic of Congo', 'DRC', 'N\'djili'],
    popularDestinations: ['CDG', 'BRU', 'IST', 'ADD', 'JNB', 'LOS', 'DKR'],
    airlinesCount: 21,
    hasMetroConnection: false,
    distanceToCity: 25
  },
  {
    iataCode: 'YAO',
    icaoCode: 'FCBY',
    name: 'Yaoundé Nsimalen International Airport',
    city: 'Yaoundé',
    country: 'Cameroon',
    countryCode: 'CM',
    region: 'Central Africa',
    timezone: 'Africa/Douala',
    coordinates: { latitude: 3.7223, longitude: 11.5533 },
    elevation: 682,
    runways: 1,
    terminals: 1,
    passengerCount: 1.2,
    cargoTonnage: 8,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['French', 'English'],
    currency: 'XAF',
    searchKeywords: ['Yaoundé', 'YAO', 'Cameroon', 'Nsimalen'],
    popularDestinations: ['CDG', 'CDG', 'IST', 'ADD', 'LOS', 'DKR', 'ABJ'],
    airlinesCount: 18,
    hasMetroConnection: false,
    distanceToCity: 27
  },
  {
    iataCode: 'LBV',
    icaoCode: 'FOOL',
    name: 'Libreville Leon M\'ba International Airport',
    city: 'Libreville',
    country: 'Gabon',
    countryCode: 'GA',
    region: 'Central Africa',
    timezone: 'Africa/Libreville',
    coordinates: { latitude: 0.4586, longitude: 9.4123 },
    elevation: 12,
    runways: 2,
    terminals: 1,
    passengerCount: 0.9,
    cargoTonnage: 12,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['French', 'English'],
    currency: 'XAF',
    searchKeywords: ['Libreville', 'LBV', 'Gabon', 'Leon M\'ba'],
    popularDestinations: ['CDG', 'ORY', 'IST', 'ADD', 'CMN', 'LOS', 'DKR'],
    airlinesCount: 16,
    hasMetroConnection: false,
    distanceToCity: 11
  },

  // ADDITIONAL STRATEGIC AIRPORTS
  {
    iataCode: 'LAD',
    icaoCode: 'FNLU',
    name: 'Quatro de Fevereiro Airport',
    city: 'Luanda',
    country: 'Angola',
    countryCode: 'AO',
    region: 'Southern Africa',
    timezone: 'Africa/Luanda',
    coordinates: { latitude: -8.8584, longitude: 13.2312 },
    elevation: 74,
    runways: 1,
    terminals: 1,
    passengerCount: 4.5,
    cargoTonnage: 28,
    isInternational: true,
    category: 'hub',
    primaryLanguages: ['Portuguese', 'English'],
    currency: 'AOA',
    searchKeywords: ['Luanda', 'LAD', 'Angola', 'Quatro de Fevereiro'],
    popularDestinations: ['LIS', 'CDG', 'LHR', 'JNB', 'ADD', 'IST', 'GIG'],
    airlinesCount: 26,
    hasMetroConnection: false,
    distanceToCity: 4
  },
  {
    iataCode: 'WDH',
    icaoCode: 'FYWH',
    name: 'Hosea Kutako International Airport',
    city: 'Windhoek',
    country: 'Namibia',
    countryCode: 'NA',
    region: 'Southern Africa',
    timezone: 'Africa/Windhoek',
    coordinates: { latitude: -22.4799, longitude: 17.4709 },
    elevation: 1719,
    runways: 2,
    terminals: 1,
    passengerCount: 0.8,
    cargoTonnage: 5,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English', 'Afrikaans', 'German'],
    currency: 'NAD',
    searchKeywords: ['Windhoek', 'WDH', 'Namibia', 'Hosea Kutako'],
    popularDestinations: ['JNB', 'CPT', 'FRA', 'LHR', 'CDG', 'DOH', 'ADD'],
    airlinesCount: 12,
    hasMetroConnection: false,
    distanceToCity: 45
  },
  {
    iataCode: 'LUN',
    icaoCode: 'FLKK',
    name: 'Kenneth Kaunda International Airport',
    city: 'Lusaka',
    country: 'Zambia',
    countryCode: 'ZM',
    region: 'Southern Africa',
    timezone: 'Africa/Lusaka',
    coordinates: { latitude: -15.3308, longitude: 28.4524 },
    elevation: 1154,
    runways: 1,
    terminals: 1,
    passengerCount: 1.3,
    cargoTonnage: 18,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English', 'Bemba', 'Nyanja'],
    currency: 'ZMW',
    searchKeywords: ['Lusaka', 'LUN', 'Zambia', 'Kenneth Kaunda'],
    popularDestinations: ['JNB', 'ADD', 'NBO', 'IST', 'DOH', 'DXB', 'HRE'],
    airlinesCount: 21,
    hasMetroConnection: false,
    distanceToCity: 27
  },
  {
    iataCode: 'HRE',
    icaoCode: 'FVHA',
    name: 'Robert Gabriel Mugabe International Airport',
    city: 'Harare',
    country: 'Zimbabwe',
    countryCode: 'ZW',
    region: 'Southern Africa',
    timezone: 'Africa/Harare',
    coordinates: { latitude: -17.9318, longitude: 31.0928 },
    elevation: 1471,
    runways: 3,
    terminals: 1,
    passengerCount: 1.4,
    cargoTonnage: 12,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['English', 'Shona', 'Ndebele'],
    currency: 'USD',
    searchKeywords: ['Harare', 'HRE', 'Zimbabwe', 'Robert Gabriel Mugabe'],
    popularDestinations: ['JNB', 'ADD', 'NBO', 'DXB', 'DOH', 'LUN', 'GBE'],
    airlinesCount: 18,
    hasMetroConnection: false,
    distanceToCity: 15
  },
  {
    iataCode: 'TNR',
    icaoCode: 'FMMI',
    name: 'Ivato International Airport',
    city: 'Antananarivo',
    country: 'Madagascar',
    countryCode: 'MG',
    region: 'Southern Africa',
    timezone: 'Indian/Antananarivo',
    coordinates: { latitude: -18.7969, longitude: 47.4788 },
    elevation: 1276,
    runways: 1,
    terminals: 1,
    passengerCount: 1.1,
    cargoTonnage: 8,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['Malagasy', 'French', 'English'],
    currency: 'MGA',
    searchKeywords: ['Antananarivo', 'TNR', 'Madagascar', 'Ivato'],
    popularDestinations: ['CDG', 'MRU', 'JNB', 'ADD', 'NBO', 'SEZ', 'RUN'],
    airlinesCount: 15,
    hasMetroConnection: false,
    distanceToCity: 16
  },
  {
    iataCode: 'MPM',
    icaoCode: 'FQMA',
    name: 'Maputo International Airport',
    city: 'Maputo',
    country: 'Mozambique',
    countryCode: 'MZ',
    region: 'Southern Africa',
    timezone: 'Africa/Maputo',
    coordinates: { latitude: -25.9208, longitude: 32.5725 },
    elevation: 44,
    runways: 1,
    terminals: 1,
    passengerCount: 1.0,
    cargoTonnage: 7,
    isInternational: true,
    category: 'regional',
    primaryLanguages: ['Portuguese', 'English'],
    currency: 'MZN',
    searchKeywords: ['Maputo', 'MPM', 'Mozambique'],
    popularDestinations: ['JNB', 'LIS', 'ADD', 'NBO', 'DOH', 'IST', 'GIG'],
    airlinesCount: 16,
    hasMetroConnection: false,
    distanceToCity: 3
  }
];

export function createAfricaAirportSearchIndex(): Map<string, AfricaAirport[]> {
  const index = new Map<string, AfricaAirport[]>();
  
  AFRICA_AIRPORTS_DATABASE.forEach(airport => {
    // Index by IATA code
    const iataKey = airport.iataCode.toLowerCase();
    if (!index.has(iataKey)) index.set(iataKey, []);
    index.get(iataKey)!.push(airport);
    
    // Index by city (normalized)
    const cityKey = airport.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!index.has(cityKey)) index.set(cityKey, []);
    index.get(cityKey)!.push(airport);
    
    // Index by country
    const countryKey = airport.country.toLowerCase();
    if (!index.has(countryKey)) index.set(countryKey, []);
    index.get(countryKey)!.push(airport);
    
    // Index by keywords
    airport.searchKeywords.forEach(keyword => {
      const keywordKey = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!index.has(keywordKey)) index.set(keywordKey, []);
      index.get(keywordKey)!.push(airport);
    });
  });
  
  return index;
}

export const AFRICA_AIRPORTS_BY_REGION = {
  'North Africa': AFRICA_AIRPORTS_DATABASE.filter(a => a.region === 'North Africa'),
  'West Africa': AFRICA_AIRPORTS_DATABASE.filter(a => a.region === 'West Africa'),
  'East Africa': AFRICA_AIRPORTS_DATABASE.filter(a => a.region === 'East Africa'),
  'Central Africa': AFRICA_AIRPORTS_DATABASE.filter(a => a.region === 'Central Africa'),
  'Southern Africa': AFRICA_AIRPORTS_DATABASE.filter(a => a.region === 'Southern Africa')
};

export const AFRICA_MAJOR_HUBS = AFRICA_AIRPORTS_DATABASE.filter(
  airport => airport.category === 'major_hub'
);

export const AFRICA_INTERNATIONAL_GATEWAYS = AFRICA_AIRPORTS_DATABASE.filter(
  airport => airport.isInternational && ['major_hub', 'hub', 'international_gateway'].includes(airport.category)
);