import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  message: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  actionButton 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
      <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {actionButton && actionButton}
    </div>
  );
};