import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

// Types
interface QuotePayload {
  id?: string;
  tripName?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: {
    adults: number;
    children: number;
    infants: number;
    total: number;
  };
  items?: any[];
  pricing?: {
    subtotal: number;
    markupPercent: number;
    markupAmount: number;
    taxes: number;
    fees: number;
    discount: number;
    total: number;
    perPerson: number;
    currency: string;
  };
  clientId?: string;
  clientData?: any;
  status?: string;
}

// GET - List quotes for agent
export async function GET(request: NextRequest) {
  return handleApiError(request, async () => {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('quotes')
      .select('id, trip_name, destination, start_date, end_date, status, travelers, pricing, created_at, updated_at', { count: 'exact' })
      .eq('agent_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.textSearch('search_vector', search);
    }

    const { data: quotes, error, count } = await query;

    if (error) {
      console.error('List quotes error:', error);
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: quotes?.map(q => ({
        id: q.id,
        tripName: q.trip_name,
        destination: q.destination,
        startDate: q.start_date,
        endDate: q.end_date,
        status: q.status,
        travelers: q.travelers,
        pricing: q.pricing,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      })) || [],
      total: count || 0,
      limit,
      offset,
    });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.NORMAL });
}

// POST - Create new quote
export async function POST(request: NextRequest) {
  return handleApiError(request, async () => {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: QuotePayload = await request.json();

    // Insert quote
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        agent_id: user.id,
        trip_name: body.tripName || null,
        destination: body.destination || null,
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        travelers: body.travelers || { adults: 1, children: 0, infants: 0, total: 1 },
        items: body.items || [],
        pricing: body.pricing || {
          subtotal: 0,
          markupPercent: 15,
          markupAmount: 0,
          taxes: 0,
          fees: 0,
          discount: 0,
          total: 0,
          perPerson: 0,
          currency: 'USD',
        },
        client_id: body.clientId || null,
        client_data: body.clientData || null,
        status: body.status || 'draft',
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Create quote error:', error);
      return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: quote.id,
      createdAt: quote.created_at,
    });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}

// PUT - Update existing quote
export async function PUT(request: NextRequest) {
  return handleApiError(request, async () => {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: QuotePayload = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 });
    }

    // Update quote (RLS will ensure ownership)
    const { data: quote, error } = await supabase
      .from('quotes')
      .update({
        trip_name: body.tripName,
        destination: body.destination,
        start_date: body.startDate || null,
        end_date: body.endDate || null,
        travelers: body.travelers,
        items: body.items,
        pricing: body.pricing,
        client_id: body.clientId || null,
        client_data: body.clientData,
        status: body.status,
      })
      .eq('id', body.id)
      .eq('agent_id', user.id) // Security: double-check ownership
      .select('id, version, updated_at')
      .single();

    if (error) {
      console.error('Update quote error:', error);
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: quote.id,
      version: quote.version,
      updatedAt: quote.updated_at,
    });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}
