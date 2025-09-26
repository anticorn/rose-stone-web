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
  // Combine personal and business categories
  const allCategories = [...personalCategoryTotals, ...businessCategoryTotals];
  
  // Filter out categories with zero spending
  const categoriesWithSpending = allCategories.filter(category => category.total > 0);
  
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
          }
        }
      },
    },
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '400px',
      padding: '20px 0'
    }}>
      <Pie data={data} options={options} />
    </div>
  );
};
