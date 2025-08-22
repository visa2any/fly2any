import { NextRequest, NextResponse } from 'next/server';
import { automationEngine } from '@/lib/email/automation-workflows';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'workflows':
        // Return available workflows
        return NextResponse.json({
          success: true,
          data: {
            workflows: [
              {
                id: 'welcome-series-v1',
                name: 'Welcome Series for New Leads',
                description: 'A 3-email welcome series for new subscribers',
                isActive: true,
                trigger: 'user.created',
                steps: 7,
                stats: { triggered: 245, completed: 198, failed: 12 }
              },
              {
                id: 'price-drop-alert-v1',
                name: 'Price Drop Alerts',
                description: 'Automated price drop notifications for saved routes',
                isActive: true,
                trigger: 'price.dropped',
                steps: 4,
                stats: { triggered: 892, completed: 845, failed: 15 }
              },
              {
                id: 'booking-followup-v1',
                name: 'Booking Follow-up Series',
                description: 'Post-booking communication workflow',
                isActive: true,
                trigger: 'booking.confirmed',
                steps: 6,
                stats: { triggered: 156, completed: 134, failed: 8 }
              },
              {
                id: 're-engagement-v1',
                name: 'Re-engagement Campaign',
                description: 'Win back inactive subscribers',
                isActive: true,
                trigger: 'user.inactive',
                steps: 5,
                stats: { triggered: 78, completed: 45, failed: 12 }
              },
              {
                id: 'abandoned-search-v1',
                name: 'Abandoned Search Recovery',
                description: 'Follow up on abandoned flight searches',
                isActive: true,
                trigger: 'search.abandoned',
                steps: 6,
                stats: { triggered: 324, completed: 287, failed: 18 }
              }
            ]
          }
        });

      case 'executions':
        const userId = searchParams.get('userId');
        const workflowId = searchParams.get('workflowId');
        
        // Return workflow executions (mock data)
        return NextResponse.json({
          success: true,
          data: {
            executions: [
              {
                id: 'exec_1234567890',
                workflowId: 'welcome-series-v1',
                userId: 'user_123',
                status: 'running',
                currentStep: 'wait-2-days',
                startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                progress: 2,
                totalSteps: 7
              },
              {
                id: 'exec_2345678901',
                workflowId: 'price-drop-alert-v1',
                userId: 'user_456',
                status: 'completed',
                currentStep: 'completed',
                startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                progress: 4,
                totalSteps: 4
              }
            ]
          }
        });

      case 'triggers':
        // Return available triggers
        return NextResponse.json({
          success: true,
          data: {
            triggers: [
              {
                id: 'user.created',
                name: 'User Created',
                description: 'Triggered when a new user signs up',
                events: ['user_signup', 'lead_captured'],
                isActive: true
              },
              {
                id: 'price.dropped',
                name: 'Price Drop Detected',
                description: 'Triggered when flight prices drop significantly',
                events: ['price_check', 'price_alert'],
                isActive: true
              },
              {
                id: 'booking.confirmed',
                name: 'Booking Confirmed',
                description: 'Triggered when a booking is successfully completed',
                events: ['booking_success', 'payment_completed'],
                isActive: true
              },
              {
                id: 'user.inactive',
                name: 'User Inactive',
                description: 'Triggered when user has been inactive for 30+ days',
                events: ['activity_check'],
                isActive: true
              },
              {
                id: 'search.abandoned',
                name: 'Search Abandoned',
                description: 'Triggered when user abandons flight search',
                events: ['search_timeout', 'page_exit'],
                isActive: true
              }
            ]
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Email Automation API',
            endpoints: [
              'GET /api/email/automation?action=workflows',
              'GET /api/email/automation?action=executions',
              'GET /api/email/automation?action=triggers',
              'POST /api/email/automation/trigger',
              'POST /api/email/automation/pause',
              'POST /api/email/automation/resume'
            ]
          }
        });
    }
  } catch (error) {
    console.error('❌ Automation API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Automation API error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflowId, userId, triggerData, executionId } = body;

    switch (action) {
      case 'trigger':
        if (!workflowId || !userId) {
          return NextResponse.json(
            { success: false, error: 'Workflow ID and User ID are required' },
            { status: 400 }
          );
        }

        const execution = await automationEngine.triggerWorkflow(
          workflowId,
          userId,
          triggerData || {}
        );

        return NextResponse.json({
          success: true,
          data: {
            executionId: execution.id,
            status: execution.status,
            message: 'Workflow triggered successfully'
          }
        });

      case 'pause':
        if (!executionId) {
          return NextResponse.json(
            { success: false, error: 'Execution ID is required' },
            { status: 400 }
          );
        }

        automationEngine.pauseExecution(executionId);
        
        return NextResponse.json({
          success: true,
          message: 'Workflow execution paused'
        });

      case 'resume':
        if (!executionId) {
          return NextResponse.json(
            { success: false, error: 'Execution ID is required' },
            { status: 400 }
          );
        }

        await automationEngine.resumeExecution(executionId);
        
        return NextResponse.json({
          success: true,
          message: 'Workflow execution resumed'
        });

      case 'initialize':
        await automationEngine.initializeWorkflows();
        
        return NextResponse.json({
          success: true,
          message: 'Automation workflows initialized'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Automation action failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Automation action failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}