const fs = require('fs');

class PhonePatternAnalyzer {
  constructor() {
    this.patterns = {
      suspiciousBrazilian: [],
      validUSA: [],
      validBrazilian: [],
      invalid: [],
      suspicious: []
    };
    
    this.analysis = {
      areaCodeFrequency: {},
      prefixAnalysis: {},
      lengthDistribution: {},
      suspicious203: [],
      suspicious860: []
    };
  }

  // Análise mais rigorosa de números americanos
  analyzeUSAPhone(phone, originalPhone) {
    if (!phone || !phone.startsWith('+1')) return 'invalid';
    
    const number = phone.substring(2); // Remove +1
    if (number.length !== 10) return 'invalid';
    
    const areaCode = number.substring(0, 3);
    const exchange = number.substring(3, 6);
    const subscriber = number.substring(6, 10);
    
    // Verificações suspeitas específicas
    const suspiciousPatterns = {
      // Padrões que parecem brasileiros mal formatados
      tooManyRepeated: this.hasRepeatedDigits(number, 4),
      sequentialDigits: this.hasSequentialDigits(number),
      brazilianLikePattern: this.looksLikeBrazilian(originalPhone, number),
      invalidAreaCode: !this.isValidUSAreaCode(areaCode),
      invalidExchange: !this.isValidUSExchange(exchange)
    };
    
    const suspiciousCount = Object.values(suspiciousPatterns).filter(Boolean).length;
    
    return {
      valid: suspiciousCount === 0,
      areaCode,
      exchange,
      subscriber,
      suspiciousPatterns,
      suspiciousCount,
      originalPhone
    };
  }

  // Verificar se area code é válido nos EUA
  isValidUSAreaCode(areaCode) {
    const area = parseInt(areaCode);
    
    // Area codes que NÃO existem nos EUA
    const invalidCodes = [
      // Códigos que começam com 0 ou 1
      ...Array.from({length: 100}, (_, i) => String(i).padStart(3, '0')).filter(code => 
        code.startsWith('0') || code.startsWith('1')
      ),
      // Códigos N11 (reservados)
      '211', '311', '411', '511', '611', '711', '811', '911',
      // Códigos inexistentes específicos
      '000', '001', '002', // etc...
    ];
    
    if (invalidCodes.includes(areaCode)) return false;
    
    // Area codes válidos conhecidos (lista parcial dos principais)
    const validUSAreaCodes = [
      // Major metros
      '212', '646', '917', '347', '929', // NYC
      '213', '323', '310', '424', '747', // LA
      '305', '786', '954', '754', '561', // Florida
      '617', '857', '781', '508', '978', // Massachusetts
      '202', // DC
      '404', '678', '770', // Atlanta
      '312', '773', '872', // Chicago
      '214', '469', '972', '945', // Dallas
      '713', '281', '832', // Houston
      '415', '628', '650', // San Francisco
      '206', '425', '253', // Seattle
      '303', '720', '970', // Colorado
      '407', '321', '689', // Orlando
      '239', '941', // SW Florida
      '203', '475', '860', '959', // Connecticut
      '516', '631', '934', // Long Island
      '718', '347', '929', '917', // NYC Outer
      '772', '386' // Florida
    ];
    
    // Se não está na lista de válidos conhecidos, é suspeito
    return validUSAreaCodes.includes(areaCode);
  }

  // Verificar exchange code
  isValidUSExchange(exchange) {
    const exchangeNum = parseInt(exchange);
    
    // Exchange não pode começar com 0 ou 1
    if (exchange[0] === '0' || exchange[0] === '1') return false;
    
    // Códigos N11 são inválidos para exchange
    if (exchange.endsWith('11')) return false;
    
    return exchangeNum >= 200 && exchangeNum <= 999;
  }

  // Detectar dígitos repetidos suspeitos
  hasRepeatedDigits(number, threshold = 4) {
    const digitCounts = {};
    for (const digit of number) {
      digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    }
    
    return Object.values(digitCounts).some(count => count >= threshold);
  }

  // Detectar sequências suspeitas
  hasSequentialDigits(number) {
    for (let i = 0; i < number.length - 3; i++) {
      const sequence = number.substring(i, i + 4);
      const digits = sequence.split('').map(d => parseInt(d));
      
      // Sequência crescente ou decrescente
      const isSequential = digits.every((digit, index) => 
        index === 0 || digit === digits[index - 1] + 1
      ) || digits.every((digit, index) => 
        index === 0 || digit === digits[index - 1] - 1
      );
      
      if (isSequential) return true;
    }
    
    return false;
  }

  // Verificar se parece com número brasileiro mal formatado
  looksLikeBrazilian(originalPhone, formattedNumber) {
    const original = originalPhone.replace(/\D/g, '');
    
    // Padrões suspeitos que indicam origem brasileira
    return (
      // Tinha código 55 no original
      original.includes('55') ||
      // Comprimento típico brasileiro
      (original.length === 11 || original.length === 13) ||
      // Padrão de DDD brasileiro (11-99)
      (formattedNumber.substring(0, 2) >= '11' && formattedNumber.substring(0, 2) <= '99' && 
       formattedNumber[2] === '9') ||
      // Zero inicial (comum em brasileiros)
      original.startsWith('0')
    );
  }

  async analyzePhoneFile() {
    console.log('🔍 Analisando padrões suspeitos nos telefones...\n');

    try {
      const csvContent = fs.readFileSync('./phones-usa-valid-2025-07-12.csv', 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      console.log(`📊 Analisando ${lines.length - 1} números americanos...\n`);

      for (let i = 1; i < lines.length; i++) {
        const parts = this.parseCSVLine(lines[i]);
        if (parts.length >= 2) {
          const [nome, telefone] = parts;
          const originalPhone = parts[6] || telefone; // telefone original se disponível
          
          const analysis = this.analyzeUSAPhone(telefone, originalPhone);
          
          if (typeof analysis === 'object') {
            // Contar area codes
            this.analysis.areaCodeFrequency[analysis.areaCode] = 
              (this.analysis.areaCodeFrequency[analysis.areaCode] || 0) + 1;
            
            if (analysis.valid) {
              this.patterns.validUSA.push({ nome, telefone, ...analysis });
            } else {
              this.patterns.suspicious.push({ nome, telefone, ...analysis });
              
              // Casos específicos suspeitos
              if (analysis.areaCode === '203') {
                this.analysis.suspicious203.push({ nome, telefone, ...analysis });
              }
              if (analysis.areaCode === '860') {
                this.analysis.suspicious860.push({ nome, telefone, ...analysis });
              }
            }
          }
        }

        if (i % 2000 === 0) {
          console.log(`⏳ Analisados: ${i}/${lines.length - 1}...`);
        }
      }

      this.generateDetailedReport();
      await this.saveAnalysisResults();

    } catch (error) {
      console.error('❌ Erro na análise:', error.message);
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

  generateDetailedReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 ANÁLISE DETALHADA DE PADRÕES TELEFÔNICOS');
    console.log('='.repeat(80));
    
    const totalAnalyzed = this.patterns.validUSA.length + this.patterns.suspicious.length;
    
    console.log(`\n📊 RESUMO GERAL:`);
    console.log(`   Total analisado: ${totalAnalyzed.toLocaleString()}`);
    console.log(`   Números válidos: ${this.patterns.validUSA.length.toLocaleString()}`);
    console.log(`   Números suspeitos: ${this.patterns.suspicious.length.toLocaleString()}`);
    console.log(`   Taxa de validade: ${((this.patterns.validUSA.length / totalAnalyzed) * 100).toFixed(1)}%`);

    console.log(`\n🚨 AREA CODES MAIS SUSPEITOS:`);
    
    // Connecticut analysis
    console.log(`\n📍 CONNECTICUT (203):`);
    console.log(`   Total: ${this.analysis.areaCodeFrequency['203'] || 0}`);
    console.log(`   Suspeitos: ${this.analysis.suspicious203.length}`);
    console.log(`   Taxa suspeita: ${this.analysis.suspicious203.length > 0 ? 
      ((this.analysis.suspicious203.length / (this.analysis.areaCodeFrequency['203'] || 1)) * 100).toFixed(1) : 0}%`);
    
    if (this.analysis.suspicious203.length > 0) {
      console.log(`   Exemplos suspeitos:`);
      this.analysis.suspicious203.slice(0, 5).forEach(item => {
        console.log(`     ${item.telefone} - ${Object.keys(item.suspiciousPatterns).filter(k => item.suspiciousPatterns[k]).join(', ')}`);
      });
    }

    console.log(`\n📍 CONNECTICUT (860):`);
    console.log(`   Total: ${this.analysis.areaCodeFrequency['860'] || 0}`);
    console.log(`   Suspeitos: ${this.analysis.suspicious860.length}`);
    
    // Top area codes ordenados por suspeita
    const areaCodeSuspicion = {};
    this.patterns.suspicious.forEach(item => {
      areaCodeSuspicion[item.areaCode] = (areaCodeSuspicion[item.areaCode] || 0) + 1;
    });

    console.log(`\n📈 TOP AREA CODES POR SUSPEITA:`);
    Object.entries(areaCodeSuspicion)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([area, count]) => {
        const total = this.analysis.areaCodeFrequency[area] || 0;
        const rate = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        console.log(`   ${area}: ${count}/${total} suspeitos (${rate}%)`);
      });

    // Padrões suspeitos mais comuns
    const suspiciousReasons = {};
    this.patterns.suspicious.forEach(item => {
      Object.keys(item.suspiciousPatterns).forEach(reason => {
        if (item.suspiciousPatterns[reason]) {
          suspiciousReasons[reason] = (suspiciousReasons[reason] || 0) + 1;
        }
      });
    });

    console.log(`\n⚠️ MOTIVOS DE SUSPEITA MAIS COMUNS:`);
    Object.entries(suspiciousReasons)
      .sort(([,a], [,b]) => b - a)
      .forEach(([reason, count]) => {
        console.log(`   ${reason}: ${count.toLocaleString()} casos`);
      });
  }

  async saveAnalysisResults() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      // Números realmente válidos (não suspeitos)
      if (this.patterns.validUSA.length > 0) {
        const validCSV = 'nome,telefone,area_code,exchange,confidence\n' +
          this.patterns.validUSA.map(item => 
            `"${item.nome}","${item.telefone}","${item.areaCode}","${item.exchange}","high"`
          ).join('\n');
        
        fs.writeFileSync(`./phones-usa-verified-${timestamp}.csv`, validCSV);
      }

      // Números suspeitos para revisão manual
      if (this.patterns.suspicious.length > 0) {
        const suspiciousCSV = 'nome,telefone,area_code,motivos_suspeita,telefone_original\n' +
          this.patterns.suspicious.map(item => 
            `"${item.nome}","${item.telefone}","${item.areaCode}","${Object.keys(item.suspiciousPatterns).filter(k => item.suspiciousPatterns[k]).join('; ')}","${item.originalPhone}"`
          ).join('\n');
        
        fs.writeFileSync(`./phones-usa-suspicious-${timestamp}.csv`, suspiciousCSV);
      }

      // Relatório detalhado
      const detailedReport = {
        summary: {
          totalAnalyzed: this.patterns.validUSA.length + this.patterns.suspicious.length,
          validCount: this.patterns.validUSA.length,
          suspiciousCount: this.patterns.suspicious.length,
          validityRate: ((this.patterns.validUSA.length / (this.patterns.validUSA.length + this.patterns.suspicious.length)) * 100).toFixed(1)
        },
        areaCodeFrequency: this.analysis.areaCodeFrequency,
        suspiciousAreaCodes: Object.fromEntries(
          Object.entries(this.analysis.areaCodeFrequency)
            .filter(([area]) => this.patterns.suspicious.some(s => s.areaCode === area))
        ),
        connecticut203Analysis: {
          total: this.analysis.areaCodeFrequency['203'] || 0,
          suspicious: this.analysis.suspicious203.length,
          examples: this.analysis.suspicious203.slice(0, 10)
        },
        processedAt: new Date().toISOString()
      };

      fs.writeFileSync(`./phone-pattern-analysis-${timestamp}.json`, JSON.stringify(detailedReport, null, 2));

      console.log(`\n✅ ARQUIVOS DE ANÁLISE GERADOS:`);
      if (this.patterns.validUSA.length > 0) {
        console.log(`   ✅ phones-usa-verified-${timestamp}.csv - ${this.patterns.validUSA.length.toLocaleString()} números confiáveis`);
      }
      if (this.patterns.suspicious.length > 0) {
        console.log(`   ⚠️ phones-usa-suspicious-${timestamp}.csv - ${this.patterns.suspicious.length.toLocaleString()} números suspeitos`);
      }
      console.log(`   📊 phone-pattern-analysis-${timestamp}.json - Análise completa`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar análise:', error.message);
    }
  }
}

// Executar análise
const analyzer = new PhonePatternAnalyzer();
analyzer.analyzePhoneFile()
  .then(() => {
    console.log('\n🎉 Análise de padrões concluída!');
    console.log('\n📋 RECOMENDAÇÕES:');
    console.log('   1. Revisar números suspeitos antes do uso');
    console.log('   2. Focar apenas nos números verificados');
    console.log('   3. Investigar concentração em Connecticut');
    console.log('   4. Validar com API real antes de campanhas');
  })
  .catch(error => {
    console.error('\n💥 Falha na análise:', error.message);
  });