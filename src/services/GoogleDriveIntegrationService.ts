export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

export interface SpreadsheetConfig {
  personalSheetId: string;
  businessSheetId: string;
  personalSheetName: string;
  businessSheetName: string;
}

export class GoogleDriveIntegrationService {
  private accessToken: string | null = null;
  private currentUser: { id: string; email: string; initials: string } | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  setCurrentUser(user: { id: string; email: string; initials: string }) {
    this.currentUser = user;
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API request failed: ${response.status} ${error}`);
    }

    return response.json();
  }

  async createSpreadsheet(title: string): Promise<GoogleDriveFile> {
    // Check if we're in demo mode
    if (!this.accessToken || this.accessToken.startsWith('demo-access-token')) {
      // Demo mode - return mock data
      const mockFile: GoogleDriveFile = {
        id: 'demo-spreadsheet-' + Date.now(),
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        webViewLink: 'https://docs.google.com/spreadsheets/d/demo-spreadsheet-' + Date.now() + '/edit',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
      };
      
      console.log('Demo mode: Created mock spreadsheet:', mockFile);
      return mockFile;
    }

    const requestBody = {
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    };

    const file = await this.makeRequest('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Get the file details with webViewLink
    const fileDetails = await this.makeRequest(`https://www.googleapis.com/drive/v3/files/${file.id}?fields=id,name,mimeType,webViewLink,createdTime,modifiedTime`);

    return {
      id: fileDetails.id,
      name: fileDetails.name,
      mimeType: fileDetails.mimeType,
      webViewLink: fileDetails.webViewLink,
      createdTime: fileDetails.createdTime,
      modifiedTime: fileDetails.modifiedTime,
    };
  }

  async createSheetWithFormatting(spreadsheetId: string, sheetName: string, isPersonal: boolean = true): Promise<void> {
    // Check if we're in demo mode
    if (!this.accessToken || this.accessToken.startsWith('demo-access-token')) {
      console.log('Demo mode: Created sheet with formatting:', { spreadsheetId, sheetName, isPersonal });
      return;
    }

    // First, add the sheet
    await this.makeRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 11,
                },
              },
            },
          },
        ],
      }),
    });

    // Set up headers and formatting
    const headers = [
      'Date',
      'Title', 
      'Amount',
      'Category',
      'Type',
      'Description',
      'User ID',
      'User Initials',
      'User Email',
      'Created At',
      'Updated At'
    ];

    // Add headers
    await this.makeRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:K1`, {
      method: 'PUT',
      body: JSON.stringify({
        values: [headers],
      }),
    });

    // Format the header row
    await this.makeRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0, // First sheet
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 11,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: isPersonal ? 0.2 : 0.1,
                    green: isPersonal ? 0.6 : 0.4,
                    blue: 0.8,
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0,
                    },
                    bold: true,
                    fontSize: 12,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 11,
              },
            },
          },
        ],
      }),
    });
  }

  async setupExpenseTrackerSpreadsheets(): Promise<SpreadsheetConfig> {
    if (!this.currentUser) {
      throw new Error('No current user set');
    }

    // Create personal expenses spreadsheet
    const personalFile = await this.createSpreadsheet(`${this.currentUser.initials} - Rose Stone Personal Expenses`);
    await this.createSheetWithFormatting(personalFile.id, 'Personal Expenses', true);

    // Create business expenses spreadsheet  
    const businessFile = await this.createSpreadsheet(`${this.currentUser.initials} - Rose Stone Business Expenses`);
    await this.createSheetWithFormatting(businessFile.id, 'Business Expenses', false);

    return {
      personalSheetId: personalFile.id,
      businessSheetId: businessFile.id,
      personalSheetName: 'Personal Expenses',
      businessSheetName: 'Business Expenses',
    };
  }

  async addExpenseToSheet(spreadsheetId: string, sheetName: string, expense: any): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No current user set');
    }

    // Check if we're in demo mode
    if (!this.accessToken || this.accessToken.startsWith('demo-access-token')) {
      console.log('Demo mode: Added expense to sheet:', { spreadsheetId, sheetName, expense });
      return;
    }

    const now = new Date().toISOString();
    const rowData = [
      expense.date,
      expense.title,
      expense.amount,
      expense.category,
      expense.type,
      expense.description || '',
      this.currentUser.id,
      this.currentUser.initials,
      this.currentUser.email,
      expense.createdAt || now,
      now,
    ];

    await this.makeRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:K:append`, {
      method: 'POST',
      body: JSON.stringify({
        values: [rowData],
        valueInputOption: 'USER_ENTERED',
      }),
    });
  }

  async loadExpensesFromSheet(spreadsheetId: string, sheetName: string): Promise<any[]> {
    try {
      const response = await this.makeRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A2:K`);
      
      if (!response.values || response.values.length === 0) {
        return [];
      }

      return response.values.map((row: any[], index: number) => ({
        id: `sheet-${spreadsheetId}-${index}`,
        date: row[0] || '',
        title: row[1] || '',
        amount: parseFloat(row[2]) || 0,
        category: row[3] || '',
        type: row[4] || 'personal',
        description: row[5] || '',
        userId: row[6] || '',
        userInitials: row[7] || '',
        userEmail: row[8] || '',
        createdAt: row[9] || '',
        updatedAt: row[10] || '',
      }));
    } catch (error) {
      console.error('Error loading expenses from sheet:', error);
      return [];
    }
  }

  async shareFile(fileId: string, userEmail: string, role: 'reader' | 'writer' = 'writer'): Promise<void> {
    await this.makeRequest(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({
        role: role,
        type: 'user',
        emailAddress: userEmail,
      }),
    });
  }

  async getFileInfo(fileId: string): Promise<GoogleDriveFile> {
    const file = await this.makeRequest(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,createdTime,modifiedTime`);
    
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
    };
  }
}

export const googleDriveIntegrationService = new GoogleDriveIntegrationService();
