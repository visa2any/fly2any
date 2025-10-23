/**
 * Feature Flags Configuration
 * Control which conversion optimization features are enabled
 */

export interface ConversionFeatureFlags {
  // FOMO & Urgency
  fomoCountdown: boolean;
  fomoCountdownMinutes: number;

  // Social Proof
  liveActivityFeed: boolean;
  activityFeedVariant: 'sidebar' | 'popup';
  socialValidation: boolean;
  socialValidationVariant: 'tooltip' | 'badge' | 'inline';

  // Trust & Security
  priceDropProtection: boolean;
  priceDropProtectionVariant: 'badge' | 'banner';

  // Commitment Escalation
  commitmentEscalation: boolean;

  // Exit Intent
  exitIntent: boolean;
  exitIntentDiscountPercent: number;
  exitIntentDiscountCode: string;

  // Progress Indicators
  bookingProgress: boolean;
  bookingProgressVariant: 'default' | 'compact';

  // A/B Testing
  abTestGroup?: 'control' | 'variant_a' | 'variant_b';

  // Show only on deals
  showOnlyOnDeals: boolean;
  dealScoreThreshold: number; // Show conversion features only if deal score >= this
}

// Default configuration
const defaultFlags: ConversionFeatureFlags = {
  // FOMO & Urgency
  fomoCountdown: true,
  fomoCountdownMinutes: 45,

  // Social Proof
  liveActivityFeed: true,
  activityFeedVariant: 'sidebar',
  socialValidation: true,
  socialValidationVariant: 'tooltip',

  // Trust & Security
  priceDropProtection: true,
  priceDropProtectionVariant: 'badge',

  // Commitment Escalation
  commitmentEscalation: true,

  // Exit Intent
  exitIntent: true,
  exitIntentDiscountPercent: 5,
  exitIntentDiscountCode: 'COMEBACK5',

  // Progress Indicators
  bookingProgress: true,
  bookingProgressVariant: 'default',

  // A/B Testing
  abTestGroup: undefined,

  // Show only on deals
  showOnlyOnDeals: true,
  dealScoreThreshold: 70
};

class FeatureFlagManager {
  private flags: ConversionFeatureFlags;
  private overrides: Partial<ConversionFeatureFlags> = {};

  constructor() {
    this.flags = { ...defaultFlags };
    this.loadOverrides();
    this.assignABTestGroup();
  }

  /**
   * Load flag overrides from environment variables or config
   */
  private loadOverrides(): void {
    // In production, you can load from environment variables
    // For now, we'll check localStorage for development overrides
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('feature_flag_overrides');
        if (stored) {
          this.overrides = JSON.parse(stored);
          this.flags = { ...this.flags, ...this.overrides };
        }
      } catch (error) {
        console.error('Failed to load feature flag overrides:', error);
      }
    }
  }

  /**
   * Assign user to A/B test group (if not already assigned)
   */
  private assignABTestGroup(): void {
    if (typeof window === 'undefined') return;

    let group = sessionStorage.getItem('ab_test_group') as ConversionFeatureFlags['abTestGroup'];

    if (!group) {
      // Randomly assign: 33% control, 33% variant A, 33% variant B
      const rand = Math.random();
      if (rand < 0.33) {
        group = 'control';
      } else if (rand < 0.66) {
        group = 'variant_a';
      } else {
        group = 'variant_b';
      }

      sessionStorage.setItem('ab_test_group', group);
    }

    this.flags.abTestGroup = group;
    this.applyABTestVariant(group);
  }

  /**
   * Apply A/B test variant configuration
   */
  private applyABTestVariant(group: ConversionFeatureFlags['abTestGroup']): void {
    if (group === 'control') {
      // Control group: Disable all conversion features
      this.flags.fomoCountdown = false;
      this.flags.liveActivityFeed = false;
      this.flags.socialValidation = false;
      this.flags.priceDropProtection = false;
      this.flags.exitIntent = false;
    } else if (group === 'variant_a') {
      // Variant A: Conservative approach (subtle features)
      this.flags.activityFeedVariant = 'popup';
      this.flags.socialValidationVariant = 'inline';
      this.flags.priceDropProtectionVariant = 'badge';
      this.flags.exitIntent = false;
    } else if (group === 'variant_b') {
      // Variant B: Aggressive approach (all features)
      this.flags.activityFeedVariant = 'sidebar';
      this.flags.socialValidationVariant = 'tooltip';
      this.flags.priceDropProtectionVariant = 'banner';
      this.flags.exitIntent = true;
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof ConversionFeatureFlags): boolean {
    const value = this.flags[feature];
    return typeof value === 'boolean' ? value : false;
  }

  /**
   * Get feature flag value
   */
  get<K extends keyof ConversionFeatureFlags>(
    feature: K
  ): ConversionFeatureFlags[K] {
    return this.flags[feature];
  }

  /**
   * Get all flags
   */
  getAll(): ConversionFeatureFlags {
    return { ...this.flags };
  }

  /**
   * Override a feature flag (for testing)
   */
  override<K extends keyof ConversionFeatureFlags>(
    feature: K,
    value: ConversionFeatureFlags[K]
  ): void {
    this.overrides[feature] = value;
    this.flags[feature] = value;

    if (typeof window !== 'undefined') {
      localStorage.setItem('feature_flag_overrides', JSON.stringify(this.overrides));
    }
  }

  /**
   * Reset all overrides
   */
  resetOverrides(): void {
    this.overrides = {};
    this.flags = { ...defaultFlags };

    if (typeof window !== 'undefined') {
      localStorage.removeItem('feature_flag_overrides');
    }

    // Re-apply A/B test variant
    if (this.flags.abTestGroup) {
      this.applyABTestVariant(this.flags.abTestGroup);
    }
  }

  /**
   * Check if conversion features should be shown for a flight
   */
  shouldShowConversionFeatures(dealScore?: number): boolean {
    if (!this.flags.showOnlyOnDeals) {
      return true;
    }

    if (dealScore === undefined) {
      return false;
    }

    return dealScore >= this.flags.dealScoreThreshold;
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

// Convenience functions
export const isFeatureEnabled = (feature: keyof ConversionFeatureFlags) => {
  return featureFlags.isEnabled(feature);
};

export const getFeatureFlag = <K extends keyof ConversionFeatureFlags>(
  feature: K
): ConversionFeatureFlags[K] => {
  return featureFlags.get(feature);
};

export const shouldShowConversion = (dealScore?: number) => {
  return featureFlags.shouldShowConversionFeatures(dealScore);
};
