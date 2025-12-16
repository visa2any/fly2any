/**
 * Client-Side UX Tracker — Fly2Any
 * Captures behavioral signals automatically
 */

type SignalType = 'rage_click' | 'hesitation' | 'form_loop' | 'scroll_stall' | 'drop_off' | 'error';

interface TrackerConfig {
  rageClickThreshold: number;
  rageClickWindow: number;
  hesitationThreshold: number;
  formCorrectionThreshold: number;
  enabled: boolean;
}

const defaultConfig: TrackerConfig = {
  rageClickThreshold: 4,
  rageClickWindow: 2000,
  hesitationThreshold: 12000,
  formCorrectionThreshold: 4,
  enabled: true,
};

class UXTracker {
  private config: TrackerConfig;
  private clickHistory: Array<{ x: number; y: number; time: number; target: string }> = [];
  private formCorrections: Map<string, number> = new Map();
  private lastActivity = Date.now();
  private hesitationTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private page: string = '';
  private listeners: Array<() => void> = [];

  constructor(config: Partial<TrackerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    let id = sessionStorage.getItem('ux_session_id');
    if (!id) {
      id = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem('ux_session_id', id);
    }
    return id;
  }

  init(page: string): void {
    if (typeof window === 'undefined' || !this.config.enabled) return;

    this.page = page;
    this.cleanup();

    // Click tracking
    const handleClick = this.handleClick.bind(this);
    document.addEventListener('click', handleClick, true);
    this.listeners.push(() => document.removeEventListener('click', handleClick, true));

    // Activity tracking for hesitation
    const handleActivity = this.handleActivity.bind(this);
    ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
      this.listeners.push(() => document.removeEventListener(event, handleActivity));
    });

    // Form tracking
    const handleInput = this.handleInput.bind(this);
    document.addEventListener('input', handleInput, true);
    this.listeners.push(() => document.removeEventListener('input', handleInput, true));

    // Error tracking
    const handleError = this.handleError.bind(this);
    window.addEventListener('error', handleError);
    this.listeners.push(() => window.removeEventListener('error', handleError));

    // Unhandled rejection tracking
    const handleRejection = this.handleRejection.bind(this);
    window.addEventListener('unhandledrejection', handleRejection);
    this.listeners.push(() => window.removeEventListener('unhandledrejection', handleRejection));

    // Start hesitation timer
    this.startHesitationTimer();

    // Visibility change (potential abandonment)
    const handleVisibility = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', handleVisibility);
    this.listeners.push(() => document.removeEventListener('visibilitychange', handleVisibility));
  }

  cleanup(): void {
    this.listeners.forEach(unsub => unsub());
    this.listeners = [];
    if (this.hesitationTimer) clearTimeout(this.hesitationTimer);
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const now = Date.now();

    this.clickHistory.push({
      x: e.clientX,
      y: e.clientY,
      time: now,
      target: this.getElementSelector(target),
    });

    // Keep only recent clicks
    this.clickHistory = this.clickHistory.filter(
      c => now - c.time < this.config.rageClickWindow
    );

    // Check for rage clicks (multiple clicks in same area)
    if (this.clickHistory.length >= this.config.rageClickThreshold) {
      const first = this.clickHistory[0];
      const sameArea = this.clickHistory.every(
        c => Math.abs(c.x - first.x) < 50 && Math.abs(c.y - first.y) < 50
      );

      if (sameArea) {
        this.sendSignal('rage_click', {
          element: this.getElementSelector(target),
          click_count: this.clickHistory.length,
        });
        this.clickHistory = [];
      }
    }

    this.handleActivity();
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (!target.name && !target.id) return;

    const key = target.name || target.id;
    const prev = target.dataset.prevValue || '';
    const current = target.value;

    // Detect correction (shorter value or complete rewrite)
    if (prev.length > current.length || (prev.length > 3 && current.length > 0 && !current.startsWith(prev.slice(0, 2)))) {
      const corrections = (this.formCorrections.get(key) || 0) + 1;
      this.formCorrections.set(key, corrections);

      if (corrections >= this.config.formCorrectionThreshold) {
        this.sendSignal('form_loop', {
          element: key,
          corrections,
        });
        this.formCorrections.set(key, 0);
      }
    }

    target.dataset.prevValue = current;
    this.handleActivity();
  }

  private handleActivity(): void {
    this.lastActivity = Date.now();
    this.startHesitationTimer();
  }

  private startHesitationTimer(): void {
    if (this.hesitationTimer) clearTimeout(this.hesitationTimer);

    this.hesitationTimer = setTimeout(() => {
      this.sendSignal('hesitation', {
        duration_ms: this.config.hesitationThreshold,
      });
    }, this.config.hesitationThreshold);
  }

  private handleError(e: ErrorEvent): void {
    this.sendSignal('error', {
      type: 'js_error',
      message: e.message,
      filename: e.filename,
      line: e.lineno,
    });
  }

  private handleRejection(e: PromiseRejectionEvent): void {
    this.sendSignal('error', {
      type: 'unhandled_promise',
      message: String(e.reason),
    });
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // User left the page
      const timeOnPage = Date.now() - (parseInt(sessionStorage.getItem('page_start') || '0') || Date.now());
      if (timeOnPage > 5000 && timeOnPage < 30000) {
        // Left quickly after some engagement - potential issue
        this.sendSignal('drop_off', { time_on_page_ms: timeOnPage });
      }
    } else {
      sessionStorage.setItem('page_start', Date.now().toString());
    }
  }

  private getElementSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(' ')[0]}`;
    return el.tagName.toLowerCase();
  }

  private sendSignal(type: SignalType, data: Record<string, unknown>): void {
    // Use sendBeacon for reliability
    const payload = JSON.stringify({
      session_id: this.sessionId,
      page: this.page,
      type,
      data,
      timestamp: Date.now(),
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/ux-signal', payload);
    } else {
      fetch('/api/ux-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }

  // Manual signal capture
  captureError(message: string, context?: Record<string, unknown>): void {
    this.sendSignal('error', { message, ...context });
  }

  captureDropOff(step: string): void {
    this.sendSignal('drop_off', { step });
  }
}

// Singleton instance
export const uxTracker = new UXTracker();

// React hook
export function useUXTracker(page: string) {
  if (typeof window !== 'undefined') {
    uxTracker.init(page);
  }

  return {
    captureError: uxTracker.captureError.bind(uxTracker),
    captureDropOff: uxTracker.captureDropOff.bind(uxTracker),
  };
}
