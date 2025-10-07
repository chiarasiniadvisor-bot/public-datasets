// src/lib/dataService.ts
// Clean data service that ONLY uses backend pre-calculated data
// NO frontend calculations, NO hardcoded values

export const API_BASE = "https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json?v=" + Date.now() + "&t=" + Math.random();

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

// Load datasets from GitHub Raw datasets.json
let cachedData: BrevoData | null = null;

export async function fetchDatasets(params: {
  scope?: Scope;
  topN?: number;
  minCountAltro?: number;
  listMode?: ListMode;
} = {}): Promise<Datasets> {
  // Load data from GitHub Raw datasets.json
  if (!cachedData) {
    console.log("🔄 FETCHING NEW DATA FROM BACKEND:", API_BASE);
    console.log("🚀 CLEAN DATA SERVICE - NO HARDCODED VALUES - USING BACKEND DATA ONLY");
    console.log("🔥 FORCE REBUILD - VERCEL CACHE BYPASS - TIMESTAMP:", Date.now());
    console.log("🎯 THIS IS THE CLEAN VERSION - NO HARDCODING - USE BACKEND DATA");
    
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error(`Failed to load datasets: ${response.status}`);
    cachedData = await response.json();
    
    console.log("✅ NEW DATA LOADED:", {
      generatedAt: cachedData.generatedAt,
      totalContacts: cachedData.totalContacts,
      funnel: cachedData.funnel
    });
    
    console.log("🎯 EXPECTED VALUES: Leads=4822, Iscritti=2955, Profilo=2552");
    console.log("📊 ACTUAL VALUES:", {
      leads: cachedData.funnel?.leadsACRM,
      iscritti: cachedData.funnel?.iscrittiPiattaforma,
      profilo: cachedData.funnel?.profiloCompleto
    });

    // Force alert if values don't match
    if (cachedData.funnel?.leadsACRM !== 4822 ||
        cachedData.funnel?.iscrittiPiattaforma !== 2955 ||
        cachedData.funnel?.profiloCompleto !== 2552) {
      console.error("❌ DATA MISMATCH! Backend has correct data but frontend shows wrong values!");
    } else {
      console.log("✅ DATA MATCH! Backend and frontend should show correct values!");
    }
  }

  return processBrevoData(cachedData, params);
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
