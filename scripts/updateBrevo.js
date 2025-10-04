const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BREVO_API_BASE_URL = 'https://api.brevo.com/v3/contacts';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const DATASETS_FILE = path.join(__dirname, '..', 'datasets.json');
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
        hasMore = false;
        console.log('No more contacts to fetch (empty response)');
      } else {
        allContacts.push(...contacts);
        console.log(`Total contacts so far: ${allContacts.length}`);
        offset += LIMIT;
        
        // If we got less than the limit, we've reached the end
        if (contacts.length < LIMIT) {
          hasMore = false;
          console.log('Reached end of contacts (less than limit returned)');
        }
      }
      
      // Add a small delay to be respectful to the API
      if (hasMore) {
        console.log('Waiting 100ms before next request...');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total batches processed: ${batchCount}`);
    console.log(`Total contacts fetched: ${allContacts.length}`);
    console.log(`Final offset: ${offset}`);
    
    return allContacts;
    
  } catch (error) {
    console.error('Error fetching contacts from Brevo API:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Request made but no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
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
  
  // Remove phone numbers from attributes
  if (cleanedContact.attributes) {
    const phoneFields = ['SMS', 'WHATSAPP', 'LANDLINE'];
    phoneFields.forEach(field => {
      if (cleanedContact.attributes[field]) {
        delete cleanedContact.attributes[field];
      }
    });
  }
  
  return cleanedContact;
}

function saveDatasets(contacts) {
  try {
    console.log('Cleaning contact data (removing emails and phone numbers)...');
    
    // Clean all contacts to remove sensitive data
    const cleanedContacts = contacts.map(contact => cleanContactData(contact));
    
    const datasetsData = {
      generatedAt: new Date().toISOString(),
      totalContacts: cleanedContacts.length,
      contacts: cleanedContacts
    };
    
    const jsonString = JSON.stringify(datasetsData, null, 2);
    fs.writeFileSync(DATASETS_FILE, jsonString, 'utf8');
    
    console.log('Datasets saved successfully to datasets.json');
    console.log('Generated at:', datasetsData.generatedAt);
    console.log('Total contacts saved:', cleanedContacts.length);
    console.log('Sensitive data (emails and phone numbers) removed from all contacts');
    
  } catch (error) {
    console.error('Error saving datasets:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting Brevo contacts update...');
    
    // Fetch all contacts from Brevo API with pagination
    const allContacts = await fetchAllContacts();
    
    // Save contacts to datasets.json
    saveDatasets(allContacts);
    
    console.log('Brevo contacts update completed successfully');
    
  } catch (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
