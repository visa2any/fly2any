const fs = require('fs');

class USAStateOrganizer {
  constructor() {
    this.stateContacts = {};
    this.validNumbers = [];
    this.invalidNumbers = [];
    this.duplicates = [];
    this.phoneSet = new Set();
    
    // Mapeamento completo de Area Codes para Estados
    this.areaCodeToState = {
      // ALABAMA
      '205': 'Alabama', '251': 'Alabama', '256': 'Alabama', '334': 'Alabama', '659': 'Alabama', '938': 'Alabama',
      
      // ALASKA  
      '907': 'Alaska',
      
      // ARIZONA
      '480': 'Arizona', '520': 'Arizona', '602': 'Arizona', '623': 'Arizona', '928': 'Arizona',
      
      // ARKANSAS
      '479': 'Arkansas', '501': 'Arkansas', '870': 'Arkansas',
      
      // CALIFORNIA
      '209': 'California', '213': 'California', '279': 'California', '310': 'California', '323': 'California',
      '341': 'California', '408': 'California', '415': 'California', '424': 'California', '442': 'California',
      '510': 'California', '530': 'California', '559': 'California', '562': 'California', '619': 'California',
      '626': 'California', '628': 'California', '650': 'California', '657': 'California', '661': 'California',
      '669': 'California', '707': 'California', '714': 'California', '747': 'California', '760': 'California',
      '805': 'California', '818': 'California', '820': 'California', '831': 'California', '858': 'California',
      '909': 'California', '916': 'California', '925': 'California', '949': 'California', '951': 'California',
      
      // COLORADO
      '303': 'Colorado', '719': 'Colorado', '720': 'Colorado', '970': 'Colorado',
      
      // CONNECTICUT
      '203': 'Connecticut', '475': 'Connecticut', '860': 'Connecticut', '959': 'Connecticut',
      
      // DELAWARE
      '302': 'Delaware',
      
      // FLORIDA
      '239': 'Florida', '305': 'Florida', '321': 'Florida', '352': 'Florida', '386': 'Florida',
      '407': 'Florida', '561': 'Florida', '689': 'Florida', '727': 'Florida', '754': 'Florida',
      '772': 'Florida', '786': 'Florida', '813': 'Florida', '850': 'Florida', '863': 'Florida',
      '904': 'Florida', '941': 'Florida', '954': 'Florida',
      
      // GEORGIA
      '229': 'Georgia', '404': 'Georgia', '470': 'Georgia', '478': 'Georgia', '678': 'Georgia',
      '706': 'Georgia', '762': 'Georgia', '770': 'Georgia', '912': 'Georgia',
      
      // HAWAII
      '808': 'Hawaii',
      
      // IDAHO
      '208': 'Idaho', '986': 'Idaho',
      
      // ILLINOIS
      '217': 'Illinois', '224': 'Illinois', '309': 'Illinois', '312': 'Illinois', '331': 'Illinois',
      '618': 'Illinois', '630': 'Illinois', '708': 'Illinois', '773': 'Illinois', '779': 'Illinois',
      '815': 'Illinois', '847': 'Illinois', '872': 'Illinois',
      
      // INDIANA
      '219': 'Indiana', '260': 'Indiana', '317': 'Indiana', '463': 'Indiana', '574': 'Indiana',
      '765': 'Indiana', '812': 'Indiana', '930': 'Indiana',
      
      // IOWA
      '319': 'Iowa', '515': 'Iowa', '563': 'Iowa', '641': 'Iowa', '712': 'Iowa',
      
      // KANSAS
      '316': 'Kansas', '620': 'Kansas', '785': 'Kansas', '913': 'Kansas',
      
      // KENTUCKY
      '270': 'Kentucky', '364': 'Kentucky', '502': 'Kentucky', '606': 'Kentucky', '859': 'Kentucky',
      
      // LOUISIANA
      '225': 'Louisiana', '318': 'Louisiana', '337': 'Louisiana', '504': 'Louisiana', '985': 'Louisiana',
      
      // MAINE
      '207': 'Maine',
      
      // MARYLAND
      '240': 'Maryland', '301': 'Maryland', '410': 'Maryland', '443': 'Maryland', '667': 'Maryland',
      
      // MASSACHUSETTS
      '339': 'Massachusetts', '351': 'Massachusetts', '413': 'Massachusetts', '508': 'Massachusetts',
      '617': 'Massachusetts', '774': 'Massachusetts', '781': 'Massachusetts', '857': 'Massachusetts',
      '978': 'Massachusetts',
      
      // MICHIGAN
      '231': 'Michigan', '248': 'Michigan', '269': 'Michigan', '313': 'Michigan', '517': 'Michigan',
      '586': 'Michigan', '616': 'Michigan', '679': 'Michigan', '734': 'Michigan', '810': 'Michigan',
      '906': 'Michigan', '947': 'Michigan', '989': 'Michigan',
      
      // MINNESOTA
      '218': 'Minnesota', '320': 'Minnesota', '507': 'Minnesota', '612': 'Minnesota', '651': 'Minnesota',
      '763': 'Minnesota', '952': 'Minnesota',
      
      // MISSISSIPPI
      '228': 'Mississippi', '601': 'Mississippi', '662': 'Mississippi', '769': 'Mississippi',
      
      // MISSOURI
      '314': 'Missouri', '417': 'Missouri', '573': 'Missouri', '636': 'Missouri', '660': 'Missouri',
      '816': 'Missouri',
      
      // MONTANA
      '406': 'Montana',
      
      // NEBRASKA
      '308': 'Nebraska', '402': 'Nebraska', '531': 'Nebraska',
      
      // NEVADA
      '702': 'Nevada', '725': 'Nevada', '775': 'Nevada',
      
      // NEW HAMPSHIRE
      '603': 'New Hampshire',
      
      // NEW JERSEY
      '201': 'New Jersey', '551': 'New Jersey', '609': 'New Jersey', '640': 'New Jersey',
      '732': 'New Jersey', '848': 'New Jersey', '856': 'New Jersey', '862': 'New Jersey',
      '908': 'New Jersey', '973': 'New Jersey',
      
      // NEW MEXICO
      '505': 'New Mexico', '575': 'New Mexico',
      
      // NEW YORK
      '212': 'New York', '315': 'New York', '332': 'New York', '347': 'New York', '516': 'New York',
      '518': 'New York', '585': 'New York', '607': 'New York', '631': 'New York', '646': 'New York',
      '680': 'New York', '716': 'New York', '718': 'New York', '838': 'New York', '845': 'New York',
      '914': 'New York', '917': 'New York', '929': 'New York', '934': 'New York',
      
      // NORTH CAROLINA
      '252': 'North Carolina', '336': 'North Carolina', '704': 'North Carolina', '743': 'North Carolina',
      '828': 'North Carolina', '910': 'North Carolina', '919': 'North Carolina', '980': 'North Carolina',
      '984': 'North Carolina',
      
      // NORTH DAKOTA
      '701': 'North Dakota',
      
      // OHIO
      '216': 'Ohio', '220': 'Ohio', '234': 'Ohio', '326': 'Ohio', '330': 'Ohio', '380': 'Ohio',
      '419': 'Ohio', '440': 'Ohio', '513': 'Ohio', '567': 'Ohio', '614': 'Ohio', '740': 'Ohio',
      '937': 'Ohio',
      
      // OKLAHOMA
      '405': 'Oklahoma', '539': 'Oklahoma', '580': 'Oklahoma', '918': 'Oklahoma',
      
      // OREGON
      '458': 'Oregon', '503': 'Oregon', '541': 'Oregon', '971': 'Oregon',
      
      // PENNSYLVANIA
      '215': 'Pennsylvania', '267': 'Pennsylvania', '272': 'Pennsylvania', '412': 'Pennsylvania',
      '445': 'Pennsylvania', '484': 'Pennsylvania', '570': 'Pennsylvania', '610': 'Pennsylvania',
      '717': 'Pennsylvania', '724': 'Pennsylvania', '814': 'Pennsylvania', '878': 'Pennsylvania',
      
      // RHODE ISLAND
      '401': 'Rhode Island',
      
      // SOUTH CAROLINA
      '803': 'South Carolina', '843': 'South Carolina', '854': 'South Carolina', '864': 'South Carolina',
      
      // SOUTH DAKOTA
      '605': 'South Dakota',
      
      // TENNESSEE
      '423': 'Tennessee', '615': 'Tennessee', '629': 'Tennessee', '731': 'Tennessee', '865': 'Tennessee',
      '901': 'Tennessee', '931': 'Tennessee',
      
      // TEXAS
      '214': 'Texas', '254': 'Texas', '281': 'Texas', '346': 'Texas', '361': 'Texas', '409': 'Texas',
      '430': 'Texas', '432': 'Texas', '469': 'Texas', '512': 'Texas', '713': 'Texas', '726': 'Texas',
      '737': 'Texas', '806': 'Texas', '817': 'Texas', '830': 'Texas', '832': 'Texas', '903': 'Texas',
      '915': 'Texas', '936': 'Texas', '940': 'Texas', '945': 'Texas', '956': 'Texas', '972': 'Texas',
      '979': 'Texas',
      
      // UTAH
      '385': 'Utah', '435': 'Utah', '801': 'Utah',
      
      // VERMONT
      '802': 'Vermont',
      
      // VIRGINIA
      '276': 'Virginia', '434': 'Virginia', '540': 'Virginia', '571': 'Virginia', '703': 'Virginia',
      '757': 'Virginia', '804': 'Virginia',
      
      // WASHINGTON
      '206': 'Washington', '253': 'Washington', '360': 'Washington', '425': 'Washington',
      '509': 'Washington', '564': 'Washington',
      
      // WEST VIRGINIA
      '304': 'West Virginia', '681': 'West Virginia',
      
      // WISCONSIN
      '262': 'Wisconsin', '414': 'Wisconsin', '534': 'Wisconsin', '608': 'Wisconsin', '715': 'Wisconsin', '920': 'Wisconsin',
      
      // WYOMING
      '307': 'Wyoming',
      
      // WASHINGTON DC
      '202': 'Washington DC'
    };

    this.stats = {
      totalProcessed: 0,
      validUSA: 0,
      invalidFormat: 0,
      duplicates: 0,
      unknownAreaCodes: 0
    };
  }

  // Validar formato de número americano
  validateUSANumber(phone) {
    if (!phone || typeof phone !== 'string') return null;
    
    // Limpar e extrair apenas números
    let clean = phone.replace(/\D/g, '');
    
    // Remover código país se presente
    if (clean.startsWith('1') && clean.length === 11) {
      clean = clean.substring(1);
    }
    
    // Deve ter exatamente 10 dígitos
    if (clean.length !== 10) return null;
    
    const areaCode = clean.substring(0, 3);
    const exchange = clean.substring(3, 6);
    const subscriber = clean.substring(6, 10);
    
    // Verificar se area code existe
    if (!this.areaCodeToState[areaCode]) return null;
    
    // Validações básicas de formato americano
    if (areaCode[0] === '0' || areaCode[0] === '1') return null;
    if (exchange[0] === '0' || exchange[0] === '1') return null;
    
    return {
      fullNumber: `+1${clean}`,
      areaCode,
      exchange,
      subscriber,
      state: this.areaCodeToState[areaCode],
      formatted: `+1 (${areaCode}) ${exchange}-${subscriber}`
    };
  }

  // Simular verificação de número ativo (básica)
  simulateNumberVerification(phone) {
    // Simulação básica - em produção usar APIs como Twilio, etc.
    const number = phone.replace(/\D/g, '');
    
    // Heurísticas básicas para números potencialmente ativos
    const checks = {
      notSequential: !this.isSequential(number),
      notAllSame: !this.isAllSameDigit(number),
      validPattern: this.hasValidPattern(number),
      notCommonInvalid: !this.isCommonInvalidNumber(number)
    };
    
    const activeScore = Object.values(checks).filter(Boolean).length;
    
    return {
      likelyActive: activeScore >= 3,
      confidence: (activeScore / 4) * 100,
      checks
    };
  }

  isSequential(number) {
    for (let i = 0; i < number.length - 3; i++) {
      const seq = number.substring(i, i + 4);
      const digits = seq.split('').map(d => parseInt(d));
      
      let isSeq = true;
      for (let j = 1; j < digits.length; j++) {
        if (digits[j] !== digits[j-1] + 1) {
          isSeq = false;
          break;
        }
      }
      if (isSeq) return true;
    }
    return false;
  }

  isAllSameDigit(number) {
    const firstDigit = number[0];
    return number.split('').every(digit => digit === firstDigit);
  }

  hasValidPattern(number) {
    // Padrões que sugerem números reais
    const last4 = number.substring(6);
    const exchange = number.substring(3, 6);
    
    // Não termina em 0000, 1111, etc.
    if (/^(\d)\1{3}$/.test(last4)) return false;
    
    // Exchange não é 000, 111, etc.
    if (/^(\d)\1{2}$/.test(exchange)) return false;
    
    return true;
  }

  isCommonInvalidNumber(number) {
    const commonInvalid = [
      '5555555555', '1234567890', '0000000000',
      '1111111111', '2222222222', '3333333333'
    ];
    
    return commonInvalid.includes(number.substring(0, 10));
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

  async organizeContacts() {
    console.log('🇺🇸 Organizando contatos por Estados Americanos...\n');

    try {
      // Carregar arquivo de telefones americanos
      const csvContent = fs.readFileSync('./phones-usa-valid-2025-07-12.csv', 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      console.log(`📊 Processando ${lines.length - 1} números americanos...\n`);

      for (let i = 1; i < lines.length; i++) {
        const parts = this.parseCSVLine(lines[i]);
        if (parts.length >= 2) {
          const [nome, telefone, , location] = parts;
          
          this.stats.totalProcessed++;
          
          // Validar número
          const validation = this.validateUSANumber(telefone);
          
          if (!validation) {
            this.invalidNumbers.push({
              nome,
              telefone,
              motivo: 'Formato inválido ou area code desconhecido'
            });
            this.stats.invalidFormat++;
            continue;
          }

          // Verificar duplicatas
          if (this.phoneSet.has(validation.fullNumber)) {
            this.duplicates.push({
              nome,
              telefone: validation.fullNumber,
              motivo: 'Número duplicado'
            });
            this.stats.duplicates++;
            continue;
          }

          this.phoneSet.add(validation.fullNumber);

          // Verificar se número parece ativo
          const verification = this.simulateNumberVerification(validation.fullNumber);

          const contact = {
            nome,
            telefone: validation.fullNumber,
            telefoneFormatado: validation.formatted,
            areaCode: validation.areaCode,
            estado: validation.state,
            likelyActive: verification.likelyActive,
            confidence: verification.confidence,
            checks: verification.checks
          };

          // Organizar por estado
          if (!this.stateContacts[validation.state]) {
            this.stateContacts[validation.state] = [];
          }
          
          this.stateContacts[validation.state].push(contact);
          this.validNumbers.push(contact);
          this.stats.validUSA++;

          if (this.stats.totalProcessed % 2000 === 0) {
            console.log(`⏳ Processados: ${this.stats.totalProcessed}...`);
          }
        }
      }

      console.log('\n✅ Organização concluída!');
      this.generateStateReport();
      await this.saveByStates();

    } catch (error) {
      console.error('❌ Erro na organização:', error.message);
      throw error;
    }
  }

  generateStateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🇺🇸 ORGANIZAÇÃO POR ESTADOS AMERICANOS');
    console.log('='.repeat(80));
    
    console.log(`\n📊 ESTATÍSTICAS GERAIS:`);
    console.log(`   Total processados: ${this.stats.totalProcessed.toLocaleString()}`);
    console.log(`   Números válidos: ${this.stats.validUSA.toLocaleString()}`);
    console.log(`   Números inválidos: ${this.stats.invalidFormat.toLocaleString()}`);
    console.log(`   Duplicatas: ${this.stats.duplicates.toLocaleString()}`);

    // Estatísticas por estado
    const stateStats = Object.entries(this.stateContacts)
      .map(([state, contacts]) => ({
        state,
        total: contacts.length,
        likelyActive: contacts.filter(c => c.likelyActive).length,
        highConfidence: contacts.filter(c => c.confidence >= 75).length
      }))
      .sort((a, b) => b.total - a.total);

    console.log(`\n🏛️ TOP 15 ESTADOS COM MAIS CONTATOS:`);
    stateStats.slice(0, 15).forEach((stat, index) => {
      const activeRate = ((stat.likelyActive / stat.total) * 100).toFixed(1);
      const confRate = ((stat.highConfidence / stat.total) * 100).toFixed(1);
      console.log(`   ${index + 1}. ${stat.state}: ${stat.total.toLocaleString()} contatos (${activeRate}% ativos, ${confRate}% alta confiança)`);
    });

    // Estados com brasileiros concentrados
    const brazilianStates = stateStats.filter(s => 
      ['Florida', 'Massachusetts', 'Connecticut', 'New York', 'New Jersey', 'California'].includes(s.state)
    );

    console.log(`\n🇧🇷 ESTADOS COM COMUNIDADES BRASILEIRAS:`);
    brazilianStates.forEach(stat => {
      const activeRate = ((stat.likelyActive / stat.total) * 100).toFixed(1);
      console.log(`   ${stat.state}: ${stat.total.toLocaleString()} contatos (${activeRate}% potencialmente ativos)`);
    });

    // Qualidade geral
    const totalActive = this.validNumbers.filter(c => c.likelyActive).length;
    const totalHighConf = this.validNumbers.filter(c => c.confidence >= 75).length;
    
    console.log(`\n📈 QUALIDADE DOS NÚMEROS:`);
    console.log(`   Provavelmente ativos: ${totalActive.toLocaleString()} (${((totalActive / this.stats.validUSA) * 100).toFixed(1)}%)`);
    console.log(`   Alta confiança: ${totalHighConf.toLocaleString()} (${((totalHighConf / this.stats.validUSA) * 100).toFixed(1)}%)`);
  }

  async saveByStates() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      // Salvar cada estado em arquivo separado
      for (const [state, contacts] of Object.entries(this.stateContacts)) {
        if (contacts.length > 0) {
          const stateFileName = state.replace(/\s+/g, '_').toLowerCase();
          
          const csv = 'nome,telefone,telefone_formatado,area_code,ativo_provavel,confianca\n' +
            contacts.map(c => 
              `"${c.nome}","${c.telefone}","${c.telefoneFormatado}","${c.areaCode}","${c.likelyActive ? 'Sim' : 'Não'}","${c.confidence.toFixed(1)}%"`
            ).join('\n');
          
          fs.writeFileSync(`./contacts_${stateFileName}_${timestamp}.csv`, csv);
        }
      }

      // Resumo geral por estado
      const statesSummary = Object.entries(this.stateContacts)
        .map(([state, contacts]) => ({
          estado: state,
          total: contacts.length,
          provavelmente_ativos: contacts.filter(c => c.likelyActive).length,
          alta_confianca: contacts.filter(c => c.confidence >= 75).length,
          taxa_ativacao: ((contacts.filter(c => c.likelyActive).length / contacts.length) * 100).toFixed(1) + '%'
        }))
        .sort((a, b) => b.total - a.total);

      const summaryCSV = 'estado,total_contatos,provavelmente_ativos,alta_confianca,taxa_ativacao\n' +
        statesSummary.map(s => 
          `"${s.estado}","${s.total}","${s.provavelmente_ativos}","${s.alta_confianca}","${s.taxa_ativacao}"`
        ).join('\n');

      fs.writeFileSync(`./states_summary_${timestamp}.csv`, summaryCSV);

      // Apenas números de alta qualidade
      const highQualityContacts = this.validNumbers.filter(c => c.likelyActive && c.confidence >= 75);
      
      if (highQualityContacts.length > 0) {
        const highQualityCSV = 'nome,telefone,telefone_formatado,estado,area_code,confianca\n' +
          highQualityContacts.map(c => 
            `"${c.nome}","${c.telefone}","${c.telefoneFormatado}","${c.estado}","${c.areaCode}","${c.confidence.toFixed(1)}%"`
          ).join('\n');
        
        fs.writeFileSync(`./contacts_high_quality_${timestamp}.csv`, highQualityCSV);
      }

      // Relatório completo
      const fullReport = {
        summary: {
          totalProcessed: this.stats.totalProcessed,
          validNumbers: this.stats.validUSA,
          invalidNumbers: this.stats.invalidFormat,
          duplicates: this.stats.duplicates,
          highQualityNumbers: highQualityContacts.length
        },
        stateBreakdown: statesSummary,
        topStates: statesSummary.slice(0, 10),
        processedAt: new Date().toISOString()
      };

      fs.writeFileSync(`./usa_contacts_report_${timestamp}.json`, JSON.stringify(fullReport, null, 2));

      console.log(`\n✅ ARQUIVOS ORGANIZADOS POR ESTADO:`);
      console.log(`   📁 ${Object.keys(this.stateContacts).length} arquivos por estado criados`);
      console.log(`   📊 states_summary_${timestamp}.csv - Resumo por estado`);
      if (highQualityContacts.length > 0) {
        console.log(`   ⭐ contacts_high_quality_${timestamp}.csv - ${highQualityContacts.length} números alta qualidade`);
      }
      console.log(`   📄 usa_contacts_report_${timestamp}.json - Relatório completo`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar por estados:', error.message);
    }
  }
}

// Executar organização
const organizer = new USAStateOrganizer();
organizer.organizeContacts()
  .then(() => {
    console.log('\n🎉 Organização por estados concluída!');
    console.log('\n📋 RECOMENDAÇÕES:');
    console.log('   1. Focar nos números de alta qualidade primeiro');
    console.log('   2. Testar campanhas por estado (FL, MA, CT, NY)');
    console.log('   3. Validar com API real os números de maior interesse');
    console.log('   4. Segmentar campanhas por comunidades brasileiras');
  })
  .catch(error => {
    console.error('\n💥 Falha na organização:', error.message);
  });