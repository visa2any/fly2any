'use client';

import React, { useState } from 'react';
import { Contact, exportToCSV } from '@/lib/email-marketing/utils';
import { emailMarketingAPI } from '@/lib/email-marketing/api';

interface BulkActionsProps {
  contacts: Contact[];
  selectedContacts: string[];
  onContactsUpdate?: () => void;
  onSelectionClear?: () => void;
  className?: string;
}

export default function BulkActions({
  contacts,
  selectedContacts,
  onContactsUpdate,
  onSelectionClear,
  className = ""
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const selectedContactsData = contacts.filter(c => selectedContacts.includes(c.id || ''));

  const handleBulkAction = async (action: string) => {
    if (selectedContacts.length === 0) return;

    setLoading(true);
    try {
      switch (action) {
        case 'delete':
          if (confirm(`Excluir ${selectedContacts.length} contatos?`)) {
            await emailMarketingAPI.bulkDeleteContacts(selectedContacts);
            onContactsUpdate?.();
            onSelectionClear?.();
          }
          break;
        case 'add_tag':
          setShowTagModal(true);
          break;
        case 'export':
          exportToCSV(selectedContactsData, 'contatos-selecionados.csv');
          break;
      }
    } catch (error) {
      console.error('Bulk action error:', error);
    }
    setLoading(false);
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    setLoading(true);
    try {
      await emailMarketingAPI.addContactTags(selectedContacts, [newTag.trim()]);
      setNewTag('');
      setShowTagModal(false);
      onContactsUpdate?.();
    } catch (error) {
      console.error('Add tag error:', error);
    }
    setLoading(false);
  };

  if (selectedContacts.length === 0) return null;

  return (
    <>
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-blue-700 font-medium">
              {selectedContacts.length} contatos selecionados
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('add_tag')}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                🏷️ Adicionar Tag
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                📥 Exportar
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
          <button
            onClick={onSelectionClear}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕ Limpar Seleção
          </button>
        </div>
      </div>

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Adicionar Tag</h3>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nome da tag..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim() || loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                onClick={() => setShowTagModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}