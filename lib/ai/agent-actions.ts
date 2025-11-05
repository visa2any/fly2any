/**
 * AI Agent Action System
 *
 * Defines action types, planning, and execution flow for autonomous agent actions.
 * Real travel agents don't just talk - they DO THINGS.
 */

export type AgentActionType =
  | 'search-flights'
  | 'search-hotels'
  | 'search-cars'
  | 'search-packages'
  | 'check-availability'
  | 'compare-options'
  | 'add-to-cart'
  | 'remove-from-cart'
  | 'calculate-total'
  | 'verify-requirements'
  | 'check-visa'
  | 'check-baggage'
  | 'check-seat-availability'
  | 'create-itinerary'
  | 'create-comparison'
  | 'find-alternatives'
  | 'check-price-drop'
  | 'book'
  | 'modify-booking'
  | 'cancel-booking'
  | 'send-confirmation'
  | 'apply-discount'
  | 'verify-payment';

export type AgentActionStatus =
  | 'planned'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'waiting-permission'
  | 'skipped';

export interface AgentAction {
  id: string;
  type: AgentActionType;
  requiresPermission: boolean;
  status: AgentActionStatus;
  description: string;
  params?: any;
  result?: any;
  error?: string;
  timestamp?: Date;
  duration?: number;
  metadata?: {
    autoExecute?: boolean;
    priority?: 'low' | 'medium' | 'high';
    cancelable?: boolean;
    retryable?: boolean;
    retryCount?: number;
    maxRetries?: number;
  };
}

export interface ActionPlan {
  id: string;
  actions: AgentAction[];
  currentActionIndex: number;
  autoExecute: boolean;
  userIntent: string;
  context?: any;
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
}

export interface ActionContext {
  userId?: string;
  sessionId?: string;
  conversationId?: string;
  consultantId?: string;
  previousActions?: AgentAction[];
  userPreferences?: any;
  cartItems?: any[];
  bookingHistory?: any[];
}

/**
 * Plan what actions to take based on user intent
 */
export function planActions(
  userIntent: string,
  context: ActionContext = {}
): ActionPlan {
  const intent = userIntent.toLowerCase().trim();
  const actions: AgentAction[] = [];
  let autoExecute = true;

  // Parse user intent and create action plan
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Flight search intents
  if (intent.includes('find') || intent.includes('search') || intent.includes('look for')) {
    if (intent.includes('flight')) {
      actions.push(createAction('search-flights', {
        description: 'Search for flights based on your criteria',
        params: extractFlightSearchParams(intent, context),
        requiresPermission: false,
      }));
      actions.push(createAction('compare-options', {
        description: 'Compare flight options and find the best deals',
        requiresPermission: false,
      }));
    } else if (intent.includes('hotel')) {
      actions.push(createAction('search-hotels', {
        description: 'Search for hotels in your destination',
        params: extractHotelSearchParams(intent, context),
        requiresPermission: false,
      }));
      actions.push(createAction('compare-options', {
        description: 'Compare hotel options',
        requiresPermission: false,
      }));
    } else if (intent.includes('car')) {
      actions.push(createAction('search-cars', {
        description: 'Search for rental cars',
        params: extractCarSearchParams(intent, context),
        requiresPermission: false,
      }));
    } else if (intent.includes('package')) {
      actions.push(createAction('search-packages', {
        description: 'Search for vacation packages',
        requiresPermission: false,
      }));
    }
  }

  // Check availability
  if (intent.includes('check availability') || intent.includes('still available')) {
    actions.push(createAction('check-availability', {
      description: 'Check if the option is still available',
      requiresPermission: false,
    }));
  }

  // Add to cart
  if (intent.includes('add to cart') || intent.includes('save') || intent.includes('hold')) {
    actions.push(createAction('add-to-cart', {
      description: 'Add the selected option to your cart',
      params: extractCartParams(intent, context),
      requiresPermission: false,
    }));
    actions.push(createAction('calculate-total', {
      description: 'Calculate the total price including taxes and fees',
      requiresPermission: false,
    }));
  }

  // Compare options
  if (intent.includes('compare') || intent.includes('difference between') || intent.includes('vs')) {
    actions.push(createAction('create-comparison', {
      description: 'Create a detailed comparison of options',
      requiresPermission: false,
    }));
  }

  // Verify requirements
  if (intent.includes('visa') || intent.includes('passport') || intent.includes('requirement')) {
    actions.push(createAction('verify-requirements', {
      description: 'Check travel requirements for your destination',
      params: extractDestination(intent),
      requiresPermission: false,
    }));
  }

  // Check baggage
  if (intent.includes('baggage') || intent.includes('luggage') || intent.includes('bag')) {
    actions.push(createAction('check-baggage', {
      description: 'Check baggage allowance and fees',
      requiresPermission: false,
    }));
  }

  // Find alternatives
  if (intent.includes('alternative') || intent.includes('other option') || intent.includes('different')) {
    actions.push(createAction('find-alternatives', {
      description: 'Find alternative options',
      requiresPermission: false,
    }));
  }

  // Create itinerary
  if (intent.includes('itinerary') || intent.includes('plan my trip')) {
    actions.push(createAction('create-itinerary', {
      description: 'Create a detailed travel itinerary',
      requiresPermission: false,
    }));
  }

  // Booking actions (require permission)
  if (intent.includes('book') || intent.includes('reserve') || intent.includes('purchase')) {
    // First verify everything
    actions.push(createAction('check-availability', {
      description: 'Verify availability before booking',
      requiresPermission: false,
    }));
    actions.push(createAction('calculate-total', {
      description: 'Calculate final price',
      requiresPermission: false,
    }));
    // Then book (requires permission)
    actions.push(createAction('book', {
      description: 'Complete the booking',
      requiresPermission: true,
    }));
    autoExecute = false; // Don't auto-execute if booking involved
  }

  // Modify booking
  if (intent.includes('modify') || intent.includes('change booking')) {
    actions.push(createAction('modify-booking', {
      description: 'Modify your existing booking',
      requiresPermission: true,
    }));
    autoExecute = false;
  }

  // Cancel booking
  if (intent.includes('cancel')) {
    actions.push(createAction('cancel-booking', {
      description: 'Cancel your booking',
      requiresPermission: true,
    }));
    autoExecute = false;
  }

  // If no actions identified, create a generic search action
  if (actions.length === 0) {
    actions.push(createAction('search-flights', {
      description: 'Search for travel options',
      requiresPermission: false,
    }));
  }

  return {
    id: planId,
    actions,
    currentActionIndex: 0,
    autoExecute,
    userIntent,
    context,
    createdAt: new Date(),
    status: 'pending',
  };
}

/**
 * Create a single action
 */
function createAction(
  type: AgentActionType,
  options: {
    description: string;
    params?: any;
    requiresPermission: boolean;
    priority?: 'low' | 'medium' | 'high';
  }
): AgentAction {
  return {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    status: 'planned',
    description: options.description,
    params: options.params,
    requiresPermission: options.requiresPermission,
    timestamp: new Date(),
    metadata: {
      autoExecute: !options.requiresPermission,
      priority: options.priority || 'medium',
      cancelable: true,
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
    },
  };
}

/**
 * Extract flight search parameters from user intent
 */
function extractFlightSearchParams(intent: string, context: ActionContext): any {
  // This is a simplified version - in production, use NLP
  const params: any = {};

  // Extract origin
  const fromMatch = intent.match(/from\s+([a-z\s]+?)(?:\s+to|\s+on|\s*$)/i);
  if (fromMatch) {
    params.origin = fromMatch[1].trim();
  }

  // Extract destination
  const toMatch = intent.match(/to\s+([a-z\s]+?)(?:\s+on|\s+from|\s*$)/i);
  if (toMatch) {
    params.destination = toMatch[1].trim();
  }

  // Extract dates
  const dateMatch = intent.match(/(?:on|date)\s+([a-z0-9\s,]+)/i);
  if (dateMatch) {
    params.date = dateMatch[1].trim();
  }

  // Extract passengers
  const passengerMatch = intent.match(/(\d+)\s+(?:passenger|person|people|adult)/i);
  if (passengerMatch) {
    params.passengers = parseInt(passengerMatch[1]);
  }

  // Extract class
  if (intent.includes('business')) params.cabinClass = 'business';
  if (intent.includes('first class')) params.cabinClass = 'first';
  if (intent.includes('economy')) params.cabinClass = 'economy';

  return params;
}

/**
 * Extract hotel search parameters from user intent
 */
function extractHotelSearchParams(intent: string, context: ActionContext): any {
  const params: any = {};

  // Extract location
  const inMatch = intent.match(/(?:in|at)\s+([a-z\s]+?)(?:\s+for|\s+on|\s*$)/i);
  if (inMatch) {
    params.location = inMatch[1].trim();
  }

  // Extract dates
  const checkInMatch = intent.match(/(?:check.?in|from)\s+([a-z0-9\s,]+)/i);
  if (checkInMatch) {
    params.checkIn = checkInMatch[1].trim();
  }

  const checkOutMatch = intent.match(/(?:check.?out|to)\s+([a-z0-9\s,]+)/i);
  if (checkOutMatch) {
    params.checkOut = checkOutMatch[1].trim();
  }

  // Extract guests
  const guestMatch = intent.match(/(\d+)\s+(?:guest|person|people)/i);
  if (guestMatch) {
    params.guests = parseInt(guestMatch[1]);
  }

  return params;
}

/**
 * Extract car rental search parameters
 */
function extractCarSearchParams(intent: string, context: ActionContext): any {
  const params: any = {};

  // Extract location
  const locationMatch = intent.match(/(?:in|at)\s+([a-z\s]+?)(?:\s+for|\s+on|\s*$)/i);
  if (locationMatch) {
    params.location = locationMatch[1].trim();
  }

  // Extract car type
  if (intent.includes('suv')) params.carType = 'suv';
  if (intent.includes('sedan')) params.carType = 'sedan';
  if (intent.includes('luxury')) params.carType = 'luxury';

  return params;
}

/**
 * Extract cart parameters
 */
function extractCartParams(intent: string, context: ActionContext): any {
  const params: any = {};

  // Extract option number
  const optionMatch = intent.match(/option\s+(\d+)/i);
  if (optionMatch) {
    params.optionIndex = parseInt(optionMatch[1]) - 1;
  }

  return params;
}

/**
 * Extract destination from intent
 */
function extractDestination(intent: string): any {
  const toMatch = intent.match(/(?:to|for)\s+([a-z\s]+?)(?:\s|$)/i);
  return toMatch ? { destination: toMatch[1].trim() } : {};
}

/**
 * Check if an action requires user permission
 */
export function requiresUserPermission(action: AgentAction): boolean {
  return action.requiresPermission;
}

/**
 * Get the next action to execute in a plan
 */
export function getNextAction(plan: ActionPlan): AgentAction | null {
  if (plan.currentActionIndex >= plan.actions.length) {
    return null;
  }
  return plan.actions[plan.currentActionIndex];
}

/**
 * Update action status
 */
export function updateActionStatus(
  action: AgentAction,
  status: AgentActionStatus,
  result?: any,
  error?: string
): AgentAction {
  return {
    ...action,
    status,
    result,
    error,
    duration: action.timestamp ? Date.now() - action.timestamp.getTime() : undefined,
  };
}

/**
 * Update action plan
 */
export function updatePlan(
  plan: ActionPlan,
  updates: Partial<ActionPlan>
): ActionPlan {
  return {
    ...plan,
    ...updates,
  };
}

/**
 * Check if plan is complete
 */
export function isPlanComplete(plan: ActionPlan): boolean {
  return plan.currentActionIndex >= plan.actions.length ||
         plan.status === 'completed' ||
         plan.status === 'failed' ||
         plan.status === 'cancelled';
}

/**
 * Get plan progress percentage
 */
export function getPlanProgress(plan: ActionPlan): number {
  if (plan.actions.length === 0) return 0;
  const completedActions = plan.actions.filter(a => a.status === 'completed').length;
  return Math.round((completedActions / plan.actions.length) * 100);
}

/**
 * Get plan summary
 */
export function getPlanSummary(plan: ActionPlan): {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  executing: number;
} {
  return {
    total: plan.actions.length,
    completed: plan.actions.filter(a => a.status === 'completed').length,
    failed: plan.actions.filter(a => a.status === 'failed').length,
    pending: plan.actions.filter(a => a.status === 'planned').length,
    executing: plan.actions.filter(a => a.status === 'executing').length,
  };
}
