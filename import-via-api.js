const fs = require('fs');

async function importContacts() {
  console.log('🔄 Importando contatos via API do sistema...\n');

  try {
    const csvContent = fs.readFileSync('./contacts-emails-only.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) {
      throw new Error('Arquivo CSV vazio');
    }

    console.log(`📊 Total de contatos: ${lines.length - 1}`);
    
    // Usar a API de email-import do sistema
    const response = await fetch('http://localhost:3000/api/email-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'import_csv',
        csvContent: csvContent
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('\n📊 RESULTADO DA IMPORTAÇÃO:');
    console.log(`✅ Importados: ${result.imported || 0}`);
    console.log(`🔄 Duplicatas: ${result.duplicates || 0}`);
    console.log(`❌ Inválidos: ${result.invalid || 0}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️ Erros encontrados:');
      result.errors.slice(0, 5).forEach(error => console.log(`   ${error}`));
    }

    console.log('\n🎉 Importação concluída!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Fallback: criar script de inserção manual
    console.log('\n🔄 Criando script SQL alternativo...');
    createSQLScript();
  }
}

function createSQLScript() {
  try {
    const csvContent = fs.readFileSync('./contacts-emails-only.csv', 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    let sqlScript = `-- Script de importação de contatos\n\n`;
    sqlScript += `-- Criar tabela se não existir\n`;
    sqlScript += `CREATE TABLE IF NOT EXISTS email_contacts (\n`;
    sqlScript += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sqlScript += `  email VARCHAR(255) UNIQUE NOT NULL,\n`;
    sqlScript += `  nome VARCHAR(255) NOT NULL,\n`;
    sqlScript += `  sobrenome VARCHAR(255),\n`;
    sqlScript += `  telefone VARCHAR(50),\n`;
    sqlScript += `  cidade VARCHAR(100),\n`;
    sqlScript += `  segmento VARCHAR(100) NOT NULL DEFAULT 'geral',\n`;
    sqlScript += `  tags JSONB DEFAULT '[]',\n`;
    sqlScript += `  status VARCHAR(50) DEFAULT 'ativo',\n`;
    sqlScript += `  created_at TIMESTAMP DEFAULT NOW(),\n`;
    sqlScript += `  updated_at TIMESTAMP DEFAULT NOW()\n`;
    sqlScript += `);\n\n`;

    sqlScript += `-- Inserir contatos\n`;

    for (let i = 1; i < lines.length && i <= 101; i++) { // Primeiros 100 para teste
      const line = lines[i];
      const parts = parseCSVLine(line);
      
      if (parts.length >= 2) {
        const [nome, email, telefone, segmento, organizacao] = parts;
        
        if (email && nome) {
          const nameParts = nome.split(' ');
          const firstName = nameParts[0].replace(/'/g, "''");
          const lastName = nameParts.slice(1).join(' ').replace(/'/g, "''");
          const cleanEmail = email.toLowerCase().replace(/'/g, "''");
          const cleanPhone = telefone || '';
          const cleanSegment = segmento || 'geral';
          const tags = organizacao ? `["${organizacao.replace(/"/g, '\\"')}"]` : '[]';

          sqlScript += `INSERT INTO email_contacts (nome, sobrenome, email, telefone, segmento, tags) `;
          sqlScript += `VALUES ('${firstName}', `;
          sqlScript += lastName ? `'${lastName}', ` : 'NULL, ';
          sqlScript += `'${cleanEmail}', `;
          sqlScript += cleanPhone ? `'${cleanPhone}', ` : 'NULL, ';
          sqlScript += `'${cleanSegment}', '${tags}') `;
          sqlScript += `ON CONFLICT (email) DO NOTHING;\n`;
        }
      }
    }

    fs.writeFileSync('./import-contacts.sql', sqlScript);
    console.log('✅ Arquivo import-contacts.sql criado com sucesso!');
    console.log('📋 Você pode executar este script diretamente no banco de dados');

  } catch (error) {
    console.error('❌ Erro ao criar script SQL:', error.message);
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

// Executar
importContacts();