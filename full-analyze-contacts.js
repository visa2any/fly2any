const fs = require('fs');
const csv = require('fs');

console.log('📊 ANÁLISE COMPLETA DO ARQUIVO ORIGINAL GoogleContact1.csv\n');
console.log('=' .repeat(70));

try {
  // Read the entire file
  const csvContent = fs.readFileSync('C:/Users/Power/Downloads/GoogleContact1.csv', 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📋 Total de linhas no arquivo: ${lines.length}`);
  console.log(`📋 Contatos (excluindo header): ${lines.length - 1}`);
  
  // Parse header
  const header = lines[0];
  console.log(`📋 Tamanho do header: ${header.length} caracteres`);
  
  // Count different types of data
  let stats = {
    totalLines: lines.length - 1,
    withFirstName: 0,
    withEmail: 0,
    withPhone: 0,
    withBrazilianPhone: 0,
    withUSPhone: 0,
    withLabels: 0,
    emptyLines: 0,
    validContacts: 0
  };
  
  let patterns = {
    labels: {},
    domains: {},
    phoneCountries: {}
  };
  
  console.log('\n🔄 Processando arquivo completo...\n');
  
  // Process all lines (sample every 1000th line for performance)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (!line.trim()) {
      stats.emptyLines++;
      continue;
    }
    
    // Simple field extraction (looking for patterns)
    const hasFirstName = line.match(/^[^,]*[A-Za-z]/);
    const emailMatch = line.match(/[\w\.-]+@[\w\.-]+\.\w+/g);
    const phoneMatch = line.match(/(\+\d{1,4}[\s\-\(\)]*\d+[\s\-\(\)]*\d+[\s\-\(\)]*\d*)/g);
    const labelMatch = line.match(/myContacts|CT LIST|Travel|starred/g);
    
    let hasValidData = false;
    
    if (hasFirstName && hasFirstName[0].length > 1) {
      stats.withFirstName++;
      hasValidData = true;
    }
    
    if (emailMatch && emailMatch.length > 0) {
      stats.withEmail++;
      hasValidData = true;
      
      // Collect domain stats
      emailMatch.forEach(email => {
        const domain = email.split('@')[1];
        if (domain) {
          patterns.domains[domain] = (patterns.domains[domain] || 0) + 1;
        }
      });
    }
    
    if (phoneMatch && phoneMatch.length > 0) {
      stats.withPhone++;
      hasValidData = true;
      
      phoneMatch.forEach(phone => {
        if (phone.includes('+55')) {
          stats.withBrazilianPhone++;
          patterns.phoneCountries['Brazil'] = (patterns.phoneCountries['Brazil'] || 0) + 1;
        } else if (phone.includes('+1') || phone.match(/^\(\d{3}\)/) || phone.match(/1-\d{3}-\d{3}-\d{4}/)) {
          stats.withUSPhone++;
          patterns.phoneCountries['USA'] = (patterns.phoneCountries['USA'] || 0) + 1;
        }
      });
    }
    
    if (labelMatch && labelMatch.length > 0) {
      stats.withLabels++;
      labelMatch.forEach(label => {
        patterns.labels[label] = (patterns.labels[label] || 0) + 1;
      });
    }
    
    if (hasValidData) {
      stats.validContacts++;
    }
    
    // Progress indicator for large files
    if (i % 5000 === 0) {
      const progress = ((i / (lines.length - 1)) * 100).toFixed(1);
      console.log(`Progresso: ${progress}% (${i}/${lines.length - 1} contatos processados)`);
    }
  }
  
  console.log('\n📊 ESTATÍSTICAS FINAIS:');
  console.log('=' .repeat(50));
  console.log(`✅ Total de contatos válidos: ${stats.validContacts.toLocaleString()}`);
  console.log(`👤 Com nome: ${stats.withFirstName.toLocaleString()} (${(stats.withFirstName/stats.totalLines*100).toFixed(1)}%)`);
  console.log(`📧 Com email: ${stats.withEmail.toLocaleString()} (${(stats.withEmail/stats.totalLines*100).toFixed(1)}%)`);
  console.log(`📱 Com telefone: ${stats.withPhone.toLocaleString()} (${(stats.withPhone/stats.totalLines*100).toFixed(1)}%)`);
  console.log(`🇧🇷 Telefones brasileiros: ${stats.withBrazilianPhone.toLocaleString()}`);
  console.log(`🇺🇸 Telefones americanos: ${stats.withUSPhone.toLocaleString()}`);
  console.log(`🏷️  Com labels: ${stats.withLabels.toLocaleString()}`);
  console.log(`❌ Linhas vazias: ${stats.emptyLines.toLocaleString()}`);
  
  console.log('\n🔝 TOP LABELS:');
  Object.entries(patterns.labels)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([label, count]) => {
      console.log(`  "${label}": ${count.toLocaleString()}`);
    });
  
  console.log('\n🌍 TELEFONES POR PAÍS:');
  Object.entries(patterns.phoneCountries)
    .sort(([,a], [,b]) => b - a)
    .forEach(([country, count]) => {
      console.log(`  ${country}: ${count.toLocaleString()}`);
    });
  
  console.log('\n📧 TOP DOMÍNIOS DE EMAIL:');
  Object.entries(patterns.domains)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count.toLocaleString()}`);
    });
  
  console.log('\n🔍 COMPARAÇÃO COM DADOS PROCESSADOS:');
  console.log('=' .repeat(50));
  console.log(`📊 Arquivo original: ${stats.validContacts.toLocaleString()} contatos válidos`);
  console.log(`📊 Dados processados: 3.258 contatos limpos`);
  console.log(`📉 Redução: ${(((stats.validContacts - 3258) / stats.validContacts) * 100).toFixed(1)}%`);
  console.log(`🎯 Taxa de aproveitamento: ${((3258 / stats.validContacts) * 100).toFixed(1)}%`);
  
} catch (error) {
  console.error('❌ Erro ao processar arquivo:', error.message);
}

console.log('\n✅ ANÁLISE COMPLETA FINALIZADA');