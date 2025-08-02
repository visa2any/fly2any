import { NextRequest, NextResponse } from 'next/server';
import PhoneDatabaseService from '@/lib/phone-database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    // Inicializar tabelas se necessário
    await PhoneDatabaseService.initializeTables();

    switch (action) {
      case 'stats':
        const stats = await PhoneDatabaseService.getOverallStats();
        return NextResponse.json(stats);

      case 'state-stats':
        const stateStats = await PhoneDatabaseService.getStateStats();
        return NextResponse.json(stateStats);

      case 'contacts':
        const filters = {
          state: searchParams.get('state') || undefined,
          segment: searchParams.get('segment') || undefined,
          is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
          opted_out: searchParams.get('opted_out') ? searchParams.get('opted_out') === 'true' : undefined,
          search: searchParams.get('search') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
        };
        
        const contacts = await PhoneDatabaseService.getContacts(filters);
        return NextResponse.json(contacts);

      case 'lists':
        const lists = await PhoneDatabaseService.getLists();
        return NextResponse.json(lists);

      default:
        return NextResponse.json({ 
          error: 'Action parameter required' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Phone management API error:', error);
    
    // Return default values based on action to prevent frontend crashes
    const action = searchParams.get('action');
    if (action === 'stats') {
      return NextResponse.json({
        totalContacts: 0,
        validatedContacts: 0,
        activeContacts: 0,
        optedOutContacts: 0,
        totalLists: 0,
        activeCampaigns: 0
      });
    } else if (action === 'state-stats') {
      return NextResponse.json([]);
    } else if (action === 'contacts') {
      return NextResponse.json({ contacts: [], total: 0 });
    } else if (action === 'lists') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    await PhoneDatabaseService.initializeTables();

    switch (action) {
      case 'create_contact':
        const newContact = await PhoneDatabaseService.createContact(data);
        return NextResponse.json(newContact);

      case 'update_contact':
        const updatedContact = await PhoneDatabaseService.updateContact(data.id, data.updates);
        return NextResponse.json(updatedContact);

      case 'delete_contact':
        await PhoneDatabaseService.deleteContact(data.id);
        return NextResponse.json({ success: true });

      case 'delete_multiple_contacts':
        await PhoneDatabaseService.deleteMultipleContacts(data.ids);
        return NextResponse.json({ success: true });

      case 'create_list':
        const newList = await PhoneDatabaseService.createList(data);
        return NextResponse.json(newList);

      case 'add_to_list':
        await PhoneDatabaseService.addContactsToList(data.listId, data.contactIds);
        return NextResponse.json({ success: true });

      case 'remove_from_list':
        await PhoneDatabaseService.removeContactsFromList(data.listId, data.contactIds);
        return NextResponse.json({ success: true });

      case 'bulk_import':
        // Importação em massa de contatos
        const results = {
          imported: 0,
          errors: [] as string[]
        };

        for (const contact of data.contacts) {
          try {
            await PhoneDatabaseService.createContact(contact);
            results.imported++;
          } catch (error) {
            results.errors.push(`Error importing ${contact.phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        return NextResponse.json(results);

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Phone management API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}