import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryTotal {
  id: string;
  name: string;
  total: number;
  color: string;
  icon: string;
}

interface CategoryPieChartProps {
  personalCategoryTotals: CategoryTotal[];
  businessCategoryTotals: CategoryTotal[];
  isDarkMode: boolean;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  personalCategoryTotals,
  businessCategoryTotals,
  isDarkMode
}) => {
  // Create a map to aggregate expenses by category name
  const categoryMap = new Map<string, CategoryTotal>();
  
  // Process personal categories
  personalCategoryTotals.forEach(category => {
    if (category.total > 0) {
      if (categoryMap.has(category.name)) {
        // If category already exists, add to the total
        const existing = categoryMap.get(category.name)!;
        existing.total += category.total;
      } else {
        // Add new category
        categoryMap.set(category.name, { ...category });
      }
    }
  });
  
  // Process business categories
  businessCategoryTotals.forEach(category => {
    if (category.total > 0) {
      if (categoryMap.has(category.name)) {
        // If category already exists, add to the total
        const existing = categoryMap.get(category.name)!;
        existing.total += category.total;
      } else {
        // Add new category
        categoryMap.set(category.name, { ...category });
      }
    }
  });
  
  // Convert map to array and sort by total amount (descending)
  const categoriesWithSpending = Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total);
  
  // If no spending, show empty state
  if (categoriesWithSpending.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        color: isDarkMode ? '#94a3b8' : '#64748b'
      }}>
        <p>No expenses recorded yet</p>
        <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
          Add some expenses to see the category breakdown
        </p>
      </div>
    );
  }

  const data = {
    labels: categoriesWithSpending.map(category => category.name),
    datasets: [
      {
        data: categoriesWithSpending.map(category => category.total),
        backgroundColor: categoriesWithSpending.map(category => category.color),
        borderColor: categoriesWithSpending.map(category => category.color),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDarkMode ? '#f1f5f9' : '#0f172a',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#f1f5f9' : '#0f172a',
        bodyColor: isDarkMode ? '#f1f5f9' : '#0f172a',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
          afterLabel: function(context: any) {
            const categoryName = context.label;
            const personalTotal = personalCategoryTotals.find(cat => cat.name === categoryName)?.total || 0;
            const businessTotal = businessCategoryTotals.find(cat => cat.name === categoryName)?.total || 0;
            
            if (personalTotal > 0 && businessTotal > 0) {
              return `Personal: $${personalTotal.toFixed(2)} | Business: $${businessTotal.toFixed(2)}`;
            } else if (personalTotal > 0) {
              return `Personal: $${personalTotal.toFixed(2)}`;
            } else if (businessTotal > 0) {
              return `Business: $${businessTotal.toFixed(2)}`;
            }
            return '';
          }
        }
      },
    },
  };

  const totalAmount = categoriesWithSpending.reduce((sum, category) => sum + category.total, 0);

  return (
    <div style={{ 
      width: '100%', 
      height: '400px',
      padding: '20px 0'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '16px',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        fontSize: '0.9rem'
      }}>
        <strong>Total: ${totalAmount.toFixed(2)}</strong>
        <div style={{ 
          fontSize: '0.8rem', 
          color: isDarkMode ? '#94a3b8' : '#64748b',
          marginTop: '4px'
        }}>
          Click on segments to see breakdown by type
        </div>
      </div>
      <Pie data={data} options={options} />
    </div>
  );
};
