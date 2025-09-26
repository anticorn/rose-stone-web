import React, { useState, useEffect } from 'react';
import './App.css';
import { GoogleDriveConfigComponent } from './components/GoogleDriveConfig';
import { googleDriveService, GoogleDriveConfig } from './services/GoogleDriveService';
import { CategoryPieChart } from './components/CategoryPieChart';
import { IconPicker } from './components/IconPicker';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  type: 'personal' | 'business';
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  type: 'personal' | 'business';
  month: string; // YYYY-MM format
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}


const defaultCategories: Category[] = [
  { id: '1', name: 'Food', color: '#FF6B6B', icon: '🍕' },
  { id: '2', name: 'Transport', color: '#4ECDC4', icon: '🚗' },
  { id: '3', name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
  { id: '4', name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
  { id: '5', name: 'Bills', color: '#FFEAA7', icon: '💡' },
  { id: '6', name: 'Health', color: '#DDA0DD', icon: '🏥' },
  { id: '7', name: 'Other', color: '#98D8C8', icon: '📝' },
];

export default function App(): React.JSX.Element {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [categoryBudgets, setCategoryBudgets] = useState<{[categoryId: string]: number}>({});
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [totalBudgetModalVisible, setTotalBudgetModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: categories[0].id,
    description: '',
    type: 'personal' as 'personal' | 'business',
  });
  const [budgetFormData, setBudgetFormData] = useState({
    category: categories[0].id,
    amount: '',
    type: 'personal' as 'personal' | 'business',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  });
  const [totalBudgetFormData, setTotalBudgetFormData] = useState({
    amount: '',
    month: new Date().toISOString().slice(0, 7)
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#FF6B6B',
    icon: '🍕',
  });
  const [googleDriveConfig, setGoogleDriveConfig] = useState<GoogleDriveConfig | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showGoogleDriveConfig, setShowGoogleDriveConfig] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'business'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'expenses' | 'budgets'>('expenses');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('roseStoneExpenses');
    const savedBudgets = localStorage.getItem('roseStoneBudgets');
    const savedCategories = localStorage.getItem('roseStoneCategories');
    const savedConfig = localStorage.getItem('roseStoneGoogleDriveConfig');
    const savedTheme = localStorage.getItem('roseStoneTheme');
    const savedTotalBudget = localStorage.getItem('roseStoneTotalBudget');
    const savedCategoryBudgets = localStorage.getItem('roseStoneCategoryBudgets');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedConfig) {
      setGoogleDriveConfig(JSON.parse(savedConfig));
    }
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    if (savedTotalBudget) {
      setTotalBudget(parseFloat(savedTotalBudget));
    }
    if (savedCategoryBudgets) {
      setCategoryBudgets(JSON.parse(savedCategoryBudgets));
    }
  }, []);

  // Save data to localStorage whenever expenses or budgets change
  useEffect(() => {
    localStorage.setItem('roseStoneExpenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('roseStoneBudgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('roseStoneCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('roseStoneGoogleDriveConfig', JSON.stringify(googleDriveConfig));
  }, [googleDriveConfig]);

  useEffect(() => {
    localStorage.setItem('roseStoneTotalBudget', totalBudget.toString());
  }, [totalBudget]);

  useEffect(() => {
    localStorage.setItem('roseStoneCategoryBudgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
      const typeMatch = filterType === 'all' || expense.type === filterType;
      return categoryMatch && typeMatch;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate category totals for personal and business separately
  const personalExpenses = expenses.filter(expense => expense.type === 'personal');
  const businessExpenses = expenses.filter(expense => expense.type === 'business');
  
  const personalCategoryTotals = categories.map(category => ({
    ...category,
    total: personalExpenses
      .filter(expense => expense.category === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }));

  const businessCategoryTotals = categories.map(category => ({
    ...category,
    total: businessExpenses
      .filter(expense => expense.category === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }));

  // Get current month budgets
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentBudgets = budgets.filter(budget => budget.month === currentMonth);

  // Calculate budget vs spending
  const budgetAnalysis = currentBudgets.map(budget => {
    const spent = expenses
      .filter(expense => 
        expense.category === budget.category && 
        expense.type === budget.type &&
        expense.date.startsWith(budget.month)
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      ...budget,
      spent,
      remaining: budget.amount - spent,
      percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      isOverBudget: spent > budget.amount
    };
  });

  const handleAddExpense = async () => {
    if (!formData.title.trim() || !formData.amount.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newExpense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: editingExpense?.date || new Date().toISOString().split('T')[0],
      description: formData.description.trim(),
      type: formData.type,
    };

    if (editingExpense) {
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? newExpense : exp));
    } else {
      setExpenses([newExpense, ...expenses]);
    }

    // Save to Google Drive if configured
    if (googleDriveConfig) {
      try {
        await googleDriveService.saveExpense(newExpense);
      } catch (error) {
        console.error('Failed to save to Google Drive:', error);
        alert('Failed to save to Google Drive. Data saved locally.');
      }
    }

    setFormData({ title: '', amount: '', category: categories[0].id, description: '', type: 'personal' });
    setEditingExpense(null);
  };

  const handleAddBudget = () => {
    if (!budgetFormData.amount.trim()) {
      alert('Please enter a budget amount');
      return;
    }

    const newBudget: Budget = {
      id: editingBudget?.id || Date.now().toString(),
      category: budgetFormData.category,
      amount: parseFloat(budgetFormData.amount),
      type: budgetFormData.type,
      month: budgetFormData.month,
    };

    if (editingBudget) {
      setBudgets(budgets.map(budget => budget.id === editingBudget.id ? newBudget : budget));
    } else {
      setBudgets([newBudget, ...budgets]);
    }

    setBudgetFormData({ category: categories[0].id, amount: '', type: 'personal', month: new Date().toISOString().slice(0, 7) });
    setBudgetModalVisible(false);
    setEditingBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      type: budget.type,
      month: budget.month,
    });
    setBudgetModalVisible(true);
  };

  const handleDeleteBudget = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(budget => budget.id !== id));
    }
  };

  const handleSetTotalBudget = () => {
    if (!totalBudgetFormData.amount.trim()) {
      alert('Please enter a total budget amount');
      return;
    }

    const amount = parseFloat(totalBudgetFormData.amount);
    setTotalBudget(amount);
    setTotalBudgetModalVisible(false);
    setTotalBudgetFormData({ amount: '', month: new Date().toISOString().slice(0, 7) });
  };

  const handleUpdateCategoryBudget = (categoryId: string, amount: number) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: amount
    }));
  };

  const handleDistributeBudgetEvenly = () => {
    if (totalBudget <= 0) {
      alert('Please set a total budget first');
      return;
    }

    const evenAmount = totalBudget / categories.length;
    const newCategoryBudgets: {[categoryId: string]: number} = {};
    categories.forEach(category => {
      newCategoryBudgets[category.id] = evenAmount;
    });
    setCategoryBudgets(newCategoryBudgets);
  };

  const handleGoogleDriveConfig = async (config: GoogleDriveConfig) => {
    setGoogleDriveConfig(config);
    localStorage.setItem('roseStoneGoogleDriveConfig', JSON.stringify(config));
    
    // Initialize the Google Drive service
    await googleDriveService.setConfig(config);
    
    // Try to load existing data from Google Drive
    try {
      const driveData = await googleDriveService.loadExpenses();
      if (driveData.length > 0) {
        setExpenses(driveData);
      }
    } catch (error) {
      console.error('Failed to load from Google Drive:', error);
      alert('Failed to load data from Google Drive. Using local data.');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      type: expense.type,
    });
    // Scroll to the form
    document.querySelector('.expense-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  const handleAddCategory = () => {
    if (!categoryFormData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryFormData.name.trim(),
      color: categoryFormData.color,
      icon: categoryFormData.icon,
    };

    setCategories([...categories, newCategory]);
    setCategoryFormData({ name: '', color: '#FF6B6B', icon: '🍕' });
    setCategoryModalVisible(false);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setCategoryModalVisible(true);
  };

  const handleUpdateCategory = () => {
    if (!categoryFormData.name.trim() || !editingCategory) {
      alert('Please enter a category name');
      return;
    }

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id
        ? {
            ...cat,
            name: categoryFormData.name.trim(),
            color: categoryFormData.color,
            icon: categoryFormData.icon,
          }
        : cat
    );

    setCategories(updatedCategories);
    setEditingCategory(null);
    setCategoryFormData({ name: '', color: '#FF6B6B', icon: '🍕' });
    setCategoryModalVisible(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('You must have at least one category');
      return;
    }

    if (expenses.some(exp => exp.category === id)) {
      alert('Cannot delete category that is being used by expenses');
      return;
    }

    if (budgets.some(bud => bud.category === id)) {
      alert('Cannot delete category that is being used by budgets');
      return;
    }

    setCategories(categories.filter(cat => cat.id !== id));
  };

  const getCategoryById = (id: string) => categories.find(cat => cat.id === id) || categories[0];

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Calculate current month budget usage
  const getCurrentMonthBudgetUsage = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get first and last day of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Filter expenses for current month
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= firstDay && expenseDate <= lastDay;
    });
    
    // Calculate total spent this month
    const totalSpentThisMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Use total budget if set, otherwise fall back to individual budgets
    let totalBudgetThisMonth = totalBudget;
    
    if (totalBudgetThisMonth <= 0) {
      // Fall back to individual budgets
      const currentMonthBudgets = budgets.filter(budget => {
        const budgetMonth = new Date(budget.month + '-01');
        return budgetMonth.getMonth() === currentMonth && budgetMonth.getFullYear() === currentYear;
      });
      totalBudgetThisMonth = currentMonthBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    }
    
    return {
      totalSpent: totalSpentThisMonth,
      totalBudget: totalBudgetThisMonth,
      remaining: totalBudgetThisMonth - totalSpentThisMonth,
      percentage: totalBudgetThisMonth > 0 ? (totalSpentThisMonth / totalBudgetThisMonth) * 100 : 0,
      isOverBudget: totalSpentThisMonth > totalBudgetThisMonth
    };
  };

  const budgetUsage = getCurrentMonthBudgetUsage();

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('roseStoneTheme', newTheme ? 'dark' : 'light');
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
  };

  const textStyle = {
    color: isDarkMode ? '#f1f5f9' : '#0f172a',
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
  };

  return (
    <div className="app" style={backgroundStyle}>
      <div className="header">
        <div className="header-logo">
          <div className="logo-container">
            <div className="logo-icon">
              <div className="logo-rose">🌹</div>
            </div>
            <div className="logo-text">
              <h1 className="header-title" style={textStyle}>ROSE & STONE</h1>
              <p className="header-subtitle" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                BOOKKEEPING
              </p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            style={cardStyle}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button 
            className="settings-button" 
            onClick={() => setSettingsVisible(true)}
            style={cardStyle}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Add New Expense Form - Always Visible at Top */}
      <div className="expense-form-top" style={cardStyle}>
        <h3 style={textStyle}>Add New Expense</h3>
        <div className="form-row">
          <input
            className="form-input"
            style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
            placeholder="Expense title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <input
            className="form-input"
            style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
            placeholder="Amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        
        <div className="form-row">
          <select
            className="form-input"
            style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          
          <div className="type-selector">
            <label className="type-label" style={textStyle}>Type:</label>
            <div className="type-options">
              <button
                className={`type-option ${formData.type === 'personal' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'personal' })}
                style={{
                  backgroundColor: formData.type === 'personal' ? '#10b981' : 'transparent',
                  color: formData.type === 'personal' ? 'white' : textStyle.color,
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0'
                }}
              >
                Personal
              </button>
              <button
                className={`type-option ${formData.type === 'business' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, type: 'business' })}
                style={{
                  backgroundColor: formData.type === 'business' ? '#3b82f6' : 'transparent',
                  color: formData.type === 'business' ? 'white' : textStyle.color,
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0'
                }}
              >
                Business
              </button>
            </div>
          </div>
        </div>
        
        <textarea
          className="form-input"
          style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
        
        <div className="form-actions">
          <button
            className="button primary"
            onClick={handleAddExpense}
            disabled={!formData.title.trim() || !formData.amount.trim()}
          >
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
          {editingExpense && (
            <button
              className="button secondary"
              onClick={() => {
                setEditingExpense(null);
                setFormData({ title: '', amount: '', category: categories[0].id, description: '', type: 'personal' });
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation" style={cardStyle}>
        <button
          className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
          style={{
            backgroundColor: activeTab === 'expenses' ? (isDarkMode ? '#334155' : '#e2e8f0') : 'transparent',
            color: textStyle.color
          }}
        >
          💰 Expenses
        </button>
        <button
          className={`tab-button ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
          style={{
            backgroundColor: activeTab === 'budgets' ? (isDarkMode ? '#334155' : '#e2e8f0') : 'transparent',
            color: textStyle.color
          }}
        >
          📊 Budgets
        </button>
      </div>

      {activeTab === 'expenses' && (
        <>
          <div className="summary-cards">
            <div className="summary-card" style={cardStyle}>
              <h3 className="summary-title" style={textStyle}>Personal Expenses</h3>
              <div className="summary-amount" style={textStyle}>
                {formatCurrency(personalExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
              </div>
              <p className="summary-count" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                {personalExpenses.length} {personalExpenses.length === 1 ? 'expense' : 'expenses'}
              </p>
            </div>
            <div className="summary-card" style={cardStyle}>
              <h3 className="summary-title" style={textStyle}>Business Expenses</h3>
              <div className="summary-amount" style={textStyle}>
                {formatCurrency(businessExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
              </div>
              <p className="summary-count" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                {businessExpenses.length} {businessExpenses.length === 1 ? 'expense' : 'expenses'}
              </p>
            </div>
            <div className="summary-card total-card" style={cardStyle}>
              <h3 className="summary-title" style={textStyle}>Total</h3>
              <div className="summary-amount" style={textStyle}>{formatCurrency(totalExpenses)}</div>
              <p className="summary-count" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
              </p>
              <div className="summary-pie-chart">
                <CategoryPieChart 
                  personalCategoryTotals={personalCategoryTotals}
                  businessCategoryTotals={businessCategoryTotals}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>

          {/* Budget Usage Summary */}
          {budgetUsage.totalBudget > 0 && (
            <div className="budget-usage-card" style={cardStyle}>
              <h3 className="budget-usage-title" style={textStyle}>
                Monthly Budget Usage - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="budget-usage-content">
                <div className="budget-usage-stats">
                  <div className="budget-stat">
                    <span className="budget-stat-label" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Spent:</span>
                    <span className="budget-stat-value" style={textStyle}>{formatCurrency(budgetUsage.totalSpent)}</span>
                  </div>
                  <div className="budget-stat">
                    <span className="budget-stat-label" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Budget:</span>
                    <span className="budget-stat-value" style={textStyle}>{formatCurrency(budgetUsage.totalBudget)}</span>
                  </div>
                  <div className="budget-stat">
                    <span className="budget-stat-label" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Remaining:</span>
                    <span 
                      className={`budget-stat-value ${budgetUsage.isOverBudget ? 'over-budget' : ''}`}
                      style={{ 
                        color: budgetUsage.isOverBudget ? '#ef4444' : (budgetUsage.remaining >= 0 ? '#22c55e' : '#f59e0b'),
                        fontWeight: 'var(--font-weight-semibold)'
                      }}
                    >
                      {budgetUsage.isOverBudget ? `-${formatCurrency(Math.abs(budgetUsage.remaining))}` : formatCurrency(budgetUsage.remaining)}
                    </span>
                  </div>
                </div>
                <div className="budget-progress-container">
                  <div className="budget-progress-bar">
                    <div 
                      className="budget-progress-fill"
                      style={{
                        width: `${Math.min(budgetUsage.percentage, 100)}%`,
                        backgroundColor: budgetUsage.isOverBudget ? '#ef4444' : 
                                       budgetUsage.percentage > 80 ? '#f59e0b' : '#22c55e'
                      }}
                    />
                  </div>
                  <div className="budget-progress-text" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                    {budgetUsage.percentage.toFixed(1)}% used
                  </div>
                </div>
              </div>
            </div>
          )}

        </>
      )}

      {activeTab === 'budgets' && (
        <div className="budget-overview" style={cardStyle}>
          <div className="budget-header">
            <h3 className="budget-title" style={textStyle}>Budget Overview - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="budget-actions">
              <button
                className="set-total-budget-button"
                onClick={() => setTotalBudgetModalVisible(true)}
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {totalBudget > 0 ? 'Update Total Budget' : 'Set Total Budget'}
              </button>
            </div>
          </div>
          
          {totalBudget > 0 && (
            <div className="total-budget-display" style={{ 
              marginBottom: '20px', 
              padding: '16px', 
              backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div className="total-budget-info">
                <h4 style={{ ...textStyle, margin: '0 0 8px 0', fontSize: '1.1rem' }}>Total Monthly Budget</h4>
                <div className="total-budget-amount" style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#22c55e',
                  marginBottom: '8px'
                }}>
                  {formatCurrency(totalBudget)}
                </div>
                <div className="category-budget-distribution">
                  <h5 style={{ ...textStyle, margin: '0 0 12px 0', fontSize: '1rem' }}>Category Distribution</h5>
                  <div className="category-budget-grid">
                    {categories.map(category => {
                      const categoryBudget = categoryBudgets[category.id] || 0;
                      const percentage = totalBudget > 0 ? (categoryBudget / totalBudget) * 100 : 0;
                      return (
                        <div key={category.id} className="category-budget-item" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          padding: '8px',
                          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div className="category-icon" style={{ 
                            backgroundColor: category.color,
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}>
                            {category.icon}
                          </div>
                          <div className="category-info" style={{ flex: 1 }}>
                            <div style={{ ...textStyle, fontSize: '0.9rem', fontWeight: '500' }}>{category.name}</div>
                            <div style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                              {percentage.toFixed(1)}% of total
                            </div>
                          </div>
                          <div className="category-amount" style={{ ...textStyle, fontWeight: '600' }}>
                            {formatCurrency(categoryBudget)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="budget-distribution-actions" style={{ marginTop: '12px' }}>
                    <button
                      className="distribute-evenly-button"
                      onClick={handleDistributeBudgetEvenly}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      Distribute Evenly
                    </button>
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                      Total allocated: {formatCurrency(Object.values(categoryBudgets).reduce((sum, amount) => sum + amount, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {budgetAnalysis.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text" style={textStyle}>No budgets set for this month</p>
              <p className="empty-state-subtext" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                Click "Add Budget" to get started
              </p>
            </div>
          ) : (
            <div className="budget-list">
              {budgetAnalysis.map((budget) => {
                const category = getCategoryById(budget.category);
                return (
                  <div key={budget.id} className="budget-item" style={cardStyle}>
                    <div className="budget-header">
                      <div className="budget-category">
                        <div 
                          className="budget-category-icon" 
                          style={{ backgroundColor: category.color }}
                        >
                          {category.icon}
                        </div>
                        <div className="budget-category-info">
                          <h4 style={textStyle}>{category.name}</h4>
                          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            {budget.type === 'personal' ? 'Personal' : 'Business'}
                          </p>
                        </div>
                      </div>
                      <div className="budget-amounts">
                        <div className="budget-spent" style={textStyle}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </div>
                        <div className={`budget-remaining ${budget.isOverBudget ? 'over-budget' : ''}`} 
                             style={{ color: budget.isOverBudget ? '#ef4444' : (isDarkMode ? '#94a3b8' : '#64748b') }}>
                          {budget.isOverBudget ? `Over by ${formatCurrency(Math.abs(budget.remaining))}` : 
                           `Remaining: ${formatCurrency(budget.remaining)}`}
                        </div>
                      </div>
                    </div>
                    <div className="budget-progress">
                      <div 
                        className="budget-progress-bar"
                        style={{ 
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: budget.isOverBudget ? '#ef4444' : category.color
                        }}
                      />
                    </div>
                    <div className="budget-actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditBudget(budget)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filters and Controls - Only for Budgets */}
      {activeTab === 'budgets' && (
        <div className="filters-section" style={cardStyle}>
          <div className="filter-group">
            <label style={textStyle}>Filter by Type:</label>
            <select
              className="filter-select"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'personal' | 'business')}
            >
              <option value="all">All Types</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label style={textStyle}>Filter by Category:</label>
            <select
              className="filter-select"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label style={textStyle}>Sort by:</label>
            <select
              className="filter-select"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'title')}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label style={textStyle}>Order:</label>
            <select
              className="filter-select"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      )}

      {/* Category Totals - Only for Budgets */}
      {activeTab === 'budgets' && (
        <>
          <div className="category-totals" style={cardStyle}>
            <h3 style={textStyle}>Personal Spending by Category</h3>
            <div className="category-totals-grid">
              {personalCategoryTotals.map(category => (
                <div key={`personal-${category.id}`} className="category-total-item">
                  <div className="category-total-icon" style={{ backgroundColor: category.color }}>
                    {category.icon}
                  </div>
                  <div className="category-total-info">
                    <div className="category-total-name" style={textStyle}>{category.name}</div>
                    <div className="category-total-amount" style={textStyle}>
                      {formatCurrency(category.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="category-totals" style={cardStyle}>
            <h3 style={textStyle}>Business Spending by Category</h3>
            <div className="category-totals-grid">
              {businessCategoryTotals.map(category => (
                <div key={`business-${category.id}`} className="category-total-item">
                  <div className="category-total-icon" style={{ backgroundColor: category.color }}>
                    {category.icon}
                  </div>
                  <div className="category-total-info">
                    <div className="category-total-name" style={textStyle}>{category.name}</div>
                    <div className="category-total-amount" style={textStyle}>
                      {formatCurrency(category.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}


      {activeTab === 'expenses' && (
        <>
          {/* Recent Expenses List */}
          <div className="expense-list">
            <h3 style={textStyle}>Recent Expenses</h3>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text" style={textStyle}>No expenses yet</p>
                <p className="empty-state-subtext" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  Use the form above to add your first expense
                </p>
              </div>
            ) : (
              filteredExpenses.map((expense) => {
                const category = getCategoryById(expense.category);
                return (
                  <div key={expense.id} className="expense-item" style={cardStyle}>
                    <div className="expense-header">
                      <div 
                        className="category-icon" 
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="expense-info">
                        <h4 className="expense-title" style={textStyle}>{expense.title}</h4>
                        <div className="expense-meta">
                          <p className="expense-category" style={{ color: category.color }}>
                            {category.name}
                          </p>
                          <span 
                            className={`expense-type ${expense.type}`}
                            style={{ 
                              color: expense.type === 'personal' ? '#10b981' : '#3b82f6',
                              backgroundColor: expense.type === 'personal' ? '#d1fae5' : '#dbeafe'
                            }}
                          >
                            {expense.type === 'personal' ? 'Personal' : 'Business'}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="expense-description" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            {expense.description}
                          </p>
                        )}
                      </div>
                      <div className="expense-amount">
                        <div className="amount-text" style={textStyle}>{formatCurrency(expense.amount)}</div>
                        <div className="date-text" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="expense-actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditExpense(expense)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'budgets' && (
        <div className="list-header">
          <h2 className="list-title" style={textStyle}>Budgets</h2>
          <button
            className="add-button"
            onClick={() => setBudgetModalVisible(true)}
          >
            + Add Budget
          </button>
        </div>
      )}



      {budgetModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content budget-modal" style={cardStyle}>
            <h3 className="modal-title" style={textStyle}>
              {editingBudget ? 'Edit Budget' : 'Add New Budget'}
            </h3>
            
            <div className="type-selector">
              <label className="type-label" style={textStyle}>Type:</label>
              <div className="type-options">
                <button
                  className={`type-option ${budgetFormData.type === 'personal' ? 'selected' : ''}`}
                  onClick={() => setBudgetFormData({ ...budgetFormData, type: 'personal' })}
                  style={{
                    backgroundColor: budgetFormData.type === 'personal' ? '#10b981' : (isDarkMode ? '#334155' : '#f1f5f9'),
                    color: budgetFormData.type === 'personal' ? '#ffffff' : textStyle.color
                  }}
                >
                  Personal
                </button>
                <button
                  className={`type-option ${budgetFormData.type === 'business' ? 'selected' : ''}`}
                  onClick={() => setBudgetFormData({ ...budgetFormData, type: 'business' })}
                  style={{
                    backgroundColor: budgetFormData.type === 'business' ? '#3b82f6' : (isDarkMode ? '#334155' : '#f1f5f9'),
                    color: budgetFormData.type === 'business' ? '#ffffff' : textStyle.color
                  }}
                >
                  Business
                </button>
              </div>
            </div>

            <div className="category-selector">
              <label className="category-label" style={textStyle}>Category:</label>
              <div className="category-scroll">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-option ${budgetFormData.category === category.id ? 'selected' : ''}`}
                    style={{ backgroundColor: category.color }}
                    onClick={() => setBudgetFormData({ ...budgetFormData, category: category.id })}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            <input
              className="input"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              placeholder="Budget amount"
              type="number"
              step="0.01"
              value={budgetFormData.amount}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, amount: e.target.value })}
            />

            <input
              className="input"
              style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
              placeholder="Month (YYYY-MM)"
              type="month"
              value={budgetFormData.month}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, month: e.target.value })}
            />
            
            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => {
                  setBudgetModalVisible(false);
                  setEditingBudget(null);
                  setBudgetFormData({ category: categories[0].id, amount: '', type: 'personal', month: new Date().toISOString().slice(0, 7) });
                }}
              >
                Cancel
              </button>
              <button
                className="modal-button save"
                onClick={handleAddBudget}
              >
                {editingBudget ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {totalBudgetModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content total-budget-modal" style={cardStyle}>
            <h3 className="modal-title" style={textStyle}>Set Total Monthly Budget</h3>
            
            <div className="form-group">
              <label style={textStyle}>Budget Amount:</label>
              <input
                type="number"
                className="form-input"
                style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                placeholder="Enter total budget amount"
                step="0.01"
                value={totalBudgetFormData.amount}
                onChange={(e) => setTotalBudgetFormData({ ...totalBudgetFormData, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label style={textStyle}>Month:</label>
              <input
                className="form-input"
                style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                type="month"
                value={totalBudgetFormData.month}
                onChange={(e) => setTotalBudgetFormData({ ...totalBudgetFormData, month: e.target.value })}
              />
            </div>

            <div className="info-box" style={{ 
              backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px'
            }}>
              <div className="info-icon" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>💡</div>
              <div className="info-content">
                <h4 style={{ ...textStyle, margin: '0 0 4px 0', fontSize: '0.9rem' }}>How it works:</h4>
                <p style={{ 
                  color: isDarkMode ? '#94a3b8' : '#64748b', 
                  margin: '0',
                  fontSize: '0.8rem',
                  lineHeight: '1.4'
                }}>
                  Set your total monthly budget, then distribute it across categories. 
                  You can distribute evenly or set custom amounts for each category.
                </p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => {
                  setTotalBudgetModalVisible(false);
                  setTotalBudgetFormData({ amount: '', month: new Date().toISOString().slice(0, 7) });
                }}
              >
                Cancel
              </button>
              <button
                className="modal-button save"
                onClick={handleSetTotalBudget}
                disabled={!totalBudgetFormData.amount.trim()}
              >
                Set Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {categoryModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content category-modal" style={cardStyle}>
            <h3 className="modal-title" style={textStyle}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            
            <div className="form-group">
              <label style={textStyle}>Category Name:</label>
              <input
                type="text"
                className="form-input"
                style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>

            <div className="form-group">
              <label style={textStyle}>Color:</label>
              <input
                type="color"
                className="form-input"
                style={{ ...textStyle, borderColor: isDarkMode ? '#334155' : '#e2e8f0', width: '60px', height: '40px' }}
                value={categoryFormData.color}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label style={textStyle}>Icon:</label>
              <div className="icon-preview" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div 
                  className="category-icon" 
                  style={{ backgroundColor: categoryFormData.color }}
                >
                  {categoryFormData.icon}
                </div>
                <button
                  className="icon-picker-button"
                  onClick={() => setIconPickerVisible(true)}
                >
                  Choose Icon
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => {
                  setCategoryModalVisible(false);
                  setEditingCategory(null);
                  setCategoryFormData({ name: '', color: '#FF6B6B', icon: '🍕' });
                }}
              >
                Cancel
              </button>
              <button
                className="modal-button save"
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              >
                {editingCategory ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <IconPicker
        isVisible={iconPickerVisible}
        onClose={() => setIconPickerVisible(false)}
        onSelect={(icon) => {
          setCategoryFormData({ ...categoryFormData, icon });
          setIconPickerVisible(false);
        }}
        currentIcon={categoryFormData.icon}
        isDarkMode={isDarkMode}
      />

      {settingsVisible && (
        <div className="modal-overlay">
          <div className="modal-content settings-modal" style={cardStyle}>
            <h3 className="modal-title" style={textStyle}>Settings</h3>
            
            <div className="settings-section">
              <h4 style={textStyle}>Google Drive Integration</h4>
              <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                Connect your Google Drive to automatically sync your expenses with separate sheets for personal and business expenses.
              </p>
              {googleDriveConfig && (
                <div className="config-status" style={{ color: '#10b981', marginBottom: '12px' }}>
                  ✅ Connected to Google Drive
                  <br />
                  Personal: {googleDriveConfig.personalSheetName}
                  <br />
                  Business: {googleDriveConfig.businessSheetName}
                </div>
              )}
              <button 
                className="google-drive-button"
                onClick={() => setShowGoogleDriveConfig(true)}
              >
                {googleDriveConfig ? 'Reconfigure Google Drive' : 'Connect Google Drive'}
              </button>
            </div>

            <div className="settings-section">
              <h4 style={textStyle}>Category Management</h4>
              <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '16px' }}>
                Edit, rename, and customize your expense categories
              </p>
              <div className="categories-list">
                {categories.map((category) => (
                  <div key={category.id} className="category-item" style={cardStyle}>
                    <div className="category-preview">
                      <div 
                        className="category-icon" 
                        style={{ backgroundColor: category.color }}
                      >
                        {category.icon}
                      </div>
                      <div className="category-info">
                        <h5 style={textStyle}>{category.name}</h5>
                      </div>
                    </div>
                    <div className="category-actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditCategory(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={categories.length <= 1}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="add-category-button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({ name: '', color: '#FF6B6B', icon: '🍕' });
                  setCategoryModalVisible(true);
                }}
              >
                + Add New Category
              </button>
            </div>


            <div className="settings-section">
              <h4 style={textStyle}>Export Data</h4>
              <button 
                className="export-button"
                onClick={() => {
                  const dataStr = JSON.stringify(expenses, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'rose-stone-expenses.json';
                  link.click();
                }}
              >
                Export to JSON
              </button>
            </div>

            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => setSettingsVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <GoogleDriveConfigComponent
        isVisible={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSave={handleGoogleDriveConfig}
        currentConfig={googleDriveConfig}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}