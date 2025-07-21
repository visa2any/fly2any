import { emailMarketingService } from './email-marketing';
import { sql } from '@vercel/postgres';

interface ImportedContact {
  email: string;
  nome: string;
  sobrenome?: string;
  telefone?: string;
  cidade?: string;
  tags?: string[];
  segmento?: string;
}

interface EmailContact {
  id: string;
  email: string;
  nome: string;
  sobrenome?: string;
  telefone?: string;
  cidade?: string;
  segmento: string;
  tags: string[];
  status: 'ativo' | 'inativo' | 'bounce' | 'unsubscribed';
  created_at: Date;
  updated_at: Date;
}

interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

class EmailImportService {
  // Validar email com limpeza automática
  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    // Limpar email primeiro
    const cleanEmail = this.cleanEmail(email);
    
    // Verificações básicas
    if (cleanEmail.length < 5) return false;                    // Muito curto
    if (!cleanEmail.includes('@')) return false;                // Sem @
    if (!cleanEmail.includes('.')) return false;                // Sem domínio
    if (cleanEmail.indexOf('@') === 0) return false;            // Começa com @
    if (cleanEmail.indexOf('@') === cleanEmail.length - 1) return false; // Termina com @
    if (cleanEmail.split('@').length !== 2) return false;       // Mais de um @
    
    const [localPart, domainPart] = cleanEmail.split('@');
    
    // Validar parte local (antes do @)
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;
    
    // Validar domínio
    if (domainPart.length === 0 || domainPart.length > 253) return false;
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
    if (domainPart.includes('..')) return false;
    if (!domainPart.includes('.')) return false;
    
    // Regex final para validação completa
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(cleanEmail);
  }
  
  // Função para limpar email
  private cleanEmail(email: string): string {
    if (!email || typeof email !== 'string') return '';
    // Remove espaços, vírgulas no final, pontos no final, e outros caracteres inválidos
    return email.trim().toLowerCase()
      .replace(/\s+/g, '')           // Remove espaços
      .replace(/,+$/, '')            // Remove vírgulas no final
      .replace(/\.+$/, '')           // Remove pontos no final
      .replace(/[^\w@.-]/g, '');     // Remove caracteres especiais (exceto @, ., -, _)
  }
  
  // Parser CSV mais robusto que lida com aspas e vírgulas
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quotes
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
        i++;
      } else {
        // Regular character
        current += char;
        i++;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  }

  // Encontrar coluna de email (vários formatos possíveis)
  private findEmailColumn(headers: string[]): number {
    const emailHeaders = ['email', 'e-mail', 'e-mail address', 'email address', 'primary email'];
    return headers.findIndex(h => emailHeaders.some(eh => h.includes(eh)));
  }

  // Encontrar coluna de nome
  private findNameColumn(headers: string[]): number {
    const nameHeaders = ['given name', 'first name', 'nome', 'name'];
    return headers.findIndex(h => nameHeaders.some(nh => h.includes(nh)));
  }

  // Encontrar coluna de sobrenome
  private findLastNameColumn(headers: string[]): number {
    const lastNameHeaders = ['family name', 'last name', 'sobrenome', 'surname'];
    return headers.findIndex(h => lastNameHeaders.some(lh => h.includes(lh)));
  }

  // Encontrar coluna de telefone
  private findPhoneColumn(headers: string[]): number {
    const phoneHeaders = ['phone', 'telefone', 'mobile', 'cell'];
    return headers.findIndex(h => phoneHeaders.some(ph => h.includes(ph)));
  }

  // Encontrar coluna de cidade
  private findCityColumn(headers: string[]): number {
    const cityHeaders = ['city', 'cidade', 'location'];
    return headers.findIndex(h => cityHeaders.some(ch => h.includes(ch)));
  }

  // Encontrar coluna de organização
  private findOrganizationColumn(headers: string[]): number {
    const orgHeaders = ['organization', 'company', 'empresa', 'work'];
    return headers.findIndex(h => orgHeaders.some(oh => h.includes(oh)));
  }

  // Detectar segmento automaticamente
  private detectSegment(contact: ImportedContact): string {
    const email = contact.email.toLowerCase();
    const nome = contact.nome.toLowerCase();
    const tags = contact.tags?.join(' ').toLowerCase() || '';
    const combined = `${email} ${nome} ${tags}`.toLowerCase();

    // Brasileiros nos EUA
    if (combined.includes('miami') || combined.includes('florida') || 
        combined.includes('eua') || combined.includes('usa') ||
        combined.includes('orlando') || combined.includes('new york')) {
      return 'brasileiros-eua';
    }

    // Famílias
    if (combined.includes('familia') || combined.includes('crianca') || 
        combined.includes('filho') || combined.includes('disney') ||
        combined.includes('kids')) {
      return 'familias';
    }

    // Casais/Lua de mel
    if (combined.includes('casal') || combined.includes('lua') || 
        combined.includes('romantico') || combined.includes('honeymoon') ||
        combined.includes('maldivas') || combined.includes('paris')) {
      return 'casais';
    }

    // Aventureiros
    if (combined.includes('aventura') || combined.includes('trilha') || 
        combined.includes('mochila') || combined.includes('ecoturismo') ||
        combined.includes('patagonia') || combined.includes('trekking')) {
      return 'aventureiros';
    }

    // Executivos
    if (combined.includes('executivo') || combined.includes('business') || 
        combined.includes('corporate') || combined.includes('empresa') ||
        email.includes('.com.br') || email.includes('corp')) {
      return 'executivos';
    }

    return 'geral';
  }

  // Processar CSV (suporta formato Google Contacts)
  async processCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      duplicates: 0,
      invalid: 0,
      errors: []
    };

    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = this.parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g, ''));
      
      // Mapeamento para formato Google Contacts
      const emailIndex = this.findEmailColumn(headers);
      const nomeIndex = this.findNameColumn(headers);
      const sobrenomeIndex = this.findLastNameColumn(headers);
      const telefoneIndex = this.findPhoneColumn(headers);
      const cidadeIndex = this.findCityColumn(headers);
      const organizacaoIndex = this.findOrganizationColumn(headers);

      if (emailIndex === -1) {
        result.errors.push('CSV deve ter coluna de email (E-mail Address, Email, etc.)');
        return result;
      }

      const existingEmails = new Set<string>(); // Para detectar duplicatas
      const contacts: ImportedContact[] = [];

      // Processar cada linha
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Parser CSV mais robusto
        const values = this.parseCSVLine(line);
        
        if (values.length < Math.min(headers.length, emailIndex + 1)) continue;

        const rawEmail = values[emailIndex] || '';
        const email = this.cleanEmail(rawEmail);
        let nome = (values[nomeIndex] || '').trim();
        const sobrenome = sobrenomeIndex >= 0 ? (values[sobrenomeIndex] || '').trim() : '';
        
        // Se não tem nome mas tem sobrenome, usar sobrenome como nome
        if (!nome && sobrenome) {
          nome = sobrenome;
        }
        
        // Se tem nome e sobrenome, combinar
        if (nome && sobrenome && nome !== sobrenome) {
          nome = `${nome} ${sobrenome}`;
        }

        // Validações mais rigorosas
        if (!email || !nome) {
          result.invalid++;
          if (!email) result.errors.push(`Email vazio linha ${i + 1}`);
          if (!nome) result.errors.push(`Nome vazio linha ${i + 1}`);
          continue;
        }

        if (!this.isValidEmail(email)) {
          result.invalid++;
          result.errors.push(`Email inválido linha ${i + 1}: ${rawEmail}`);
          continue;
        }

        if (existingEmails.has(email)) {
          result.duplicates++;
          continue;
        }

        existingEmails.add(email);

        const contact: ImportedContact = {
          email,
          nome,
          sobrenome: sobrenome || undefined,
          telefone: telefoneIndex >= 0 ? values[telefoneIndex] : undefined,
          cidade: cidadeIndex >= 0 ? values[cidadeIndex] : undefined,
          tags: organizacaoIndex >= 0 && values[organizacaoIndex] ? [values[organizacaoIndex]] : undefined
        };

        contact.segmento = this.detectSegment(contact);
        contacts.push(contact);
      }

      // Salvar no banco/arquivo
      await this.saveContacts(contacts);
      
      result.success = true;
      result.imported = contacts.length;
      
      return result;

    } catch (error) {
      result.errors.push(`Erro ao processar CSV: ${error}`);
      return result;
    }
  }

  // Inicializar tabela de contatos de email
  private async initializeEmailContactsTable(): Promise<void> {
    try {
      await sql`
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
          unsubscribed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_contacts(email);
        CREATE INDEX IF NOT EXISTS idx_email_contacts_segmento ON email_contacts(segmento);
        CREATE INDEX IF NOT EXISTS idx_email_contacts_status ON email_contacts(status);
      `;
    } catch (error) {
      console.error('Erro ao criar tabela email_contacts:', error);
      throw error;
    }
  }

  // Salvar contatos no banco de dados usando transações simples
  private async saveContacts(contacts: ImportedContact[]): Promise<void> {
    try {
      await this.initializeEmailContactsTable();
      
      if (contacts.length === 0) return;
      
      console.log(`Iniciando salvamento de ${contacts.length} contatos...`);
      
      // Processar um contato por vez para evitar problemas de prepared statement
      let saved = 0;
      let errors = 0;
      
      for (const contact of contacts) {
        try {
          // Usar uma query simples sem prepared statement múltiplo
          await sql`
            INSERT INTO email_contacts (email, nome, sobrenome, telefone, cidade, segmento, tags, status, created_at, updated_at)
            VALUES (
              ${contact.email},
              ${contact.nome},
              ${contact.sobrenome || null},
              ${contact.telefone || null},
              ${contact.cidade || null},
              ${contact.segmento || 'geral'},
              ${JSON.stringify(contact.tags || [])},
              'ativo',
              NOW(),
              NOW()
            )
            ON CONFLICT (email) 
            DO UPDATE SET
              nome = EXCLUDED.nome,
              sobrenome = EXCLUDED.sobrenome,
              telefone = EXCLUDED.telefone,
              cidade = EXCLUDED.cidade,
              segmento = EXCLUDED.segmento,
              tags = EXCLUDED.tags,
              updated_at = NOW()
          `;
          
          saved++;
          
          // Log a cada 100 contatos salvos
          if (saved % 100 === 0) {
            console.log(`Progresso: ${saved}/${contacts.length} contatos salvos`);
          }
          
        } catch (contactError) {
          errors++;
          console.error(`Erro ao salvar contato ${contact.email}:`, contactError);
          
          // Se há muitos erros, parar
          if (errors > 10) {
            console.error('Muitos erros consecutivos, parando importação');
            throw new Error(`Muitos erros na importação: ${errors} falhas`);
          }
        }
      }
      
      console.log(`Importação concluída: ${saved} salvos, ${errors} erros`);
    } catch (error) {
      console.error('Erro crítico ao salvar contatos:', error);
      throw error;
    }
  }

  // Obter estatísticas dos contatos
  async getContactStats(): Promise<{
    total: number;
    segments: Record<string, number>;
  }> {
    try {
      await this.initializeEmailContactsTable();
      
      const totalResult = await sql`
        SELECT COUNT(*) as total FROM email_contacts WHERE status = 'ativo'
      `;
      
      const segmentResult = await sql`
        SELECT segmento, COUNT(*) as count 
        FROM email_contacts 
        WHERE status = 'ativo'
        GROUP BY segmento
      `;
      
      const total = parseInt(totalResult.rows[0]?.total || '0');
      const segments: Record<string, number> = {
        'brasileiros-eua': 0,
        'familias': 0,
        'casais': 0,
        'aventureiros': 0,
        'executivos': 0,
        'geral': 0
      };

      segmentResult.rows.forEach((row: any) => {
        segments[row.segmento] = parseInt(row.count);
      });

      return { total, segments };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { total: 0, segments: {} };
    }
  }

  // Obter contatos por segmento
  async getContactsBySegment(segment?: string): Promise<ImportedContact[]> {
    try {
      await this.initializeEmailContactsTable();
      
      let result;
      if (segment) {
        result = await sql`
          SELECT email, nome, sobrenome, telefone, cidade, segmento, tags
          FROM email_contacts 
          WHERE segmento = ${segment} AND status = 'ativo'
          ORDER BY created_at DESC
        `;
      } else {
        result = await sql`
          SELECT email, nome, sobrenome, telefone, cidade, segmento, tags
          FROM email_contacts 
          WHERE status = 'ativo'
          ORDER BY created_at DESC
        `;
      }
      
      return result.rows.map((row: any) => ({
        email: row.email,
        nome: row.nome,
        sobrenome: row.sobrenome,
        telefone: row.telefone,
        cidade: row.cidade,
        segmento: row.segmento,
        tags: Array.isArray(row.tags) ? row.tags : []
      }));
    } catch (error) {
      console.error('Erro ao obter contatos:', error);
      return [];
    }
  }

  // Limpar todos os contatos (função para reset)
  async clearAllContacts(): Promise<void> {
    try {
      await this.initializeEmailContactsTable();
      await sql`DELETE FROM email_contacts`;
      console.log('Todos os contatos foram removidos do banco');
    } catch (error) {
      console.error('Erro ao limpar contatos:', error);
      throw error;
    }
  }

  // Gerar template CSV de exemplo
  generateSampleCSV(): string {
    return `Given Name,Family Name,Email Address,Phone 1 - Value,Organization 1 - Name
João,Silva,joao.silva@gmail.com,+55 11 99999-9999,Agência Miami
Maria,Santos,maria.santos@hotmail.com,+55 21 88888-8888,Família Disney
Carlos,Oliveira,carlos.oliveira@empresa.com.br,+55 11 77777-7777,Empresa Business
Ana,Costa,ana.costa@yahoo.com,+55 31 66666-6666,Lua de Mel
Pedro,Lima,pedro.lima@outlook.com,+55 85 55555-5555,Aventuras`;
  }

  // Função para filtrar apenas emails válidos de CSV do Google
  filterValidEmailsOnly(csvContent: string): string {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length === 0) return '';
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const emailIndex = this.findEmailColumn(headers);
    
    if (emailIndex === -1) return csvContent; // Retorna original se não encontrar email
    
    const validLines = [lines[0]]; // Header
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const email = values[emailIndex]?.toLowerCase();
      
      if (email && this.isValidEmail(email)) {
        validLines.push(lines[i]);
      }
    }
    
    return validLines.join('\n');
  }
}

export const emailImportService = new EmailImportService();