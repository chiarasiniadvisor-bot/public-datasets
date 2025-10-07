// Test script to verify funnel calculation logic
const fs = require('fs');

// Read the current datasets.json
const datasets = JSON.parse(fs.readFileSync('datasets.json', 'utf8'));
const contacts = datasets.contacts;

console.log(`Testing funnel calculation logic with ${contacts.length} contacts...`);

// Test the funnel calculation logic
function calculateFunnelMetrics(contacts) {
  console.log(`Calculating funnel metrics for ${contacts.length} contacts...`);
  
  // Leads a CRM: Total number of contacts in Brevo (all contacts)
  const leadsACRM = contacts.length;
  console.log(`Leads a CRM (total contacts): ${leadsACRM}`);
  
  // Iscritti alla Piattaforma: Contacts in list #6 (Piattaforma)
  const iscrittiPiattaforma = contacts.filter(x => x.listIds && x.listIds.indexOf(6) !== -1).length;
  console.log(`Iscritti alla Piattaforma (list #6): ${iscrittiPiattaforma}`);
  
  // Profilo completo: Contacts with DATA_DI_NASCITA filled and not empty
  const profiloCompleto = contacts.filter(x => {
    const dataNascita = x.attributes?.DATA_DI_NASCITA;
    return dataNascita && dataNascita.toString().trim() !== '';
  }).length;
  console.log(`Profilo completo (DATA_DI_NASCITA filled): ${profiloCompleto}`);
  
  // Corsisti: Contacts with CORSO_ACQUISTATO filled and not empty
  const corsisti = contacts.filter(x => {
    const corso = x.attributes?.CORSO_ACQUISTATO;
    return corso && corso.toString().trim() !== '';
  }).length;
  console.log(`Corsisti (CORSO_ACQUISTATO filled): ${corsisti}`);
  
  // Paganti: Corsisti excluding "borsa di studio"
  const paganti = contacts.filter(x => {
    const corso = x.attributes?.CORSO_ACQUISTATO || '';
    const corsoStr = corso.toString().toLowerCase();
    return corsoStr.trim() !== '' && !corsoStr.includes('borsa di studio');
  }).length;
  console.log(`Paganti (corsisti excluding borsa di studio): ${paganti}`);

  const metrics = {
    leadsACRM,
    iscrittiPiattaforma,
    profiloCompleto,
    corsisti,
    paganti
  };
  
  console.log('Final funnel metrics:', metrics);
  return metrics;
}

// Run the test
const calculatedMetrics = calculateFunnelMetrics(contacts);

console.log('\n=== COMPARISON ===');
console.log('Current datasets.json funnel:', datasets.funnel);
console.log('Calculated metrics:', calculatedMetrics);

// Check if they match
const matches = Object.keys(calculatedMetrics).every(key => 
  calculatedMetrics[key] === datasets.funnel[key]
);

console.log('\nMetrics match:', matches ? 'YES' : 'NO');

if (!matches) {
  console.log('\nDifferences:');
  Object.keys(calculatedMetrics).forEach(key => {
    if (calculatedMetrics[key] !== datasets.funnel[key]) {
      console.log(`  ${key}: current=${datasets.funnel[key]}, calculated=${calculatedMetrics[key]}`);
    }
  });
}
