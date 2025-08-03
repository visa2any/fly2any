'use client';

/**
 * 🎛️ Flight Order Status Component
 * Máxima experiência do cliente e estratégias de retenção
 * Focus: Customer service excellence, proactive support, and retention
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  MapIcon as MapPinIcon,
  CalendarIcon,
  BellIcon,
  GiftIcon,
  StarIcon
} from '@/components/Icons';
import { FlightOrder } from '@/types/flights';

interface FlightOrderStatusProps {
  orderId: string;
  onCancelRequest?: (orderId: string, reason: string) => void;
  onModifyRequest?: (orderId: string, modification: any) => void;
  className?: string;
}

export default function FlightOrderStatus({
  orderId,
  onCancelRequest,
  onModifyRequest,
  className = ''
}: FlightOrderStatusProps) {
  const [order, setOrder] = useState<FlightOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'support'>('details');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
    
    // Set up real-time updates
    if (realTimeUpdates) {
      const interval = setInterval(fetchOrderDetails, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [orderId, realTimeUpdates]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/flights/order-management?orderId=${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason) return;
    
    try {
      const response = await fetch('/api/flights/order-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'CANCEL',
          reason: cancelReason
        })
      });
      
      const result = await response.json();
      if (result.success && onCancelRequest) {
        onCancelRequest(orderId, cancelReason);
      }
    } catch (error) {
      console.error('Cancel request failed:', error);
    } finally {
      setShowCancelModal(false);
      setCancelReason('');
    }
  };

  if (isLoading) {
    return (
      <div className={`order-status-loading ${className}`}>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="inline-flex items-center gap-3 mb-4">
              <ClockIcon className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-700">Carregando status da reserva...</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">Obtendo informações atualizadas</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`order-not-found ${className}`}>
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reserva não encontrada</h2>
          <p className="text-gray-600 mb-6">Não foi possível localizar a reserva #{orderId}</p>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">📞 Precisa de ajuda?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-800">
                <PhoneIcon className="w-4 h-4" />
                <span>+55 11 4000-0000</span>
              </div>
              <div className="flex items-center gap-2 text-blue-800">
                <PhoneIcon className="w-4 h-4" />
                <span>Chat online 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flight-order-status ${className}`}>
      {/* 🎯 Header with Status */}
      <div className="order-header bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-8 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ✈️ Reserva #{order.id}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-semibold">Confirmada</span>
              </div>
              <div className="text-sm text-gray-600">
                Created on {new Date(order.associatedRecords[0]?.creationDate || Date.now()).toLocaleDateString('en-US')}
              </div>
            </div>
          </div>
          
          {/* 🎯 Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                realTimeUpdates 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BellIcon className="w-4 h-4 inline mr-2" />
              {realTimeUpdates ? 'Atualizações Ativas' : 'Ativar Atualizações'}
            </button>
            
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors border border-red-200"
            >
              ⚠️ Cancelar Reserva
            </button>
          </div>
        </div>

        {/* 🎯 Flight Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white rounded-xl p-6 border border-gray-200">
          <div>
            <div className="text-sm text-gray-600 mb-1">Rota</div>
            <div className="font-semibold text-gray-900">
              {order.flightOffers[0]?.itineraries?.[0]?.segments?.[0]?.departure?.iataCode || 'GRU'} → 
              {order.flightOffers[0]?.itineraries?.[0]?.segments?.[0]?.arrival?.iataCode || 'SDU'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Data & Horário</div>
            <div className="font-semibold text-gray-900">
              {new Date(order.flightOffers[0]?.itineraries?.[0]?.segments?.[0]?.departure?.at || Date.now()).toLocaleDateString('en-US')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Passageiros</div>
            <div className="font-semibold text-gray-900">{order.travelers.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Valor Total</div>
            <div className="text-xl font-bold text-blue-600">
              R$ {parseFloat(order.flightOffers[0]?.price?.total || '1299.99').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Tab Navigation */}
      <div className="tab-navigation mb-8">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'details', label: '📋 Detalhes', icon: '📋' },
            { id: 'timeline', label: '⏰ Timeline', icon: '⏰' },
            { id: 'support', label: '🎧 Suporte', icon: '🎧' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🎯 Tab Content */}
      <div className="tab-content">
        {activeTab === 'details' && (
          <DetailsTab order={order} />
        )}
        
        {activeTab === 'timeline' && (
          <TimelineTab order={order} />
        )}
        
        {activeTab === 'support' && (
          <SupportTab order={order} />
        )}
      </div>

      {/* 🎯 Retention Opportunities */}
      <div className="retention-section mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">
          🎁 Ofertas Exclusivas para Você
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="offer-card bg-white rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <GiftIcon className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">🏨 Hotel + Transfer</div>
                <div className="text-sm text-green-700">Complete sua viagem com 30% OFF</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Economize até R$ 400 reservando hotel e transfer junto
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Ver Hotéis Disponíveis
            </button>
          </div>
          
          <div className="offer-card bg-white rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <StarIcon className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">✈️ Próxima Viagem</div>
                <div className="text-sm text-green-700">15% desconto válido por 90 dias</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Planeje sua próxima aventura com desconto especial
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Explorar Destinos
            </button>
          </div>
        </div>
      </div>

      {/* 🎯 Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ⚠️ Cancelar Reserva
            </h3>
            <p className="text-gray-600 mb-6">
              Lamentamos que precise cancelar. Antes de prosseguir, que tal uma dessas alternativas?
            </p>
            
            {/* 🎯 Retention Offers */}
            <div className="retention-offers space-y-3 mb-6">
              <div className="offer bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-semibold text-blue-900">📅 Mudança Gratuita</div>
                <div className="text-sm text-blue-700">Altere data ou destino sem taxa</div>
              </div>
              <div className="offer bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="font-semibold text-green-900">💰 Crédito +20%</div>
                <div className="text-sm text-green-700">R$ 1.560 para usar em até 12 meses</div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo do cancelamento:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um motivo</option>
                <option value="schedule">Mudança de agenda</option>
                <option value="price">Encontrei preço melhor</option>
                <option value="personal">Motivos pessoais</option>
                <option value="emergency">Emergência</option>
                <option value="other">Outro</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Manter Reserva
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  cancelReason
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// 🎯 TAB COMPONENTS
// =============================================================================

function DetailsTab({ order }: { order: FlightOrder }) {
  return (
    <div className="details-tab space-y-6">
      {/* Travelers Information */}
      <div className="travelers-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Passageiros</h3>
        <div className="space-y-4">
          {order.travelers.map((traveler, index) => (
            <div key={traveler.id} className="traveler-info border-l-4 border-blue-200 pl-4">
              <div className="font-semibold text-gray-900">
                {traveler.name.firstName} {traveler.name.lastName}
              </div>
              <div className="text-sm text-gray-600">
                Birth Date: {new Date(traveler.dateOfBirth).toLocaleDateString('en-US')}
              </div>
              {traveler.documents && traveler.documents[0] && (
                <div className="text-sm text-gray-600">
                  Documento: {traveler.documents[0].documentType} - {traveler.documents[0].number}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Flight Details */}
      <div className="flight-details bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">✈️ Detalhes do Voo</h3>
        {order.flightOffers.map((offer, index) => (
          <div key={offer.id || index} className="flight-info">
            {offer.itineraries?.map((itinerary: any, itinIndex: number) => (
              <div key={itinIndex} className="itinerary mb-4">
                {itinerary.segments?.map((segment: any, segIndex: number) => (
                  <div key={segIndex} className="segment flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                    <div className="departure">
                      <div className="font-semibold text-lg">{segment.departure?.iataCode}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(segment.departure?.at || Date.now()).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flight-info text-center">
                      <div className="font-medium">{segment.carrierCode} {segment.number}</div>
                      <div className="text-sm text-gray-600">{segment.duration}</div>
                    </div>
                    
                    <div className="arrival text-right">
                      <div className="font-semibold text-lg">{segment.arrival?.iataCode}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(segment.arrival?.at || Date.now()).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Services & Amenities */}
      <div className="services-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Serviços Inclusos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="service-item flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Bagagem de mão (10kg)</span>
          </div>
          <div className="service-item flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Seleção de assento básico</span>
          </div>
          <div className="service-item flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Check-in online</span>
          </div>
          <div className="service-item flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Seguro básico incluído</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ order }: { order: FlightOrder }) {
  const timelineEvents = [
    {
      title: 'Reserva Confirmada',
      date: new Date(order.associatedRecords[0]?.creationDate || Date.now()),
      status: 'completed',
      description: 'Pagamento processado e reserva confirmada com sucesso'
    },
    {
      title: 'E-ticket Enviado',
      date: new Date(Date.now() + 5 * 60 * 1000),
      status: 'completed',
      description: 'Bilhete eletrônico enviado para seu email'
    },
    {
      title: 'Check-in Disponível',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending',
      description: 'Check-in online será liberado 24h antes do voo'
    },
    {
      title: 'Voo Programado',
      date: new Date(order.flightOffers[0]?.itineraries?.[0]?.segments?.[0]?.departure?.at || Date.now() + 48 * 60 * 60 * 1000),
      status: 'pending',
      description: 'Horário de partida do seu voo'
    }
  ];

  return (
    <div className="timeline-tab">
      <div className="timeline bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">⏰ Timeline da Viagem</h3>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={index} className="timeline-event flex items-start gap-4">
              <div className={`timeline-marker w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                event.status === 'completed' 
                  ? 'bg-green-100 border-green-500 text-green-600' 
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {event.status === 'completed' ? <CheckCircleIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
              </div>
              
              <div className="timeline-content flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${
                    event.status === 'completed' ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {event.title}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {event.date.toLocaleDateString('en-US')} at {event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather & Airport Info */}
      <div className="additional-info grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="weather-info bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <StarIcon className="w-5 h-5 text-blue-600" />
            Previsão do Tempo
          </h4>
          <div className="space-y-3">
            <div className="weather-item">
              <div className="text-sm text-gray-600">Partida (GRU)</div>
              <div className="font-medium">☀️ Ensolarado, 28°C</div>
            </div>
            <div className="weather-item">
              <div className="text-sm text-gray-600">Chegada (SDU)</div>
              <div className="font-medium">🌤️ Parcialmente nublado, 24°C</div>
            </div>
          </div>
        </div>
        
        <div className="airport-info bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-blue-600" />
            Informações do Aeroporto
          </h4>
          <div className="space-y-3">
            <div className="info-item">
              <div className="text-sm text-gray-600">Check-in recomendado</div>
              <div className="font-medium">2 horas antes</div>
            </div>
            <div className="info-item">
              <div className="text-sm text-gray-600">Terminal</div>
              <div className="font-medium">Terminal 3</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupportTab({ order }: { order: FlightOrder }) {
  return (
    <div className="support-tab space-y-6">
      {/* 24/7 Support Channels */}
      <div className="support-channels bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Canais de Atendimento 24/7</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="support-channel">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">WhatsApp</div>
                <div className="text-sm text-gray-600">Resposta em 2 minutos</div>
              </div>
            </div>
            <div className="text-lg font-bold text-green-600 mb-2">+55 11 99999-9999</div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
              Iniciar Conversa
            </button>
          </div>
          
          <div className="support-channel">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <PhoneIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Telefone</div>
                <div className="text-sm text-gray-600">Atendimento imediato</div>
              </div>
            </div>
            <div className="text-lg font-bold text-blue-600 mb-2">+55 11 4000-0000</div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Ligar Agora
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">❓ Perguntas Frequentes</h3>
        <div className="space-y-4">
          <div className="faq-item">
            <div className="font-medium text-gray-900 mb-2">Como fazer check-in online?</div>
            <div className="text-sm text-gray-600">
              O check-in online fica disponível 24h antes do voo. Você receberá um email com o link direto ou pode acessar pelo app da companhia aérea.
            </div>
          </div>
          
          <div className="faq-item">
            <div className="font-medium text-gray-900 mb-2">Posso alterar minha reserva?</div>
            <div className="text-sm text-gray-600">
              Sim! Alterações podem ser feitas até 24h antes do voo. Consulte nossa equipe para verificar disponibilidade e taxas aplicáveis.
            </div>
          </div>
          
          <div className="faq-item">
            <div className="font-medium text-gray-900 mb-2">O que acontece se meu voo atrasar?</div>
            <div className="text-sm text-gray-600">
              Você será notificado automaticamente sobre qualquer alteração. Nossa equipe também oferece assistência para reacomodação se necessário.
            </div>
          </div>
        </div>
      </div>

      {/* Proactive Support */}
      <div className="proactive-support bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">🔔 Suporte Proativo Ativado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="support-feature flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Alertas de mudança de voo</span>
          </div>
          <div className="support-feature flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Notificações de gate/terminal</span>
          </div>
          <div className="support-feature flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Atualizações meteorológicas</span>
          </div>
          <div className="support-feature flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">Assistência automática para atrasos</span>
          </div>
        </div>
      </div>
      
      {/* Emergency Support */}
      <div className="emergency-support bg-red-50 rounded-xl p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-4">🚨 Suporte de Emergência</h3>
        <p className="text-sm text-red-800 mb-4">
          Para situações críticas que requerem atenção imediata, use nossos canais de emergência:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="emergency-channel bg-white rounded-lg p-4 border border-red-200">
            <div className="font-semibold text-red-900">WhatsApp Emergência</div>
            <div className="text-lg font-bold text-red-600">+55 11 98888-8888</div>
          </div>
          <div className="emergency-channel bg-white rounded-lg p-4 border border-red-200">
            <div className="font-semibold text-red-900">Email Urgente</div>
            <div className="text-sm text-red-600">urgente@fly2any.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}