const fs = require('fs');

console.log('📧 CONTANDO EMAILS VÁLIDOS PARA EMAIL MARKETING\n');

// Read the email contacts file
const csvContent = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-final-2025-07-12.csv', 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log(`Total de linhas no arquivo: ${lines.length}`);
console.log(`Contatos (sem header): ${lines.length - 1}`);

let validEmails = 0;
let emailDomains = {};

// Process each contact
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const fields = line.split(',');
  
  if (fields.length >= 2) {
    const email = fields[1].replace(/"/g, '').trim();
    
    if (email && email.includes('@') && email.includes('.')) {
      validEmails++;
      
      // Count domains
      const domain = email.split('@')[1];
      if (domain) {
        emailDomains[domain] = (emailDomains[domain] || 0) + 1;
      }
    }
  }
}

console.log(`\n✅ TOTAL DE EMAILS VÁLIDOS: ${validEmails}`);
console.log(`📊 Taxa de validade: ${((validEmails / (lines.length - 1)) * 100).toFixed(1)}%`);

console.log('\n🏆 TOP 10 DOMÍNIOS DE EMAIL:');
Object.entries(emailDomains)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .forEach(([domain, count]) => {
    console.log(`   ${domain}: ${count} emails`);
  });

console.log('\n🎯 RESUMO PARA EMAIL MARKETING:');
console.log(`📧 Emails prontos para campanhas: ${validEmails}`);
console.log('🚀 Status: PRONTO PARA IMPORTAR NO SISTEMA!');