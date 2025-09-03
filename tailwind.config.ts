import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			// Modern 2025 Color System
  			primary: {
  				50: '#F0F9FF',
  				100: '#E0F2FE',
  				200: '#BAE6FD',
  				300: '#7DD3FC',
  				400: '#38BDF8',
  				500: '#0EA5E9',
  				600: '#0284C7',
  				700: '#0369A1',
  				800: '#075985',
  				900: '#0C4A6E',
  				950: '#082F49'
  			},
  			accent: {
  				50: '#FFF7ED',
  				100: '#FFEDD5',
  				200: '#FED7AA',
  				300: '#FDBA74',
  				400: '#FB923C',
  				500: '#F97316',
  				600: '#EA580C',
  				700: '#C2410C',
  				800: '#9A3412',
  				900: '#7C2D12',
  				950: '#431407'
  			},
  			neutral: {
  				50: '#FAFAFA',
  				100: '#F5F5F5',
  				200: '#E5E5E5',
  				300: '#D4D4D4',
  				400: '#A3A3A3',
  				500: '#737373',
  				600: '#525252',
  				700: '#404040',
  				800: '#262626',
  				900: '#171717',
  				950: '#0A0A0A'
  			},
  			success: {
  				50: '#F0FDF4',
  				100: '#DCFCE7',
  				200: '#BBF7D0',
  				300: '#86EFAC',
  				400: '#4ADE80',
  				500: '#22C55E',
  				600: '#16A34A',
  				700: '#15803D',
  				800: '#166534',
  				900: '#14532D'
  			},
  			warning: {
  				50: '#FFFBEB',
  				100: '#FEF3C7',
  				200: '#FDE68A',
  				300: '#FCD34D',
  				400: '#FBBF24',
  				500: '#F59E0B',
  				600: '#D97706',
  				700: '#B45309',
  				800: '#92400E',
  				900: '#78350F'
  			},
  			// Subtle gradient colors for 2025
  			gradient: {
  				primary: {
  					from: '#0EA5E9',
  					via: '#38BDF8',
  					to: '#7DD3FC'
  				},
  				accent: {
  					from: '#F97316',
  					via: '#FB923C',
  					to: '#FDBA74'
  				},
  				subtle: {
  					from: '#F0F9FF',
  					via: '#E0F2FE',
  					to: '#BAE6FD'
  				},
  				warm: {
  					from: '#FFF7ED',
  					via: '#FFEDD5',
  					to: '#FED7AA'
  				}
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'Poppins',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		boxShadow: {
  			// Neumorphic shadows for 2025
  			'neu-sm': '2px 2px 5px rgba(0,0,0,0.05), -2px -2px 5px rgba(255,255,255,0.5)',
  			'neu-md': '5px 5px 10px rgba(0,0,0,0.08), -5px -5px 10px rgba(255,255,255,0.7)',
  			'neu-lg': '10px 10px 20px rgba(0,0,0,0.1), -10px -10px 20px rgba(255,255,255,0.8)',
  			'neu-inset': 'inset 2px 2px 5px rgba(0,0,0,0.08), inset -2px -2px 5px rgba(255,255,255,0.5)',
  			'neu-inset-lg': 'inset 5px 5px 10px rgba(0,0,0,0.1), inset -5px -5px 10px rgba(255,255,255,0.7)',
  			// Modern glow effects
  			'glow-sm': '0 2px 10px rgba(14, 165, 233, 0.15)',
  			'glow-md': '0 4px 20px rgba(14, 165, 233, 0.2)',
  			'glow-lg': '0 8px 40px rgba(14, 165, 233, 0.25)',
  			'glow-accent': '0 4px 20px rgba(249, 115, 22, 0.2)',
  			// Soft shadows
  			'soft-sm': '0 2px 8px rgba(0,0,0,0.04)',
  			'soft-md': '0 4px 16px rgba(0,0,0,0.06)',
  			'soft-lg': '0 8px 32px rgba(0,0,0,0.08)',
  			'soft-xl': '0 16px 48px rgba(0,0,0,0.1)'
  		},
  		backdropBlur: {
  			xs: '2px',
  			sm: '4px',
  			md: '8px',
  			lg: '16px',
  			xl: '24px',
  			'2xl': '40px'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;