/**
 * FLY2ANY GLOBAL DESIGN SYSTEM
 * =============================
 * This is the single source of truth for all design tokens across the platform.
 * All components MUST use these values for consistency.
 *
 * Last updated: 2025-10-09
 * Version: 2.0.0 - Ultra-Compact Redesign
 */

// ============================================================================
// SPACING SYSTEM - Use ONLY these 6 values
// ============================================================================
export const spacing = {
  xs: '4px',    // Tiny gaps between inline elements
  sm: '8px',    // Small gaps, compact layouts
  md: '12px',   // Default spacing
  lg: '16px',   // Section spacing
  xl: '24px',   // Card spacing
  '2xl': '32px', // Page section spacing
} as const;

// Tailwind classes for consistent spacing
export const spacingClasses = {
  xs: 'p-1',      // 4px
  sm: 'p-2',      // 8px
  md: 'p-3',      // 12px
  lg: 'p-4',      // 16px
  xl: 'p-6',      // 24px
  '2xl': 'p-8',   // 32px
} as const;

// ============================================================================
// COLOR SYSTEM - Limited to 6 core colors + grayscale
// ============================================================================
export const colors = {
  // Primary actions (buttons, links, highlights)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#0087FF',   // Main primary
    600: '#006FDB',
    700: '#0055B8',
    800: '#003D8F',
    900: '#002B66',
  },

  // Success states (direct flights, confirmations)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#10B981',   // Main success
    600: '#059669',
    700: '#047857',
  },

  // Warning/Urgency (low seats, price alerts)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',   // Main warning
    600: '#D97706',
    700: '#B45309',
  },

  // Error/Critical (errors, cancellations)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',   // Main error
    600: '#DC2626',
    700: '#B91C1C',
  },

  // Grayscale (text, borders, backgrounds)
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

  // Secondary accent (return flights, highlights)
  secondary: {
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - Consistent font sizes
// ============================================================================
export const typography = {
  // Display (Hero sections)
  display: {
    size: '48px',
    lineHeight: '1.1',
    weight: '800',
  },

  // Headings
  h1: { size: '32px', lineHeight: '1.2', weight: '700' },
  h2: { size: '24px', lineHeight: '1.3', weight: '700' },
  h3: { size: '20px', lineHeight: '1.4', weight: '600' },
  h4: { size: '16px', lineHeight: '1.4', weight: '600' },

  // Body text
  body: {
    lg: { size: '16px', lineHeight: '1.5', weight: '400' },
    md: { size: '14px', lineHeight: '1.5', weight: '400' },
    sm: { size: '12px', lineHeight: '1.5', weight: '400' },
  },

  // Card-specific (COMPACT +10% for readability)
  card: {
    title: { size: '15px', lineHeight: '1.3', weight: '600' },   // +10% from 14px = 15.4 → 15px
    body: { size: '13px', lineHeight: '1.4', weight: '400' },    // +10% from 12px = 13.2 → 13px
    meta: { size: '11px', lineHeight: '1.4', weight: '500' },    // +10% from 10px = 11px
    price: { size: '22px', lineHeight: '1.2', weight: '700' },   // +10% from 20px = 22px
  },

  // Labels & captions
  label: { size: '12px', lineHeight: '1.4', weight: '500' },
  caption: { size: '10px', lineHeight: '1.3', weight: '400' },
} as const;

// ============================================================================
// COMPONENT DIMENSIONS - Compact card system (+10% for readability)
// ============================================================================
export const dimensions = {
  // Card heights (Compact but readable - +10% from ultra-compact)
  card: {
    header: '28px',      // Airline info (+10% from 24px for readability)
    route: '55px',       // Flight route display (+10% from 50px)
    footer: '36px',      // Price + button (+10% from 32px)
    collapsed: '165px',  // Total collapsed height (+10% from 150px = 165px)
    expanded: '440px',   // Expanded with details (+10% from 400px)
    padding: '14px',     // Internal padding (+10% from 12px = 13.2 → 14px)
    gap: '10px',         // Gap between elements (+10% from 8px = 8.8 → 10px)
  },

  // Header/Navigation
  header: {
    height: '70px',      // Global header (+10% from 64px = 70px)
    compact: '52px',     // Sticky compact header (+10% from 48px = 52px)
  },

  // Sidebar widths (Priceline-style)
  sidebar: {
    filters: '250px',    // Left filter sidebar (Priceline standard)
    insights: '320px',   // Right insights sidebar (Priceline standard)
  },

  // Buttons
  button: {
    sm: { height: '32px', padding: '8px 16px' },
    md: { height: '40px', padding: '10px 20px' },
    lg: { height: '48px', padding: '12px 24px' },
  },

  // Input fields
  input: {
    sm: { height: '32px', padding: '6px 12px' },
    md: { height: '40px', padding: '8px 16px' },
    lg: { height: '48px', padding: '10px 20px' },
  },
} as const;

// ============================================================================
// LAYOUT PATTERNS - Consistent grid systems (Priceline-style)
// ============================================================================
export const layout = {
  // Container constraints (Priceline-style)
  container: {
    maxWidth: '1440px',          // Maximum width for content (Priceline standard)
    padding: {
      desktop: '0 24px',         // 24px horizontal padding on desktop
      tablet: '0 20px',          // 20px horizontal padding on tablet
      mobile: '0 16px',          // 16px horizontal padding on mobile
    },
  },

  // Results page layout (flights, hotels, cars, etc.)
  results: {
    // Desktop: 3-column fixed-width layout (Priceline-style)
    // Left: 250px | Center: flex-1 (auto) | Right: 320px
    // Total sidebars: 570px, leaving center to grow/shrink
    desktop: 'lg:flex',           // Flexbox layout for precise control
    filters: 'lg:flex-none',      // Fixed 250px - Left sidebar (filters)
    main: 'lg:flex-1',            // Flexible - Main content (results)
    sidebar: 'lg:flex-none',      // Fixed 320px - Right sidebar (insights)

    // Tablet: Full width with floating filters
    tablet: 'grid-cols-1',

    // Mobile: Full width
    mobile: 'grid-cols-1',

    // Padding between content and container edges
    padding: {
      desktop: 'py-6',
      tablet: 'py-4',
      mobile: 'py-3',
    },

    // Gap between columns (Priceline-style)
    gap: '16px', // 16px between columns
  },

  // Search bar layout (should match container width)
  searchBar: {
    height: '56px',              // Compact one-line height
    padding: '8px 16px',         // Internal padding
    gap: '8px',                  // Gap between fields
  },

  // Card list layout
  cardList: {
    gap: '12px',         // Gap between cards (+50% from 8px for better organization)
    marginBottom: '12px', // Space below each card
  },
} as const;

// ============================================================================
// ANIMATION & TRANSITIONS
// ============================================================================
export const animation = {
  // Transition durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },

  // Easing functions
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
} as const;

// ============================================================================
// ELEVATION (Shadows)
// ============================================================================
export const elevation = {
  none: 'shadow-none',
  sm: 'shadow-sm',          // Subtle cards
  md: 'shadow-md',          // Default cards
  lg: 'shadow-lg',          // Hover states
  xl: 'shadow-xl',          // Modals
  '2xl': 'shadow-2xl',      // Overlays
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// ============================================================================
// DESIGN RULES - PLATFORM-WIDE STANDARDS
// ============================================================================
export const DESIGN_RULES = {
  // Rule 1: Card height MUST be <= 165px collapsed (+10% for readability)
  MAX_CARD_HEIGHT: 165,

  // Rule 2: Use ONLY the 6 spacing values (xs, sm, md, lg, xl, 2xl)
  SPACING_VALUES: Object.keys(spacing),

  // Rule 3: Maximum 2 badges per card
  MAX_BADGES_PER_CARD: 2,

  // Rule 4: No widgets above first result (show results immediately)
  WIDGETS_ABOVE_RESULTS: false,

  // Rule 5: Results page = 3 columns (filters + content + insights sidebar, like Priceline)
  MAX_RESULT_COLUMNS: 3,

  // Rule 6: Use ONLY 6 core colors (primary, success, warning, error, gray, secondary)
  CORE_COLORS: ['primary', 'success', 'warning', 'error', 'gray', 'secondary'],

  // Rule 7: Minimum 6 results visible on first screen (1080p)
  MIN_VISIBLE_RESULTS: 6,

  // Rule 8: Consistent typography scale (no custom font sizes)
  USE_TYPOGRAPHY_SCALE: true,

  // Rule 9: Mobile-first responsive (design for mobile, enhance for desktop)
  MOBILE_FIRST: true,

  // Rule 10: Performance budget (max component render time)
  MAX_RENDER_TIME_MS: 16, // 60fps
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get spacing class
 */
export function getSpacing(size: keyof typeof spacing): string {
  return spacing[size];
}

/**
 * Get color with opacity
 */
export function getColor(color: string, opacity?: number): string {
  if (opacity !== undefined) {
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  }
  return color;
}

/**
 * Validate card height (should be <= 150px)
 */
export function validateCardHeight(height: number): boolean {
  if (height > DESIGN_RULES.MAX_CARD_HEIGHT) {
    console.warn(
      `⚠️ Card height ${height}px exceeds maximum ${DESIGN_RULES.MAX_CARD_HEIGHT}px. ` +
      `Please redesign for compactness.`
    );
    return false;
  }
  return true;
}

/**
 * Get responsive padding
 */
export function getResponsivePadding(screenSize: 'mobile' | 'tablet' | 'desktop'): string {
  return layout.results.padding[screenSize];
}

// ============================================================================
// EXPORT ALL
// ============================================================================
export default {
  spacing,
  spacingClasses,
  colors,
  typography,
  dimensions,
  layout,
  animation,
  elevation,
  borderRadius,
  DESIGN_RULES,
  getSpacing,
  getColor,
  validateCardHeight,
  getResponsivePadding,
};
