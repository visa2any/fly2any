import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Contact Import System for Fly2Any Email Marketing
// Handles the import of 14,237 high-quality Brazilian-American contacts

export interface ImportContact {
  nome: string;
  telefone: string;
  telefone_formatado: string;
  estado: string;
  area_code: string;
  confianca: string;
}

export interface ProcessedContact {
  // Database fields
  id: string;
  customer_id: string;
  email: string; // Will be generated/validated
  first_name: string;
  last_name?: string;
  
  // Contact data
  phone: string;
  phone_formatted: string;
  state: string;
  area_code: string;
  confidence_score: number;
  
  // Email marketing fields
  email_status: 'active' | 'pending_validation' | 'invalid';
  subscription_date: Date;
  tags: string[];
  custom_fields: Record<string, any>;
  engagement_score: number;
  
  // Metadata
  import_source: string;
  import_batch: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContactValidation {
  isValid: boolean;
  issues: string[];
  cleanedName: string;
  estimatedQuality: 'high' | 'medium' | 'low';
  suggestedSegments: string[];
}

export class ContactImportSystem {
  
  // Field mapping from CSV to database
  static mapCsvToContact(csvRow: ImportContact): ProcessedContact {
    const id = `contact_import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Clean and parse name
    const cleanedName = this.cleanContactName(csvRow.nome);
    const nameParts = this.parseContactName(cleanedName);
    
    // Generate confidence score from percentage
    const confidence = parseFloat(csvRow.confianca.replace('%', '')) / 100;
    
    // Determine tags based on location and characteristics
    const tags = this.generateTags(csvRow);
    
    // Generate estimated email (will need validation)
    const estimatedEmail = this.generateEstimatedEmail(cleanedName, csvRow.telefone);
    
    const now = new Date();
    
    return {
      id,
      customer_id: customerId,
      email: estimatedEmail,
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      phone: csvRow.telefone,
      phone_formatted: csvRow.telefone_formatado,
      state: csvRow.estado.replace(/"/g, ''),
      area_code: csvRow.area_code,
      confidence_score: confidence,
      email_status: 'pending_validation',
      subscription_date: now,
      tags,
      custom_fields: {
        import_source: 'google_contacts_2025_07_12',
        original_name: csvRow.nome,
        phone_confidence: csvRow.confianca,
        estimated_email: true
      },
      engagement_score: this.calculateInitialEngagementScore(confidence, csvRow.estado),
      import_source: 'google_contacts_high_quality',
      import_batch: 'batch_2025_07_12',
      created_at: now,
      updated_at: now
    };
  }

  // Clean contact names (remove business indicators, fix encoding)
  static cleanContactName(rawName: string): string {
    let cleaned = rawName.replace(/"/g, ''); // Remove quotes
    
    // Remove business indicators
    cleaned = cleaned.replace(/\s+(FL|N\/A|EQUIPMENT|SPECIALISTS|INC|LLC|CORP)$/gi, '');
    
    // Fix common encoding issues
    cleaned = cleaned.replace(/Ã‡/g, 'Ç');
    cleaned = cleaned.replace(/Ã£/g, 'ã');
    cleaned = cleaned.replace(/Ã¡/g, 'á');
    cleaned = cleaned.replace(/Ãª/g, 'ê');
    cleaned = cleaned.replace(/Ã´/g, 'ô');
    cleaned = cleaned.replace(/Ã§/g, 'ç');
    
    // Title case
    cleaned = cleaned.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    
    return cleaned.trim();
  }

  // Parse contact name into first/last name
  static parseContactName(fullName: string): { firstName: string; lastName?: string } {
    const parts = fullName.trim().split(' ').filter(p => p.length > 0);
    
    if (parts.length === 1) {
      return { firstName: parts[0] };
    }
    
    // Brazilian names typically: First Middle... Last
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : undefined;
    
    return { firstName, lastName };
  }

  // Generate tags based on contact data
  static generateTags(contact: ImportContact): string[] {
    const tags: string[] = [];
    const state = contact.estado.replace(/"/g, '');
    
    // Geographic tags
    tags.push(`State_${state.replace(/\s+/g, '_')}`);
    
    // High-concentration states get special tags
    if (['Connecticut', 'Florida', 'Massachusetts'].includes(state)) {
      tags.push('High_Concentration_State');
    }
    
    // Area code based regions
    const areaCode = contact.area_code;
    if (['203', '475', '860'].includes(areaCode)) {
      tags.push('Connecticut_Region');
    } else if (['954', '561', '772', '239'].includes(areaCode)) {
      tags.push('Florida_Region');
    } else if (['508', '774', '781', '617'].includes(areaCode)) {
      tags.push('Massachusetts_Region');
    }
    
    // Confidence level tags
    const confidence = parseFloat(contact.confianca.replace('%', ''));
    if (confidence >= 90) {
      tags.push('High_Confidence');
    } else if (confidence >= 75) {
      tags.push('Medium_Confidence');
    }
    
    // General segmentation
    tags.push('Brazilian_American');
    tags.push('Travel_Market_USA_Brazil');
    tags.push('Google_Contacts_Import');
    tags.push('High_Quality_Lead');
    
    return tags;
  }

  // Generate estimated email addresses
  static generateEstimatedEmail(cleanName: string, phone: string): string {
    const nameParts = cleanName.toLowerCase().split(' ').filter(p => p.length > 0);
    const firstName = nameParts[0] || 'contact';
    const lastName = nameParts[nameParts.length - 1] || '';
    
    // Extract last 4 digits of phone for uniqueness
    const phoneDigits = phone.replace(/\D/g, '').slice(-4);
    
    // Generate email variants (will need validation)
    const emailBase = lastName ? 
      `${firstName}.${lastName}${phoneDigits}` : 
      `${firstName}${phoneDigits}`;
    
    // Clean email base
    const cleanEmailBase = emailBase
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, '');
    
    return `${cleanEmailBase}@estimated.fly2any.local`;
  }

  // Calculate initial engagement score
  static calculateInitialEngagementScore(confidence: number, state: string): number {
    let score = Math.floor(confidence * 50); // Base score from confidence
    
    // State-based scoring (high-concentration states get bonus)
    const cleanState = state.replace(/"/g, '');
    if (['Connecticut', 'Florida', 'Massachusetts'].includes(cleanState)) {
      score += 20;
    } else if (['New Jersey', 'New York', 'Georgia'].includes(cleanState)) {
      score += 10;
    }
    
    return Math.min(score, 100);
  }

  // Validate contact data quality
  static validateContact(contact: ProcessedContact): ContactValidation {
    const issues: string[] = [];
    let isValid = true;
    
    // Name validation
    if (!contact.first_name || contact.first_name.length < 2) {
      issues.push('Invalid or too short first name');
      isValid = false;
    }
    
    // Phone validation
    if (!contact.phone || !contact.phone.match(/^\+1\d{10}$/)) {
      issues.push('Invalid phone format (should be +1XXXXXXXXXX)');
      isValid = false;
    }
    
    // State validation
    const validStates = [
      'Connecticut', 'Florida', 'Massachusetts', 'New Jersey', 
      'New York', 'Georgia', 'Pennsylvania', 'California'
    ];
    if (!validStates.includes(contact.state)) {
      issues.push(`Uncommon state: ${contact.state}`);
      // Don't invalidate, just note
    }
    
    // Confidence validation
    if (contact.confidence_score < 0.5) {
      issues.push('Low confidence score');
      // Don't invalidate, but flag for review
    }
    
    // Estimate quality
    let quality: 'high' | 'medium' | 'low' = 'medium';
    if (contact.confidence_score >= 0.9 && issues.length === 0) {
      quality = 'high';
    } else if (contact.confidence_score < 0.7 || issues.length > 1) {
      quality = 'low';
    }
    
    // Suggest segments
    const suggestedSegments = [
      `${contact.state}_Residents`,
      'Brazilian_American_Community',
      'USA_Brazil_Travel_Market'
    ];
    
    if (contact.confidence_score >= 0.9) {
      suggestedSegments.push('High_Value_Prospects');
    }
    
    return {
      isValid,
      issues,
      cleanedName: `${contact.first_name} ${contact.last_name || ''}`.trim(),
      estimatedQuality: quality,
      suggestedSegments
    };
  }

  // Process CSV file and prepare for database import
  static async processContactsCsv(csvFilePath: string): Promise<{
    validContacts: ProcessedContact[];
    invalidContacts: { contact: ImportContact; issues: string[] }[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      byState: Record<string, number>;
      byQuality: Record<string, number>;
    };
  }> {
    // This would read the actual CSV file
    // For now, returning structure for implementation
    
    const validContacts: ProcessedContact[] = [];
    const invalidContacts: { contact: ImportContact; issues: string[] }[] = [];
    
    // Process each CSV row
    // const csvData = await this.readCsvFile(csvFilePath);
    
    const summary = {
      total: 14237,
      valid: 0,
      invalid: 0,
      byState: {} as Record<string, number>,
      byQuality: {} as Record<string, number>
    };
    
    return {
      validContacts,
      invalidContacts,
      summary
    };
  }

  // Import contacts to database
  static async importContactsToDatabase(contacts: ProcessedContact[]): Promise<{
    imported: number;
    errors: number;
    duplicates: number;
    report: any[];
  }> {
    let imported = 0;
    let errors = 0;
    let duplicates = 0;
    const report: any[] = [];

    try {
      // Initialize email marketing tables if needed
      await sql`
        CREATE TABLE IF NOT EXISTS contact_imports (
          id TEXT PRIMARY KEY,
          batch_id TEXT NOT NULL,
          import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          total_contacts INTEGER,
          imported_contacts INTEGER,
          failed_contacts INTEGER,
          duplicate_contacts INTEGER,
          import_status TEXT DEFAULT 'completed',
          metadata JSONB
        )
      `;

      // Process in batches of 100
      const batchSize = 100;
      const batchId = `import_${Date.now()}`;
      
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        
        try {
          await sql`BEGIN`;
          
          for (const contact of batch) {
            try {
              // Check for duplicate phone numbers
              const existing = await sql`
                SELECT id FROM customers WHERE phone = ${contact.phone}
                UNION
                SELECT customer_id FROM email_contacts 
                WHERE custom_fields->>'original_phone' = ${contact.phone}
              `;
              
              if (existing.rows.length > 0) {
                duplicates++;
                report.push({
                  contact: contact.first_name,
                  status: 'duplicate',
                  phone: contact.phone
                });
                continue;
              }

              // Insert into customers table first
              await sql`
                INSERT INTO customers (
                  id, phone, nome, tags, receber_promocoes, status, 
                  created_at, updated_at
                ) VALUES (
                  ${contact.customer_id},
                  ${contact.phone},
                  ${contact.first_name + (contact.last_name ? ' ' + contact.last_name : '')},
                  ${JSON.stringify(contact.tags)},
                  true,
                  'lead',
                  ${contact.created_at.toISOString()},
                  ${contact.updated_at.toISOString()}
                )
              `;

              // Insert into email_contacts table
              await sql`
                INSERT INTO email_contacts (
                  id, customer_id, email, first_name, last_name,
                  email_status, subscription_date, tags, custom_fields,
                  engagement_score, created_at, updated_at
                ) VALUES (
                  ${contact.id},
                  ${contact.customer_id},
                  ${contact.email},
                  ${contact.first_name},
                  ${contact.last_name || null},
                  ${contact.email_status},
                  ${contact.subscription_date.toISOString()},
                  ${JSON.stringify(contact.tags)},
                  ${JSON.stringify({
                    ...contact.custom_fields,
                    phone: contact.phone,
                    phone_formatted: contact.phone_formatted,
                    state: contact.state,
                    area_code: contact.area_code,
                    confidence_score: contact.confidence_score,
                    original_phone: contact.phone
                  })},
                  ${contact.engagement_score},
                  ${contact.created_at.toISOString()},
                  ${contact.updated_at.toISOString()}
                )
              `;

              imported++;
              report.push({
                contact: contact.first_name,
                status: 'imported',
                phone: contact.phone,
                state: contact.state
              });

            } catch (contactError: any) {
              errors++;
              report.push({
                contact: contact.first_name,
                status: 'error',
                phone: contact.phone,
                error: contactError.message
              });
              console.error(`Error importing contact ${contact.first_name}:`, contactError);
            }
          }
          
          await sql`COMMIT`;
          
        } catch (batchError: any) {
          await sql`ROLLBACK`;
          console.error(`Batch import error:`, batchError);
          errors += batch.length;
        }
        
        // Progress logging
        if ((i + batchSize) % 1000 === 0 || i + batchSize >= contacts.length) {
          console.log(`✅ Processed ${Math.min(i + batchSize, contacts.length)} / ${contacts.length} contacts`);
        }
      }

      // Record import summary
      await sql`
        INSERT INTO contact_imports (
          id, batch_id, total_contacts, imported_contacts, 
          failed_contacts, duplicate_contacts, metadata
        ) VALUES (
          ${`import_${batchId}`, batchId, contacts.length, imported, 
          errors, duplicates, JSON.stringify({ 
            import_date: new Date().toISOString(),
            source: 'google_contacts_high_quality_2025_07_12'
          })}
        )
      `;

    } catch (error) {
      console.error('Critical import error:', error);
      throw error;
    }

    return {
      imported,
      errors,
      duplicates,
      report
    };
  }

  // Create email segments based on imported data
  static async createImportSegments(): Promise<void> {
    try {
      const segments = [
        {
          id: 'seg_ct_brazilian_americans',
          name: 'Connecticut Brazilian-Americans',
          description: 'High-quality Brazilian-American contacts in Connecticut',
          criteria: {
            location: { states: ['Connecticut'] },
            tags: ['Brazilian_American', 'Connecticut_Region'],
            engagement_score_min: 50
          }
        },
        {
          id: 'seg_fl_brazilian_americans',
          name: 'Florida Brazilian-Americans',
          description: 'High-quality Brazilian-American contacts in Florida',
          criteria: {
            location: { states: ['Florida'] },
            tags: ['Brazilian_American', 'Florida_Region'],
            engagement_score_min: 50
          }
        },
        {
          id: 'seg_ma_brazilian_americans',
          name: 'Massachusetts Brazilian-Americans',
          description: 'High-quality Brazilian-American contacts in Massachusetts',
          criteria: {
            location: { states: ['Massachusetts'] },
            tags: ['Brazilian_American', 'Massachusetts_Region'],
            engagement_score_min: 50
          }
        },
        {
          id: 'seg_high_confidence_imports',
          name: 'High-Confidence Imported Contacts',
          description: 'Contacts with 90%+ confidence from Google Contacts import',
          criteria: {
            tags: ['High_Confidence', 'Google_Contacts_Import'],
            engagement_score_min: 70
          }
        },
        {
          id: 'seg_usa_brazil_travel_market',
          name: 'USA-Brazil Travel Market',
          description: 'All imported Brazilian-American contacts for travel marketing',
          criteria: {
            tags: ['Travel_Market_USA_Brazil', 'Brazilian_American'],
            engagement_score_min: 30
          }
        }
      ];

      for (const segment of segments) {
        await sql`
          INSERT INTO email_segments (
            id, name, description, criteria, created_by, 
            created_at, updated_at, is_active
          ) VALUES (
            ${segment.id},
            ${segment.name},
            ${segment.description},
            ${JSON.stringify(segment.criteria)},
            'system',
            ${new Date().toISOString()},
            ${new Date().toISOString()},
            true
          )
          ON CONFLICT (id) DO UPDATE SET
            criteria = EXCLUDED.criteria,
            updated_at = EXCLUDED.updated_at
        `;
        
        // Calculate segment size
        await this.updateSegmentContactCount(segment.id);
      }

      console.log('✅ Import segments created successfully');
    } catch (error) {
      console.error('Error creating import segments:', error);
      throw error;
    }
  }

  // Update segment contact counts
  static async updateSegmentContactCount(segmentId: string): Promise<void> {
    try {
      // This would calculate based on actual criteria
      // For now, updating with placeholder logic
      const now = new Date();
      
      await sql`
        UPDATE email_segments 
        SET 
          last_calculated_at = ${now.toISOString()},
          updated_at = ${now.toISOString()}
        WHERE id = ${segmentId}
      `;
    } catch (error) {
      console.error(`Error updating segment count for ${segmentId}:`, error);
    }
  }

  // Get import statistics
  static async getImportStats(): Promise<{
    totalImported: number;
    byState: Record<string, number>;
    byQuality: Record<string, number>;
    recentImports: any[];
  }> {
    try {
      // Get total imported contacts
      const totalResult = await sql`
        SELECT COUNT(*) as total
        FROM email_contacts 
        WHERE custom_fields->>'import_source' = 'google_contacts_2025_07_12'
      `;

      // Get by state
      const stateResult = await sql`
        SELECT 
          custom_fields->>'state' as state,
          COUNT(*) as count
        FROM email_contacts 
        WHERE custom_fields->>'import_source' = 'google_contacts_2025_07_12'
        GROUP BY custom_fields->>'state'
        ORDER BY count DESC
      `;

      // Get recent imports
      const recentResult = await sql`
        SELECT * FROM contact_imports
        ORDER BY import_date DESC
        LIMIT 10
      `;

      const byState: Record<string, number> = {};
      stateResult.rows.forEach(row => {
        if (row.state) {
          byState[row.state] = parseInt(row.count);
        }
      });

      return {
        totalImported: parseInt(totalResult.rows[0]?.total || '0'),
        byState,
        byQuality: {
          high: 0, // Would calculate from confidence scores
          medium: 0,
          low: 0
        },
        recentImports: recentResult.rows
      };

    } catch (error) {
      console.error('Error getting import stats:', error);
      return {
        totalImported: 0,
        byState: {},
        byQuality: {},
        recentImports: []
      };
    }
  }
}