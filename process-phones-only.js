const fs = require('fs');

class PhoneOnlyProcessor {
  constructor() {
    this.phoneContacts = [];
    this.invalidPhones = [];
    this.phoneSet = new Set();
    this.stats = {
      totalProcessed: 0,
      validPhones: 0,
      invalidPhones: 0,
      duplicates: 0,
      brazilianNumbers: 0,
      internationalNumbers: 0
    };
  }

  // Validar e limpar número brasileiro
  validateBrazilianPhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    
    // Remover todos os caracteres não numéricos
    let clean = phone.replace(/\D/g, '');
    
    // Remover códigos internacionais
    if (clean.startsWith('55')) clean = clean.substring(2);
    if (clean.startsWith('1') && clean.length > 11) clean = clean.substring(1);
    
    // Validações para números brasileiros
    if (clean.length === 11) {
      // Celular: 11 dígitos com 9 na terceira posição
      const ddd = clean.substring(0, 2);
      const nono = clean[2];
      
      if (parseInt(ddd) >= 11 && parseInt(ddd) <= 99 && nono === '9') {
        return `+55${clean}`;
      }
    }
    
    if (clean.length === 10) {
      // Fixo: 10 dígitos
      const ddd = clean.substring(0, 2);
      
      if (parseInt(ddd) >= 11 && parseInt(ddd) <= 99) {
        return `+55${clean}`;
      }
    }

    // Verificar se é internacional válido
    if (clean.length >= 10 && clean.length <= 15) {
      return `+${clean}`;
    }
    
    return null;
  }

  // Detectar operadora (básico)
  detectOperator(phone) {
    if (!phone.startsWith('+55')) return 'Internacional';
    
    const number = phone.substring(3);
    const ddd = number.substring(0, 2);
    const prefix = number.substring(2, 3);
    
    if (prefix === '9') {
      // Celular
      const secondDigit = number[3];
      switch (secondDigit) {
        case '6':
        case '7':
        case '8':
        case '9': return 'Vivo';
        case '1':
        case '2': return 'TIM';
        case '3':
        case '4':
        case '5': return 'Claro';
        case '0': return 'Oi';
        default: return 'Celular';
      }
    } else {
      return 'Fixo';
    }
  }

  // Validar se é WhatsApp (simulação básica)
  isPotentialWhatsApp(phone) {
    // Números brasileiros celulares têm maior chance de ter WhatsApp
    if (phone.startsWith('+55') && phone.length === 14 && phone[5] === '9') {
      return true;
    }
    return false;
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

  async processContacts() {
    console.log('📱 Processando contatos SEM email (somente telefones)...\n');

    try {
      // Carregar dados processados anteriormente
      const processedData = JSON.parse(fs.readFileSync('./contacts-processed.json', 'utf8'));
      
      // Filtrar apenas contatos sem email mas com telefone
      const phoneOnlyContacts = processedData.filter(contact => 
        !contact.email && contact.telefone
      );

      console.log(`📊 Total de contatos sem email: ${phoneOnlyContacts.length}`);
      console.log('🔄 Validando números de telefone...\n');

      for (const contact of phoneOnlyContacts) {
        this.stats.totalProcessed++;
        
        const validPhone = this.validateBrazilianPhone(contact.telefone);
        
        if (!validPhone) {
          this.invalidPhones.push({
            nome: contact.nome,
            telefoneOriginal: contact.telefone,
            motivo: 'Formato inválido'
          });
          this.stats.invalidPhones++;
          continue;
        }

        // Verificar duplicatas
        if (this.phoneSet.has(validPhone)) {
          this.stats.duplicates++;
          continue;
        }

        this.phoneSet.add(validPhone);

        const phoneContact = {
          nome: contact.nome,
          telefone: validPhone,
          telefoneOriginal: contact.telefone,
          operadora: this.detectOperator(validPhone),
          potentialWhatsApp: this.isPotentialWhatsApp(validPhone),
          segmento: contact.segmento || 'geral',
          organizacao: contact.organizacao || '',
          tags: contact.tags || []
        };

        if (validPhone.startsWith('+55')) {
          this.stats.brazilianNumbers++;
        } else {
          this.stats.internationalNumbers++;
        }

        this.phoneContacts.push(phoneContact);
        this.stats.validPhones++;
      }

      this.generateReport();
      await this.saveResults();

    } catch (error) {
      console.error('❌ Erro ao processar telefones:', error.message);
      throw error;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📱 RELATÓRIO DE TELEFONES SEM EMAIL');
    console.log('='.repeat(60));
    
    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total processados: ${this.stats.totalProcessed.toLocaleString()}`);
    console.log(`   Telefones válidos: ${this.stats.validPhones.toLocaleString()}`);
    console.log(`   Telefones inválidos: ${this.stats.invalidPhones.toLocaleString()}`);
    console.log(`   Duplicatas: ${this.stats.duplicates.toLocaleString()}`);
    
    console.log(`\n🇧🇷 NÚMEROS BRASILEIROS:`);
    console.log(`   Números BR válidos: ${this.stats.brazilianNumbers.toLocaleString()}`);
    console.log(`   Números internacionais: ${this.stats.internationalNumbers.toLocaleString()}`);
    
    // Operadoras
    const operators = {};
    this.phoneContacts.forEach(contact => {
      operators[contact.operadora] = (operators[contact.operadora] || 0) + 1;
    });

    console.log(`\n📡 POR OPERADORA:`);
    Object.entries(operators)
      .sort(([,a], [,b]) => b - a)
      .forEach(([op, count]) => {
        console.log(`   ${op}: ${count.toLocaleString()}`);
      });

    // WhatsApp potencial
    const whatsappCount = this.phoneContacts.filter(c => c.potentialWhatsApp).length;
    console.log(`\n💬 POTENCIAL WHATSAPP:`);
    console.log(`   Números com provável WhatsApp: ${whatsappCount.toLocaleString()}`);
    console.log(`   Taxa de WhatsApp estimada: ${((whatsappCount / this.stats.validPhones) * 100).toFixed(1)}%`);
  }

  async saveResults() {
    try {
      // Salvar contatos com telefones válidos
      const phoneFile = './contacts-phones-only.json';
      fs.writeFileSync(phoneFile, JSON.stringify(this.phoneContacts, null, 2));
      
      // Salvar apenas potenciais WhatsApp
      const whatsappContacts = this.phoneContacts.filter(c => c.potentialWhatsApp);
      const whatsappFile = './contacts-whatsapp-potential.json';
      fs.writeFileSync(whatsappFile, JSON.stringify(whatsappContacts, null, 2));

      // CSV para validação manual
      const csvHeader = 'nome,telefone,operadora,whatsapp_potencial,segmento\n';
      const csvContent = this.phoneContacts.map(c => 
        `"${c.nome}","${c.telefone}","${c.operadora}","${c.potentialWhatsApp ? 'Sim' : 'Não'}","${c.segmento}"`
      ).join('\n');
      
      const csvFile = './contacts-phones-validation.csv';
      fs.writeFileSync(csvFile, csvHeader + csvContent);

      // Relatório de inválidos
      const invalidReport = {
        total: this.stats.invalidPhones,
        examples: this.invalidPhones.slice(0, 20), // Primeiros 20 exemplos
        stats: this.stats
      };
      fs.writeFileSync('./phones-invalid-report.json', JSON.stringify(invalidReport, null, 2));

      console.log(`\n✅ ARQUIVOS GERADOS:`);
      console.log(`   📄 contacts-phones-only.json - ${this.phoneContacts.length} telefones válidos`);
      console.log(`   📄 contacts-whatsapp-potential.json - ${whatsappContacts.length} potenciais WhatsApp`);
      console.log(`   📄 contacts-phones-validation.csv - Para validação manual`);
      console.log(`   📄 phones-invalid-report.json - Relatório de inválidos`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar resultados:', error.message);
    }
  }
}

// Executar processamento
const processor = new PhoneOnlyProcessor();
processor.processContacts()
  .then(() => {
    console.log('\n🎉 Processamento de telefones concluído!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar contacts-whatsapp-potential.json');
    console.log('   2. Validar números via API WhatsApp');
    console.log('   3. Criar campanhas segmentadas por operadora');
    console.log('   4. Testar envio de mensagens WhatsApp');
  })
  .catch(error => {
    console.error('\n💥 Falha no processamento:', error.message);
  });