import { NextRequest, NextResponse } from 'next/server';
import { DatabaseChecker } from '@/lib/database-checker';
import { sql } from '@vercel/postgres';

// Comprehensive bulk operations endpoint
export async function POST(request: NextRequest) {
  try {
    const { action, leadIds, data } = await request.json();

    // Check database connection
    const dbStatus = await DatabaseChecker.checkConnection();
    if (!dbStatus.connected) {
      return NextResponse.json(
        { error: 'Database connection failed', details: dbStatus },
        { status: 500 }
      );
    }

    // Initialize tables
    await DatabaseChecker.initializeTables();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Lead IDs are required and must be a non-empty array' },
        { status: 400 }
      );
    }

    let result;
    let message = '';

    switch (action) {
      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }
        // Update each lead individually for better type safety
        const statusUpdatePromises = leadIds.map((id: string) => 
          sql`UPDATE leads SET status = ${data.status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
        );
        await Promise.all(statusUpdatePromises);
        result = { updated: leadIds.length, status: data.status };
        message = `Status de ${leadIds.length} leads atualizado para "${data.status}"`;
        break;

      case 'assign':
        if (!data?.assignedTo) {
          return NextResponse.json({ error: 'assignedTo is required' }, { status: 400 });
        }
        // Update each lead individually for better type safety
        const assignUpdatePromises = leadIds.map((id: string) => 
          sql`UPDATE leads SET assigned_to = ${data.assignedTo}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
        );
        await Promise.all(assignUpdatePromises);
        result = { updated: leadIds.length, assignedTo: data.assignedTo };
        message = `${leadIds.length} leads atribuídos a "${data.assignedTo}"`;
        break;

      case 'updatePriority':
        if (!data?.priority) {
          return NextResponse.json({ error: 'Priority is required' }, { status: 400 });
        }
        // Update each lead individually for better type safety
        const priorityUpdatePromises = leadIds.map((id: string) => 
          sql`UPDATE leads SET priority = ${data.priority}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`
        );
        await Promise.all(priorityUpdatePromises);
        result = { updated: leadIds.length, priority: data.priority };
        message = `Prioridade de ${leadIds.length} leads atualizada para "${data.priority}"`;
        break;

      case 'addTags':
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
        }
        // Update full_data JSONB field with tags
        for (const leadId of leadIds) {
          await sql`
            UPDATE leads 
            SET full_data = COALESCE(full_data, '{}'::jsonb) || jsonb_build_object('addedTags', 
              COALESCE((full_data->>'addedTags')::jsonb, '[]'::jsonb) || ${JSON.stringify(data.tags)}::jsonb
            ), updated_at = CURRENT_TIMESTAMP
            WHERE id = ${leadId}
          `;
        }
        result = { updated: leadIds.length, tagsAdded: data.tags };
        message = `Tags adicionadas a ${leadIds.length} leads`;
        break;

      case 'removeTags':
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
        }
        // Remove tags from full_data
        for (const leadId of leadIds) {
          await sql`
            UPDATE leads 
            SET full_data = COALESCE(full_data, '{}'::jsonb) || jsonb_build_object('removedTags', 
              COALESCE((full_data->>'removedTags')::jsonb, '[]'::jsonb) || ${JSON.stringify(data.tags)}::jsonb
            ), updated_at = CURRENT_TIMESTAMP
            WHERE id = ${leadId}
          `;
        }
        result = { updated: leadIds.length, tagsRemoved: data.tags };
        message = `Tags removidas de ${leadIds.length} leads`;
        break;

      case 'export':
        // Get lead data for export
        // Build dynamic WHERE clause for export
        const whereClause = leadIds.map((_: string, index: number) => `id = $${index + 1}`).join(' OR ');
        const query = `SELECT id, nome, email, whatsapp, telefone, origem, destino, data_partida, data_retorno, numero_passageiros, status, priority, assigned_to, source, orcamento_total, created_at, updated_at, observacoes, full_data FROM leads WHERE ${whereClause} ORDER BY created_at DESC`;
        const exportData = await sql.query(query, leadIds);
        result = { leads: exportData.rows, count: exportData.rows.length };
        message = `Dados de ${exportData.rows.length} leads preparados para exportação`;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    console.log(`[BULK-OPERATION] ${action} executed on ${leadIds.length} leads`);

    return NextResponse.json({
      success: true,
      message,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[BULK-OPERATION] Error:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Legacy bulk update support
export async function PUT(request: NextRequest) {
  try {
    const { leadIds, updateData } = await request.json();
    
    // Convert to POST format
    return POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateStatus',
        leadIds,
        data: updateData
      })
    }));
  } catch (error) {
    console.error('[BULK-API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Check database connection
    const dbStatus = await DatabaseChecker.checkConnection();
    if (!dbStatus.connected) {
      return NextResponse.json(
        { error: 'Database connection failed', details: dbStatus },
        { status: 500 }
      );
    }

    // Initialize tables
    await DatabaseChecker.initializeTables();

    // Delete leads
    // Build dynamic WHERE clause for delete
    const whereClause = leadIds.map((_: string, index: number) => `id = $${index + 1}`).join(' OR ');
    const query = `DELETE FROM leads WHERE ${whereClause}`;
    const deleteResult = await sql.query(query, leadIds);
    const deletedCount = deleteResult.rowCount || 0;

    console.log(`[BULK-DELETE] ${deletedCount} leads deleted successfully`);

    return NextResponse.json({
      success: true,
      message: `${deletedCount} leads excluídos com sucesso`,
      deletedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[BULK-DELETE] Error:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for testing bulk operations availability
export async function GET() {
  return NextResponse.json({
    message: 'Bulk Operations API is available',
    endpoints: {
      POST: 'Bulk operations (updateStatus, assign, updatePriority, addTags, removeTags, export)',
      PUT: 'Legacy bulk update',
      DELETE: 'Bulk delete'
    },
    actions: [
      'updateStatus',
      'assign', 
      'updatePriority',
      'addTags',
      'removeTags',
      'export'
    ],
    timestamp: new Date().toISOString()
  });
}