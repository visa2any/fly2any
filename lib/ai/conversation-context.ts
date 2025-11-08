/**
 * Conversation Context Tracking
 * Maintains state and history of conversation for natural flow
 */

export type IntentType =
  | 'greeting'
  | 'how-are-you'
  | 'small-talk'
  | 'personal-question'
  | 'gratitude'
  | 'destination-recommendation'
  | 'booking-management'
  | 'booking-modification'
  | 'booking-cancellation'
  | 'service-request'
  | 'question'
  | 'casual'
  | 'farewell';

export interface FlightSearchInfo {
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  flightType?: 'domestic' | 'international';
  passengers?: number;
  timestamp: number;
}

export interface BookingModificationInfo {
  bookingReference: string;
  modificationType: 'date' | 'route' | 'passenger' | 'class' | 'cancellation';
  requestedAt: number;
  status: 'requested' | 'quoted' | 'confirmed' | 'failed';
  details?: any;
}

export interface ConversationInteraction {
  intent: IntentType;
  userMessage?: string;
  assistantResponse: string;
  timestamp: number;
  flightSearch?: FlightSearchInfo;
  bookingModification?: BookingModificationInfo;
}

export interface ConversationIntent {
  type: IntentType;
  confidence: number;
  timestamp: number;
}

/**
 * Tracks conversation context and history
 */
export class ConversationContext {
  private interactions: ConversationInteraction[] = [];
  private intents: Map<IntentType, number> = new Map();
  private conversationStart: number;
  private lastResponseTime: number;
  private userSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  private userName?: string;
  private hasGreeted: boolean = false;
  private hasAskedWellbeing: boolean = false;
  private hasOfferedService: boolean = false;
  private rapportLevel: number = 0; // 0-10 scale
  private flightSearches: FlightSearchInfo[] = [];
  private bookingModifications: BookingModificationInfo[] = [];
  private lastFlightType?: 'domestic' | 'international';

  constructor() {
    this.conversationStart = Date.now();
    this.lastResponseTime = Date.now();
  }

  /**
   * Add an interaction to the history
   */
  addInteraction(
    intent: IntentType,
    response: string,
    userMessage?: string,
    flightSearch?: FlightSearchInfo,
    bookingModification?: BookingModificationInfo
  ): void {
    const interaction: ConversationInteraction = {
      intent,
      userMessage,
      assistantResponse: response,
      timestamp: Date.now(),
      flightSearch,
      bookingModification
    };

    this.interactions.push(interaction);
    this.intents.set(intent, (this.intents.get(intent) || 0) + 1);
    this.lastResponseTime = Date.now();

    // Track flight searches
    if (flightSearch) {
      this.flightSearches.push(flightSearch);
      if (flightSearch.flightType) {
        this.lastFlightType = flightSearch.flightType;
      }
    }

    // Track booking modifications
    if (bookingModification) {
      this.bookingModifications.push(bookingModification);
    }

    // Update flags based on intent
    if (intent === 'greeting') {
      this.hasGreeted = true;
      this.rapportLevel = Math.min(10, this.rapportLevel + 2);
    }

    if (intent === 'how-are-you' || intent === 'small-talk') {
      this.hasAskedWellbeing = true;
      this.rapportLevel = Math.min(10, this.rapportLevel + 3);
    }

    if (intent === 'service-request') {
      this.hasOfferedService = true;
    }

    if (intent === 'gratitude') {
      this.rapportLevel = Math.min(10, this.rapportLevel + 1);
    }
  }

  /**
   * Check if we've interacted with a specific intent
   */
  hasInteracted(intent: IntentType): boolean {
    return this.intents.has(intent);
  }

  /**
   * Get count of interactions for an intent
   */
  getInteractionCount(intent: IntentType): number {
    return this.intents.get(intent) || 0;
  }

  /**
   * Get all interactions
   */
  getInteractions(): ConversationInteraction[] {
    return [...this.interactions];
  }

  /**
   * Get recent interactions (last N)
   */
  getRecentInteractions(count: number = 5): ConversationInteraction[] {
    return this.interactions.slice(-count);
  }

  /**
   * Get last response
   */
  getLastResponse(): string | undefined {
    const last = this.interactions[this.interactions.length - 1];
    return last?.assistantResponse;
  }

  /**
   * Get conversation duration in seconds
   */
  getConversationDuration(): number {
    return Math.floor((Date.now() - this.conversationStart) / 1000);
  }

  /**
   * Get time since last interaction in seconds
   */
  getTimeSinceLastInteraction(): number {
    return Math.floor((Date.now() - this.lastResponseTime) / 1000);
  }

  /**
   * Check if this is a new conversation (first interaction)
   */
  isNewConversation(): boolean {
    return this.interactions.length === 0;
  }

  /**
   * Check if greeting phase is complete
   */
  isGreetingPhaseComplete(): boolean {
    return this.hasGreeted && (this.hasAskedWellbeing || this.interactions.length >= 2);
  }

  /**
   * Check if we've built enough rapport to offer services
   */
  hasEstablishedRapport(): boolean {
    return this.rapportLevel >= 5 || this.isGreetingPhaseComplete();
  }

  /**
   * Should we transition to service mode?
   */
  shouldTransitionToService(): boolean {
    return this.hasEstablishedRapport() && !this.hasOfferedService;
  }

  /**
   * Set user name if mentioned
   */
  setUserName(name: string): void {
    this.userName = name;
  }

  /**
   * Get user name if known
   */
  getUserName(): string | undefined {
    return this.userName;
  }

  /**
   * Update user sentiment
   */
  setSentiment(sentiment: 'positive' | 'neutral' | 'negative'): void {
    this.userSentiment = sentiment;
  }

  /**
   * Get current user sentiment
   */
  getSentiment(): 'positive' | 'neutral' | 'negative' {
    return this.userSentiment;
  }

  /**
   * Get rapport level (0-10)
   */
  getRapportLevel(): number {
    return this.rapportLevel;
  }

  /**
   * Check if we're in casual conversation mode
   */
  isCasualMode(): boolean {
    const casualIntents: IntentType[] = ['greeting', 'how-are-you', 'small-talk', 'casual'];
    const casualCount = casualIntents.reduce(
      (sum, intent) => sum + this.getInteractionCount(intent),
      0
    );
    return casualCount > 0 && !this.hasOfferedService;
  }

  /**
   * Check if we're in service mode
   */
  isServiceMode(): boolean {
    return this.hasOfferedService;
  }

  /**
   * Get conversation stage
   */
  getConversationStage(): 'greeting' | 'building-rapport' | 'service' | 'ongoing' {
    if (!this.hasGreeted) return 'greeting';
    if (!this.hasEstablishedRapport()) return 'building-rapport';
    if (this.hasOfferedService) return 'service';
    return 'ongoing';
  }

  /**
   * Check if a response was already given (prevent repeats)
   */
  hasGivenResponse(response: string): boolean {
    return this.interactions.some(
      interaction =>
        interaction.assistantResponse.toLowerCase().includes(response.toLowerCase()) ||
        response.toLowerCase().includes(interaction.assistantResponse.toLowerCase())
    );
  }

  /**
   * Track flight search with flight type detection
   */
  addFlightSearch(searchInfo: FlightSearchInfo): void {
    this.flightSearches.push(searchInfo);
    if (searchInfo.flightType) {
      this.lastFlightType = searchInfo.flightType;
    }
  }

  /**
   * Track booking modification
   */
  addBookingModification(modificationInfo: BookingModificationInfo): void {
    this.bookingModifications.push(modificationInfo);
  }

  /**
   * Get all flight searches
   */
  getFlightSearches(): FlightSearchInfo[] {
    return [...this.flightSearches];
  }

  /**
   * Get recent flight searches
   */
  getRecentFlightSearches(count: number = 5): FlightSearchInfo[] {
    return this.flightSearches.slice(-count);
  }

  /**
   * Get last flight type searched
   */
  getLastFlightType(): 'domestic' | 'international' | undefined {
    return this.lastFlightType;
  }

  /**
   * Get all booking modifications
   */
  getBookingModifications(): BookingModificationInfo[] {
    return [...this.bookingModifications];
  }

  /**
   * Get pending booking modifications
   */
  getPendingModifications(): BookingModificationInfo[] {
    return this.bookingModifications.filter(
      mod => mod.status === 'requested' || mod.status === 'quoted'
    );
  }

  /**
   * Check if user has searched for flights
   */
  hasSearchedFlights(): boolean {
    return this.flightSearches.length > 0;
  }

  /**
   * Check if user has requested booking modifications
   */
  hasRequestedModifications(): boolean {
    return this.bookingModifications.length > 0;
  }

  /**
   * Get most searched route
   */
  getMostSearchedRoute(): { origin: string; destination: string; count: number } | undefined {
    const routeCounts = new Map<string, { origin: string; destination: string; count: number }>();

    for (const search of this.flightSearches) {
      const routeKey = `${search.origin}-${search.destination}`;
      const existing = routeCounts.get(routeKey);

      if (existing) {
        existing.count++;
      } else {
        routeCounts.set(routeKey, {
          origin: search.origin,
          destination: search.destination,
          count: 1
        });
      }
    }

    if (routeCounts.size === 0) return undefined;

    let mostSearched = { origin: '', destination: '', count: 0 };
    for (const route of routeCounts.values()) {
      if (route.count > mostSearched.count) {
        mostSearched = route;
      }
    }

    return mostSearched;
  }

  /**
   * Get user preferences based on search history
   */
  getUserPreferences(): {
    preferredOrigins: string[];
    preferredDestinations: string[];
    prefersDomestic: boolean;
    prefersInternational: boolean;
    averagePassengers: number;
  } {
    const origins = new Map<string, number>();
    const destinations = new Map<string, number>();
    let domesticCount = 0;
    let internationalCount = 0;
    let totalPassengers = 0;
    let passengerSearchCount = 0;

    for (const search of this.flightSearches) {
      origins.set(search.origin, (origins.get(search.origin) || 0) + 1);
      destinations.set(search.destination, (destinations.get(search.destination) || 0) + 1);

      if (search.flightType === 'domestic') domesticCount++;
      if (search.flightType === 'international') internationalCount++;

      if (search.passengers) {
        totalPassengers += search.passengers;
        passengerSearchCount++;
      }
    }

    // Get top 3 origins and destinations
    const topOrigins = Array.from(origins.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([code]) => code);

    const topDestinations = Array.from(destinations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([code]) => code);

    return {
      preferredOrigins: topOrigins,
      preferredDestinations: topDestinations,
      prefersDomestic: domesticCount > internationalCount,
      prefersInternational: internationalCount > domesticCount,
      averagePassengers: passengerSearchCount > 0 ? Math.round(totalPassengers / passengerSearchCount) : 1
    };
  }

  /**
   * Get conversation summary
   */
  getSummary(): {
    duration: number;
    interactionCount: number;
    stage: string;
    rapportLevel: number;
    hasGreeted: boolean;
    hasEstablishedRapport: boolean;
    isServiceMode: boolean;
    flightSearchCount: number;
    bookingModificationCount: number;
    lastFlightType?: 'domestic' | 'international';
  } {
    return {
      duration: this.getConversationDuration(),
      interactionCount: this.interactions.length,
      stage: this.getConversationStage(),
      rapportLevel: this.rapportLevel,
      hasGreeted: this.hasGreeted,
      hasEstablishedRapport: this.hasEstablishedRapport(),
      isServiceMode: this.isServiceMode(),
      flightSearchCount: this.flightSearches.length,
      bookingModificationCount: this.bookingModifications.length,
      lastFlightType: this.lastFlightType
    };
  }

  /**
   * Reset context (for new conversation)
   */
  reset(): void {
    this.interactions = [];
    this.intents.clear();
    this.conversationStart = Date.now();
    this.lastResponseTime = Date.now();
    this.userSentiment = 'neutral';
    this.userName = undefined;
    this.hasGreeted = false;
    this.hasAskedWellbeing = false;
    this.hasOfferedService = false;
    this.rapportLevel = 0;
    this.flightSearches = [];
    this.bookingModifications = [];
    this.lastFlightType = undefined;
  }
}
