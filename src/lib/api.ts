// src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE?.trim();
export const HISTORICAL_DATA_URL = import.meta.env.VITE_HISTORICAL_DATA_URL?.trim();

if (!API_BASE) {
  // Make this loud in console, but don't hard crash the app
  // Components will still render a friendly message
  console.error("[API] Missing VITE_API_BASE env");
}

async function fetchJson(url: string, init: RequestInit = {}) {
  // Add no-store and a cache buster to avoid stale/cached GitHub raw
  const sep = url.includes("?") ? "&" : "?";
  const bust = `${sep}ts=${Date.now()}`;
  const finalUrl = url + bust;

  const res = await fetch(finalUrl, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`HTTP ${res.status} on ${finalUrl}: ${text.slice(0,200)}`);
    (err as any).status = res.status;
    (err as any).url = finalUrl;
    throw err;
  }
  return res.json();
}

export async function getDatasets() {
  if (!API_BASE) throw new Error("VITE_API_BASE not configured");
  return fetchJson(API_BASE);
}

export async function getHistorical() {
  if (!HISTORICAL_DATA_URL) throw new Error("VITE_HISTORICAL_DATA_URL not configured");
  return fetchJson(HISTORICAL_DATA_URL);
}
