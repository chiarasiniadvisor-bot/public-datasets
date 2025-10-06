// src/lib/brevoDatasets.ts
// Local datasets from Brevo API integration

export const API_BASE =
  "https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json";

export type Scope = "all" | "lista6" | "corsisti" | "paganti";
export type ListMode = "id" | "label" | "group";

export type Contact = {
  id: number;
  attributes: {
    [key: string]: any;
  };
  listIds: number[];
  email?: string; // Will be removed by cleaning
};

export type BrevoData = {
  generatedAt: string;
  totalContacts: number;
  contacts: Contact[];
};

export type Datasets = {
  funnel: { step: string; value: number }[];
  iscritti_con_simulazione: { name: string; value: number }[];
  utenti_crm_con_simulazione?: { name: string; value: number }[];
  distribuzione_atenei: { name: string; value: number }[];
  distribuzione_anno_profilazione: { name: string; value: number }[];
  distribuzione_fonte: { name: string; value: number }[];
  distribuzione_anno_nascita: { name: string; value: number }[];
  distribuzione_liste_corsisti: { name: string; value: number }[];
  distribuzione_corsi: { name: string; value: number }[];
  distribuzione_corsi_pagati: { name: string; value: number }[];
  gestiti_trattativa: { name: string; value: number }[];
};

// Load datasets from local JSON file
let cachedData: BrevoData | null = null;

export async function fetchDatasets(params: {
  scope?: Scope;
  topN?: number;
  minCountAltro?: number;
  listMode?: ListMode;
} = {}): Promise<Datasets> {
  // Load data from GitHub Raw datasets.json
  if (!cachedData) {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error(`Failed to load datasets: ${response.status}`);
    cachedData = await response.json();
  }

  return processBrevoData(cachedData, params);
}

function processBrevoData(data: BrevoData, params: any): Datasets {
  const { contacts } = data;
  
  // Process contacts to create datasets
  const datasets: Datasets = {
    funnel: [],
    iscritti_con_simulazione: [],
    distribuzione_atenei: [],
    distribuzione_anno_profilazione: [],
    distribuzione_fonte: [],
    distribuzione_anno_nascita: [],
    distribuzione_liste_corsisti: [],
    distribuzione_corsi: [],
    distribuzione_corsi_pagati: [],
    gestiti_trattativa: []
  };

  // Process atenei distribution
  const ateneiCount: { [key: string]: number } = {};
  const annoNascitaCount: { [key: string]: number } = {};
  const corsiCount: { [key: string]: number } = {};
  const listeCount: { [key: string]: number } = {};

  contacts.forEach(contact => {
    // Count atenei
    if (contact.attributes.ATENEO) {
      ateneiCount[contact.attributes.ATENEO] = (ateneiCount[contact.attributes.ATENEO] || 0) + 1;
    }

    // Count anno nascita
    if (contact.attributes.ANNO) {
      annoNascitaCount[contact.attributes.ANNO] = (annoNascitaCount[contact.attributes.ANNO] || 0) + 1;
    }

    // Count corsi
    if (contact.attributes.CORSO) {
      corsiCount[contact.attributes.CORSO] = (corsiCount[contact.attributes.CORSO] || 0) + 1;
    }

    // Count liste
    contact.listIds.forEach(listId => {
      listeCount[listId.toString()] = (listeCount[listId.toString()] || 0) + 1;
    });
  });

  // Convert to arrays
  datasets.distribuzione_atenei = Object.entries(ateneiCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  datasets.distribuzione_anno_nascita = Object.entries(annoNascitaCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  datasets.distribuzione_corsi = Object.entries(corsiCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  datasets.distribuzione_liste_corsisti = Object.entries(listeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Add total contacts
  datasets.iscritti_con_simulazione = [
    { name: "Totale Contatti", value: data.totalContacts }
  ];

  return datasets;
}

/* ===== DELTA TAB ===== */
export type DeltaItem = {
  metric: string;
  current: number | null;
  previous: number | null;
  rate_current: number | null;   // 0..1
  rate_previous: number | null;  // 0..1
  delta_abs: number | null;
  delta_pct: number | null;      // 0..1
  delta_pp: number | null;       // punti percentuali
};

export type DeltaResponse = {
  week_current: string | null;   // es. "2025-10-01"
  week_previous: string | null;  // es. "2025-09-24"
  items: DeltaItem[];
};

export async function fetchDelta(): Promise<DeltaResponse> {
  const url = `${API_BASE}?tab=delta&nocache=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch delta failed ${res.status}`);
  return (await res.json()) as DeltaResponse;
}

/* ===== DELTA TREND (multi-week) ===== */
export type DeltaTrendSeries = {
  metric: string;
  values: Array<number | null>; // per settimana
  rates: Array<number | null>;  // 0..1 per settimana
};

export type DeltaTrendResponse = {
  weeks: string[];           // es. ["2025-09-24","2025-10-01",...]
  series: DeltaTrendSeries[]; // uno per metrica
};

export async function fetchDeltaTrend(): Promise<DeltaTrendResponse> {
  const url = `${API_BASE}?tab=delta_trend&nocache=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch delta_trend failed ${res.status}`);
  const json = await res.json();
  // Hardening minima
  return {
    weeks: Array.isArray(json?.weeks) ? json.weeks : [],
    series: Array.isArray(json?.series) ? json.series : [],
  };
}
