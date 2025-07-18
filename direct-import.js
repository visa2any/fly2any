const fs = require('fs');

async function directImport() {
  console.log('🔄 Importação direta via emailImportService...\n');

  try {
    // Importar o serviço (simulando o ambiente Node.js)
    const { emailImportService } = require('./src/lib/email-import.ts');
    
    const csvContent = fs.readFileSync('./contacts-emails-only.csv', 'utf8');
    console.log(`📊 Arquivo CSV carregado: ${csvContent.split('\n').length - 1} contatos`);

    const result = await emailImportService.processCSV(csvContent);
    
    console.log('\n📊 RESULTADO DA IMPORTAÇÃO:');
    console.log(`✅ Sucesso: ${result.success}`);
    console.log(`📥 Importados: ${result.imported}`);
    console.log(`🔄 Duplicatas: ${result.duplicates}`);
    console.log(`❌ Inválidos: ${result.invalid}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️ Erros:');
      result.errors.forEach(error => console.log(`   ${error}`));
    }

    // Verificar estatísticas
    const stats = await emailImportService.getContactStats();
    console.log('\n📈 ESTATÍSTICAS FINAIS:');
    console.log(`📧 Total de contatos: ${stats.total}`);
    console.log('🎯 Por segmento:');
    Object.entries(stats.segments).forEach(([segment, count]) => {
      console.log(`   ${segment}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Erro na importação direta:', error.message);
    
    // Plano B: criar contatos via SQL direto
    console.log('\n🔄 Executando plano alternativo...');
    await createDirectSQL();
  }
}

async function createDirectSQL() {
  try {
    const csvContent = fs.readFileSync('./contacts-emails-only.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let insertScript = '';
    let count = 0;

    console.log('🔧 Criando comandos SQL para inserção...');

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]);
      
      if (parts.length >= 2) {
        const [nome, email, telefone, segmento, organizacao] = parts;
        
        if (email && nome && email.includes('@')) {
          const nameParts = nome.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          insertScript += `INSERT INTO email_contacts (nome, sobrenome, email, telefone, segmento, tags, status) VALUES (`;
          insertScript += `'${firstName.replace(/'/g, "''")}', `;
          insertScript += lastName ? `'${lastName.replace(/'/g, "''")}', ` : 'NULL, ';
          insertScript += `'${email.toLowerCase()}', `;
          insertScript += telefone ? `'${telefone}', ` : 'NULL, ';
          insertScript += `'${segmento || 'brasileiros-eua'}', `;
          insertScript += organizacao ? `'["${organizacao.replace(/"/g, '\\"')}"]', ` : `'[]', `;
          insertScript += `'ativo') ON CONFLICT (email) DO NOTHING;\n`;
          
          count++;
        }
      }
    }

    const fullScript = `-- Importação de ${count} contatos
-- Executar no banco Vercel Postgres

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS email_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  sobrenome VARCHAR(255),
  telefone VARCHAR(50),
  cidade VARCHAR(100),
  segmento VARCHAR(100) NOT NULL DEFAULT 'geral',
  tags JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);
CREATE INDEX IF NOT EXISTS idx_email_contacts_segmento ON email_contacts(segmento);
CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(status);

-- Inserções
${insertScript}

-- Verificar resultado
SELECT 
  segmento, 
  COUNT(*) as total 
FROM email_contacts 
WHERE status = 'ativo' 
GROUP BY segmento 
ORDER BY total DESC;
`;

    fs.writeFileSync('./final-import.sql', fullScript);
    console.log(`✅ Script SQL criado: final-import.sql`);
    console.log(`📊 ${count} contatos prontos para importação`);
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Execute o script final-import.sql no banco Vercel Postgres');
    console.log('2. Verifique se os contatos foram importados');
    console.log('3. Teste as campanhas de email marketing');

  } catch (error) {
    console.error('❌ Erro ao criar SQL:', error.message);
  }
}

function parseCSVLine(line) {
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

directImport();