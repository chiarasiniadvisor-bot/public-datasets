// src/lib/dataService.ts
// Robust data service with fallback and timeout handling

import { getDatasets as getApiDatasets, API_BASE } from "./api";
import { adaptDatasets, type NormalizedDatasets } from "./adapters/datasetsAdapter";

/* =========================
   COMPREHENSIVE DATASET NORMALIZER
   ========================= */

// Tipo standard per le serie
export type Datum = { label: string; value: number };

export type ComprehensiveNormalizedDatasets = {
  generatedAt?: string;
  totalContacts?: number;
  funnel: {
    leadsTot: number;
    iscrittiTot: number;
    profiloTot: number;
    corsistiTot: number;
    pagantiTot: number;
  };
  counters: Record<string, number>;
  // gruppi usati dalla UI - nomi allineati al JSON reale
  dsCorsisti: {
    atenei: Datum[];
    fonte: Datum[];
    corsi: Datum[];
    corsiPagati: Datum[];
    liste: Datum[];
    annoNascita: Datum[];
  };
  dsProfilo: {
    annoNascita: Datum[];
    annoProfilazione: Datum[];
  };
  dsWebinar: {
    iscrittiWebinar: Datum[];
    webinarConversions: Datum[];
  };
  dsUtentiCRM: {
    utentiCrmWebinar: Datum[];
    utentiCrmNonCorsisti: Datum[];
    utentiCrmNonCorsistiInTarget: Datum[];
    pctNonCorsistiInTarget: Datum[];
  };
};

export function normalizeComprehensiveDatasets(raw: any): ComprehensiveNormalizedDatasets {
  // toDatum "a prova di bomba" - gestisce array, oggetti e alias
  const toDatum = (data: any[] | object | undefined): Datum[] => {
    if (!data) return [];
    
    // Se è un oggetto (non array), converti con Object.entries
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.entries(data).map(([label, value]) => ({
        label: String(label),
        value: Number(value) || 0,
      })).filter(d => d.label.length > 0 && d.value > 0);
    }
    
    // Se è un array
    if (Array.isArray(data)) {
      return data.map((d) => ({
        // gestisci sia {label,value} sia {name,count} sia {key,total}
        label: (d.label ?? d.name ?? d.key ?? '').toString(),
        value: Number(d.value ?? d.count ?? d.total ?? 0) || 0,
      })).filter(d => d.label.length > 0 && d.value > 0)
        .sort((a, b) => b.value - a.value); // Sort desc per i grafici
    }
    
    return [];
  };

  // counters/funnel già calcolati server-side
  const funnel = {
    leadsTot: Number(raw?.funnel?.leads ?? raw?.totalContacts ?? 0),
    iscrittiTot: Number(raw?.funnel?.iscritti ?? 0),
    profiloTot: Number(raw?.funnel?.profilo ?? 0),
    corsistiTot: Number(raw?.funnel?.corsisti ?? 0),
    pagantiTot: Number(raw?.funnel?.paganti ?? 0),
  };

  const normalized = {
    generatedAt: raw?.generatedAt,
    totalContacts: Number(raw?.totalContacts ?? 0),
    funnel,
    counters: raw?.counters ?? {},

    dsCorsisti: {
      atenei: toDatum(raw?.distribuzione_atenei),
      fonte: toDatum(raw?.distribuzione_fonte),
      corsi: toDatum(raw?.distribuzione_corsi),
      corsiPagati: toDatum(raw?.distribuzione_corsi_pagati),
      liste: toDatum(raw?.distribuzione_liste_corsisti || raw?.distribuzione_liste_iscritti),
    },

    dsProfilo: {
      annoNascita: toDatum(raw?.distribuzione_anno_nascita),
      annoProfilazione: toDatum(raw?.distribuzione_anno_profilazione),
    },

    dsWebinar: {
      iscrittiWebinar: toDatum(raw?.iscritti_webinar),
      webinarConversions: toDatum(raw?.webinar_conversions),
    },

    dsUtentiCRM: {
      utentiCrmWebinar: toDatum(raw?.utenti_crm_webinar),
      utentiCrmNonCorsisti: toDatum(raw?.utenti_crm_non_corsisti),
      utentiCrmNonCorsistiInTarget: toDatum(raw?.utenti_crm_non_corsisti_in_target),
      pctNonCorsistiInTarget: toDatum(raw?.pct_non_corsisti_in_target),
    },
  };

  // Debug logging in dev mode
  if (import.meta.env.DEV) {
    console.debug("[DEBUG] dsCorsisti.distribuzione_fonte:", normalized.dsCorsisti.fonte.length);
    console.debug("[DEBUG] dsCorsisti.distribuzione_atenei:", normalized.dsCorsisti.atenei.length);
    console.debug("[DEBUG] dsProfilo.distribuzione_anno_nascita:", normalized.dsProfilo.annoNascita.length);
    
    // Esporta per ispezione in DEV
    (window as any).__ds = normalized;
  }

  return normalized;
}

export type Scope = "all" | "lista6" | "corsisti" | "paganti";
export type ListMode = "id" | "label" | "group";

export type Contact = {
  id: number;
  attributes: {
    [key: string]: any;
  };
  listIds: number[];
  email?: string;
};

export type BrevoData = {
  generatedAt: string;
  totalContacts: number;
  contacts: Contact[];
  // Pre-calculated metrics from backend
  funnel?: {
    leadsACRM: number;
    iscrittiPiattaforma: number;
    profiloCompleto: number;
    corsisti: number;
    paganti: number;
  };
  distribuzione_atenei?: Array<{ name: string; value: number }>;
  distribuzione_anno_profilazione?: Array<{ name: string; value: number }>;
  distribuzione_fonte?: Array<{ name: string; value: number }>;
  distribuzione_anno_nascita?: Array<{ name: string; value: number }>;
  distribuzione_corsi?: Array<{ name: string; value: number }>;
  distribuzione_corsi_pagati?: Array<{ name: string; value: number }>;
  distribuzione_liste_corsisti?: Array<{ name: string; value: number }>;
  webinar_conversions?: Array<{ name: string; value: number }>;
  iscritti_webinar?: Array<{ name: string; value: number }>;
  utenti_crm_webinar?: Array<{ name: string; value: number }>;
  utenti_crm_non_corsisti?: number;
  utenti_crm_non_corsisti_in_target?: number;
  pct_non_corsisti_in_target?: number;
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
  // Webinar metrics
  webinar_conversions: { name: string; value: number }[];
  iscritti_webinar: { name: string; value: number }[];
  utenti_crm_webinar: { name: string; value: number }[];
  utenti_crm_non_corsisti: number;
  utenti_crm_non_corsisti_in_target: number;
  pct_non_corsisti_in_target: number;
};

// Load datasets with robust fallback
let cachedData: BrevoData | null = null;
let cachedNormalized: NormalizedDatasets | null = null;
let cachedComprehensive: ComprehensiveNormalizedDatasets | null = null;
let lastFetchError: string | null = null;

export async function fetchDatasets(params: {
  scope?: Scope;
  topN?: number;
  minCountAltro?: number;
  listMode?: ListMode;
} = {}): Promise<Datasets> {
  // Load data with robust fallback
  if (!cachedData) {
    console.log("[datasets] 🔄 Starting data fetch...");
    console.log("[datasets] 📍 API_BASE:", API_BASE || "NOT SET");
    
    try {
      const raw = await getApiDatasets();
      cachedData = raw;
      lastFetchError = null;
      
      console.log("[PIPELINE] raw loaded", raw ? "ok" : "missing");
      
      // Normalize data through adapter
             cachedNormalized = adaptDatasets(raw);
             cachedComprehensive = normalizeComprehensiveDatasets(raw);
             
             console.log("[PIPELINE] normalized", cachedNormalized);
             console.log("[PIPELINE] comprehensive normalized", cachedComprehensive);
      
      // Helpful for debugging in browser console
      (window as any).__loadedDatasets = raw;
      
      console.log("[datasets] ✅ Data loaded successfully:", {
        generatedAt: cachedData.generatedAt,
        totalContacts: cachedData.totalContacts,
        funnel: cachedData.funnel
      });
      
    } catch (error) {
      console.error("[datasets] ❌ Fetch failed:", error);
      lastFetchError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  return processBrevoData(cachedData, params);
}

// Export last fetch error for UI feedback
export function getLastFetchError(): string | null {
  return lastFetchError;
}

// Export normalized datasets for direct UI consumption
export function getNormalizedDatasets(): NormalizedDatasets | null {
  return cachedNormalized;
}

export function getComprehensiveNormalizedDatasets(): ComprehensiveNormalizedDatasets | null {
  return cachedComprehensive;
}

function processBrevoData(data: BrevoData, params: any): Datasets {
  console.log('Processing Brevo data with pre-calculated metrics from backend...');
  console.log('Available pre-calculated data:', Object.keys(data).filter(k => k !== 'contacts' && k !== 'generatedAt' && k !== 'totalContacts'));

  // Use ONLY pre-calculated data from backend - NO frontend calculations
  if (!data.funnel) {
    console.error('❌ NO FUNNEL DATA FROM BACKEND! This should not happen!');
    throw new Error('No funnel data available from backend');
  }

  // Use pre-calculated funnel data from backend
  const funnel = [
    { step: 'Leads a CRM', value: data.funnel.leadsACRM },
    { step: 'Iscritti alla Piattaforma (#6)', value: data.funnel.iscrittiPiattaforma },
    { step: 'Profilo completo', value: data.funnel.profiloCompleto },
    { step: 'Corsisti', value: data.funnel.corsisti },
    { step: 'Clienti paganti', value: data.funnel.paganti }
  ];

  // For iscritti con simulazione, we need to compute this from contacts
  // since it's not pre-calculated in backend yet
  const contacts = data.contacts || [];
  const transformedContacts = contacts.map(contact => {
    const listIds = Array.isArray(contact.listIds) ? contact.listIds : [];
    const hasList6 = listIds.indexOf(6) !== -1; // LIST_ID_PIATTAFORMA = 6
    const ultimaSimRaw = contact.attributes.ULTIMA_SIMULAZIONE || '';
    const hasUltimaSimulazione = !!String(ultimaSimRaw).trim();
    return { ...contact, listIds, hasList6, hasUltimaSimulazione };
  });

  // Compute iscritti con simulazione
  const conSim = data.funnel.iscrittiPiattaforma - transformedContacts.filter(x => x.hasList6 && !x.hasUltimaSimulazione).length;
  const iscrittiSimulazione = [
    { name: 'Con simulazione', value: conSim },
    { name: 'Senza simulazione', value: Math.max(0, data.funnel.iscrittiPiattaforma - conSim) }
  ];

  // Use pre-calculated distributions from backend
  const distribuzione_atenei = data.distribuzione_atenei || [];
  const distribuzione_anno_profilazione = data.distribuzione_anno_profilazione || [];
  const distribuzione_fonte = data.distribuzione_fonte || [];
  const distribuzione_anno_nascita = data.distribuzione_anno_nascita || [];
  const distribuzione_corsi = data.distribuzione_corsi || [];
  const distribuzione_corsi_pagati = data.distribuzione_corsi_pagati || [];
  const distribuzione_liste_corsisti = data.distribuzione_liste_corsisti || [];

  // Use pre-calculated webinar metrics from backend
  const webinar_conversions = data.webinar_conversions || [];
  const iscritti_webinar = data.iscritti_webinar || [];
  const utenti_crm_webinar = data.utenti_crm_webinar || [];

  // Use pre-calculated non-corsisti metrics from backend
  const utenti_crm_non_corsisti = data.utenti_crm_non_corsisti || 0;
  const utenti_crm_non_corsisti_in_target = data.utenti_crm_non_corsisti_in_target || 0;
  const pct_non_corsisti_in_target = data.pct_non_corsisti_in_target || 0;

  return {
    meta: {
      scope: params.scope || 'all',
      listMode: params.listMode || 'group',
      generatedAt: data.generatedAt,
      totalRows: data.totalContacts,
    },
    datasets: {
      funnel: funnel,
      iscritti_con_simulazione: iscrittiSimulazione,
      distribuzione_atenei: distribuzione_atenei,
      distribuzione_anno_profilazione: distribuzione_anno_profilazione,
      distribuzione_fonte: distribuzione_fonte,
      distribuzione_anno_nascita: distribuzione_anno_nascita,
      distribuzione_liste_corsisti: distribuzione_liste_corsisti,
      distribuzione_corsi: distribuzione_corsi,
      distribuzione_corsi_pagati: distribuzione_corsi_pagati,
      gestiti_trattativa: [], // Not implemented in backend yet
      kpi_full2026_gratis: [], // Not implemented in backend yet
      utenti_crm_non_corsisti: utenti_crm_non_corsisti,
      utenti_crm_non_corsisti_in_target: utenti_crm_non_corsisti_in_target,
      pct_non_corsisti_in_target: pct_non_corsisti_in_target,
      webinar_conversions: webinar_conversions,
      iscritti_webinar: iscritti_webinar,
      utenti_crm_webinar: utenti_crm_webinar,
      delta: data.funnel, // Use funnel data as delta
    }
  };
}
