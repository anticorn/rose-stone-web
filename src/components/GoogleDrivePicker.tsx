import React, { useState, useEffect } from 'react';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
}

interface GoogleDrivePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onFileSelect: (file: GoogleDriveFile) => void;
  isDarkMode: boolean;
  title?: string;
}

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({
  isVisible,
  onClose,
  onFileSelect,
  isDarkMode,
  title = "Select Google Sheet"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const textStyle = {
    color: isDarkMode ? '#f1f5f9' : '#0f172a',
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
  };

  // Load Google API script
  useEffect(() => {
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2:picker', initializePicker);
      };
      document.head.appendChild(script);
    } else {
      initializePicker();
    }
  }, []);

  const initializePicker = async () => {
    try {
      await window.gapi.client.init({
        apiKey: 'YOUR_API_KEY', // This would need to be set up properly
        clientId: 'YOUR_CLIENT_ID', // This would need to be set up properly
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.readonly'
      });

      const authInstance = window.gapi.auth2.getAuthInstance();
      setIsAuthenticated(authInstance.isSignedIn.get());
    } catch (error) {
      console.error('Failed to initialize Google API:', error);
      setError('Failed to initialize Google Drive integration');
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsAuthenticated(true);
      await loadFiles();
    } catch (error) {
      console.error('Sign in failed:', error);
      setError('Failed to sign in to Google');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'",
        fields: 'files(id,name,mimeType,webViewLink,modifiedTime)',
        orderBy: 'modifiedTime desc',
        pageSize: 50
      });

      setFiles(response.result.files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to load Google Sheets files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: GoogleDriveFile) => {
    onFileSelect(file);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsAuthenticated(false);
      setFiles([]);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
        <div className="modal-content google-drive-modal" style={cardStyle}>
        <h3 className="modal-title" style={textStyle}>{title}</h3>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="auth-section">
            <div className="info-box" style={{ 
              backgroundColor: isDarkMode ? '#334155' : '#e0f2fe', 
              borderColor: isDarkMode ? '#475569' : '#90cdf4' 
            }}>
              <span className="info-icon" style={{ color: isDarkMode ? '#94a3b8' : '#2196f3' }}>🔐</span>
              <div className="info-content">
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>Google Authentication Required</h4>
                <p style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                  Sign in to your Google account to browse and select Google Sheets files.
                </p>
              </div>
            </div>
            
            <button
              className="google-signin-button"
              onClick={handleSignIn}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #4285f4, #34a853)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                width: '100%',
                marginTop: '20px'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        ) : (
          <div className="files-section">
            <div className="files-header">
              <h4 style={textStyle}>Your Google Sheets</h4>
              <div className="files-actions">
                <button
                  className="refresh-button"
                  onClick={loadFiles}
                  disabled={isLoading}
                  style={{
                    background: isDarkMode ? '#334155' : '#f1f5f9',
                    color: textStyle.color,
                    border: '1px solid',
                    borderColor: isDarkMode ? '#475569' : '#e2e8f0',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  className="signout-button"
                  onClick={handleSignOut}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={textStyle}>Loading your Google Sheets...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text" style={textStyle}>No Google Sheets found</p>
                <p className="empty-state-subtext" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  Create a new Google Sheet or check your permissions
                </p>
              </div>
            ) : (
              <div className="files-list">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="file-item"
                    onClick={() => handleFileSelect(file)}
                    style={{
                      padding: '16px',
                      border: '1px solid',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="file-info">
                      <div className="file-name" style={{ ...textStyle, fontWeight: '600', marginBottom: '4px' }}>
                        📊 {file.name}
                      </div>
                      <div className="file-meta" style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                        Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="modal-button cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
