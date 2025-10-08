// src/components/FunnelCounters.tsx
// Example component showing how to use useDatasets hook

import { useDatasets } from "@/hooks/useDatasets";

export function FunnelCounters() {
  const { counters, loading, error } = useDatasets({ scope: "all" });

  if (loading) {
    return <div className="text-sm text-muted-foreground">Caricamento counters...</div>;
  }

  if (error) {
    return <div className="text-sm text-destructive">Errore: {error}</div>;
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold">{counters.leadsTot.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Leads</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{counters.iscrittiTot.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Iscritti</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{counters.profiloTot.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Profilo</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{counters.corsistiTot.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Corsisti</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{counters.pagantiTot.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">Paganti</div>
      </div>
    </div>
  );
}
