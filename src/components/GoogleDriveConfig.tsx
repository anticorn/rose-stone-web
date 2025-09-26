import React, { useState } from 'react';
import { GoogleDriveConfig } from '../services/GoogleDriveService';
import { GoogleDrivePicker } from './GoogleDrivePicker';

interface GoogleDriveConfigProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (config: GoogleDriveConfig) => void;
  currentConfig?: GoogleDriveConfig | null;
  isDarkMode: boolean;
}

export const GoogleDriveConfigComponent: React.FC<GoogleDriveConfigProps> = ({
  isVisible,
  onClose,
  onSave,
  currentConfig,
  isDarkMode
}) => {
  const [config, setConfig] = useState<GoogleDriveConfig>({
    personalSheetId: currentConfig?.personalSheetId || '',
    personalSheetName: currentConfig?.personalSheetName || 'Personal Expenses',
    businessSheetId: currentConfig?.businessSheetId || '',
    businessSheetName: currentConfig?.businessSheetName || 'Business Expenses',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPersonalPicker, setShowPersonalPicker] = useState(false);
  const [showBusinessPicker, setShowBusinessPicker] = useState(false);

  const textStyle = {
    color: isDarkMode ? '#f1f5f9' : '#0f172a',
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
  };

  const handleSave = async () => {
    if (!config.personalSheetId.trim() || !config.businessSheetId.trim()) {
      setError('Please select both personal and business sheets');
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
      setError('Failed to connect to Google Drive. Please check your sheet selections.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalFileSelect = (file: any) => {
    setConfig({
      ...config,
      personalSheetId: file.id,
      personalSheetName: file.name.replace('.xlsx', '').replace('.xls', '')
    });
    setShowPersonalPicker(false);
  };

  const handleBusinessFileSelect = (file: any) => {
    setConfig({
      ...config,
      businessSheetId: file.id,
      businessSheetName: file.name.replace('.xlsx', '').replace('.xls', '')
    });
    setShowBusinessPicker(false);
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content google-drive-modal" style={cardStyle}>
        <h3 className="modal-title" style={textStyle}>Google Drive Integration</h3>
        
        <div className="info-box" style={cardStyle}>
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h4 style={textStyle}>Demo Mode</h4>
            <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              This is a demo version that simulates Google Drive integration. 
              Your data is saved locally and can be exported as JSON.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label style={textStyle}>Personal Expenses Sheet:</label>
          <div className="input-group">
            <input
              type="text"
              className="form-input"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              value={config.personalSheetName}
              readOnly
              placeholder="Select personal expenses sheet"
            />
            <button
              className="browse-button"
              onClick={() => setShowPersonalPicker(true)}
              style={{
                background: 'linear-gradient(135deg, #4285f4, #34a853)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Browse Personal Sheet
            </button>
          </div>
        </div>

        <div className="form-group">
          <label style={textStyle}>Business Expenses Sheet:</label>
          <div className="input-group">
            <input
              type="text"
              className="form-input"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              value={config.businessSheetName}
              readOnly
              placeholder="Select business expenses sheet"
            />
            <button
              className="browse-button"
              onClick={() => setShowBusinessPicker(true)}
              style={{
                background: 'linear-gradient(135deg, #4285f4, #34a853)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Browse Business Sheet
            </button>
          </div>
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
            disabled={isLoading || !config.personalSheetId.trim() || !config.businessSheetId.trim()}
          >
            {isLoading ? 'Connecting...' : 'Connect to Google Drive'}
          </button>
        </div>
      </div>

      <GoogleDrivePicker
        isVisible={showPersonalPicker}
        onClose={() => setShowPersonalPicker(false)}
        onFileSelect={handlePersonalFileSelect}
        isDarkMode={isDarkMode}
        title="Select Personal Expenses Sheet"
      />

      <GoogleDrivePicker
        isVisible={showBusinessPicker}
        onClose={() => setShowBusinessPicker(false)}
        onFileSelect={handleBusinessFileSelect}
        isDarkMode={isDarkMode}
        title="Select Business Expenses Sheet"
      />
    </div>
  );
};
