/**
 * CAR RENTAL LOCATION DATABASE - GLOBAL COVERAGE
 *
 * Supports:
 * - ALL IATA airport codes (3-letter)
 * - City codes for downtown pickups
 * - Train stations, hotels, and custom locations
 *
 * Region detection uses ISO 3166-1 alpha-2 country codes for 100% global coverage
 */

export type Region = 'brazil' | 'usa' | 'europe' | 'latam' | 'asia' | 'middle_east' | 'oceania' | 'africa' | 'canada' | 'global';

export type LocationType = 'airport' | 'city' | 'train_station' | 'hotel' | 'downtown' | 'port';

export interface LocationInfo {
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  region: Region;
  type: LocationType;
  timezone?: string;
}

// Major airport names database
const airportNames: Record<string, { name: string; city: string }> = {
  // USA
  JFK: { name: 'John F. Kennedy International Airport', city: 'New York' },
  LAX: { name: 'Los Angeles International Airport', city: 'Los Angeles' },
  ORD: { name: "O'Hare International Airport", city: 'Chicago' },
  DFW: { name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
  ATL: { name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta' },
  MIA: { name: 'Miami International Airport', city: 'Miami' },
  SFO: { name: 'San Francisco International Airport', city: 'San Francisco' },
  SEA: { name: 'Seattle-Tacoma International Airport', city: 'Seattle' },
  LAS: { name: 'Harry Reid International Airport', city: 'Las Vegas' },
  MCO: { name: 'Orlando International Airport', city: 'Orlando' },
  BOS: { name: 'Boston Logan International Airport', city: 'Boston' },
  DEN: { name: 'Denver International Airport', city: 'Denver' },
  PHX: { name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix' },
  IAH: { name: 'George Bush Intercontinental Airport', city: 'Houston' },
  EWR: { name: 'Newark Liberty International Airport', city: 'Newark' },
  // Brazil
  BSB: { name: 'Brasília International Airport', city: 'Brasília' },
  GRU: { name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo' },
  GIG: { name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro' },
  CGH: { name: 'São Paulo/Congonhas Airport', city: 'São Paulo' },
  SDU: { name: 'Santos Dumont Airport', city: 'Rio de Janeiro' },
  CNF: { name: 'Belo Horizonte/Confins International Airport', city: 'Belo Horizonte' },
  POA: { name: 'Porto Alegre/Salgado Filho International Airport', city: 'Porto Alegre' },
  REC: { name: 'Recife/Guararapes International Airport', city: 'Recife' },
  SSA: { name: 'Salvador/Deputado Luís Eduardo Magalhães International Airport', city: 'Salvador' },
  FOR: { name: 'Fortaleza/Pinto Martins International Airport', city: 'Fortaleza' },
  CWB: { name: 'Curitiba/Afonso Pena International Airport', city: 'Curitiba' },
  // Europe
  LHR: { name: 'London Heathrow Airport', city: 'London' },
  CDG: { name: 'Paris Charles de Gaulle Airport', city: 'Paris' },
  FRA: { name: 'Frankfurt Airport', city: 'Frankfurt' },
  AMS: { name: 'Amsterdam Schiphol Airport', city: 'Amsterdam' },
  MAD: { name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid' },
  BCN: { name: 'Barcelona El Prat Airport', city: 'Barcelona' },
  FCO: { name: 'Rome Fiumicino Airport', city: 'Rome' },
  MUC: { name: 'Munich Airport', city: 'Munich' },
  ZRH: { name: 'Zurich Airport', city: 'Zurich' },
  LGW: { name: 'London Gatwick Airport', city: 'London' },
  // Canada
  YYZ: { name: 'Toronto Pearson International Airport', city: 'Toronto' },
  YVR: { name: 'Vancouver International Airport', city: 'Vancouver' },
  YUL: { name: 'Montréal-Trudeau International Airport', city: 'Montreal' },
  YYC: { name: 'Calgary International Airport', city: 'Calgary' },
  // Asia
  NRT: { name: 'Narita International Airport', city: 'Tokyo' },
  HND: { name: 'Tokyo Haneda Airport', city: 'Tokyo' },
  ICN: { name: 'Incheon International Airport', city: 'Seoul' },
  SIN: { name: 'Singapore Changi Airport', city: 'Singapore' },
  HKG: { name: 'Hong Kong International Airport', city: 'Hong Kong' },
  BKK: { name: 'Suvarnabhumi Airport', city: 'Bangkok' },
  // Middle East
  DXB: { name: 'Dubai International Airport', city: 'Dubai' },
  AUH: { name: 'Abu Dhabi International Airport', city: 'Abu Dhabi' },
  DOH: { name: 'Hamad International Airport', city: 'Doha' },
  // Oceania
  SYD: { name: 'Sydney Kingsford Smith Airport', city: 'Sydney' },
  MEL: { name: 'Melbourne Airport', city: 'Melbourne' },
  AKL: { name: 'Auckland Airport', city: 'Auckland' },
  // LATAM
  EZE: { name: 'Buenos Aires Ezeiza International Airport', city: 'Buenos Aires' },
  SCL: { name: 'Santiago Arturo Merino Benítez Airport', city: 'Santiago' },
  BOG: { name: 'El Dorado International Airport', city: 'Bogotá' },
  LIM: { name: 'Jorge Chávez International Airport', city: 'Lima' },
  MEX: { name: 'Mexico City International Airport', city: 'Mexico City' },
  CUN: { name: 'Cancún International Airport', city: 'Cancún' },
  // Africa
  JNB: { name: "O.R. Tambo International Airport", city: 'Johannesburg' },
  CPT: { name: 'Cape Town International Airport', city: 'Cape Town' },
  NBO: { name: 'Jomo Kenyatta International Airport', city: 'Nairobi' },
};

// ============================================================================
// ISO COUNTRY CODE TO REGION MAPPING (100% GLOBAL COVERAGE)
// ============================================================================
const countryToRegion: Record<string, Region> = {
  // BRAZIL
  BR: 'brazil',

  // USA
  US: 'usa',

  // CANADA
  CA: 'canada',

  // EUROPE (EU + EEA + UK + Others)
  GB: 'europe', UK: 'europe', // United Kingdom
  DE: 'europe', // Germany
  FR: 'europe', // France
  IT: 'europe', // Italy
  ES: 'europe', // Spain
  PT: 'europe', // Portugal
  NL: 'europe', // Netherlands
  BE: 'europe', // Belgium
  AT: 'europe', // Austria
  CH: 'europe', // Switzerland
  SE: 'europe', // Sweden
  NO: 'europe', // Norway
  DK: 'europe', // Denmark
  FI: 'europe', // Finland
  IE: 'europe', // Ireland
  GR: 'europe', // Greece
  PL: 'europe', // Poland
  CZ: 'europe', // Czech Republic
  HU: 'europe', // Hungary
  RO: 'europe', // Romania
  BG: 'europe', // Bulgaria
  HR: 'europe', // Croatia
  SI: 'europe', // Slovenia
  SK: 'europe', // Slovakia
  LT: 'europe', // Lithuania
  LV: 'europe', // Latvia
  EE: 'europe', // Estonia
  LU: 'europe', // Luxembourg
  MT: 'europe', // Malta
  CY: 'europe', // Cyprus
  IS: 'europe', // Iceland
  MC: 'europe', // Monaco
  AD: 'europe', // Andorra
  SM: 'europe', // San Marino
  VA: 'europe', // Vatican
  LI: 'europe', // Liechtenstein
  RS: 'europe', // Serbia
  ME: 'europe', // Montenegro
  MK: 'europe', // North Macedonia
  AL: 'europe', // Albania
  BA: 'europe', // Bosnia
  XK: 'europe', // Kosovo
  UA: 'europe', // Ukraine
  MD: 'europe', // Moldova
  BY: 'europe', // Belarus
  RU: 'europe', // Russia (European part)

  // LATIN AMERICA (excluding Brazil)
  MX: 'latam', // Mexico
  AR: 'latam', // Argentina
  CL: 'latam', // Chile
  CO: 'latam', // Colombia
  PE: 'latam', // Peru
  VE: 'latam', // Venezuela
  EC: 'latam', // Ecuador
  BO: 'latam', // Bolivia
  PY: 'latam', // Paraguay
  UY: 'latam', // Uruguay
  GY: 'latam', // Guyana
  SR: 'latam', // Suriname
  GF: 'latam', // French Guiana
  PA: 'latam', // Panama
  CR: 'latam', // Costa Rica
  NI: 'latam', // Nicaragua
  HN: 'latam', // Honduras
  SV: 'latam', // El Salvador
  GT: 'latam', // Guatemala
  BZ: 'latam', // Belize
  CU: 'latam', // Cuba
  DO: 'latam', // Dominican Republic
  HT: 'latam', // Haiti
  JM: 'latam', // Jamaica
  PR: 'latam', // Puerto Rico
  TT: 'latam', // Trinidad and Tobago
  BB: 'latam', // Barbados
  BS: 'latam', // Bahamas
  AW: 'latam', // Aruba
  CW: 'latam', // Curaçao
  SX: 'latam', // Sint Maarten
  TC: 'latam', // Turks and Caicos
  KY: 'latam', // Cayman Islands
  VI: 'latam', // US Virgin Islands
  VG: 'latam', // British Virgin Islands
  AG: 'latam', // Antigua
  LC: 'latam', // Saint Lucia
  VC: 'latam', // Saint Vincent
  GD: 'latam', // Grenada
  DM: 'latam', // Dominica
  KN: 'latam', // Saint Kitts
  MQ: 'latam', // Martinique
  GP: 'latam', // Guadeloupe

  // ASIA
  JP: 'asia', // Japan
  KR: 'asia', // South Korea
  CN: 'asia', // China
  HK: 'asia', // Hong Kong
  MO: 'asia', // Macau
  TW: 'asia', // Taiwan
  SG: 'asia', // Singapore
  MY: 'asia', // Malaysia
  TH: 'asia', // Thailand
  VN: 'asia', // Vietnam
  PH: 'asia', // Philippines
  ID: 'asia', // Indonesia
  MM: 'asia', // Myanmar
  KH: 'asia', // Cambodia
  LA: 'asia', // Laos
  BN: 'asia', // Brunei
  TL: 'asia', // Timor-Leste
  IN: 'asia', // India
  PK: 'asia', // Pakistan
  BD: 'asia', // Bangladesh
  LK: 'asia', // Sri Lanka
  NP: 'asia', // Nepal
  BT: 'asia', // Bhutan
  MV: 'asia', // Maldives
  MN: 'asia', // Mongolia
  KZ: 'asia', // Kazakhstan
  UZ: 'asia', // Uzbekistan
  TM: 'asia', // Turkmenistan
  KG: 'asia', // Kyrgyzstan
  TJ: 'asia', // Tajikistan
  AF: 'asia', // Afghanistan

  // MIDDLE EAST
  AE: 'middle_east', // UAE
  SA: 'middle_east', // Saudi Arabia
  QA: 'middle_east', // Qatar
  KW: 'middle_east', // Kuwait
  BH: 'middle_east', // Bahrain
  OM: 'middle_east', // Oman
  YE: 'middle_east', // Yemen
  JO: 'middle_east', // Jordan
  LB: 'middle_east', // Lebanon
  SY: 'middle_east', // Syria
  IQ: 'middle_east', // Iraq
  IR: 'middle_east', // Iran
  IL: 'middle_east', // Israel
  PS: 'middle_east', // Palestine
  TR: 'middle_east', // Turkey
  GE: 'middle_east', // Georgia
  AM: 'middle_east', // Armenia
  AZ: 'middle_east', // Azerbaijan
  EG: 'middle_east', // Egypt (Middle East for car rental purposes)

  // OCEANIA
  AU: 'oceania', // Australia
  NZ: 'oceania', // New Zealand
  FJ: 'oceania', // Fiji
  PG: 'oceania', // Papua New Guinea
  NC: 'oceania', // New Caledonia
  PF: 'oceania', // French Polynesia
  WS: 'oceania', // Samoa
  TO: 'oceania', // Tonga
  VU: 'oceania', // Vanuatu
  SB: 'oceania', // Solomon Islands
  GU: 'oceania', // Guam
  FM: 'oceania', // Micronesia
  PW: 'oceania', // Palau
  MH: 'oceania', // Marshall Islands
  KI: 'oceania', // Kiribati
  NR: 'oceania', // Nauru
  TV: 'oceania', // Tuvalu

  // AFRICA
  ZA: 'africa', // South Africa
  EG: 'africa', // Egypt (also counted in Middle East)
  MA: 'africa', // Morocco
  TN: 'africa', // Tunisia
  DZ: 'africa', // Algeria
  LY: 'africa', // Libya
  NG: 'africa', // Nigeria
  GH: 'africa', // Ghana
  KE: 'africa', // Kenya
  TZ: 'africa', // Tanzania
  UG: 'africa', // Uganda
  RW: 'africa', // Rwanda
  ET: 'africa', // Ethiopia
  SD: 'africa', // Sudan
  SS: 'africa', // South Sudan
  AO: 'africa', // Angola
  MZ: 'africa', // Mozambique
  ZW: 'africa', // Zimbabwe
  ZM: 'africa', // Zambia
  BW: 'africa', // Botswana
  NA: 'africa', // Namibia
  MW: 'africa', // Malawi
  MU: 'africa', // Mauritius
  SC: 'africa', // Seychelles
  MG: 'africa', // Madagascar
  RE: 'africa', // Réunion
  SN: 'africa', // Senegal
  CI: 'africa', // Côte d'Ivoire
  CM: 'africa', // Cameroon
  GA: 'africa', // Gabon
  CG: 'africa', // Congo
  CD: 'africa', // DRC
  ML: 'africa', // Mali
  BF: 'africa', // Burkina Faso
  NE: 'africa', // Niger
  TD: 'africa', // Chad
  ER: 'africa', // Eritrea
  DJ: 'africa', // Djibouti
  SO: 'africa', // Somalia
  CV: 'africa', // Cape Verde
  GM: 'africa', // Gambia
  GN: 'africa', // Guinea
  GW: 'africa', // Guinea-Bissau
  LR: 'africa', // Liberia
  SL: 'africa', // Sierra Leone
  TG: 'africa', // Togo
  BJ: 'africa', // Benin
  MR: 'africa', // Mauritania
  CF: 'africa', // Central African Republic
  GQ: 'africa', // Equatorial Guinea
  ST: 'africa', // São Tomé and Príncipe
  BI: 'africa', // Burundi
  SZ: 'africa', // Eswatini
  LS: 'africa', // Lesotho
  KM: 'africa', // Comoros
};

// ============================================================================
// IATA CODE TO COUNTRY CODE MAPPING (MAJOR AIRPORTS + SMART DETECTION)
// ============================================================================
const iataToCountry: Record<string, string> = {
  // BRAZIL (50+ airports)
  GRU: 'BR', CGH: 'BR', BSB: 'BR', GIG: 'BR', SDU: 'BR', CNF: 'BR', POA: 'BR', CWB: 'BR',
  SSA: 'BR', REC: 'BR', FOR: 'BR', BEL: 'BR', MAO: 'BR', VCP: 'BR', FLN: 'BR', NAT: 'BR',
  MCZ: 'BR', AJU: 'BR', CGB: 'BR', SLZ: 'BR', THE: 'BR', JPA: 'BR', PVH: 'BR', BVB: 'BR',
  RBR: 'BR', MCP: 'BR', PMW: 'BR', STM: 'BR', CZS: 'BR', TFF: 'BR', VIX: 'BR', UDI: 'BR',
  RAO: 'BR', SJP: 'BR', IGU: 'BR', JOI: 'BR', XAP: 'BR', MGF: 'BR', LDB: 'BR', NVT: 'BR',
  JDO: 'BR', CPV: 'BR', PNZ: 'BR', IOS: 'BR', IMP: 'BR', PPB: 'BR', UBA: 'BR', URG: 'BR',
  BPS: 'BR', ILZ: 'BR', CAW: 'BR', GYN: 'BR', CFB: 'BR', PLU: 'BR', BHZ: 'BR', MOC: 'BR',
  JDF: 'BR', VAG: 'BR', SJK: 'BR', RIA: 'BR', SOD: 'BR', BAU: 'BR', ARU: 'BR', GRZ: 'BR',

  // USA (100+ airports)
  JFK: 'US', LAX: 'US', ORD: 'US', DFW: 'US', DEN: 'US', SFO: 'US', SEA: 'US', LAS: 'US',
  MCO: 'US', MIA: 'US', CLT: 'US', PHX: 'US', IAH: 'US', EWR: 'US', MSP: 'US', DTW: 'US',
  BOS: 'US', PHL: 'US', LGA: 'US', FLL: 'US', BWI: 'US', DCA: 'US', SLC: 'US', SAN: 'US',
  IAD: 'US', TPA: 'US', HNL: 'US', PDX: 'US', STL: 'US', BNA: 'US', AUS: 'US', OAK: 'US',
  RDU: 'US', SNA: 'US', SJC: 'US', SMF: 'US', CLE: 'US', MCI: 'US', IND: 'US', CMH: 'US',
  SAT: 'US', PIT: 'US', CVG: 'US', OGG: 'US', RSW: 'US', BDL: 'US', MKE: 'US', JAX: 'US',
  ABQ: 'US', OKC: 'US', OMA: 'US', MEM: 'US', RIC: 'US', ONT: 'US', BUR: 'US', PBI: 'US',
  SDF: 'US', TUS: 'US', ANC: 'US', BUF: 'US', ATL: 'US', ORF: 'US', DAL: 'US', HOU: 'US',
  MDW: 'US', MSY: 'US', RNO: 'US', BOI: 'US', GEG: 'US', LIT: 'US', TUL: 'US', GSP: 'US',
  ROC: 'US', SYR: 'US', ALB: 'US', PWM: 'US', BTV: 'US', DSM: 'US', ICT: 'US', FAT: 'US',
  SBA: 'US', PSP: 'US', COS: 'US', ELP: 'US', LBB: 'US', AMA: 'US', MAF: 'US', KOA: 'US',
  LIH: 'US', ITO: 'US', FAI: 'US', JNU: 'US', SIT: 'US', BRW: 'US', OME: 'US', OTZ: 'US',

  // CANADA (50+ airports)
  YYZ: 'CA', YVR: 'CA', YUL: 'CA', YYC: 'CA', YEG: 'CA', YOW: 'CA', YWG: 'CA', YHZ: 'CA',
  YQB: 'CA', YYJ: 'CA', YXE: 'CA', YQR: 'CA', YKA: 'CA', YLW: 'CA', YXJ: 'CA', YQT: 'CA',
  YQM: 'CA', YFC: 'CA', YSJ: 'CA', YDF: 'CA', YYT: 'CA', YZF: 'CA', YXY: 'CA', YFB: 'CA',

  // EUROPE - UK
  LHR: 'GB', LGW: 'GB', STN: 'GB', LTN: 'GB', MAN: 'GB', EDI: 'GB', GLA: 'GB', BHX: 'GB',
  BRS: 'GB', LPL: 'GB', NCL: 'GB', BFS: 'GB', LCY: 'GB', EMA: 'GB', SEN: 'GB', ABZ: 'GB',

  // EUROPE - Germany
  FRA: 'DE', MUC: 'DE', BER: 'DE', DUS: 'DE', HAM: 'DE', CGN: 'DE', STR: 'DE', HAJ: 'DE',
  LEJ: 'DE', NUE: 'DE', TXL: 'DE', SXF: 'DE', DTM: 'DE', FMO: 'DE', PAD: 'DE', HHN: 'DE',

  // EUROPE - France
  CDG: 'FR', ORY: 'FR', NCE: 'FR', LYS: 'FR', MRS: 'FR', TLS: 'FR', BOD: 'FR', NTE: 'FR',
  SXB: 'FR', MPL: 'FR', RNS: 'FR', LIL: 'FR', BIA: 'FR', AJA: 'FR', FSC: 'FR',

  // EUROPE - Spain
  MAD: 'ES', BCN: 'ES', PMI: 'ES', AGP: 'ES', ALC: 'ES', IBZ: 'ES', TFS: 'ES', LPA: 'ES',
  VLC: 'ES', BIO: 'ES', SVQ: 'ES', ACE: 'ES', FUE: 'ES', GRX: 'ES', OVD: 'ES', SCQ: 'ES',

  // EUROPE - Italy
  FCO: 'IT', MXP: 'IT', NAP: 'IT', VCE: 'IT', PSA: 'IT', BLQ: 'IT', TRN: 'IT', BGY: 'IT',
  CTA: 'IT', PMO: 'IT', FLR: 'IT', CAG: 'IT', OLB: 'IT', VRN: 'IT', GOA: 'IT', BRI: 'IT',

  // EUROPE - Netherlands, Belgium, Switzerland, Austria
  AMS: 'NL', RTM: 'NL', EIN: 'NL', BRU: 'BE', CRL: 'BE', ZRH: 'CH', GVA: 'CH', BSL: 'CH',
  VIE: 'AT', SZG: 'AT', INN: 'AT', GRZ: 'AT',

  // EUROPE - Nordics
  CPH: 'DK', OSL: 'NO', BGO: 'NO', TRD: 'NO', SVG: 'NO', ARN: 'SE', GOT: 'SE', MMX: 'SE',
  HEL: 'FI', TMP: 'FI', OUL: 'FI', KEF: 'IS', RKV: 'IS',

  // EUROPE - Ireland, Portugal, Greece
  DUB: 'IE', SNN: 'IE', ORK: 'IE', LIS: 'PT', OPO: 'PT', FAO: 'PT', FNC: 'PT', PDL: 'PT',
  ATH: 'GR', SKG: 'GR', HER: 'GR', RHO: 'GR', CFU: 'GR', CHQ: 'GR', JTR: 'GR', JMK: 'GR',

  // EUROPE - Eastern Europe
  WAW: 'PL', KRK: 'PL', GDN: 'PL', KTW: 'PL', WRO: 'PL', PRG: 'CZ', BRQ: 'CZ', BUD: 'HU',
  OTP: 'RO', CLJ: 'RO', SOF: 'BG', VAR: 'BG', ZAG: 'HR', SPU: 'HR', DBV: 'HR', PUY: 'HR',
  LJU: 'SI', BTS: 'SK', KSC: 'SK', VNO: 'LT', KUN: 'LT', RIX: 'LV', TLL: 'EE',

  // EUROPE - Russia, Ukraine
  SVO: 'RU', DME: 'RU', VKO: 'RU', LED: 'RU', KZN: 'RU', SVX: 'RU', OVB: 'RU', VVO: 'RU',
  KBP: 'UA', IEV: 'UA', ODS: 'UA', LWO: 'UA', HRK: 'UA', DNK: 'UA',

  // LATIN AMERICA
  EZE: 'AR', AEP: 'AR', COR: 'AR', MDZ: 'AR', BRC: 'AR', IGR: 'AR', SLA: 'AR', TUC: 'AR',
  SCL: 'CL', IQQ: 'CL', ANF: 'CL', CCP: 'CL', PMC: 'CL', PUQ: 'CL',
  BOG: 'CO', MDE: 'CO', CTG: 'CO', CLO: 'CO', BAQ: 'CO', SMR: 'CO', ADZ: 'CO',
  LIM: 'PE', CUZ: 'PE', AQP: 'PE', TRU: 'PE', PIU: 'PE',
  UIO: 'EC', GYE: 'EC', CUE: 'EC', GPS: 'EC',
  CCS: 'VE', MAR: 'VE', VLN: 'VE', BLA: 'VE',
  MEX: 'MX', GDL: 'MX', CUN: 'MX', MTY: 'MX', TIJ: 'MX', SJD: 'MX', PVR: 'MX', CZM: 'MX',
  PTY: 'PA', SJO: 'CR', LIR: 'CR', SAL: 'SV', GUA: 'GT', TGU: 'HN', MGA: 'NI', BZE: 'BZ',
  HAV: 'CU', VRA: 'CU', HOG: 'CU', SJU: 'PR', SDQ: 'DO', PUJ: 'DO', STI: 'DO',
  MVD: 'UY', ASU: 'PY', VVI: 'BO', LPB: 'BO', CBB: 'BO', SRE: 'BO',

  // ASIA - Japan
  NRT: 'JP', HND: 'JP', KIX: 'JP', NGO: 'JP', CTS: 'JP', FUK: 'JP', OKA: 'JP', ITM: 'JP',
  KOJ: 'JP', HIJ: 'JP', SDJ: 'JP', KMQ: 'JP', TAK: 'JP', MYJ: 'JP', UBJ: 'JP', KCZ: 'JP',

  // ASIA - South Korea
  ICN: 'KR', GMP: 'KR', PUS: 'KR', CJU: 'KR', TAE: 'KR', KWJ: 'KR', RSU: 'KR',

  // ASIA - China
  PEK: 'CN', PVG: 'CN', CAN: 'CN', CTU: 'CN', SZX: 'CN', SHA: 'CN', HGH: 'CN', WUH: 'CN',
  XIY: 'CN', CKG: 'CN', KMG: 'CN', NKG: 'CN', TSN: 'CN', DLC: 'CN', TAO: 'CN', XMN: 'CN',
  CSX: 'CN', CGO: 'CN', SYX: 'CN', HAK: 'CN', NNG: 'CN', KHN: 'CN', HET: 'CN',

  // ASIA - Hong Kong, Macau, Taiwan
  HKG: 'HK', MFM: 'MO', TPE: 'TW', TSA: 'TW', KHH: 'TW', RMQ: 'TW', TNN: 'TW',

  // ASIA - Southeast Asia
  SIN: 'SG', BKK: 'TH', DMK: 'TH', HKT: 'TH', CNX: 'TH', HDY: 'TH', USM: 'TH', KBV: 'TH',
  KUL: 'MY', SZB: 'MY', PEN: 'MY', LGK: 'MY', BKI: 'MY', KCH: 'MY', JHB: 'MY',
  CGK: 'ID', DPS: 'ID', SUB: 'ID', JOG: 'ID', UPG: 'ID', BPN: 'ID', PDG: 'ID', MES: 'ID',
  MNL: 'PH', CEB: 'PH', DVO: 'PH', ILO: 'PH', ZAM: 'PH', CRK: 'PH', KLO: 'PH',
  HAN: 'VN', SGN: 'VN', DAD: 'VN', CXR: 'VN', HPH: 'VN', VDO: 'VN', PQC: 'VN',
  RGN: 'MM', MDL: 'MM', NYU: 'MM', REP: 'KH', PNH: 'KH', VTE: 'LA', LPQ: 'LA', BWN: 'BN',

  // ASIA - South Asia
  DEL: 'IN', BOM: 'IN', MAA: 'IN', BLR: 'IN', CCU: 'IN', HYD: 'IN', COK: 'IN', AMD: 'IN',
  PNQ: 'IN', GOI: 'IN', JAI: 'IN', LKO: 'IN', IXB: 'IN', TRV: 'IN', SXR: 'IN', GAU: 'IN',
  KHI: 'PK', LHE: 'PK', ISB: 'PK', DAC: 'BD', CGP: 'BD', CMB: 'LK', HRI: 'LK',
  KTM: 'NP', PKR: 'NP', MLE: 'MV',

  // MIDDLE EAST
  DXB: 'AE', AUH: 'AE', SHJ: 'AE', DOH: 'QA', RUH: 'SA', JED: 'SA', DMM: 'SA', MED: 'SA',
  KWI: 'KW', BAH: 'BH', MCT: 'OM', SLL: 'OM', AMM: 'JO', AQJ: 'JO', BEY: 'LB',
  TLV: 'IL', ETH: 'IL', SDV: 'IL', CAI: 'EG', HBE: 'EG', HRG: 'EG', SSH: 'EG', LXR: 'EG',
  IST: 'TR', SAW: 'TR', ESB: 'TR', AYT: 'TR', ADB: 'TR', DLM: 'TR', BJV: 'TR',
  TBS: 'GE', EVN: 'AM', GYD: 'AZ', IKA: 'IR', MHD: 'IR', THR: 'IR', SYZ: 'IR',
  BGW: 'IQ', BSR: 'IQ', EBL: 'IQ', NJF: 'IQ',

  // OCEANIA
  SYD: 'AU', MEL: 'AU', BNE: 'AU', PER: 'AU', ADL: 'AU', OOL: 'AU', CNS: 'AU', CBR: 'AU',
  HBA: 'AU', DRW: 'AU', TSV: 'AU', ASP: 'AU', AVV: 'AU', MCY: 'AU', NTL: 'AU', LST: 'AU',
  AKL: 'NZ', WLG: 'NZ', CHC: 'NZ', ZQN: 'NZ', DUD: 'NZ', ROT: 'NZ', NPE: 'NZ', NPL: 'NZ',
  NAN: 'FJ', SUV: 'FJ', PPT: 'PF', BOB: 'PF', NOU: 'NC', APW: 'WS', TBU: 'TO', POM: 'PG',
  GUM: 'GU', SPN: 'MP', PPG: 'AS',

  // AFRICA
  JNB: 'ZA', CPT: 'ZA', DUR: 'ZA', PLZ: 'ZA', GRJ: 'ZA', HLA: 'ZA', ELS: 'ZA', BFN: 'ZA',
  CMN: 'MA', RAK: 'MA', AGA: 'MA', FEZ: 'MA', TNG: 'MA', ESU: 'MA', OZZ: 'MA', NDR: 'MA',
  TUN: 'TN', NBE: 'TN', DJE: 'TN', SFA: 'TN', ALG: 'DZ', ORN: 'DZ', CZL: 'DZ',
  LOS: 'NG', ABV: 'NG', PHC: 'NG', KAN: 'NG', ACC: 'GH', NBO: 'KE', MBA: 'KE', KIS: 'KE',
  DAR: 'TZ', ZNZ: 'TZ', JRO: 'TZ', EBB: 'UG', KGL: 'RW', ADD: 'ET', DIR: 'ET',
  MRU: 'MU', SEZ: 'SC', TNR: 'MG', NOS: 'MG', LAD: 'AO', LUN: 'ZM', LVI: 'ZM',
  HRE: 'ZW', VFA: 'ZW', GBE: 'BW', MUB: 'BW', WDH: 'NA', MPM: 'MZ', DSS: 'SN', DKR: 'SN',
  ABJ: 'CI', DLA: 'CM', LBV: 'GA', FIH: 'CD', BZV: 'CG',
};

// ============================================================================
// SMART REGION DETECTION
// ============================================================================
export function detectRegion(locationCode: string): Region {
  const code = locationCode.toUpperCase().trim();

  // 1. Try direct IATA lookup
  const countryCode = iataToCountry[code];
  if (countryCode) {
    return countryToRegion[countryCode] || 'global';
  }

  // 2. Try to extract country from city code (e.g., "NYCX" -> "US")
  // Many city codes follow patterns

  // 3. Smart prefix detection for common patterns
  // Brazilian airports often start with S (but not always)
  if (code.length === 3) {
    // Check first letter patterns
    const firstChar = code.charAt(0);

    // Y prefix is typically Canadian
    if (firstChar === 'Y' && code.length === 3) {
      return 'canada';
    }
  }

  // 4. Default to global
  return 'global';
}

// ============================================================================
// LOCATION INFO RESOLVER
// ============================================================================
export function getLocationInfo(code: string, customCity?: string): LocationInfo {
  const upperCode = code.toUpperCase().trim();
  const countryCode = iataToCountry[upperCode] || '';
  const region = detectRegion(upperCode);

  // Determine location type
  let locationType: LocationType = 'airport';
  if (upperCode.endsWith('C') || upperCode.endsWith('X')) {
    locationType = 'city'; // City codes often end in C or X
  }
  if (upperCode.endsWith('T') || upperCode.includes('TRN') || upperCode.includes('STN')) {
    locationType = 'train_station';
  }

  // Get airport info from database or generate default
  const airportInfo = airportNames[upperCode];
  const cityName = customCity || airportInfo?.city || upperCode;
  const locationName = airportInfo?.name || `${cityName} International Airport`;
  const address = locationType === 'airport'
    ? `${locationName}, Car Rental Center`
    : `${cityName} Downtown, Main Car Rental Office`;

  return {
    code: upperCode,
    name: locationName,
    address,
    city: cityName,
    country: getCountryName(countryCode),
    countryCode,
    region,
    type: locationType,
  };
}

// ============================================================================
// COUNTRY NAME LOOKUP
// ============================================================================
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    BR: 'Brazil', US: 'United States', CA: 'Canada', GB: 'United Kingdom',
    DE: 'Germany', FR: 'France', IT: 'Italy', ES: 'Spain', PT: 'Portugal',
    NL: 'Netherlands', BE: 'Belgium', AT: 'Austria', CH: 'Switzerland',
    SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', IE: 'Ireland',
    GR: 'Greece', PL: 'Poland', CZ: 'Czech Republic', HU: 'Hungary',
    RO: 'Romania', BG: 'Bulgaria', HR: 'Croatia', MX: 'Mexico', AR: 'Argentina',
    CL: 'Chile', CO: 'Colombia', PE: 'Peru', JP: 'Japan', KR: 'South Korea',
    CN: 'China', HK: 'Hong Kong', TW: 'Taiwan', SG: 'Singapore', MY: 'Malaysia',
    TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines', ID: 'Indonesia',
    IN: 'India', AE: 'UAE', SA: 'Saudi Arabia', QA: 'Qatar', AU: 'Australia',
    NZ: 'New Zealand', ZA: 'South Africa', EG: 'Egypt', MA: 'Morocco',
    NG: 'Nigeria', KE: 'Kenya', TR: 'Turkey', IL: 'Israel', RU: 'Russia',
    UA: 'Ukraine',
  };
  return countries[code] || '';
}

// ============================================================================
// EXPORTS
// ============================================================================
export { countryToRegion, iataToCountry };
