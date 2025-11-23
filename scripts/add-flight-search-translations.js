const fs = require('fs');
const path = require('path');

// Define all FlightSearch translations
const flightSearchTranslations = {
  en: {
    FlightSearch: {
      // Service tabs
      flights: 'Flights',
      hotels: 'Hotels',
      cars: 'Car Rentals',
      tours: 'Tours',
      activities: 'Activities',
      packages: 'Packages',
      insurance: 'Insurance',

      // Core flight fields
      from: 'From',
      to: 'To',
      depart: 'Depart',
      return: 'Return',
      travelers: 'Travelers',
      class: 'Class',

      // Search buttons
      search: 'Search Flights',
      searchHotels: 'Search Hotels',
      searchCars: 'Search Cars',
      searchTours: 'Search Tours',
      searchActivities: 'Search Activities',
      searchPackages: 'Search Packages',
      searchInsurance: 'Get Quote',
      searching: 'Searching...',

      // Trip types
      oneWay: 'One-way',
      roundTrip: 'Round-trip',
      oneWayTrip: 'One-way trip',
      multiCity: 'Multi-city',

      // Passenger types
      adults: 'Adults',
      children: 'Children',
      infants: 'Infants',
      guest: 'Guest',
      guests: 'Guests',
      age18: '18+ years',
      age2to17: '2-17 years',
      ageUnder2: 'Under 2 years',

      // Cabin classes
      economy: 'Economy',
      premium: 'Premium Economy',
      business: 'Business',
      first: 'First Class',

      // UI labels
      done: 'Done',
      directOnly: 'Direct flights only',
      nonstop: 'Nonstop',
      selectDate: 'Select date',
      multiDates: 'Multi-Dates',

      // Hotel specific
      destination: 'Destination',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guestsAndRooms: 'Guests & Rooms',
      cityHotelLandmark: 'City, hotel, or landmark',

      // Car specific
      pickupLocation: 'Pickup Location',
      dropoffLocation: 'Dropoff Location',
      sameLocation: 'Same location',
      pickupDate: 'Pickup Date',
      dropoffDate: 'Dropoff Date',

      // Tour specific
      cityOrAttraction: 'City or attraction',
      tourDate: 'Tour Date',
      participants: 'Participants',

      // Activity specific
      activityDate: 'Activity Date',

      // Package specific
      departureDate: 'Departure Date',

      // Insurance specific
      tripDestination: 'Trip Destination',
      tripStartDate: 'Trip Start Date',
      tripCost: 'Trip Cost',
      whereTravel: 'Where are you traveling?',

      // Multi-city
      addFlight: 'Add Another Flight',
      deleteFlight: 'Delete This Flight',

      // Status & placeholders
      loading: 'Loading...',
      noResults: 'No results found',
      selectAirports: 'Select airports',
      airportCodePlaceholder: 'Airport code (e.g. MIA)',

      // Error messages
      errors: {
        originRequired: 'Please select origin',
        destinationRequired: 'Please select destination',
        departureDateRequired: 'Please select departure date',
        sameAirports: 'Origin and destination must be different',
      },
    },
  },
  pt: {
    FlightSearch: {
      // Service tabs
      flights: 'Voos',
      hotels: 'Hotéis',
      cars: 'Aluguel de Carros',
      tours: 'Passeios',
      activities: 'Atividades',
      packages: 'Pacotes',
      insurance: 'Seguro',

      // Core flight fields
      from: 'De',
      to: 'Para',
      depart: 'Ida',
      return: 'Volta',
      travelers: 'Viajantes',
      class: 'Classe',

      // Search buttons
      search: 'Buscar Voos',
      searchHotels: 'Buscar Hotéis',
      searchCars: 'Buscar Carros',
      searchTours: 'Buscar Passeios',
      searchActivities: 'Buscar Atividades',
      searchPackages: 'Buscar Pacotes',
      searchInsurance: 'Obter Cotação',
      searching: 'Buscando...',

      // Trip types
      oneWay: 'Só ida',
      roundTrip: 'Ida e volta',
      oneWayTrip: 'Viagem de ida',
      multiCity: 'Múltiplas cidades',

      // Passenger types
      adults: 'Adultos',
      children: 'Crianças',
      infants: 'Bebês',
      guest: 'Passageiro',
      guests: 'Passageiros',
      age18: '18+ anos',
      age2to17: '2-17 anos',
      ageUnder2: 'Menos de 2 anos',

      // Cabin classes
      economy: 'Econômica',
      premium: 'Econômica Premium',
      business: 'Executiva',
      first: 'Primeira Classe',

      // UI labels
      done: 'Pronto',
      directOnly: 'Apenas voos diretos',
      nonstop: 'Direto',
      selectDate: 'Selecionar data',
      multiDates: 'Multi-Datas',

      // Hotel specific
      destination: 'Destino',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guestsAndRooms: 'Hóspedes e Quartos',
      cityHotelLandmark: 'Cidade, hotel ou ponto turístico',

      // Car specific
      pickupLocation: 'Local de Retirada',
      dropoffLocation: 'Local de Devolução',
      sameLocation: 'Mesmo local',
      pickupDate: 'Data de Retirada',
      dropoffDate: 'Data de Devolução',

      // Tour specific
      cityOrAttraction: 'Cidade ou atração',
      tourDate: 'Data do Passeio',
      participants: 'Participantes',

      // Activity specific
      activityDate: 'Data da Atividade',

      // Package specific
      departureDate: 'Data de Partida',

      // Insurance specific
      tripDestination: 'Destino da Viagem',
      tripStartDate: 'Data de Início da Viagem',
      tripCost: 'Custo da Viagem',
      whereTravel: 'Para onde você está viajando?',

      // Multi-city
      addFlight: 'Adicionar Outro Voo',
      deleteFlight: 'Deletar Este Voo',

      // Status & placeholders
      loading: 'Carregando...',
      noResults: 'Nenhum resultado encontrado',
      selectAirports: 'Selecionar aeroportos',
      airportCodePlaceholder: 'Código do aeroporto (ex: GRU)',

      // Error messages
      errors: {
        originRequired: 'Selecione a origem',
        destinationRequired: 'Selecione o destino',
        departureDateRequired: 'Selecione a data de ida',
        sameAirports: 'Origem e destino devem ser diferentes',
      },
    },
  },
  es: {
    FlightSearch: {
      // Service tabs
      flights: 'Vuelos',
      hotels: 'Hoteles',
      cars: 'Alquiler de Autos',
      tours: 'Tours',
      activities: 'Actividades',
      packages: 'Paquetes',
      insurance: 'Seguro',

      // Core flight fields
      from: 'Desde',
      to: 'Hasta',
      depart: 'Salida',
      return: 'Regreso',
      travelers: 'Viajeros',
      class: 'Clase',

      // Search buttons
      search: 'Buscar Vuelos',
      searchHotels: 'Buscar Hoteles',
      searchCars: 'Buscar Autos',
      searchTours: 'Buscar Tours',
      searchActivities: 'Buscar Actividades',
      searchPackages: 'Buscar Paquetes',
      searchInsurance: 'Obtener Cotización',
      searching: 'Buscando...',

      // Trip types
      oneWay: 'Solo ida',
      roundTrip: 'Ida y vuelta',
      oneWayTrip: 'Viaje de ida',
      multiCity: 'Múltiples ciudades',

      // Passenger types
      adults: 'Adultos',
      children: 'Niños',
      infants: 'Bebés',
      guest: 'Pasajero',
      guests: 'Pasajeros',
      age18: '18+ años',
      age2to17: '2-17 años',
      ageUnder2: 'Menos de 2 años',

      // Cabin classes
      economy: 'Económica',
      premium: 'Económica Premium',
      business: 'Ejecutiva',
      first: 'Primera Clase',

      // UI labels
      done: 'Listo',
      directOnly: 'Solo vuelos directos',
      nonstop: 'Directo',
      selectDate: 'Seleccionar fecha',
      multiDates: 'Multi-Fechas',

      // Hotel specific
      destination: 'Destino',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guestsAndRooms: 'Huéspedes y Habitaciones',
      cityHotelLandmark: 'Ciudad, hotel o punto de interés',

      // Car specific
      pickupLocation: 'Lugar de Recogida',
      dropoffLocation: 'Lugar de Devolución',
      sameLocation: 'Mismo lugar',
      pickupDate: 'Fecha de Recogida',
      dropoffDate: 'Fecha de Devolución',

      // Tour specific
      cityOrAttraction: 'Ciudad o atracción',
      tourDate: 'Fecha del Tour',
      participants: 'Participantes',

      // Activity specific
      activityDate: 'Fecha de la Actividad',

      // Package specific
      departureDate: 'Fecha de Salida',

      // Insurance specific
      tripDestination: 'Destino del Viaje',
      tripStartDate: 'Fecha de Inicio del Viaje',
      tripCost: 'Costo del Viaje',
      whereTravel: '¿A dónde viajas?',

      // Multi-city
      addFlight: 'Agregar Otro Vuelo',
      deleteFlight: 'Eliminar Este Vuelo',

      // Status & placeholders
      loading: 'Cargando...',
      noResults: 'No se encontraron resultados',
      selectAirports: 'Seleccionar aeropuertos',
      airportCodePlaceholder: 'Código del aeropuerto (ej: MAD)',

      // Error messages
      errors: {
        originRequired: 'Seleccione origen',
        destinationRequired: 'Seleccione destino',
        departureDateRequired: 'Seleccione fecha de salida',
        sameAirports: 'Origen y destino deben ser diferentes',
      },
    },
  },
};

// Read and update each language file
['en', 'pt', 'es'].forEach(lang => {
  const filePath = path.join(__dirname, '..', 'messages', `${lang}.json`);

  try {
    // Read existing content
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Merge with new translations
    const updated = {
      ...existing,
      ...flightSearchTranslations[lang],
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`✅ Added FlightSearch translations to ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ FlightSearch translations added to all language files!');
