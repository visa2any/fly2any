import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '1.5rem',
      },
      screens: {
        sm: '100%',
        md: '100%',
        lg: '100%',
        xl: '1600px',
        '2xl': '1600px',
      },
    },
    extend: {
      zIndex: {
        'base': '0',
        'dropdown': '1000',
        'sticky': '1100',
        'fixed': '1200',
        'modal-backdrop': '1300',
        'modal': '1400',
        'popover': '1500',
        'toast': '1600',
        'maximum': '9999',
      },
      colors: {
        // ============================================
        // OFFICIAL FLY2ANY BRAND COLORS (Level-6 Standard)
        // ============================================

        // Fly2Any Brand Red (#E74035 - Official Primary)
        primary: {
          50: '#FEF2F1',
          100: '#FDE6E4',
          200: '#FACCC8',
          300: '#F5A09A',
          400: '#EF6B63',
          500: '#E74035', // ⭐ OFFICIAL Brand Primary Red
          600: '#D43B31', // Hover state
          700: '#BF332A', // Pressed state
          800: '#992821',
          900: '#731E19',
        },
        // Fly2Any Brand Yellow (#F7C928 - Official Accent)
        secondary: {
          50: '#FFFBEB',
          100: '#FEF5C7',
          200: '#FEEB8A',
          300: '#FDDE47',
          400: '#FBD52D',
          500: '#F7C928', // ⭐ OFFICIAL Brand Accent Yellow
          600: '#DEB423', // Hover state
          700: '#C6A01F', // Pressed state
          800: '#9F801A',
          900: '#786014',
        },
        // Layer System (Light Mode - Apple Standard)
        layer: {
          0: '#FAFAFA', // Base background
          1: '#F2F2F2', // Cards
          2: '#E6E6E6', // Elevated surfaces
          3: '#DCDCDC', // Modal/Sheet
        },
        // Dark Mode Layers
        'layer-dark': {
          0: '#0E0E0E',
          1: '#1A1A1A',
          2: '#222222',
          3: '#2B2B2B',
        },
        // Anti-Fatigue Neutral Palette
        neutral: {
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
        success: {
          50: '#E6FAF8',
          100: '#CCF5F1',
          200: '#99EBE3',
          300: '#66E1D5',
          400: '#33D7C7',
          500: '#00A699', // Main success color
          600: '#00847A',
          700: '#00635B',
          800: '#00423C',
          900: '#00211E',
        },
        warning: {
          50: '#FFF7EB',
          100: '#FFEFD6',
          200: '#FFDFAD',
          300: '#FFCF85',
          400: '#FFBF5C',
          500: '#FFAD1F', // Main warning color
          600: '#DB9100',
          700: '#B77400',
          800: '#935800',
          900: '#6F3B00',
        },
        error: {
          50: '#FDEAEB',
          100: '#FBD4D7',
          200: '#F7A9AF',
          300: '#F37E87',
          400: '#EF535F',
          500: '#E63946', // Main error color
          600: '#B82D38',
          700: '#8A212A',
          800: '#5C161C',
          900: '#2E0B0E',
        },
        info: {
          50: '#E9F9FC',
          100: '#D3F3F9',
          200: '#A7E7F3',
          300: '#7BDBEC',
          400: '#4FCFE6',
          500: '#4CC3D9', // Main info color
          600: '#3D9CAE',
          700: '#2E7582',
          800: '#1E4E57',
          900: '#0F272B',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Poppins"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        // ============================================
        // LEVEL-6 MULTI-LAYER SHADOW SYSTEM (Apple Standard)
        // Always use 2-3 layer shadows for premium depth
        // ============================================

        // Soft shadows (anti-eye-strain)
        'soft-sm': '0 2px 8px rgba(27, 28, 32, 0.06)',
        'soft': '0 4px 20px rgba(27, 28, 32, 0.10)',
        'soft-md': '0 8px 24px rgba(27, 28, 32, 0.12)',
        'soft-lg': '0 12px 28px rgba(27, 28, 32, 0.14)',

        // Multi-layer shadows (Level-6 Standard)
        'level-sm': '0 1px 2px rgba(0,0,0,0.06)',
        'level-md': '0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'level-lg': '0 1px 2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.03)',
        'level-xl': '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.08), 0 20px 25px rgba(0,0,0,0.04)',
        'level-2xl': '0 8px 10px rgba(0,0,0,0.05), 0 15px 25px rgba(0,0,0,0.10), 0 30px 40px rgba(0,0,0,0.06)',

        // Brand shadows with color tint
        'primary': '0 4px 6px rgba(231, 64, 53, 0.12), 0 10px 20px rgba(231, 64, 53, 0.15)',
        'secondary': '0 4px 6px rgba(247, 201, 40, 0.12), 0 10px 20px rgba(247, 201, 40, 0.15)',

        // Card hover shadow (premium lift effect)
        'card-hover': '0 4px 6px rgba(0,0,0,0.05), 0 12px 20px rgba(0,0,0,0.10), 0 -2px 6px rgba(0,0,0,0.02)',
      },

      // ============================================
      // LEVEL-6 TRANSITION TIMING (Apple Physics)
      // ============================================
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'apple-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        'micro': '150ms',   // Microinteractions
        'fast': '200ms',    // Quick feedback
        'normal': '260ms',  // Screen transitions
        'slow': '400ms',    // Complex animations
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
