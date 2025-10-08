// src/hooks/useDashboardSeries.ts
// Centralized hook to extract chart series from pre-calculated datasets

import { useDatasets } from './useDatasets';
import { toLabelValueSeries, toXYSeries, hasData } from '@/lib/dataAdapters';

export type DashboardSeries = {
  // Distributions
  sourceDistribution: { label: string; value: number }[];
  profileYearDistribution: { x: string | number; y: number }[];
  birthYearDistribution: { x: string | number; y: number }[];
  universitiesDistribution: { label: string; value: number }[];
  coursesDistribution: { label: string; value: number }[];
  paidCoursesDistribution: { label: string; value: number }[];
  studentListsDistribution: { label: string; value: number }[];
  
  // Webinar metrics
  webinarConversions: { label: string; value: number }[];
  registeredWebinar: { label: string; value: number }[];
  crmWebinar: { label: string; value: number }[];
  
  // Simulation
  registeredWithSimulation: { label: string; value: number }[];
  crmWithSimulation: { label: string; value: number }[];
  
  // Loading state
  loading: boolean;
  error: string | null;
};

/**
 * Hook to extract all chart series from pre-calculated datasets.
 * Returns normalized series ready for charts.
 */
export function useDashboardSeries(scope: "all" | "lista6" | "corsisti" | "paganti" = "all"): DashboardSeries {
  const { data, loading, error } = useDatasets({ scope, topN: 999, listMode: "id" });

  // Extract pre-calculated data
  const precalc = (data as any) ?? {};

  // Log available keys in dev mode
  if (import.meta.env.DEV && precalc && Object.keys(precalc).length > 0) {
    console.debug('[precalc keys]', Object.keys(precalc));
  }

  // Convert to normalized series
  const sourceDistribution = toLabelValueSeries(precalc.distribuzione_fonte ?? []);
  const profileYearDistribution = toXYSeries(precalc.distribuzione_anno_profilazione ?? []);
  const birthYearDistribution = toXYSeries(precalc.distribuzione_anno_nascita ?? []);
  const universitiesDistribution = toLabelValueSeries(precalc.distribuzione_atenei ?? []);
  const coursesDistribution = toLabelValueSeries(precalc.distribuzione_corsi ?? []);
  const paidCoursesDistribution = toLabelValueSeries(precalc.distribuzione_corsi_pagati ?? []);
  const studentListsDistribution = toLabelValueSeries(precalc.distribuzione_liste_corsisti ?? []);
  
  const webinarConversions = toLabelValueSeries(precalc.webinar_conversions ?? []);
  const registeredWebinar = toLabelValueSeries(precalc.iscritti_webinar ?? []);
  const crmWebinar = toLabelValueSeries(precalc.utenti_crm_webinar ?? []);
  
  const registeredWithSimulation = toLabelValueSeries(precalc.iscritti_con_simulazione ?? []);
  const crmWithSimulation = toLabelValueSeries(precalc.utenti_crm_con_simulazione ?? []);

  // Log series lengths in dev mode
  if (import.meta.env.DEV) {
    console.debug('[series]', {
      fonte: sourceDistribution.length,
      profiloAnno: profileYearDistribution.length,
      nascitaAnno: birthYearDistribution.length,
      atenei: universitiesDistribution.length,
      corsi: coursesDistribution.length,
      corsiPagati: paidCoursesDistribution.length,
      listeStudenti: studentListsDistribution.length,
      webinarConv: webinarConversions.length,
      webinarIscritti: registeredWebinar.length,
      webinarCrm: crmWebinar.length,
      simIscritti: registeredWithSimulation.length,
      simCrm: crmWithSimulation.length,
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
