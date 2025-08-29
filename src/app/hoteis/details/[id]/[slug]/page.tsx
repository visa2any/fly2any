'use client';

/**
 * Dynamic Hotel Details Page
 * Rota: /hoteis/details/[id]/[slug]
 */

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import Footer from '@/components/Footer';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';
import HotelDetailsPage from '@/components/hotels/HotelDetailsPage';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Hotel, HotelSearchParams } from '@/types/hotels';
import { getMockHotelData } from '@/lib/hotels/demo-data';

export default function HotelDetailsRoute() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [searchParameters, setSearchParameters] = useState<HotelSearchParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hotelId = params.id as string;
  const slug = params.slug as string;

  useEffect(() => {
    async function loadHotelData() {
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

        // Se é um hotel demo ou realista, usar dados mock
        if (hotelId.startsWith('demo-') || hotelId.startsWith('real-hotel-')) {
          const mockHotel = await getMockHotelData(hotelId);
          if (mockHotel) {
            setHotel(mockHotel);
          } else {
            throw new Error('Hotel não encontrado');
          }
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

          setHotel(result.data);
        }
      } catch (err) {
        console.error('Erro ao carregar hotel:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar hotel');
      } finally {
        setLoading(false);
      }
    }

    if (hotelId) {
      loadHotelData();
    }
  }, [hotelId, searchParams]);

  const handleBack = () => {
    // Verificar se existe um histórico para voltar para resultados
    if (window.history.length > 1) {
      // Tentar construir a URL de resultados com os parâmetros de busca
      const resultsUrl = '/hoteis';
      const url = new URL(resultsUrl, window.location.origin);
      
      // Preservar parâmetros de busca relevantes
      searchParams.forEach((value, key) => {
        if (['destination', 'checkIn', 'checkOut', 'adults', 'children', 'rooms'].includes(key)) {
          url.searchParams.set(key, value);
        }
      });
      
      router.push(url.toString());
    } else {
      router.push('/hoteis');
    }
  };

  const handleRateSelect = (rate: any) => {
    // Navegar para a página de booking
    const bookingUrl = `/hoteis/booking/${hotelId}/${slug}`;
    const url = new URL(bookingUrl, window.location.origin);
    
    // Preservar parâmetros de busca
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    
    url.searchParams.set('rateId', rate.id);
    
    router.push(url.toString());
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
              <h3 className="text-lg font-semibold text-gray-900">Carregando detalhes do hotel...</h3>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !hotel || !searchParameters) {
    return (
      <>
        <GlobalMobileStyles />
        <div className="min-h-screen bg-hotel-main flex flex-col">
          <ResponsiveHeader />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hotel não encontrado</h3>
              <p className="text-gray-600 mb-6">{error || 'O hotel solicitado não foi encontrado ou não está mais disponível.'}</p>
              <button
                onClick={handleBack}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar
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
          <HotelDetailsPage
            hotel={hotel}
            searchParams={searchParameters}
            onBack={handleBack}
            onRateSelect={handleRateSelect}
            isLoading={false}
            error={null}
          />
        </main>
        <Footer />
      </div>
    </>
  );
}

