/**
 * Popup Orchestrator - Prevents popup conflicts and manages display priority
 * Level-6 Apple-Class: Non-intrusive, intelligent timing
 */

export type PopupType =
  | 'exit_intent'
  | 'post_search_capture'
  | 'newsletter'
  | 'price_alert'
  | 'auth_prompt'
  | 'feedback'
  | 'promo';

interface PopupConfig {
  type: PopupType;
  priority: number; // Higher = more important
  cooldownMs: number; // Min time before same popup can show again
  globalCooldownMs: number; // Min time after ANY popup before this can show
  maxPerSession: number;
  requiresInteraction: boolean; // User must interact before other popups
}

interface PopupState {
  lastShown: number;
  showCount: number;
  dismissed: boolean;
}

// Priority configuration (higher = more important)
const POPUP_CONFIGS: Record<PopupType, PopupConfig> = {
  exit_intent: {
    type: 'exit_intent',
    priority: 90,
    cooldownMs: Infinity, // Once per session
    globalCooldownMs: 10000,
    maxPerSession: 1,
    requiresInteraction: false,
  },
  post_search_capture: {
    type: 'post_search_capture',
    priority: 80,
    cooldownMs: Infinity,
    globalCooldownMs: 15000,
    maxPerSession: 1,
    requiresInteraction: false,
  },
  price_alert: {
    type: 'price_alert',
    priority: 70,
    cooldownMs: 300000, // 5 minutes
    globalCooldownMs: 10000,
    maxPerSession: 3,
    requiresInteraction: false,
  },
  auth_prompt: {
    type: 'auth_prompt',
    priority: 60,
    cooldownMs: 600000, // 10 minutes
    globalCooldownMs: 30000,
    maxPerSession: 2,
    requiresInteraction: true,
  },
  newsletter: {
    type: 'newsletter',
    priority: 50,
    cooldownMs: Infinity,
    globalCooldownMs: 20000,
    maxPerSession: 1,
    requiresInteraction: false,
  },
  promo: {
    type: 'promo',
    priority: 40,
    cooldownMs: 86400000, // 24 hours
    globalCooldownMs: 30000,
    maxPerSession: 1,
    requiresInteraction: false,
  },
  feedback: {
    type: 'feedback',
    priority: 30,
    cooldownMs: 86400000,
    globalCooldownMs: 60000,
    maxPerSession: 1,
    requiresInteraction: false,
  },
};

class PopupOrchestrator {
  private state: Map<PopupType, PopupState> = new Map();
  private activePopup: PopupType | null = null;
  private lastGlobalPopup: number = 0;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadState();
      this.isInitialized = true;
    }
  }

  private loadState() {
    try {
      const saved = sessionStorage.getItem('popupOrchestratorState');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = new Map(Object.entries(parsed.state));
        this.lastGlobalPopup = parsed.lastGlobalPopup || 0;
      }
    } catch {
      // Fresh session
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      const stateObj: Record<string, PopupState> = {};
      this.state.forEach((v, k) => { stateObj[k] = v; });
      sessionStorage.setItem('popupOrchestratorState', JSON.stringify({
        state: stateObj,
        lastGlobalPopup: this.lastGlobalPopup,
      }));
    } catch {
      // Storage full or unavailable
    }
  }

  private getState(type: PopupType): PopupState {
    if (!this.state.has(type)) {
      this.state.set(type, { lastShown: 0, showCount: 0, dismissed: false });
    }
    return this.state.get(type)!;
  }

  /**
   * Check if a popup can be shown
   */
  canShow(type: PopupType): boolean {
    if (!this.isInitialized) return false;

    const config = POPUP_CONFIGS[type];
    const state = this.getState(type);
    const now = Date.now();

    // Already showing a popup?
    if (this.activePopup !== null) {
      const activeConfig = POPUP_CONFIGS[this.activePopup];
      if (activeConfig.requiresInteraction) return false;
      if (config.priority <= activeConfig.priority) return false;
    }

    // Check session limit
    if (state.showCount >= config.maxPerSession) return false;

    // Check popup-specific cooldown
    if (now - state.lastShown < config.cooldownMs) return false;

    // Check global cooldown
    if (now - this.lastGlobalPopup < config.globalCooldownMs) return false;

    // Check if dismissed
    if (state.dismissed && config.maxPerSession === 1) return false;

    return true;
  }

  /**
   * Register that a popup is being shown
   */
  show(type: PopupType): boolean {
    if (!this.canShow(type)) return false;

    const state = this.getState(type);
    const now = Date.now();

    state.lastShown = now;
    state.showCount++;
    this.lastGlobalPopup = now;
    this.activePopup = type;
    this.saveState();

    // Track in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'popup_shown', {
        event_category: 'popup_orchestrator',
        popup_type: type,
        show_count: state.showCount,
      });
    }

    return true;
  }

  /**
   * Register that a popup was closed
   */
  close(type: PopupType, dismissed: boolean = false) {
    if (this.activePopup === type) {
      this.activePopup = null;
    }

    if (dismissed) {
      const state = this.getState(type);
      state.dismissed = true;
      this.saveState();
    }
  }

  /**
   * Check if any popup is currently active
   */
  hasActivePopup(): boolean {
    return this.activePopup !== null;
  }

  /**
   * Get the currently active popup type
   */
  getActivePopup(): PopupType | null {
    return this.activePopup;
  }

  /**
   * Reset all popup states (for testing)
   */
  reset() {
    this.state.clear();
    this.activePopup = null;
    this.lastGlobalPopup = 0;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('popupOrchestratorState');
    }
  }

  /**
   * Get stats for debugging/admin
   */
  getStats(): Record<PopupType, { showCount: number; canShow: boolean }> {
    const stats: any = {};
    Object.keys(POPUP_CONFIGS).forEach((type) => {
      const t = type as PopupType;
      const state = this.getState(t);
      stats[t] = {
        showCount: state.showCount,
        canShow: this.canShow(t),
      };
    });
    return stats;
  }
}

// Singleton instance
export const popupOrchestrator = typeof window !== 'undefined'
  ? new PopupOrchestrator()
  : null;

// React hook for using the orchestrator
export function usePopupOrchestrator() {
  return {
    canShow: (type: PopupType) => popupOrchestrator?.canShow(type) ?? false,
    show: (type: PopupType) => popupOrchestrator?.show(type) ?? false,
    close: (type: PopupType, dismissed?: boolean) => popupOrchestrator?.close(type, dismissed),
    hasActivePopup: () => popupOrchestrator?.hasActivePopup() ?? false,
  };
}
