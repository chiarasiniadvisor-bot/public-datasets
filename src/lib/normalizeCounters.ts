// src/lib/normalizeCounters.ts
export type Counters = {
  leadsTot: number
  iscrittiTot: number
  profiloTot: number
  corsistiTot: number
  pagantiTot: number
}

const num = (v: any) =>
  typeof v === 'number' && !Number.isNaN(v) ? v : undefined

const pick = (...candidates: any[]) =>
  candidates.find(c => num(c) !== undefined) ?? 0

/**
 * Accetta dati raw o pre-calcolati e restituisce sempre tutte le chiavi attese.
 * Prova più percorsi comuni e fa fallback a 0.
 */
export function normalizeCounters(raw: any): Counters {
  const r = raw ?? {}

  return {
    leadsTot:    pick(r.leadsTot,    r.funnel?.totals?.leads,   r.funnel?.leads,   r.funnel?.leadsACRM),
    iscrittiTot: pick(r.iscrittiTot, r.funnel?.totals?.signup,  r.signupTot,       r.funnel?.iscrittiPiattaforma),
    profiloTot:  pick(r.profiloTot,  r.funnel?.totals?.profile, r.funnel?.profiloCompleto),
    corsistiTot: pick(r.corsistiTot, r.funnel?.totals?.course,  r.funnel?.corsisti),
    pagantiTot:  pick(r.pagantiTot,  r.funnel?.totals?.paid,    r.paidTot,         r.funnel?.paganti),
  }
}
