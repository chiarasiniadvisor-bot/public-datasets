// Test script to verify calculation logic
const fs = require('fs');

console.log('Testing calculation logic...');

// Read current datasets.json
const datasets = JSON.parse(fs.readFileSync('datasets.json', 'utf8'));
const contacts = datasets.contacts;

console.log(`Total contacts: ${contacts.length}`);

// Test funnel calculations
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

console.log('\n=== CALCULATED VALUES ===');
console.log(`Leads a CRM: ${leadsACRM}`);
console.log(`Iscritti alla Piattaforma: ${iscrittiPiattaforma}`);
console.log(`Profilo completo: ${profiloCompleto}`);
console.log(`Corsisti: ${corsisti}`);
console.log(`Paganti: ${paganti}`);

console.log('\n=== CURRENT DATASETS.JSON VALUES ===');
console.log(`Leads a CRM: ${datasets.funnel.leadsACRM}`);
console.log(`Iscritti alla Piattaforma: ${datasets.funnel.iscrittiPiattaforma}`);
console.log(`Profilo completo: ${datasets.funnel.profiloCompleto}`);
console.log(`Corsisti: ${datasets.funnel.corsisti}`);
console.log(`Paganti: ${datasets.funnel.paganti}`);

console.log('\n=== DIFFERENCES ===');
console.log(`Leads a CRM: ${leadsACRM === datasets.funnel.leadsACRM ? 'MATCH' : `DIFF: ${leadsACRM} vs ${datasets.funnel.leadsACRM}`}`);
console.log(`Iscritti: ${iscrittiPiattaforma === datasets.funnel.iscrittiPiattaforma ? 'MATCH' : `DIFF: ${iscrittiPiattaforma} vs ${datasets.funnel.iscrittiPiattaforma}`}`);
console.log(`Profilo: ${profiloCompleto === datasets.funnel.profiloCompleto ? 'MATCH' : `DIFF: ${profiloCompleto} vs ${datasets.funnel.profiloCompleto}`}`);
console.log(`Corsisti: ${corsisti === datasets.funnel.corsisti ? 'MATCH' : `DIFF: ${corsisti} vs ${datasets.funnel.corsisti}`}`);
console.log(`Paganti: ${paganti === datasets.funnel.paganti ? 'MATCH' : `DIFF: ${paganti} vs ${datasets.funnel.paganti}`}`);

// Test some distribution calculations
console.log('\n=== DISTRIBUTION TESTS ===');
const ateneiCount = {};
const fonteCount = {};

contacts.forEach(contact => {
  // Atenei
  const ateneo = contact.attributes?.ATENEO || 'Non specificato';
  ateneiCount[ateneo] = (ateneiCount[ateneo] || 0) + 1;
  
  // Fonte
  const fonte = contact.attributes?.FONTE || 'Sconosciuta/Non dichiarata';
  fonteCount[fonte] = (fonteCount[fonte] || 0) + 1;
});

console.log(`Atenei count: ${Object.keys(ateneiCount).length}`);
console.log(`Fonte count: ${Object.keys(fonteCount).length}`);
console.log('Top 3 atenei:', Object.entries(ateneiCount).sort((a,b) => b[1] - a[1]).slice(0,3));
console.log('Top 3 fonti:', Object.entries(fonteCount).sort((a,b) => b[1] - a[1]).slice(0,3));
