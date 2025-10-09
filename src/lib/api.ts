// src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE?.trim() || "https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json";
export const HISTORICAL_DATA_URL = import.meta.env.VITE_HISTORICAL_DATA_URL?.trim() || "https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json";

if (!API_BASE) {
  // Make this loud in console, but don't hard crash the app
  // Components will still render a friendly message
  console.error("[API] Missing VITE_API_BASE env");
}

async function fetchJson(url: string, init: RequestInit = {}) {
  // Cache busting: aggiungi timestamp in dev mode o preview
  let finalUrl = url;
  if (import.meta.env.DEV || import.meta.env.VITE_ENV_LABEL !== 'production') {
    const sep = url.includes("?") ? "&" : "?";
    finalUrl = `${url}${sep}v=${Date.now()}`;
  }

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
  console.log("[DATASETS] API_BASE:", API_BASE);
  return fetchJson(API_BASE);
}

export async function getHistorical() {
  if (!HISTORICAL_DATA_URL) {
    console.warn("[historical] VITE_HISTORICAL_DATA_URL not configured – skipping");
    return null; // IMPORTANT: don't throw
  }
  console.log("[TRENDS] HISTORICAL:", HISTORICAL_DATA_URL);
  return fetchJson(HISTORICAL_DATA_URL);
}
