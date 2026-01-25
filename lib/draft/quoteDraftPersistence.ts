/**
 * Quote Draft Persistence - LocalStorage backup
 * NEVER loses user input. Auto-saves on every change.
 */

// ========================================
// TYPES
// ========================================

interface DraftData {
  quoteId: string;
  version: number;
  data: any;
  timestamp: number;
}

const DRAFT_STORAGE_KEY_PREFIX = 'quote_draft_';
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// ========================================
// SAVE DRAFT
// ========================================

/**
 * Save draft to localStorage (auto-save on MARK_DIRTY)
 */
export function saveDraft(quoteId: string, data: any, version: number): void {
  try {
    const draft: DraftData = {
      quoteId,
      version,
      data,
      timestamp: Date.now(),
    };
    
    const key = `${DRAFT_STORAGE_KEY_PREFIX}${quoteId}`;
    localStorage.setItem(key, JSON.stringify(draft));
    
    console.log(`[Draft] Saved draft for quote ${quoteId} (v${version})`);
  } catch (error) {
    console.error('[Draft] Failed to save:', error);
    // Don't throw - draft failure shouldn't block functionality
  }
}

/**
 * Debounced draft save (500ms after last change)
 */
export function saveDraftDebounced(
  quoteId: string,
  data: any,
  version: number,
  delay: number = 500
): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      saveDraft(quoteId, data, version);
      timeoutId = null;
    }, delay);
  };
}

// ========================================
// LOAD DRAFT
// ========================================

/**
 * Load draft from localStorage (restore on page reload)
 */
export function loadDraft(quoteId: string): DraftData | null {
  try {
    const key = `${DRAFT_STORAGE_KEY_PREFIX}${quoteId}`;
    const draftJson = localStorage.getItem(key);
    
    if (!draftJson) {
      return null;
    }
    
    const draft: DraftData = JSON.parse(draftJson);
    
    // Check if draft is stale (> 24 hours)
    const age = Date.now() - draft.timestamp;
    if (age > DRAFT_MAX_AGE_MS) {
      console.log(`[Draft] Draft for quote ${quoteId} is stale, discarding`);
      clearDraft(quoteId);
      return null;
    }
    
    console.log(`[Draft] Loaded draft for quote ${quoteId} (v${draft.version}, age: ${Math.round(age / 1000 / 60)}min)`);
    return draft;
  } catch (error) {
    console.error('[Draft] Failed to load:', error);
    return null;
  }
}

/**
 * Get draft age in minutes
 */
export function getDraftAge(quoteId: string): number | null {
  const draft = loadDraft(quoteId);
  if (!draft) {
    return null;
  }
  
  const ageMs = Date.now() - draft.timestamp;
  return Math.round(ageMs / 1000 / 60); // minutes
}

// ========================================
// CLEAR DRAFT
// ========================================

/**
 * Clear draft (ONLY after confirmed SAVE_SUCCESS)
 */
export function clearDraft(quoteId: string): void {
  try {
    const key = `${DRAFT_STORAGE_KEY_PREFIX}${quoteId}`;
    localStorage.removeItem(key);
    console.log(`[Draft] Cleared draft for quote ${quoteId}`);
  } catch (error) {
    console.error('[Draft] Failed to clear:', error);
  }
}

/**
 * Clear all drafts (for cleanup)
 */
export function clearAllDrafts(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(DRAFT_STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('[Draft] Cleared all drafts');
  } catch (error) {
    console.error('[Draft] Failed to clear all:', error);
  }
}

// ========================================
// LIST DRAFTS
// ========================================

/**
 * Get all draft IDs (for draft management UI)
 */
export function listDrafts(): DraftData[] {
  try {
    const keys = Object.keys(localStorage);
    const drafts: DraftData[] = [];
    
    keys.forEach(key => {
      if (key.startsWith(DRAFT_STORAGE_KEY_PREFIX)) {
        const draftJson = localStorage.getItem(key);
        if (draftJson) {
          const draft: DraftData = JSON.parse(draftJson);
          
          // Filter out stale drafts
          const age = Date.now() - draft.timestamp;
          if (age <= DRAFT_MAX_AGE_MS) {
            drafts.push(draft);
          }
        }
      }
    });
    
    // Sort by timestamp (newest first)
    drafts.sort((a, b) => b.timestamp - a.timestamp);
    
    return drafts;
  } catch (error) {
    console.error('[Draft] Failed to list:', error);
    return [];
  }
}

// ========================================
// DRAFT EXISTS
// ========================================

/**
 * Check if draft exists for quote
 */
export function draftExists(quoteId: string): boolean {
  const key = `${DRAFT_STORAGE_KEY_PREFIX}${quoteId}`;
  return localStorage.getItem(key) !== null;
}