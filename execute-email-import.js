const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function executeEmailImport() {
  console.log('📧 Executando importação de emails no banco...\n');
  
  try {
    // Ler o script SQL
    const sqlScript = fs.readFileSync('./import-emails-complete-2025-07-12.sql', 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlScript
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('--'))
      .join(' ')
      .split(';')
      .filter(cmd => cmd.trim());

    console.log(`📊 ${commands.length} comandos SQL para executar...\n`);

    let executed = 0;
    let errors = 0;

    // Executar comando por comando
    for (const command of commands) {
      const trimmedCommand = command.trim();
      if (!trimmedCommand) continue;

      try {
        await sql.query(trimmedCommand);
        executed++;
        
        if (executed % 100 === 0) {
          console.log(`✅ Executados: ${executed}/${commands.length}`);
        }
      } catch (error) {
        errors++;
        if (errors <= 5) { // Mostrar apenas os primeiros 5 erros
          console.log(`❌ Erro: ${error.message.substring(0, 100)}...`);
        }
      }
    }

    // Verificar resultado
    const countResult = await sql`
      SELECT COUNT(*) as total FROM email_contacts WHERE status = 'ativo'
    `;
    
    const segmentResult = await sql`
      SELECT segmento, COUNT(*) as count 
      FROM email_contacts 
      WHERE status = 'ativo'
      GROUP BY segmento 
      ORDER BY count DESC
    `;

    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORTAÇÃO CONCLUÍDA!');
    console.log('='.repeat(50));
    console.log(`✅ Comandos executados: ${executed}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📧 Total de emails ativos: ${countResult.rows[0]?.total || 0}`);
    
    console.log('\n🎯 SEGMENTAÇÃO:');
    segmentResult.rows.forEach(row => {
      console.log(`   ${row.segmento}: ${row.count} contatos`);
    });

    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('   1. Testar página de email marketing');
    console.log('   2. Criar primeira campanha segmentada');
    console.log('   3. Configurar templates de email');

  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
  }
}

executeEmailImport();