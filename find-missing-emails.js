const fs = require('fs');

console.log('🔍 INVESTIGANDO EMAILS PERDIDOS NO PROCESSAMENTO\n');
console.log('=' .repeat(60));

// Read the ORIGINAL Google Contacts file
console.log('📂 Analisando arquivo ORIGINAL: GoogleContact1.csv');
try {
  const originalContent = fs.readFileSync('C:/Users/Power/Downloads/GoogleContact1.csv', 'utf8');
  const originalLines = originalContent.split('\n').filter(line => line.trim());
  
  let originalStats = {
    totalContacts: originalLines.length - 1,
    withEmails: 0,
    validEmails: [],
    emailDomains: {}
  };
  
  console.log(`📋 Total de linhas no original: ${originalLines.length}`);
  console.log(`📋 Total de contatos: ${originalStats.totalContacts}`);
  
  // Extract emails from original file
  // Google Contacts format: E-mail 1 - Value is typically column 18 (index 18)
  for (let i = 1; i < originalLines.length && i < 1000; i++) { // Sample first 1000 for speed
    const line = originalLines[i];
    
    // Look for email patterns in the entire line
    const emailMatches = line.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
    
    if (emailMatches && emailMatches.length > 0) {
      originalStats.withEmails++;
      emailMatches.forEach(email => {
        if (email && !originalStats.validEmails.includes(email)) {
          originalStats.validEmails.push(email);
          const domain = email.split('@')[1];
          if (domain) {
            originalStats.emailDomains[domain] = (originalStats.emailDomains[domain] || 0) + 1;
          }
        }
      });
    }
  }
  
  console.log(`\n📧 ORIGINAL FILE ANALYSIS (First 1000 contacts):`);
  console.log(`   Contacts with emails: ${originalStats.withEmails}`);
  console.log(`   Unique emails found: ${originalStats.validEmails.length}`);
  console.log(`   Percentage with emails: ${(originalStats.withEmails/1000*100).toFixed(1)}%`);
  
  // Extrapolate to full file
  const estimatedTotalEmails = Math.round((originalStats.withEmails / 1000) * originalStats.totalContacts);
  console.log(`\n📊 EXTRAPOLATED TO FULL FILE:`);
  console.log(`   Estimated total emails: ${estimatedTotalEmails.toLocaleString()}`);
  console.log(`   Estimated percentage: ${(estimatedTotalEmails/originalStats.totalContacts*100).toFixed(1)}%`);

} catch (error) {
  console.error('❌ Error reading original file:', error.message);
}

// Read the PROCESSED file
console.log('\n📂 Analisando arquivo PROCESSADO: contacts-emails-final-2025-07-12.csv');
try {
  const processedContent = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-final-2025-07-12.csv', 'utf8');
  const processedLines = processedContent.split('\n').filter(line => line.trim());
  
  console.log(`📋 Contatos processados: ${processedLines.length - 1}`);
  
} catch (error) {
  console.error('❌ Error reading processed file:', error.message);
}

// Check other CSV files that might contain emails
console.log('\n🔍 VERIFICANDO OUTROS ARQUIVOS DE EMAIL:');
const emailFiles = [
  'contacts-emails-only.csv',
  'contacts.csv',
  'contacts1.csv'
];

emailFiles.forEach(filename => {
  try {
    const filePath = `C:/Users/Power/fly2any/${filename}`;
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      console.log(`   📄 ${filename}: ${lines.length - 1} contatos`);
      
      // Count emails in first 10 lines to check format
      let emailCount = 0;
      for (let i = 1; i < Math.min(11, lines.length); i++) {
        if (lines[i].match(/[\w\.-]+@[\w\.-]+\.\w+/)) {
          emailCount++;
        }
      }
      console.log(`      Sample emails found: ${emailCount}/10`);
    } else {
      console.log(`   📄 ${filename}: Arquivo não encontrado`);
    }
  } catch (error) {
    console.log(`   📄 ${filename}: Erro ao ler - ${error.message}`);
  }
});

console.log('\n🚨 CONCLUSÃO PRELIMINAR:');
console.log('   Há uma discrepância significativa entre o arquivo original');
console.log('   e os dados processados. Investigação mais profunda necessária.');

console.log('\n✅ ANÁLISE CONCLUÍDA - AGUARDANDO INVESTIGAÇÃO COMPLETA');