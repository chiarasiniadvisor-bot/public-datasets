// src/lib/dataAdapters.ts
// Reusable adapters to normalize generic arrays from pre-calculated datasets

/**
 * Picks the most sensible string field for a label from an object.
 * Tries common field names in order of priority.
 */
export function pickLabelField(o: any): string | null {
  const candidates = [
    'label',
    'fonte',
    'source',
    'name',
    'ateneo',
    'anno',
    'year',
    'categoria',
    'channel',
    'tipo',
    'type',
    'step'
  ];
  return candidates.find(k => typeof o?.[k] === 'string') ?? null;
}

/**
 * Picks the first numeric field that makes sense as a value.
 * Excludes common non-value fields like id, percent, ratio.
 */
export function pickValueField(o: any): string | null {
  if (!o || typeof o !== 'object') return null;
  const bad = new Set(['id', 'idx', 'percent', 'percentage', 'ratio', 'rate']);
  for (const [k, v] of Object.entries(o)) {
    if (!bad.has(k) && typeof v === 'number' && Number.isFinite(v)) return k;
  }
  return null;
}

/**
 * Converts a generic array to { label: string; value: number }[] format.
 * Defensive: returns empty array if fields not found.
 */
export function toLabelValueSeries(arr: any[]): { label: string; value: number }[] {
  if (!Array.isArray(arr)) return [];
  const first = arr[0];
  if (!first) return [];
  
  const lf = pickLabelField(first);
  const vf = pickValueField(first);
  
  if (!lf || !vf) {
    console.debug('[dataAdapter] toLabelValueSeries: could not find label/value fields', { first });
    return [];
  }
  
  return arr
    .map((r) => ({ 
      label: String(r[lf]), 
      value: Number(r[vf]) 
    }))
    .filter(d => d.label && Number.isFinite(d.value));
}

/**
 * Converts a generic array to { x: string|number; y: number }[] format.
 * Useful for time series or categorical charts.
 */
export function toXYSeries(arr: any[]): { x: string | number; y: number }[] {
  if (!Array.isArray(arr)) return [];
  const first = arr[0];
  if (!first) return [];
  
  const lf = pickLabelField(first) ?? 'x';
  const vf = pickValueField(first) ?? 'y';
  
  return arr
    .map((r) => ({ 
      x: (r[lf] ?? r.x ?? r.year ?? r.anno), 
      y: Number(r[vf] ?? r.y ?? r.value ?? r.count) 
    }))
    .filter(d => (d.x !== undefined && d.x !== null) && Number.isFinite(d.y));
}

/**
 * Utility to check if a series has data
 */
export function hasData(series: any[]): boolean {
  return Array.isArray(series) && series.length > 0;
}
