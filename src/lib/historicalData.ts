// Historical data management for weekly trends and deltas

import { HISTORICAL_DATA_URL } from "./config";

export type FunnelMetrics = {
  leadsACRM: number;
  iscrittiPiattaforma: number;
  profiloCompleto: number;
  corsisti: number;
  paganti: number;
};

export type DailySnapshot = {
  date: string;
  funnel: FunnelMetrics;
  totalContacts: number;
};

export type WeeklySnapshot = {
  week: string;
  date: string;
  funnel: FunnelMetrics;
  totalContacts: number;
};

export type HistoricalData = {
  weekly: WeeklySnapshot[];
  daily: DailySnapshot[];
};

export type DeltaItem = {
  metric: string;
  current: number | null;
  previous: number | null;
  rate_current: number | null;
  rate_previous: number | null;
  delta_abs: number | null;
  delta_pp: number | null;
};

export type DeltaData = {
  week_current: string;
  week_previous: string;
  items: DeltaItem[];
  trend: Array<{
    metric: string;
    points: Array<{
      date: string;
      value: number | null;
      rate: number | null;
    }>;
  }>;
};


let cachedHistoricalData: HistoricalData | null = null;

export async function fetchHistoricalData(): Promise<HistoricalData> {
  if (!cachedHistoricalData) {
    try {
      const response = await fetch(HISTORICAL_DATA_URL);
      if (!response.ok) {
        throw new Error(`Failed to load historical data: ${response.status}`);
      }
      cachedHistoricalData = await response.json();
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Return empty data structure if fetch fails
      cachedHistoricalData = { weekly: [], daily: [] };
    }
  }
  return cachedHistoricalData;
}

export function calculateDeltaData(historicalData: HistoricalData): DeltaData {
  const { weekly } = historicalData;
  
  if (weekly.length < 2) {
    return {
      week_current: '',
      week_previous: '',
      items: [],
      trend: []
    };
  }
  
  // Get last two weeks for delta calculation
  // Current week is the most recent, previous week is the one before
  // This ensures we always compare the last two available weeks
  const currentWeek = weekly[weekly.length - 1];
  const previousWeek = weekly[weekly.length - 2];
  
  const metrics = [
    'leadsACRM',
    'iscrittiPiattaforma', 
    'profiloCompleto',
    'corsisti',
    'paganti'
  ];
  
  const metricLabels = {
    leadsACRM: 'Leads a CRM',
    iscrittiPiattaforma: 'Iscritti alla Piattaforma',
    profiloCompleto: 'Profilo completo',
    corsisti: 'Corsisti',
    paganti: 'Clienti Paganti'
  };
  
  const items: DeltaItem[] = [];
  
  for (const metric of metrics) {
    const currentValue = currentWeek.funnel[metric as keyof FunnelMetrics];
    const previousValue = previousWeek.funnel[metric as keyof FunnelMetrics];
    
    // Calculate rates (as percentage of total contacts)
    const currentRate = currentWeek.totalContacts > 0 ? currentValue / currentWeek.totalContacts : 0;
    const previousRate = previousWeek.totalContacts > 0 ? previousValue / previousWeek.totalContacts : 0;
    
    // Calculate deltas
    const deltaAbs = currentValue - previousValue;
    const deltaPp = (currentRate - previousRate) * 100; // Convert to percentage points
    
    items.push({
      metric: metricLabels[metric as keyof typeof metricLabels],
      current: currentValue,
      previous: previousValue,
      rate_current: currentRate,
      rate_previous: previousRate,
      delta_abs: deltaAbs,
      delta_pp: deltaPp
    });
  }
  
  // Build trend data
  const trend = metrics.map(metric => ({
    metric: metricLabels[metric as keyof typeof metricLabels],
    points: weekly.map(week => ({
      date: week.week,
      value: week.funnel[metric as keyof FunnelMetrics],
      rate: week.totalContacts > 0 ? week.funnel[metric as keyof FunnelMetrics] / week.totalContacts : 0
    }))
  }));
  
  return {
    week_current: currentWeek.week,
    week_previous: previousWeek.week,
    items,
    trend
  };
}

export function getWeeklyTrendData(historicalData: HistoricalData): Array<{
  metric: string;
  points: Array<{
    date: string;
    value: number;
    rate: number;
  }>;
}> {
  const { weekly } = historicalData;
  
  if (weekly.length === 0) {
    return [];
  }
  
  const metrics = [
    'leadsACRM',
    'iscrittiPiattaforma', 
    'profiloCompleto',
    'corsisti',
    'paganti'
  ];
  
  const metricLabels = {
    leadsACRM: 'Leads a CRM',
    iscrittiPiattaforma: 'Iscritti alla Piattaforma',
    profiloCompleto: 'Profilo completo',
    corsisti: 'Corsisti',
    paganti: 'Clienti Paganti'
  };
  
  return metrics.map(metric => ({
    metric: metricLabels[metric as keyof typeof metricLabels],
    points: weekly.map(week => ({
      date: week.week,
      value: week.funnel[metric as keyof FunnelMetrics],
      rate: week.totalContacts > 0 ? week.funnel[metric as keyof FunnelMetrics] / week.totalContacts : 0
    }))
  }));
}
