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
  // Anti-Eye-Strain Color System
  colors: {
    // UI-Safe Fly2Any Red (anti-eye-strain)
    primary: {
      50: '#FEF2F2',
      100: '#FDE8E8',
      200: '#FACACA',
      300: '#F5A3A3',
      400: '#E85D5D',
      500: '#D63A35', // UI Primary Red
      600: '#C7342F', // Hover
      700: '#B12F2B', // Pressed
      800: '#8E2622',
      900: '#6B1D1A',
    },

    // UI-Safe Fly2Any Yellow (anti-eye-strain)
    secondary: {
      50: '#FEFCE8',
      100: '#FEF9C3',
      200: '#FEF08A',
      300: '#FDE047',
      400: '#F5D63D',
      500: '#E8C52A', // UI Accent Yellow
      600: '#D7B622', // Hover
      700: '#C9A91E', // Pressed
      800: '#A38A18',
      900: '#7D6A12',
    },

    // Accent - Semantic colors
    accent: {
      success: '#10B981',
      warning: '#E8C52A', // UI-Safe Yellow
      error: '#D63A35',   // UI-Safe Red
      info: '#3B82F6',
    },

    // Anti-Fatigue Neutral Palette
    gray: {
      50: '#F6F7F9',  // Background
      100: '#F0F2F5', // Surface alt
      200: '#E3E5E8', // Dividers
      300: '#D1D4D9',
      400: '#9CA0A7',
      500: '#5F6368', // Text secondary
      600: '#4A4D52',
      700: '#35373B',
      800: '#1B1C20', // Text primary
      900: '#0E1012', // Dark bg
    },

    // Semantic Backgrounds
    background: {
      primary: '#FFFFFF',
      secondary: '#F6F7F9', // Anti-fatigue bg
      tertiary: '#F0F2F5',  // Surface
      dark: '#0E1012',
    },

    // Anti-Strain Text (no pure black/white)
    text: {
      primary: '#1B1C20',   // Soft dark
      secondary: '#5F6368', // Muted
      tertiary: '#9CA0A7',
      inverse: '#F4F5F6',   // Soft white
    },

    // Overlay & Effects
    overlay: {
      light: 'rgba(246, 247, 249, 0.95)',
      dark: 'rgba(14, 16, 18, 0.6)',
      gradient: 'linear-gradient(135deg, rgba(214, 58, 53, 0.9) 0%, rgba(232, 197, 42, 0.9) 100%)',
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

  // Anti-Eye-Strain Soft Shadows (10-14% opacity, 20-28px blur)
  boxShadow: {
    xs: '0 1px 4px rgba(27, 28, 32, 0.04)',
    sm: '0 2px 8px rgba(27, 28, 32, 0.06)',
    base: '0 4px 16px rgba(27, 28, 32, 0.08)',
    md: '0 6px 20px rgba(27, 28, 32, 0.10)',
    lg: '0 8px 24px rgba(27, 28, 32, 0.12)',
    xl: '0 12px 28px rgba(27, 28, 32, 0.14)',
    '2xl': '0 16px 32px rgba(27, 28, 32, 0.14)',
    inner: 'inset 0 2px 4px rgba(27, 28, 32, 0.06)',
    none: 'none',

    // Brand shadows (reduced intensity)
    primary: '0 8px 24px rgba(214, 58, 53, 0.18)',
    secondary: '0 8px 24px rgba(232, 197, 42, 0.18)',
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

      // Button variants (UI-Safe anti-strain colors)
      variants: {
        primary: {
          bg: 'linear-gradient(135deg, #D63A35 0%, #C7342F 100%)',
          color: '#F4F5F6',
          hover: 'linear-gradient(135deg, #C7342F 0%, #B12F2B 100%)',
        },
        secondary: {
          bg: 'linear-gradient(135deg, #E8C52A 0%, #D7B622 100%)',
          color: '#1B1C20',
          hover: 'linear-gradient(135deg, #D7B622 0%, #C9A91E 100%)',
        },
        outline: {
          bg: 'transparent',
          border: '2px solid #D63A35',
          color: '#D63A35',
          hover: '#FEF2F2',
        },
        ghost: {
          bg: 'transparent',
          color: '#D63A35',
          hover: '#FEF2F2',
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
          focus: '2px solid #E53935',
        },
        error: {
          border: '2px solid #E53935',
          focus: '2px solid #E53935',
        },
        success: {
          border: '2px solid #10B981',
          focus: '2px solid #10B981',
        },
      },
    },
  },
};

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
