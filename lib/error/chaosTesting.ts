/**
 * Chaos Testing Utility
 * 
 * Provides tools for injecting failures and testing error boundary resilience.
 * This helps validate that our error handling system works under various failure conditions.
 */

export interface ChaosTestConfig {
  /**
   * Probability of failure injection (0 to 1)
   */
  failureProbability: number;
  /**
   * Types of failures to inject
   */
  failureTypes: FailureType[];
  /**
   * Whether to log injected failures
   */
  logFailures: boolean;
  /**
   * Context for the test (e.g., component name, API endpoint)
   */
  context?: string;
}

export type FailureType = 
  | 'throw_error'
  | 'reject_promise'
  | 'timeout'
  | 'network_error'
  | 'api_error'
  | 'memory_leak_simulation'
  | 'null_pointer'
  | 'type_error';

export interface InjectedFailure {
  type: FailureType;
  timestamp: number;
  context?: string;
  error?: Error;
}

/**
 * Chaos Testing Controller
 */
export class ChaosTesting {
  private failures: InjectedFailure[] = [];
  private isEnabled = false;
  private config: ChaosTestConfig;

  constructor(config: Partial<ChaosTestConfig> = {}) {
    this.config = {
      failureProbability: config.failureProbability ?? 0.1,
      failureTypes: config.failureTypes ?? ['throw_error'],
      logFailures: config.logFailures ?? true,
      context: config.context,
    };
  }

  /**
   * Enable chaos testing
   */
  enable(): void {
    this.isEnabled = true;
    if (this.config.logFailures) {
      console.log(`[ChaosTesting] Enabled for context: ${this.config.context || 'global'}`);
    }
  }

  /**
   * Disable chaos testing
   */
  disable(): void {
    this.isEnabled = false;
    if (this.config.logFailures) {
      console.log(`[ChaosTesting] Disabled`);
    }
  }

  /**
   * Inject a failure based on configuration
   */
  injectFailure(): void {
    if (!this.isEnabled || Math.random() > this.config.failureProbability) {
      return;
    }

    const failureType = this.selectRandomFailureType();
    this.executeFailure(failureType);
  }

  /**
   * Wrap a function with failure injection
   */
  wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    context?: string
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      this.injectFailure();
      try {
        return fn(...args);
      } catch (error) {
        this.recordFailure({
          type: 'throw_error',
          timestamp: Date.now(),
          context: context || this.config.context,
          error: error as Error,
        });
        throw error;
      }
    };
  }

  /**
   * Wrap an async function with failure injection
   */
  wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      this.injectFailure();
      try {
        return await fn(...args);
      } catch (error) {
        this.recordFailure({
          type: 'reject_promise',
          timestamp: Date.now(),
          context: context || this.config.context,
          error: error as Error,
        });
        throw error;
      }
    };
  }

  /**
   * Get all recorded failures
   */
  getFailures(): InjectedFailure[] {
    return [...this.failures];
  }

  /**
   * Clear recorded failures
   */
  clearFailures(): void {
    this.failures = [];
  }

  /**
   * Simulate a specific failure type (for controlled testing)
   */
  simulateFailure(type: FailureType, error?: Error): void {
    this.executeFailure(type, error);
  }

  private selectRandomFailureType(): FailureType {
    const index = Math.floor(Math.random() * this.config.failureTypes.length);
    return this.config.failureTypes[index];
  }

  private executeFailure(type: FailureType, customError?: Error): void {
    const failure: InjectedFailure = {
      type,
      timestamp: Date.now(),
      context: this.config.context,
    };

    switch (type) {
      case 'throw_error':
        failure.error = customError || new Error('Chaos testing: Injected error');
        this.recordFailure(failure);
        throw failure.error;

      case 'reject_promise':
        failure.error = customError || new Error('Chaos testing: Promise rejected');
        this.recordFailure(failure);
        throw failure.error;

      case 'timeout':
        // Simulate a timeout by delaying and then throwing
        setTimeout(() => {
          failure.error = new Error('Chaos testing: Timeout');
          this.recordFailure(failure);
        }, 0);
        break;

      case 'network_error':
        failure.error = new Error('Chaos testing: Network error');
        this.recordFailure(failure);
        throw failure.error;

      case 'api_error':
        failure.error = new Error('Chaos testing: API error (500)');
        this.recordFailure(failure);
        throw failure.error;

      case 'memory_leak_simulation':
        // Simulate memory leak by creating a large object (in testing only)
        if (process.env.NODE_ENV === 'test') {
          const largeObject: any = {};
          for (let i = 0; i < 10000; i++) {
            largeObject[`key${i}`] = 'x'.repeat(1000);
          }
          // Don't actually leak - just simulate the behavior
        }
        break;

      case 'null_pointer':
        failure.error = new TypeError('Chaos testing: Cannot read property of null');
        this.recordFailure(failure);
        throw failure.error;

      case 'type_error':
        failure.error = new TypeError('Chaos testing: Invalid type');
        this.recordFailure(failure);
        throw failure.error;
    }

    if (this.config.logFailures) {
      console.log(`[ChaosTesting] Injected failure: ${type}`, {
        context: this.config.context,
        timestamp: failure.timestamp,
      });
    }
  }

  private recordFailure(failure: InjectedFailure): void {
    this.failures.push(failure);
    if (this.config.logFailures) {
      console.log(`[ChaosTesting] Recorded failure: ${failure.type}`, failure);
    }
  }
}

/**
 * Global chaos testing instance
 */
export const globalChaosTesting = new ChaosTesting({
  failureProbability: 0,
  logFailures: false,
});

/**
 * Helper to create a chaos test for a specific component
 */
export function createComponentChaosTest(componentName: string) {
  return new ChaosTesting({
    context: `component:${componentName}`,
    failureProbability: 0.2,
    failureTypes: ['throw_error', 'type_error', 'null_pointer'],
    logFailures: process.env.NODE_ENV === 'development',
  });
}

/**
 * Helper to create a chaos test for API endpoints
 */
export function createAPIChaosTest(endpoint: string) {
  return new ChaosTesting({
    context: `api:${endpoint}`,
    failureProbability: 0.1,
    failureTypes: ['api_error', 'network_error', 'timeout', 'reject_promise'],
    logFailures: process.env.NODE_ENV === 'development',
  });
}

/**
 * Test utility to run a chaos test scenario
 */
export async function runChaosTest<T>(
  testName: string,
  testFn: (chaos: ChaosTesting) => Promise<T>,
  config?: Partial<ChaosTestConfig>
): Promise<{ result?: T; failures: InjectedFailure[]; passed: boolean }> {
  const chaos = new ChaosTesting({
    context: `test:${testName}`,
    failureProbability: 1, // Always inject failures for tests
    logFailures: false,
    ...config,
  });

  chaos.enable();
  let result: T | undefined;
  let passed = true;

  try {
    result = await testFn(chaos);
  } catch (error) {
    passed = false;
    // Expected to fail in chaos tests
  } finally {
    chaos.disable();
  }

  return {
    result,
    failures: chaos.getFailures(),
    passed,
  };
}