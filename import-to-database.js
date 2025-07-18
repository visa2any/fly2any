const fs = require('fs');
const { sql } = require('@vercel/postgres');

class DatabaseImporter {
  constructor() {
    this.imported = 0;
    this.duplicates = 0;
    this.errors = 0;
  }

  async initializeTable() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS email_contacts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          nome VARCHAR(255) NOT NULL,
          sobrenome VARCHAR(255),
          telefone VARCHAR(50),
          cidade VARCHAR(100),
          segmento VARCHAR(100) NOT NULL DEFAULT 'geral',
          tags JSONB DEFAULT '[]',
          status VARCHAR(50) DEFAULT 'ativo',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);
        CREATE INDEX IF NOT EXISTS idx_email_contacts_segmento ON email_contacts(segmento);
        CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(status);
      `;
      console.log('✅ Tabela email_contacts criada/verificada');
    } catch (error) {
      console.error('❌ Erro ao criar tabela:', error);
      throw error;
    }
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

  async importContacts() {
    console.log('🔄 Iniciando importação para o banco de dados...\n');

    try {
      await this.initializeTable();

      const csvContent = fs.readFileSync('./contacts-emails-only.csv', 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        throw new Error('Arquivo CSV vazio ou só com cabeçalho');
      }

      console.log(`📊 Total de contatos para importar: ${lines.length - 1}`);

      // Processar em lotes para melhor performance
      const batchSize = 50;
      let totalProcessed = 0;

      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);
        await this.processBatch(batch, i);
        
        totalProcessed += batch.length;
        console.log(`⏳ Processado: ${totalProcessed}/${lines.length - 1} contatos`);
      }

      this.generateImportReport();

    } catch (error) {
      console.error('❌ Erro na importação:', error);
      throw error;
    }
  }

  async processBatch(batch, startIndex) {
    const promises = batch.map((line, index) => 
      this.importSingleContact(line, startIndex + index + 1)
    );
    
    await Promise.allSettled(promises);
  }

  async importSingleContact(line, lineNumber) {
    try {
      const [nome, email, telefone, segmento, organizacao] = this.parseCSVLine(line);
      
      if (!email || !nome) {
        this.errors++;
        return;
      }

      // Separar nome e sobrenome
      const nameParts = nome.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      // Tags baseadas na organização
      const tags = organizacao ? [organizacao] : [];

      await sql`
        INSERT INTO email_contacts (email, nome, sobrenome, telefone, segmento, tags)
        VALUES (
          ${email.toLowerCase()},
          ${firstName},
          ${lastName || null},
          ${telefone || null},
          ${segmento || 'geral'},
          ${JSON.stringify(tags)}
        )
        ON CONFLICT (email) 
        DO UPDATE SET
          nome = EXCLUDED.nome,
          sobrenome = EXCLUDED.sobrenome,
          telefone = EXCLUDED.telefone,
          segmento = EXCLUDED.segmento,
          tags = EXCLUDED.tags,
          updated_at = NOW()
      `;

      this.imported++;

    } catch (error) {
      if (error.message.includes('duplicate key')) {
        this.duplicates++;
      } else {
        this.errors++;
        console.error(`❌ Erro linha ${lineNumber}:`, error.message);
      }
    }
  }

  generateImportReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO DE IMPORTAÇÃO');
    console.log('='.repeat(50));
    console.log(`✅ Contatos importados: ${this.imported.toLocaleString()}`);
    console.log(`🔄 Duplicatas atualizadas: ${this.duplicates.toLocaleString()}`);
    console.log(`❌ Erros: ${this.errors.toLocaleString()}`);
    console.log(`📈 Total processado: ${(this.imported + this.duplicates + this.errors).toLocaleString()}`);
    
    if (this.imported > 0) {
      console.log('\n🎉 Importação concluída com sucesso!');
      console.log('📧 Os contatos estão prontos para campanhas de email marketing');
    }
  }
}

// Executar importação
const importer = new DatabaseImporter();
importer.importContacts()
  .then(() => {
    console.log('\n✨ Processo finalizado!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Falha na importação:', error.message);
    process.exit(1);
  });