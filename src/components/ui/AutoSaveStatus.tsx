'use client';

import { useAutoSave } from '@/hooks/useAutoSave';

interface AutoSaveStatusProps {
  autoSave: ReturnType<typeof useAutoSave>;
  className?: string;
}

export const AutoSaveStatus = ({ 
  autoSave, 
  className = "" 
}: AutoSaveStatusProps) => {
  const getStatusText = () => {
    if (autoSave.isSaving) return 'Salvando...';
    if (autoSave.error) return 'Erro ao salvar';
    if (autoSave.hasUnsavedChanges) return 'Alterações não salvas';
    if (autoSave.lastSaved) return `Salvo às ${autoSave.lastSaved.toLocaleTimeString()}`;
    return 'Tudo salvo';
  };

  const getStatusColor = () => {
    if (autoSave.isSaving) return 'text-blue-600';
    if (autoSave.error) return 'text-red-600';
    if (autoSave.hasUnsavedChanges) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (autoSave.isSaving) return '⏳';
    if (autoSave.error) return '❌';
    if (autoSave.hasUnsavedChanges) return '●';
    return '✅';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()} ${className}`}>
      <span>{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
      {autoSave.error && (
        <button
          onClick={autoSave.save}
          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
};