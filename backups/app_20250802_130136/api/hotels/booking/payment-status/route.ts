import { NextRequest, NextResponse } from 'next/server';

interface PaymentStatusRequest {
  transactionId: string;
  paymentId?: string;
  status?: string;
}

interface PaymentStatusResponse {
  success: boolean;
  data?: {
    transactionId: string;
    paymentStatus: 'completed' | 'failed' | 'pending';
    bookingReference?: string;
    paymentDetails?: {
      amount: number;
      currency: string;
      formatted: string;
      paymentMethod: string;
      paymentId: string;
    };
  };
  error?: string;
}

/**
 * Verifica o status de um pagamento após retorno do SDK
 * POST /api/hotels/booking/payment-status
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] Payment status check request`);

    const body: PaymentStatusRequest = await request.json();
    const { transactionId, paymentId, status } = body;

    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: 'Transaction ID é obrigatório'
      }, { status: 400 });
    }

    console.log(`[${requestId}] Checking payment status:`, {
      transactionId,
      paymentId,
      status
    });

    // Para transações demo
    if (transactionId.startsWith('demo_')) {
      const mockResponse: PaymentStatusResponse = {
        success: true,
        data: {
          transactionId,
          paymentStatus: status === 'failed' ? 'failed' : 'completed',
          bookingReference: status === 'failed' ? undefined : `FLY2ANY-${Date.now().toString().slice(-6)}`,
          paymentDetails: status === 'failed' ? undefined : {
            amount: 850,
            currency: 'BRL',
            formatted: 'R$ 850,00',
            paymentMethod: 'credit_card',
            paymentId: paymentId || `demo_payment_${Date.now()}`
          }
        }
      };

      console.log(`[${requestId}] Demo payment status:`, mockResponse.data?.paymentStatus);
      return NextResponse.json(mockResponse);
    }

    // Para pagamentos reais, consultar LiteAPI
    const liteApiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.liteapi.travel/v3.0'
      : 'https://api.liteapi.travel/v3.0';

    const apiKey = process.env.NODE_ENV === 'production'
      ? process.env.LITEAPI_LIVE_KEY
      : process.env.LITEAPI_SANDBOX_KEY;

    if (!apiKey) {
      console.error(`[${requestId}] LiteAPI key not configured`);
      return NextResponse.json({
        success: false,
        error: 'Configuração de API não encontrada'
      }, { status: 500 });
    }

    // Consultar status do pagamento na LiteAPI
    console.log(`[${requestId}] Querying LiteAPI payment status`);

    const response = await fetch(`${liteApiUrl}/hotels/payment/status`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        paymentId
      })
    });

    const responseText = await response.text();
    console.log(`[${requestId}] LiteAPI payment status response:`, response.status);

    if (!response.ok) {
      console.error(`[${requestId}] LiteAPI payment status failed:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      return NextResponse.json({
        success: false,
        error: 'Erro ao verificar status do pagamento'
      }, { status: response.status });
    }

    const result = JSON.parse(responseText);
    console.log(`[${requestId}] Payment status result:`, result.data?.paymentStatus);

    // Se pagamento foi bem-sucedido, finalizar a reserva
    if (result.data?.paymentStatus === 'completed') {
      console.log(`[${requestId}] Payment completed, finalizing booking`);

      try {
        const bookingResponse = await fetch('/api/hotels/booking/finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId,
            paymentMethod: 'USER_PAYMENT',
            paymentDetails: {
              paymentProvider: 'LiteAPI SDK',
              paymentId: result.data.paymentId
            }
          }),
        });

        const bookingResult = await bookingResponse.json();

        if (bookingResult.success) {
          result.data.bookingReference = bookingResult.data.bookingReference;
          console.log(`[${requestId}] Booking finalized:`, bookingResult.data.bookingReference);
        } else {
          console.error(`[${requestId}] Failed to finalize booking:`, bookingResult.error);
        }
      } catch (bookingError) {
        console.error(`[${requestId}] Booking finalization error:`, bookingError);
        // Continue mesmo se a finalização falhar - o pagamento foi processado
      }
    }

    const paymentStatusResponse: PaymentStatusResponse = {
      success: true,
      data: {
        transactionId,
        paymentStatus: result.data.paymentStatus,
        bookingReference: result.data.bookingReference,
        paymentDetails: result.data.paymentDetails
      }
    };

    return NextResponse.json(paymentStatusResponse);

  } catch (error: any) {
    console.error('Payment status check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}

/**
 * Webhook para receber notificações de status de pagamento da LiteAPI
 * POST /api/hotels/booking/payment-status (com header X-Webhook-Event)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const webhookEvent = request.headers.get('X-Webhook-Event');
    
    if (webhookEvent !== 'payment.status.changed') {
      return NextResponse.json({ success: false, error: 'Invalid webhook event' }, { status: 400 });
    }

    const body = await request.json();
    const { transactionId, paymentStatus, paymentDetails } = body;

    console.log('Payment webhook received:', {
      transactionId,
      paymentStatus,
      event: webhookEvent
    });

    // Processar webhook de mudança de status de pagamento
    // Aqui você pode:
    // 1. Atualizar status no banco de dados
    // 2. Enviar notificações por email
    // 3. Executar outras ações baseadas no status

    if (paymentStatus === 'completed') {
      // Finalizar reserva automaticamente se ainda não foi finalizada
      console.log(`Webhook: Finalizing booking for transaction ${transactionId}`);
    } else if (paymentStatus === 'failed') {
      // Marcar transação como falhada
      console.log(`Webhook: Payment failed for transaction ${transactionId}`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Payment webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}