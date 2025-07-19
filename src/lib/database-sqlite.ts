/**
 * SQLite Database Service - Real Persistent Storage
 * 
 * This service provides real database persistence using SQLite.
 * Data is stored in a file and persists between server restarts.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'fly2any.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeTables();
  }
  return db;
}

function initializeTables() {
  const db = getDatabase();
  
  // Create leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT,
      telefone TEXT,
      origem TEXT,
      destino TEXT,
      data_partida TEXT,
      data_retorno TEXT,
      numero_passageiros INTEGER DEFAULT 1,
      selected_services TEXT, -- JSON array
      status TEXT DEFAULT 'novo',
      source TEXT DEFAULT 'website',
      orcamento_total TEXT,
      observacoes TEXT,
      full_data TEXT, -- JSON object
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
  `);

  console.log('[SQLITE] Database tables initialized');
}

export interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
  telefone?: string;
  origem?: string;
  destino?: string;
  dataPartida?: string;
  dataRetorno?: string;
  numeroPassageiros?: number;
  selectedServices: string[];
  status: string;
  source: string;
  orcamentoTotal?: string;
  observacoes?: string;
  fullData?: any;
  createdAt: string;
  updatedAt?: string;
}

export class SQLiteService {
  
  /**
   * Create a new lead
   */
  static createLead(lead: Omit<Lead, 'createdAt' | 'updatedAt'>): Lead {
    const db = getDatabase();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO leads (
        id, nome, email, whatsapp, telefone, origem, destino,
        data_partida, data_retorno, numero_passageiros,
        selected_services, status, source, orcamento_total,
        observacoes, full_data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      lead.id,
      lead.nome,
      lead.email,
      lead.whatsapp || null,
      lead.telefone || null,
      lead.origem || null,
      lead.destino || null,
      lead.dataPartida || null,
      lead.dataRetorno || null,
      lead.numeroPassageiros || 1,
      JSON.stringify(lead.selectedServices),
      lead.status,
      lead.source,
      lead.orcamentoTotal || null,
      lead.observacoes || null,
      JSON.stringify(lead.fullData || {}),
      now,
      now
    );
    
    console.log(`[SQLITE] Lead created: ${lead.id}`);
    
    return {
      ...lead,
      createdAt: now,
      updatedAt: now
    };
  }
  
  /**
   * Get all leads with pagination
   */
  static getAllLeads(page: number = 1, limit: number = 50): {
    leads: Lead[];
    total: number;
    page: number;
    totalPages: number;
  } {
    const db = getDatabase();
    
    // Get total count
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM leads');
    const { count } = countStmt.get() as { count: number };
    
    // Get paginated results
    const offset = (page - 1) * limit;
    const selectStmt = db.prepare(`
      SELECT * FROM leads 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    
    const rows = selectStmt.all(limit, offset) as any[];
    
    const leads: Lead[] = rows.map(row => ({
      id: row.id,
      nome: row.nome,
      email: row.email,
      whatsapp: row.whatsapp,
      telefone: row.telefone,
      origem: row.origem,
      destino: row.destino,
      dataPartida: row.data_partida,
      dataRetorno: row.data_retorno,
      numeroPassageiros: row.numero_passageiros,
      selectedServices: JSON.parse(row.selected_services || '[]'),
      status: row.status,
      source: row.source,
      orcamentoTotal: row.orcamento_total,
      observacoes: row.observacoes,
      fullData: JSON.parse(row.full_data || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    return {
      leads,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }
  
  /**
   * Get lead statistics
   */
  static getLeadStats(): {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byService: Record<string, number>;
  } {
    const db = getDatabase();
    
    // Get total count
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM leads');
    const { count: total } = totalStmt.get() as { count: number };
    
    // Get today's count
    const todayStmt = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE DATE(created_at) = DATE('now')
    `);
    const { count: today } = todayStmt.get() as { count: number };
    
    // Get this week's count
    const weekStmt = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE created_at >= DATE('now', '-7 days')
    `);
    const { count: thisWeek } = weekStmt.get() as { count: number };
    
    // Get this month's count
    const monthStmt = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE created_at >= DATE('now', 'start of month')
    `);
    const { count: thisMonth } = monthStmt.get() as { count: number };
    
    // Get service statistics
    const servicesStmt = db.prepare('SELECT selected_services FROM leads');
    const serviceRows = servicesStmt.all() as { selected_services: string }[];
    
    const byService: Record<string, number> = {};
    serviceRows.forEach(row => {
      try {
        const services = JSON.parse(row.selected_services || '[]');
        services.forEach((service: string) => {
          byService[service] = (byService[service] || 0) + 1;
        });
      } catch (error) {
        console.warn('[SQLITE] Invalid service data:', row.selected_services);
      }
    });
    
    return {
      total,
      today,
      thisWeek,
      thisMonth,
      byService
    };
  }
  
  /**
   * Update lead status
   */
  static updateLeadStatus(id: string, status: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE leads 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    const result = stmt.run(status, id);
    return result.changes > 0;
  }
  
  /**
   * Get database statistics
   */
  static getDatabaseInfo(): {
    dbPath: string;
    exists: boolean;
    size: number;
    tables: string[];
  } {
    return {
      dbPath: DB_PATH,
      exists: fs.existsSync(DB_PATH),
      size: fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0,
      tables: ['leads']
    };
  }
  
  /**
   * Close database connection
   */
  static close(): void {
    if (db) {
      db.close();
      db = null;
      console.log('[SQLITE] Database connection closed');
    }
  }
}

// Ensure graceful shutdown
process.on('exit', () => SQLiteService.close());
process.on('SIGINT', () => SQLiteService.close());
process.on('SIGTERM', () => SQLiteService.close());