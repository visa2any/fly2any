/**
 * Haptic Feedback System for Mobile Interactions
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

export interface HapticOptions {
  pattern?: HapticPattern;
  duration?: number;
  intensity?: number;
}

class HapticFeedbackManager {
  private isSupported: boolean = false;
  private vibrationSupported: boolean = false;

  constructor() {
    this.detectSupport();
  }

  private detectSupport(): void {
    this.isSupported = 'vibrate' in navigator;
    this.vibrationSupported = 'vibrate' in navigator;
  }

  public trigger(options: HapticOptions = {}): void {
    const { pattern = 'light', duration = 50 } = options;

    if (!this.vibrationSupported) return;

    const vibrationPatterns: Record<HapticPattern, number[]> = {
      light: [50],
      medium: [100],
      heavy: [200],
      success: [100, 50, 100],
      error: [100, 50, 100, 50, 100],
      warning: [150, 100, 150]
    };

    const vibrationPattern = vibrationPatterns[pattern] || [duration];
    
    try {
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }

  public isAvailable(): boolean {
    return this.vibrationSupported;
  }

  public light(): void { this.trigger({ pattern: 'light' }); }
  public medium(): void { this.trigger({ pattern: 'medium' }); }
  public heavy(): void { this.trigger({ pattern: 'heavy' }); }
  public success(): void { this.trigger({ pattern: 'success' }); }
  public error(): void { this.trigger({ pattern: 'error' }); }
  public warning(): void { this.trigger({ pattern: 'warning' }); }
}

export const haptic = new HapticFeedbackManager();
export const hapticFeedback = haptic; // For backward compatibility
export default HapticFeedbackManager;