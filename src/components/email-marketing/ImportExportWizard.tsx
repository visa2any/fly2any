'use client';

import React, { useState } from 'react';
import { Contact, exportToCSV } from '@/lib/email-marketing/utils';
import { emailMarketingAPI } from '@/lib/email-marketing/api';

interface ImportExportWizardProps {
  contacts?: Contact[];
  className?: string;
}

export default function ImportExportWizard({ contacts = [], className = "" }: ImportExportWizardProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const [exportFilter, setExportFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!importFile) return;
    
    setLoading(true);
    try {
      const result = await emailMarketingAPI.importContacts(importFile);
      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await emailMarketingAPI.exportContacts(exportFormat, {
        segment: exportFilter !== 'all' ? exportFilter : undefined
      });
      
      if (response.success && response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      } else {
        // Fallback to client-side export
        const dataToExport = exportFilter === 'all' ? contacts : 
          contacts.filter(c => c.segmento === exportFilter);
        exportToCSV(dataToExport, `contatos-${exportFilter}.csv`);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
    setLoading(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🔄 Import/Export Wizard
        </h3>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'import' 
                ? 'bg-white text-gray-900 shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📥 Importar
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'export' 
                ? 'bg-white text-gray-900 shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📤 Exportar
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'import' ? (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Importar Contatos</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="cursor-pointer inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Selecionar Arquivo
                </label>
                {importFile && (
                  <p className="mt-3 text-sm text-gray-600">
                    Arquivo selecionado: {importFile.name}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleImport}
                disabled={!importFile || loading}
                className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Importando...' : 'Importar Contatos'}
              </button>
            </div>

            {importResult && (
              <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <h5 className="font-semibold mb-2">Resultado da Importação</h5>
                {importResult.success ? (
                  <div>
                    <p>✅ {importResult.imported} contatos importados</p>
                    <p>⚠️ {importResult.duplicates} duplicatas ignoradas</p>
                    <p>❌ {importResult.invalid} inválidos</p>
                  </div>
                ) : (
                  <p>❌ Erro: {importResult.error}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Exportar Contatos</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel (XLSX)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtro
                  </label>
                  <select
                    value={exportFilter}
                    onChange={(e) => setExportFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os contatos</option>
                    <option value="geral">Segmento Geral</option>
                    <option value="vip">Segmento VIP</option>
                    <option value="leads">Leads</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleExport}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Exportando...' : `Exportar ${contacts.length} contatos`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}