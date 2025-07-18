const fs = require('fs');

class USAPhoneValidator {
  constructor() {
    this.validUSAPhones = [];
    this.invalidPhones = [];
    this.brazilianPhones = [];
    this.internationalPhones = [];
    this.stats = {
      total: 0,
      validUSA: 0,
      validBrazilian: 0,
      international: 0,
      invalid: 0,
      duplicates: 0
    };
    this.phoneSet = new Set();
  }

  // Validar número americano (EUA)
  validateUSAPhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    
    // Limpar o número
    let clean = phone.replace(/\D/g, '');
    
    // Números americanos padrão
    if (clean.length === 11 && clean.startsWith('1')) {
      // Remove o 1 inicial (código do país)
      clean = clean.substring(1);
    }
    
    if (clean.length === 10) {
      const areaCode = clean.substring(0, 3);
      const exchange = clean.substring(3, 6);
      const number = clean.substring(6, 10);
      
      // Validações básicas para números americanos
      const areaCodeNum = parseInt(areaCode);
      const exchangeNum = parseInt(exchange);
      
      // Area codes válidos (200-999, mas não podem começar com 0 ou 1)
      if (areaCodeNum >= 200 && areaCodeNum <= 999 && 
          areaCode[0] !== '0' && areaCode[0] !== '1') {
        
        // Exchange codes válidos (200-999, não podem começar com 0 ou 1)
        if (exchangeNum >= 200 && exchangeNum <= 999 &&
            exchange[0] !== '0' && exchange[0] !== '1') {
          
          return `+1${areaCode}${exchange}${number}`;
        }
      }
    }
    
    return null;
  }

  // Validar número brasileiro
  validateBrazilianPhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    
    let clean = phone.replace(/\D/g, '');
    
    // Remover código do país se presente
    if (clean.startsWith('55')) clean = clean.substring(2);
    
    // Celular: 11 dígitos com 9 na terceira posição
    if (clean.length === 11 && clean[2] === '9') {
      const ddd = parseInt(clean.substring(0, 2));
      if (ddd >= 11 && ddd <= 99) {
        return `+55${clean}`;
      }
    }
    
    // Fixo: 10 dígitos
    if (clean.length === 10) {
      const ddd = parseInt(clean.substring(0, 2));
      if (ddd >= 11 && ddd <= 99) {
        return `+55${clean}`;
      }
    }
    
    return null;
  }

  // Detectar tipo de número
  detectPhoneType(phone) {
    if (!phone) return 'invalid';
    
    let clean = phone.replace(/\D/g, '');
    
    // Americano
    if (clean.length === 10 || (clean.length === 11 && clean.startsWith('1'))) {
      return 'usa';
    }
    
    // Brasileiro
    if (clean.startsWith('55') || 
        (clean.length >= 10 && clean.length <= 11 && !clean.startsWith('1'))) {
      return 'brazil';
    }
    
    // Internacional
    if (clean.length >= 7 && clean.length <= 15) {
      return 'international';
    }
    
    return 'invalid';
  }

  // Detectar operadora americana por area code
  detectUSACarrier(phone) {
    if (!phone.startsWith('+1')) return 'Unknown';
    
    const areaCode = phone.substring(2, 5);
    const area = parseInt(areaCode);
    
    // Alguns area codes principais
    const majorAreas = {
      212: 'New York, NY',
      213: 'Los Angeles, CA',
      305: 'Miami, FL',
      407: 'Orlando, FL',
      617: 'Boston, MA',
      646: 'New York, NY',
      718: 'New York, NY',
      202: 'Washington, DC',
      310: 'Los Angeles, CA',
      415: 'San Francisco, CA',
      312: 'Chicago, IL',
      404: 'Atlanta, GA',
      713: 'Houston, TX',
      214: 'Dallas, TX',
      508: 'Massachusetts',
      978: 'Massachusetts',
      781: 'Massachusetts',
      857: 'Massachusetts'
    };
    
    return majorAreas[area] || `Area Code ${areaCode}`;
  }

  // Verificar se é potencial WhatsApp
  isPotentialWhatsApp(phone, phoneType) {
    // Números americanos celulares têm boa chance de WhatsApp
    if (phoneType === 'usa') {
      return true; // A maioria dos americanos usa WhatsApp hoje
    }
    
    // Números brasileiros celulares
    if (phoneType === 'brazil' && phone.includes('9')) {
      return true;
    }
    
    return false;
  }

  async validatePhones() {
    console.log('📱 Validando números de telefone (foco em números americanos)...\n');

    try {
      // Carregar arquivo de telefones
      const phoneData = JSON.parse(fs.readFileSync('./contacts-phones-final-2025-07-12.csv', 'utf8'));
      
      // Se for CSV, converter
      let phoneContacts = [];
      if (typeof phoneData === 'string') {
        const lines = phoneData.split('\n').filter(line => line.trim());
        for (let i = 1; i < lines.length; i++) {
          const [nome, telefone, segmento, organizacao] = this.parseCSVLine(lines[i]);
          if (telefone) {
            phoneContacts.push({ nome, telefone, segmento, organizacao });
          }
        }
      } else {
        phoneContacts = phoneData;
      }

      console.log(`📊 Total de telefones para validar: ${phoneContacts.length.toLocaleString()}`);
      console.log('🔄 Analisando números...\n');

      for (const contact of phoneContacts) {
        this.stats.total++;
        
        const phoneType = this.detectPhoneType(contact.telefone);
        let validPhone = null;
        let location = '';
        
        switch (phoneType) {
          case 'usa':
            validPhone = this.validateUSAPhone(contact.telefone);
            if (validPhone) {
              location = this.detectUSACarrier(validPhone);
              this.stats.validUSA++;
            }
            break;
            
          case 'brazil':
            validPhone = this.validateBrazilianPhone(contact.telefone);
            if (validPhone) {
              location = 'Brazil';
              this.stats.validBrazilian++;
            }
            break;
            
          case 'international':
            validPhone = `+${contact.telefone.replace(/\D/g, '')}`;
            location = 'International';
            this.stats.international++;
            break;
            
          default:
            this.invalidPhones.push({
              nome: contact.nome,
              telefoneOriginal: contact.telefone,
              motivo: 'Formato não reconhecido'
            });
            this.stats.invalid++;
            continue;
        }

        if (!validPhone) {
          this.invalidPhones.push({
            nome: contact.nome,
            telefoneOriginal: contact.telefone,
            motivo: `Inválido para ${phoneType}`
          });
          this.stats.invalid++;
          continue;
        }

        // Verificar duplicatas
        if (this.phoneSet.has(validPhone)) {
          this.stats.duplicates++;
          continue;
        }

        this.phoneSet.add(validPhone);

        const validatedContact = {
          nome: contact.nome,
          telefone: validPhone,
          telefoneOriginal: contact.telefone,
          tipo: phoneType,
          location: location,
          potentialWhatsApp: this.isPotentialWhatsApp(validPhone, phoneType),
          segmento: contact.segmento || 'geral',
          organizacao: contact.organizacao || ''
        };

        if (phoneType === 'usa') {
          this.validUSAPhones.push(validatedContact);
        } else if (phoneType === 'brazil') {
          this.brazilianPhones.push(validatedContact);
        } else {
          this.internationalPhones.push(validatedContact);
        }

        if (this.stats.total % 2000 === 0) {
          console.log(`⏳ Processados: ${this.stats.total.toLocaleString()} telefones...`);
        }
      }

      this.generateValidationReport();
      await this.saveValidationResults();

    } catch (error) {
      console.error('❌ Erro na validação:', error.message);
      
      // Tentar carregar arquivo CSV diretamente
      try {
        console.log('🔄 Tentando carregar arquivo CSV...');
        const csvContent = fs.readFileSync('./contacts-phones-final-2025-07-12.csv', 'utf8');
        await this.validateFromCSV(csvContent);
      } catch (csvError) {
        console.error('❌ Erro ao carregar CSV:', csvError.message);
        throw csvError;
      }
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

  async validateFromCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`📊 Linhas CSV: ${lines.length - 1}`);

    for (let i = 1; i < lines.length; i++) {
      const parts = this.parseCSVLine(lines[i]);
      if (parts.length >= 2) {
        const [nome, telefone, segmento, organizacao] = parts;
        
        this.stats.total++;
        const phoneType = this.detectPhoneType(telefone);
        let validPhone = null;
        
        if (phoneType === 'usa') {
          validPhone = this.validateUSAPhone(telefone);
          if (validPhone) this.stats.validUSA++;
        } else if (phoneType === 'brazil') {
          validPhone = this.validateBrazilianPhone(telefone);
          if (validPhone) this.stats.validBrazilian++;
        }

        if (validPhone && !this.phoneSet.has(validPhone)) {
          this.phoneSet.add(validPhone);
          
          const contact = {
            nome,
            telefone: validPhone,
            telefoneOriginal: telefone,
            tipo: phoneType,
            location: phoneType === 'usa' ? this.detectUSACarrier(validPhone) : 'Brazil',
            potentialWhatsApp: this.isPotentialWhatsApp(validPhone, phoneType),
            segmento: segmento || 'geral'
          };

          if (phoneType === 'usa') {
            this.validUSAPhones.push(contact);
          } else {
            this.brazilianPhones.push(contact);
          }
        }
      }
    }

    this.generateValidationReport();
    await this.saveValidationResults();
  }

  generateValidationReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📱 RELATÓRIO DE VALIDAÇÃO DE TELEFONES');
    console.log('='.repeat(70));
    
    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total processados: ${this.stats.total.toLocaleString()}`);
    console.log(`   Números válidos: ${(this.stats.validUSA + this.stats.validBrazilian).toLocaleString()}`);
    console.log(`   Inválidos: ${this.stats.invalid.toLocaleString()}`);
    console.log(`   Duplicatas: ${this.stats.duplicates.toLocaleString()}`);
    
    console.log(`\n🇺🇸 NÚMEROS AMERICANOS:`);
    console.log(`   Válidos: ${this.stats.validUSA.toLocaleString()}`);
    console.log(`   Percentual: ${((this.stats.validUSA / this.stats.total) * 100).toFixed(1)}%`);
    
    console.log(`\n🇧🇷 NÚMEROS BRASILEIROS:`);
    console.log(`   Válidos: ${this.stats.validBrazilian.toLocaleString()}`);
    console.log(`   Percentual: ${((this.stats.validBrazilian / this.stats.total) * 100).toFixed(1)}%`);

    // Top area codes americanos
    if (this.validUSAPhones.length > 0) {
      const areaCodes = {};
      this.validUSAPhones.forEach(contact => {
        const area = contact.telefone.substring(2, 5);
        areaCodes[area] = (areaCodes[area] || 0) + 1;
      });

      console.log(`\n📍 TOP AREA CODES AMERICANOS:`);
      Object.entries(areaCodes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([area, count]) => {
          const location = this.detectUSACarrier(`+1${area}0000000`);
          console.log(`   ${area}: ${count.toLocaleString()} - ${location}`);
        });
    }

    const whatsappUSA = this.validUSAPhones.filter(c => c.potentialWhatsApp).length;
    const whatsappBR = this.brazilianPhones.filter(c => c.potentialWhatsApp).length;
    
    console.log(`\n💬 POTENCIAL WHATSAPP:`);
    console.log(`   Números americanos: ${whatsappUSA.toLocaleString()}`);
    console.log(`   Números brasileiros: ${whatsappBR.toLocaleString()}`);
    console.log(`   Total WhatsApp potencial: ${(whatsappUSA + whatsappBR).toLocaleString()}`);
  }

  async saveValidationResults() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      // Números americanos válidos
      if (this.validUSAPhones.length > 0) {
        const usaCSV = 'nome,telefone,area_code,location,whatsapp_potencial,segmento\n' +
          this.validUSAPhones.map(c => 
            `"${c.nome}","${c.telefone}","${c.telefone.substring(2, 5)}","${c.location}","${c.potentialWhatsApp ? 'Sim' : 'Não'}","${c.segmento}"`
          ).join('\n');
        
        fs.writeFileSync(`./phones-usa-valid-${timestamp}.csv`, usaCSV);
      }

      // Números brasileiros válidos
      if (this.brazilianPhones.length > 0) {
        const brCSV = 'nome,telefone,whatsapp_potencial,segmento\n' +
          this.brazilianPhones.map(c => 
            `"${c.nome}","${c.telefone}","${c.potentialWhatsApp ? 'Sim' : 'Não'}","${c.segmento}"`
          ).join('\n');
        
        fs.writeFileSync(`./phones-brazil-valid-${timestamp}.csv`, brCSV);
      }

      // Relatório completo
      const report = {
        stats: this.stats,
        validUSAPhones: this.validUSAPhones.length,
        validBrazilianPhones: this.brazilianPhones.length,
        invalidExamples: this.invalidPhones.slice(0, 20),
        processedAt: new Date().toISOString()
      };

      fs.writeFileSync(`./phone-validation-report-${timestamp}.json`, JSON.stringify(report, null, 2));

      console.log(`\n✅ ARQUIVOS DE VALIDAÇÃO GERADOS:`);
      if (this.validUSAPhones.length > 0) {
        console.log(`   🇺🇸 phones-usa-valid-${timestamp}.csv - ${this.validUSAPhones.length.toLocaleString()} números americanos`);
      }
      if (this.brazilianPhones.length > 0) {
        console.log(`   🇧🇷 phones-brazil-valid-${timestamp}.csv - ${this.brazilianPhones.length.toLocaleString()} números brasileiros`);
      }
      console.log(`   📊 phone-validation-report-${timestamp}.json - Relatório completo`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar validação:', error.message);
    }
  }
}

// Executar validação
const validator = new USAPhoneValidator();
validator.validatePhones()
  .then(() => {
    console.log('\n🎉 Validação de telefones concluída!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Revisar números americanos válidos');
    console.log('   2. Testar campanhas WhatsApp para números válidos');
    console.log('   3. Segmentar por area codes americanos');
    console.log('   4. Configurar automação de mensagens');
  })
  .catch(error => {
    console.error('\n💥 Falha na validação:', error.message);
  });