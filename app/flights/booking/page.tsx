'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User,
  CreditCard,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plane,
  Clock,
  Calendar,
  MapPin,
  Shield,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';

// ===========================
// TYPE DEFINITIONS
// ===========================

type BookingStep = 'summary' | 'fares' | 'seats' | 'baggage' | 'bundles' | 'passengers' | 'payment';

type Language = 'en' | 'pt' | 'es';

interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email?: string;
  phone?: string;
}

interface SeatSelection {
  passengerId: string;
  outboundSeat?: string;
  returnSeat?: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  billingAddress: string;
  billingCity: string;
  billingZip: string;
  billingCountry: string;
}

interface FlightSegment {
  departure: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  carrierCode: string;
  number: string;
  duration: string;
}

interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

interface FlightData {
  id: string;
  price: {
    total: string;
    currency: string;
    base?: string;
    fees?: string;
  };
  itineraries: FlightItinerary[];
  validatingAirlineCodes?: string[];
}

interface BookingFormData {
  passengers: PassengerInfo[];
  seats: SeatSelection[];
  payment: PaymentInfo;
}

// ===========================
// TRANSLATIONS
// ===========================

const translations = {
  en: {
    bookingTitle: 'Complete Your Booking',
    steps: {
      summary: 'Flight Summary',
      fares: 'Choose Fare',
      seats: 'Select Seats',
      baggage: 'Add Baggage',
      bundles: 'Trip Bundles',
      passengers: 'Passenger Details',
      payment: 'Payment & Review',
    },
    stepLabels: {
      summary: 'Confirm your flight selection',
      fares: 'Choose your fare class',
      seats: 'Select your seats (optional)',
      baggage: 'Add extra baggage (optional)',
      bundles: 'Complete your trip (optional)',
      passengers: 'Enter passenger information',
      payment: 'Payment and final review',
    },
    buttons: {
      next: 'Continue',
      back: 'Back',
      confirm: 'Confirm & Pay',
      addPassenger: 'Add Passenger',
    },
    flightSummary: 'Flight Summary',
    priceBreakdown: 'Price Breakdown',
    basePrice: 'Base Price',
    taxesFees: 'Taxes & Fees',
    total: 'Total',
    passenger: 'Passenger',
    adult: 'Adult',
    child: 'Child',
    infant: 'Infant',
    requiredField: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidDate: 'Invalid date',
    passengerDetails: 'Passenger {number} Details',
    contactInfo: 'Contact Information',
    title: 'Title',
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    nationality: 'Nationality',
    passportNumber: 'Passport Number',
    passportExpiry: 'Passport Expiry',
    email: 'Email Address',
    phone: 'Phone Number',
    selectSeat: 'Select Seat',
    seatAvailable: 'Available',
    seatOccupied: 'Occupied',
    seatSelected: 'Selected',
    seatExtra: 'Extra Legroom',
    outbound: 'Outbound',
    return: 'Return',
    cardNumber: 'Card Number',
    cardName: 'Cardholder Name',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    billingAddress: 'Billing Address',
    city: 'City',
    zipCode: 'ZIP Code',
    country: 'Country',
    securePayment: 'Secure Payment',
    dataProtection: 'Your payment information is encrypted and secure',
    reviewBooking: 'Review Your Booking',
    flightDetails: 'Flight Details',
    passengerInfo: 'Passenger Information',
    paymentMethod: 'Payment Method',
    termsAccept: 'I accept the terms and conditions',
    confirmBooking: 'Confirm Booking',
    processingPayment: 'Processing your payment...',
    bookingError: 'Booking Error',
    tryAgain: 'Please try again',
    loadingFlight: 'Loading flight details...',
    noFlightFound: 'Flight not found',
    departure: 'Departure',
    arrival: 'Arrival',
    duration: 'Duration',
    stops: 'Stops',
    direct: 'Direct',
  },
  pt: {
    bookingTitle: 'Complete sua Reserva',
    steps: {
      summary: 'Resumo do Voo',
      fares: 'Escolher Tarifa',
      seats: 'Selecionar Assentos',
      baggage: 'Adicionar Bagagem',
      bundles: 'Pacotes de Viagem',
      passengers: 'Detalhes dos Passageiros',
      payment: 'Pagamento e Revisão',
    },
    stepLabels: {
      summary: 'Confirme sua seleção de voo',
      fares: 'Escolha sua classe tarifária',
      seats: 'Selecione seus assentos (opcional)',
      baggage: 'Adicione bagagem extra (opcional)',
      bundles: 'Complete sua viagem (opcional)',
      passengers: 'Insira as informações dos passageiros',
      payment: 'Pagamento e revisão final',
    },
    buttons: {
      next: 'Continuar',
      back: 'Voltar',
      confirm: 'Confirmar e Pagar',
      addPassenger: 'Adicionar Passageiro',
    },
    flightSummary: 'Resumo do Voo',
    priceBreakdown: 'Detalhamento de Preços',
    basePrice: 'Preço Base',
    taxesFees: 'Taxas e Impostos',
    total: 'Total',
    passenger: 'Passageiro',
    adult: 'Adulto',
    child: 'Criança',
    infant: 'Bebê',
    requiredField: 'Este campo é obrigatório',
    invalidEmail: 'Email inválido',
    invalidDate: 'Data inválida',
    passengerDetails: 'Detalhes do Passageiro {number}',
    contactInfo: 'Informações de Contato',
    title: 'Título',
    firstName: 'Primeiro Nome',
    lastName: 'Sobrenome',
    dateOfBirth: 'Data de Nascimento',
    nationality: 'Nacionalidade',
    passportNumber: 'Número do Passaporte',
    passportExpiry: 'Validade do Passaporte',
    email: 'Email',
    phone: 'Telefone',
    selectSeat: 'Selecionar Assento',
    seatAvailable: 'Disponível',
    seatOccupied: 'Ocupado',
    seatSelected: 'Selecionado',
    seatExtra: 'Espaço Extra',
    outbound: 'Ida',
    return: 'Volta',
    cardNumber: 'Número do Cartão',
    cardName: 'Nome no Cartão',
    expiryDate: 'Data de Validade',
    cvv: 'CVV',
    billingAddress: 'Endereço de Cobrança',
    city: 'Cidade',
    zipCode: 'CEP',
    country: 'País',
    securePayment: 'Pagamento Seguro',
    dataProtection: 'Suas informações de pagamento são criptografadas e seguras',
    reviewBooking: 'Revise sua Reserva',
    flightDetails: 'Detalhes do Voo',
    passengerInfo: 'Informações dos Passageiros',
    paymentMethod: 'Método de Pagamento',
    termsAccept: 'Aceito os termos e condições',
    confirmBooking: 'Confirmar Reserva',
    processingPayment: 'Processando seu pagamento...',
    bookingError: 'Erro na Reserva',
    tryAgain: 'Por favor, tente novamente',
    loadingFlight: 'Carregando detalhes do voo...',
    noFlightFound: 'Voo não encontrado',
    departure: 'Partida',
    arrival: 'Chegada',
    duration: 'Duração',
    stops: 'Paradas',
    direct: 'Direto',
  },
  es: {
    bookingTitle: 'Complete su Reserva',
    steps: {
      summary: 'Resumen del Vuelo',
      fares: 'Elegir Tarifa',
      seats: 'Seleccionar Asientos',
      baggage: 'Agregar Equipaje',
      bundles: 'Paquetes de Viaje',
      passengers: 'Detalles de Pasajeros',
      payment: 'Pago y Revisión',
    },
    stepLabels: {
      summary: 'Confirme su selección de vuelo',
      fares: 'Elija su clase tarifaria',
      seats: 'Seleccione sus asientos (opcional)',
      baggage: 'Agregue equipaje extra (opcional)',
      bundles: 'Complete su viaje (opcional)',
      passengers: 'Ingrese la información de los pasajeros',
      payment: 'Pago y revisión final',
    },
    buttons: {
      next: 'Continuar',
      back: 'Atrás',
      confirm: 'Confirmar y Pagar',
      addPassenger: 'Agregar Pasajero',
    },
    flightSummary: 'Resumen del Vuelo',
    priceBreakdown: 'Desglose de Precios',
    basePrice: 'Precio Base',
    taxesFees: 'Impuestos y Tasas',
    total: 'Total',
    passenger: 'Pasajero',
    adult: 'Adulto',
    child: 'Niño',
    infant: 'Bebé',
    requiredField: 'Este campo es obligatorio',
    invalidEmail: 'Email inválido',
    invalidDate: 'Fecha inválida',
    passengerDetails: 'Detalles del Pasajero {number}',
    contactInfo: 'Información de Contacto',
    title: 'Título',
    firstName: 'Nombre',
    lastName: 'Apellido',
    dateOfBirth: 'Fecha de Nacimiento',
    nationality: 'Nacionalidad',
    passportNumber: 'Número de Pasaporte',
    passportExpiry: 'Vencimiento del Pasaporte',
    email: 'Email',
    phone: 'Teléfono',
    selectSeat: 'Seleccionar Asiento',
    seatAvailable: 'Disponible',
    seatOccupied: 'Ocupado',
    seatSelected: 'Seleccionado',
    seatExtra: 'Espacio Extra',
    outbound: 'Ida',
    return: 'Vuelta',
    cardNumber: 'Número de Tarjeta',
    cardName: 'Nombre en la Tarjeta',
    expiryDate: 'Fecha de Vencimiento',
    cvv: 'CVV',
    billingAddress: 'Dirección de Facturación',
    city: 'Ciudad',
    zipCode: 'Código Postal',
    country: 'País',
    securePayment: 'Pago Seguro',
    dataProtection: 'Su información de pago está encriptada y segura',
    reviewBooking: 'Revise su Reserva',
    flightDetails: 'Detalles del Vuelo',
    passengerInfo: 'Información de Pasajeros',
    paymentMethod: 'Método de Pago',
    termsAccept: 'Acepto los términos y condiciones',
    confirmBooking: 'Confirmar Reserva',
    processingPayment: 'Procesando su pago...',
    bookingError: 'Error en la Reserva',
    tryAgain: 'Por favor, inténtelo de nuevo',
    loadingFlight: 'Cargando detalles del vuelo...',
    noFlightFound: 'Vuelo no encontrado',
    departure: 'Salida',
    arrival: 'Llegada',
    duration: 'Duración',
    stops: 'Paradas',
    direct: 'Directo',
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours}${minutes}`.trim();
};

// ===========================
// STEP PROGRESS INDICATOR
// ===========================

interface StepIndicatorProps {
  currentStep: BookingStep;
  onStepClick?: (step: BookingStep) => void;
  lang: Language;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick, lang }) => {
  const t = translations[lang];

  const steps: { key: BookingStep; icon: typeof User; label: string }[] = [
    { key: 'summary', icon: Plane, label: t.steps.summary },
    { key: 'fares', icon: CheckCircle, label: t.steps.fares },
    { key: 'seats', icon: MapPin, label: t.steps.seats },
    { key: 'baggage', icon: Shield, label: t.steps.baggage },
    { key: 'bundles', icon: Calendar, label: t.steps.bundles },
    { key: 'passengers', icon: User, label: t.steps.passengers },
    { key: 'payment', icon: CreditCard, label: t.steps.payment },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);
  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10" />

        {/* Progress Bar Fill */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 -z-10"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = index < currentIndex && onStepClick;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              <button
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 mb-2
                  ${isCompleted ? 'bg-primary-600 text-white shadow-primary' : ''}
                  ${isCurrent ? 'bg-primary-600 text-white shadow-primary ring-4 ring-primary-200 scale-110' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-400' : ''}
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </button>

              <div className="text-center">
                <div className={`
                  text-xs font-semibold hidden sm:block
                  ${isCurrent ? 'text-primary-600' : ''}
                  ${isCompleted ? 'text-gray-700' : ''}
                  ${!isCompleted && !isCurrent ? 'text-gray-400' : ''}
                `}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 hidden md:block">
                  {index + 1}/{steps.length}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===========================
// FLIGHT SUMMARY SIDEBAR
// ===========================

interface FlightSummarySidebarProps {
  flight: FlightData;
  lang: Language;
}

const FlightSummarySidebar: React.FC<FlightSummarySidebarProps> = ({ flight, lang }) => {
  const t = translations[lang];

  const outbound = flight.itineraries[0];
  const inbound = flight.itineraries[1];
  const basePrice = flight.price.base ? parseFloat(flight.price.base) : parseFloat(flight.price.total) * 0.85;
  const fees = flight.price.fees ? parseFloat(flight.price.fees) : parseFloat(flight.price.total) * 0.15;

  const renderItinerary = (itinerary: FlightItinerary, label: string) => {
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const stops = itinerary.segments.length - 1;

    return (
      <div className="mb-6 pb-6 border-b border-gray-200 last:border-0">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-4 h-4 text-primary-600" />
          <span className="font-semibold text-gray-900">{label}</span>
        </div>

        {/* Route */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(firstSegment.departure.at)}
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {firstSegment.departure.iataCode}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(firstSegment.departure.at)}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500 mb-1">
              {formatDuration(itinerary.duration)}
            </div>
            <div className="w-full h-0.5 bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300 relative">
              <Plane className="w-3 h-3 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stops === 0 ? t.direct : `${stops} ${t.stops}`}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(lastSegment.arrival.at)}
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {lastSegment.arrival.iataCode}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(lastSegment.arrival.at)}
            </div>
          </div>
        </div>

        {/* Carrier */}
        <div className="text-xs text-gray-500">
          {firstSegment.carrierCode} {firstSegment.number}
          {itinerary.segments.length > 1 && ` +${stops} more`}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white">
        <h3 className="text-lg font-bold mb-1">{t.flightSummary}</h3>
        <p className="text-sm text-primary-100">
          {outbound.segments[0].departure.iataCode} → {outbound.segments[outbound.segments.length - 1].arrival.iataCode}
        </p>
      </div>

      {/* Flight Details */}
      <div className="p-6">
        {renderItinerary(outbound, t.outbound)}
        {inbound && renderItinerary(inbound, t.return)}
      </div>

      {/* Price Breakdown */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">{t.priceBreakdown}</h4>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t.basePrice}</span>
            <span className="font-medium text-gray-900">
              {flight.price.currency} {basePrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t.taxesFees}</span>
            <span className="font-medium text-gray-900">
              {flight.price.currency} {fees.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">{t.total}</span>
            <span className="text-2xl font-bold text-primary-600">
              {flight.price.currency === 'USD' ? '$' : flight.price.currency} {parseFloat(flight.price.total).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="p-4 bg-gradient-to-r from-success/10 to-info/10 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <Shield className="w-4 h-4 text-success" />
          <span className="font-medium">{t.securePayment}</span>
        </div>
      </div>
    </div>
  );
};

// ===========================
// FLIGHT SUMMARY STEP
// ===========================

interface FlightSummaryStepProps {
  flight: FlightData;
  lang: Language;
}

const FlightSummaryStep: React.FC<FlightSummaryStepProps> = ({ flight, lang }) => {
  const t = translations[lang];

  const outbound = flight.itineraries[0];
  const inbound = flight.itineraries[1];

  const renderItinerary = (itinerary: FlightItinerary, label: string, idx: number) => {
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const stops = itinerary.segments.length - 1;

    return (
      <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">{label}</h3>
        </div>

        {/* Route Visualization */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Departure */}
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {formatTime(firstSegment.departure.at)}
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {firstSegment.departure.iataCode}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(firstSegment.departure.at)}
            </div>
            {firstSegment.departure.terminal && (
              <div className="text-xs text-gray-400 mt-1">
                Terminal {firstSegment.departure.terminal}
              </div>
            )}
          </div>

          {/* Duration & Stops */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm font-semibold text-gray-600 mb-2">
              {formatDuration(itinerary.duration)}
            </div>
            <div className="w-full h-1 bg-gradient-to-r from-primary-300 via-primary-500 to-primary-300 rounded-full relative">
              <Plane className="w-4 h-4 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {stops === 0 ? t.direct : `${stops} ${stops === 1 ? 'stop' : 'stops'}`}
            </div>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {formatTime(lastSegment.arrival.at)}
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {lastSegment.arrival.iataCode}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(lastSegment.arrival.at)}
            </div>
            {lastSegment.arrival.terminal && (
              <div className="text-xs text-gray-400 mt-1">
                Terminal {lastSegment.arrival.terminal}
              </div>
            )}
          </div>
        </div>

        {/* Flight Details */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Airline</div>
              <div className="font-semibold text-gray-900">
                {firstSegment.carrierCode} {firstSegment.number}
              </div>
            </div>
            {itinerary.segments.length > 1 && (
              <div>
                <div className="text-gray-500 mb-1">Additional Segments</div>
                <div className="font-semibold text-gray-900">
                  {itinerary.segments.length - 1} connection{itinerary.segments.length > 2 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">✈️ Confirm Your Flight Selection</h2>
        <p className="text-primary-100">
          Review your flight details before customizing your booking
        </p>
      </div>

      {/* Outbound Flight */}
      {renderItinerary(outbound, t.outbound, 0)}

      {/* Return Flight */}
      {inbound && renderItinerary(inbound, t.return, 1)}

      {/* Price Summary */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Current Fare</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Economy Class</div>
            <div className="text-xs text-gray-500 mt-1">
              Base fare • Includes standard baggage
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">
              {flight.price.currency === 'USD' ? '$' : flight.price.currency} {parseFloat(flight.price.total).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">per person</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-info/10 border border-info/30 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">What's Next?</p>
          <p className="text-gray-600">
            In the following steps, you'll be able to upgrade your fare class, select seats, add baggage,
            and customize your trip with hotels and car rentals.
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================
// BRANDED FARES STEP (Placeholder)
// ===========================

interface BrandedFaresStepProps {
  lang: Language;
}

const BrandedFaresStep: React.FC<BrandedFaresStepProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🎫 Choose Your Fare Class</h2>
        <p className="text-primary-100">
          Upgrade to get more flexibility and benefits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Basic Economy */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Basic Economy</h3>
          <div className="text-3xl font-bold text-gray-900 mb-4">Included</div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-red-600">✗</span> Carry-on bag
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-600">✗</span> Seat selection
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-600">✗</span> Changes allowed
            </li>
          </ul>
          <button className="w-full py-3 bg-gray-200 text-gray-600 rounded-lg font-semibold">
            Current Selection
          </button>
        </div>

        {/* Standard */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-primary-500 p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMMENDED
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Standard</h3>
          <div className="text-3xl font-bold text-primary-600 mb-4">+$80</div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> 1 carry-on bag
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Seat selection
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Changes ($75 fee)
            </li>
          </ul>
          <button className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Upgrade to Standard
          </button>
        </div>

        {/* Premium */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Premium</h3>
          <div className="text-3xl font-bold text-gray-900 mb-4">+$200</div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> 2 carry-on bags
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Priority seat selection
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Free changes
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Extra legroom
            </li>
          </ul>
          <button className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg font-semibold hover:from-gray-800 hover:to-gray-700 transition-colors">
            Upgrade to Premium
          </button>
        </div>
      </div>

      <div className="bg-info/10 border border-info/30 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">💡 Smart Tip</p>
          <p className="text-gray-600">
            Standard fare is most popular - includes carry-on bag and seat selection for just $80 more!
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================
// BAGGAGE SELECTION STEP (Placeholder)
// ===========================

interface BaggageSelectionStepProps {
  lang: Language;
}

const BaggageSelectionStep: React.FC<BaggageSelectionStepProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">💼 Add Extra Baggage</h2>
        <p className="text-primary-100">
          Save time at the airport by adding baggage now
        </p>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Included with your fare</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎒</span>
              <div>
                <div className="font-semibold text-gray-900">Personal item</div>
                <div className="text-sm text-gray-500">Fits under seat (40x30x15 cm)</div>
              </div>
            </div>
            <span className="text-green-600 font-semibold">✓ Included</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">Add extra baggage</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border border-gray-200 rounded-lg px-4 hover:border-primary-500 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧳</span>
              <div>
                <div className="font-semibold text-gray-900">Checked bag (23kg)</div>
                <div className="text-sm text-gray-500">Standard checked baggage</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-900">$35</span>
              <select className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border border-gray-200 rounded-lg px-4 hover:border-primary-500 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛷️</span>
              <div>
                <div className="font-semibold text-gray-900">Oversized item</div>
                <div className="text-sm text-gray-500">Sports equipment, musical instruments</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-900">$60</span>
              <select className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none">
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-200 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total baggage fees:</span>
          <span className="text-2xl font-bold text-primary-600">$0</span>
        </div>
      </div>

      <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">💰 Save Money</p>
          <p className="text-gray-600">
            Add baggage now for $35 vs $60 at the airport. You can skip this step if you don't need extra bags.
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================
// TRIP BUNDLES STEP (Placeholder)
// ===========================

interface TripBundlesStepProps {
  lang: Language;
}

const TripBundlesStep: React.FC<TripBundlesStepProps> = ({ lang }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🎁 Complete Your Trip</h2>
        <p className="text-primary-100">
          Save up to $150 by bundling hotel + car rental
        </p>
      </div>

      {/* Hotels */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          🏨 Hotels in Los Angeles
          <span className="text-sm font-normal text-primary-600 bg-primary-100 px-2 py-1 rounded">Save $50</span>
        </h3>

        <div className="space-y-3">
          <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-900">Downtown LA Hotel</h4>
              <div className="text-right">
                <div className="text-xl font-bold text-primary-600">$89/night</div>
                <div className="text-xs text-gray-500">Usually $119</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <span className="text-yellow-500">⭐⭐⭐⭐</span>
              <span>(4.5/5)</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Modern hotel in the heart of downtown • Pool • Free WiFi
            </p>
            <button className="w-full py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Add to Booking
            </button>
          </div>
        </div>
      </div>

      {/* Car Rentals */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          🚗 Car Rentals
          <span className="text-sm font-normal text-primary-600 bg-primary-100 px-2 py-1 rounded">Save $30</span>
        </h3>

        <div className="space-y-3">
          <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-900">Economy Car</h4>
              <div className="text-right">
                <div className="text-xl font-bold text-primary-600">$25/day</div>
                <div className="text-xs text-gray-500">Usually $35</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Toyota Yaris or similar • Automatic • AC • Unlimited mileage
            </p>
            <button className="w-full py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Add to Booking
            </button>
          </div>
        </div>
      </div>

      <div className="bg-info/10 border border-info/30 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">✨ This step is optional</p>
          <p className="text-gray-600">
            You can skip this and continue to passenger details, or save money by bundling now.
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================
// PASSENGER DETAILS STEP
// ===========================

interface PassengerDetailsStepProps {
  passengers: PassengerInfo[];
  onUpdate: (passengers: PassengerInfo[]) => void;
  lang: Language;
}

const PassengerDetailsStep: React.FC<PassengerDetailsStepProps> = ({ passengers, onUpdate, lang }) => {
  const t = translations[lang];

  const handleChange = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {passengers.map((passenger, index) => (
        <div key={passenger.id} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            {t.passengerDetails.replace('{number}', (index + 1).toString())} - {t[passenger.type]}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.title} <span className="text-error">*</span>
              </label>
              <select
                value={passenger.title}
                onChange={(e) => handleChange(index, 'title', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.firstName} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={passenger.firstName}
                onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.lastName} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={passenger.lastName}
                onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.dateOfBirth} <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={passenger.dateOfBirth}
                onChange={(e) => handleChange(index, 'dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              />
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.nationality} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={passenger.nationality}
                onChange={(e) => handleChange(index, 'nationality', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                placeholder="e.g., US, BR, ES"
                required
              />
            </div>

            {/* Passport Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.passportNumber} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={passenger.passportNumber}
                onChange={(e) => handleChange(index, 'passportNumber', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              />
            </div>

            {/* Passport Expiry */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.passportExpiry} <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={passenger.passportExpiry}
                onChange={(e) => handleChange(index, 'passportExpiry', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              />
            </div>

            {/* Contact Info (only for first passenger) */}
            {index === 0 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.email} <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={passenger.email || ''}
                    onChange={(e) => handleChange(index, 'email', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.phone} <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={passenger.phone || ''}
                    onChange={(e) => handleChange(index, 'phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                    placeholder="+1 234 567 8900"
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Info Box */}
      <div className="bg-info/10 border border-info/30 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">{t.contactInfo}</p>
          <p className="text-gray-600">
            Please ensure all passenger names match exactly as shown on passport or government-issued ID.
          </p>
        </div>
      </div>
    </div>
  );
};

// ===========================
// SEAT SELECTION STEP
// ===========================

interface SeatSelectionStepProps {
  passengers: PassengerInfo[];
  seats: SeatSelection[];
  onUpdate: (seats: SeatSelection[]) => void;
  hasReturnFlight: boolean;
  lang: Language;
}

const SeatSelectionStep: React.FC<SeatSelectionStepProps> = ({
  passengers,
  seats,
  onUpdate,
  hasReturnFlight,
  lang
}) => {
  const t = translations[lang];

  // Generate mock seat map (6 rows x 6 seats: A-F)
  const generateSeatMap = () => {
    const rows = 10;
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    const occupied = ['2A', '2B', '3C', '5D', '7E', '8F']; // Mock occupied seats
    const extraLegroom = ['1A', '1B', '1C', '1D', '1E', '1F']; // Mock extra legroom seats

    return { rows, columns, occupied, extraLegroom };
  };

  const seatMap = generateSeatMap();

  const isSeatOccupied = (seat: string) => seatMap.occupied.includes(seat);
  const isSeatSelected = (seat: string, isOutbound: boolean) => {
    return seats.some(s =>
      isOutbound ? s.outboundSeat === seat : s.returnSeat === seat
    );
  };
  const isExtraLegroom = (seat: string) => seatMap.extraLegroom.includes(seat);

  const handleSeatSelect = (passengerId: string, seat: string, isOutbound: boolean) => {
    const updated = seats.map(s => {
      if (s.passengerId === passengerId) {
        return {
          ...s,
          [isOutbound ? 'outboundSeat' : 'returnSeat']: seat
        };
      }
      return s;
    });
    onUpdate(updated);
  };

  const renderSeatMap = (passengerId: string, passengerName: string, isOutbound: boolean) => {
    const currentSeat = seats.find(s => s.passengerId === passengerId);
    const selectedSeat = isOutbound ? currentSeat?.outboundSeat : currentSeat?.returnSeat;

    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          {passengerName} - {isOutbound ? t.outbound : t.return}
          {selectedSeat && (
            <span className="ml-auto text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
              {t.seatSelected}: {selectedSeat}
            </span>
          )}
        </h4>

        {/* Seat Map */}
        <div className="bg-gray-50 rounded-xl p-6">
          {/* Seat Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded border border-gray-300"></div>
              <span className="text-gray-600">{t.seatAvailable}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded border border-gray-500"></div>
              <span className="text-gray-600">{t.seatOccupied}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded border border-primary-700"></div>
              <span className="text-gray-600">{t.seatSelected}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-success/20 rounded border-2 border-success"></div>
              <span className="text-gray-600">{t.seatExtra}</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="space-y-2">
            {Array.from({ length: seatMap.rows }, (_, rowIndex) => {
              const rowNumber = rowIndex + 1;
              return (
                <div key={rowNumber} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 w-6">{rowNumber}</span>

                  <div className="flex gap-1">
                    {seatMap.columns.slice(0, 3).map(col => {
                      const seatId = `${rowNumber}${col}`;
                      const occupied = isSeatOccupied(seatId);
                      const selected = isSeatSelected(seatId, isOutbound);
                      const extra = isExtraLegroom(seatId);

                      return (
                        <button
                          key={seatId}
                          onClick={() => !occupied && handleSeatSelect(passengerId, seatId, isOutbound)}
                          disabled={occupied}
                          className={`
                            w-8 h-8 rounded text-xs font-semibold transition-all
                            ${occupied ? 'bg-gray-400 text-gray-200 cursor-not-allowed border border-gray-500' : ''}
                            ${selected ? 'bg-primary-600 text-white border border-primary-700 shadow-primary' : ''}
                            ${!occupied && !selected && extra ? 'bg-success/20 text-success hover:bg-success/30 border-2 border-success' : ''}
                            ${!occupied && !selected && !extra ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300' : ''}
                          `}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>

                  {/* Aisle */}
                  <div className="w-6"></div>

                  <div className="flex gap-1">
                    {seatMap.columns.slice(3, 6).map(col => {
                      const seatId = `${rowNumber}${col}`;
                      const occupied = isSeatOccupied(seatId);
                      const selected = isSeatSelected(seatId, isOutbound);
                      const extra = isExtraLegroom(seatId);

                      return (
                        <button
                          key={seatId}
                          onClick={() => !occupied && handleSeatSelect(passengerId, seatId, isOutbound)}
                          disabled={occupied}
                          className={`
                            w-8 h-8 rounded text-xs font-semibold transition-all
                            ${occupied ? 'bg-gray-400 text-gray-200 cursor-not-allowed border border-gray-500' : ''}
                            ${selected ? 'bg-primary-600 text-white border border-primary-700 shadow-primary' : ''}
                            ${!occupied && !selected && extra ? 'bg-success/20 text-success hover:bg-success/30 border-2 border-success' : ''}
                            ${!occupied && !selected && !extra ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300' : ''}
                          `}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {passengers.map(passenger => {
        const passengerName = `${passenger.firstName} ${passenger.lastName}`;
        return (
          <div key={passenger.id}>
            {renderSeatMap(passenger.id, passengerName, true)}
            {hasReturnFlight && renderSeatMap(passenger.id, passengerName, false)}
          </div>
        );
      })}
    </div>
  );
};

// ===========================
// PAYMENT STEP
// ===========================

interface PaymentStepProps {
  payment: PaymentInfo;
  onUpdate: (payment: PaymentInfo) => void;
  lang: Language;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ payment, onUpdate, lang }) => {
  const t = translations[lang];

  const handleChange = (field: keyof PaymentInfo, value: string) => {
    onUpdate({ ...payment, [field]: value });
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t.securePayment}</h3>
          <p className="text-sm text-gray-600">{t.dataProtection}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.cardNumber} <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={payment.cardNumber}
            onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
          />
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.cardName} <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={payment.cardName}
            onChange={(e) => handleChange('cardName', e.target.value.toUpperCase())}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
            placeholder="JOHN DOE"
            required
          />
        </div>

        {/* Expiry & CVV */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.expiryDate} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={payment.expiryMonth}
              onChange={(e) => handleChange('expiryMonth', e.target.value.replace(/\D/g, '').substring(0, 2))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
              placeholder="MM"
              maxLength={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              &nbsp;
            </label>
            <input
              type="text"
              value={payment.expiryYear}
              onChange={(e) => handleChange('expiryYear', e.target.value.replace(/\D/g, '').substring(0, 2))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
              placeholder="YY"
              maxLength={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.cvv} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={payment.cvv}
              onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>

        {/* Billing Address */}
        <div className="pt-6 border-t-2 border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Billing Address</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.billingAddress} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={payment.billingAddress}
                onChange={(e) => handleChange('billingAddress', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.city} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={payment.billingCity}
                  onChange={(e) => handleChange('billingCity', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.zipCode} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={payment.billingZip}
                  onChange={(e) => handleChange('billingZip', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.country} <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={payment.billingCountry}
                onChange={(e) => handleChange('billingCountry', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Icons */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-4 text-gray-400">
        <Shield className="w-8 h-8" />
        <div className="text-xs text-center">
          <div className="font-semibold text-gray-700">256-bit SSL Encryption</div>
          <div>Your data is secure</div>
        </div>
      </div>
    </div>
  );
};

// ===========================
// REVIEW STEP
// ===========================

interface ReviewStepProps {
  flight: FlightData;
  passengers: PassengerInfo[];
  seats: SeatSelection[];
  payment: PaymentInfo;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  lang: Language;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  flight,
  passengers,
  seats,
  payment,
  termsAccepted,
  onTermsChange,
  lang
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      {/* Flight Details */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary-600" />
          {t.flightDetails}
        </h3>
        <div className="space-y-3 text-sm">
          {flight.itineraries.map((itinerary, idx) => {
            const firstSeg = itinerary.segments[0];
            const lastSeg = itinerary.segments[itinerary.segments.length - 1];
            return (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-semibold text-gray-900">
                    {idx === 0 ? t.outbound : t.return}
                  </div>
                  <div className="text-gray-600">
                    {firstSeg.departure.iataCode} → {lastSeg.arrival.iataCode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatTime(firstSeg.departure.at)} - {formatTime(lastSeg.arrival.at)}
                  </div>
                  <div className="text-gray-600">
                    {formatDate(firstSeg.departure.at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passengers */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          {t.passengerInfo}
        </h3>
        <div className="space-y-3">
          {passengers.map((passenger, idx) => {
            const seatInfo = seats.find(s => s.passengerId === passenger.id);
            return (
              <div key={passenger.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-semibold text-gray-900">
                    {passenger.title} {passenger.firstName} {passenger.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t[passenger.type]} • {passenger.passportNumber}
                  </div>
                </div>
                <div className="text-right text-sm">
                  {seatInfo?.outboundSeat && (
                    <div className="text-gray-700">
                      {t.outbound}: <span className="font-semibold">{seatInfo.outboundSeat}</span>
                    </div>
                  )}
                  {seatInfo?.returnSeat && (
                    <div className="text-gray-700">
                      {t.return}: <span className="font-semibold">{seatInfo.returnSeat}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-600" />
          {t.paymentMethod}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900">
              •••• •••• •••• {payment.cardNumber.slice(-4)}
            </div>
            <div className="text-sm text-gray-600">
              {payment.cardName}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Expires {payment.expiryMonth}/{payment.expiryYear}
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-200"
            required
          />
          <div className="text-sm">
            <span className="font-semibold text-gray-900">{t.termsAccept}</span>
            <p className="text-gray-600 mt-1">
              By checking this box, you agree to our Terms of Service, Privacy Policy, and fare rules.
              You acknowledge that the information provided is accurate and complete.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

// ===========================
// MAIN BOOKING PAGE CONTENT
// ===========================

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [lang] = useState<Language>('en');
  const [currentStep, setCurrentStep] = useState<BookingStep>('summary');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flight, setFlight] = useState<FlightData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const t = translations[lang];

  // Extract flight ID from URL
  const flightId = searchParams.get('flightId');
  const stepParam = searchParams.get('step') as BookingStep | null;

  // Initialize form data
  const [formData, setFormData] = useState<BookingFormData>({
    passengers: [],
    seats: [],
    payment: {
      cardNumber: '',
      cardName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      billingAddress: '',
      billingCity: '',
      billingZip: '',
      billingCountry: '',
    },
  });

  // Load flight data and saved progress
  useEffect(() => {
    const loadData = async () => {
      if (!flightId) {
        setError('Flight ID is missing');
        setLoading(false);
        return;
      }

      try {
        // Load from localStorage first (for booking progress)
        const savedData = localStorage.getItem(`booking_${flightId}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFormData(parsed.formData || formData);
          setCurrentStep(parsed.currentStep || 'passengers');
        }

        // Try to fetch flight data from sessionStorage first (primary source from results page)
        let flightData = sessionStorage.getItem(`flight_${flightId}`);

        // Fallback to localStorage if sessionStorage is empty
        if (!flightData) {
          flightData = localStorage.getItem(`flight_${flightId}`);
        }

        if (flightData) {
          const parsedFlight = JSON.parse(flightData);
          setFlight(parsedFlight);

          // Also save to localStorage for persistence
          localStorage.setItem(`flight_${flightId}`, flightData);
        } else {
          // If still no flight data, try to fetch from API
          // In production, this would be an actual API call
          console.warn('Flight data not found in storage, using mock data');

          // Mock flight data if not found
          setFlight({
            id: flightId,
            price: {
              total: '850.00',
              currency: 'USD',
              base: '722.50',
              fees: '127.50',
            },
            itineraries: [
              {
                duration: 'PT8H30M',
                segments: [
                  {
                    departure: { iataCode: 'JFK', at: '2025-03-15T14:30:00' },
                    arrival: { iataCode: 'LAX', at: '2025-03-15T17:45:00' },
                    carrierCode: 'AA',
                    number: '123',
                    duration: 'PT5H15M',
                  },
                ],
              },
            ],
          });
        }

        // Initialize passengers based on search params
        const adults = parseInt(searchParams.get('adults') || '1');
        const children = parseInt(searchParams.get('children') || '0');
        const infants = parseInt(searchParams.get('infants') || '0');

        if (formData.passengers.length === 0) {
          const passengers: PassengerInfo[] = [];

          for (let i = 0; i < adults; i++) {
            passengers.push({
              id: `adult-${i}`,
              type: 'adult',
              title: 'Mr',
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              nationality: '',
              passportNumber: '',
              passportExpiry: '',
              email: i === 0 ? '' : undefined,
              phone: i === 0 ? '' : undefined,
            });
          }

          for (let i = 0; i < children; i++) {
            passengers.push({
              id: `child-${i}`,
              type: 'child',
              title: 'Miss',
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              nationality: '',
              passportNumber: '',
              passportExpiry: '',
            });
          }

          for (let i = 0; i < infants; i++) {
            passengers.push({
              id: `infant-${i}`,
              type: 'infant',
              title: 'Miss',
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              nationality: '',
              passportNumber: '',
              passportExpiry: '',
            });
          }

          const seats: SeatSelection[] = passengers.map(p => ({
            passengerId: p.id,
            outboundSeat: undefined,
            returnSeat: undefined,
          }));

          setFormData(prev => ({ ...prev, passengers, seats }));
        }
      } catch (err) {
        console.error('Error loading booking data:', err);
        setError('Failed to load booking information');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [flightId]);

  // Sync step with URL
  useEffect(() => {
    if (stepParam && ['summary', 'fares', 'seats', 'baggage', 'bundles', 'passengers', 'payment'].includes(stepParam)) {
      setCurrentStep(stepParam);
    }
  }, [stepParam]);

  // Save progress to localStorage
  useEffect(() => {
    if (flightId && formData.passengers.length > 0) {
      localStorage.setItem(`booking_${flightId}`, JSON.stringify({
        formData,
        currentStep,
        timestamp: Date.now(),
      }));
    }
  }, [formData, currentStep, flightId]);

  // Update URL when step changes
  const changeStep = (step: BookingStep) => {
    setCurrentStep(step);
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', step);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Validation
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'summary':
        // Always valid - just reviewing flight
        return true;
      case 'fares':
        // Optional step - always valid
        return true;
      case 'seats':
        // Optional step - always valid
        return true;
      case 'baggage':
        // Optional step - always valid
        return true;
      case 'bundles':
        // Optional step - always valid
        return true;
      case 'passengers':
        return formData.passengers.every(p =>
          p.firstName && p.lastName && p.dateOfBirth &&
          p.nationality && p.passportNumber && p.passportExpiry &&
          (p.type !== 'adult' || (p.email && p.phone))
        );
      case 'payment':
        // Combined payment + review step
        return Boolean(
          formData.payment.cardNumber &&
          formData.payment.cardName &&
          formData.payment.expiryMonth &&
          formData.payment.expiryYear &&
          formData.payment.cvv &&
          formData.payment.billingAddress &&
          formData.payment.billingCity &&
          formData.payment.billingZip &&
          formData.payment.billingCountry &&
          termsAccepted
        );
      default:
        return false;
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (!validateCurrentStep()) {
      alert(t.requiredField);
      return;
    }

    const steps: BookingStep[] = ['summary', 'fares', 'seats', 'baggage', 'bundles', 'passengers', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      changeStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: BookingStep[] = ['summary', 'fares', 'seats', 'baggage', 'bundles', 'passengers', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      changeStep(steps[currentIndex - 1]);
    }
  };

  const handleConfirm = async () => {
    if (!validateCurrentStep()) {
      alert(t.requiredField);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get search context for contact info
      const searchContext = sessionStorage.getItem(`flight_search_${flightId}`);
      const searchData = searchContext ? JSON.parse(searchContext) : {};

      // Transform passenger data to match API format
      const passengers = formData.passengers.map((passenger: any) => ({
        title: passenger.title,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        dateOfBirth: passenger.dateOfBirth,
        gender: passenger.type === 'adult' ? 'male' : 'female', // Default, should be from form
        nationality: passenger.nationality,
        passportNumber: passenger.passportNumber,
        passportIssueDate: passenger.passportExpiry, // Need to add this field to form
        passportExpiryDate: passenger.passportExpiry,
        email: passenger.email,
        phone: passenger.phone,
      }));

      // Get contact info from first passenger
      const contactInfo = {
        email: formData.passengers[0]?.email || '',
        phone: formData.passengers[0]?.phone || '',
      };

      console.log('📝 Submitting booking...');
      console.log(`   Flight ID: ${flightId}`);
      console.log(`   Passengers: ${passengers.length}`);
      console.log(`   Total: ${flight?.price?.total} ${flight?.price?.currency}`);

      // Call Flight Create Orders API
      const response = await fetch('/api/flights/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flightOffer: flight,
          passengers,
          payment: formData.payment,
          contactInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types
        if (data.error === 'PRICE_CHANGED') {
          const confirmUpdate = window.confirm(
            `${data.message}\n\nOriginal: ${data.originalPrice} ${flight?.price?.currency}\nNew: ${data.currentPrice} ${flight?.price?.currency}\n\nDo you want to continue with the new price?`
          );

          if (confirmUpdate && data.newOffer) {
            // Update flight offer and retry
            setFlight(data.newOffer);
            setSubmitting(false);
            return;
          }
        }

        if (data.error === 'SOLD_OUT') {
          alert(data.message + '\n\nYou will be redirected to search for alternative flights.');
          router.push('/flights');
          return;
        }

        if (data.error === 'INVALID_DATA') {
          alert(data.message + '\n\nPlease check your passenger information.');
          setCurrentStep('passengers');
          setSubmitting(false);
          return;
        }

        if (data.error === 'PAYMENT_FAILED') {
          alert(data.message);
          setCurrentStep('payment');
          setSubmitting(false);
          return;
        }

        throw new Error(data.message || data.error || 'Failed to confirm booking');
      }

      // Success!
      console.log('✅ Booking created successfully!');
      console.log(`   Booking ID: ${data.booking?.id}`);
      console.log(`   PNR: ${data.booking?.pnr}`);

      // Save booking data for confirmation page
      sessionStorage.setItem('booking_confirmation', JSON.stringify(data.booking));

      // Clear saved progress
      if (flightId) {
        localStorage.removeItem(`booking_${flightId}`);
        sessionStorage.removeItem(`flight_${flightId}`);
      }

      // Show success message
      if (data.booking?.isMockBooking) {
        alert('Mock booking created for testing!\n\nPNR: ' + data.booking.pnr + '\n\nNote: This is a test booking. No real reservation was made.');
      }

      // Redirect to confirmation page
      router.push(`/flights/booking/confirmation?bookingId=${data.booking.id}&pnr=${data.booking.pnr}`);
    } catch (err: any) {
      console.error('Error confirming booking:', err);
      setError(err.message || 'Failed to confirm booking. Please try again.');
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-semibold">{t.loadingFlight}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !flight) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-error/20 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.bookingError}</h2>
          <p className="text-gray-600 mb-6">{error || t.noFlightFound}</p>
          <button
            onClick={() => router.push('/flights')}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  // Main booking form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Results
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t.bookingTitle}</h1>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          onStepClick={changeStep}
          lang={lang}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="animate-fadeIn">
              {currentStep === 'summary' && (
                <FlightSummaryStep
                  flight={flight}
                  lang={lang}
                />
              )}

              {currentStep === 'fares' && (
                <BrandedFaresStep
                  lang={lang}
                />
              )}

              {currentStep === 'seats' && (
                <SeatSelectionStep
                  passengers={formData.passengers}
                  seats={formData.seats}
                  onUpdate={(seats) => setFormData(prev => ({ ...prev, seats }))}
                  hasReturnFlight={flight.itineraries.length > 1}
                  lang={lang}
                />
              )}

              {currentStep === 'baggage' && (
                <BaggageSelectionStep
                  lang={lang}
                />
              )}

              {currentStep === 'bundles' && (
                <TripBundlesStep
                  lang={lang}
                />
              )}

              {currentStep === 'passengers' && (
                <PassengerDetailsStep
                  passengers={formData.passengers}
                  onUpdate={(passengers) => setFormData(prev => ({ ...prev, passengers }))}
                  lang={lang}
                />
              )}

              {currentStep === 'payment' && (
                <>
                  <PaymentStep
                    payment={formData.payment}
                    onUpdate={(payment) => setFormData(prev => ({ ...prev, payment }))}
                    lang={lang}
                  />
                  <div className="mt-6">
                    <ReviewStep
                      flight={flight}
                      passengers={formData.passengers}
                      seats={formData.seats}
                      payment={formData.payment}
                      termsAccepted={termsAccepted}
                      onTermsChange={setTermsAccepted}
                      lang={lang}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 'summary'}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                  ${currentStep === 'summary'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
              >
                <ChevronLeft className="w-5 h-5" />
                {t.buttons.back}
              </button>

              {currentStep !== 'payment' ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary"
                >
                  {t.buttons.next}
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={submitting || !termsAccepted}
                  className={`
                    flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg
                    ${submitting || !termsAccepted
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white hover:scale-105 hover:shadow-xl'
                    }
                  `}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.processingPayment}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {t.buttons.confirm}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Flight Summary */}
          <div className="lg:col-span-1">
            <FlightSummarySidebar flight={flight} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================
// PAGE WRAPPER WITH SUSPENSE
// ===========================

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
