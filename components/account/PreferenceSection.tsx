import React from 'react';
import { cn } from '@/lib/utils';

interface PreferenceSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export const PreferenceSection: React.FC<PreferenceSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-200 p-6', className)}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};
