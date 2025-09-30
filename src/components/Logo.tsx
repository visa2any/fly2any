import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'white' | 'compact' | 'logo-only';
  headingLevel?: 'h1' | 'div';
  className?: string;
  clickable?: boolean;
  href?: string;
}

export default function Logo({
  size = 'md',
  showText = true,
  variant = 'default',
  headingLevel = 'h1',
  className = '',
  clickable = true,
  href = '/'
}: LogoProps) {
  const sizes = {
    sm: { logo: 96, text: 32, tagline: 16 },
    md: { logo: 144, text: 48, tagline: 20 },
    lg: { logo: 192, text: 64, tagline: 24 },
    xl: { logo: 288, text: 96, tagline: 32 }
  };

  const currentSize = sizes[size];
  const isWhite = variant === 'white';
  const isCompact = variant === 'compact';
  const isLogoOnly = variant === 'logo-only';
  const HeadingTag = headingLevel === 'h1' ? 'h1' : 'div';

  // Se for logo-only, force showText = false
  const shouldShowText = isLogoOnly ? false : showText;

  const logoContent = (
    <div className={`flex items-center ${shouldShowText ? 'gap-3' : 'gap-0'} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200' : ''}`}>
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
          alt="Fly2Any - Voltar ao Início"
          fill
          sizes="(max-width: 768px) 150px, (max-width: 1200px) 200px, 250px"
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
        </div>
      )}
    </div>
  );

  // If clickable, wrap in Link, otherwise return plain content
  if (clickable) {
    return (
      <Link href={href} className={className} title="Fly2Any - Voltar ao Início">
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={className}>
      {logoContent}
    </div>
  );
}