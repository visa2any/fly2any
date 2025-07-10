interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'white';
  headingLevel?: 'h1' | 'div';
}

export default function Logo({ size = 'md', showText = true, variant = 'default', headingLevel = 'h1' }: LogoProps) {
  const sizes = {
    sm: { container: 36, text: 20, tagline: 9 },
    md: { container: 48, text: 32, tagline: 11 },
    lg: { container: 64, text: 42, tagline: 13 }
  };
  
  const currentSize = sizes[size];
  const isWhite = variant === 'white';
  const HeadingTag = headingLevel === 'h1' ? 'h1' : 'div';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: showText ? '14px' : '0'
    }}>
      {/* SUPER CLEAR Airplane Icon */}
      <div style={{
        width: `${currentSize.container}px`,
        height: `${currentSize.container}px`,
        background: isWhite 
          ? 'white' 
          : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: isWhite 
          ? '0 4px 20px rgba(0,0,0,0.1)' 
          : '0 4px 20px rgba(30, 64, 175, 0.3)',
        border: isWhite ? '1px solid #e5e7eb' : 'none'
      }}>
        {/* CRYSTAL CLEAR AIRPLANE - Everyone will recognize this */}
        <svg 
          width={currentSize.container * 0.75} 
          height={currentSize.container * 0.75} 
          viewBox="0 0 24 24" 
          fill="none"
        >
          {/* Main airplane body - SUPER OBVIOUS */}
          <path 
            d="M12 2L14 8L22 10L22 12L14 10L12 18L16 20V22L12 21L8 22V20L12 18L10 10L2 12L2 10L10 8L12 2Z" 
            fill={isWhite ? '#1e40af' : 'white'}
            stroke={isWhite ? '#3b82f6' : 'rgba(255,255,255,0.3)'}
            strokeWidth="0.5"
          />
          
          {/* Wings - extra clear definition */}
          <path 
            d="M2 10L10 8L12 12L2 12V10Z" 
            fill={isWhite ? '#60a5fa' : 'rgba(255,255,255,0.9)'}
          />
          <path 
            d="M14 8L22 10V12L12 12L14 8Z" 
            fill={isWhite ? '#60a5fa' : 'rgba(255,255,255,0.9)'}
          />
          
          {/* Tail fins for extra clarity */}
          <path 
            d="M8 20L12 18L12 21L8 22V20Z" 
            fill={isWhite ? '#1e40af' : 'white'}
          />
          <path 
            d="M16 20V22L12 21L12 18L16 20Z" 
            fill={isWhite ? '#1e40af' : 'white'}
          />
        </svg>
      </div>

      {/* Clean Typography */}
      {showText && (
        <div>
          <HeadingTag style={{
            fontSize: `${currentSize.text}px`,
            fontWeight: '700',
            fontFamily: 'Poppins, sans-serif',
            margin: 0,
            lineHeight: 0.85,
            letterSpacing: '-0.025em',
            color: isWhite ? '#1f2937' : 'white',
            textShadow: isWhite ? 'none' : '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            <span style={{ color: isWhite ? '#1e40af' : '#60a5fa' }}>Fly</span>
            <span style={{ 
              color: isWhite ? '#f59e0b' : '#fbbf24',
              fontWeight: '800'
            }}>2</span>
            <span style={{ color: isWhite ? '#1f2937' : 'white' }}>Any</span>
          </HeadingTag>
          <p style={{
            color: isWhite ? '#6b7280' : 'rgba(219, 234, 254, 0.9)',
            fontSize: `${currentSize.tagline}px`,
            margin: '1px 0 0 0',
            fontWeight: '500',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif'
          }}>
            Sua ponte para o Brasil
          </p>
        </div>
      )}
    </div>
  );
}