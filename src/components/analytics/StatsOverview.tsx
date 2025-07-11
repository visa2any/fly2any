import React from 'react';
import { 
  EyeIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import { CampaignStats } from '@/types';
import { formatCurrency } from '@/utils';
import { StatsCard } from './StatsCard';

interface StatsOverviewProps {
  stats: CampaignStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statsConfig = [
    {
      title: 'Total de Eventos',
      value: stats.total_events.toLocaleString(),
      icon: <EyeIcon className="w-5 h-5" />,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Conversões',
      value: stats.total_conversions.toLocaleString(),
      icon: <ArrowTrendingUpIcon className="w-5 h-5" />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Valor Total',
      value: formatCurrency(stats.total_value),
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
      iconBgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'CPA Médio',
      value: formatCurrency(stats.avg_cpa),
      icon: <ChartBarIcon className="w-5 h-5" />,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats.conversion_rate.toFixed(2)}%`,
      icon: <ArrowTrendingUpIcon className="w-5 h-5" />,
      iconBgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statsConfig.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};