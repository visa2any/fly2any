'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import CancelOrderDialog from '@/components/booking/CancelOrderDialog';
import ModifyOrderDialog from '@/components/booking/ModifyOrderDialog';
import { PostPaymentVerification } from '@/components/booking/PostPaymentVerification';

type Language = 'en' | 'pt' | 'es';

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

        // Fetch from API
        const response = await fetch(`/api/admin/bookings/${bookingId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }

        const result = await response.json();

        if (result.success && result.booking) {
          setBookingData(result.booking);
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

  // Fetch verification status
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!bookingData?.bookingReference) return;

      try {
        const response = await fetch(`/api/booking-flow/verify-documents?ref=${bookingData.bookingReference}`);
        if (response.ok) {
          const data = await response.json();
          setVerificationStatus(data.status);

          // Auto-open verification modal if documents not yet uploaded
          // and booking is recent (within last hour) and not yet verified
          if (data.status === 'NOT_STARTED' || (data.status === 'PENDING' && !data.documentsUploaded)) {
            const bookingAge = Date.now() - new Date(bookingData.createdAt).getTime();
            const isRecent = bookingAge < 60 * 60 * 1000; // 1 hour
            if (isRecent) {
              setShowVerificationModal(true);
            }
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

  const handleDownloadPDF = () => {
    // In real app, generate PDF
    alert('PDF download will be implemented');
  };

  const handleAddToCalendar = (type: 'google' | 'apple' | 'outlook') => {
    // In real app, generate calendar events
    alert(`Add to ${type} calendar will be implemented`);
    setShowCalendarMenu(false);
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
    passengers: bookingData.passengers.map((p: any, idx: number) => ({
      id: idx + 1,
      title: p.title,
      firstName: p.firstName,
      lastName: p.lastName,
      name: `${p.firstName} ${p.lastName}`,
      type: p.type,
      dateOfBirth: p.dateOfBirth,
      seat: `${idx + 20}A`,
      baggage: '1 x 23kg',
      frequentFlyer: p.frequentFlyerNumber || '',
    })),
    payment: {
      subtotal: bookingData.payment.amount,
      taxes: 0,
      insurance: 0,
      total: bookingData.payment.amount,
      method: `${bookingData.payment.cardBrand || 'Card'} ****${bookingData.payment.cardLast4}`,
      transactionId: bookingData.payment.transactionId || 'N/A',
      paidOn: bookingData.payment.paidAt || bookingData.createdAt,
      currency: bookingData.payment.currency,
    },
  } : null; // No booking data available

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 print:bg-white">
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

      {/* Header with Language Switcher */}
      <div className="bg-white border-b print:border-0 no-print">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Image
            src="/logo.png"
            alt="Fly2Any Travel"
            width={116}
            height={40}
            className="h-10 w-auto"
          />
          <div className="flex gap-2">
            {(['en', 'pt', 'es'] as Language[]).map((language) => (
              <button
                key={language}
                onClick={() => setLang(language)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  lang === language
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 print:py-4">
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
                      <h3 className="text-lg font-bold text-purple-800 mb-1">
                        Quick Verification Required
                      </h3>
                      <p className="text-purple-700 text-sm mb-4">
                        Complete a quick ID verification to secure your booking.
                        It only takes 2 minutes!
                      </p>
                      <button
                        onClick={() => setShowVerificationModal(true)}
                        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-200"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Complete Verification
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

          <button className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 text-center transition-all hover:shadow-md">
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
                  <span className="font-semibold text-gray-900">{displayBookingData.outboundFlight.airline}</span>
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

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-xs text-gray-500">{t.cabin}</span>
                    <p className="font-semibold text-gray-900">{displayBookingData.outboundFlight.cabin}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t.baggage}</span>
                    <p className="font-semibold text-gray-900">1 x 23kg</p>
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
                  <span className="font-semibold text-gray-900">{displayBookingData.returnFlight.airline}</span>
                  <span>•</span>
                  <span>{displayBookingData.returnFlight.flightNumber}</span>
                  <span>•</span>
                  <span>{displayBookingData.returnFlight.aircraft}</span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  {/* Departure */}
                  <div>
                    <div className="text-3xl font-bold text-gray-900 print:text-2xl">
                      {formatTime(displayBookingData.returnFlight.departure)}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 print:text-base">
                      {displayBookingData.returnFlight.from.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(displayBookingData.returnFlight.departure)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {displayBookingData.returnFlight.from.airport}
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

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-xs text-gray-500">{t.cabin}</span>
                    <p className="font-semibold text-gray-900">{displayBookingData.returnFlight.cabin}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">{t.baggage}</span>
                    <p className="font-semibold text-gray-900">1 x 23kg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 print:shadow-none print:p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t.passengerInfo}</h2>

              <div className="space-y-4">
                {displayBookingData.passengers.map((passenger: any, index: number) => (
                  <div key={passenger.id} className="border rounded-xl p-4 print:border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-info-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary-500">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {passenger.title}. {passenger.firstName} {passenger.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{passenger.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{t.seat}</p>
                        <p className="text-lg font-bold text-primary-500">{passenger.seat}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t.baggage}:</span>
                        <span className="ml-2 font-semibold">{passenger.baggage}</span>
                      </div>
                      {passenger.frequentFlyer && (
                        <div>
                          <span className="text-gray-500">{t.frequentFlyer}:</span>
                          <span className="ml-2 font-semibold">{passenger.frequentFlyer}</span>
                        </div>
                      )}
                    </div>
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
                <div className="flex justify-between text-gray-600">
                  <span>{t.taxes}</span>
                  <span>{formatCurrency(displayBookingData.payment.taxes)}</span>
                </div>
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
              href="https://wa.me/551151944717"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all print:bg-white/20"
            >
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <div className="font-semibold">{t.whatsapp}</div>
              <div className="text-sm text-info-100">+55 11 5194-4717</div>
            </a>

            <a
              href="tel:+13153061646"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all print:bg-white/20"
            >
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
              <div className="font-semibold">{t.phone}</div>
              <div className="text-sm text-info-100">+1 (315) 306-1646</div>
            </a>

            <a
              href="mailto:fly2any.travel@gmail.com"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all print:bg-white/20"
            >
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <div className="font-semibold">{t.email}</div>
              <div className="text-sm text-info-100 break-all">fly2any.travel@gmail.com</div>
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
