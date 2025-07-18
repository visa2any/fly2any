import { promises as fs } from 'fs';
import path from 'path';

/**
 * Fallback database implementation using JSON files
 * This is used when PostgreSQL is not available
 */

const DB_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DB_DIR, 'leads.json');
const CUSTOMERS_FILE = path.join(DB_DIR, 'customers.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Read JSON file with fallback
async function readJsonFile(filePath: string, defaultValue: any = []) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}

// Write JSON file
async function writeJsonFile(filePath: string, data: any) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export class DatabaseFallback {
  
  static async saveLeadToFile(leadData: any) {
    try {
      await ensureDataDir();
      
      // Read existing leads
      const leads = await readJsonFile(LEADS_FILE, []);
      
      // Generate ID if not provided
      const leadId = leadData.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add new lead
      const newLead = {
        id: leadId,
        ...leadData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      leads.push(newLead);
      
      // Save to file
      await writeJsonFile(LEADS_FILE, leads);
      
      console.log(`📁 Lead saved to fallback file: ${leadId}`);
      return { success: true, leadId, error: null };
      
    } catch (error) {
      console.error('Error saving lead to fallback file:', error);
      return { 
        success: false, 
        leadId: '', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  static async saveCustomerToFile(customerData: any) {
    try {
      await ensureDataDir();
      
      // Read existing customers
      const customers = await readJsonFile(CUSTOMERS_FILE, []);
      
      // Generate ID if not provided
      const customerId = customerData.id || `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Add new customer
      const newCustomer = {
        id: customerId,
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      customers.push(newCustomer);
      
      // Save to file
      await writeJsonFile(CUSTOMERS_FILE, customers);
      
      console.log(`📁 Customer saved to fallback file: ${customerId}`);
      return { success: true, customerId, error: null };
      
    } catch (error) {
      console.error('Error saving customer to fallback file:', error);
      return { 
        success: false, 
        customerId: '', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  static async getLeadsFromFile() {
    try {
      const leads = await readJsonFile(LEADS_FILE, []);
      return leads;
    } catch (error) {
      console.error('Error reading leads from fallback file:', error);
      return [];
    }
  }
  
  static async getCustomersFromFile() {
    try {
      const customers = await readJsonFile(CUSTOMERS_FILE, []);
      return customers;
    } catch (error) {
      console.error('Error reading customers from fallback file:', error);
      return [];
    }
  }
}