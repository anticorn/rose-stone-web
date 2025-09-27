export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'personal' | 'business';
  userId?: string;
  userInitials?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoogleDriveConfig {
  personalSheetId: string;
  businessSheetId: string;
  personalSheetName: string;
  businessSheetName: string;
  sharedWithUsers?: string[]; // Array of user emails who have access
}

export class GoogleDriveService {
  private config: GoogleDriveConfig | null = null;
  private currentUser: { id: string; email: string; initials: string } | null = null;

  async setConfig(config: GoogleDriveConfig) {
    this.config = config;
    console.log('Google Drive configuration set:', config);
  }

  setCurrentUser(user: { id: string; email: string; initials: string }) {
    this.currentUser = user;
    console.log('Current user set:', user);
  }

  private addUserInfoToExpense(expense: Expense): Expense {
    if (!this.currentUser) {
      console.warn('No current user set, expense will not have user information');
      return expense;
    }

    const now = new Date().toISOString();
    return {
      ...expense,
      userId: this.currentUser.id,
      userEmail: this.currentUser.email,
      userInitials: this.currentUser.initials,
      createdAt: expense.createdAt || now,
      updatedAt: now
    };
  }

  async saveExpense(expense: Expense): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      // Add user information to the expense
      const expenseWithUserInfo = this.addUserInfoToExpense(expense);

      // Determine which sheet to use based on expense type
      const sheetId = expense.type === 'personal' 
        ? this.config.personalSheetId 
        : this.config.businessSheetId;
      
      const sheetName = expense.type === 'personal' 
        ? this.config.personalSheetName 
        : this.config.businessSheetName;

      console.log(`Saving ${expense.type} expense to Google Drive sheet "${sheetName}" (${sheetId}):`, expenseWithUserInfo);
      
      // In a real implementation, you would:
      // 1. Get access token from Google Auth
      // 2. Use Google Sheets API to append a new row with all the expense data including user info
      // 3. The Google Sheet should have columns: Date, Title, Amount, Category, Type, Description, User ID, User Initials, User Email, Created At, Updated At
      
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
        
        // Return mock data for demonstration with user information
        const mockUsers = [
          { id: 'user1', email: 'john@example.com', initials: 'JD' },
          { id: 'user2', email: 'jane@example.com', initials: 'JS' },
          { id: 'user3', email: 'bob@example.com', initials: 'BS' }
        ];

        return [
          { 
            id: `mock-${type}-1`, 
            title: `Mock ${type} Coffee`, 
            amount: 4.50, 
            date: '2023-01-01', 
            category: '1', 
            description: `Morning coffee (${type})`, 
            type: type,
            userId: mockUsers[0].id,
            userEmail: mockUsers[0].email,
            userInitials: mockUsers[0].initials,
            createdAt: '2023-01-01T08:00:00Z',
            updatedAt: '2023-01-01T08:00:00Z'
          },
          { 
            id: `mock-${type}-2`, 
            title: `Mock ${type} Transport`, 
            amount: 2.00, 
            date: '2023-01-02', 
            category: '2', 
            description: `Daily commute (${type})`, 
            type: type,
            userId: mockUsers[1].id,
            userEmail: mockUsers[1].email,
            userInitials: mockUsers[1].initials,
            createdAt: '2023-01-02T09:00:00Z',
            updatedAt: '2023-01-02T09:00:00Z'
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

  async shareSheetWithUser(sheetId: string, userEmail: string, role: 'reader' | 'writer' = 'writer'): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      console.log(`Sharing sheet ${sheetId} with ${userEmail} as ${role}`);
      
      // In a real implementation, you would:
      // 1. Get access token from Google Auth
      // 2. Use Google Drive API to share the file with the specified user
      // 3. Set appropriate permissions (reader/writer)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the config to track shared users
      if (this.config.sharedWithUsers) {
        if (!this.config.sharedWithUsers.includes(userEmail)) {
          this.config.sharedWithUsers.push(userEmail);
        }
      } else {
        this.config.sharedWithUsers = [userEmail];
      }
      
      console.log('Sheet shared successfully');
      return true;
    } catch (error) {
      console.error('Error sharing sheet:', error);
      throw error;
    }
  }

  async getSharedUsers(): Promise<string[]> {
    if (!this.config) {
      return [];
    }

    return this.config.sharedWithUsers || [];
  }

  async removeUserFromSheet(sheetId: string, userEmail: string): Promise<boolean> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      console.log(`Removing ${userEmail} from sheet ${sheetId}`);
      
      // In a real implementation, you would:
      // 1. Get access token from Google Auth
      // 2. Use Google Drive API to remove the user's permissions
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the config to remove the user
      if (this.config.sharedWithUsers) {
        this.config.sharedWithUsers = this.config.sharedWithUsers.filter(email => email !== userEmail);
      }
      
      console.log('User removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
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
