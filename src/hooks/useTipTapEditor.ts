'use client';

import { useEditor, Editor } from '@tiptap/react';
import { useEffect, useState, useCallback } from 'react';

interface UseTipTapEditorProps {
  extensions: any[];
  content: string;
  onUpdate: (props: { editor: Editor }) => void;
  editable?: boolean;
}

export function useTipTapEditor({ 
  extensions, 
  content, 
  onUpdate, 
  editable = true 
}: UseTipTapEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ensure we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const safeOnUpdate = useCallback((props: { editor: Editor }) => {
    try {
      onUpdate(props);
    } catch (err) {
      console.error('TipTap onUpdate error:', err);
      setError(err as Error);
    }
  }, [onUpdate]);

  const editor = useEditor({
    extensions,
    content,
    onUpdate: safeOnUpdate,
    editable,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  }, []);

  // Reset error when editor changes
  useEffect(() => {
    if (editor) {
      setError(null);
    }
  }, [editor]);

  return {
    editor: isClient ? editor : null,
    error,
    isClient,
  };
}