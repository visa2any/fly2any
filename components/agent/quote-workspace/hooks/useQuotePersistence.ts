"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { QuoteWorkspaceState, QuoteItem, QuoteClient, QuotePricing, Travelers } from '../types/quote-workspace.types';

// Supabase quote row type
interface QuoteRow {
  id: string;
  agent_id: string;
  client_id: string | null;
  status: string;
  trip_name: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  travelers: Travelers;
  items: QuoteItem[];
  pricing: QuotePricing;
  client_data: QuoteClient | null;
  created_at: string;
  updated_at: string;
  version: number;
}

// Persistence state
interface PersistenceState {
  isSaving: boolean;
  isLoading: boolean;
  lastSavedAt: string | null;
  error: string | null;
  hasUnsavedChanges: boolean;
}

// Convert workspace state to DB row
function toDbRow(state: QuoteWorkspaceState, agentId: string): Partial<QuoteRow> {
  return {
    agent_id: agentId,
    status: state.status,
    trip_name: state.tripName,
    destination: state.destination,
    start_date: state.startDate || null,
    end_date: state.endDate || null,
    travelers: state.travelers,
    items: state.items,
    pricing: state.pricing,
    client_data: state.client,
    client_id: state.client?.id || null,
  };
}

// Convert DB row to workspace state
function fromDbRow(row: QuoteRow): Partial<QuoteWorkspaceState> {
  return {
    id: row.id,
    status: row.status as QuoteWorkspaceState['status'],
    tripName: row.trip_name,
    destination: row.destination,
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    travelers: row.travelers,
    items: row.items,
    pricing: row.pricing,
    client: row.client_data,
  };
}

/**
 * Hook for persisting quotes to Supabase with optimistic updates
 */
export function useQuotePersistence(agentId: string) {
  const supabase = createClient();
  const [persistenceState, setPersistenceState] = useState<PersistenceState>({
    isSaving: false,
    isLoading: false,
    lastSavedAt: null,
    error: null,
    hasUnsavedChanges: false,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<string>('');

  // Create new quote
  const createQuote = useCallback(async (state: QuoteWorkspaceState): Promise<string | null> => {
    setPersistenceState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert(toDbRow(state, agentId))
        .select('id')
        .single();

      if (error) throw error;

      const now = new Date().toISOString();
      lastSavedStateRef.current = JSON.stringify(state);
      setPersistenceState(prev => ({
        ...prev,
        isSaving: false,
        lastSavedAt: now,
        hasUnsavedChanges: false,
      }));

      return data.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create quote';
      setPersistenceState(prev => ({ ...prev, isSaving: false, error: message }));
      return null;
    }
  }, [supabase, agentId]);

  // Update existing quote
  const updateQuote = useCallback(async (quoteId: string, state: QuoteWorkspaceState): Promise<boolean> => {
    // Skip if no changes
    const currentStateStr = JSON.stringify(state);
    if (currentStateStr === lastSavedStateRef.current) return true;

    setPersistenceState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          ...toDbRow(state, agentId),
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId)
        .eq('agent_id', agentId); // Security: only own quotes

      if (error) throw error;

      const now = new Date().toISOString();
      lastSavedStateRef.current = currentStateStr;
      setPersistenceState(prev => ({
        ...prev,
        isSaving: false,
        lastSavedAt: now,
        hasUnsavedChanges: false,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save quote';
      setPersistenceState(prev => ({ ...prev, isSaving: false, error: message }));
      return false;
    }
  }, [supabase, agentId]);

  // Load quote by ID
  const loadQuote = useCallback(async (quoteId: string): Promise<Partial<QuoteWorkspaceState> | null> => {
    setPersistenceState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('agent_id', agentId)
        .single();

      if (error) throw error;

      setPersistenceState(prev => ({ ...prev, isLoading: false }));
      lastSavedStateRef.current = JSON.stringify(fromDbRow(data));
      return fromDbRow(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load quote';
      setPersistenceState(prev => ({ ...prev, isLoading: false, error: message }));
      return null;
    }
  }, [supabase, agentId]);

  // List agent's quotes
  const listQuotes = useCallback(async (status?: string): Promise<QuoteRow[]> => {
    try {
      let query = supabase
        .from('quotes')
        .select('*')
        .eq('agent_id', agentId)
        .order('updated_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  }, [supabase, agentId]);

  // Delete quote
  const deleteQuote = useCallback(async (quoteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)
        .eq('agent_id', agentId);

      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  }, [supabase, agentId]);

  // Auto-save with debounce
  const autoSave = useCallback((quoteId: string | null, state: QuoteWorkspaceState) => {
    setPersistenceState(prev => ({ ...prev, hasUnsavedChanges: true }));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (quoteId) {
        await updateQuote(quoteId, state);
      }
    }, 2000); // 2 second debounce
  }, [updateQuote]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...persistenceState,
    createQuote,
    updateQuote,
    loadQuote,
    listQuotes,
    deleteQuote,
    autoSave,
  };
}

/**
 * Hook for real-time quote collaboration (future)
 */
export function useQuoteRealtime(quoteId: string | null) {
  const supabase = createClient();
  const [collaborators, setCollaborators] = useState<string[]>([]);

  useEffect(() => {
    if (!quoteId) return;

    const channel = supabase
      .channel(`quote:${quoteId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCollaborators(Object.keys(state));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, quoteId]);

  return { collaborators };
}
