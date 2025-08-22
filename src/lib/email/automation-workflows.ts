/**
 * 🤖 EMAIL AUTOMATION WORKFLOWS
 * Advanced automation system for trigger-based campaigns
 */

import { emailService } from './email-service';
import { campaignManager, Campaign, CampaignType } from './campaign-manager';
import { prisma } from '@/lib/database/prisma';

export interface AutomationTrigger {
  id: string;
  name: string;
  event: string;
  conditions?: TriggerCondition[];
  isActive: boolean;
  workflows: string[]; // Workflow IDs to execute
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: any;
  logicOperator?: 'AND' | 'OR';
}

export interface WorkflowStep {
  id: string;
  type: 'email' | 'wait' | 'condition' | 'tag_update' | 'webhook';
  name: string;
  config: {
    templateId?: string;
    delay?: number; // in minutes
    condition?: TriggerCondition;
    tags?: string[];
    webhookUrl?: string;
    customData?: Record<string, any>;
  };
  nextStepId?: string;
  alternateStepId?: string; // For condition branches
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
  stats: {
    triggered: number;
    completed: number;
    failed: number;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  currentStepId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  context: Record<string, any>;
  executionLog: ExecutionLogEntry[];
}

export interface ExecutionLogEntry {
  stepId: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  data?: Record<string, any>;
}

export class AutomationEngine {
  private activeExecutions = new Map<string, WorkflowExecution>();

  /**
   * Initialize pre-built automation workflows
   */
  async initializeWorkflows(): Promise<void> {
    const workflows = [
      await this.createWelcomeSeriesWorkflow(),
      await this.createPriceDropAlertWorkflow(),
      await this.createBookingFollowUpWorkflow(),
      await this.createReEngagementWorkflow(),
      await this.createAbandonedSearchWorkflow()
    ];

    console.log(`🤖 Initialized ${workflows.length} automation workflows`);
  }

  /**
   * Create Welcome Series Workflow
   */
  private async createWelcomeSeriesWorkflow(): Promise<AutomationWorkflow> {
    return {
      id: 'welcome-series-v1',
      name: 'Welcome Series for New Leads',
      description: 'A 3-email welcome series for new subscribers',
      isActive: true,
      trigger: {
        id: 'new-user-signup',
        name: 'New User Signup',
        event: 'user.created',
        conditions: [
          {
            field: 'source',
            operator: 'not_equals',
            value: 'admin'
          }
        ],
        isActive: true,
        workflows: ['welcome-series-v1']
      },
      steps: [
        {
          id: 'welcome-email-1',
          type: 'email',
          name: 'Welcome Email (Immediate)',
          config: {
            templateId: 'welcome-lead',
            delay: 0
          },
          nextStepId: 'wait-2-days'
        },
        {
          id: 'wait-2-days',
          type: 'wait',
          name: 'Wait 2 Days',
          config: {
            delay: 2880 // 48 hours in minutes
          },
          nextStepId: 'check-engagement'
        },
        {
          id: 'check-engagement',
          type: 'condition',
          name: 'Check Email Engagement',
          config: {
            condition: {
              field: 'lastEmailOpened',
              operator: 'gte',
              value: 1
            }
          },
          nextStepId: 'engaged-email',
          alternateStepId: 'non-engaged-email'
        },
        {
          id: 'engaged-email',
          type: 'email',
          name: 'Getting Started Guide (Engaged)',
          config: {
            templateId: 'getting-started-engaged',
            delay: 0
          },
          nextStepId: 'wait-5-days'
        },
        {
          id: 'non-engaged-email',
          type: 'email',
          name: 'Special Offer (Non-Engaged)',
          config: {
            templateId: 'special-offer-reengagement',
            delay: 0
          },
          nextStepId: 'wait-5-days'
        },
        {
          id: 'wait-5-days',
          type: 'wait',
          name: 'Wait 5 Days',
          config: {
            delay: 7200 // 5 days in minutes
          },
          nextStepId: 'final-email'
        },
        {
          id: 'final-email',
          type: 'email',
          name: 'First Deal Recommendations',
          config: {
            templateId: 'first-deal-recommendations',
            delay: 0
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0
      }
    };
  }

  /**
   * Create Price Drop Alert Workflow
   */
  private async createPriceDropAlertWorkflow(): Promise<AutomationWorkflow> {
    return {
      id: 'price-drop-alert-v1',
      name: 'Price Drop Alerts',
      description: 'Automated price drop notifications for saved routes',
      isActive: true,
      trigger: {
        id: 'price-drop-detected',
        name: 'Price Drop Detected',
        event: 'price.dropped',
        conditions: [
          {
            field: 'percentageDiscount',
            operator: 'gte',
            value: 15 // At least 15% discount
          }
        ],
        isActive: true,
        workflows: ['price-drop-alert-v1']
      },
      steps: [
        {
          id: 'check-alert-frequency',
          type: 'condition',
          name: 'Check Alert Frequency',
          config: {
            condition: {
              field: 'lastAlertSent',
              operator: 'lt',
              value: Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
            }
          },
          nextStepId: 'send-price-alert',
          alternateStepId: 'log-skipped'
        },
        {
          id: 'send-price-alert',
          type: 'email',
          name: 'Send Price Drop Alert',
          config: {
            templateId: 'price-drop-alert',
            delay: 0
          },
          nextStepId: 'update-alert-timestamp'
        },
        {
          id: 'update-alert-timestamp',
          type: 'tag_update',
          name: 'Update Last Alert Timestamp',
          config: {
            tags: [`lastAlertSent:${Date.now()}`]
          }
        },
        {
          id: 'log-skipped',
          type: 'webhook',
          name: 'Log Skipped Alert',
          config: {
            webhookUrl: '/api/automation/log',
            customData: {
              action: 'alert_skipped',
              reason: 'frequency_limit'
            }
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0
      }
    };
  }

  /**
   * Create Booking Follow-up Workflow
   */
  private async createBookingFollowUpWorkflow(): Promise<AutomationWorkflow> {
    return {
      id: 'booking-followup-v1',
      name: 'Booking Follow-up Series',
      description: 'Post-booking communication workflow',
      isActive: true,
      trigger: {
        id: 'booking-confirmed',
        name: 'Booking Confirmed',
        event: 'booking.confirmed',
        conditions: [],
        isActive: true,
        workflows: ['booking-followup-v1']
      },
      steps: [
        {
          id: 'immediate-confirmation',
          type: 'email',
          name: 'Booking Confirmation Email',
          config: {
            templateId: 'booking-confirmation',
            delay: 0
          },
          nextStepId: 'wait-1-week'
        },
        {
          id: 'wait-1-week',
          type: 'wait',
          name: 'Wait 1 Week',
          config: {
            delay: 10080 // 7 days in minutes
          },
          nextStepId: 'check-travel-date'
        },
        {
          id: 'check-travel-date',
          type: 'condition',
          name: 'Check Days Until Travel',
          config: {
            condition: {
              field: 'daysUntilTravel',
              operator: 'gte',
              value: 14
            }
          },
          nextStepId: 'early-travel-tips',
          alternateStepId: 'last-minute-tips'
        },
        {
          id: 'early-travel-tips',
          type: 'email',
          name: 'Travel Preparation Guide',
          config: {
            templateId: 'booking-follow-up',
            delay: 0
          },
          nextStepId: 'wait-for-travel'
        },
        {
          id: 'last-minute-tips',
          type: 'email',
          name: 'Last Minute Travel Tips',
          config: {
            templateId: 'last-minute-travel-tips',
            delay: 0
          },
          nextStepId: 'wait-for-travel'
        },
        {
          id: 'wait-for-travel',
          type: 'wait',
          name: 'Wait Until After Travel',
          config: {
            delay: 10080 // This would be calculated based on travel dates
          },
          nextStepId: 'post-travel-survey'
        },
        {
          id: 'post-travel-survey',
          type: 'email',
          name: 'Post-Travel Survey',
          config: {
            templateId: 'post-travel-survey',
            delay: 0
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0
      }
    };
  }

  /**
   * Create Re-engagement Workflow
   */
  private async createReEngagementWorkflow(): Promise<AutomationWorkflow> {
    return {
      id: 're-engagement-v1',
      name: 'Re-engagement Campaign',
      description: 'Win back inactive subscribers',
      isActive: true,
      trigger: {
        id: 'user-inactive',
        name: 'User Inactive 30 Days',
        event: 'user.inactive',
        conditions: [
          {
            field: 'lastEmailOpened',
            operator: 'lt',
            value: Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
          },
          {
            field: 'lastBooking',
            operator: 'lt',
            value: Date.now() - (90 * 24 * 60 * 60 * 1000) // 90 days ago
          }
        ],
        isActive: true,
        workflows: ['re-engagement-v1']
      },
      steps: [
        {
          id: 'miss-you-email',
          type: 'email',
          name: 'We Miss You Email',
          config: {
            templateId: 'miss-you-email',
            delay: 0
          },
          nextStepId: 'wait-3-days'
        },
        {
          id: 'wait-3-days',
          type: 'wait',
          name: 'Wait 3 Days',
          config: {
            delay: 4320 // 3 days in minutes
          },
          nextStepId: 'check-engagement'
        },
        {
          id: 'check-engagement',
          type: 'condition',
          name: 'Check If User Engaged',
          config: {
            condition: {
              field: 'lastEmailOpened',
              operator: 'gte',
              value: Date.now() - (3 * 24 * 60 * 60 * 1000) // Last 3 days
            }
          },
          alternateStepId: 'special-offer-email'
        },
        {
          id: 'special-offer-email',
          type: 'email',
          name: 'Special Offer Email',
          config: {
            templateId: 'special-discount-offer',
            delay: 0
          },
          nextStepId: 'wait-1-week-final'
        },
        {
          id: 'wait-1-week-final',
          type: 'wait',
          name: 'Wait 1 Week',
          config: {
            delay: 10080 // 7 days in minutes
          },
          nextStepId: 'final-chance'
        },
        {
          id: 'final-chance',
          type: 'email',
          name: 'Final Chance Email',
          config: {
            templateId: 'final-chance-reengagement',
            delay: 0
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0
      }
    };
  }

  /**
   * Create Abandoned Search Workflow
   */
  private async createAbandonedSearchWorkflow(): Promise<AutomationWorkflow> {
    return {
      id: 'abandoned-search-v1',
      name: 'Abandoned Search Recovery',
      description: 'Follow up on abandoned flight searches',
      isActive: true,
      trigger: {
        id: 'search-abandoned',
        name: 'Flight Search Abandoned',
        event: 'search.abandoned',
        conditions: [
          {
            field: 'searchResults',
            operator: 'gt',
            value: 0
          },
          {
            field: 'timeOnResults',
            operator: 'gt',
            value: 30 // At least 30 seconds
          }
        ],
        isActive: true,
        workflows: ['abandoned-search-v1']
      },
      steps: [
        {
          id: 'wait-2-hours',
          type: 'wait',
          name: 'Wait 2 Hours',
          config: {
            delay: 120 // 2 hours in minutes
          },
          nextStepId: 'check-booking-status'
        },
        {
          id: 'check-booking-status',
          type: 'condition',
          name: 'Check If User Booked',
          config: {
            condition: {
              field: 'hasBooked',
              operator: 'equals',
              value: false
            }
          },
          nextStepId: 'send-search-reminder',
          alternateStepId: 'end-workflow'
        },
        {
          id: 'send-search-reminder',
          type: 'email',
          name: 'Search Reminder Email',
          config: {
            templateId: 'abandoned-search-reminder',
            delay: 0
          },
          nextStepId: 'wait-24-hours'
        },
        {
          id: 'wait-24-hours',
          type: 'wait',
          name: 'Wait 24 Hours',
          config: {
            delay: 1440 // 24 hours in minutes
          },
          nextStepId: 'price-alert-offer'
        },
        {
          id: 'price-alert-offer',
          type: 'email',
          name: 'Price Alert Offer',
          config: {
            templateId: 'price-alert-signup-offer',
            delay: 0
          }
        },
        {
          id: 'end-workflow',
          type: 'webhook',
          name: 'End Workflow',
          config: {
            webhookUrl: '/api/automation/end',
            customData: {
              reason: 'user_booked'
            }
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0
      }
    };
  }

  /**
   * Trigger workflow execution
   */
  async triggerWorkflow(
    workflowId: string, 
    userId: string, 
    triggerData: Record<string, any>
  ): Promise<WorkflowExecution> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow || !workflow.isActive) {
        throw new Error(`Workflow ${workflowId} not found or inactive`);
      }

      // Create execution record
      const execution: WorkflowExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        userId,
        currentStepId: workflow.steps[0].id,
        status: 'running',
        startedAt: new Date(),
        context: {
          triggerData,
          userId,
          workflowId
        },
        executionLog: [{
          stepId: 'trigger',
          timestamp: new Date(),
          status: 'success',
          message: 'Workflow triggered',
          data: triggerData
        }]
      };

      // Store execution
      this.activeExecutions.set(execution.id, execution);

      // Start execution
      await this.executeNextStep(execution);

      console.log(`🤖 Workflow ${workflowId} triggered for user ${userId}`);
      return execution;
    } catch (error) {
      console.error('❌ Failed to trigger workflow:', error);
      throw error;
    }
  }

  /**
   * Execute next step in workflow
   */
  private async executeNextStep(execution: WorkflowExecution): Promise<void> {
    try {
      const workflow = await this.getWorkflow(execution.workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const currentStep = workflow.steps.find(s => s.id === execution.currentStepId);
      if (!currentStep) {
        // Workflow completed
        execution.status = 'completed';
        execution.completedAt = new Date();
        return;
      }

      console.log(`🔄 Executing step: ${currentStep.name} for user ${execution.userId}`);

      let nextStepId: string | undefined;

      switch (currentStep.type) {
        case 'email':
          nextStepId = await this.executeEmailStep(currentStep, execution);
          break;
        case 'wait':
          nextStepId = await this.executeWaitStep(currentStep, execution);
          break;
        case 'condition':
          nextStepId = await this.executeConditionStep(currentStep, execution);
          break;
        case 'tag_update':
          nextStepId = await this.executeTagUpdateStep(currentStep, execution);
          break;
        case 'webhook':
          nextStepId = await this.executeWebhookStep(currentStep, execution);
          break;
        default:
          throw new Error(`Unknown step type: ${currentStep.type}`);
      }

      // Log step completion
      execution.executionLog.push({
        stepId: currentStep.id,
        timestamp: new Date(),
        status: 'success',
        message: `Step ${currentStep.name} completed`,
        data: { nextStepId }
      });

      // Move to next step or complete
      if (nextStepId) {
        execution.currentStepId = nextStepId;
        // Continue execution (for non-wait steps)
        if (currentStep.type !== 'wait') {
          await this.executeNextStep(execution);
        }
      } else {
        execution.status = 'completed';
        execution.completedAt = new Date();
      }
    } catch (error) {
      console.error('❌ Step execution failed:', error);
      execution.status = 'failed';
      execution.executionLog.push({
        stepId: execution.currentStepId,
        timestamp: new Date(),
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute email step
   */
  private async executeEmailStep(step: WorkflowStep, execution: WorkflowExecution): Promise<string | undefined> {
    if (!step.config.templateId) {
      throw new Error('Email step missing template ID');
    }

    // Get user data
    const user = await this.getUserData(execution.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prepare template data
    const templateData = {
      ...execution.context.triggerData,
      firstName: user.firstName,
      email: user.email,
      ...user.preferences
    };

    // Send email
    const result = await emailService.sendTemplatedEmail(
      step.config.templateId,
      user.email,
      templateData,
      `workflow-${execution.workflowId}`
    );

    if (!result.success) {
      throw new Error(`Failed to send email: ${result.error}`);
    }

    return step.nextStepId;
  }

  /**
   * Execute wait step
   */
  private async executeWaitStep(step: WorkflowStep, execution: WorkflowExecution): Promise<string | undefined> {
    const delayMinutes = step.config.delay || 0;
    
    if (delayMinutes > 0) {
      // Schedule next step execution
      setTimeout(async () => {
        execution.currentStepId = step.nextStepId!;
        await this.executeNextStep(execution);
      }, delayMinutes * 60 * 1000);
    }

    return step.nextStepId;
  }

  /**
   * Execute condition step
   */
  private async executeConditionStep(step: WorkflowStep, execution: WorkflowExecution): Promise<string | undefined> {
    if (!step.config.condition) {
      throw new Error('Condition step missing condition');
    }

    const user = await this.getUserData(execution.userId);
    const conditionMet = this.evaluateCondition(step.config.condition, {
      ...execution.context,
      user
    });

    return conditionMet ? step.nextStepId : step.alternateStepId;
  }

  /**
   * Execute tag update step
   */
  private async executeTagUpdateStep(step: WorkflowStep, execution: WorkflowExecution): Promise<string | undefined> {
    if (!step.config.tags) {
      throw new Error('Tag update step missing tags');
    }

    // Update user tags in database
    // This would integrate with your user management system
    console.log(`🏷️ Updating tags for user ${execution.userId}:`, step.config.tags);

    return step.nextStepId;
  }

  /**
   * Execute webhook step
   */
  private async executeWebhookStep(step: WorkflowStep, execution: WorkflowExecution): Promise<string | undefined> {
    if (!step.config.webhookUrl) {
      throw new Error('Webhook step missing URL');
    }

    // Call webhook
    const webhookData = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      userId: execution.userId,
      stepId: step.id,
      customData: step.config.customData
    };

    try {
      // In a real implementation, you'd make an HTTP request
      console.log(`🔗 Webhook called: ${step.config.webhookUrl}`, webhookData);
    } catch (error) {
      console.error('Webhook call failed:', error);
    }

    return step.nextStepId;
  }

  /**
   * Get workflow by ID
   */
  private async getWorkflow(workflowId: string): Promise<AutomationWorkflow | null> {
    // In a real implementation, this would fetch from database
    // For now, return null (workflows would be stored)
    return null;
  }

  /**
   * Get user data
   */
  private async getUserData(userId: string): Promise<any> {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        // Note: preferences relation not available in current User schema
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true
        }
      });
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: TriggerCondition, context: any): boolean {
    const value = this.getNestedValue(context, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      case 'gt':
        return Number(value) > Number(condition.value);
      case 'lt':
        return Number(value) < Number(condition.value);
      case 'gte':
        return Number(value) >= Number(condition.value);
      case 'lte':
        return Number(value) <= Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  /**
   * Pause workflow execution
   */
  pauseExecution(executionId: string): void {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = 'paused';
      console.log(`⏸️ Workflow execution paused: ${executionId}`);
    }
  }

  /**
   * Resume workflow execution
   */
  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      await this.executeNextStep(execution);
      console.log(`▶️ Workflow execution resumed: ${executionId}`);
    }
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine();