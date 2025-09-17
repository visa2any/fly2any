import { NextRequest, NextResponse } from 'next/server';
import { EmailQueueService } from '@/lib/email-marketing/email-queue-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'stats':
        const stats = await EmailQueueService.getQueueStats();
        return NextResponse.json(stats);

      case 'process':
        const batchSize = parseInt(searchParams.get('batch') || '10');
        const processResult = await EmailQueueService.processQueue(batchSize);
        return NextResponse.json(processResult);

      default:
        return NextResponse.json({
          success: true,
          message: 'Email Queue API',
          endpoints: [
            'GET ?action=stats - Get queue statistics',
            'GET ?action=process&batch=10 - Process queue',
            'POST ?action=add - Add email to queue',
            'POST ?action=bulk - Queue bulk campaign',
            'DELETE ?action=clear_failed - Clear failed emails',
            'PUT ?action=retry_failed - Retry failed emails'
          ]
        });
    }
  } catch (error) {
    console.error('Queue API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const body = await request.json();

    switch (action) {
      case 'add':
        const addResult = await EmailQueueService.addToQueue(body);
        return NextResponse.json(addResult);

      case 'bulk':
        const bulkResult = await EmailQueueService.queueBulkCampaign(body);
        return NextResponse.json(bulkResult);

      default:
        return NextResponse.json({
          success: false,
          error: 'Action not found'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Queue POST Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'clear_failed':
        const clearResult = await EmailQueueService.clearFailedEmails();
        return NextResponse.json(clearResult);

      default:
        return NextResponse.json({
          success: false,
          error: 'Action not found'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Queue DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'retry_failed':
        const retryResult = await EmailQueueService.retryFailedEmails();
        return NextResponse.json(retryResult);

      default:
        return NextResponse.json({
          success: false,
          error: 'Action not found'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Queue PUT Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}