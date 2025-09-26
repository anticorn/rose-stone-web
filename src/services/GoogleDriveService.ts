export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'personal' | 'business';
}

export interface GoogleDriveConfig {
  personalSheetId: string;
  businessSheetId: string;
  personalSheetName: string;
  businessSheetName: string;
}

export class GoogleDriveService {
  private config: GoogleDriveConfig | null = null;

  async setConfig(config: GoogleDriveConfig) {
    this.config = config;
    console.log('Google Drive configuration set:', config);
  }

  async saveExpense(expense: Expense): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      // Determine which sheet to use based on expense type
      const sheetId = expense.type === 'personal' 
        ? this.config.personalSheetId 
        : this.config.businessSheetId;
      
      const sheetName = expense.type === 'personal' 
        ? this.config.personalSheetName 
        : this.config.businessSheetName;

      console.log(`Saving ${expense.type} expense to Google Drive sheet "${sheetName}" (${sheetId}):`, expense);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }

  async loadExpenses(type?: 'personal' | 'business'): Promise<Expense[]> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      if (type) {
        // Load expenses for specific type
        const sheetId = type === 'personal' 
          ? this.config.personalSheetId 
          : this.config.businessSheetId;
        const sheetName = type === 'personal' 
          ? this.config.personalSheetName 
          : this.config.businessSheetName;
        
        console.log(`Loading ${type} expenses from Google Drive sheet "${sheetName}" (${sheetId})`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock data for demonstration
        return [
          { 
            id: `mock-${type}-1`, 
            title: `Mock ${type} Coffee`, 
            amount: 4.50, 
            date: '2023-01-01', 
            category: '1', 
            description: `Morning coffee (${type})`, 
            type: type 
          },
          { 
            id: `mock-${type}-2`, 
            title: `Mock ${type} Transport`, 
            amount: 2.00, 
            date: '2023-01-02', 
            category: '2', 
            description: `Daily commute (${type})`, 
            type: type 
          },
        ];
      } else {
        // Load all expenses from both sheets
        const personalExpenses = await this.loadExpenses('personal');
        const businessExpenses = await this.loadExpenses('business');
        return [...personalExpenses, ...businessExpenses];
      }
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      throw error;
    }
  }

  async updateExpense(expense: Expense): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      const sheetId = expense.type === 'personal' 
        ? this.config.personalSheetId 
        : this.config.businessSheetId;
      const sheetName = expense.type === 'personal' 
        ? this.config.personalSheetName 
        : this.config.businessSheetName;
        
      console.log(`Updating ${expense.type} expense in Google Drive sheet "${sheetName}" (${sheetId}):`, expense);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error updating Google Drive:', error);
      throw error;
    }
  }

  async deleteExpense(expenseId: string, type: 'personal' | 'business'): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      const sheetId = type === 'personal' 
        ? this.config.personalSheetId 
        : this.config.businessSheetId;
      const sheetName = type === 'personal' 
        ? this.config.personalSheetName 
        : this.config.businessSheetName;
        
      console.log(`Deleting ${type} expense from Google Drive sheet "${sheetName}" (${sheetId}):`, expenseId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error deleting from Google Drive:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    try {
      console.log('Testing Google Drive connection...');
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Google Drive connection successful');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
