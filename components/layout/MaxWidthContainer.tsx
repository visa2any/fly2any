/**
 * MaxWidthContainer - Global Layout Constraint Component
 * =======================================================
 * Ensures consistent 1600px max-width across ALL environments
 * (development, production, all browsers)
 *
 * Triple-redundancy approach:
 * 1. Tailwind 'container' class (configured in tailwind.config.ts)
 * 2. CSS class 'max-w-container' (defined in globals.css)
 * 3. Inline style fallback (for CSS optimization edge cases)
 *
 * This component MUST be used for all page-level content sections.
 */

interface MaxWidthContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

export function MaxWidthContainer({
  children,
  className = '',
  noPadding = false,
  style
}: MaxWidthContainerProps) {
  return (
    <div
      className={`
        container
        max-w-container
        mx-auto
        ${noPadding ? '' : 'px-6'}
        ${className}
      `.trim()}
      style={{
        maxWidth: '1600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
