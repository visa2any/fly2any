import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { DatabaseFallback } from '@/lib/database-fallback';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    // Try database first
    try {
      await DatabaseService.initializeTables();
      const lead = await DatabaseService.getLeadById(leadId);
      
      if (lead) {
        return NextResponse.json(lead);
      }
    } catch (dbError) {
      console.warn('[ADMIN API] Database error, trying fallback:', dbError);
    }

    // Try fallback
    try {
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      const lead = fallbackLeads.find((l: any) => l.id === leadId);
      
      if (lead) {
        return NextResponse.json(lead);
      }
    } catch (fallbackError) {
      console.error('[ADMIN API] Fallback error:', fallbackError);
    }

    return NextResponse.json(
      { error: 'Lead not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('[ADMIN API] Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    const updateData = await request.json();

    // Add update timestamp
    const updatedLead = {
      ...updateData,
      id: leadId,
      updatedAt: new Date().toISOString()
    };

    // Try database first
    try {
      await DatabaseService.initializeTables();
      const result = await DatabaseService.updateLeadById(leadId, updatedLead);
      
      if (result) {
        return NextResponse.json({
          message: 'Lead updated successfully',
          lead: updatedLead,
          _source: 'database'
        });
      }
    } catch (dbError) {
      console.warn('[ADMIN API] Database update error, trying fallback:', dbError);
    }

    // Try fallback update
    try {
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      const leadIndex = fallbackLeads.findIndex((l: any) => l.id === leadId);
      
      if (leadIndex !== -1) {
        fallbackLeads[leadIndex] = { ...fallbackLeads[leadIndex], ...updatedLead };
        await DatabaseFallback.saveLeadsToFile(fallbackLeads);
        
        return NextResponse.json({
          message: 'Lead updated successfully',
          lead: updatedLead,
          _source: 'file'
        });
      }
    } catch (fallbackError) {
      console.error('[ADMIN API] Fallback update error:', fallbackError);
    }

    return NextResponse.json(
      { error: 'Lead not found or could not be updated' },
      { status: 404 }
    );

  } catch (error) {
    console.error('[ADMIN API] Error updating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    // Try database first
    try {
      await DatabaseService.initializeTables();
      const result = await DatabaseService.deleteLeadById(leadId);
      
      if (result) {
        return NextResponse.json({
          message: 'Lead deleted successfully',
          _source: 'database'
        });
      }
    } catch (dbError) {
      console.warn('[ADMIN API] Database delete error, trying fallback:', dbError);
    }

    // Try fallback delete
    try {
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      const leadIndex = fallbackLeads.findIndex((l: any) => l.id === leadId);
      
      if (leadIndex !== -1) {
        fallbackLeads.splice(leadIndex, 1);
        await DatabaseFallback.saveLeadsToFile(fallbackLeads);
        
        return NextResponse.json({
          message: 'Lead deleted successfully',
          _source: 'file'
        });
      }
    } catch (fallbackError) {
      console.error('[ADMIN API] Fallback delete error:', fallbackError);
    }

    return NextResponse.json(
      { error: 'Lead not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('[ADMIN API] Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}