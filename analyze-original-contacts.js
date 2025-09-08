const fs = require('fs');

// Read the original Google Contacts CSV
const csvContent = fs.readFileSync('C:/Users/Power/Downloads/GoogleContact1.csv', 'utf8');
const lines = csvContent.split('\n');

console.log('📊 ANÁLISE DO ARQUIVO ORIGINAL GoogleContact1.csv\n');
console.log('=' .repeat(60));

// Basic stats
console.log(`📋 Total de linhas: ${lines.length}`);
console.log(`📋 Total de contatos (sem header): ${lines.length - 1}`);

// Parse header to understand structure
const header = lines[0].split(',');
console.log(`📋 Colunas identificadas: ${header.length}`);

// Count non-empty contacts (with at least name OR email OR phone)
let validContacts = 0;
let withNames = 0;
let withEmails = 0;
let withPhones = 0;
let withBrazilianPhones = 0;
let withUSPhones = 0;
let emptyRows = 0;

// Sample data for analysis
const sampleContacts = [];

for (let i = 1; i < lines.length && i < 100; i++) {
  const fields = lines[i].split(',');
  
  if (fields.length > 1) {
    const firstName = fields[0] ? fields[0].replace(/"/g, '').trim() : '';
    const email = fields[18] ? fields[18].replace(/"/g, '').trim() : '';  // E-mail 1 - Value
    const phone = fields[24] ? fields[24].replace(/"/g, '').trim() : '';   // Phone 1 - Value
    const labels = fields[16] ? fields[16].replace(/"/g, '').trim() : '';  // Labels
    
    if (firstName || email || phone) {
      if (i <= 20) {  // Store first 20 for sample
        sampleContacts.push({
          line: i,
          name: firstName,
          email: email,
          phone: phone,
          labels: labels
        });
      }
      
      validContacts++;
      
      if (firstName) withNames++;
      if (email && email.includes('@')) withEmails++;
      if (phone) {
        withPhones++;
        if (phone.includes('+55')) withBrazilianPhones++;
        if (phone.includes('+1') || phone.match(/^\(\d{3}\)/)) withUSPhones++;
      }
    } else {
      emptyRows++;
    }
  }
}

console.log('\n📊 ESTATÍSTICAS DETALHADAS:');
console.log(`✅ Contatos com dados válidos: ${validContacts}`);
console.log(`👤 Contatos com nomes: ${withNames}`);
console.log(`📧 Contatos com emails: ${withEmails}`);
console.log(`📱 Contatos com telefones: ${withPhones}`);
console.log(`🇧🇷 Telefones brasileiros (+55): ${withBrazilianPhones}`);
console.log(`🇺🇸 Telefones americanos (+1): ${withUSPhones}`);
console.log(`❌ Linhas vazias: ${emptyRows}`);

console.log('\n📝 AMOSTRA DOS PRIMEIROS CONTATOS:');
console.log('=' .repeat(60));
sampleContacts.forEach(contact => {
  console.log(`Linha ${contact.line}: ${contact.name}`);
  console.log(`  Email: ${contact.email}`);
  console.log(`  Phone: ${contact.phone}`);
  console.log(`  Labels: ${contact.labels}`);
  console.log('---');
});

// Identify key patterns
console.log('\n🔍 PADRÕES IDENTIFICADOS:');
const labelPatterns = {};
sampleContacts.forEach(contact => {
  if (contact.labels) {
    const labels = contact.labels.split(':::').map(l => l.trim());
    labels.forEach(label => {
      labelPatterns[label] = (labelPatterns[label] || 0) + 1;
    });
  }
});

console.log('📋 Labels mais comuns:');
Object.entries(labelPatterns)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .forEach(([label, count]) => {
    console.log(`  - "${label}": ${count} vezes`);
  });

console.log('\n✅ ANÁLISE CONCLUÍDA');