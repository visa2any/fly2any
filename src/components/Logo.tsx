import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'white' | 'compact' | 'logo-only';
  headingLevel?: 'h1' | 'div';
  className?: string;
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  variant = 'default', 
  headingLevel = 'h1',
  className = ''
}: LogoProps) {
  const sizes = {
    sm: { logo: 32, text: 16, tagline: 8 },
    md: { logo: 48, text: 24, tagline: 10 },
    lg: { logo: 64, text: 32, tagline: 12 },
    xl: { logo: 96, text: 48, tagline: 16 }
  };
  
  const currentSize = sizes[size];
  const isWhite = variant === 'white';
  const isCompact = variant === 'compact';
  const isLogoOnly = variant === 'logo-only';
  const HeadingTag = headingLevel === 'h1' ? 'h1' : 'div';

  // Se for logo-only, force showText = false
  const shouldShowText = isLogoOnly ? false : showText;

  return (
    <div className={`flex items-center ${shouldShowText ? 'gap-3' : 'gap-0'} ${className}`}>
      {/* Fly2Any Official Logo */}
      <div 
        className={`relative ${isCompact ? '' : 'drop-shadow-lg'}`}
        style={{
          width: `${currentSize.logo}px`,
          height: `${currentSize.logo * 0.4}px`, // Ajuste da proporção do logo
        }}
      >
        <Image
          src="/fly2any-logo.png"
          alt="Fly2Any - Sua ponte para o Brasil"
          fill
          className="object-contain"
          priority
          style={{
            filter: isWhite ? 'none' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))'
          }}
        />
      </div>

      {/* Typography - Only for shouldShowText */}
      {shouldShowText && !isCompact && (
        <div>
          <HeadingTag 
            className={`font-bold font-sans m-0 leading-tight tracking-tight ${
              isWhite 
                ? 'text-gray-800' 
                : 'text-white drop-shadow-md'
            }`}
            style={{
              fontSize: `${currentSize.text}px`,
            }}
          >
            <span className={isWhite ? 'text-blue-700' : 'text-blue-300'}>Fly</span>
            <span className={isWhite ? 'text-amber-500' : 'text-amber-300'}>2</span>
            <span className={isWhite ? 'text-gray-800' : 'text-white'}>Any</span>
          </HeadingTag>
          <p 
            className={`font-medium uppercase tracking-wider font-sans m-0 mt-0.5 ${
              isWhite 
                ? 'text-gray-500' 
                : 'text-blue-100'
            }`}
            style={{
              fontSize: `${currentSize.tagline}px`,
            }}
          >
            Sua ponte para o Brasil
          </p>
        </div>
      )}
    </div>
  );
}