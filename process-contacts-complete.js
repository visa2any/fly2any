const fs = require('fs');
const path = require('path');

class CompleteContactProcessor {
  constructor() {
    this.validContacts = [];
    this.emailContacts = [];
    this.phoneOnlyContacts = [];
    this.invalidContacts = [];
    this.duplicates = [];
    this.emailSet = new Set();
    this.phoneSet = new Set();
    this.processedFromPrevious = new Set(); // Para excluir já processados
    
    this.stats = {
      total: 0,
      validEmails: 0,
      invalidEmails: 0,
      validPhones: 0,
      invalidPhones: 0,
      emailDuplicates: 0,
      phoneDuplicates: 0,
      finalEmailContacts: 0,
      finalPhoneContacts: 0,
      alreadyProcessed: 0
    };
  }

  // Carregar contatos já processados anteriormente
  loadPreviouslyProcessed() {
    try {
      // Carregar emails já processados
      if (fs.existsSync('./contacts-emails-only.csv')) {
        const previousEmails = fs.readFileSync('./contacts-emails-only.csv', 'utf8');
        const lines = previousEmails.split('\n');
        for (let i = 1; i < lines.length; i++) {
          const parts = this.parseCSVLine(lines[i]);
          if (parts.length > 1 && parts[1]) {
            this.processedFromPrevious.add(parts[1].toLowerCase().trim());
          }
        }
        console.log(`📋 Carregados ${this.processedFromPrevious.size} emails já processados`);
      }
    } catch (error) {
      console.log('ℹ️ Nenhum arquivo anterior encontrado - processando todos os contatos');
    }
  }

  // Validar email mais rigoroso
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    let cleanEmail = email.trim().toLowerCase();
    
    // Remover caracteres problemáticos
    cleanEmail = cleanEmail.replace(/[,\s;:|]+/g, '');
    
    // Casos específicos problemáticos encontrados nos dados
    if (cleanEmail.includes('hw32a2222222otmail.com')) return false;
    if (cleanEmail.includes('..')) return false;
    if (cleanEmail.startsWith('.') || cleanEmail.endsWith('.')) return false;
    if (cleanEmail.length < 5 || cleanEmail.length > 100) return false;
    
    // Regex rigorosa
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(cleanEmail);
  }

  // Limpar e validar telefone
  cleanPhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    
    // Remover tudo que não é número
    let clean = phone.replace(/\D/g, '');
    
    // Remover códigos internacionais comuns
    if (clean.startsWith('55')) clean = clean.substring(2);
    if (clean.startsWith('1') && clean.length > 11) clean = clean.substring(1);
    
    // Validar números brasileiros
    if (clean.length === 11 && clean[2] === '9') {
      // Celular: 11 dígitos com 9 na 3ª posição
      const ddd = parseInt(clean.substring(0, 2));
      if (ddd >= 11 && ddd <= 99) {
        return `+55${clean}`;
      }
    }
    
    if (clean.length === 10) {
      // Fixo: 10 dígitos
      const ddd = parseInt(clean.substring(0, 2));
      if (ddd >= 11 && ddd <= 99) {
        return `+55${clean}`;
      }
    }
    
    // Números internacionais válidos
    if (clean.length >= 10 && clean.length <= 15) {
      return `+${clean}`;
    }
    
    return null;
  }

  // Parse CSV line mais robusto
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let quoteCount = 0;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        quoteCount++;
        inQuotes = quoteCount % 2 === 1;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/"/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.replace(/"/g, '').trim());
    return result;
  }

  // Detectar segmento melhorado
  detectSegment(labels = '', organization = '', firstName = '', lastName = '') {
    const combined = `${labels} ${organization} ${firstName} ${lastName}`.toLowerCase();

    // Brasileiros nos EUA (maior prioridade)
    if (combined.includes('usa') || combined.includes('america') || 
        combined.includes('miami') || combined.includes('orlando') ||
        combined.includes('florida') || combined.includes('new york') ||
        combined.includes('boston') || combined.includes('california')) {
      return 'brasileiros-eua';
    }

    // Famílias
    if (combined.includes('family') || combined.includes('familia') || 
        combined.includes('crianca') || combined.includes('filho') ||
        combined.includes('disney') || combined.includes('kids')) {
      return 'familias';
    }

    // Executivos/Business
    if (combined.includes('business') || combined.includes('executivo') ||
        combined.includes('corporate') || combined.includes('empresa') ||
        combined.includes('company') || combined.includes('ceo') ||
        combined.includes('manager')) {
      return 'executivos';
    }

    // Casais/Lua de mel
    if (combined.includes('couple') || combined.includes('casal') || 
        combined.includes('romantic') || combined.includes('lua') ||
        combined.includes('honeymoon') || combined.includes('wedding')) {
      return 'casais';
    }

    // Aventureiros
    if (combined.includes('adventure') || combined.includes('aventura') ||
        combined.includes('trekking') || combined.includes('hiking') ||
        combined.includes('extreme') || combined.includes('outdoor')) {
      return 'aventureiros';
    }

    return 'geral';
  }

  // Processar linha do CSV
  processLine(line, headers, lineNumber) {
    const values = this.parseCSVLine(line);
    if (values.length < headers.length * 0.5) return null; // Deve ter pelo menos 50% dos campos

    // Extrair dados básicos
    const firstName = values[headers.indexOf('First Name')] || '';
    const lastName = values[headers.indexOf('Last Name')] || '';
    const email1 = values[headers.indexOf('E-mail 1 - Value')] || '';
    const email2 = values[headers.indexOf('E-mail 2 - Value')] || '';
    const phone1 = values[headers.indexOf('Phone 1 - Value')] || '';
    const phone2 = values[headers.indexOf('Phone 2 - Value')] || '';
    const phone3 = values[headers.indexOf('Phone 3 - Value')] || '';
    const organization = values[headers.indexOf('Organization Name')] || '';
    const labels = values[headers.indexOf('Labels')] || '';

    // Nome completo
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName.length < 2) return null;

    // Validar email (prioridade email1)
    let validEmail = '';
    if (this.isValidEmail(email1)) {
      validEmail = email1.trim().toLowerCase();
    } else if (this.isValidEmail(email2)) {
      validEmail = email2.trim().toLowerCase();
    }

    // Verificar se já foi processado
    if (validEmail && this.processedFromPrevious.has(validEmail)) {
      this.stats.alreadyProcessed++;
      return null;
    }

    // Validar telefones
    let validPhone = '';
    const phones = [phone1, phone2, phone3];
    for (const phone of phones) {
      const cleaned = this.cleanPhone(phone);
      if (cleaned) {
        validPhone = cleaned;
        break;
      }
    }

    // Deve ter pelo menos email OU telefone
    if (!validEmail && !validPhone) return null;

    const contact = {
      nome: fullName,
      firstName: firstName,
      lastName: lastName,
      email: validEmail,
      telefone: validPhone,
      organizacao: organization,
      labels: labels,
      segmento: this.detectSegment(labels, organization, firstName, lastName),
      tags: labels ? labels.split(':::').map(t => t.trim()).filter(t => t) : [],
      lineNumber: lineNumber
    };

    return contact;
  }

  async processCompleteCSV() {
    console.log('🔄 Processando arquivo COMPLETO contacts1.csv...\n');
    
    try {
      // Carregar contatos já processados
      this.loadPreviouslyProcessed();

      const content = fs.readFileSync('./contacts1.csv', 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      console.log(`📊 Total de linhas: ${lines.length.toLocaleString()}`);
      this.stats.total = lines.length - 1;

      const headers = this.parseCSVLine(lines[0]);
      console.log(`📋 Colunas: ${headers.length}`);
      
      // Processar em lotes para performance
      const batchSize = 1000;
      let processed = 0;

      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, Math.min(i + batchSize, lines.length));
        
        for (let j = 0; j < batch.length; j++) {
          const lineNumber = i + j;
          const contact = this.processLine(batch[j], headers, lineNumber);
          
          if (!contact) continue;

          // Verificar duplicatas
          const emailDuplicate = contact.email && this.emailSet.has(contact.email);
          const phoneDuplicate = contact.telefone && this.phoneSet.has(contact.telefone);

          if (emailDuplicate || phoneDuplicate) {
            this.duplicates.push({
              linha: lineNumber,
              nome: contact.nome,
              email: contact.email,
              telefone: contact.telefone,
              motivo: emailDuplicate ? 'Email duplicado' : 'Telefone duplicado'
            });
            
            if (emailDuplicate) this.stats.emailDuplicates++;
            if (phoneDuplicate) this.stats.phoneDuplicates++;
            continue;
          }

          // Adicionar aos sets de controle
          if (contact.email) {
            this.emailSet.add(contact.email);
            this.stats.validEmails++;
            this.emailContacts.push(contact);
          }
          
          if (contact.telefone) {
            this.phoneSet.add(contact.telefone);
            this.stats.validPhones++;
            
            // Se não tem email, vai para phone-only
            if (!contact.email) {
              this.phoneOnlyContacts.push(contact);
            }
          }

          this.validContacts.push(contact);
        }

        processed += batch.length;
        if (processed % 5000 === 0) {
          console.log(`⏳ Processadas ${processed.toLocaleString()}/${this.stats.total.toLocaleString()} linhas...`);
        }
      }

      this.stats.finalEmailContacts = this.emailContacts.length;
      this.stats.finalPhoneContacts = this.phoneOnlyContacts.length;

      console.log('\n✅ Processamento concluído!');
      this.generateCompleteReport();
      await this.saveCompleteResults();

    } catch (error) {
      console.error('❌ Erro no processamento:', error.message);
      throw error;
    }
  }

  generateCompleteReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RELATÓRIO COMPLETO - CONTACTS1.CSV');
    console.log('='.repeat(70));
    
    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de linhas: ${this.stats.total.toLocaleString()}`);
    console.log(`   Já processados anteriormente: ${this.stats.alreadyProcessed.toLocaleString()}`);
    console.log(`   Contatos válidos NOVOS: ${this.validContacts.length.toLocaleString()}`);
    console.log(`   Taxa de aproveitamento: ${((this.validContacts.length / this.stats.total) * 100).toFixed(1)}%`);
    
    console.log(`\n📧 EMAILS (NEWSLETTER):`);
    console.log(`   Contatos com email válido: ${this.stats.finalEmailContacts.toLocaleString()}`);
    console.log(`   Emails duplicados removidos: ${this.stats.emailDuplicates.toLocaleString()}`);
    
    console.log(`\n📱 TELEFONES (WHATSAPP):`);
    console.log(`   Contatos só com telefone: ${this.stats.finalPhoneContacts.toLocaleString()}`);
    console.log(`   Telefones duplicados: ${this.stats.phoneDuplicates.toLocaleString()}`);

    // Segmentação
    const emailSegments = {};
    const phoneSegments = {};
    
    this.emailContacts.forEach(contact => {
      emailSegments[contact.segmento] = (emailSegments[contact.segmento] || 0) + 1;
    });
    
    this.phoneOnlyContacts.forEach(contact => {
      phoneSegments[contact.segmento] = (phoneSegments[contact.segmento] || 0) + 1;
    });

    console.log(`\n🎯 SEGMENTAÇÃO EMAILS:`);
    Object.entries(emailSegments)
      .sort(([,a], [,b]) => b - a)
      .forEach(([segment, count]) => {
        console.log(`   ${segment}: ${count.toLocaleString()}`);
      });

    console.log(`\n📞 SEGMENTAÇÃO TELEFONES:`);
    Object.entries(phoneSegments)
      .sort(([,a], [,b]) => b - a)
      .forEach(([segment, count]) => {
        console.log(`   ${segment}: ${count.toLocaleString()}`);
      });
  }

  async saveCompleteResults() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      // 1. Contatos com email (para newsletter)
      if (this.emailContacts.length > 0) {
        const emailCSV = 'nome,email,telefone,segmento,organizacao\n' +
          this.emailContacts.map(c => 
            `"${c.nome}","${c.email}","${c.telefone || ''}","${c.segmento}","${c.organizacao}"`
          ).join('\n');
        
        fs.writeFileSync(`./contacts-emails-final-${timestamp}.csv`, emailCSV);
      }

      // 2. Contatos só com telefone (para WhatsApp)
      if (this.phoneOnlyContacts.length > 0) {
        const phoneCSV = 'nome,telefone,segmento,organizacao\n' +
          this.phoneOnlyContacts.map(c => 
            `"${c.nome}","${c.telefone}","${c.segmento}","${c.organizacao}"`
          ).join('\n');
        
        fs.writeFileSync(`./contacts-phones-final-${timestamp}.csv`, phoneCSV);
      }

      // 3. Dados completos JSON
      fs.writeFileSync(`./contacts-complete-${timestamp}.json`, JSON.stringify({
        emailContacts: this.emailContacts,
        phoneOnlyContacts: this.phoneOnlyContacts,
        stats: this.stats,
        processedAt: new Date().toISOString()
      }, null, 2));

      // 4. Script SQL para importação
      if (this.emailContacts.length > 0) {
        let sqlScript = `-- Importação completa de ${this.emailContacts.length} contatos com email
-- Data: ${new Date().toLocaleString()}

-- Criar tabela
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);
CREATE INDEX IF NOT EXISTS idx_email_contacts_segmento ON email_contacts(segmento);
CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(status);

-- Inserções
`;

        for (const contact of this.emailContacts) {
          const nome = contact.firstName.replace(/'/g, "''");
          const sobrenome = contact.lastName ? contact.lastName.replace(/'/g, "''") : '';
          const email = contact.email.replace(/'/g, "''");
          const telefone = contact.telefone || '';
          const segmento = contact.segmento.replace(/'/g, "''");
          const tags = JSON.stringify(contact.tags).replace(/'/g, "''");

          sqlScript += `INSERT INTO email_contacts (nome, sobrenome, email, telefone, segmento, tags) VALUES ('${nome}', `;
          sqlScript += sobrenome ? `'${sobrenome}', ` : 'NULL, ';
          sqlScript += `'${email}', `;
          sqlScript += telefone ? `'${telefone}', ` : 'NULL, ';
          sqlScript += `'${segmento}', '${tags}') ON CONFLICT (email) DO NOTHING;\n`;
        }

        sqlScript += `\n-- Verificar resultado\nSELECT segmento, COUNT(*) as total FROM email_contacts WHERE status = 'ativo' GROUP BY segmento ORDER BY total DESC;`;
        
        fs.writeFileSync(`./import-emails-complete-${timestamp}.sql`, sqlScript);
      }

      console.log(`\n✅ ARQUIVOS FINAIS GERADOS:`);
      if (this.emailContacts.length > 0) {
        console.log(`   📧 contacts-emails-final-${timestamp}.csv - ${this.emailContacts.length.toLocaleString()} emails`);
        console.log(`   🗄️ import-emails-complete-${timestamp}.sql - Script SQL completo`);
      }
      if (this.phoneOnlyContacts.length > 0) {
        console.log(`   📱 contacts-phones-final-${timestamp}.csv - ${this.phoneOnlyContacts.length.toLocaleString()} telefones`);
      }
      console.log(`   📄 contacts-complete-${timestamp}.json - Dados completos`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error.message);
    }
  }
}

// Executar processamento completo
const processor = new CompleteContactProcessor();
processor.processCompleteCSV()
  .then(() => {
    console.log('\n🎉 PROCESSAMENTO COMPLETO FINALIZADO!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Execute o script SQL no Vercel Postgres');
    console.log('   2. Teste o sistema de email marketing');
    console.log('   3. Configure campanhas segmentadas');
    console.log('   4. Valide números WhatsApp');
  })
  .catch(error => {
    console.error('\n💥 Falha no processamento:', error.message);
    process.exit(1);
  });