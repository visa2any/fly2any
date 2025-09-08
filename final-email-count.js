const fs = require('fs');

console.log('📊 CONTAGEM FINAL DE EMAILS PARA EMAIL MARKETING');
console.log('=' .repeat(60));

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && 
         !email.includes('2222') && 
         !email.match(/^[A-Z\s]+$/) && 
         email.length < 60 && 
         !email.includes(' ');
}

try {
  // Read the comprehensive email file
  const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-only.csv', 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  let totalUsableEmails = 0;
  let totalContacts = lines.length - 1;
  let domains = {};
  let segments = {};
  
  console.log(`📋 Arquivo analisado: contacts-emails-only.csv`);
  console.log(`📋 Total de contatos no arquivo: ${totalContacts}`);
  
  // Analyze each contact
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    if (fields.length >= 2) {
      const email = fields[1].replace(/"/g, '').trim();
      const name = fields[0].replace(/"/g, '').trim();
      const segment = fields[3] ? fields[3].replace(/"/g, '').trim() : 'geral';
      
      if (email && isValidEmail(email)) {
        totalUsableEmails++;
        
        // Count domains
        const domain = email.split('@')[1];
        if (domain) {
          domains[domain] = (domains[domain] || 0) + 1;
        }
        
        // Count segments
        segments[segment] = (segments[segment] || 0) + 1;
      }
    }
  }
  
  console.log('\n🎯 RESULTADO FINAL:');
  console.log(`✅ TOTAL DE EMAILS UTILIZÁVEIS: ${totalUsableEmails.toLocaleString()}`);
  console.log(`📊 Taxa de aproveitamento: ${(totalUsableEmails/totalContacts*100).toFixed(1)}%`);
  
  console.log('\n📧 DISTRIBUIÇÃO POR DOMÍNIOS:');
  Object.entries(domains)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .forEach(([domain, count], index) => {
      const percentage = (count/totalUsableEmails*100).toFixed(1);
      console.log(`   ${index + 1}. ${domain}: ${count} (${percentage}%)`);
    });
  
  console.log('\n🎯 SEGMENTAÇÃO:');
  Object.entries(segments)
    .sort(([,a], [,b]) => b - a)
    .forEach(([segment, count]) => {
      const percentage = (count/totalUsableEmails*100).toFixed(1);
      console.log(`   ${segment}: ${count} (${percentage}%)`);
    });
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 RESUMO EXECUTIVO:');
  console.log(`📊 Base de email marketing: ${totalUsableEmails.toLocaleString()} contatos`);
  console.log(`🎯 Público-alvo: Brasileiros nos EUA`);
  console.log(`📈 Qualidade: ${(totalUsableEmails/totalContacts*100).toFixed(1)}% de aproveitamento`);
  console.log(`🚀 Status: PRONTO PARA CAMPANHAS!`);
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}

console.log('\n✅ CONTAGEM FINAL CONCLUÍDA');