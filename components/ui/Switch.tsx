import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  className?: string;
  compact?: boolean; // Compact mode - no description, smaller layout
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, label, description, id, className, compact = false }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div className={cn(
        'flex gap-3',
        compact ? 'items-center' : 'items-start',
        className
      )}>
        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-20',
            compact ? 'h-5 w-9' : 'h-6 w-11',
            checked
              ? 'bg-primary-500 focus:ring-primary-300'
              : 'bg-gray-200 focus:ring-gray-300',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              compact ? 'h-4 w-4' : 'h-5 w-5',
              compact
                ? (checked ? 'translate-x-4' : 'translate-x-0.5')
                : (checked ? 'translate-x-5' : 'translate-x-0.5'),
              'mt-0.5'
            )}
          />
        </button>
        {(label || (!compact && description)) && (
          <div className="flex-1 min-w-0">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  'block font-medium text-gray-900',
                  compact ? 'text-xs' : 'text-sm',
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                )}
                onClick={!disabled ? handleClick : undefined}
              >
                {label}
              </label>
            )}
            {!compact && description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
