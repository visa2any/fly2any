/**
 * AI-Powered Workflow Orchestrator
 * Intelligent automation system that integrates with N8N and provides smart workflow execution
 * based on customer behavior, AI insights, and business rules
 */

import { aiConversationService } from './ai-conversation-service';
import { leadScoringService, LeadScore } from './lead-scoring-service';

export interface WorkflowTrigger {
  id: string;
  name: string;
  type: 'lead_created' | 'conversation_started' | 'booking_completed' | 'customer_inactive' | 'satisfaction_low' | 'high_value_customer' | 'churn_risk';
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  aiEnhanced: boolean;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  id: string;
  type: 'send_email' | 'send_whatsapp' | 'create_task' | 'assign_agent' | 'trigger_n8n' | 'update_customer' | 'send_notification' | 'schedule_callback' | 'apply_tag';
  config: Record<string, any>;
  delay?: number; // in minutes
  conditions?: WorkflowCondition[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggerId: string;
  customerId: string;
  leadId?: string;
  conversationId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  executedActions: Array<{
    actionId: string;
    status: 'success' | 'failed' | 'skipped';
    executedAt: string;
    result?: any;
    error?: string;
  }>;
  context: Record<string, any>;
  aiInsights?: {
    confidence: number;
    recommendations: string[];
    riskFactors: string[];
  };
}

export interface CustomerJourneyStage {
  stage: 'awareness' | 'consideration' | 'decision' | 'purchase' | 'retention' | 'advocacy';
  score: number; // 0-100
  indicators: string[];
  recommendedActions: string[];
  nextStageRequirements: string[];
}

class WorkflowOrchestrator {
  private readonly n8nBaseUrl: string;
  private readonly n8nApiKey: string;
  private workflows: Map<string, WorkflowTrigger> = new Map();

  constructor() {
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.n8nApiKey = process.env.N8N_API_KEY || '';
    this.initializeDefaultWorkflows();
  }

  /**
   * Initialize default AI-enhanced workflows
   */
  private initializeDefaultWorkflows() {
    const defaultWorkflows: WorkflowTrigger[] = [
      {
        id: 'high_value_lead_nurturing',
        name: 'High Value Lead Nurturing',
        type: 'lead_created',
        conditions: [
          { field: 'leadScore', operator: 'greater_than', value: 80 },
          { field: 'estimatedValue', operator: 'greater_than', value: 5000, logicalOperator: 'AND' }
        ],
        actions: [
          {
            id: 'assign_senior_agent',
            type: 'assign_agent',
            config: { agentType: 'senior', department: 'sales' }
          },
          {
            id: 'send_vip_welcome',
            type: 'send_email',
            config: { 
              templateId: 'vip_welcome',
              personalization: true 
            },
            delay: 5
          },
          {
            id: 'schedule_followup_call',
            type: 'schedule_callback',
            config: { 
              timeframe: '2_hours',
              priority: 'high' 
            },
            delay: 10
          },
          {
            id: 'apply_vip_tag',
            type: 'apply_tag',
            config: { tags: ['VIP', 'High Value', 'Priority'] }
          }
        ],
        priority: 'critical',
        isActive: true,
        aiEnhanced: true
      },
      
      {
        id: 'customer_churn_prevention',
        name: 'Customer Churn Prevention',
        type: 'churn_risk',
        conditions: [
          { field: 'daysSinceLastContact', operator: 'greater_than', value: 60 },
          { field: 'customerHealthScore', operator: 'less_than', value: 60, logicalOperator: 'AND' }
        ],
        actions: [
          {
            id: 'send_retention_email',
            type: 'send_email',
            config: { 
              templateId: 'retention_campaign',
              includeDiscount: true,
              discountPercent: 15
            }
          },
          {
            id: 'trigger_retention_sequence',
            type: 'trigger_n8n',
            config: { 
              workflowId: 'retention_sequence',
              webhookUrl: '/webhook/retention'
            },
            delay: 1440 // 24 hours
          },
          {
            id: 'assign_retention_specialist',
            type: 'assign_agent',
            config: { 
              agentType: 'retention_specialist',
              priority: 'high' 
            },
            delay: 2880 // 48 hours
          }
        ],
        priority: 'high',
        isActive: true,
        aiEnhanced: true
      },

      {
        id: 'smart_lead_scoring_workflow',
        name: 'Smart Lead Scoring & Routing',
        type: 'lead_created',
        conditions: [
          { field: 'leadScore', operator: 'greater_than', value: 50 }
        ],
        actions: [
          {
            id: 'ai_lead_analysis',
            type: 'trigger_n8n',
            config: { 
              workflowId: 'ai_lead_analysis',
              webhookUrl: '/webhook/lead-analysis'
            }
          },
          {
            id: 'personalized_welcome',
            type: 'send_whatsapp',
            config: { 
              templateName: 'personalized_welcome',
              aiPersonalization: true 
            },
            delay: 15
          }
        ],
        priority: 'medium',
        isActive: true,
        aiEnhanced: true
      },

      {
        id: 'low_satisfaction_recovery',
        name: 'Low Satisfaction Recovery',
        type: 'satisfaction_low',
        conditions: [
          { field: 'satisfactionScore', operator: 'less_than', value: 3 }
        ],
        actions: [
          {
            id: 'escalate_to_supervisor',
            type: 'assign_agent',
            config: { 
              agentType: 'supervisor',
              priority: 'critical',
              reason: 'low_satisfaction'
            }
          },
          {
            id: 'send_apology_email',
            type: 'send_email',
            config: { 
              templateId: 'service_recovery',
              includeSupervisorContact: true 
            },
            delay: 30
          },
          {
            id: 'offer_compensation',
            type: 'create_task',
            config: { 
              taskType: 'review_compensation',
              assignedTo: 'customer_success_team'
            },
            delay: 60
          }
        ],
        priority: 'critical',
        isActive: true,
        aiEnhanced: true
      }
    ];

    defaultWorkflows.forEach(workflow => {
      this.workflows.set(workflow.id, workflow);
    });
  }

  /**
   * Execute workflow based on trigger event
   */
  async executeWorkflow(
    trigger: WorkflowTrigger,
    context: Record<string, any>
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId: trigger.id,
      triggerId: trigger.id,
      customerId: context.customerId,
      leadId: context.leadId,
      conversationId: context.conversationId,
      status: 'pending',
      startedAt: new Date().toISOString(),
      executedActions: [],
      context
    };

    try {
      execution.status = 'running';

      // Get AI insights if workflow is AI-enhanced
      if (trigger.aiEnhanced) {
        execution.aiInsights = await this.getAIInsights(context);
        
        // Modify actions based on AI recommendations
        trigger.actions = await this.enhanceActionsWithAI(
          trigger.actions,
          execution.aiInsights,
          context
        );
      }

      // Execute actions in sequence
      for (const action of trigger.actions) {
        const actionResult = await this.executeAction(action, execution);
        execution.executedActions.push(actionResult);

        // Stop execution if critical action fails
        if (actionResult.status === 'failed' && action.type === 'assign_agent') {
          execution.status = 'failed';
          break;
        }
      }

      execution.status = execution.executedActions.some(a => a.status === 'failed') ? 'failed' : 'completed';
      execution.completedAt = new Date().toISOString();

    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date().toISOString();
      console.error('Workflow execution failed:', error);
    }

    // Store execution record (in production, this would go to a database)
    await this.storeExecutionRecord(execution);

    return execution;
  }

  /**
   * Get AI insights for workflow enhancement
   */
  private async getAIInsights(context: Record<string, any>) {
    try {
      let confidence = 0.7;
      let recommendations: string[] = [];
      let riskFactors: string[] = [];

      // Get customer health insights
      if (context.customerId) {
        const healthScore = await aiConversationService.calculateCustomerHealth(context.customerId);
        confidence = healthScore.score / 100;
        recommendations = healthScore.recommendations;
        
        if (healthScore.risk === 'high') {
          riskFactors.push('High churn risk detected');
        }
      }

      // Get lead scoring insights
      if (context.leadData) {
        const leadScore = await leadScoringService.calculateLeadScore(context.leadData);
        confidence = Math.max(confidence, leadScore.predictions.conversionProbability);
        
        leadScore.nextActions.forEach(action => {
          if (action.priority === 'high') {
            recommendations.push(action.action);
          }
        });

        if (leadScore.grade === 'D') {
          riskFactors.push('Low conversion probability');
        }
      }

      return {
        confidence,
        recommendations,
        riskFactors
      };
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return {
        confidence: 0.5,
        recommendations: [],
        riskFactors: []
      };
    }
  }

  /**
   * Enhance workflow actions with AI recommendations
   */
  private async enhanceActionsWithAI(
    actions: WorkflowAction[],
    aiInsights: any,
    context: Record<string, any>
  ): Promise<WorkflowAction[]> {
    const enhancedActions = [...actions];

    // Add AI-recommended actions based on insights
    if (aiInsights.confidence > 0.8) {
      // High confidence - add priority actions
      enhancedActions.unshift({
        id: 'ai_priority_flag',
        type: 'apply_tag',
        config: { tags: ['AI_High_Priority'] }
      });
    }

    if (aiInsights.riskFactors.includes('High churn risk detected')) {
      // Add retention actions
      enhancedActions.push({
        id: 'ai_retention_action',
        type: 'trigger_n8n',
        config: { 
          workflowId: 'emergency_retention',
          webhookUrl: '/webhook/emergency-retention'
        },
        delay: 60
      });
    }

    // Personalize email templates based on AI insights
    enhancedActions.forEach(action => {
      if (action.type === 'send_email' && action.config.aiPersonalization) {
        action.config.aiContext = {
          confidence: aiInsights.confidence,
          personalityProfile: context.personalityProfile,
          recommendations: aiInsights.recommendations
        };
      }
    });

    return enhancedActions;
  }

  /**
   * Execute individual workflow action
   */
  private async executeAction(
    action: WorkflowAction,
    execution: WorkflowExecution
  ): Promise<{
    actionId: string;
    status: 'success' | 'failed' | 'skipped';
    executedAt: string;
    result?: any;
    error?: string;
  }> {
    const result: {
      actionId: string;
      status: 'success' | 'failed' | 'skipped';
      executedAt: string;
      result?: any;
      error?: string;
    } = {
      actionId: action.id,
      status: 'success',
      executedAt: new Date().toISOString(),
      result: undefined,
      error: undefined
    };

    try {
      // Apply delay if specified
      if (action.delay && action.delay > 0) {
        console.log(`Delaying action ${action.id} by ${action.delay} minutes`);
        // In production, this would use a queue system like Bull or Agenda
      }

      // Check action conditions
      if (action.conditions && !this.evaluateConditions(action.conditions, execution.context)) {
        result.status = 'skipped';
        return result;
      }

      // Execute action based on type
      switch (action.type) {
        case 'send_email':
          result.result = await this.executeEmailAction(action, execution);
          break;
        case 'send_whatsapp':
          result.result = await this.executeWhatsAppAction(action, execution);
          break;
        case 'assign_agent':
          result.result = await this.executeAssignAgentAction(action, execution);
          break;
        case 'trigger_n8n':
          result.result = await this.executeN8NTrigger(action, execution);
          break;
        case 'create_task':
          result.result = await this.executeCreateTaskAction(action, execution);
          break;
        case 'apply_tag':
          result.result = await this.executeApplyTagAction(action, execution);
          break;
        case 'schedule_callback':
          result.result = await this.executeScheduleCallbackAction(action, execution);
          break;
        case 'update_customer':
          result.result = await this.executeUpdateCustomerAction(action, execution);
          break;
        case 'send_notification':
          result.result = await this.executeSendNotificationAction(action, execution);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Action ${action.id} failed:`, error);
    }

    return result;
  }

  /**
   * Execute email sending action
   */
  private async executeEmailAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { templateId, personalization, aiContext } = action.config;
    
    // Get customer email from context
    const customerEmail = execution.context.customerEmail || execution.context.email;
    if (!customerEmail) {
      throw new Error('Customer email not available');
    }

    // Build email content
    let emailContent = `Template: ${templateId}`;
    if (personalization && aiContext) {
      emailContent += ` (Personalized with AI confidence: ${aiContext.confidence})`;
    }

    // In production, this would integrate with your email service
    console.log(`Sending email to ${customerEmail}: ${emailContent}`);
    
    return {
      recipient: customerEmail,
      template: templateId,
      sentAt: new Date().toISOString()
    };
  }

  /**
   * Execute WhatsApp sending action
   */
  private async executeWhatsAppAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { templateName, aiPersonalization } = action.config;
    
    const customerPhone = execution.context.customerPhone || execution.context.phone;
    if (!customerPhone) {
      throw new Error('Customer phone not available');
    }

    // Send WhatsApp message via existing API
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerPhone,
        message: `Template: ${templateName}`,
        type: 'template',
        templateName: templateName
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp send failed: ${response.status}`);
    }

    return {
      recipient: customerPhone,
      template: templateName,
      sentAt: new Date().toISOString()
    };
  }

  /**
   * Execute agent assignment action
   */
  private async executeAssignAgentAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { agentType, department, priority } = action.config;

    // In production, this would integrate with your agent management system
    console.log(`Assigning ${agentType} agent from ${department} with priority ${priority}`);
    
    return {
      agentType,
      department,
      priority,
      assignedAt: new Date().toISOString(),
      customerId: execution.customerId
    };
  }

  /**
   * Execute N8N workflow trigger
   */
  private async executeN8NTrigger(action: WorkflowAction, execution: WorkflowExecution) {
    const { workflowId, webhookUrl } = action.config;
    
    const n8nWebhookUrl = `${this.n8nBaseUrl}${webhookUrl}`;
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.n8nApiKey}`
      },
      body: JSON.stringify({
        workflowId,
        executionId: execution.id,
        customerId: execution.customerId,
        context: execution.context,
        aiInsights: execution.aiInsights
      })
    });

    if (!response.ok) {
      throw new Error(`N8N trigger failed: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      workflowId,
      webhookUrl,
      n8nResponse: result,
      triggeredAt: new Date().toISOString()
    };
  }

  /**
   * Execute task creation action
   */
  private async executeCreateTaskAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { taskType, assignedTo, priority } = action.config;
    
    // In production, this would integrate with your task management system
    console.log(`Creating task: ${taskType}, assigned to: ${assignedTo}`);
    
    return {
      taskId: `task_${Date.now()}`,
      taskType,
      assignedTo,
      priority,
      createdAt: new Date().toISOString(),
      relatedCustomer: execution.customerId
    };
  }

  /**
   * Execute tag application action
   */
  private async executeApplyTagAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { tags } = action.config;
    
    // In production, this would update customer tags in database
    console.log(`Applying tags to customer ${execution.customerId}: ${tags.join(', ')}`);
    
    return {
      customerId: execution.customerId,
      tagsAdded: tags,
      appliedAt: new Date().toISOString()
    };
  }

  /**
   * Execute callback scheduling action
   */
  private async executeScheduleCallbackAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { timeframe, priority } = action.config;
    
    // In production, this would integrate with your scheduling system
    console.log(`Scheduling callback for customer ${execution.customerId} in ${timeframe}`);
    
    return {
      customerId: execution.customerId,
      timeframe,
      priority,
      scheduledAt: new Date().toISOString(),
      status: 'scheduled'
    };
  }

  /**
   * Execute customer update action
   */
  private async executeUpdateCustomerAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { updates } = action.config;
    
    // In production, this would update customer record in database
    console.log(`Updating customer ${execution.customerId}:`, updates);
    
    return {
      customerId: execution.customerId,
      updates,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Execute notification sending action
   */
  private async executeSendNotificationAction(action: WorkflowAction, execution: WorkflowExecution) {
    const { recipients, message, priority } = action.config;
    
    // In production, this would send notifications via your notification system
    console.log(`Sending notification to ${recipients}: ${message}`);
    
    return {
      recipients,
      message,
      priority,
      sentAt: new Date().toISOString()
    };
  }

  /**
   * Evaluate workflow conditions
   */
  private evaluateConditions(conditions: WorkflowCondition[], context: Record<string, any>): boolean {
    if (!conditions.length) return true;

    let result = true;
    let lastLogicalOperator: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(context, condition.field);
      let conditionResult = false;

      switch (condition.operator) {
        case 'equals':
          conditionResult = fieldValue === condition.value;
          break;
        case 'not_equals':
          conditionResult = fieldValue !== condition.value;
          break;
        case 'greater_than':
          conditionResult = Number(fieldValue) > Number(condition.value);
          break;
        case 'less_than':
          conditionResult = Number(fieldValue) < Number(condition.value);
          break;
        case 'contains':
          conditionResult = String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
          break;
        case 'between':
          const [min, max] = condition.value;
          conditionResult = Number(fieldValue) >= Number(min) && Number(fieldValue) <= Number(max);
          break;
      }

      if (lastLogicalOperator === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      lastLogicalOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Determine customer journey stage
   */
  async determineCustomerJourneyStage(customerId: string): Promise<CustomerJourneyStage> {
    try {
      // Get customer data
      const response = await fetch(`/api/customers/${customerId}/360`);
      const customerData = await response.json();
      
      if (!customerData.success) {
        throw new Error('Customer data not available');
      }

      const customer = customerData.data;
      let stage: CustomerJourneyStage['stage'] = 'awareness';
      let score = 0;
      const indicators: string[] = [];
      const recommendedActions: string[] = [];
      const nextStageRequirements: string[] = [];

      // Determine stage based on customer behavior
      if (customer.totalBookings === 0) {
        if (customer.totalInteractions > 5) {
          stage = 'consideration';
          score = 40;
          indicators.push('Multiple interactions without booking');
          recommendedActions.push('Send personalized offer');
          nextStageRequirements.push('Complete first booking');
        } else {
          stage = 'awareness';
          score = 20;
          indicators.push('Initial contact made');
          recommendedActions.push('Educate about services');
          nextStageRequirements.push('Increase engagement');
        }
      } else if (customer.totalBookings === 1) {
        stage = 'purchase';
        score = 70;
        indicators.push('Made first purchase');
        recommendedActions.push('Follow up on experience');
        nextStageRequirements.push('Ensure satisfaction');
      } else if (customer.totalBookings > 1) {
        if (customer.customerSatisfaction >= 4.5) {
          stage = 'advocacy';
          score = 95;
          indicators.push('Multiple purchases with high satisfaction');
          recommendedActions.push('Encourage referrals');
          nextStageRequirements.push('Maintain satisfaction');
        } else {
          stage = 'retention';
          score = 80;
          indicators.push('Repeat customer');
          recommendedActions.push('Improve satisfaction');
          nextStageRequirements.push('Increase satisfaction score');
        }
      }

      return {
        stage,
        score,
        indicators,
        recommendedActions,
        nextStageRequirements
      };
    } catch (error) {
      console.error('Error determining customer journey stage:', error);
      return {
        stage: 'awareness',
        score: 0,
        indicators: ['Unable to determine stage'],
        recommendedActions: ['Review customer data'],
        nextStageRequirements: ['Data collection needed']
      };
    }
  }

  /**
   * Trigger workflow based on event
   */
  async triggerWorkflow(
    eventType: WorkflowTrigger['type'],
    context: Record<string, any>
  ): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];
    
    // Find matching workflows
    const matchingWorkflows = Array.from(this.workflows.values()).filter(
      workflow => workflow.type === eventType && workflow.isActive
    );

    // Execute workflows that match conditions
    for (const workflow of matchingWorkflows) {
      if (this.evaluateConditions(workflow.conditions, context)) {
        const execution = await this.executeWorkflow(workflow, context);
        executions.push(execution);
      }
    }

    return executions;
  }

  /**
   * Store workflow execution record
   */
  private async storeExecutionRecord(execution: WorkflowExecution): Promise<void> {
    // In production, this would store to database
    console.log('Workflow execution completed:', {
      id: execution.id,
      workflow: execution.workflowId,
      status: execution.status,
      actions: execution.executedActions.length,
      duration: execution.completedAt ? 
        new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime() : 
        undefined
    });
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get workflow execution statistics
   */
  async getWorkflowStats(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    topWorkflows: Array<{
      workflowId: string;
      executions: number;
      successRate: number;
    }>;
  }> {
    // In production, this would query from database
    return {
      totalExecutions: 156,
      successfulExecutions: 142,
      failedExecutions: 14,
      averageExecutionTime: 2.3, // minutes
      topWorkflows: [
        { workflowId: 'high_value_lead_nurturing', executions: 45, successRate: 0.96 },
        { workflowId: 'smart_lead_scoring_workflow', executions: 78, successRate: 0.89 },
        { workflowId: 'customer_churn_prevention', executions: 23, successRate: 0.87 }
      ]
    };
  }
}

export const workflowOrchestrator = new WorkflowOrchestrator();
export default workflowOrchestrator;