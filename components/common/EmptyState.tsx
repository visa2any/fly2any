'use client';

import { Plane, Search, Calendar, MapPin, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  icon?: React.ReactNode | string;
  title: string;
  message: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  suggestions?: string[];
  className?: string;
  variant?: 'default' | 'search' | 'filter' | 'empty';
}

const defaultIcons: Record<string, React.ReactNode> = {
  default: <Plane className="w-20 h-20" />,
  search: <Search className="w-20 h-20" />,
  filter: <Filter className="w-20 h-20" />,
  empty: <Sparkles className="w-20 h-20" />,
};

export function EmptyState({
  icon,
  title,
  message,
  action,
  secondaryAction,
  suggestions,
  className = '',
  variant = 'default',
}: EmptyStateProps) {
  // Determine which icon to use
  const renderIcon = () => {
    if (typeof icon === 'string') {
      // If icon is a string emoji
      return <div className="text-8xl mb-6 animate-bounce-gentle">{icon}</div>;
    } else if (icon) {
      // If icon is a React node
      return <div className="text-gray-400 mb-6">{icon}</div>;
    } else {
      // Use default icon based on variant
      return <div className="text-gray-400 mb-6">{defaultIcons[variant]}</div>;
    }
  };

  return (
    <div className={`text-center py-16 px-4 ${className}`}>
      <div className="max-w-2xl mx-auto">
        {/* Icon */}
        <div className="flex justify-center">{renderIcon()}</div>

        {/* Title */}
        <h3 className="text-3xl font-bold text-gray-900 mb-4">{title}</h3>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">{message}</p>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-left max-w-lg mx-auto">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Try these suggestions:
            </h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-blue-800 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                size="lg"
                icon={action.icon}
                className="min-w-[200px]"
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
                size="lg"
                icon={secondaryAction.icon}
                className="min-w-[200px]"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Preset empty states for common scenarios
 */

export function NoFlightsFound({ onModifySearch }: { onModifySearch: () => void }) {
  return (
    <EmptyState
      icon="✈️"
      title="No Flights Found"
      message="We couldn't find any flights matching your search criteria. Try adjusting your dates or destinations for better results."
      variant="search"
      suggestions={[
        'Try different dates - weekdays are often cheaper',
        'Consider nearby airports for more options',
        'Remove the "Direct flights only" filter',
        'Increase your flexible date range',
        'Try searching one-way instead of round-trip',
      ]}
      action={{
        label: 'Modify Search',
        onClick: onModifySearch,
        icon: <Search className="w-5 h-5" />,
      }}
    />
  );
}

export function NoSavedSearches({ onCreateSearch }: { onCreateSearch: () => void }) {
  return (
    <EmptyState
      icon="🔖"
      title="No Saved Searches Yet"
      message="Save your frequent searches to quickly access them later and get price alerts when deals become available."
      variant="empty"
      action={{
        label: 'Search Flights',
        onClick: onCreateSearch,
        icon: <Search className="w-5 h-5" />,
      }}
    />
  );
}

export function NoPriceAlerts({ onSetupAlert }: { onSetupAlert: () => void }) {
  return (
    <EmptyState
      icon="🔔"
      title="No Price Alerts Active"
      message="Set up price alerts to get notified when flight prices drop for your favorite routes."
      variant="empty"
      action={{
        label: 'Create Price Alert',
        onClick: onSetupAlert,
        icon: <Sparkles className="w-5 h-5" />,
      }}
    />
  );
}

export function NoResults({
  title = 'No Results',
  message = 'No items found matching your criteria.',
  onClearFilters,
}: {
  title?: string;
  message?: string;
  onClearFilters?: () => void;
}) {
  return (
    <EmptyState
      icon={<Filter className="w-20 h-20" />}
      title={title}
      message={message}
      variant="filter"
      action={
        onClearFilters
          ? {
              label: 'Clear Filters',
              onClick: onClearFilters,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}
