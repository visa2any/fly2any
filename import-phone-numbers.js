const fs = require('fs');

class PhoneNumberImporter {
  constructor() {
    this.imported = 0;
    this.errors = 0;
    this.duplicates = 0;
  }

  // Mapear state para timezone
  getTimezone(state) {
    const timezones = {
      'Connecticut': 'America/New_York',
      'Florida': 'America/New_York', 
      'Massachusetts': 'America/New_York',
      'New Jersey': 'America/New_York',
      'New York': 'America/New_York',
      'Pennsylvania': 'America/New_York',
      'California': 'America/Los_Angeles',
      'Georgia': 'America/New_York',
      'Illinois': 'America/Chicago',
      'Texas': 'America/Chicago',
      'Washington': 'America/Los_Angeles'
    };
    return timezones[state] || 'America/New_York';
  }

  // Detectar segmento baseado no nome/perfil
  detectSegment(name, state) {
    const nameLower = name.toLowerCase();
    
    // Brasileiros nos EUA (pela concentração de estados)
    if (['Connecticut', 'Florida', 'Massachusetts', 'New Jersey'].includes(state)) {
      return 'brasileiros-eua';
    }
    
    // Executivos (nomes mais formais)
    if (nameLower.includes('corporation') || nameLower.includes('company') || 
        nameLower.includes('inc') || nameLower.includes('llc')) {
      return 'executivos';
    }
    
    // Famílias (múltiplos nomes/sobrenomes)
    const parts = name.split(' ');
    if (parts.length >= 3) {
      return 'familias';
    }
    
    return 'geral';
  }

  // Gerar lead score baseado em critérios
  calculateLeadScore(contact) {
    let score = 50; // Base score
    
    // State bonus (comunidades brasileiras)
    if (contact.state === 'Connecticut') score += 30;
    else if (contact.state === 'Florida') score += 25;
    else if (contact.state === 'Massachusetts') score += 20;
    else if (contact.state === 'New Jersey') score += 15;
    
    // Name quality (não muito genérico)
    if (contact.name.split(' ').length >= 2) score += 10;
    
    // Phone format quality
    if (contact.formatted_phone.includes('(') && contact.formatted_phone.includes(')')) {
      score += 5;
    }
    
    // Segment bonus
    if (contact.segment === 'brasileiros-eua') score += 15;
    else if (contact.segment === 'executivos') score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result.map(field => field.replace(/"/g, '').trim());
  }

  async importFromStateFiles() {
    console.log('📱 Importando números organizados por estado...\n');

    const stateFiles = [
      'contacts_connecticut_2025-07-12.csv',
      'contacts_florida_2025-07-12.csv', 
      'contacts_massachusetts_2025-07-12.csv',
      'contacts_new_jersey_2025-07-12.csv',
      'contacts_new_york_2025-07-12.csv',
      'contacts_california_2025-07-12.csv',
      'contacts_georgia_2025-07-12.csv',
      'contacts_pennsylvania_2025-07-12.csv'
    ];

    const allContacts = [];
    const phoneSet = new Set();

    for (const fileName of stateFiles) {
      if (!fs.existsSync(`./${fileName}`)) {
        console.log(`⚠️ Arquivo não encontrado: ${fileName}`);
        continue;
      }

      try {
        console.log(`📂 Processando: ${fileName}`);
        const csvContent = fs.readFileSync(`./${fileName}`, 'utf8');
        const lines = csvContent.split('\n').filter(line => line.trim());
        
        if (lines.length <= 1) continue;

        const state = fileName.split('_')[1].replace(/^\w/, c => c.toUpperCase());
        let stateCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const parts = this.parseCSVLine(lines[i]);
          
          if (parts.length >= 4) {
            const [nome, telefone, telefoneFormatado, areaCode] = parts;
            
            if (telefone && nome && !phoneSet.has(telefone)) {
              phoneSet.add(telefone);
              
              const contact = {
                phone: telefone,
                formatted_phone: telefoneFormatado || telefone,
                name: nome,
                state: state.replace('_', ' '),
                area_code: areaCode || telefone.substring(2, 5), // Extract from +1XXXYYY....
                city: null,
                timezone: this.getTimezone(state.replace('_', ' ')),
                is_validated: false,
                validation_result: null,
                is_active: true,
                carrier: null,
                line_type: 'mobile',
                segment: this.detectSegment(nome, state.replace('_', ' ')),
                tags: [state.replace('_', ' '), 'imported_2025'],
                customer_profile: null,
                notes: `Imported from ${fileName}`,
                opted_out: false,
                opt_out_date: null,
                consent_date: new Date().toISOString(),
                last_contact_date: null,
                total_campaigns: 0,
                response_rate: 0,
                conversion_rate: 0,
                lead_score: 0 // Will calculate after
              };

              // Calculate lead score
              contact.lead_score = this.calculateLeadScore(contact);
              
              allContacts.push(contact);
              stateCount++;
            }
          }
        }

        console.log(`✅ ${state}: ${stateCount} contatos processados`);
        
      } catch (error) {
        console.error(`❌ Erro processando ${fileName}:`, error.message);
        this.errors++;
      }
    }

    // Generate SQL import script
    await this.generateSQLScript(allContacts);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA IMPORTAÇÃO');
    console.log('='.repeat(60));
    console.log(`✅ Total de contatos processados: ${allContacts.length.toLocaleString()}`);
    console.log(`❌ Erros: ${this.errors}`);
    console.log(`🔄 Duplicatas evitadas: ${this.duplicates}`);
    
    // Stats por estado
    const stateStats = {};
    allContacts.forEach(contact => {
      stateStats[contact.state] = (stateStats[contact.state] || 0) + 1;
    });

    console.log('\n📍 POR ESTADO:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count.toLocaleString()}`);
      });

    // Stats por segmento
    const segmentStats = {};
    allContacts.forEach(contact => {
      segmentStats[contact.segment] = (segmentStats[contact.segment] || 0) + 1;
    });

    console.log('\n🎯 POR SEGMENTO:');
    Object.entries(segmentStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([segment, count]) => {
        console.log(`   ${segment}: ${count.toLocaleString()}`);
      });

    // Lead score distribution
    const scoreRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0
    };

    allContacts.forEach(contact => {
      if (contact.lead_score >= 90) scoreRanges['90-100']++;
      else if (contact.lead_score >= 80) scoreRanges['80-89']++;
      else if (contact.lead_score >= 70) scoreRanges['70-79']++;
      else if (contact.lead_score >= 60) scoreRanges['60-69']++;
      else scoreRanges['Below 60']++;
    });

    console.log('\n📈 LEAD SCORE DISTRIBUTION:');
    Object.entries(scoreRanges).forEach(([range, count]) => {
      console.log(`   ${range}: ${count.toLocaleString()}`);
    });

    return allContacts;
  }

  async generateSQLScript(contacts) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      let sqlScript = `-- Phone Numbers Import Script
-- Generated: ${new Date().toLocaleString()}
-- Total contacts: ${contacts.length.toLocaleString()}

-- Initialize tables first
-- Run this in your database before the inserts

-- Create phone_contacts table (if not exists)
-- See phone-database.ts for complete schema

-- Insert contacts
BEGIN;

`;

      // Process in batches of 100 for better performance
      const batchSize = 100;
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        
        batch.forEach(contact => {
          sqlScript += `INSERT INTO phone_contacts (
  phone, formatted_phone, name, state, area_code, city, timezone,
  is_validated, validation_result, is_active, carrier, line_type,
  segment, tags, customer_profile, notes,
  opted_out, opt_out_date, consent_date, last_contact_date,
  total_campaigns, response_rate, conversion_rate, lead_score
) VALUES (
  '${contact.phone.replace(/'/g, "''")}',
  '${contact.formatted_phone.replace(/'/g, "''")}',
  '${contact.name.replace(/'/g, "''")}',
  '${contact.state}',
  '${contact.area_code}',
  ${contact.city ? `'${contact.city}'` : 'NULL'},
  '${contact.timezone}',
  ${contact.is_validated},
  ${contact.validation_result ? `'${JSON.stringify(contact.validation_result).replace(/'/g, "''")}'` : 'NULL'},
  ${contact.is_active},
  ${contact.carrier ? `'${contact.carrier}'` : 'NULL'},
  '${contact.line_type}',
  '${contact.segment}',
  '${JSON.stringify(contact.tags).replace(/'/g, "''")}',
  ${contact.customer_profile ? `'${JSON.stringify(contact.customer_profile).replace(/'/g, "''")}'` : 'NULL'},
  '${contact.notes.replace(/'/g, "''")}',
  ${contact.opted_out},
  ${contact.opt_out_date ? `'${contact.opt_out_date}'` : 'NULL'},
  '${contact.consent_date}',
  ${contact.last_contact_date ? `'${contact.last_contact_date}'` : 'NULL'},
  ${contact.total_campaigns},
  ${contact.response_rate},
  ${contact.conversion_rate},
  ${contact.lead_score}
) ON CONFLICT (phone) DO UPDATE SET
  name = EXCLUDED.name,
  formatted_phone = EXCLUDED.formatted_phone,
  state = EXCLUDED.state,
  area_code = EXCLUDED.area_code,
  segment = EXCLUDED.segment,
  tags = EXCLUDED.tags,
  lead_score = EXCLUDED.lead_score,
  updated_at = NOW();

`;
        });

        if ((i + batchSize) % 1000 === 0) {
          sqlScript += `-- Batch ${Math.floor(i / 1000) + 1} completed\n\n`;
        }
      }

      sqlScript += `
COMMIT;

-- Verify import
SELECT 
  state,
  COUNT(*) as total,
  AVG(lead_score) as avg_score
FROM phone_contacts 
GROUP BY state 
ORDER BY total DESC;

-- Check segments
SELECT 
  segment,
  COUNT(*) as total
FROM phone_contacts 
GROUP BY segment 
ORDER BY total DESC;
`;

      fs.writeFileSync(`./phone-import-${timestamp}.sql`, sqlScript);
      console.log(`\n✅ Script SQL gerado: phone-import-${timestamp}.sql`);
      
    } catch (error) {
      console.error('❌ Erro ao gerar script SQL:', error);
    }
  }
}

// Executar importação
const importer = new PhoneNumberImporter();
importer.importFromStateFiles()
  .then(contacts => {
    console.log('\n🎉 Importação concluída com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Execute o script SQL no banco de dados');
    console.log('   2. Teste a interface de phone management');
    console.log('   3. Configure validação de números');
    console.log('   4. Crie listas iniciais para campanhas');
  })
  .catch(error => {
    console.error('\n💥 Falha na importação:', error);
  });