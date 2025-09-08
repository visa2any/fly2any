const fs = require('fs');

console.log('📧 ANALISANDO OS 2,506 EMAILS EXTRAÍDOS - PODEM SER USADOS?');
console.log('=' .repeat(60));

// Helper function to validate email more permissively
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to detect corrupted emails
function isCorrupted(email) {
  const corruptedPatterns = [
    /2222+/,           // Multiple 2s pattern
    /hw32a/,           // Specific corruption pattern
    /^[A-Z\s]+$/,      // All caps words (likely city names)
    /.{60,}/,          // Too long emails
    /\s+/              // Contains spaces
  ];
  
  return corruptedPatterns.some(pattern => pattern.test(email));
}

// Read the 2,506 emails file
try {
  const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-only.csv', 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log(`📋 Total de linhas: ${lines.length}`);
  console.log(`📋 Total de contatos: ${lines.length - 1}`);
  
  let stats = {
    total: lines.length - 1,
    perfect: 0,        // Clean, valid emails
    fixable: 0,        // Emails with minor issues we can fix
    corrupted: 0,      // Corrupted beyond repair
    invalid: 0,        // Invalid format
    empty: 0,          // Empty emails
    domains: {},
    issues: []
  };
  
  let perfectEmails = [];
  let fixableEmails = [];
  let corruptedExamples = [];
  
  // Analyze each email
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    if (fields.length >= 2) {
      const rawEmail = fields[1].replace(/"/g, '').trim();
      const name = fields[0].replace(/"/g, '').trim();
      
      if (!rawEmail) {
        stats.empty++;
        continue;
      }
      
      // Check if corrupted
      if (isCorrupted(rawEmail)) {
        stats.corrupted++;
        if (corruptedExamples.length < 10) {
          corruptedExamples.push({ name, email: rawEmail, line: i + 1 });
        }
        continue;
      }
      
      // Check if valid email format
      if (!isValidEmail(rawEmail)) {
        stats.invalid++;
        if (corruptedExamples.length < 15) {
          corruptedExamples.push({ name, email: rawEmail, line: i + 1, type: 'invalid' });
        }
        continue;
      }
      
      // Check for fixable issues
      let fixedEmail = rawEmail.toLowerCase().trim();
      
      // Common fixes
      if (fixedEmail.includes('hotmailcom') && !fixedEmail.includes('.com')) {
        fixedEmail = fixedEmail.replace('hotmailcom', 'hotmail.com');
        stats.fixable++;
        fixableEmails.push({ original: rawEmail, fixed: fixedEmail, name });
      } else if (fixedEmail.includes('gmailcom') && !fixedEmail.includes('.com')) {
        fixedEmail = fixedEmail.replace('gmailcom', 'gmail.com');
        stats.fixable++;
        fixableEmails.push({ original: rawEmail, fixed: fixedEmail, name });
      } else {
        // Perfect email
        stats.perfect++;
        if (perfectEmails.length < 20) {
          perfectEmails.push({ email: fixedEmail, name });
        }
      }
      
      // Count domains
      const domain = fixedEmail.split('@')[1];
      if (domain) {
        stats.domains[domain] = (stats.domains[domain] || 0) + 1;
      }
    }
  }
  
  console.log('\n📊 ANÁLISE DE QUALIDADE DOS 2,506 EMAILS:');
  console.log(`✅ Emails perfeitos (prontos): ${stats.perfect.toLocaleString()}`);
  console.log(`🔧 Emails corrigíveis: ${stats.fixable.toLocaleString()}`);
  console.log(`❌ Emails corrompidos: ${stats.corrupted.toLocaleString()}`);
  console.log(`⚠️  Formato inválido: ${stats.invalid.toLocaleString()}`);
  console.log(`⚪ Emails vazios: ${stats.empty.toLocaleString()}`);
  
  const usableEmails = stats.perfect + stats.fixable;
  console.log(`\n🎯 TOTAL UTILIZÁVEL: ${usableEmails.toLocaleString()} emails (${(usableEmails/stats.total*100).toFixed(1)}%)`);
  
  console.log('\n🏆 TOP 10 DOMÍNIOS:');
  Object.entries(stats.domains)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([domain, count]) => {
      console.log(`   ${domain}: ${count}`);
    });
  
  if (fixableEmails.length > 0) {
    console.log('\n🔧 EXEMPLOS DE EMAILS CORRIGÍVEIS:');
    fixableEmails.slice(0, 5).forEach(item => {
      console.log(`   "${item.name}": ${item.original} → ${item.fixed}`);
    });
  }
  
  if (corruptedExamples.length > 0) {
    console.log('\n💀 EXEMPLOS DE EMAILS PROBLEMÁTICOS:');
    corruptedExamples.slice(0, 10).forEach(item => {
      console.log(`   Linha ${item.line}: "${item.name}" - ${item.email}`);
    });
  }
  
  console.log('\n🎯 RECOMENDAÇÃO:');
  if (usableEmails > 2000) {
    console.log(`✅ USAR OS ${usableEmails.toLocaleString()} EMAILS!`);
    console.log('   Aplicar correções automáticas aos emails corrigíveis');
    console.log('   Remover apenas os corrompidos/inválidos');
    console.log(`   Ganho: +${usableEmails - 1813} emails adicionais`);
  } else {
    console.log('⚠️  Manter apenas os 1,813 emails já limpos');
  }
  
} catch (error) {
  console.error('❌ Erro ao analisar arquivo:', error.message);
}

console.log('\n✅ ANÁLISE DOS 2,506 EMAILS CONCLUÍDA');