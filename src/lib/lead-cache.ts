/**
 * Lead Cache System
 * 
 * Stores leads in memory for admin panel display when no database is available.
 * This is a temporary solution for demonstration/development purposes.
 */

interface CachedLead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  origem: string;
  destino: string;
  selectedServices: string[];
  status: string;
  source: string;
  createdAt: string;
  orcamentoTotal?: string;
  observacoes?: string;
  fullData?: any;
}

// In-memory cache (will reset on server restart)
let leadCache: CachedLead[] = [];

export class LeadCache {
  
  /**
   * Add a lead to the cache
   */
  static addLead(lead: CachedLead): void {
    // Remove duplicates by ID
    leadCache = leadCache.filter(l => l.id !== lead.id);
    
    // Add new lead at the beginning
    leadCache.unshift(lead);
    
    // Keep only last 100 leads to prevent memory issues
    if (leadCache.length > 100) {
      leadCache = leadCache.slice(0, 100);
    }
    
    console.log(`[CACHE] Added lead ${lead.id} to cache. Total: ${leadCache.length}`);
  }
  
  /**
   * Get all leads from cache
   */
  static getAllLeads(page: number = 1, limit: number = 50): {
    leads: CachedLead[];
    total: number;
    page: number;
    totalPages: number;
  } {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = leadCache.slice(startIndex, endIndex);
    
    return {
      leads: paginatedLeads,
      total: leadCache.length,
      page,
      totalPages: Math.ceil(leadCache.length / limit)
    };
  }
  
  /**
   * Get lead statistics
   */
  static getStats(): {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byService: Record<string, number>;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: leadCache.length,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byService: {} as Record<string, number>
    };
    
    leadCache.forEach(lead => {
      const createdAt = new Date(lead.createdAt);
      
      if (createdAt >= today) stats.today++;
      if (createdAt >= thisWeek) stats.thisWeek++;
      if (createdAt >= thisMonth) stats.thisMonth++;
      
      // Count services
      lead.selectedServices.forEach(service => {
        stats.byService[service] = (stats.byService[service] || 0) + 1;
      });
    });
    
    return stats;
  }
  
  /**
   * Clear all cache (useful for testing)
   */
  static clearCache(): void {
    leadCache = [];
    console.log('[CACHE] Cache cleared');
  }
  
  /**
   * Get cache size
   */
  static getSize(): number {
    return leadCache.length;
  }
}