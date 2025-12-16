'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import CancelOrderDialog from '@/components/booking/CancelOrderDialog';
import ModifyOrderDialog from '@/components/booking/ModifyOrderDialog';
import { PostPaymentVerification } from '@/components/booking/PostPaymentVerification';

type Language = 'en' | 'pt' | 'es';

// Airline logo URLs and names
const AIRLINE_DATA: Record<string, { name: string; logo: string }> = {
  'AA': { name: 'American Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AA.png' },
  'UA': { name: 'United Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/UA.png' },
  'DL': { name: 'Delta Air Lines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/DL.png' },
  'WN': { name: 'Southwest Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/WN.png' },
  'B6': { name: 'JetBlue Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/B6.png' },
  'AS': { name: 'Alaska Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AS.png' },
  'NK': { name: 'Spirit Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/NK.png' },
  'F9': { name: 'Frontier Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png' },
  'G4': { name: 'Allegiant Air', logo: 'https://www.gstatic.com/flights/airline_logos/70px/G4.png' },
  'HA': { name: 'Hawaiian Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/HA.png' },
  'BA': { name: 'British Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/BA.png' },
  'LH': { name: 'Lufthansa', logo: 'https://www.gstatic.com/flights/airline_logos/70px/LH.png' },
  'AF': { name: 'Air France', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AF.png' },
  'KL': { name: 'KLM', logo: 'https://www.gstatic.com/flights/airline_logos/70px/KL.png' },
  'EK': { name: 'Emirates', logo: 'https://www.gstatic.com/flights/airline_logos/70px/EK.png' },
  'QR': { name: 'Qatar Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/QR.png' },
  'SQ': { name: 'Singapore Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/SQ.png' },
  'CX': { name: 'Cathay Pacific', logo: 'https://www.gstatic.com/flights/airline_logos/70px/CX.png' },
  'IB': { name: 'Iberia', logo: 'https://www.gstatic.com/flights/airline_logos/70px/IB.png' },
  'AZ': { name: 'ITA Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AZ.png' },
  'AY': { name: 'Finnair', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AY.png' },
  'SK': { name: 'SAS', logo: 'https://www.gstatic.com/flights/airline_logos/70px/SK.png' },
  'LX': { name: 'Swiss', logo: 'https://www.gstatic.com/flights/airline_logos/70px/LX.png' },
  'OS': { name: 'Austrian', logo: 'https://www.gstatic.com/flights/airline_logos/70px/OS.png' },
  'TP': { name: 'TAP Portugal', logo: 'https://www.gstatic.com/flights/airline_logos/70px/TP.png' },
  'TK': { name: 'Turkish Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/TK.png' },
  'EY': { name: 'Etihad Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/EY.png' },
  'JL': { name: 'Japan Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/JL.png' },
  'NH': { name: 'ANA', logo: 'https://www.gstatic.com/flights/airline_logos/70px/NH.png' },
  'KE': { name: 'Korean Air', logo: 'https://www.gstatic.com/flights/airline_logos/70px/KE.png' },
  'OZ': { name: 'Asiana Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/OZ.png' },
  'AC': { name: 'Air Canada', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AC.png' },
  'QF': { name: 'Qantas', logo: 'https://www.gstatic.com/flights/airline_logos/70px/QF.png' },
  'NZ': { name: 'Air New Zealand', logo: 'https://www.gstatic.com/flights/airline_logos/70px/NZ.png' },
  'LA': { name: 'LATAM', logo: 'https://www.gstatic.com/flights/airline_logos/70px/LA.png' },
  'AV': { name: 'Avianca', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AV.png' },
  'CM': { name: 'Copa Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/CM.png' },
  'AM': { name: 'AeroMexico', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AM.png' },
};

const getAirlineInfo = (code: string) => {
  return AIRLINE_DATA[code] || { name: code, logo: `https://www.gstatic.com/flights/airline_logos/70px/${code}.png` };
};

const content = {
  en: {
    // Success Messages
    bookingConfirmed: 'Booking Confirmed!',
    congratulations: 'Congratulations! Your flight has been successfully booked.',
    bookingReference: 'Booking Reference',
    confirmationSent: 'A confirmation email has been sent to',

    // Sections
    flightDetails: 'Flight Details',
    passengerInfo: 'Passenger Information',
    paymentSummary: 'Payment Summary',
    nextSteps: 'Next Steps',
    importantInfo: 'Important Information',
    needHelp: 'Need Help?',

    // Flight Info
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    flightNumber: 'Flight',
    aircraft: 'Aircraft',
    cabin: 'Cabin',
    seat: 'Seat',
    baggage: 'Baggage',

    // Passenger Details
    passenger: 'Passenger',
    adult: 'Adult',
    child: 'Child',
    infant: 'Infant',
    frequentFlyer: 'Frequent Flyer',
    specialRequests: 'Special Requests',

    // Payment
    subtotal: 'Subtotal',
    taxes: 'Taxes & Fees',
    insurance: 'Travel Insurance',
    total: 'Total Paid',
    paymentMethod: 'Payment Method',
    transactionId: 'Transaction ID',
    paidOn: 'Paid on',

    // Actions
    addToCalendar: 'Add to Calendar',
    downloadTicket: 'Download PDF Ticket',
    printConfirmation: 'Print Confirmation',
    viewItinerary: 'View Full Itinerary',
    manageBooking: 'Manage Booking',
    shareTrip: 'Share Trip Details',
    addInsurance: 'Add Travel Insurance',

    // Calendar Options
    googleCalendar: 'Google Calendar',
    appleCalendar: 'Apple Calendar',
    outlookCalendar: 'Outlook Calendar',

    // Next Steps
    step1Title: 'Check-in Online',
    step1Desc: 'Opens 24 hours before departure',
    step2Title: 'Prepare Documents',
    step2Desc: 'Valid passport and visas required',
    step3Title: 'Airport Arrival',
    step3Desc: 'Arrive 3 hours before international flights',
    step4Title: 'Boarding',
    step4Desc: 'Gates close 30 minutes before departure',

    // Important Info
    checkInInfo: 'Online check-in will be available 24 hours before your scheduled departure time.',
    baggageInfo: 'Checked baggage: 1 piece (23kg). Carry-on: 1 piece (7kg) + 1 personal item.',
    documentsInfo: 'Ensure your passport is valid for at least 6 months beyond your travel dates.',
    arrivalInfo: 'Please arrive at the airport at least 3 hours before international flights.',

    // FAQs
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'When can I check in online?',
    faq1A: 'Online check-in opens 24 hours before departure and closes 2 hours before.',
    faq2Q: 'Can I change my seat?',
    faq2A: 'Yes, you can change your seat during online check-in or by contacting us.',
    faq3Q: 'What about travel insurance?',
    faq3A: 'We recommend purchasing travel insurance for coverage against unforeseen circumstances.',
    faq4Q: 'How do I add special meals?',
    faq4A: 'Special meal requests can be made up to 24 hours before departure.',

    // Support
    contactSupport: 'Contact Customer Support',
    available24x7: 'Available 24/7',
    email: 'Email',
    phone: 'Phone',
    whatsapp: 'WhatsApp',

    // Tips
    travelTips: 'Travel Tips',
    tip1: 'Download your airline\'s mobile app for real-time updates',
    tip2: 'Take a photo of your baggage and boarding pass',
    tip3: 'Arrive early to avoid stress and enjoy airport amenities',
    tip4: 'Keep your travel documents easily accessible',

    // Footer
    bookingProtection: 'Your booking is protected by Fly2Any Travel',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    cancellationPolicy: 'Cancellation Policy',
  },
  pt: {
    // Success Messages
    bookingConfirmed: 'Reserva Confirmada!',
    congratulations: 'Parabéns! Seu voo foi reservado com sucesso.',
    bookingReference: 'Referência da Reserva',
    confirmationSent: 'Um email de confirmação foi enviado para',

    // Sections
    flightDetails: 'Detalhes do Voo',
    passengerInfo: 'Informações do Passageiro',
    paymentSummary: 'Resumo do Pagamento',
    nextSteps: 'Próximos Passos',
    importantInfo: 'Informações Importantes',
    needHelp: 'Precisa de Ajuda?',

    // Flight Info
    departure: 'Partida',
    arrival: 'Chegada',
    duration: 'Duração',
    flightNumber: 'Voo',
    aircraft: 'Aeronave',
    cabin: 'Cabine',
    seat: 'Assento',
    baggage: 'Bagagem',

    // Passenger Details
    passenger: 'Passageiro',
    adult: 'Adulto',
    child: 'Criança',
    infant: 'Bebê',
    frequentFlyer: 'Viajante Frequente',
    specialRequests: 'Pedidos Especiais',

    // Payment
    subtotal: 'Subtotal',
    taxes: 'Taxas e Impostos',
    insurance: 'Seguro Viagem',
    total: 'Total Pago',
    paymentMethod: 'Método de Pagamento',
    transactionId: 'ID da Transação',
    paidOn: 'Pago em',

    // Actions
    addToCalendar: 'Adicionar ao Calendário',
    downloadTicket: 'Baixar Bilhete PDF',
    printConfirmation: 'Imprimir Confirmação',
    viewItinerary: 'Ver Itinerário Completo',
    manageBooking: 'Gerenciar Reserva',
    shareTrip: 'Compartilhar Viagem',
    addInsurance: 'Adicionar Seguro Viagem',

    // Calendar Options
    googleCalendar: 'Google Calendar',
    appleCalendar: 'Apple Calendar',
    outlookCalendar: 'Outlook Calendar',

    // Next Steps
    step1Title: 'Check-in Online',
    step1Desc: 'Abre 24 horas antes da partida',
    step2Title: 'Preparar Documentos',
    step2Desc: 'Passaporte válido e vistos necessários',
    step3Title: 'Chegada ao Aeroporto',
    step3Desc: 'Chegue 3 horas antes de voos internacionais',
    step4Title: 'Embarque',
    step4Desc: 'Portões fecham 30 minutos antes da partida',

    // Important Info
    checkInInfo: 'O check-in online estará disponível 24 horas antes do horário de partida.',
    baggageInfo: 'Bagagem despachada: 1 peça (23kg). Bagagem de mão: 1 peça (7kg) + 1 item pessoal.',
    documentsInfo: 'Certifique-se de que seu passaporte seja válido por pelo menos 6 meses.',
    arrivalInfo: 'Chegue ao aeroporto pelo menos 3 horas antes de voos internacionais.',

    // FAQs
    faqTitle: 'Perguntas Frequentes',
    faq1Q: 'Quando posso fazer check-in online?',
    faq1A: 'O check-in online abre 24 horas antes da partida e fecha 2 horas antes.',
    faq2Q: 'Posso mudar meu assento?',
    faq2A: 'Sim, você pode mudar seu assento durante o check-in online ou entrando em contato.',
    faq3Q: 'E sobre seguro viagem?',
    faq3A: 'Recomendamos adquirir seguro viagem para cobertura contra imprevistos.',
    faq4Q: 'Como adicionar refeições especiais?',
    faq4A: 'Pedidos de refeições especiais podem ser feitos até 24 horas antes da partida.',

    // Support
    contactSupport: 'Contatar Suporte',
    available24x7: 'Disponível 24/7',
    email: 'Email',
    phone: 'Telefone',
    whatsapp: 'WhatsApp',

    // Tips
    travelTips: 'Dicas de Viagem',
    tip1: 'Baixe o aplicativo da companhia aérea para atualizações em tempo real',
    tip2: 'Tire uma foto da sua bagagem e cartão de embarque',
    tip3: 'Chegue cedo para evitar estresse e aproveitar as comodidades do aeroporto',
    tip4: 'Mantenha seus documentos de viagem facilmente acessíveis',

    // Footer
    bookingProtection: 'Sua reserva está protegida pela Fly2Any Travel',
    termsConditions: 'Termos e Condições',
    privacyPolicy: 'Política de Privacidade',
    cancellationPolicy: 'Política de Cancelamento',
  },
  es: {
    // Success Messages
    bookingConfirmed: 'Reserva Confirmada!',
    congratulations: 'Felicitaciones! Su vuelo ha sido reservado exitosamente.',
    bookingReference: 'Referencia de Reserva',
    confirmationSent: 'Se ha enviado un correo de confirmación a',

    // Sections
    flightDetails: 'Detalles del Vuelo',
    passengerInfo: 'Información del Pasajero',
    paymentSummary: 'Resumen de Pago',
    nextSteps: 'Próximos Pasos',
    importantInfo: 'Información Importante',
    needHelp: 'Necesita Ayuda?',

    // Flight Info
    departure: 'Salida',
    arrival: 'Llegada',
    duration: 'Duración',
    flightNumber: 'Vuelo',
    aircraft: 'Aeronave',
    cabin: 'Cabina',
    seat: 'Asiento',
    baggage: 'Equipaje',

    // Passenger Details
    passenger: 'Pasajero',
    adult: 'Adulto',
    child: 'Niño',
    infant: 'Bebé',
    frequentFlyer: 'Viajero Frecuente',
    specialRequests: 'Solicitudes Especiales',

    // Payment
    subtotal: 'Subtotal',
    taxes: 'Impuestos y Tasas',
    insurance: 'Seguro de Viaje',
    total: 'Total Pagado',
    paymentMethod: 'Método de Pago',
    transactionId: 'ID de Transacción',
    paidOn: 'Pagado el',

    // Actions
    addToCalendar: 'Agregar al Calendario',
    downloadTicket: 'Descargar Billete PDF',
    printConfirmation: 'Imprimir Confirmación',
    viewItinerary: 'Ver Itinerario Completo',
    manageBooking: 'Gestionar Reserva',
    shareTrip: 'Compartir Detalles del Viaje',
    addInsurance: 'Agregar Seguro de Viaje',

    // Calendar Options
    googleCalendar: 'Google Calendar',
    appleCalendar: 'Apple Calendar',
    outlookCalendar: 'Outlook Calendar',

    // Next Steps
    step1Title: 'Check-in Online',
    step1Desc: 'Abre 24 horas antes de la salida',
    step2Title: 'Preparar Documentos',
    step2Desc: 'Pasaporte válido y visas requeridas',
    step3Title: 'Llegada al Aeropuerto',
    step3Desc: 'Llegue 3 horas antes de vuelos internacionales',
    step4Title: 'Embarque',
    step4Desc: 'Las puertas cierran 30 minutos antes de la salida',

    // Important Info
    checkInInfo: 'El check-in online estará disponible 24 horas antes de la hora de salida.',
    baggageInfo: 'Equipaje facturado: 1 pieza (23kg). Equipaje de mano: 1 pieza (7kg) + 1 artículo personal.',
    documentsInfo: 'Asegúrese de que su pasaporte sea válido por al menos 6 meses.',
    arrivalInfo: 'Llegue al aeropuerto al menos 3 horas antes de vuelos internacionales.',

    // FAQs
    faqTitle: 'Preguntas Frecuentes',
    faq1Q: 'Cuándo puedo hacer check-in online?',
    faq1A: 'El check-in online abre 24 horas antes de la salida y cierra 2 horas antes.',
    faq2Q: 'Puedo cambiar mi asiento?',
    faq2A: 'Sí, puede cambiar su asiento durante el check-in online o contactándonos.',
    faq3Q: 'Qué pasa con el seguro de viaje?',
    faq3A: 'Recomendamos adquirir seguro de viaje para cobertura contra imprevistos.',
    faq4Q: 'Cómo agregar comidas especiales?',
    faq4A: 'Las solicitudes de comidas especiales se pueden hacer hasta 24 horas antes.',

    // Support
    contactSupport: 'Contactar Soporte',
    available24x7: 'Disponible 24/7',
    email: 'Email',
    phone: 'Teléfono',
    whatsapp: 'WhatsApp',

    // Tips
    travelTips: 'Consejos de Viaje',
    tip1: 'Descargue la aplicación de su aerolínea para actualizaciones en tiempo real',
    tip2: 'Tome una foto de su equipaje y tarjeta de embarque',
    tip3: 'Llegue temprano para evitar estrés y disfrutar de las comodidades del aeropuerto',
    tip4: 'Mantenga sus documentos de viaje fácilmente accesibles',

    // Footer
    bookingProtection: 'Su reserva está protegida por Fly2Any Travel',
    termsConditions: 'Términos y Condiciones',
    privacyPolicy: 'Política de Privacidad',
    cancellationPolicy: 'Política de Cancelación',
  },
};

// Mock booking data (in real app, this would come from API/database)
const displayBookingData = {
  bookingRef: 'F2A-2025-XYZ789',
  confirmationDate: new Date().toISOString(),
  email: 'passenger@example.com',

  outboundFlight: {
    flightNumber: 'AA 1234',
    airline: 'American Airlines',
    aircraft: 'Boeing 777-300ER',
    from: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    to: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    departure: '2025-11-15T18:30:00',
    arrival: '2025-11-16T06:45:00',
    duration: '7h 15m',
    cabin: 'Economy',
  },

  returnFlight: {
    flightNumber: 'AA 5678',
    airline: 'American Airlines',
    aircraft: 'Boeing 777-300ER',
    from: { code: 'LHR', city: 'London', airport: 'Heathrow Airport' },
    to: { code: 'JFK', city: 'New York', airport: 'John F. Kennedy International' },
    departure: '2025-11-22T10:15:00',
    arrival: '2025-11-22T13:30:00',
    duration: '8h 15m',
    cabin: 'Economy',
  },

  passengers: [
    {
      id: 1,
      type: 'Adult',
      title: 'Mr',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1985-05-15',
      seat: '23A',
      frequentFlyer: 'AA1234567',
      baggage: '1 x 23kg',
    },
    {
      id: 2,
      type: 'Adult',
      title: 'Mrs',
      firstName: 'Sarah',
      lastName: 'Smith',
      dateOfBirth: '1987-08-22',
      seat: '23B',
      frequentFlyer: '',
      baggage: '1 x 23kg',
    },
  ],

  payment: {
    subtotal: 1245.00,
    taxes: 355.00,
    insurance: 0,
    total: 1600.00,
    method: 'Visa ****4242',
    transactionId: 'TXN-20251003-ABC123',
    paidOn: new Date().toISOString(),
    currency: 'USD',
  },
};

export default function BookingConfirmationContent() {
  const [lang, setLang] = useState<Language>('en');
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED' | null>(null);
  const [verificationCountdown, setVerificationCountdown] = useState(24 * 60 * 60); // 24 hours in seconds
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = content[lang];

  // Fetch real booking data from database
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingId = searchParams.get('bookingId');
        const bookingRef = searchParams.get('ref');

        if (!bookingId && !bookingRef) {
          console.error('No booking ID or reference provided');
          setLoading(false);
          return;
        }

        // Fetch from PUBLIC API (not admin - customers don't have admin auth)
        const response = await fetch(`/api/bookings/${bookingId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }

        const result = await response.json();

        // Public API returns data.booking
        if (result.success && (result.data?.booking || result.booking)) {
          setBookingData(result.data?.booking || result.booking);
        } else {
          console.error('Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [searchParams]);

  // Fetch verification status - check both booking and customer-level
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!bookingData?.bookingReference) return;

      try {
        // First check booking-specific verification
        const response = await fetch(`/api/booking-flow/verify-documents?ref=${bookingData.bookingReference}`);
        if (!response.ok) return;

        const data = await response.json();

        // Check if customer can bypass (already verified on another booking)
        if (data.canBypass) {
          setVerificationStatus('VERIFIED');
          return; // Skip modal - customer already verified
        }

        setVerificationStatus(data.status);

        // If not verified by booking, check by customer email
        if (data.status === 'NOT_STARTED' && bookingData.contactInfo?.email) {
          const emailCheck = await fetch(`/api/booking-flow/verify-documents?email=${encodeURIComponent(bookingData.contactInfo.email)}`);
          if (emailCheck.ok) {
            const emailData = await emailCheck.json();
            if (emailData.canBypass) {
              setVerificationStatus('VERIFIED');
              return; // Customer has verified docs on file - skip modal
            }
          }
        }

        // Auto-open verification modal only if:
        // - Documents not uploaded
        // - Booking is recent (within last hour)
        // - Not already verified/pending
        if (data.status === 'NOT_STARTED' || (data.status === 'PENDING' && !data.documentsUploaded)) {
          const bookingAge = Date.now() - new Date(bookingData.createdAt).getTime();
          const isRecent = bookingAge < 60 * 60 * 1000; // 1 hour
          if (isRecent) {
            setShowVerificationModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    checkVerificationStatus();
  }, [bookingData]);

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Verification countdown timer
  useEffect(() => {
    if (!bookingData || verificationStatus === 'VERIFIED' || verificationStatus === 'PENDING') return;

    // Calculate remaining time based on booking creation
    const createdAt = new Date(bookingData.createdAt).getTime();
    const deadline = createdAt + (24 * 60 * 60 * 1000); // 24 hours from creation
    const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
    setVerificationCountdown(remaining);

    const interval = setInterval(() => {
      setVerificationCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingData, verificationStatus]);

  const copyBookingRef = () => {
    const refToCopy = bookingData ? bookingData.bookingReference : 'N/A';
    navigator.clipboard.writeText(refToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    const currency = bookingData ? bookingData.payment.currency : 'USD';
    return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  // PDF Download - generates Apple Level 6 styled booking confirmation
  const handleDownloadPDF = async () => {
    if (!bookingData || !displayBookingData) return;

    try {
      const outbound = displayBookingData.outboundFlight;
      const returnFlight = displayBookingData.returnFlight;
      const passengers = displayBookingData.passengers;
      const payment = displayBookingData.payment;

      // Get airline info for logo
      const outboundAirline = getAirlineInfo(outbound.airline);
      const returnAirline = returnFlight ? getAirlineInfo(returnFlight.airline) : null;

      // Generate rich PDF HTML
      const pdfHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fly2Any - Booking ${displayBookingData.bookingRef}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
      min-height: 100vh;
      padding: 24px;
      color: #1f2937;
    }
    .container { max-width: 800px; margin: 0 auto; }

    /* Header */
    .header {
      background: linear-gradient(135deg, #E74035 0%, #D63930 100%);
      color: white;
      padding: 24px 32px;
      border-radius: 16px 16px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-sub { font-size: 12px; opacity: 0.9; margin-top: 4px; }
    .header-right { text-align: right; }
    .header-date { font-size: 12px; opacity: 0.8; }

    /* Success Banner */
    .success-banner {
      background: white;
      padding: 32px;
      text-align: center;
      border-bottom: 1px solid #e5e7eb;
    }
    .success-icon { font-size: 48px; margin-bottom: 12px; }
    .success-title { font-size: 28px; font-weight: 700; color: #059669; margin-bottom: 8px; }
    .success-subtitle { color: #6b7280; font-size: 14px; }

    /* Booking Reference */
    .booking-ref {
      background: #f8fafc;
      padding: 20px 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .ref-box { text-align: center; }
    .ref-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .ref-value { font-size: 24px; font-weight: 800; font-family: 'SF Mono', monospace; color: #1f2937; }
    .ref-pnr { font-size: 16px; font-weight: 600; color: #3b82f6; }

    /* Main Content */
    .content { background: white; padding: 0; }

    /* Flight Card */
    .flight-card {
      padding: 24px 32px;
      border-bottom: 1px solid #e5e7eb;
    }
    .flight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .flight-title { font-size: 18px; font-weight: 700; }
    .flight-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .badge-outbound { background: #dbeafe; color: #1d4ed8; }
    .badge-return { background: #f3e8ff; color: #7c3aed; }

    .flight-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 16px;
    }
    .airline-logo { width: 24px; height: 24px; border-radius: 4px; }
    .airline-name { font-weight: 600; color: #374151; }

    .flight-route {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .airport { text-align: center; min-width: 100px; }
    .airport-time { font-size: 32px; font-weight: 700; color: #1f2937; }
    .airport-code { font-size: 20px; font-weight: 600; color: #374151; margin-top: 4px; }
    .airport-date { font-size: 12px; color: #6b7280; margin-top: 2px; }

    .flight-line {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 16px;
    }
    .duration { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
    .line { height: 2px; width: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); position: relative; }
    .plane-icon { font-size: 16px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 0 8px; }
    .stop-info { font-size: 11px; color: #6b7280; margin-top: 8px; }

    .flight-details {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
    }
    .detail-item { }
    .detail-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; }
    .detail-value { font-size: 14px; font-weight: 600; color: #374151; margin-top: 2px; }

    /* Passengers */
    .passengers-section { padding: 24px 32px; border-bottom: 1px solid #e5e7eb; }
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
    .passenger-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .passenger-number {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }
    .passenger-info { flex: 1; }
    .passenger-name { font-weight: 600; color: #1f2937; }
    .passenger-type { font-size: 12px; color: #6b7280; }

    /* Payment */
    .payment-section { padding: 24px 32px; }
    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .payment-label { color: #6b7280; }
    .payment-value { font-weight: 500; color: #374151; }
    .payment-total {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      margin-top: 8px;
      border-top: 2px solid #e5e7eb;
    }
    .total-label { font-size: 16px; font-weight: 700; color: #1f2937; }
    .total-value { font-size: 24px; font-weight: 800; color: #059669; }
    .payment-meta { font-size: 12px; color: #9ca3af; margin-top: 12px; }

    /* Footer */
    .footer {
      background: #f8fafc;
      padding: 24px 32px;
      border-radius: 0 0 16px 16px;
      text-align: center;
    }
    .footer-brand { font-size: 16px; font-weight: 700; color: #E74035; margin-bottom: 8px; }
    .footer-contact { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    .footer-thanks { font-size: 12px; color: #9ca3af; margin-top: 12px; }

    /* Important Info */
    .info-section {
      padding: 20px 32px;
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      margin: 0 32px 24px;
      border-radius: 0 8px 8px 0;
    }
    .info-title { font-size: 14px; font-weight: 600; color: #92400e; margin-bottom: 8px; }
    .info-text { font-size: 13px; color: #78350f; line-height: 1.5; }

    @media print {
      body { padding: 0; background: white; }
      .container { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo">✈️ Fly2Any</div>
        <div class="logo-sub">Your Journey, Our Priority</div>
      </div>
      <div class="header-right">
        <div style="font-weight: 600;">E-Ticket Confirmation</div>
        <div class="header-date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>

    <!-- Success Banner -->
    <div class="success-banner">
      <div class="success-icon">✓</div>
      <div class="success-title">${t.bookingConfirmed}</div>
      <div class="success-subtitle">${t.congratulations}</div>
    </div>

    <!-- Booking Reference -->
    <div class="booking-ref">
      <div class="ref-box">
        <div class="ref-label">Booking Reference</div>
        <div class="ref-value">${displayBookingData.bookingRef}</div>
      </div>
      ${bookingData.airlineRecordLocator ? `
      <div class="ref-box">
        <div class="ref-label">Airline PNR</div>
        <div class="ref-pnr">${bookingData.airlineRecordLocator}</div>
      </div>
      ` : ''}
    </div>

    <div class="content">
      <!-- Outbound Flight -->
      <div class="flight-card">
        <div class="flight-header">
          <div class="flight-title">${t.flightDetails}</div>
          <span class="flight-badge badge-outbound">${t.departure}</span>
        </div>
        <div class="flight-info">
          <img src="${outboundAirline.logo}" alt="${outboundAirline.name}" class="airline-logo" onerror="this.style.display='none'"/>
          <span class="airline-name">${outboundAirline.name}</span>
          <span>•</span>
          <span>${outbound.flightNumber}</span>
          <span>•</span>
          <span>${outbound.aircraft || 'Aircraft'}</span>
        </div>
        <div class="flight-route">
          <div class="airport">
            <div class="airport-time">${formatTime(outbound.departure)}</div>
            <div class="airport-code">${outbound.from.code}</div>
            <div class="airport-date">${formatDate(outbound.departure)}</div>
          </div>
          <div class="flight-line">
            <div class="duration">${outbound.duration}</div>
            <div class="line"><span class="plane-icon">✈️</span></div>
            <div class="stop-info">Direct</div>
          </div>
          <div class="airport">
            <div class="airport-time">${formatTime(outbound.arrival)}</div>
            <div class="airport-code">${outbound.to.code}</div>
            <div class="airport-date">${formatDate(outbound.arrival)}</div>
          </div>
        </div>
        <div class="flight-details">
          <div class="detail-item"><div class="detail-label">Cabin</div><div class="detail-value">${outbound.cabin}</div></div>
          <div class="detail-item"><div class="detail-label">Baggage</div><div class="detail-value">${displayBookingData.baggage.length > 0 ? displayBookingData.baggage.map((b: any) => b.name).join(', ') : 'Included'}</div></div>
          <div class="detail-item"><div class="detail-label">Seats</div><div class="detail-value">${passengers.some((p: any) => p.seat) ? passengers.filter((p: any) => p.seat).map((p: any) => p.seat).join(', ') : 'TBA'}</div></div>
        </div>
      </div>

      ${returnFlight ? `
      <!-- Return Flight -->
      <div class="flight-card">
        <div class="flight-header">
          <div class="flight-title">${t.flightDetails}</div>
          <span class="flight-badge badge-return">${t.arrival}</span>
        </div>
        <div class="flight-info">
          <img src="${returnAirline?.logo}" alt="${returnAirline?.name}" class="airline-logo" onerror="this.style.display='none'"/>
          <span class="airline-name">${returnAirline?.name}</span>
          <span>•</span>
          <span>${returnFlight.flightNumber}</span>
          <span>•</span>
          <span>${returnFlight.aircraft || 'Aircraft'}</span>
        </div>
        <div class="flight-route">
          <div class="airport">
            <div class="airport-time">${formatTime(returnFlight.departure)}</div>
            <div class="airport-code">${returnFlight.from.code}</div>
            <div class="airport-date">${formatDate(returnFlight.departure)}</div>
          </div>
          <div class="flight-line">
            <div class="duration">${returnFlight.duration}</div>
            <div class="line"><span class="plane-icon">✈️</span></div>
            <div class="stop-info">Direct</div>
          </div>
          <div class="airport">
            <div class="airport-time">${formatTime(returnFlight.arrival)}</div>
            <div class="airport-code">${returnFlight.to.code}</div>
            <div class="airport-date">${formatDate(returnFlight.arrival)}</div>
          </div>
        </div>
        <div class="flight-details">
          <div class="detail-item"><div class="detail-label">Cabin</div><div class="detail-value">${returnFlight.cabin}</div></div>
          <div class="detail-item"><div class="detail-label">Baggage</div><div class="detail-value">${displayBookingData.baggage.length > 0 ? displayBookingData.baggage.map((b: any) => b.name).join(', ') : 'Included'}</div></div>
          <div class="detail-item"><div class="detail-label">Seats</div><div class="detail-value">${passengers.some((p: any) => p.seat) ? passengers.filter((p: any) => p.seat).map((p: any) => p.seat).join(', ') : 'TBA'}</div></div>
        </div>
      </div>
      ` : ''}

      <!-- Passengers -->
      <div class="passengers-section">
        <div class="section-title">${t.passengerInfo}</div>
        ${passengers.map((p: any, i: number) => `
          <div class="passenger-card">
            <div class="passenger-number">${i + 1}</div>
            <div class="passenger-info">
              <div class="passenger-name">${p.title}. ${p.firstName} ${p.lastName}</div>
              <div class="passenger-type">${p.type}${p.frequentFlyer ? ` • FF: ${p.frequentFlyer}` : ''}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Payment -->
      <div class="payment-section">
        <div class="section-title">${t.paymentSummary}</div>
        <div class="payment-row">
          <span class="payment-label">${t.subtotal}</span>
          <span class="payment-value">${formatCurrency(payment.subtotal)}</span>
        </div>
        ${(payment.taxes > 0 || payment.fees > 0) ? `
        <div class="payment-row">
          <span class="payment-label">${t.taxes}</span>
          <span class="payment-value">${formatCurrency((payment.taxes || 0) + (payment.fees || 0))}</span>
        </div>
        ` : ''}
        ${payment.insurance > 0 ? `
        <div class="payment-row">
          <span class="payment-label">${t.insurance}</span>
          <span class="payment-value">${formatCurrency(payment.insurance)}</span>
        </div>
        ` : ''}
        <div class="payment-total">
          <span class="total-label">${t.total}</span>
          <span class="total-value">${formatCurrency(payment.total)}</span>
        </div>
        <div class="payment-meta">
          ${t.paymentMethod}: ${payment.method} • ${t.transactionId}: ${payment.transactionId}<br/>
          ${t.paidOn}: ${formatDate(payment.paidOn)}
        </div>
      </div>
    </div>

    <!-- Important Info -->
    <div class="info-section">
      <div class="info-title">📋 Important Information</div>
      <div class="info-text">
        • Online check-in opens 24 hours before departure<br/>
        • Arrive at the airport at least 3 hours before international flights<br/>
        • Ensure your passport is valid for at least 6 months beyond travel dates
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">✈️ Fly2Any Travel</div>
      <div class="footer-contact">📞 +1 (332) 220-0838 | 📧 support@fly2any.com</div>
      <div class="footer-contact">🌐 www.fly2any.com</div>
      <div class="footer-thanks">Thank you for booking with Fly2Any! Have a wonderful trip.</div>
    </div>
  </div>
</body>
</html>`;

      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfHtml);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      window.print();
    }
  };

  // Calendar event generation
  const handleAddToCalendar = (type: 'google' | 'apple' | 'outlook') => {
    if (!bookingData || !displayBookingData) return;

    const flight = displayBookingData.outboundFlight;
    const title = `Flight ${flight.flightNumber} - ${flight.from.code} to ${flight.to.code}`;
    const description = `Fly2Any Booking: ${displayBookingData.bookingRef}\\n` +
      `Flight: ${flight.flightNumber}\\n` +
      `From: ${flight.from.code}\\n` +
      `To: ${flight.to.code}\\n` +
      `${bookingData.airlineRecordLocator ? `PNR: ${bookingData.airlineRecordLocator}` : ''}`;

    const startDate = new Date(flight.departure);
    const endDate = new Date(flight.arrival);

    // Format dates for calendar URLs
    const formatCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const startStr = formatCalDate(startDate);
    const endStr = formatCalDate(endDate);

    let url = '';

    if (type === 'google') {
      url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(flight.from.code + ' Airport')}`;
      window.open(url, '_blank');
    } else if (type === 'outlook') {
      url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(description)}&location=${encodeURIComponent(flight.from.code + ' Airport')}`;
      window.open(url, '_blank');
    } else if (type === 'apple') {
      // Generate ICS file for Apple Calendar
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Fly2Any//Booking//EN
BEGIN:VEVENT
UID:${displayBookingData.bookingRef}@fly2any.com
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\\n/g, '\\n')}
LOCATION:${flight.from.code} Airport
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fly2any-flight-${displayBookingData.bookingRef}.ics`;
      link.click();
      URL.revokeObjectURL(link.href);
    }

    setShowCalendarMenu(false);
  };

  // Share trip functionality
  const handleShareTrip = async () => {
    if (!bookingData || !displayBookingData) return;

    const flight = displayBookingData.outboundFlight;
    const shareText = `✈️ I'm flying with Fly2Any!\n\n` +
      `📍 ${flight.from.code} → ${flight.to.code}\n` +
      `📅 ${formatDate(flight.departure)}\n` +
      `✈️ ${flight.flightNumber}\n\n` +
      `Book your flight at fly2any.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fly2Any Trip - ${flight.from.code} to ${flight.to.code}`,
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Trip details copied to clipboard!');
  };

  // Format countdown for display
  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  // Show error if no booking data
  if (!loading && !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your booking. Please check your booking reference or contact support.
          </p>
          <a
            href="/flights/results"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Search Flights
          </a>
        </div>
      </div>
    );
  }

  // Transform booking data to match expected format for display
  const displayBookingData: any = bookingData ? {
    bookingRef: bookingData.bookingReference,
    confirmationDate: bookingData.createdAt,
    email: bookingData.contactInfo.email,
    outboundFlight: {
      flightNumber: `${bookingData.flight.segments[0].carrierCode} ${bookingData.flight.segments[0].flightNumber}`,
      airline: bookingData.flight.segments[0].carrierCode,
      aircraft: bookingData.flight.segments[0].aircraft || 'Aircraft',
      from: {
        code: bookingData.flight.segments[0].departure.iataCode,
        city: bookingData.flight.segments[0].departure.iataCode,
        airport: bookingData.flight.segments[0].departure.iataCode,
      },
      to: {
        code: bookingData.flight.segments[0].arrival.iataCode,
        city: bookingData.flight.segments[0].arrival.iataCode,
        airport: bookingData.flight.segments[0].arrival.iataCode,
      },
      departure: bookingData.flight.segments[0].departure.at,
      arrival: bookingData.flight.segments[0].arrival.at,
      duration: bookingData.flight.segments[0].duration,
      cabin: bookingData.flight.segments[0].class,
    },
    returnFlight: bookingData.flight.segments.length > 1 ? {
      flightNumber: `${bookingData.flight.segments[1].carrierCode} ${bookingData.flight.segments[1].flightNumber}`,
      airline: bookingData.flight.segments[1].carrierCode,
      aircraft: bookingData.flight.segments[1].aircraft || 'Aircraft',
      from: {
        code: bookingData.flight.segments[1].departure.iataCode,
        city: bookingData.flight.segments[1].departure.iataCode,
        airport: bookingData.flight.segments[1].departure.iataCode,
      },
      to: {
        code: bookingData.flight.segments[1].arrival.iataCode,
        city: bookingData.flight.segments[1].arrival.iataCode,
        airport: bookingData.flight.segments[1].arrival.iataCode,
      },
      departure: bookingData.flight.segments[1].departure.at,
      arrival: bookingData.flight.segments[1].arrival.at,
      duration: bookingData.flight.segments[1].duration,
      cabin: bookingData.flight.segments[1].class,
    } : null,
    passengers: bookingData.passengers.map((p: any, idx: number) => {
      // Find seat for this passenger from seats array
      const passengerSeat = bookingData.seats?.find((s: any) => s.passengerId === p.id);
      // Find baggage from addOns
      const baggageAddOn = bookingData.addOns?.find((a: any) => a.category === 'baggage');
      return {
        id: p.id || idx + 1,
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        name: `${p.firstName} ${p.lastName}`,
        type: p.type,
        dateOfBirth: p.dateOfBirth,
        seat: passengerSeat?.seatNumber || null,
        baggage: baggageAddOn?.name || null,
        frequentFlyer: p.frequentFlyerNumber || '',
      };
    }),
    payment: {
      subtotal: bookingData.flight?.price?.base || bookingData.payment.amount,
      taxes: bookingData.flight?.price?.taxes || 0,
      fees: bookingData.flight?.price?.fees || 0,
      insurance: bookingData.addOns?.find((a: any) => a.category === 'insurance')?.price || 0,
      total: bookingData.payment.amount,
      method: `${bookingData.payment.cardBrand || 'Card'} ****${bookingData.payment.cardLast4}`,
      transactionId: bookingData.payment.transactionId || 'N/A',
      paidOn: bookingData.payment.paidAt || bookingData.createdAt,
      currency: bookingData.payment.currency,
    },
    // Add baggage info from addOns
    baggage: bookingData.addOns?.filter((a: any) => a.category === 'baggage') || [],
    // Seats from API
    seats: bookingData.seats || [],
  } : null; // No booking data available

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 print:bg-white">
      {/* Print-Only Header with Fly2Any Branding */}
      <div className="hidden print:block print:mb-6">
        <div className="flex items-center justify-between border-b-2 border-[#E74035] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-[#E74035]">✈️ Fly2Any</div>
            <div className="text-sm text-gray-500">Travel</div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold">Booking Confirmation</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      {bookingData && (
        <CancelOrderDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          bookingId={bookingData.id}
          bookingReference={bookingData.bookingReference}
          onCancellationComplete={(confirmation) => {
            console.log('Cancellation confirmed:', confirmation);
            // Refresh booking data
            setShowCancelDialog(false);
            // Optionally redirect to bookings list
            setTimeout(() => {
              router.push('/admin/bookings');
            }, 3000);
          }}
        />
      )}

      {/* Modify Order Dialog */}
      {bookingData && displayBookingData && (
        <ModifyOrderDialog
          isOpen={showModifyDialog}
          onClose={() => setShowModifyDialog(false)}
          bookingId={bookingData.id}
          bookingReference={bookingData.bookingReference}
          currentDepartureDate={bookingData.flight.segments[0].departure.at}
          currentReturnDate={bookingData.flight.segments.length > 1 ? bookingData.flight.segments[1].departure.at : undefined}
          origin={bookingData.flight.segments[0].departure.iataCode}
          destination={bookingData.flight.segments[0].arrival.iataCode}
          sourceApi={bookingData.sourceApi}
          onModificationComplete={(confirmation) => {
            console.log('Modification confirmed:', confirmation);
            // Refresh booking data
            setShowModifyDialog(false);
            // Reload the page to show updated booking
            window.location.reload();
          }}
        />
      )}

      {/* Post-Payment Verification Modal */}
      {bookingData && (
        <PostPaymentVerification
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          booking={{
            bookingReference: bookingData.bookingReference,
            amount: bookingData.totalPrice || bookingData.payment?.total || 0,
            currency: bookingData.payment?.currency || 'USD',
            route: `${bookingData.outboundFlight?.from?.code || ''} → ${bookingData.outboundFlight?.to?.code || ''}`,
            passengerName: bookingData.passengers?.[0]
              ? `${bookingData.passengers[0].firstName} ${bookingData.passengers[0].lastName}`
              : 'Guest',
          }}
          uploadToken={`${bookingData.bookingReference}-${Date.now().toString(36)}`}
          onComplete={() => {
            setVerificationStatus('PENDING');
            setShowVerificationModal(false);
          }}
          onSkip={() => {
            setShowVerificationModal(false);
          }}
        />
      )}

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden print:hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 print:py-4">
        {/* Success Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 print:mb-2 animate-scale-in">
            <svg className="w-10 h-10 text-white animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-2 print:text-3xl">
            {t.bookingConfirmed}
          </h1>

          <p className="text-lg text-gray-600 mb-6 print:text-base print:mb-3">
            {t.congratulations}
          </p>

          {/* Booking Reference - Large and Copyable */}
          <div className="inline-block bg-white rounded-2xl shadow-lg p-6 print:shadow-none print:border print:p-4">
            <p className="text-sm text-gray-500 mb-2">{t.bookingReference}</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-mono font-bold text-gray-900 print:text-2xl">
                {displayBookingData.bookingRef}
              </span>
              <button
                onClick={copyBookingRef}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors no-print"
                title="Copy"
              >
                {copied ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4 print:mt-2">
            {t.confirmationSent} <span className="font-semibold">{displayBookingData.email}</span>
          </p>
        </div>

        {/* E-Ticket Information - Show when ticketed */}
        {bookingData && bookingData.status === 'ticketed' && bookingData.airlineRecordLocator && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  E-Ticket Issued
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wider">
                    Airline Confirmation (PNR)
                  </p>
                  <p className="text-4xl font-mono font-bold text-emerald-800 tracking-widest">
                    {bookingData.airlineRecordLocator}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Use this code for online check-in
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-emerald-600 font-semibold mb-2 uppercase tracking-wider">
                    E-Ticket Numbers
                  </p>
                  <div className="space-y-2">
                    {bookingData.eticketNumbers && bookingData.eticketNumbers.map((ticket: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">
                          {bookingData.passengers[idx]?.firstName} {bookingData.passengers[idx]?.lastName}
                        </span>
                        <span className="font-mono text-sm font-semibold text-emerald-800">
                          {ticket}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-emerald-600 mt-4">
                Your e-ticket has been issued. Please save this information for check-in.
              </p>
            </div>
          </div>
        )}

        {/* Pending Ticketing Notice - Show when pending_ticketing */}
        {bookingData && bookingData.status === 'pending_ticketing' && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Processing Your Booking
                </div>

                <h3 className="text-lg font-bold text-amber-800 mb-2">
                  Your E-Ticket is Being Issued
                </h3>
                <p className="text-amber-700 text-sm max-w-md mx-auto">
                  We're finalizing your booking with the airline. You'll receive your e-ticket and PNR confirmation via email within 2-4 hours.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-amber-600 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Check your email for updates
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Status Banner */}
        {bookingData && verificationStatus && verificationStatus !== 'VERIFIED' && (
          <div className="max-w-2xl mx-auto mb-8 print:hidden">
            <div className={`rounded-2xl p-6 shadow-lg border-2 ${
              verificationStatus === 'PENDING'
                ? 'bg-gradient-to-r from-info-50 to-primary-50 border-info-300'
                : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  verificationStatus === 'PENDING'
                    ? 'bg-info-100'
                    : 'bg-purple-100'
                }`}>
                  {verificationStatus === 'PENDING' ? (
                    <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  {verificationStatus === 'PENDING' ? (
                    <>
                      <h3 className="text-lg font-bold text-neutral-700 mb-1">
                        Documents Submitted - Under Review
                      </h3>
                      <p className="text-primary-600 text-sm">
                        Thank you! Your verification documents have been submitted and are being reviewed.
                        You'll receive confirmation via email shortly.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-purple-800">
                          Quick Verification Required
                        </h3>
                        {/* Countdown Timer */}
                        <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-lg">
                          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-mono font-bold text-purple-700 text-sm">
                            {formatCountdown(verificationCountdown)}
                          </span>
                        </div>
                      </div>
                      <p className="text-purple-700 text-sm mb-4">
                        Complete ID verification to secure your booking.
                        Time remaining to verify.
                      </p>
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-200"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Complete Verification Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verified Customer Badge */}
        {verificationStatus === 'VERIFIED' && (
          <div className="max-w-2xl mx-auto mb-8 print:hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="text-green-800 font-bold text-lg">Verified Customer</span>
                  <span className="text-green-600 text-sm ml-2">Your identity has been confirmed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 no-print">
          <div className="relative">
            <button
              onClick={() => setShowCalendarMenu(!showCalendarMenu)}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-all hover:shadow-md"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">{t.addToCalendar}</span>
            </button>

            {showCalendarMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-10 overflow-hidden">
                <button
                  onClick={() => handleAddToCalendar('google')}
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left text-sm flex items-center gap-2"
                >
                  <span className="text-xl">📅</span>
                  {t.googleCalendar}
                </button>
                <button
                  onClick={() => handleAddToCalendar('apple')}
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left text-sm flex items-center gap-2"
                >
                  <span className="text-xl">🍎</span>
                  {t.appleCalendar}
                </button>
                <button
                  onClick={() => handleAddToCalendar('outlook')}
                  className="w-full px-4 py-3 hover:bg-gray-50 text-left text-sm flex items-center gap-2"
                >
                  <span className="text-xl">📧</span>
                  {t.outlookCalendar}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadPDF}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{t.downloadTicket}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{t.printConfirmation}</span>
          </button>

          <button
            onClick={handleShareTrip}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-all hover:shadow-md"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{t.shareTrip}</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outbound Flight */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 print:shadow-none print:p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t.flightDetails}</h2>
                <span className="text-sm bg-info-100 text-primary-600 px-3 py-1 rounded-full font-semibold">
                  {t.departure}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {/* Airline Logo */}
                  <img
                    src={getAirlineInfo(displayBookingData.outboundFlight.airline).logo}
                    alt={getAirlineInfo(displayBookingData.outboundFlight.airline).name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="font-semibold text-gray-900">{getAirlineInfo(displayBookingData.outboundFlight.airline).name}</span>
                  <span>•</span>
                  <span>{displayBookingData.outboundFlight.flightNumber}</span>
                  <span>•</span>
                  <span>{displayBookingData.outboundFlight.aircraft}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  {/* Departure */}
                  <div>
                    <div className="text-3xl font-bold text-gray-900 print:text-2xl">
                      {formatTime(displayBookingData.outboundFlight.departure)}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 print:text-base">
                      {displayBookingData.outboundFlight.from.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(displayBookingData.outboundFlight.departure)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {displayBookingData.outboundFlight.from.airport}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col items-center px-4">
                    <div className="text-xs text-gray-500 mb-1">{displayBookingData.outboundFlight.duration}</div>
                    <div className="w-full min-w-[100px] h-0.5 bg-gradient-to-r from-info-400 via-info-500 to-info-400 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-info-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Direct</div>
                  </div>

                  {/* Arrival */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 print:text-2xl">
                      {formatTime(displayBookingData.outboundFlight.arrival)}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 print:text-base">
                      {displayBookingData.outboundFlight.to.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(displayBookingData.outboundFlight.arrival)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {displayBookingData.outboundFlight.to.airport}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-xs text-gray-500">{t.cabin}</span>
                    <p className="font-semibold text-gray-900">{displayBookingData.outboundFlight.cabin}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t.baggage}</span>
                    <p className="font-semibold text-gray-900">
                      {displayBookingData.baggage.length > 0
                        ? displayBookingData.baggage.map((b: any) => b.name).join(', ')
                        : 'Included'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t.seat}</span>
                    <p className="font-semibold text-gray-900">
                      {displayBookingData.passengers.some((p: any) => p.seat)
                        ? displayBookingData.passengers.filter((p: any) => p.seat).map((p: any, i: number) => (
                            <span key={i}>{i > 0 ? ', ' : ''}{p.seat}</span>
                          ))
                        : 'TBA'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Return Flight */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 print:shadow-none print:p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t.flightDetails}</h2>
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                  {t.arrival}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {/* Airline Logo */}
                  {displayBookingData.returnFlight && (
                    <img
                      src={getAirlineInfo(displayBookingData.returnFlight.airline).logo}
                      alt={getAirlineInfo(displayBookingData.returnFlight.airline).name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-semibold text-gray-900">{displayBookingData.returnFlight ? getAirlineInfo(displayBookingData.returnFlight.airline).name : ''}</span>
                  <span>•</span>
                  <span>{displayBookingData.returnFlight?.flightNumber}</span>
                  <span>•</span>
                  <span>{displayBookingData.returnFlight?.aircraft}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  {/* Departure */}
                  <div>
                    <div className="text-3xl font-bold text-gray-900 print:text-2xl">
                      {displayBookingData.returnFlight && formatTime(displayBookingData.returnFlight.departure)}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 print:text-base">
                      {displayBookingData.returnFlight?.from.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {displayBookingData.returnFlight && formatDate(displayBookingData.returnFlight.departure)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {displayBookingData.returnFlight?.from.airport}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col items-center px-4">
                    <div className="text-xs text-gray-500 mb-1">{displayBookingData.returnFlight.duration}</div>
                    <div className="w-full min-w-[100px] h-0.5 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-400 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Direct</div>
                  </div>

                  {/* Arrival */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 print:text-2xl">
                      {formatTime(displayBookingData.returnFlight.arrival)}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 print:text-base">
                      {displayBookingData.returnFlight.to.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(displayBookingData.returnFlight.arrival)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {displayBookingData.returnFlight.to.airport}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-xs text-gray-500">{t.cabin}</span>
                    <p className="font-semibold text-gray-900">{displayBookingData.returnFlight.cabin}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t.baggage}</span>
                    <p className="font-semibold text-gray-900">
                      {displayBookingData.baggage.length > 0
                        ? displayBookingData.baggage.map((b: any) => b.name).join(', ')
                        : 'Included'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t.seat}</span>
                    <p className="font-semibold text-gray-900">
                      {displayBookingData.passengers.some((p: any) => p.seat)
                        ? displayBookingData.passengers.filter((p: any) => p.seat).map((p: any, i: number) => (
                            <span key={i}>{i > 0 ? ', ' : ''}{p.seat}</span>
                          ))
                        : 'TBA'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 print:shadow-none print:p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t.passengerInfo}</h2>

              <div className="space-y-3">
                {displayBookingData.passengers.map((passenger: any, index: number) => (
                  <div key={passenger.id} className="flex items-center gap-3 p-3 border rounded-xl print:border-gray-300">
                    <div className="w-10 h-10 bg-info-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary-500">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {passenger.title}. {passenger.firstName} {passenger.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{passenger.type}</p>
                    </div>
                    {passenger.frequentFlyer && (
                      <div className="text-right text-sm">
                        <span className="text-gray-500">{t.frequentFlyer}</span>
                        <p className="font-semibold">{passenger.frequentFlyer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Boarding Pass QR */}
            <div className="bg-gradient-to-br from-info-50 to-primary-50 rounded-2xl border border-info-200 p-6 print:hidden">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <div className="text-xs text-center text-gray-500">QR Code<br/>Available<br/>at Check-in</div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Mobile Boarding Pass</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Complete online check-in 24 hours before departure to receive your mobile boarding pass with QR code.
                  </p>
                  <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                    Check-in Online (Available 24h before)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 print:shadow-none print:p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t.paymentSummary}</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal}</span>
                  <span>{formatCurrency(displayBookingData.payment.subtotal)}</span>
                </div>
                {(displayBookingData.payment.taxes > 0 || displayBookingData.payment.fees > 0) && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t.taxes}</span>
                    <span>{formatCurrency((displayBookingData.payment.taxes || 0) + (displayBookingData.payment.fees || 0))}</span>
                  </div>
                )}
                {displayBookingData.payment.insurance > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>{t.insurance}</span>
                    <span>{formatCurrency(displayBookingData.payment.insurance)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{t.total}</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(displayBookingData.payment.total)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{t.paymentMethod}</span>
                    <span className="font-semibold">{displayBookingData.payment.method}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t.transactionId}</span>
                    <span className="font-mono text-xs">{displayBookingData.payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t.paidOn}</span>
                    <span>{formatDate(displayBookingData.payment.paidOn)}</span>
                  </div>
                </div>
              </div>

              {displayBookingData.payment.insurance === 0 && (
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-semibold transition-colors">
                    + {t.addInsurance}
                  </button>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 print:shadow-none print:p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t.nextSteps}</h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-info-100 text-primary-500 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.step1Title}</h3>
                    <p className="text-sm text-gray-600">{t.step1Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.step2Title}</h3>
                    <p className="text-sm text-gray-600">{t.step2Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.step3Title}</h3>
                    <p className="text-sm text-gray-600">{t.step3Desc}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.step4Title}</h3>
                    <p className="text-sm text-gray-600">{t.step4Desc}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 print:hidden">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span>
                {t.travelTips}
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t.tip1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t.tip2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t.tip3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{t.tip4}</span>
                </li>
              </ul>
            </div>

            {/* Order Management Actions */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 print:hidden">
              <h3 className="font-semibold text-gray-900 mb-4">Manage Your Booking</h3>

              {/* Cancel Booking */}
              <button
                onClick={() => setShowCancelDialog(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all mb-3 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Booking
              </button>

              {/* Modify Booking */}
              <button
                onClick={() => setShowModifyDialog(true)}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modify Dates
              </button>

              {/* Refund Policy Info */}
              {bookingData && bookingData.refundPolicy && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600">
                    {bookingData.refundPolicy.refundable ? (
                      <span className="text-green-600 font-semibold">Refundable</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Non-refundable</span>
                    )}
                    {bookingData.refundPolicy.cancellationFee && bookingData.refundPolicy.cancellationFee > 0 && (
                      <> - Cancellation fee: {formatCurrency(bookingData.refundPolicy.cancellationFee)}</>
                    )}
                  </p>
                  {bookingData.refundPolicy.refundDeadline && (
                    <p className="text-gray-500 mt-1">
                      Free cancellation until {formatDate(bookingData.refundPolicy.refundDeadline)}
                    </p>
                  )}
                </div>
              )}

              {/* 24-hour free cancellation notice */}
              {bookingData && bookingData.createdAt && (
                (() => {
                  const createdAt = new Date(bookingData.createdAt).getTime();
                  const now = Date.now();
                  const hoursSinceBooking = (now - createdAt) / (1000 * 60 * 60);
                  const hoursRemaining = 24 - hoursSinceBooking;

                  if (hoursRemaining > 0) {
                    return (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-green-800 font-semibold">Free Cancellation Available</p>
                            <p className="text-green-700 mt-1">
                              You can cancel this booking for free within {Math.floor(hoursRemaining)} hours.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 print:shadow-none print:p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.importantInfo}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3 p-4 bg-info-50 rounded-xl">
              <div className="text-2xl">✓</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Check-in</h3>
                <p className="text-sm text-gray-600">{t.checkInInfo}</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl">🧳</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t.baggage}</h3>
                <p className="text-sm text-gray-600">{t.baggageInfo}</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-green-50 rounded-xl">
              <div className="text-2xl">📋</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Travel Documents</h3>
                <p className="text-sm text-gray-600">{t.documentsInfo}</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-amber-50 rounded-xl">
              <div className="text-2xl">🕐</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Airport Arrival</h3>
                <p className="text-sm text-gray-600">{t.arrivalInfo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 print:shadow-none print:p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t.faqTitle}</h2>

          <div className="space-y-4">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-900">{t.faq1Q}</span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 px-4 text-gray-600">{t.faq1A}</p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-900">{t.faq2Q}</span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 px-4 text-gray-600">{t.faq2A}</p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-900">{t.faq3Q}</span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 px-4 text-gray-600">{t.faq3A}</p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-900">{t.faq4Q}</span>
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 px-4 text-gray-600">{t.faq4A}</p>
            </details>
          </div>
        </div>

        {/* Customer Support */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white print:bg-primary-500 print:p-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 print:text-xl">{t.needHelp}</h2>
            <p className="text-info-100">{t.contactSupport} - {t.available24x7}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <a
              href="https://wa.me/13322200838"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all print:bg-white/20"
            >
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <div className="font-semibold">{t.whatsapp}</div>
              <div className="text-sm text-info-100">+1 (332) 220-0838</div>
            </a>

            <a
              href="tel:+13322200838"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all print:bg-white/20"
            >
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
              <div className="font-semibold">{t.phone}</div>
              <div className="text-sm text-info-100">+1 (332) 220-0838</div>
            </a>

            <a
              href="mailto:support@fly2any.com"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all print:bg-white/20"
            >
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <div className="font-semibold">{t.email}</div>
              <div className="text-sm text-info-100 break-all">support@fly2any.com</div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 print:mt-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-gray-700 font-semibold">{t.bookingProtection}</span>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#" className="hover:text-gray-700">{t.termsConditions}</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700">{t.privacyPolicy}</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700">{t.cancellationPolicy}</a>
          </div>

          <p className="mt-3 text-xs">© 2025 Fly2Any Travel - Based in USA</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes check {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 100;
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-check {
          stroke-dasharray: 100;
          animation: check 0.5s ease-out 0.3s forwards;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:bg-white {
            background-color: white !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:shadow-none {
            box-shadow: none !important;
          }

          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
