// src/hooks/useDatasets.ts
import { useState, useEffect } from 'react';
import { fetchDatasets, getNormalizedDatasets, type Datasets } from '@/lib/dataService';
import { normalizeCounters, type Counters } from '@/lib/normalizeCounters';

export type DatasetsState = {
  data: Datasets | null;
  counters: Counters;
  loading: boolean;
  error: string | null;
};

/**
 * Hook centralizzato per caricare e normalizzare i datasets.
 * Ritorna dati, counters normalizzati, loading e error state.
 */
export function useDatasets(params?: {
  scope?: "all" | "lista6" | "corsisti" | "paganti";
  topN?: number;
  minCountAltro?: number;
  listMode?: "id" | "label" | "group";
}): DatasetsState {
  const [data, setData] = useState<Datasets | null>(null);
  const [counters, setCounters] = useState<Counters>({
    leadsTot: 0,
    iscrittiTot: 0,
    profiloTot: 0,
    corsistiTot: 0,
    pagantiTot: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch datasets
        const datasets = await fetchDatasets(params);

        if (!mounted) return;

        // Get normalized data (includes counters)
        const normalized = getNormalizedDatasets();

        if (normalized?.counters) {
          console.log('[useDatasets] counters loaded:', normalized.counters);
          setCounters(normalized.counters);
        } else {
          // Fallback: calculate counters from raw data
          console.warn('[useDatasets] normalized counters not available, calculating from raw');
          const rawCounters = normalizeCounters(datasets);
          setCounters(rawCounters);
        }

        setData(datasets);
      } catch (err: any) {
        console.error('[useDatasets] fetch failed:', err);
        if (mounted) {
          setError(err?.message || String(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params?.scope, params?.topN, params?.minCountAltro, params?.listMode]);

  return { data, counters, loading, error };
}
