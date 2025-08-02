'use client';

/**
 * Flight Details Page Component
 * Comprehensive flight details with conversion-focused design
 */

import React, { useState, useEffect } from 'react';
import { 
  ProcessedFlightOffer,
  ProcessedJourney,
  ProcessedSegment 
} from '@/types/flights';
import {
  FlightIcon,
  ClockIcon,
  CalendarIcon,
  StarIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  UserIcon,
  ShieldIcon,
  CreditCardIcon,
  AlertIcon
} from '@/components/Icons';
import {
  formatDuration,
  formatStops,
  formatTravelClass,
  getTimeOfDay,
  formatTimeOfDay
} from '@/lib/flights/formatters';
import {
  getStopsEmoji,
  getTimeOfDayEmoji
} from '@/lib/flights/helpers';

interface FlightDetailsPageProps {
  flight: ProcessedFlightOffer;
  onBooking: (flight: ProcessedFlightOffer, services: any[]) => void;
  onBack: () => void;
  className?: string;
}

interface AdditionalService {
  type: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  popular?: boolean;
  savings?: string;
  selected?: boolean;
}

export default function FlightDetailsPage({
  flight,
  onBooking,
  onBack,
  className = ''
}: FlightDetailsPageProps) {
  const [selectedServices, setSelectedServices] = useState<AdditionalService[]>([]);
  const [totalPrice, setTotalPrice] = useState(flight.totalPrice);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [urgencyTimer, setUrgencyTimer] = useState(600); // 10 minutes

  // Countdown timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock additional services (would come from API)
  const additionalServices: AdditionalService[] = [
    {
      type: 'seat_selection',
      name: 'Premium Seat Selection',
      description: 'Choose your preferred seat (window, aisle, extra space)',
      price: '$ 45',
      originalPrice: '$ 65',
      popular: true,
      savings: 'Save $ 20'
    },
    {
      type: 'baggage',
      name: 'Extra Baggage (23kg)',
      description: 'Add checked baggage up to 23kg',
      price: '$ 120',
      originalPrice: '$ 150',
      savings: 'Save $ 30 when buying now'
    },
    {
      type: 'meal',
      name: 'Premium Meal',
      description: 'Gourmet meal with special options',
      price: '$ 35'
    },
    {
      type: 'fast_track',
      name: 'Fast Track Security',
      description: 'Pass through security faster',
      price: '$ 25'
    },
    {
      type: 'lounge',
      name: 'VIP Lounge Access',
      description: 'WiFi, food and drinks in the lounge',
      price: '$ 89',
      popular: true
    },
    {
      type: 'insurance',
      name: 'Premium Travel Insurance',
      description: 'Complete coverage for cancellation and emergencies',
      price: '$ 45',
      popular: true
    }
  ];

  // Mock reviews data
  const airlineReviews = {
    overall: 4.2,
    punctuality: 4.1,
    service: 4.3,
    comfort: 4.0,
    valueForMoney: 4.4,
    totalReviews: 15742
  };

  const handleServiceToggle = (service: AdditionalService) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.type === service.type);
      if (exists) {
        return prev.filter(s => s.type !== service.type);
      } else {
        return [...prev, { ...service, selected: true }];
      }
    });
  };

  const calculateTotalPrice = () => {
    // Handle invalid flight price
    let basePrice = 0;
    if (flight.totalPrice && !flight.totalPrice.includes('NaN')) {
      const cleanPrice = flight.totalPrice.replace(/[^\\d,.]/g, '').replace(',', '.');
      basePrice = parseFloat(cleanPrice) || 0;
    }
    
    const servicesPrice = selectedServices.reduce((sum, service) => {
      const cleanServicePrice = service.price.replace(/[^\\d,.]/g, '').replace(',', '.');
      return sum + (parseFloat(cleanServicePrice) || 0);
    }, 0);
    
    return `$${(basePrice + servicesPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [selectedServices]);

  const formatUrgencyTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderJourneyDetails = (journey: ProcessedJourney, title: string, icon: React.ReactNode) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-600">{journey.duration}</span>
          <span className="text-sm text-gray-600">•</span>
          <span className="text-sm text-gray-600">{getStopsEmoji(journey.stops)} {formatStops(journey.stops)}</span>
        </div>
      </div>

      {/* Journey Overview */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{journey.departure.time}</div>
          <div className="text-sm font-medium text-gray-600">{journey.departure.iataCode}</div>
          <div className="text-xs text-gray-500">{journey.departure.airportName}</div>
          <div className="text-xs text-gray-500">{journey.departure.date}</div>
        </div>
        
        <div className="flex-1 px-6">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-600">{journey.duration}</span>
          </div>
          <div className="relative">
            <div className="h-px bg-gradient-to-r from-blue-400 to-purple-400"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full">
              <FlightIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">{formatStops(journey.stops)}</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{journey.arrival.time}</div>
          <div className="text-sm font-medium text-gray-600">{journey.arrival.iataCode}</div>
          <div className="text-xs text-gray-500">{journey.arrival.airportName}</div>
          <div className="text-xs text-gray-500">{journey.arrival.date}</div>
        </div>
      </div>

      {/* Segments Details */}
      <div className="space-y-4">
        {journey.segments.map((segment, index) => (
          <div key={segment.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img 
                  src={segment.airline.logo} 
                  alt={segment.airline.name}
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/airline-default.png';
                  }}
                />
                <div>
                  <div className="font-semibold text-gray-900">{segment.airline.name}</div>
                  <div className="text-sm text-gray-600">{segment.flightNumber} • {segment.aircraft.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{formatTravelClass(segment.cabin)}</div>
                <div className="text-xs text-gray-500">{segment.duration}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Departure</div>
                <div className="font-semibold">{segment.departure.time} - {segment.departure.iataCode}</div>
                <div className="text-xs text-gray-500">{segment.departure.date}</div>
                {segment.departure.terminal && (
                  <div className="text-xs text-gray-500">Terminal {segment.departure.terminal}</div>
                )}
              </div>
              <div>
                <div className="text-gray-600">Arrival</div>
                <div className="font-semibold">{segment.arrival.time} - {segment.arrival.iataCode}</div>
                <div className="text-xs text-gray-500">{segment.arrival.date}</div>
                {segment.arrival.terminal && (
                  <div className="text-xs text-gray-500">Terminal {segment.arrival.terminal}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Layovers */}
      {journey.layovers && journey.layovers.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-900">Connections</h4>
          {journey.layovers.map((layover, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Connection at {layover.airport}: {layover.duration}
                {layover.durationMinutes < 60 && ' ⚠️ Quick connection'}
                {layover.durationMinutes > 240 && ' 😴 Long connection'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`flight-details-page ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>←</span>
              <span>Voltar aos resultados</span>
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-600">Voo selecionado</div>
              <div className="font-semibold text-gray-900">
                {flight.outbound.departure.iataCode} → {flight.outbound.arrival.iataCode}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{totalPrice}</div>
              <div className="text-sm text-gray-600">por pessoa</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Urgency Banner */}
            {urgencyTimer > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertIcon className="w-6 h-6" />
                    <div>
                      <div className="font-bold">⚡ Oferta por tempo limitado!</div>
                      <div className="text-sm opacity-90">Este preço expira em breve</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatUrgencyTime(urgencyTimer)}</div>
                    <div className="text-xs opacity-75">remaining</div>
                  </div>
                </div>
              </div>
            )}

            {/* Flight Highlights */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">✨ Por que este voo é especial</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flight.enhanced?.recommendations?.slice(0, 4).map((rec, index) => (
                  <div key={index} className="text-center p-3 bg-white rounded-xl shadow-sm">
                    <div className="text-2xl mb-2">
                      {rec.includes('popular') && '🏆'}
                      {rec.includes('preço') && '💰'}
                      {rec.includes('direto') && '🚀'}
                      {rec.includes('assentos') && '⚡'}
                    </div>
                    <div className="text-xs font-medium text-gray-700">{rec.replace(/[🏆💰🚀⚡]/g, '').trim()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof */}
            {flight.enhanced?.socialProof && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">👥 O que outros viajantes dizem</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flight.enhanced.socialProof.slice(0, 2).map((proof, index) => {
                    const message = typeof proof === 'string' ? proof : proof.message;
                    return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl">
                        {message?.includes('people') && '🔥'}
                        {message?.includes('satisfaction') && '⭐'}
                        {message?.includes('chose') && '👥'}
                        {message?.includes('direct') && '🎯'}
                      </div>
                      <div className="text-sm font-medium text-gray-700">{message?.replace(/[🔥⭐👥🎯]/g, '').trim()}</div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Journey Details */}
            {renderJourneyDetails(
              flight.outbound,
              'Voo de Ida',
              <FlightIcon className="w-6 h-6 text-blue-500" />
            )}
            
            {flight.inbound && renderJourneyDetails(
              flight.inbound,
              'Voo de Volta',
              <FlightIcon className="w-6 h-6 text-green-500 transform rotate-180" />
            )}

            {/* Airline Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">⭐ Avaliações da Companhia</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{airlineReviews.overall}</div>
                  <div className="text-sm text-gray-600">Geral</div>
                  <div className="flex justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`w-3 h-3 ${i < Math.floor(airlineReviews.overall) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{airlineReviews.punctuality}</div>
                  <div className="text-xs text-gray-600">Pontualidade</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{airlineReviews.service}</div>
                  <div className="text-xs text-gray-600">Atendimento</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{airlineReviews.comfort}</div>
                  <div className="text-xs text-gray-600">Conforto</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{airlineReviews.valueForMoney}</div>
                  <div className="text-xs text-gray-600">Custo-benefício</div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600">
                Baseado em {airlineReviews.totalReviews.toLocaleString('pt-BR')} avaliações verificadas
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">🎁 Serviços Adicionais</h3>
                <div className="text-sm text-green-600 font-medium">
                  💰 Save comprando junto
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalServices.map((service) => (
                  <div 
                    key={service.type}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedServices.find(s => s.type === service.type)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleServiceToggle(service)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedServices.find(s => s.type === service.type)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedServices.find(s => s.type === service.type) && (
                            <CheckIcon className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        {service.popular && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{service.price}</div>
                        {service.originalPrice && (
                          <div className="text-xs text-gray-500 line-through">{service.originalPrice}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{service.description}</div>
                    {service.savings && (
                      <div className="text-xs text-green-600 font-medium">{service.savings}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Booking Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💼 Resumo da Reserva</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voo {flight.outbound.departure.iataCode} → {flight.outbound.arrival.iataCode}</span>
                    <span className="font-medium">{flight.totalPrice}</span>
                  </div>
                  
                  {selectedServices.map((service) => (
                    <div key={service.type} className="flex justify-between text-sm">
                      <span className="text-gray-600">{service.name}</span>
                      <span className="font-medium">{service.price}</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">{totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Signals */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldIcon className="w-4 h-4 text-green-500" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span>Confirmação instantânea</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CreditCardIcon className="w-4 h-4 text-green-500" />
                    <span>Cancele até 24h grátis</span>
                  </div>
                </div>

                <button
                  onClick={() => onBooking(flight, selectedServices)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  🚀 Reservar Agora
                </button>
                
                <div className="text-center mt-3">
                  <div className="text-xs text-gray-500">
                    ⚡ {Math.floor(Math.random() * 15) + 5} pessoas estão vendo este voo
                  </div>
                </div>
              </div>

              {/* Price Confidence */}
              {flight.enhanced?.priceAnalysis && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">📊 Análise de Preço</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confiança do preço</span>
                      <span className={`text-sm font-medium ${
                        flight.enhanced.priceAnalysis.confidence === 'HIGH' ? 'text-green-600' :
                        flight.enhanced.priceAnalysis.confidence === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {flight.enhanced.priceAnalysis.confidence === 'HIGH' ? 'ALTA ✅' :
                         flight.enhanced.priceAnalysis.confidence === 'MEDIUM' ? 'MÉDIA ⚠️' : 'BAIXA ❌'}
                      </span>
                    </div>
                    
                    {flight.enhanced.priceAnalysis.quartileRanking === 'FIRST' && (
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                        <div className="text-sm font-medium">💰 Preço Excelente!</div>
                        <div className="text-xs">Entre os 25% mais baratos da rota</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Last Seats Warning */}
              {flight.numberOfBookableSeats <= 5 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚠️</div>
                    <div className="font-bold text-red-800 mb-1">Apenas {flight.numberOfBookableSeats} assentos remaining!</div>
                    <div className="text-sm text-red-600">Este voo está quase lotado</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}