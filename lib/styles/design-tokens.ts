/**
 * DESIGN TOKENS - Fly2Any Design System
 *
 * Central source of truth for all design values.
 * Use these tokens across all components for consistency.
 */

export const DESIGN_TOKENS = {
  // Spacing Scale (4px base unit)
  spacing: {
    '0': '0',
    '1': '0.25rem',  // 4px
    '2': '0.5rem',   // 8px
    '3': '0.75rem',  // 12px
    '4': '1rem',     // 16px
    '5': '1.25rem',  // 20px
    '6': '1.5rem',   // 24px
    '8': '2rem',     // 32px
    '10': '2.5rem',  // 40px
    '12': '3rem',    // 48px
    '16': '4rem',    // 64px
  },

  // Touch Target Sizes (WCAG 2.5)
  touchTargets: {
    minimum: '44px',
    comfortable: '48px',
    large: '56px',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Typography
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Colors (from tailwind.config.ts)
  colors: {
    primary: {
      50: '#FEF2F2',
      100: '#FDE8E7',
      200: '#FACCCA',
      300: '#F5A5A2',
      400: '#EF6B65',
      500: '#EF4136', // Brand Primary
      600: '#DC3A30',
      700: '#C4332A',
      800: '#9C2921',
      900: '#74201A',
    },
    secondary: {
      50: '#FFFBEB',
      100: '#FEF5C7',
      200: '#FEEC8A',
      300: '#FDE047',
      400: '#FBD62D',
      500: '#F9C900', // Brand Yellow
      600: '#E0B500',
      700: '#C9A200',
      800: '#A38500',
      900: '#7D6600',
    },
    neutral: {
      50: '#F6F7F9',
      100: '#F0F2F5',
      200: '#E3E5E8',
      300: '#D1D4D9',
      400: '#9CA0A7',
      500: '#5F6368',
      600: '#4A4D52',
      700: '#35373B',
      800: '#1B1C20',
      900: '#0E1012',
    },
  },

  // Shadows
  shadows: {
    soft: '0 4px 20px rgba(27, 28, 32, 0.10)',
    softMd: '0 8px 24px rgba(27, 28, 32, 0.12)',
    softLg: '0 12px 28px rgba(27, 28, 32, 0.14)',
    primary: '0 8px 24px rgba(239, 65, 54, 0.18)',
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    maximum: 9999,
  },

  // Transitions
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// CSS Custom Properties Generator
export function generateCSSVariables(): string {
  return `
    :root {
      /* Spacing */
      --spacing-1: ${DESIGN_TOKENS.spacing['1']};
      --spacing-2: ${DESIGN_TOKENS.spacing['2']};
      --spacing-3: ${DESIGN_TOKENS.spacing['3']};
      --spacing-4: ${DESIGN_TOKENS.spacing['4']};
      --spacing-6: ${DESIGN_TOKENS.spacing['6']};
      --spacing-8: ${DESIGN_TOKENS.spacing['8']};

      /* Touch Targets */
      --touch-target-min: ${DESIGN_TOKENS.touchTargets.minimum};
      --touch-target-comfortable: ${DESIGN_TOKENS.touchTargets.comfortable};

      /* Border Radius */
      --radius-sm: ${DESIGN_TOKENS.borderRadius.sm};
      --radius-md: ${DESIGN_TOKENS.borderRadius.md};
      --radius-lg: ${DESIGN_TOKENS.borderRadius.lg};
      --radius-xl: ${DESIGN_TOKENS.borderRadius.xl};

      /* Colors */
      --color-primary: ${DESIGN_TOKENS.colors.primary[500]};
      --color-secondary: ${DESIGN_TOKENS.colors.secondary[500]};
      --color-text: ${DESIGN_TOKENS.colors.neutral[800]};
      --color-text-secondary: ${DESIGN_TOKENS.colors.neutral[500]};
      --color-background: ${DESIGN_TOKENS.colors.neutral[50]};

      /* Shadows */
      --shadow-soft: ${DESIGN_TOKENS.shadows.soft};
      --shadow-soft-md: ${DESIGN_TOKENS.shadows.softMd};
    }
  `;
}

// Utility Classes Map
export const utilityClasses = {
  // Touch-friendly button
  touchButton: 'min-h-[44px] min-w-[44px] flex items-center justify-center',

  // Card styles
  card: 'bg-white rounded-xl shadow-soft p-4',
  cardHover: 'bg-white rounded-xl shadow-soft p-4 hover:shadow-soft-md transition-shadow',

  // Input styles
  input: 'w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-colors',

  // Button styles
  buttonPrimary: 'bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 active:scale-95 transition-all',
  buttonSecondary: 'bg-neutral-100 text-neutral-800 px-6 py-3 rounded-xl font-semibold hover:bg-neutral-200 active:scale-95 transition-all',
  buttonOutline: 'border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 active:scale-95 transition-all',

  // Text styles
  heading1: 'text-3xl md:text-5xl font-bold text-neutral-800',
  heading2: 'text-2xl md:text-3xl font-bold text-neutral-800',
  heading3: 'text-xl md:text-2xl font-semibold text-neutral-800',
  bodyText: 'text-base text-neutral-700',
  bodySmall: 'text-sm text-neutral-600',
  caption: 'text-xs text-neutral-500',
} as const;

export default DESIGN_TOKENS;
