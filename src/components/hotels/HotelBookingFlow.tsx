'use client';

/**
 * Hotel Booking Flow Component
 * Complete booking process: Rate Selection → Guest Info → Payment → Confirmation
 */

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  CreditCard,
  Shield,
  Check,
  Loader2,
  AlertCircle,
  Mail,
  Phone,
  User,
  Info,
  Star
} from 'lucide-react';
import Image from 'next/image';
import type { Hotel, Rate, Guest, ContactInfo, BookingResponse, PreBookingResponse } from '@/types/hotels';

interface HotelBookingFlowProps {
  hotel: Hotel;
  selectedRate: Rate;
  searchParams: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
  };
  onBack: () => void;
  onBookingComplete: (booking: BookingResponse) => void;
}

type BookingStep = 'review' | 'guests' | 'payment' | 'confirmation';

interface BookingState {
  step: BookingStep;
  guests: Guest[];
  contact: ContactInfo;
  specialRequests: string;
  arrivalTime: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  prebooking: PreBookingResponse | null;
  booking: BookingResponse | null;
  isLoading: boolean;
  error: string | null;
}

const TITLE_OPTIONS = ['mr', 'mrs', 'ms', 'miss', 'dr'] as const;

const ARRIVAL_TIME_OPTIONS = [
  { value: '', label: 'Não informado' },
  { value: 'morning', label: 'Manhã (8:00 - 12:00)' },
  { value: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
  { value: 'evening', label: 'Noite (18:00 - 22:00)' },
  { value: 'late', label: 'Madrugada (após 22:00)' }
];

export default function HotelBookingFlow({
  hotel,
  selectedRate,
  searchParams,
  onBack,
  onBookingComplete
}: HotelBookingFlowProps) {
  const [bookingState, setBookingState] = useState<BookingState>({
    step: 'review',
    guests: Array.from({ length: searchParams.adults }, (_, index) => ({
      title: 'mr' as const,
      firstName: '',
      lastName: '',
      isMainGuest: index === 0
    })),
    contact: {
      email: '',
      phone: '',
      whatsapp: '',
      firstName: '',
      lastName: ''
    },
    specialRequests: '',
    arrivalTime: '',
    marketingConsent: false,
    termsAccepted: false,
    prebooking: null,
    booking: null,
    isLoading: false,
    error: null
  });

  const updateState = (updates: Partial<BookingState>) => {
    setBookingState(prev => ({ ...prev, ...updates }));
  };

  const updateGuest = (index: number, guestData: Partial<Guest>) => {
    const updatedGuests = [...bookingState.guests];
    updatedGuests[index] = { ...updatedGuests[index], ...guestData };
    updateState({ guests: updatedGuests });
  };

  const updateContact = (contactData: Partial<ContactInfo>) => {
    updateState({ contact: { ...bookingState.contact, ...contactData } });
  };

  const validateStep = (step: BookingStep): boolean => {
    switch (step) {
      case 'review':
        return true;
      case 'guests':
        const mainGuest = bookingState.guests.find(g => g.isMainGuest);
        return !!(
          mainGuest?.firstName &&
          mainGuest?.lastName &&
          bookingState.contact.email &&
          bookingState.contact.phone &&
          bookingState.guests.every(g => g.firstName && g.lastName)
        );
      case 'payment':
        return bookingState.termsAccepted;
      default:
        return false;
    }
  };

  const handlePreBooking = async () => {
    updateState({ isLoading: true, error: null });

    try {
      // Para hotéis demo e realistas, simular pré-reserva sem API
      if (hotel.id.startsWith('demo-') || hotel.id.startsWith('real-hotel-')) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay da API
        
        const mockPrebooking = {
          prebookId: `demo_prebook_${Date.now()}`,
          status: 'confirmed' as const,
          validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
          totalPrice: {
            amount: selectedRate.totalPrice?.amount || selectedRate.price.amount,
            currency: selectedRate.currency || 'BRL',
            formatted: selectedRate.totalPrice?.formatted || selectedRate.price.formatted
          }
        };

        updateState({ 
          prebooking: mockPrebooking,
          step: 'payment',
          isLoading: false 
        });
        return;
      }

      // Para hotéis reais, usar a API
      const response = await fetch('/api/hotels/booking/prebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rateId: selectedRate.rateId,
          hotelId: hotel.id,
          searchParams: {
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            adults: searchParams.adults,
            children: searchParams.children,
            rooms: searchParams.rooms,
            currency: selectedRate.currency
          }
        })
      });

      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Erro ao processar pré-reserva');
      }

      updateState({ 
        prebooking: result.data,
        step: 'payment',
        isLoading: false 
      });
    } catch (error) {
      console.error('Erro na pré-reserva:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao processar pré-reserva',
        isLoading: false 
      });
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingState.prebooking) return;

    updateState({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/hotels/booking/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prebookId: bookingState.prebooking.prebookId,
          guests: bookingState.guests,
          contact: bookingState.contact,
          specialRequests: bookingState.specialRequests,
          arrivalTime: bookingState.arrivalTime,
          marketingConsent: bookingState.marketingConsent,
          termsAccepted: bookingState.termsAccepted
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao confirmar reserva');
      }

      updateState({ 
        booking: result.data,
        step: 'confirmation',
        isLoading: false 
      });

      onBookingComplete(result.data);
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao confirmar reserva',
        isLoading: false 
      });
    }
  };

  const nextStep = () => {
    if (!validateStep(bookingState.step)) return;

    switch (bookingState.step) {
      case 'review':
        updateState({ step: 'guests' });
        break;
      case 'guests':
        handlePreBooking();
        break;
      case 'payment':
        handleConfirmBooking();
        break;
    }
  };

  const prevStep = () => {
    switch (bookingState.step) {
      case 'guests':
        updateState({ step: 'review' });
        break;
      case 'payment':
        updateState({ step: 'guests', prebooking: null });
        break;
      case 'confirmation':
        // Don't allow going back from confirmation
        break;
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index} 
        size={16} 
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
      />
    ));
  };

  const nights = calculateNights();
  const totalPrice = (selectedRate.totalPrice?.amount || 0) * nights;
  const isStepValid = validateStep(bookingState.step);

  return (
    <div className="min-h-screen bg-hotel-main">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
        {/* Header with Progress */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-5 mb-4 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>

            <div className="flex flex-wrap gap-2 lg:gap-4">
              {[
                { key: 'review', label: 'Revisão' },
                { key: 'guests', label: 'Hóspedes' },
                { key: 'payment', label: 'Pagamento' },
                { key: 'confirmation', label: 'Confirmação' }
              ].map((step, index) => (
                <div 
                  key={step.key}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    bookingState.step === step.key 
                      ? 'bg-blue-600 text-white' :
                    ['review', 'guests', 'payment', 'confirmation'].indexOf(bookingState.step) > index 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    bookingState.step === step.key 
                      ? 'bg-white text-blue-600' :
                    ['review', 'guests', 'payment', 'confirmation'].indexOf(bookingState.step) > index 
                      ? 'bg-white text-green-500' 
                      : 'bg-white text-gray-600'
                  }`}>
                    {['review', 'guests', 'payment', 'confirmation'].indexOf(bookingState.step) > index ? '✓' : index + 1}
                  </span>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 items-start">
          {/* Booking Summary Sidebar */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-4">
            <div className="flex gap-3 p-5 border-b border-gray-200">
              {hotel.images[0] && (
                <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={hotel.images[0].url}
                    alt={hotel.name}
                    width={80}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{hotel.name}</h3>
                <div className="flex gap-1 mb-2">
                  {renderStars(hotel.starRating || 0)}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={12} />
                  <span className="truncate">{hotel.location.address.city}, {hotel.location.address.country}</span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Datas da Estadia</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-blue-600" />
                    <div>
                      <span className="text-gray-500">Check-in: </span>
                      <span className="font-medium text-gray-900">{formatDate(searchParams.checkIn)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-blue-600" />
                    <div>
                      <span className="text-gray-500">Check-out: </span>
                      <span className="font-medium text-gray-900">{formatDate(searchParams.checkOut)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm font-semibold text-blue-600">
                  {nights} noite{nights > 1 ? 's' : ''}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Quarto Selecionado</h4>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">{selectedRate.roomType.name}</h5>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>{selectedRate.boardType}</div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{searchParams.adults} adultos{searchParams.children > 0 && `, ${searchParams.children} crianças`}</span>
                    </div>
                  </div>
                  
                  {selectedRate.isFreeCancellation && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <Check size={14} />
                      <span>Cancelamento grátis</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Resumo de Preços</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarifa do quarto (por noite)</span>
                    <span className="font-medium">{selectedRate.totalPrice?.formatted || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{nights} noite{nights > 1 ? 's' : ''}</span>
                    <span className="font-medium">{selectedRate.currency} {totalPrice.toFixed(2)}</span>
                  </div>
                  {selectedRate.taxes && selectedRate.taxes.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impostos e taxas</span>
                      <span className="font-medium">Incluído</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-base">
                    <span>Total</span>
                    <span className="text-blue-600">{selectedRate.currency} {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
            {bookingState.error && (
              <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle size={20} />
                <span className="flex-1">{bookingState.error}</span>
                <button onClick={() => updateState({ error: null })} className="text-red-500 hover:text-red-700">
                  ×
                </button>
              </div>
            )}

            {/* Step Content */}
            {bookingState.step === 'review' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 Revisão da Reserva</h2>
                <p className="text-gray-600 mb-8">Confirme todos os detalhes antes de prosseguir com a reserva.</p>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Hotel e Quarto</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Hotel:</strong> {hotel.name}</div>
                      <div><strong>Quarto:</strong> {selectedRate.roomType.name}</div>
                      <div><strong>Regime:</strong> {selectedRate.boardType}</div>
                      <div><strong>Ocupação:</strong> {searchParams.adults} adultos{searchParams.children > 0 && `, ${searchParams.children} crianças`}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Políticas Importantes</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Clock size={16} className="text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <div><strong>Check-in:</strong> {hotel.policies?.checkIn || '15:00'}</div>
                          <div><strong>Check-out:</strong> {hotel.policies?.checkOut || '11:00'}</div>
                        </div>
                      </div>
                      
                      {selectedRate.cancellationDeadline && (
                        <div className="flex items-start gap-3">
                          <Shield size={16} className="text-green-600 mt-0.5" />
                          <div className="text-sm">
                            <strong>Cancelamento:</strong> {selectedRate.isFreeCancellation ? 'Grátis' : 'Pago'} até{' '}
                            {new Date(selectedRate.cancellationDeadline).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {bookingState.step === 'guests' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">👥 Informações dos Hóspedes</h2>
                <p className="text-gray-600 mb-8">Preencha os dados de todos os hóspedes conforme documentos de identidade.</p>

                <div className="space-y-8">
                  {bookingState.guests.map((guest, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {guest.isMainGuest ? '🎯 Hóspede Principal' : `👤 Hóspede ${index + 1}`}
                        {guest.isMainGuest && <span className="ml-2 text-xs text-gray-500">* Responsável pela reserva</span>}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tratamento</label>
                          <select
                            value={guest.title}
                            onChange={(e) => updateGuest(index, { title: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {TITLE_OPTIONS.map(title => (
                              <option key={title} value={title}>{title}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                          <input
                            type="text"
                            value={guest.firstName}
                            onChange={(e) => updateGuest(index, { firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Primeiro nome"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome *</label>
                          <input
                            type="text"
                            value={guest.lastName}
                            onChange={(e) => updateGuest(index, { lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Último nome"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">📞 Informações de Contato</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                        <input
                          type="email"
                          value={bookingState.contact.email}
                          onChange={(e) => updateContact({ email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="seu@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                        <input
                          type="tel"
                          value={bookingState.contact.phone}
                          onChange={(e) => updateContact({ phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+55 11 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input
                          type="tel"
                          value={bookingState.contact.whatsapp}
                          onChange={(e) => updateContact({ whatsapp: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+55 11 99999-9999"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">ℹ️ Informações Adicionais</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Horário previsto de chegada</label>
                        <select
                          value={bookingState.arrivalTime}
                          onChange={(e) => updateState({ arrivalTime: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {ARRIVAL_TIME_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Solicitações especiais</label>
                        <textarea
                          value={bookingState.specialRequests}
                          onChange={(e) => updateState({ specialRequests: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                          placeholder="Ex: quarto no andar alto, berço para bebê, etc."
                          rows={3}
                        />
                        <span className="text-xs text-gray-500 mt-1 block">
                          Solicitações especiais estão sujeitas à disponibilidade
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {bookingState.step === 'payment' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">💳 Finalizar Reserva</h2>
                <p className="text-gray-600 mb-8">Confirme seus dados e finalize sua reserva de hotel.</p>

                {bookingState.prebooking && (
                  <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-blue-900">Reserva pré-confirmada!</div>
                      <p className="text-blue-700 text-sm mt-1">
                        Sua tarifa foi garantida até {bookingState.prebooking.validUntil ? new Date(bookingState.prebooking.validUntil).toLocaleString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">👥 Resumo dos Hóspedes</h3>
                    <div className="space-y-2">
                      {bookingState.guests.map((guest, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <User size={16} className="text-gray-600" />
                          <span>
                            {guest.title} {guest.firstName} {guest.lastName}
                            {guest.isMainGuest && ' (Principal)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">📞 Contato</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-gray-600" />
                        <span>{bookingState.contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-gray-600" />
                        <span>{bookingState.contact.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">📋 Termos e Condições</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bookingState.marketingConsent}
                          onChange={(e) => updateState({ marketingConsent: e.target.checked })}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Aceito receber comunicações promocionais da Fly2Any e parceiros
                        </span>
                      </label>
                      
                      <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bookingState.termsAccepted}
                          onChange={(e) => updateState({ termsAccepted: e.target.checked })}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Li e aceito os <a href="/termos" target="_blank" className="text-blue-600 hover:underline">termos e condições</a> e a{' '}
                          <a href="/privacidade" target="_blank" className="text-blue-600 hover:underline">política de privacidade</a> *
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {bookingState.step === 'confirmation' && bookingState.booking && (
              <div className="text-center py-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Check size={48} className="text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Reserva Confirmada!</h2>
                <p className="text-gray-600 mb-8">Sua reserva foi confirmada com sucesso. Você receberá um e-mail de confirmação em breve.</p>

                <div className="max-w-md mx-auto text-left">
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Detalhes da Reserva</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Código da Reserva:</span>
                        <span className="font-medium">{bookingState.booking.bookingReference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hotel:</span>
                        <span className="font-medium">{bookingState.booking.hotel?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{bookingState.booking.checkIn ? formatDate(bookingState.booking.checkIn) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{bookingState.booking.checkOut ? formatDate(bookingState.booking.checkOut) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Total Pago:</span>
                        <span className="font-semibold text-blue-600">{bookingState.booking.totalPrice?.formatted || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Próximos Passos</h3>
                    <ul className="text-sm text-left space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✅</span>
                        <span>Guarde o código da reserva: <strong>{bookingState.booking.bookingReference}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✅</span>
                        <span>Verifique seu e-mail para o voucher da reserva</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✅</span>
                        <span>Leve um documento de identidade no check-in</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✅</span>
                        <span>Entre em contato conosco se precisar de ajuda</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {bookingState.step !== 'confirmation' && (
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {bookingState.step !== 'review' && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={bookingState.isLoading}
                  >
                    <ArrowLeft size={16} />
                    Voltar
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  disabled={!isStepValid || bookingState.isLoading}
                >
                  {bookingState.isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {bookingState.step === 'guests' ? 'Processando...' : 'Confirmando...'}
                    </>
                  ) : (
                    <>
                      {bookingState.step === 'payment' ? 'Confirmar Reserva' : 'Continuar'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}