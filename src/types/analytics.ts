export interface AnalyticsData {
  event_name: string;
  event_count: number;
  total_value: number;
  avg_value: number;
  campaign_source: string;
  campaign_medium: string;
  event_date: string;
}

export interface CampaignStats {
  total_events: number;
  total_conversions: number;
  total_value: number;
  avg_cpa: number;
  conversion_rate: number;
  top_sources: TopSource[];
}

export interface TopSource {
  source: string;
  events: number;
  value: number;
}

export interface AnalyticsFilters {
  period: string;
  event: string;
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData[];
  period: string;
  total_events: number;
  message?: string;
  error?: string;
}