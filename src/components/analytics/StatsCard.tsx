import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  formatter?: (value: number) => string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  formatter
}) => {
  const displayValue = typeof value === 'number' && formatter 
    ? formatter(value)
    : value;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
        </div>
        <div className={`${iconBgColor} p-2 rounded-lg`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};