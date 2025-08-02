// Script para verificar se há erros óbvios de sintaxe
const fs = require('fs');

console.log('🔍 Verificando sintaxe dos arquivos modificados...\n');

const files = [
  '/mnt/d/Users/vilma/fly2any/src/app/voos/page.tsx',
  '/mnt/d/Users/vilma/fly2any/src/components/flights/FlightSearchForm.tsx'
];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Verificações básicas
    const checks = [
      {
        name: 'Tags não fechadas',
        test: () => {
          const openTags = (content.match(/<[a-zA-Z][^/>]*[^/]>/g) || []).length;
          const closeTags = (content.match(/<\/[a-zA-Z][^>]*>/g) || []).length;
          const selfClosing = (content.match(/<[a-zA-Z][^>]*\/>/g) || []).length;
          return openTags === closeTags;
        }
      },
      {
        name: 'Parênteses balanceados',
        test: () => {
          let count = 0;
          for (let char of content) {
            if (char === '(') count++;
            if (char === ')') count--;
            if (count < 0) return false;
          }
          return count === 0;
        }
      },
      {
        name: 'Chaves balanceadas',
        test: () => {
          let count = 0;
          for (let char of content) {
            if (char === '{') count++;
            if (char === '}') count--;
            if (count < 0) return false;
          }
          return count === 0;
        }
      },
      {
        name: 'className sem fechamento',
        test: () => !content.includes('className="') || !content.match(/className="[^"]*"[^>]/g)?.some(match => !match.includes('"'))
      }
    ];
    
    console.log(`📄 ${file.split('/').pop()}:`);
    
    let hasErrors = false;
    checks.forEach(check => {
      const passed = check.test();
      console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
      if (!passed) hasErrors = true;
    });
    
    if (!hasErrors) {
      console.log(`  🎉 Sintaxe básica OK\n`);
    } else {
      console.log(`  ⚠️  Possíveis problemas encontrados\n`);
    }
    
  } catch (error) {
    console.log(`❌ Erro ao ler ${file}: ${error.message}\n`);
  }
});

console.log('✅ Verificação de sintaxe concluída!');