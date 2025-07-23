const fs = require('fs');
const path = require('path');

// Lista de arquivos para atualizar
const filesToUpdate = [
  'src/app/voos-brasil-eua/page.tsx',
  'src/app/voos-miami-sao-paulo/page.tsx', 
  'src/app/voos-new-york-rio-janeiro/page.tsx',
  'src/app/page-mobile.tsx'
];

// Lista de arquivos que devem manter texto mas com logo menor
const filesToKeepText = [
  'src/app/blog/page.tsx',
  'src/app/como-funciona/page.tsx',
  'src/app/contato/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/page-simple.tsx',
  'src/app/sobre/page.tsx'
];

console.log('🔧 Corrigindo duplicação de logo...\n');

// 1. Atualizar páginas principais para logo-only
filesToUpdate.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Substituir Logo com showText por variant="logo-only"
      content = content.replace(
        /<Logo size="md" showText={true} headingLevel="div" \/>/g,
        '<Logo size="lg" variant="logo-only" headingLevel="div" />'
      );
      
      content = content.replace(
        /<Logo size="md" showText={true} variant="white" \/>/g,
        '<Logo size="lg" variant="logo-only" />'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Atualizado: ${filePath}`);
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${filePath}:`, error.message);
  }
});

// 2. Atualizar páginas que mantêm texto mas com logo menor
filesToKeepText.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Manter texto mas usar tamanho menor do logo
      content = content.replace(
        /<Logo size="md" showText={true} \/>/g,
        '<Logo size="sm" showText={false} /> <span style="margin-left: 8px; font-weight: 700; font-size: 18px;">Fly2Any</span>'
      );
      
      content = content.replace(
        /<Logo size="sm" showText={true} \/>/g,
        '<Logo size="sm" showText={false} /> <span style="margin-left: 6px; font-weight: 700; font-size: 16px;">Fly2Any</span>'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Atualizado (com texto): ${filePath}`);
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Correção de duplicação concluída!');
console.log('\n📋 Resumo das mudanças:');
console.log('   • Páginas principais: Logo oficial sem texto duplicado');
console.log('   • Páginas secundárias: Logo pequeno + texto estilizado');
console.log('   • Admin/Omnichannel: Logo oficial sem texto');
console.log('   • Email templates: Mantidos como estavam');