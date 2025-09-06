'use client';
export const dynamic = 'force-dynamic';

/**
 * Dynamic Hotel Booking Page
 * Rota: /hoteis/booking/[id]/[slug]
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import HotelBookingFlow from '@/components/hotels/HotelBookingFlow';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Hotel, Rate, HotelSearchParams } from '@/types/hotels';
import { getMockHotelData } from '@/lib/hotels/demo-data';

export default function HotelBookingRoute() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [searchParameters, setSearchParameters] = useState<HotelSearchParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hotelId = params.id as string;
  const slug = params.slug as string;
  const rateId = searchParams.get('rateId');

  useEffect(() => {
    async function loadBookingData() {
      try {
        setLoading(true);
        setError(null);

        // Extrair parâmetros de busca da URL
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const adults = searchParams.get('adults') || '2';
        const children = searchParams.get('children') || '0';
        const rooms = searchParams.get('rooms') || '1';
        const destination = searchParams.get('destination') || '';

        // Criar parâmetros de busca padrão se não existirem
        const defaultCheckIn = new Date();
        defaultCheckIn.setDate(defaultCheckIn.getDate() + 1);
        const defaultCheckOut = new Date();
        defaultCheckOut.setDate(defaultCheckOut.getDate() + 3);

        const hotelSearchParams: HotelSearchParams = {
          destination,
          destinationType: 'city',
          checkIn: checkIn ? new Date(checkIn) : defaultCheckIn,
          checkOut: checkOut ? new Date(checkOut) : defaultCheckOut,
          adults: parseInt(adults),
          children: parseInt(children),
          rooms: parseInt(rooms),
          currency: 'BRL'
        };

        setSearchParameters(hotelSearchParams);

        // Carregar dados do hotel (mesmo método da página de detalhes)
        let hotelData: Hotel | null = null;

        if (hotelId.startsWith('demo-') || hotelId.startsWith('real-hotel-')) {
          hotelData = await getMockHotelData(hotelId);
        } else {
          // Para hotéis reais, fazer requisição à API
          const queryParams = new URLSearchParams();
          queryParams.set('checkIn', hotelSearchParams.checkIn.toISOString().split('T')[0]);
          queryParams.set('checkOut', hotelSearchParams.checkOut.toISOString().split('T')[0]);
          queryParams.set('adults', (hotelSearchParams.adults || 2).toString());
          queryParams.set('children', (hotelSearchParams.children || 0).toString());
          queryParams.set('rooms', (hotelSearchParams.rooms || 1).toString());
          queryParams.set('currency', hotelSearchParams.currency || 'USD');
          queryParams.set('includeRates', 'true');

          const response = await fetch(`/api/hotels/${hotelId}?${queryParams}`);
          const result = await response.json();

          if (result.status !== 'success') {
            throw new Error(result.error || 'Erro ao carregar detalhes do hotel');
          }

          hotelData = result.data;
        }

        if (!hotelData) {
          throw new Error('Hotel não encontrado');
        }

        setHotel(hotelData);

        // Encontrar a tarifa selecionada
        if (rateId && hotelData.rates) {
          const rate = hotelData.rates.find(r => r.id === rateId);
          if (rate) {
            setSelectedRate(rate);
          } else {
            // Se não encontrar a tarifa específica, usar a primeira disponível
            setSelectedRate(hotelData.rates[0]);
          }
        } else if (hotelData.rates && hotelData.rates.length > 0) {
          setSelectedRate(hotelData.rates[0]);
        } else {
          throw new Error('Nenhuma tarifa disponível para este hotel');
        }
      } catch (err) {
        console.error('Erro ao carregar booking:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados da reserva');
      } finally {
        setLoading(false);
      }
    }

    if (hotelId) {
      loadBookingData();
    }
  }, [hotelId, rateId, searchParams]);

  const handleBack = () => {
    // Voltar para a página de detalhes
    const detailsUrl = `/hoteis/details/${hotelId}/${slug}`;
    const url = new URL(detailsUrl, window.location.origin);
    
    // Preservar parâmetros de busca (exceto rateId)
    searchParams.forEach((value, key) => {
      if (key !== 'rateId') {
        url.searchParams.set(key, value);
      }
    });
    
    router.push(url.toString());
  };

  const handleBookingComplete = (booking: any) => {
    // Redirect para página de confirmação ou processar o booking
    console.log('Booking completed:', booking);
    // Aqui você pode redirecionar para uma página de confirmação ou processar o pagamento
  };

  if (loading) {
    return (
      <>
        <GlobalMobileStyles />
        <div className="min-h-screen bg-hotel-main flex flex-col">
          <ResponsiveHeader />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900">Preparando sua reserva...</h3>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !hotel || !selectedRate || !searchParameters) {
    return (
      <>
        <GlobalMobileStyles />
        <div className="min-h-screen bg-hotel-main flex flex-col">
          <ResponsiveHeader />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro na reserva</h3>
              <p className="text-gray-600 mb-6">{error || 'Não foi possível carregar os dados da reserva.'}</p>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar aos detalhes
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalMobileStyles />
      <div className="min-h-screen bg-hotel-main flex flex-col">
        <ResponsiveHeader />
        <main className="flex-1 py-4 md:py-8">
          <HotelBookingFlow
            hotel={hotel}
            selectedRate={selectedRate}
            searchParams={{
              checkIn: searchParameters.checkIn.toISOString().split('T')[0],
              checkOut: searchParameters.checkOut.toISOString().split('T')[0],
              adults: searchParameters.adults || 2,
              children: searchParameters.children || 0,
              rooms: searchParameters.rooms || 1
            }}
            onBack={handleBack}
            onBookingComplete={handleBookingComplete}
          />
        </main>
        <Footer />
      </div>
    </>
  );
}

