/**
 * Predictive Lead Scoring Service
 * AI-powered lead scoring and qualification system for travel business
 */

export interface LeadScoringInput {
  // Contact Information
  email?: string;
  phone?: string;
  whatsapp?: string;
  name?: string;
  
  // Travel Details
  origem?: string;
  destino?: string;
  dataPartida?: string;
  dataRetorno?: string;
  tipoViagem?: 'ida' | 'ida_volta';
  numeroPassageiros?: number;
  adultos?: number;
  criancas?: number;
  bebes?: number;
  classeViagem?: 'economica' | 'executiva' | 'primeira';
  
  // Budget & Preferences
  orcamentoAproximado?: number;
  prioridadeOrcamento?: 'baixo' | 'medio' | 'alto';
  precisaHospedagem?: boolean;
  precisaTransporte?: boolean;
  selectedServices?: string[];
  
  // Behavioral Data
  source?: string;
  pageViews?: number;
  timeOnSite?: number;
  previousVisits?: number;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  
  // Previous History
  isReturningCustomer?: boolean;
  previousBookings?: number;
  lastBookingDate?: string;
  averageSpend?: number;
  
  // Engagement Signals
  emailOpened?: boolean;
  emailClicked?: boolean;
  chatEngaged?: boolean;
  formCompleted?: boolean;
  brochureDownloaded?: boolean;
  
  // Timing Factors
  createdAt?: string;
  urgency?: 'baixa' | 'media' | 'alta' | 'critica';
  
  // Additional Context
  observacoes?: string;
  referralSource?: string;
  marketingCampaign?: string;
}

export interface LeadScore {
  // Overall Score
  totalScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D';
  
  // Score Breakdown
  breakdown: {
    contactQuality: number; // 0-25
    travelIntent: number;   // 0-25
    budgetFit: number;      // 0-20
    timingUrgency: number;  // 0-15
    engagementLevel: number; // 0-15
  };
  
  // Predictions
  predictions: {
    conversionProbability: number; // 0-1
    estimatedValue: number;
    timeToConversion: number; // days
    bestContactTime: string;
    preferredChannel: string;
  };
  
  // Insights & Actions
  insights: {
    buyingSignals: string[];
    obstacles: string[];
    opportunities: string[];
  };
  
  nextActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    reason: string;
  }>;
  
  // Personalization Data
  personalization: {
    messagingStyle: 'formal' | 'casual' | 'friendly';
    focusAreas: string[];
    offerType: string;
    discountSuggestion?: number;
  };
  
  metadata: {
    scoredAt: string;
    version: string;
    confidence: number;
  };
}

export interface LeadTrend {
  leadId: string;
  scores: Array<{
    score: number;
    timestamp: string;
    factors: Record<string, number>;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  velocity: number; // Points per day
}

class LeadScoringService {
  private readonly version = '2.0.0';
  
  /**
   * Calculate comprehensive lead score with AI insights
   */
  async calculateLeadScore(input: LeadScoringInput): Promise<LeadScore> {
    try {
      const breakdown = this.calculateScoreBreakdown(input);
      const totalScore = this.calculateTotalScore(breakdown);
      const grade = this.assignGrade(totalScore);
      
      const predictions = await this.generatePredictions(input, totalScore);
      const insights = this.generateInsights(input, breakdown);
      const nextActions = this.generateNextActions(input, totalScore, insights);
      const personalization = this.generatePersonalization(input, insights);
      
      return {
        totalScore,
        grade,
        breakdown,
        predictions,
        insights,
        nextActions,
        personalization,
        metadata: {
          scoredAt: new Date().toISOString(),
          version: this.version,
          confidence: this.calculateConfidence(input)
        }
      };
    } catch (error) {
      console.error('Lead scoring error:', error);
      throw new Error('Failed to calculate lead score');
    }
  }

  /**
   * Calculate score breakdown by category
   */
  private calculateScoreBreakdown(input: LeadScoringInput) {
    return {
      contactQuality: this.calculateContactQuality(input),
      travelIntent: this.calculateTravelIntent(input),
      budgetFit: this.calculateBudgetFit(input),
      timingUrgency: this.calculateTimingUrgency(input),
      engagementLevel: this.calculateEngagementLevel(input)
    };
  }

  /**
   * Contact Quality Score (0-25 points)
   */
  private calculateContactQuality(input: LeadScoringInput): number {
    let score = 0;
    
    // Email quality
    if (input.email) {
      score += 8;
      if (this.isBusinessEmail(input.email)) score += 3;
      if (this.isValidEmailDomain(input.email)) score += 2;
    }
    
    // Phone/WhatsApp
    if (input.phone || input.whatsapp) {
      score += 10;
      if (input.phone && input.whatsapp) score += 2; // Multiple contact methods
    }
    
    // Complete name
    if (input.name && input.name.trim().split(' ').length >= 2) {
      score += 5;
    }
    
    return Math.min(25, score);
  }

  /**
   * Travel Intent Score (0-25 points)
   */
  private calculateTravelIntent(input: LeadScoringInput): number {
    let score = 0;
    
    // Destination specificity
    if (input.destino) {
      score += 6;
      if (this.isInternationalDestination(input.destino)) score += 4; // Higher value
      if (this.isPopularDestination(input.destino)) score += 2;
    }
    
    // Travel dates
    if (input.dataPartida) {
      score += 5;
      const daysUntilTravel = this.getDaysUntilTravel(input.dataPartida);
      if (daysUntilTravel < 90) score += 4; // Near-term travel
      if (daysUntilTravel < 30) score += 6; // Urgent travel
    }
    
    // Travel details completion
    if (input.numeroPassageiros || input.adultos) score += 3;
    if (input.classeViagem) score += 2;
    if (input.tipoViagem === 'ida_volta') score += 2; // Round trip = higher value
    
    // Service requirements
    if (input.precisaHospedagem) score += 2;
    if (input.precisaTransporte) score += 1;
    if (input.selectedServices && input.selectedServices.length > 0) score += 2;
    
    return Math.min(25, score);
  }

  /**
   * Budget Fit Score (0-20 points)
   */
  private calculateBudgetFit(input: LeadScoringInput): number {
    let score = 0;
    
    if (input.orcamentoAproximado) {
      score += 5;
      
      // Budget ranges (travel industry specific)
      if (input.orcamentoAproximado >= 10000) score += 15; // Premium
      else if (input.orcamentoAproximado >= 5000) score += 12; // High value
      else if (input.orcamentoAproximado >= 2500) score += 8;  // Medium
      else if (input.orcamentoAproximado >= 1000) score += 4;  // Budget
    }
    
    // Budget priority signals
    if (input.prioridadeOrcamento === 'alto') score += 5;
    else if (input.prioridadeOrcamento === 'medio') score += 3;
    
    // Class preference
    if (input.classeViagem === 'primeira') score += 5;
    else if (input.classeViagem === 'executiva') score += 3;
    
    return Math.min(20, score);
  }

  /**
   * Timing Urgency Score (0-15 points)
   */
  private calculateTimingUrgency(input: LeadScoringInput): number {
    let score = 0;
    
    // Explicit urgency
    if (input.urgency === 'critica') score += 15;
    else if (input.urgency === 'alta') score += 12;
    else if (input.urgency === 'media') score += 8;
    else if (input.urgency === 'baixa') score += 4;
    
    // Travel date proximity
    if (input.dataPartida) {
      const days = this.getDaysUntilTravel(input.dataPartida);
      if (days < 7) score += 10;      // Very urgent
      else if (days < 30) score += 8;  // Urgent
      else if (days < 90) score += 6;  // Moderate urgency
      else if (days < 180) score += 3; // Planning ahead
    }
    
    // Lead age (fresher leads are more urgent)
    if (input.createdAt) {
      const hoursOld = this.getHoursOld(input.createdAt);
      if (hoursOld < 2) score += 5;    // Very fresh
      else if (hoursOld < 24) score += 3; // Fresh
      else if (hoursOld < 72) score += 1; // Recent
    }
    
    return Math.min(15, score);
  }

  /**
   * Engagement Level Score (0-15 points)
   */
  private calculateEngagementLevel(input: LeadScoringInput): number {
    let score = 0;
    
    // Digital engagement
    if (input.emailOpened) score += 2;
    if (input.emailClicked) score += 3;
    if (input.chatEngaged) score += 4;
    if (input.formCompleted) score += 3;
    if (input.brochureDownloaded) score += 2;
    
    // Website behavior
    if (input.pageViews) {
      if (input.pageViews >= 10) score += 4;
      else if (input.pageViews >= 5) score += 3;
      else if (input.pageViews >= 2) score += 2;
    }
    
    if (input.timeOnSite) {
      if (input.timeOnSite >= 600) score += 3; // 10+ minutes
      else if (input.timeOnSite >= 300) score += 2; // 5+ minutes
      else if (input.timeOnSite >= 120) score += 1; // 2+ minutes
    }
    
    if (input.previousVisits && input.previousVisits > 1) {
      score += Math.min(3, input.previousVisits);
    }
    
    // Returning customer bonus
    if (input.isReturningCustomer) score += 5;
    if (input.previousBookings && input.previousBookings > 0) {
      score += Math.min(4, input.previousBookings * 2);
    }
    
    return Math.min(15, score);
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(breakdown: any): number {
    return Math.round(
      breakdown.contactQuality +
      breakdown.travelIntent +
      breakdown.budgetFit +
      breakdown.timingUrgency +
      breakdown.engagementLevel
    );
  }

  /**
   * Assign letter grade based on score
   */
  private assignGrade(score: number): 'A' | 'B' | 'C' | 'D' {
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 45) return 'C';
    return 'D';
  }

  /**
   * Generate AI-powered predictions
   */
  private async generatePredictions(input: LeadScoringInput, score: number) {
    const conversionProbability = this.calculateConversionProbability(score, input);
    const estimatedValue = this.calculateEstimatedValue(input);
    const timeToConversion = this.calculateTimeToConversion(score, input);
    
    return {
      conversionProbability,
      estimatedValue,
      timeToConversion,
      bestContactTime: this.determineBestContactTime(input),
      preferredChannel: this.determinePreferredChannel(input)
    };
  }

  /**
   * Generate actionable insights
   */
  private generateInsights(input: LeadScoringInput, breakdown: any) {
    const buyingSignals = [];
    const obstacles = [];
    const opportunities = [];

    // Buying signals
    if (breakdown.budgetFit > 15) buyingSignals.push('High budget fit');
    if (breakdown.timingUrgency > 10) buyingSignals.push('Time-sensitive travel need');
    if (input.isReturningCustomer) buyingSignals.push('Returning customer');
    if (input.chatEngaged) buyingSignals.push('Active engagement');
    if (input.classeViagem === 'executiva' || input.classeViagem === 'primeira') {
      buyingSignals.push('Premium class preference');
    }

    // Obstacles
    if (breakdown.contactQuality < 10) obstacles.push('Limited contact information');
    if (!input.orcamentoAproximado) obstacles.push('No budget indication');
    if (!input.dataPartida) obstacles.push('No travel dates specified');
    if (breakdown.engagementLevel < 5) obstacles.push('Low engagement level');

    // Opportunities
    if (input.precisaHospedagem) opportunities.push('Hotel booking upsell');
    if (input.precisaTransporte) opportunities.push('Transportation package');
    if (input.numeroPassageiros && input.numeroPassageiros > 2) {
      opportunities.push('Group travel packages');
    }
    if (this.isInternationalDestination(input.destino || '')) {
      opportunities.push('International travel insurance');
      opportunities.push('Travel document assistance');
    }

    return { buyingSignals, obstacles, opportunities };
  }

  /**
   * Generate next best actions
   */
  private generateNextActions(input: LeadScoringInput, score: number, insights: any) {
    const actions = [];

    if (score >= 80) {
      actions.push({
        action: 'Immediate phone call',
        priority: 'high' as const,
        timeline: 'Within 1 hour',
        reason: 'High-quality lead with strong buying signals'
      });
    } else if (score >= 65) {
      actions.push({
        action: 'Send personalized quote',
        priority: 'high' as const,
        timeline: 'Within 4 hours',
        reason: 'Good lead quality with travel intent'
      });
    } else if (score >= 45) {
      actions.push({
        action: 'Send nurture email sequence',
        priority: 'medium' as const,
        timeline: 'Within 24 hours',
        reason: 'Moderate interest, needs nurturing'
      });
    } else {
      actions.push({
        action: 'Add to drip campaign',
        priority: 'low' as const,
        timeline: 'Within 48 hours',
        reason: 'Low engagement, long-term nurturing needed'
      });
    }

    // Specific action based on obstacles
    if (insights.obstacles.includes('No travel dates specified')) {
      actions.push({
        action: 'Request travel dates',
        priority: 'medium' as const,
        timeline: 'In follow-up contact',
        reason: 'Need travel dates to provide accurate quote'
      });
    }

    if (insights.obstacles.includes('No budget indication')) {
      actions.push({
        action: 'Share budget-friendly options',
        priority: 'medium' as const,
        timeline: 'In initial contact',
        reason: 'Help customer understand pricing options'
      });
    }

    return actions;
  }

  /**
   * Generate personalization recommendations
   */
  private generatePersonalization(input: LeadScoringInput, insights: any) {
    let messagingStyle: 'formal' | 'casual' | 'friendly' = 'friendly';
    const focusAreas = [];
    let offerType = 'standard';
    let discountSuggestion;

    // Determine messaging style
    if (input.classeViagem === 'primeira' || (input.orcamentoAproximado && input.orcamentoAproximado > 15000)) {
      messagingStyle = 'formal';
    } else if (input.source === 'social_media' || input.deviceType === 'mobile') {
      messagingStyle = 'casual';
    }

    // Focus areas based on interests
    if (input.precisaHospedagem) focusAreas.push('accommodation');
    if (input.precisaTransporte) focusAreas.push('transportation');
    if (this.isInternationalDestination(input.destino || '')) {
      focusAreas.push('international_travel');
    }
    if (input.numeroPassageiros && input.numeroPassageiros > 2) {
      focusAreas.push('group_travel');
    }

    // Offer type
    if (insights.buyingSignals.length >= 3) {
      offerType = 'premium';
    } else if (insights.obstacles.includes('No budget indication')) {
      offerType = 'budget_friendly';
    }

    // Discount suggestions
    if (input.isReturningCustomer) {
      discountSuggestion = 10; // 10% loyalty discount
    } else if (input.urgency === 'alta' || input.urgency === 'critica') {
      discountSuggestion = 5; // 5% urgency discount
    }

    return {
      messagingStyle,
      focusAreas,
      offerType,
      discountSuggestion
    };
  }

  /**
   * Calculate conversion probability using ML-like algorithm
   */
  private calculateConversionProbability(score: number, input: LeadScoringInput): number {
    let probability = score / 100;

    // Adjust based on additional factors
    if (input.isReturningCustomer) probability *= 1.5;
    if (input.previousBookings && input.previousBookings > 0) probability *= 1.3;
    if (input.chatEngaged) probability *= 1.2;
    if (input.source === 'referral') probability *= 1.4;

    // Cap at 95% (never 100% certain)
    return Math.min(0.95, probability);
  }

  /**
   * Calculate estimated booking value
   */
  private calculateEstimatedValue(input: LeadScoringInput): number {
    let baseValue = input.orcamentoAproximado || 3500; // Default value

    // Adjust based on travel details
    if (input.classeViagem === 'primeira') baseValue *= 3;
    else if (input.classeViagem === 'executiva') baseValue *= 1.8;

    if (input.numeroPassageiros) {
      baseValue *= input.numeroPassageiros;
    }

    if (input.precisaHospedagem) baseValue *= 1.4;
    if (input.precisaTransporte) baseValue *= 1.2;

    if (this.isInternationalDestination(input.destino || '')) {
      baseValue *= 1.5;
    }

    return Math.round(baseValue);
  }

  /**
   * Calculate expected time to conversion
   */
  private calculateTimeToConversion(score: number, input: LeadScoringInput): number {
    let baseDays = 14; // Default 2 weeks

    if (score >= 80) baseDays = 3;
    else if (score >= 65) baseDays = 7;
    else if (score >= 45) baseDays = 14;
    else baseDays = 30;

    // Adjust for urgency
    if (input.urgency === 'critica') baseDays = Math.min(baseDays, 1);
    else if (input.urgency === 'alta') baseDays = Math.min(baseDays, 3);

    // Adjust for travel date proximity
    if (input.dataPartida) {
      const daysUntilTravel = this.getDaysUntilTravel(input.dataPartida);
      baseDays = Math.min(baseDays, Math.max(1, daysUntilTravel / 3));
    }

    return Math.round(baseDays);
  }

  private calculateConfidence(input: LeadScoringInput): number {
    let confidence = 0.6; // Base confidence

    // Increase confidence with more data
    const dataPoints = Object.values(input).filter(v => v !== undefined && v !== '').length;
    confidence += Math.min(0.3, dataPoints * 0.02);

    // Higher confidence for returning customers
    if (input.isReturningCustomer) confidence += 0.1;

    return Math.min(0.95, confidence);
  }

  // Utility methods
  private isBusinessEmail(email: string): boolean {
    const businessDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return !businessDomains.includes(domain);
  }

  private isValidEmailDomain(email: string): boolean {
    const domain = email.split('@')[1];
    return Boolean(domain && domain.includes('.'));
  }

  private isInternationalDestination(destination: string): boolean {
    const international = ['europa', 'eua', 'usa', 'paris', 'londres', 'nova york', 'miami', 'japão', 'asia'];
    return international.some(dest => destination.toLowerCase().includes(dest));
  }

  private isPopularDestination(destination: string): boolean {
    const popular = ['paris', 'londres', 'nova york', 'miami', 'lisboa', 'madrid', 'roma'];
    return popular.some(dest => destination.toLowerCase().includes(dest));
  }

  private getDaysUntilTravel(dateStr: string): number {
    const travelDate = new Date(dateStr);
    const today = new Date();
    return Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getHoursOld(dateStr: string): number {
    const created = new Date(dateStr);
    const now = new Date();
    return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  }

  private determineBestContactTime(input: LeadScoringInput): string {
    // Business hours for travel industry
    if (input.deviceType === 'mobile') return 'Evening (18:00-20:00)';
    if (input.source === 'social_media') return 'Weekend (10:00-16:00)';
    return 'Business hours (09:00-17:00)';
  }

  private determinePreferredChannel(input: LeadScoringInput): string {
    if (input.whatsapp) return 'WhatsApp';
    if (input.chatEngaged) return 'Website chat';
    if (input.phone) return 'Phone call';
    return 'Email';
  }

  /**
   * Batch score multiple leads
   */
  async batchScoreLeads(leads: LeadScoringInput[]): Promise<LeadScore[]> {
    const results = await Promise.allSettled(
      leads.map(lead => this.calculateLeadScore(lead))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Failed to score lead ${index}:`, result.reason);
        // Return minimal score for failed leads
        return {
          totalScore: 0,
          grade: 'D' as const,
          breakdown: { contactQuality: 0, travelIntent: 0, budgetFit: 0, timingUrgency: 0, engagementLevel: 0 },
          predictions: { conversionProbability: 0, estimatedValue: 0, timeToConversion: 30, bestContactTime: 'Business hours', preferredChannel: 'Email' },
          insights: { buyingSignals: [], obstacles: ['Scoring failed'], opportunities: [] },
          nextActions: [{ action: 'Manual review required', priority: 'low' as const, timeline: 'When available', reason: 'Automatic scoring failed' }],
          personalization: { messagingStyle: 'friendly' as const, focusAreas: [], offerType: 'standard' },
          metadata: { scoredAt: new Date().toISOString(), version: this.version, confidence: 0 }
        };
      }
    });
  }

  /**
   * Update lead score based on new interactions
   */
  async updateLeadScore(
    existingScore: LeadScore,
    newData: Partial<LeadScoringInput>
  ): Promise<LeadScore> {
    // Merge existing data with new data (this would come from your database)
    const mergedInput = { ...newData }; // In real implementation, merge with existing data
    return this.calculateLeadScore(mergedInput);
  }
}

export const leadScoringService = new LeadScoringService();
export default leadScoringService;