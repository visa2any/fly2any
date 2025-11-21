/**
 * WORLD CUP ACCESSIBILITY UTILITIES
 *
 * WCAG 2.1 AAA compliant utilities for:
 * - Keyboard navigation
 * - Screen reader announcements
 * - Focus management
 * - ARIA attributes
 * - Skip links
 */

/**
 * Generate accessible ARIA labels for World Cup content
 */
export const worldCupAriaLabels = {
  en: {
    hero: 'FIFA World Cup 2026 main information and package options',
    countdown: (days: number) => `${days} days until the World Cup 2026 tournament starts`,
    packageCTA: (packageName: string, price: string) =>
      `View ${packageName} package details, starting from ${price}`,
    teamCard: (teamName: string, ranking?: number) =>
      `${teamName} national team information${ranking ? `, FIFA ranking ${ranking}` : ''}`,
    stadiumCard: (stadiumName: string, city: string, capacity: number) =>
      `${stadiumName} in ${city}, capacity ${capacity.toLocaleString()} people`,
    crossSell: 'World Cup 2026 travel package promotion',
    faq: (question: string) => `Frequently asked question: ${question}`,
    navigation: 'World Cup 2026 navigation menu',
  },
  pt: {
    hero: 'Informações principais e opções de pacotes da Copa do Mundo FIFA 2026',
    countdown: (days: number) => `${days} dias até o início do torneio da Copa do Mundo 2026`,
    packageCTA: (packageName: string, price: string) =>
      `Ver detalhes do pacote ${packageName}, a partir de ${price}`,
    teamCard: (teamName: string, ranking?: number) =>
      `Informações da seleção ${teamName}${ranking ? `, ranking FIFA ${ranking}` : ''}`,
    stadiumCard: (stadiumName: string, city: string, capacity: number) =>
      `${stadiumName} em ${city}, capacidade ${capacity.toLocaleString()} pessoas`,
    crossSell: 'Promoção de pacotes de viagem para Copa do Mundo 2026',
    faq: (question: string) => `Pergunta frequente: ${question}`,
    navigation: 'Menu de navegação Copa do Mundo 2026',
  },
  es: {
    hero: 'Información principal y opciones de paquetes del Mundial FIFA 2026',
    countdown: (days: number) => `${days} días hasta el inicio del torneo del Mundial 2026`,
    packageCTA: (packageName: string, price: string) =>
      `Ver detalles del paquete ${packageName}, desde ${price}`,
    teamCard: (teamName: string, ranking?: number) =>
      `Información de la selección ${teamName}${ranking ? `, ranking FIFA ${ranking}` : ''}`,
    stadiumCard: (stadiumName: string, city: string, capacity: number) =>
      `${stadiumName} en ${city}, capacidad ${capacity.toLocaleString()} personas`,
    crossSell: 'Promoción de paquetes de viaje para el Mundial 2026',
    faq: (question: string) => `Pregunta frecuente: ${question}`,
    navigation: 'Menú de navegación Mundial 2026',
  },
};

/**
 * Screen reader announcement utility
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus trap for modals
 */
export function createFocusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Keyboard navigation helpers
 */
export const keyboardHandlers = {
  /**
   * Handle Enter/Space for clickable elements
   */
  clickable: (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  },

  /**
   * Handle Escape key
   */
  escape: (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback();
    }
  },

  /**
   * Handle arrow navigation
   */
  arrows: (callbacks: {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
  }) => (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        if (callbacks.onUp) {
          e.preventDefault();
          callbacks.onUp();
        }
        break;
      case 'ArrowDown':
        if (callbacks.onDown) {
          e.preventDefault();
          callbacks.onDown();
        }
        break;
      case 'ArrowLeft':
        if (callbacks.onLeft) {
          e.preventDefault();
          callbacks.onLeft();
        }
        break;
      case 'ArrowRight':
        if (callbacks.onRight) {
          e.preventDefault();
          callbacks.onRight();
        }
        break;
    }
  },
};

/**
 * Skip link generator for World Cup pages
 */
export function generateSkipLinks(lang: 'en' | 'pt' | 'es' = 'en') {
  const labels = {
    en: {
      mainContent: 'Skip to main content',
      navigation: 'Skip to navigation',
      packages: 'Skip to package options',
      faq: 'Skip to frequently asked questions',
    },
    pt: {
      mainContent: 'Pular para conteúdo principal',
      navigation: 'Pular para navegação',
      packages: 'Pular para opções de pacotes',
      faq: 'Pular para perguntas frequentes',
    },
    es: {
      mainContent: 'Saltar al contenido principal',
      navigation: 'Saltar a navegación',
      packages: 'Saltar a opciones de paquetes',
      faq: 'Saltar a preguntas frecuentes',
    },
  };

  return [
    { href: '#main-content', label: labels[lang].mainContent },
    { href: '#navigation', label: labels[lang].navigation },
    { href: '#packages', label: labels[lang].packages },
    { href: '#faq', label: labels[lang].faq },
  ];
}

/**
 * Color contrast checker (WCAG AAA: 7:1 for normal text, 4.5:1 for large text)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsWCAGStandard(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  fontSize: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return fontSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  }

  return fontSize === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Generate accessible table markup for schedules
 */
export function getAccessibleTableAttributes() {
  return {
    table: {
      role: 'table' as const,
      'aria-label': 'World Cup 2026 match schedule',
    },
    thead: {
      role: 'rowgroup' as const,
    },
    tbody: {
      role: 'rowgroup' as const,
    },
    tr: {
      role: 'row' as const,
    },
    th: (label: string) => ({
      role: 'columnheader' as const,
      scope: 'col' as const,
      'aria-label': label,
    }),
    td: {
      role: 'cell' as const,
    },
  };
}

/**
 * Live region for dynamic content updates
 */
export class LiveRegion {
  private element: HTMLElement | null = null;

  constructor(priority: 'polite' | 'assertive' = 'polite') {
    if (typeof window === 'undefined') return;

    this.element = document.createElement('div');
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', priority);
    this.element.setAttribute('aria-atomic', 'true');
    this.element.className = 'sr-only';
    document.body.appendChild(this.element);
  }

  announce(message: string) {
    if (!this.element) return;
    this.element.textContent = message;
  }

  destroy() {
    if (this.element) {
      document.body.removeChild(this.element);
      this.element = null;
    }
  }
}

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Save current focus and return to it later
   */
  saveFocus: () => {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      if (activeElement && activeElement.focus) {
        activeElement.focus();
      }
    };
  },

  /**
   * Focus first element in container
   */
  focusFirst: (container: HTMLElement) => {
    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  },

  /**
   * Get all focusable elements
   */
  getAllFocusable: (container: HTMLElement = document.body): HTMLElement[] => {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  },
};

/**
 * Reduced motion detection
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast mode detection
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(prefers-contrast: high)').matches ||
    window.matchMedia('(-ms-high-contrast: active)').matches
  );
}
