import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { DatabaseFallback } from '@/lib/database-fallback';

// Bulk update leads
export async function PUT(request: NextRequest) {
  try {
    const { leadIds, updateData } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Lead IDs are required' },
        { status: 400 }
      );
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Update data is required' },
        { status: 400 }
      );
    }

    // Add update timestamp
    const enrichedUpdateData = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Try database first
    try {
      await DatabaseService.initializeTables();
      const updatedCount = await DatabaseService.bulkUpdateLeads(leadIds, enrichedUpdateData);
      
      return NextResponse.json({
        message: `${updatedCount} leads updated successfully`,
        updatedCount,
        _source: 'database'
      });
    } catch (dbError) {
      console.warn('[BULK API] Database update error, trying fallback:', dbError);
    }

    // Try fallback update
    try {
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      let updatedCount = 0;
      
      const updatedLeads = fallbackLeads.map((lead: any) => {
        if (leadIds.includes(lead.id)) {
          updatedCount++;
          return { ...lead, ...enrichedUpdateData };
        }
        return lead;
      });

      await DatabaseFallback.saveLeadsToFile(updatedLeads);
      
      return NextResponse.json({
        message: `${updatedCount} leads updated successfully`,
        updatedCount,
        _source: 'file'
      });
    } catch (fallbackError) {
      console.error('[BULK API] Fallback update error:', fallbackError);
      throw fallbackError;
    }

  } catch (error) {
    console.error('[BULK API] Error bulk updating leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk delete leads
export async function DELETE(request: NextRequest) {
  try {
    const { leadIds } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Lead IDs are required' },
        { status: 400 }
      );
    }

    // Try database first
    try {
      await DatabaseService.initializeTables();
      const deletedCount = await DatabaseService.bulkDeleteLeads(leadIds);
      
      return NextResponse.json({
        message: `${deletedCount} leads deleted successfully`,
        deletedCount,
        _source: 'database'
      });
    } catch (dbError) {
      console.warn('[BULK API] Database delete error, trying fallback:', dbError);
    }

    // Try fallback delete
    try {
      const fallbackLeads = await DatabaseFallback.getLeadsFromFile();
      const initialCount = fallbackLeads.length;
      
      const remainingLeads = fallbackLeads.filter((lead: any) => 
        !leadIds.includes(lead.id)
      );

      const deletedCount = initialCount - remainingLeads.length;
      await DatabaseFallback.saveLeadsToFile(remainingLeads);
      
      return NextResponse.json({
        message: `${deletedCount} leads deleted successfully`,
        deletedCount,
        _source: 'file'
      });
    } catch (fallbackError) {
      console.error('[BULK API] Fallback delete error:', fallbackError);
      throw fallbackError;
    }

  } catch (error) {
    console.error('[BULK API] Error bulk deleting leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}