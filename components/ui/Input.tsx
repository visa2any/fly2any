import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'h-11 px-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20';

    const stateStyles = error
      ? 'border-error text-error focus:border-error focus:ring-error'
      : 'border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500';

    const iconPaddingStyles = icon
      ? iconPosition === 'left'
        ? 'pl-11'
        : 'pr-11'
      : '';

    const classes = [
      baseStyles,
      stateStyles,
      iconPaddingStyles,
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input ref={ref} className={classes} {...props} />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
