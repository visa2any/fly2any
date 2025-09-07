import { useEffect, useRef, useCallback, useState } from 'react';
import { debounce } from '@/lib/email-marketing/utils';

export interface AutoSaveOptions {
  delay?: number; // Delay in milliseconds before auto-save triggers
  enabled?: boolean; // Whether auto-save is enabled
  key?: string; // Unique key for localStorage
  onSave?: (data: any) => Promise<void> | void; // Custom save function
  onSuccess?: () => void; // Called when save succeeds
  onError?: (error: Error) => void; // Called when save fails
  maxRetries?: number; // Maximum number of retry attempts
  retryDelay?: number; // Delay between retries
  compression?: boolean; // Whether to compress data in localStorage
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: Error | null;
  retryCount: number;
}

export const useAutoSave = <T>(
  data: T,
  options: AutoSaveOptions = {}
) => {
  const {
    delay = 2000,
    enabled = true,
    key,
    onSave,
    onSuccess,
    onError,
    maxRetries = 3,
    retryDelay = 1000,
    compression = false
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
    retryCount: 0
  });

  const previousDataRef = useRef<T>(data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if data has actually changed
  const hasDataChanged = useCallback((newData: T, oldData: T): boolean => {
    try {
      return JSON.stringify(newData) !== JSON.stringify(oldData);
    } catch (error) {
      // Fallback to reference equality if JSON.stringify fails
      return newData !== oldData;
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback((dataToSave: T) => {
    if (!key) return;
    
    try {
      let serializedData = JSON.stringify({
        data: dataToSave,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });

      if (compression) {
        // Simple compression using base64 encoding
        serializedData = btoa(serializedData);
      }

      localStorage.setItem(`autosave_${key}`, serializedData);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [key, compression]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback((): T | null => {
    if (!key) return null;
    
    try {
      const item = localStorage.getItem(`autosave_${key}`);
      if (!item) return null;

      let parsedData;
      
      if (compression) {
        // Decompress from base64
        parsedData = JSON.parse(atob(item));
      } else {
        parsedData = JSON.parse(item);
      }

      // Check if the saved data is recent (within 24 hours)
      const savedTime = new Date(parsedData.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // Remove old data
        localStorage.removeItem(`autosave_${key}`);
        return null;
      }

      return parsedData.data;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }, [key, compression]);

  // Clear localStorage
  const clearAutoSave = useCallback(() => {
    if (key) {
      localStorage.removeItem(`autosave_${key}`);
    }
  }, [key]);

  // Perform the save operation
  const performSave = useCallback(async (dataToSave: T) => {
    setState(prev => ({
      ...prev,
      isSaving: true,
      error: null
    }));

    try {
      if (onSave) {
        // Use custom save function
        await onSave(dataToSave);
      } else {
        // Fallback to localStorage
        saveToLocalStorage(dataToSave);
      }

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null,
        retryCount: 0
      }));

      onSuccess?.();

      // Clear localStorage after successful custom save
      if (onSave && key) {
        clearAutoSave();
      }
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error('Unknown save error');
      
      setState(prev => {
        const newRetryCount = prev.retryCount + 1;
        
        return {
          ...prev,
          isSaving: false,
          error: saveError,
          retryCount: newRetryCount
        };
      });

      onError?.(saveError);

      // Retry if within limits
      if (state.retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          performSave(dataToSave);
        }, retryDelay);
      } else {
        // Save to localStorage as fallback
        saveToLocalStorage(dataToSave);
      }
    }
  }, [onSave, saveToLocalStorage, onSuccess, onError, state.retryCount, maxRetries, retryDelay, key, clearAutoSave]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((dataToSave: T) => {
      if (enabled) {
        performSave(dataToSave);
      }
    }, delay),
    [performSave, enabled, delay]
  );

  // Manual save function
  const save = useCallback(async () => {
    // Cancel any pending auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await performSave(data);
  }, [performSave, data]);

  // Effect to trigger auto-save when data changes
  useEffect(() => {
    if (!enabled) return;

    const hasChanged = hasDataChanged(data, previousDataRef.current);
    
    if (hasChanged) {
      setState(prev => ({
        ...prev,
        hasUnsavedChanges: true,
        error: null
      }));

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        debouncedSave(data);
      }, delay);

      previousDataRef.current = data;
    }
  }, [data, enabled, hasDataChanged, debouncedSave, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save before page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges && !state.isSaving) {
        // Try to save immediately
        if (key) {
          saveToLocalStorage(data);
        }

        // Show confirmation dialog
        event.preventDefault();
        event.returnValue = 'Você tem alterações não salvas. Deseja sair mesmo assim?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, state.hasUnsavedChanges, state.isSaving, key, data, saveToLocalStorage]);

  // Auto-recovery functionality
  const getAutoSavedData = useCallback((): T | null => {
    return loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Check if there's auto-saved data available
  const hasAutoSavedData = useCallback((): boolean => {
    const saved = getAutoSavedData();
    return saved !== null && hasDataChanged(saved, data);
  }, [getAutoSavedData, data, hasDataChanged]);

  return {
    // State
    ...state,
    
    // Actions
    save,
    clearAutoSave,
    
    // Recovery
    getAutoSavedData,
    hasAutoSavedData,
    
    // Utils
    loadFromLocalStorage,
    saveToLocalStorage
  };
};

// Hook for draft management with versioning
export const useDraftManager = <T>(
  data: T,
  options: AutoSaveOptions & {
    maxVersions?: number;
    versionInterval?: number; // Minutes between versions
  } = {}
) => {
  const { maxVersions = 10, versionInterval = 5, ...autoSaveOptions } = options;
  
  const autoSave = useAutoSave(data, autoSaveOptions);
  
  // Save versioned draft
  const saveDraftVersion = useCallback(async () => {
    if (!autoSaveOptions.key) return;
    
    const versionKey = `${autoSaveOptions.key}_versions`;
    const versions = JSON.parse(localStorage.getItem(versionKey) || '[]');
    
    const newVersion = {
      id: Date.now(),
      data,
      timestamp: new Date().toISOString(),
      version: versions.length + 1
    };
    
    // Add new version
    versions.push(newVersion);
    
    // Keep only the latest versions
    const trimmedVersions = versions.slice(-maxVersions);
    
    localStorage.setItem(versionKey, JSON.stringify(trimmedVersions));
  }, [data, autoSaveOptions.key, maxVersions]);
  
  // Get all draft versions
  const getDraftVersions = useCallback(() => {
    if (!autoSaveOptions.key) return [];
    
    const versionKey = `${autoSaveOptions.key}_versions`;
    return JSON.parse(localStorage.getItem(versionKey) || '[]');
  }, [autoSaveOptions.key]);
  
  // Restore specific version
  const restoreVersion = useCallback((versionId: number) => {
    const versions = getDraftVersions();
    return versions.find((v: any) => v.id === versionId)?.data || null;
  }, [getDraftVersions]);
  
  // Clear all versions
  const clearVersions = useCallback(() => {
    if (!autoSaveOptions.key) return;
    
    const versionKey = `${autoSaveOptions.key}_versions`;
    localStorage.removeItem(versionKey);
  }, [autoSaveOptions.key]);
  
  // Auto-version effect
  useEffect(() => {
    if (!autoSaveOptions.enabled || !autoSaveOptions.key) return;
    
    const interval = setInterval(() => {
      if (!autoSave.isSaving && autoSave.hasUnsavedChanges) {
        saveDraftVersion();
      }
    }, versionInterval * 60 * 1000); // Convert minutes to milliseconds
    
    return () => clearInterval(interval);
  }, [autoSave.isSaving, autoSave.hasUnsavedChanges, saveDraftVersion, versionInterval, autoSaveOptions.enabled, autoSaveOptions.key]);
  
  return {
    ...autoSave,
    
    // Version management
    saveDraftVersion,
    getDraftVersions,
    restoreVersion,
    clearVersions
  };
};


export default useAutoSave;