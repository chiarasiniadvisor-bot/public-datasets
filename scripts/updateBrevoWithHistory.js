const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BREVO_API_BASE_URL = 'https://api.brevo.com/v3/contacts';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const DATASETS_FILE = path.join(__dirname, '..', 'datasets.json');
const HISTORY_FILE = path.join(__dirname, '..', 'historical-data.json');
const LIMIT = 1000; // Max contacts per request

// Validate environment variables
if (!BREVO_API_KEY) {
  console.error('Error: BREVO_API_KEY environment variable is required');
  process.exit(1);
}

async function fetchAllContacts() {
  const allContacts = [];
  let offset = 0;
  let hasMore = true;
  let batchCount = 0;
  
  try {
    console.log('Starting to fetch all contacts from Brevo API...');
    console.log(`API URL: ${BREVO_API_BASE_URL}`);
    console.log(`Limit per request: ${LIMIT}`);
    
    while (hasMore) {
      batchCount++;
      const url = `${BREVO_API_BASE_URL}?limit=${LIMIT}&offset=${offset}`;
      console.log(`\n--- Batch ${batchCount} ---`);
      console.log(`URL: ${url}`);
      console.log(`Offset: ${offset}, Limit: ${LIMIT}`);
      
      const response = await axios.get(url, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response data keys: ${Object.keys(response.data).join(', ')}`);
      
      // Check if response has the expected structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response structure: response.data is not an object');
      }
      
      const contacts = response.data.contacts || [];
      console.log(`Fetched ${contacts.length} contacts in this batch`);
      
      // Log first contact structure for debugging (only in first batch)
      if (batchCount === 1 && contacts.length > 0) {
        console.log('First contact structure:', JSON.stringify(contacts[0], null, 2));
      }
      
      if (contacts.length === 0) {
        console.log('No more contacts to fetch');
        hasMore = false;
      } else {
        allContacts.push(...contacts);
        console.log(`Total contacts fetched so far: ${allContacts.length}`);
        
        // Add a small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (contacts.length < LIMIT) {
          console.log('Last batch received, no more contacts to fetch');
          hasMore = false;
        } else {
          offset += LIMIT;
        }
      }
    }
    
    console.log(`\n=== FETCH COMPLETE ===`);
    console.log(`Total contacts fetched: ${allContacts.length}`);
    console.log(`Total batches processed: ${batchCount}`);
    
    return allContacts;
    
  } catch (error) {
    console.error('Error fetching contacts:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

function cleanContactData(contact) {
  // Create a deep copy of the contact to avoid modifying the original
  const cleanedContact = JSON.parse(JSON.stringify(contact));

  // Remove email property
  if (cleanedContact.email) {
    delete cleanedContact.email;
  }

  // Remove sensitive fields from attributes
  if (cleanedContact.attributes) {
    const sensitiveFields = [
      'SMS', 'WHATSAPP', 'LANDLINE',           // Original phone fields
      'EXT_ID', 'LANDLINE_NUMBER',             // Additional sensitive fields
      'WHATSAPP_NUMBER', 'SMS_NUMBER',         // Additional phone number fields
      'NOME', 'COGNOME'                        // Personal names
    ];

    sensitiveFields.forEach(field => {
      if (cleanedContact.attributes[field]) {
        delete cleanedContact.attributes[field];
      }
    });

    // Log which fields were removed for debugging
    const removedFields = sensitiveFields.filter(field =>
      contact.attributes && contact.attributes[field] && !cleanedContact.attributes[field]
    );
    if (removedFields.length > 0) {
      console.log(`Removed sensitive fields: ${removedFields.join(', ')}`);
    }
  }

  return cleanedContact;
}

function calculateAllMetrics(contacts) {
  console.log(`Calculating all metrics for ${contacts.length} contacts...`);
  
  // Funnel metrics
  const leadsACRM = contacts.length;
  const iscrittiPiattaforma = contacts.filter(x => x.listIds && x.listIds.indexOf(6) !== -1).length;
  const profiloCompleto = contacts.filter(x => {
    const dataNascita = x.attributes?.DATA_DI_NASCITA;
    return dataNascita && dataNascita.toString().trim() !== '';
  }).length;
  const corsisti = contacts.filter(x => {
    const corso = x.attributes?.CORSO_ACQUISTATO;
    return corso && corso.toString().trim() !== '';
  }).length;
  const paganti = contacts.filter(x => {
    const corso = x.attributes?.CORSO_ACQUISTATO || '';
    const corsoStr = corso.toString().toLowerCase();
    return corsoStr.trim() !== '' && !corsoStr.includes('borsa di studio');
  }).length;

  console.log(`Funnel: leads=${leadsACRM}, iscritti=${iscrittiPiattaforma}, profilo=${profiloCompleto}, corsisti=${corsisti}, paganti=${paganti}`);

  // Distribution metrics
  const ateneiCount = {};
  const annoProfilazioneCount = {};
  const fonteCount = {};
  const annoNascitaCount = {};
  const corsiCount = {};
  const corsiPagatiCount = {};
  const listePerMacroCount = {};
  const listePerIdCount = {};

  // Normalization maps
  const FONTE_MAP = {
    'adv meta': 'META', 'facebook ads': 'META', 'instagram ads': 'META', 'fb': 'META', 'ig': 'Instagram', 'instagram': 'Instagram',
    'google ads': 'Google', 'google': 'Google', 'seo': 'SEO', 'organic': 'SEO', 'referral': 'Referral', 'passaparola': 'Referral',
    'webinar': 'Webinar', 'email': 'Email', 'newsletter': 'Email', 'conversazioni': 'Conversazioni', 'sito': 'Sito', 'ambassador': 'Ambassador', 'iscritto': 'Iscritti'
  };

  const ANNO_MAP = {
    '1': '1', '1°': '1', 'primo': '1', '2': '2', '2°': '2', 'secondo': '2', '3': '3', '3°': '3', 'terzo': '3',
    '4': '4', '4°': '4', 'quarto': '4', '5': '5', '5°': '5', 'quinto': '5', '6': '6', '6°': '6', 'sesto': '6',
    'laureato': 'Laureato', 'laureata': 'Laureato', 'post laurea': 'Post laurea',
    'fuori corso': 'Fuori corso', 'fuoricorso': 'Fuori corso',
  };

  // Helper functions
  const safeString = (v) => (v === null || v === undefined) ? '' : String(v);
  const canon = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const extractYear = (dateStr) => {
    const s = safeString(dateStr);
    const m = s.match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : null;
  };

  const normFonte = (v) => {
    const raw = safeString(v).trim();
    if (!raw) return 'Sconosciuta/Non dichiarata';
    const key = raw.toLowerCase();
    if (FONTE_MAP[key]) return FONTE_MAP[key];
    return capitalize(raw);
  };

  const normAnno = (v) => {
    const raw = safeString(v).trim();
    if (!raw) return 'ND';
    const s = raw.toLowerCase();
    const m = s.match(/(^|\D)([1-6])(\D|$)/);
    if (m) return m[2];
    if (/laureat/.test(s)) return 'Laureato';
    if (/fuori\s*cors/.test(s) || /fuoricors/.test(s)) return 'Fuori corso';
    if (/post\s*laurea|specializz|master/.test(s)) return 'Post laurea';
    for (const k in ANNO_MAP) {
      if (ANNO_MAP[k]) {
        const rx = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (rx.test(s)) return ANNO_MAP[k];
      }
    }
    return 'Altro';
  };

  const detectFamily = (s) => {
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
  };

  const buildCourseMacro = (s) => {
    const fam = detectFamily(s);
    if (fam === 'FULL_2026') {
      if (s.includes('gratis') && (s.includes('se entri') || s.includes(' entri '))) return 'Full 2026 – Se entri è gratis';
      if (s.includes('borsa') && s.includes('studio')) return 'Full 2026 – Borsa di Studio';
      if (s.includes('promo') || s.includes('sconto')) {
        if (s.includes('65%')) return 'Full 2026 – Promo 65%';
        if (s.includes('40%')) return 'Full 2026 – Promo 40%';
        if (s.includes('30%')) return 'Full 2026 – Promo 30%';
        return 'Full 2026 – Promo';
      }
      return 'Full 2026 – Altro';
    }
    if (fam === 'ACADEMY_2026') {
      if (s.includes('gratis') && (s.includes('se entri') || s.includes(' entri '))) return 'Academy 2026 – Se entri è gratis';
      if (s.includes('promo') || s.includes('sconto')) {
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
  };

  // Process all contacts
  contacts.forEach(contact => {
    // Atenei
    const ateneo = contact.attributes?.ATENEO || 'Non specificato';
    ateneiCount[ateneo] = (ateneiCount[ateneo] || 0) + 1;

    // Anno Profilazione
    const annoProfilazione = normAnno(contact.attributes?.ANNO);
    annoProfilazioneCount[annoProfilazione] = (annoProfilazioneCount[annoProfilazione] || 0) + 1;

    // Fonte
    const fonte = normFonte(contact.attributes?.FONTE);
    fonteCount[fonte] = (fonteCount[fonte] || 0) + 1;

    // Anno Nascita
    const annoNascita = extractYear(contact.attributes?.DATA_DI_NASCITA) || 'Senza anno';
    annoNascitaCount[annoNascita] = (annoNascitaCount[annoNascita] || 0) + 1;

    // Corsi
    const corsoRaw = safeString(contact.attributes?.CORSO_ACQUISTATO).trim();
    if (corsoRaw) {
      const corsoCanon = canon(corsoRaw);
      const macroCorso = buildCourseMacro(corsoCanon);
      corsiCount[macroCorso] = (corsiCount[macroCorso] || 0) + 1;

      // Corsi Pagati (excluding "borsa di studio")
      if (!corsoRaw.toLowerCase().includes('borsa di studio')) {
        corsiPagatiCount[macroCorso] = (corsiPagatiCount[macroCorso] || 0) + 1;
      }
    }

    // Liste
    const listIds = contact.listIds || [];
    listIds.forEach(idNum => {
      let macro = 'Altro';
      if (idNum === 6) macro = 'ISCRITTI';
      if (idNum === 69) macro = 'WEBINAR';
      
      listePerMacroCount[macro] = (listePerMacroCount[macro] || 0) + 1;
      listePerIdCount[String(idNum)] = (listePerIdCount[String(idNum)] || 0) + 1;
    });
  });

  // Convert to arrays
  const atenei = Object.entries(ateneiCount).map(([name, value]) => ({ name, value }));
  const annoProfilazione = Object.entries(annoProfilazioneCount).map(([name, value]) => ({ name, value }));
  const fonte = Object.entries(fonteCount).map(([name, value]) => ({ name, value }));
  const annoNascita = Object.entries(annoNascitaCount).map(([name, value]) => ({ name, value }));
  const corsi = Object.entries(corsiCount).map(([name, value]) => ({ name, value }));
  const corsiPagati = Object.entries(corsiPagatiCount).map(([name, value]) => ({ name, value }));
  const listePerMacro = Object.entries(listePerMacroCount).map(([name, value]) => ({ name, value }));
  const listePerId = Object.entries(listePerIdCount).map(([name, value]) => ({ name, value }));

  // Webinar metrics
  const webinarParticipants = contacts.filter(x => x.listIds && x.listIds.indexOf(69) !== -1);
  const webinarConversions = webinarParticipants.filter(x => {
    const corso = x.attributes?.CORSO_ACQUISTATO;
    return corso && corso.toString().trim() !== '';
  }).length;
  const iscrittiWebinar = webinarParticipants.filter(x => x.listIds && x.listIds.indexOf(6) !== -1).length;

  // Non-corsisti in target
  const crmContacts = contacts.filter(x => x.listIds && x.listIds.length > 0);
  const nonCorsisti = crmContacts.filter(x => {
    const corso = x.attributes?.CORSO_ACQUISTATO;
    return !corso || corso.toString().trim() === '';
  });
  
  let inTarget = 0;
  for (const contact of nonCorsisti) {
    const hasWebinar = contact.listIds && contact.listIds.indexOf(69) !== -1;
    if (!hasWebinar) continue;
    
    const annoOK = normAnno(contact.attributes?.ANNO) === '5' || normAnno(contact.attributes?.ANNO) === '6';
    const yobStr = extractYear(contact.attributes?.DATA_DI_NASCITA || '');
    const yob = yobStr ? parseInt(yobStr, 10) : NaN;
    const yobOK = (yob === 2000 || yob === 2001);
    
    if (annoOK || yobOK) inTarget++;
  }

  const pctNonCorsistiInTarget = nonCorsisti.length > 0 ? inTarget / nonCorsisti.length : 0;

  const allMetrics = {
    // Funnel
    funnel: {
      leadsACRM,
      iscrittiPiattaforma,
      profiloCompleto,
      corsisti,
      paganti
    },
    // Distributions
    distribuzione_atenei: atenei,
    distribuzione_anno_profilazione: annoProfilazione,
    distribuzione_fonte: fonte,
    distribuzione_anno_nascita: annoNascita,
    distribuzione_corsi: corsi,
    distribuzione_corsi_pagati: corsiPagati,
    distribuzione_liste_corsisti: listePerMacro,
    // Webinar
    webinar_conversions: [{ name: 'Webinar Conversions', value: webinarConversions }],
    iscritti_webinar: [{ name: 'Iscritti con Webinar', value: iscrittiWebinar }],
    utenti_crm_webinar: [{ name: 'Utenti CRM Webinar', value: webinarParticipants.length }],
    // Non-corsisti
    utenti_crm_non_corsisti: nonCorsisti.length,
    utenti_crm_non_corsisti_in_target: inTarget,
    pct_non_corsisti_in_target: pctNonCorsistiInTarget
  };
  
  console.log('All metrics calculated successfully');
  console.log('FINAL METRICS:', JSON.stringify(allMetrics, null, 2));
  return allMetrics;
}

function saveDatasets(contacts) {
  try {
    console.log('Cleaning contact data...');
    const cleanedContacts = contacts.map(contact => cleanContactData(contact));
    
    console.log('Calculating all metrics...');
    const allMetrics = calculateAllMetrics(cleanedContacts);
    
    const datasetsData = {
      generatedAt: new Date().toISOString(),
      totalContacts: cleanedContacts.length,
      contacts: cleanedContacts,
      ...allMetrics
    };
    
    console.log('SAVING DATASETS WITH METRICS:', Object.keys(allMetrics));
    console.log('FUNNEL DATA:', allMetrics.funnel);
    
    const jsonString = JSON.stringify(datasetsData, null, 2);
    fs.writeFileSync(DATASETS_FILE, jsonString, 'utf8');
    
    console.log('Datasets saved successfully to datasets.json');
    console.log('Generated at:', datasetsData.generatedAt);
    console.log('Total contacts saved:', cleanedContacts.length);
    console.log('Funnel metrics:', funnelMetrics);
    
    return datasetsData;
    
  } catch (error) {
    console.error('Error saving datasets:', error.message);
    throw error;
  }
}

function loadHistoricalData() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
    return { weekly: [], daily: [] };
  } catch (error) {
    console.error('Error loading historical data:', error.message);
    return { weekly: [], daily: [] };
  }
}

function saveHistoricalData(historicalData) {
  try {
    const jsonString = JSON.stringify(historicalData, null, 2);
    fs.writeFileSync(HISTORY_FILE, jsonString, 'utf8');
    console.log('Historical data saved successfully');
  } catch (error) {
    console.error('Error saving historical data:', error.message);
    throw error;
  }
}

function isWednesday() {
  const now = new Date();
  return now.getDay() === 3; // Wednesday is day 3
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function formatDateForWeek(date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

async function main() {
  try {
    console.log('Starting Brevo contacts update...');
    
    // Fetch all contacts from Brevo API with pagination
    const contacts = await fetchAllContacts();
    
    if (contacts.length === 0) {
      console.log('No contacts found, skipping update');
      return;
    }
    
    // Save current datasets
    const currentData = saveDatasets(contacts);
    
    // Load historical data
    const historicalData = loadHistoricalData();
    
    // Add daily snapshot
    const today = new Date().toISOString().split('T')[0];
    const dailySnapshot = {
      date: today,
      funnel: currentData.funnel,
      totalContacts: currentData.totalContacts
    };
    
    // Remove old daily snapshots (keep last 30 days)
    historicalData.daily = historicalData.daily.filter(snapshot => {
      const snapshotDate = new Date(snapshot.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return snapshotDate >= thirtyDaysAgo;
    });
    
    // Add new daily snapshot
    historicalData.daily.push(dailySnapshot);
    
    // If it's Wednesday, add weekly snapshot
    if (isWednesday()) {
      const weekStart = getWeekStart(new Date());
      const weekKey = formatDateForWeek(weekStart);
      
      const weeklySnapshot = {
        week: weekKey,
        date: today,
        funnel: currentData.funnel,
        totalContacts: currentData.totalContacts
      };
      
      // Remove old weekly snapshots (keep last 12 weeks)
      historicalData.weekly = historicalData.weekly.filter(snapshot => {
        const snapshotDate = new Date(snapshot.date);
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks
        return snapshotDate >= twelveWeeksAgo;
      });
      
      // Add new weekly snapshot
      historicalData.weekly.push(weeklySnapshot);
      
      console.log(`Weekly snapshot added for week starting ${weekKey}`);
    }
    
    // Save historical data
    saveHistoricalData(historicalData);
    
    console.log('Update completed successfully!');
    console.log(`Daily snapshots: ${historicalData.daily.length}`);
    console.log(`Weekly snapshots: ${historicalData.weekly.length}`);
    
  } catch (error) {
    console.error('Error in main process:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
