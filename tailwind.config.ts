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
        // Anti-eye-strain soft shadows (10-14% opacity, 20-28px blur)
        'soft-sm': '0 2px 8px rgba(27, 28, 32, 0.06)',
        'soft': '0 4px 20px rgba(27, 28, 32, 0.10)',
        'soft-md': '0 8px 24px rgba(27, 28, 32, 0.12)',
        'soft-lg': '0 12px 28px rgba(27, 28, 32, 0.14)',
        'primary': '0 8px 24px rgba(214, 58, 53, 0.18)',
        'secondary': '0 8px 24px rgba(232, 197, 42, 0.18)',
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
