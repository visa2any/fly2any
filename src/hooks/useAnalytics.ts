import React, { useState, useEffect, useCallback } from 'react';
import { AnalyticsData, CampaignStats, AnalyticsFilters } from '@/types';
import { calculateStats } from '@/utils';

export const useAnalytics = (filters: AnalyticsFilters) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        days: filters.period,
        ...(filters.event !== 'all' && { event: filters.event })
      });

      const response = await fetch(`/api/analytics/track?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data || []);
        setStats(calculateStats(data.data || []));
      } else {
        setError(data.error || 'Erro ao carregar dados');
        setAnalyticsData([]);
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setAnalyticsData([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filters.period, filters.event]);

  useEffect(() => {
    fetchAnalyticsData();
    
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Timeout: Dados não puderam ser carregados');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [fetchAnalyticsData, loading]);

  return {
    analyticsData,
    stats,
    loading,
    error,
    refetch: fetchAnalyticsData
  };
};