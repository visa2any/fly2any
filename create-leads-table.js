#!/usr/bin/env node
/**
 * Create leads_unified table with simple structure
 */

const { sql } = require('@vercel/postgres');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function createLeadsTable() {
  console.log('🚀 Creating leads_unified table...');
  
  try {
    // Create the leads_unified table with essential fields
    await sql`
      CREATE TABLE IF NOT EXISTS leads_unified (
        -- System fields
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        source TEXT NOT NULL DEFAULT 'website',
        status TEXT NOT NULL DEFAULT 'novo',
        
        -- Personal Information (required)
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        whatsapp TEXT,
        telefone TEXT,
        sobrenome TEXT,
        
        -- Travel Information
        origem TEXT,
        destino TEXT,
        data_partida DATE,
        data_retorno DATE,
        tipo_viagem TEXT,
        
        -- Passenger Information
        numero_passageiros INTEGER DEFAULT 1,
        adultos INTEGER DEFAULT 1,
        criancas INTEGER DEFAULT 0,
        bebes INTEGER DEFAULT 0,
        
        -- Flight Preferences
        classe_viagem TEXT DEFAULT 'economica',
        companhia_preferida TEXT,
        horario_preferido TEXT,
        escalas TEXT,
        
        -- Budget
        orcamento_total TEXT,
        orcamento_aproximado TEXT,
        flexibilidade_datas BOOLEAN DEFAULT false,
        
        -- Services
        selected_services JSONB DEFAULT '[]',
        
        -- Additional Information
        observacoes TEXT,
        
        -- Raw Data Storage
        full_data JSONB DEFAULT '{}'
      )
    `;
    
    console.log('✅ Table leads_unified created successfully');
    
    // Create basic indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_unified_email ON leads_unified(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_unified_status ON leads_unified(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_unified_created_at ON leads_unified(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_leads_unified_selected_services ON leads_unified USING GIN(selected_services)`;
    
    console.log('✅ Indexes created successfully');
    
    // Create backward compatibility view
    await sql`
      CREATE OR REPLACE VIEW leads AS
      SELECT 
        id,
        nome,
        email,
        whatsapp,
        telefone,
        sobrenome,
        origem,
        destino,
        data_partida,
        data_retorno,
        numero_passageiros,
        tipo_viagem,
        selected_services,
        classe_viagem,
        companhia_preferida,
        horario_preferido,
        escalas,
        orcamento_total,
        orcamento_aproximado,
        flexibilidade_datas,
        observacoes,
        source,
        status,
        created_at,
        updated_at,
        full_data
      FROM leads_unified
    `;
    
    console.log('✅ Backward compatibility view created');
    
    // Verify table exists and show structure
    const verification = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'leads_unified' AND table_schema = 'public'
    `;
    
    if (verification.rows.length > 0) {
      console.log('✅ Table verification successful');
      
      // Show column count
      const columns = await sql`
        SELECT COUNT(*) as column_count
        FROM information_schema.columns 
        WHERE table_name = 'leads_unified' AND table_schema = 'public'
      `;
      
      console.log(`📊 Table has ${columns.rows[0].column_count} columns`);
      
      // Test a simple insert and delete
      console.log('🧪 Testing table functionality...');
      const testId = `test_${Date.now()}`;
      
      await sql`
        INSERT INTO leads_unified (id, nome, email, whatsapp)
        VALUES (${testId}, 'Test User', 'test@example.com', '1234567890')
      `;
      
      console.log('✅ Insert test successful');
      
      await sql`DELETE FROM leads_unified WHERE id = ${testId}`;
      console.log('✅ Delete test successful');
      
      console.log('🎉 leads_unified table is ready for use!');
      
    } else {
      console.error('❌ Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
}

// Run the table creation
createLeadsTable().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});