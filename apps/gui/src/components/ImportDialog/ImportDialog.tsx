import React, { useState } from 'react';
import { 
  FluidNCConfig, 
  fromYAMLWithLegacySupport, 
  ImportResult, 
  ImportSuggestion, 
  LegacyMapping 
} from '@fluidnc-gui/core';
import './ImportDialog.css';

export interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (config: FluidNCConfig, result: ImportResult) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const yamlString = e.target?.result as string;
          const result = fromYAMLWithLegacySupport(yamlString);
          setImportResult(result);
        } catch (error) {
          setImportResult({
            success: false,
            mappings: [],
            suggestions: [{
              type: 'error',
              message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
              suggestion: 'Please ensure the file is a valid text file and try again.'
            }],
            errors: null
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setImportResult({
        success: false,
        mappings: [],
        suggestions: [{
          type: 'error',
          message: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        errors: null
      });
      setIsProcessing(false);
    }

    // Reset file input
    event.target.value = '';
  };

  const handleAcceptImport = () => {
    if (importResult?.data) {
      onImportSuccess(importResult.data, importResult);
      onClose();
      setImportResult(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setImportResult(null);
  };

  const renderSuggestion = (suggestion: ImportSuggestion, index: number) => {
    const iconMap = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return (
      <div key={index} className={`import-suggestion import-suggestion--${suggestion.type}`}>
        <div className="import-suggestion__header">
          <span className="import-suggestion__icon">{iconMap[suggestion.type]}</span>
          <span className="import-suggestion__message">{suggestion.message}</span>
        </div>
        {suggestion.suggestion && (
          <div className="import-suggestion__details">
            {suggestion.suggestion}
          </div>
        )}
      </div>
    );
  };

  const renderMapping = (mapping: LegacyMapping, index: number) => {
    return (
      <div key={index} className="import-mapping">
        <div className="import-mapping__header">
          <span className="import-mapping__old">{mapping.oldPath}</span>
          <span className="import-mapping__arrow">→</span>
          <span className="import-mapping__new">{mapping.newPath}</span>
        </div>
        <div className="import-mapping__description">
          {mapping.description}
        </div>
      </div>
    );
  };

  return (
    <div className="import-dialog-overlay">
      <div className="import-dialog">
        <div className="import-dialog__header">
          <h2>Import Configuration</h2>
          <button className="import-dialog__close" onClick={handleCancel}>×</button>
        </div>

        <div className="import-dialog__content">
          {!importResult && (
            <div className="import-dialog__upload">
              <div className="import-upload-area">
                <div className="import-upload-icon">📁</div>
                <h3>Select Configuration File</h3>
                <p>Choose a YAML configuration file to import. Legacy formats will be automatically converted.</p>
                <label className="import-upload-button">
                  {isProcessing ? 'Processing...' : 'Choose File'}
                  <input
                    type="file"
                    accept=".yaml,.yml,.txt"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          )}

          {importResult && (
            <div className="import-dialog__results">
              <div className="import-results-header">
                <h3>
                  {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
                </h3>
                {importResult.success && importResult.data && (
                  <p>Configuration "{importResult.data.name || 'Unnamed'}" ready to import</p>
                )}
              </div>

              {importResult.mappings.length > 0 && (
                <div className="import-section">
                  <h4>🔄 Legacy Transformations Applied ({importResult.mappings.length})</h4>
                  <div className="import-mappings">
                    {importResult.mappings.map(renderMapping)}
                  </div>
                </div>
              )}

              {importResult.suggestions.length > 0 && (
                <div className="import-section">
                  <h4>💡 Suggestions & Notices</h4>
                  <div className="import-suggestions">
                    {importResult.suggestions.map(renderSuggestion)}
                  </div>
                </div>
              )}

              {importResult.success && importResult.data && (
                <div className="import-section">
                  <h4>📋 Configuration Summary</h4>
                  <div className="import-summary">
                    <div className="import-summary-item">
                      <strong>Machine Name:</strong> {importResult.data.name || 'Not specified'}
                    </div>
                    <div className="import-summary-item">
                      <strong>Board Type:</strong> {importResult.data.board || 'Not specified'}
                    </div>
                    <div className="import-summary-item">
                      <strong>Axes Configured:</strong> {
                        importResult.data.axes 
                          ? Object.keys(importResult.data.axes).join(', ').toUpperCase() 
                          : 'None'
                      }
                    </div>
                    <div className="import-summary-item">
                      <strong>Spindle:</strong> {importResult.data.spindle ? 'Configured' : 'Not configured'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="import-dialog__footer">
          {importResult && (
            <>
              <button 
                className="import-dialog__button import-dialog__button--secondary" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              {importResult.success && (
                <button 
                  className="import-dialog__button import-dialog__button--primary" 
                  onClick={handleAcceptImport}
                >
                  Import Configuration
                </button>
              )}
              {!importResult.success && (
                <button 
                  className="import-dialog__button import-dialog__button--secondary" 
                  onClick={() => setImportResult(null)}
                >
                  Try Another File
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};