const fs = require('fs');

// Lista de arquivos que usam lg e devem ser reduzidos para md
const filesToUpdate = [
  'src/app/voos-brasil-eua/page.tsx',
  'src/app/voos-miami-sao-paulo/page.tsx', 
  'src/app/voos-new-york-rio-janeiro/page.tsx'
];

// Lista de arquivos que usam md e devem ser reduzidos para sm  
const filesToReduceToSm = [
  'src/app/blog/page.tsx',
  'src/app/como-funciona/page.tsx',
  'src/app/contato/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/page-simple.tsx'
];

console.log('📏 Ajustando tamanhos dos logos após dobrar as dimensões...\n');

// 1. Páginas que usavam lg agora usam md
filesToUpdate.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Substituir lg por md
      content = content.replace(
        /<Logo size="lg" variant="logo-only"/g,
        '<Logo size="md" variant="logo-only"'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Atualizado lg→md: ${filePath}`);
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${filePath}:`, error.message);
  }
});

// 2. Páginas que usavam md agora usam sm
filesToReduceToSm.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Substituir md por sm nos logos
      content = content.replace(
        /<Logo size="md" variant="logo-only"/g,
        '<Logo size="sm" variant="logo-only"'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Atualizado md→sm: ${filePath}`);
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Tamanhos ajustados!');
console.log('\n📋 Resumo dos novos tamanhos:');
console.log('   • sm: 64px (era 32px) - Páginas secundárias');
console.log('   • md: 96px (era 48px) - Páginas principais');  
console.log('   • lg: 128px (era 64px) - Headers grandes');
console.log('   • xl: 192px (era 96px) - Landing pages especiais');
console.log('\n✅ Agora os logos têm o dobro do tamanho em toda a plataforma!');