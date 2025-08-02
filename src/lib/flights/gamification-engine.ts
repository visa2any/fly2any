/**
 * Advanced Gamification and Loyalty System
 * Increases engagement and retention through game mechanics and rewards
 */

import { ProcessedFlightOffer } from '@/types/flights';

interface UserProfile {
  id: string;
  level: number;
  experience: number;
  totalBookings: number;
  totalSavings: number;
  achievements: Achievement[];
  badges: Badge[];
  streaks: Streak[];
  loyaltyTier: LoyaltyTier;
  joinDate: Date;
  lastActivity: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'booking' | 'savings' | 'exploration' | 'social' | 'special';
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedDate?: Date;
  reward: Reward;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  earnedDate: Date;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  sharable: boolean;
}

interface Streak {
  type: 'booking' | 'login' | 'search' | 'review';
  current: number;
  best: number;
  lastUpdate: Date;
  multiplier: number;
}

interface LoyaltyTier {
  name: string;
  level: number;
  benefits: string[];
  nextTierProgress: number;
  nextTierRequirement: number;
  color: string;
  icon: string;
}

interface Reward {
  type: 'points' | 'discount' | 'upgrade' | 'free_service' | 'badge' | 'experience';
  value: number;
  description: string;
  expiryDate?: Date;
  conditions?: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'special';
  progress: number;
  maxProgress: number;
  reward: Reward;
  deadline: Date;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  category: string;
}

interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  category: 'bookings' | 'savings' | 'points' | 'level';
  entries: LeaderboardEntry[];
  userRank?: number;
  userStats?: any;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  value: number;
  change: number; // rank change from previous period
  tier: string;
}

interface GameEvent {
  id: string;
  type: 'booking' | 'search' | 'review' | 'referral' | 'milestone';
  description: string;
  points: number;
  experience: number;
  timestamp: Date;
  special?: boolean;
}

export class GamificationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private achievements: Achievement[] = [];
  private challenges: Challenge[] = [];
  private leaderboards: Map<string, Leaderboard> = new Map();
  private gameEvents: GameEvent[] = [];

  constructor() {
    this.initializeAchievements();
    this.initializeChallenges();
    this.initializeLeaderboards();
  }

  /**
   * Process booking and award points/experience
   */
  processBooking(
    userId: string,
    flight: ProcessedFlightOffer,
    bookingAmount: number,
    savingsAmount: number = 0
  ): GameEvent[] {
    console.log('🎮 Processing booking for gamification rewards...');

    const user = this.getUserProfile(userId);
    const events: GameEvent[] = [];

    // Base booking reward
    const basePoints = Math.floor(bookingAmount / 10); // 1 point per R$ 10
    const baseExperience = Math.floor(bookingAmount / 50); // 1 XP per R$ 50

    events.push({
      id: this.generateEventId(),
      type: 'booking',
      description: `Reserva de voo para ${flight.outbound.departure.iataCode} → ${flight.outbound.arrival.iataCode}`,
      points: basePoints,
      experience: baseExperience,
      timestamp: new Date()
    });

    // Savings bonus
    if (savingsAmount > 0) {
      const savingsBonus = Math.floor(savingsAmount / 5); // 1 point per R$ 5 saved
      events.push({
        id: this.generateEventId(),
        type: 'booking',
        description: `Bônus por economia de R$ ${savingsAmount}`,
        points: savingsBonus,
        experience: savingsBonus,
        timestamp: new Date(),
        special: true
      });
    }

    // Streak bonuses
    this.updateStreaks(userId, 'booking');
    const bookingStreak = user.streaks.find(s => s.type === 'booking');
    if (bookingStreak && bookingStreak.current > 1) {
      const streakBonus = bookingStreak.current * 10;
      events.push({
        id: this.generateEventId(),
        type: 'milestone',
        description: `Sequência de ${bookingStreak.current} reservas - bônus!`,
        points: streakBonus,
        experience: streakBonus / 2,
        timestamp: new Date(),
        special: true
      });
    }

    // Update user profile
    user.totalBookings++;
    user.totalSavings += savingsAmount;
    user.lastActivity = new Date();

    // Apply all rewards
    events.forEach(event => {
      this.addExperience(userId, event.experience);
      this.addPoints(userId, event.points);
    });

    // Check for new achievements
    const newAchievements = this.checkAchievementsInternal(userId);
    newAchievements.forEach(achievement => {
      events.push({
        id: this.generateEventId(),
        type: 'milestone',
        description: `Conquista desbloqueada: ${achievement.title}`,
        points: achievement.reward.value,
        experience: achievement.reward.value,
        timestamp: new Date(),
        special: true
      });
    });

    // Update challenges
    this.updateChallenges(userId, 'booking', bookingAmount);

    this.gameEvents.push(...events);
    return events;
  }

  /**
   * Get user's gamification profile
   */
  getUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, this.createNewUserProfile(userId));
    }
    return this.userProfiles.get(userId)!;
  }

  /**
   * Get user's current level and progress
   */
  getUserLevel(userId: string): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
    const user = this.getUserProfile(userId);
    const nextLevelXP = this.calculateXPForLevel(user.level + 1);
    const currentLevelXP = this.calculateXPForLevel(user.level);
    const progress = ((user.experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return {
      level: user.level,
      currentXP: user.experience,
      nextLevelXP,
      progress: Math.min(100, Math.max(0, progress))
    };
  }

  /**
   * Get active challenges for user
   */
  getActiveChallenges(userId: string): Challenge[] {
    const now = new Date();
    return this.challenges.filter(challenge => challenge.deadline > now);
  }

  /**
   * Get user's achievements with progress
   */
  getUserAchievements(userId: string): Achievement[] {
    const user = this.getUserProfile(userId);
    
    return this.achievements.map(achievement => {
      const userAchievement = user.achievements.find(ua => ua.id === achievement.id);
      return userAchievement || {
        ...achievement,
        progress: this.calculateAchievementProgress(userId, achievement),
        completed: false
      };
    });
  }

  /**
   * Get leaderboard for specific category
   */
  getLeaderboard(category: 'bookings' | 'savings' | 'points' | 'level', period: 'weekly' | 'monthly' | 'all_time'): Leaderboard {
    const key = `${category}_${period}`;
    
    if (!this.leaderboards.has(key)) {
      this.generateLeaderboard(category, period);
    }
    
    return this.leaderboards.get(key)!;
  }

  /**
   * Get personalized rewards for flight booking
   */
  getBookingRewards(userId: string, flight: ProcessedFlightOffer, bookingAmount: number): Reward[] {
    const user = this.getUserProfile(userId);
    const rewards: Reward[] = [];

    // Tier-based rewards
    const tierMultiplier = this.getTierMultiplierByLevel(user.loyaltyTier.level);
    const basePoints = Math.floor(bookingAmount / 10) * tierMultiplier;

    rewards.push({
      type: 'points',
      value: basePoints,
      description: `${basePoints} pontos pela reserva`
    });

    // Special destination rewards
    if (this.isInternationalFlight(flight)) {
      rewards.push({
        type: 'experience',
        value: 100,
        description: 'Bônus de voo internacional'
      });

      rewards.push({
        type: 'badge',
        value: 1,
        description: 'Badge "Explorador Global"'
      });
    }

    // First-time destination bonus
    if (this.isFirstTimeDestination(userId, flight)) {
      rewards.push({
        type: 'points',
        value: 200,
        description: 'Bônus de novo destino'
      });
    }

    // Streak rewards
    const bookingStreak = user.streaks.find(s => s.type === 'booking');
    if (bookingStreak && bookingStreak.current >= 3) {
      rewards.push({
        type: 'discount',
        value: 50,
        description: 'R$ 50 de desconto na próxima reserva',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    return rewards;
  }

  /**
   * Generate gamified flight recommendations
   */
  generateGamifiedRecommendations(userId: string, flights: ProcessedFlightOffer[]): any[] {
    const user = this.getUserProfile(userId);
    
    return flights.map(flight => {
      const rewards = this.getBookingRewards(userId, flight, 
        parseFloat(flight.totalPrice.replace(/[^\\d,]/g, '').replace(',', '.'))
      );

      const gamificationData = {
        rewards,
        achievements: this.getPotentialAchievements(userId, flight),
        challengeProgress: this.getChallengeProgress(userId, flight),
        tierBenefits: this.getTierBenefits(user.loyaltyTier),
        specialOffers: this.getSpecialOffers(userId, flight)
      };

      return {
        ...flight,
        gamification: gamificationData
      };
    });
  }

  /**
   * Initialize achievements system
   */
  private initializeAchievements(): void {
    this.achievements = [
      // Booking achievements
      {
        id: 'first_flight',
        title: 'Primeira Decolagem',
        description: 'Faça sua primeira reserva de voo',
        category: 'booking',
        progress: 0,
        maxProgress: 1,
        completed: false,
        reward: { type: 'points', value: 100, description: '100 pontos de bônus' },
        rarity: 'common',
        icon: '✈️'
      },
      {
        id: 'frequent_flyer',
        title: 'Viajante Frequente',
        description: 'Faça 10 reservas de voo',
        category: 'booking',
        progress: 0,
        maxProgress: 10,
        completed: false,
        reward: { type: 'upgrade', value: 1, description: 'Upgrade gratuito de categoria' },
        rarity: 'rare',
        icon: '🛫'
      },
      {
        id: 'globe_trotter',
        title: 'Explorador Mundial',
        description: 'Visite 5 países diferentes',
        category: 'exploration',
        progress: 0,
        maxProgress: 5,
        completed: false,
        reward: { type: 'badge', value: 1, description: 'Badge Explorador Mundial' },
        rarity: 'epic',
        icon: '🌍'
      },
      // Savings achievements
      {
        id: 'smart_saver',
        title: 'Poupador Inteligente',
        description: 'Economize R$ 1.000 em reservas',
        category: 'savings',
        progress: 0,
        maxProgress: 1000,
        completed: false,
        reward: { type: 'discount', value: 100, description: 'R$ 100 de desconto' },
        rarity: 'rare',
        icon: '💰'
      },
      {
        id: 'bargain_hunter',
        title: 'Caçador de Ofertas',
        description: 'Encontre 3 voos com mais de 30% de desconto',
        category: 'savings',
        progress: 0,
        maxProgress: 3,
        completed: false,
        reward: { type: 'points', value: 500, description: '500 pontos de bônus' },
        rarity: 'epic',
        icon: '🎯'
      },
      // Social achievements
      {
        id: 'influencer',
        title: 'Influenciador',
        description: 'Convide 5 amigos que façam reservas',
        category: 'social',
        progress: 0,
        maxProgress: 5,
        completed: false,
        reward: { type: 'free_service', value: 1, description: 'Acesso VIP ao lounge grátis' },
        rarity: 'legendary',
        icon: '👥'
      },
      // Special achievements
      {
        id: 'night_owl',
        title: 'Coruja Noturna',
        description: 'Faça uma reserva entre 23h e 5h',
        category: 'special',
        progress: 0,
        maxProgress: 1,
        completed: false,
        reward: { type: 'points', value: 50, description: '50 pontos de bônus' },
        rarity: 'common',
        icon: '🦉'
      },
      {
        id: 'last_minute',
        title: 'Última Hora',
        description: 'Reserve um voo com menos de 24h de antecedência',
        category: 'special',
        progress: 0,
        maxProgress: 1,
        completed: false,
        reward: { type: 'experience', value: 200, description: '200 XP de bônus' },
        rarity: 'rare',
        icon: '⏰'
      }
    ];
  }

  /**
   * Initialize challenges system
   */
  private initializeChallenges(): void {
    const now = new Date();
    
    this.challenges = [
      {
        id: 'weekly_explorer',
        title: 'Explorador Semanal',
        description: 'Faça 2 reservas esta semana',
        type: 'weekly',
        progress: 0,
        maxProgress: 2,
        reward: { type: 'points', value: 300, description: '300 pontos' },
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        difficulty: 'medium',
        category: 'booking'
      },
      {
        id: 'monthly_saver',
        title: 'Poupador Mensal',
        description: 'Economize R$ 500 este mês',
        type: 'monthly',
        progress: 0,
        maxProgress: 500,
        reward: { type: 'discount', value: 100, description: 'R$ 100 de desconto' },
        deadline: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        difficulty: 'hard',
        category: 'savings'
      },
      {
        id: 'daily_search',
        title: 'Pesquisador Diário',
        description: 'Faça uma pesquisa de voo hoje',
        type: 'daily',
        progress: 0,
        maxProgress: 1,
        reward: { type: 'points', value: 10, description: '10 pontos' },
        deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        difficulty: 'easy',
        category: 'engagement'
      }
    ];
  }

  /**
   * Helper methods
   */
  private createNewUserProfile(userId: string): UserProfile {
    return {
      id: userId,
      level: 1,
      experience: 0,
      totalBookings: 0,
      totalSavings: 0,
      achievements: [],
      badges: [],
      streaks: [
        { type: 'booking', current: 0, best: 0, lastUpdate: new Date(), multiplier: 1 },
        { type: 'login', current: 0, best: 0, lastUpdate: new Date(), multiplier: 1 },
        { type: 'search', current: 0, best: 0, lastUpdate: new Date(), multiplier: 1 }
      ],
      loyaltyTier: {
        name: 'Bronze',
        level: 1,
        benefits: ['Suporte prioritário', 'Pontos básicos'],
        nextTierProgress: 0,
        nextTierRequirement: 1000,
        color: '#CD7F32',
        icon: '🥉'
      },
      joinDate: new Date(),
      lastActivity: new Date()
    };
  }

  private calculateXPForLevel(level: number): number {
    // Exponential XP curve: level^2 * 100
    return Math.floor(Math.pow(level, 2) * 100);
  }

  private addExperience(userId: string, amount: number): void {
    const user = this.getUserProfile(userId);
    user.experience += amount;
    
    // Check for level up
    const newLevel = this.calculateLevel(user.experience);
    if (newLevel > user.level) {
      user.level = newLevel;
      this.handleLevelUp(userId, newLevel);
    }
  }

  private addPoints(userId: string, amount: number): void {
    // Points are separate from XP and can be spent
    console.log(`Adding ${amount} points to user ${userId}`);
  }

  private calculateLevel(experience: number): number {
    let level = 1;
    while (this.calculateXPForLevel(level + 1) <= experience) {
      level++;
    }
    return level;
  }

  private handleLevelUp(userId: string, newLevel: number): void {
    console.log(`🎉 User ${userId} leveled up to ${newLevel}!`);
    
    // Award level up bonus
    this.gameEvents.push({
      id: this.generateEventId(),
      type: 'milestone',
      description: `Parabéns! Você alcançou o nível ${newLevel}!`,
      points: newLevel * 50,
      experience: 0,
      timestamp: new Date(),
      special: true
    });
  }

  private updateStreaks(userId: string, type: Streak['type']): void {
    const user = this.getUserProfile(userId);
    const streak = user.streaks.find(s => s.type === type);
    
    if (streak) {
      const lastUpdate = streak.lastUpdate;
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Continue streak
        streak.current++;
        streak.best = Math.max(streak.best, streak.current);
      } else if (daysDiff > 1) {
        // Streak broken
        streak.current = 1;
      }
      // If daysDiff === 0, it's the same day, no change needed
      
      streak.lastUpdate = now;
    }
  }

  private checkAchievementsInternal(userId: string): Achievement[] {
    const user = this.getUserProfile(userId);
    const newAchievements: Achievement[] = [];
    
    for (const achievement of this.achievements) {
      const userHasAchievement = user.achievements.some(ua => ua.id === achievement.id && ua.completed);
      if (!userHasAchievement) {
        const progress = this.calculateAchievementProgress(userId, achievement);
        if (progress >= achievement.maxProgress) {
          const completedAchievement = { ...achievement, progress, completed: true, completedDate: new Date() };
          user.achievements.push(completedAchievement);
          newAchievements.push(completedAchievement);
        }
      }
    }
    
    return newAchievements;
  }

  private calculateAchievementProgress(userId: string, achievement: Achievement): number {
    const user = this.getUserProfile(userId);
    
    switch (achievement.id) {
      case 'first_flight':
        return user.totalBookings >= 1 ? 1 : 0;
      case 'frequent_flyer':
        return Math.min(user.totalBookings, 10);
      case 'smart_saver':
        return Math.min(user.totalSavings, 1000);
      default:
        return 0;
    }
  }

  private updateChallenges(userId: string, action: string, value: number): void {
    // Update challenge progress based on user actions
    this.challenges.forEach(challenge => {
      if (challenge.category === 'booking' && action === 'booking') {
        challenge.progress++;
      } else if (challenge.category === 'savings' && action === 'booking') {
        // This would need to be passed the savings amount
        challenge.progress += value;
      }
    });
  }

  private initializeLeaderboards(): void {
    // Initialize empty leaderboards
    const categories = ['bookings', 'savings', 'points', 'level'];
    const periods = ['weekly', 'monthly', 'all_time'];
    
    categories.forEach(category => {
      periods.forEach(period => {
        this.leaderboards.set(`${category}_${period}`, {
          period: period as any,
          category: category as any,
          entries: []
        });
      });
    });
  }

  private generateLeaderboard(category: string, period: string): void {
    // In a real implementation, this would query the database
    const mockEntries: LeaderboardEntry[] = [];
    
    for (let i = 1; i <= 10; i++) {
      mockEntries.push({
        rank: i,
        userId: `user_${i}`,
        displayName: `Viajante ${i}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        value: Math.floor(Math.random() * 1000) + 100,
        change: Math.floor(Math.random() * 20) - 10,
        tier: i <= 3 ? 'Gold' : i <= 7 ? 'Silver' : 'Bronze'
      });
    }
    
    this.leaderboards.set(`${category}_${period}`, {
      period: period as any,
      category: category as any,
      entries: mockEntries
    });
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTierMultiplierByLevel(tierLevel: number): number {
    return 1 + (tierLevel - 1) * 0.25; // 25% bonus per tier
  }

  private isInternationalFlight(flight: ProcessedFlightOffer): boolean {
    // Simple check - in reality would check country codes
    const domesticCodes = ['GRU', 'GIG', 'BSB', 'SSA', 'REC', 'FOR', 'BEL', 'MAO', 'CWB', 'POA', 'FLN', 'VIX', 'CNF'];
    return !domesticCodes.includes(flight.outbound.arrival.iataCode);
  }

  private isFirstTimeDestination(userId: string, flight: ProcessedFlightOffer): boolean {
    // Check if user has been to this destination before
    return Math.random() > 0.7; // Mock: 30% chance it's a new destination
  }

  private getPotentialAchievements(userId: string, flight: ProcessedFlightOffer): Achievement[] {
    return this.achievements.filter(achievement => 
      !this.getUserProfile(userId).achievements.some(ua => ua.id === achievement.id && ua.completed)
    ).slice(0, 3);
  }

  private getChallengeProgress(userId: string, flight: ProcessedFlightOffer): Challenge[] {
    return this.getActiveChallenges(userId).slice(0, 2);
  }

  private getTierBenefits(tier: LoyaltyTier): string[] {
    return tier.benefits;
  }

  private getSpecialOffers(userId: string, flight: ProcessedFlightOffer): any[] {
    const user = this.getUserProfile(userId);
    const offers = [];
    
    if (user.loyaltyTier.level >= 3) {
      offers.push({
        type: 'tier_discount',
        value: 10,
        description: 'Desconto VIP de 10%'
      });
    }
    
    return offers;
  }

  /**
   * 🎯 ULTRA-ADVANCED METHODS FOR FLIGHTRESULTSLIST INTEGRATION
   */

  // Award points for specific actions with ultra-detailed tracking
  awardPoints(action: string, points: number, userId?: string): void {
    try {
      const user = this.getUserProfile(userId || 'default-user');
      if (!user) return;

      const basePoints = points;
      const multiplier = this.getTierMultiplierByLevel(user.loyaltyTier.level);
      const finalPoints = Math.floor(basePoints * multiplier);

      // Update user points and experience
      user.experience += finalPoints;
      user.level = this.calculateLevel(user.experience);

      // Record the action for analytics
      this.recordAction(user.id, action, finalPoints);

      // Check for new achievements
      this.checkAchievementsInternal(user.id);

      console.log(`🎮 [Gamification] User ${userId} earned ${finalPoints} points for ${action}`);
    } catch (error) {
      console.warn('Gamification award points error:', error);
    }
  }

  // Calculate rewards for a specific flight offer
  calculateRewards(offer: ProcessedFlightOffer): any {
    try {
      const basePrice = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      return {
        points: Math.floor(basePrice * 0.01), // 1% of price in points
        tier_bonus: this.getCurrentTierBonus(),
        achievements: this.getAvailableAchievements(offer),
        special_offers: this.getSpecialOffers('default-user', offer)
      };
    } catch (error) {
      console.warn('Gamification calculate rewards error:', error);
      return null;
    }
  }

  // Calculate points value for an offer
  calculatePoints(offer: ProcessedFlightOffer): number {
    try {
      const basePrice = parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.'));
      return Math.floor(basePrice * 0.01);
    } catch (error) {
      console.warn('Gamification calculate points error:', error);
      return 0;
    }
  }

  // Get offer-specific rewards
  getOfferRewards(offer: ProcessedFlightOffer): any {
    try {
      return {
        points_earned: this.calculatePoints(offer),
        badges_available: this.getAvailableBadges(offer),
        tier_progress: this.getTierProgress(),
        special_perks: this.getOfferPerks(offer)
      };
    } catch (error) {
      console.warn('Gamification get offer rewards error:', error);
      return null;
    }
  }

  // ULTRA-ADVANCED HELPER METHODS
  private recordAction(userId: string, action: string, points: number): void {
    // Advanced action tracking would go here
    console.log(`📊 [Analytics] ${userId}: ${action} -> ${points} points`);
  }

  private getCurrentTierBonus(): number {
    return 1.0; // Base multiplier
  }

  private getAvailableAchievements(offer: ProcessedFlightOffer): string[] {
    const achievements = [];
    
    if (offer.outbound.stops === 0) {
      achievements.push('Direct Flight Pro');
    }
    
    if (parseFloat(offer.totalPrice.replace(/[^\d.,]/g, '').replace(',', '.')) < 500) {
      achievements.push('Budget Master');
    }

    return achievements;
  }

  private getAvailableBadges(offer: ProcessedFlightOffer): string[] {
    const badges = [];
    
    if (offer.outbound.durationMinutes < 120) {
      badges.push('Quick Traveler');
    }

    return badges;
  }

  private getTierProgress(): any {
    return {
      current_tier: 'Silver',
      progress: 65,
      next_tier: 'Gold',
      points_needed: 1500
    };
  }

  private getOfferPerks(offer: ProcessedFlightOffer): string[] {
    return [
      'Priority boarding available',
      'Free seat selection',
      'Extra baggage allowance'
    ];
  }

}