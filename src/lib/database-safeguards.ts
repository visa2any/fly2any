// Database Safeguards - Prevent Future Schema Conflicts
// This module provides validation and monitoring for the omnichannel database schema

import { sql } from '@vercel/postgres';

export interface SchemaValidationResult {
  valid: boolean;
  issues: string[];
  recommendations: string[];
}

export class DatabaseSafeguards {
  /**
   * Validates the omnichannel database schema integrity
   */
  static async validateOmnichannelSchema(): Promise<SchemaValidationResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // 1. Check if all required tables exist
      const requiredTables = ['customers', 'agents', 'conversations', 'messages'];
      const existingTables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('customers', 'agents', 'conversations', 'messages')
      `;

      const existingTableNames = existingTables.rows.map(row => row.table_name);
      const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));

      if (missingTables.length > 0) {
        issues.push(`Missing tables: ${missingTables.join(', ')}`);
        recommendations.push('Run database initialization script to create missing tables');
      }

      // 2. Validate critical data types for foreign key compatibility
      const dataTypeChecks = [
        { table: 'customers', column: 'id', expectedType: 'integer' },
        { table: 'agents', column: 'id', expectedType: 'integer' },
        { table: 'conversations', column: 'id', expectedType: 'integer' },
        { table: 'conversations', column: 'customer_id', expectedType: 'integer' },
        { table: 'conversations', column: 'assigned_agent_id', expectedType: 'integer' },
        { table: 'messages', column: 'id', expectedType: 'integer' },
        { table: 'messages', column: 'conversation_id', expectedType: 'integer' },
        { table: 'messages', column: 'customer_id', expectedType: 'integer' },
        { table: 'messages', column: 'agent_id', expectedType: 'integer' }
      ];

      for (const check of dataTypeChecks) {
        if (existingTableNames.includes(check.table)) {
          const typeResult = await sql`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = ${check.table} 
            AND column_name = ${check.column}
          `;

          const actualType = typeResult.rows[0]?.data_type;
          if (actualType && actualType !== check.expectedType) {
            issues.push(`${check.table}.${check.column} has type '${actualType}' but expected '${check.expectedType}'`);
            recommendations.push(`Fix data type for ${check.table}.${check.column} to prevent foreign key constraint failures`);
          }
        }
      }

      // 3. Validate foreign key constraints
      const foreignKeyChecks = [
        { table: 'conversations', column: 'customer_id', references: 'customers(id)' },
        { table: 'conversations', column: 'assigned_agent_id', references: 'agents(id)' },
        { table: 'messages', column: 'conversation_id', references: 'conversations(id)' },
        { table: 'messages', column: 'customer_id', references: 'customers(id)' },
        { table: 'messages', column: 'agent_id', references: 'agents(id)' }
      ];

      for (const fkCheck of foreignKeyChecks) {
        if (existingTableNames.includes(fkCheck.table)) {
          const constraintResult = await sql`
            SELECT constraint_name 
            FROM information_schema.referential_constraints rc
            JOIN information_schema.key_column_usage kcu 
              ON rc.constraint_name = kcu.constraint_name
            WHERE kcu.table_name = ${fkCheck.table} 
            AND kcu.column_name = ${fkCheck.column}
          `;

          if (constraintResult.rows.length === 0) {
            issues.push(`Missing foreign key constraint: ${fkCheck.table}.${fkCheck.column} -> ${fkCheck.references}`);
            recommendations.push(`Add foreign key constraint for ${fkCheck.table}.${fkCheck.column}`);
          }
        }
      }

      // 4. Check for essential indices
      const requiredIndices = [
        { table: 'conversations', column: 'customer_id', name: 'idx_customer_conversations' },
        { table: 'conversations', column: 'status', name: 'idx_status_conversations' },
        { table: 'messages', column: 'conversation_id', name: 'idx_conversation_messages' },
        { table: 'messages', column: 'customer_id', name: 'idx_customer_messages' }
      ];

      for (const idxCheck of requiredIndices) {
        if (existingTableNames.includes(idxCheck.table)) {
          const indexResult = await sql`
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = ${idxCheck.table} 
            AND indexname = ${idxCheck.name}
          `;

          if (indexResult.rows.length === 0) {
            issues.push(`Missing performance index: ${idxCheck.name} on ${idxCheck.table}.${idxCheck.column}`);
            recommendations.push(`Create index ${idxCheck.name} for better query performance`);
          }
        }
      }

      return {
        valid: issues.length === 0,
        issues,
        recommendations
      };

    } catch (error) {
      issues.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      recommendations.push('Check database connectivity and permissions');
      
      return {
        valid: false,
        issues,
        recommendations
      };
    }
  }

  /**
   * Monitors database health and logs warnings
   */
  static async monitorDatabaseHealth(): Promise<void> {
    try {
      const validation = await this.validateOmnichannelSchema();
      
      if (!validation.valid) {
        console.warn('🚨 DATABASE SCHEMA ISSUES DETECTED:');
        validation.issues.forEach(issue => {
          console.warn(`❌ ${issue}`);
        });
        
        console.warn('📝 RECOMMENDATIONS:');
        validation.recommendations.forEach(rec => {
          console.warn(`💡 ${rec}`);
        });
      } else {
        console.log('✅ Database schema validation passed');
      }
    } catch (error) {
      console.error('❌ Database health monitoring failed:', error);
    }
  }

  /**
   * Emergency schema repair - recreates tables with correct schema
   */
  static async emergencySchemaRepair(): Promise<boolean> {
    try {
      console.log('🚨 EMERGENCY SCHEMA REPAIR INITIATED...');
      
      // Drop all tables to start fresh
      await sql`DROP TABLE IF EXISTS activity_log CASCADE`;
      await sql`DROP TABLE IF EXISTS performance_metrics CASCADE`;
      await sql`DROP TABLE IF EXISTS automation_templates CASCADE`;
      await sql`DROP TABLE IF EXISTS conversation_assignments CASCADE`;
      await sql`DROP TABLE IF EXISTS system_settings CASCADE`;
      await sql`DROP TABLE IF EXISTS channel_integrations CASCADE`;
      await sql`DROP TABLE IF EXISTS messages CASCADE`;
      await sql`DROP TABLE IF EXISTS conversations CASCADE`;
      await sql`DROP TABLE IF EXISTS agents CASCADE`;
      await sql`DROP TABLE IF EXISTS customers CASCADE`;

      // Recreate with correct schema
      await sql`
        CREATE TABLE customers (
          id SERIAL PRIMARY KEY,
          phone VARCHAR(20) UNIQUE,
          email VARCHAR(255) UNIQUE,
          name VARCHAR(255),
          whatsapp_id VARCHAR(255) UNIQUE,
          location VARCHAR(255),
          timezone VARCHAR(50) DEFAULT 'America/New_York',
          language VARCHAR(5) DEFAULT 'pt-BR',
          customer_type VARCHAR(50) DEFAULT 'prospect',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_contact_at TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE agents (
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

      await sql`
        CREATE TABLE conversations (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
          channel VARCHAR(50) NOT NULL,
          channel_conversation_id VARCHAR(255),
          subject VARCHAR(500),
          status VARCHAR(50) DEFAULT 'open',
          priority VARCHAR(20) DEFAULT 'normal',
          assigned_agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
          department VARCHAR(100) DEFAULT 'sales',
          tags TEXT[],
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          closed_at TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
          customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
          channel VARCHAR(50) NOT NULL,
          direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
          content TEXT NOT NULL,
          message_type VARCHAR(50) DEFAULT 'text',
          sender_name VARCHAR(255),
          sender_id VARCHAR(255),
          agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
          is_automated BOOLEAN DEFAULT FALSE,
          template_id VARCHAR(100),
          metadata JSONB DEFAULT '{}',
          channel_message_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP,
          delivered_at TIMESTAMP
        )
      `;

      // Create indices
      await sql`CREATE INDEX idx_customer_conversations ON conversations(customer_id)`;
      await sql`CREATE INDEX idx_status_conversations ON conversations(status)`;
      await sql`CREATE INDEX idx_conversation_messages ON messages(conversation_id, created_at DESC)`;
      await sql`CREATE INDEX idx_customer_messages ON messages(customer_id, created_at DESC)`;
      await sql`CREATE INDEX idx_channel_conversations ON conversations(channel)`;

      // Insert default system agent
      await sql`
        INSERT INTO agents (name, email, department, role, skills, languages)
        VALUES ('Sistema Fly2Any', 'system@fly2any.com', 'support', 'system', 
               '{automation,whatsapp,email,chat}', '{pt-BR,en-US}')
      `;

      console.log('✅ Emergency schema repair completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Emergency schema repair failed:', error);
      return false;
    }
  }

  /**
   * Validates a single table exists and has correct structure
   */
  static async validateTable(tableName: string, expectedColumns: Record<string, string>): Promise<boolean> {
    try {
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `;

      if (!tableExists.rows[0].exists) {
        console.error(`❌ Table ${tableName} does not exist`);
        return false;
      }

      // Check column data types
      for (const [columnName, expectedType] of Object.entries(expectedColumns)) {
        const columnInfo = await sql`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = ${tableName} 
          AND column_name = ${columnName}
        `;

        const actualType = columnInfo.rows[0]?.data_type;
        if (!actualType) {
          console.error(`❌ Column ${tableName}.${columnName} does not exist`);
          return false;
        }

        if (actualType !== expectedType) {
          console.error(`❌ Column ${tableName}.${columnName} has type '${actualType}' but expected '${expectedType}'`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ Table validation failed for ${tableName}:`, error);
      return false;
    }
  }
}

export default DatabaseSafeguards;