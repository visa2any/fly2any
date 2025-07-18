import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Carregando...', 
  subMessage 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
        </div>
        <p className="mt-6 text-gray-700 font-medium text-lg">{message}</p>
        {subMessage && (
          <p className="mt-2 text-sm text-gray-500">{subMessage}</p>
        )}
      </div>
    </div>
  );
};