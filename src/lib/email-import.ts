import { emailMarketingService } from './email-marketing';

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

      // Salvar via sistema de email marketing real
      await this.saveContacts(contacts);
      
      result.success = true;
      result.imported = contacts.length;
      
      return result;

    } catch (error) {
      result.errors.push(`Erro ao processar CSV: ${error}`);
      return result;
    }
  }

  // Salvar contatos diretamente na API do email-marketing (método principal)
  private async saveContacts(contacts: ImportedContact[]): Promise<void> {
    try {
      if (contacts.length === 0) return;
      
      console.log(`🚀 Salvando ${contacts.length} contatos via API email-marketing...`);
      
      // Usar diretamente a API email-marketing que já está implementada e funcionando
      await this.saveContactsViaAPI(contacts);
      
    } catch (error) {
      console.error('❌ Erro crítico ao salvar contatos:', error);
      throw error;
    }
  }
  
  // Salvar contatos via API do email-marketing (conecta com o sistema real)
  private async saveContactsViaAPI(contacts: ImportedContact[]): Promise<void> {
    try {
      console.log(`📡 Salvando ${contacts.length} contatos via EMAIL MARKETING DATABASE...`);

      // Usar o sistema principal EmailMarketingDatabase que a dashboard já usa
      const { EmailMarketingDatabase } = await import('@/lib/email-marketing-database');

      // Ensure tables exist first
      await EmailMarketingDatabase.initializeEmailTables();

      let imported = 0;
      let duplicates = 0;
      const errors: string[] = [];

      // Process each contact individually using the main database system
      for (const contact of contacts) {
        try {
          await EmailMarketingDatabase.addEmailContact({
            email: contact.email,
            first_name: contact.nome,
            last_name: contact.sobrenome,
            nome: contact.nome,
            sobrenome: contact.sobrenome,
            segmento: contact.segmento || 'geral',
            customer_id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
          imported++;
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            duplicates++;
          } else {
            errors.push(`Erro ao salvar ${contact.email}: ${error.message}`);
          }
        }
      }

      console.log(`✅ Importação concluída com sucesso!`);
      console.log(`📊 ${imported} contatos importados`);
      console.log(`🔄 ${duplicates} duplicatas ignoradas`);
      if (errors.length > 0) {
        console.log(`⚠️ ${errors.length} erros encontrados`);
        errors.forEach(error => console.log(`   - ${error}`));
      }

      return;

    } catch (error) {
      console.error('❌ Erro ao salvar via EmailMarketingDatabase:', error);

      // Fallback: tentar HTTP call
      console.log('🔄 Tentando fallback via HTTP...');
      await this.saveContactsViaHTTP(contacts);
    }
  }
  
  // Fallback via HTTP call
  private async saveContactsViaHTTP(contacts: ImportedContact[]): Promise<void> {
    try {
      const contactsData = contacts.map(contact => ({
        email: contact.email,
        nome: contact.nome,
        sobrenome: contact.sobrenome,
        telefone: contact.telefone,
        segmento: contact.segmento || 'geral',
        tags: contact.tags || []
      }));
      
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/email-marketing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_contacts',
          contactsData: contactsData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Importação via HTTP concluída: ${result.data.imported} contatos`);
        return;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
      
    } catch (error) {
      console.error('❌ Fallback HTTP também falhou:', error);
      throw new Error(`Falha ao importar contatos: ${error}`);
    }
  }

  // Obter estatísticas dos contatos via API
  async getContactStats(): Promise<{
    total: number;
    segments: Record<string, number>;
  }> {
    try {
      const { EmailMarketingDatabase } = await import('@/lib/email-marketing-database');
      const stats = await EmailMarketingDatabase.getEmailMarketingStats('30d');

      return {
        total: stats.totalContacts,
        segments: stats.segmentStats || {}
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { total: 0, segments: {} };
    }
  }

  // Obter contatos por segmento via API
  async getContactsBySegment(segment?: string): Promise<ImportedContact[]> {
    try {
      const { EmailMarketingDatabase } = await import('@/lib/email-marketing-database');

      const filters: any = {
        status: 'active'
      };

      if (segment) {
        filters.segment = segment;
      }

      const result = await EmailMarketingDatabase.getEmailContacts(filters);

      return result.contacts.map((contact: any) => ({
        email: contact.email,
        nome: contact.first_name || '',
        sobrenome: contact.last_name || '',
        telefone: contact.phone || '',
        cidade: undefined, // Não existe na estrutura atual
        segmento: contact.segment || 'geral',
        tags: Array.isArray(contact.tags) ? contact.tags : []
      }));
    } catch (error) {
      console.error('Erro ao obter contatos:', error);
      return [];
    }
  }

  // Limpar todos os contatos via API (função para reset)
  async clearAllContacts(): Promise<void> {
    try {
      const { sql } = await import('@vercel/postgres');
      await sql`DELETE FROM email_contacts`;
      console.log('✅ Todos os contatos foram removidos do banco');
    } catch (error) {
      console.error('❌ Erro ao limpar contatos:', error);
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