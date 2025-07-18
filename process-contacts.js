const fs = require('fs');
const path = require('path');

class ContactProcessor {
  constructor() {
    this.validContacts = [];
    this.invalidContacts = [];
    this.duplicates = [];
    this.emailSet = new Set();
    this.phoneSet = new Set();
    this.stats = {
      total: 0,
      validEmails: 0,
      invalidEmails: 0,
      validPhones: 0,
      invalidPhones: 0,
      emailDuplicates: 0,
      phoneDuplicates: 0,
      finalContacts: 0
    };
  }

  // Validar formato de email
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const cleanEmail = email.trim().toLowerCase();
    
    // Remover caracteres inválidos comuns
    const cleaned = cleanEmail.replace(/[,\s;:|]+/g, '');
    
    // Regex mais restritiva para emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return emailRegex.test(cleaned) && 
           !cleaned.includes('..') && 
           !cleaned.startsWith('.') && 
           !cleaned.endsWith('.') &&
           cleaned.length > 5 &&
           cleaned.length < 100;
  }

  // Limpar e validar telefone brasileiro
  cleanPhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    
    // Remover todos os caracteres não numéricos
    let clean = phone.replace(/\D/g, '');
    
    // Remover códigos internacionais comuns
    if (clean.startsWith('55')) clean = clean.substring(2);
    if (clean.startsWith('1')) clean = clean.substring(1);
    
    // Validações básicas para números brasileiros
    if (clean.length === 11 && clean.startsWith('11') && clean[2] === '9') {
      return `+55${clean}`;
    }
    if (clean.length === 10 && clean.startsWith('11')) {
      return `+55${clean}`;
    }
    if (clean.length === 11 && clean[2] === '9') {
      return `+55${clean}`;
    }
    if (clean.length === 10 && !clean.startsWith('0')) {
      return `+55${clean}`;
    }
    
    return null;
  }

  // Processar linha do CSV
  processLine(line, headers) {
    const values = this.parseCSVLine(line);
    if (values.length < headers.length) return null;

    const contact = {
      firstName: this.cleanString(values[headers.indexOf('First Name')]),
      lastName: this.cleanString(values[headers.indexOf('Last Name')]),
      email1: this.cleanString(values[headers.indexOf('E-mail 1 - Value')]),
      email2: this.cleanString(values[headers.indexOf('E-mail 2 - Value')]),
      phone1: this.cleanString(values[headers.indexOf('Phone 1 - Value')]),
      phone2: this.cleanString(values[headers.indexOf('Phone 2 - Value')]),
      phone3: this.cleanString(values[headers.indexOf('Phone 3 - Value')]),
      organization: this.cleanString(values[headers.indexOf('Organization Name')]),
      labels: this.cleanString(values[headers.indexOf('Labels')])
    };

    return this.validateContact(contact);
  }

  // Parse CSV line considerando aspas
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
    return result;
  }

  // Limpar strings
  cleanString(str) {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/"/g, '');
  }

  // Validar contato completo
  validateContact(contact) {
    const validatedContact = {
      nome: '',
      email: '',
      telefone: '',
      organizacao: contact.organization || '',
      tags: [],
      segmento: 'geral',
      valid: false
    };

    // Nome
    const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    if (fullName.length < 2) return null;
    validatedContact.nome = fullName;

    // Email (prioridade para email1)
    let validEmail = '';
    if (this.isValidEmail(contact.email1)) {
      validEmail = contact.email1.trim().toLowerCase().replace(/[,\s;:|]+/g, '');
    } else if (this.isValidEmail(contact.email2)) {
      validEmail = contact.email2.trim().toLowerCase().replace(/[,\s;:|]+/g, '');
    }

    // Telefone (testar todos os campos de telefone)
    let validPhone = '';
    const phones = [contact.phone1, contact.phone2, contact.phone3];
    for (const phone of phones) {
      const cleaned = this.cleanPhone(phone);
      if (cleaned) {
        validPhone = cleaned;
        break;
      }
    }

    // Deve ter pelo menos email OU telefone válido
    if (!validEmail && !validPhone) return null;

    validatedContact.email = validEmail;
    validatedContact.telefone = validPhone;
    validatedContact.valid = true;

    // Detectar segmento baseado em tags/organização
    validatedContact.segmento = this.detectSegment(contact.labels, contact.organization);
    
    // Tags baseadas nas labels
    if (contact.labels) {
      validatedContact.tags = contact.labels.split(':::').map(t => t.trim()).filter(t => t);
    }

    return validatedContact;
  }

  // Detectar segmento automaticamente
  detectSegment(labels = '', organization = '') {
    const combined = `${labels} ${organization}`.toLowerCase();

    if (combined.includes('usa') || combined.includes('america') || combined.includes('miami') || combined.includes('orlando')) {
      return 'brasileiros-eua';
    }
    if (combined.includes('family') || combined.includes('familia') || combined.includes('crianca')) {
      return 'familias';
    }
    if (combined.includes('travel') && combined.includes('business')) {
      return 'executivos';
    }
    if (combined.includes('adventure') || combined.includes('aventura')) {
      return 'aventureiros';
    }
    if (combined.includes('couple') || combined.includes('casal') || combined.includes('romantic')) {
      return 'casais';
    }

    return 'geral';
  }

  // Processar arquivo CSV completo
  async processCSV(filePath) {
    console.log('🔄 Iniciando processamento do arquivo contacts.csv...\n');
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('Arquivo vazio');
      }

      const headers = this.parseCSVLine(lines[0]);
      console.log(`📊 Total de linhas: ${lines.length - 1}`);
      console.log(`📋 Colunas encontradas: ${headers.length}\n`);

      this.stats.total = lines.length - 1;

      // Processar cada linha
      for (let i = 1; i < lines.length; i++) {
        if (i % 500 === 0) {
          console.log(`⏳ Processando linha ${i}/${lines.length - 1}...`);
        }

        const contact = this.processLine(lines[i], headers);
        if (!contact) {
          this.invalidContacts.push(`Linha ${i + 1}: dados insuficientes`);
          continue;
        }

        // Verificar duplicatas
        const isDuplicateEmail = contact.email && this.emailSet.has(contact.email);
        const isDuplicatePhone = contact.telefone && this.phoneSet.has(contact.telefone);

        if (isDuplicateEmail || isDuplicatePhone) {
          this.duplicates.push({
            linha: i + 1,
            nome: contact.nome,
            email: contact.email,
            telefone: contact.telefone,
            motivo: isDuplicateEmail ? 'Email duplicado' : 'Telefone duplicado'
          });
          
          if (isDuplicateEmail) this.stats.emailDuplicates++;
          if (isDuplicatePhone) this.stats.phoneDuplicates++;
          continue;
        }

        // Adicionar aos sets de controle
        if (contact.email) {
          this.emailSet.add(contact.email);
          this.stats.validEmails++;
        }
        if (contact.telefone) {
          this.phoneSet.add(contact.telefone);
          this.stats.validPhones++;
        }

        this.validContacts.push(contact);
      }

      this.stats.finalContacts = this.validContacts.length;
      this.stats.invalidEmails = this.stats.total - this.stats.validEmails - this.stats.emailDuplicates;
      this.stats.invalidPhones = this.stats.total - this.stats.validPhones - this.stats.phoneDuplicates;

      this.generateReport();
      await this.saveResults();

    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error.message);
      throw error;
    }
  }

  // Gerar relatório detalhado
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE PROCESSAMENTO');
    console.log('='.repeat(60));
    
    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total de linhas processadas: ${this.stats.total.toLocaleString()}`);
    console.log(`   Contatos válidos finais: ${this.stats.finalContacts.toLocaleString()}`);
    console.log(`   Taxa de aproveitamento: ${((this.stats.finalContacts / this.stats.total) * 100).toFixed(1)}%`);
    
    console.log(`\n📧 EMAILS:`);
    console.log(`   Emails válidos: ${this.stats.validEmails.toLocaleString()}`);
    console.log(`   Emails inválidos: ${this.stats.invalidEmails.toLocaleString()}`);
    console.log(`   Emails duplicados: ${this.stats.emailDuplicates.toLocaleString()}`);
    
    console.log(`\n📱 TELEFONES:`);
    console.log(`   Telefones válidos: ${this.stats.validPhones.toLocaleString()}`);
    console.log(`   Telefones inválidos: ${this.stats.invalidPhones.toLocaleString()}`);
    console.log(`   Telefones duplicados: ${this.stats.phoneDuplicates.toLocaleString()}`);

    // Segmentos
    const segments = {};
    this.validContacts.forEach(contact => {
      segments[contact.segmento] = (segments[contact.segmento] || 0) + 1;
    });

    console.log(`\n🎯 SEGMENTAÇÃO:`);
    Object.entries(segments)
      .sort(([,a], [,b]) => b - a)
      .forEach(([segment, count]) => {
        console.log(`   ${segment}: ${count.toLocaleString()} contatos`);
      });

    console.log(`\n❌ PROBLEMAS ENCONTRADOS:`);
    console.log(`   Linhas com dados insuficientes: ${this.invalidContacts.length.toLocaleString()}`);
    console.log(`   Duplicatas removidas: ${this.duplicates.length.toLocaleString()}`);
  }

  // Salvar resultados
  async saveResults() {
    try {
      // Salvar contatos válidos
      const validFile = path.join(__dirname, 'contacts-processed.json');
      fs.writeFileSync(validFile, JSON.stringify(this.validContacts, null, 2));
      
      // Salvar relatório
      const reportFile = path.join(__dirname, 'contacts-report.json');
      fs.writeFileSync(reportFile, JSON.stringify({
        stats: this.stats,
        duplicates: this.duplicates.slice(0, 100), // Primeiros 100 duplicados
        invalidContacts: this.invalidContacts.slice(0, 100) // Primeiros 100 inválidos
      }, null, 2));

      // Salvar CSV limpo apenas com emails válidos
      const emailContacts = this.validContacts.filter(c => c.email);
      const csvHeader = 'nome,email,telefone,segmento,organizacao\n';
      const csvContent = emailContacts.map(c => 
        `"${c.nome}","${c.email}","${c.telefone}","${c.segmento}","${c.organizacao}"`
      ).join('\n');
      
      const csvFile = path.join(__dirname, 'contacts-emails-only.csv');
      fs.writeFileSync(csvFile, csvHeader + csvContent);

      console.log(`\n✅ ARQUIVOS GERADOS:`);
      console.log(`   📄 contacts-processed.json - ${this.validContacts.length.toLocaleString()} contatos válidos`);
      console.log(`   📄 contacts-emails-only.csv - ${emailContacts.length.toLocaleString()} contatos com email`);
      console.log(`   📄 contacts-report.json - Relatório detalhado`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar resultados:', error.message);
    }
  }
}

// Executar processamento
const processor = new ContactProcessor();
const csvPath = path.join(__dirname, 'contacts.csv');

processor.processCSV(csvPath)
  .then(() => {
    console.log('\n🎉 Processamento concluído com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar o arquivo contacts-emails-only.csv');
    console.log('   2. Importar os contatos válidos no sistema');
    console.log('   3. Configurar campanhas de email marketing');
  })
  .catch(error => {
    console.error('\n💥 Falha no processamento:', error.message);
    process.exit(1);
  });