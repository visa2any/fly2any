'use client';

/**
 * FLY2ANY WORDMARK LOGO
 * Level-6 Ultra-Premium / Apple-Class
 *
 * Design: Lowercase startup style with uniform height letters
 * All characters contained within same visual height (no ascenders above baseline)
 */

interface LogoTextProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'solid' | 'white';
}

const sizeClasses = {
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
};

export function LogoText({ className = '', size = 'md', variant = 'gradient' }: LogoTextProps) {
  const colorClass = variant === 'white'
    ? 'text-white'
    : variant === 'solid'
    ? 'text-primary-500'
    : 'bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent';

  return (
    <span
      className={`
        font-bold tracking-wide
        ${sizeClasses[size]}
        ${colorClass}
        ${className}
      `}
      style={{
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        fontVariantCaps: 'all-small-caps',
        fontFeatureSettings: '"c2sc", "smcp"',
        letterSpacing: '0.02em',
      }}
      aria-label="fly2any"
    >
      fly2any
    </span>
  );
}

/**
 * SVG VERSION - Pixel-perfect uniform height wordmark
 * Uses custom letterforms with all characters at same height
 */
export function LogoTextSVG({
  className = '',
  width = 90,
  height = 20,
  variant = 'gradient',
}: {
  className?: string;
  width?: number;
  height?: number;
  variant?: 'gradient' | 'solid' | 'white';
}) {
  const id = `logo-grad-${Math.random().toString(36).slice(2, 7)}`;
  const fill = variant === 'gradient' ? `url(#${id})` : variant === 'white' ? '#fff' : '#E8423A';

  return (
    <svg
      viewBox="0 0 100 24"
      width={width}
      height={height}
      className={className}
      aria-label="fly2any"
    >
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8423A" />
            <stop offset="100%" stopColor="#D63B34" />
          </linearGradient>
        </defs>
      )}

      {/* Geometric uniform-height wordmark */}
      <text
        x="0"
        y="18"
        fill={fill}
        fontFamily="Inter, SF Pro Display, system-ui"
        fontSize="18"
        fontWeight="700"
        letterSpacing="0.5"
        textRendering="optimizeLegibility"
      >
        <tspan style={{ fontVariantCaps: 'all-small-caps' }}>fly2any</tspan>
      </text>
    </svg>
  );
}

export default LogoText;
