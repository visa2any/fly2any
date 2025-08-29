'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PaymentResult {
  success: boolean;
  transactionId: string;
  bookingReference?: string;
  error?: string;
  paymentDetails?: {
    amount: number;
    currency: string;
    formatted: string;
  };
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentReturn = async (): Promise<void> => {
      try {
        const transactionId = searchParams.get('transactionId');
        const status = searchParams.get('status');
        const paymentId = searchParams.get('paymentId');

        if (!transactionId) {
          throw new Error('Transaction ID não encontrado');
        }

        console.log('Processing payment return:', {
          transactionId,
          status,
          paymentId
        });

        // Para demo, simular sucesso
        if (transactionId.startsWith('demo_')) {
          setPaymentResult({
            success: status === 'success' || status !== 'failed',
            transactionId,
            bookingReference: `FLY2ANY-${Date.now().toString().slice(-6)}`,
            paymentDetails: {
              amount: 850,
              currency: 'BRL',
              formatted: 'R$ 850,00'
            }
          });
          setIsLoading(false);
          return;
        }

        // Para pagamentos reais, verificar status com a API
        const response = await fetch('/api/hotels/booking/payment-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId,
            paymentId,
            status
          }),
        });

        const result = await response.json();

        if (result.success) {
          setPaymentResult({
            success: true,
            transactionId,
            bookingReference: result.data.bookingReference,
            paymentDetails: result.data.paymentDetails
          });

          // Redirect para confirmação depois de 3 segundos se for sucesso
          if (result.data.bookingReference) {
            setTimeout(() => {
              router.push(`/hoteis/booking/confirmation?ref=${result.data.bookingReference}`);
            }, 3000);
          }
        } else {
          setPaymentResult({
            success: false,
            transactionId,
            error: result.error || 'Erro no processamento do pagamento'
          });
        }
      } catch (err) {
        console.error('Payment return processing error:', err);
        setError(err instanceof Error ? err.message : 'Erro ao processar retorno do pagamento');
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando pagamento...</p>
          <p className="text-sm text-gray-500 mt-2">Aguarde enquanto confirmamos sua transação</p>
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
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro no Processamento</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          
          <div className="space-y-3">
            <Link
              href="/hoteis"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
            >
              Voltar para Busca
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Nenhum resultado de pagamento encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {paymentResult.success ? (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={40} className="text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-green-600 mb-4">Pagamento Confirmado!</h1>
            <p className="text-gray-600 mb-6">
              Seu pagamento foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
            </p>

            {paymentResult.bookingReference && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Código da Reserva</div>
                <div className="font-mono text-lg font-semibold text-gray-900">
                  {paymentResult.bookingReference}
                </div>
              </div>
            )}

            {paymentResult.paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Valor Pago</div>
                <div className="text-xl font-semibold text-gray-900">
                  {paymentResult.paymentDetails.formatted}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {paymentResult.bookingReference ? (
                <Link
                  href={`/hoteis/booking/confirmation?ref=${paymentResult.bookingReference}`}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Ver Confirmação
                  <ExternalLink size={16} />
                </Link>
              ) : (
                <div className="text-sm text-gray-500">
                  Redirecionando para confirmação em alguns segundos...
                </div>
              )}
              
              <Link
                href="/hoteis"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Nova Busca
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-red-600 mb-4">Pagamento Não Processado</h1>
            <p className="text-gray-600 mb-8">
              {paymentResult.error || 'Houve um problema ao processar seu pagamento. Nenhuma cobrança foi realizada.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
              <Link
                href="/hoteis"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block"
              >
                Voltar para Busca
              </Link>
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Transaction ID: {paymentResult.transactionId}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando pagamento...</p>
        </div>
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
}