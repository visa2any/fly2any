'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { TrendingDestinations } from '@/components/home/TrendingDestinations';
import { FlashDeals } from '@/components/home/FlashDeals';
import { TrustIndicators } from '@/components/home/TrustIndicators';
import { Testimonials } from '@/components/home/Testimonials';
import { UrgencyBanner } from '@/components/conversion/UrgencyBanner';
import { LiveActivityFeed } from '@/components/conversion/LiveActivityFeed';
import { TrustBadges } from '@/components/conversion/TrustBadges';
import { StatsBar } from '@/components/conversion/StatsBar';
import { FeaturedRoutes } from '@/components/conversion/FeaturedRoutes';
import { AppDownload } from '@/components/conversion/AppDownload';
import { FAQ } from '@/components/conversion/FAQ';
import { UnifiedLocationAutocomplete } from '@/components/search/UnifiedLocationAutocomplete';
import { AirportAutocomplete } from '@/components/search/AirportAutocomplete';
import { PriceDatePicker } from '@/components/search/PriceDatePicker';
import { PassengerClassSelector } from '@/components/search/PassengerClassSelector';
import { PricePrediction } from '@/components/search/PricePrediction';
import { FlexibleDatesToggle } from '@/components/search/FlexibleDatesToggle';
import { CompactPricePrediction } from '@/components/search/CompactPricePrediction';
import { FlexibleDatesToggleWithLabel } from '@/components/search/FlexibleDatesToggleWithLabel';
import { NearbyAirportSuggestion } from '@/components/search/NearbyAirportSuggestion';
import { BundleSavingsPreview } from '@/components/search/BundleSavingsPreview';
import { SearchActivityIndicator } from '@/components/search/SearchActivityIndicator';
import { PriceFreezeOption } from '@/components/search/PriceFreezeOption';
import { RewardsPreview } from '@/components/search/RewardsPreview';
import { EnhancedSearchButton } from '@/components/search/EnhancedSearchButton';
import { TrackPricesButton } from '@/components/search/TrackPricesButton';
import { SmartFeaturesSidebar } from '@/components/search/SmartFeaturesSidebar';

type Language = 'en' | 'pt' | 'es';
type ServiceTab = 'flights' | 'hotels' | 'cars' | 'packages' | 'tours' | 'insurance';

const content = {
  en: {
    // Header
    header: {
      flights: 'Flights',
      hotels: 'Hotels',
      cars: 'Cars',
      packages: 'Packages',
      tours: 'Tours',
      support: '24/7 Support',
      signin: 'Sign In',
      signup: 'Sign Up',
    },
    // Hero
    hero: {
      title: 'Discover Your Next Adventure',
      subtitle: 'Search and compare millions of flights, hotels, and car rentals',
      trust: 'Trusted by 10M+ travelers worldwide',
    },
    // Search Widget
    search: {
      flights: 'Flights',
      hotels: 'Hotels',
      cars: 'Cars',
      packages: 'Packages',
      tours: 'Tours',
      insurance: 'Insurance',
      from: 'From',
      to: 'To',
      destination: 'Destination',
      checkin: 'Check-in',
      checkout: 'Check-out',
      pickup: 'Pick-up',
      dropoff: 'Drop-off',
      departure: 'Departure',
      return: 'Return',
      travelers: 'Travelers',
      guests: 'Guests',
      searchButton: 'Search',
      trackPrices: 'Track Prices',
    },
    // Trending Destinations
    trending: {
      title: 'Trending Destinations',
      subtitle: 'Discover where everyone is traveling this season',
      from: 'From',
    },
    // Flash Deals
    deals: {
      title: 'Flash Deals',
      subtitle: 'Limited time offers - Book now before they\'re gone!',
      save: 'Save',
      endsIn: 'Ends in',
      book: 'Book Now',
    },
    // Trust Indicators
    trust: {
      title: 'Why Choose Fly2Any?',
      subtitle: 'Join millions of satisfied travelers',
      guarantee: {
        title: 'Best Price Guarantee',
        desc: 'Find a lower price? We\'ll match it',
      },
      secure: {
        title: 'Secure Booking',
        desc: 'Your data is protected with 256-bit SSL',
      },
      support: {
        title: '24/7 Support',
        desc: 'Our team is always here to help',
      },
      travelers: {
        title: '10M+ Travelers',
        desc: 'Trusted worldwide since 2020',
      },
      cancellation: {
        title: 'Free Cancellation',
        desc: 'On most bookings - flexibility you need',
      },
      rewards: {
        title: 'Rewards Program',
        desc: 'Earn points on every booking',
      },
    },
    // Testimonials
    testimonials: {
      title: 'What Our Travelers Say',
      subtitle: 'Real reviews from real people',
    },
    // Footer
    footer: {
      company: 'Company',
      about: 'About Us',
      careers: 'Careers',
      press: 'Press',
      blog: 'Blog',
      support: 'Support',
      help: 'Help Center',
      contact: 'Contact Us',
      faq: 'FAQ',
      destinations: 'Top Destinations',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookie Policy',
      newsletter: 'Subscribe to our newsletter',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
      copyright: '© 2025 Fly2Any Travel - Based in USA',
      payments: 'We accept',
    },
  },
  // Add Portuguese and Spanish translations here (abbreviated for space)
  pt: {
    header: {
      flights: 'Voos',
      hotels: 'Hotéis',
      cars: 'Carros',
      packages: 'Pacotes',
      tours: 'Tours',
      support: 'Suporte 24/7',
      signin: 'Entrar',
      signup: 'Cadastrar',
    },
    hero: {
      title: 'Descubra Sua Próxima Aventura',
      subtitle: 'Busque e compare milhões de voos, hotéis e aluguéis de carros',
      trust: 'Confiado por mais de 10 milhões de viajantes',
    },
    search: {
      flights: 'Voos',
      hotels: 'Hotéis',
      cars: 'Carros',
      packages: 'Pacotes',
      tours: 'Passeios',
      insurance: 'Seguro',
      from: 'De',
      to: 'Para',
      destination: 'Destino',
      checkin: 'Check-in',
      checkout: 'Check-out',
      pickup: 'Retirada',
      dropoff: 'Devolução',
      departure: 'Ida',
      return: 'Volta',
      travelers: 'Viajantes',
      guests: 'Hóspedes',
      searchButton: 'Buscar',
      trackPrices: 'Rastrear Preços',
    },
    trending: {
      title: 'Destinos em Alta',
      subtitle: 'Descubra para onde todos estão viajando nesta temporada',
      from: 'A partir de',
    },
    deals: {
      title: 'Ofertas Relâmpago',
      subtitle: 'Ofertas por tempo limitado - Reserve antes que acabem!',
      save: 'Economize',
      endsIn: 'Termina em',
      book: 'Reservar Agora',
    },
    trust: {
      title: 'Por Que Escolher a Fly2Any?',
      subtitle: 'Junte-se a milhões de viajantes satisfeitos',
      guarantee: {
        title: 'Garantia de Melhor Preço',
        desc: 'Encontrou mais barato? Igualamos o preço',
      },
      secure: {
        title: 'Reserva Segura',
        desc: 'Seus dados protegidos com SSL 256-bit',
      },
      support: {
        title: 'Suporte 24/7',
        desc: 'Nossa equipe está sempre aqui para ajudar',
      },
      travelers: {
        title: '+10M Viajantes',
        desc: 'Confiança mundial desde 2020',
      },
      cancellation: {
        title: 'Cancelamento Grátis',
        desc: 'Na maioria das reservas - flexibilidade que você precisa',
      },
      rewards: {
        title: 'Programa de Recompensas',
        desc: 'Ganhe pontos em cada reserva',
      },
    },
    testimonials: {
      title: 'O Que Nossos Viajantes Dizem',
      subtitle: 'Avaliações reais de pessoas reais',
    },
    footer: {
      company: 'Empresa',
      about: 'Sobre Nós',
      careers: 'Carreiras',
      press: 'Imprensa',
      blog: 'Blog',
      support: 'Suporte',
      help: 'Central de Ajuda',
      contact: 'Contato',
      faq: 'FAQ',
      destinations: 'Principais Destinos',
      legal: 'Legal',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Serviço',
      cookies: 'Política de Cookies',
      newsletter: 'Assine nossa newsletter',
      emailPlaceholder: 'Digite seu e-mail',
      subscribe: 'Assinar',
      copyright: '© 2025 Fly2Any Travel - Baseado nos EUA',
      payments: 'Aceitamos',
    },
  },
  es: {
    header: {
      flights: 'Vuelos',
      hotels: 'Hoteles',
      cars: 'Autos',
      packages: 'Paquetes',
      tours: 'Tours',
      support: 'Soporte 24/7',
      signin: 'Iniciar Sesión',
      signup: 'Registrarse',
    },
    hero: {
      title: 'Descubre Tu Próxima Aventura',
      subtitle: 'Busca y compara millones de vuelos, hoteles y alquileres de autos',
      trust: 'Confiado por más de 10 millones de viajeros',
    },
    search: {
      flights: 'Vuelos',
      hotels: 'Hoteles',
      cars: 'Autos',
      packages: 'Paquetes',
      tours: 'Tours',
      insurance: 'Seguro',
      from: 'Desde',
      to: 'Hasta',
      destination: 'Destino',
      checkin: 'Entrada',
      checkout: 'Salida',
      pickup: 'Recogida',
      dropoff: 'Entrega',
      departure: 'Salida',
      return: 'Regreso',
      travelers: 'Viajeros',
      guests: 'Huéspedes',
      searchButton: 'Buscar',
      trackPrices: 'Rastrear Precios',
    },
    trending: {
      title: 'Destinos Populares',
      subtitle: 'Descubre dónde todos están viajando esta temporada',
      from: 'Desde',
    },
    deals: {
      title: 'Ofertas Relámpago',
      subtitle: '¡Ofertas por tiempo limitado - Reserva antes de que se acaben!',
      save: 'Ahorra',
      endsIn: 'Termina en',
      book: 'Reservar Ahora',
    },
    trust: {
      title: '¿Por Qué Elegir Fly2Any?',
      subtitle: 'Únete a millones de viajeros satisfechos',
      guarantee: {
        title: 'Garantía de Mejor Precio',
        desc: '¿Encontraste más barato? Igualamos el precio',
      },
      secure: {
        title: 'Reserva Segura',
        desc: 'Tus datos protegidos con SSL 256-bit',
      },
      support: {
        title: 'Soporte 24/7',
        desc: 'Nuestro equipo siempre está aquí para ayudar',
      },
      travelers: {
        title: '+10M Viajeros',
        desc: 'Confianza mundial desde 2020',
      },
      cancellation: {
        title: 'Cancelación Gratuita',
        desc: 'En la mayoría de reservas - flexibilidad que necesitas',
      },
      rewards: {
        title: 'Programa de Recompensas',
        desc: 'Gana puntos en cada reserva',
      },
    },
    testimonials: {
      title: 'Lo Que Dicen Nuestros Viajeros',
      subtitle: 'Reseñas reales de personas reales',
    },
    footer: {
      company: 'Empresa',
      about: 'Sobre Nosotros',
      careers: 'Carreras',
      press: 'Prensa',
      blog: 'Blog',
      support: 'Soporte',
      help: 'Centro de Ayuda',
      contact: 'Contacto',
      faq: 'FAQ',
      destinations: 'Destinos Principales',
      legal: 'Legal',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
      cookies: 'Política de Cookies',
      newsletter: 'Suscríbete a nuestro boletín',
      emailPlaceholder: 'Ingresa tu correo',
      subscribe: 'Suscribirse',
      copyright: '© 2025 Fly2Any Travel - Con sede en EE.UU.',
      payments: 'Aceptamos',
    },
  },
};

// Trending destinations data
const trendingDestinations = [
  { city: 'Paris', country: 'France', image: '🗼', price: 289, currency: '$' },
  { city: 'Tokyo', country: 'Japan', image: '🗾', price: 589, currency: '$' },
  { city: 'New York', country: 'USA', image: '🗽', price: 199, currency: '$' },
  { city: 'Dubai', country: 'UAE', image: '🏙️', price: 399, currency: '$' },
  { city: 'Barcelona', country: 'Spain', image: '🏖️', price: 249, currency: '$' },
  { city: 'London', country: 'UK', image: '🇬🇧', price: 319, currency: '$' },
  { city: 'Rome', country: 'Italy', image: '🏛️', price: 279, currency: '$' },
  { city: 'Sydney', country: 'Australia', image: '🦘', price: 699, currency: '$' },
];

// Flash deals data
const flashDeals = [
  { destination: 'Miami Beach', nights: 3, price: 189, originalPrice: 699, discount: 73, image: '🏖️', endsIn: '12:34:56' },
  { destination: 'Cancun Resort', nights: 5, price: 399, originalPrice: 1299, discount: 69, image: '🌴', endsIn: '08:22:15' },
  { destination: 'Las Vegas', nights: 2, price: 99, originalPrice: 349, discount: 72, image: '🎰', endsIn: '15:45:30' },
  { destination: 'Hawaii Paradise', nights: 7, price: 899, originalPrice: 2499, discount: 64, image: '🌺', endsIn: '23:11:42' },
];

// Testimonials data
const testimonials = [
  { name: 'Sarah Johnson', location: 'New York, USA', rating: 5, text: 'Best travel booking experience ever! Found amazing deals and the customer service was outstanding.', image: '👩' },
  { name: 'Carlos Rodriguez', location: 'Madrid, Spain', rating: 5, text: 'Fly2Any made my dream vacation possible. Easy to use and great prices!', image: '👨' },
  { name: 'Emily Chen', location: 'Singapore', rating: 5, text: 'I always book through Fly2Any now. The price guarantee saved me hundreds!', image: '👩' },
];

// Featured routes data
const featuredRoutes = [
  { from: 'NYC', to: 'LAX', price: 89, originalPrice: 249, duration: '5h 30m', carrier: 'Delta', savings: 160, popular: true },
  { from: 'MIA', to: 'CDG', price: 289, originalPrice: 799, duration: '8h 45m', carrier: 'Air France', savings: 510, popular: true },
  { from: 'SFO', to: 'NRT', price: 399, originalPrice: 1099, duration: '11h 15m', carrier: 'ANA', savings: 700, popular: false },
  { from: 'LAX', to: 'LHR', price: 329, originalPrice: 899, duration: '10h 30m', carrier: 'British Airways', savings: 570, popular: false },
  { from: 'JFK', to: 'BCN', price: 249, originalPrice: 699, duration: '7h 45m', carrier: 'Iberia', savings: 450, popular: true },
  { from: 'BOS', to: 'DXB', price: 449, originalPrice: 1299, duration: '12h 30m', carrier: 'Emirates', savings: 850, popular: false },
];

// App download data (trilingual)
const appDownloadData = {
  en: {
    title: 'Book Faster on Our Mobile App',
    subtitle: 'Get exclusive mobile-only deals and save even more on the go!',
    benefits: [
      'Mobile-exclusive deals up to 10% OFF',
      'Instant booking confirmations',
      'Real-time flight updates & alerts',
      'Offline access to your bookings',
    ],
    downloadText: 'Download Now',
  },
  pt: {
    title: 'Reserve Mais Rápido em Nosso App',
    subtitle: 'Obtenha ofertas exclusivas para celular e economize ainda mais!',
    benefits: [
      'Ofertas exclusivas de até 10% OFF',
      'Confirmações instantâneas de reserva',
      'Atualizações de voo em tempo real',
      'Acesso offline às suas reservas',
    ],
    downloadText: 'Baixar Agora',
  },
  es: {
    title: 'Reserva Más Rápido en Nuestra App',
    subtitle: '¡Obtén ofertas exclusivas para móvil y ahorra aún más!',
    benefits: [
      'Ofertas exclusivas de hasta 10% OFF',
      'Confirmaciones instantáneas de reserva',
      'Actualizaciones de vuelo en tiempo real',
      'Acceso sin conexión a tus reservas',
    ],
    downloadText: 'Descargar Ahora',
  },
};

// FAQ data (trilingual)
const faqData = {
  en: [
    { question: 'How does the best price guarantee work?', answer: 'If you find a lower price for the same flight, hotel, or package within 24 hours of booking, we\'ll refund the difference plus give you a $50 credit toward your next booking.' },
    { question: 'Can I cancel or change my booking?', answer: 'Most bookings offer free cancellation within 24 hours. After that, cancellation policies vary by airline, hotel, or service provider. We always display the cancellation terms before you book.' },
    { question: 'How do I track my flight prices?', answer: 'Click the "Track Prices" button on any search result. We\'ll monitor prices and send you email alerts when they drop, helping you book at the perfect time.' },
    { question: 'Is my payment information secure?', answer: 'Absolutely! We use 256-bit SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed through secure payment gateways.' },
    { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay, and selected cryptocurrencies for bookings.' },
  ],
  pt: [
    { question: 'Como funciona a garantia de melhor preço?', answer: 'Se você encontrar um preço mais baixo para o mesmo voo, hotel ou pacote dentro de 24 horas após a reserva, reembolsaremos a diferença e daremos um crédito de $50 para sua próxima reserva.' },
    { question: 'Posso cancelar ou alterar minha reserva?', answer: 'A maioria das reservas oferece cancelamento gratuito em até 24 horas. Depois disso, as políticas de cancelamento variam de acordo com a companhia aérea, hotel ou fornecedor de serviços.' },
    { question: 'Como rastreio os preços dos voos?', answer: 'Clique no botão "Rastrear Preços" em qualquer resultado de busca. Monitoraremos os preços e enviaremos alertas por e-mail quando eles caírem.' },
    { question: 'Minhas informações de pagamento estão seguras?', answer: 'Com certeza! Usamos criptografia SSL de 256 bits e somos compatíveis com PCI DSS. Suas informações de pagamento nunca são armazenadas em nossos servidores.' },
    { question: 'Quais métodos de pagamento vocês aceitam?', answer: 'Aceitamos todos os principais cartões de crédito (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay e criptomoedas selecionadas.' },
  ],
  es: [
    { question: '¿Cómo funciona la garantía de mejor precio?', answer: 'Si encuentras un precio más bajo para el mismo vuelo, hotel o paquete dentro de las 24 horas posteriores a la reserva, reembolsaremos la diferencia y te daremos un crédito de $50 para tu próxima reserva.' },
    { question: '¿Puedo cancelar o cambiar mi reserva?', answer: 'La mayoría de las reservas ofrecen cancelación gratuita dentro de las 24 horas. Después, las políticas de cancelación varían según la aerolínea, hotel o proveedor de servicios.' },
    { question: '¿Cómo rastree los precios de vuelos?', answer: 'Haz clic en el botón "Rastrear Precios" en cualquier resultado de búsqueda. Monitorearemos los precios y te enviaremos alertas por correo cuando bajen.' },
    { question: '¿Mi información de pago está segura?', answer: '¡Absolutamente! Usamos encriptación SSL de 256 bits y cumplimos con PCI DSS. Tu información de pago nunca se almacena en nuestros servidores.' },
    { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay y criptomonedas seleccionadas.' },
  ],
};

type TripType = 'roundtrip' | 'oneway' | 'multicity';
type HotelBookingType = 'roomonly' | 'withflight' | 'withcar';
type CarRentalType = 'pickupdropoff' | 'airportpickup' | 'hoteldelivery';
type PackageType = 'flighthotel' | 'flighthotelcar' | 'allinclusive';
type TourType = 'guided' | 'selfguided' | 'adventure' | 'cultural';
type InsuranceType = 'trip' | 'medical' | 'cancellation' | 'comprehensive';

export default function NewHomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ServiceTab>('flights');
  const [tripType, setTripType] = useState<TripType>('roundtrip');
  const [hotelBookingType, setHotelBookingType] = useState<HotelBookingType>('roomonly');
  const [carRentalType, setCarRentalType] = useState<CarRentalType>('pickupdropoff');
  const [packageType, setPackageType] = useState<PackageType>('flighthotel');
  const [tourType, setTourType] = useState<TourType>('guided');
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('trip');

  // Enhanced search state
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [fromAirportCode, setFromAirportCode] = useState('');  // Store airport code separately
  const [toAirportCode, setToAirportCode] = useState('');      // Store airport code separately
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [travelClass, setTravelClass] = useState<'economy' | 'premium' | 'business' | 'first'>('economy');
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Hotels search state
  const [hotelDestination, setHotelDestination] = useState('');
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');
  const [hotelGuests, setHotelGuests] = useState({ adults: 2, rooms: 1 });

  // Car rental search state
  const [carPickupLocation, setCarPickupLocation] = useState('');
  const [carDropoffLocation, setCarDropoffLocation] = useState('');
  const [carPickupDate, setCarPickupDate] = useState('');
  const [carDropoffDate, setCarDropoffDate] = useState('');

  // Package search state
  const [packageOrigin, setPackageOrigin] = useState('');
  const [packageDestination, setPackageDestination] = useState('');
  const [packageDepartureDate, setPackageDepartureDate] = useState('');
  const [packageTravelers, setPackageTravelers] = useState(2);

  // Tours search state
  const [tourDestination, setTourDestination] = useState('');
  const [tourStartDate, setTourStartDate] = useState('');
  const [tourDuration, setTourDuration] = useState(7);
  const [tourTravelers, setTourTravelers] = useState(2);

  // Insurance search state
  const [insuranceDestination, setInsuranceDestination] = useState('');
  const [insuranceTripCost, setInsuranceTripCost] = useState('');
  const [insuranceDepartureDate, setInsuranceDepartureDate] = useState('');
  const [insuranceReturnDate, setInsuranceReturnDate] = useState('');
  const [insuranceTravelers, setInsuranceTravelers] = useState(2);

  const t = content[lang];

  // Helper function to extract airport code from formatted string
  const extractAirportCode = (value: string): string => {
    if (!value) return '';

    // Handle "Anywhere" special case
    if (value.includes('Anywhere')) return 'ANY';

    // Trim and uppercase the input
    const trimmed = value.trim().toUpperCase();

    // Check if it's already a 3-letter code
    if (/^[A-Z]{3}$/.test(trimmed)) {
      return trimmed;
    }

    // Try to extract from formatted string (e.g., "JFK - New York")
    const match = trimmed.match(/^([A-Z]{3})/);
    if (match) {
      return match[1];
    }

    // Return as-is if nothing matches (will be caught by validation)
    return trimmed;
  };

  // Handle flight search submission
  const handleFlightSearch = async () => {
    console.log('🔍 FLIGHT SEARCH INITIATED from home-new');
    console.log('📋 Form Values:', {
      fromAirport,
      toAirport,
      departureDate,
      returnDate,
      tripType,
      passengers,
      travelClass
    });

    // Validation
    const errors: string[] = [];

    if (!fromAirport) {
      errors.push('Please select an origin airport');
    }
    if (!toAirport) {
      errors.push('Please select a destination airport');
    }
    if (!departureDate) {
      errors.push('Please select a departure date');
    }
    if (tripType === 'roundtrip' && !returnDate) {
      errors.push('Please select a return date');
    }

    if (errors.length > 0) {
      console.log('❌ Validation failed:', errors);
      alert(errors.join('\n'));
      return;
    }

    setIsSearching(true);

    try {
      // Use stored airport codes if available, otherwise try to extract
      const originCode = fromAirportCode || extractAirportCode(fromAirport);
      const destinationCode = toAirportCode || extractAirportCode(toAirport);

      console.log('🛫 Using airport codes:', {
        from: fromAirport,
        originCode,
        to: toAirport,
        destinationCode
      });

      // Validate codes
      if (!originCode || originCode.length !== 3) {
        const errorMsg = `Invalid origin airport code: "${originCode}". Please select a valid airport from the dropdown.`;
        console.error('❌', errorMsg);
        alert(errorMsg);
        setIsSearching(false);
        return;
      }

      if (!destinationCode || destinationCode.length !== 3) {
        const errorMsg = `Invalid destination airport code: "${destinationCode}". Please select a valid airport from the dropdown.`;
        console.error('❌', errorMsg);
        alert(errorMsg);
        setIsSearching(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        from: originCode,
        to: destinationCode,
        departure: departureDate,
        adults: passengers.adults.toString(),
        children: passengers.children.toString(),
        infants: passengers.infants.toString(),
        class: travelClass.toLowerCase(),
      });

      if (tripType === 'roundtrip' && returnDate) {
        params.append('return', returnDate);
      }

      if (flexibleDates) {
        params.append('flexible', 'true');
      }

      const url = `/flights/results?${params.toString()}`;
      console.log('🚀 Opening results in new window:', url);
      console.log('📦 Full URL params:', Object.fromEntries(params));

      // Open results in new window
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

      if (newWindow) {
        console.log('✈️ Results page opened in new window successfully');
        setIsSearching(false);
      } else {
        console.warn('⚠️ Pop-up blocked. Falling back to same-window navigation.');
        router.push(url);
      }
    } catch (error) {
      console.error('💥 Error during search:', error);
      alert(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setIsSearching(false);
    }
  };

  // Handle hotel search submission
  const handleHotelSearch = async () => {
    console.log('🏨 HOTEL SEARCH INITIATED');

    const errors: string[] = [];
    if (!hotelDestination) errors.push('Please enter a destination');
    if (!hotelCheckIn) errors.push('Please select check-in date');
    if (!hotelCheckOut) errors.push('Please select check-out date');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        destination: hotelDestination,
        checkIn: hotelCheckIn,
        checkOut: hotelCheckOut,
        adults: hotelGuests.adults.toString(),
        rooms: hotelGuests.rooms.toString(),
        bookingType: hotelBookingType,
      });

      const url = `/hotels/results?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer') || router.push(url);
      setIsSearching(false);
    } catch (error) {
      console.error('Error during hotel search:', error);
      alert('Hotel search failed. Please try again.');
      setIsSearching(false);
    }
  };

  // Handle car rental search submission
  const handleCarSearch = async () => {
    console.log('🚗 CAR SEARCH INITIATED');

    const errors: string[] = [];
    if (!carPickupLocation) errors.push('Please enter pick-up location');
    if (!carDropoffLocation) errors.push('Please enter drop-off location');
    if (!carPickupDate) errors.push('Please select pick-up date');
    if (!carDropoffDate) errors.push('Please select drop-off date');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        pickup: carPickupLocation,
        dropoff: carDropoffLocation,
        pickupDate: carPickupDate,
        dropoffDate: carDropoffDate,
        rentalType: carRentalType,
      });

      const url = `/cars/results?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer') || router.push(url);
      setIsSearching(false);
    } catch (error) {
      console.error('Error during car search:', error);
      alert('Car search failed. Please try again.');
      setIsSearching(false);
    }
  };

  // Handle package search submission
  const handlePackageSearch = async () => {
    console.log('📦 PACKAGE SEARCH INITIATED');

    const errors: string[] = [];
    if (!packageOrigin) errors.push('Please enter origin');
    if (!packageDestination) errors.push('Please enter destination');
    if (!packageDepartureDate) errors.push('Please select departure date');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        from: packageOrigin,
        to: packageDestination,
        departure: packageDepartureDate,
        travelers: packageTravelers.toString(),
        packageType,
      });

      const url = `/packages/results?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer') || router.push(url);
      setIsSearching(false);
    } catch (error) {
      console.error('Error during package search:', error);
      alert('Package search failed. Please try again.');
      setIsSearching(false);
    }
  };

  // Handle tours search submission
  const handleToursSearch = async () => {
    console.log('🗺️ TOURS SEARCH INITIATED');

    const errors: string[] = [];
    if (!tourDestination) errors.push('Please enter destination');
    if (!tourStartDate) errors.push('Please select start date');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        destination: tourDestination,
        startDate: tourStartDate,
        duration: tourDuration.toString(),
        travelers: tourTravelers.toString(),
        tourType,
      });

      const url = `/tours/results?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer') || router.push(url);
      setIsSearching(false);
    } catch (error) {
      console.error('Error during tours search:', error);
      alert('Tours search failed. Please try again.');
      setIsSearching(false);
    }
  };

  // Handle insurance search submission
  const handleInsuranceSearch = async () => {
    console.log('🛡️ INSURANCE SEARCH INITIATED');

    const errors: string[] = [];
    if (!insuranceDestination) errors.push('Please enter destination');
    if (!insuranceTripCost) errors.push('Please enter trip cost');
    if (!insuranceDepartureDate) errors.push('Please select departure date');
    if (!insuranceReturnDate) errors.push('Please select return date');

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        destination: insuranceDestination,
        tripCost: insuranceTripCost,
        departure: insuranceDepartureDate,
        return: insuranceReturnDate,
        travelers: insuranceTravelers.toString(),
        insuranceType,
      });

      const url = `/insurance/results?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer') || router.push(url);
      setIsSearching(false);
    } catch (error) {
      console.error('Error during insurance search:', error);
      alert('Insurance search failed. Please try again.');
      setIsSearching(false);
    }
  };

  // Language configuration with flags
  const languages = {
    en: { name: 'English', flag: '🇺🇸', code: 'EN' },
    pt: { name: 'Português', flag: '🇧🇷', code: 'PT' },
    es: { name: 'Español', flag: '🇪🇸', code: 'ES' },
  };

  // Calculate reward points (mock calculation)
  const estimatedPrice = 512;
  const rewardPoints = Math.floor(estimatedPrice * 5); // 5 points per dollar
  const rewardValue = rewardPoints / 100; // 1 cent per point

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (langDropdownOpen && !target.closest('.language-dropdown')) {
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langDropdownOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          URGENCY BANNER - Top Priority
          ============================================ */}
      <UrgencyBanner
        message="⚡ FLASH SALE: Up to 70% OFF on Select Flights & Hotels - Ends in 6 Hours! ⚡"
        type="deal"
      />

      {/* ============================================
          LIVE ACTIVITY FEED - Fixed Position
          ============================================ */}
      <LiveActivityFeed />

      {/* ============================================
          HERO SECTION - Stunning Background + Search
          ============================================ */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-secondary-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fadeIn">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6 animate-slideUp">
              {t.hero.subtitle}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <span className="text-white/80">⭐⭐⭐⭐⭐</span>
              <span className="text-white/90 font-medium">{t.hero.trust}</span>
            </div>
          </div>

          {/* Multi-Tab Search Widget - WIDER CONTAINER */}
          <div className="max-w-7xl mx-auto animate-scaleIn">
            {/* Service Tabs - Refined Projecting Navigation */}
            <div className="flex justify-between items-end gap-4 px-4">
              {/* Tabs Container - Left Side */}
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {(['flights', 'hotels', 'cars', 'packages', 'tours', 'insurance'] as ServiceTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`group flex items-center gap-2 px-6 py-3.5 rounded-t-2xl font-bold transition-all duration-300 whitespace-nowrap relative ${
                      activeTab === tab
                        ? 'bg-white/95 backdrop-blur-md text-primary-600 shadow-xl border-x-2 border-t-2 border-b-0 border-white/40 z-20 scale-105'
                        : 'bg-white/40 backdrop-blur-sm text-gray-600 hover:bg-white/60 hover:text-primary-500 border-x border-t border-b-0 border-white/20 hover:scale-102 z-10'
                    }`}
                  >
                    {/* Icon with enhanced visibility */}
                    <span className={`text-xl transition-transform duration-300 brightness-125 contrast-125 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {tab === 'flights' && '✈️'}
                      {tab === 'hotels' && '🏨'}
                      {tab === 'cars' && '🚗'}
                      {tab === 'packages' && '📦'}
                      {tab === 'tours' && '🗺️'}
                      {tab === 'insurance' && '🛡️'}
                    </span>

                    {/* Text with improved typography */}
                    <span className={`text-sm font-bold transition-all ${activeTab === tab ? 'tracking-wide' : ''}`}>
                      {t.search[tab]}
                    </span>

                    {/* Active tab bottom gradient indicator */}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-400 to-primary-500 rounded-t-sm"></div>
                    )}

                    {/* Subtle shine effect on hover */}
                    <div className={`absolute inset-0 rounded-t-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                  </button>
                ))}
              </div>

              {/* 24/7 Support Link - No Tab Style */}
              <a href="/support" className="flex items-center gap-2 px-4 py-3.5 text-white/90 hover:text-white transition-all duration-300 group whitespace-nowrap mb-2">
                <span className="text-xl transition-transform group-hover:scale-110 brightness-125 contrast-125">📞</span>
                <span className="font-bold text-sm">{t.header.support}</span>
              </a>
            </div>

            {/* Main Search Form Container - Perfectly Connected */}
            <Card variant="glass" padding="lg" className="relative border-2 border-white/40 shadow-2xl backdrop-blur-md bg-white/95">

            {/* Flight Search Form - ULTRA-COMPACT LAYOUT */}
            {activeTab === 'flights' && (
              <div className="space-y-4">

                {/* TRIP TYPE SELECTOR - Compact Pills */}
                <div className="flex gap-2 pb-2 border-b border-gray-200">
                  <button
                    onClick={() => setTripType('roundtrip')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      tripType === 'roundtrip'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ↔️ Round Trip
                  </button>
                  <button
                    onClick={() => setTripType('oneway')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      tripType === 'oneway'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    →️ One Way
                  </button>
                  <button
                    onClick={() => setTripType('multicity')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      tripType === 'multicity'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🗺️ Multi-City
                  </button>
                </div>

                {/* ROW 1: FROM + TO + PASSENGERS (3 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,280px] gap-4 items-end">
                  <div>
                    <AirportAutocomplete
                      label={t.search.from}
                      placeholder="JFK, LAX, CDG..."
                      value={fromAirport}
                      onChange={(val, airport) => {
                        setFromAirport(val);
                        if (airport) {
                          setFromAirportCode(airport.code);
                          console.log('✈️ Origin selected:', airport.code, airport.city);
                        }
                      }}
                      icon={<span className="text-xl">✈️</span>}
                      showExplore
                    />
                  </div>
                  <div>
                    <AirportAutocomplete
                      label={t.search.to}
                      placeholder="LAX, CDG, NRT..."
                      value={toAirport}
                      onChange={(val, airport) => {
                        setToAirport(val);
                        if (airport) {
                          setToAirportCode(airport.code);
                          console.log('✈️ Destination selected:', airport.code, airport.city);
                        }
                      }}
                      icon={<span className="text-xl">📍</span>}
                    />
                  </div>
                  <div>
                    <PassengerClassSelector
                      label="Travellers and Class"
                      passengers={passengers}
                      travelClass={travelClass}
                      onChange={(p, c) => {
                        setPassengers(p);
                        setTravelClass(c);
                      }}
                    />
                  </div>
                </div>

                {/* ROW 2: DEPARTURE + RETURN + FLEXIBLE DATES (3 columns) */}
                <div className={`grid grid-cols-1 ${tripType === 'oneway' ? 'md:grid-cols-[1fr,280px]' : 'md:grid-cols-[1fr,1fr,280px]'} gap-4 items-end`}>
                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">📅</span> {t.search.departure}
                    </label>
                    <PriceDatePicker
                      label=""
                      value={departureDate}
                      onChange={setDepartureDate}
                    />
                  </div>
                  {tripType !== 'oneway' && (
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-xl">📅</span> {t.search.return}
                      </label>
                      <PriceDatePicker
                        label=""
                        value={returnDate}
                        onChange={setReturnDate}
                      />
                    </div>
                  )}
                  <div>
                    <FlexibleDatesToggleWithLabel
                      enabled={flexibleDates}
                      onChange={setFlexibleDates}
                      potentialSavings={89}
                      label="Flexible Dates"
                    />
                  </div>
                </div>

                {/* ROW 3: ADVANCED OPTIONS + AI PREDICTION */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
                  >
                    <svg className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>

                  <div className="flex-1">
                    <CompactPricePrediction route={`${fromAirport} → ${toAirport}`} />
                  </div>
                </div>

                {/* Advanced Options - Collapsible */}
                {showAdvanced && (
                  <div className="space-y-3 animate-slideDown">
                    {/* Nearby Airport Suggestion */}
                    {fromAirport && fromAirport !== 'Anywhere ✈️' && (
                      <NearbyAirportSuggestion
                        currentAirport={fromAirport}
                        nearbyAirports={[
                          { code: 'EWR', name: 'Newark Liberty Intl', distance: '15 miles', savings: 156 },
                          { code: 'LGA', name: 'LaGuardia Airport', distance: '8 miles', savings: 89 },
                        ]}
                        onSelect={(airport) => setFromAirport(`${airport.code} - ${airport.name.split(' ')[0]}`)}
                      />
                    )}

                    {/* Price Freeze Option */}
                    <PriceFreezeOption
                      currentPrice={estimatedPrice}
                      freezeFee={7}
                      duration={48}
                      onFreeze={() => alert('Price freeze feature - Coming soon!')}
                    />
                  </div>
                )}

                {/* ROW 4: SEARCH BUTTON (FULL WIDTH) */}
                <div className="pt-2">
                  <EnhancedSearchButton
                    onClick={handleFlightSearch}
                    text="Search 500+ Airlines"
                    loading={isSearching}
                  />
                </div>

                {/* ROW 5: TRACK PRICES (CENTERED) */}
                <div className="flex justify-center">
                  <TrackPricesButton
                    onClick={() => alert('Track prices feature - Coming soon!')}
                    text="Track Prices"
                  />
                </div>

              </div>
            )}

            {/* Hotel Search Form */}
            {activeTab === 'hotels' && (
              <div className="space-y-4">

                {/* BOOKING TYPE SELECTOR - Compact Pills */}
                <div className="flex gap-2 pb-2 border-b border-gray-200">
                  <button
                    onClick={() => setHotelBookingType('roomonly')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      hotelBookingType === 'roomonly'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏨 Room Only
                  </button>
                  <button
                    onClick={() => setHotelBookingType('withflight')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      hotelBookingType === 'withflight'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✈️ Hotel + Flight
                  </button>
                  <button
                    onClick={() => setHotelBookingType('withcar')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      hotelBookingType === 'withcar'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🚗 Hotel + Car
                  </button>
                </div>

                <UnifiedLocationAutocomplete
                  label={`📍 ${t.search.destination}`}
                  placeholder="New York, Paris, Tokyo..."
                  value={hotelDestination}
                  onChange={(val) => setHotelDestination(val)}
                  mode="both"
                  showPricing
                  showWeather
                  showSocialProof
                  showNearbyAirports
                  groupBySections
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label={t.search.checkin}
                    fullWidth
                    value={hotelCheckIn}
                    onChange={(e) => setHotelCheckIn(e.target.value)}
                  />
                  <Input
                    type="date"
                    label={t.search.checkout}
                    fullWidth
                    value={hotelCheckOut}
                    onChange={(e) => setHotelCheckOut(e.target.value)}
                  />
                  <Input
                    placeholder="2 Adults, 1 Room"
                    label={t.search.guests}
                    icon={<span>👥</span>}
                    fullWidth
                    value={`${hotelGuests.adults} Adults, ${hotelGuests.rooms} Room${hotelGuests.rooms > 1 ? 's' : ''}`}
                    readOnly
                  />
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={handleHotelSearch} disabled={isSearching}>
                  {isSearching ? '🔄 Searching...' : `🔍 ${t.search.searchButton}`}
                </Button>
              </div>
            )}

            {/* Car Search Form */}
            {activeTab === 'cars' && (
              <div className="space-y-4">

                {/* RENTAL TYPE SELECTOR - Compact Pills */}
                <div className="flex gap-2 pb-2 border-b border-gray-200">
                  <button
                    onClick={() => setCarRentalType('pickupdropoff')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      carRentalType === 'pickupdropoff'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🚗 Pick-up & Drop-off
                  </button>
                  <button
                    onClick={() => setCarRentalType('airportpickup')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      carRentalType === 'airportpickup'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✈️ Airport Pick-up
                  </button>
                  <button
                    onClick={() => setCarRentalType('hoteldelivery')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      carRentalType === 'hoteldelivery'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏨 Hotel Delivery
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <UnifiedLocationAutocomplete
                    label={`📍 ${t.search.pickup}`}
                    placeholder="LAX Airport or Downtown LA..."
                    value={carPickupLocation}
                    onChange={(val) => setCarPickupLocation(val)}
                    mode="both"
                    showPricing={false}
                    showWeather={false}
                    groupBySections
                  />
                  <UnifiedLocationAutocomplete
                    label={`📍 ${t.search.dropoff}`}
                    placeholder="LAX Airport or Downtown LA..."
                    value={carDropoffLocation}
                    onChange={(val) => setCarDropoffLocation(val)}
                    mode="both"
                    showPricing={false}
                    showWeather={false}
                    groupBySections
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="datetime-local"
                    label={t.search.pickup}
                    fullWidth
                    value={carPickupDate}
                    onChange={(e) => setCarPickupDate(e.target.value)}
                  />
                  <Input
                    type="datetime-local"
                    label={t.search.dropoff}
                    fullWidth
                    value={carDropoffDate}
                    onChange={(e) => setCarDropoffDate(e.target.value)}
                  />
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={handleCarSearch} disabled={isSearching}>
                  {isSearching ? '🔄 Searching...' : `🔍 ${t.search.searchButton}`}
                </Button>
              </div>
            )}

            {/* Package Search Form */}
            {activeTab === 'packages' && (
              <div className="space-y-4">

                {/* PACKAGE TYPE SELECTOR - Compact Pills */}
                <div className="flex gap-2 pb-2 border-b border-gray-200">
                  <button
                    onClick={() => setPackageType('flighthotel')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      packageType === 'flighthotel'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✈️🏨 Flight + Hotel
                  </button>
                  <button
                    onClick={() => setPackageType('flighthotelcar')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      packageType === 'flighthotelcar'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✈️🏨🚗 Flight + Hotel + Car
                  </button>
                  <button
                    onClick={() => setPackageType('allinclusive')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      packageType === 'allinclusive'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🌴 All-Inclusive
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <UnifiedLocationAutocomplete
                    label={`✈️ ${t.search.from}`}
                    placeholder="JFK, LAX, ORD..."
                    value={packageOrigin}
                    onChange={(val) => setPackageOrigin(val)}
                    mode="airports-only"
                    showPricing={false}
                  />
                  <UnifiedLocationAutocomplete
                    label={`📍 ${t.search.destination}`}
                    placeholder="Cancun, Paris, Tokyo..."
                    value={packageDestination}
                    onChange={(val) => setPackageDestination(val)}
                    mode="cities-only"
                    showPricing
                    showWeather
                    showSocialProof
                    groupBySections
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t.search.departure}
                    fullWidth
                    value={packageDepartureDate}
                    onChange={(e) => setPackageDepartureDate(e.target.value)}
                  />
                  <Input
                    placeholder="2 Adults"
                    label={t.search.travelers}
                    icon={<span>👥</span>}
                    fullWidth
                    value={packageTravelers.toString()}
                    onChange={(e) => setPackageTravelers(parseInt(e.target.value) || 2)}
                  />
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={handlePackageSearch} disabled={isSearching}>
                  {isSearching ? '🔄 Searching...' : `🔍 ${t.search.searchButton}`}
                </Button>
              </div>
            )}

            {/* Tours Search Form */}
            {activeTab === 'tours' && (
              <div className="space-y-4">

                {/* TOUR TYPE SELECTOR - Compact Pills */}
                <div className="flex gap-2 pb-2 border-b border-gray-200">
                  <button
                    onClick={() => setTourType('guided')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      tourType === 'guided'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👨‍🏫 Guided Tours
                  </button>
                  <button
                    onClick={() => setTourType('selfguided')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      tourType === 'selfguided'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🚶 Self-Guided
                  </button>
                  <button
                    onClick={() => setTourType('adventure')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      tourType === 'adventure'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏔️ Adventure
                  </button>
                  <button
                    onClick={() => setTourType('cultural')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      tourType === 'cultural'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏛️ Cultural
                  </button>
                </div>

                <UnifiedLocationAutocomplete
                  label="📍 Tour Destination"
                  placeholder="Paris, Rome, Tokyo..."
                  value={tourDestination}
                  onChange={(val) => setTourDestination(val)}
                  mode="cities-only"
                  showPricing
                  showWeather
                  showSocialProof
                  groupBySections
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label="Start Date"
                    fullWidth
                    value={tourStartDate}
                    onChange={(e) => setTourStartDate(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="7"
                    label="Duration (days)"
                    fullWidth
                    value={tourDuration.toString()}
                    onChange={(e) => setTourDuration(parseInt(e.target.value) || 7)}
                  />
                  <Input
                    placeholder="2 Adults"
                    label="Travelers"
                    icon={<span>👥</span>}
                    fullWidth
                    value={tourTravelers.toString()}
                    onChange={(e) => setTourTravelers(parseInt(e.target.value) || 2)}
                  />
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={handleToursSearch} disabled={isSearching}>
                  {isSearching ? '🔄 Searching...' : '🔍 Search Tours'}
                </Button>
              </div>
            )}

            {/* Travel Insurance Search Form */}
            {activeTab === 'insurance' && (
              <div className="space-y-4">

                {/* INSURANCE TYPE SELECTOR - Compact Pills */}
                <div className="flex gap-2 pb-2 border-b border-gray-200">
                  <button
                    onClick={() => setInsuranceType('trip')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      insuranceType === 'trip'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✈️ Trip Protection
                  </button>
                  <button
                    onClick={() => setInsuranceType('medical')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      insuranceType === 'medical'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏥 Medical Coverage
                  </button>
                  <button
                    onClick={() => setInsuranceType('cancellation')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      insuranceType === 'cancellation'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ❌ Cancellation
                  </button>
                  <button
                    onClick={() => setInsuranceType('comprehensive')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      insuranceType === 'comprehensive'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🛡️ Comprehensive
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <UnifiedLocationAutocomplete
                    label="🌍 Where are you traveling?"
                    placeholder="Paris, New York, Tokyo..."
                    value={insuranceDestination}
                    onChange={(val) => setInsuranceDestination(val)}
                    mode="any"
                    showPricing={false}
                    showWeather
                    groupBySections
                  />
                  <Input
                    type="number"
                    placeholder="5000"
                    label="Trip Cost (USD)"
                    icon={<span>💰</span>}
                    fullWidth
                    value={insuranceTripCost}
                    onChange={(e) => setInsuranceTripCost(e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label="Departure Date"
                    fullWidth
                    value={insuranceDepartureDate}
                    onChange={(e) => setInsuranceDepartureDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="Return Date"
                    fullWidth
                    value={insuranceReturnDate}
                    onChange={(e) => setInsuranceReturnDate(e.target.value)}
                  />
                  <Input
                    placeholder="2 Adults"
                    label="Travelers"
                    icon={<span>👥</span>}
                    fullWidth
                    value={insuranceTravelers.toString()}
                    onChange={(e) => setInsuranceTravelers(parseInt(e.target.value) || 2)}
                  />
                </div>

                {/* Insurance Benefits Preview */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-xl border-2 border-primary-200">
                  <div className="font-bold text-gray-900 mb-3">✅ What's Covered:</div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>🛡️</span>
                      <span>Trip cancellation & interruption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏥</span>
                      <span>Emergency medical expenses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🧳</span>
                      <span>Lost or delayed baggage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>Travel delays & missed connections</span>
                    </div>
                  </div>
                </div>

                <Button variant="primary" size="lg" fullWidth onClick={handleInsuranceSearch} disabled={isSearching}>
                  {isSearching ? '🔄 Searching...' : '🔍 Get Insurance Quotes'}
                </Button>
              </div>
            )}
            </Card>
          </div>

          {/* ============================================
              CONVERSION ELEMENTS - Below Search Form
              ============================================ */}

          {/* Trust Badges */}
          <div className="mt-12 animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <TrustBadges />
          </div>

          {/* Live Stats Bar */}
          <div className="mt-8 animate-slideUp" style={{ animationDelay: '0.6s' }}>
            <StatsBar />
          </div>
        </div>
      </section>

      {/* ============================================
          TRENDING DESTINATIONS
          ============================================ */}
      <TrendingDestinations
        destinations={trendingDestinations}
        title={t.trending.title}
        subtitle={t.trending.subtitle}
        fromText={t.trending.from}
      />

      {/* ============================================
          FLASH DEALS
          ============================================ */}
      <FlashDeals
        deals={flashDeals}
        title={t.deals.title}
        subtitle={t.deals.subtitle}
        saveText={t.deals.save}
        endsInText={t.deals.endsIn}
        bookText={t.deals.book}
      />

      {/* ============================================
          FEATURED ROUTES - Popular Routes with Savings
          ============================================ */}
      <FeaturedRoutes
        title="✈️ Popular Routes with Huge Savings"
        subtitle="Book now and save up to $850 on these trending routes"
        routes={featuredRoutes}
        searchText="Search This Route"
      />

      {/* ============================================
          TRUST INDICATORS / WHY CHOOSE US
          ============================================ */}
      <TrustIndicators
        title={t.trust.title}
        subtitle={t.trust.subtitle}
        items={[
          { icon: '💰', title: t.trust.guarantee.title, description: t.trust.guarantee.desc },
          { icon: '🛡️', title: t.trust.secure.title, description: t.trust.secure.desc },
          { icon: '📞', title: t.trust.support.title, description: t.trust.support.desc },
          { icon: '✨', title: t.trust.travelers.title, description: t.trust.travelers.desc },
          { icon: '🔒', title: t.trust.cancellation.title, description: t.trust.cancellation.desc },
          { icon: '🎁', title: t.trust.rewards.title, description: t.trust.rewards.desc },
        ]}
      />

      {/* ============================================
          CUSTOMER TESTIMONIALS
          ============================================ */}
      <Testimonials
        title={t.testimonials.title}
        subtitle={t.testimonials.subtitle}
        testimonials={testimonials}
      />

      {/* ============================================
          APP DOWNLOAD - Mobile CTA
          ============================================ */}
      <AppDownload
        title={appDownloadData[lang].title}
        subtitle={appDownloadData[lang].subtitle}
        benefits={appDownloadData[lang].benefits}
        downloadText={appDownloadData[lang].downloadText}
      />

      {/* ============================================
          FAQ - Answer Common Questions
          ============================================ */}
      <FAQ
        title={lang === 'en' ? '❓ Frequently Asked Questions' : lang === 'pt' ? '❓ Perguntas Frequentes' : '❓ Preguntas Frecuentes'}
        subtitle={lang === 'en' ? 'Everything you need to know about booking with Fly2Any' : lang === 'pt' ? 'Tudo o que você precisa saber sobre reservas com Fly2Any' : 'Todo lo que necesitas saber sobre reservas con Fly2Any'}
        items={faqData[lang]}
      />

    </div>
  );
}
