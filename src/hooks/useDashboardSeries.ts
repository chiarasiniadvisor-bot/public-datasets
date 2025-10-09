// src/hooks/useDashboardSeries.ts
// Centralized hook to extract chart series from pre-calculated datasets

import { useDatasets } from './useDatasets';
import { hasData } from '@/lib/dataAdapters';

import { Datum } from '@/lib/dataService';

export type DashboardSeries = {
  // Distributions
  sourceDistribution: Datum[];
  profileYearDistribution: Datum[];
  birthYearDistribution: Datum[];
  universitiesDistribution: Datum[];
  coursesDistribution: Datum[];
  paidCoursesDistribution: Datum[];
  studentListsDistribution: Datum[];
  
  // Webinar metrics
  webinarConversions: Datum[];
  registeredWebinar: Datum[];
  crmWebinar: Datum[];
  
  // Simulation
  registeredWithSimulation: Datum[];
  crmWithSimulation: Datum[];
  
  // Loading state
  loading: boolean;
  error: string | null;
};

/**
 * Hook to extract all chart series from pre-calculated datasets.
 * Returns normalized series ready for charts.
 */
export function useDashboardSeries(scope: "all" | "lista6" | "corsisti" | "paganti" = "all"): DashboardSeries {
  const { comprehensive, loading, error } = useDatasets({ scope });

  // Sorgenti di acquisizione dai dati normalizzati (mantieni compatibilità con vecchio hook)
  const sourceDistribution = comprehensive?.dsCorsisti?.fonte ?? [];
  const universitiesDistribution = comprehensive?.dsCorsisti?.atenei ?? [];
  const birthYearDistribution = comprehensive?.dsProfilo?.annoNascita ?? [];
  const coursesDistribution = comprehensive?.dsCorsisti?.corsi ?? [];
  const paidCoursesDistribution = comprehensive?.dsCorsisti?.corsiPagati ?? [];
  const studentListsDistribution = comprehensive?.dsCorsisti?.liste ?? [];
  
  // Profiling data
  const profileYearDistribution = comprehensive?.dsProfilo?.annoProfilazione ?? [];
  
  // Webinar data
  const webinarConversions = comprehensive?.dsWebinar?.webinarConversions ?? [];
  const registeredWebinar = comprehensive?.dsWebinar?.iscrittiWebinar ?? [];
  const crmWebinar = comprehensive?.dsUtentiCRM?.utentiCrmWebinar ?? [];
  
  // Simulation data
  const registeredWithSimulation = comprehensive?.dsUtentiCRM?.utentiCrmNonCorsisti ?? [];
  const crmWithSimulation = comprehensive?.dsUtentiCRM?.utentiCrmNonCorsistiInTarget ?? [];

  // Telemetry minima in DEV
  if (import.meta.env.DEV) {
    console.log('[TEST] comprehensive normalized datasets result:', {
      source: sourceDistribution.length,
      universities: universitiesDistribution.length,
      birthYear: birthYearDistribution.length,
      courses: coursesDistribution.length,
      paidCourses: paidCoursesDistribution.length,
      profileYear: profileYearDistribution.length,
      webinar: webinarConversions.length,
      iscrittiWebinar: registeredWebinar.length,
      crmWebinar: crmWebinar.length,
    });
  }

  return {
    sourceDistribution,
    profileYearDistribution,
    birthYearDistribution,
    universitiesDistribution,
    coursesDistribution,
    paidCoursesDistribution,
    studentListsDistribution,
    webinarConversions,
    registeredWebinar,
    crmWebinar,
    registeredWithSimulation,
    crmWithSimulation,
    loading,
    error,
  };
}

/**
 * Helper to check if any series has data
 */
export function useHasDashboardData(): boolean {
  const series = useDashboardSeries();
  return (
    hasData(series.sourceDistribution) ||
    hasData(series.universitiesDistribution) ||
    hasData(series.profileYearDistribution) ||
    hasData(series.birthYearDistribution)
  );
}
