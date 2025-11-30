/**
 * City Location Data
 * Contains city centers, airports, and popular districts for location-based features
 */

export interface CityLocation {
  center: { lat: number; lng: number };
  airport: { code: string; lat: number; lng: number; name: string };
  popularDistricts: string[];
}

export const cityLocations: Record<string, CityLocation> = {
  // Middle East
  'dubai': {
    center: { lat: 25.2048, lng: 55.2708 },
    airport: { code: 'DXB', lat: 25.2532, lng: 55.3657, name: 'Dubai International' },
    popularDistricts: ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Deira', 'Bur Dubai', 'JBR', 'Business Bay', 'Jumeirah']
  },
  'abu dhabi': {
    center: { lat: 24.4539, lng: 54.3773 },
    airport: { code: 'AUH', lat: 24.4330, lng: 54.6511, name: 'Abu Dhabi International' },
    popularDistricts: ['Corniche', 'Al Maryah Island', 'Yas Island', 'Saadiyat Island', 'Al Reem Island']
  },

  // Brazil
  'sao paulo': {
    center: { lat: -23.5505, lng: -46.6333 },
    airport: { code: 'GRU', lat: -23.4356, lng: -46.4731, name: 'Guarulhos International' },
    popularDistricts: ['Paulista', 'Itaim Bibi', 'Vila Madalena', 'Pinheiros', 'Jardins', 'Faria Lima', 'Centro', 'Moema', 'Vila Olímpia']
  },
  'rio de janeiro': {
    center: { lat: -22.9068, lng: -43.1729 },
    airport: { code: 'GIG', lat: -22.8090, lng: -43.2506, name: 'Galeão International' },
    popularDistricts: ['Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Botafogo', 'Centro', 'Santa Teresa', 'Lapa']
  },

  // Europe
  'paris': {
    center: { lat: 48.8566, lng: 2.3522 },
    airport: { code: 'CDG', lat: 49.0097, lng: 2.5479, name: 'Charles de Gaulle' },
    popularDistricts: ['Champs-Élysées', 'Le Marais', 'Montmartre', 'Saint-Germain', 'Latin Quarter', 'Opera', 'Louvre', 'Eiffel Tower']
  },
  'london': {
    center: { lat: 51.5074, lng: -0.1278 },
    airport: { code: 'LHR', lat: 51.4700, lng: -0.4543, name: 'Heathrow' },
    popularDistricts: ['Westminster', 'Kensington', 'Covent Garden', 'Soho', 'South Bank', 'Shoreditch', 'Mayfair', 'Camden']
  },
  'barcelona': {
    center: { lat: 41.3851, lng: 2.1734 },
    airport: { code: 'BCN', lat: 41.2971, lng: 2.0785, name: 'El Prat' },
    popularDistricts: ['Gothic Quarter', 'Eixample', 'La Rambla', 'Barceloneta', 'Gràcia', 'El Born', 'Sagrada Familia']
  },
  'rome': {
    center: { lat: 41.9028, lng: 12.4964 },
    airport: { code: 'FCO', lat: 41.8003, lng: 12.2389, name: 'Fiumicino' },
    popularDistricts: ['Centro Storico', 'Trastevere', 'Vatican', 'Colosseum', 'Termini', 'Spanish Steps', 'Pantheon']
  },
  'madrid': {
    center: { lat: 40.4168, lng: -3.7038 },
    airport: { code: 'MAD', lat: 40.4983, lng: -3.5676, name: 'Barajas' },
    popularDistricts: ['Sol', 'Gran Via', 'Salamanca', 'Malasaña', 'La Latina', 'Chueca', 'Retiro', 'Chamberí']
  },
  'amsterdam': {
    center: { lat: 52.3676, lng: 4.9041 },
    airport: { code: 'AMS', lat: 52.3105, lng: 4.7683, name: 'Schiphol' },
    popularDistricts: ['Centrum', 'Jordaan', 'De Pijp', 'Museum Quarter', 'Oud-West', 'Oost', 'Noord']
  },
  'lisbon': {
    center: { lat: 38.7223, lng: -9.1393 },
    airport: { code: 'LIS', lat: 38.7756, lng: -9.1354, name: 'Humberto Delgado' },
    popularDistricts: ['Baixa', 'Alfama', 'Bairro Alto', 'Chiado', 'Belém', 'Príncipe Real', 'Santos']
  },
  'berlin': {
    center: { lat: 52.5200, lng: 13.4050 },
    airport: { code: 'BER', lat: 52.3667, lng: 13.5033, name: 'Brandenburg' },
    popularDistricts: ['Mitte', 'Kreuzberg', 'Prenzlauer Berg', 'Friedrichshain', 'Charlottenburg', 'Neukölln']
  },

  // Americas
  'new york': {
    center: { lat: 40.7128, lng: -74.0060 },
    airport: { code: 'JFK', lat: 40.6413, lng: -73.7781, name: 'JFK International' },
    popularDistricts: ['Manhattan', 'Times Square', 'Midtown', 'SoHo', 'Brooklyn', 'Chelsea', 'Upper East Side', 'Financial District']
  },
  'los angeles': {
    center: { lat: 34.0522, lng: -118.2437 },
    airport: { code: 'LAX', lat: 33.9425, lng: -118.4081, name: 'LAX' },
    popularDistricts: ['Hollywood', 'Santa Monica', 'Beverly Hills', 'Downtown', 'Venice Beach', 'West Hollywood', 'Malibu']
  },
  'miami': {
    center: { lat: 25.7617, lng: -80.1918 },
    airport: { code: 'MIA', lat: 25.7959, lng: -80.2870, name: 'Miami International' },
    popularDistricts: ['South Beach', 'Downtown', 'Brickell', 'Wynwood', 'Coconut Grove', 'Coral Gables', 'Miami Beach']
  },
  'cancun': {
    center: { lat: 21.1619, lng: -86.8515 },
    airport: { code: 'CUN', lat: 21.0365, lng: -86.8771, name: 'Cancún International' },
    popularDistricts: ['Hotel Zone', 'Downtown', 'Puerto Juárez', 'Playa Delfines', 'Punta Cancún']
  },
  'mexico city': {
    center: { lat: 19.4326, lng: -99.1332 },
    airport: { code: 'MEX', lat: 19.4361, lng: -99.0719, name: 'Benito Juárez' },
    popularDistricts: ['Roma', 'Condesa', 'Polanco', 'Centro Histórico', 'Coyoacán', 'Zona Rosa', 'Santa Fe']
  },
  'buenos aires': {
    center: { lat: -34.6037, lng: -58.3816 },
    airport: { code: 'EZE', lat: -34.8222, lng: -58.5358, name: 'Ezeiza' },
    popularDistricts: ['Palermo', 'Recoleta', 'San Telmo', 'Puerto Madero', 'La Boca', 'Belgrano', 'Microcentro']
  },

  // Asia
  'tokyo': {
    center: { lat: 35.6762, lng: 139.6503 },
    airport: { code: 'NRT', lat: 35.7720, lng: 140.3929, name: 'Narita' },
    popularDistricts: ['Shinjuku', 'Shibuya', 'Ginza', 'Asakusa', 'Roppongi', 'Akihabara', 'Harajuku', 'Odaiba']
  },
  'singapore': {
    center: { lat: 1.3521, lng: 103.8198 },
    airport: { code: 'SIN', lat: 1.3644, lng: 103.9915, name: 'Changi' },
    popularDistricts: ['Marina Bay', 'Orchard', 'Chinatown', 'Little India', 'Sentosa', 'Clarke Quay', 'Bugis']
  },
  'bangkok': {
    center: { lat: 13.7563, lng: 100.5018 },
    airport: { code: 'BKK', lat: 13.6900, lng: 100.7501, name: 'Suvarnabhumi' },
    popularDistricts: ['Sukhumvit', 'Silom', 'Siam', 'Khao San', 'Riverside', 'Sathorn', 'Chatuchak']
  },
  'hong kong': {
    center: { lat: 22.3193, lng: 114.1694 },
    airport: { code: 'HKG', lat: 22.3080, lng: 113.9185, name: 'Hong Kong International' },
    popularDistricts: ['Central', 'Tsim Sha Tsui', 'Causeway Bay', 'Wan Chai', 'Mongkok', 'Lan Kwai Fong']
  },
  'bali': {
    center: { lat: -8.4095, lng: 115.1889 },
    airport: { code: 'DPS', lat: -8.7482, lng: 115.1672, name: 'Ngurah Rai' },
    popularDistricts: ['Seminyak', 'Kuta', 'Ubud', 'Canggu', 'Nusa Dua', 'Sanur', 'Jimbaran', 'Uluwatu']
  },

  // Australia & Oceania
  'sydney': {
    center: { lat: -33.8688, lng: 151.2093 },
    airport: { code: 'SYD', lat: -33.9399, lng: 151.1753, name: 'Kingsford Smith' },
    popularDistricts: ['CBD', 'Darling Harbour', 'Circular Quay', 'Bondi', 'Surry Hills', 'Manly', 'The Rocks']
  },

  // Africa
  'cape town': {
    center: { lat: -33.9249, lng: 18.4241 },
    airport: { code: 'CPT', lat: -33.9649, lng: 18.6017, name: 'Cape Town International' },
    popularDistricts: ['V&A Waterfront', 'City Bowl', 'Camps Bay', 'Sea Point', 'Green Point', 'De Waterkant']
  },
  'marrakech': {
    center: { lat: 31.6295, lng: -7.9811 },
    airport: { code: 'RAK', lat: 31.6069, lng: -8.0363, name: 'Menara' },
    popularDistricts: ['Medina', 'Gueliz', 'Hivernage', 'Palmeraie', 'Kasbah']
  },

  // ============================================
  // EXPANDED CITY DATABASE - 80+ Additional Cities
  // ============================================

  // === MORE MIDDLE EAST ===
  'doha': {
    center: { lat: 25.2854, lng: 51.5310 },
    airport: { code: 'DOH', lat: 25.2732, lng: 51.6081, name: 'Hamad International' },
    popularDistricts: ['West Bay', 'The Pearl', 'Souq Waqif', 'Katara', 'Lusail', 'Corniche', 'Msheireb']
  },
  'muscat': {
    center: { lat: 23.5880, lng: 58.3829 },
    airport: { code: 'MCT', lat: 23.5933, lng: 58.2844, name: 'Muscat International' },
    popularDistricts: ['Mutrah', 'Old Muscat', 'Qurum', 'Al Mouj', 'Shatti Al Qurum', 'Ruwi']
  },
  'riyadh': {
    center: { lat: 24.7136, lng: 46.6753 },
    airport: { code: 'RUH', lat: 24.9576, lng: 46.6988, name: 'King Khalid International' },
    popularDistricts: ['Olaya', 'Al Malaz', 'Diplomatic Quarter', 'King Abdullah Financial District', 'Al Diriyah']
  },
  'jeddah': {
    center: { lat: 21.4858, lng: 39.1925 },
    airport: { code: 'JED', lat: 21.6796, lng: 39.1565, name: 'King Abdulaziz International' },
    popularDistricts: ['Al Balad', 'Corniche', 'Al Hamra', 'Al Rawdah', 'Obhur', 'Red Sea Mall Area']
  },
  'amman': {
    center: { lat: 31.9454, lng: 35.9284 },
    airport: { code: 'AMM', lat: 31.7226, lng: 35.9932, name: 'Queen Alia International' },
    popularDistricts: ['Abdoun', 'Rainbow Street', 'Jabal Amman', 'Sweifieh', 'Downtown', 'Shmeisani']
  },
  'beirut': {
    center: { lat: 33.8938, lng: 35.5018 },
    airport: { code: 'BEY', lat: 33.8209, lng: 35.4884, name: 'Rafic Hariri International' },
    popularDistricts: ['Hamra', 'Gemmayzeh', 'Mar Mikhael', 'Downtown', 'Achrafieh', 'Verdun']
  },
  'tel aviv': {
    center: { lat: 32.0853, lng: 34.7818 },
    airport: { code: 'TLV', lat: 32.0055, lng: 34.8854, name: 'Ben Gurion' },
    popularDistricts: ['Rothschild', 'Neve Tzedek', 'Florentin', 'Old Jaffa', 'Carmel Market', 'Dizengoff']
  },
  'jerusalem': {
    center: { lat: 31.7683, lng: 35.2137 },
    airport: { code: 'TLV', lat: 32.0055, lng: 34.8854, name: 'Ben Gurion (Tel Aviv)' },
    popularDistricts: ['Old City', 'Mamilla', 'German Colony', 'Ein Kerem', 'Machane Yehuda', 'City Center']
  },

  // === MORE EUROPE ===
  'istanbul': {
    center: { lat: 41.0082, lng: 28.9784 },
    airport: { code: 'IST', lat: 41.2753, lng: 28.7519, name: 'Istanbul Airport' },
    popularDistricts: ['Sultanahmet', 'Beyoğlu', 'Taksim', 'Kadıköy', 'Beşiktaş', 'Karaköy', 'Galata', 'Nişantaşı']
  },
  'vienna': {
    center: { lat: 48.2082, lng: 16.3738 },
    airport: { code: 'VIE', lat: 48.1103, lng: 16.5697, name: 'Vienna International' },
    popularDistricts: ['Innere Stadt', 'Leopoldstadt', 'Mariahilf', 'Neubau', 'Schönbrunn', 'Prater']
  },
  'prague': {
    center: { lat: 50.0755, lng: 14.4378 },
    airport: { code: 'PRG', lat: 50.1008, lng: 14.2600, name: 'Václav Havel' },
    popularDistricts: ['Old Town', 'Malá Strana', 'Prague Castle', 'Vinohrady', 'Žižkov', 'New Town']
  },
  'budapest': {
    center: { lat: 47.4979, lng: 19.0402 },
    airport: { code: 'BUD', lat: 47.4298, lng: 19.2611, name: 'Ferenc Liszt International' },
    popularDistricts: ['District V', 'Castle District', 'Jewish Quarter', 'Andrássy Avenue', 'Margaret Island']
  },
  'athens': {
    center: { lat: 37.9838, lng: 23.7275 },
    airport: { code: 'ATH', lat: 37.9364, lng: 23.9445, name: 'Eleftherios Venizelos' },
    popularDistricts: ['Plaka', 'Monastiraki', 'Kolonaki', 'Psyrri', 'Acropolis', 'Syntagma', 'Exarchia']
  },
  'milan': {
    center: { lat: 45.4642, lng: 9.1900 },
    airport: { code: 'MXP', lat: 45.6306, lng: 8.7231, name: 'Malpensa' },
    popularDistricts: ['Duomo', 'Brera', 'Navigli', 'Porta Nuova', 'Quadrilatero', 'Isola', 'City Life']
  },
  'florence': {
    center: { lat: 43.7696, lng: 11.2558 },
    airport: { code: 'FLR', lat: 43.8100, lng: 11.2051, name: 'Amerigo Vespucci' },
    popularDistricts: ['Duomo', 'Santa Croce', 'Oltrarno', 'San Lorenzo', 'Santa Maria Novella', 'San Marco']
  },
  'venice': {
    center: { lat: 45.4408, lng: 12.3155 },
    airport: { code: 'VCE', lat: 45.5053, lng: 12.3519, name: 'Marco Polo' },
    popularDistricts: ['San Marco', 'Rialto', 'Dorsoduro', 'Cannaregio', 'Murano', 'Burano', 'Giudecca']
  },
  'munich': {
    center: { lat: 48.1351, lng: 11.5820 },
    airport: { code: 'MUC', lat: 48.3538, lng: 11.7861, name: 'Franz Josef Strauss' },
    popularDistricts: ['Altstadt', 'Schwabing', 'Maxvorstadt', 'Haidhausen', 'Glockenbachviertel', 'Neuhausen']
  },
  'zurich': {
    center: { lat: 47.3769, lng: 8.5417 },
    airport: { code: 'ZRH', lat: 47.4647, lng: 8.5492, name: 'Zurich Airport' },
    popularDistricts: ['Altstadt', 'Niederdorf', 'Zürich West', 'Seefeld', 'Enge', 'Kreis 4']
  },
  'geneva': {
    center: { lat: 46.2044, lng: 6.1432 },
    airport: { code: 'GVA', lat: 46.2381, lng: 6.1089, name: 'Geneva Airport' },
    popularDistricts: ['Old Town', 'Eaux-Vives', 'Pâquis', 'Carouge', 'Plainpalais', 'Nations']
  },
  'brussels': {
    center: { lat: 50.8503, lng: 4.3517 },
    airport: { code: 'BRU', lat: 50.9014, lng: 4.4844, name: 'Brussels Airport' },
    popularDistricts: ['Grand Place', 'Sablon', 'Ixelles', 'Saint-Gilles', 'Marolles', 'European Quarter']
  },
  'dublin': {
    center: { lat: 53.3498, lng: -6.2603 },
    airport: { code: 'DUB', lat: 53.4264, lng: -6.2499, name: 'Dublin Airport' },
    popularDistricts: ['Temple Bar', 'St. Stephen Green', 'Grafton Street', 'Merrion Square', 'Smithfield', 'Portobello']
  },
  'edinburgh': {
    center: { lat: 55.9533, lng: -3.1883 },
    airport: { code: 'EDI', lat: 55.9500, lng: -3.3725, name: 'Edinburgh Airport' },
    popularDistricts: ['Old Town', 'New Town', 'Royal Mile', 'Leith', 'Grassmarket', 'Stockbridge']
  },
  'copenhagen': {
    center: { lat: 55.6761, lng: 12.5683 },
    airport: { code: 'CPH', lat: 55.6180, lng: 12.6561, name: 'Copenhagen Airport' },
    popularDistricts: ['Nyhavn', 'Vesterbro', 'Nørrebro', 'Frederiksberg', 'Christianshavn', 'Indre By']
  },
  'stockholm': {
    center: { lat: 59.3293, lng: 18.0686 },
    airport: { code: 'ARN', lat: 59.6519, lng: 17.9186, name: 'Arlanda' },
    popularDistricts: ['Gamla Stan', 'Södermalm', 'Östermalm', 'Norrmalm', 'Djurgården', 'Vasastan']
  },
  'oslo': {
    center: { lat: 59.9139, lng: 10.7522 },
    airport: { code: 'OSL', lat: 60.1976, lng: 11.1004, name: 'Gardermoen' },
    popularDistricts: ['Karl Johans Gate', 'Grünerløkka', 'Frogner', 'Majorstuen', 'Aker Brygge', 'Bjørvika']
  },
  'helsinki': {
    center: { lat: 60.1699, lng: 24.9384 },
    airport: { code: 'HEL', lat: 60.3172, lng: 24.9633, name: 'Helsinki-Vantaa' },
    popularDistricts: ['Kamppi', 'Kallio', 'Punavuori', 'Ullanlinna', 'Kruununhaka', 'Töölö']
  },
  'warsaw': {
    center: { lat: 52.2297, lng: 21.0122 },
    airport: { code: 'WAW', lat: 52.1657, lng: 20.9671, name: 'Chopin Airport' },
    popularDistricts: ['Old Town', 'Śródmieście', 'Praga', 'Mokotów', 'Wilanów', 'Żoliborz']
  },
  'krakow': {
    center: { lat: 50.0647, lng: 19.9450 },
    airport: { code: 'KRK', lat: 50.0777, lng: 19.7848, name: 'John Paul II International' },
    popularDistricts: ['Old Town', 'Kazimierz', 'Podgórze', 'Nowa Huta', 'Wawel', 'Kleparz']
  },
  'nice': {
    center: { lat: 43.7102, lng: 7.2620 },
    airport: { code: 'NCE', lat: 43.6584, lng: 7.2159, name: 'Nice Côte d Azur' },
    popularDistricts: ['Promenade des Anglais', 'Vieux Nice', 'Cimiez', 'Port', 'Jean-Médecin', 'Liberation']
  },
  'monaco': {
    center: { lat: 43.7384, lng: 7.4246 },
    airport: { code: 'NCE', lat: 43.6584, lng: 7.2159, name: 'Nice Côte d Azur' },
    popularDistricts: ['Monte Carlo', 'La Condamine', 'Monaco-Ville', 'Fontvieille', 'Larvotto']
  },
  'santorini': {
    center: { lat: 36.3932, lng: 25.4615 },
    airport: { code: 'JTR', lat: 36.3992, lng: 25.4793, name: 'Santorini Airport' },
    popularDistricts: ['Fira', 'Oia', 'Imerovigli', 'Kamari', 'Perissa', 'Firostefani']
  },
  'mykonos': {
    center: { lat: 37.4467, lng: 25.3289 },
    airport: { code: 'JMK', lat: 37.4351, lng: 25.3481, name: 'Mykonos Airport' },
    popularDistricts: ['Mykonos Town', 'Ornos', 'Platis Gialos', 'Psarou', 'Paradise Beach', 'Little Venice']
  },
  'porto': {
    center: { lat: 41.1579, lng: -8.6291 },
    airport: { code: 'OPO', lat: 41.2481, lng: -8.6814, name: 'Francisco Sá Carneiro' },
    popularDistricts: ['Ribeira', 'Baixa', 'Foz do Douro', 'Cedofeita', 'Bonfim', 'Gaia']
  },
  'seville': {
    center: { lat: 37.3891, lng: -5.9845 },
    airport: { code: 'SVQ', lat: 37.4180, lng: -5.8931, name: 'Seville Airport' },
    popularDistricts: ['Santa Cruz', 'Triana', 'El Arenal', 'Macarena', 'Centro', 'Nervión']
  },
  'malaga': {
    center: { lat: 36.7213, lng: -4.4214 },
    airport: { code: 'AGP', lat: 36.6749, lng: -4.4991, name: 'Costa del Sol' },
    popularDistricts: ['Centro', 'Malagueta', 'Soho', 'El Palo', 'Pedregalejo', 'Puerto Banús']
  },
  'ibiza': {
    center: { lat: 38.9067, lng: 1.4206 },
    airport: { code: 'IBZ', lat: 38.8729, lng: 1.3731, name: 'Ibiza Airport' },
    popularDistricts: ['Ibiza Town', 'Playa d en Bossa', 'San Antonio', 'Santa Eulalia', 'Es Canar']
  },
  'mallorca': {
    center: { lat: 39.5696, lng: 2.6502 },
    airport: { code: 'PMI', lat: 39.5517, lng: 2.7388, name: 'Palma de Mallorca' },
    popularDistricts: ['Palma Old Town', 'Santa Catalina', 'Portixol', 'Paseo Maritimo', 'Puerto Portals', 'Soller']
  },
  'naples': {
    center: { lat: 40.8518, lng: 14.2681 },
    airport: { code: 'NAP', lat: 40.8860, lng: 14.2908, name: 'Naples International' },
    popularDistricts: ['Centro Storico', 'Spaccanapoli', 'Chiaia', 'Vomero', 'Posillipo', 'Quartieri Spagnoli']
  },
  'amalfi coast': {
    center: { lat: 40.6340, lng: 14.6027 },
    airport: { code: 'NAP', lat: 40.8860, lng: 14.2908, name: 'Naples International' },
    popularDistricts: ['Positano', 'Amalfi', 'Ravello', 'Praiano', 'Maiori', 'Minori', 'Sorrento']
  },

  // === MORE ASIA ===
  'seoul': {
    center: { lat: 37.5665, lng: 126.9780 },
    airport: { code: 'ICN', lat: 37.4602, lng: 126.4407, name: 'Incheon International' },
    popularDistricts: ['Gangnam', 'Myeongdong', 'Hongdae', 'Itaewon', 'Insadong', 'Jongno', 'Dongdaemun', 'Bukchon']
  },
  'osaka': {
    center: { lat: 34.6937, lng: 135.5023 },
    airport: { code: 'KIX', lat: 34.4347, lng: 135.2441, name: 'Kansai International' },
    popularDistricts: ['Dotonbori', 'Shinsaibashi', 'Namba', 'Umeda', 'Tennoji', 'Shinsekai', 'Amerikamura']
  },
  'kyoto': {
    center: { lat: 35.0116, lng: 135.7681 },
    airport: { code: 'KIX', lat: 34.4347, lng: 135.2441, name: 'Kansai International' },
    popularDistricts: ['Gion', 'Higashiyama', 'Arashiyama', 'Kiyomizu', 'Fushimi', 'Nishiki', 'Pontocho']
  },
  'kuala lumpur': {
    center: { lat: 3.1390, lng: 101.6869 },
    airport: { code: 'KUL', lat: 2.7456, lng: 101.7099, name: 'KLIA' },
    popularDistricts: ['KLCC', 'Bukit Bintang', 'Chinatown', 'Bangsar', 'Mont Kiara', 'Sri Hartamas', 'TTDI']
  },
  'phuket': {
    center: { lat: 7.8804, lng: 98.3923 },
    airport: { code: 'HKT', lat: 8.1132, lng: 98.3169, name: 'Phuket International' },
    popularDistricts: ['Patong', 'Kata', 'Karon', 'Kamala', 'Rawai', 'Phuket Town', 'Bang Tao', 'Surin']
  },
  'krabi': {
    center: { lat: 8.0863, lng: 98.9063 },
    airport: { code: 'KBV', lat: 8.0950, lng: 98.9862, name: 'Krabi International' },
    popularDistricts: ['Ao Nang', 'Railay Beach', 'Krabi Town', 'Klong Muang', 'Phi Phi Islands', 'Ao Nam Mao']
  },
  'chiang mai': {
    center: { lat: 18.7883, lng: 98.9853 },
    airport: { code: 'CNX', lat: 18.7669, lng: 98.9626, name: 'Chiang Mai International' },
    popularDistricts: ['Old City', 'Nimman', 'Night Bazaar', 'Riverside', 'Santitham', 'Chang Phueak']
  },
  'ho chi minh city': {
    center: { lat: 10.8231, lng: 106.6297 },
    airport: { code: 'SGN', lat: 10.8188, lng: 106.6520, name: 'Tan Son Nhat' },
    popularDistricts: ['District 1', 'District 3', 'District 7', 'Ben Thanh', 'Pham Ngu Lao', 'Thu Duc']
  },
  'hanoi': {
    center: { lat: 21.0285, lng: 105.8542 },
    airport: { code: 'HAN', lat: 21.2212, lng: 105.8072, name: 'Noi Bai International' },
    popularDistricts: ['Old Quarter', 'Hoan Kiem', 'Ba Dinh', 'Tay Ho', 'French Quarter', 'Long Bien']
  },
  'manila': {
    center: { lat: 14.5995, lng: 120.9842 },
    airport: { code: 'MNL', lat: 14.5086, lng: 121.0197, name: 'Ninoy Aquino International' },
    popularDistricts: ['Makati', 'BGC', 'Malate', 'Ermita', 'Intramuros', 'Quezon City', 'Ortigas']
  },
  'cebu': {
    center: { lat: 10.3157, lng: 123.8854 },
    airport: { code: 'CEB', lat: 10.3074, lng: 123.9794, name: 'Mactan-Cebu International' },
    popularDistricts: ['IT Park', 'Ayala Center', 'Mactan Island', 'Mandaue', 'Lahug', 'Fuente Osmeña']
  },
  'mumbai': {
    center: { lat: 19.0760, lng: 72.8777 },
    airport: { code: 'BOM', lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji' },
    popularDistricts: ['Colaba', 'Bandra', 'Juhu', 'Worli', 'Fort', 'Andheri', 'Lower Parel', 'Powai']
  },
  'delhi': {
    center: { lat: 28.6139, lng: 77.2090 },
    airport: { code: 'DEL', lat: 28.5665, lng: 77.1031, name: 'Indira Gandhi International' },
    popularDistricts: ['Connaught Place', 'Chandni Chowk', 'Hauz Khas', 'Khan Market', 'Paharganj', 'Defence Colony']
  },
  'goa': {
    center: { lat: 15.2993, lng: 74.1240 },
    airport: { code: 'GOI', lat: 15.3808, lng: 73.8314, name: 'Goa International' },
    popularDistricts: ['Baga', 'Calangute', 'Anjuna', 'Panjim', 'Candolim', 'Vagator', 'Morjim', 'Palolem']
  },
  'maldives': {
    center: { lat: 4.1755, lng: 73.5093 },
    airport: { code: 'MLE', lat: 4.1918, lng: 73.5289, name: 'Velana International' },
    popularDistricts: ['Male', 'North Male Atoll', 'South Male Atoll', 'Baa Atoll', 'Ari Atoll', 'Hulhumale']
  },
  'shanghai': {
    center: { lat: 31.2304, lng: 121.4737 },
    airport: { code: 'PVG', lat: 31.1443, lng: 121.8083, name: 'Pudong International' },
    popularDistricts: ['The Bund', 'Pudong', 'French Concession', 'Jing An', 'People Square', 'Lujiazui', 'Xintiandi']
  },
  'beijing': {
    center: { lat: 39.9042, lng: 116.4074 },
    airport: { code: 'PEK', lat: 40.0799, lng: 116.6031, name: 'Capital International' },
    popularDistricts: ['Forbidden City', 'Wangfujing', 'Sanlitun', 'Qianmen', 'Houhai', 'CBD', 'Chaoyang']
  },
  'taipei': {
    center: { lat: 25.0330, lng: 121.5654 },
    airport: { code: 'TPE', lat: 25.0797, lng: 121.2342, name: 'Taoyuan International' },
    popularDistricts: ['Xinyi', 'Ximending', 'Da an', 'Zhongshan', 'Shilin', 'Songshan', 'Beitou']
  },

  // === MORE AMERICAS ===
  'san francisco': {
    center: { lat: 37.7749, lng: -122.4194 },
    airport: { code: 'SFO', lat: 37.6213, lng: -122.3790, name: 'San Francisco International' },
    popularDistricts: ['Union Square', 'Fisherman Wharf', 'SOMA', 'Mission', 'Marina', 'Castro', 'Nob Hill', 'North Beach']
  },
  'las vegas': {
    center: { lat: 36.1699, lng: -115.1398 },
    airport: { code: 'LAS', lat: 36.0840, lng: -115.1537, name: 'Harry Reid International' },
    popularDistricts: ['The Strip', 'Downtown', 'Fremont Street', 'Paradise', 'Summerlin', 'Henderson']
  },
  'chicago': {
    center: { lat: 41.8781, lng: -87.6298 },
    airport: { code: 'ORD', lat: 41.9742, lng: -87.9073, name: 'O Hare International' },
    popularDistricts: ['The Loop', 'Magnificent Mile', 'River North', 'Wicker Park', 'Lincoln Park', 'Gold Coast']
  },
  'boston': {
    center: { lat: 42.3601, lng: -71.0589 },
    airport: { code: 'BOS', lat: 42.3656, lng: -71.0096, name: 'Logan International' },
    popularDistricts: ['Back Bay', 'Beacon Hill', 'North End', 'South End', 'Seaport', 'Cambridge', 'Fenway']
  },
  'washington dc': {
    center: { lat: 38.9072, lng: -77.0369 },
    airport: { code: 'DCA', lat: 38.8512, lng: -77.0402, name: 'Reagan National' },
    popularDistricts: ['Capitol Hill', 'Georgetown', 'Dupont Circle', 'Adams Morgan', 'National Mall', 'Penn Quarter']
  },
  'toronto': {
    center: { lat: 43.6532, lng: -79.3832 },
    airport: { code: 'YYZ', lat: 43.6777, lng: -79.6248, name: 'Pearson International' },
    popularDistricts: ['Downtown', 'Yorkville', 'Queen West', 'Kensington', 'Distillery District', 'Harbourfront']
  },
  'vancouver': {
    center: { lat: 49.2827, lng: -123.1207 },
    airport: { code: 'YVR', lat: 49.1947, lng: -123.1792, name: 'Vancouver International' },
    popularDistricts: ['Downtown', 'Gastown', 'Yaletown', 'Kitsilano', 'Stanley Park', 'Granville Island']
  },
  'montreal': {
    center: { lat: 45.5017, lng: -73.5673 },
    airport: { code: 'YUL', lat: 45.4706, lng: -73.7408, name: 'Trudeau International' },
    popularDistricts: ['Old Montreal', 'Plateau', 'Mile End', 'Downtown', 'Griffintown', 'Little Italy']
  },
  'lima': {
    center: { lat: -12.0464, lng: -77.0428 },
    airport: { code: 'LIM', lat: -12.0219, lng: -77.1143, name: 'Jorge Chávez International' },
    popularDistricts: ['Miraflores', 'Barranco', 'San Isidro', 'Centro Historico', 'La Molina', 'Surco']
  },
  'bogota': {
    center: { lat: 4.7110, lng: -74.0721 },
    airport: { code: 'BOG', lat: 4.7016, lng: -74.1469, name: 'El Dorado International' },
    popularDistricts: ['La Candelaria', 'Zona Rosa', 'Chapinero', 'Usaquén', 'Parque 93', 'Centro']
  },
  'cartagena': {
    center: { lat: 10.3910, lng: -75.4794 },
    airport: { code: 'CTG', lat: 10.4424, lng: -75.5130, name: 'Rafael Núñez International' },
    popularDistricts: ['Old Town', 'Getsemaní', 'Bocagrande', 'Castillogrande', 'San Diego', 'Manga']
  },
  'havana': {
    center: { lat: 23.1136, lng: -82.3666 },
    airport: { code: 'HAV', lat: 22.9892, lng: -82.4091, name: 'José Martí International' },
    popularDistricts: ['Old Havana', 'Vedado', 'Centro Habana', 'Miramar', 'Malecón', 'Plaza Vieja']
  },
  'san juan': {
    center: { lat: 18.4655, lng: -66.1057 },
    airport: { code: 'SJU', lat: 18.4394, lng: -66.0018, name: 'Luis Muñoz Marín' },
    popularDistricts: ['Old San Juan', 'Condado', 'Isla Verde', 'Santurce', 'Miramar', 'Ocean Park']
  },
  'punta cana': {
    center: { lat: 18.5601, lng: -68.3725 },
    airport: { code: 'PUJ', lat: 18.5674, lng: -68.3634, name: 'Punta Cana International' },
    popularDistricts: ['Bavaro', 'Cap Cana', 'Uvero Alto', 'Cabeza de Toro', 'El Cortecito', 'Arena Gorda']
  },

  // === MORE AUSTRALIA & OCEANIA ===
  'melbourne': {
    center: { lat: -37.8136, lng: 144.9631 },
    airport: { code: 'MEL', lat: -37.6733, lng: 144.8433, name: 'Melbourne Airport' },
    popularDistricts: ['CBD', 'St Kilda', 'Fitzroy', 'South Yarra', 'Richmond', 'Carlton', 'Brunswick']
  },
  'brisbane': {
    center: { lat: -27.4698, lng: 153.0251 },
    airport: { code: 'BNE', lat: -27.3842, lng: 153.1175, name: 'Brisbane Airport' },
    popularDistricts: ['CBD', 'South Bank', 'Fortitude Valley', 'New Farm', 'West End', 'Paddington']
  },
  'gold coast': {
    center: { lat: -28.0167, lng: 153.4000 },
    airport: { code: 'OOL', lat: -28.1644, lng: 153.5047, name: 'Gold Coast Airport' },
    popularDistricts: ['Surfers Paradise', 'Broadbeach', 'Main Beach', 'Burleigh Heads', 'Coolangatta', 'Southport']
  },
  'auckland': {
    center: { lat: -36.8485, lng: 174.7633 },
    airport: { code: 'AKL', lat: -37.0082, lng: 174.7850, name: 'Auckland Airport' },
    popularDistricts: ['CBD', 'Ponsonby', 'Parnell', 'Newmarket', 'Viaduct Harbour', 'Devonport', 'Mission Bay']
  },
  'queenstown': {
    center: { lat: -45.0312, lng: 168.6626 },
    airport: { code: 'ZQN', lat: -45.0211, lng: 168.7392, name: 'Queenstown Airport' },
    popularDistricts: ['Town Centre', 'Frankton', 'Arrowtown', 'Fernhill', 'Kelvin Heights', 'Lake Hayes']
  },
  'fiji': {
    center: { lat: -17.7765, lng: 177.4356 },
    airport: { code: 'NAN', lat: -17.7554, lng: 177.4431, name: 'Nadi International' },
    popularDistricts: ['Denarau Island', 'Nadi Town', 'Coral Coast', 'Mamanuca Islands', 'Yasawa Islands', 'Suva']
  },

  // === MORE AFRICA ===
  'johannesburg': {
    center: { lat: -26.2041, lng: 28.0473 },
    airport: { code: 'JNB', lat: -26.1392, lng: 28.2460, name: 'O.R. Tambo International' },
    popularDistricts: ['Sandton', 'Rosebank', 'Melville', 'Maboneng', 'Soweto', 'Fourways', 'Braamfontein']
  },
  'cairo': {
    center: { lat: 30.0444, lng: 31.2357 },
    airport: { code: 'CAI', lat: 30.1219, lng: 31.4056, name: 'Cairo International' },
    popularDistricts: ['Downtown', 'Zamalek', 'Maadi', 'Heliopolis', 'Giza', 'Garden City', 'Khan el-Khalili']
  },
  'nairobi': {
    center: { lat: -1.2921, lng: 36.8219 },
    airport: { code: 'NBO', lat: -1.3192, lng: 36.9278, name: 'Jomo Kenyatta International' },
    popularDistricts: ['CBD', 'Westlands', 'Karen', 'Kilimani', 'Lavington', 'Gigiri', 'Runda']
  },
  'mauritius': {
    center: { lat: -20.1609, lng: 57.5012 },
    airport: { code: 'MRU', lat: -20.4302, lng: 57.6836, name: 'Sir Seewoosagur Ramgoolam' },
    popularDistricts: ['Grand Baie', 'Port Louis', 'Flic en Flac', 'Belle Mare', 'Le Morne', 'Trou aux Biches']
  },
  'zanzibar': {
    center: { lat: -6.1659, lng: 39.2026 },
    airport: { code: 'ZNZ', lat: -6.2220, lng: 39.2249, name: 'Abeid Amani Karume' },
    popularDistricts: ['Stone Town', 'Nungwi', 'Kendwa', 'Paje', 'Jambiani', 'Matemwe', 'Kiwengwa']
  },
  'casablanca': {
    center: { lat: 33.5731, lng: -7.5898 },
    airport: { code: 'CMN', lat: 33.3675, lng: -7.5900, name: 'Mohammed V International' },
    popularDistricts: ['Corniche', 'Maarif', 'Anfa', 'Habous', 'Old Medina', 'Ain Diab', 'Gauthier']
  },
  'seychelles': {
    center: { lat: -4.6796, lng: 55.4920 },
    airport: { code: 'SEZ', lat: -4.6743, lng: 55.5218, name: 'Seychelles International' },
    popularDistricts: ['Victoria', 'Beau Vallon', 'Anse Royale', 'Praslin', 'La Digue', 'Eden Island']
  }
};

/**
 * Get city data by name (case-insensitive, fuzzy match)
 */
export function getCityData(cityName: string): CityLocation | null {
  if (!cityName) return null;

  const normalized = cityName.toLowerCase().trim();

  // Direct match
  if (cityLocations[normalized]) {
    return cityLocations[normalized];
  }

  // Fuzzy match (contains)
  for (const [key, data] of Object.entries(cityLocations)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return data;
    }
  }

  return null;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Estimate drive time based on distance (rough estimate)
 */
export function estimateDriveTime(km: number): string {
  // Assume average speed of 30 km/h in urban areas
  const minutes = Math.round((km / 30) * 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
}

/**
 * Parse address to extract district/neighborhood
 * Prioritizes matching against known popular districts for better accuracy
 */
export function extractDistrict(address: string, city: string): string | null {
  if (!address) return null;

  const cityLower = city.toLowerCase().trim();
  const addressLower = address.toLowerCase();

  // First, try to match against known popular districts for this city
  const cityData = getCityData(city);
  if (cityData && cityData.popularDistricts) {
    for (const district of cityData.popularDistricts) {
      const districtLower = district.toLowerCase();
      // Check if district name appears in the address
      if (addressLower.includes(districtLower)) {
        return district; // Return the properly formatted district name
      }
    }
  }

  // Fallback: Extract from address parts
  const parts = address.split(',').map(p => p.trim());

  // Try to find a meaningful district name (not street number, not city, not country)
  for (const part of parts) {
    const partLower = part.toLowerCase();

    // Skip if it's the city name
    if (partLower.includes(cityLower) || cityLower.includes(partLower)) continue;

    // Skip if it looks like a street number or postal code
    if (/^\d+/.test(part) || /^\d{4,}/.test(part)) continue;

    // Skip if it's a country
    const countries = ['brazil', 'uae', 'united arab emirates', 'france', 'uk', 'usa', 'spain', 'italy', 'germany',
                       'united states', 'united kingdom', 'australia', 'canada', 'mexico', 'japan', 'china', 'india',
                       'thailand', 'indonesia', 'singapore', 'malaysia', 'portugal', 'netherlands', 'belgium'];
    if (countries.some(c => partLower.includes(c))) continue;

    // This is likely the district
    if (part.length > 2 && part.length < 50) {
      return part;
    }
  }

  return null;
}

/**
 * Get location context for a hotel
 */
export function getHotelLocationContext(
  hotelLat: number,
  hotelLng: number,
  cityName: string,
  hotelAddress?: string
): {
  district: string | null;
  distanceToCenter: string;
  distanceToAirport: string;
  driveTimeToAirport: string;
  airportCode: string;
} | null {
  const cityData = getCityData(cityName);

  if (!cityData) {
    return null;
  }

  const distToCenter = calculateDistance(hotelLat, hotelLng, cityData.center.lat, cityData.center.lng);
  const distToAirport = calculateDistance(hotelLat, hotelLng, cityData.airport.lat, cityData.airport.lng);

  return {
    district: hotelAddress ? extractDistrict(hotelAddress, cityName) : null,
    distanceToCenter: formatDistance(distToCenter),
    distanceToAirport: formatDistance(distToAirport),
    driveTimeToAirport: estimateDriveTime(distToAirport),
    airportCode: cityData.airport.code
  };
}
