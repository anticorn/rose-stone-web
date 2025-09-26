import React, { useState } from 'react';
import { GoogleSheetsConfig } from '../services/GoogleSheetsService';

interface GoogleSheetsConfigProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (config: GoogleSheetsConfig) => void;
  currentConfig?: GoogleSheetsConfig | null;
  isDarkMode: boolean;
}

export const GoogleSheetsConfigComponent: React.FC<GoogleSheetsConfigProps> = ({
  isVisible,
  onClose,
  onSave,
  currentConfig,
  isDarkMode
}) => {
  const [config, setConfig] = useState<GoogleSheetsConfig>({
    spreadsheetId: currentConfig?.spreadsheetId || '',
    sheetName: currentConfig?.sheetName || 'Expenses',
    credentials: currentConfig?.credentials || null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textStyle = {
    color: isDarkMode ? '#f1f5f9' : '#0f172a',
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
  };

  const handleSave = async () => {
    if (!config.spreadsheetId.trim()) {
      setError('Please enter a spreadsheet ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(config);
      onClose();
    } catch (err) {
      setError('Failed to connect to Google Sheets. Please check your spreadsheet ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate creating a new spreadsheet
      const newSpreadsheetId = 'simulated-spreadsheet-id-' + Date.now();
      setConfig({ ...config, spreadsheetId: newSpreadsheetId });
    } catch (err) {
      setError('Failed to create new spreadsheet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content google-sheets-modal" style={cardStyle}>
        <h3 className="modal-title" style={textStyle}>Google Sheets Integration</h3>
        
        <div className="info-box" style={cardStyle}>
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h4 style={textStyle}>Demo Mode</h4>
            <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              This is a demo version that simulates Google Sheets integration. 
              Your data is saved locally and can be exported as JSON.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label style={textStyle}>Spreadsheet ID:</label>
          <div className="input-group">
            <input
              type="text"
              className="form-input"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              value={config.spreadsheetId}
              onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
              placeholder="Enter your Google Sheets ID"
            />
            <button
              className="create-button"
              onClick={handleCreateNewSpreadsheet}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create New'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label style={textStyle}>Sheet Name:</label>
          <input
            type="text"
            className="form-input"
            style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
            value={config.sheetName}
            onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
            placeholder="Sheet name (e.g., Expenses)"
          />
        </div>

        {error && (
          <div className="error-message" style={{ color: '#ef4444' }}>
            {error}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="modal-button back"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="modal-button primary"
            onClick={handleSave}
            disabled={isLoading || !config.spreadsheetId.trim()}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
};