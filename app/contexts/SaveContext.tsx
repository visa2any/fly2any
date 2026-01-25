/**
 * SaveContext - State Machine for Quote Save Operations
 * NEVER lies about save state. ONLY SAVED after backend confirms success=true.
 */

'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

// ========================================
// TYPES
// ========================================

export type SaveState = 
  | 'IDLE'          // No unsaved changes
  | 'DIRTY'         // Unsaved changes detected
  | 'SAVING'        // Save in progress
  | 'SAVED'         // Backend confirmed save success
  | 'CONFLICT'      // Version conflict detected (blocking)
  | 'ERROR_RETRYABLE' // Transient error, can retry
  | 'ERROR_FATAL';   // Non-retryable, user action required

export type SaveActionType =
  | 'MARK_DIRTY'
  | 'SAVE_START'
  | 'SAVE_SUCCESS'
  | 'SAVE_RETRYABLE_ERROR'
  | 'SAVE_FATAL_ERROR'
  | 'SAVE_CONFLICT'
  | 'RESET_TO_IDLE';

interface SaveAction {
  type: SaveActionType;
  payload?: {
    correlationId?: string;
    error?: ApiError;
    version?: number;
    retryCount?: number;
  };
}

interface ApiError {
  success: false;
  errorCode: string;
  message: string;
  severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
  retryable: boolean;
  correlationId: string;
  details?: Record<string, any>;
  timestamp: number;
}

interface SaveContextValue {
  state: SaveState;
  version: number | null;
  lastSavedAt: Date | null;
  pendingChanges: boolean;
  retryCount: number;
  lastError: ApiError | null;
  correlationId: string | null;
  dispatch: React.Dispatch<SaveAction>;
  markDirty: () => void;
  startSave: (correlationId: string) => void;
  saveSuccess: (version: number, correlationId: string) => void;
  saveRetryableError: (error: ApiError) => void;
  saveFatalError: (error: ApiError) => void;
  saveConflict: (error: ApiError) => void;
  resetToIdle: () => void;
}

// ========================================
// REDUCER
// ========================================

function saveReducer(state: SaveContextValue, action: SaveAction): SaveContextValue {
  switch (action.type) {
    case 'MARK_DIRTY':
      // Only allow from IDLE or SAVED
      if (state.state !== 'IDLE' && state.state !== 'SAVED') {
        console.warn(`Illegal transition: ${state.state} → DIRTY`);
        return state;
      }
      return {
        ...state,
        state: 'DIRTY',
        pendingChanges: true,
      };

    case 'SAVE_START':
      // Only allow from DIRTY or ERROR_RETRYABLE
      if (state.state !== 'DIRTY' && state.state !== 'ERROR_RETRYABLE') {
        console.warn(`Illegal transition: ${state.state} → SAVING`);
        return state;
      }
      return {
        ...state,
        state: 'SAVING',
        retryCount: 0,
        lastError: null,
        correlationId: action.payload?.correlationId || null,
      };

    case 'SAVE_SUCCESS':
      // ONLY enter SAVED after backend confirms success=true
      if (state.state !== 'SAVING') {
        console.warn(`Illegal transition: ${state.state} → SAVED`);
        return state;
      }
      if (!action.payload?.version) {
        console.error('SAVE_SUCCESS requires version payload');
        return state;
      }
      return {
        ...state,
        state: 'SAVED',
        version: action.payload.version,
        lastSavedAt: new Date(),
        pendingChanges: false,
        retryCount: 0,
        lastError: null,
        correlationId: action.payload.correlationId || state.correlationId,
      };

    case 'SAVE_RETRYABLE_ERROR':
      // Only allow from SAVING
      if (state.state !== 'SAVING') {
        console.warn(`Illegal transition: ${state.state} → ERROR_RETRYABLE`);
        return state;
      }
      if (!action.payload?.error) {
        console.error('SAVE_RETRYABLE_ERROR requires error payload');
        return state;
      }
      return {
        ...state,
        state: 'ERROR_RETRYABLE',
        lastError: action.payload.error,
        retryCount: action.payload.retryCount || 0,
      };

    case 'SAVE_FATAL_ERROR':
      // Only allow from SAVING or ERROR_RETRYABLE
      if (state.state !== 'SAVING' && state.state !== 'ERROR_RETRYABLE') {
        console.warn(`Illegal transition: ${state.state} → ERROR_FATAL`);
        return state;
      }
      if (!action.payload?.error) {
        console.error('SAVE_FATAL_ERROR requires error payload');
        return state;
      }
      return {
        ...state,
        state: 'ERROR_FATAL',
        lastError: action.payload.error,
        retryCount: 0,
      };

    case 'SAVE_CONFLICT':
      // Only allow from SAVING
      if (state.state !== 'SAVING') {
        console.warn(`Illegal transition: ${state.state} → CONFLICT`);
        return state;
      }
      if (!action.payload?.error) {
        console.error('SAVE_CONFLICT requires error payload');
        return state;
      }
      return {
        ...state,
        state: 'CONFLICT',
        lastError: action.payload.error,
        retryCount: 0,
      };

    case 'RESET_TO_IDLE':
      return {
        ...state,
        state: 'IDLE',
        lastError: null,
        retryCount: 0,
      };

    default:
      return state;
  }
}

// ========================================
// CONTEXT
// ========================================

const SaveContext = createContext<SaveContextValue | undefined>(undefined);

const initialState: SaveContextValue = {
  state: 'IDLE',
  version: null,
  lastSavedAt: null,
  pendingChanges: false,
  retryCount: 0,
  lastError: null,
  correlationId: null,
  dispatch: () => {},
  markDirty: () => {},
  startSave: () => {},
  saveSuccess: () => {},
  saveRetryableError: () => {},
  saveFatalError: () => {},
  saveConflict: () => {},
  resetToIdle: () => {},
};

// ========================================
// PROVIDER
// ========================================

export function SaveProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(saveReducer, initialState);

  // Action creators (for convenience)
  const markDirty = useCallback(() => {
    dispatch({ type: 'MARK_DIRTY' });
  }, []);

  const startSave = useCallback((correlationId: string) => {
    dispatch({ type: 'SAVE_START', payload: { correlationId } });
  }, []);

  const saveSuccess = useCallback((version: number, correlationId: string) => {
    dispatch({ type: 'SAVE_SUCCESS', payload: { version, correlationId } });
  }, []);

  const saveRetryableError = useCallback((error: ApiError) => {
    dispatch({ type: 'SAVE_RETRYABLE_ERROR', payload: { error } });
  }, []);

  const saveFatalError = useCallback((error: ApiError) => {
    dispatch({ type: 'SAVE_FATAL_ERROR', payload: { error } });
  }, []);

  const saveConflict = useCallback((error: ApiError) => {
    dispatch({ type: 'SAVE_CONFLICT', payload: { error } });
  }, []);

  const resetToIdle = useCallback(() => {
    dispatch({ type: 'RESET_TO_IDLE' });
  }, []);

  const value: SaveContextValue = {
    ...state,
    dispatch,
    markDirty,
    startSave,
    saveSuccess,
    saveRetryableError,
    saveFatalError,
    saveConflict,
    resetToIdle,
  };

  return (
    <SaveContext.Provider value={value}>
      {children}
    </SaveContext.Provider>
  );
}

// ========================================
// HOOK
// ========================================

export function useSaveContext(): SaveContextValue {
  const context = useContext(SaveContext);
  if (context === undefined) {
    throw new Error('useSaveContext must be used within a SaveProvider');
  }
  return context;
}