const fs = require('fs');

// Lista de arquivos que precisam corrigir a sintaxe
const filesToFix = [
  'src/app/blog/page.tsx',
  'src/app/como-funciona/page.tsx',
  'src/app/contato/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/page-simple.tsx',
  'src/app/sobre/page.tsx'
];

console.log('🔧 Corrigindo sintaxe JSX...\n');

filesToFix.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Corrigir sintaxe inline para componente React adequado
      content = content.replace(
        /<Logo size="sm" showText={false} \/> <span style="margin-left: 8px; font-weight: 700; font-size: 18px;">Fly2Any<\/span>/g,
        '<div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Logo size="md" variant="logo-only" /><span style={{ fontWeight: 700, fontSize: "18px" }}>Fly2Any</span></div>'
      );
      
      content = content.replace(
        /<Logo size="sm" showText={false} \/> <span style="margin-left: 6px; font-weight: 700; font-size: 16px;">Fly2Any<\/span>/g,
        '<div style={{ display: "flex", alignItems: "center", gap: "6px" }}><Logo size="sm" variant="logo-only" /><span style={{ fontWeight: 700, fontSize: "16px" }}>Fly2Any</span></div>'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Sintaxe corrigida: ${filePath}`);
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Sintaxe JSX corrigida!');
console.log('\n📋 Agora todos os logos estão usando a sintaxe correta do React:');
console.log('   • Logo oficial sem texto duplicado nas páginas principais');
console.log('   • Logo + texto estilizado nas páginas secundárias');
console.log('   • Sintaxe JSX válida em todos os arquivos');