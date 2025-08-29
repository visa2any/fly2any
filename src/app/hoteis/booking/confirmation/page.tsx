'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, AlertCircle, ArrowLeft, Calendar, MapPin, User, Mail, Phone, Download, Share } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface BookingDetails {
  bookingReference: string;
  status: string;
  hotel: {
    id: string;
    name: string;
    address?: string;
    starRating?: number;
  };
  checkIn: string;
  checkOut: string;
  totalPrice: {
    amount: number;
    currency: string;
    formatted: string;
  };
  guests: Array<{
    name: string;
    type: 'adult' | 'child';
  }>;
  confirmationEmail?: string;
}

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookingDetails = async (): Promise<void> => {
      try {
        const bookingRef = searchParams.get('ref');
        
        if (!bookingRef) {
          throw new Error('Referência da reserva não encontrada');
        }

        // Para bookings demo
        if (bookingRef.startsWith('FLY2ANY-')) {
          const mockBooking: BookingDetails = {
            bookingReference: bookingRef,
            status: 'confirmed',
            hotel: {
              id: 'demo-copacabana-palace',
              name: 'Copacabana Palace',
              address: 'Avenida Atlântica, 1702 - Copacabana, Rio de Janeiro',
              starRating: 5
            },
            checkIn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalPrice: {
              amount: 850,
              currency: 'BRL',
              formatted: 'R$ 850,00'
            },
            guests: [
              { name: 'João Silva', type: 'adult' },
              { name: 'Maria Silva', type: 'adult' }
            ],
            confirmationEmail: 'guest@example.com'
          };

          setBooking(mockBooking);
          setIsLoading(false);
          return;
        }

        // Para bookings reais, consultar API
        const response = await fetch(`/api/hotels/booking/finalize?bookingReference=${bookingRef}`);
        const result = await response.json();

        if (result.success) {
          setBooking(result.data);
        } else {
          throw new Error(result.error || 'Reserva não encontrada');
        }
      } catch (err) {
        console.error('Error loading booking details:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes da reserva');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingDetails();
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleDownloadVoucher = () => {
    // Implementar download do voucher
    console.log('Download voucher for booking:', booking?.bookingReference);
  };

  const handleShareBooking = async (): Promise<void> => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: 'Confirmação de Reserva - Fly2Any',
          text: `Sua reserva ${booking.bookingReference} foi confirmada!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback para navegadores sem suporte ao Web Share API
      if (booking) {
        navigator.clipboard.writeText(window.location.href);
        // Mostrar feedback de link copiado
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes da reserva...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          
          <Link
            href="/hoteis"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Voltar para Busca
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Nenhuma reserva encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 Reserva Confirmada!</h1>
          <p className="text-gray-600 text-lg">
            Sua reserva foi confirmada com sucesso. Você receberá um e-mail de confirmação em breve.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Reference */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes da Reserva</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Código da Reserva</label>
                  <div className="font-mono text-lg font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {booking.bookingReference}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Confirmada
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotel Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hotel</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.hotel.name}</h3>
                  {booking.hotel.starRating && (
                    <div className="flex gap-1 my-1">
                      {Array.from({ length: booking.hotel.starRating }, (_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                  )}
                  {booking.hotel.address && (
                    <p className="text-gray-600 text-sm">{booking.hotel.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes da Estadia</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-blue-600" />
                    <label className="text-sm font-medium text-gray-600">Check-in</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(booking.checkIn)}
                  </p>
                  <p className="text-sm text-gray-600">A partir das 15:00</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-blue-600" />
                    <label className="text-sm font-medium text-gray-600">Check-out</label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(booking.checkOut)}
                  </p>
                  <p className="text-sm text-gray-600">Até as 12:00</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{calculateNights()} noite{calculateNights() > 1 ? 's' : ''}</strong> de hospedagem
                </p>
              </div>
            </div>

            {/* Guests */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hóspedes</h2>
              
              <div className="space-y-3">
                {booking.guests.map((guest, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <User size={16} className="text-gray-600" />
                    <span className="text-gray-900">{guest.name}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {guest.type === 'adult' ? 'Adulto' : 'Criança'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pagamento</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Pago</span>
                  <span className="text-2xl font-bold text-green-600">{booking.totalPrice.formatted}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Incluindo todas as taxas e impostos
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleDownloadVoucher}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Baixar Voucher
                </button>
                
                <button
                  onClick={handleShareBooking}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <Share size={16} />
                  Compartilhar
                </button>
              </div>
            </div>

            {/* Contact Info */}
            {booking.confirmationEmail && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Confirmação</h2>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  <span>Enviado para {booking.confirmationEmail}</span>
                </div>
              </div>
            )}

            {/* New Search */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Link
                href="/hoteis"
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={16} />
                Nova Busca
              </Link>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-2">Informações Importantes</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Apresente um documento de identidade válido no check-in</li>
            <li>• Mantenha este código de reserva para referência: <strong>{booking.bookingReference}</strong></li>
            <li>• Entre em contato com o hotel diretamente para solicitações especiais</li>
            <li>• Verifique as políticas de cancelamento em caso de mudanças</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}