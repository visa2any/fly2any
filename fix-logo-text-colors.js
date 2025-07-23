const fs = require('fs');

// Lista de arquivos para corrigir cores
const filesToFix = [
  'src/app/blog/page.tsx',
  'src/app/como-funciona/page.tsx',
  'src/app/contato/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/page-simple.tsx',
  'src/app/sobre/page.tsx'
];

console.log('🎨 Corrigindo cores do texto Fly2Any...\n');

filesToFix.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Corrigir cores para branco nos headers (onde o fundo é escuro)
      content = content.replace(
        /<span style={{ fontWeight: 700, fontSize: "18px" }}>Fly2Any<\/span>/g,
        '<span style={{ fontWeight: 700, fontSize: "18px", color: "white" }}>Fly2Any</span>'
      );
      
      content = content.replace(
        /<span style={{ fontWeight: 700, fontSize: "16px" }}>Fly2Any<\/span>/g,
        '<span style={{ fontWeight: 700, fontSize: "16px", color: "white" }}>Fly2Any</span>'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cores corrigidas: ${filePath}`);
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Cores corrigidas!');
console.log('\n📋 Agora o texto "Fly2Any" está com a cor adequada:');
console.log('   • Branco nos headers com fundo escuro');
console.log('   • Mantém boa legibilidade e contraste');
console.log('   • Logo oficial + texto estilizado harmonizados');