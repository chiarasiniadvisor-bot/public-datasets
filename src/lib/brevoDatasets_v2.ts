// src/lib/brevoDatasets.ts
// Local datasets from Brevo API integration

export const API_BASE =
  "https://raw.githubusercontent.com/chiarasiniadvisor-bot/public-datasets/main/datasets.json?v=" + Date.now();

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
  // Webinar metrics
  webinar_conversions: { name: string; value: number }[];
  iscritti_webinar: { name: string; value: number }[];
  utenti_crm_webinar: { name: string; value: number }[];
  utenti_crm_non_corsisti: number;
  utenti_crm_non_corsisti_in_target: number;
  pct_non_corsisti_in_target: number;
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

// Constants from App Script
const LIST_ID_PIATTAFORMA = 6;
const LIST_ID_WEBINAR = 69; // Lista webinar
const ESCLUDI_MATCH_IN_CORSO = 'borsa di studio';
const LABEL_FONTE_MISSING = 'Sconosciuta/Non dichiarata';
const LABEL_ATENEO_MISSING = 'Non specificato';
const LABEL_ANNO_MISSING = 'ND';
const ALLOWED_MACROS = ['WEBINAR','META','SITO','AMBASSADOR','CONVERSAZIONI','ISCRITTI'];

// Maps from App Script
const FONTE_MAP: { [key: string]: string } = {
  'adv meta': 'META','facebook ads': 'META','instagram ads': 'META','fb': 'META',
  'ig': 'Instagram','instagram': 'Instagram',
  'google ads': 'Google','google': 'Google',
  'seo': 'SEO','organic': 'SEO',
  'referral': 'Referral','passaparola': 'Referral',
  'webinar': 'Webinar','email': 'Email','newsletter': 'Email',
};

const ANNO_MAP: { [key: string]: string } = {
  '1':'1','1°':'1','primo':'1','2':'2','2°':'2','secondo':'2','3':'3','3°':'3','terzo':'3',
  '4':'4','4°':'4','quarto':'4','5':'5','5°':'5','quinto':'5','6':'6','6°':'6','sesto':'6',
  'laureato':'Laureato','laureata':'Laureato','post laurea':'Post laurea',
  'fuori corso':'Fuori corso','fuoricorso':'Fuori corso',
};

// Helper functions from App Script
function canon_(s: string): string {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

function hasFreeOffer_(s: string): boolean {
  return s.includes('gratis') && (s.includes('se entri') || s.includes(' entri '));
}

function hasBorsa_(s: string): boolean {
  return s.includes('borsa') && s.includes('studio');
}

function hasPromo_(s: string): boolean {
  return s.includes('promo') || s.includes('sconto');
}

function detectFamily_(s: string): string {
  if (!s) return 'Non specificato';
  const isFull = s.includes('full') && s.includes('ssm') && s.includes('2026');
  const isAcademy = s.includes('academy') && s.includes('2026');
  const isFocus = s.includes('focus') && s.includes('2025');
  const isBiennale = s.includes('biennale') && s.includes('2027');
  const isOneMore = s.includes('one more time') && s.includes('2026');
  const isOnDemand = s.includes('on demand pro');
  
  if (isFull) return 'FULL_2026';
  if (isAcademy) return 'ACADEMY_2026';
  if (isFocus) return 'FOCUS_2025';
  if (isBiennale) return 'BIENNALE_2027';
  if (isOneMore) return 'ONE_MORE_TIME_2026';
  if (isOnDemand) return 'ON_DEMAND_PRO';
  return 'Altro';
}

function buildCourseMacro_(s: string): string {
  const fam = detectFamily_(s);
  if (fam === 'FULL_2026') {
    if (hasFreeOffer_(s)) return 'Full 2026 – Se entri è gratis';
    if (hasBorsa_(s)) return 'Full 2026 – Borsa di Studio';
    if (hasPromo_(s)) {
      if (s.includes('65%')) return 'Full 2026 – Promo 65%';
      if (s.includes('40%')) return 'Full 2026 – Promo 40%';
      if (s.includes('30%')) return 'Full 2026 – Promo 30%';
      return 'Full 2026 – Promo';
    }
    return 'Full 2026 – Altro';
  }
  if (fam === 'ACADEMY_2026') {
    if (hasFreeOffer_(s)) return 'Academy 2026 – Se entri è gratis';
    if (hasPromo_(s)) { 
      if (s.includes('40%')) return 'Academy 2026 – Promo 40%'; 
      return 'Academy 2026 – Promo'; 
    }
    return 'Academy 2026 – Altro';
  }
  if (fam === 'FOCUS_2025') return 'Focus SSM 2025';
  if (fam === 'BIENNALE_2027') return 'Biennale SSM 2027';
  if (fam === 'ONE_MORE_TIME_2026') return 'One More Time SSM 2026';
  if (fam === 'ON_DEMAND_PRO') return 'On Demand Pro';
  if (fam === 'Non specificato') return 'Non specificato';
  return 'Altro';
}

function normFonte_(v: string): string {
  const raw = String(v || '').trim();
  if (!raw) return LABEL_FONTE_MISSING;
  const key = raw.toLowerCase();
  if (FONTE_MAP[key]) return FONTE_MAP[key];
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function normAnno_(v: string): string {
  const raw = String(v || '').trim();
  if (!raw) return LABEL_ANNO_MISSING;
  const s = raw.toLowerCase();
  const m = s.match(/(^|\D)([1-6])(\D|$)/);
  if (m) return m[2];
  if (/laureat/.test(s)) return 'Laureato';
  if (/fuori\s*cors/.test(s) || /fuoricors/.test(s)) return 'Fuori corso';
  if (/post\s*laurea|specializz|master/.test(s)) return 'Post laurea';
  
  for (const k in ANNO_MAP) {
    if (ANNO_MAP.hasOwnProperty(k)) {
      const rx = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (rx.test(s)) return ANNO_MAP[k];
    }
  }
  return 'Altro';
}

function extractYear_(dateStr: string): string | null {
  const s = String(dateStr || '');
  const m = s.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : null;
}

function relabelAnnoProfilazione_(items: Array<{name: string, value: number}>): Array<{name: string, value: number}> {
  const map: { [key: string]: string } = {
    '1': '1° Anno', '2': '2° Anno', '3': '3° Anno', '4': '4° Anno', '5': '5° Anno', '6': '6° Anno',
    'laureato': 'Laureato', 'fuori corso': 'Altro', 'altro': 'Altro', 'nd': 'Altro', 'post laurea': 'Altro'
  };
  
  const acc = new Map<string, number>();
  for (const it of items || []) {
    const k = String(it.name || '').toLowerCase().trim();
    const label = map[k] || 'Altro';
    acc.set(label, (acc.get(label) || 0) + (Number(it.value) || 0));
  }
  
  const order = ['1° Anno', '2° Anno', '3° Anno', '4° Anno', '5° Anno', '6° Anno', 'Laureato', 'Altro'];
  return order.map(l => ({ name: l, value: acc.get(l) || 0 })).filter(x => x.value > 0 || x.name === 'Altro');
}

// Webinar and conversion functions
function isWebinarParticipant_(contact: any): boolean {
  return contact.listIds && contact.listIds.indexOf(LIST_ID_WEBINAR) !== -1;
}

function computeWebinarConversions_(contacts: any[]): Array<{name: string, value: number}> {
  const webinarParticipants = contacts.filter(isWebinarParticipant_);
  const webinarCorsisti = webinarParticipants.filter(c => c.isCorsista);
  const webinarPaganti = webinarParticipants.filter(c => c.isPagante);
  
  return [
    { name: 'Partecipanti Webinar', value: webinarParticipants.length },
    { name: 'Corsisti da Webinar', value: webinarCorsisti.length },
    { name: 'Paganti da Webinar', value: webinarPaganti.length }
  ];
}

function computeIscrittiWebinar_(contacts: any[]): Array<{name: string, value: number}> {
  const iscrittiPiattaforma = contacts.filter(c => c.hasList6);
  const iscrittiWebinar = iscrittiPiattaforma.filter(isWebinarParticipant_);
  const iscrittiNonWebinar = iscrittiPiattaforma.filter(c => !isWebinarParticipant_(c));
  
  return [
    { name: 'Iscritti con Webinar', value: iscrittiWebinar.length },
    { name: 'Iscritti senza Webinar', value: iscrittiNonWebinar.length }
  ];
}

function computeNonCorsistiTarget_(contacts: any[]): any {
  const crm = contacts.filter(x => x.listIds && x.listIds.length > 0);
  const nonCorsisti = crm.filter(x => !x.isCorsista);
  let inTarget = 0;
  
  for (const contact of nonCorsisti) {
    const hasWebinar = isWebinarParticipant_(contact);
    if (!hasWebinar) continue;
    
    const annoOK = contact.annoNorm === '5' || contact.annoNorm === '6';
    const yobStr = extractYear_(contact.attributes.DATA_DI_NASCITA || '');
    const yob = yobStr ? parseInt(yobStr, 10) : NaN;
    const yobOK = (yob === 2000 || yob === 2001);
    
    if (annoOK || yobOK) inTarget++;
  }
  
  const tot = nonCorsisti.length;
  return {
    nonCorsisti: tot,
    inTarget,
    pct: tot > 0 ? inTarget / tot : 0
  };
}

function computeUtentiCrmWebinar_(contacts: any[]): Array<{name: string, value: number}> {
  const crm = contacts.filter(x => x.listIds && x.listIds.length > 0);
  const crmWebinar = crm.filter(isWebinarParticipant_);
  const crmNonWebinar = crm.filter(c => !isWebinarParticipant_(c));
  
  return [
    { name: 'Utenti CRM con Webinar', value: crmWebinar.length },
    { name: 'Utenti CRM senza Webinar', value: crmNonWebinar.length }
  ];
}

function processBrevoData(data: BrevoData, params: any): Datasets {
  console.log('Processing Brevo data with pre-calculated metrics from backend...');
  console.log('Available pre-calculated data:', Object.keys(data).filter(k => k !== 'contacts' && k !== 'generatedAt' && k !== 'totalContacts'));

  // For iscritti con simulazione, we still need to compute this from contacts
  // since it's not pre-calculated in backend yet
  const contacts = data.contacts || [];
  const transformedContacts = contacts.map(contact => {
    const listIds = parseListIds_(safeString_(contact.listIds));
    const hasList6 = listIds.indexOf(LIST_ID_PIATTAFORMA) !== -1;
    const ultimaSimRaw = contact.attributes.ULTIMA_SIMULAZIONE || '';
    const hasUltimaSimulazione = !!safeString_(ultimaSimRaw).trim();
    return { ...contact, listIds, hasList6, hasUltimaSimulazione };
  });

  // Use pre-calculated funnel data if available, otherwise compute from contacts
  let funnel;
  console.log('Data funnel available:', !!data.funnel, data.funnel);
  console.log('Total contacts in array:', transformedContacts.length);
  
  if (data.funnel && data.funnel.leadsACRM) {
    // Use pre-calculated funnel data from backend
    console.log('Using pre-calculated funnel data from backend:', data.funnel);
    funnel = [
      { step: 'Leads a CRM', value: data.funnel.leadsACRM },
      { step: 'Iscritti alla Piattaforma (#6)', value: data.funnel.iscrittiPiattaforma },
      { step: 'Profilo completo', value: data.funnel.profiloCompleto },
      { step: 'Corsisti', value: data.funnel.corsisti },
      { step: 'Clienti paganti', value: data.funnel.paganti }
    ];
  } else {
    console.error('No pre-calculated funnel data available from backend!');
    // This should not happen - backend should always provide funnel data
    funnel = [
      { step: 'Leads a CRM', value: 0 },
      { step: 'Iscritti alla Piattaforma (#6)', value: 0 },
      { step: 'Profilo completo', value: 0 },
      { step: 'Corsisti', value: 0 },
      { step: 'Clienti paganti', value: 0 }
    ];
  }

  // Get funnel values from pre-calculated data from backend
  const iscrittiPiattaforma = data.funnel ? data.funnel.iscrittiPiattaforma : 0;
  const corsisti = data.funnel ? data.funnel.corsisti : 0;
  const paganti = data.funnel ? data.funnel.paganti : 0;
  const leadsACRM = data.funnel ? data.funnel.leadsACRM : 0;
  
  // Compute iscritti con simulazione
  const conSim = iscrittiPiattaforma - transformedContacts.filter(x => x.hasList6 && !x.hasUltimaSimulazione).length;
  const iscrittiSimulazione = [
    { name: 'Con simulazione', value: conSim },
    { name: 'Senza simulazione', value: Math.max(0, iscrittiPiattaforma - conSim) }
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
      delta: data.funnel ? data.funnel : null,
    }
  };
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
