/**
 * SEO Agent Memory System
 * Persistent state management for stateful agent loop
 */

export interface SEOMemoryEntry {
  id: string;
  type: 'error' | 'warning' | 'opportunity' | 'action';
  category: 'url' | 'content' | 'schema' | 'backlink' | 'speed';
  status: 'open' | 'in_progress' | 'fixed' | 'monitoring' | 'ignored';
  priority: 'critical' | 'high' | 'medium' | 'low';
  firstDetected: string;
  lastChecked: string;
  fixedAt?: string;
  url?: string;
  description: string;
  suggestedAction: string;
  requiresHumanApproval: boolean;
  autoFixAttempts: number;
  maxAutoAttempts: number;
}

// In-memory fallback (replace with Vercel KV or Prisma in production)
let memoryStore: Map<string, SEOMemoryEntry> = new Map();

export async function loadMemory(): Promise<SEOMemoryEntry[]> {
  // Production: Use Vercel KV
  // const kv = await import('@vercel/kv');
  // const entries = await kv.hgetall('seo_memory');

  return Array.from(memoryStore.values());
}

export async function getEntry(id: string): Promise<SEOMemoryEntry | null> {
  return memoryStore.get(id) || null;
}

export async function saveEntry(entry: SEOMemoryEntry): Promise<void> {
  memoryStore.set(entry.id, entry);
  // Production: await kv.hset('seo_memory', { [entry.id]: entry });
}

export async function updateEntry(
  id: string,
  updates: Partial<SEOMemoryEntry>
): Promise<SEOMemoryEntry | null> {
  const existing = memoryStore.get(id);
  if (!existing) return null;

  const updated = { ...existing, ...updates, lastChecked: new Date().toISOString() };
  memoryStore.set(id, updated);
  return updated;
}

export async function deleteEntry(id: string): Promise<boolean> {
  return memoryStore.delete(id);
}

export async function getOpenIssues(): Promise<SEOMemoryEntry[]> {
  const all = await loadMemory();
  return all.filter(e => ['open', 'in_progress'].includes(e.status));
}

export async function getByStatus(status: SEOMemoryEntry['status']): Promise<SEOMemoryEntry[]> {
  const all = await loadMemory();
  return all.filter(e => e.status === status);
}

export async function getByPriority(priority: SEOMemoryEntry['priority']): Promise<SEOMemoryEntry[]> {
  const all = await loadMemory();
  return all.filter(e => e.priority === priority);
}

export function createIssueId(type: string, url: string): string {
  const slug = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${type}_${slug}`.slice(0, 100);
}

export async function recordIssue(
  type: SEOMemoryEntry['type'],
  category: SEOMemoryEntry['category'],
  priority: SEOMemoryEntry['priority'],
  url: string,
  description: string,
  suggestedAction: string
): Promise<SEOMemoryEntry> {
  const id = createIssueId(category, url);
  const existing = await getEntry(id);

  if (existing) {
    // Update existing
    return (await updateEntry(id, { lastChecked: new Date().toISOString() }))!;
  }

  // Create new
  const entry: SEOMemoryEntry = {
    id,
    type,
    category,
    status: 'open',
    priority,
    firstDetected: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    url,
    description,
    suggestedAction,
    requiresHumanApproval: priority === 'critical',
    autoFixAttempts: 0,
    maxAutoAttempts: 0,
  };

  await saveEntry(entry);
  return entry;
}

export async function markFixed(id: string): Promise<SEOMemoryEntry | null> {
  return updateEntry(id, {
    status: 'fixed',
    fixedAt: new Date().toISOString(),
  });
}

export async function getStats(): Promise<{
  total: number;
  open: number;
  fixed: number;
  critical: number;
  high: number;
}> {
  const all = await loadMemory();
  return {
    total: all.length,
    open: all.filter(e => e.status === 'open').length,
    fixed: all.filter(e => e.status === 'fixed').length,
    critical: all.filter(e => e.priority === 'critical' && e.status === 'open').length,
    high: all.filter(e => e.priority === 'high' && e.status === 'open').length,
  };
}
