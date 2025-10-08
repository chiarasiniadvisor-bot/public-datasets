// src/lib/adapters/datasetsAdapter.ts
// Canonical adapter to normalize datasets.json regardless of shape variations

import { normalizeCounters, type Counters } from "../normalizeCounters";

export function pickNumber(n: unknown): number {
  const v = typeof n === "string" ? Number(n) : (n as number);
  return Number.isFinite(v) ? v : 0;
}

export type NormalizedDatasets = {
  funnel: {
    leads: number;
    iscritti: number;
    profilo: number;
    corsisti: number;
    paganti: number;
  };
  // Counters with *Tot naming convention for backward compatibility
  counters: Counters;
  // Add what Trends needs later (empty for now)
  trends?: any;
};

/**
 * Adapts raw datasets.json to a stable, normalized shape.
 * Never throws - returns 0 for missing metrics.
 * Priority order:
 * 1) raw.preCalculated[0]?.{metric}
 * 2) raw.values?.funnel?.{metric}
 * 3) Common fallbacks (totalLeads, registered, profiled, students, paying)
 */
export function adaptDatasets(raw: any): NormalizedDatasets {
  console.debug("[ADAPTER] input raw:", raw ? "present" : "missing");
  
  const p0 = raw?.preCalculated?.[0] ?? {};
  const v  = raw?.values?.funnel ?? {};
  
  // Also check for direct funnel property (common in our backend)
  const f = raw?.funnel ?? {};

  const funnel = {
    leads:    pickNumber(
      p0.leads ?? p0.leadsACRM ?? 
      v.leads ?? v.leadsACRM ?? 
      f.leadsACRM ?? 
      p0.totalLeads ?? v.totalLeads
    ),
    iscritti: pickNumber(
      p0.iscritti ?? p0.iscrittiPiattaforma ?? 
      v.iscritti ?? v.iscrittiPiattaforma ?? 
      f.iscrittiPiattaforma ?? 
      v.registered ?? p0.registered
    ),
    profilo:  pickNumber(
      p0.profilo ?? p0.profiloCompleto ?? 
      v.profilo ?? v.profiloCompleto ?? 
      f.profiloCompleto ?? 
      v.profiled ?? p0.profiled
    ),
    corsisti: pickNumber(
      p0.corsisti ?? 
      v.corsisti ?? 
      f.corsisti ?? 
      v.students ?? p0.students
    ),
    paganti:  pickNumber(
      p0.paganti ?? 
      v.paganti ?? 
      f.paganti ?? 
      v.paying ?? p0.paying
    ),
  };

  console.debug("[ADAPTER] funnel =>", funnel);
  
  // Also normalize counters with *Tot naming convention
  const counters = normalizeCounters(raw);
  console.debug("[ADAPTER] counters =>", counters);
  
  return { funnel, counters };
}
