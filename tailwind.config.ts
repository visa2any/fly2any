import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#0077E6', // Reduced saturation from #0087FF for less eye strain
          600: '#006FDB',
          700: '#0057B7',
          800: '#003F93',
          900: '#00276F',
        },
        secondary: {
          50: '#FFF4E6',
          100: '#FFE9CC',
          200: '#FFD399',
          300: '#FFBD66',
          400: '#FFA733',
          500: '#FF9100',
          600: '#DB7A00',
          700: '#B76300',
          800: '#934C00',
          900: '#6F3500',
        },
        neutral: {
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
        'primary': '0 10px 25px -5px rgba(0, 119, 230, 0.3)', // Updated to match new primary-500 color
        'secondary': '0 10px 25px -5px rgba(255, 145, 0, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
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
      },
    },
  },
  plugins: [],
};
export default config;
