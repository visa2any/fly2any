import { EmailContact, EmailMarketingDatabase } from '@/lib/email-marketing-database';
import { AdvancedPersonalizationEngine } from './advanced-personalization';

// Enterprise Email Marketing Automation Engine
export interface AutomationTrigger {
  id: string;
  type: 'welcome' | 'abandoned_cart' | 'birthday' | 'anniversary' | 'engagement_drop' | 
        'lead_nurture' | 'win_back' | 'upsell' | 'cross_sell' | 'event_based' | 'behavioral';
  name: string;
  description: string;
  conditions: AutomationCondition[];
  delayAfterTrigger?: number; // minutes
  maxTriggerCount?: number; // prevent spam
}

export interface AutomationCondition {
  field: string; // e.g., 'engagement_score', 'last_email_opened_at', 'tags'
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  id: string;
  type: 'send_email' | 'add_tag' | 'remove_tag' | 'move_to_segment' | 'update_field' | 
        'wait' | 'split_test' | 'webhook' | 'stop_automation';
  name: string;
  config: Record<string, any>;
  delayBefore?: number; // minutes to wait before executing
  conditions?: AutomationCondition[]; // Optional conditions for this specific action
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft' | 'paused';
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  
  // Analytics
  totalTriggered: number;
  totalCompleted: number;
  averageCompletionTime: number; // minutes
  conversionRate: number;
  
  // Settings
  timezone: string;
  respectQuietHours: boolean;
  quietHours: { start: string; end: string }; // "09:00" format
  maxEmailsPerDay: number;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggeredAt?: Date;
}

export interface AutomationExecution {
  id: string;
  workflowId: string;
  contactId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  currentActionIndex: number;
  startedAt: Date;
  completedAt?: Date;
  nextActionAt?: Date;
  errorMessage?: string;
  data: Record<string, any>; // Context data for the execution
}

export class EnterpriseAutomationEngine {
  private static executions: Map<string, AutomationExecution> = new Map();
  private static workflows: Map<string, AutomationWorkflow> = new Map();

  // Register automation workflow
  static registerWorkflow(workflow: AutomationWorkflow): void {
    this.workflows.set(workflow.id, workflow);
    console.log(`🤖 Registered automation workflow: ${workflow.name}`);
  }

  // Trigger automation for contact
  static async triggerAutomation(
    workflowId: string, 
    contactId: string, 
    triggerData: Record<string, any> = {}
  ): Promise<string | null> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status !== 'active') {
      console.warn(`⚠️ Workflow ${workflowId} not found or inactive`);
      return null;
    }

    // Check if contact meets trigger conditions
    const contact = await this.getContact(contactId);
    if (!contact) {
      console.warn(`⚠️ Contact ${contactId} not found`);
      return null;
    }

    if (!this.evaluateConditions(workflow.trigger.conditions, contact, triggerData)) {
      console.log(`📋 Contact ${contactId} doesn't meet trigger conditions for workflow ${workflowId}`);
      return null;
    }

    // Create execution
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution: AutomationExecution = {
      id: executionId,
      workflowId,
      contactId,
      status: 'pending',
      currentActionIndex: 0,
      startedAt: new Date(),
      data: {
        ...triggerData,
        triggerType: workflow.trigger.type,
        contactEngagement: contact.engagement_score
      }
    };

    this.executions.set(executionId, execution);

    // Schedule first action
    await this.scheduleNextAction(executionId);

    // Update workflow stats
    workflow.totalTriggered++;
    workflow.lastTriggeredAt = new Date();

    console.log(`🚀 Started automation execution ${executionId} for contact ${contactId}`);
    return executionId;
  }

  // Process automation execution
  static async processExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return;

    const contact = await this.getContact(execution.contactId);
    if (!contact) return;

    try {
      execution.status = 'running';

      while (execution.currentActionIndex < workflow.actions.length) {
        const action = workflow.actions[execution.currentActionIndex];
        
        // Check action-specific conditions
        if (action.conditions && !this.evaluateConditions(action.conditions, contact, execution.data)) {
          console.log(`⏩ Skipping action ${action.name} - conditions not met`);
          execution.currentActionIndex++;
          continue;
        }

        // Execute action
        const shouldContinue = await this.executeAction(action, contact, execution);
        
        if (!shouldContinue) {
          console.log(`⏹️ Stopping automation execution ${executionId} at action ${action.name}`);
          break;
        }

        execution.currentActionIndex++;

        // Check for wait action
        if (action.delayBefore && action.delayBefore > 0) {
          execution.nextActionAt = new Date(Date.now() + action.delayBefore * 60000);
          console.log(`⏰ Scheduling next action in ${action.delayBefore} minutes`);
          return; // Will be resumed later
        }
      }

      // Mark as completed
      execution.status = 'completed';
      execution.completedAt = new Date();
      
      // Update workflow completion stats
      workflow.totalCompleted++;
      const completionTime = (execution.completedAt.getTime() - execution.startedAt.getTime()) / 60000;
      workflow.averageCompletionTime = (workflow.averageCompletionTime + completionTime) / 2;

      console.log(`✅ Completed automation execution ${executionId}`);

    } catch (error) {
      execution.status = 'failed';
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Automation execution ${executionId} failed:`, error);
    }
  }

  // Execute individual action
  private static async executeAction(
    action: AutomationAction,
    contact: EmailContact,
    execution: AutomationExecution
  ): Promise<boolean> {
    console.log(`🎯 Executing action: ${action.name} for contact ${contact.email}`);

    try {
      switch (action.type) {
        case 'send_email':
          await this.executeSendEmailAction(action, contact, execution);
          break;

        case 'add_tag':
          await this.executeAddTagAction(action, contact);
          break;

        case 'remove_tag':
          await this.executeRemoveTagAction(action, contact);
          break;

        case 'wait':
          const waitMinutes = action.config.minutes || 60;
          execution.nextActionAt = new Date(Date.now() + waitMinutes * 60000);
          console.log(`⏰ Waiting ${waitMinutes} minutes`);
          return false; // Pause execution

        case 'update_field':
          await this.executeUpdateFieldAction(action, contact);
          break;

        case 'webhook':
          await this.executeWebhookAction(action, contact, execution);
          break;

        case 'stop_automation':
          console.log(`⏹️ Stopping automation as requested`);
          return false;

        default:
          console.warn(`⚠️ Unknown action type: ${action.type}`);
      }

      return true; // Continue execution
    } catch (error) {
      console.error(`❌ Action ${action.name} failed:`, error);
      throw error;
    }
  }

  // Send email action
  private static async executeSendEmailAction(
    action: AutomationAction,
    contact: EmailContact,
    execution: AutomationExecution
  ): Promise<void> {
    const { subject, htmlContent, templateId } = action.config;

    // Get template if specified
    let finalSubject = subject;
    let finalContent = htmlContent;

    if (templateId) {
      // Would fetch template from database
      console.log(`📧 Using template ${templateId}`);
    }

    // Apply personalization
    const personalizationData = {
      contact,
      campaign: {
        id: execution.workflowId,
        name: `Automation: ${this.workflows.get(execution.workflowId)?.name}`,
        type: 'automation'
      },
      customData: execution.data
    };

    finalSubject = AdvancedPersonalizationEngine.personalizeContent(
      finalSubject, 
      personalizationData, 
      'subject'
    );
    
    finalContent = AdvancedPersonalizationEngine.personalizeContent(
      finalContent, 
      personalizationData, 
      'html'
    );

    // Send email (would integrate with mailgun service)
    console.log(`📧 Sending automated email to ${contact.email}`);
    console.log(`📝 Subject: ${finalSubject}`);

    // Record email event
    await EmailMarketingDatabase.recordEmailEvent({
      contact_id: contact.id,
      event_type: 'sent',
      event_data: {
        automationId: execution.workflowId,
        executionId: execution.id,
        subject: finalSubject,
        actionName: action.name
      }
    });
  }

  // Add tag action
  private static async executeAddTagAction(action: AutomationAction, contact: EmailContact): Promise<void> {
    const { tag } = action.config;
    if (!contact.tags.includes(tag)) {
      contact.tags.push(tag);
      console.log(`🏷️ Added tag '${tag}' to contact ${contact.email}`);
    }
  }

  // Remove tag action
  private static async executeRemoveTagAction(action: AutomationAction, contact: EmailContact): Promise<void> {
    const { tag } = action.config;
    contact.tags = contact.tags.filter(t => t !== tag);
    console.log(`🏷️ Removed tag '${tag}' from contact ${contact.email}`);
  }

  // Update field action
  private static async executeUpdateFieldAction(action: AutomationAction, contact: EmailContact): Promise<void> {
    const { field, value } = action.config;
    (contact as any)[field] = value;
    console.log(`✏️ Updated field '${field}' to '${value}' for contact ${contact.email}`);
  }

  // Webhook action
  private static async executeWebhookAction(
    action: AutomationAction,
    contact: EmailContact,
    execution: AutomationExecution
  ): Promise<void> {
    const { url, method = 'POST', headers = {} } = action.config;
    
    const payload = {
      contactId: contact.id,
      contactEmail: contact.email,
      workflowId: execution.workflowId,
      executionId: execution.id,
      actionName: action.name,
      timestamp: new Date().toISOString(),
      data: execution.data
    };

    console.log(`🌐 Executing webhook: ${method} ${url}`);
    // Would make actual HTTP request in real implementation
  }

  // Evaluate conditions
  private static evaluateConditions(
    conditions: AutomationCondition[],
    contact: EmailContact,
    data: Record<string, any>
  ): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogic: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateSingleCondition(condition, contact, data);
      
      if (currentLogic === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentLogic = condition.logicalOperator || 'AND';
    }

    return result;
  }

  // Evaluate single condition
  private static evaluateSingleCondition(
    condition: AutomationCondition,
    contact: EmailContact,
    data: Record<string, any>
  ): boolean {
    const fieldValue = this.getFieldValue(condition.field, contact, data);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return false;
    }
  }

  // Get field value from contact or data
  private static getFieldValue(field: string, contact: EmailContact, data: Record<string, any>): any {
    if (field.startsWith('data.')) {
      const dataField = field.substring(5);
      return data[dataField];
    }

    return (contact as any)[field];
  }

  // Schedule next action
  private static async scheduleNextAction(executionId: string): Promise<void> {
    // In a real implementation, this would use a job queue or scheduler
    setTimeout(() => {
      this.processExecution(executionId);
    }, 1000);
  }

  // Get contact (would integrate with database)
  private static async getContact(contactId: string): Promise<EmailContact | null> {
    // Would fetch from EmailMarketingDatabase
    const contacts = await EmailMarketingDatabase.getEmailContacts({ limit: 1000 });
    return contacts.contacts.find(c => c.id === contactId) || null;
  }

  // Get execution status
  static getExecution(executionId: string): AutomationExecution | null {
    return this.executions.get(executionId) || null;
  }

  // Get workflow stats
  static getWorkflowStats(workflowId: string): AutomationWorkflow | null {
    return this.workflows.get(workflowId) || null;
  }

  // List all workflows
  static getAllWorkflows(): AutomationWorkflow[] {
    return Array.from(this.workflows.values());
  }
}

// Pre-built Enterprise Automation Workflows
export const enterpriseAutomationTemplates: Omit<AutomationWorkflow, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Welcome Series - New Customers',
    description: 'Multi-touch welcome sequence for new customers',
    status: 'draft',
    trigger: {
      id: 'welcome-trigger',
      type: 'welcome',
      name: 'New Customer Registration',
      description: 'Triggered when a new customer signs up',
      conditions: [
        { field: 'subscription_date', operator: 'greater_than', value: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      ]
    },
    actions: [
      {
        id: 'welcome-email-1',
        type: 'send_email',
        name: 'Welcome Email',
        config: {
          subject: '🎉 Bem-vindo(a) à Fly2Any, {{first_name}}!',
          htmlContent: `
            <h2>Bem-vindo(a) à família Fly2Any!</h2>
            <p>Olá {{first_name}}, que alegria ter você conosco!</p>
            <p>Prepare-se para descobrir as melhores ofertas de viagem do mundo.</p>
          `
        }
      },
      {
        id: 'wait-3-days',
        type: 'wait',
        name: 'Wait 3 Days',
        config: { minutes: 3 * 24 * 60 }
      },
      {
        id: 'tips-email',
        type: 'send_email',
        name: 'Travel Tips Email',
        config: {
          subject: '✈️ Dicas exclusivas para sua próxima viagem',
          htmlContent: `
            <h2>Dicas de viagem personalizadas para você!</h2>
            <p>Olá {{first_name}}, preparamos algumas dicas especiais...</p>
          `
        }
      }
    ],
    totalTriggered: 0,
    totalCompleted: 0,
    averageCompletionTime: 0,
    conversionRate: 0,
    timezone: 'America/Sao_Paulo',
    respectQuietHours: true,
    quietHours: { start: '22:00', end: '08:00' },
    maxEmailsPerDay: 3,
    createdBy: 'system'
  },
  {
    name: 'Re-engagement Campaign',
    description: 'Win back inactive customers',
    status: 'draft',
    trigger: {
      id: 'reengagement-trigger',
      type: 'engagement_drop',
      name: 'Low Engagement Detection',
      description: 'Triggered for customers with low engagement',
      conditions: [
        { field: 'engagement_score', operator: 'less_than', value: 30 },
        { field: 'last_email_opened_at', operator: 'less_than', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      ]
    },
    actions: [
      {
        id: 'reengagement-email',
        type: 'send_email',
        name: 'We Miss You Email',
        config: {
          subject: '❤️ Sentimos sua falta, {{first_name}}!',
          htmlContent: `
            <h2>Você está fazendo falta!</h2>
            <p>Olá {{first_name}}, notamos que você não tem visitado nossas ofertas...</p>
            <p>Que tal dar uma olhada nas nossas novidades?</p>
          `
        }
      },
      {
        id: 'add-reengagement-tag',
        type: 'add_tag',
        name: 'Add Re-engagement Tag',
        config: { tag: 'reengagement-campaign' }
      }
    ],
    totalTriggered: 0,
    totalCompleted: 0,
    averageCompletionTime: 0,
    conversionRate: 0,
    timezone: 'America/Sao_Paulo',
    respectQuietHours: true,
    quietHours: { start: '22:00', end: '08:00' },
    maxEmailsPerDay: 2,
    createdBy: 'system'
  }
];

console.log('🤖 Enterprise Automation Engine initialized - unlimited email workflows ready!');