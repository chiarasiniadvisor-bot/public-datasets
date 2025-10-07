// src/lib/config.ts
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  "https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json";

// Se usi dati storici separati, tieni/centralizza qui l'URL (fallback raw GitHub):
export const HISTORICAL_DATA_URL =
  import.meta.env.VITE_HISTORICAL_DATA_URL ??
  "https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/historical-data.json";
