/**
 * Fly2Any Design System
 *
 * Professional design system synthesized from:
 * - Kayak: Minimalist orange brand, clean UI
 * - Booking.com: Blue trust, urgency tactics
 * - Expedia: Comprehensive yellow/blue system
 * - Best practices from all competitors
 */

export const theme = {
  // Brand Colors - Modern, trustworthy, energetic
  colors: {
    // Primary Brand - Trust & Sky (inspired by travel)
    primary: {
      50: '#E6F3FF',
      100: '#CCE7FF',
      200: '#99CFFF',
      300: '#66B7FF',
      400: '#339FFF',
      500: '#0087FF', // Main brand color - vibrant blue
      600: '#006FDB',
      700: '#0057B7',
      800: '#003F93',
      900: '#00276F',
    },

    // Secondary Brand - Energy & Action (Kayak-inspired orange)
    secondary: {
      50: '#FFF4E6',
      100: '#FFE9CC',
      200: '#FFD399',
      300: '#FFBD66',
      400: '#FFA733',
      500: '#FF9100', // Energetic orange
      600: '#DB7A00',
      700: '#B76300',
      800: '#934C00',
      900: '#6F3500',
    },

    // Accent - Conversion & Deals (Booking.com green for good prices)
    accent: {
      success: '#00A699', // Good deal green
      warning: '#FFAD1F', // Average price yellow
      error: '#E63946',   // Expensive/error red
      info: '#4CC3D9',    // Information blue
    },

    // Neutrals - Clean, modern
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Semantic Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      dark: '#0F172A',
    },

    text: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },

    // Overlay & Effects
    overlay: {
      light: 'rgba(255, 255, 255, 0.95)',
      dark: 'rgba(0, 0, 0, 0.6)',
      gradient: 'linear-gradient(135deg, rgba(0, 135, 255, 0.9) 0%, rgba(255, 145, 0, 0.9) 100%)',
    },
  },

  // Typography System
  typography: {
    // Font Families
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: '"Poppins", "Inter", sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },

    // Font Sizes (Mobile-first)
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      '5xl': ['3rem', { lineHeight: '1' }],           // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
    },

    // Font Weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },

  // Spacing System (8px grid)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',

    // Colored shadows for brand elements
    primary: '0 10px 25px -5px rgba(0, 135, 255, 0.3)',
    secondary: '0 10px 25px -5px rgba(255, 145, 0, 0.3)',
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation & Transitions
  animation: {
    // Durations
    duration: {
      fast: '150ms',
      base: '200ms',
      medium: '300ms',
      slow: '500ms',
      slower: '700ms',
    },

    // Timing Functions
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Common animations
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      slideUp: {
        from: { transform: 'translateY(10px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
      slideDown: {
        from: { transform: 'translateY(-10px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
      scaleIn: {
        from: { transform: 'scale(0.95)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 },
      },
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
    },
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700,
  },

  // Component-Specific Styles
  components: {
    button: {
      // Button sizes
      sizes: {
        sm: {
          height: '2rem',      // 32px
          padding: '0 0.75rem',
          fontSize: '0.875rem',
        },
        md: {
          height: '2.5rem',    // 40px
          padding: '0 1rem',
          fontSize: '1rem',
        },
        lg: {
          height: '3rem',      // 48px
          padding: '0 1.5rem',
          fontSize: '1.125rem',
        },
        xl: {
          height: '3.5rem',    // 56px
          padding: '0 2rem',
          fontSize: '1.25rem',
        },
      },

      // Button variants
      variants: {
        primary: {
          bg: 'linear-gradient(135deg, #0087FF 0%, #006FDB 100%)',
          color: '#FFFFFF',
          hover: 'linear-gradient(135deg, #006FDB 0%, #0057B7 100%)',
        },
        secondary: {
          bg: 'linear-gradient(135deg, #FF9100 0%, #DB7A00 100%)',
          color: '#FFFFFF',
          hover: 'linear-gradient(135deg, #DB7A00 0%, #B76300 100%)',
        },
        outline: {
          bg: 'transparent',
          border: '2px solid #0087FF',
          color: '#0087FF',
          hover: '#E6F3FF',
        },
        ghost: {
          bg: 'transparent',
          color: '#0087FF',
          hover: '#F3F4F6',
        },
      },
    },

    card: {
      // Card variants
      variants: {
        elevated: {
          bg: '#FFFFFF',
          shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          hover: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
        outlined: {
          bg: '#FFFFFF',
          border: '1px solid #E5E7EB',
          hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
      },
    },

    input: {
      // Input sizes
      sizes: {
        sm: {
          height: '2rem',
          padding: '0 0.75rem',
          fontSize: '0.875rem',
        },
        md: {
          height: '2.75rem',   // 44px (touch-friendly)
          padding: '0 1rem',
          fontSize: '1rem',
        },
        lg: {
          height: '3.5rem',
          padding: '0 1.25rem',
          fontSize: '1.125rem',
        },
      },

      // Input states
      states: {
        default: {
          border: '2px solid #E5E7EB',
          focus: '2px solid #0087FF',
        },
        error: {
          border: '2px solid #E63946',
          focus: '2px solid #E63946',
        },
        success: {
          border: '2px solid #00A699',
          focus: '2px solid #00A699',
        },
      },
    },
  },
};

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
