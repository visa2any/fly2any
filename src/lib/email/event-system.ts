/**
 * 🎯 EMAIL AUTOMATION EVENT SYSTEM
 * Event-driven system to trigger automation workflows
 */

import { automationEngine } from './automation-workflows';
import { emailService } from './email-service';

export interface AutomationEvent {
  type: string;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
  source: string;
}

export interface EventHandler {
  eventType: string;
  workflowId: string;
  conditions?: EventCondition[];
}

export interface EventCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'exists';
  value: any;
}

export class AutomationEventSystem {
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  constructor() {
    this.initializeEventHandlers();
  }

  /**
   * Initialize default event handlers
   */
  private initializeEventHandlers(): void {
    // Welcome Series - triggered on user signup
    this.registerHandler({
      eventType: 'user.created',
      workflowId: 'welcome-series-v1',
      conditions: [
        {
          field: 'source',
          operator: 'not_equals',
          value: 'admin'
        }
      ]
    });

    // Price Drop Alerts - triggered on price changes
    this.registerHandler({
      eventType: 'price.dropped',
      workflowId: 'price-drop-alert-v1',
      conditions: [
        {
          field: 'percentageDiscount',
          operator: 'gte',
          value: 15
        }
      ]
    });

    // Booking Follow-up - triggered on successful bookings
    this.registerHandler({
      eventType: 'booking.confirmed',
      workflowId: 'booking-followup-v1'
    });

    // Re-engagement - triggered on inactive users
    this.registerHandler({
      eventType: 'user.inactive',
      workflowId: 're-engagement-v1',
      conditions: [
        {
          field: 'daysSinceLastActivity',
          operator: 'gte',
          value: 30
        }
      ]
    });

    // Abandoned Search - triggered on search abandonment
    this.registerHandler({
      eventType: 'search.abandoned',
      workflowId: 'abandoned-search-v1',
      conditions: [
        {
          field: 'timeOnResults',
          operator: 'gt',
          value: 30
        },
        {
          field: 'searchResults',
          operator: 'gt',
          value: 0
        }
      ]
    });

    console.log(`🎯 Initialized ${this.eventHandlers.size} event handlers`);
  }

  /**
   * Register event handler
   */
  registerHandler(handler: EventHandler): void {
    const handlers = this.eventHandlers.get(handler.eventType) || [];
    handlers.push(handler);
    this.eventHandlers.set(handler.eventType, handlers);
  }

  /**
   * Emit automation event
   */
  async emit(event: AutomationEvent): Promise<void> {
    try {
      console.log(`🎯 Event emitted: ${event.type} for user ${event.userId}`);
      
      const handlers = this.eventHandlers.get(event.type) || [];
      
      for (const handler of handlers) {
        if (this.evaluateConditions(handler.conditions || [], event.data)) {
          console.log(`🤖 Triggering workflow ${handler.workflowId} for event ${event.type}`);
          
          try {
            await automationEngine.triggerWorkflow(
              handler.workflowId,
              event.userId,
              {
                eventType: event.type,
                eventData: event.data,
                timestamp: event.timestamp,
                source: event.source
              }
            );
          } catch (error) {
            console.error(`❌ Failed to trigger workflow ${handler.workflowId}:`, error);
          }
        } else {
          console.log(`⏭️ Skipping workflow ${handler.workflowId} - conditions not met`);
        }
      }
    } catch (error) {
      console.error('❌ Event emission failed:', error);
    }
  }

  /**
   * Evaluate event conditions
   */
  private evaluateConditions(conditions: EventCondition[], data: Record<string, any>): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = this.getNestedValue(data, condition.field);
      
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
        case 'exists':
          return value !== undefined && value !== null;
        default:
          return false;
      }
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Convenience methods for common events
   */

  /**
   * User signup event
   */
  async onUserSignup(userId: string, userData: {
    email: string;
    firstName?: string;
    source?: string;
    interests?: string[];
    utm?: Record<string, string>;
  }): Promise<void> {
    await this.emit({
      type: 'user.created',
      userId,
      data: {
        ...userData,
        signupDate: new Date(),
        isNewUser: true
      },
      timestamp: new Date(),
      source: 'registration'
    });
  }

  /**
   * Price drop event
   */
  async onPriceDropDetected(userId: string, priceData: {
    origin: string;
    destination: string;
    currentPrice: number;
    previousPrice: number;
    percentageDiscount: number;
    currency: string;
    routeId: string;
  }): Promise<void> {
    await this.emit({
      type: 'price.dropped',
      userId,
      data: {
        ...priceData,
        savings: priceData.previousPrice - priceData.currentPrice,
        alertType: 'price_drop'
      },
      timestamp: new Date(),
      source: 'price_monitor'
    });
  }

  /**
   * Booking confirmation event
   */
  async onBookingConfirmed(userId: string, bookingData: {
    bookingReference: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    totalPrice: number;
    currency: string;
    passengerCount: number;
    airline: string;
  }): Promise<void> {
    const daysUntilTravel = Math.ceil(
      (new Date(bookingData.departureDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    await this.emit({
      type: 'booking.confirmed',
      userId,
      data: {
        ...bookingData,
        daysUntilTravel,
        bookingDate: new Date(),
        tripType: bookingData.returnDate ? 'round_trip' : 'one_way'
      },
      timestamp: new Date(),
      source: 'booking_system'
    });
  }

  /**
   * User inactivity event
   */
  async onUserInactive(userId: string, inactivityData: {
    lastLoginDate: Date;
    lastEmailOpenDate?: Date;
    lastBookingDate?: Date;
    daysSinceLastActivity: number;
  }): Promise<void> {
    await this.emit({
      type: 'user.inactive',
      userId,
      data: {
        ...inactivityData,
        checkDate: new Date(),
        inactivityLevel: inactivityData.daysSinceLastActivity > 60 ? 'high' : 'medium'
      },
      timestamp: new Date(),
      source: 'activity_monitor'
    });
  }

  /**
   * Search abandonment event
   */
  async onSearchAbandoned(userId: string, searchData: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    searchResults: number;
    timeOnResults: number; // seconds
    highestPrice: number;
    lowestPrice: number;
    currency: string;
  }): Promise<void> {
    await this.emit({
      type: 'search.abandoned',
      userId,
      data: {
        ...searchData,
        searchDate: new Date(),
        tripType: searchData.returnDate ? 'round_trip' : 'one_way',
        priceRange: {
          min: searchData.lowestPrice,
          max: searchData.highestPrice,
          spread: searchData.highestPrice - searchData.lowestPrice
        }
      },
      timestamp: new Date(),
      source: 'search_tracker'
    });
  }

  /**
   * Email interaction events
   */
  async onEmailOpened(userId: string, emailData: {
    campaignId?: string;
    templateId: string;
    messageId: string;
    openedAt: Date;
    userAgent?: string;
    location?: string;
  }): Promise<void> {
    await this.emit({
      type: 'email.opened',
      userId,
      data: {
        ...emailData,
        interactionType: 'open'
      },
      timestamp: emailData.openedAt,
      source: 'email_tracker'
    });
  }

  async onEmailClicked(userId: string, clickData: {
    campaignId?: string;
    templateId: string;
    messageId: string;
    clickedUrl: string;
    clickedAt: Date;
    linkText?: string;
  }): Promise<void> {
    await this.emit({
      type: 'email.clicked',
      userId,
      data: {
        ...clickData,
        interactionType: 'click'
      },
      timestamp: clickData.clickedAt,
      source: 'email_tracker'
    });
  }

  /**
   * Flight alert subscription event
   */
  async onFlightAlertSubscribed(userId: string, alertData: {
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string;
    targetPrice?: number;
    currency: string;
    flexibility: 'exact' | 'flexible';
  }): Promise<void> {
    await this.emit({
      type: 'alert.subscribed',
      userId,
      data: {
        ...alertData,
        subscribedAt: new Date(),
        alertType: 'price_watch'
      },
      timestamp: new Date(),
      source: 'alert_system'
    });
  }

  /**
   * Get event statistics
   */
  getEventStats(): Record<string, any> {
    return {
      totalEventTypes: this.eventHandlers.size,
      eventHandlers: Array.from(this.eventHandlers.entries()).map(([eventType, handlers]) => ({
        eventType,
        handlerCount: handlers.length,
        workflows: handlers.map(h => h.workflowId)
      }))
    };
  }
}

// Lazy-loaded singleton to avoid initialization during build time
let _eventSystemInstance: AutomationEventSystem | null = null;

export const getEventSystem = (): AutomationEventSystem => {
  if (!_eventSystemInstance) {
    _eventSystemInstance = new AutomationEventSystem();
  }
  return _eventSystemInstance;
};

// Helper function to trigger events from anywhere in the application
export async function triggerAutomationEvent(
  eventType: string,
  userId: string,
  data: Record<string, any>,
  source: string = 'application'
): Promise<void> {
  await getEventSystem().emit({
    type: eventType,
    userId,
    data,
    timestamp: new Date(),
    source
  });
}