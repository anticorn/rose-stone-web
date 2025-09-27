import React, { useState, useEffect } from 'react';

interface GoogleDriveFilePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onFileSelected: (fileId: string, fileName: string) => void;
  onCreateNew: () => void;
  isDarkMode: boolean;
}

export const GoogleDriveFilePicker: React.FC<GoogleDriveFilePickerProps> = ({
  isVisible,
  onClose,
  onFileSelected,
  onCreateNew,
  isDarkMode
}) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      loadGoogleDriveFiles();
    }
  }, [isVisible]);

  const loadGoogleDriveFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get stored token using exact key from snippet
      const token = localStorage.getItem('rst_app_token');
      
      if (!token) {
        throw new Error('Not signed in');
      }
      
      // Try multiple backend URLs
      const backendUrls = [
        'https://rose-stone-backend.vercel.app',
        'https://rose-stone-backend-git-main-anticorn.vercel.app',
        'https://rose-stone-backend-anticorn.vercel.app'
      ];
      
      let response;
      let lastError;
      
      for (const backendUrl of backendUrls) {
        try {
          response = await fetch(`${backendUrl}/api/drive/list`, {
            headers: { 
              'Authorization': 'Bearer ' + token
            }
          });
          if (response.ok) break;
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      
      if (!response || !response.ok) {
        throw new Error('Backend not available. Please deploy the backend first.');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google Drive files');
      }
      
      const json = await response.json();
      
      // Process files exactly as in snippet
      if (json.files && json.files.length) {
        setFiles(json.files);
      } else {
        setFiles([]);
        setError('No files or permission denied.');
      }
    } catch (err) {
      setError('Failed to load Google Drive files. Please try again.');
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: any) => {
    onFileSelected(file.id, file.name);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  if (!isVisible) return null;

  const modalStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const contentStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  };

  const textStyle = {
    color: isDarkMode ? '#f1f5f9' : '#0f172a',
  };

  const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px',
    marginBottom: '8px',
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={textStyle}>Select Google Drive File</h3>
        <p style={{ ...textStyle, color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '20px' }}>
          Choose an existing spreadsheet or create a new one for your expense tracking.
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={textStyle}>Loading your Google Drive files...</div>
          </div>
        )}

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '6px', 
            padding: '12px', 
            marginBottom: '16px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: '#10b981',
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
                onClick={handleCreateNew}
              >
                ✨ Create New Expense Tracker
              </button>
            </div>

            {files.length > 0 && (
              <div>
                <h4 style={textStyle}>Existing Spreadsheets:</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {files.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '6px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                      }}
                      onClick={() => handleFileSelect(file)}
                    >
                      <div style={{ 
                        fontSize: '24px', 
                        marginRight: '12px',
                        color: '#10b981'
                      }}>
                        📊
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...textStyle, fontWeight: '500', marginBottom: '4px' }}>
                          {file.name} ({file.id}) [{file.mimeType}]
                        </div>
                        <div style={{ 
                          color: isDarkMode ? '#94a3b8' : '#64748b', 
                          fontSize: '0.9rem' 
                        }}>
                          Click to select
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {files.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: isDarkMode ? '#94a3b8' : '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <div>No spreadsheets found in your Google Drive</div>
                <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                  Create a new expense tracker to get started
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginTop: '20px',
          gap: '8px'
        }}>
          <button
            style={{
              backgroundColor: 'transparent',
              color: textStyle.color,
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
