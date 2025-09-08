const fs = require('fs');
require('dotenv').config();
const { sql } = require('@vercel/postgres');

/**
 * 📧 IMPORTADOR DE CONTATOS PARA EMAIL MARKETING
 * Importa os 2,498 emails válidos para o banco de dados
 */

// Helper function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && 
         !email.includes('2222') && 
         !email.match(/^[A-Z\s]+$/) && 
         email.length < 60 && 
         !email.includes(' ');
}

// Helper function to generate ID
function generateContactId() {
  return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to clean name
function cleanName(name) {
  return name
    .replace(/[^\w\s\-\.]/g, ' ')  // Remove special chars except basic ones
    .replace(/\s+/g, ' ')          // Multiple spaces to single
    .trim()
    .substring(0, 100);            // Limit length
}

async function importContactsToDatabase() {
  console.log('🚀 INICIANDO IMPORTAÇÃO DE 2,498 EMAILS PARA O BANCO DE DADOS');
  console.log('=' .repeat(70));
  
  try {
    // Read the email contacts file
    const content = fs.readFileSync('C:/Users/Power/fly2any/contacts-emails-only.csv', 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    let stats = {
      total: lines.length - 1,
      imported: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0
    };
    
    console.log(`📋 Total de contatos para processar: ${stats.total}`);
    console.log('\n🔄 Iniciando importação...\n');
    
    // Process in batches for better performance
    const batchSize = 50;
    let batch = [];
    let batchNumber = 1;
    
    for (let i = 1; i < lines.length; i++) {
      const fields = lines[i].split(',');
      
      if (fields.length >= 2) {
        const email = fields[1].replace(/"/g, '').trim();
        const rawName = fields[0].replace(/"/g, '').trim();
        const segment = fields[3] ? fields[3].replace(/"/g, '').trim() : 'brasileiros-eua';
        const phone = fields[2] ? fields[2].replace(/"/g, '').trim() : '';
        
        // Validate email
        if (!email || !isValidEmail(email)) {
          stats.skipped++;
          continue;
        }
        
        // Clean and prepare data
        const firstName = cleanName(rawName.split(' ')[0] || '');
        const lastName = cleanName(rawName.split(' ').slice(1).join(' ') || '');
        const tags = [segment, 'imported', 'brazilian-american'];
        
        // Add to batch
        batch.push({
          id: generateContactId(),
          email: email.toLowerCase(),
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          tags: JSON.stringify(tags),
          segment: segment,
          emailStatus: 'active',
          subscriptionDate: new Date().toISOString(),
          source: 'csv_import_2025',
          engagementScore: 0
        });
        
        // Process batch when full
        if (batch.length >= batchSize) {
          await processBatch(batch, batchNumber, stats);
          batch = [];
          batchNumber++;
        }
      }
    }
    
    // Process remaining batch
    if (batch.length > 0) {
      await processBatch(batch, batchNumber, stats);
    }
    
    console.log('\n✅ IMPORTAÇÃO CONCLUÍDA!');
    console.log('=' .repeat(50));
    console.log(`📊 Contatos importados: ${stats.imported}`);
    console.log(`⚠️  Contatos ignorados: ${stats.skipped}`);
    console.log(`❌ Erros: ${stats.errors}`);
    console.log(`🔄 Duplicatas: ${stats.duplicates}`);
    console.log(`📈 Taxa de sucesso: ${(stats.imported/stats.total*100).toFixed(1)}%`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    throw error;
  }
}

async function processBatch(batch, batchNumber, stats) {
  try {
    console.log(`📦 Processando lote ${batchNumber} (${batch.length} contatos)...`);
    
    for (const contact of batch) {
      try {
        // Check for existing email
        const existing = await sql`
          SELECT id FROM email_contacts WHERE email = ${contact.email}
        `;
        
        if (existing.rows.length > 0) {
          stats.duplicates++;
          continue;
        }
        
        // Insert contact
        await sql`
          INSERT INTO email_contacts (
            id, email, nome, sobrenome, telefone,
            segmento, email_status, tags, status,
            created_at, updated_at
          ) VALUES (
            ${contact.id},
            ${contact.email},
            ${contact.firstName},
            ${contact.lastName},
            ${contact.phone},
            ${contact.segment},
            ${contact.emailStatus},
            ${contact.tags},
            'active',
            ${new Date().toISOString()},
            ${new Date().toISOString()}
          )
        `;
        
        stats.imported++;
        
      } catch (error) {
        console.error(`❌ Erro ao importar contato ${contact.email}:`, error.message);
        stats.errors++;
      }
    }
    
    console.log(`   ✅ Lote ${batchNumber} processado - ${stats.imported} importados até agora`);
    
  } catch (error) {
    console.error(`❌ Erro no lote ${batchNumber}:`, error);
    throw error;
  }
}

// Execute import if run directly
if (require.main === module) {
  importContactsToDatabase()
    .then(stats => {
      console.log('\n🎉 Importação finalizada com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Importação falhou:', error);
      process.exit(1);
    });
}

module.exports = { importContactsToDatabase };