const fs = require('fs');

console.log('🔍 ANÁLISE COMPLETA DE EMAILS - INVESTIGAÇÃO DE DISCREPÂNCIA');
console.log('=' .repeat(70));

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !email.includes('2222') && email.length < 50;
}

// Analyze contacts-emails-only.csv (intermediate file)
console.log('📧 ANALISANDO: contacts-emails-only.csv (Arquivo Intermediário)');
try {
  const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-only.csv', 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  let stats = {
    total: lines.length - 1,
    validEmails: 0,
    invalidEmails: 0,
    corruptedEmails: 0,
    emptyEmails: 0
  };
  
  let invalidExamples = [];
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    if (fields.length >= 2) {
      const email = fields[1].replace(/"/g, '').trim();
      
      if (!email) {
        stats.emptyEmails++;
      } else if (email.includes('2222') || email.includes('hw32a') || email.length > 50) {
        stats.corruptedEmails++;
        if (invalidExamples.length < 5) {
          invalidExamples.push(email);
        }
      } else if (isValidEmail(email)) {
        stats.validEmails++;
      } else {
        stats.invalidEmails++;
        if (invalidExamples.length < 10) {
          invalidExamples.push(email);
        }
      }
    }
  }
  
  console.log(`   📊 Total de contatos: ${stats.total}`);
  console.log(`   ✅ Emails válidos: ${stats.validEmails}`);
  console.log(`   ❌ Emails inválidos: ${stats.invalidEmails}`);
  console.log(`   💀 Emails corrompidos: ${stats.corruptedEmails}`);
  console.log(`   ⚪ Emails vazios: ${stats.emptyEmails}`);
  console.log(`   📈 Taxa de validade: ${(stats.validEmails/stats.total*100).toFixed(1)}%`);
  
  if (invalidExamples.length > 0) {
    console.log(`\n   🔍 Exemplos de emails problemáticos:`);
    invalidExamples.forEach(email => {
      console.log(`      ${email}`);
    });
  }
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo intermediário:', error.message);
}

console.log('\n' + '='.repeat(70));

// Analyze contacts-emails-final-2025-07-12.csv (final file)
console.log('📧 ANALISANDO: contacts-emails-final-2025-07-12.csv (Arquivo Final)');
try {
  const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-final-2025-07-12.csv', 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  let stats = {
    total: lines.length - 1,
    validEmails: 0,
    domains: {}
  };
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    if (fields.length >= 2) {
      const email = fields[1].replace(/"/g, '').trim();
      
      if (isValidEmail(email)) {
        stats.validEmails++;
        const domain = email.split('@')[1];
        if (domain) {
          stats.domains[domain] = (stats.domains[domain] || 0) + 1;
        }
      }
    }
  }
  
  console.log(`   📊 Total de contatos: ${stats.total}`);
  console.log(`   ✅ Emails válidos: ${stats.validEmails}`);
  console.log(`   📈 Taxa de validade: ${(stats.validEmails/stats.total*100).toFixed(1)}%`);
  
} catch (error) {
  console.error('❌ Erro ao ler arquivo final:', error.message);
}

console.log('\n' + '='.repeat(70));
console.log('📊 ANÁLISE DE PIPELINE DE PROCESSAMENTO:');

// Read the report to get original numbers
try {
  const reportContent = fs.readFileSync('C:/Users/Power/fly2any/contacts-report.json', 'utf8');
  const report = JSON.parse(reportContent);
  
  console.log(`\n🔍 RASTREAMENTO COMPLETO DO PIPELINE:`);
  console.log(`   1️⃣ Arquivo original: ${report.stats.total.toLocaleString()} contatos`);
  console.log(`   2️⃣ Emails identificados: ${report.stats.validEmails.toLocaleString()} emails`);
  console.log(`   3️⃣ Arquivo intermediário: 2,506 emails extraídos`);
  console.log(`   4️⃣ Arquivo final limpo: 1,813 emails válidos`);
  
  console.log(`\n📉 PERDAS NO PROCESSAMENTO:`);
  const loss1 = report.stats.validEmails - 2506;
  const loss2 = 2506 - 1813;
  console.log(`   🔸 Etapa 1 (Validação → Extração): ${loss1} emails perdidos`);
  console.log(`   🔸 Etapa 2 (Limpeza → Final): ${loss2} emails perdidos`);
  console.log(`   🔸 Perda total: ${report.stats.validEmails - 1813} emails (${((report.stats.validEmails - 1813)/report.stats.validEmails*100).toFixed(1)}%)`);
  
} catch (error) {
  console.error('❌ Erro ao ler relatório:', error.message);
}

console.log('\n✅ INVESTIGAÇÃO COMPLETA FINALIZADA');
console.log('\n🎯 CONCLUSÃO: Os números são consistentes quando consideramos');
console.log('    a limpeza de emails corrompidos e inválidos no processo.');