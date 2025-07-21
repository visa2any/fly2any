import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  const debug = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  };

  try {
    // TEST 1: Verificar conexão com banco
    debug.tests.push({ test: '1-connection', status: 'testing...' });
    try {
      const connTest = await sql`SELECT NOW() as current_time`;
      debug.tests[debug.tests.length - 1] = {
        test: '1-connection', 
        status: 'SUCCESS', 
        result: connTest.rows[0]
      };
    } catch (error) {
      debug.tests[debug.tests.length - 1] = {
        test: '1-connection', 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // TEST 2: Verificar se tabela email_contacts existe
    debug.tests.push({ test: '2-table-exists', status: 'testing...' });
    try {
      const tableCheck = await sql`
        SELECT table_name, column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'email_contacts'
        ORDER BY ordinal_position
      `;
      debug.tests[debug.tests.length - 1] = {
        test: '2-table-exists', 
        status: tableCheck.rows.length > 0 ? 'SUCCESS' : 'FAILED',
        columns: tableCheck.rows.length,
        schema: tableCheck.rows
      };
    } catch (error) {
      debug.tests[debug.tests.length - 1] = {
        test: '2-table-exists', 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // TEST 3: Contar registros na tabela
    debug.tests.push({ test: '3-count-records', status: 'testing...' });
    try {
      const count = await sql`SELECT COUNT(*) as total FROM email_contacts`;
      debug.tests[debug.tests.length - 1] = {
        test: '3-count-records', 
        status: 'SUCCESS', 
        total: parseInt(count.rows[0].total)
      };
    } catch (error) {
      debug.tests[debug.tests.length - 1] = {
        test: '3-count-records', 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // TEST 4: Listar primeiros 5 registros
    debug.tests.push({ test: '4-sample-data', status: 'testing...' });
    try {
      const sample = await sql`SELECT * FROM email_contacts LIMIT 5`;
      debug.tests[debug.tests.length - 1] = {
        test: '4-sample-data', 
        status: 'SUCCESS', 
        count: sample.rows.length,
        data: sample.rows
      };
    } catch (error) {
      debug.tests[debug.tests.length - 1] = {
        test: '4-sample-data', 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // TEST 5: Tentar inserir um registro de teste
    debug.tests.push({ test: '5-test-insert', status: 'testing...' });
    try {
      const testEmail = `debug-test-${Date.now()}@example.com`;
      const testId = `debug_${Date.now()}`;
      const testToken = `token_${Math.random().toString(36).substr(2, 16)}`;
      
      const insertResult = await sql`
        INSERT INTO email_contacts (
          id, email, nome, sobrenome, telefone, segmento, tags, 
          status, email_status, unsubscribe_token
        ) VALUES (
          ${testId}, ${testEmail}, 'Debug Test', 'User', '+1234567890', 
          'debug', '[]', 'ativo', 'not_sent', ${testToken}
        ) RETURNING *
      `;
      
      debug.tests[debug.tests.length - 1] = {
        test: '5-test-insert', 
        status: 'SUCCESS', 
        inserted: insertResult.rows[0]
      };
    } catch (error) {
      debug.tests[debug.tests.length - 1] = {
        test: '5-test-insert', 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // TEST 6: Verificar se o registro foi inserido
    debug.tests.push({ test: '6-verify-insert', status: 'testing...' });
    try {
      const verify = await sql`
        SELECT * FROM email_contacts 
        WHERE email LIKE 'debug-test-%@example.com' 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      debug.tests[debug.tests.length - 1] = {
        test: '6-verify-insert', 
        status: verify.rows.length > 0 ? 'SUCCESS' : 'FAILED', 
        found: verify.rows.length,
        data: verify.rows[0] || null
      };
    } catch (error) {
      debug.tests[debug.tests.length - 1] = {
        test: '6-verify-insert', 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // TEST 7: Verificar todas as tabelas existentes
    debug.tests.push({ test: '7-all-tables', status: 'testing...' });
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      
      debug.tests[debug.tests.length - 1] = {
        test: '7-all-tables', 
        status: 'SUCCESS', 
        tables: tables.rows.map(row => row.table_name)
      };
    } catch (error) {
      debug.tests[debug.tests.length - 1] = {
        test: '7-all-tables', 
        status: 'FAILED', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      debug
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug
    }, { status: 500 });
  }
}

// POST para limpar dados de debug
export async function POST(request: NextRequest) {
  try {
    const result = await sql`
      DELETE FROM email_contacts 
      WHERE email LIKE 'debug-test-%@example.com'
    `;
    
    return NextResponse.json({
      success: true,
      message: `Removidos ${result.rowCount || 0} registros de debug`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}