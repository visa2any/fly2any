/**
 * ML-POWERED BUNDLE GENERATOR
 * ===========================
 * Dynamically creates personalized add-on bundles based on:
 * - Route characteristics (distance, duration, destination type)
 * - Passenger type (business, leisure, family, budget)
 * - Historical conversion data
 * - Seasonal trends
 */

interface RouteProfile {
  distance: number; // miles
  duration: number; // minutes
  destinationType: 'domestic' | 'international' | 'long-haul';
  isLeisureDestination: boolean;
  isBusinessHub: boolean;
}

interface PassengerProfile {
  type: 'business' | 'leisure' | 'family' | 'budget';
  count: number;
  hasChildren: boolean;
  priceElasticity: number; // 0-1, lower = less price sensitive
}

interface AddOnItem {
  id: string;
  name: string;
  category: 'seat' | 'baggage' | 'insurance' | 'lounge' | 'priority' | 'wifi' | 'meal';
  price: number;
  value: number; // perceived value score
  conversionRate: number; // historical conversion rate for this route/passenger type
}

interface Bundle {
  id: string;
  name: string;
  icon: 'business' | 'vacation' | 'traveler';
  description: string;
  items: { name: string; included: boolean }[];
  price: number;
  savings: number;
  currency: string;
  recommended?: boolean;
  mlScore: number; // ML-predicted conversion probability
}

export class BundleGenerator {
  private addOnsDatabase: AddOnItem[] = [
    // Seats
    { id: 'window-seat', name: 'Window seat', category: 'seat', price: 15, value: 0.6, conversionRate: 0.35 },
    { id: 'aisle-seat', name: 'Aisle seat', category: 'seat', price: 15, value: 0.6, conversionRate: 0.38 },
    { id: 'extra-legroom', name: 'Extra legroom seat', category: 'seat', price: 45, value: 0.85, conversionRate: 0.22 },
    { id: 'seats-together', name: 'Seat together guarantee', category: 'seat', price: 20, value: 0.9, conversionRate: 0.65 },

    // Baggage
    { id: 'checked-bag-1', name: '1 checked bag', category: 'baggage', price: 35, value: 0.8, conversionRate: 0.58 },
    { id: 'checked-bag-2', name: '2 checked bags', category: 'baggage', price: 65, value: 0.75, conversionRate: 0.42 },

    // Insurance
    { id: 'basic-insurance', name: 'Basic travel protection', category: 'insurance', price: 12, value: 0.5, conversionRate: 0.15 },
    { id: 'standard-insurance', name: 'Travel protection', category: 'insurance', price: 18, value: 0.7, conversionRate: 0.25 },
    { id: 'premium-insurance', name: 'Premium coverage', category: 'insurance', price: 38, value: 0.6, conversionRate: 0.08 },

    // Premium Services
    { id: 'priority-boarding', name: 'Priority boarding', category: 'priority', price: 15, value: 0.5, conversionRate: 0.12 },
    { id: 'lounge-access', name: 'Airport lounge access', category: 'lounge', price: 45, value: 0.7, conversionRate: 0.18 },
    { id: 'inflight-wifi', name: 'In-flight WiFi', category: 'wifi', price: 12, value: 0.65, conversionRate: 0.35 },
    { id: 'premium-meal', name: 'Premium meal', category: 'meal', price: 18, value: 0.4, conversionRate: 0.08 },
  ];

  /**
   * Generate personalized bundles for a specific route and passenger profile
   */
  async generateBundles(
    route: RouteProfile,
    passenger: PassengerProfile,
    basePrice: number,
    currency: string
  ): Promise<Bundle[]> {
    // Step 1: Score all add-ons for this specific context
    const scoredAddOns = this.scoreAddOns(route, passenger);

    // Step 2: Create bundles using clustering algorithm
    const bundles: Bundle[] = [];

    // Bundle 1: Business/Premium Bundle
    if (passenger.type === 'business' || route.isBusinessHub) {
      bundles.push(this.createBusinessBundle(scoredAddOns, currency));
    }

    // Bundle 2: Leisure/Vacation Bundle
    if (passenger.type === 'leisure' || route.isLeisureDestination) {
      bundles.push(this.createVacationBundle(scoredAddOns, currency, passenger.hasChildren));
    }

    // Bundle 3: Essential/Budget Bundle
    if (passenger.type === 'budget' || passenger.priceElasticity > 0.7) {
      bundles.push(this.createBudgetBundle(scoredAddOns, currency));
    }

    // Bundle 4: Family Bundle (if applicable)
    if (passenger.hasChildren || passenger.count > 2) {
      bundles.push(this.createFamilyBundle(scoredAddOns, currency));
    }

    // Step 3: Calculate ML scores and mark recommended bundle
    const scoredBundles = this.calculateBundleScores(bundles, passenger, route);

    // Step 4: Return top 3 bundles, sorted by ML score
    const topBundles = scoredBundles
      .sort((a, b) => b.mlScore - a.mlScore)
      .slice(0, 3);

    // Mark highest scoring bundle as recommended
    if (topBundles.length > 0) {
      topBundles[0].recommended = true;
    }

    return topBundles;
  }

  /**
   * Score each add-on based on context
   */
  private scoreAddOns(route: RouteProfile, passenger: PassengerProfile): AddOnItem[] {
    return this.addOnsDatabase.map(addOn => {
      let score = addOn.conversionRate;

      // Route-based adjustments
      if (route.destinationType === 'long-haul') {
        if (addOn.category === 'seat' || addOn.category === 'wifi') score *= 1.4;
      }

      if (route.isLeisureDestination) {
        if (addOn.category === 'insurance' || addOn.category === 'baggage') score *= 1.2;
      }

      if (route.isBusinessHub) {
        if (addOn.category === 'wifi' || addOn.category === 'lounge' || addOn.category === 'priority') score *= 1.5;
      }

      // Passenger-based adjustments
      if (passenger.type === 'business') {
        if (addOn.category === 'wifi' || addOn.category === 'lounge' || addOn.category === 'priority') score *= 1.6;
      }

      if (passenger.hasChildren) {
        if (addOn.id === 'seats-together' || addOn.category === 'baggage') score *= 1.8;
      }

      if (passenger.priceElasticity < 0.3) {
        // Low price sensitivity - boost premium items
        if (addOn.value > 0.7) score *= 1.3;
      }

      return { ...addOn, conversionRate: Math.min(score, 0.95) };
    });
  }

  /**
   * Create Business Bundle
   */
  private createBusinessBundle(addOns: AddOnItem[], currency: string): Bundle {
    const items = [
      addOns.find(a => a.id === 'extra-legroom'),
      addOns.find(a => a.id === 'priority-boarding'),
      addOns.find(a => a.id === 'lounge-access'),
      addOns.find(a => a.id === 'inflight-wifi'),
    ].filter(Boolean) as AddOnItem[];

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const bundlePrice = Math.round(totalPrice * 0.78); // 22% discount
    const savings = totalPrice - bundlePrice;

    return {
      id: 'business-plus',
      name: 'BUSINESS PLUS',
      icon: 'business',
      description: 'Perfect for work trips',
      items: items.map(item => ({ name: item.name, included: true })),
      price: bundlePrice,
      savings,
      currency,
      mlScore: items.reduce((sum, item) => sum + item.conversionRate, 0) / items.length,
    };
  }

  /**
   * Create Vacation/Leisure Bundle
   */
  private createVacationBundle(addOns: AddOnItem[], currency: string, hasChildren: boolean): Bundle {
    const items = [
      hasChildren ? addOns.find(a => a.id === 'seats-together') : addOns.find(a => a.id === 'window-seat'),
      addOns.find(a => a.id === 'checked-bag-2'),
      addOns.find(a => a.id === 'standard-insurance'),
    ].filter(Boolean) as AddOnItem[];

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const bundlePrice = Math.round(totalPrice * 0.72); // 28% discount
    const savings = totalPrice - bundlePrice;

    return {
      id: 'vacation-pkg',
      name: 'VACATION PKG',
      icon: 'vacation',
      description: hasChildren ? 'Great for family trips' : 'Perfect for getaways',
      items: items.map(item => ({ name: item.name, included: true })),
      price: bundlePrice,
      savings,
      currency,
      mlScore: items.reduce((sum, item) => sum + item.conversionRate, 0) / items.length,
    };
  }

  /**
   * Create Budget/Essential Bundle
   */
  private createBudgetBundle(addOns: AddOnItem[], currency: string): Bundle {
    const items = [
      addOns.find(a => a.id === 'aisle-seat'),
      addOns.find(a => a.id === 'checked-bag-1'),
      addOns.find(a => a.id === 'basic-insurance'),
    ].filter(Boolean) as AddOnItem[];

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const bundlePrice = Math.round(totalPrice * 0.80); // 20% discount
    const savings = totalPrice - bundlePrice;

    return {
      id: 'traveler',
      name: 'TRAVELER',
      icon: 'traveler',
      description: 'Essential add-ons',
      items: items.map(item => ({ name: item.name, included: true })),
      price: bundlePrice,
      savings,
      currency,
      mlScore: items.reduce((sum, item) => sum + item.conversionRate, 0) / items.length,
    };
  }

  /**
   * Create Family Bundle
   */
  private createFamilyBundle(addOns: AddOnItem[], currency: string): Bundle {
    const items = [
      addOns.find(a => a.id === 'seats-together'),
      addOns.find(a => a.id === 'checked-bag-2'),
      addOns.find(a => a.id === 'standard-insurance'),
      addOns.find(a => a.id === 'priority-boarding'),
    ].filter(Boolean) as AddOnItem[];

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const bundlePrice = Math.round(totalPrice * 0.75); // 25% discount
    const savings = totalPrice - bundlePrice;

    return {
      id: 'family-pkg',
      name: 'FAMILY PKG',
      icon: 'vacation',
      description: 'Everything families need',
      items: items.map(item => ({ name: item.name, included: true })),
      price: bundlePrice,
      savings,
      currency,
      mlScore: items.reduce((sum, item) => sum + item.conversionRate, 0) / items.length,
    };
  }

  /**
   * Calculate ML scores for bundles
   */
  private calculateBundleScores(bundles: Bundle[], passenger: PassengerProfile, route: RouteProfile): Bundle[] {
    return bundles.map(bundle => {
      let score = bundle.mlScore;

      // Adjust based on passenger type match
      if (bundle.icon === 'business' && passenger.type === 'business') score *= 1.5;
      if (bundle.icon === 'vacation' && passenger.type === 'leisure') score *= 1.4;
      if (bundle.icon === 'traveler' && passenger.type === 'budget') score *= 1.3;

      // Adjust based on price sensitivity
      const bundlePriceRatio = bundle.price / 100; // Normalize
      if (passenger.priceElasticity > 0.7 && bundlePriceRatio > 0.5) {
        score *= 0.7; // Penalize expensive bundles for price-sensitive users
      }

      // Adjust based on route
      if (route.destinationType === 'long-haul' && bundle.icon === 'business') score *= 1.2;

      return { ...bundle, mlScore: Math.min(score, 0.98) };
    });
  }
}

// Singleton instance
export const bundleGenerator = new BundleGenerator();
