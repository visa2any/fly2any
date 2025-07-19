/**
 * Enhanced Leads API Route - Version 2
 * 
 * This is the new, refactored leads API that uses the unified LeadService
 * and provides enhanced error handling, validation, and observability.
 */

import { NextRequest, NextResponse } from 'next/server';
import { LeadService } from '@/lib/services/lead-service';
import { CreateLeadInput } from '@/lib/schemas/lead';
import { sendLeadNotification } from '@/lib/lead-notifications';

// Types for the API
interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    [key: string]: unknown;
  };
}

/**
 * Enhanced error handling with structured logging
 */
function handleError(error: unknown, requestId: string, operation: string): NextResponse {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const statusCode = (error instanceof Error && error.name === 'ValidationError') ? 400 : 500;
  
  // Log error for monitoring (in production, use proper logging service)
  console.error(`[${new Date().toISOString()}] API Error - ${operation}`, {
    requestId,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    operation
  });
  
  const response: APIResponse = {
    success: false,
    error: errorMessage,
    message: statusCode === 500 ? 'Internal server error' : errorMessage,
    metadata: {
      requestId,
      timestamp: new Date().toISOString(),
      processingTime: 0
    }
  };
  
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Get client metadata from request
 */
function getClientMetadata(request: NextRequest) {
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown',
    pageUrl: request.headers.get('referer') || undefined,
    sessionId: request.headers.get('x-session-id') || undefined
  };
}

/**
 * Type guard to ensure lead data has required properties
 */
function isValidLeadData(data: Record<string, unknown>): data is Record<string, any> {
  return typeof data === 'object' && data !== null;
}

/**
 * Process lead asynchronously (notifications, integrations, etc.)
 */
async function processLeadAsync(leadData: any, requestId: string) {
  const promises: Promise<unknown>[] = [];
  
  try {
    // leadData is already typed as any
    const lead = leadData;
    
    // Send admin notification
    promises.push(
      sendLeadNotification({
        id: lead.id,
        nome: lead.nome,
        email: lead.email,
        whatsapp: lead.whatsapp,
        telefone: lead.telefone,
        origem: lead.origem || '',
        destino: lead.destino || '',
        selectedServices: lead.selectedServices || [],
        source: lead.source || 'website',
        createdAt: lead.createdAt || new Date().toISOString(),
        orcamentoTotal: lead.orcamentoTotal || lead.orcamentoAproximado,
        dataPartida: lead.dataPartida || lead.dataIda,
        dataRetorno: lead.dataRetorno || lead.dataVolta,
        tipoViagem: lead.tipoViagem,
        numeroPassageiros: lead.numeroPassageiros || lead.adultos || 1,
        adultos: lead.adultos,
        criancas: lead.criancas,
        bebes: lead.bebes,
        classeViagem: lead.classeViagem || lead.classeVoo,
        prioridadeOrcamento: lead.prioridadeOrcamento,
        precisaHospedagem: lead.precisaHospedagem,
        precisaTransporte: lead.precisaTransporte,
        observacoes: lead.observacoes,
        fullData: lead.fullData || lead
      }).catch(error => {
        console.error(`[${requestId}] Email notification failed:`, error);
        return { success: false, error: error.message };
      })
    );
    
    // Send to N8N webhook if configured
    if (process.env.N8N_WEBHOOK_LEAD) {
      promises.push(
        fetch(process.env.N8N_WEBHOOK_LEAD, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            source: 'fly2any_website',
            requestId,
            leadData
          }),
          signal: AbortSignal.timeout(10000) // 10s timeout
        }).then(response => {
          if (!response.ok) {
            throw new Error(`N8N webhook failed: ${response.status}`);
          }
          return { success: true, service: 'n8n' };
        }).catch(error => {
          console.error(`[${requestId}] N8N webhook failed:`, error);
          return { success: false, error: error.message, service: 'n8n' };
        })
      );
    }
    
    // Execute all async operations
    const results = await Promise.allSettled(promises);
    
    // Log results for monitoring
    const processingSummary = {
      requestId,
      totalOperations: results.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results.map((result, index) => ({
        operation: index === 0 ? 'email_notification' : 'n8n_webhook',
        status: result.status,
        ...(result.status === 'fulfilled' ? { result: result.value } : { error: result.reason })
      }))
    };
    
    console.log(`[${requestId}] Async processing completed:`, processingSummary);
    
    return processingSummary;
    
  } catch (error) {
    console.error(`[${requestId}] Async processing failed:`, error);
    return {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * POST /api/leads - Create new lead
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  
  try {
    // Parse request body
    let requestBody: Record<string, unknown>;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      }, { status: 400 });
    }
    
    // Get client metadata
    const clientMetadata = getClientMetadata(request);
    
    // Prepare lead input
    const leadInput: CreateLeadInput = {
      ...requestBody,
      ...clientMetadata,
      source: (requestBody.source as string) || 'website'
    } as CreateLeadInput;
    
    // Log request for monitoring
    console.log(`[${requestId}] Lead creation request:`, {
      nome: leadInput.nome,
      email: leadInput.email,
      selectedServices: leadInput.selectedServices,
      source: leadInput.source,
      ipAddress: clientMetadata.ipAddress
    });
    
    // Create lead using unified service
    const result = await LeadService.createLead(leadInput);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to create lead',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          validationErrors: result.metadata?.validationErrors
        }
      }, { status: 400 });
    }
    
    const lead = result.data!;
    
    // Process async operations (don't wait for them)
    processLeadAsync(lead, requestId);
    
    // Return success response
    const response: APIResponse = {
      success: true,
      data: {
        leadId: lead.id,
        status: lead.status,
        createdAt: lead.createdAt
      },
      message: 'Lead created successfully',
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        storage: result.metadata?.storage || 'unknown'
      }
    };
    
    return NextResponse.json(response, { 
      status: 201,
      headers: {
        'X-Request-Id': requestId
      }
    });
    
  } catch (error) {
    return handleError(error, requestId, 'CREATE_LEAD');
  }
}

/**
 * GET /api/leads - Retrieve leads with filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100), // Max 100 per page
      status: searchParams.get('status') as any || undefined,
      priority: searchParams.get('priority') as any || undefined,
      source: searchParams.get('source') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') || 'createdAt') as any,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    };
    
    // Log request
    console.log(`[${requestId}] Lead retrieval request:`, queryParams);
    
    // Get leads using unified service
    const result = await LeadService.getLeads(queryParams);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to retrieve leads',
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      }, { status: 500 });
    }
    
    // Return success response
    const response: APIResponse = {
      success: true,
      data: result.data,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        storage: result.metadata?.storage || 'unknown'
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        'X-Request-Id': requestId,
        'Cache-Control': 'private, max-age=60' // Cache for 1 minute
      }
    });
    
  } catch (error) {
    return handleError(error, requestId, 'GET_LEADS');
  }
}

/**
 * PUT /api/leads/[id] - Update lead (will be handled by dynamic route)
 */

/**
 * GET /api/leads/stats - Get lead statistics
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://fly2any.com' : '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// Export configuration for the API route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';