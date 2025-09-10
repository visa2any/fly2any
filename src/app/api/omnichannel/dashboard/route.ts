import { NextRequest, NextResponse } from 'next/server';
import OmnichannelAPI from '@/lib/omnichannel-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Utility function to ensure omnichannel tables exist
async function ensureTablesExist() {
  try {
    // Check if conversations table exists
    const { sql } = await import('@vercel/postgres');
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'conversations'
      )
    `;
    
    if (!result.rows[0].exists) {
      console.log('🔄 Creating omnichannel tables on-demand...');
      await createOmnichannelTables();
      console.log('✅ Omnichannel tables created successfully!');
    }
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    throw error;
  }
}

async function createOmnichannelTables() {
  const { sql } = await import('@vercel/postgres');
  console.log('📝 Creating customers table...');
  // 1. Create customers table first (no dependencies)
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20),
      email VARCHAR(255),
      name VARCHAR(255),
      whatsapp_id VARCHAR(255),
      location VARCHAR(255),
      timezone VARCHAR(50) DEFAULT 'America/New_York',
      language VARCHAR(5) DEFAULT 'pt-BR',
      customer_type VARCHAR(50) DEFAULT 'prospect',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_contact_at TIMESTAMP
    )
  `;

  console.log('📝 Creating agents table...');
  // 2. Create agents table (no dependencies)
  await sql`
    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      department VARCHAR(100),
      role VARCHAR(50) DEFAULT 'agent',
      skills TEXT[],
      languages TEXT[] DEFAULT '{pt-BR,en-US}',
      is_active BOOLEAN DEFAULT TRUE,
      max_concurrent_conversations INTEGER DEFAULT 10,
      current_conversations INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'offline',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_activity_at TIMESTAMP
    )
  `;

  console.log('📝 Creating conversations table...');
  // 3. Create conversations table (depends on customers and agents)
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id),
      channel VARCHAR(50) NOT NULL,
      channel_conversation_id VARCHAR(255),
      subject VARCHAR(500),
      status VARCHAR(50) DEFAULT 'open',
      priority VARCHAR(20) DEFAULT 'normal',
      assigned_agent_id INTEGER,
      department VARCHAR(100) DEFAULT 'sales',
      tags TEXT[],
      metadata JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      closed_at TIMESTAMP
    )
  `;

  console.log('📝 Creating messages table...');
  // 4. Create messages table (depends on conversations and customers)
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES conversations(id),
      customer_id INTEGER REFERENCES customers(id),
      channel VARCHAR(50) NOT NULL,
      direction VARCHAR(10) NOT NULL,
      content TEXT NOT NULL,
      message_type VARCHAR(50) DEFAULT 'text',
      sender_name VARCHAR(255),
      sender_id VARCHAR(255),
      agent_id INTEGER,
      is_automated BOOLEAN DEFAULT FALSE,
      template_id VARCHAR(100),
      metadata JSONB,
      channel_message_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read_at TIMESTAMP,
      delivered_at TIMESTAMP
    )
  `;

  console.log('📝 Inserting default system agent...');
  // Insert default system agent if not exists
  await sql`
    INSERT INTO agents (name, email, department, role, skills, languages)
    SELECT 'Sistema Fly2Any', 'system@fly2any.com', 'support', 'system', 
           '{automation,whatsapp,email,chat}', '{pt-BR,en-US}'
    WHERE NOT EXISTS (SELECT 1 FROM agents WHERE email = 'system@fly2any.com')
  `;

  console.log('🔧 Creating performance indices...');
  // Create indices for performance
  await sql`CREATE INDEX IF NOT EXISTS idx_customer_conversations ON conversations(customer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_status_conversations ON conversations(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_conversation_messages ON messages(conversation_id, created_at DESC)`;
  
  console.log('✅ All omnichannel tables created successfully!');
}

// Type definitions for better type safety
type PeriodType = '1d' | '7d' | '30d';

// GET /api/omnichannel/dashboard - Estatísticas do dashboard
export async function GET(request: NextRequest) {
  // Extract parameters outside try block to ensure they're in scope for error handling
  const { searchParams } = new URL(request.url);
  const period: PeriodType = (searchParams.get('period') as PeriodType) || '7d'; // 1d, 7d, 30d
  const agentId: string | null = searchParams.get('agent_id');

  try {
    // Ensure database tables exist before proceeding
    await ensureTablesExist();

    const stats = await OmnichannelAPI.getDashboardStats();

    // Adicionar estatísticas específicas do período
    const additionalStats = {
      period,
      timestamp: new Date().toISOString(),
      trends: {
        conversationsGrowth: '+12%', // Implementar cálculo real
        responseTimeImprovement: '-8%', // Implementar cálculo real
        satisfactionChange: '+5%' // Implementar cálculo real
      },
      agentPerformance: agentId ? {
        totalConversations: 45,
        avgResponseTime: 120,
        satisfactionRating: 4.2
      } : undefined
    };

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        ...additionalStats
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // If it's a database table error, provide fallback data
    if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('⚠️ Tables not ready, returning fallback dashboard data');
      return NextResponse.json({
        success: true,
        fallback: true,
        message: 'Database initializing - showing placeholder data',
        stats: {
          totalConversations: 0,
          activeConversations: 0,
          pendingConversations: 0,
          avgResponseTime: 0,
          customerSatisfaction: 0,
          channelBreakdown: {},
          period,
          timestamp: new Date().toISOString(),
          trends: {
            conversationsGrowth: '0%',
            responseTimeImprovement: '0%',
            satisfactionChange: '0%'
          },
          agentPerformance: agentId ? {
            totalConversations: 0,
            avgResponseTime: 0,
            satisfactionRating: 0
          } : undefined
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}