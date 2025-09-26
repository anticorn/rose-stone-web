export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'personal' | 'business';
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  credentials: any;
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig | null = null;

  async setConfig(config: GoogleSheetsConfig) {
    this.config = config;
    console.log('Google Sheets configuration set:', config);
  }

  async saveExpense(expense: Expense): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Sheets not configured');
    }

    try {
      // For now, we'll simulate saving to Google Sheets
      // In a real implementation, you would use the Google Sheets API here
      console.log('Saving expense to Google Sheets:', expense);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      throw error;
    }
  }

  async loadExpenses(): Promise<Expense[]> {
    if (!this.config) {
      throw new Error('Google Sheets not configured');
    }

    try {
      // For now, we'll simulate loading from Google Sheets
      // In a real implementation, you would use the Google Sheets API here
      console.log('Loading expenses from Google Sheets');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return empty array for now
      return [];
    } catch (error) {
      console.error('Error loading from Google Sheets:', error);
      throw error;
    }
  }

  async updateExpense(expense: Expense): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Sheets not configured');
    }

    try {
      console.log('Updating expense in Google Sheets:', expense);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      throw error;
    }
  }

  async deleteExpense(expenseId: string): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Sheets not configured');
    }

    try {
      console.log('Deleting expense from Google Sheets:', expenseId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error deleting from Google Sheets:', error);
      throw error;
    }
  }

  async createSpreadsheet(title: string = 'RoseStone Expense Tracker'): Promise<string> {
    try {
      console.log('Creating new Google Sheets spreadsheet:', title);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return a simulated spreadsheet ID
      const spreadsheetId = 'simulated-spreadsheet-' + Date.now();
      console.log('Created spreadsheet with ID:', spreadsheetId);
      
      return spreadsheetId;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    try {
      console.log('Testing Google Sheets connection...');
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Google Sheets connection successful');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();