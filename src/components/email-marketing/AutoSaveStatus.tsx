/**
 * 💾 AUTO-SAVE STATUS COMPONENT
 * Shows the current auto-save status with visual indicators
 */

import React from 'react';
import { AutoSaveState } from '@/hooks/useAutoSave';

interface AutoSaveStatusProps {
  autoSave: AutoSaveState & {
    save?: () => Promise<void>;
    clearAutoSave?: () => void;
  };
}

export function AutoSaveStatus({ autoSave }: AutoSaveStatusProps) {
  const getStatusIcon = () => {
    if (autoSave.isSaving) return '⏳';
    if (autoSave.error) return '❌';
    if (autoSave.lastSaved && !autoSave.hasUnsavedChanges) return '✅';
    if (autoSave.hasUnsavedChanges) return '💾';
    return '💾';
  };

  const getStatusText = () => {
    if (autoSave.isSaving) return 'Saving...';
    if (autoSave.error) return `Save failed: ${autoSave.error.message}`;
    if (autoSave.lastSaved && !autoSave.hasUnsavedChanges) {
      return `Saved at ${autoSave.lastSaved.toLocaleTimeString()}`;
    }
    if (autoSave.hasUnsavedChanges) return 'Unsaved changes';
    return 'Auto-save enabled';
  };

  const getStatusColor = () => {
    if (autoSave.error) return 'text-red-600';
    if (autoSave.lastSaved && !autoSave.hasUnsavedChanges) return 'text-green-600';
    if (autoSave.isSaving) return 'text-blue-600';
    return 'text-gray-600';
  };

  const handleManualSave = async () => {
    if (autoSave.save && !autoSave.isSaving) {
      try {
        await autoSave.save();
      } catch (error) {
        console.error('Manual save failed:', error);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 text-sm ${getStatusColor()}`}>
        <span className="text-base">{getStatusIcon()}</span>
        <span>{getStatusText()}</span>
      </div>

      {/* Manual save button for when auto-save fails */}
      {(autoSave.error || autoSave.hasUnsavedChanges) && autoSave.save && (
        <button
          onClick={handleManualSave}
          disabled={autoSave.isSaving}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save manually"
        >
          {autoSave.isSaving ? 'Saving...' : 'Save Now'}
        </button>
      )}

      {/* Retry indicator */}
      {autoSave.retryCount > 0 && (
        <span className="text-xs text-orange-600">
          Retry {autoSave.retryCount}/3
        </span>
      )}
    </div>
  );
}

export default AutoSaveStatus;