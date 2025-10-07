// Test script to verify BREVO_API_KEY access
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY environment variable is not set');
  process.exit(1);
}

console.log('✅ BREVO_API_KEY is set');
console.log('Key length:', BREVO_API_KEY.length);
console.log('Key starts with:', BREVO_API_KEY.substring(0, 10) + '...');

// Test API call
async function testBrevoAPI() {
  try {
    console.log('\n🔄 Testing Brevo API access...');
    
    const response = await axios.get('https://api.brevo.com/v3/contacts?limit=1&offset=0', {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API call successful!');
    console.log('Status:', response.status);
    console.log('Response keys:', Object.keys(response.data));
    console.log('Total contacts:', response.data.count || 'unknown');
    
    if (response.data.contacts && response.data.contacts.length > 0) {
      console.log('First contact ID:', response.data.contacts[0].id);
      console.log('First contact listIds:', response.data.contacts[0].listIds);
    }
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testBrevoAPI();
