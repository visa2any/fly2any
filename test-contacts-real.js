#!/usr/bin/env node

/**
 * Teste DIRETO da base de dados para verificar contatos reais
 */

const { sql } = require('@vercel/postgres');

async function testContactsDatabase() {
  try {
    console.log('🔍 VERIFICANDO CONTATOS DIRETAMENTE NO BANCO DE DADOS\n');
    
    // 1. Total geral de contatos
    const totalResult = await sql`SELECT COUNT(*) as total FROM email_contacts`;
    const total = parseInt(totalResult.rows[0].total);
    console.log(`📊 Total de contatos na tabela: ${total.toLocaleString()}`);
    
    // 2. Contatos por status
    const statusResult = await sql`
      SELECT status, COUNT(*) as count 
      FROM email_contacts 
      GROUP BY status 
      ORDER BY count DESC
    `;
    console.log('\n📊 Contatos por status:');
    statusResult.rows.forEach(row => {
      console.log(`   ${row.status}: ${parseInt(row.count).toLocaleString()}`);
    });
    
    // 3. Contatos por segmento
    const segmentResult = await sql`
      SELECT segmento, COUNT(*) as count 
      FROM email_contacts 
      GROUP BY segmento 
      ORDER BY count DESC
    `;
    console.log('\n📊 Contatos por segmento:');
    segmentResult.rows.forEach(row => {
      console.log(`   ${row.segmento || 'null'}: ${parseInt(row.count).toLocaleString()}`);
    });
    
    // 4. Contatos ativos por segmento
    console.log('\n📊 Contatos ATIVOS por segmento:');
    const segments = ['brasileiros-eua', 'familias', 'casais', 'aventureiros', 'executivos'];
    
    for (const segment of segments) {
      const segmentActiveResult = await sql`
        SELECT COUNT(*) as count 
        FROM email_contacts 
        WHERE segmento = ${segment} AND status = 'ativo'
      `;
      const count = parseInt(segmentActiveResult.rows[0].count);
      console.log(`   ${segment}: ${count.toLocaleString()}`);
    }
    
    // 5. Amostras de contatos
    const sampleResult = await sql`
      SELECT email, nome, segmento, status 
      FROM email_contacts 
      LIMIT 5
    `;
    console.log('\n📧 Amostra de contatos:');
    sampleResult.rows.forEach(contact => {
      console.log(`   ${contact.email} | ${contact.nome} | ${contact.segmento} | ${contact.status}`);
    });
    
    console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!');
    
    if (total === 0) {
      console.log('\n❌ PROBLEMA: Não há contatos na tabela email_contacts!');
      console.log('💡 Ação necessária: Importar contatos via admin ou API');
    } else {
      console.log(`\n✅ Base de dados contém ${total.toLocaleString()} contatos`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
    console.log('\n💡 Possíveis causas:');
    console.log('- Variáveis de ambiente do banco não configuradas');
    console.log('- Tabela email_contacts não existe');
    console.log('- Problemas de conexão com PostgreSQL');
  }
}

testContactsDatabase();