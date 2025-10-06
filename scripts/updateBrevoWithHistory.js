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

function calculateFunnelMetrics(contacts) {
  // Calculate funnel metrics like in the App Script
  const leadsACRM = contacts.filter(x => (x.listIds && x.listIds.length > 0)).length;
  const iscrittiPiattaforma = contacts.filter(x => x.listIds && x.listIds.indexOf(6) !== -1).length;
  const profiloCompleto = contacts.filter(x => !!x.attributes?.DATA_DI_NASCITA).length;
  const corsisti = contacts.filter(x => !!x.attributes?.CORSO_ACQUISTATO).length;
  const paganti = contacts.filter(x => {
    const corso = x.attributes?.CORSO_ACQUISTATO || '';
    return !!corso && !corso.toLowerCase().includes('borsa di studio');
  }).length;

  return {
    leadsACRM,
    iscrittiPiattaforma,
    profiloCompleto,
    corsisti,
    paganti
  };
}

function saveDatasets(contacts) {
  try {
    console.log('Cleaning contact data...');
    const cleanedContacts = contacts.map(contact => cleanContactData(contact));
    
    console.log('Calculating funnel metrics...');
    const funnelMetrics = calculateFunnelMetrics(cleanedContacts);
    
    const datasetsData = {
      generatedAt: new Date().toISOString(),
      totalContacts: cleanedContacts.length,
      contacts: cleanedContacts,
      funnel: funnelMetrics
    };
    
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
