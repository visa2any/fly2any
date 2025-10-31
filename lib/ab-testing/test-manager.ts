/**
 * A/B TEST MANAGER
 * =================
 * Manages feature flags and variant assignments with consistent hashing
 * Enables data-driven optimization through controlled experiments
 */

export type VariantId = 'control' | 'variant_a' | 'variant_b';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: {
    id: VariantId;
    name: string;
    weight: number; // 0-100 (percentage)
  }[];
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

export interface UserAssignment {
  userId: string;
  testId: string;
  variant: VariantId;
  assignedAt: Date;
}

export class ABTestManager {
  private tests: Map<string, ABTest> = new Map();
  private assignments: Map<string, Map<string, VariantId>> = new Map();

  /**
   * Register a new A/B test
   */
  registerTest(test: ABTest): void {
    this.tests.set(test.id, test);
    console.log(`📊 Registered A/B test: ${test.name} (${test.id})`);
  }

  /**
   * Get variant for user (consistent assignment)
   * Same user always gets same variant
   */
  getVariant(testId: string, userId: string): VariantId {
    const test = this.tests.get(testId);

    // Return control if test doesn't exist or is inactive
    if (!test || !this.isTestActive(testId)) {
      return 'control';
    }

    // Check existing assignment (consistency)
    const userAssignments = this.assignments.get(userId);
    if (userAssignments?.has(testId)) {
      return userAssignments.get(testId)!;
    }

    // Assign new variant using consistent hashing
    const variant = this.assignVariant(test, userId);

    // Store assignment
    if (!this.assignments.has(userId)) {
      this.assignments.set(userId, new Map());
    }
    this.assignments.get(userId)!.set(testId, variant);

    console.log(`🎲 Assigned user ${userId.substring(0, 8)}... to variant "${variant}" for test "${test.name}"`);

    return variant;
  }

  /**
   * Assign variant using consistent hashing
   * Ensures stable distribution based on weights
   */
  private assignVariant(test: ABTest, userId: string): VariantId {
    const hash = this.hashString(userId + test.id);
    const normalized = hash % 100;

    let cumulative = 0;
    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (normalized < cumulative) {
        return variant.id;
      }
    }

    // Fallback to control
    return 'control';
  }

  /**
   * Simple string hash function (DJB2)
   * Provides good distribution for A/B testing
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Check if test is currently active
   */
  isTestActive(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;

    const now = new Date();
    const isWithinDateRange =
      now >= test.startDate && (!test.endDate || now <= test.endDate);

    return test.active && isWithinDateRange;
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => this.isTestActive(test.id));
  }

  /**
   * Get test by ID
   */
  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId);
  }

  /**
   * Clear all assignments (useful for testing)
   */
  clearAssignments(): void {
    this.assignments.clear();
    console.log('🧹 Cleared all A/B test assignments');
  }
}

// Singleton instance
export const abTestManager = new ABTestManager();

// ===========================
// REGISTER ACTIVE TESTS
// ===========================

// Test 1: Smart Bundles
abTestManager.registerTest({
  id: 'smart-bundles-v1',
  name: 'ML-Powered Smart Bundles',
  description: 'Test impact of ML-generated smart bundles on booking page',
  variants: [
    { id: 'control', name: 'No bundles shown', weight: 20 },
    { id: 'variant_a', name: 'ML-powered bundles', weight: 80 },
  ],
  startDate: new Date('2025-01-01'),
  active: true,
});

// Test 2: Urgency Signals
abTestManager.registerTest({
  id: 'urgency-signals-v1',
  name: 'Real-Time Urgency Signals',
  description: 'Test impact of urgency indicators on flight cards',
  variants: [
    { id: 'control', name: 'No urgency signals', weight: 20 },
    { id: 'variant_a', name: 'All urgency signals', weight: 80 },
  ],
  startDate: new Date('2025-01-01'),
  active: true,
});

// Test 3: User Segmentation
abTestManager.registerTest({
  id: 'user-segmentation-v1',
  name: 'ML User Segmentation',
  description: 'Test impact of personalized recommendations',
  variants: [
    { id: 'control', name: 'Generic experience', weight: 20 },
    { id: 'variant_a', name: 'Personalized by segment', weight: 80 },
  ],
  startDate: new Date('2025-01-01'),
  active: true,
});

// Test 4: Payment Trust Signals
abTestManager.registerTest({
  id: 'payment-trust-v1',
  name: 'Enhanced Payment Trust Signals',
  description: 'Test impact of enhanced trust indicators on payment page',
  variants: [
    { id: 'control', name: 'Basic trust signals', weight: 20 },
    { id: 'variant_a', name: 'Enhanced trust signals', weight: 80 },
  ],
  startDate: new Date('2025-01-01'),
  active: true,
});

console.log(`✅ A/B Testing Framework initialized with ${abTestManager.getActiveTests().length} active tests`);
