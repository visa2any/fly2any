import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { handleApiError, ErrorCategory, ErrorSeverity } from '@/lib/monitoring/global-error-handler';

// GET - Fetch single quote by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiError(request, async () => {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch quote (RLS ensures ownership)
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .eq('agent_id', user.id)
      .is('deleted_at', null)
      .single();

    if (error || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Transform to frontend format
    return NextResponse.json({
      id: quote.id,
      status: quote.status,
      tripName: quote.trip_name,
      destination: quote.destination,
      startDate: quote.start_date,
      endDate: quote.end_date,
      travelers: quote.travelers,
      items: quote.items,
      pricing: quote.pricing,
      client: quote.client_data,
      version: quote.version,
      createdAt: quote.created_at,
      updatedAt: quote.updated_at,
      sentAt: quote.sent_at,
      viewedAt: quote.viewed_at,
      acceptedAt: quote.accepted_at,
    });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.NORMAL });
}

// DELETE - Soft delete quote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiError(request, async () => {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete (RLS ensures ownership)
    const { error } = await supabase
      .from('quotes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('agent_id', user.id);

    if (error) {
      console.error('Delete quote error:', error);
      return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}

// PATCH - Update quote status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiError(request, async () => {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, action } = body;

    // Build update based on action
    const updates: Record<string, any> = {};

    if (status) {
      updates.status = status;
    }

    // Handle specific actions
    if (action === 'send') {
      updates.status = 'sent';
      updates.sent_at = new Date().toISOString();
      updates.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    } else if (action === 'view') {
      updates.viewed_at = new Date().toISOString();
    } else if (action === 'accept') {
      updates.status = 'accepted';
      updates.accepted_at = new Date().toISOString();
    } else if (action === 'decline') {
      updates.status = 'declined';
      updates.declined_at = new Date().toISOString();
    } else if (action === 'archive') {
      updates.status = 'archived';
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Update quote
    const { data: quote, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .eq('agent_id', user.id)
      .select('id, status, version, updated_at')
      .single();

    if (error) {
      console.error('Patch quote error:', error);
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: quote.id,
      status: quote.status,
      version: quote.version,
      updatedAt: quote.updated_at,
    });
  }, { category: ErrorCategory.DATABASE, severity: ErrorSeverity.HIGH });
}
