import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'glass' | 'white';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  hover = false,
  className = '',
  onClick,
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variantStyles = {
    elevated: 'bg-white shadow-md hover:shadow-xl',
    outlined: 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg',
    glass: 'bg-white/70 backdrop-blur-md border border-white/30 shadow-lg',
    white: 'bg-white',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const hoverStyles = hover ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : '';

  const classes = [
    baseStyles,
    variantStyles[variant],
    paddingStyles[padding],
    hoverStyles,
    className,
  ].join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};
