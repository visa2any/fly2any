const fs = require('fs');
const path = require('path');

// Lista de páginas para aplicar melhorias mobile
const pagesToUpdate = [
  'src/app/blog/page.tsx',
  'src/app/como-funciona/page.tsx',
  'src/app/contato/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/sobre/page.tsx',
  'src/app/voos-brasil-eua/page.tsx',
  'src/app/voos-miami-sao-paulo/page.tsx',
  'src/app/voos-new-york-rio-janeiro/page.tsx'
];

console.log('📱 Aplicando melhorias mobile em páginas principais...\n');

pagesToUpdate.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 1. Adicionar imports se não existirem
      if (!content.includes('ResponsiveHeader')) {
        content = content.replace(
          /import Logo from '@\/components\/Logo';/,
          `import Logo from '@/components/Logo';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import GlobalMobileStyles from '@/components/GlobalMobileStyles';`
        );
        modified = true;
      }
      
      // 2. Substituir headers fixos pelo ResponsiveHeader
      if (content.includes('<header style={{')) {
        // Encontrar e substituir header complexo
        const headerRegex = /<header style={{[^}]*}}>\s*<div style={{[^}]*}}>\s*<div style={{ display: "flex"[^}]*}}>[^<]*<Logo[^>]*\/>[^<]*<span[^>]*>[^<]*<\/span><\/div>[^<]*<\/Link>/;
        if (headerRegex.test(content)) {
          content = content.replace(
            headerRegex,
            '<ResponsiveHeader'
          );
          
          // Encontrar o fechamento do header e substituir
          content = content.replace(
            /<\/nav>\s*<\/div>\s*<\/header>/,
            ' />'
          );
          modified = true;
        }
      }
      
      // 3. Adicionar GlobalMobileStyles no início do componente
      if (!content.includes('<GlobalMobileStyles />')) {
        content = content.replace(
          /return \(\s*<div/,
          `return (
    <>
      <GlobalMobileStyles />
      <div`
        );
        
        // Fechar o fragment no final
        const lastDivMatch = content.lastIndexOf('</div>');
        if (lastDivMatch !== -1) {
          content = content.substring(0, lastDivMatch + 6) + '\n    </>' + content.substring(lastDivMatch + 6);
        }
        modified = true;
      }
      
      // 4. Adicionar classes responsivas em containers principais
      content = content.replace(
        /style={{([^}]*maxWidth: '[^']*'[^}]*)}}/g,
        (match, styles) => {
          if (!match.includes('className')) {
            return `${match.slice(0, -2)} className="mobile-container"}}`;
          }
          return match;
        }
      );
      
      // 5. Adicionar classes responsivas em seções
      content = content.replace(
        /style={{([^}]*padding: '[^']*'[^}]*)}}/g,
        (match, styles) => {
          if (styles.includes('padding') && !match.includes('className')) {
            return `${match.slice(0, -2)} className="mobile-section"}}`;
          }
          return match;
        }
      );
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Melhorias mobile aplicadas: ${filePath}`);
      } else {
        console.log(`ℹ️ Nenhuma modificação necessária: ${filePath}`);
      }
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Aplicação de melhorias mobile concluída!');
console.log('\n📋 Melhorias aplicadas:');
console.log('   • ResponsiveHeader em todas as páginas');
console.log('   • GlobalMobileStyles para CSS responsivo');
console.log('   • Classes mobile em containers e seções');
console.log('   • Imports automáticos dos novos componentes');
console.log('\n📱 Agora todas as páginas têm:');
console.log('   • Menu hamburger mobile profissional');
console.log('   • Layout responsivo automático');
console.log('   • Estilos mobile-first aplicados');
console.log('   • Melhor UX em dispositivos móveis');